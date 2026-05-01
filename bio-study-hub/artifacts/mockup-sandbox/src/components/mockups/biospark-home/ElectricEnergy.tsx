import React, { useState } from "react";
import { 
  Zap, 
  BookOpen, 
  Target, 
  Trophy, 
  ChevronRight, 
  Star, 
  Users, 
  Brain,
  Menu,
  X,
  LogOut,
  User,
  Shield
} from "lucide-react";

export function ElectricEnergy() {
  const [menuOpen, setMenuOpen] = useState(false);
  const isAdmin = false;
  const activePath = "/home";

  const navLinks = [
    { to: "/home", label: "HOME" },
    { to: "/community", label: "ARENA" },
    { to: "/plans", label: "PRO PASS" },
  ];

  const stats = [
    { label: "QUESTIONS", value: "10,000+", icon: BookOpen, color: "#aaff00" },
    { label: "STUDENTS", value: "50,000+", icon: Users, color: "#aaff00" },
    { label: "CHAPTERS", value: "38", icon: Brain, color: "#aaff00" },
    { label: "SUCCESS RATE", value: "94%", icon: Trophy, color: "#aaff00" },
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
    <div className="min-h-screen bg-black text-white font-['Space_Grotesk'] overflow-hidden relative selection:bg-[#aaff00] selection:text-black">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Angled stripes */}
        <div 
          className="absolute -top-[20%] -left-[10%] w-[120%] h-[30%] bg-[#aaff00] mix-blend-screen"
          style={{ transform: "skewY(-12deg)", opacity: 0.03 }}
        />
        <div 
          className="absolute top-[20%] -left-[10%] w-[120%] h-[20%] bg-[#ff4d00] mix-blend-screen"
          style={{ transform: "skewY(-12deg)", opacity: 0.02 }}
        />
        <div 
          className="absolute top-[60%] -left-[10%] w-[120%] h-[40%] bg-[#aaff00] mix-blend-screen"
          style={{ transform: "skewY(-12deg)", opacity: 0.04 }}
        />
        <div 
          className="absolute top-[110%] -left-[10%] w-[120%] h-[20%] bg-[#ff4d00] mix-blend-screen"
          style={{ transform: "skewY(-12deg)", opacity: 0.03 }}
        />
        
        {/* Grid Overlay */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)",
            backgroundSize: "40px 40px"
          }}
        />
      </div>

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-md uppercase font-bold tracking-wider">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <a href="#" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-[#aaff00] flex items-center justify-center transform -skew-x-12 group-hover:bg-[#ff4d00] transition-colors">
                <Zap className="w-6 h-6 text-black transform skew-x-12" />
              </div>
              <span className="text-2xl font-black text-white tracking-tighter">
                BIO<span className="text-[#aaff00]">SPARK</span>
              </span>
            </a>

            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <a
                  key={link.to}
                  href="#"
                  className={`text-sm transition-all relative py-2 ${
                    activePath === link.to
                      ? "text-[#aaff00]"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  {link.label}
                  {activePath === link.to && (
                    <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#aaff00] transform -skew-x-12" />
                  )}
                </a>
              ))}
              {isAdmin && (
                <a
                  href="#"
                  className="text-sm text-[#ff4d00] hover:text-[#ff4d00]/80 flex items-center gap-1"
                >
                  <Shield className="w-4 h-4" />
                  ADMIN
                </a>
              )}
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-4 border-l border-white/10 pl-6">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-white/5 border border-white/20 flex items-center justify-center transform -skew-x-12">
                    <User className="w-4 h-4 text-[#aaff00] transform skew-x-12" />
                  </div>
                  <span className="text-sm font-bold text-white/80 uppercase">Pro User</span>
                </div>
                <button className="text-white/40 hover:text-[#ff4d00] transition-colors">
                  <LogOut className="w-5 h-5" />
                </button>
              </div>

              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="md:hidden p-2 text-[#aaff00]"
              >
                {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden bg-[#111] border-b border-white/10">
            <div className="px-4 py-4 flex flex-col gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.to}
                  href="#"
                  onClick={() => setMenuOpen(false)}
                  className={`text-lg font-bold ${
                    activePath === link.to ? "text-[#aaff00]" : "text-white/60"
                  }`}
                >
                  {link.label}
                </a>
              ))}
              <div className="h-px bg-white/10 my-2" />
              <button className="text-left text-[#ff4d00] font-bold py-2 uppercase">
                Sign Out
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <div className="relative z-10 pt-32 pb-24 px-4">
        <div className="max-w-6xl mx-auto">
          
          {/* Hero Section */}
          <div className="text-center mb-24 relative">
            {/* Glowing orb behind text */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-[#aaff00]/20 blur-[100px] pointer-events-none" />

            <div className="inline-flex items-center gap-2 bg-[#111] border border-[#aaff00] px-4 py-2 mb-8 transform -skew-x-12">
              <Star className="w-4 h-4 text-[#aaff00] fill-[#aaff00] transform skew-x-12" />
              <span className="text-sm text-[#aaff00] font-bold uppercase tracking-widest transform skew-x-12">
                #1 NEET Arena
              </span>
            </div>

            <h1 className="text-6xl md:text-8xl lg:text-9xl font-black text-white mb-6 leading-none tracking-tighter uppercase drop-shadow-[0_0_15px_rgba(170,255,0,0.3)]">
              Dominate <br />
              <span className="text-[#aaff00] relative inline-block">
                NEET Bio
                <div className="absolute -inset-1 bg-[#aaff00]/20 blur-xl -z-10" />
              </span>
            </h1>

            <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-12 font-mono uppercase tracking-wide">
              10,000+ curated MCQs. Adaptive logic. Real-time stats. <br />
              <span className="text-white">Engage performance mode.</span>
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <button className="group relative w-full sm:w-auto">
                {/* Button Shadow/Glow effect */}
                <div className="absolute inset-0 bg-[#aaff00] transform -skew-x-12 translate-x-2 translate-y-2 opacity-30 group-hover:translate-x-3 group-hover:translate-y-3 transition-transform" />
                
                <div className="relative flex items-center justify-center gap-3 px-10 py-5 bg-[#aaff00] text-black font-black uppercase tracking-widest text-xl transform -skew-x-12 hover:bg-white transition-colors">
                  <span className="transform skew-x-12">Start Practicing</span>
                  <ChevronRight className="w-6 h-6 transform skew-x-12 group-hover:translate-x-1 transition-transform" strokeWidth={3} />
                </div>
              </button>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-24">
            {stats.map((stat, i) => (
              <div
                key={stat.label}
                className="relative bg-[#111] border-l-4 border-[#aaff00] p-6 hover:bg-[#1a1a1a] transition-colors group"
              >
                {/* Number styling behind */}
                <div className="absolute top-2 right-4 text-6xl font-black text-white/5 group-hover:text-[#aaff00]/10 transition-colors pointer-events-none">
                  0{i + 1}
                </div>
                
                <stat.icon className="w-8 h-8 text-[#aaff00] mb-4 opacity-80 group-hover:opacity-100 transition-opacity" />
                <div className="text-4xl font-black text-white mb-1 tracking-tighter">{stat.value}</div>
                <div className="text-xs font-mono text-white/50 uppercase tracking-widest">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Features Row */}
          <div className="grid md:grid-cols-3 gap-6 mb-24">
            {features.map((f) => (
              <div
                key={f.title}
                className="bg-[#111] border border-white/10 p-8 relative overflow-hidden group hover:border-[#ff4d00]/50 transition-colors"
              >
                {/* Neon accent line */}
                <div className="absolute top-0 left-0 w-1 h-full bg-[#ff4d00] transform origin-top scale-y-0 group-hover:scale-y-100 transition-transform duration-300" />
                
                <div className="w-14 h-14 bg-black border border-white/20 flex items-center justify-center mb-6 transform -skew-x-12 group-hover:border-[#ff4d00] transition-colors">
                  <f.icon className="w-7 h-7 text-white group-hover:text-[#ff4d00] transform skew-x-12 transition-colors" />
                </div>
                <h3 className="text-2xl font-black text-white mb-4 uppercase tracking-tight">{f.title}</h3>
                <p className="text-white/50 font-mono text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
