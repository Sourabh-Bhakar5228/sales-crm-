import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { getLeadById } from "../../api/leads.api";
import {
  allocateLead,
  getSalesUsers,
  type SalesUser,
} from "../../api/support.api";
import type { Lead } from "../../types/lead";
import {
  ArrowLeft,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  Calendar,
  Phone,
  User,
  MapPin,
  FileAudio,
  ShieldCheck,
} from "lucide-react";

export default function SupportLead() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [lead, setLead] = useState<Lead | null>(null);
  const [salesUsers, setSalesUsers] = useState<SalesUser[]>([]);
  const [selectedSalesUser, setSelectedSalesUser] = useState("");
  const [loading, setLoading] = useState(true);
  const [allocating, setAllocating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!id) return;

    const loadData = async () => {
      try {
        setLoading(true);
        const [leadResponse, usersResponse] = await Promise.all([
          getLeadById(id),
          getSalesUsers(),
        ]);

        setLead(leadResponse.data);
        setSalesUsers(usersResponse.data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Unable to load support data"
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  const handleAllocate = async () => {
    if (!id) return;

    if (!selectedSalesUser) {
      setError("Please select a Sales user.");
      return;
    }

    if (!lead?.date) {
      setError("Date must be verified before allocation.");
      return;
    }

    if (!lead?.time) {
      setError("Time must be verified before allocation.");
      return;
    }

    if (!lead?.postalAddress?.trim()) {
      setError("Complete address is required before allocation.");
      return;
    }

    try {
      setAllocating(true);
      setError("");
      setSuccess("");

      const response = await allocateLead(id, selectedSalesUser);

      setLead(response.data);
      setSuccess("Lead allocated successfully to Sales rep.");

      setTimeout(() => {
        navigate("/leads");
      }, 800);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to allocate lead"
      );
    } finally {
      setAllocating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
          <p className="text-xs text-slate-500 font-medium">Loading lead verification data...</p>
        </div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="space-y-4">
        <Link
          to="/leads"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:underline"
        >
          <ArrowLeft size={14} /> Back to Leads
        </Link>
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
          Lead not found or access denied.
        </div>
      </div>
    );
  }

  const isChecklistComplete =
    Boolean(lead.date) &&
    Boolean(lead.time) &&
    Boolean(lead.postalAddress?.trim()) &&
    Boolean(lead.audio?.url);

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          to="/leads"
          className="rounded-xl border border-slate-200 bg-white p-2 text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition"
        >
          <ArrowLeft size={16} />
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900">Support Verification</h1>
            <span className="rounded-md bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700">
              VERIFIED ➔ ALLOCATED
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Verify all meeting parameters and customer audio before allocating to a Sales executive.
          </p>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 p-4 text-xs font-medium text-rose-700">
          <AlertCircle size={16} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-xs font-medium text-emerald-700">
          <CheckCircle2 size={16} className="shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Lead Information */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Lead Information</h2>
            <p className="text-xs text-slate-500">
              Verify the required meeting details and address before allocation.
            </p>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-mono font-medium text-slate-700">
            Status: {lead.status}
          </span>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {/* Customer Name */}
          <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <User size={13} className="text-slate-400" />
              Customer Name
            </div>
            <p className="mt-1.5 text-sm font-semibold text-slate-900">{lead.name}</p>
          </div>

          {/* Contact Number */}
          <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <Phone size={13} className="text-slate-400" />
              Contact Number
            </div>
            <p className="mt-1.5 font-mono text-sm font-semibold text-slate-900">{lead.contactNumber}</p>
          </div>

          {/* Date */}
          <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <Calendar size={13} className="text-slate-400" />
              Meeting Date
            </div>
            <p className="mt-1.5 text-sm font-semibold text-slate-900">
              {lead.date ? new Date(lead.date).toLocaleDateString() : "Not available"}
            </p>
          </div>

          {/* Time */}
          <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <Clock size={13} className="text-slate-400" />
              Meeting Time
            </div>
            <p className="mt-1.5 text-sm font-semibold text-slate-900">
              {lead.time || "Not available"}
            </p>
          </div>

          {/* Complete Postal Address */}
          <div className="md:col-span-2 rounded-xl border border-slate-100 bg-slate-50/50 p-4">
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <MapPin size={13} className="text-slate-400" />
              Complete Postal Address
            </div>
            <p className="mt-1.5 text-sm text-slate-800 font-medium">
              {lead.postalAddress || "Not available"}
            </p>
          </div>

          {/* Remark */}
          <div className="md:col-span-2 rounded-xl border border-slate-100 bg-slate-50/50 p-4">
            <p className="text-xs font-medium text-slate-500">Remarks & Vigilance Notes</p>
            <p className="mt-1.5 text-xs text-slate-700 italic">
              {lead.remark || "No remarks provided"}
            </p>
          </div>
        </div>
      </div>

      {/* Verification Checklist */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-indigo-600" />
            <h2 className="text-base font-semibold text-slate-900">Pre-Allocation Checklist</h2>
          </div>
          <span
            className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
              isChecklistComplete
                ? "bg-emerald-50 text-emerald-700"
                : "bg-amber-50 text-amber-700"
            }`}
          >
            {isChecklistComplete ? "All Requirements Met" : "Requirements Incomplete"}
          </span>
        </div>

        <div className="space-y-2.5">
          <VerificationItem
            icon={<Calendar size={15} />}
            label="Date is scheduled and confirmed"
            checked={Boolean(lead.date)}
          />

          <VerificationItem
            icon={<Clock size={15} />}
            label="Time slot is specified"
            checked={Boolean(lead.time)}
          />

          <VerificationItem
            icon={<MapPin size={15} />}
            label="Complete postal address is verified"
            checked={Boolean(lead.postalAddress?.trim())}
          />

          <VerificationItem
            icon={<FileAudio size={15} />}
            label="Customer call audio proof attached"
            checked={Boolean(lead.audio?.url)}
          />
        </div>
      </div>

      {/* Sales Allocation */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
        <div className="border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <UserCheck size={18} className="text-indigo-600" />
            <h2 className="text-base font-semibold text-slate-900">Allocate to Sales</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Select an active Sales representative to assign this verified lead.
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Assign to Sales Representative
          </label>
          <select
            value={selectedSalesUser}
            onChange={(e) => setSelectedSalesUser(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition"
          >
            <option value="">Select an active Sales executive...</option>
            {salesUsers.map((salesUser) => (
              <option key={salesUser._id} value={salesUser._id}>
                {salesUser.name} — ({salesUser.email})
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-slate-100">
          <p className="text-xs text-slate-500">
            {!selectedSalesUser
              ? "Select a sales executive above to enable allocation."
              : !isChecklistComplete
              ? "All checklist items must be satisfied before allocation."
              : "Ready to allocate lead to the selected representative."}
          </p>

          <button
            type="button"
            onClick={handleAllocate}
            disabled={
              allocating ||
              !selectedSalesUser ||
              !lead.date ||
              !lead.time ||
              !lead.postalAddress?.trim()
            }
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-black transition disabled:cursor-not-allowed disabled:opacity-40"
          >
            <UserCheck size={15} />
            {allocating ? "Allocating Lead..." : "Allocate to Sales"}
          </button>
        </div>
      </div>
    </div>
  );
}

function VerificationItem({
  icon,
  label,
  checked,
}: {
  icon?: React.ReactNode;
  label: string;
  checked: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between rounded-xl border px-4 py-3 text-xs transition ${
        checked
          ? "border-emerald-200 bg-emerald-50/40 text-emerald-900"
          : "border-slate-200 bg-slate-50 text-slate-500"
      }`}
    >
      <div className="flex items-center gap-2.5 font-medium">
        {icon}
        <span>{label}</span>
      </div>

      <span
        className={`inline-flex items-center gap-1 font-semibold ${
          checked ? "text-emerald-700" : "text-slate-400 italic"
        }`}
      >
        {checked ? (
          <>
            <CheckCircle2 size={14} className="text-emerald-600" />
            Verified
          </>
        ) : (
          "Missing"
        )}
      </span>
    </div>
  );
}
