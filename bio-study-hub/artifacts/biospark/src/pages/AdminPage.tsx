import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import {
  Shield, LayoutDashboard, BookOpen, Layers, FileText,
  Users, CreditCard, MessageSquare, Flag, Settings,
  Database, Plus, Sun, Moon, LogOut, User, ChevronRight, Upload,
  Sparkles, KeyRound
} from "lucide-react";
import { AdminDashboard } from "./admin/AdminDashboard";
import { AdminAnalytics } from "./admin/AdminAnalytics";
import { AdminQuestions } from "./admin/AdminQuestions";
import { AdminChapters } from "./admin/AdminChapters";
import { AdminPassages } from "./admin/AdminPassages";
import { AdminStudents } from "./admin/AdminStudents";
import { AdminSubscriptions } from "./admin/AdminSubscriptions";
import { AdminCommunity } from "./admin/AdminCommunity";
import { AdminReports } from "./admin/AdminReports";
import { AdminSettings } from "./admin/AdminSettings";
import { AdminMongoStatus } from "./admin/AdminMongoStatus";
import { AdminPDFImport } from "./admin/AdminPDFImport";
import { AdminTextExtractor } from "./admin/AdminTextExtractor";
import { AdminCredentials } from "./admin/AdminCredentials";
import { api } from "@/lib/api";

import { ADMIN_EMAIL } from "@/lib/constants";

type Page =
  | "dashboard"
  | "analytics"
  | "questions"
  | "chapters"
  | "passages"
  | "students"
  | "subscriptions"
  | "community"
  | "reports"
  | "settings"
  | "mongodb"
  | "pdf_import"
  | "text_extractor"
  | "credentials";

interface NavItem {
  id: Page;
  label: string;
  icon: React.ElementType;
  badge?: number;
  group: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, group: "Overview" },
  { id: "analytics", label: "Analytics", icon: Shield, group: "Overview" },
  { id: "questions", label: "Questions", icon: BookOpen, group: "Content" },
  { id: "chapters", label: "Chapters & Topics", icon: Layers, group: "Content" },
  { id: "passages", label: "Passages", icon: FileText, group: "Content" },
  { id: "pdf_import", label: "PDF Import", icon: Upload, group: "Content" },
  { id: "text_extractor", label: "AI Question Extractor", icon: Sparkles, group: "Content" },
  { id: "students", label: "Students", icon: Users, group: "Users" },
  { id: "subscriptions", label: "Subscriptions", icon: CreditCard, group: "Users" },
  { id: "community", label: "Discussions", icon: MessageSquare, group: "Community" },
  { id: "reports", label: "Reports", icon: Flag, group: "Community" },
  { id: "settings", label: "Settings", icon: Settings, group: "System" },
  { id: "credentials", label: "Credentials & Keys", icon: KeyRound, group: "System" },
  { id: "mongodb", label: "MongoDB Status", icon: Database, group: "System" },
];

const GROUPS = ["Overview", "Content", "Users", "Community", "System"];

export function AdminPage() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [page, setPage] = useState<Page>("dashboard");
  const [darkMode, setDarkMode] = useState(true);
  const [badges, setBadges] = useState({ reports: 0, discussions: 0 });
  const addQuestionRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!user || user.email !== ADMIN_EMAIL) {
      navigate("/home");
      return;
    }
    fetchBadgeCounts();
  }, [user]);

  async function fetchBadgeCounts() {
    try {
      const res = await api.get("/discussions");
      const reported = (res.data || []).filter((d: { status?: string }) => d.status === "reported").length;
      setBadges({ reports: 0, discussions: reported });
    } catch { /* silently fail */ }
  }

  if (!user || user.email !== ADMIN_EMAIL) return null;

  const navItemsWithBadges = NAV_ITEMS.map((item) => ({
    ...item,
    badge: item.id === "reports" ? badges.reports : item.id === "community" ? badges.discussions : undefined,
  }));

  function handleAddQuestion() {
    setPage("questions");
    setTimeout(() => {
      addQuestionRef.current?.();
    }, 100);
  }

  return (
    <div className="min-h-screen bg-[#050a14] text-white flex" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
      {/* Sidebar */}
      <aside className="w-60 min-h-screen bg-[#07111f] border-r border-white/8 flex flex-col fixed top-0 left-0 z-40">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-white/8">
          <div className="flex items-center gap-3 mb-0.5">
            <div className="w-8 h-8 flex items-center justify-center shrink-0" style={{ background: "#00FF9D", borderRadius: "8px" }}>
              <Shield className="w-4 h-4 text-black" />
            </div>
            <div>
              <p className="font-bold text-white text-sm leading-tight">BioSpark</p>
              <p className="text-[10px] text-white/40 leading-tight">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {GROUPS.map((group) => {
            const items = navItemsWithBadges.filter((i) => i.group === group);
            return (
              <div key={group}>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-white/30 px-3 mb-1.5">{group}</p>
                {items.map((item) => {
                  const Icon = item.icon;
                  const active = page === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setPage(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all mb-0.5 ${
                        active
                          ? "bg-[#00FF9D]/10 text-[#00FF9D]"
                          : "text-white/50 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${active ? "text-[#00FF9D]" : ""}`} />
                      <span className="font-medium">{item.label}</span>
                      {item.badge && item.badge > 0 ? (
                        <span className="ml-auto min-w-5 h-5 rounded-full bg-[#ff4444] text-white text-[10px] font-bold flex items-center justify-center px-1.5">
                          {item.badge}
                        </span>
                      ) : active ? (
                        <ChevronRight className="ml-auto w-3 h-3 text-[#00FF9D]/50" />
                      ) : null}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </nav>

        {/* Admin User */}
        <div className="px-3 py-4 border-t border-white/8">
          <div className="flex items-center gap-3 px-3 py-2.5">
            <div className="w-8 h-8 rounded-full bg-[#00FF9D]/20 flex items-center justify-center shrink-0">
              <User className="w-4 h-4 text-[#00FF9D]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-semibold truncate">{profile?.name || "Admin"}</p>
              <p className="text-white/30 text-[10px] truncate">{user?.email}</p>
            </div>
            <button
              onClick={() => { signOut(); navigate("/login"); }}
              className="text-white/30 hover:text-red-400 transition-colors"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 ml-60 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-8 py-4 bg-[#050a14]/80 backdrop-blur border-b border-white/8">
          <div>
            <h1 className="text-base font-bold text-white leading-tight">
              {NAV_ITEMS.find((i) => i.id === page)?.label ?? "Admin"}
            </h1>
            <p className="text-xs text-white/30">BioSpark Admin · {new Date().toLocaleDateString("en-IN", { dateStyle: "medium" })}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={handleAddQuestion}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-black text-sm font-bold transition-all" style={{ background: "#00FF9D" }}
            >
              <Plus className="w-4 h-4" />
              Add Question
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-8">
          {page === "dashboard" && <AdminDashboard />}
          {page === "analytics" && <AdminAnalytics />}
          {page === "questions" && <AdminQuestions addQuestionRef={addQuestionRef} />}
          {page === "chapters" && <AdminChapters />}
          {page === "passages" && <AdminPassages />}
          {page === "students" && <AdminStudents />}
          {page === "subscriptions" && <AdminSubscriptions />}
          {page === "community" && <AdminCommunity />}
          {page === "reports" && <AdminReports />}
          {page === "settings" && <AdminSettings />}
          {page === "credentials" && <AdminCredentials />}
          {page === "mongodb" && <AdminMongoStatus />}
          {page === "pdf_import" && <AdminPDFImport />}
          {page === "text_extractor" && <AdminTextExtractor />}
        </main>
      </div>
    </div>
  );
}
