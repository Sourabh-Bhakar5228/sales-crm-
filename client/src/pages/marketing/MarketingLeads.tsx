import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import LeadTable from "../../components/leads/LeadTable";
import Modal from "../../components/common/Modal";
import { getLeads, createLead } from "../../api/leads.api";
import type { Lead } from "../../types/lead";
import { Plus, UserPlus, AlertCircle } from "lucide-react";

export default function MarketingLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [name, setName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
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

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!/^[0-9]{10}$/.test(contactNumber.trim())) {
      setError("Contact number must be exactly 10 numeric digits");
      return;
    }

    try {
      setSubmitting(true);
      await createLead({ name: name.trim(), contactNumber: contactNumber.trim() });
      setName("");
      setContactNumber("");
      setIsModalOpen(false);
      setSuccessMsg("Lead created successfully in CREATED status!");
      fetchLeads();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create lead");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Marketing Lead Generation</h2>
          <p className="text-xs text-slate-500">
            Generate new customer inquiries. Initial status is <span className="font-semibold text-blue-600">CREATED</span>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/marketing/create"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-xs"
          >
            Full Page Form
          </Link>

          <button
            type="button"
            onClick={() => {
              setError("");
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-indigo-700 transition"
          >
            <Plus size={16} />
            Quick Create Lead
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-700 font-medium">
          ✓ {successMsg}
        </div>
      )}

      {/* Leads Table */}
      <LeadTable leads={leads} loading={loading} />

      {/* Create Lead Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Customer Lead"
        subtitle="Step 1 in CRM workflow (Enters CREATED status)"
      >
        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700 font-medium">
            <AlertCircle size={15} />
            {error}
          </div>
        )}

        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Customer Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ramesh Chandra"
              required
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Contact Number (10 Digits)
            </label>
            <input
              type="tel"
              value={contactNumber}
              maxLength={10}
              onChange={(e) => setContactNumber(e.target.value.replace(/\D/g, ""))}
              placeholder="e.g. 9876543210"
              required
              className="w-full font-mono rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
            />
            <p className="mt-1 text-[11px] text-slate-400">Strictly locked against edits once created.</p>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-indigo-700 transition disabled:opacity-50"
            >
              <UserPlus size={14} />
              {submitting ? "Creating..." : "Save Lead"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
