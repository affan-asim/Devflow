"use client";

import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import JobCard from "./JobCard";

export default function JobList({
  jobs,
  metadata,
  onPageChange,
}) {
  if (!jobs?.length) {
    return (
      <div className="border border-[var(--df-line)] px-6 py-20 text-center">
        <p className="text-lg font-semibold tracking-tight">
          No opportunities found.
        </p>

        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--df-muted)]">
          Try a different search or remove one of your
          filters.
        </p>
      </div>
    );
  }

  const {
    currentPage = 1,
    totalPages = 1,
    pageSize = jobs.length,
    totalCount = jobs.length,
    hasNextPage,
    hasPreviousPage,
  } = metadata || {};

  const start =
    totalCount === 0
      ? 0
      : (currentPage - 1) * pageSize + 1;

  const end = Math.min(
    currentPage * pageSize,
    totalCount
  );

  return (
    <div>
      {/* RESULTS HEADER */}

      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium">
            All opportunities
          </p>

          <p className="mt-1 text-xs text-[var(--df-muted)]">
            Showing {start}–{end} of {totalCount} jobs
          </p>
        </div>

        {totalPages > 1 && (
          <p className="hidden text-xs text-[var(--df-muted)] sm:block">
            Page {currentPage} of {totalPages}
          </p>
        )}
      </div>

      {/* JOBS */}

      <div className="border border-[var(--df-line)]">
        {jobs.map((job, index) => (
          <JobCard
            key={job.id}
            job={job}
            index={index}
          />
        ))}
      </div>

      {/* PAGINATION */}

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          hasNextPage={hasNextPage}
          hasPreviousPage={hasPreviousPage}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
}

function Pagination({
  currentPage,
  totalPages,
  hasNextPage,
  hasPreviousPage,
  onPageChange,
}) {
  const pages = getPageNumbers(
    currentPage,
    totalPages
  );

  return (
    <div className="mt-5 flex flex-col gap-4 border-t border-[var(--df-line)] pt-5 sm:flex-row sm:items-center sm:justify-between">
      <button
        type="button"
        disabled={!hasPreviousPage}
        onClick={() =>
          onPageChange(currentPage - 1)
        }
        className="inline-flex h-10 items-center justify-center gap-2 border border-[var(--df-line)] px-4 text-xs font-medium transition hover:border-[var(--df-text)] disabled:cursor-not-allowed disabled:opacity-30"
      >
        <ChevronLeft className="h-3.5 w-3.5" />

        Previous
      </button>

      <div className="flex items-center justify-center gap-1">
        {pages.map((page, index) => {
          if (page === "...") {
            return (
              <span
                key={`ellipsis-${index}`}
                className="flex h-9 w-9 items-center justify-center text-xs text-[var(--df-muted)]"
              >
                ...
              </span>
            );
          }

          const active = page === currentPage;

          return (
            <button
              key={page}
              type="button"
              onClick={() => onPageChange(page)}
              className={`flex h-9 w-9 items-center justify-center text-xs font-medium transition ${
                active
                  ? "bg-[var(--df-text)] text-[var(--df-paper)]"
                  : "text-[var(--df-muted)] hover:bg-[var(--df-text)]/[0.04] hover:text-[var(--df-text)]"
              }`}
            >
              {page}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        disabled={!hasNextPage}
        onClick={() =>
          onPageChange(currentPage + 1)
        }
        className="inline-flex h-10 items-center justify-center gap-2 border border-[var(--df-line)] px-4 text-xs font-medium transition hover:border-[var(--df-text)] disabled:cursor-not-allowed disabled:opacity-30"
      >
        Next

        <ChevronRight className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function getPageNumbers(currentPage, totalPages) {
  if (totalPages <= 7) {
    return Array.from(
      { length: totalPages },
      (_, index) => index + 1
    );
  }

  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, "...", totalPages];
  }

  if (currentPage >= totalPages - 3) {
    return [
      1,
      "...",
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }

  return [
    1,
    "...",
    currentPage - 1,
    currentPage,
    currentPage + 1,
    "...",
    totalPages,
  ];
}
