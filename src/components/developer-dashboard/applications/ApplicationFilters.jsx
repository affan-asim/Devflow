"use client";

import { RotateCcw } from "lucide-react";

const FILTERS = [
  ["", "All"],
  ["PENDING", "Pending"],
  ["REVIEW", "In review"],
  ["ACCEPTED", "Accepted"],
  ["REJECTED", "Rejected"],
];

export default function ApplicationFilters({
  status,
  sort,
  onStatusChange,
  onSortChange,
  hasActiveFilters,
  onClear,
}) {
  return (
    <div className="flex flex-col gap-4 border-t border-[var(--df-line)] px-4 py-3 sm:px-5 lg:flex-row lg:items-center lg:justify-between">
      {/* STATUS */}

      <div className="flex min-w-0 items-center gap-2 overflow-x-auto pb-1 lg:pb-0">
        <span className="mr-1 shrink-0 text-[9px] font-semibold uppercase tracking-[0.12em] text-[var(--df-muted)]">
          Status
        </span>

        <div className="flex shrink-0 gap-1">
          {FILTERS.map(([value, label]) => (
            <button
              key={value || "all"}
              type="button"
              onClick={() => onStatusChange(value)}
              className={`whitespace-nowrap px-3 py-2 text-[11px] font-medium transition cursor-pointer ${
                status === value
                  ? "bg-[var(--df-text)] text-[var(--df-paper)]"
                  : "text-[var(--df-muted)] hover:bg-[var(--df-line)] hover:text-[var(--df-text)]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* SORT + CLEAR */}

      <div className="flex items-center gap-2">
        <select
          value={sort}
          onChange={(event) =>
            onSortChange(event.target.value)
          }
          className="h-9 min-w-32 border cursor-pointer border-[var(--df-line)] bg-[var(--df-paper)] px-3 text-xs outline-none transition focus:border-[var(--df-text)]"
        >
          <option value="newest">
            Newest first
          </option>

          <option value="oldest">
            Oldest first
          </option>
        </select>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClear}
            className="inline-flex h-9 items-center gap-1.5 px-2.5 text-xs font-medium text-[var(--df-muted)] transition hover:text-[var(--df-text)]"
          >
            <RotateCcw className="h-3 w-3" />
            Clear
          </button>
        )}
      </div>
    </div>
  );
}