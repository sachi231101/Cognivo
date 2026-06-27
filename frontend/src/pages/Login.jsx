import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { BRAND } from "@/lib/brand";
import { AUTH_BB } from "@/constants/testIds";

export default function Login() {
  const navigate = useNavigate();
  const { setSession } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e?.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", { email, password });
      setSession(data.token, data.user, data.company);
      toast.success(`Welcome back, ${data.user.name}`);
      navigate(data.user.role === "admin" ? "/dashboard" : "/chat");
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role) => {
    if (role === "admin") {
      setEmail("admin@acme.com");
      setPassword("Admin@123");
    } else {
      setEmail("employee@acme.com");
      setPassword("Employee@123");
    }
  };

  return (
    <AuthShell>
      <h1 className="font-display text-3xl font-semibold tracking-tight">Welcome back</h1>
      <p className="mt-2 text-sm text-slate-600">
        Sign in to your company workspace.
      </p>
      <form onSubmit={submit} className="mt-8 space-y-4">
        <Field
          label="Work email"
          type="email"
          value={email}
          onChange={setEmail}
          testid={AUTH_BB.loginEmail}
          placeholder="you@company.com"
        />
        <Field
          label="Password"
          type="password"
          value={password}
          onChange={setPassword}
          testid={AUTH_BB.loginPassword}
          placeholder="••••••••"
        />
        <button
          type="submit"
          disabled={loading}
          data-testid={AUTH_BB.loginSubmit}
          className="w-full inline-flex items-center justify-center gap-2 bg-[#1E3A8A] text-white py-3 rounded-md font-medium hover:bg-[#1E3A8A]/90 disabled:opacity-60 transition-colors"
        >
          {loading ? "Signing in…" : <>Sign in <ArrowRight className="w-4 h-4" /></>}
        </button>
      </form>

      <div className="mt-6 p-4 rounded-lg border border-dashed border-slate-300 bg-slate-50">
        <div className="text-[10px] uppercase tracking-[0.22em] text-slate-500 font-semibold flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5" /> Try the demo workspace
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            onClick={() => fillDemo("admin")}
            data-testid={AUTH_BB.demoAdminBtn}
            className="text-xs bg-white border border-slate-200 hover:border-slate-900 py-2 rounded-md font-medium transition-colors"
          >
            Demo as Admin
          </button>
          <button
            onClick={() => fillDemo("employee")}
            data-testid={AUTH_BB.demoEmployeeBtn}
            className="text-xs bg-white border border-slate-200 hover:border-slate-900 py-2 rounded-md font-medium transition-colors"
          >
            Demo as Employee
          </button>
        </div>
      </div>

      <p className="mt-8 text-sm text-slate-600">
        Don't have an account?{" "}
        <Link
          to="/signup"
          data-testid={AUTH_BB.switchToSignup}
          className="font-semibold text-[#1E3A8A] hover:underline"
        >
          Create a workspace
        </Link>
      </p>
    </AuthShell>
  );
}

export function AuthShell({ children }) {
  return (
    <div className="min-h-screen grid md:grid-cols-2">
      <div className="hidden md:flex relative bg-[#0B132B] text-white p-12 flex-col justify-between overflow-hidden">
        <div className="absolute inset-0 bb-grain opacity-50" />
        <Link to="/" className="relative flex items-center gap-2.5">
          <img src={BRAND.logo} alt={BRAND.name} className="w-9 h-9 rounded-full" />
          <span className="font-display font-semibold text-lg">{BRAND.name}</span>
        </Link>
        <div className="relative">
          <div className="text-xs uppercase tracking-[0.22em] text-slate-400">
            What this is
          </div>
          <h2 className="mt-3 font-display text-3xl lg:text-4xl font-semibold tracking-tight leading-tight">
            Your company's collective<br />
            memory — searchable in<br />
            plain English.
          </h2>
          <p className="mt-5 text-slate-300 max-w-md leading-relaxed text-sm">
            Reduce onboarding from 2 weeks to 30 minutes. AI answers come only
            from your uploaded documents — never invented.
          </p>
        </div>
        <div className="relative text-xs text-slate-400 font-mono">
          v1.0 · multi-tenant · isolated
        </div>
      </div>
      <div className="flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}

export function Field({ label, type = "text", value, onChange, testid, placeholder }) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-[0.2em] font-semibold text-slate-600">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        data-testid={testid}
        placeholder={placeholder}
        required
        className="mt-2 w-full px-4 py-2.5 bg-white border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
      />
    </label>
  );
}
