import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "@/lib/auth";
import { ThemeProvider } from "@/lib/ThemeContext";
import { Navbar } from "@/components/Navbar";
import { ThemePicker } from "@/components/ThemePicker";
import { SpaceBackground } from "@/components/SpaceBackground";
import { LoginPage } from "@/pages/LoginPage";
import { HomePage } from "@/pages/HomePage";
import { ClassSelectPage } from "@/pages/ClassSelectPage";
import { ChaptersPage } from "@/pages/ChaptersPage";
import { SubunitsPage } from "@/pages/SubunitsPage";
import { PracticePage } from "@/pages/PracticePage";
import { ScorePage } from "@/pages/ScorePage";
import { CommunityPage } from "@/pages/CommunityPage";
import { PlansPage } from "@/pages/PlansPage";
import { AdminPage } from "@/pages/AdminPage";
import { ProfilePage } from "@/pages/ProfilePage";

const ADMIN_EMAIL = "bhamareketan18@gmail.com";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center font-['Space_Grotesk']" style={{ background: "var(--bs-bg)" }}>
      <div className="w-12 h-12 border-2 border-t-transparent animate-spin" style={{ borderColor: "var(--bs-spinner-color) transparent transparent transparent" }} />
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center font-['Space_Grotesk']" style={{ background: "var(--bs-bg)" }}>
      <div className="w-12 h-12 border-2 border-t-transparent animate-spin" style={{ borderColor: "var(--bs-spinner-color) transparent transparent transparent" }} />
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  if (user.email !== ADMIN_EMAIL) return <Navigate to="/home" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const hideThemePicker = location.pathname.startsWith("/admin");

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center font-['Space_Grotesk']" style={{ background: "var(--bs-bg)" }}>
      <div className="w-12 h-12 border-2 border-t-transparent animate-spin" style={{ borderColor: "var(--bs-spinner-color) transparent transparent transparent" }} />
    </div>
  );

  return (
    <>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/home" replace /> : <LoginPage />} />
        <Route path="/" element={<Navigate to={user ? "/home" : "/login"} replace />} />
        <Route path="/home" element={<><Navbar /><HomePage /></>} />
        <Route path="/plans" element={<><Navbar /><PlansPage /></>} />
        <Route path="/community" element={<><Navbar /><CommunityPage /></>} />
        <Route
          path="/class-select"
          element={
            <ProtectedRoute>
              <Navbar />
              <ClassSelectPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chapters/:cls"
          element={
            <ProtectedRoute>
              <Navbar />
              <ChaptersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/subunits/:cls/:chapterId"
          element={
            <ProtectedRoute>
              <Navbar />
              <SubunitsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/practice/:cls/:chapterId/:subunit"
          element={
            <ProtectedRoute>
              <PracticePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Navbar />
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/score"
          element={
            <ProtectedRoute>
              <ScorePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminPage />
            </AdminRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {!hideThemePicker && <ThemePicker />}
    </>
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
