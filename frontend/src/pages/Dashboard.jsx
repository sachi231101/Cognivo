import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  MessageCircle,
  Users,
  MailPlus,
  TrendingUp,
  ArrowUpRight,
  Brain,
  Upload,
  UserPlus,
  Sparkles,
} from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { DASH } from "@/constants/testIds";

const DEPT_COLORS = {
  HR: "bg-rose-500",
  Finance: "bg-emerald-500",
  Sales: "bg-blue-500",
  Marketing: "bg-amber-500",
  Engineering: "bg-violet-500",
  Operations: "bg-slate-500",
};

export default function Dashboard() {
  const { user, company } = useAuth();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get("/dashboard/stats").then(({ data }) => setStats(data));
  }, []);

  return (
    <div className="px-6 lg:px-10 py-8 max-w-7xl mx-auto" data-testid={DASH.page}>
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <div className="text-xs uppercase tracking-[0.22em] text-slate-500 font-semibold">
            Welcome back, {user?.name?.split(" ")[0]}
          </div>
          <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight">
            {company?.name} · Brain
          </h1>
          <p className="mt-2 text-sm text-slate-600 max-w-xl">
            Track knowledge, questions and team activity across your workspace.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/documents"
            className="inline-flex items-center gap-2 bg-[#1E3A8A] text-white px-5 py-2.5 rounded-md text-sm font-medium hover:bg-[#1E3A8A]/90 transition-colors"
          >
            <Upload className="w-4 h-4" /> Upload document
          </Link>
          <Link
            to="/employees"
            className="inline-flex items-center gap-2 bg-white border border-slate-300 text-slate-900 px-5 py-2.5 rounded-md text-sm font-medium hover:border-slate-900 transition-colors"
          >
            <UserPlus className="w-4 h-4" /> Invite employee
          </Link>
        </div>
      </div>

      {/* Stat cards */}
      <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 bb-stagger">
        <StatCard
          icon={FileText}
          label="Documents"
          value={stats?.total_documents ?? "–"}
          testid={DASH.statDocs}
          accent="bg-blue-50 text-blue-700"
          sub="in knowledge base"
        />
        <StatCard
          icon={MessageCircle}
          label="Questions asked"
          value={stats?.total_questions ?? "–"}
          testid={DASH.statQuestions}
          accent="bg-emerald-50 text-emerald-700"
          sub="all time"
        />
        <StatCard
          icon={Users}
          label="Team members"
          value={stats?.total_members ?? "–"}
          testid={DASH.statMembers}
          accent="bg-violet-50 text-violet-700"
          sub="in workspace"
        />
        <StatCard
          icon={MailPlus}
          label="Pending invites"
          value={stats?.pending_invites ?? "–"}
          testid={DASH.statPending}
          accent="bg-amber-50 text-amber-700"
          sub="awaiting acceptance"
        />
      </div>

      {/* Quick actions */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          to="/chat"
          className="group flex items-center gap-4 p-5 bg-gradient-to-br from-[#1E3A8A] to-[#1d4ed8] text-white rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all"
        >
          <div className="w-10 h-10 rounded-lg bg-white/10 grid place-items-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold">Ask the AI</div>
            <div className="text-xs text-blue-200 mt-0.5">Ask anything from your documents</div>
          </div>
          <ArrowUpRight className="w-4 h-4 opacity-60 group-hover:opacity-100 transition-opacity" />
        </Link>
        <Link
          to="/documents"
          className="group flex items-center gap-4 p-5 bg-white border border-slate-200 rounded-xl hover:shadow-md hover:-translate-y-0.5 transition-all"
        >
          <div className="w-10 h-10 rounded-lg bg-slate-100 grid place-items-center">
            <FileText className="w-5 h-5 text-slate-700" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold text-slate-900">Upload document</div>
            <div className="text-xs text-slate-500 mt-0.5">PDF, DOCX, TXT or website URL</div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 transition-colors" />
        </Link>
        <Link
          to="/employees"
          className="group flex items-center gap-4 p-5 bg-white border border-slate-200 rounded-xl hover:shadow-md hover:-translate-y-0.5 transition-all"
        >
          <div className="w-10 h-10 rounded-lg bg-slate-100 grid place-items-center">
            <UserPlus className="w-5 h-5 text-slate-700" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold text-slate-900">Invite employee</div>
            <div className="text-xs text-slate-500 mt-0.5">Generate a one-time invite link</div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 transition-colors" />
        </Link>
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-7">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold tracking-tight">
              Recent questions
            </h2>
            <span className="text-xs text-slate-500">Last 10</span>
          </div>
          <div className="mt-5 space-y-3" data-testid={DASH.recentActivity}>
            {stats?.recent_activity?.length ? (
              stats.recent_activity.map((a) => (
                <div
                  key={a.id}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 grid place-items-center text-xs font-semibold text-slate-700 shrink-0">
                    {(a.user_name || "?").charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-slate-900 truncate">{a.question}</div>
                    <div className="mt-1 text-[11px] text-slate-500 flex items-center gap-2 flex-wrap">
                      <span>{a.user_name}</span>
                      {a.department && a.department !== "All" && (
                        <span className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-700 uppercase tracking-wider">
                          {a.department}
                        </span>
                      )}
                      <span>· {new Date(a.created_at).toLocaleString("en-IN", { 
                        day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit"
                      })}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-slate-100 mb-3">
                  <Brain className="w-5 h-5 text-slate-400" />
                </div>
                <p className="text-sm text-slate-500">
                  No questions yet. Invite your team and start asking.
                </p>
                <Link to="/chat" className="mt-3 inline-block text-sm font-medium text-[#1E3A8A] hover:underline">
                  Try asking a question →
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-7">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold tracking-tight">
              By department
            </h2>
            <TrendingUp className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-5 space-y-3">
            {stats?.by_department &&
              Object.entries(stats.by_department).map(([dept, count]) => {
                const total = Object.values(stats.by_department).reduce(
                  (a, b) => a + b,
                  0,
                );
                const pct = total ? Math.round((count / total) * 100) : 0;
                return (
                  <div key={dept}>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-700">{dept}</span>
                      <span className="text-slate-500">{count} doc{count !== 1 ? "s" : ""}</span>
                    </div>
                    <div className="mt-1.5 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${DEPT_COLORS[dept]} transition-all duration-700`}
                        style={{ width: `${Math.max(pct, 0)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
          <div className="mt-6 pt-5 border-t border-slate-100">
            <Link
              to="/documents"
              className="text-sm text-[#1E3A8A] font-medium hover:underline inline-flex items-center gap-1"
            >
              View all documents <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, testid, accent, sub }) {
  return (
    <div
      className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-md hover:-translate-y-0.5 transition-all"
      data-testid={testid}
    >
      <div className={`w-10 h-10 rounded-md grid place-items-center ${accent}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="mt-5 font-display text-3xl font-semibold tracking-tight text-slate-900">
        {value}
      </div>
      <div className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-500 font-semibold">
        {label}
      </div>
      {sub && <div className="mt-0.5 text-[11px] text-slate-400">{sub}</div>}
    </div>
  );
}
