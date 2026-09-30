import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, RefreshCw } from "lucide-react";
import { getLeads } from "../api/leads.api";
import { useAuth } from "../context/AuthContext";
import type { Lead } from "../types/lead";
import LeadTable from "../components/leads/LeadTable";

export default function Leads() {
  const { user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadLeads = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getLeads();
      const resolvedLeads = response.data || response;
      setLeads(resolvedLeads);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load leads");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeads();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Leads</h1>
          <p className="text-xs text-slate-500">
            Active workflow queue for <strong className="text-indigo-600">{user?.role}</strong> department.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={loadLeads}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-xs"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>

          {/* Role-based create button: visible ONLY for MARKETING */}
          {user?.role === "MARKETING" && (
            <Link
              to="/marketing/create"
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-indigo-700 transition"
            >
              <Plus size={15} />
              Create Lead
            </Link>
          )}
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-medium text-rose-700">
          {error}
        </div>
      )}

      {/* Leads Table */}
      <LeadTable leads={leads} loading={loading} />
    </div>
  );
}
