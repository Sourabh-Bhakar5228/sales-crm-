import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { getLeadById } from "../../api/leads.api";
import { claimLead, markAudioCompleted } from "../../api/sales.api";
import type { Lead } from "../../types/lead";
import {
  ArrowLeft,
  Headphones,
  CheckCircle2,
  AlertCircle,
  Clock,
  Calendar,
  Phone,
  User,
  MapPin,
  Lock,
  Unlock,
  ShieldCheck,
  FileAudio,
} from "lucide-react";

export default function SalesLead() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [lead, setLead] = useState<Lead | null>(null);
  const [audioCompleted, setAudioCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [processingAudio, setProcessingAudio] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!id) return;

    const loadLead = async () => {
      try {
        setLoading(true);
        const response = await getLeadById(id);
        const currentLead = response.data;

        setLead(currentLead);
        setAudioCompleted(Boolean(currentLead.audioCompletedAt));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load lead");
      } finally {
        setLoading(false);
      }
    };

    loadLead();
  }, [id]);

  const handleAudioEnded = async () => {
    if (!id || audioCompleted) {
      return;
    }

    try {
      setProcessingAudio(true);
      setError("");

      const response = await markAudioCompleted(id);

      setLead(response.data);
      setAudioCompleted(true);
      setSuccess("Audio playback completed! You are now authorized to claim this lead.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to record audio completion"
      );
    } finally {
      setProcessingAudio(false);
    }
  };

  const handleClaim = async () => {
    if (!id) return;

    if (!audioCompleted) {
      setError("You must listen to the complete audio before claiming.");
      return;
    }

    try {
      setClaiming(true);
      setError("");
      setSuccess("");

      const response = await claimLead(id);

      setLead(response.data);
      setSuccess("Lead claimed successfully! Status updated to CLAIMED.");

      setTimeout(() => {
        navigate("/leads");
      }, 800);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to claim lead");
    } finally {
      setClaiming(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
          <p className="text-xs text-slate-500 font-medium">Loading sales lead...</p>
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
            <h1 className="text-2xl font-bold text-slate-900">Sales Lead Verification</h1>
            <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
              ALLOCATED ➔ CLAIMED
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Listen to the complete customer audio recording before claiming ownership of this lead.
          </p>
        </div>
      </div>

      {/* Messages */}
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

      {/* Customer Details */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Customer Information</h2>
            <p className="text-xs text-slate-500">
              Verified customer contact and scheduled meeting particulars.
            </p>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-mono font-medium text-slate-700">
            Status: {lead.status}
          </span>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <User size={13} className="text-slate-400" />
              Customer Name
            </div>
            <p className="mt-1.5 text-sm font-semibold text-slate-900">{lead.name}</p>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <Phone size={13} className="text-slate-400" />
              Contact Number
            </div>
            <p className="mt-1.5 font-mono text-sm font-semibold text-slate-900">{lead.contactNumber}</p>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <Calendar size={13} className="text-slate-400" />
              Meeting Date
            </div>
            <p className="mt-1.5 text-sm font-semibold text-slate-900">
              {lead.date ? new Date(lead.date).toLocaleDateString() : "Not available"}
            </p>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <Clock size={13} className="text-slate-400" />
              Meeting Time
            </div>
            <p className="mt-1.5 text-sm font-semibold text-slate-900">{lead.time || "Not available"}</p>
          </div>

          <div className="md:col-span-2 rounded-xl border border-slate-100 bg-slate-50/50 p-4">
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <MapPin size={13} className="text-slate-400" />
              Complete Postal Address
            </div>
            <p className="mt-1.5 text-sm font-medium text-slate-800">{lead.postalAddress || "Not available"}</p>
          </div>

          <div className="md:col-span-2 rounded-xl border border-slate-100 bg-slate-50/50 p-4">
            <p className="text-xs font-medium text-slate-500">Remarks & Special Instructions</p>
            <p className="mt-1.5 text-xs text-slate-700 italic">{lead.remark || "No remarks provided"}</p>
          </div>
        </div>
      </div>

      {/* Customer Audio Section */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Headphones size={18} className="text-indigo-600" />
              <h2 className="text-base font-semibold text-slate-900">Customer Call Recording</h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Complete playback is strictly required to unlock the Claim button.
            </p>
          </div>

          {audioCompleted ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
              <CheckCircle2 size={13} />
              Audio Verified
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
              <Clock size={13} />
              Playback Required
            </span>
          )}
        </div>

        {lead.audio?.url ? (
          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileAudio size={16} className="text-indigo-600" />
                <span className="text-xs font-semibold text-slate-800">{lead.audio.fileName}</span>
              </div>
              {lead.audio.duration && (
                <span className="text-[11px] font-mono text-slate-500">
                  Duration: {Math.round(lead.audio.duration)}s
                </span>
              )}
            </div>

            <audio
              ref={audioRef}
              controls
              preload="metadata"
              src={lead.audio.url}
              onEnded={handleAudioEnded}
              className="w-full rounded-lg"
            />

            {processingAudio && (
              <div className="flex items-center gap-2 text-xs text-indigo-600 font-medium">
                <div className="h-3 w-3 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
                Recording playback completion to backend...
              </div>
            )}

            {!audioCompleted && !processingAudio && (
              <p className="text-[11px] text-slate-500">
                Please listen to the entire audio clip. Seeking forward to skip the audio will not trigger the completion token.
              </p>
            )}

            {audioCompleted && (
              <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-medium">
                <ShieldCheck size={14} />
                Audio verification confirmed by backend on{" "}
                {lead.audioCompletedAt
                  ? new Date(lead.audioCompletedAt).toLocaleTimeString()
                  : "current session"}
                .
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-xl bg-rose-50 border border-rose-200 p-5 text-xs text-rose-700">
            No audio recording is attached to this lead. Please contact the Vigilance or Support department.
          </div>
        )}
      </div>

      {/* Claim Section */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            {audioCompleted ? (
              <Unlock size={18} className="text-emerald-600" />
            ) : (
              <Lock size={18} className="text-slate-400" />
            )}
            <h2 className="text-base font-semibold text-slate-900">Claim Lead</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {audioCompleted
              ? "Audio playback validated. You can now claim ownership of this lead."
              : "Listen to the customer audio until the very end to unlock this action."}
          </p>
        </div>

        <button
          type="button"
          onClick={handleClaim}
          disabled={!audioCompleted || claiming}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-7 py-3 text-xs font-semibold text-white shadow-md hover:bg-black transition disabled:cursor-not-allowed disabled:opacity-40"
        >
          {claiming ? (
            "Claiming Lead..."
          ) : audioCompleted ? (
            <>
              <CheckCircle2 size={16} />
              Claim Lead (ALLOCATED ➔ CLAIMED)
            </>
          ) : (
            <>
              <Lock size={14} />
              🔒 Claim Locked
            </>
          )}
        </button>
      </div>
    </div>
  );
}
