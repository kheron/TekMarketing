import Link from "next/link";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  GitBranch,
  Mail,
  Shield,
  Sparkles,
  Zap,
} from "lucide-react";
import {
  TEKHERO_COMMERCIAL_DOCS_URL,
  TEKHERO_CONTACT_EMAIL,
  TEKHERO_GITHUB_URL,
  TEKHERO_PRODUCT_PATH,
  TEKHERO_URL,
} from "@/lib/config/tekhero";

const openCoreFeatures = [
  "Autonomous planning agent with Zod-validated outputs",
  "Human-in-the-loop approvals (draft + reasoning)",
  "Multi-platform Content Studio",
  "Multi-provider AI (OpenAI, Anthropic, xAI, Google)",
  "Full audit trail (ActivityLog, AgentRun)",
  "Self-host for personal & non-commercial use",
];

const commercialFeatures = [
  "Business & client production license",
  "TEKHERO managed SaaS hosting",
  "White-label & custom domain",
  "Priority support & SLA",
  "SSO, multi-tenant, agency workspaces",
  "Advanced agent tools & publishing connectors",
];

const tiers = [
  {
    name: "Open Core",
    price: "$0",
    period: "personal / non-commercial",
    description: "Full source on GitHub. Ideal for learning, evaluation, and portfolio.",
    cta: "View on GitHub",
    href: TEKHERO_GITHUB_URL,
    secondary: true,
  },
  {
    name: "Business Self-Hosted",
    price: "from $199",
    period: "/ month",
    description: "Commercial license for one production deployment. Email support included.",
    cta: "Contact TEKHERO",
    href: `mailto:${TEKHERO_CONTACT_EMAIL}?subject=TekMarketing%20Business%20License`,
    highlight: false,
  },
  {
    name: "Hosted SaaS",
    price: "from $499",
    period: "/ month",
    description: "Fully managed instance — Postgres, backups, scheduling, onboarding.",
    cta: "Request demo",
    href: `mailto:${TEKHERO_CONTACT_EMAIL}?subject=TekMarketing%20Hosted%20SaaS`,
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "white-label",
    description: "Your brand, your clients. SSO, RBAC, custom agent workflows.",
    cta: "Talk to sales",
    href: `mailto:${TEKHERO_CONTACT_EMAIL}?subject=TekMarketing%20Enterprise`,
    secondary: true,
  },
];

export default function TekmarketingLandingPage() {
  return (
    <div className="min-h-screen bg-[#09090b] text-[#f4f4f5]">
      {/* Nav */}
      <header className="border-b border-[#27272a] bg-[#09090b]/90 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-sm font-bold">
              TM
            </div>
            <div>
              <div className="font-semibold text-sm leading-none">TekMarketing</div>
              <div className="text-[10px] text-[#52525b] tracking-widest uppercase mt-0.5">
                by TEKHERO
              </div>
            </div>
          </div>
          <nav className="hidden sm:flex items-center gap-6 text-sm text-[#a1a1aa]">
            <a href="#features" className="hover:text-white transition-colors">
              Features
            </a>
            <a href="#pricing" className="hover:text-white transition-colors">
              Pricing
            </a>
            <a
              href={TEKHERO_GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              GitHub
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/" className="btn btn-secondary text-sm h-9 px-4 hidden sm:inline-flex">
              Open app
            </Link>
            <a
              href={`mailto:${TEKHERO_CONTACT_EMAIL}`}
              className="btn btn-primary text-sm h-9 px-4"
            >
              Contact
            </a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16">
        <div className="max-w-3xl">
          <p className="text-sm text-blue-400 font-medium mb-4 tracking-wide uppercase">
            Open Core AI Marketing Agent
          </p>
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight leading-[1.1]">
            Strategic marketing AI that never publishes without your approval.
          </h1>
          <p className="mt-6 text-lg text-[#a1a1aa] leading-relaxed max-w-2xl">
            TekMarketing plans content like a senior marketing manager — loads brand
            context, proposes high-ROI campaigns, and waits for human sign-off. Built
            by{" "}
            <a href={TEKHERO_URL} className="text-[#f4f4f5] hover:underline">
              TEKHERO
            </a>{" "}
            for teams who need agent power without brand risk.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/" className="btn btn-primary h-11 px-6 text-sm">
              Try the app
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href={TEKHERO_GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary h-11 px-6 text-sm"
            >
              <GitBranch className="w-4 h-4" />
              Open Core on GitHub
            </a>
          </div>
          <p className="mt-6 text-xs text-[#52525b]">
            Personal & non-commercial use is free. Business production requires a{" "}
            <a href={TEKHERO_COMMERCIAL_DOCS_URL} className="text-[#71717a] hover:underline">
              TEKHERO license
            </a>
            .
          </p>
        </div>
      </section>

      {/* Value props */}
      <section className="border-y border-[#27272a] bg-[#111113]/50">
        <div className="max-w-6xl mx-auto px-6 py-12 grid sm:grid-cols-3 gap-8">
          {[
            {
              icon: Shield,
              title: "Human-in-the-loop",
              text: "No publish path bypasses explicit approval. Full audit trail on every decision.",
            },
            {
              icon: Sparkles,
              title: "Structured agent outputs",
              text: "Zod-validated JSON from every LLM call — no fragile free-text parsing.",
            },
            {
              icon: Zap,
              title: "Multi-provider AI",
              text: "OpenAI, Anthropic, xAI, Google — unified callAI() with usage tracking.",
            },
          ].map((item) => (
            <div key={item.title} className="space-y-3">
              <item.icon className="w-5 h-5 text-blue-400" />
              <div className="font-medium">{item.title}</div>
              <p className="text-sm text-[#71717a] leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-2xl font-semibold tracking-tight mb-10">
          Open Core vs. Commercial
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="card p-8">
            <div className="text-sm text-[#71717a] mb-2">Included in GitHub</div>
            <div className="text-xl font-semibold mb-6">Open Core</div>
            <ul className="space-y-3">
              {openCoreFeatures.map((f) => (
                <li key={f} className="flex gap-3 text-sm text-[#a1a1aa]">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
          <div className="card p-8 border-blue-500/20 bg-blue-500/[0.03]">
            <div className="text-sm text-blue-400 mb-2">TEKHERO licensed</div>
            <div className="text-xl font-semibold mb-6">Commercial</div>
            <ul className="space-y-3">
              {commercialFeatures.map((f) => (
                <li key={f} className="flex gap-3 text-sm text-[#a1a1aa]">
                  <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="border-t border-[#27272a] bg-[#111113]/30 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-2xl font-semibold tracking-tight mb-3">Pricing</h2>
          <p className="text-[#71717a] mb-10 max-w-xl">
            Indicative tiers — final quotes depend on team size and deployment model.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {tiers.map((tier) => (
              <div
                key={tier.name}
                className={`card p-6 flex flex-col ${
                  tier.highlight ? "ring-1 ring-blue-500/40" : ""
                }`}
              >
                <div className="font-medium text-sm text-[#a1a1aa]">{tier.name}</div>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-2xl font-semibold">{tier.price}</span>
                  <span className="text-xs text-[#52525b]">{tier.period}</span>
                </div>
                <p className="mt-4 text-sm text-[#71717a] leading-relaxed flex-1">
                  {tier.description}
                </p>
                <a
                  href={tier.href}
                  target={tier.href.startsWith("mailto") ? undefined : "_blank"}
                  rel="noopener noreferrer"
                  className={`mt-6 btn text-sm h-10 w-full ${
                    tier.highlight
                      ? "btn-primary"
                      : tier.secondary
                        ? "btn-secondary"
                        : "btn-secondary"
                  }`}
                >
                  {tier.cta}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 py-20 text-center">
        <h2 className="text-2xl font-semibold tracking-tight">
          Ready for a strategic marketing agent?
        </h2>
        <p className="mt-4 text-[#71717a] max-w-lg mx-auto">
          Clone Open Core for evaluation, or talk to TEKHERO about hosted SaaS and
          white-label for your clients.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link href="/" className="btn btn-primary h-11 px-6">
            Launch app
          </Link>
          <a
            href={`mailto:${TEKHERO_CONTACT_EMAIL}?subject=TekMarketing%20inquiry`}
            className="btn btn-secondary h-11 px-6"
          >
            <Mail className="w-4 h-4" />
            {TEKHERO_CONTACT_EMAIL}
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#27272a] py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-sm text-[#52525b]">
          <div>
            © 2026{" "}
            <a href={TEKHERO_URL} className="text-[#a1a1aa] hover:text-white">
              TEKHERO
            </a>
            {" · "}
            <a href={TEKHERO_URL} className="hover:text-[#a1a1aa]">
              Korey Heron
            </a>
          </div>
          <div className="flex flex-wrap gap-4">
            <Link href="/" className="hover:text-[#a1a1aa]">
              App
            </Link>
            <a href={TEKHERO_GITHUB_URL} className="hover:text-[#a1a1aa]">
              GitHub
            </a>
            <a href={TEKHERO_COMMERCIAL_DOCS_URL} className="hover:text-[#a1a1aa]">
              License
            </a>
            <span className="text-[#3f3f46]">{TEKHERO_PRODUCT_PATH}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}