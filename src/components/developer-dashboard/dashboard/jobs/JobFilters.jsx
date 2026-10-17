
"use client";

import {
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";

const LOCATION_OPTIONS = [
  { value: "", label: "All locations" },
  { value: "REMOTE", label: "Remote" },
  { value: "HYBRID", label: "Hybrid" },
  { value: "ONSITE", label: "On-site" },
];

const EMPLOYMENT_OPTIONS = [
  { value: "", label: "All employment types" },
  { value: "FULLTIME", label: "Full-time" },
  { value: "PARTTIME", label: "Part-time" },
  { value: "CONTRACT", label: "Contract" },
  { value: "INTERN", label: "Internship" },
];

const EXPERIENCE_OPTIONS = [
  { value: "", label: "All experience levels" },
  { value: "BEGINNER", label: "Entry level" },
  { value: "INTERMEDIATE", label: "Intermediate" },
  { value: "EXPERT", label: "Senior" },
];

const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "salary", label: "Highest salary" },
  { value: "deadline", label: "Closing soon" },
];

export default function JobFilters({
  filters,
  onChange,
  onClear,
  hasFilters,
}) {
  return (
    <div className="border-b border-[var(--df-line)] py-5">
      <div className="flex flex-col gap-3">
        {/* SEARCH */}

        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--df-muted)]" />

          <input
            type="text"
            value={filters.search}
            onChange={(event) =>
              onChange("search", event.target.value)
            }
            placeholder="Search by job title or technology..."
            className="h-12 w-full border border-[var(--df-line)] bg-transparent pl-11 pr-4 text-sm outline-none transition placeholder:text-[var(--df-muted)]/50 focus:border-[var(--df-accent)]"
          />
        </div>

        {/* FILTER BAR */}

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--df-muted)]">
            <SlidersHorizontal className="h-3.5 w-3.5" />

            Filters
          </div>

          <div className="grid flex-1 grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <FilterSelect
              value={filters.locationPreference}
              options={LOCATION_OPTIONS}
              onChange={(value) =>
                onChange(
                  "locationPreference",
                  value
                )
              }
            />

            <FilterSelect
              value={filters.experienceLevel}
              options={EXPERIENCE_OPTIONS}
              onChange={(value) =>
                onChange(
                  "experienceLevel",
                  value
                )
              }
            />

            <FilterSelect
              value={filters.employmentType}
              options={EMPLOYMENT_OPTIONS}
              onChange={(value) =>
                onChange("employmentType", value)
              }
            />

            <FilterSelect
              value={filters.sort}
              options={SORT_OPTIONS}
              onChange={(value) =>
                onChange("sort", value)
              }
            />
          </div>

          {hasFilters && (
            <button
              type="button"
              onClick={onClear}
              className="inline-flex h-10 shrink-0 items-center justify-center gap-2 border border-[var(--df-line)] px-3 text-xs font-medium text-[var(--df-muted)] transition hover:border-[var(--df-text)] hover:text-[var(--df-text)]"
            >
              <X className="h-3.5 w-3.5" />

              Clear
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterSelect({
  value,
  options,
  onChange,
}) {
  return (
    <select
      value={value}
      onChange={(event) =>
        onChange(event.target.value)
      }
      className="h-10 w-full min-w-0 border border-[var(--df-line)] bg-[var(--df-paper)] px-3 text-xs text-[var(--df-text)] outline-none transition focus:border-[var(--df-accent)]"
    >
      {options.map((option) => (
        <option
          key={option.value}
          value={option.value}
        >
          {option.label}
        </option>
      ))}
    </select>
  );
}
