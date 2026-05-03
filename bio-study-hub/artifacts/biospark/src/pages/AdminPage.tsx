import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import {
  Shield, LayoutDashboard, BookOpen, Layers, FileText,
  Users, CreditCard, MessageSquare, Flag, Settings,
  Database, Plus, Sun, Moon, LogOut, User, ChevronRight, Upload,
  Sparkles, KeyRound, TrendingUp, Bell, Quote, MapPin,
  GitCompareArrows, Layers as FlashIcon, StickyNote, DollarSign,
  Share2, BarChart2, Smartphone, Zap
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
import { AdminAIGenerator } from "./admin/AdminAIGenerator";
import { AdminCredentials } from "./admin/AdminCredentials";
import { AdminShortNotes } from "./admin/AdminShortNotes";
import { AdminFlashcards } from "./admin/AdminFlashcards";
import { AdminComparisons } from "./admin/AdminComparisons";
import { AdminMemoryPalace } from "./admin/AdminMemoryPalace";
import { AdminQuotes } from "./admin/AdminQuotes";
import { AdminRevenue } from "./admin/AdminRevenue";
import { AdminRazorpay } from "./admin/AdminRazorpay";
import { AdminPricingPlans } from "./admin/AdminPricingPlans";
import { AdminCommunication } from "./admin/AdminCommunication";
import { api } from "@/lib/api";
import { ADMIN_EMAIL } from "@/lib/constants";

type Page =
  | "dashboard" | "analytics"
  | "questions" | "chapters" | "passages" | "pdf_import" | "text_extractor" | "ai_generator"
  | "short_notes" | "flashcards" | "comparisons" | "memory_palace" | "quotes"
  | "students" | "subscriptions" | "reports"
  | "communication"
  | "revenue" | "razorpay" | "pricing_plans"
  | "settings" | "credentials" | "mongodb";

interface NavItem { id: Page; label: string; icon: React.ElementType; badge?: number; group: string; }

const NAV_ITEMS: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, group: "OVERVIEW" },
  { id: "analytics", label: "Analytics", icon: BarChart2, group: "OVERVIEW" },
  { id: "questions", label: "Questions", icon: BookOpen, group: "CONTENT" },
  { id: "chapters", label: "Chapters & Topics", icon: Layers, group: "CONTENT" },
  { id: "passages", label: "Passages", icon: FileText, group: "CONTENT" },
  { id: "pdf_import", label: "PDF Import", icon: Upload, group: "CONTENT" },
  { id: "text_extractor", label: "AI Question Extractor", icon: Sparkles, group: "CONTENT" },
  { id: "ai_generator", label: "AI PDF → Questions", icon: Zap, group: "CONTENT" },
  { id: "short_notes", label: "Short Notes Manager", icon: StickyNote, group: "CONTENT" },
  { id: "flashcards", label: "Flashcard Manager", icon: FlashIcon, group: "CONTENT" },
  { id: "comparisons", label: "Comparison Charts", icon: GitCompareArrows, group: "CONTENT" },
  { id: "memory_palace", label: "Memory Palace", icon: MapPin, group: "CONTENT" },
  { id: "quotes", label: "Motivational Quotes", icon: Quote, group: "CONTENT" },
  { id: "students", label: "Students", icon: Users, group: "USERS" },
  { id: "subscriptions", label: "Subscriptions", icon: CreditCard, group: "USERS" },
  { id: "reports", label: "Reports", icon: Flag, group: "USERS" },
  { id: "communication", label: "Messaging", icon: Smartphone, group: "COMMUNICATION" },
  { id: "revenue", label: "Revenue Dashboard", icon: DollarSign, group: "MONETIZATION" },
  { id: "razorpay", label: "Razorpay Settings", icon: CreditCard, group: "MONETIZATION" },
  { id: "pricing_plans", label: "Pricing Plans", icon: TrendingUp, group: "MONETIZATION" },
  { id: "settings", label: "Settings", icon: Settings, group: "SYSTEM" },
  { id: "credentials", label: "Credentials & Keys", icon: KeyRound, group: "SYSTEM" },
  { id: "mongodb", label: "MongoDB Status", icon: Database, group: "SYSTEM" },
];

const GROUPS = ["OVERVIEW", "CONTENT", "USERS", "COMMUNICATION", "MONETIZATION", "SYSTEM"];

export function AdminPage() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [page, setPage] = useState<Page>("dashboard");
  const [darkMode, setDarkMode] = useState(true);
  const [badges, setBadges] = useState({ reports: 0, discussions: 0 });
  const addQuestionRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!user || user.email !== ADMIN_EMAIL) { navigate("/home"); return; }
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
    badge: item.id === "reports" ? badges.reports : item.id === "communication" ? badges.discussions : undefined,
  }));

  function handleAddQuestion() {
    setPage("questions");
    setTimeout(() => { addQuestionRef.current?.(); }, 100);
  }

  return (
    <div className="relative min-h-screen bg-[#050a14] text-white flex" style={{ fontFamily: "'Space Grotesk', sans-serif", zIndex: 1 }}>
      {/* Sidebar */}
      <aside className="w-60 min-h-screen bg-[#07111f] border-r border-white/8 flex flex-col fixed top-0 left-0 z-40">
        <div className="px-5 py-5 border-b border-white/8">
          <div className="flex items-center gap-3 mb-0.5">
            <div className="w-8 h-8 flex items-center justify-center shrink-0" style={{ background: "#00FF9D", borderRadius: "8px" }}>
              <Shield className="w-4 h-4 text-black" />
            </div>
            <div>
              <p className="font-bold text-white text-sm leading-tight">NEETAspire</p>
              <p className="text-[10px] text-white/40 leading-tight">Admin Panel</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-4">
          {GROUPS.map((group) => {
            const items = navItemsWithBadges.filter((i) => i.group === group);
            return (
              <div key={group}>
                <p className="text-[9px] font-semibold uppercase tracking-widest text-white/25 px-3 mb-1">{group}</p>
                {items.map((item) => {
                  const Icon = item.icon;
                  const active = page === item.id;
                  return (
                    <button key={item.id} onClick={() => setPage(item.id)}
                      className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all mb-0.5 ${active ? "bg-[#00FF9D]/10 text-[#00FF9D]" : "text-white/45 hover:text-white hover:bg-white/5"}`}>
                      <Icon className={`w-3.5 h-3.5 shrink-0 ${active ? "text-[#00FF9D]" : ""}`} />
                      <span className="font-medium truncate">{item.label}</span>
                      {item.badge && item.badge > 0 ? (
                        <span className="ml-auto min-w-4 h-4 rounded-full bg-[#ff4444] text-white text-[9px] font-bold flex items-center justify-center px-1">
                          {item.badge}
                        </span>
                      ) : active ? <ChevronRight className="ml-auto w-3 h-3 text-[#00FF9D]/50" /> : null}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-white/8">
          <div className="flex items-center gap-3 px-3 py-2.5">
            <div className="w-8 h-8 rounded-full bg-[#00FF9D]/20 flex items-center justify-center shrink-0">
              <User className="w-4 h-4 text-[#00FF9D]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-semibold truncate">{profile?.name || "Admin"}</p>
              <p className="text-white/30 text-[10px] truncate">{user?.email}</p>
            </div>
            <button onClick={() => { signOut(); navigate("/login"); }} className="text-white/30 hover:text-red-400 transition-colors" title="Sign out">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 ml-60 flex flex-col min-h-screen">
        <header className="sticky top-0 z-30 flex items-center justify-between px-8 py-4 bg-[#050a14]/80 backdrop-blur border-b border-white/8">
          <div>
            <h1 className="text-base font-bold text-white leading-tight">
              {NAV_ITEMS.find((i) => i.id === page)?.label ?? "Admin"}
            </h1>
            <p className="text-xs text-white/30">NEETAspire Admin · {new Date().toLocaleDateString("en-IN", { dateStyle: "medium" })}</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all">
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button onClick={handleAddQuestion} className="flex items-center gap-2 px-4 py-2 rounded-xl text-black text-sm font-bold transition-all" style={{ background: "#00FF9D" }}>
              <Plus className="w-4 h-4" /> Add Question
            </button>
          </div>
        </header>

        <main className="flex-1 p-8">
          {page === "dashboard" && <AdminDashboard />}
          {page === "analytics" && <AdminAnalytics />}
          {page === "questions" && <AdminQuestions onAddQuestion={(fn) => { addQuestionRef.current = fn; }} />}
          {page === "chapters" && <AdminChapters />}
          {page === "passages" && <AdminPassages />}
          {page === "pdf_import" && <AdminPDFImport />}
          {page === "text_extractor" && <AdminTextExtractor />}
          {page === "ai_generator" && <AdminAIGenerator />}
          {page === "short_notes" && <AdminShortNotes />}
          {page === "flashcards" && <AdminFlashcards />}
          {page === "comparisons" && <AdminComparisons />}
          {page === "memory_palace" && <AdminMemoryPalace />}
          {page === "quotes" && <AdminQuotes />}
          {page === "students" && <AdminStudents />}
          {page === "subscriptions" && <AdminSubscriptions />}
          {page === "reports" && <AdminReports />}
          {page === "communication" && <AdminCommunication />}
          {page === "revenue" && <AdminRevenue />}
          {page === "razorpay" && <AdminRazorpay />}
          {page === "pricing_plans" && <AdminPricingPlans />}
          {page === "settings" && <AdminSettings />}
          {page === "credentials" && <AdminCredentials />}
          {page === "mongodb" && <AdminMongoStatus />}
        </main>
      </div>
    </div>
  );
}
