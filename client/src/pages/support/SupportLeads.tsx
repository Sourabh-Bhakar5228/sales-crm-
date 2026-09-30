import { useEffect, useState } from "react";
import LeadTable from "../../components/leads/LeadTable";
import Modal from "../../components/common/Modal";
import { getLeads, getSalesUsers, allocateLead } from "../../api/leads.api";
import type { Lead } from "../../types/lead";
import type { User } from "../../types/auth";
import { CheckCircle2, UserCheck, Calendar, Clock, MapPin, Volume2, AlertCircle } from "lucide-react";

export default function SupportLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [salesUsers, setSalesUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [selectedSalesUserId, setSelectedSalesUserId] = useState("");
  const [allocating, setAllocating] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const [leadsData, usersData] = await Promise.all([getLeads(), getSalesUsers()]);
      setLeads(leadsData);
      setSalesUsers(usersData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAllocateModal = (lead: Lead) => {
    setSelectedLead(lead);
    setSelectedSalesUserId(salesUsers[0]?._id || salesUsers[0]?.id || "");
    setError("");
  };

  const handleAllocate = async () => {
    if (!selectedLead || !selectedSalesUserId) return;
    setError("");

    try {
      setAllocating(true);
      await allocateLead(selectedLead._id, selectedSalesUserId);
      setSelectedLead(null);
      setSuccessMsg(`Lead ${selectedLead.name} successfully ALLOCATED to Sales representative!`);
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Allocation failed");
    } finally {
      setAllocating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Support Lead Allocation</h2>
        <p className="text-xs text-slate-500">
          Review verified customer meeting details and assign to an active Sales rep. Transitions leads from{" "}
          <span className="font-semibold text-emerald-600">VERIFIED</span> ➔{" "}
          <span className="font-semibold text-purple-600">ALLOCATED</span>.
        </p>
      </div>

      {successMsg && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-700 font-medium">
          ✓ {successMsg}
        </div>
      )}

      {/* Leads Table */}
      <LeadTable
        leads={leads}
        loading={loading}
        actionLabel="Allocate to Sales"
        actionIcon={<UserCheck size={14} />}
        onAction={handleOpenAllocateModal}
      />

      {/* Allocation Modal */}
      <Modal
        isOpen={Boolean(selectedLead)}
        onClose={() => setSelectedLead(null)}
        title="Allocate Lead to Sales Rep"
        subtitle={`Verify meeting parameters and assign ${selectedLead?.name}`}
        maxWidth="lg"
      >
        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700 font-medium">
            <AlertCircle size={15} />
            {error}
          </div>
        )}

        <div className="space-y-4">
          {/* Verification Checklist Card */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 space-y-2 text-xs">
            <h4 className="font-bold text-slate-800 uppercase tracking-wider mb-2">
              Verification Checklist:
            </h4>

            <div className="flex items-center gap-2 text-slate-700">
              <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
              <span>Customer: <strong>{selectedLead?.name}</strong> ({selectedLead?.contactNumber})</span>
            </div>

            <div className="flex items-center gap-2 text-slate-700">
              <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
              <span className="flex items-center gap-2">
                <MapPin size={12} className="text-slate-400" />
                {selectedLead?.postalAddress || "No address specified"}
              </span>
            </div>

            <div className="flex items-center gap-2 text-slate-700">
              <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
              <span className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <Calendar size={12} className="text-slate-400" />
                  {selectedLead?.date ? new Date(selectedLead.date).toLocaleDateString() : "No date"}
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={12} className="text-slate-400" />
                  {selectedLead?.time || "No time"}
                </span>
              </span>
            </div>

            <div className="flex items-center gap-2 text-slate-700">
              <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
              <span className="flex items-center gap-1">
                <Volume2 size={12} className="text-emerald-600" />
                Audio Recording: <strong>Verified</strong>
              </span>
            </div>
          </div>

          {/* Sales User Dropdown */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Select Active Sales Representative
            </label>
            <select
              value={selectedSalesUserId}
              onChange={(e) => setSelectedSalesUserId(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
            >
              {salesUsers.map((u) => {
                const uid = u._id || u.id;
                return (
                  <option key={uid} value={uid}>
                    {u.name} ({u.email})
                  </option>
                );
              })}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setSelectedLead(null)}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAllocate}
              disabled={allocating || !selectedSalesUserId}
              className="inline-flex items-center gap-1.5 rounded-xl bg-purple-600 px-5 py-2 text-xs font-semibold text-white shadow-md hover:bg-purple-700 transition disabled:opacity-50"
            >
              <UserCheck size={14} />
              {allocating ? "Allocating..." : "Confirm Allocation"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
