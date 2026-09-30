import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getLeadById, getWorkflowLogs } from "../api/leads.api";
import StatusBadge from "../components/common/StatusBadge";
import type { Lead, WorkflowLog } from "../types/lead";
import {
  ArrowLeft,
  Phone,
  MapPin,
  Calendar,
  Clock,
  Lock,
  UserCheck,
  History,
  CheckCircle2,
} from "lucide-react";

export default function LeadDetails() {
  const { id } = useParams<{ id: string }>();

  const [lead, setLead] = useState<Lead | null>(null);
  const [logs, setLogs] = useState<WorkflowLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    const loadLeadData = async () => {
      try {
        setLoading(true);
        setError("");
        const leadData = await getLeadById(id);
        const resolvedLead = leadData.data || leadData;
        setLead(resolvedLead);

        // Also fetch workflow logs for full visibility
        try {
          const logsData = await getWorkflowLogs(id);
          setLogs(logsData);
        } catch (logErr) {
          console.warn("Could not load logs:", logErr);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load lead");
      } finally {
        setLoading(false);
      }
    };

    loadLeadData();
  }, [id]);

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

  if (error) {
    return (
      <div className="space-y-4">
        <Link
          to="/leads"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:underline"
        >
          <ArrowLeft size={14} /> Back to Leads
        </Link>
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
          {error}
        </div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-500">
        Lead not found
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/leads"
            className="rounded-xl border border-slate-200 bg-white p-2 text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold text-slate-900">{lead.name}</h1>
              <StatusBadge status={lead.status} />
            </div>
            <p className="font-mono text-xs text-slate-400 mt-0.5">ID: {lead._id}</p>
          </div>
        </div>
      </div>

      {/* Grid of Attributes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Contact info */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Customer Contact</h3>
          <div className="flex items-center justify-between pt-1">
            <span className="flex items-center gap-2 font-mono text-base font-semibold text-slate-900">
              <Phone size={16} className="text-slate-400" />
              {lead.contactNumber}
            </span>
            <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">
              <Lock size={10} /> Locked
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            Registered: {new Date(lead.createdAt).toLocaleString()}
          </p>
        </div>

        {/* Meeting Details */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Meeting Parameters</h3>
          <div>
            <p className="text-[11px] text-slate-500 flex items-center gap-1">
              <MapPin size={12} className="text-slate-400" /> Postal Address:
            </p>
            <p className="text-sm font-medium text-slate-800 mt-0.5">
              {lead.postalAddress || <span className="text-slate-400 italic">Not scheduled</span>}
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-600 pt-1">
            <span className="flex items-center gap-1">
              <Calendar size={13} className="text-slate-400" />
              {lead.date ? new Date(lead.date).toLocaleDateString() : "Pending"}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={13} className="text-slate-400" />
              {lead.time || "Pending"}
            </span>
          </div>
        </div>

        {/* Audio Verification */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Call Audio Recording</h3>
          {lead.audio?.url ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-emerald-700 font-semibold">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 size={15} /> Audio Verified in Cloudinary
                </span>
                <span className="text-[11px] font-mono text-slate-400">{lead.audio.fileName}</span>
              </div>
              <audio controls src={lead.audio.url} className="w-full h-8" />
              {lead.audioCompletedAt && (
                <p className="text-[11px] text-purple-600 font-medium">
                  ✓ Playback completed at: {new Date(lead.audioCompletedAt).toLocaleString()}
                </p>
              )}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">No audio recording attached yet.</p>
          )}
        </div>

        {/* Sales Assignment */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Ownership & Allocation</h3>
          <div>
            <p className="text-[11px] text-slate-500 flex items-center gap-1">
              <UserCheck size={12} className="text-slate-400" /> Assigned Representative:
            </p>
            <p className="text-sm font-medium text-slate-800 mt-0.5">
              {typeof lead.assignedTo === "object" && lead.assignedTo !== null
                ? lead.assignedTo.name
                : lead.assignedTo || <span className="text-slate-400 italic">Unallocated</span>}
            </p>
          </div>
          {lead.claimedAt && (
            <p className="text-[11px] text-rose-600 font-medium">
              ✓ Claimed on: {new Date(lead.claimedAt).toLocaleString()}
            </p>
          )}
        </div>
      </div>

      {/* Workflow Audit Trail Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <History size={16} className="text-indigo-600" />
          End-to-End Workflow Audit Trail ({logs.length} transitions)
        </h3>

        {logs.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No log transitions available.</p>
        ) : (
          <div className="relative border-l-2 border-slate-200 ml-3 space-y-5">
            {logs.map((log) => {
              const actor =
                typeof log.performedBy === "object" && log.performedBy !== null
                  ? log.performedBy.name
                  : "User";

              return (
                <div key={log._id} className="relative pl-6 text-xs">
                  <div className="absolute -left-1.5 top-1 h-3 w-3 rounded-full border-2 border-white bg-indigo-600" />
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-indigo-700 uppercase tracking-wider text-[11px]">
                      {log.action.replace(/_/g, " ")}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {new Date(log.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    {log.fromStatus && (
                      <>
                        <StatusBadge status={log.fromStatus} size="sm" />
                        <span className="text-slate-400">➔</span>
                      </>
                    )}
                    <StatusBadge status={log.toStatus} size="sm" />
                    <span className="text-slate-500 font-medium ml-2">
                      by {actor} ({log.performedByRole})
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
