import { Link } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { Zap, BookOpen, Target, Trophy, ChevronRight, Star, Users, Brain } from "lucide-react";

export function HomePage() {
  const { user } = useAuth();

  const stats = [
    { label: "QUESTIONS", value: "10,000+", icon: BookOpen },
    { label: "STUDENTS", value: "50,000+", icon: Users },
    { label: "CHAPTERS", value: "38", icon: Brain },
    { label: "SUCCESS RATE", value: "94%", icon: Trophy },
  ];

  const features = [
    {
      icon: Target,
      title: "SMART PRACTICE",
      desc: "8 QUESTION TYPES INCLUDING PASSAGE-BASED, ASSERTION-REASON, MATCH THE COLUMN & MORE.",
    },
    {
      icon: Brain,
      title: "AI-POWERED",
      desc: "ADAPTIVE QUESTIONS BASED ON YOUR PERFORMANCE TO MAXIMIZE LEARNING EFFICIENCY.",
    },
    {
      icon: Trophy,
      title: "TRACK PROGRESS",
      desc: "DETAILED ANALYTICS AND SCORE HISTORY TO MONITOR YOUR NEET PREPARATION STATUS.",
    },
  ];

  return (
    <div
      className="min-h-screen font-['Space_Grotesk'] overflow-hidden relative transition-colors duration-300"
      style={{ background: "transparent", color: "var(--bs-text)" }}
    >

      {/* Diagonal stripe overlays */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-[20%] -left-[10%] w-[120%] h-[30%]"
          style={{ transform: "skewY(-12deg)", opacity: 0.04, background: "var(--bs-accent-hex)", mixBlendMode: "overlay" }}
        />
        <div
          className="absolute top-[20%] -left-[10%] w-[120%] h-[20%]"
          style={{ transform: "skewY(-12deg)", opacity: 0.04, background: "var(--bs-secondary-hex)", mixBlendMode: "overlay" }}
        />
        <div
          className="absolute top-[60%] -left-[10%] w-[120%] h-[40%]"
          style={{ transform: "skewY(-12deg)", opacity: 0.03, background: "var(--bs-accent-hex)", mixBlendMode: "overlay" }}
        />
        {/* Grid overlay */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(var(--bs-grid-color) 1px, transparent 1px), linear-gradient(90deg, var(--bs-grid-color) 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="relative z-10 pt-32 pb-24 px-4">
        <div className="max-w-6xl mx-auto">

          {/* Hero */}
          <div className="text-center mb-24 relative">
            {/* Glowing orb */}
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] blur-[120px] pointer-events-none"
              style={{ background: `color-mix(in srgb, var(--bs-accent-hex) 20%, transparent)` }}
            />

            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 border px-4 py-2 mb-8 transform -skew-x-12"
              style={{ background: "var(--bs-surface)", borderColor: "var(--bs-accent-hex)" }}
            >
              <Star className="w-4 h-4 transform skew-x-12" style={{ color: "var(--bs-accent-hex)", fill: "var(--bs-accent-hex)" }} />
              <span className="text-sm font-black uppercase tracking-widest transform skew-x-12" style={{ color: "var(--bs-accent-hex)" }}>
                #1 NEET Arena
              </span>
            </div>

            <h1 className="text-6xl md:text-8xl lg:text-9xl font-black mb-6 leading-none tracking-tighter uppercase" style={{ color: "var(--bs-text)" }}>
              Dominate <br />
              <span className="relative inline-block" style={{ color: "var(--bs-accent-hex)" }}>
                NEET Bio
                <div
                  className="absolute -inset-1 blur-xl -z-10"
                  style={{ background: `color-mix(in srgb, var(--bs-accent-hex) 20%, transparent)` }}
                />
              </span>
            </h1>

            <p className="text-lg md:text-xl max-w-2xl mx-auto mb-12 font-mono uppercase tracking-wide" style={{ color: "var(--bs-text-muted)" }}>
              10,000+ curated MCQs. Adaptive logic. Real-time stats. <br />
              <span className="font-bold" style={{ color: "var(--bs-text)" }}>Engage performance mode.</span>
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              {user ? (
                <Link to="/class-select" className="group relative w-full sm:w-auto">
                  <div
                    className="absolute inset-0 transform -skew-x-12 translate-x-2 translate-y-2 opacity-30 group-hover:translate-x-3 group-hover:translate-y-3 transition-transform"
                    style={{ background: "var(--bs-accent-hex)" }}
                  />
                  <div
                    className="relative flex items-center justify-center gap-3 px-10 py-5 font-black uppercase tracking-widest text-xl transform -skew-x-12 transition-colors"
                    style={{ background: "var(--bs-accent-hex)", color: "black" }}
                  >
                    <span className="transform skew-x-12">Start Practicing</span>
                    <ChevronRight className="w-6 h-6 transform skew-x-12 group-hover:translate-x-1 transition-transform" strokeWidth={3} />
                  </div>
                </Link>
              ) : (
                <>
                  <Link to="/login" className="group relative w-full sm:w-auto">
                    <div
                      className="absolute inset-0 transform -skew-x-12 translate-x-2 translate-y-2 opacity-40 group-hover:translate-x-3 group-hover:translate-y-3 transition-transform"
                      style={{ background: "var(--bs-accent-hex)" }}
                    />
                    <div
                      className="relative flex items-center justify-center gap-3 px-10 py-5 font-black uppercase tracking-widest text-xl transform -skew-x-12 transition-colors"
                      style={{ background: "var(--bs-accent-hex)", color: "black" }}
                    >
                      <span className="transform skew-x-12">Get Started Free</span>
                      <ChevronRight className="w-6 h-6 transform skew-x-12 group-hover:translate-x-1 transition-transform" strokeWidth={3} />
                    </div>
                  </Link>
                  <Link
                    to="/plans"
                    className="px-10 py-5 border font-black uppercase tracking-widest text-xl transform -skew-x-12 transition-all"
                    style={{ borderColor: "var(--bs-border-strong)", color: "var(--bs-text)" }}
                  >
                    <span className="transform skew-x-12 inline-block">View Plans</span>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-24">
            {stats.map((stat, i) => (
              <div
                key={stat.label}
                className="relative border-l-4 p-6 transition-colors group shadow-sm"
                style={{
                  background: "var(--bs-surface)",
                  borderLeftColor: "var(--bs-accent-hex)",
                  borderRight: "1px solid var(--bs-border-subtle)",
                  borderTop: "1px solid var(--bs-border-subtle)",
                  borderBottom: "1px solid var(--bs-border-subtle)",
                }}
              >
                <div
                  className="absolute top-2 right-4 text-6xl font-black pointer-events-none select-none transition-colors"
                  style={{ color: `color-mix(in srgb, var(--bs-text) 5%, transparent)` }}
                >
                  0{i + 1}
                </div>
                <stat.icon className="w-8 h-8 mb-4 opacity-80 group-hover:opacity-100 transition-opacity" style={{ color: "var(--bs-accent-hex)" }} />
                <div className="text-4xl font-black mb-1 tracking-tighter" style={{ color: "var(--bs-text)" }}>{stat.value}</div>
                <div className="text-xs font-mono uppercase tracking-widest" style={{ color: "var(--bs-text-muted)" }}>{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Features row */}
          <div className="grid md:grid-cols-3 gap-6 mb-24">
            {features.map((f) => (
              <div
                key={f.title}
                className="border p-8 relative overflow-hidden group transition-colors shadow-sm"
                style={{ background: "var(--bs-surface)", borderColor: "var(--bs-border-subtle)" }}
              >
                <div
                  className="absolute top-0 left-0 w-1 h-full transform origin-top scale-y-0 group-hover:scale-y-100 transition-transform duration-300"
                  style={{ background: "var(--bs-secondary-hex)" }}
                />
                <div
                  className="w-14 h-14 border flex items-center justify-center mb-6 transform -skew-x-12 transition-colors"
                  style={{ background: "var(--bs-surface-2)", borderColor: "var(--bs-border-subtle)" }}
                >
                  <f.icon className="w-7 h-7 transform skew-x-12 transition-colors" style={{ color: "var(--bs-text)" }} />
                </div>
                <h3 className="text-2xl font-black mb-4 uppercase tracking-tight" style={{ color: "var(--bs-text)" }}>{f.title}</h3>
                <p className="font-mono text-sm leading-relaxed" style={{ color: "var(--bs-text-muted)" }}>{f.desc}</p>
              </div>
            ))}
          </div>

          {/* Bottom CTA for logged-out users */}
          {!user && (
            <div className="relative border p-12 text-center overflow-hidden" style={{ borderColor: "var(--bs-border-subtle)" }}>
              <div
                className="absolute inset-0 pointer-events-none"
                style={{ background: `color-mix(in srgb, var(--bs-accent-hex) 4%, transparent)` }}
              />
              <div className="absolute top-0 left-0 w-full h-1" style={{ background: "var(--bs-accent-hex)" }} />
              <h2 className="text-4xl font-black mb-4 uppercase tracking-tighter" style={{ color: "var(--bs-text)" }}>
                Ready to <span style={{ color: "var(--bs-accent-hex)" }}>Dominate</span> NEET?
              </h2>
              <p className="font-mono mb-8 uppercase tracking-wide text-sm" style={{ color: "var(--bs-text-muted)" }}>
                Join 50,000+ students already competing with BioSpark
              </p>
              <Link to="/login" className="group relative inline-block">
                <div
                  className="absolute inset-0 transform -skew-x-12 translate-x-2 translate-y-2 opacity-40 group-hover:translate-x-3 group-hover:translate-y-3 transition-transform"
                  style={{ background: "var(--bs-accent-hex)" }}
                />
                <div
                  className="relative inline-flex items-center gap-3 px-8 py-4 font-black uppercase tracking-widest transform -skew-x-12 transition-colors"
                  style={{ background: "var(--bs-accent-hex)", color: "black" }}
                >
                  <Zap className="w-5 h-5 transform skew-x-12" />
                  <span className="transform skew-x-12">Start for Free</span>
                </div>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
