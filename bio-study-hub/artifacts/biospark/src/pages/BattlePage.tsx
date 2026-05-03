import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "@/lib/auth";
import {
  Zap, Copy, CheckCheck, Trophy, Swords, User,
  Clock, ArrowLeft, Loader2, Wifi, WifiOff, Shield
} from "lucide-react";
import { useNavigate } from "react-router-dom";

type Phase = "lobby" | "creating" | "waiting" | "joining" | "countdown" | "playing" | "result";

interface PlayerInfo { name: string; avatar: string; score: number; }
interface QuestionOption { key: string; text: string; }
interface BattleQuestion {
  index: number; total: number; question: string;
  options: QuestionOption[]; duration: number;
}
interface BattleResult { reason: string; winner: string; scores: PlayerInfo[]; }

const GREEN = "#00FF9D";
const RED = "#ff4444";
const CARD_BG = "rgba(0,255,157,0.04)";
const CARD_BORDER = "rgba(0,255,157,0.18)";
const CARD_BORDER_STRONG = "rgba(0,255,157,0.4)";
const TEXT = "#e8fef2";
const TEXT_MUTED = "rgba(232,254,242,0.55)";
const SURFACE = "rgba(0,0,0,0.55)";

const LABELS = ["A", "B", "C", "D"];

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
  const [result, setResult] = useState<BattleResult | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const myName = profile?.name || user?.email?.split("@")[0] || "You";
  const myAvatar = (profile as Record<string,string>)?.avatar || (user as Record<string,string>)?.avatar || "";
  const myUserId = (user as Record<string,string>)?.id || (user as Record<string,string>)?._id || user?.email || "anon";

  const clearTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
  }, []);

  const startTimer = useCallback((duration: number) => {
    clearTimer();
    setTimeLeft(duration);
    timerRef.current = setInterval(() => {
      setTimeLeft(t => { if (t <= 1) { clearTimer(); return 0; } return t - 1; });
    }, 1000);
  }, [clearTimer]);

  useEffect(() => {
    const socket = io("/battle", { path: "/socket.io", transports: ["websocket", "polling"] });
    socketRef.current = socket;

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));
    socket.on("room_created", ({ code }: { code: string }) => { setRoomCode(code); setPhase("waiting"); });
    socket.on("player_joined", ({ players: p }: { players: PlayerInfo[] }) => setPlayers(p));
    socket.on("countdown", ({ count }: { count: number }) => { setPhase("countdown"); setCountdownNum(count); });
    socket.on("question", (q: BattleQuestion) => {
      setPhase("playing"); setCurrentQ(q);
      setSelectedAnswer(null); setCorrectAnswer(null);
      startTimer(q.duration);
    });
    socket.on("answer_result", ({ correctAnswer: ca }: { correct: boolean; correctAnswer: string; score: number }) => {
      setCorrectAnswer(ca);
    });
    socket.on("score_update", ({ scores: s }: { scores: PlayerInfo[] }) => setScores(s));
    socket.on("battle_end", (data: BattleResult) => { clearTimer(); setResult(data); setPhase("result"); });
    socket.on("error", ({ message }: { message: string }) => { setError(message); setPhase("lobby"); });

    return () => { clearTimer(); socket.disconnect(); };
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
    setPhase("lobby"); setRoomCode(""); setJoinInput(""); setError("");
    setPlayers([]); setCurrentQ(null); setSelectedAnswer(null);
    setCorrectAnswer(null); setScores([]); setResult(null);
  };

  const optionStyle = (key: string): React.CSSProperties => {
    const base: React.CSSProperties = {
      background: CARD_BG, borderColor: CARD_BORDER, color: TEXT_MUTED,
      border: "1px solid", transition: "all 0.15s"
    };
    if (correctAnswer) {
      if (key === correctAnswer) return { ...base, background: "rgba(0,255,157,0.12)", borderColor: GREEN, color: GREEN };
      if (key === selectedAnswer) return { ...base, background: "rgba(255,68,68,0.12)", borderColor: RED, color: RED };
    }
    if (key === selectedAnswer) return { ...base, background: "rgba(0,255,157,0.08)", borderColor: GREEN, color: GREEN };
    return base;
  };

  return (
    <div className="min-h-screen pt-20 pb-12 px-4 font-['Space_Grotesk']">
      <div className="max-w-xl mx-auto">

        {/* ─── HEADER ─── */}
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => navigate("/home")}
            style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}`, color: TEXT_MUTED, padding: "8px", display:"flex" }}
          >
            <ArrowLeft style={{ width: 16, height: 16 }} />
          </button>

          <div style={{ width: 40, height: 40, background: GREEN, display: "flex", alignItems: "center", justifyContent: "center", transform: "skewX(-12deg)" }}>
            <Swords style={{ width: 20, height: 20, color: "#000", transform: "skewX(12deg)" }} />
          </div>

          <div>
            <h1 className="text-2xl font-black uppercase tracking-tighter" style={{ color: TEXT }}>
              1v1 <span style={{ color: GREEN }}>BATTLE</span>
            </h1>
            <p className="text-xs uppercase tracking-widest" style={{ color: TEXT_MUTED }}>Live MCQ Duel</p>
          </div>

          <div className="ml-auto flex items-center gap-1.5 text-xs font-black uppercase" style={{ color: connected ? GREEN : RED }}>
            {connected
              ? <Wifi style={{ width: 14, height: 14 }} />
              : <WifiOff style={{ width: 14, height: 14 }} />}
            {connected ? "LIVE" : "OFFLINE"}
          </div>
        </div>

        {/* ─── LOBBY ─── */}
        {(phase === "lobby" || phase === "creating" || phase === "joining") && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {error && (
              <div style={{ background: "rgba(255,68,68,0.1)", border: `1px solid ${RED}`, color: RED, padding: "12px 16px", fontSize: 13, fontWeight: 700, textTransform: "uppercase" }}>
                ⚠ {error}
              </div>
            )}

            {/* Create */}
            <div style={{ background: SURFACE, border: `1px solid ${CARD_BORDER}`, padding: 24, backdropFilter: "blur(8px)" }}>
              <p style={{ color: TEXT_MUTED, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16 }}>
                ⚔ Challenge a Friend
              </p>
              <button
                onClick={handleCreate}
                disabled={phase === "creating"}
                className="w-full"
                style={{
                  background: GREEN, color: "#000", padding: "14px 24px",
                  fontWeight: 900, fontSize: 15, textTransform: "uppercase", letterSpacing: "0.1em",
                  transform: "skewX(-6deg)", border: "none", cursor: "pointer",
                  opacity: phase === "creating" ? 0.7 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8
                }}
              >
                {phase === "creating"
                  ? <><Loader2 style={{ width: 18, height: 18, animation: "spin 1s linear infinite", transform: "skewX(6deg)" }} /><span style={{ transform: "skewX(6deg)" }}>Creating…</span></>
                  : <span style={{ transform: "skewX(6deg)" }}>⚡ Create Battle Room</span>}
              </button>
            </div>

            {/* Join */}
            <div style={{ background: SURFACE, border: `1px solid ${CARD_BORDER}`, padding: 24, backdropFilter: "blur(8px)" }}>
              <p style={{ color: TEXT_MUTED, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16 }}>
                🔗 Join with Room Code
              </p>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  value={joinInput}
                  onChange={e => setJoinInput(e.target.value.toUpperCase())}
                  placeholder="ABC123"
                  maxLength={6}
                  onKeyDown={e => e.key === "Enter" && handleJoin()}
                  style={{
                    flex: 1, padding: "12px 16px", background: "rgba(0,0,0,0.4)",
                    border: `1px solid ${CARD_BORDER_STRONG}`, color: GREEN,
                    fontWeight: 900, fontSize: 22, textTransform: "uppercase",
                    letterSpacing: "0.25em", textAlign: "center", outline: "none"
                  }}
                />
                <button
                  onClick={handleJoin}
                  disabled={phase === "joining"}
                  style={{
                    padding: "12px 20px", background: "transparent",
                    border: `1px solid ${GREEN}`, color: GREEN,
                    fontWeight: 900, fontSize: 13, textTransform: "uppercase",
                    letterSpacing: "0.08em", transform: "skewX(-6deg)",
                    cursor: "pointer", opacity: phase === "joining" ? 0.7 : 1,
                    display: "flex", alignItems: "center", gap: 6
                  }}
                >
                  {phase === "joining"
                    ? <Loader2 style={{ width: 16, height: 16, animation: "spin 1s linear infinite", transform: "skewX(6deg)" }} />
                    : <span style={{ transform: "skewX(6deg)" }}>JOIN</span>}
                </button>
              </div>
            </div>

            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
              {[["10", "Questions"], ["15s", "Per Q"], ["10pts", "Correct"]].map(([val, label]) => (
                <div key={label} style={{ background: SURFACE, border: `1px solid ${CARD_BORDER}`, padding: "16px 8px", textAlign: "center", backdropFilter: "blur(8px)" }}>
                  <div style={{ color: GREEN, fontSize: 22, fontWeight: 900 }}>{val}</div>
                  <div style={{ color: TEXT_MUTED, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 4 }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── WAITING ─── */}
        {phase === "waiting" && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
            <div style={{ background: SURFACE, border: `1px solid ${CARD_BORDER_STRONG}`, padding: "40px 32px", textAlign: "center", width: "100%", backdropFilter: "blur(8px)" }}>
              <p style={{ color: TEXT_MUTED, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, marginBottom: 8 }}>Your Room Code</p>
              <div style={{ color: GREEN, fontSize: 56, fontWeight: 900, letterSpacing: "0.2em", margin: "16px 0", textShadow: `0 0 30px ${GREEN}55` }}>
                {roomCode}
              </div>
              <button
                onClick={copyCode}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  padding: "10px 20px", background: "transparent",
                  border: `1px solid ${copied ? GREEN : CARD_BORDER_STRONG}`,
                  color: copied ? GREEN : TEXT_MUTED,
                  fontWeight: 700, fontSize: 12, textTransform: "uppercase", cursor: "pointer"
                }}
              >
                {copied ? <CheckCheck style={{ width: 14, height: 14 }} /> : <Copy style={{ width: 14, height: 14 }} />}
                {copied ? "Copied!" : "Copy Code"}
              </button>
            </div>

            <div style={{ display: "flex", gap: 16, width: "100%", alignItems: "center" }}>
              <WCard name={myName} avatar={myAvatar} ready />
              <div style={{ color: TEXT_MUTED, fontWeight: 900, fontSize: 20, flexShrink: 0 }}>VS</div>
              <WCard name="Waiting…" avatar="" waiting />
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8, color: TEXT_MUTED, fontSize: 13, fontWeight: 700, textTransform: "uppercase" }}>
              <Loader2 style={{ width: 16, height: 16, color: GREEN, animation: "spin 1s linear infinite" }} />
              Waiting for opponent…
            </div>
            <button onClick={reset} style={{ color: TEXT_MUTED, fontSize: 12, background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>Cancel</button>
          </div>
        )}

        {/* ─── COUNTDOWN ─── */}
        {phase === "countdown" && (
          <div style={{ textAlign: "center", padding: "48px 0" }}>
            <div style={{ display: "flex", gap: 16, justifyContent: "center", marginBottom: 40 }}>
              <WCard name={players[0]?.name ?? myName} avatar={players[0]?.avatar ?? myAvatar} ready />
              <div style={{ color: TEXT_MUTED, fontWeight: 900, fontSize: 20, alignSelf: "center" }}>VS</div>
              <WCard name={players[1]?.name ?? "Opponent"} avatar={players[1]?.avatar ?? ""} ready />
            </div>
            <div style={{ fontSize: 120, fontWeight: 900, color: GREEN, textShadow: `0 0 60px ${GREEN}88`, lineHeight: 1 }}>
              {countdownNum > 0 ? countdownNum : "GO!"}
            </div>
            <p style={{ color: TEXT_MUTED, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.15em", fontWeight: 700, marginTop: 16 }}>
              Battle starts in…
            </p>
          </div>
        )}

        {/* ─── PLAYING ─── */}
        {phase === "playing" && currentQ && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {/* Scores */}
            <div style={{ display: "flex", gap: 10 }}>
              {(scores.length > 0 ? scores : players).map((p, i) => (
                <div key={i} style={{
                  flex: 1, padding: "10px 14px", background: SURFACE,
                  border: `1px solid ${p.name === myName ? GREEN : CARD_BORDER}`,
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  backdropFilter: "blur(8px)"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 28, height: 28, background: "rgba(0,0,0,0.4)", border: `1px solid ${CARD_BORDER}`, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                      {p.avatar ? <img src={p.avatar} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <User style={{ width: 14, height: 14, color: GREEN }} />}
                    </div>
                    <span style={{ color: p.name === myName ? GREEN : TEXT_MUTED, fontSize: 11, fontWeight: 900, textTransform: "uppercase" }}>
                      {p.name === myName ? "YOU" : p.name.split(" ")[0]}
                    </span>
                  </div>
                  <span style={{ color: TEXT, fontSize: 22, fontWeight: 900 }}>{p.score}</span>
                </div>
              ))}
            </div>

            {/* Timer bar */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ color: TEXT_MUTED, fontSize: 11, fontWeight: 900, flexShrink: 0 }}>
                Q{currentQ.index + 1}/{currentQ.total}
              </span>
              <div style={{ flex: 1, height: 4, background: "rgba(255,255,255,0.08)", borderRadius: 2 }}>
                <div style={{ height: "100%", background: timeLeft <= 5 ? RED : GREEN, width: `${(timeLeft / currentQ.duration) * 100}%`, transition: "width 1s linear, background 0.3s" }} />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 4, color: timeLeft <= 5 ? RED : GREEN, fontSize: 13, fontWeight: 900, flexShrink: 0 }}>
                <Clock style={{ width: 13, height: 13 }} />
                {timeLeft}s
              </div>
            </div>

            {/* Question */}
            <div style={{ background: SURFACE, border: `1px solid ${CARD_BORDER_STRONG}`, padding: "20px 24px", backdropFilter: "blur(8px)" }}>
              <p style={{ color: TEXT, fontSize: 15, fontWeight: 600, lineHeight: 1.6 }}>{currentQ.question}</p>
            </div>

            {/* Options */}
            {currentQ.options.map((opt, i) => (
              <button
                key={opt.key}
                onClick={() => handleAnswer(opt.key)}
                disabled={!!selectedAnswer || !!correctAnswer || !opt.text}
                style={{
                  ...optionStyle(opt.key),
                  display: "flex", alignItems: "center", gap: 14,
                  padding: "14px 18px", cursor: selectedAnswer ? "default" : "pointer",
                  textAlign: "left", width: "100%"
                }}
              >
                <span style={{
                  width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center",
                  border: "1px solid currentColor", fontWeight: 900, fontSize: 12, flexShrink: 0,
                  transform: "skewX(-6deg)"
                }}>
                  <span style={{ transform: "skewX(6deg)" }}>{LABELS[i]}</span>
                </span>
                <span style={{ fontSize: 14, fontWeight: 600 }}>{opt.text}</span>
              </button>
            ))}

            {selectedAnswer && !correctAnswer && (
              <div style={{ textAlign: "center", color: TEXT_MUTED, fontSize: 12, fontWeight: 700, textTransform: "uppercase", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                <Loader2 style={{ width: 14, height: 14, color: GREEN, animation: "spin 1s linear infinite" }} />
                Waiting for opponent…
              </div>
            )}
          </div>
        )}

        {/* ─── RESULT ─── */}
        {phase === "result" && result && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Banner */}
            {result.reason === "opponent_left" ? (
              <div style={{ background: "rgba(0,255,157,0.08)", border: `1px solid ${GREEN}`, padding: "32px 24px", textAlign: "center" }}>
                <Zap style={{ width: 40, height: 40, color: GREEN, margin: "0 auto 12px" }} />
                <div style={{ color: GREEN, fontSize: 28, fontWeight: 900, textTransform: "uppercase" }}>Opponent Left!</div>
                <div style={{ color: TEXT_MUTED, fontSize: 13, marginTop: 6 }}>You win by default 🎉</div>
              </div>
            ) : result.winner === "tie" ? (
              <div style={{ background: SURFACE, border: `1px solid ${CARD_BORDER_STRONG}`, padding: "32px 24px", textAlign: "center", backdropFilter: "blur(8px)" }}>
                <Swords style={{ width: 40, height: 40, color: GREEN, margin: "0 auto 12px" }} />
                <div style={{ color: GREEN, fontSize: 32, fontWeight: 900, textTransform: "uppercase", letterSpacing: "-0.02em" }}>It's a Tie!</div>
                <div style={{ color: TEXT_MUTED, fontSize: 13, marginTop: 6 }}>Perfectly matched rivals ⚔</div>
              </div>
            ) : result.winner === myName ? (
              <div style={{ background: "rgba(0,255,157,0.07)", border: `2px solid ${GREEN}`, padding: "32px 24px", textAlign: "center" }}>
                <Trophy style={{ width: 48, height: 48, color: GREEN, margin: "0 auto 12px" }} />
                <div style={{ color: GREEN, fontSize: 40, fontWeight: 900, textTransform: "uppercase", letterSpacing: "-0.02em", textShadow: `0 0 40px ${GREEN}66` }}>YOU WON!</div>
                <div style={{ color: TEXT_MUTED, fontSize: 13, marginTop: 8, fontWeight: 700 }}>GG — Unstoppable! 🔥</div>
              </div>
            ) : (
              <div style={{ background: "rgba(255,68,68,0.07)", border: `1px solid ${RED}`, padding: "32px 24px", textAlign: "center" }}>
                <Shield style={{ width: 40, height: 40, color: RED, margin: "0 auto 12px" }} />
                <div style={{ color: RED, fontSize: 36, fontWeight: 900, textTransform: "uppercase" }}>You Lost</div>
                <div style={{ color: TEXT_MUTED, fontSize: 13, marginTop: 6 }}>Better luck next time 💪</div>
              </div>
            )}

            {/* Scores */}
            <div style={{ display: "flex", gap: 12 }}>
              {result.scores.map((s, i) => (
                <div key={i} style={{
                  flex: 1, padding: "20px 16px", textAlign: "center",
                  background: SURFACE, backdropFilter: "blur(8px)",
                  border: `1px solid ${s.name === result.winner && result.winner !== "tie" ? GREEN : CARD_BORDER}`
                }}>
                  {s.name === result.winner && result.winner !== "tie" && (
                    <Trophy style={{ width: 16, height: 16, color: GREEN, margin: "0 auto 8px" }} />
                  )}
                  <div style={{ color: s.name === myName ? GREEN : TEXT_MUTED, fontSize: 11, fontWeight: 900, textTransform: "uppercase", marginBottom: 6 }}>
                    {s.name === myName ? "YOU" : s.name.split(" ")[0]}
                  </div>
                  <div style={{ color: TEXT, fontSize: 40, fontWeight: 900 }}>{s.score}</div>
                  <div style={{ color: TEXT_MUTED, fontSize: 10, textTransform: "uppercase", marginTop: 4 }}>points</div>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={reset}
                style={{
                  flex: 1, padding: "14px", background: GREEN, color: "#000",
                  fontWeight: 900, fontSize: 14, textTransform: "uppercase",
                  letterSpacing: "0.08em", transform: "skewX(-6deg)", border: "none", cursor: "pointer"
                }}
              >
                <span style={{ transform: "skewX(6deg)", display: "block" }}>⚡ Battle Again</span>
              </button>
              <button
                onClick={() => navigate("/home")}
                style={{
                  padding: "14px 20px", background: "transparent",
                  border: `1px solid ${CARD_BORDER}`, color: TEXT_MUTED,
                  fontWeight: 900, fontSize: 13, textTransform: "uppercase",
                  transform: "skewX(-6deg)", cursor: "pointer"
                }}
              >
                <span style={{ transform: "skewX(6deg)", display: "block" }}>HOME</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function WCard({ name, avatar, ready, waiting }: { name: string; avatar: string; ready?: boolean; waiting?: boolean }) {
  return (
    <div style={{
      flex: 1, padding: "16px 12px", textAlign: "center",
      background: SURFACE, border: `1px solid ${ready ? GREEN : CARD_BORDER}`,
      backdropFilter: "blur(8px)", display: "flex", flexDirection: "column", alignItems: "center", gap: 8
    }}>
      <div style={{
        width: 44, height: 44, background: "rgba(0,0,0,0.4)",
        border: `2px solid ${ready ? GREEN : CARD_BORDER}`,
        display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden"
      }}>
        {waiting
          ? <Loader2 style={{ width: 18, height: 18, color: TEXT_MUTED, animation: "spin 1s linear infinite" }} />
          : avatar
          ? <img src={avatar} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          : <User style={{ width: 18, height: 18, color: ready ? GREEN : TEXT_MUTED }} />}
      </div>
      <span style={{ color: ready ? GREEN : TEXT_MUTED, fontSize: 11, fontWeight: 900, textTransform: "uppercase", maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {name}
      </span>
      {ready && <span style={{ color: GREEN, fontSize: 10, fontWeight: 700, textTransform: "uppercase" }}>READY ✓</span>}
    </div>
  );
}
