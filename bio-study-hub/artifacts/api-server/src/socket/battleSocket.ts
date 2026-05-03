import { Server, Socket } from "socket.io";
import { Question } from "../models/question";

interface Player {
  socketId: string;
  userId: string;
  name: string;
  avatar: string;
  score: number;
  answeredCurrentQuestion: boolean;
}

interface BattleRoom {
  code: string;
  players: Player[];
  questions: Record<string, unknown>[];
  currentQuestion: number;
  status: "waiting" | "countdown" | "playing" | "finished";
  questionTimer?: ReturnType<typeof setTimeout>;
  countdownTimer?: ReturnType<typeof setInterval>;
}

const rooms = new Map<string, BattleRoom>();

function generateCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

async function getRandomQuestions(count = 10) {
  const total = await Question.countDocuments({ is_active: true });
  if (total === 0) return [];
  const skip = Math.max(0, Math.floor(Math.random() * Math.max(1, total - count)));
  return Question.find({ is_active: true }).skip(skip).limit(count).lean();
}

function broadcastScores(ns: ReturnType<Server["of"]>, room: BattleRoom) {
  ns.to(room.code).emit("score_update", {
    scores: room.players.map((p) => ({ name: p.name, score: p.score, avatar: p.avatar })),
  });
}

function emitQuestion(ns: ReturnType<Server["of"]>, room: BattleRoom) {
  room.players.forEach((p) => { p.answeredCurrentQuestion = false; });
  const q = room.questions[room.currentQuestion] as Record<string, string>;

  ns.to(room.code).emit("question", {
    index: room.currentQuestion,
    total: room.questions.length,
    question: q.question,
    options: [
      { key: "option1", text: q.option1 },
      { key: "option2", text: q.option2 },
      { key: "option3", text: q.option3 },
      { key: "option4", text: q.option4 },
    ],
    duration: 15,
  });

  room.questionTimer = setTimeout(() => {
    advanceQuestion(ns, room);
  }, 15000);
}

function advanceQuestion(ns: ReturnType<Server["of"]>, room: BattleRoom) {
  broadcastScores(ns, room);
  room.currentQuestion++;

  if (room.currentQuestion >= room.questions.length) {
    room.status = "finished";
    const sorted = [...room.players].sort((a, b) => b.score - a.score);
    const winner =
      sorted[0].score === sorted[1]?.score
        ? "tie"
        : sorted[0].name;

    ns.to(room.code).emit("battle_end", {
      reason: "completed",
      winner,
      scores: room.players.map((p) => ({ name: p.name, score: p.score, avatar: p.avatar })),
    });

    setTimeout(() => rooms.delete(room.code), 60_000);
  } else {
    emitQuestion(ns, room);
  }
}

export function setupBattleSocket(io: Server) {
  const ns = io.of("/battle");

  ns.on("connection", (socket: Socket) => {
    let currentRoomCode: string | null = null;

    socket.on("create_room", async ({ userId, name, avatar }: { userId: string; name: string; avatar?: string }) => {
      try {
        let code = generateCode();
        while (rooms.has(code)) code = generateCode();

        const questions = await getRandomQuestions(10);
        if (questions.length < 5) {
          socket.emit("error", { message: "Not enough questions in the database yet." });
          return;
        }

        const room: BattleRoom = {
          code,
          players: [{ socketId: socket.id, userId, name, avatar: avatar ?? "", score: 0, answeredCurrentQuestion: false }],
          questions,
          currentQuestion: 0,
          status: "waiting",
        };

        rooms.set(code, room);
        socket.join(code);
        currentRoomCode = code;

        socket.emit("room_created", { code });
      } catch (err) {
        socket.emit("error", { message: "Failed to create room." });
      }
    });

    socket.on("join_room", ({ code, userId, name, avatar }: { code: string; userId: string; name: string; avatar?: string }) => {
      const upper = code.trim().toUpperCase();
      const room = rooms.get(upper);

      if (!room) { socket.emit("error", { message: "Room not found. Check the code." }); return; }
      if (room.status !== "waiting") { socket.emit("error", { message: "Battle already in progress." }); return; }
      if (room.players.length >= 2) { socket.emit("error", { message: "Room is full." }); return; }
      if (room.players[0].userId === userId) { socket.emit("error", { message: "You cannot battle yourself!" }); return; }

      room.players.push({ socketId: socket.id, userId, name, avatar: avatar ?? "", score: 0, answeredCurrentQuestion: false });
      socket.join(upper);
      currentRoomCode = upper;

      const summaries = room.players.map((p) => ({ name: p.name, avatar: p.avatar, score: p.score }));
      ns.to(upper).emit("player_joined", { players: summaries });

      room.status = "countdown";
      let count = 3;

      room.countdownTimer = setInterval(() => {
        ns.to(upper).emit("countdown", { count });
        count--;
        if (count < 0) {
          clearInterval(room.countdownTimer!);
          room.status = "playing";
          room.currentQuestion = 0;
          emitQuestion(ns, room);
        }
      }, 1000);
    });

    socket.on("submit_answer", ({ questionIndex, answer }: { questionIndex: number; answer: string }) => {
      if (!currentRoomCode) return;
      const room = rooms.get(currentRoomCode);
      if (!room || room.status !== "playing") return;
      if (questionIndex !== room.currentQuestion) return;

      const player = room.players.find((p) => p.socketId === socket.id);
      if (!player || player.answeredCurrentQuestion) return;

      player.answeredCurrentQuestion = true;
      const q = room.questions[questionIndex] as Record<string, string>;
      const correct = answer === q.correct;
      if (correct) player.score += 10;

      socket.emit("answer_result", {
        correct,
        correctAnswer: q.correct,
        score: player.score,
      });

      broadcastScores(ns, room);

      if (room.players.every((p) => p.answeredCurrentQuestion)) {
        if (room.questionTimer) clearTimeout(room.questionTimer);
        setTimeout(() => advanceQuestion(ns, room), 800);
      }
    });

    socket.on("disconnect", () => {
      if (!currentRoomCode) return;
      const room = rooms.get(currentRoomCode);
      if (!room) return;

      if (room.status !== "finished") {
        if (room.questionTimer) clearTimeout(room.questionTimer);
        if (room.countdownTimer) clearInterval(room.countdownTimer);

        const opponent = room.players.find((p) => p.socketId !== socket.id);
        if (opponent) {
          room.status = "finished";
          ns.to(currentRoomCode).emit("battle_end", {
            reason: "opponent_left",
            winner: opponent.name,
            scores: room.players.map((p) => ({ name: p.name, score: p.score, avatar: p.avatar })),
          });
        }
      }

      rooms.delete(currentRoomCode);
    });
  });
}
