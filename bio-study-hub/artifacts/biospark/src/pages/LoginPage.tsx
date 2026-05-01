import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { Zap, Eye, EyeOff, AlertCircle } from "lucide-react";

export function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [cls, setCls] = useState("11");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const googleUser = params.get("googleUser");
    const googleError = params.get("googleError");

    if (googleError) {
      setError("Google sign-in failed. Please try again.");
      window.history.replaceState({}, "", window.location.pathname);
      return;
    }

    if (googleUser) {
      try {
        const decoded = JSON.parse(
          atob(googleUser.replace(/-/g, "+").replace(/_/g, "/"))
        ) as Record<string, unknown>;
        signInWithGoogle({
          id: (decoded["id"] || decoded["googleId"]) as string,
          email: decoded["email"] as string,
          name: decoded["name"] as string,
          avatar: decoded["avatar"] as string | undefined,
        });
        window.history.replaceState({}, "", window.location.pathname);
        navigate("/home", { replace: true });
      } catch {
        setError("Google sign-in failed. Please try again.");
        window.history.replaceState({}, "", window.location.pathname);
      }
    }
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) setError(error.message);
        else navigate("/home");
      } else {
        const { error } = await signUp(email, password, name, cls);
        if (error) setError(error.message);
        else navigate("/home");
      }
    } finally {
      setLoading(false);
    }
  }

  function handleGoogleSignIn() {
    window.location.href = "https://startup-85w8.onrender.com/auth/google";
  }

  const inputStyle = {
    background: "var(--bs-surface-2)",
    border: "1px solid var(--bs-border-subtle)",
    color: "var(--bs-text)",
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden px-4 font-['Space_Grotesk']"
      style={{ background: "transparent" }}
    >
      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 mb-6">
            <div
              className="w-10 h-10 flex items-center justify-center transform -skew-x-12"
              style={{ background: "var(--bs-accent-hex)" }}
            >
              <Zap className="w-5 h-5 text-black transform skew-x-12" />
            </div>
            <span className="text-2xl font-black tracking-tighter" style={{ color: "var(--bs-text)" }}>
              BIO<span style={{ color: "var(--bs-accent-hex)" }}>SPARK</span>
            </span>
          </Link>
          <h1 className="text-4xl font-black uppercase tracking-tighter" style={{ color: "var(--bs-text)" }}>
            {isLogin ? "Welcome Back" : "Create Account"}
          </h1>
          <p className="mt-2 font-mono uppercase tracking-wide text-xs" style={{ color: "var(--bs-text-muted)" }}>
            {isLogin ? "Sign in to continue your NEET journey" : "Start your NEET preparation today"}
          </p>
        </div>

        <div
          className="border p-8"
          style={{ background: "var(--bs-surface)", borderColor: "var(--bs-border-subtle)" }}
        >
          <div
            className="flex border p-1 mb-6"
            style={{ background: "var(--bs-surface-2)", borderColor: "var(--bs-border-subtle)" }}
          >
            <button
              onClick={() => { setIsLogin(true); setError(""); }}
              className="flex-1 py-2 text-sm font-black uppercase tracking-widest transition-all"
              style={isLogin
                ? { background: "var(--bs-accent-hex)", color: "black" }
                : { color: "var(--bs-text-muted)" }
              }
            >
              Sign In
            </button>
            <button
              onClick={() => { setIsLogin(false); setError(""); }}
              className="flex-1 py-2 text-sm font-black uppercase tracking-widest transition-all"
              style={!isLogin
                ? { background: "var(--bs-accent-hex)", color: "black" }
                : { color: "var(--bs-text-muted)" }
              }
            >
              Sign Up
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <p className="text-red-400 text-sm font-mono">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-xs mb-1.5 font-black uppercase tracking-widest" style={{ color: "var(--bs-text-muted)" }}>Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="John Doe"
                  className="w-full px-4 py-3 focus:outline-none transition-all font-mono text-sm"
                  style={{ ...inputStyle, caretColor: "var(--bs-accent-hex)" }}
                />
              </div>
            )}

            <div>
              <label className="block text-xs mb-1.5 font-black uppercase tracking-widest" style={{ color: "var(--bs-text-muted)" }}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full px-4 py-3 focus:outline-none transition-all font-mono text-sm"
                style={{ ...inputStyle, caretColor: "var(--bs-accent-hex)" }}
              />
            </div>

            <div>
              <label className="block text-xs mb-1.5 font-black uppercase tracking-widest" style={{ color: "var(--bs-text-muted)" }}>Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pr-12 focus:outline-none transition-all font-mono text-sm"
                  style={{ ...inputStyle, caretColor: "var(--bs-accent-hex)" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: "var(--bs-text-muted)" }}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {!isLogin && (
                <p className="text-xs mt-1 font-mono" style={{ color: "var(--bs-text-muted)" }}>
                  Min. 6 characters
                </p>
              )}
            </div>

            {!isLogin && (
              <div>
                <label className="block text-xs mb-1.5 font-black uppercase tracking-widest" style={{ color: "var(--bs-text-muted)" }}>Class</label>
                <select
                  value={cls}
                  onChange={(e) => setCls(e.target.value)}
                  className="w-full px-4 py-3 focus:outline-none transition-all appearance-none font-mono text-sm"
                  style={inputStyle}
                >
                  <option value="11">Class 11</option>
                  <option value="12">Class 12</option>
                </select>
              </div>
            )}

            <div className="relative group mt-2">
              <div
                className="absolute inset-0 transform -skew-x-12 translate-x-1.5 translate-y-1.5 opacity-30 group-hover:translate-x-2 group-hover:translate-y-2 transition-transform"
                style={{ background: "var(--bs-accent-hex)" }}
              />
              <button
                type="submit"
                disabled={loading}
                className="relative w-full py-3 font-black uppercase tracking-widest transition-colors disabled:opacity-50 disabled:cursor-not-allowed transform -skew-x-12"
                style={{ background: "var(--bs-accent-hex)", color: "black" }}
              >
                <span className="transform skew-x-12 inline-block">
                  {loading ? "Please wait..." : isLogin ? "Sign In" : "Create Account"}
                </span>
              </button>
            </div>
          </form>

          <div className="mt-4 flex items-center gap-3">
            <div className="flex-1 h-px" style={{ background: "var(--bs-border-subtle)" }} />
            <span className="text-xs font-mono uppercase tracking-widest" style={{ color: "var(--bs-text-muted)" }}>or</span>
            <div className="flex-1 h-px" style={{ background: "var(--bs-border-subtle)" }} />
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="mt-4 w-full flex items-center justify-center gap-3 py-3 border font-black uppercase tracking-widest text-sm transition-all hover:border-white/30"
            style={{
              background: "var(--bs-surface-2)",
              borderColor: "var(--bs-border-subtle)",
              color: "var(--bs-text)",
            }}
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>
        </div>
      </div>
    </div>
  );
}
