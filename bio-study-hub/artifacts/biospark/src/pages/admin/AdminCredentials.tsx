import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import {
  Key, Eye, EyeOff, Save, RefreshCw, Check, AlertCircle, Shield, Info, ExternalLink,
} from "lucide-react";

interface CredDef {
  key: string;
  label: string;
  placeholder: string;
  desc: string;
  secret: boolean;
  required: boolean;
  helpUrl?: string;
  helpLabel?: string;
}

const CREDENTIALS: CredDef[] = [
  {
    key: "cred_gemini_api_key",
    label: "Gemini API Key",
    placeholder: "AIza...",
    desc: "Used for AI question extraction and the /format endpoint. If set here, overrides the env var fallback.",
    secret: true,
    required: true,
    helpUrl: "https://aistudio.google.com/apikey",
    helpLabel: "Get from Google AI Studio",
  },
  {
    key: "cred_session_secret",
    label: "Session Secret",
    placeholder: "Any long random string — minimum 32 characters",
    desc: "Signs session cookies to prevent tampering. Rotate this if your session secret is compromised.",
    secret: true,
    required: true,
  },
  {
    key: "cred_google_client_id",
    label: "Google OAuth Client ID",
    placeholder: "115xxxxx.apps.googleusercontent.com",
    desc: "Required only if you use Google Sign-In. From Google Cloud Console → OAuth 2.0 Client IDs.",
    secret: false,
    required: false,
    helpUrl: "https://console.cloud.google.com/apis/credentials",
    helpLabel: "Google Cloud Console",
  },
  {
    key: "cred_google_client_secret",
    label: "Google OAuth Client Secret",
    placeholder: "GOCSPX-...",
    desc: "Secret from the same OAuth 2.0 client in Google Cloud Console. Required for Google Sign-In.",
    secret: true,
    required: false,
  },
  {
    key: "cred_google_callback_url",
    label: "Google OAuth Callback URL",
    placeholder: "https://startup-85w8.onrender.com/auth/google/callback",
    desc: "Must match the Authorized Redirect URI set in Google Cloud Console exactly.",
    secret: false,
    required: false,
  },
  {
    key: "cred_google_success_redirect",
    label: "Google Login Success Redirect",
    placeholder: "https://yourusername.github.io/Startup/login",
    desc: "Where users land after a successful Google login. Your GitHub Pages frontend /login page.",
    secret: false,
    required: false,
  },
  {
    key: "cred_allowed_origins",
    label: "Allowed CORS Origins",
    placeholder: "https://yourusername.github.io,https://www.biospark.in",
    desc: "Comma-separated list of frontend URLs the API will accept requests from. Leave blank to allow all origins (development mode).",
    secret: false,
    required: false,
  },
];

const inputCls =
  "w-full bg-[#060f1c] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#00ffb3]/50 font-mono transition-colors";
const labelCls = "block text-sm text-white font-medium mb-1";

function SecretField({
  value, onChange, placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={inputCls + " pr-10"}
        autoComplete="new-password"
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors"
        title={show ? "Hide" : "Show"}
      >
        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );
}

export function AdminCredentials() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved" | "error">("idle");
  const [dbError, setDbError] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const keys = CREDENTIALS.map((c) => c.key).join(",");
      const res = (await api.get(`/settings?keys=${keys}`)) as Record<string, string>;
      const loaded: Record<string, string> = {};
      for (const cred of CREDENTIALS) {
        loaded[cred.key] = String(res[cred.key] ?? "");
      }
      setValues(loaded);
      setDbError(false);
    } catch {
      setDbError(true);
    } finally {
      setLoading(false);
    }
  }

  async function save() {
    setSaving(true);
    setSaveStatus("idle");
    try {
      await api.put("/settings", values);
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch {
      setSaveStatus("error");
    } finally {
      setSaving(false);
    }
  }

  const set = (key: string, val: string) =>
    setValues((v) => ({ ...v, [key]: val }));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-[#00ffb3] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Credentials & API Keys</h1>
          <p className="text-white/40 text-sm mt-1">
            All sensitive credentials stored in MongoDB — update here if any key is leaked or rotated
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={load}
            className="flex items-center gap-2 px-3 py-2 border border-white/10 rounded-xl text-white/50 text-sm hover:text-white hover:bg-white/5 transition-all"
          >
            <RefreshCw className="w-4 h-4" /> Reload
          </button>
          <button
            onClick={save}
            disabled={saving}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm transition-all disabled:opacity-60 ${
              saveStatus === "saved"
                ? "bg-[#00ffb3]/20 text-[#00ffb3] border border-[#00ffb3]/30"
                : saveStatus === "error"
                ? "bg-red-500/20 text-red-400 border border-red-500/30"
                : "bg-gradient-to-r from-[#00ffb3] to-[#00d4ff] text-black hover:opacity-90"
            }`}
          >
            {saveStatus === "saved" ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {saving
              ? "Saving…"
              : saveStatus === "saved"
              ? "Saved!"
              : saveStatus === "error"
              ? "Save failed"
              : "Save All"}
          </button>
        </div>
      </div>

      {dbError && (
        <div className="flex items-center gap-3 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <p className="text-red-300 text-sm">
            Could not load credentials from MongoDB. Ensure the database is connected.
          </p>
        </div>
      )}

      {/* How it works banner */}
      <div className="flex items-start gap-3 px-5 py-4 bg-[#00ffb3]/5 border border-[#00ffb3]/15 rounded-2xl">
        <Info className="w-4 h-4 text-[#00ffb3] mt-0.5 shrink-0" />
        <div className="text-xs text-white/50 leading-relaxed space-y-1">
          <p>
            <span className="text-white font-semibold">How this works:</span> Credentials saved here are stored in
            MongoDB and the backend uses them as live overrides. Environment variables (Replit Secrets / Render env
            vars) always take priority, but if an env var is missing the server reads from here.
          </p>
          <p className="text-yellow-400">
            MONGODB_URI cannot be stored here (it IS the database). Update it directly in Replit Secrets or Render
            environment variables.
          </p>
        </div>
      </div>

      {/* Credential fields */}
      <div className="bg-[#0d1b2a] border border-white/10 rounded-2xl p-6 space-y-5">
        <div className="flex items-center gap-2 pb-2 border-b border-white/8">
          <Key className="w-4 h-4 text-[#a855f7]" />
          <h3 className="text-white font-semibold">API Keys & Secrets</h3>
        </div>

        {CREDENTIALS.map((cred) => (
          <div key={cred.key} className="space-y-2 pb-5 border-b border-white/5 last:border-0 last:pb-0">
            <div className="flex items-center gap-2 flex-wrap">
              <label className={labelCls}>{cred.label}</label>
              {cred.required ? (
                <span className="text-[10px] px-1.5 py-0.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded font-mono">
                  REQUIRED
                </span>
              ) : (
                <span className="text-[10px] px-1.5 py-0.5 bg-white/5 text-white/30 border border-white/10 rounded font-mono">
                  OPTIONAL
                </span>
              )}
              {cred.helpUrl && (
                <a
                  href={cred.helpUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-auto flex items-center gap-1 text-[10px] text-[#00ffb3]/70 hover:text-[#00ffb3] transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                  {cred.helpLabel ?? cred.helpUrl}
                </a>
              )}
            </div>
            {cred.secret ? (
              <SecretField
                value={values[cred.key] ?? ""}
                onChange={(v) => set(cred.key, v)}
                placeholder={cred.placeholder}
              />
            ) : (
              <input
                type="text"
                value={values[cred.key] ?? ""}
                onChange={(e) => set(cred.key, e.target.value)}
                placeholder={cred.placeholder}
                className={inputCls}
              />
            )}
            <p className="text-white/30 text-xs leading-relaxed">{cred.desc}</p>
          </div>
        ))}
      </div>

      {/* MONGODB_URI read-only note */}
      <div className="bg-[#0d1b2a] border border-white/10 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-4 h-4 text-[#f59e0b]" />
          <h3 className="text-white font-semibold">MongoDB URI</h3>
          <span className="text-[10px] px-1.5 py-0.5 bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 rounded font-mono">
            MANAGED SEPARATELY
          </span>
        </div>
        <div className="bg-[#060f1c] border border-white/8 rounded-xl p-4 space-y-3">
          <p className="text-white/50 text-sm leading-relaxed">
            The MongoDB connection string{" "}
            <span className="font-mono text-white/70">MONGODB_URI</span> cannot be stored inside MongoDB itself.
            To rotate or update it, change it directly in:
          </p>
          <ul className="space-y-2">
            <li className="flex items-center gap-2 text-sm text-white/40">
              <div className="w-1.5 h-1.5 rounded-full bg-[#00ffb3] shrink-0" />
              <span className="text-white/60 font-medium">Replit:</span>
              Secrets tab → MONGODB_URI
            </li>
            <li className="flex items-center gap-2 text-sm text-white/40">
              <div className="w-1.5 h-1.5 rounded-full bg-[#00ffb3] shrink-0" />
              <span className="text-white/60 font-medium">Render:</span>
              Environment tab → MONGODB_URI
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
