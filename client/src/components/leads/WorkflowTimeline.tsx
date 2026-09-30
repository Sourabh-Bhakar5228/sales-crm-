import { CheckCircle2, ArrowRight, User } from "lucide-react";

export type WorkflowItem = {
  _id?: string;
  action: string;
  fromStatus: string | null;
  toStatus: string | null;
  performedByRole: string;
  performedBy?: {
    name?: string;
    email?: string;
    role?: string;
  } | string;
  createdAt: string;
  metadata?: Record<string, unknown>;
};

interface Props {
  history: WorkflowItem[];
}

export default function WorkflowTimeline({ history }: Props) {
  if (!history || history.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-xs text-slate-400">
        No workflow actions recorded yet.
      </div>
    );
  }

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
      {history.map((item, index) => {
        const performerName =
          typeof item.performedBy === "object" && item.performedBy?.name
            ? item.performedBy.name
            : item.performedByRole || "System";

        return (
          <div key={item._id || index} className="relative flex items-start gap-3">
            {/* Timeline dot */}
            <div className="absolute -left-6 mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-white shadow-xs">
              <CheckCircle2 size={12} />
            </div>

            <div className="flex-1 rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-semibold text-xs text-slate-900 tracking-wide font-mono">
                  {item.action}
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  {new Date(item.createdAt).toLocaleString()}
                </span>
              </div>

              {/* Status Transition Pill */}
              <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-600">
                <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                  {item.fromStatus || "START"}
                </span>
                <ArrowRight size={12} className="text-slate-400" />
                <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold text-indigo-700">
                  {item.toStatus || "-"}
                </span>
              </div>

              {/* Performed by footer */}
              <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                <User size={12} className="text-slate-400" />
                <span>
                  By <strong className="text-slate-700">{performerName}</strong> ({item.performedByRole})
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
