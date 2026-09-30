import {
  type ChangeEvent,
  type FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { getLeadById } from "../../api/leads.api";
import {
  updateVigilanceLead,
  uploadLeadAudio,
  verifyLead,
} from "../../api/vigilance.api";
import type { Lead } from "../../types/lead";
import {
  ArrowLeft,
  Lock,
  Mic,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  FileAudio,
  ShieldCheck,
  Save,
} from "lucide-react";

const MAX_AUDIO_SIZE = 20 * 1024 * 1024; // 20 MB

const ALLOWED_AUDIO_TYPES = [
  "audio/mpeg",
  "audio/wav",
  "audio/wave",
  "audio/x-wav",
  "audio/ogg",
  "audio/webm",
  "audio/mp4",
  "audio/x-m4a",
];

export default function VigilanceLead() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const audioInputRef = useRef<HTMLInputElement | null>(null);

  const [lead, setLead] = useState<Lead | null>(null);
  const [name, setName] = useState("");
  const [postalAddress, setPostalAddress] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [remark, setRemark] = useState("");

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!id) return;

    const loadLead = async () => {
      try {
        const response = await getLeadById(id);
        const currentLead = response.data;

        setLead(currentLead);
        setName(currentLead.name || "");
        setPostalAddress(currentLead.postalAddress || "");
        setDate(currentLead.date ? currentLead.date.substring(0, 10) : "");
        setTime(currentLead.time || "");
        setRemark(currentLead.remark || "");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load lead");
      } finally {
        setLoading(false);
      }
    };

    loadLead();
  }, [id]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError("");
    setSuccess("");

    if (!ALLOWED_AUDIO_TYPES.includes(file.type)) {
      setError(
        "Invalid audio format. Please select MP3, WAV, OGG, WEBM or M4A."
      );
      event.target.value = "";
      return;
    }

    if (file.size > MAX_AUDIO_SIZE) {
      setError("Audio file must be smaller than 20 MB.");
      event.target.value = "";
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSaveDetails = async (event: FormEvent) => {
    event.preventDefault();
    if (!id) return;

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const response = await updateVigilanceLead(id, {
        name,
        postalAddress,
        date,
        time,
        remark,
      });

      setLead(response.data);
      setSuccess("Lead details updated successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update lead");
    } finally {
      setSaving(false);
    }
  };

  const handleUploadAudio = async () => {
    if (!id || !selectedFile) {
      setError("Please select an audio file first.");
      return;
    }

    try {
      setUploading(true);
      setError("");
      setSuccess("");

      const response = await uploadLeadAudio(id, selectedFile);
      setLead(response.data);
      setSelectedFile(null);

      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(null);

      if (audioInputRef.current) {
        audioInputRef.current.value = "";
      }

      setSuccess("Audio uploaded and stored in Cloudinary successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Audio upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleVerify = async () => {
    if (!id) return;

    if (!lead?.audio?.url) {
      setError("Upload audio before verification.");
      return;
    }

    try {
      setVerifying(true);
      setError("");
      setSuccess("");

      await verifyLead(id);

      setSuccess("Lead verified successfully. Redirecting to workspace...");

      setTimeout(() => {
        navigate("/leads");
      }, 800);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to verify lead");
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
          <p className="text-xs text-slate-500 font-medium">Loading lead verification details...</p>
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
            <h1 className="text-2xl font-bold text-slate-900">Vigilance Verification</h1>
            <span className="rounded-md bg-purple-50 px-2 py-0.5 text-xs font-semibold text-purple-700">
              MEETING ➔ VERIFIED
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Review lead information and attach mandatory customer audio proof before approving.
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

      {/* Form 1: Lead Information */}
      <form
        onSubmit={handleSaveDetails}
        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Lead Information</h2>
            <p className="text-xs text-slate-500">
              Vigilance can correct details, but contact number is strictly locked.
            </p>
          </div>
          <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2.5 py-1 text-xs font-mono font-medium text-slate-600">
            ID: {lead._id.slice(-6)}
          </span>
        </div>

        {/* Customer Name */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-700">
            Customer Name
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
            required
            minLength={2}
          />
        </div>

        {/* Contact Number (Locked) */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              Contact Number
            </label>
            <span className="inline-flex items-center gap-1 rounded-md bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-600 uppercase">
              <Lock size={10} /> Locked Field
            </span>
          </div>
          <input
            value={lead.contactNumber}
            disabled
            className="w-full font-mono cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 px-3.5 py-2.5 text-sm text-slate-500"
          />
          <p className="mt-1 text-[11px] text-slate-400">
            Contact number is protected by backend field authorization and cannot be changed.
          </p>
        </div>

        {/* Postal Address */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-700">
            Complete Postal Address
          </label>
          <textarea
            value={postalAddress}
            onChange={(e) => setPostalAddress(e.target.value)}
            rows={3}
            required
            className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
            placeholder="Enter complete address verified from meeting recording"
          />
        </div>

        {/* Date + Time */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">
              Scheduled Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">
              Scheduled Time
            </label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
            />
          </div>
        </div>

        {/* Remark */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-700">
            Vigilance Remarks
          </label>
          <textarea
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
            rows={3}
            className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
            placeholder="Enter vigilance notes, customer authenticity remarks, or meeting observations"
          />
        </div>

        {/* Save button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition disabled:opacity-50"
          >
            <Save size={14} />
            {saving ? "Saving Details..." : "Save Details"}
          </button>
        </div>
      </form>

      {/* Card 2: Audio Proof & Upload */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Mic size={18} className="text-indigo-600" />
              <h2 className="text-base font-semibold text-slate-900">Customer Audio Proof</h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Audio recording is strictly mandatory before verification can be approved.
            </p>
          </div>
          {lead.audio?.url ? (
            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
              <CheckCircle2 size={13} /> Audio Attached
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
              <AlertCircle size={13} /> Pending Audio
            </span>
          )}
        </div>

        {/* Existing Audio Player */}
        {lead.audio?.url && (
          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                <FileAudio size={14} className="text-indigo-600" />
                Current Audio Recording
              </span>
              {lead.audio.duration && (
                <span className="text-[11px] font-mono text-slate-500">
                  Duration: {Math.round(lead.audio.duration)}s
                </span>
              )}
            </div>

            <audio controls src={lead.audio.url} className="w-full rounded-lg" />

            <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 pt-1">
              <span>File: <strong className="text-slate-700">{lead.audio.fileName}</strong></span>
              {lead.audio.uploadedAt && (
                <span>Uploaded: {new Date(lead.audio.uploadedAt).toLocaleString()}</span>
              )}
            </div>
          </div>
        )}

        {/* Audio File Selector */}
        <div className="rounded-xl border-2 border-dashed border-slate-300 p-6 text-center hover:border-indigo-400 transition bg-slate-50/40">
          <input
            ref={audioInputRef}
            type="file"
            accept="audio/*"
            onChange={handleFileChange}
            className="block w-full text-xs text-slate-600 file:mr-4 file:rounded-xl file:border-0 file:bg-indigo-50 file:px-4 file:py-2.5 file:text-xs file:font-semibold file:text-indigo-700 hover:file:bg-indigo-100 transition cursor-pointer"
          />

          <p className="mt-2 text-[11px] text-slate-500">
            Supported formats: MP3, WAV, OGG, WEBM, M4A. Maximum file size: 20 MB.
          </p>

          {/* Local Preview and Upload action */}
          {selectedFile && (
            <div className="mt-5 rounded-xl border border-indigo-100 bg-indigo-50/40 p-4 text-left space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileAudio size={16} className="text-indigo-600" />
                  <span className="text-xs font-semibold text-slate-800">
                    Selected for upload: {selectedFile.name}
                  </span>
                </div>
                <span className="text-[11px] font-mono text-slate-500">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                </span>
              </div>

              {previewUrl && (
                <div>
                  <p className="text-[11px] font-medium text-slate-600 mb-1">Local Audio Preview:</p>
                  <audio controls src={previewUrl} className="w-full rounded-lg" />
                </div>
              )}

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleUploadAudio}
                  disabled={uploading}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 transition disabled:opacity-50"
                >
                  <UploadCloud size={14} />
                  {uploading
                    ? "Uploading to Cloudinary..."
                    : lead.audio
                    ? "Replace Existing Audio"
                    : "Upload Audio"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Verify Button Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Final Verification</h3>
          <p className="text-xs text-slate-500">
            {lead.audio?.url
              ? "Audio verified. Ready to promote this lead to VERIFIED status."
              : "Verification is disabled until a valid customer audio recording is uploaded."}
          </p>
        </div>

        <button
          type="button"
          onClick={handleVerify}
          disabled={verifying || !lead.audio?.url}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-xs font-semibold text-white shadow-md hover:bg-black transition disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ShieldCheck size={16} />
          {verifying ? "Verifying..." : "Verify Lead (MEETING ➔ VERIFIED)"}
        </button>
      </div>
    </div>
  );
}
