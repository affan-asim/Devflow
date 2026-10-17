
import {
  BriefcaseBusiness,
  ChevronRight,
} from "lucide-react";

export default function JobsHeader({
  totalCount = 0,
  currentPage = 1,
  totalPages = 0,
}) {
  return (
    <section className="border-b border-[var(--df-line)] pb-7">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="mb-3 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--df-muted)]">
            <BriefcaseBusiness className="h-3.5 w-3.5" />

            Opportunities
          </div>

          <h1 className="text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">
            Find your next opportunity.
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--df-muted)]">
            Browse active developer roles from companies hiring
            across different technologies, experience levels, and
            working environments.
          </p>
        </div>

        <div className="grid grid-cols-2 border border-[var(--df-line)] sm:min-w-[260px]">
          <Stat
            value={totalCount}
            label="Active jobs"
          />

          <Stat
            value={
              totalPages > 0
                ? `${currentPage}/${totalPages}`
                : "—"
            }
            label="Current page"
            border
          />
        </div>
      </div>
    </section>
  );
}

function Stat({ value, label, border = false }) {
  return (
    <div
      className={`px-4 py-4 ${
        border
          ? "border-l border-[var(--df-line)]"
          : ""
      }`}
    >
      <p className="text-xl font-semibold tracking-tight">
        {value}
      </p>

      <p className="mt-1 text-[9px] font-medium uppercase tracking-[0.12em] text-[var(--df-muted)]">
        {label}
      </p>
    </div>
  );
}
