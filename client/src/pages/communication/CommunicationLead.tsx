import {
  useState,
  useEffect,
  type FormEvent,
} from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { getLeadById } from "../../api/leads.api";
import { markMeeting } from "../../api/communication.api";
import type { Lead } from "../../types/lead";
import { ArrowLeft, Lock, CalendarCheck, AlertCircle } from "lucide-react";

export default function CommunicationLead() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [lead, setLead] = useState<Lead | null>(null);
  const [name, setName] = useState("");
  const [postalAddress, setPostalAddress] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [remark, setRemark] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    const loadLead = async () => {
      try {
        const response = await getLeadById(id);
        const currentLead: Lead = response.data || response;

        setLead(currentLead);
        setName(currentLead.name || "");
        setPostalAddress(currentLead.postalAddress || "");

        if (currentLead.date) {
          setDate(currentLead.date.substring(0, 10));
        } else {
          setDate(new Date().toISOString().substring(0, 10));
        }

        setTime(currentLead.time || "14:30");
        setRemark(currentLead.remark || "");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load lead");
      } finally {
        setLoading(false);
      }
    };

    loadLead();
  }, [id]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!id) return;

    try {
      setSubmitting(true);
      setError("");

      await markMeeting(id, {
        name: name.trim(),
        postalAddress: postalAddress.trim(),
        date,
        time: time.trim(),
        remark: remark.trim() || undefined,
      });

      navigate("/leads");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to mark meeting");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
          <p className="text-xs text-slate-500 font-medium">Loading lead details...</p>
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

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Link
          to="/leads"
          className="rounded-xl border border-slate-200 bg-white p-2 text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition"
        >
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Communication Department</h1>
          <p className="text-xs text-slate-500">
            Confirm meeting details with the customer. Transitions lead from{" "}
            <strong className="text-blue-600">CREATED</strong> ➔ <strong className="text-amber-600">MEETING</strong>.
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 p-4 text-xs font-medium text-rose-700">
          <AlertCircle size={15} />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-slate-200 bg-white p-7 shadow-xs">
        {/* Customer Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">Customer Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
            required
            minLength={2}
          />
        </div>

        {/* Contact - LOCKED */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-slate-700">Contact Number</label>
            <span className="inline-flex items-center gap-1 rounded-md bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-600 uppercase">
              <Lock size={10} /> Locked Field
            </span>
          </div>
          <input
            type="text"
            value={lead.contactNumber}
            disabled
            className="w-full font-mono cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 px-3.5 py-2.5 text-sm text-slate-500"
          />
          <p className="mt-1 text-[11px] text-slate-400">
            Contact number is strictly immutable and protected by backend authorization.
          </p>
        </div>

        {/* Postal Address */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">Postal Address</label>
          <textarea
            value={postalAddress}
            onChange={(e) => setPostalAddress(e.target.value)}
            rows={3}
            className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
            placeholder="Enter complete postal address with landmark and city"
            required
          />
        </div>

        {/* Date + Time */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Meeting Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Meeting Time (HH:mm)</label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
              required
            />
          </div>
        </div>

        {/* Remark */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">Communication Remarks</label>
          <textarea
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
            rows={3}
            maxLength={1000}
            className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
            placeholder="Enter any notes from customer conversation"
          />
          <p className="mt-1 text-right text-[11px] text-slate-400">{remark.length}/1000</p>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Link
            to="/leads"
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 px-6 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-amber-700 transition disabled:opacity-50"
          >
            <CalendarCheck size={15} />
            {submitting ? "Saving..." : "Confirm & Move to Meeting"}
          </button>
        </div>
      </form>
    </div>
  );
}
