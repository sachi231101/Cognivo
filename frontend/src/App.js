import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider, useAuth } from "@/lib/auth";
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import InviteAccept from "@/pages/InviteAccept";
import Dashboard from "@/pages/Dashboard";
import Documents from "@/pages/Documents";
import Chat from "@/pages/Chat";
import Employees from "@/pages/Employees";
import AppShell from "@/components/AppShell";

function Protected({ children, adminOnly = false }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-500">Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== "admin") return <Navigate to="/chat" replace />;
  return <AppShell>{children}</AppShell>;
}

function RoleHome() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Landing />;
  return <Navigate to={user.role === "admin" ? "/dashboard" : "/chat"} replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" richColors />
        <Routes>
          <Route path="/" element={<RoleHome />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/invite/:token" element={<InviteAccept />} />
          <Route path="/dashboard" element={<Protected adminOnly><Dashboard /></Protected>} />
          <Route path="/documents" element={<Protected><Documents /></Protected>} />
          <Route path="/chat" element={<Protected><Chat /></Protected>} />
          <Route path="/employees" element={<Protected adminOnly><Employees /></Protected>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
