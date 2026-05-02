import { Link } from "react-router-dom";
import { AlertCircle, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "var(--bs-bg)" }}>
      <div
        className="w-full max-w-md border p-8 text-center"
        style={{ background: "var(--bs-surface)", borderColor: "var(--bs-border-subtle)", borderRadius: "8px" }}
      >
        <div className="flex justify-center mb-4">
          <AlertCircle className="w-12 h-12" style={{ color: "#00FF9D" }} />
        </div>
        <h1 className="text-4xl font-black mb-2 font-['Space_Grotesk']" style={{ color: "var(--bs-text)" }}>404</h1>
        <p className="text-lg font-bold mb-2 font-['Space_Grotesk']" style={{ color: "var(--bs-text)" }}>Page Not Found</p>
        <p className="text-sm mb-6" style={{ color: "var(--bs-text-muted)" }}>
          The page you're looking for doesn't exist.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 font-bold text-black transition-colors"
          style={{ background: "#00FF9D", borderRadius: "8px" }}
        >
          <Home className="w-4 h-4" />
          Back to Home
        </Link>
      </div>
    </div>
  );
}
