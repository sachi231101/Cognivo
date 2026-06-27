import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ArrowRight, Mail } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { AUTH_BB } from "@/constants/testIds";
import { AuthShell, Field } from "@/pages/Login";

export default function InviteAccept() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { setSession } = useAuth();
  const [invite, setInvite] = useState(null);
  const [err, setErr] = useState(null);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get(`/invites/${token}`).then(({ data }) => setInvite(data)).catch((e) => {
      setErr(e?.response?.data?.detail || "Invite invalid or already used");
    });
  }, [token]);

  const accept = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post("/invites/accept", { token, name, password });
      setSession(data.token, data.user, data.company);
      toast.success(`Joined ${data.company.name}!`);
      navigate("/chat");
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Failed to accept invite");
    } finally {
      setLoading(false);
    }
  };

  if (err) {
    return (
      <AuthShell>
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          Invite unavailable
        </h1>
        <p className="mt-3 text-sm text-slate-600">{err}</p>
      </AuthShell>
    );
  }
  if (!invite) {
    return <AuthShell><div className="text-slate-500">Loading invite…</div></AuthShell>;
  }

  return (
    <AuthShell>
      <div className="text-xs uppercase tracking-[0.22em] font-semibold text-slate-500">
        Invitation
      </div>
      <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight">
        Join {invite.company_name}
      </h1>
      <p className="mt-3 text-sm text-slate-600 flex items-center gap-2">
        <Mail className="w-4 h-4" />
        Inviting <span className="font-medium text-slate-900">{invite.email}</span>
      </p>
      <form onSubmit={accept} className="mt-8 space-y-4">
        <Field
          label="Your full name"
          value={name}
          onChange={setName}
          testid={AUTH_BB.inviteName}
          placeholder="Alex Morgan"
        />
        <Field
          label="Create a password"
          type="password"
          value={password}
          onChange={setPassword}
          testid={AUTH_BB.invitePassword}
          placeholder="At least 6 characters"
        />
        <button
          type="submit"
          disabled={loading}
          data-testid={AUTH_BB.inviteSubmit}
          className="w-full inline-flex items-center justify-center gap-2 bg-[#1E3A8A] text-white py-3 rounded-md font-medium hover:bg-[#1E3A8A]/90 disabled:opacity-60 transition-colors"
        >
          {loading ? "Joining…" : <>Join workspace <ArrowRight className="w-4 h-4" /></>}
        </button>
      </form>
    </AuthShell>
  );
}
