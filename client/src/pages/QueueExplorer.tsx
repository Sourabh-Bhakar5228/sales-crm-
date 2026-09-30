import { useEffect, useState } from "react";
import LeadTable from "../components/leads/LeadTable";
import { getLeads } from "../api/leads.api";
import type { Lead, LeadStatus } from "../types/lead";
import { Filter } from "lucide-react";

export default function QueueExplorer() {
  const [selectedStatus, setSelectedStatus] = useState<LeadStatus | "ALL">("ALL");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeads = async (status?: string) => {
    try {
      setLoading(true);
      const data = await getLeads(status === "ALL" ? undefined : status);
      setLeads(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads(selectedStatus);
  }, [selectedStatus]);

  const tabs: Array<{ id: LeadStatus | "ALL"; label: string; count?: number }> = [
    { id: "ALL", label: "All Active Leads" },
    { id: "CREATED", label: "1. Created" },
    { id: "MEETING", label: "2. Meeting" },
    { id: "VERIFIED", label: "3. Verified" },
    { id: "ALLOCATED", label: "4. Allocated" },
    { id: "CLAIMED", label: "5. Claimed" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Filter size={20} className="text-indigo-600" />
            CRM Lead Queue Explorer
          </h2>
          <p className="text-xs text-slate-500">
            Interactive pipeline inspector displaying leads across all state machine phases.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1.5 border-b border-slate-200 pb-3">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setSelectedStatus(tab.id)}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition ${
              selectedStatus === tab.id
                ? "bg-indigo-600 text-white shadow-xs"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <LeadTable leads={leads} loading={loading} />
    </div>
  );
}
