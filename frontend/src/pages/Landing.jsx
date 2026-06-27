import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Clock,
  Lock,
  Search,
  Sparkles,
  CheckCircle2,
  Zap,
  Building2,
} from "lucide-react";
import { BRAND } from "@/lib/brand";
import { LANDING } from "@/constants/testIds";

export default function Landing() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* nav */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src={BRAND.logo} alt={BRAND.name} className="w-9 h-9 rounded-full" />
            <span className="font-display font-semibold tracking-tight text-lg">
              {BRAND.name}
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm text-slate-600">
            <a href="#how" className="hover:text-slate-900">How it works</a>
            <a href="#features" className="hover:text-slate-900">Features</a>
            <a href="#pricing" className="hover:text-slate-900">Why it works</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              data-testid={LANDING.loginBtn}
              className="text-sm font-medium text-slate-700 hover:text-slate-900 px-3 py-2"
            >
              Sign in
            </Link>
            <Link
              to="/signup"
              data-testid={LANDING.getStartedBtn}
              className="text-sm font-medium bg-[#1E3A8A] text-white hover:bg-[#1E3A8A]/90 px-4 py-2 rounded-md transition-colors"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      {/* hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bb-grid-bg opacity-60 pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-6 lg:px-10 pt-16 md:pt-24 pb-20 grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 bb-fade-up">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 bg-white text-[11px] uppercase tracking-[0.22em] text-slate-600">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              For modern, fast-moving teams
            </div>
            <h1 className="mt-6 font-display font-bold text-5xl sm:text-6xl lg:text-7xl tracking-tighter leading-[1.02]">
              Onboard new hires<br />
              <span className="relative inline-block">
                <span className="relative z-10">in 30 minutes,</span>
                <span className="absolute inset-x-0 bottom-1 h-3 bg-blue-200/70 -z-0" />
              </span>{" "}
              not 2 weeks.
            </h1>
            <p className="mt-7 text-lg text-slate-600 max-w-xl leading-relaxed">
              Cognivo turns every company document — HR policies, SOPs, finance
              processes — into an instant AI assistant your employees can ask in plain
              English. Answers come from your data only. Never invented.
            </p>
            <div className="mt-9 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => navigate("/signup")}
                data-testid={LANDING.heroDemoBtn}
                className="group inline-flex items-center justify-center gap-2 bg-[#1E3A8A] text-white px-7 py-3.5 rounded-md font-medium hover:bg-[#1E3A8A]/90 transition-all hover:-translate-y-0.5"
              >
                Create your workspace
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
              <button
                onClick={() => navigate("/login")}
                className="inline-flex items-center justify-center gap-2 bg-white text-slate-900 border border-slate-300 px-7 py-3.5 rounded-md font-medium hover:border-slate-900 transition-colors"
              >
                Try the demo workspace
              </button>
            </div>
            <div className="mt-6 text-xs text-slate-500 font-mono">
              demo · admin@acme.com / Admin@123
            </div>
          </div>

          {/* mock chat panel */}
          <div className="lg:col-span-5 bb-fade-up">
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-br from-blue-100/60 via-transparent to-transparent rounded-3xl blur-2xl" />
              <div className="relative bg-white border border-slate-200 rounded-2xl shadow-2xl shadow-slate-900/10 overflow-hidden">
                <div className="h-10 border-b border-slate-200 flex items-center gap-1.5 px-4 bg-slate-50">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  <span className="ml-3 text-xs text-slate-500 font-mono">
                    acme-corp · ask AI
                  </span>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex justify-end">
                    <div className="bg-[#EFF6FF] text-slate-900 rounded-2xl rounded-tr-sm px-4 py-3 max-w-[85%] text-sm">
                      How do I apply for leave and how many days do I get?
                    </div>
                  </div>
                  <div className="flex">
                    <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[90%] text-sm shadow-sm">
                      <p className="text-slate-800">
                        According to the <span className="font-semibold">HR Policy</span>,
                        you get <span className="font-semibold">18 days of annual paid leave</span>{" "}
                        per year. Submit your request via the HR portal at least 5 working
                        days in advance.
                      </p>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                          <img src={BRAND.logo} alt="" className="w-3 h-3 rounded-full" /> HR Policy Handbook
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <div className="bg-[#EFF6FF] text-slate-900 rounded-2xl rounded-tr-sm px-4 py-3 max-w-[85%] text-sm">
                      What's the maximum discount I can offer to a client?
                    </div>
                  </div>
                  <div className="flex">
                    <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[90%] text-sm shadow-sm">
                      Per the <span className="font-semibold">Sales SOP</span>, max discount
                      without approval is <span className="font-semibold">10%</span>. Anything
                      above 20% needs CEO approval — no exceptions.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* stats strip */}
      <section className="border-y border-slate-200 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { k: "30 min", v: "Time to onboard" },
            { k: "100%", v: "From your docs only" },
            { k: "6", v: "Departments covered" },
            { k: "0", v: "Cross-tenant leakage" },
          ].map((s) => (
            <div key={s.v}>
              <div className="font-display text-3xl md:text-4xl font-bold tracking-tight text-[#1E3A8A]">
                {s.k}
              </div>
              <div className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-500">
                {s.v}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* how it works */}
      <section id="how" className="py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="max-w-2xl">
            <div className="text-xs uppercase tracking-[0.22em] text-slate-500 font-semibold">
              How it works
            </div>
            <h2 className="mt-3 font-display text-4xl md:text-5xl font-semibold tracking-tight">
              Three steps. Zero training.
            </h2>
          </div>
          <div className="mt-16 grid md:grid-cols-3 gap-6 bb-stagger">
            {[
              {
                n: "01",
                t: "Create your workspace",
                d: "Sign up as admin. Get a private, isolated workspace for your company — like a Slack workspace, but for knowledge.",
                i: Building2,
              },
              {
                n: "02",
                t: "Upload your knowledge",
                d: "Drop in PDFs, DOCX, Excel, or text files. Tag by department — HR, Finance, Sales, Engineering, Operations, Marketing.",
                i: FolderIcon,
              },
              {
                n: "03",
                t: "Invite your team",
                d: "Generate invite links. Employees join and instantly start asking questions in plain English. Answers cite the exact document.",
                i: Zap,
              },
            ].map(({ n, t, d, i: Icon }) => (
              <div
                key={n}
                className="relative bg-[#F8FAFC] border border-slate-200 rounded-xl p-7 hover:border-[#1E3A8A] hover:-translate-y-1 transition-all"
              >
                <div className="font-mono text-xs text-slate-400">{n}</div>
                <div className="mt-5 w-11 h-11 rounded-md bg-[#1E3A8A] grid place-items-center text-white">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="mt-5 font-display text-xl font-semibold tracking-tight">
                  {t}
                </h3>
                <p className="mt-3 text-sm text-slate-600 leading-relaxed">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* features grid */}
      <section id="features" className="py-24 border-t border-slate-200 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="max-w-2xl">
            <div className="text-xs uppercase tracking-[0.22em] text-slate-500 font-semibold">
              Features
            </div>
            <h2 className="mt-3 font-display text-4xl md:text-5xl font-semibold tracking-tight">
              Built for serious B2B teams.
            </h2>
          </div>
          <div className="mt-16 grid md:grid-cols-2 lg:grid-cols-3 gap-6 bb-stagger">
            {features.map((f) => (
              <div
                key={f.t}
                className="bg-white border border-slate-200 rounded-xl p-7 hover:shadow-lg hover:-translate-y-0.5 transition-all"
              >
                <f.i className="w-6 h-6 text-[#3B82F6]" />
                <h3 className="mt-5 font-display text-lg font-semibold tracking-tight">
                  {f.t}
                </h3>
                <p className="mt-2.5 text-sm text-slate-600 leading-relaxed">{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="pricing" className="py-24">
        <div className="max-w-5xl mx-auto px-6 lg:px-10">
          <div className="relative rounded-2xl bg-[#0B132B] text-white overflow-hidden p-12 md:p-16">
            <div className="absolute inset-0 bb-grain opacity-60" />
            <div className="relative">
              <h2 className="font-display text-4xl md:text-5xl font-semibold tracking-tight max-w-2xl">
                Stop answering the same question 50 times a week.
              </h2>
              <p className="mt-5 text-slate-300 max-w-xl leading-relaxed">
                Free for early teams. Set up in under 5 minutes. Your data stays
                isolated to your workspace — always.
              </p>
              <div className="mt-9 flex flex-col sm:flex-row gap-3">
                <Link
                  to="/signup"
                  data-testid={LANDING.ctaBottomBtn}
                  className="inline-flex items-center justify-center gap-2 bg-white text-[#0B132B] px-7 py-3.5 rounded-md font-medium hover:bg-slate-100 transition-colors"
                >
                  Create your workspace <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center gap-2 border border-white/20 text-white px-7 py-3.5 rounded-md font-medium hover:bg-white/10 transition-colors"
                >
                  Sign in
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 py-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <img src={BRAND.logo} alt="" className="w-5 h-5 rounded-full" /> Cognivo · Internal AI for modern teams
          </div>
          <div className="text-xs text-slate-400">
            © {new Date().getFullYear()} Cognivo
          </div>
        </div>
      </footer>
    </div>
  );
}

function FolderIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  );
}

const features = [
  {
    t: "Multi-tenant isolation",
    d: "Each company is a fully isolated workspace. Company A never sees Company B's data — ever.",
    i: Lock,
  },
  {
    t: "Source-cited answers",
    d: "Every AI answer cites the source document. No hallucinations — if it's not in your docs, the AI says so.",
    i: CheckCircle2,
  },
  {
    t: "Department-aware search",
    d: "Filter by HR, Finance, Sales, Marketing, Engineering, or Operations to get focused answers.",
    i: Search,
  },
  {
    t: "Instant onboarding",
    d: "New hires get answers immediately instead of waiting days for a manager to reply.",
    i: Clock,
  },
  {
    t: "PDF, DOCX, XLSX, TXT",
    d: "Upload the formats you already use. Auto-extracted and indexed in seconds.",
    i: FolderIcon,
  },
  {
    t: "Powered by Claude",
    d: "Built on Claude Sonnet 4.5 for accurate, reasoned answers grounded in your data.",
    i: Sparkles,
  },
];
