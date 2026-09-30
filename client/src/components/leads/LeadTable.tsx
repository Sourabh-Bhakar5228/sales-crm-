import { useState } from "react";
import { Link } from "react-router-dom";
import StatusBadge from "../common/StatusBadge";
import WorkflowTimelineModal from "./WorkflowTimelineModal";
import { useAuth } from "../../context/AuthContext";
import type { Lead } from "../../types/lead";
import { History, Phone, MapPin, Calendar, Clock, Volume2, CheckCircle2, Eye } from "lucide-react";

const getLeadPath = (role: string | undefined, leadId: string) => {
  switch (role) {
    case "COMMUNICATION":
      return `/communication/leads/${leadId}`;
    case "VIGILANCE":
      return `/vigilance/leads/${leadId}`;
    case "SUPPORT":
      return `/support/leads/${leadId}`;
    case "SALES":
      return `/sales/leads/${leadId}`;
    default:
      return `/leads/${leadId}`;
  }
};

interface Props {
  leads: Lead[];
  loading: boolean;
  onAction?: (lead: Lead) => void;
  actionLabel?: string;
  actionIcon?: React.ReactNode;
}

export default function LeadTable({
  leads,
  loading,
  onAction,
  actionLabel,
  actionIcon,
}: Props) {
  const { user } = useAuth();
  const [selectedLeadForHistory, setSelectedLeadForHistory] = useState<Lead | null>(null);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl border border-slate-200 bg-white">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
          <p className="text-xs text-slate-500 font-medium">Loading leads...</p>
        </div>
      </div>
    );
  }

  if (leads.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 text-slate-400">
          <CheckCircle2 size={24} />
        </div>
        <h4 className="mt-3 text-sm font-semibold text-slate-800">Queue is Clear</h4>
        <p className="mt-1 text-xs text-slate-500">No active leads require action in this status right now.</p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="border-b border-slate-200 bg-slate-50/75 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-6 py-3.5">Customer</th>
                <th className="px-6 py-3.5">Contact</th>
                <th className="px-6 py-3.5">Meeting Details</th>
                <th className="px-6 py-3.5">Audio Verification</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {leads.map((lead) => (
                <tr key={lead._id} className="hover:bg-slate-50/50 transition">
                  {/* Customer Name */}
                  <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">
                    {lead.name}
                  </td>

                  {/* Contact Number */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1.5 font-mono text-xs text-slate-700">
                      <Phone size={13} className="text-slate-400" />
                      {lead.contactNumber}
                    </span>
                  </td>

                  {/* Meeting Details */}
                  <td className="px-6 py-4">
                    {lead.postalAddress ? (
                      <div className="space-y-1 text-xs max-w-xs">
                        <div className="flex items-start gap-1 text-slate-700">
                          <MapPin size={12} className="mt-0.5 shrink-0 text-slate-400" />
                          <span className="line-clamp-1">{lead.postalAddress}</span>
                        </div>
                        {(lead.date || lead.time) && (
                          <div className="flex items-center gap-3 text-slate-500 text-[11px]">
                            {lead.date && (
                              <span className="flex items-center gap-1">
                                <Calendar size={11} />
                                {new Date(lead.date).toLocaleDateString()}
                              </span>
                            )}
                            {lead.time && (
                              <span className="flex items-center gap-1">
                                <Clock size={11} />
                                {lead.time}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 italic">Not scheduled</span>
                    )}
                  </td>

                  {/* Audio Status */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    {lead.audio?.url ? (
                      <div className="flex items-center gap-1.5">
                        <span className="flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                          <Volume2 size={13} />
                          Audio Attached
                        </span>
                        {lead.audioCompletedAt && (
                          <span className="rounded-md bg-purple-50 px-1.5 py-0.5 text-[10px] font-semibold text-purple-700">
                            Listened
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 italic">No recording</span>
                    )}
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={lead.status} />
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 text-right whitespace-nowrap space-x-2">
                    <Link
                      to={getLeadPath(user?.role, lead._id)}
                      title="View / Process Lead"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition shadow-2xs"
                    >
                      <Eye size={14} />
                      <span>View</span>
                    </Link>

                    {onAction && actionLabel && (
                      <button
                        type="button"
                        onClick={() => onAction(lead)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 transition shadow-xs"
                      >
                        {actionIcon}
                        {actionLabel}
                      </button>
                    )}

                    <button
                      type="button"
                      title="View Workflow History"
                      onClick={() => setSelectedLeadForHistory(lead)}
                      className="inline-flex items-center rounded-lg border border-slate-200 bg-white p-1.5 text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition"
                    >
                      <History size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* History modal */}
      <WorkflowTimelineModal
        lead={selectedLeadForHistory}
        isOpen={Boolean(selectedLeadForHistory)}
        onClose={() => setSelectedLeadForHistory(null)}
      />
    </>
  );
}
