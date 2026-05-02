import { Link } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { useState, useEffect, useRef } from "react";
import {
  Zap, BookOpen, Target, Trophy, ChevronRight, Users, Brain,
  CheckCircle, BarChart2, Clock, Star, FlaskConical, Layers, ArrowRight,
} from "lucide-react";

function useCountUp(target: number, duration = 2000, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    const step = (ts: number) => {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(ease * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [start, target, duration]);
  return count;
}

function CounterCard({ value, suffix, label, icon: Icon, delay }: {
  value: number; suffix: string; label: string; icon: React.ElementType; delay: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const count = useCountUp(value, 2000, visible);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="relative border p-6 group overflow-hidden"
      style={{
        background: "var(--bs-surface)",
        borderColor: "var(--bs-border-subtle)",
        animationDelay: `${delay}ms`,
      }}
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: "linear-gradient(135deg, color-mix(in srgb, var(--bs-accent-hex) 4%, transparent), transparent)" }} />
      <div className="absolute top-0 left-0 w-0 h-0.5 group-hover:w-full transition-all duration-500"
        style={{ background: "var(--bs-accent-hex)" }} />
      <Icon className="w-7 h-7 mb-4" style={{ color: "var(--bs-accent-hex)" }} />
      <div className="text-4xl font-black tracking-tighter mb-1" style={{ color: "var(--bs-text)" }}>
        {count.toLocaleString()}{suffix}
      </div>
      <div className="text-xs font-mono uppercase tracking-widest" style={{ color: "var(--bs-text-muted)" }}>{label}</div>
    </div>
  );
}

const TESTIMONIALS = [
  { name: "Riya Sharma", score: "660/720", text: "BioSpark's adaptive MCQs helped me identify my weak topics. Cleared NEET on first attempt!", class: "Class 12" },
  { name: "Arjun Patel", score: "647/720", text: "The assertion-reason and match the column practice sets are exactly like the real exam. Game changer!", class: "Class 12" },
  { name: "Priya Nair", score: "638/720", text: "The AI extractor and 10,000+ question bank made my revision incredibly efficient.", class: "Class 11" },
];

const HOW_IT_WORKS = [
  { step: "01", title: "Pick Your Chapter", desc: "Choose from all 38 Biology chapters across Class 11 & 12 syllabus.", icon: BookOpen },
  { step: "02", title: "Practice All Types", desc: "MCQ, Assertion-Reason, Match the Column, True/False and 4 more question types.", icon: FlaskConical },
  { step: "03", title: "Track & Improve", desc: "See your accuracy, weak chapters, and improve with targeted practice.", icon: BarChart2 },
  { step: "04", title: "Ace the Exam", desc: "Mock tests timed like real NEET to build speed and confidence.", icon: Trophy },
];

export function HomePage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen font-['Space_Grotesk'] overflow-hidden relative" style={{ background: "transparent", color: "var(--bs-text)" }}>

      {/* Background grid */}
      <div className="fixed inset-0 pointer-events-none" style={{
        backgroundImage: `linear-gradient(var(--bs-grid-color) 1px, transparent 1px), linear-gradient(90deg, var(--bs-grid-color) 1px, transparent 1px)`,
        backgroundSize: "40px 40px",
      }} />

      {/* Hero */}
      <section className="relative z-10 pt-36 pb-28 px-4">
        <div className="max-w-6xl mx-auto text-center">

          {/* Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] blur-[160px] pointer-events-none opacity-25"
            style={{ background: "var(--bs-accent-hex)" }} />

          {/* Badge */}
          <div className="inline-flex items-center gap-2 border px-4 py-2 mb-10 transform -skew-x-12"
            style={{ background: "var(--bs-surface)", borderColor: "var(--bs-accent-hex)" }}>
            <Star className="w-4 h-4 transform skew-x-12 fill-current" style={{ color: "var(--bs-accent-hex)" }} />
            <span className="text-xs font-black uppercase tracking-widest transform skew-x-12" style={{ color: "var(--bs-accent-hex)" }}>
              India's #1 NEET Biology Platform
            </span>
          </div>

          <h1 className="text-6xl md:text-8xl lg:text-[110px] font-black mb-6 leading-none tracking-tighter uppercase">
            Crack NEET<br />
            <span className="relative inline-block" style={{ color: "var(--bs-accent-hex)" }}>
              Biology
              <div className="absolute -inset-2 blur-2xl -z-10 opacity-40" style={{ background: "var(--bs-accent-hex)" }} />
            </span>
          </h1>

          <p className="text-base md:text-xl max-w-2xl mx-auto mb-6 font-mono uppercase tracking-wide" style={{ color: "var(--bs-text-muted)" }}>
            10,000+ curated questions · 8 question types · AI-powered extraction
          </p>

          <div className="flex flex-wrap gap-3 justify-center mb-14 text-xs font-mono uppercase tracking-wider" style={{ color: "var(--bs-text-muted)" }}>
            {["✓ MCQ", "✓ Assertion-Reason", "✓ Match Column", "✓ True/False", "✓ Fill Blanks", "✓ Mock Tests"].map(f => (
              <span key={f} className="border px-3 py-1.5" style={{ borderColor: "var(--bs-border-subtle)", background: "var(--bs-surface)" }}>{f}</span>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
            {user ? (
              <>
                <Link to="/dashboard" className="group relative">
                  <div className="absolute inset-0 transform -skew-x-12 translate-x-2 translate-y-2 opacity-30 group-hover:translate-x-3 group-hover:translate-y-3 transition-transform" style={{ background: "var(--bs-accent-hex)" }} />
                  <div className="relative flex items-center gap-3 px-10 py-5 font-black uppercase tracking-widest text-lg transform -skew-x-12" style={{ background: "var(--bs-accent-hex)", color: "black" }}>
                    <span className="transform skew-x-12">My Dashboard</span>
                    <ChevronRight className="w-5 h-5 transform skew-x-12 group-hover:translate-x-1 transition-transform" strokeWidth={3} />
                  </div>
                </Link>
                <Link to="/mock-test" className="group flex items-center gap-2 px-10 py-5 border font-black uppercase tracking-widest text-lg transform -skew-x-12 transition-all" style={{ borderColor: "var(--bs-border-strong)", color: "var(--bs-text)" }}>
                  <span className="transform skew-x-12 inline-flex items-center gap-2"><Clock className="w-5 h-5" /> Mock Test</span>
                </Link>
              </>
            ) : (
              <>
                <Link to="/login" className="group relative">
                  <div className="absolute inset-0 transform -skew-x-12 translate-x-2 translate-y-2 opacity-40 group-hover:translate-x-3 group-hover:translate-y-3 transition-transform" style={{ background: "var(--bs-accent-hex)" }} />
                  <div className="relative flex items-center gap-3 px-10 py-5 font-black uppercase tracking-widest text-lg transform -skew-x-12" style={{ background: "var(--bs-accent-hex)", color: "black" }}>
                    <span className="transform skew-x-12">Start Free</span>
                    <ChevronRight className="w-5 h-5 transform skew-x-12 group-hover:translate-x-1 transition-transform" strokeWidth={3} />
                  </div>
                </Link>
                <Link to="/plans" className="px-10 py-5 border font-black uppercase tracking-widest text-lg transform -skew-x-12 transition-all" style={{ borderColor: "var(--bs-border-strong)", color: "var(--bs-text)" }}>
                  <span className="transform skew-x-12 inline-block">View Plans</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Animated Stats */}
      <section className="relative z-10 px-4 pb-28">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <CounterCard value={10000} suffix="+" label="Questions" icon={BookOpen} delay={0} />
            <CounterCard value={50000} suffix="+" label="Students" icon={Users} delay={100} />
            <CounterCard value={38} suffix="" label="Chapters" icon={Brain} delay={200} />
            <CounterCard value={94} suffix="%" label="Success Rate" icon={Trophy} delay={300} />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="relative z-10 px-4 pb-28">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-block border px-4 py-1.5 mb-6 text-xs font-black uppercase tracking-widest transform -skew-x-12"
              style={{ borderColor: "var(--bs-border-subtle)", background: "var(--bs-surface)", color: "var(--bs-text-muted)" }}>
              <span className="transform skew-x-12 inline-block">How It Works</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter" style={{ color: "var(--bs-text)" }}>
              Your Path to <span style={{ color: "var(--bs-accent-hex)" }}>Victory</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-4 gap-4">
            {HOW_IT_WORKS.map((item, i) => (
              <div key={item.step} className="relative border p-8 group overflow-hidden" style={{ background: "var(--bs-surface)", borderColor: "var(--bs-border-subtle)" }}>
                <div className="absolute top-4 right-4 text-7xl font-black opacity-5 select-none" style={{ color: "var(--bs-accent-hex)" }}>{item.step}</div>
                <div className="absolute bottom-0 left-0 h-0.5 w-0 group-hover:w-full transition-all duration-500" style={{ background: "var(--bs-accent-hex)" }} />
                <item.icon className="w-9 h-9 mb-5" style={{ color: "var(--bs-accent-hex)" }} />
                <h3 className="text-lg font-black uppercase tracking-tight mb-3" style={{ color: "var(--bs-text)" }}>{item.title}</h3>
                <p className="text-sm font-mono leading-relaxed" style={{ color: "var(--bs-text-muted)" }}>{item.desc}</p>
                {i < HOW_IT_WORKS.length - 1 && (
                  <ArrowRight className="hidden md:block absolute top-1/2 -right-4 -translate-y-1/2 w-5 h-5 z-10" style={{ color: "var(--bs-accent-hex)" }} />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Question types showcase */}
      <section className="relative z-10 px-4 pb-28">
        <div className="max-w-6xl mx-auto">
          <div className="border overflow-hidden" style={{ background: "var(--bs-surface)", borderColor: "var(--bs-border-subtle)" }}>
            <div className="grid md:grid-cols-2">
              <div className="p-12 border-b md:border-b-0 md:border-r" style={{ borderColor: "var(--bs-border-subtle)" }}>
                <div className="inline-block border px-3 py-1 text-xs font-black uppercase tracking-widest mb-6 transform -skew-x-12"
                  style={{ borderColor: "var(--bs-border-subtle)", color: "var(--bs-text-muted)" }}>
                  <span className="transform skew-x-12 inline-block">All question types</span>
                </div>
                <h2 className="text-3xl font-black uppercase tracking-tighter mb-4" style={{ color: "var(--bs-text)" }}>
                  8 Types Just Like<br /><span style={{ color: "var(--bs-accent-hex)" }}>Real NEET</span>
                </h2>
                <p className="text-sm font-mono leading-relaxed mb-8" style={{ color: "var(--bs-text-muted)" }}>
                  Practice every question format that appears in the actual NEET Biology paper — nothing left out.
                </p>
                <Link to={user ? "/class-select" : "/login"} className="inline-flex items-center gap-2 font-black uppercase tracking-widest text-sm border-b-2 pb-0.5 transition-all"
                  style={{ color: "var(--bs-accent-hex)", borderColor: "var(--bs-accent-hex)" }}>
                  Start Practicing <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="p-12 grid grid-cols-2 gap-3 content-start">
                {[
                  { icon: "📝", type: "Standard MCQ", color: "#00FF9D" },
                  { icon: "🔗", type: "Assertion-Reason", color: "#00FF9D" },
                  { icon: "📋", type: "Match the Column", color: "#ff4444" },
                  { icon: "✓✗", type: "True / False", color: "#00FF9D" },
                  { icon: "___", type: "Fill in the Blanks", color: "#00FF9D" },
                  { icon: "📊", type: "No. of Statements", color: "#00FF9D" },
                  { icon: "🖼️", type: "Diagram Based", color: "#00FF9D" },
                  { icon: "📖", type: "Passage Based", color: "#00FF9D" },
                ].map(({ icon, type, color }) => (
                  <div key={type} className="flex items-center gap-3 border p-3 text-sm font-bold group transition-all hover:scale-[1.02]"
                    style={{ background: "var(--bs-surface-2)", borderColor: "var(--bs-border-subtle)" }}>
                    <span className="text-base">{icon}</span>
                    <span className="text-xs font-mono" style={{ color }}>{type}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature highlights */}
      <section className="relative z-10 px-4 pb-28">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Target, title: "Smart Practice", desc: "Filter by chapter, subtopic, difficulty and question type. Focus only on what you need.", color: "#00FF9D" },
              { icon: Layers, title: "Full Syllabus", desc: "All 38 chapters of NEET Biology — Class 11 and Class 12 — completely covered.", color: "#00FF9D" },
              { icon: Clock, title: "Timed Mock Tests", desc: "Full NEET-style mock tests with countdown timer, review mode, and detailed score analysis.", color: "#ff4444" },
            ].map((f) => (
              <div key={f.title} className="border p-8 relative overflow-hidden group transition-all hover:shadow-lg" style={{ background: "var(--bs-surface)", borderColor: "var(--bs-border-subtle)" }}>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: `linear-gradient(135deg, color-mix(in srgb, ${f.color} 5%, transparent), transparent)` }} />
                <div className="absolute top-0 right-0 w-0 h-0 group-hover:w-full group-hover:h-full transition-all duration-700 -z-0 opacity-5 rounded-bl-full"
                  style={{ background: f.color }} />
                <div className="relative z-10">
                  <div className="w-14 h-14 border flex items-center justify-center mb-6 transform -skew-x-12"
                    style={{ background: "var(--bs-surface-2)", borderColor: f.color + "40" }}>
                    <f.icon className="w-7 h-7 transform skew-x-12" style={{ color: f.color }} />
                  </div>
                  <h3 className="text-2xl font-black uppercase tracking-tight mb-3" style={{ color: "var(--bs-text)" }}>{f.title}</h3>
                  <p className="font-mono text-sm leading-relaxed" style={{ color: "var(--bs-text-muted)" }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="relative z-10 px-4 pb-28">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-black uppercase tracking-tighter" style={{ color: "var(--bs-text)" }}>
              Students Who <span style={{ color: "var(--bs-accent-hex)" }}>Made It</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="border p-8 relative overflow-hidden group"
                style={{ background: "var(--bs-surface)", borderColor: "var(--bs-border-subtle)" }}>
                <div className="absolute top-0 left-0 w-full h-0.5" style={{ background: "linear-gradient(90deg, var(--bs-accent-hex), transparent)" }} />
                <div className="flex mb-3 gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" style={{ color: "var(--bs-accent-hex)" }} />
                  ))}
                </div>
                <p className="text-sm font-mono leading-relaxed mb-6" style={{ color: "var(--bs-text-muted)" }}>"{t.text}"</p>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-black uppercase text-sm" style={{ color: "var(--bs-text)" }}>{t.name}</div>
                    <div className="text-xs font-mono" style={{ color: "var(--bs-text-muted)" }}>{t.class}</div>
                  </div>
                  <div className="text-right border px-3 py-1" style={{ background: "var(--bs-surface-2)", borderColor: "var(--bs-border-subtle)" }}>
                    <div className="text-xs font-mono" style={{ color: "var(--bs-text-muted)" }}>Score</div>
                    <div className="font-black text-sm" style={{ color: "var(--bs-accent-hex)" }}>{t.score}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="relative z-10 px-4 pb-24">
        <div className="max-w-6xl mx-auto">
          <div className="relative border p-16 text-center overflow-hidden" style={{ borderColor: "var(--bs-border-subtle)", background: "var(--bs-surface)" }}>
            <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(135deg, color-mix(in srgb, var(--bs-accent-hex) 5%, transparent), transparent)" }} />
            <div className="absolute top-0 left-0 w-full h-1" style={{ background: `linear-gradient(90deg, transparent, var(--bs-accent-hex), transparent)` }} />
            <div className="absolute bottom-0 left-0 w-full h-1" style={{ background: `linear-gradient(90deg, transparent, var(--bs-secondary-hex, #00FF9D), transparent)` }} />
            <Zap className="w-12 h-12 mx-auto mb-6" style={{ color: "var(--bs-accent-hex)" }} />
            <h2 className="text-5xl font-black uppercase tracking-tighter mb-4" style={{ color: "var(--bs-text)" }}>
              Ready to <span style={{ color: "var(--bs-accent-hex)" }}>Dominate?</span>
            </h2>
            <p className="font-mono mb-10 tracking-wide text-sm max-w-md mx-auto" style={{ color: "var(--bs-text-muted)" }}>
              Join 50,000+ students already using BioSpark to ace NEET Biology.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <>
                  <Link to="/dashboard" className="group relative inline-block">
                    <div className="absolute inset-0 transform -skew-x-12 translate-x-2 translate-y-2 opacity-40 group-hover:translate-x-3 group-hover:translate-y-3 transition-transform" style={{ background: "var(--bs-accent-hex)" }} />
                    <div className="relative inline-flex items-center gap-3 px-10 py-4 font-black uppercase tracking-widest transform -skew-x-12" style={{ background: "var(--bs-accent-hex)", color: "black" }}>
                      <span className="transform skew-x-12 inline-flex items-center gap-2"><BarChart2 className="w-5 h-5" /> Dashboard</span>
                    </div>
                  </Link>
                  <Link to="/leaderboard" className="inline-flex items-center gap-2 px-10 py-4 border font-black uppercase tracking-widest transform -skew-x-12 transition-all" style={{ borderColor: "var(--bs-border-strong)", color: "var(--bs-text)" }}>
                    <span className="transform skew-x-12 inline-flex items-center gap-2"><Trophy className="w-5 h-5" /> Leaderboard</span>
                  </Link>
                </>
              ) : (
                <Link to="/login" className="group relative inline-block">
                  <div className="absolute inset-0 transform -skew-x-12 translate-x-2 translate-y-2 opacity-40 group-hover:translate-x-3 group-hover:translate-y-3 transition-transform" style={{ background: "var(--bs-accent-hex)" }} />
                  <div className="relative inline-flex items-center gap-3 px-10 py-4 font-black uppercase tracking-widest transform -skew-x-12" style={{ background: "var(--bs-accent-hex)", color: "black" }}>
                    <Zap className="w-5 h-5 transform skew-x-12" />
                    <span className="transform skew-x-12">Start for Free</span>
                  </div>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer strip */}
      <div className="relative z-10 border-t py-8 px-4 text-center" style={{ borderColor: "var(--bs-border-subtle)" }}>
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="w-7 h-7 flex items-center justify-center transform -skew-x-12" style={{ background: "var(--bs-accent-hex)" }}>
            <Zap className="w-4 h-4 text-black transform skew-x-12" />
          </div>
          <span className="font-black tracking-tighter text-lg" style={{ color: "var(--bs-text)" }}>BIO<span style={{ color: "var(--bs-accent-hex)" }}>SPARK</span></span>
        </div>
        <p className="text-xs font-mono uppercase tracking-widest" style={{ color: "var(--bs-text-muted)" }}>
          India's Premier NEET Biology MCQ Platform · {new Date().getFullYear()}
        </p>
        <div className="flex justify-center gap-6 mt-4">
          {[{ to: "/home", label: "Home" }, { to: "/community", label: "Arena" }, { to: "/plans", label: "Plans" }, { to: "/leaderboard", label: "Leaderboard" }].map(l => (
            <Link key={l.to} to={l.to} className="text-xs font-mono uppercase tracking-wider transition-colors hover:text-current" style={{ color: "var(--bs-text-muted)" }}>{l.label}</Link>
          ))}
        </div>
      </div>
    </div>
  );
}
