import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import { ArrowLeft, FileText, Zap, Clock, CheckCircle, Trash2 } from "lucide-react";

interface SamplePaper {
  id: string;
  title: string;
  config: { classes: string[]; chapters: string[]; totalQuestions: number; difficulty: { easy: number; medium: number; hard: number }; includePYQ: boolean };
  questionIds: string[];
  attempted: boolean;
  score: number;
  createdAt: string;
}

interface GeneratedPaper extends SamplePaper {
  questions: any[];
}

const CHAPTERS_11 = ["Cell Biology", "Biomolecules", "Cell Division", "Morphology of Plants", "Plant Kingdom", "Animal Kingdom", "Structural Organization", "Transport in Plants", "Mineral Nutrition", "Photosynthesis", "Respiration in Plants", "Plant Growth", "Digestion", "Breathing", "Body Fluids", "Locomotion", "Neural Control", "Chemical Coordination"];
const CHAPTERS_12 = ["Reproduction in Organisms", "Sexual Reproduction", "Human Reproduction", "Reproductive Health", "Principles of Inheritance", "Molecular Basis of Inheritance", "Evolution", "Human Health", "Microbes", "Biotechnology", "Organisms & Populations", "Ecosystem", "Biodiversity", "Environmental Issues"];

function QuestionView({ paper, onBack }: { paper: GeneratedPaper; onBack: () => void }) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [timeTaken, setTimeTaken] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    const t = setInterval(() => setTimeTaken(s => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const score = submitted ? paper.questions.filter((q, i) => answers[i] === q.correct).length : 0;

  async function handleSubmit() {
    setSubmitted(true);
    await api.put(`/sample-papers/${paper.id}/result`, { score, timeTaken }).catch(() => {});
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: 6, color: "#ffffff50", background: "none", border: "none", cursor: "pointer", fontSize: 14 }}>
          <ArrowLeft size={16} /> Back
        </button>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          {!submitted && <span style={{ color: "#ffffff60", fontSize: 14 }}><Clock size={14} style={{ display: "inline", marginRight: 4 }} />{Math.floor(timeTaken / 60)}:{String(timeTaken % 60).padStart(2, "0")}</span>}
          {submitted ? (
            <div style={{ background: "#00FF9D15", border: "1px solid #00FF9D33", borderRadius: 8, padding: "8px 16px", textAlign: "center" }}>
              <p style={{ color: "#00FF9D", fontWeight: 800, fontSize: 18 }}>{score}/{paper.questions.length}</p>
              <p style={{ color: "#ffffff50", fontSize: 12 }}>Score · {Math.round((score / paper.questions.length) * 360)} marks</p>
            </div>
          ) : (
            <button onClick={handleSubmit} style={{ padding: "10px 20px", background: "#00FF9D", border: "none", borderRadius: 8, color: "#000", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>Submit Paper</button>
          )}
        </div>
      </div>
      {paper.questions.map((q: any, i: number) => {
        const tried = answers[i] !== undefined;
        const isCorrect = tried && answers[i] === q.correct;
        return (
          <div key={i} style={{ background: "#111111", border: `1px solid ${submitted && tried ? (isCorrect ? "#00FF9D33" : "#ff444433") : "#ffffff15"}`, borderRadius: 10, padding: 20, marginBottom: 14 }}>
            <p style={{ color: "#ffffff80", fontSize: 13, marginBottom: 10 }}>Q{i + 1} · <span style={{ fontSize: 11, background: "#ffffff10", padding: "2px 6px", borderRadius: 4 }}>{q.chapter}</span></p>
            <p style={{ color: "#fff", fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>{q.text}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {(q.options || []).map((opt: string, j: number) => {
                let bg = "#ffffff08"; let bdr = "#ffffff15"; let clr = "#ffffffcc";
                if (submitted) {
                  if (j === q.correct) { bg = "#00FF9D15"; bdr = "#00FF9D55"; clr = "#00FF9D"; }
                  else if (j === answers[i]) { bg = "#ff444415"; bdr = "#ff444455"; clr = "#ff6b6b"; }
                } else if (answers[i] === j) { bg = "#00FF9D15"; bdr = "#00FF9D55"; clr = "#00FF9D"; }
                return (
                  <button key={j} onClick={() => !submitted && setAnswers(a => ({ ...a, [i]: j }))}
                    style={{ textAlign: "left", padding: "10px 14px", background: bg, border: `1px solid ${bdr}`, borderRadius: 7, color: clr, fontSize: 13, cursor: submitted ? "default" : "pointer", transition: "all 0.1s", lineHeight: 1.5 }}>
                    {String.fromCharCode(65 + j)}. {opt}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function SamplePapersPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [papers, setPapers] = useState<SamplePaper[]>([]);
  const [activePaper, setActivePaper] = useState<GeneratedPaper | null>(null);
  const [generating, setGenerating] = useState(false);
  const [tab, setTab] = useState<"new" | "saved">("new");
  const [config, setConfig] = useState({
    classes: ["11", "12"],
    chapters: [] as string[],
    totalQuestions: 90,
    difficulty: { easy: 20, medium: 60, hard: 20 },
    includePYQ: false,
  });

  useEffect(() => {
    if (!user) return;
    api.get(`/sample-papers/${user.id}`).then((d: any) => setPapers(d || [])).catch(() => {});
  }, [user]);

  async function generatePaper() {
    if (!user) return;
    setGenerating(true);
    try {
      const res: any = await api.post("/sample-papers/generate", { userId: user.id, config });
      setActivePaper(res);
    } catch (e: any) {
      alert(e.message || "Failed to generate paper");
    } finally {
      setGenerating(false);
    }
  }

  async function deletePaper(id: string) {
    await api.del(`/sample-papers/${id}`);
    setPapers(ps => ps.filter(p => p.id !== id));
  }

  function toggleChapter(ch: string) {
    setConfig(c => ({ ...c, chapters: c.chapters.includes(ch) ? c.chapters.filter(x => x !== ch) : [...c.chapters, ch] }));
  }

  function toggleClass(cls: string) {
    setConfig(c => ({ ...c, classes: c.classes.includes(cls) ? c.classes.filter(x => x !== cls) : [...c.classes, cls] }));
  }

  if (activePaper) return (
    <div style={{ minHeight: "100vh", background: "#0A0A0A", fontFamily: "'Space Grotesk', sans-serif", paddingTop: 80 }}>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px" }}>
        <QuestionView paper={activePaper} onBack={() => { setActivePaper(null); setTab("saved"); if (user) api.get(`/sample-papers/${user.id}`).then((d: any) => setPapers(d || [])).catch(() => {}); }} />
      </div>
    </div>
  );

  const allChapters = [...(config.classes.includes("11") ? CHAPTERS_11 : []), ...(config.classes.includes("12") ? CHAPTERS_12 : [])];

  return (
    <div style={{ minHeight: "100vh", background: "#0A0A0A", fontFamily: "'Space Grotesk', sans-serif", paddingTop: 80 }}>
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "40px 24px" }}>
        <button onClick={() => navigate(-1)} style={{ display: "flex", alignItems: "center", gap: 6, color: "#ffffff50", background: "none", border: "none", cursor: "pointer", marginBottom: 24, fontSize: 14, padding: 0 }}>
          <ArrowLeft size={16} /> Back
        </button>

        <div style={{ marginBottom: 32 }}>
          <h1 style={{ color: "#fff", fontSize: 28, fontWeight: 800, marginBottom: 4 }}>Sample Papers</h1>
          <p style={{ color: "#ffffff50", fontSize: 14 }}>Generate custom NEET-pattern papers from your question bank</p>
        </div>

        <div style={{ display: "flex", gap: 4, background: "#ffffff08", borderRadius: 8, padding: 4, width: "fit-content", marginBottom: 32 }}>
          {(["new", "saved"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              style={{ padding: "8px 20px", borderRadius: 6, border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer", background: tab === t ? "#00FF9D" : "transparent", color: tab === t ? "#000" : "#ffffff60", transition: "all 0.15s" }}>
              {t === "new" ? "Generate New" : `My Papers (${papers.length})`}
            </button>
          ))}
        </div>

        {tab === "new" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 24, alignItems: "start" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ background: "#111111", border: "1px solid #ffffff15", borderRadius: 10, padding: 24 }}>
                <h3 style={{ color: "#fff", fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Class</h3>
                <div style={{ display: "flex", gap: 8 }}>
                  {["11", "12"].map(cls => (
                    <button key={cls} onClick={() => toggleClass(cls)}
                      style={{ padding: "8px 20px", borderRadius: 7, border: `1px solid ${config.classes.includes(cls) ? "#00FF9D" : "#ffffff20"}`, background: config.classes.includes(cls) ? "#00FF9D15" : "transparent", color: config.classes.includes(cls) ? "#00FF9D" : "#ffffff60", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
                      Class {cls}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ background: "#111111", border: "1px solid #ffffff15", borderRadius: 10, padding: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                  <h3 style={{ color: "#fff", fontSize: 15, fontWeight: 700 }}>Chapters ({config.chapters.length || "All"})</h3>
                  {config.chapters.length > 0 && <button onClick={() => setConfig(c => ({ ...c, chapters: [] }))} style={{ color: "#ffffff40", background: "none", border: "none", cursor: "pointer", fontSize: 12 }}>Clear</button>}
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {allChapters.map(ch => (
                    <button key={ch} onClick={() => toggleChapter(ch)}
                      style={{ padding: "5px 10px", borderRadius: 6, border: `1px solid ${config.chapters.includes(ch) ? "#00FF9D" : "#ffffff15"}`, background: config.chapters.includes(ch) ? "#00FF9D15" : "transparent", color: config.chapters.includes(ch) ? "#00FF9D" : "#ffffff50", fontSize: 12, cursor: "pointer" }}>
                      {ch}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ background: "#111111", border: "1px solid #ffffff15", borderRadius: 10, padding: 24 }}>
                <h3 style={{ color: "#fff", fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Difficulty Mix</h3>
                {(["easy", "medium", "hard"] as const).map(d => (
                  <div key={d} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                    <label style={{ color: "#ffffff80", fontSize: 13, width: 60, textTransform: "capitalize" }}>{d}</label>
                    <input type="range" min={0} max={100} value={config.difficulty[d]}
                      onChange={e => setConfig(c => ({ ...c, difficulty: { ...c.difficulty, [d]: Number(e.target.value) } }))}
                      style={{ flex: 1 }} />
                    <span style={{ color: "#ffffff60", fontSize: 13, width: 36, textAlign: "right" }}>{config.difficulty[d]}%</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ position: "sticky", top: 100 }}>
              <div style={{ background: "#111111", border: "1px solid #00FF9D33", borderRadius: 10, padding: 24 }}>
                <h3 style={{ color: "#fff", fontSize: 15, fontWeight: 700, marginBottom: 20 }}>Paper Config</h3>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ color: "#ffffff60", fontSize: 12, display: "block", marginBottom: 6 }}>Total Questions</label>
                  <select value={config.totalQuestions} onChange={e => setConfig(c => ({ ...c, totalQuestions: Number(e.target.value) }))}
                    style={{ width: "100%", padding: "10px 12px", background: "#0A0A0A", border: "1px solid #ffffff20", borderRadius: 8, color: "#fff", fontSize: 14, outline: "none" }}>
                    <option value={30}>30 Questions</option>
                    <option value={60}>60 Questions</option>
                    <option value={90}>90 Questions (Full NEET)</option>
                  </select>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                  <button onClick={() => setConfig(c => ({ ...c, includePYQ: !c.includePYQ }))}
                    style={{ width: 44, height: 24, borderRadius: 12, background: config.includePYQ ? "#00FF9D" : "#ffffff20", border: "none", cursor: "pointer", position: "relative", transition: "all 0.2s" }}>
                    <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#fff", position: "absolute", top: 3, left: config.includePYQ ? 22 : 3, transition: "all 0.2s" }} />
                  </button>
                  <span style={{ color: "#ffffff80", fontSize: 13 }}>Include PYQ questions</span>
                </div>
                <div style={{ marginBottom: 20, background: "#ffffff06", borderRadius: 8, padding: "12px 16px" }}>
                  <p style={{ color: "#ffffff50", fontSize: 12, lineHeight: 1.6 }}>
                    {config.totalQuestions} questions · {config.difficulty.easy}% easy, {config.difficulty.medium}% medium, {config.difficulty.hard}% hard
                  </p>
                </div>
                <button onClick={generatePaper} disabled={generating}
                  style={{ width: "100%", height: 48, background: generating ? "#00FF9D60" : "#00FF9D", border: "none", borderRadius: 8, color: "#000", fontWeight: 800, fontSize: 14, cursor: generating ? "wait" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  <Zap size={16} /> {generating ? "Generating…" : "Generate Paper"}
                </button>
              </div>
            </div>
          </div>
        )}

        {tab === "saved" && (
          <div>
            {papers.length === 0 ? (
              <div style={{ textAlign: "center", padding: "80px 20px" }}>
                <FileText size={48} style={{ color: "#ffffff15", margin: "0 auto 16px" }} />
                <h3 style={{ color: "#ffffff40", fontSize: 18, fontWeight: 600, marginBottom: 8 }}>No Papers Yet</h3>
                <p style={{ color: "#ffffff25", fontSize: 14 }}>Generate your first sample paper to start practicing</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {papers.map(p => (
                  <div key={p.id} style={{ background: "#111111", border: "1px solid #ffffff15", borderRadius: 10, padding: "20px 24px", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ color: "#fff", fontSize: 15, fontWeight: 600, marginBottom: 4 }}>{p.title}</p>
                      <p style={{ color: "#ffffff50", fontSize: 12 }}>{p.config.totalQuestions} questions · Class {p.config.classes.join(" + ")} · {new Date(p.createdAt).toLocaleDateString("en-IN")}</p>
                    </div>
                    {p.attempted && <div style={{ background: "#00FF9D15", border: "1px solid #00FF9D33", borderRadius: 8, padding: "8px 14px", textAlign: "center" }}>
                      <p style={{ color: "#00FF9D", fontWeight: 700 }}>{p.score}/{p.config.totalQuestions}</p>
                      <p style={{ color: "#ffffff50", fontSize: 11 }}>Score</p>
                    </div>}
                    <div style={{ display: "flex", gap: 8 }}>
                      {!p.attempted && (
                        <button onClick={() => api.get(`/sample-papers/detail/${p.id}`).then((d: any) => setActivePaper(d as GeneratedPaper))}
                          style={{ padding: "8px 16px", background: "#00FF9D15", border: "1px solid #00FF9D33", borderRadius: 8, color: "#00FF9D", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                          Attempt
                        </button>
                      )}
                      <button onClick={() => deletePaper(p.id)} style={{ padding: "8px 10px", background: "#ff444415", border: "1px solid #ff444433", borderRadius: 8, color: "#ff6b6b", cursor: "pointer" }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
