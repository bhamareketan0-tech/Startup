import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  class: string;
  score: number;
  plan: string;
  created_at: string;
};

type AuthUser = { id: string; email: string; name?: string; avatar?: string; role?: string };

type AuthContextType = {
  user: AuthUser | null;
  session: { user: AuthUser } | null;
  profile: UserProfile | null;
  loading: boolean;
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
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(API + "/api/auth/me", { credentials: "include" })
      .then((r) => r.json())
      .then((data: Record<string, unknown>) => {
        const u = (data["user"] as Record<string, unknown>) || data;
        if (u && u["email"]) {
          setUser({ id: (u["id"] as string) || (u["_id"] as string) || "", email: u["email"] as string, name: u["name"] as string | undefined, avatar: u["avatar"] as string | undefined, role: u["role"] as string | undefined });
          setProfile(profileFromUser(u));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function signIn(email: string, password: string): Promise<{ error: Error | null }> {
    try {
      const res = await fetch(API + "/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json() as Record<string, unknown>;
      if (!res.ok) return { error: new Error((data["error"] as string) || "Login failed.") };
      const u = (data["user"] as Record<string, unknown>) || data;
      setUser({ id: (u["id"] as string) || (u["_id"] as string) || "", email: u["email"] as string, name: u["name"] as string | undefined, avatar: u["avatar"] as string | undefined, role: u["role"] as string | undefined });
      setProfile(profileFromUser(u));
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
        credentials: "include",
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
    await fetch(API + "/api/auth/logout", { method: "POST", credentials: "include" }).catch(() => {});
    setUser(null);
    setProfile(null);
  }

  function signInWithGoogle(googleProfile: { id: string; email: string; name: string; avatar?: string; token?: string }): void {
    const u: AuthUser = { id: googleProfile.id, email: googleProfile.email, name: googleProfile.name, avatar: googleProfile.avatar };
    setUser(u);
    setProfile(profileFromUser(u as unknown as Record<string, unknown>));
  }

  async function refreshProfile(): Promise<void> {
    const res = await fetch(API + "/api/auth/me", { credentials: "include" }).catch(() => null);
    if (!res?.ok) return;
    const data = await res.json() as Record<string, unknown>;
    const u = (data["user"] as Record<string, unknown>) || data;
    if (u && u["email"]) {
      setUser({ id: (u["id"] as string) || (u["_id"] as string) || "", email: u["email"] as string, name: u["name"] as string | undefined, avatar: u["avatar"] as string | undefined, role: u["role"] as string | undefined });
      setProfile(profileFromUser(u));
    }
  }

  const session = user ? { user } : null;

  return (
    <AuthContext.Provider value={{ user, session, profile, loading, signIn, signUp, signOut, signInWithGoogle, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
