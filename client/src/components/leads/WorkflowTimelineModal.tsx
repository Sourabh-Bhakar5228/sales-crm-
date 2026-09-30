import { useEffect, useState } from "react";
import Modal from "../common/Modal";
import StatusBadge from "../common/StatusBadge";
import { getWorkflowLogs } from "../../api/leads.api";
import type { Lead, WorkflowLog } from "../../types/lead";
import { Clock, User as UserIcon } from "lucide-react";

interface Props {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function WorkflowTimelineModal({ lead, isOpen, onClose }: Props) {
  const [logs, setLogs] = useState<WorkflowLog[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && lead?._id) {
      setLoading(true);
      getWorkflowLogs(lead._id)
        .then(setLogs)
        .catch((err) => console.error("Failed to load logs:", err))
        .finally(() => setLoading(false));
    }
  }, [isOpen, lead]);

  if (!lead) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Workflow Audit Trail"
      subtitle={`Audit ledger for ${lead.name} (${lead.contactNumber})`}
      maxWidth="lg"
    >
      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
        </div>
      ) : logs.length === 0 ? (
        <div className="py-8 text-center text-sm text-slate-500">No workflow history recorded yet.</div>
      ) : (
        <div className="relative border-l-2 border-slate-200 ml-3 my-2 space-y-6">
          {logs.map((log) => {
            const actorName =
              typeof log.performedBy === "object" && log.performedBy !== null
                ? log.performedBy.name
                : "System User";

            return (
              <div key={log._id} className="relative pl-6">
                {/* Dot */}
                <div className="absolute -left-1.5 top-1.5 h-3 w-3 rounded-full border-2 border-white bg-indigo-600 shadow-xs" />

                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
                    {log.action.replace(/_/g, " ")}
                  </span>
                  <span className="flex items-center gap-1 text-[11px] text-slate-400">
                    <Clock size={12} />
                    {new Date(log.createdAt).toLocaleString()}
                  </span>
                </div>

                <div className="mt-1 flex items-center gap-2">
                  {log.fromStatus ? (
                    <>
                      <StatusBadge status={log.fromStatus} size="sm" />
                      <span className="text-xs text-slate-400">➔</span>
                    </>
                  ) : null}
                  <StatusBadge status={log.toStatus} size="sm" />
                </div>

                <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-600">
                  <UserIcon size={12} className="text-slate-400" />
                  <span className="font-medium">{actorName}</span>
                  <span className="rounded-sm bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500">
                    {log.performedByRole}
                  </span>
                </div>

                {log.metadata && Object.keys(log.metadata).length > 0 && (
                  <pre className="mt-2 rounded-lg bg-slate-50 p-2 text-[10px] text-slate-600 overflow-x-auto">
                    {JSON.stringify(log.metadata, null, 2)}
                  </pre>
                )}
              </div>
            );
          })}
        </div>
      )}
    </Modal>
  );
}
