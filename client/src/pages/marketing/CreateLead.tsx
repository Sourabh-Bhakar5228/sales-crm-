import { useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createLead } from "../../api/leads.api";
import { ArrowLeft, UserPlus, CheckCircle2, AlertCircle } from "lucide-react";

export default function CreateLead() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!/^\d{10}$/.test(contactNumber.trim())) {
      setError("Contact number must contain exactly 10 digits");
      return;
    }

    try {
      setLoading(true);
      await createLead({
        name: name.trim(),
        contactNumber: contactNumber.trim(),
      });

      setSuccess("Lead created successfully in CREATED status!");
      setName("");
      setContactNumber("");

      setTimeout(() => {
        navigate("/leads");
      }, 700);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create lead");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link
          to="/leads"
          className="rounded-xl border border-slate-200 bg-white p-2 text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition"
        >
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Create New Lead</h1>
          <p className="text-xs text-slate-500">
            Generate and register a new customer inquiry in the CRM. Initial status: <strong className="text-blue-600">CREATED</strong>.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-7 shadow-xs space-y-5">
        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 p-3.5 text-xs text-rose-700 font-medium">
            <AlertCircle size={15} />
            {error}
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-3.5 text-xs text-emerald-700 font-medium">
            <CheckCircle2 size={15} />
            {success}
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">Customer Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Rahul Sharma"
            className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
            required
            minLength={2}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">Contact Number</label>
          <input
            type="tel"
            inputMode="numeric"
            maxLength={10}
            value={contactNumber}
            onChange={(e) => setContactNumber(e.target.value.replace(/\D/g, ""))}
            placeholder="10-digit mobile number"
            className="w-full font-mono rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
            required
          />
          <p className="mt-1 text-[11px] text-slate-400">
            Once saved, the contact number cannot be modified by any department.
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Link
            to="/leads"
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-6 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-indigo-700 transition disabled:opacity-50"
          >
            <UserPlus size={15} />
            {loading ? "Creating Lead..." : "Create Lead"}
          </button>
        </div>
      </form>
    </div>
  );
}
