"use client";

import { Check, X } from "lucide-react";

export default function ApplicationTimeline({
  status = "PENDING",
  createdAt,
  updatedAt,
  rejectionReason,
}) {
  // Format dates cleanly
  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const steps = [
    {
      key: "PENDING",
      label: "Application submitted",
      date: formatDate(createdAt),
      description: "Your application has been received.",
    },
    {
      key: "REVIEW",
      label: "Under review",
      date: status !== "PENDING" ? formatDate(updatedAt) : null,
      description: "The hiring team is reviewing your profile.",
    },
    {
      key: status === "REJECTED" ? "REJECTED" : "ACCEPTED",
      label: status === "REJECTED" ? "Application rejected" : "Application accepted",
      date: status === "ACCEPTED" || status === "REJECTED" ? formatDate(updatedAt) : null,
      description:
        status === "ACCEPTED"
          ? "The company has accepted your application!"
          : rejectionReason || "The company decided not to move forward.",
    },
  ];

  // Logic to determine step state
  const getStepStatus = (stepKey, index) => {
    if (status === "REJECTED") {
      if (stepKey === "REJECTED") return "rejected";
      return "complete";
    }

    if (status === "ACCEPTED") {
      return "complete";
    }

    if (status === "REVIEW") {
      if (index === 0) return "complete";
      if (index === 1) return "current";
      return "upcoming";
    }

    // Default status === 'PENDING'
    if (index === 0) return "current";
    return "upcoming";
  };

  return (
    <section className="border border-[var(--df-line)]">
      <div className="border-b border-[var(--df-line)] px-5 py-4 sm:px-6">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--df-muted)]">
          Application Progress
        </p>
      </div>

      <div className="p-5 sm:p-6">
        <div className="space-y-0">
          {steps.map((step, index) => {
            const state = getStepStatus(step.key, index);

            return (
              <div key={step.key} className="relative flex gap-4">
                {/* Vertical Line Connector */}
                {index < steps.length - 1 && (
                  <div
                    className={`absolute left-[9px] top-6 bottom-0 w-px ${
                      state === "complete"
                        ? "bg-[var(--df-text)]"
                        : "bg-[var(--df-line)]"
                    }`}
                  />
                )}

                {/* Status Indicator Circle */}
                <div
                  className={`relative z-10 flex h-5 w-5 shrink-0 items-center justify-center border ${
                    state === "complete"
                      ? "border-[var(--df-text)] bg-[var(--df-text)] text-[var(--df-paper)]"
                      : state === "rejected"
                      ? "border-red-500 bg-red-500 text-white"
                      : state === "current"
                      ? "border-[var(--df-text)] bg-[var(--df-paper)]"
                      : "border-[var(--df-line)] bg-transparent"
                  }`}
                >
                  {state === "complete" && <Check className="h-3 w-3" />}
                  {state === "rejected" && <X className="h-3 w-3" />}
                  {state === "current" && (
                    <span className="h-1.5 w-1.5 bg-[var(--df-text)]" />
                  )}
                </div>

                {/* Content */}
                <div className="pb-8">
                  <div className="flex items-center gap-3">
                    <p className="text-sm font-medium">{step.label}</p>
                    {step.date && (
                      <span className="text-[11px] text-[var(--df-muted)]">
                        • {step.date}
                      </span>
                    )}
                  </div>

                  {(state === "current" || state === "complete" || state === "rejected") && (
                    <p className="mt-1 text-xs text-[var(--df-muted)] leading-relaxed">
                      {step.description}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}