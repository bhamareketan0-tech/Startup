import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { Zap, Eye, EyeOff, AlertCircle } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL ?? "";

function GoogleButton({ onError }: { onError: (msg: string) => void }) {
  const handleClick = () => {
    window.location.href = `${API_URL}/auth/google`;
  };

  return (
    <>
      <div className="mt-4 flex items-center gap-3">
        <div className="flex-1 h-px" style={{ background: "rgba(0,217,126,0.2)" }} />
        <span className="text-xs uppercase font-bold" style={{ color: "rgba(240,253,244,0.4)" }}>or</span>
        <div className="flex-1 h-px" style={{ background: "rgba(0,217,126,0.2)" }} />
      </div>
      <button
        type="button"
        onClick={handleClick}
        className="mt-3 w-full flex items-center justify-center gap-3 py-3 rounded font-black uppercase text-sm transition-all"
        style={{
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(0,217,126,0.2)",
          color: "#f0fdf4",
        }}
        onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
        onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}
      >
        <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" xmlns="http://www.w3.org/2000/svg">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        Continue with Google
      </button>
    </>
  );
}

export function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [cls, setCls] = useState("11");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const err = searchParams.get("error");
    const googleError = searchParams.get("googleError");
    if (err === "google_failed" || googleError === "1") {
      setError("Google sign-in failed. Please try again or use email and password.");
    }
  }, [searchParams]);

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

  const inputStyle = {
    background: "rgba(255,255,255,0.07)",
    border: "1px solid rgba(0,217,126,0.2)",
    color: "#f0fdf4",
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ position: "relative", zIndex: 10 }}
    >
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 mb-6">
            <div className="w-10 h-10 flex items-center justify-center rounded" style={{ background: "#00D97E" }}>
              <Zap className="w-5 h-5 text-black" />
            </div>
            <span className="text-2xl font-black" style={{ color: "#f0fdf4" }}>
              BIO<span style={{ color: "#00D97E" }}>SPARK</span>
            </span>
          </Link>
          <h1 className="text-4xl font-black uppercase" style={{ color: "#f0fdf4" }}>
            {isLogin ? "Welcome Back" : "Create Account"}
          </h1>
        </div>

        <div
          className="rounded-lg p-8"
          style={{
            background: "rgba(7, 16, 9, 0.92)",
            border: "1px solid rgba(0, 217, 126, 0.3)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            boxShadow: "0 0 40px rgba(0, 217, 126, 0.08), 0 20px 60px rgba(0,0,0,0.6)",
          }}
        >
          <div
            className="flex rounded p-1 mb-6"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(0,217,126,0.15)" }}
          >
            <button
              onClick={() => { setIsLogin(true); setError(""); }}
              className="flex-1 py-2 text-sm font-black uppercase rounded transition-all"
              style={isLogin ? { background: "#00D97E", color: "#000" } : { color: "rgba(240,253,244,0.5)" }}
            >
              Sign In
            </button>
            <button
              onClick={() => { setIsLogin(false); setError(""); }}
              className="flex-1 py-2 text-sm font-black uppercase rounded transition-all"
              style={!isLogin ? { background: "#00D97E", color: "#000" } : { color: "rgba(240,253,244,0.5)" }}
            >
              Sign Up
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded flex items-center gap-2" style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)" }}>
              <AlertCircle className="w-4 h-4 shrink-0" style={{ color: "#f87171" }} />
              <p className="text-sm" style={{ color: "#f87171" }}>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-xs mb-1 font-black uppercase" style={{ color: "rgba(240,253,244,0.6)" }}>Full Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="John Doe" autoComplete="name" className="w-full px-4 py-3 rounded focus:outline-none" style={inputStyle} />
              </div>
            )}
            <div>
              <label className="block text-xs mb-1 font-black uppercase" style={{ color: "rgba(240,253,244,0.6)" }}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com" autoComplete="email" className="w-full px-4 py-3 rounded focus:outline-none" style={inputStyle} />
            </div>
            <div>
              <label className="block text-xs mb-1 font-black uppercase" style={{ color: "rgba(240,253,244,0.6)" }}>Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  className="w-full px-4 py-3 pr-12 rounded focus:outline-none"
                  style={inputStyle}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2" style={{ color: "rgba(240,253,244,0.5)" }}>
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            {!isLogin && (
              <div>
                <label className="block text-xs mb-1 font-black uppercase" style={{ color: "rgba(240,253,244,0.6)" }}>Class</label>
                <select value={cls} onChange={e => setCls(e.target.value)} className="w-full px-4 py-3 rounded focus:outline-none" style={inputStyle}>
                  <option value="11" style={{ background: "#071009" }}>Class 11</option>
                  <option value="12" style={{ background: "#071009" }}>Class 12</option>
                </select>
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 font-black uppercase rounded transition-all disabled:opacity-50"
              style={{ background: "#00D97E", color: "#000" }}
            >
              {loading ? "Please wait..." : isLogin ? "Sign In" : "Create Account"}
            </button>
          </form>

          <GoogleButton onError={setError} />
        </div>
      </div>
    </div>
  );
}
