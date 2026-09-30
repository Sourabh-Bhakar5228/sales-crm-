import { useEffect, useState, type FormEvent } from "react";
import LeadTable from "../../components/leads/LeadTable";
import Modal from "../../components/common/Modal";
import { getLeads, markMeeting } from "../../api/leads.api";
import type { Lead } from "../../types/lead";
import { CalendarCheck, Lock, AlertCircle, Check } from "lucide-react";

export default function CommunicationLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [name, setName] = useState("");
  const [postalAddress, setPostalAddress] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("14:00");
  const [remark, setRemark] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const data = await getLeads();
      setLeads(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleOpenScheduleModal = (lead: Lead) => {
    setSelectedLead(lead);
    setName(lead.name);
    setPostalAddress(lead.postalAddress || "");
    setDate(lead.date ? new Date(lead.date).toISOString().split("T")[0] : new Date().toISOString().split("T")[0]);
    setTime(lead.time || "14:30");
    setRemark(lead.remark || "");
    setError("");
  };

  const handleScheduleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedLead) return;
    setError("");
    setSuccessMsg("");

    try {
      setSubmitting(true);
      await markMeeting(selectedLead._id, {
        name: name.trim(),
        postalAddress: postalAddress.trim(),
        date: new Date(date).toISOString(),
        time: time.trim(),
        remark: remark.trim() || undefined,
      });

      setSelectedLead(null);
      setSuccessMsg(`Meeting scheduled for ${name}! Lead moved to MEETING status.`);
      fetchLeads();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to schedule meeting");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Communication Meeting Dispatch</h2>
          <p className="text-xs text-slate-500">
            Confirm meeting schedule and postal address. Transitions leads from{" "}
            <span className="font-semibold text-blue-600">CREATED</span> ➔{" "}
            <span className="font-semibold text-amber-600">MEETING</span>.
          </p>
        </div>
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
        actionLabel="Schedule Meeting"
        actionIcon={<CalendarCheck size={14} />}
        onAction={handleOpenScheduleModal}
      />

      {/* Schedule Meeting Modal */}
      <Modal
        isOpen={Boolean(selectedLead)}
        onClose={() => setSelectedLead(null)}
        title="Schedule Customer Meeting"
        subtitle="Confirm meeting date, time, and complete postal address"
        maxWidth="lg"
      >
        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700 font-medium">
            <AlertCircle size={15} />
            {error}
          </div>
        )}

        <form onSubmit={handleScheduleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Customer Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-900 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">Contact Number</label>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-500 uppercase">
                  <Lock size={10} /> Locked Field
                </span>
              </div>
              <input
                type="text"
                disabled
                value={selectedLead?.contactNumber || ""}
                className="w-full font-mono rounded-xl border border-slate-200 bg-slate-100 px-3.5 py-2 text-xs text-slate-500 cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Complete Postal Address</label>
            <textarea
              rows={2}
              value={postalAddress}
              onChange={(e) => setPostalAddress(e.target.value)}
              placeholder="Building, street, landmark, city, state, pincode"
              required
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-900 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Meeting Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-900 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Meeting Time (HH:mm)</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-900 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Special Remark</label>
            <input
              type="text"
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              placeholder="e.g. Client requested evening discussion"
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-900 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setSelectedLead(null)}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-amber-700 transition disabled:opacity-50"
            >
              <Check size={14} />
              {submitting ? "Moving to Meeting..." : "Confirm & Move to MEETING"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
