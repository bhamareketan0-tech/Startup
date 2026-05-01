import React, { useState } from "react";
import { Zap, BookOpen, Target, Trophy, ChevronRight, Star, Users, Brain, Menu, X, LogOut, User } from "lucide-react";

export function ClinicalFocus() {
  const [menuOpen, setMenuOpen] = useState(false);

  const stats = [
    { label: "Questions", value: "10,000+", icon: BookOpen },
    { label: "Students", value: "50,000+", icon: Users },
    { label: "Chapters", value: "38", icon: Brain },
    { label: "Success Rate", value: "94%", icon: Trophy },
  ];

  const features = [
    {
      icon: Target,
      title: "Smart Practice",
      desc: "8 question types including Passage-Based, Assertion-Reason, Match the Column & more.",
    },
    {
      icon: Brain,
      title: "AI-Powered",
      desc: "Adaptive questions based on your performance to maximize learning efficiency.",
    },
    {
      icon: Trophy,
      title: "Track Progress",
      desc: "Detailed analytics and score history to monitor your NEET preparation.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0e1a] font-sans text-white overflow-y-auto">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-[#0d1117]/95 backdrop-blur-md border-b-2 border-blue-500 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-500" />
            <span className="text-xl font-bold tracking-tight text-white">
              BioSpark
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <a href="#" className="text-sm font-medium text-blue-500">Home</a>
            <a href="#" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Community</a>
            <a href="#" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Plans</a>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-300">Student</span>
              </div>
              <button className="text-gray-500 hover:text-white transition-colors">
                <LogOut className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden text-gray-400 hover:text-white"
            >
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden mt-4 border-t border-gray-800 pt-4 pb-2 space-y-3">
            <a href="#" className="block text-blue-500 font-medium">Home</a>
            <a href="#" className="block text-gray-400 font-medium">Community</a>
            <a href="#" className="block text-gray-400 font-medium">Plans</a>
            <div className="pt-2 flex items-center justify-between text-gray-400">
              <span className="font-medium">Student</span>
              <LogOut className="w-4 h-4" />
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 pt-24 pb-24 px-6">
        <div className="max-w-6xl mx-auto relative">
          {/* Subtle radial glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-blue-500/10 blur-[100px] pointer-events-none rounded-full" />
          
          <div className="text-center relative z-10 mb-24">
            <div className="inline-flex items-center gap-2 border border-blue-500 px-3 py-1 mb-8 rounded">
              <Star className="w-3 h-3 text-blue-500" />
              <span className="text-xs text-blue-500 font-mono tracking-wider uppercase">#1 NEET Preparation</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 leading-tight tracking-tight">
              Master NEET Biology
              <br />
              with BioSpark
            </h1>

            <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              10,000+ curated MCQs, intelligent practice modes, and real-time performance tracking.
              Everything you need to crack NEET, optimized for serious learners.
            </p>

            <button className="inline-flex items-center gap-2 px-8 py-4 bg-blue-500 text-white font-bold uppercase tracking-wider text-sm hover:bg-blue-600 transition-colors">
              Start Practicing <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-24">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="bg-[#0d1117] border border-gray-800 border-l-4 border-l-blue-500 p-6 flex flex-col"
              >
                <div className="text-3xl font-extrabold text-white mb-2">{stat.value}</div>
                <div className="text-sm font-medium text-gray-400 uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Features Section */}
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((f) => (
              <div
                key={f.title}
                className="bg-[#1a2035] border border-gray-800 p-8 flex flex-col items-start"
              >
                <div className="w-10 h-10 bg-blue-500 flex items-center justify-center mb-6">
                  <f.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3 tracking-tight">{f.title}</h3>
                <p className="text-gray-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
