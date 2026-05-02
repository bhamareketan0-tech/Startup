import { useState } from "react";
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
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

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

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ position: "relative", zIndex: 10 }}
    >
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 mb-6">
            <div
              className="w-10 h-10 flex items-center justify-center rounded"
              style={{ background: "var(--bs-accent-hex, #00D97E)" }}
            >
              <Zap className="w-5 h-5 text-black" />
            </div>
            <span className="text-2xl font-black" style={{ color: "#f0fdf4" }}>
              BIO<span style={{ color: "var(--bs-accent-hex, #00D97E)" }}>SPARK</span>
            </span>
          </Link>
          <h1 className="text-4xl font-black uppercase" style={{ color: "#f0fdf4" }}>
            {isLogin ? "Welcome Back" : "Create Account"}
          </h1>
        </div>

        {/* Card */}
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
          {/* Sign In / Sign Up Toggle */}
          <div
            className="flex rounded p-1 mb-6"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(0,217,126,0.15)" }}
          >
            <button
              onClick={() => { setIsLogin(true); setError(""); }}
              className="flex-1 py-2 text-sm font-black uppercase rounded transition-all"
              style={isLogin
                ? { background: "var(--bs-accent-hex, #00D97E)", color: "#000" }
                : { color: "rgba(240,253,244,0.5)" }
              }
            >
              Sign In
            </button>
            <button
              onClick={() => { setIsLogin(false); setError(""); }}
              className="flex-1 py-2 text-sm font-black uppercase rounded transition-all"
              style={!isLogin
                ? { background: "var(--bs-accent-hex, #00D97E)", color: "#000" }
                : { color: "rgba(240,253,244,0.5)" }
              }
            >
              Sign Up
            </button>
          </div>

          {/* Error */}
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
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="John Doe"
                  autoComplete="name"
                  className="w-full px-4 py-3 rounded focus:outline-none"
                  style={{
                    background: "rgba(255,255,255,0.07)",
                    border: "1px solid rgba(0,217,126,0.2)",
                    color: "#f0fdf4",
                  }}
                />
              </div>
            )}

            <div>
              <label className="block text-xs mb-1 font-black uppercase" style={{ color: "rgba(240,253,244,0.6)" }}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                autoComplete="email"
                className="w-full px-4 py-3 rounded focus:outline-none"
                style={{
                  background: "rgba(255,255,255,0.07)",
                  border: "1px solid rgba(0,217,126,0.2)",
                  color: "#f0fdf4",
                }}
              />
            </div>

            <div>
              <label className="block text-xs mb-1 font-black uppercase" style={{ color: "rgba(240,253,244,0.6)" }}>Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  className="w-full px-4 py-3 pr-12 rounded focus:outline-none"
                  style={{
                    background: "rgba(255,255,255,0.07)",
                    border: "1px solid rgba(0,217,126,0.2)",
                    color: "#f0fdf4",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                  style={{ color: "rgba(240,253,244,0.5)" }}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div>
                <label className="block text-xs mb-1 font-black uppercase" style={{ color: "rgba(240,253,244,0.6)" }}>Class</label>
                <select
                  value={cls}
                  onChange={(e) => setCls(e.target.value)}
                  className="w-full px-4 py-3 rounded focus:outline-none"
                  style={{
                    background: "rgba(255,255,255,0.07)",
                    border: "1px solid rgba(0,217,126,0.2)",
                    color: "#f0fdf4",
                  }}
                >
                  <option value="11" style={{ background: "#071009" }}>Class 11</option>
                  <option value="12" style={{ background: "#071009" }}>Class 12</option>
                </select>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 font-black uppercase rounded transition-all disabled:opacity-50"
              style={{ background: "var(--bs-accent-hex, #00D97E)", color: "#000" }}
            >
              {loading ? "Please wait..." : isLogin ? "Sign In" : "Create Account"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
