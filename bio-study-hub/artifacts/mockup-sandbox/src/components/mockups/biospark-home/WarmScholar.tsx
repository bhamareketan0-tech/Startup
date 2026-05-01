import { Zap, BookOpen, Target, Trophy, ChevronRight, Star, Users, Brain, User, LogOut, Shield } from "lucide-react";

export default function WarmScholar() {
  const stats = [
    { label: "Questions", value: "10,000+", icon: BookOpen, color: "#f59e0b" },
    { label: "Students", value: "50,000+", icon: Users, color: "#e07a5f" },
    { label: "Chapters", value: "38", icon: Brain, color: "#f5eed8" },
    { label: "Success Rate", value: "94%", icon: Trophy, color: "#f59e0b" },
  ];

  const features = [
    {
      icon: Target,
      title: "Smart Practice",
      desc: "8 question types including Passage-Based, Assertion-Reason, Match the Column & more",
      color: "#f59e0b",
    },
    {
      icon: Brain,
      title: "AI-Powered",
      desc: "Adaptive questions based on your performance to maximize learning efficiency",
      color: "#e07a5f",
    },
    {
      icon: Trophy,
      title: "Track Progress",
      desc: "Detailed analytics and score history to monitor your NEET preparation",
      color: "#f5eed8",
    },
  ];

  return (
    <div className="min-h-screen bg-[#1a1208] relative overflow-hidden font-sans text-[#f5eed8]">
      {/* Warm bokeh/radial gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[radial-gradient(circle,rgba(245,158,11,0.08)_0%,rgba(26,18,8,0)_70%)]" />
        <div className="absolute top-[20%] right-[-10%] w-[60%] h-[60%] bg-[radial-gradient(circle,rgba(224,122,95,0.05)_0%,rgba(26,18,8,0)_70%)]" />
        <div className="absolute bottom-[-20%] left-[20%] w-[70%] h-[70%] bg-[radial-gradient(circle,rgba(245,238,216,0.03)_0%,rgba(26,18,8,0)_60%)]" />
      </div>

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-4 py-3">
        <div className="max-w-7xl mx-auto">
          <div className="bg-[#2d1f0e]/80 backdrop-blur-md border border-[#3d2e15] rounded-2xl px-4 py-3 flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-2 cursor-pointer">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#f59e0b] to-[#e07a5f] flex items-center justify-center">
                <Zap className="w-4 h-4 text-[#1a1208]" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-[#f59e0b] to-[#e07a5f] bg-clip-text text-transparent font-['Playfair_Display']">
                BioSpark
              </span>
            </div>

            <div className="hidden md:flex items-center gap-6">
              {["Home", "Community", "Plans"].map((link) => (
                <div
                  key={link}
                  className="text-sm font-medium text-[#f5eed8]/70 hover:text-[#f5eed8] transition-colors cursor-pointer"
                >
                  {link}
                </div>
              ))}
              <div className="text-sm font-medium text-[#e07a5f] hover:text-[#e07a5f]/80 flex items-center gap-1 cursor-pointer">
                <Shield className="w-3 h-3" />
                Admin
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#f59e0b] to-[#e07a5f] flex items-center justify-center">
                    <User className="w-4 h-4 text-[#1a1208]" />
                  </div>
                  <span className="text-sm text-[#f5eed8]/80">Scholar</span>
                </div>
                <button className="flex items-center gap-1 text-sm text-[#f5eed8]/50 hover:text-[#e07a5f] transition-colors">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="relative z-10 pt-32 pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Hero */}
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 bg-[#2d1f0e] border border-[#f59e0b]/30 rounded-full px-4 py-1.5 mb-8 shadow-sm">
              <Star className="w-3 h-3 text-[#f59e0b]" />
              <span className="text-xs text-[#f59e0b] font-medium tracking-wide uppercase">#1 NEET Preparation Platform</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-[#f5eed8] mb-6 leading-tight font-['Playfair_Display']">
              Master{" "}
              <span className="bg-gradient-to-r from-[#f59e0b] to-[#e07a5f] bg-clip-text text-transparent italic">
                NEET Biology
              </span>
              <br />
              with BioSpark
            </h1>

            <p className="text-xl text-[#f5eed8]/60 max-w-2xl mx-auto mb-10 font-light leading-relaxed">
              10,000+ curated MCQs, intelligent practice modes, and real-time performance tracking.
              Everything you need to crack NEET, grounded in academic excellence.
            </p>

            <div className="flex justify-center">
              <button className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#f59e0b] to-[#e07a5f] text-[#1a1208] font-bold rounded-xl hover:opacity-90 transition-opacity text-lg shadow-lg shadow-[#f59e0b]/20">
                Start Practicing <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-24">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="bg-[#241a0a] border border-[#3d2e15] rounded-xl p-8 text-center hover:border-[#f59e0b]/40 transition-all shadow-md"
              >
                <div
                  className="w-12 h-12 rounded-lg mx-auto mb-4 flex items-center justify-center bg-[#1a1208] border border-[#3d2e15]"
                >
                  <stat.icon className="w-6 h-6" style={{ color: stat.color }} />
                </div>
                <div className="text-3xl font-bold text-[#f59e0b] mb-2 font-['Playfair_Display']">{stat.value}</div>
                <div className="text-sm text-[#f5eed8]/60 font-medium uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 mb-20">
            {features.map((f) => (
              <div
                key={f.title}
                className="bg-[#241a0a] border border-[#3d2e15] rounded-xl p-8 hover:border-[#f59e0b]/40 transition-all group shadow-md relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#f59e0b]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div
                  className="w-14 h-14 rounded-lg mb-6 flex items-center justify-center bg-[#1a1208] border border-[#3d2e15]"
                >
                  <f.icon className="w-7 h-7" style={{ color: f.color }} />
                </div>
                <h3 className="text-2xl font-bold text-[#f5eed8] mb-3 font-['Playfair_Display']">{f.title}</h3>
                <p className="text-[#f5eed8]/60 text-base leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
