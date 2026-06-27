import { useEffect, useRef, useState } from "react";
import { Send, Sparkles, FileText, Plus, Brain } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { CHAT } from "@/constants/testIds";

const DEPARTMENTS = ["All", "HR", "Finance", "Sales", "Marketing", "Engineering", "Operations"];

const SUGGESTIONS = [
  "How do I apply for leave?",
  "What is the max discount I can give?",
  "Who approves expenses above 10,000?",
  "What is the work-from-home policy?",
];

export default function Chat() {
  const { user, company } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [dept, setDept] = useState("All");
  const [sending, setSending] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    api.get("/chat/history").then(({ data }) => {
      const msgs = [];
      data.forEach((c) => {
        msgs.push({ role: "user", text: c.question, dept: c.department });
        msgs.push({ role: "ai", text: c.answer, sources: c.sources });
      });
      setMessages(msgs);
    });
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  const send = async (text) => {
    const q = (text ?? input).trim();
    if (!q || sending) return;
    setMessages((m) => [...m, { role: "user", text: q, dept }]);
    setInput("");
    setSending(true);
    try {
      const { data } = await api.post("/chat", {
        message: q,
        department: dept === "All" ? null : dept,
      });
      setMessages((m) => [
        ...m,
        { role: "ai", text: data.answer, sources: data.sources },
      ]);
    } catch (err) {
      toast.error(err?.response?.data?.detail || "AI error");
      setMessages((m) => [
        ...m,
        {
          role: "ai",
          text: "Sorry, something went wrong reaching the AI. Try again.",
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  const newChat = () => setMessages([]);

  return (
    <div
      className="flex flex-col h-screen md:h-screen"
      data-testid={CHAT.page}
    >
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-xl px-6 lg:px-10 py-4 flex items-center justify-between sticky top-0 z-10">
        <div>
          <div className="text-[10px] uppercase tracking-[0.22em] font-semibold text-slate-500">
            {company?.name} · AI Assistant
          </div>
          <h1 className="font-display text-xl font-semibold tracking-tight">
            Ask anything from your company knowledge
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={dept}
            onChange={(e) => setDept(e.target.value)}
            data-testid={CHAT.deptFilter}
            className="px-3 py-2 bg-white border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {DEPARTMENTS.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
          <button
            onClick={newChat}
            data-testid={CHAT.newChatBtn}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-300 rounded-md text-sm font-medium hover:border-slate-900 transition-colors"
          >
            <Plus className="w-4 h-4" /> New
          </button>
        </div>
      </header>

      <div
        className="flex-1 overflow-y-auto px-4 md:px-10 py-6"
        data-testid={CHAT.messageList}
      >
        <div className="max-w-3xl mx-auto">
          {messages.length === 0 && (
            <div className="py-10 text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#1E3A8A] text-white mb-5">
                <Brain className="w-7 h-7" />
              </div>
              <h2 className="font-display text-3xl font-semibold tracking-tight">
                Hi {user?.name?.split(" ")[0]} — what would you like to know?
              </h2>
              <p className="mt-3 text-sm text-slate-600 max-w-md mx-auto">
                Answers come only from your company's uploaded documents. The AI
                will tell you if it doesn't know.
              </p>
              <div className="mt-9 grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl mx-auto bb-stagger">
                {SUGGESTIONS.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => send(s)}
                    data-testid={`chat-suggestion-${i}`}
                    className="text-left px-4 py-3 bg-white border border-slate-200 rounded-lg text-sm hover:border-[#1E3A8A] hover:-translate-y-0.5 transition-all"
                  >
                    <Sparkles className="w-3.5 h-3.5 inline-block mr-2 text-blue-500" />
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-5">
            {messages.map((m, i) => (
              <MessageBubble key={i} m={m} />
            ))}
            {sending && (
              <div className="flex">
                <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm p-5 shadow-sm">
                  <div className="flex gap-1">
                    {[0, 150, 300].map((d) => (
                      <span
                        key={d}
                        className="w-2 h-2 rounded-full bg-slate-400 animate-bounce"
                        style={{ animationDelay: `${d}ms` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>
        </div>
      </div>

      <div className="border-t border-slate-200 bg-white px-4 md:px-10 py-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
          className="max-w-3xl mx-auto relative"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Ask about ${dept === "All" ? "anything" : dept.toLowerCase()}…`}
            data-testid={CHAT.input}
            className="w-full pl-5 pr-14 py-4 bg-white border border-slate-300 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={sending || !input.trim()}
            data-testid={CHAT.sendBtn}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[#1E3A8A] text-white grid place-items-center hover:bg-[#1E3A8A]/90 disabled:opacity-40 transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <div className="max-w-3xl mx-auto mt-2 text-[11px] text-slate-500 text-center">
          AI answers come from your company knowledge base only.
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ m }) {
  if (m.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="bg-[#EFF6FF] text-slate-900 rounded-2xl rounded-tr-sm px-5 py-3.5 max-w-[85%] text-sm leading-relaxed shadow-sm">
          {m.text}
        </div>
      </div>
    );
  }
  return (
    <div className="flex">
      <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-5 py-4 max-w-[90%] text-sm leading-relaxed shadow-sm whitespace-pre-wrap">
        {m.text}
        {m.sources?.length > 0 && (
          <div className="mt-4 pt-3 border-t border-slate-100">
            <div className="text-[10px] uppercase tracking-[0.22em] text-slate-500 font-semibold mb-2">
              Sources
            </div>
            <div className="flex flex-wrap gap-1.5">
              {m.sources.map((s) => (
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
  );
}
