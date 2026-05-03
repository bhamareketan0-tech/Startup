import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "@/lib/auth";
import { Zap, Copy, CheckCheck, Trophy, Swords, User, Clock, ArrowLeft, Loader2, Wifi, WifiOff } from "lucide-react";
import { useNavigate } from "react-router-dom";

type Phase =
  | "lobby"
  | "creating"
  | "waiting"
  | "joining"
  | "countdown"
  | "playing"
  | "result";

interface PlayerInfo {
  name: string;
  avatar: string;
  score: number;
}

interface QuestionOption {
  key: string;
  text: string;
}

interface BattleQuestion {
  index: number;
  total: number;
  question: string;
  options: QuestionOption[];
  duration: number;
}

interface BattleResult {
  reason: string;
  winner: string;
  scores: PlayerInfo[];
}

const OPTION_LABELS = ["A", "B", "C", "D"];

export function BattlePage() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const socketRef = useRef<Socket | null>(null);

  const [phase, setPhase] = useState<Phase>("lobby");
  const [roomCode, setRoomCode] = useState("");
  const [joinInput, setJoinInput] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const [connected, setConnected] = useState(false);

  const [players, setPlayers] = useState<PlayerInfo[]>([]);
  const [countdownNum, setCountdownNum] = useState(3);

  const [currentQ, setCurrentQ] = useState<BattleQuestion | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [correctAnswer, setCorrectAnswer] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(15);
  const [scores, setScores] = useState<PlayerInfo[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [result, setResult] = useState<BattleResult | null>(null);

  const myName = profile?.name || user?.email?.split("@")[0] || "You";
  const myAvatar = profile?.avatar || user?.avatar || "";
  const myUserId = user?.id || user?._id || user?.email || "anon";

  const clearTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
  }, []);

  const startTimer = useCallback((duration: number) => {
    clearTimer();
    setTimeLeft(duration);
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { clearTimer(); return 0; }
        return t - 1;
      });
    }, 1000);
  }, [clearTimer]);

  useEffect(() => {
    const socket = io("/battle", { path: "/socket.io", transports: ["websocket", "polling"] });
    socketRef.current = socket;

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));

    socket.on("room_created", ({ code }: { code: string }) => {
      setRoomCode(code);
      setPhase("waiting");
    });

    socket.on("player_joined", ({ players: p }: { players: PlayerInfo[] }) => {
      setPlayers(p);
    });

    socket.on("countdown", ({ count }: { count: number }) => {
      setPhase("countdown");
      setCountdownNum(count);
    });

    socket.on("question", (q: BattleQuestion) => {
      setPhase("playing");
      setCurrentQ(q);
      setSelectedAnswer(null);
      setCorrectAnswer(null);
      startTimer(q.duration);
    });

    socket.on("answer_result", ({ correct, correctAnswer: ca }: { correct: boolean; correctAnswer: string; score: number }) => {
      setCorrectAnswer(ca);
      if (!correct) setCorrectAnswer(ca);
    });

    socket.on("score_update", ({ scores: s }: { scores: PlayerInfo[] }) => {
      setScores(s);
    });

    socket.on("battle_end", (data: BattleResult) => {
      clearTimer();
      setResult(data);
      setPhase("result");
    });

    socket.on("error", ({ message }: { message: string }) => {
      setError(message);
      setPhase("lobby");
    });

    return () => {
      clearTimer();
      socket.disconnect();
    };
  }, [clearTimer, startTimer]);

  const handleCreate = () => {
    setError("");
    setPhase("creating");
    setPlayers([{ name: myName, avatar: myAvatar, score: 0 }]);
    socketRef.current?.emit("create_room", { userId: myUserId, name: myName, avatar: myAvatar });
  };

  const handleJoin = () => {
    if (!joinInput.trim()) { setError("Enter a room code."); return; }
    setError("");
    setPhase("joining");
    socketRef.current?.emit("join_room", { code: joinInput.trim(), userId: myUserId, name: myName, avatar: myAvatar });
  };

  const handleAnswer = (key: string) => {
    if (selectedAnswer || correctAnswer) return;
    setSelectedAnswer(key);
    socketRef.current?.emit("submit_answer", { questionIndex: currentQ?.index, answer: key });
  };

  const copyCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const reset = () => {
    clearTimer();
    setPhase("lobby");
    setRoomCode("");
    setJoinInput("");
    setError("");
    setPlayers([]);
    setCurrentQ(null);
    setSelectedAnswer(null);
    setCorrectAnswer(null);
    setScores([]);
    setResult(null);
  };

  const myScore = scores.find((s) => s.name === myName)?.score ?? 0;
  const opponentInfo = scores.find((s) => s.name !== myName) ?? players.find((p) => p.name !== myName);

  const optionStyle = (key: string): React.CSSProperties => {
    if (correctAnswer) {
      if (key === correctAnswer) return { background: "rgba(0,255,157,0.15)", borderColor: "#00FF9D", color: "#00FF9D" };
      if (key === selectedAnswer && key !== correctAnswer) return { background: "rgba(255,68,68,0.12)", borderColor: "#ff4444", color: "#ff4444" };
    }
    if (key === selectedAnswer) return { background: "rgba(0,255,157,0.1)", borderColor: "#00FF9D", color: "#00FF9D" };
    return { borderColor: "var(--bs-border-subtle)", color: "var(--bs-text-muted)" };
  };

  return (
    <div className="min-h-screen pt-20 pb-10 px-4 font-['Space_Grotesk']" style={{ background: "var(--bs-bg)" }}>
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => navigate("/home")} className="p-2 border transition-colors" style={{ borderColor: "var(--bs-border-subtle)", color: "var(--bs-text-muted)" }}>
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center transform -skew-x-12" style={{ background: "#00FF9D" }}>
              <Swords className="w-5 h-5 text-black transform skew-x-12" />
            </div>
            <div>
              <h1 className="text-2xl font-black uppercase tracking-tighter" style={{ color: "var(--bs-text)" }}>
                1v1 <span style={{ color: "#00FF9D" }}>BATTLE</span>
              </h1>
              <p className="text-xs uppercase tracking-widest" style={{ color: "var(--bs-text-muted)" }}>Live MCQ Duel</p>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-1.5 text-xs uppercase font-bold" style={{ color: connected ? "#00FF9D" : "#ff4444" }}>
            {connected ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
            {connected ? "LIVE" : "OFFLINE"}
          </div>
        </div>

        {/* ── LOBBY ── */}
        {(phase === "lobby" || phase === "creating" || phase === "joining") && (
          <div className="space-y-4">
            {error && (
              <div className="border px-4 py-3 text-sm font-bold uppercase" style={{ borderColor: "#ff4444", background: "rgba(255,68,68,0.08)", color: "#ff4444" }}>
                {error}
              </div>
            )}

            <div className="p-6 border" style={{ background: "var(--bs-surface)", borderColor: "var(--bs-border-subtle)" }}>
              <p className="text-xs uppercase tracking-widest font-bold mb-4" style={{ color: "var(--bs-text-muted)" }}>Challenge a Friend</p>
              <button
                onClick={handleCreate}
                disabled={phase === "creating"}
                className="w-full py-4 font-black uppercase tracking-widest text-base transform -skew-x-6 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ background: "#00FF9D", color: "black" }}
              >
                {phase === "creating"
                  ? <><Loader2 className="w-5 h-5 animate-spin transform skew-x-6" /><span className="transform skew-x-6">Creating...</span></>
                  : <span className="transform skew-x-6">⚡ Create Battle Room</span>}
              </button>
            </div>

            <div className="p-6 border" style={{ background: "var(--bs-surface)", borderColor: "var(--bs-border-subtle)" }}>
              <p className="text-xs uppercase tracking-widest font-bold mb-4" style={{ color: "var(--bs-text-muted)" }}>Join with Code</p>
              <div className="flex gap-2">
                <input
                  value={joinInput}
                  onChange={(e) => setJoinInput(e.target.value.toUpperCase())}
                  placeholder="ENTER CODE"
                  maxLength={6}
                  className="flex-1 px-4 py-3 border font-black text-lg uppercase tracking-widest text-center bg-transparent outline-none"
                  style={{ borderColor: "var(--bs-border-strong)", color: "var(--bs-text)" }}
                  onKeyDown={(e) => e.key === "Enter" && handleJoin()}
                />
                <button
                  onClick={handleJoin}
                  disabled={phase === "joining"}
                  className="px-6 py-3 font-black uppercase tracking-wider transform -skew-x-6 transition-all disabled:opacity-50 flex items-center gap-2"
                  style={{ background: "var(--bs-surface-2)", color: "#00FF9D", border: "1px solid #00FF9D" }}
                >
                  {phase === "joining"
                    ? <Loader2 className="w-4 h-4 animate-spin transform skew-x-6" />
                    : <span className="transform skew-x-6">JOIN</span>}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              {[["10", "QUESTIONS"], ["15s", "PER QUESTION"], ["10pts", "PER CORRECT"]].map(([val, label]) => (
                <div key={label} className="p-4 border" style={{ background: "var(--bs-surface)", borderColor: "var(--bs-border-subtle)" }}>
                  <div className="text-2xl font-black" style={{ color: "#00FF9D" }}>{val}</div>
                  <div className="text-xs uppercase tracking-wider mt-1" style={{ color: "var(--bs-text-muted)" }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── WAITING ── */}
        {phase === "waiting" && (
          <div className="text-center space-y-6">
            <div className="p-8 border" style={{ background: "var(--bs-surface)", borderColor: "var(--bs-border-subtle)" }}>
              <p className="text-xs uppercase tracking-widest font-bold mb-2" style={{ color: "var(--bs-text-muted)" }}>Your Room Code</p>
              <div className="text-6xl font-black tracking-widest my-6" style={{ color: "#00FF9D" }}>{roomCode}</div>
              <button
                onClick={copyCode}
                className="flex items-center gap-2 mx-auto px-6 py-3 border font-black text-sm uppercase tracking-widest transition-all"
                style={{ borderColor: copied ? "#00FF9D" : "var(--bs-border-strong)", color: copied ? "#00FF9D" : "var(--bs-text-muted)" }}
              >
                {copied ? <CheckCheck className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? "COPIED!" : "COPY CODE"}
              </button>
            </div>

            <div className="flex items-center gap-4">
              <PlayerCard name={myName} avatar={myAvatar} ready />
              <div className="text-2xl font-black" style={{ color: "var(--bs-text-muted)" }}>VS</div>
              <PlayerCard name="Waiting..." avatar="" waiting />
            </div>

            <div className="flex items-center gap-2 justify-center text-sm uppercase font-bold" style={{ color: "var(--bs-text-muted)" }}>
              <Loader2 className="w-4 h-4 animate-spin" style={{ color: "#00FF9D" }} />
              Waiting for opponent to join...
            </div>

            <button onClick={reset} className="text-xs uppercase font-bold underline" style={{ color: "var(--bs-text-muted)" }}>Cancel</button>
          </div>
        )}

        {/* ── COUNTDOWN ── */}
        {phase === "countdown" && (
          <div className="text-center space-y-8 py-12">
            <div className="flex items-center gap-4 justify-center">
              <PlayerCard name={players[0]?.name ?? myName} avatar={players[0]?.avatar ?? myAvatar} ready />
              <div className="text-2xl font-black" style={{ color: "var(--bs-text-muted)" }}>VS</div>
              <PlayerCard name={players[1]?.name ?? "Opponent"} avatar={players[1]?.avatar ?? ""} ready />
            </div>
            <div
              className="text-9xl font-black transition-all duration-300"
              style={{ color: "#00FF9D", textShadow: "0 0 40px #00FF9D88" }}
            >
              {countdownNum > 0 ? countdownNum : "GO!"}
            </div>
            <p className="text-sm uppercase tracking-widest font-bold" style={{ color: "var(--bs-text-muted)" }}>Battle starts in...</p>
          </div>
        )}

        {/* ── PLAYING ── */}
        {phase === "playing" && currentQ && (
          <div className="space-y-5">
            {/* Scores */}
            <div className="flex gap-3">
              {(scores.length > 0 ? scores : players).map((p, i) => (
                <div key={i} className="flex-1 p-3 border flex items-center justify-between" style={{ background: "var(--bs-surface)", borderColor: p.name === myName ? "#00FF9D" : "var(--bs-border-subtle)" }}>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 border flex items-center justify-center text-xs" style={{ background: "var(--bs-surface-2)", borderColor: "var(--bs-border-strong)" }}>
                      {p.avatar ? <img src={p.avatar} alt="" className="w-full h-full object-cover" /> : <User className="w-3.5 h-3.5" style={{ color: "#00FF9D" }} />}
                    </div>
                    <span className="text-xs font-black uppercase truncate max-w-[80px]" style={{ color: p.name === myName ? "#00FF9D" : "var(--bs-text-muted)" }}>
                      {p.name === myName ? "YOU" : p.name.split(" ")[0]}
                    </span>
                  </div>
                  <span className="text-xl font-black" style={{ color: "var(--bs-text)" }}>{p.score}</span>
                </div>
              ))}
            </div>

            {/* Progress + Timer */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-black uppercase" style={{ color: "var(--bs-text-muted)" }}>
                Q{currentQ.index + 1}/{currentQ.total}
              </span>
              <div className="flex-1 h-1.5" style={{ background: "var(--bs-surface-2)" }}>
                <div
                  className="h-full transition-all duration-300"
                  style={{ width: `${((currentQ.index + 1) / currentQ.total) * 100}%`, background: "#00FF9D" }}
                />
              </div>
              <div className="flex items-center gap-1.5 text-sm font-black" style={{ color: timeLeft <= 5 ? "#ff4444" : "#00FF9D" }}>
                <Clock className="w-3.5 h-3.5" />
                {timeLeft}s
              </div>
            </div>

            {/* Timer bar */}
            <div className="h-1" style={{ background: "var(--bs-surface-2)" }}>
              <div
                className="h-full transition-all duration-1000 ease-linear"
                style={{ width: `${(timeLeft / currentQ.duration) * 100}%`, background: timeLeft <= 5 ? "#ff4444" : "#00FF9D" }}
              />
            </div>

            {/* Question */}
            <div className="p-6 border" style={{ background: "var(--bs-surface)", borderColor: "var(--bs-border-subtle)" }}>
              <p className="text-base font-bold leading-relaxed" style={{ color: "var(--bs-text)" }}>{currentQ.question}</p>
            </div>

            {/* Options */}
            <div className="grid grid-cols-1 gap-3">
              {currentQ.options.map((opt, i) => (
                <button
                  key={opt.key}
                  onClick={() => handleAnswer(opt.key)}
                  disabled={!!selectedAnswer || !!correctAnswer || !opt.text}
                  className="flex items-center gap-4 px-5 py-4 border font-bold text-left transition-all duration-200 disabled:cursor-default"
                  style={optionStyle(opt.key)}
                >
                  <span className="w-7 h-7 flex items-center justify-center border font-black text-xs flex-shrink-0 transform -skew-x-6" style={{ borderColor: "currentColor" }}>
                    <span className="transform skew-x-6">{OPTION_LABELS[i]}</span>
                  </span>
                  <span className="text-sm">{opt.text}</span>
                </button>
              ))}
            </div>

            {selectedAnswer && !correctAnswer && (
              <div className="text-center text-sm font-bold uppercase" style={{ color: "var(--bs-text-muted)" }}>
                <Loader2 className="w-4 h-4 animate-spin inline mr-2" style={{ color: "#00FF9D" }} />
                Waiting for opponent...
              </div>
            )}
          </div>
        )}

        {/* ── RESULT ── */}
        {phase === "result" && result && (
          <div className="text-center space-y-6 py-6">
            {result.reason === "opponent_left" ? (
              <div className="p-6 border" style={{ background: "var(--bs-surface)", borderColor: "#00FF9D" }}>
                <Zap className="w-12 h-12 mx-auto mb-3" style={{ color: "#00FF9D" }} />
                <p className="text-2xl font-black uppercase" style={{ color: "#00FF9D" }}>Opponent Left!</p>
                <p className="text-sm mt-2" style={{ color: "var(--bs-text-muted)" }}>You win by default</p>
              </div>
            ) : result.winner === "tie" ? (
              <div className="p-6 border" style={{ background: "var(--bs-surface)", borderColor: "var(--bs-border-subtle)" }}>
                <Swords className="w-12 h-12 mx-auto mb-3" style={{ color: "#00FF9D" }} />
                <p className="text-3xl font-black uppercase tracking-tighter" style={{ color: "#00FF9D" }}>IT'S A TIE!</p>
                <p className="text-sm mt-2" style={{ color: "var(--bs-text-muted)" }}>Perfectly matched rivals</p>
              </div>
            ) : result.winner === myName ? (
              <div className="p-6 border" style={{ background: "var(--bs-surface)", borderColor: "#00FF9D" }}>
                <Trophy className="w-14 h-14 mx-auto mb-3" style={{ color: "#00FF9D" }} />
                <p className="text-4xl font-black uppercase tracking-tighter" style={{ color: "#00FF9D" }}>YOU WON!</p>
                <p className="text-sm mt-2 font-bold uppercase" style={{ color: "var(--bs-text-muted)" }}>GG — Unstoppable! 🔥</p>
              </div>
            ) : (
              <div className="p-6 border" style={{ background: "var(--bs-surface)", borderColor: "#ff4444" }}>
                <p className="text-4xl font-black uppercase tracking-tighter" style={{ color: "#ff4444" }}>YOU LOST</p>
                <p className="text-sm mt-2 font-bold uppercase" style={{ color: "var(--bs-text-muted)" }}>Better luck next time</p>
              </div>
            )}

            {/* Score breakdown */}
            <div className="flex gap-4">
              {result.scores.map((s, i) => (
                <div key={i} className="flex-1 p-5 border" style={{ background: "var(--bs-surface)", borderColor: s.name === result.winner ? "#00FF9D" : "var(--bs-border-subtle)" }}>
                  {s.name === result.winner && result.winner !== "tie" && (
                    <Trophy className="w-4 h-4 mx-auto mb-2" style={{ color: "#00FF9D" }} />
                  )}
                  <div className="text-xs uppercase font-black mb-1" style={{ color: s.name === myName ? "#00FF9D" : "var(--bs-text-muted)" }}>
                    {s.name === myName ? "YOU" : s.name.split(" ")[0]}
                  </div>
                  <div className="text-4xl font-black" style={{ color: "var(--bs-text)" }}>{s.score}</div>
                  <div className="text-xs uppercase mt-1" style={{ color: "var(--bs-text-muted)" }}>points</div>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={reset}
                className="flex-1 py-4 font-black uppercase tracking-widest transform -skew-x-6 transition-all"
                style={{ background: "#00FF9D", color: "black" }}
              >
                <span className="transform skew-x-6">⚡ Battle Again</span>
              </button>
              <button
                onClick={() => navigate("/home")}
                className="px-6 py-4 border font-black uppercase tracking-widest transform -skew-x-6 transition-all"
                style={{ borderColor: "var(--bs-border-subtle)", color: "var(--bs-text-muted)" }}
              >
                <span className="transform skew-x-6">HOME</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function PlayerCard({ name, avatar, ready, waiting }: { name: string; avatar: string; ready?: boolean; waiting?: boolean }) {
  return (
    <div className="flex-1 flex flex-col items-center gap-2 p-4 border" style={{ background: "var(--bs-surface)", borderColor: ready ? "#00FF9D" : "var(--bs-border-subtle)" }}>
      <div className="w-12 h-12 border-2 flex items-center justify-center" style={{ borderColor: ready ? "#00FF9D" : "var(--bs-border-subtle)", background: "var(--bs-surface-2)" }}>
        {waiting
          ? <Loader2 className="w-5 h-5 animate-spin" style={{ color: "var(--bs-text-muted)" }} />
          : avatar
          ? <img src={avatar} alt="" className="w-full h-full object-cover" />
          : <User className="w-5 h-5" style={{ color: ready ? "#00FF9D" : "var(--bs-text-muted)" }} />}
      </div>
      <span className="text-xs font-black uppercase truncate max-w-full" style={{ color: ready ? "#00FF9D" : "var(--bs-text-muted)" }}>
        {name}
      </span>
      {ready && <span className="text-xs font-bold uppercase" style={{ color: "#00FF9D" }}>READY ✓</span>}
    </div>
  );
}
