import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type UserBadge = {
  id: string;
  name: string;
  emoji: string;
  description: string;
  unlockedAt?: string;
};

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  class: string;
  score: number;
  plan: string;
  created_at: string;
  xp: number;
  level: string;
  badges: UserBadge[];
  username?: string;
  streakCount?: number;
};

type AuthUser = { id: string; email: string; name?: string; avatar?: string; role?: string };

type AuthContextType = {
  user: AuthUser | null;
  session: { user: AuthUser } | null;
  profile: UserProfile | null;
  loading: boolean;
  comebackMessage: { type: "none" | "comeback" | "fresh_start"; xpAwarded: number; message: string } | null;
  clearComebackMessage: () => void;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, name: string, cls: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  signInWithGoogle: (googleProfile: { id: string; email: string; name: string; avatar?: string; token?: string }) => void;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API = (import.meta.env.VITE_API_URL ?? "");

function profileFromUser(u: Record<string, unknown>): UserProfile {
  return {
    id: (u["id"] as string) || (u["_id"] as string) || "",
    name: (u["name"] as string) || (u["email"] as string) || "",
    email: u["email"] as string,
    class: (u["class"] as string) || "11",
    score: (u["score"] as number) || 0,
    plan: (u["plan"] as string) || "free",
    created_at: (u["created_at"] as string) || new Date().toISOString(),
    xp: (u["xp"] as number) || 0,
    level: (u["level"] as string) || "Beginner",
    badges: (u["badges"] as UserBadge[]) || [],
    username: (u["username"] as string) || undefined,
    streakCount: (u["streakCount"] as number) || 0,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [comebackMessage, setComebackMessage] = useState<AuthContextType["comebackMessage"]>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setLoading(false);
      return;
    }

    fetch(`/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((r) => {
        if (!r.ok) return null;
        return r.json();
      })
      .then((data: unknown) => {
        if (!data) return;
        const d = data as Record<string, unknown>;
        const u = (d["user"] as Record<string, unknown>) || d;
        if (u && u["email"]) {
          setUser({
            id: (u["id"] as string) || (u["_id"] as string) || "",
            email: u["email"] as string,
            name: u["name"] as string | undefined,
            avatar: u["avatar"] as string | undefined,
          });
          setProfile(profileFromUser(u));
        }
      })
      .catch(() => {
        console.log("Auth check skipped");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  async function signIn(email: string, password: string): Promise<{ error: Error | null }> {
    try {
      const res = await fetch(API + "/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json() as Record<string, unknown>;
      if (!res.ok) return { error: new Error((data["error"] as string) || "Login failed.") };
      const u = (data["user"] as Record<string, unknown>) || data;
      setUser({ id: (u["id"] as string) || (u["_id"] as string) || "", email: u["email"] as string, name: u["name"] as string | undefined, avatar: u["avatar"] as string | undefined, role: u["role"] as string | undefined });
      setProfile(profileFromUser(u));
      const cb = data["comeback"] as { comebackType: "none" | "comeback" | "fresh_start"; xpAwarded: number; message: string } | undefined;
      if (cb && cb.comebackType !== "none") {
        setComebackMessage({ type: cb.comebackType, xpAwarded: cb.xpAwarded, message: cb.message });
      }
      return { error: null };
    } catch {
      return { error: new Error("Network error. Please try again.") };
    }
  }

  async function signUp(email: string, password: string, name: string, cls: string): Promise<{ error: Error | null }> {
    try {
      const res = await fetch(API + "/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name, class: cls }),
      });
      const data = await res.json() as Record<string, unknown>;
      if (!res.ok) return { error: new Error((data["error"] as string) || "Registration failed.") };
      const u = (data["user"] as Record<string, unknown>) || data;
      setUser({ id: (u["id"] as string) || (u["_id"] as string) || "", email: u["email"] as string, name: u["name"] as string | undefined, avatar: u["avatar"] as string | undefined, role: u["role"] as string | undefined });
      setProfile(profileFromUser(u));
      return { error: null };
    } catch {
      return { error: new Error("Network error. Please try again.") };
    }
  }

  async function signOut(): Promise<void> {
    await fetch(API + "/api/auth/logout", { method: "POST" }).catch(() => {});
    localStorage.removeItem("token");
    setUser(null);
    setProfile(null);
  }

  function signInWithGoogle(googleProfile: { id: string; email: string; name: string; avatar?: string; token?: string }): void {
    const u: AuthUser = { id: googleProfile.id, email: googleProfile.email, name: googleProfile.name, avatar: googleProfile.avatar };
    setUser(u);
    setProfile(profileFromUser(u as unknown as Record<string, unknown>));
  }

  async function refreshProfile(): Promise<void> {
    const token = localStorage.getItem("token");
    if (!token) return;

    const res = await fetch(`/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => null);

    if (!res || !res.ok) return;
    const data = await res.json().catch(() => null) as Record<string, unknown> | null;
    if (!data) return;

    const u = (data["user"] as Record<string, unknown>) || data;
    if (u && u["email"]) {
      setUser({
        id: (u["id"] as string) || (u["_id"] as string) || "",
        email: u["email"] as string,
        name: u["name"] as string | undefined,
        avatar: u["avatar"] as string | undefined,
      });
      setProfile(profileFromUser(u));
    }
  }

  function clearComebackMessage() {
    setComebackMessage(null);
  }

  const session = user ? { user } : null;

  return (
    <AuthContext.Provider value={{ user, session, profile, loading, comebackMessage, clearComebackMessage, signIn, signUp, signOut, signInWithGoogle, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
