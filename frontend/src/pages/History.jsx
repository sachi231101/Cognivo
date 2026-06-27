import { useEffect, useState } from "react";
import { Brain, FileText, Clock, ChevronDown, ChevronUp, Search, Filter } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";

const DEPARTMENTS = ["All", "HR", "Finance", "Sales", "Marketing", "Engineering", "Operations"];

const DEPT_COLORS = {
  HR: "bg-rose-100 text-rose-700",
  Finance: "bg-emerald-100 text-emerald-700",
  Sales: "bg-blue-100 text-blue-700",
  Marketing: "bg-amber-100 text-amber-700",
  Engineering: "bg-violet-100 text-violet-700",
  Operations: "bg-slate-100 text-slate-700",
};

export default function History() {
  const { user, company } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dept, setDept] = useState("All");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    api.get("/chat/history")
      .then(({ data }) => {
        // Reverse to show newest first
        setHistory([...data].reverse());
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = history.filter((h) => {
    if (dept !== "All" && h.department !== dept) return false;
    if (search && !h.question.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const toggle = (id) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="px-6 lg:px-10 py-8 max-w-5xl mx-auto">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <div className="text-xs uppercase tracking-[0.22em] text-slate-500 font-semibold">
            My Questions
          </div>
          <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight">
            My History
          </h1>
          <p className="mt-2 text-sm text-slate-600 max-w-xl">
            All questions you've asked from {company?.name}'s knowledge base.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2">
          <Brain className="w-4 h-4 text-[#1E3A8A]" />
          <span className="font-medium text-slate-700">{filtered.length}</span>
          <span>questions</span>
        </div>
      </div>

      {/* Filters */}
      <div className="mt-8 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search your questions…"
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <select
            value={dept}
            onChange={(e) => setDept(e.target.value)}
            className="pl-9 pr-4 py-2.5 bg-white border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
          >
            {DEPARTMENTS.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
        </div>
      </div>

      {/* History List */}
      <div className="mt-6 space-y-3">
        {loading ? (
          <div className="py-20 text-center">
            <div className="inline-flex gap-1">
              {[0, 150, 300].map((d) => (
                <span
                  key={d}
                  className="w-2 h-2 rounded-full bg-slate-400 animate-bounce"
                  style={{ animationDelay: `${d}ms` }}
                />
              ))}
            </div>
            <p className="mt-3 text-sm text-slate-500">Loading your history…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center bg-white border border-slate-200 rounded-xl">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-slate-100 mb-4">
              <Clock className="w-6 h-6 text-slate-400" />
            </div>
            <p className="text-sm font-medium text-slate-700">No questions yet</p>
            <p className="mt-1 text-xs text-slate-500">
              {search || dept !== "All"
                ? "Try adjusting your filters."
                : "Head over to Ask AI to get started."}
            </p>
          </div>
        ) : (
          <div className="bb-stagger">
            {filtered.map((h, i) => {
              const isOpen = expanded[h.id];
              return (
                <div
                  key={h.id}
                  className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-sm transition-shadow"
                >
                  <button
                    onClick={() => toggle(h.id)}
                    className="w-full px-6 py-5 flex items-start gap-4 text-left"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#EFF6FF] grid place-items-center shrink-0 mt-0.5">
                      <Brain className="w-4 h-4 text-[#1E3A8A]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-sm font-medium text-slate-900 leading-snug">
                          {h.question}
                        </p>
                        {isOpen ? (
                          <ChevronUp className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                        )}
                      </div>
                      <div className="mt-2 flex items-center gap-2 flex-wrap">
                        {h.department && h.department !== "All" && (
                          <span className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded ${DEPT_COLORS[h.department] || "bg-slate-100 text-slate-700"}`}>
                            {h.department}
                          </span>
                        )}
                        <span className="text-[11px] text-slate-400">
                          {new Date(h.created_at).toLocaleString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        {h.sources?.length > 0 && (
                          <span className="text-[11px] text-slate-400">
                            · {h.sources.length} source{h.sources.length > 1 ? "s" : ""}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-6 pb-5 border-t border-slate-100 pt-4">
                      <div className="ml-12">
                        <div className="text-[10px] uppercase tracking-[0.2em] font-semibold text-slate-400 mb-2">
                          AI Answer
                        </div>
                        <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                          {h.answer}
                        </p>
                        {h.sources?.length > 0 && (
                          <div className="mt-4 pt-3 border-t border-slate-100">
                            <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-semibold mb-2">
                              Sources
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {h.sources.map((s) => (
                                <span
                                  key={s.doc_id}
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-700 rounded text-[11px]"
                                >
                                  <FileText className="w-3 h-3" />
                                  {s.doc_name}
                                  <span className="text-[9px] uppercase tracking-wider text-slate-500">
                                    · {s.department}
                                  </span>
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
