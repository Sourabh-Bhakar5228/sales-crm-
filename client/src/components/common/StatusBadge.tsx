import type { LeadStatus } from "../../types/lead";

interface Props {
  status: LeadStatus | string;
  size?: "sm" | "md";
}

const statusConfig: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  CREATED: {
    label: "Created",
    bg: "bg-blue-50 border-blue-200",
    text: "text-blue-700",
    dot: "bg-blue-500",
  },
  MEETING: {
    label: "Meeting",
    bg: "bg-amber-50 border-amber-200",
    text: "text-amber-700",
    dot: "bg-amber-500",
  },
  VERIFIED: {
    label: "Verified",
    bg: "bg-emerald-50 border-emerald-200",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
  },
  ALLOCATED: {
    label: "Allocated",
    bg: "bg-purple-50 border-purple-200",
    text: "text-purple-700",
    dot: "bg-purple-500",
  },
  CLAIMED: {
    label: "Claimed",
    bg: "bg-rose-50 border-rose-200",
    text: "text-rose-700",
    dot: "bg-rose-500",
  },
};

export default function StatusBadge({ status, size = "md" }: Props) {
  const config = statusConfig[status] || {
    label: status,
    bg: "bg-slate-50 border-slate-200",
    text: "text-slate-700",
    dot: "bg-slate-400",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${config.bg} ${config.text} ${
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs"
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}
