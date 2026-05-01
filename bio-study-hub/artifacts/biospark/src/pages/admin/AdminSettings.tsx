import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Settings, Palette, Bell, Check, Save, Key, Globe, RefreshCw, Eye, EyeOff, AlertCircle } from "lucide-react";

const inputCls = "w-full bg-[#111e30] border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-[#00ffb3]/50 font-mono";
const labelCls = "block text-xs text-white/50 mb-1 font-medium";

interface AppSettings {
  site_name: string;
  contact_email: string;
  maintenance_mode: boolean;
  accent_color: string;
  primary_color: string;
  secondary_color: string;
  vite_api_url: string;
  google_client_id: string;
  session_secret: string;
  allowed_origins: string;
}

const DEFAULTS: AppSettings = {
  site_name: "BioSpark",
  contact_email: "bhamareketan18@gmail.com",
  maintenance_mode: false,
  accent_color: "#00ffb3",
  primary_color: "#a855f7",
  secondary_color: "#00d4ff",
  vite_api_url: "",
  google_client_id: "",
  session_secret: "",
  allowed_origins: "",
};

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div
      className={`w-12 h-6 rounded-full transition-colors cursor-pointer shrink-0 ${value ? "bg-[#00ffb3]" : "bg-white/10"}`}
      onClick={() => onChange(!value)}
    >
      <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform mt-0.5 ${value ? "translate-x-6 ml-1" : "ml-0.5"}`} />
    </div>
  );
}

function SecretInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={inputCls + " pr-10"}
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors"
      >
        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );
}

export function AdminSettings() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved" | "error">("idle");
  const [dbError, setDbError] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    setLoading(true);
    try {
      const res = await api.get("/settings") as Record<string, unknown>;
      setSettings({ ...DEFAULTS, ...(res as Partial<AppSettings>) });
      setDbError(false);
    } catch {
      const stored = localStorage.getItem("biospark_admin_settings");
      if (stored) {
        try { setSettings({ ...DEFAULTS, ...JSON.parse(stored) }); } catch {}
      }
      setDbError(true);
    } finally {
      setLoading(false);
    }
  }

  async function saveSettings() {
    setSaving(true);
    setSaveStatus("idle");
    try {
      await api.put("/settings", settings);
      localStorage.setItem("biospark_admin_settings", JSON.stringify(settings));
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch {
      localStorage.setItem("biospark_admin_settings", JSON.stringify(settings));
      setSaveStatus("error");
    } finally {
      setSaving(false);
    }
  }

  const set = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) =>
    setSettings((s) => ({ ...s, [key]: value }));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-[#00ffb3] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Settings</h1>
          <p className="text-white/40 text-sm mt-1">App configuration, API keys, and appearance — saved to MongoDB</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={loadSettings} className="flex items-center gap-2 px-3 py-2 border border-white/10 rounded-xl text-white/50 text-sm hover:text-white hover:bg-white/5 transition-all">
            <RefreshCw className="w-4 h-4" /> Reload
          </button>
          <button
            onClick={saveSettings}
            disabled={saving}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm transition-all disabled:opacity-60 ${
              saveStatus === "saved" ? "bg-[#00ffb3]/20 text-[#00ffb3] border border-[#00ffb3]/30"
              : saveStatus === "error" ? "bg-red-500/20 text-red-400 border border-red-500/30"
              : "bg-gradient-to-r from-[#00ffb3] to-[#00d4ff] text-black hover:opacity-90"
            }`}
          >
            {saveStatus === "saved" ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {saving ? "Saving..." : saveStatus === "saved" ? "Saved!" : saveStatus === "error" ? "Save failed" : "Save Settings"}
          </button>
        </div>
      </div>

      {dbError && (
        <div className="flex items-center gap-3 px-4 py-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
          <AlertCircle className="w-4 h-4 text-yellow-400 shrink-0" />
          <p className="text-yellow-400 text-sm">MongoDB not connected — settings loaded from local cache. Connect your DB to persist settings across deployments.</p>
        </div>
      )}

      {/* General */}
      <div className="bg-[#0d1b2a] border border-white/10 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <Settings className="w-4 h-4 text-[#00d4ff]" />
          <h3 className="text-white font-semibold">General</h3>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Site Name</label>
            <input value={settings.site_name} onChange={(e) => set("site_name", e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Contact Email</label>
            <input value={settings.contact_email} onChange={(e) => set("contact_email", e.target.value)} type="email" className={inputCls} />
          </div>
        </div>
        <div className="flex items-center justify-between py-3 border border-white/8 rounded-xl px-4">
          <div>
            <p className="text-white text-sm font-medium">Maintenance Mode</p>
            <p className="text-white/30 text-xs">Disables student access to the platform</p>
          </div>
          <Toggle value={settings.maintenance_mode} onChange={(v) => set("maintenance_mode", v)} />
        </div>
      </div>

      {/* API & Connection URLs */}
      <div className="bg-[#0d1b2a] border border-white/10 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <Globe className="w-4 h-4 text-[#00ffb3]" />
          <h3 className="text-white font-semibold">Connection Settings</h3>
          <span className="text-xs text-white/30 ml-1">— For Netlify/Render deployment</span>
        </div>

        <div className="p-3 bg-[#00ffb3]/5 border border-[#00ffb3]/15 rounded-xl">
          <p className="text-[#00ffb3] text-xs font-bold mb-1">Deployment Instructions</p>
          <p className="text-white/50 text-xs leading-relaxed">
            After deploying backend to Render, set <span className="text-white font-mono">VITE_API_URL</span> to your Render URL in Netlify environment variables.<br />
            For CORS, set <span className="text-white font-mono">ALLOWED_ORIGINS</span> to your Netlify URL in Render environment variables.
          </p>
        </div>

        <div>
          <label className={labelCls}>Frontend API URL (VITE_API_URL)</label>
          <input
            value={settings.vite_api_url}
            onChange={(e) => set("vite_api_url", e.target.value)}
            placeholder="https://biospark-api.onrender.com"
            className={inputCls}
          />
          <p className="text-white/25 text-xs mt-1">Set this as VITE_API_URL in your Netlify environment variables</p>
        </div>

        <div>
          <label className={labelCls}>Allowed Origins (CORS) — comma separated</label>
          <input
            value={settings.allowed_origins}
            onChange={(e) => set("allowed_origins", e.target.value)}
            placeholder="https://biospark.netlify.app,https://www.biospark.in"
            className={inputCls}
          />
          <p className="text-white/25 text-xs mt-1">Set this as ALLOWED_ORIGINS in your Render environment variables</p>
        </div>
      </div>

      {/* API Keys */}
      <div className="bg-[#0d1b2a] border border-white/10 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <Key className="w-4 h-4 text-[#a855f7]" />
          <h3 className="text-white font-semibold">API Keys & Secrets</h3>
        </div>

        <div className="p-3 bg-yellow-500/5 border border-yellow-500/15 rounded-xl">
          <p className="text-yellow-400 text-xs">These values are stored in MongoDB. Set them as environment variables in Render for production — environment variables take priority.</p>
        </div>

        <div>
          <label className={labelCls}>Session Secret</label>
          <SecretInput
            value={settings.session_secret}
            onChange={(v) => set("session_secret", v)}
            placeholder="Any random string — min 32 characters"
          />
          <p className="text-white/25 text-xs mt-1">Also set as SESSION_SECRET in Render env vars</p>
        </div>

        <div>
          <label className={labelCls}>Google OAuth Client ID</label>
          <input
            value={settings.google_client_id}
            onChange={(e) => set("google_client_id", e.target.value)}
            placeholder="115xxxxx.apps.googleusercontent.com"
            className={inputCls}
          />
          <p className="text-white/25 text-xs mt-1">From Google Cloud Console → OAuth 2.0 Client IDs</p>
        </div>
      </div>

      {/* Appearance */}
      <div className="bg-[#0d1b2a] border border-white/10 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <Palette className="w-4 h-4 text-[#a855f7]" />
          <h3 className="text-white font-semibold">Appearance</h3>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {([
            { key: "accent_color" as const, label: "Accent Color" },
            { key: "primary_color" as const, label: "Primary Brand Color" },
            { key: "secondary_color" as const, label: "Secondary Brand Color" },
          ]).map(({ key, label }) => (
            <div key={key}>
              <label className={labelCls}>{label}</label>
              <div className="flex items-center gap-2">
                <input type="color" value={settings[key]} onChange={(e) => set(key, e.target.value)}
                  className="w-10 h-10 rounded-lg border border-white/20 cursor-pointer bg-transparent shrink-0" />
                <input value={settings[key]} onChange={(e) => set(key, e.target.value)}
                  className="flex-1 bg-[#111e30] border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-[#00ffb3]/50 font-mono text-xs" />
              </div>
            </div>
          ))}
        </div>
        <div className="p-4 bg-[#111e30] border border-white/10 rounded-xl">
          <p className="text-white/30 text-xs mb-3">Live Preview</p>
          <div className="flex gap-3 flex-wrap items-center">
            <button className="px-4 py-2 text-black text-sm font-semibold rounded-xl" style={{ backgroundColor: settings.accent_color }}>
              Primary Button
            </button>
            <button className="px-4 py-2 text-sm font-semibold rounded-xl border" style={{ borderColor: settings.primary_color, color: settings.primary_color }}>
              Outline Button
            </button>
            <div className="flex items-center gap-2 ml-2">
              <div className="w-7 h-7 rounded-full border border-white/10" style={{ backgroundColor: settings.accent_color }} title="Accent" />
              <div className="w-7 h-7 rounded-full border border-white/10" style={{ backgroundColor: settings.primary_color }} title="Primary" />
              <div className="w-7 h-7 rounded-full border border-white/10" style={{ backgroundColor: settings.secondary_color }} title="Secondary" />
            </div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-[#0d1b2a] border border-white/10 rounded-2xl p-6 space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <Bell className="w-4 h-4 text-[#f59e0b]" />
          <h3 className="text-white font-semibold">Notification Preferences</h3>
        </div>
        {([
          { key: "notify_new_user" as never, label: "New user registrations", desc: "Get notified when a new student signs up" },
        ]).map(({ key, label, desc }) => (
          <div key={key} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
            <div>
              <p className="text-white text-sm">{label}</p>
              <p className="text-white/30 text-xs">{desc}</p>
            </div>
            <Toggle value={!!settings[key as keyof AppSettings]} onChange={(v) => set(key as keyof AppSettings, v as never)} />
          </div>
        ))}
      </div>

      {/* Render Env Vars Checklist */}
      <div className="bg-[#0d1b2a] border border-white/10 rounded-2xl p-6">
        <h3 className="text-white font-semibold mb-4">Render Environment Variables Checklist</h3>
        <div className="space-y-2">
          {[
            { key: "MONGODB_URI", desc: "Your MongoDB Atlas connection string", required: true },
            { key: "SESSION_SECRET", desc: "Random secret string (min 32 chars)", required: true },
            { key: "ALLOWED_ORIGINS", desc: "Your Netlify frontend URL(s)", required: true },
            { key: "NODE_ENV", desc: "Set to: production", required: true },
            { key: "PORT", desc: "Set to: 8080 (Render uses this by default)", required: false },
            { key: "GOOGLE_CLIENT_ID", desc: "Google OAuth Client ID (if using Google login)", required: false },
            { key: "GOOGLE_CLIENT_SECRET", desc: "Google OAuth Client Secret (if using Google login)", required: false },
          ].map(({ key, desc, required }) => (
            <div key={key} className="flex items-start gap-3 py-2 border-b border-white/5 last:border-0">
              <div className={`px-2 py-0.5 rounded text-xs font-mono shrink-0 mt-0.5 ${required ? "bg-red-500/10 text-red-400 border border-red-500/20" : "bg-white/5 text-white/40 border border-white/10"}`}>
                {required ? "REQUIRED" : "OPTIONAL"}
              </div>
              <div>
                <p className="text-white text-sm font-mono">{key}</p>
                <p className="text-white/30 text-xs">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
