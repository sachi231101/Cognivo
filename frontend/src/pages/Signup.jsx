import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { AUTH_BB } from "@/constants/testIds";
import { AuthShell, Field } from "@/pages/Login";

export default function Signup() {
  const navigate = useNavigate();
  const { setSession } = useAuth();
  const [companyName, setCompanyName] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post("/auth/signup", {
        company_name: companyName,
        name,
        email,
        password,
      });
      setSession(data.token, data.user, data.company);
      toast.success(`Workspace created — welcome, ${data.user.name}`);
      navigate("/dashboard");
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell>
      <h1 className="font-display text-3xl font-semibold tracking-tight">
        Create your workspace
      </h1>
      <p className="mt-2 text-sm text-slate-600">
        You'll be the admin. Invite your team after setup.
      </p>
      <form onSubmit={submit} className="mt-8 space-y-4">
        <Field
          label="Company name"
          value={companyName}
          onChange={setCompanyName}
          testid={AUTH_BB.signupCompany}
          placeholder="Acme Corp"
        />
        <Field
          label="Your name"
          value={name}
          onChange={setName}
          testid={AUTH_BB.signupName}
          placeholder="Jane Doe"
        />
        <Field
          label="Work email"
          type="email"
          value={email}
          onChange={setEmail}
          testid={AUTH_BB.signupEmail}
          placeholder="jane@acme.com"
        />
        <Field
          label="Password"
          type="password"
          value={password}
          onChange={setPassword}
          testid={AUTH_BB.signupPassword}
          placeholder="At least 6 characters"
        />
        <button
          type="submit"
          disabled={loading}
          data-testid={AUTH_BB.signupSubmit}
          className="w-full inline-flex items-center justify-center gap-2 bg-[#1E3A8A] text-white py-3 rounded-md font-medium hover:bg-[#1E3A8A]/90 disabled:opacity-60 transition-colors"
        >
          {loading ? "Creating…" : <>Create workspace <ArrowRight className="w-4 h-4" /></>}
        </button>
      </form>
      <p className="mt-8 text-sm text-slate-600">
        Already have an account?{" "}
        <Link
          to="/login"
          data-testid={AUTH_BB.switchToLogin}
          className="font-semibold text-[#1E3A8A] hover:underline"
        >
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
