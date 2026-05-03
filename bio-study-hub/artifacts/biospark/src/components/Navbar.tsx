import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/lib/ThemeContext";
import {
  Sun, Moon, Menu, X, Zap, LogOut, User, Shield, Trophy, Clock,
  BarChart2, Flame, Bookmark, FileText, Sliders, RotateCcw, BookOpen,
  ChevronDown, Sparkles, Layers, GitCompareArrows, Award, FileQuestion, Swords
} from "lucide-react";
import { ADMIN_EMAIL } from "@/lib/constants";

export function Navbar() {
  const { user, profile, signOut } = useAuth();
  const { mode, setMode } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const location = useLocation();

  const isAdmin = user?.email === ADMIN_EMAIL;
  const isDark = mode === "dark";

  const publicLinks = [
    { to: "/home", label: "HOME" },
    { to: "/community", label: "ARENA" },
    { to: "/leaderboard", label: "RANKS" },
    { to: "/plans", label: "PRO PASS" },
  ];

  const primaryAuthLinks = [
    { to: "/dashboard", label: "DASHBOARD", icon: BarChart2 },
    { to: "/class-select", label: "PRACTICE", icon: null },
    { to: "/mock-test", label: "MOCK TEST", icon: Clock },
    { to: "/daily-challenge", label: "DAILY", icon: Flame },
    { to: "/battle", label: "1v1", icon: Swords },
    { to: "/maa", label: "MAA", icon: Sparkles },
  ];

  const moreLinks = [
    { to: "/pyq", label: "PYQ", icon: Award },
    { to: "/flashcards", label: "Flashcards", icon: Layers },
    { to: "/short-notes", label: "Short Notes", icon: FileText },
    { to: "/sample-papers", label: "Sample Papers", icon: FileQuestion },
    { to: "/comparisons", label: "Comparisons", icon: GitCompareArrows },
    { to: "/performance", label: "Stats", icon: BarChart2 },
    { to: "/custom-quiz", label: "Custom Quiz", icon: Sliders },
    { to: "/revision", label: "Revision", icon: RotateCcw },
    { to: "/bookmarks", label: "Bookmarks", icon: Bookmark },
    { to: "/notes", label: "My Notes", icon: FileText },
    { to: "/syllabus", label: "Syllabus", icon: BookOpen },
    { to: "/leaderboard", label: "Ranks", icon: Trophy },
  ];

  const links = user ? primaryAuthLinks : publicLinks;
  const isActive = (to: string) => location.pathname === to;

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 border-b uppercase font-black tracking-wider font-['Space_Grotesk'] transition-colors duration-300 backdrop-blur-md"
      style={{ borderColor: "var(--bs-border-subtle)", background: isDark ? "rgba(0,0,0,0.92)" : `color-mix(in srgb, var(--bs-bg) 92%, transparent)` }}
    >
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">

          {/* Logo */}
          <Link to="/home" className="flex items-center gap-3 group">
            <div className="w-10 h-10 flex items-center justify-center transform -skew-x-12 transition-colors" style={{ background: "#00FF9D" }}>
              <Zap className="w-6 h-6 text-black transform skew-x-12" />
            </div>
            <span className="text-2xl font-black tracking-tighter" style={{ color: "var(--bs-text)" }}>
              BIO<span style={{ color: "#00FF9D" }}>SPARK</span>
            </span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-5">
            {links.map((link) => (
              <Link key={link.to} to={link.to}
                className="text-sm transition-all relative py-2 min-h-[44px] flex items-center"
                style={{ color: isActive(link.to) ? "#00FF9D" : "var(--bs-text-muted)" }}>
                {link.label}
                {isActive(link.to) && <div className="absolute bottom-0 left-0 w-full h-0.5 transform -skew-x-12" style={{ background: "#00FF9D" }} />}
              </Link>
            ))}

            {user && (
              <div className="relative">
                <button
                  onClick={() => setMoreOpen((o) => !o)}
                  className="text-sm flex items-center gap-1 py-2 min-h-[44px] transition-all"
                  style={{ color: moreOpen ? "#00FF9D" : "var(--bs-text-muted)" }}
                >
                  MORE <ChevronDown className={`w-3 h-3 transition-transform ${moreOpen ? "rotate-180" : ""}`} />
                </button>
                {moreOpen && (
                  <div className="absolute top-full right-0 w-52 border shadow-xl z-50 max-h-80 overflow-y-auto" style={{ background: "var(--bs-surface)", borderColor: "var(--bs-border-subtle)" }}
                    onMouseLeave={() => setMoreOpen(false)}>
                    {moreLinks.map((l) => (
                      <Link key={l.to} to={l.to} onClick={() => setMoreOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-xs font-black uppercase transition-all min-h-[44px]"
                        style={{ color: isActive(l.to) ? "#00FF9D" : "var(--bs-text-muted)", background: isActive(l.to) ? "rgba(0,255,157,0.06)" : "transparent" }}>
                        {l.icon && <l.icon className="w-3.5 h-3.5" />}
                        {l.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}

            {isAdmin && (
              <Link to="/admin" className="text-sm flex items-center gap-1 min-h-[44px]" style={{ color: "#00FF9D" }}>
                <Shield className="w-4 h-4" /> ADMIN
              </Link>
            )}
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMode(isDark ? "light" : "dark")}
              className="p-2 border transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
              style={{ borderColor: "var(--bs-border-subtle)" }}
            >
              {isDark
                ? <Sun className="w-4 h-4" style={{ color: "#00FF9D" }} />
                : <Moon className="w-4 h-4" style={{ color: "var(--bs-text-muted)" }} />}
            </button>

            {user ? (
              <div className="hidden md:flex items-center gap-3 border-l pl-3" style={{ borderColor: "var(--bs-border-subtle)" }}>
                <Link to="/profile" className="flex items-center gap-2 hover:opacity-80 min-h-[44px]">
                  <div className="w-8 h-8 border flex items-center justify-center transform -skew-x-12" style={{ background: "var(--bs-surface-2)", borderColor: "var(--bs-border-strong)" }}>
                    {user.avatar
                      ? <img src={user.avatar} alt="avatar" className="w-full h-full object-cover transform skew-x-12" loading="lazy" />
                      : <User className="w-4 h-4 transform skew-x-12" style={{ color: "#00FF9D" }} />}
                  </div>
                  <span className="text-sm font-bold uppercase" style={{ color: "var(--bs-text-muted)" }}>
                    {profile?.name?.split(" ")[0] || user.email?.split("@")[0]}
                  </span>
                </Link>
                <button
                  onClick={signOut}
                  className="min-w-[44px] min-h-[44px] flex items-center justify-center transition-colors"
                  style={{ color: "var(--bs-text-muted)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#ff4444")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "var(--bs-text-muted)")}
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="hidden md:flex items-center px-5 py-2 text-sm font-black uppercase tracking-widest transform -skew-x-12 min-h-[44px]"
                style={{ background: "#00FF9D", color: "black" }}
              >
                <span className="transform skew-x-12">Sign In</span>
              </Link>
            )}

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
              style={{ color: "#00FF9D" }}
            >
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-b" style={{ background: "var(--bs-surface)", borderColor: "var(--bs-border-subtle)" }}>
          <div className="px-4 py-4 flex flex-col gap-1">
            {links.map((link) => (
              <Link key={link.to} to={link.to} onClick={() => setMenuOpen(false)}
                className="text-base font-bold py-3 min-h-[44px] flex items-center"
                style={{ color: isActive(link.to) ? "#00FF9D" : "var(--bs-text-muted)" }}>
                {link.label}
              </Link>
            ))}
            {user && (
              <>
                <div className="h-px my-1" style={{ background: "var(--bs-border-subtle)" }} />
                {moreLinks.map((l) => (
                  <Link key={l.to} to={l.to} onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 py-2.5 min-h-[44px] font-bold text-xs uppercase"
                    style={{ color: isActive(l.to) ? "#00FF9D" : "var(--bs-text-muted)" }}>
                    {l.icon && <l.icon className="w-4 h-4" />}
                    {l.label}
                  </Link>
                ))}
              </>
            )}
            {isAdmin && (
              <Link to="/admin" onClick={() => setMenuOpen(false)} className="font-bold flex items-center gap-1 min-h-[44px] py-3" style={{ color: "#00FF9D" }}>
                <Shield className="w-4 h-4" /> ADMIN
              </Link>
            )}
            <div className="h-px my-1" style={{ background: "var(--bs-border-subtle)" }} />
            {user ? (
              <>
                <Link to="/profile" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 font-bold py-3 uppercase min-h-[44px]" style={{ color: "var(--bs-text-muted)" }}>
                  <User className="w-4 h-4" style={{ color: "#00FF9D" }} />
                  {profile?.name?.split(" ")[0] || user.email?.split("@")[0]} — Profile
                </Link>
                <button onClick={() => { signOut(); setMenuOpen(false); }} className="text-left font-bold py-3 uppercase min-h-[44px] flex items-center" style={{ color: "#ff4444" }}>
                  Sign Out
                </button>
              </>
            ) : (
              <Link to="/login" onClick={() => setMenuOpen(false)} className="font-bold min-h-[44px] flex items-center py-3" style={{ color: "#00FF9D" }}>
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
