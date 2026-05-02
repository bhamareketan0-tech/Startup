import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { ADMIN_EMAIL } from "@/lib/constants";
import {
  Shield, LayoutDashboard, BookOpen, Layers, FileText,
  Users, CreditCard, MessageSquare, Flag, Settings,
  Database, Plus, LogOut, User, ChevronRight, Upload
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
import { api } from "@/lib/api";

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
  | "pdf_import";

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
  { id: "students", label: "Students", icon: Users, group: "Users" },
  { id: "subscriptions", label: "Subscriptions", icon: CreditCard, group: "Users" },
  { id: "community", label: "Discussions", icon: MessageSquare, group: "Community" },
  { id: "reports", label: "Reports", icon: Flag, group: "Community" },
  { id: "settings", label: "Settings", icon: Settings, group: "System" },
  { id: "mongodb", label: "MongoDB Status", icon: Database, group: "System" },
  { id: "pdf_import", label: "PDF Import", icon: Upload, group: "Content" },
];

const GROUPS = ["Overview", "Content", "Users", "Community", "System"];

export function AdminPage() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [page, setPage] = useState<Page>("dashboard");
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
    } catch { }
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
    <div className="min-h-screen text-white flex" style={{ background: "#050a14", fontFamily: "'Space Grotesk', sans-serif" }}>
      {/* Sidebar */}
      <aside className="w-60 min-h-screen border-r flex flex-col fixed top-0 left-0 z-40" style={{ background: "#07111f", borderColor: "rgba(255,255,255,0.08)" }}>
        {/* Logo */}
        <div className="px-5 py-5 border-b" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
          <div className="flex items-center gap-3 mb-0.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "#00FF9D" }}>
              <Shield className="w-4 h-4 text-black" />
            </div>
            <div>
              <p className="font-bold text-white text-sm leading-tight">BioSpark</p>
              <p className="text-[10px] leading-tight" style={{ color: "rgba(255,255,255,0.4)" }}>Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {GROUPS.map((group) => {
            const items = navItemsWithBadges.filter((i) => i.group === group);
            return (
              <div key={group}>
                <p className="text-[10px] font-semibold uppercase tracking-widest px-3 mb-1.5" style={{ color: "rgba(255,255,255,0.3)" }}>{group}</p>
                {items.map((item) => {
                  const Icon = item.icon;
                  const active = page === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setPage(item.id)}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all mb-0.5 min-h-[44px]"
                      style={active
                        ? { background: "rgba(0,255,157,0.1)", color: "#00FF9D" }
                        : { color: "rgba(255,255,255,0.5)" }
                      }
                    >
                      <Icon className="w-4 h-4 shrink-0" style={active ? { color: "#00FF9D" } : {}} />
                      <span className="font-medium">{item.label}</span>
                      {item.badge && item.badge > 0 ? (
                        <span className="ml-auto min-w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center px-1.5">
                          {item.badge}
                        </span>
                      ) : active ? (
                        <ChevronRight className="ml-auto w-3 h-3" style={{ color: "rgba(0,255,157,0.5)" }} />
                      ) : null}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </nav>

        {/* Admin User */}
        <div className="px-3 py-4 border-t" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
          <div className="flex items-center gap-3 px-3 py-2.5">
            <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: "rgba(0,255,157,0.15)" }}>
              <User className="w-4 h-4" style={{ color: "#00FF9D" }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-semibold truncate">{profile?.name || "Admin"}</p>
              <p className="text-[10px] truncate" style={{ color: "rgba(255,255,255,0.3)" }}>{user?.email}</p>
            </div>
            <button
              onClick={() => { signOut(); navigate("/login"); }}
              className="transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
              style={{ color: "rgba(255,255,255,0.3)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#f87171")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.3)")}
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
        <header className="sticky top-0 z-30 flex items-center justify-between px-8 py-4 backdrop-blur border-b" style={{ background: "rgba(5,10,20,0.8)", borderColor: "rgba(255,255,255,0.08)" }}>
          <div>
            <h1 className="text-base font-bold text-white leading-tight">
              {NAV_ITEMS.find((i) => i.id === page)?.label ?? "Admin"}
            </h1>
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>BioSpark Admin · {new Date().toLocaleDateString("en-IN", { dateStyle: "medium" })}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleAddQuestion}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-black text-sm font-bold transition-all min-h-[44px]"
              style={{ background: "#00FF9D" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#00e590")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#00FF9D")}
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
          {page === "mongodb" && <AdminMongoStatus />}
          {page === "pdf_import" && <AdminPDFImport />}
        </main>
      </div>
    </div>
  );
}
