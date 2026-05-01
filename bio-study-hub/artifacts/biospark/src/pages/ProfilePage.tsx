import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import {
  User,
  Mail,
  GraduationCap,
  Star,
  Calendar,
  LogOut,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Pencil,
  Save,
} from "lucide-react";

export function ProfilePage() {
  const { user, profile, signOut, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(profile?.name || "");
  const [cls, setCls] = useState(profile?.class || "11");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const initials = (profile?.name || user?.email || "?")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const joined = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
    : "—";

  const planLabel = profile?.plan === "pro" ? "PRO PASS" : "FREE";
  const planColor = profile?.plan === "pro" ? "var(--bs-secondary-hex)" : "var(--bs-text-muted)";

  async function handleSave() {
    if (!name.trim()) { setError("Name cannot be empty."); return; }
    setSaving(true);
    setError("");
    try {
      await api.put("/auth/profile", { name: name.trim(), class: cls });
      await refreshProfile();
      setSaved(true);
      setEditing(false);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      setError("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    setName(profile?.name || "");
    setCls(profile?.class || "11");
    setEditing(false);
    setError("");
  }

  return (
    <div className="min-h-screen pt-20 font-['Space_Grotesk']" style={{ background: "transparent" }}>
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(var(--bs-grid-color) 1px, transparent 1px), linear-gradient(90deg, var(--bs-grid-color) 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative z-10 max-w-xl mx-auto px-4 py-8">

        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest mb-8 transition-colors"
          style={{ color: "var(--bs-text-muted)" }}
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        {/* Avatar + name */}
        <div className="flex items-center gap-5 mb-8">
          <div
            className="w-20 h-20 flex items-center justify-center text-2xl font-black transform -skew-x-6 shrink-0 border-2"
            style={{ background: `color-mix(in srgb, var(--bs-accent-hex) 15%, var(--bs-surface))`, borderColor: "var(--bs-accent-hex)", color: "var(--bs-accent-hex)" }}
          >
            <span className="transform skew-x-6">
              {user?.avatar
                ? <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
                : initials}
            </span>
          </div>
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tighter" style={{ color: "var(--bs-text)" }}>
              {profile?.name || user?.email?.split("@")[0]}
            </h1>
            <p className="text-xs font-mono uppercase tracking-widest mt-0.5" style={{ color: planColor }}>
              {planLabel}
            </p>
          </div>
        </div>

        {/* Info cards */}
        <div className="space-y-3 mb-6">

          {/* Email */}
          <div
            className="flex items-center gap-4 px-5 py-4 border"
            style={{ background: "var(--bs-surface)", borderColor: "var(--bs-border-subtle)" }}
          >
            <Mail className="w-4 h-4 shrink-0" style={{ color: "var(--bs-accent-hex)" }} />
            <div className="min-w-0">
              <p className="text-[10px] font-mono uppercase tracking-widest mb-0.5" style={{ color: "var(--bs-text-muted)" }}>Email</p>
              <p className="text-sm font-bold truncate" style={{ color: "var(--bs-text)" }}>{user?.email}</p>
            </div>
          </div>

          {/* Name — editable */}
          <div
            className="flex items-center gap-4 px-5 py-4 border"
            style={{ background: "var(--bs-surface)", borderColor: editing ? "var(--bs-accent-hex)" : "var(--bs-border-subtle)" }}
          >
            <User className="w-4 h-4 shrink-0" style={{ color: "var(--bs-accent-hex)" }} />
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-mono uppercase tracking-widest mb-0.5" style={{ color: "var(--bs-text-muted)" }}>Name</p>
              {editing ? (
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-sm font-bold bg-transparent outline-none"
                  style={{ color: "var(--bs-text)" }}
                  autoFocus
                />
              ) : (
                <p className="text-sm font-bold truncate" style={{ color: "var(--bs-text)" }}>{profile?.name || "—"}</p>
              )}
            </div>
          </div>

          {/* Class — editable */}
          <div
            className="flex items-center gap-4 px-5 py-4 border"
            style={{ background: "var(--bs-surface)", borderColor: editing ? "var(--bs-accent-hex)" : "var(--bs-border-subtle)" }}
          >
            <GraduationCap className="w-4 h-4 shrink-0" style={{ color: "var(--bs-accent-hex)" }} />
            <div className="flex-1">
              <p className="text-[10px] font-mono uppercase tracking-widest mb-0.5" style={{ color: "var(--bs-text-muted)" }}>Class (NEET)</p>
              {editing ? (
                <div className="flex gap-3 mt-1">
                  {["11", "12"].map((c) => (
                    <button
                      key={c}
                      onClick={() => setCls(c)}
                      className="px-5 py-1.5 text-xs font-black uppercase tracking-widest border transition-all"
                      style={cls === c
                        ? { background: "var(--bs-accent-hex)", color: "black", borderColor: "var(--bs-accent-hex)" }
                        : { background: "transparent", color: "var(--bs-text-muted)", borderColor: "var(--bs-border-strong)" }}
                    >
                      Class {c}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-sm font-bold" style={{ color: "var(--bs-text)" }}>Class {profile?.class || "11"}</p>
              )}
            </div>
          </div>

          {/* Score */}
          <div
            className="flex items-center gap-4 px-5 py-4 border"
            style={{ background: "var(--bs-surface)", borderColor: "var(--bs-border-subtle)" }}
          >
            <Star className="w-4 h-4 shrink-0" style={{ color: "var(--bs-accent-hex)" }} />
            <div>
              <p className="text-[10px] font-mono uppercase tracking-widest mb-0.5" style={{ color: "var(--bs-text-muted)" }}>Total Score</p>
              <p className="text-sm font-black" style={{ color: "var(--bs-accent-hex)" }}>{profile?.score ?? 0} pts</p>
            </div>
          </div>

          {/* Joined */}
          <div
            className="flex items-center gap-4 px-5 py-4 border"
            style={{ background: "var(--bs-surface)", borderColor: "var(--bs-border-subtle)" }}
          >
            <Calendar className="w-4 h-4 shrink-0" style={{ color: "var(--bs-accent-hex)" }} />
            <div>
              <p className="text-[10px] font-mono uppercase tracking-widest mb-0.5" style={{ color: "var(--bs-text-muted)" }}>Member Since</p>
              <p className="text-sm font-bold" style={{ color: "var(--bs-text)" }}>{joined}</p>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 px-4 py-3 mb-4 border" style={{ background: "rgba(239,68,68,0.08)", borderColor: "rgba(239,68,68,0.25)", color: "#ef4444" }}>
            <AlertCircle className="w-4 h-4 shrink-0" />
            <p className="text-xs font-mono">{error}</p>
          </div>
        )}

        {/* Saved toast */}
        {saved && (
          <div className="flex items-center gap-2 px-4 py-3 mb-4 border" style={{ background: `color-mix(in srgb, var(--bs-accent-hex) 8%, transparent)`, borderColor: `color-mix(in srgb, var(--bs-accent-hex) 25%, transparent)`, color: "var(--bs-accent-hex)" }}>
            <CheckCircle className="w-4 h-4 shrink-0" />
            <p className="text-xs font-mono uppercase tracking-widest">Profile updated!</p>
          </div>
        )}

        {/* Action buttons */}
        {!editing ? (
          <div className="flex gap-3">
            <div className="relative group flex-1">
              <div className="absolute inset-0 transform -skew-x-12 translate-x-1 translate-y-1 opacity-30 group-hover:translate-x-1.5 group-hover:translate-y-1.5 transition-transform" style={{ background: "var(--bs-accent-hex)" }} />
              <button
                onClick={() => setEditing(true)}
                className="relative w-full flex items-center justify-center gap-2 py-3 font-black uppercase tracking-widest text-sm transform -skew-x-12"
                style={{ background: "var(--bs-accent-hex)", color: "black" }}
              >
                <span className="transform skew-x-12 inline-flex items-center gap-2">
                  <Pencil className="w-4 h-4" /> Edit Profile
                </span>
              </button>
            </div>

            <button
              onClick={async () => { await signOut(); navigate("/login"); }}
              className="flex items-center gap-2 px-5 py-3 border text-sm font-black uppercase tracking-widest transition-colors"
              style={{ borderColor: "var(--bs-border-strong)", color: "var(--bs-text-muted)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#ef4444")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--bs-text-muted)")}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex gap-3">
            <div className="relative group flex-1">
              <div className="absolute inset-0 transform -skew-x-12 translate-x-1 translate-y-1 opacity-30 group-hover:translate-x-1.5 group-hover:translate-y-1.5 transition-transform" style={{ background: "var(--bs-accent-hex)" }} />
              <button
                onClick={handleSave}
                disabled={saving}
                className="relative w-full flex items-center justify-center gap-2 py-3 font-black uppercase tracking-widest text-sm transform -skew-x-12 disabled:opacity-60"
                style={{ background: "var(--bs-accent-hex)", color: "black" }}
              >
                <span className="transform skew-x-12 inline-flex items-center gap-2">
                  {saving ? "Saving..." : <><Save className="w-4 h-4" /> Save Changes</>}
                </span>
              </button>
            </div>

            <button
              onClick={handleCancel}
              className="px-5 py-3 border text-sm font-black uppercase tracking-widest transition-colors"
              style={{ borderColor: "var(--bs-border-strong)", color: "var(--bs-text-muted)" }}
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
