import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Database, RefreshCw, CheckCircle, AlertCircle, Activity } from "lucide-react";

interface CollectionCount {
  name: string;
  count: number;
  loading: boolean;
}

const COLLECTIONS = [
  { name: "questions", label: "Questions" },
  { name: "users", label: "Users" },
  { name: "attempts", label: "Attempts" },
  { name: "discussions", label: "Discussions" },
];

export function AdminSupabaseConfig() {
  const [collections, setCollections] = useState<CollectionCount[]>(
    COLLECTIONS.map((c) => ({ name: c.name, count: 0, loading: true }))
  );
  const [connectionStatus, setConnectionStatus] = useState<"connected" | "error" | "checking">("checking");
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    checkAndFetch();
  }, []);

  async function checkAndFetch() {
    setConnectionStatus("checking");
    try {
      const statsRes = await api.get("/stats");
      setConnectionStatus("connected");
      setCollections([
        { name: "questions", count: statsRes.questions || 0, loading: false },
        { name: "users", count: statsRes.students || 0, loading: false },
        { name: "attempts", count: 0, loading: false },
        { name: "discussions", count: statsRes.discussions || 0, loading: false },
      ]);
    } catch {
      setConnectionStatus("error");
      setCollections(COLLECTIONS.map((c) => ({ name: c.name, count: -1, loading: false })));
    }
  }

  async function refresh() {
    setRefreshing(true);
    await checkAndFetch();
    setRefreshing(false);
  }

  const StatusIcon = connectionStatus === "connected"
    ? CheckCircle
    : connectionStatus === "error"
    ? AlertCircle
    : Activity;

  const statusColor =
    connectionStatus === "connected" ? "#00ffb3"
    : connectionStatus === "error" ? "#f43f5e"
    : "#f59e0b";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">MongoDB Status</h1>
          <p className="text-white/40 text-sm mt-1">Connection health and collection statistics</p>
        </div>
        <button
          onClick={refresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border border-white/10 text-white/70 hover:text-white hover:bg-white/5 transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      <div className="rounded-2xl border border-white/8 p-6" style={{ background: "#07111f" }}>
        <div className="flex items-center gap-3 mb-1">
          <StatusIcon className="w-5 h-5" style={{ color: statusColor }} />
          <span className="font-semibold text-white">
            {connectionStatus === "connected" ? "MongoDB Connected" : connectionStatus === "error" ? "Connection Error" : "Checking…"}
          </span>
        </div>
        <p className="text-white/40 text-sm ml-8">
          {connectionStatus === "connected"
            ? "API server is reachable and MongoDB is connected."
            : connectionStatus === "error"
            ? "Cannot reach the API server. Make sure both servers are running."
            : "Verifying connection…"}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {collections.map((col) => {
          const label = COLLECTIONS.find((c) => c.name === col.name)?.label ?? col.name;
          return (
            <div key={col.name} className="rounded-2xl border border-white/8 p-5" style={{ background: "#07111f" }}>
              <div className="flex items-center gap-2 mb-3">
                <Database className="w-4 h-4" style={{ color: "#00ffb3" }} />
                <span className="text-xs font-black uppercase tracking-widest font-mono" style={{ color: "#00ffb3" }}>{label}</span>
              </div>
              {col.loading ? (
                <div className="h-8 w-16 rounded bg-white/5 animate-pulse" />
              ) : col.count === -1 ? (
                <p className="text-red-400 text-sm font-mono">Error</p>
              ) : (
                <p className="text-3xl font-black text-white">{col.count.toLocaleString()}</p>
              )}
              <p className="text-white/30 text-xs mt-1">documents</p>
            </div>
          );
        })}
      </div>

      <div className="rounded-2xl border border-white/8 p-5" style={{ background: "#07111f" }}>
        <p className="text-xs font-black uppercase tracking-widest font-mono mb-3" style={{ color: "#00ffb3" }}>Architecture</p>
        <div className="space-y-2 text-sm text-white/60">
          <p>• <span className="text-white/80">Frontend</span> — React + Vite (port 3000)</p>
          <p>• <span className="text-white/80">API Server</span> — Express + Mongoose (port 8080, proxied via Vite)</p>
          <p>• <span className="text-white/80">Database</span> — MongoDB Atlas (MONGODB_URI environment secret)</p>
          <p>• <span className="text-white/80">Auth</span> — Demo mode (hardcoded credentials, no Supabase)</p>
        </div>
      </div>
    </div>
  );
}
