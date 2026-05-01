import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/lib/ThemeContext";
import { Sun, Moon, Menu, X, Zap, LogOut, User, Shield, Trophy, Clock, BarChart2 } from "lucide-react";

const ADMIN_EMAIL = "bhamareketan18@gmail.com";

export function Navbar() {
  const { user, profile, signOut } = useAuth();
  const { mode, setMode } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const isAdmin = user?.email === ADMIN_EMAIL;
  const isDark = mode === "dark";

  const publicLinks = [
    { to: "/home", label: "HOME" },
    { to: "/community", label: "ARENA" },
    { to: "/leaderboard", label: "RANKS" },
    { to: "/plans", label: "PRO PASS" },
  ];

  const authLinks = [
    { to: "/dashboard", label: "DASHBOARD", icon: BarChart2 },
    { to: "/class-select", label: "PRACTICE", icon: null },
    { to: "/mock-test", label: "MOCK TEST", icon: Clock },
    { to: "/community", label: "ARENA", icon: null },
    { to: "/leaderboard", label: "RANKS", icon: Trophy },
  ];

  const links = user ? authLinks : publicLinks;

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 border-b uppercase font-black tracking-wider font-['Space_Grotesk'] transition-colors duration-300 backdrop-blur-md"
      style={{
        borderColor: "var(--bs-border-subtle)",
        background: isDark ? "rgba(0,0,0,0.92)" : `color-mix(in srgb, var(--bs-bg) 92%, transparent)`,
      }}
    >
      <div className="max-w-7xl mx-auto px-4 py-3.5">
        <div className="flex items-center justify-between gap-4">

          {/* Logo */}
          <Link to={user ? "/dashboard" : "/home"} className="flex items-center gap-3 group shrink-0">
            <div
              className="w-9 h-9 flex items-center justify-center transform -skew-x-12 transition-colors"
              style={{ background: "var(--bs-accent-hex)" }}
            >
              <Zap className="w-5 h-5 text-black transform skew-x-12" />
            </div>
            <span className="text-xl font-black tracking-tighter" style={{ color: "var(--bs-text)" }}>
              BIO<span style={{ color: "var(--bs-accent-hex)" }}>SPARK</span>
            </span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-6 flex-1 justify-center">
            {links.map((link) => {
              const isActive = location.pathname === link.to || (link.to === "/dashboard" && location.pathname === "/dashboard");
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className="text-xs transition-all relative py-2 flex items-center gap-1.5"
                  style={{
                    color: isActive ? "var(--bs-accent-hex)" : "var(--bs-text-muted)",
                  }}
                >
                  {"icon" in link && link.icon && <link.icon className="w-3.5 h-3.5" />}
                  {link.label}
                  {isActive && (
                    <div
                      className="absolute bottom-0 left-0 w-full h-0.5 transform -skew-x-12"
                      style={{ background: "var(--bs-accent-hex)" }}
                    />
                  )}
                </Link>
              );
            })}
            {isAdmin && (
              <Link
                to="/admin"
                className="text-xs flex items-center gap-1 transition-colors"
                style={{ color: "var(--bs-secondary-hex, #f43f5e)" }}
              >
                <Shield className="w-3.5 h-3.5" />
                ADMIN
              </Link>
            )}
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Mode toggle */}
            <button
              onClick={() => setMode(isDark ? "light" : "dark")}
              className="p-2 border transition-colors"
              style={{ borderColor: "var(--bs-border-subtle)" }}
              title={isDark ? "Switch to Light" : "Switch to Dark"}
            >
              {isDark
                ? <Sun className="w-3.5 h-3.5" style={{ color: "var(--bs-accent-hex)" }} />
                : <Moon className="w-3.5 h-3.5" style={{ color: "var(--bs-text-muted)" }} />}
            </button>

            {user ? (
              <div className="hidden md:flex items-center gap-3 border-l pl-3" style={{ borderColor: "var(--bs-border-subtle)" }}>
                <Link
                  to="/profile"
                  className="flex items-center gap-2 group transition-opacity hover:opacity-80"
                >
                  <div
                    className="w-7 h-7 border flex items-center justify-center transform -skew-x-12"
                    style={{ background: "var(--bs-surface-2)", borderColor: "var(--bs-border-strong)" }}
                  >
                    {user.avatar
                      ? <img src={user.avatar} alt="avatar" className="w-full h-full object-cover transform skew-x-12" />
                      : <User className="w-3.5 h-3.5 transform skew-x-12" style={{ color: "var(--bs-accent-hex)" }} />}
                  </div>
                  <span className="text-xs font-bold uppercase" style={{ color: "var(--bs-text-muted)" }}>
                    {profile?.name?.split(" ")[0] || user.email?.split("@")[0]}
                  </span>
                </Link>
                <button
                  onClick={signOut}
                  className="transition-colors"
                  style={{ color: "var(--bs-text-muted)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#ef4444")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "var(--bs-text-muted)")}
                  title="Sign out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="hidden md:flex items-center px-5 py-2 text-xs font-black uppercase tracking-widest transform -skew-x-12 transition-colors"
                style={{ background: "var(--bs-accent-hex)", color: "black" }}
              >
                <span className="transform skew-x-12">Sign In</span>
              </Link>
            )}

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2"
              style={{ color: "var(--bs-accent-hex)" }}
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          className="md:hidden border-b"
          style={{ background: "var(--bs-surface)", borderColor: "var(--bs-border-subtle)" }}
        >
          <div className="px-4 py-5 flex flex-col gap-4">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMenuOpen(false)}
                className="text-base font-bold flex items-center gap-2"
                style={{
                  color: location.pathname === link.to
                    ? "var(--bs-accent-hex)"
                    : "var(--bs-text-muted)",
                }}
              >
                {"icon" in link && link.icon && <link.icon className="w-4 h-4" />}
                {link.label}
              </Link>
            ))}
            {isAdmin && (
              <Link
                to="/admin"
                onClick={() => setMenuOpen(false)}
                className="font-bold flex items-center gap-2"
                style={{ color: "var(--bs-secondary-hex, #f43f5e)" }}
              >
                <Shield className="w-4 h-4" /> ADMIN
              </Link>
            )}
            <div className="h-px" style={{ background: "var(--bs-border-subtle)" }} />
            {user ? (
              <>
                <Link
                  to="/profile"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 font-bold py-1 uppercase"
                  style={{ color: "var(--bs-text-muted)" }}
                >
                  <User className="w-4 h-4" style={{ color: "var(--bs-accent-hex)" }} />
                  {profile?.name?.split(" ")[0] || user.email?.split("@")[0]} — Profile
                </Link>
                <button
                  onClick={() => { signOut(); setMenuOpen(false); }}
                  className="text-left font-bold py-1 uppercase flex items-center gap-2"
                  style={{ color: "#ef4444" }}
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </>
            ) : (
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="font-bold"
                style={{ color: "var(--bs-accent-hex)" }}
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
