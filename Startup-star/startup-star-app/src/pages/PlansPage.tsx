import { Link } from "react-router-dom";
import { Check, Zap, Star, Crown } from "lucide-react";

const plans = [
  {
    name: "Free",
    price: "₹0",
    period: "forever",
    icon: Zap,
    description: "Perfect for getting started with NEET prep",
    features: [
      "Access to Class 11 & 12 chapters",
      "Standard MCQ practice",
      "Basic score tracking",
      "Community access",
      "100 questions/day",
    ],
    notIncluded: ["Passage-based questions", "Advanced analytics", "Priority support"],
    cta: "GET STARTED",
    href: "/login",
    featured: false,
  },
  {
    name: "Pro",
    price: "₹299",
    period: "per month",
    icon: Star,
    description: "For serious NEET aspirants",
    badge: "MOST POPULAR",
    features: [
      "Everything in Free",
      "All 8 question types",
      "Unlimited practice",
      "Detailed performance analytics",
      "Chapter-wise progress tracking",
      "Priority community support",
    ],
    notIncluded: ["1-on-1 mentoring"],
    cta: "START PRO",
    href: "/login",
    featured: true,
  },
  {
    name: "Elite",
    price: "₹799",
    period: "per month",
    icon: Crown,
    description: "The complete NEET preparation package",
    features: [
      "Everything in Pro",
      "1-on-1 mentoring sessions",
      "Custom study plan",
      "NEET PYQ analysis",
      "Mock test series",
      "Dedicated mentor",
      "Guaranteed score improvement",
    ],
    notIncluded: [],
    cta: "GO ELITE",
    href: "/login",
    featured: false,
  },
];

export function PlansPage() {
  return (
    <div
      className="min-h-screen relative overflow-hidden font-['Space_Grotesk'] transition-colors duration-300"
      style={{ background: "transparent", color: "var(--bs-text)" }}
    >
      {/* Grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(var(--bs-grid-color) 1px, transparent 1px), linear-gradient(90deg, var(--bs-grid-color) 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />
      {/* Glow */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-96 blur-[120px] pointer-events-none"
        style={{ background: `color-mix(in srgb, var(--bs-accent-hex) 10%, transparent)` }}
      />

      <div className="relative z-10 pt-24 pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div
              className="inline-flex items-center gap-2 border px-4 py-2 mb-6 transform -skew-x-12"
              style={{ background: "var(--bs-surface)", borderColor: "var(--bs-accent-hex)" }}
            >
              <span className="text-sm font-black uppercase tracking-widest transform skew-x-12" style={{ color: "var(--bs-accent-hex)" }}>
                Choose Your Plan
              </span>
            </div>
            <h1 className="text-6xl font-black mb-4 uppercase tracking-tighter" style={{ color: "var(--bs-text)" }}>
              Level <span style={{ color: "var(--bs-accent-hex)" }}>Up</span>
            </h1>
            <p className="text-xl font-mono uppercase tracking-wide max-w-xl mx-auto text-sm" style={{ color: "var(--bs-text-muted)" }}>
              Invest in your NEET success. Cancel anytime.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className="relative border p-8 flex flex-col transition-all hover:shadow-lg"
                style={{
                  background: "var(--bs-surface)",
                  borderColor: plan.featured ? `color-mix(in srgb, var(--bs-accent-hex) 50%, transparent)` : "var(--bs-border-subtle)",
                  borderLeftWidth: plan.featured ? "4px" : "1px",
                  borderLeftColor: plan.featured ? "var(--bs-accent-hex)" : "var(--bs-border-subtle)",
                }}
              >
                {plan.badge && (
                  <div className="absolute -top-4 left-6">
                    <span
                      className="px-4 py-1.5 text-black text-xs font-black uppercase tracking-widest transform -skew-x-12 inline-block"
                      style={{ background: "var(--bs-accent-hex)" }}
                    >
                      <span className="transform skew-x-12 inline-block">{plan.badge}</span>
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <div
                    className="w-12 h-12 border flex items-center justify-center mb-4 transform -skew-x-12"
                    style={{ background: "var(--bs-surface-2)", borderColor: "var(--bs-border-subtle)" }}
                  >
                    <plan.icon className="w-6 h-6 transform skew-x-12" style={{ color: "var(--bs-accent-hex)" }} />
                  </div>
                  <h2 className="text-2xl font-black mb-1 uppercase tracking-tighter" style={{ color: "var(--bs-text)" }}>
                    {plan.name}
                  </h2>
                  <p className="text-sm font-mono" style={{ color: "var(--bs-text-muted)" }}>{plan.description}</p>
                </div>

                <div className="mb-8">
                  <div className="flex items-end gap-2">
                    <span className="text-5xl font-black tracking-tighter" style={{ color: "var(--bs-text)" }}>{plan.price}</span>
                    <span className="text-sm mb-1 font-mono" style={{ color: "var(--bs-text-muted)" }}>/{plan.period}</span>
                  </div>
                </div>

                <div className="flex-1 space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <div key={f} className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 shrink-0 mt-0.5" strokeWidth={3} style={{ color: "var(--bs-accent-hex)" }} />
                      <span className="text-sm font-mono" style={{ color: "var(--bs-text-muted)" }}>{f}</span>
                    </div>
                  ))}
                  {plan.notIncluded.map((f) => (
                    <div key={f} className="flex items-start gap-2.5 opacity-40">
                      <span className="w-4 h-4 shrink-0 mt-0.5 text-xs" style={{ color: "var(--bs-text-muted)" }}>—</span>
                      <span className="text-sm line-through font-mono" style={{ color: "var(--bs-text-muted)" }}>{f}</span>
                    </div>
                  ))}
                </div>

                <Link to={plan.href} className="group relative block">
                  <div
                    className="absolute inset-0 transform -skew-x-12 translate-x-1.5 translate-y-1.5 opacity-30 group-hover:translate-x-2 group-hover:translate-y-2 transition-transform"
                    style={{ background: "var(--bs-accent-hex)" }}
                  />
                  <div
                    className="relative flex items-center justify-center py-4 font-black uppercase tracking-widest transform -skew-x-12 transition-colors"
                    style={{ background: "var(--bs-accent-hex)", color: "black" }}
                  >
                    <span className="transform skew-x-12">{plan.cta}</span>
                  </div>
                </Link>
              </div>
            ))}
          </div>

          <p className="text-center font-mono text-xs uppercase tracking-widest mt-10" style={{ color: "var(--bs-text-muted)" }}>
            All prices in Indian Rupees (INR) · No hidden fees · Cancel anytime
          </p>
        </div>
      </div>
    </div>
  );
}
