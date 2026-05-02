import { useState, useEffect } from "react";
import { ADMIN_EMAIL } from "@/lib/constants";
import { Settings, Palette, Bell, Check, Save } from "lucide-react";

interface AppSettings {
  site_name: string;
  contact_email: string;
  maintenance_mode: boolean;
  accent_color: string;
  primary_color: string;
  secondary_color: string;
  notify_new_user: boolean;
  notify_report: boolean;
  notify_payment: boolean;
}

const DEFAULT_SETTINGS: AppSettings = {
  site_name: "BioSpark",
  contact_email: ADMIN_EMAIL,
  maintenance_mode: false,
  accent_color: "#00FF9D",
  primary_color: "#00FF9D",
  secondary_color: "#00FF9D",
  notify_new_user: true,
  notify_report: true,
  notify_payment: false,
};

const STORAGE_KEY = "biospark_admin_settings";

export function AdminSettings() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try { setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(stored) }); } catch {}
    }
  }, []);

  function saveSettings() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const set = (key: keyof AppSettings, value: any) => setSettings((s) => ({ ...s, [key]: value }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-white/40 text-sm mt-1">Configure app-wide settings and appearance</p>
      </div>

      {/* General */}
      <div className="bg-[#0d1b2a] border border-white/10 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-5">
          <Settings className="w-4 h-4 text-[#00FF9D]" />
          <h3 className="text-white font-semibold">General</h3>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-white/50 mb-1">Site Name</label>
            <input value={settings.site_name} onChange={(e) => set("site_name", e.target.value)}
              className="w-full max-w-sm bg-[#111e30] border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-[#00FF9D]/50" />
          </div>
          <div>
            <label className="block text-xs text-white/50 mb-1">Contact Email</label>
            <input value={settings.contact_email} onChange={(e) => set("contact_email", e.target.value)}
              type="email"
              className="w-full max-w-sm bg-[#111e30] border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-[#00FF9D]/50" />
          </div>
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-6 rounded-full transition-colors cursor-pointer ${settings.maintenance_mode ? "bg-[#ff4444]" : "bg-white/10"}`}
              onClick={() => set("maintenance_mode", !settings.maintenance_mode)}
            >
              <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform mt-0.5 ${settings.maintenance_mode ? "translate-x-6 ml-1" : "ml-0.5"}`} />
            </div>
            <span className="text-white/70 text-sm">Maintenance Mode</span>
            {settings.maintenance_mode && <span className="px-2 py-0.5 bg-[#ff4444]/10 text-[#ff4444] rounded text-xs border border-[#ff4444]/20">ACTIVE</span>}
          </div>
        </div>
      </div>

      {/* Appearance */}
      <div className="bg-[#0d1b2a] border border-white/10 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-5">
          <Palette className="w-4 h-4 text-[#00FF9D]" />
          <h3 className="text-white font-semibold">Appearance</h3>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-white/50 mb-2">Accent Color</label>
            <div className="flex items-center gap-2">
              <input type="color" value={settings.accent_color} onChange={(e) => set("accent_color", e.target.value)}
                className="w-10 h-10 rounded-lg border border-white/20 cursor-pointer bg-transparent" />
              <input value={settings.accent_color} onChange={(e) => set("accent_color", e.target.value)}
                className="flex-1 bg-[#111e30] border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-[#00FF9D]/50 font-mono text-xs" />
            </div>
          </div>
          <div>
            <label className="block text-xs text-white/50 mb-2">Primary Brand Color</label>
            <div className="flex items-center gap-2">
              <input type="color" value={settings.primary_color} onChange={(e) => set("primary_color", e.target.value)}
                className="w-10 h-10 rounded-lg border border-white/20 cursor-pointer bg-transparent" />
              <input value={settings.primary_color} onChange={(e) => set("primary_color", e.target.value)}
                className="flex-1 bg-[#111e30] border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-[#00FF9D]/50 font-mono text-xs" />
            </div>
          </div>
          <div>
            <label className="block text-xs text-white/50 mb-2">Secondary Brand Color</label>
            <div className="flex items-center gap-2">
              <input type="color" value={settings.secondary_color} onChange={(e) => set("secondary_color", e.target.value)}
                className="w-10 h-10 rounded-lg border border-white/20 cursor-pointer bg-transparent" />
              <input value={settings.secondary_color} onChange={(e) => set("secondary_color", e.target.value)}
                className="flex-1 bg-[#111e30] border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-[#00FF9D]/50 font-mono text-xs" />
            </div>
          </div>
        </div>
        {/* Live Preview */}
        <div className="mt-5 p-4 bg-[#111e30] border border-white/10 rounded-xl">
          <p className="text-white/30 text-xs mb-3">Live Preview</p>
          <div className="flex gap-3 flex-wrap">
            <button className="px-4 py-2 text-black text-sm font-semibold rounded-xl" style={{ backgroundColor: settings.accent_color }}>
              Primary Button
            </button>
            <button className="px-4 py-2 text-white text-sm font-semibold rounded-xl border" style={{ borderColor: settings.primary_color, color: settings.primary_color }}>
              Outline Button
            </button>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full" style={{ backgroundColor: settings.accent_color }} />
              <div className="w-6 h-6 rounded-full" style={{ backgroundColor: settings.primary_color }} />
              <div className="w-6 h-6 rounded-full" style={{ backgroundColor: settings.secondary_color }} />
            </div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-[#0d1b2a] border border-white/10 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-5">
          <Bell className="w-4 h-4 text-[#00FF9D]" />
          <h3 className="text-white font-semibold">Notification Preferences</h3>
        </div>
        <div className="space-y-3">
          {[
            { key: "notify_new_user" as const, label: "New user registrations", desc: "Get notified when a new student signs up" },
            { key: "notify_report" as const, label: "Community reports", desc: "Alert when content is flagged by users" },
            { key: "notify_payment" as const, label: "Payment events", desc: "Notify on new subscriptions and renewals" },
          ].map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
              <div>
                <p className="text-white text-sm">{label}</p>
                <p className="text-white/30 text-xs">{desc}</p>
              </div>
              <div
                className={`w-12 h-6 rounded-full transition-colors cursor-pointer ${settings[key] ? "bg-[#00FF9D]" : "bg-white/10"}`}
                onClick={() => set(key, !settings[key])}
              >
                <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform mt-0.5 ${settings[key] ? "translate-x-6 ml-1" : "ml-0.5"}`} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <button onClick={saveSettings}
        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm transition-all ${saved ? "bg-[#00FF9D]/20 text-[#00FF9D] border border-[#00FF9D]/30" : "bg-gradient-to-r from-[#00FF9D] to-[#00FF9D] text-black hover:opacity-90"}`}>
        {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
        {saved ? "Settings Saved!" : "Save Settings"}
      </button>
    </div>
  );
}
