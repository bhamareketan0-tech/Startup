import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";
import { AuthProvider, useAuth } from "@/lib/auth";
import { ThemeProvider } from "@/lib/ThemeContext";
import { Navbar } from "@/components/Navbar";
import { SpaceBackground } from "@/components/SpaceBackground";
import { ADMIN_EMAIL } from "@/lib/constants";

const LoginPage = lazy(() => import("@/pages/LoginPage").then(m => ({ default: m.LoginPage })));
const HomePage = lazy(() => import("@/pages/HomePage").then(m => ({ default: m.HomePage })));
const DashboardPage = lazy(() => import("@/pages/DashboardPage").then(m => ({ default: m.DashboardPage })));
const ClassSelectPage = lazy(() => import("@/pages/ClassSelectPage").then(m => ({ default: m.ClassSelectPage })));
const ChaptersPage = lazy(() => import("@/pages/ChaptersPage").then(m => ({ default: m.ChaptersPage })));
const SubunitsPage = lazy(() => import("@/pages/SubunitsPage").then(m => ({ default: m.SubunitsPage })));
const PracticePage = lazy(() => import("@/pages/PracticePage").then(m => ({ default: m.PracticePage })));
const ScorePage = lazy(() => import("@/pages/ScorePage").then(m => ({ default: m.ScorePage })));
const CommunityPage = lazy(() => import("@/pages/CommunityPage").then(m => ({ default: m.CommunityPage })));
const PlansPage = lazy(() => import("@/pages/PlansPage").then(m => ({ default: m.PlansPage })));
const AdminPage = lazy(() => import("@/pages/AdminPage").then(m => ({ default: m.AdminPage })));
const ProfilePage = lazy(() => import("@/pages/ProfilePage").then(m => ({ default: m.ProfilePage })));
const MockTestPage = lazy(() => import("@/pages/MockTestPage").then(m => ({ default: m.MockTestPage })));
const LeaderboardPage = lazy(() => import("@/pages/LeaderboardPage").then(m => ({ default: m.LeaderboardPage })));
const BookmarksPage = lazy(() => import("@/pages/BookmarksPage").then(m => ({ default: m.BookmarksPage })));
const NotesPage = lazy(() => import("@/pages/NotesPage").then(m => ({ default: m.NotesPage })));
const CustomQuizPage = lazy(() => import("@/pages/CustomQuizPage").then(m => ({ default: m.CustomQuizPage })));
const RevisionPage = lazy(() => import("@/pages/RevisionPage").then(m => ({ default: m.RevisionPage })));
const DailyChallengePage = lazy(() => import("@/pages/DailyChallengePage").then(m => ({ default: m.DailyChallengePage })));
const PerformancePage = lazy(() => import("@/pages/PerformancePage").then(m => ({ default: m.PerformancePage })));
const SyllabusPage = lazy(() => import("@/pages/SyllabusPage").then(m => ({ default: m.SyllabusPage })));
const NotFound = lazy(() => import("@/pages/not-found"));

function Spinner() {
  return (
    <div className="min-h-screen flex items-center justify-center font-['Space_Grotesk']" style={{ background: "var(--bs-bg)" }}>
      <div className="w-12 h-12 border-2 border-t-transparent animate-spin" style={{ borderColor: "#00FF9D transparent transparent transparent", borderRadius: "50%" }} />
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.email !== ADMIN_EMAIL) return <Navigate to="/home" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;

  return (
    <Suspense fallback={<Spinner />}>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/home" replace /> : <LoginPage />} />
        <Route path="/" element={<Navigate to={user ? "/home" : "/login"} replace />} />
        <Route path="/home" element={<><Navbar /><HomePage /></>} />
        <Route path="/plans" element={<><Navbar /><PlansPage /></>} />
        <Route path="/community" element={<><Navbar /><CommunityPage /></>} />
        <Route path="/leaderboard" element={<><Navbar /><LeaderboardPage /></>} />
        <Route path="/dashboard" element={<ProtectedRoute><Navbar /><DashboardPage /></ProtectedRoute>} />
        <Route path="/mock-test" element={<ProtectedRoute><Navbar /><MockTestPage /></ProtectedRoute>} />
        <Route path="/class-select" element={<ProtectedRoute><Navbar /><ClassSelectPage /></ProtectedRoute>} />
        <Route path="/chapters/:cls" element={<ProtectedRoute><Navbar /><ChaptersPage /></ProtectedRoute>} />
        <Route path="/subunits/:cls/:chapterId" element={<ProtectedRoute><Navbar /><SubunitsPage /></ProtectedRoute>} />
        <Route path="/practice/:cls/:chapterId/:subunit" element={<ProtectedRoute><PracticePage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Navbar /><ProfilePage /></ProtectedRoute>} />
        <Route path="/score" element={<ProtectedRoute><ScorePage /></ProtectedRoute>} />
        <Route path="/bookmarks" element={<ProtectedRoute><Navbar /><BookmarksPage /></ProtectedRoute>} />
        <Route path="/notes" element={<ProtectedRoute><Navbar /><NotesPage /></ProtectedRoute>} />
        <Route path="/custom-quiz" element={<ProtectedRoute><Navbar /><CustomQuizPage /></ProtectedRoute>} />
        <Route path="/revision" element={<ProtectedRoute><Navbar /><RevisionPage /></ProtectedRoute>} />
        <Route path="/daily-challenge" element={<ProtectedRoute><Navbar /><DailyChallengePage /></ProtectedRoute>} />
        <Route path="/performance" element={<ProtectedRoute><Navbar /><PerformancePage /></ProtectedRoute>} />
        <Route path="/syllabus" element={<ProtectedRoute><Navbar /><SyllabusPage /></ProtectedRoute>} />
        <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <ThemeProvider>
        <AuthProvider>
          <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
            <SpaceBackground />
          </div>
          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
