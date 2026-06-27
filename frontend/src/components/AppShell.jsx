import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  MessageSquare,
  FolderOpen,
  Users,
  LogOut,
  Brain,
  ChevronDown,
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { SIDEBAR, AUTH_BB } from "@/constants/testIds";

const navItemsFor = (role) => {
  const base = [
    { to: "/chat", label: "Ask AI", icon: MessageSquare, testid: SIDEBAR.navChat },
    { to: "/documents", label: "Knowledge Base", icon: FolderOpen, testid: SIDEBAR.navDocuments },
  ];
  if (role === "admin") {
    return [
      { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, testid: SIDEBAR.navDashboard },
      ...base,
      { to: "/employees", label: "Employees", icon: Users, testid: SIDEBAR.navEmployees },
    ];
  }
  return base;
};

export default function AppShell({ children }) {
  const { user, company, logout } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const items = navItemsFor(user?.role);

  const SidebarBody = (
    <>
      <div className="px-6 py-7 border-b border-white/5">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-md bg-blue-600 grid place-items-center shadow-lg shadow-blue-900/40">
            <Brain className="w-5 h-5 text-white" strokeWidth={2.2} />
          </div>
          <div>
            <div className="text-white font-display font-semibold text-lg leading-none">
              Business Brain
            </div>
            <div className="text-[10px] uppercase tracking-[0.22em] text-slate-400 mt-1">
              Internal AI
            </div>
          </div>
        </Link>
        {company && (
          <div className="mt-6 px-3 py-2 rounded-md bg-white/5 border border-white/5">
            <div className="text-[10px] uppercase tracking-[0.22em] text-slate-400">
              Workspace
            </div>
            <div className="text-sm text-white font-medium truncate" data-testid="sidebar-workspace-name">
              {company.name}
            </div>
          </div>
        )}
      </div>

      <nav className="flex-1 px-3 py-5 space-y-1" data-testid={SIDEBAR.nav}>
        {items.map((it) => {
          const active = location.pathname === it.to;
          const Icon = it.icon;
          return (
            <Link
              key={it.to}
              to={it.to}
              data-testid={it.testid}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all ${
                active
                  ? "bg-white/10 text-white"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon className="w-4 h-4" />
              {it.label}
              {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400" />}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-white/5">
        <div
          className="flex items-center gap-3 px-3 py-2.5 rounded-md bg-white/5"
          data-testid={SIDEBAR.userMenu}
        >
          <div className="w-9 h-9 rounded-full bg-blue-600 grid place-items-center text-white font-semibold text-sm">
            {(user?.name || "U").charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm text-white font-medium truncate">{user?.name}</div>
            <div className="text-[11px] text-slate-400 uppercase tracking-wider">
              {user?.role}
            </div>
          </div>
          <button
            onClick={logout}
            data-testid={AUTH_BB.logoutBtn}
            className="p-2 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex fixed inset-y-0 left-0 w-64 bg-[#0B132B] text-white flex-col z-30">
        {SidebarBody}
      </aside>

      {/* Mobile top bar */}
      <header className="md:hidden sticky top-0 z-40 flex items-center justify-between px-4 h-14 bg-white border-b border-slate-200">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-md hover:bg-slate-100"
          data-testid="mobile-menu-open"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded bg-blue-600 grid place-items-center">
            <Brain className="w-4 h-4 text-white" />
          </div>
          <span className="font-display font-semibold">Business Brain</span>
        </div>
        <div className="w-9" />
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-slate-900/60"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative w-72 bg-[#0B132B] text-white flex flex-col">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-md hover:bg-white/10 text-white"
              data-testid="mobile-menu-close"
            >
              <X className="w-5 h-5" />
            </button>
            {SidebarBody}
          </aside>
        </div>
      )}

      <main className="md:ml-64 min-h-screen">{children}</main>
    </div>
  );
}
