import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { UserProfile } from "./supabase";

type AuthUser = { id: string; email: string; name?: string; avatar?: string };

type AuthContextType = {
  user: AuthUser | null;
  session: { user: AuthUser } | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, name: string, cls: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  signInWithGoogle: (googleProfile: { id: string; email: string; name: string; avatar?: string }) => void;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function profileFromUser(u: Record<string, unknown>): UserProfile {
  return {
    id: u["id"] as string,
    name: (u["name"] as string) || (u["email"] as string),
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
    fetch((import.meta.env.VITE_API_URL ?? "") + "/api/auth/me", {  })
      .then((r) => r.json())
      .then((data: { user?: Record<string, unknown> }) => {
        if (data.user) {
          setUser({ id: data.user["id"] as string, email: data.user["email"] as string, name: data.user["name"] as string, avatar: data.user["avatar"] as string | undefined });
          setProfile(profileFromUser(data.user));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function signIn(email: string, password: string): Promise<{ error: Error | null }> {
    try {
      const res = await fetch((import.meta.env.VITE_API_URL ?? "") + "/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        ,
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json() as { user?: Record<string, unknown>; error?: string };
      if (!res.ok) return { error: new Error(data.error || "Login failed.") };
      setUser({ id: data.user!["id"] as string, email: data.user!["email"] as string, name: data.user!["name"] as string | undefined, avatar: data.user!["avatar"] as string | undefined });
      setProfile(profileFromUser(data.user!));
      return { error: null };
    } catch {
      return { error: new Error("Network error. Please try again.") };
    }
  }

  async function signUp(email: string, password: string, name: string, cls: string): Promise<{ error: Error | null }> {
    try {
      const res = await fetch((import.meta.env.VITE_API_URL ?? "") + "/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        ,
        body: JSON.stringify({ email, password, name, class: cls }),
      });
      const data = await res.json() as { user?: Record<string, unknown>; error?: string };
      if (!res.ok) return { error: new Error(data.error || "Registration failed.") };
      setUser({ id: data.user!["id"] as string, email: data.user!["email"] as string, name: data.user!["name"] as string | undefined, avatar: data.user!["avatar"] as string | undefined });
      setProfile(profileFromUser(data.user!));
      return { error: null };
    } catch {
      return { error: new Error("Network error. Please try again.") };
    }
  }

  async function signOut(): Promise<void> {
    await fetch((import.meta.env.VITE_API_URL ?? "") + "/api/auth/logout", { method: "POST",  }).catch(() => {});
    setUser(null);
    setProfile(null);
  }

  function signInWithGoogle(googleProfile: { id: string; email: string; name: string; avatar?: string }): void {
    const u: AuthUser = { id: googleProfile.id, email: googleProfile.email, name: googleProfile.name, avatar: googleProfile.avatar };
    setUser(u);
    setProfile(profileFromUser(u as unknown as Record<string, unknown>));
  }

  async function refreshProfile(): Promise<void> {
    const res = await fetch((import.meta.env.VITE_API_URL ?? "") + "/api/auth/me", {  }).catch(() => null);
    if (!res?.ok) return;
    const data = await res.json() as { user?: Record<string, unknown> };
    if (data.user) {
      setUser({ id: data.user["id"] as string, email: data.user["email"] as string, name: data.user["name"] as string | undefined, avatar: data.user["avatar"] as string | undefined });
      setProfile(profileFromUser(data.user));
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
