import { useEffect, useState } from "react";
import { UserPlus, Copy, X, Trash2, Mail, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { EMP } from "@/constants/testIds";

export default function Employees() {
  const [data, setData] = useState({ members: [], pending_invites: [] });
  const [showInvite, setShowInvite] = useState(false);

  const load = async () => {
    const { data } = await api.get("/employees");
    setData(data);
  };
  useEffect(() => {
    load();
  }, []);

  const remove = async (id) => {
    if (!window.confirm("Remove this employee from your workspace?")) return;
    await api.delete(`/employees/${id}`);
    toast.success("Employee removed");
    load();
  };

  return (
    <div className="px-6 lg:px-10 py-8 max-w-6xl mx-auto" data-testid={EMP.page}>
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <div className="text-xs uppercase tracking-[0.22em] text-slate-500 font-semibold">
            Team
          </div>
          <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight">
            Employees
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Invite teammates to access your company knowledge.
          </p>
        </div>
        <button
          onClick={() => setShowInvite(true)}
          data-testid={EMP.inviteBtn}
          className="inline-flex items-center gap-2 bg-[#1E3A8A] text-white px-5 py-2.5 rounded-md text-sm font-medium hover:bg-[#1E3A8A]/90 transition-colors"
        >
          <UserPlus className="w-4 h-4" /> Invite employee
        </button>
      </div>

      <section className="mt-10">
        <div className="text-xs uppercase tracking-[0.22em] text-slate-500 font-semibold mb-3">
          Members ({data.members.length})
        </div>
        <div
          className="bg-white border border-slate-200 rounded-xl overflow-hidden"
          data-testid={EMP.membersList}
        >
          <ul className="divide-y divide-slate-200">
            {data.members.map((m) => (
              <li key={m.id} className="px-5 py-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 grid place-items-center font-semibold text-sm shrink-0">
                  {m.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-900 truncate">
                    {m.name}
                  </div>
                  <div className="text-xs text-slate-500 truncate">{m.email}</div>
                </div>
                <span
                  className={`text-[10px] uppercase tracking-[0.18em] font-semibold px-2 py-1 rounded ${
                    m.role === "admin"
                      ? "bg-blue-50 text-blue-700"
                      : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {m.role}
                </span>
                {m.role !== "admin" && (
                  <button
                    onClick={() => remove(m.id)}
                    data-testid={EMP.removeMember(m.id)}
                    className="p-2 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {data.pending_invites.length > 0 && (
        <section className="mt-10">
          <div className="text-xs uppercase tracking-[0.22em] text-slate-500 font-semibold mb-3">
            Pending invites ({data.pending_invites.length})
          </div>
          <div
            className="bg-white border border-slate-200 rounded-xl overflow-hidden"
            data-testid={EMP.pendingList}
          >
            <ul className="divide-y divide-slate-200">
              {data.pending_invites.map((inv) => (
                <PendingRow key={inv.id} inv={inv} />
              ))}
            </ul>
          </div>
        </section>
      )}

      {showInvite && (
        <InviteDialog onClose={() => setShowInvite(false)} onSent={load} />
      )}
    </div>
  );
}

function PendingRow({ inv }) {
  const link = `${window.location.origin}/invite/${inv.token}`;
  const [copied, setCopied] = useState(false);
  return (
    <li className="px-5 py-4 flex items-center gap-4">
      <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 grid place-items-center shrink-0">
        <Mail className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-slate-900 truncate">
          {inv.email}
        </div>
        <div className="text-xs text-slate-500 font-mono truncate">{link}</div>
      </div>
      <button
        onClick={() => {
          navigator.clipboard.writeText(link);
          setCopied(true);
          toast.success("Invite link copied");
          setTimeout(() => setCopied(false), 1500);
        }}
        className="px-3 py-2 text-xs font-medium border border-slate-300 rounded-md hover:border-slate-900 transition-colors inline-flex items-center gap-1.5"
      >
        {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
        Copy link
      </button>
    </li>
  );
}

function InviteDialog({ onClose, onSent }) {
  const [email, setEmail] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post("/invites", {
        email,
        invite_base_url: window.location.origin,
      });
      const link = data.invite_link.startsWith("http")
        ? data.invite_link
        : `${window.location.origin}${data.invite_link}`;
      setResult({ email: data.email, link, emailSent: data.email_sent, emailError: data.email_error });
      if (data.email_sent) {
        toast.success(`Invite email sent to ${data.email}`);
      } else {
        toast.warning("Invite created. Email could not be sent — share the link manually.");
      }
      onSent();
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Could not create invite");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      data-testid={EMP.inviteDialog}
    >
      <div className="absolute inset-0 bg-slate-900/60" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-900"
        >
          <X className="w-4 h-4" />
        </button>
        {!result ? (
          <>
            <h3 className="font-display text-xl font-semibold tracking-tight">
              Invite employee
            </h3>
            <p className="mt-1 text-sm text-slate-600">
              We'll generate a one-time invite link you can share with them.
            </p>
            <form onSubmit={submit} className="mt-6 space-y-4">
              <label className="block">
                <span className="text-xs uppercase tracking-[0.2em] font-semibold text-slate-600">
                  Employee email
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  data-testid={EMP.inviteEmailInput}
                  placeholder="alex@acme.com"
                  className="mt-2 w-full px-4 py-2.5 bg-white border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </label>
              <button
                type="submit"
                disabled={loading}
                data-testid={EMP.inviteSubmitBtn}
                className="w-full bg-[#1E3A8A] text-white py-3 rounded-md font-medium hover:bg-[#1E3A8A]/90 disabled:opacity-60 transition-colors"
              >
                {loading ? "Creating…" : "Create invite link"}
              </button>
            </form>
          </>
        ) : (
          <div data-testid={EMP.inviteLinkResult}>
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${result.emailSent ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
              <CheckCircle2 className="w-3.5 h-3.5" />
              {result.emailSent ? "Invite email sent" : "Invite created (email not sent)"}
            </div>
            <h3 className="mt-4 font-display text-xl font-semibold tracking-tight">
              {result.emailSent ? "Email on its way" : "Share this link"}
            </h3>
            <p className="mt-1 text-sm text-slate-600">
              <span className="font-medium text-slate-900">{result.email}</span>{" "}
              {result.emailSent
                ? "will receive an email with the invite link."
                : "can sign up using this link."}
            </p>
            {result.emailError && (
              <div className="mt-3 p-2.5 bg-red-50 border border-red-200 rounded-md text-xs text-red-700">
                Email error: {result.emailError}
              </div>
            )}
            <div className="mt-5 p-3 bg-slate-50 border border-slate-200 rounded-md text-xs font-mono break-all">
              {result.link}
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(result.link);
                toast.success("Link copied to clipboard");
              }}
              data-testid={EMP.copyInviteLink}
              className="mt-5 w-full bg-[#1E3A8A] text-white py-3 rounded-md font-medium hover:bg-[#1E3A8A]/90 transition-colors inline-flex items-center justify-center gap-2"
            >
              <Copy className="w-4 h-4" /> Copy invite link
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
