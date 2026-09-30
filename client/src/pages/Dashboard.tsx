import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getLeads, getLeadStats, type LeadStats } from "../api/leads.api";
import type { Lead } from "../types/lead";
import {
  Send,
  CalendarCheck,
  ShieldCheck,
  CheckCircle,
  Headphones,
  ArrowRight,
  TrendingUp,
  BarChart3,
  Clock,
  Layers,
} from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<LeadStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getLeads().catch(() => []),
      getLeadStats().catch(() => null),
    ])
      .then(([leadsData, statsData]) => {
        setLeads(leadsData);
        setStats(statsData);
      })
      .finally(() => setLoading(false));
  }, []);

  const stages = [
    {
      name: "CREATED",
      dept: "Marketing",
      desc: "Fresh leads generated",
      icon: <Send className="text-blue-600" size={20} />,
      count: stats?.byStatus?.CREATED ?? 0,
      color: "border-blue-200 bg-blue-50/40",
    },
    {
      name: "MEETING",
      dept: "Communication",
      desc: "Meeting scheduled & details confirmed",
      icon: <CalendarCheck className="text-amber-600" size={20} />,
      count: stats?.byStatus?.MEETING ?? 0,
      color: "border-amber-200 bg-amber-50/40",
    },
    {
      name: "VERIFIED",
      dept: "Vigilance",
      desc: "Audio uploaded & verified",
      icon: <ShieldCheck className="text-purple-600" size={20} />,
      count: stats?.byStatus?.VERIFIED ?? 0,
      color: "border-purple-200 bg-purple-50/40",
    },
    {
      name: "ALLOCATED",
      dept: "Support",
      desc: "Assigned to sales representative",
      icon: <CheckCircle className="text-indigo-600" size={20} />,
      count: stats?.byStatus?.ALLOCATED ?? 0,
      color: "border-indigo-200 bg-indigo-50/40",
    },
    {
      name: "CLAIMED",
      dept: "Sales",
      desc: "Full audio completed & claimed",
      icon: <Headphones className="text-emerald-600" size={20} />,
      count: stats?.byStatus?.CLAIMED ?? 0,
      color: "border-emerald-200 bg-emerald-50/40",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-indigo-700 via-indigo-600 to-indigo-800 p-8 text-white shadow-xl">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-block rounded-lg bg-white/20 backdrop-blur-xs px-3 py-1 text-xs font-semibold tracking-wider uppercase mb-3">
            {user?.role} Department
          </span>
          <h2 className="text-3xl font-extrabold tracking-tight">Welcome, {user?.name}</h2>
          <p className="mt-2 text-sm text-indigo-100 leading-relaxed">
            You are operating with full role-based permissions for <strong>{user?.role}</strong>. Your
            queue only reflects actionable leads according to CRM business rules.
          </p>
          <div className="mt-6 flex items-center gap-3">
            <Link
              to="/leads"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-xs font-bold text-indigo-700 shadow-md hover:bg-indigo-50 transition"
            >
              Open Department Workspace
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </div>

      {/* 17.11 Dashboard Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Total Leads */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Total Pipeline Leads
              </p>
              <h3 className="mt-2 text-3xl font-extrabold text-slate-900">
                {loading ? "..." : stats?.total ?? leads.length}
              </h3>
            </div>
            <div className="rounded-2xl bg-indigo-50 p-3 text-indigo-600">
              <Layers size={24} />
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-400">Total volume in CRM database</p>
        </div>

        {/* Pending Action */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Actionable / In Progress
              </p>
              <h3 className="mt-2 text-3xl font-extrabold text-amber-600">
                {loading ? "..." : stats?.pending ?? leads.length}
              </h3>
            </div>
            <div className="rounded-2xl bg-amber-50 p-3 text-amber-600">
              <Clock size={24} />
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-400">Leads awaiting department action</p>
        </div>

        {/* Completed Leads */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Successfully Processed
              </p>
              <h3 className="mt-2 text-3xl font-extrabold text-emerald-600">
                {loading ? "..." : stats?.completed ?? (stats?.byStatus?.CLAIMED ?? 0)}
              </h3>
            </div>
            <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600">
              <BarChart3 size={24} />
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-400">Promoted forward or claimed</p>
        </div>
      </div>

      {/* State Machine Pipeline */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp size={18} className="text-indigo-600" />
              CRM Workflow State Machine Pipeline
            </h3>
            <p className="text-xs text-slate-500">
              Unidirectional linear workflow strictly validated at backend service layer.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {stages.map((stage) => {
            const isUserStage =
              (user?.role === "MARKETING" && stage.name === "CREATED") ||
              (user?.role === "COMMUNICATION" && stage.name === "MEETING") ||
              (user?.role === "VIGILANCE" && stage.name === "VERIFIED") ||
              (user?.role === "SUPPORT" && stage.name === "ALLOCATED") ||
              (user?.role === "SALES" && stage.name === "CLAIMED");

            return (
              <div
                key={stage.name}
                className={`relative rounded-2xl border p-5 bg-white shadow-xs transition hover:shadow-md ${
                  isUserStage ? "ring-2 ring-indigo-500 border-indigo-200" : "border-slate-200"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 rounded-xl bg-slate-50">{stage.icon}</div>
                  <span className="rounded-full bg-slate-100 text-slate-700 text-xs font-bold px-2 py-0.5">
                    {stage.count}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900">{stage.name}</h4>
                <p className="text-xs font-semibold text-slate-600">{stage.dept}</p>
                <p className="text-[11px] text-slate-400 mt-1">{stage.desc}</p>
                {isUserStage && (
                  <div className="mt-2.5">
                    <span className="inline-block rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700">
                      Your Queue
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Department Queue Preview */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-sm font-bold text-slate-900">Your Action Queue ({leads.length} Leads)</h4>
            <p className="text-xs text-slate-500">Leads waiting for action by {user?.role} department.</p>
          </div>
          <Link
            to="/leads"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition"
          >
            View Full Queue ➔
          </Link>
        </div>

        {loading ? (
          <div className="flex h-32 items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
          </div>
        ) : leads.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-xs text-slate-400">
            No active leads in your queue.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {leads.slice(0, 5).map((lead) => (
              <div key={lead._id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <p className="font-semibold text-slate-800">{lead.name}</p>
                  <p className="text-[11px] font-mono text-slate-400">{lead.contactNumber}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                    {lead.status}
                  </span>
                  <Link
                    to="/leads"
                    className="font-medium text-indigo-600 hover:underline"
                  >
                    Action
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
