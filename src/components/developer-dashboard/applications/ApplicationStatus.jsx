"use client";

const STATUS_CONFIG = {
  PENDING: {
    label: "Pending",
    className:
      "border-[var(--df-line)] bg-[var(--df-paper)] text-[var(--df-text)]",
  },

  REVIEW: {
    label: "In review",
    className:
      "border-[var(--df-accent)]/30 bg-[var(--df-accent)]/10 text-[var(--df-text)]",
  },

  ACCEPTED: {
    label: "Accepted",
    className:
      "border-emerald-200 bg-emerald-50 text-emerald-700",
  },

  REJECTED: {
    label: "Rejected",
    className:
      "border-red-200 bg-red-50 text-red-700",
  },
};

export default function ApplicationStatus({ status }) {
  const config = STATUS_CONFIG[status] || {
    label: status,
    className:
      "border-[var(--df-line)] text-[var(--df-muted)]",
  };

  return (
    <span
      className={`inline-flex items-center gap-2 border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${config.className}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {config.label}
    </span>
  );
}