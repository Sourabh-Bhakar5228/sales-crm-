import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  LogOut,
  ShieldCheck,
  Send,
  CalendarCheck,
  Headphones,
  CheckCircle,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import type { Role } from "../types/auth";

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const roleNavItems: Record<Role, { label: string; path: string; icon: React.ReactNode }> = {
    MARKETING: {
      label: "Create & View Leads",
      path: "/leads",
      icon: <Send size={18} />,
    },
    COMMUNICATION: {
      label: "Meeting Queue",
      path: "/leads",
      icon: <CalendarCheck size={18} />,
    },
    VIGILANCE: {
      label: "Audio & Verification",
      path: "/leads",
      icon: <ShieldCheck size={18} />,
    },
    SUPPORT: {
      label: "Sales Allocation",
      path: "/leads",
      icon: <CheckCircle size={18} />,
    },
    SALES: {
      label: "My Allocated Leads",
      path: "/leads",
      icon: <Headphones size={18} />,
    },
  };

  const currentRoleNav = user?.role ? roleNavItems[user.role] : null;

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-200 bg-white flex flex-col shrink-0">
        {/* Brand */}
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white font-bold text-lg shadow-sm">
              V
            </div>
            <div>
              <h1 className="font-bold text-slate-900 text-base leading-tight">Vibh-Anu CRM</h1>
              <p className="text-[11px] text-slate-400 font-medium">Enterprise RBAC Workflow</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1.5 flex-1">
          <Link
            to="/dashboard"
            className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${
              location.pathname === "/dashboard"
                ? "bg-indigo-50 text-indigo-700"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <LayoutDashboard size={18} />
            Overview
          </Link>

          {currentRoleNav && (
            <Link
              to={currentRoleNav.path}
              className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${
                location.pathname === currentRoleNav.path
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              {currentRoleNav.icon}
              {currentRoleNav.label}
            </Link>
          )}

          <Link
            to="/all-leads"
            className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${
              location.pathname === "/all-leads"
                ? "bg-indigo-50 text-indigo-700"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <Users size={18} />
            Queue Explorer
          </Link>
        </nav>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100 mb-2">
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-slate-900 truncate">{user?.name}</p>
              <span className="inline-block text-[10px] font-bold text-indigo-600 tracking-wider">
                {user?.role}
              </span>
            </div>
            <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" title="Online" />
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 transition"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-8">
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-700">
              Department: {user?.role}
            </span>
          </div>
          <div className="text-xs text-slate-500">
            Active Role: <span className="font-semibold text-slate-800">{user?.role}</span>
          </div>
        </header>

        <div className="flex-1 p-8 overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
