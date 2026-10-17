"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  fetchSavedJobs,
  deleteSavedJob,
  clearSavedJobErrors,
} from "@/lib/redux/slices/savedJobSlice";

const SORT_OPTIONS = [
  { label: "Newest saved", value: "newest" },
  { label: "Oldest saved", value: "oldest" },
];

const formatDate = (date) => {
  if (!date) return "—";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
};

const formatRelativeDate = (date) => {
  if (!date) return "";

  const now = new Date();
  const target = new Date(date);

  const diff = now.getTime() - target.getTime();

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days <= 0) return "Saved today";
  if (days === 1) return "Saved 1 day ago";
  if (days < 30) return `Saved ${days} days ago`;

  const months = Math.floor(days / 30);

  if (months === 1) return "Saved 1 month ago";

  return `Saved ${months} months ago`;
};

const formatLocation = (location) => {
  if (!location) return "Location not specified";

  return location.charAt(0) + location.slice(1).toLowerCase();
};

const formatEnum = (value) => {
  if (!value) return "—";

  return value
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const formatSalary = (job) => {
  if (job?.minSalary == null && job?.maxSalary == null) {
    return "Salary not specified";
  }

  const currency = job.currency || "";

  const formatter = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  });

  const min =
    job.minSalary != null
      ? formatter.format(Number(job.minSalary))
      : null;

  const max =
    job.maxSalary != null
      ? formatter.format(Number(job.maxSalary))
      : null;

  if (min && max) {
    return `${currency} ${min} — ${max}`;
  }

  if (min) {
    return `${currency} ${min}+`;
  }

  return `${currency} ${max}`;
};

const isJobExpired = (job) => {
  if (!job?.deadline) return false;

  return new Date(job.deadline).getTime() < Date.now();
};

const getJobState = (job) => {
  if (!job) {
    return {
      label: "Unavailable",
      className: "text-[var(--df-muted)]",
    };
  }

  if (job.status === "CLOSED") {
    return {
      label: "Closed",
      className: "text-red-600",
    };
  }

  if (job.status === "EXPIRED" || isJobExpired(job)) {
    return {
      label: "Expired",
      className: "text-red-600",
    };
  }

  if (job.status === "ACTIVE") {
    return {
      label: "Active",
      className: "text-emerald-600",
    };
  }

  return {
    label: formatEnum(job.status),
    className: "text-[var(--df-muted)]",
  };
};

function SavedJobSkeleton() {
  return (
    <div className="border-t border-[var(--df-line)] py-7 animate-pulse">
      <div className="h-3 w-24 bg-[var(--df-line)]" />

      <div className="mt-4 h-7 w-2/3 bg-[var(--df-line)]" />

      <div className="mt-2 h-4 w-1/3 bg-[var(--df-line)]" />

      <div className="mt-5 h-4 w-full bg-[var(--df-line)]" />

      <div className="mt-2 h-4 w-4/5 bg-[var(--df-line)]" />
    </div>
  );
}

export default function SavedJobsPage() {
  const dispatch = useDispatch();

  const {
    savedJobs,
    metadata,
    loadingList,
    submitting,
    errorList,
    submitError,
  } = useSelector((state) => state.savedJobs);

  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);

  useEffect(() => {
    dispatch(
      fetchSavedJobs({
        page,
        limit: 10,
        sort,
      })
    );

    return () => {
      dispatch(clearSavedJobErrors());
    };
  }, [dispatch, page, sort]);

  const handleSortChange = (event) => {
    setSort(event.target.value);
    setPage(1);
  };

  const handleRemove = async (savedJobId) => {
    await dispatch(deleteSavedJob(savedJobId));
  };

  const goToPrevious = () => {
    if (metadata.hasPreviousPage) {
      setPage((current) => current - 1);
    }
  };

  const goToNext = () => {
    if (metadata.hasNextPage) {
      setPage((current) => current + 1);
    }
  };

  return (
    <main className="min-h-screen bg-[var(--df-paper)] text-[var(--df-text)]">
      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-10 lg:py-14">

        {/* Header */}
        <header className="border-b border-[var(--df-line)] pb-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--df-muted)]">
                Developer Dashboard
              </p>

              <h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
                Saved Jobs
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-6 text-[var(--df-muted)]">
                Keep track of opportunities you want to revisit.
              </p>
            </div>

            <Link
              href="/dashboard/developer/jobs"
              className="inline-flex h-10 items-center justify-center border border-[var(--df-text)] bg-[var(--df-text)] px-5 text-xs font-semibold uppercase tracking-[0.12em] text-white transition-opacity hover:opacity-85"
            >
              Browse jobs
            </Link>
          </div>
        </header>

        {/* Toolbar */}
        <div className="flex flex-col gap-4 border-b border-[var(--df-line)] py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.14em]">
              {metadata.totalCount}{" "}
              {metadata.totalCount === 1 ? "saved job" : "saved jobs"}
            </span>
          </div>

          <label className="flex items-center gap-3">
            <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--df-muted)]">
              Sort
            </span>

            <select
              value={sort}
              onChange={handleSortChange}
              className="h-9 border border-[var(--df-line)] bg-transparent px-3 text-xs outline-none transition-colors focus:border-[var(--df-text)]"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {/* Errors */}
        {(errorList || submitError) && (
          <div className="border-b border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorList || submitError}
          </div>
        )}

        {/* Content */}
        <section>
          {loadingList ? (
            <div>
              <SavedJobSkeleton />
              <SavedJobSkeleton />
              <SavedJobSkeleton />
            </div>
          ) : savedJobs.length === 0 ? (
            <div className="border-b border-[var(--df-line)] py-20 text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--df-muted)]">
                No saved jobs
              </p>

              <h2 className="mt-3 text-2xl font-semibold tracking-[-0.02em]">
                Nothing saved yet
              </h2>

              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[var(--df-muted)]">
                When you find a job you want to revisit, save it and it will
                appear here.
              </p>

              <Link
                href="/dashboard/developer/jobs"
                className="mt-7 inline-flex h-10 items-center border border-[var(--df-text)] bg-[var(--df-text)] px-5 text-xs font-semibold uppercase tracking-[0.12em] text-white transition-opacity hover:opacity-85"
              >
                Find jobs
              </Link>
            </div>
          ) : (
            <div>
              {savedJobs.map((savedJob) => {
                const job = savedJob.job;
                const company = job?.company;
                const state = getJobState(job);

                return (
                  <article
                    key={savedJob.id}
                    className="border-b border-[var(--df-line)] py-7"
                  >
                    <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:gap-10">

                      {/* Main */}
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--df-muted)]">
                          <span>
                            {formatRelativeDate(savedJob.createdAt)}
                          </span>

                          <span aria-hidden="true">·</span>

                          <span className={state.className}>
                            {state.label}
                          </span>

                          {job?.isFeatured && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="text-[var(--df-text)]">
                                Featured
                              </span>
                            </>
                          )}
                        </div>

                        <Link
                          href={`/dashboard/developer/savedJobs/${savedJob.id}`}
                          className="mt-3 block text-xl font-semibold tracking-[-0.025em] transition-opacity hover:opacity-60 sm:text-2xl"
                        >
                          {job?.title || "Untitled job"}
                        </Link>

                        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-[var(--df-muted)]">
                          <span>{company?.name || "Unknown company"}</span>

                          {company?.isVerified && (
                            <span
                              className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--df-text)]"
                              title="Verified company"
                            >
                              Verified
                            </span>
                          )}
                        </div>

                        <p className="mt-5 max-w-3xl text-sm leading-6 text-[var(--df-muted)]">
                          {job?.description || "No job description available."}
                        </p>

                        {/* Metadata */}
                        <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-xs text-[var(--df-muted)]">
                          <span>
                            {formatLocation(job?.locationPreference)}
                          </span>

                          <span>
                            {formatEnum(job?.employmentType)}
                          </span>

                          <span>
                            {formatEnum(job?.experienceLevel)}
                          </span>

                          <span>{formatSalary(job)}</span>
                        </div>

                        {/* Skills */}
                        {job?.skills?.length > 0 && (
                          <div className="mt-5 flex flex-wrap gap-2">
                            {job.skills.map((skill) => (
                              <span
                                key={skill.id}
                                className="border border-[var(--df-line)] px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--df-muted)]"
                              >
                                {skill.name}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Deadline */}
                        {job?.deadline && (
                          <p className="mt-5 text-xs text-[var(--df-muted)]">
                            Deadline:{" "}
                            <span className="text-[var(--df-text)]">
                              {formatDate(job.deadline)}
                            </span>
                          </p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-end gap-3 lg:min-w-[190px] lg:flex-col lg:items-stretch lg:justify-end">
                        <Link
                          href={`/dashboard/developer/savedJobs/${savedJob.id}`}
                          className="inline-flex h-10 flex-1 items-center justify-center border border-[var(--df-text)] bg-[var(--df-text)] px-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-white transition-opacity hover:opacity-85 lg:flex-none"
                        >
                          View job
                        </Link>

                        <button
                          type="button"
                          disabled={submitting}
                          onClick={() => handleRemove(savedJob.id)}
                          className="inline-flex cursor-pointer h-10 flex-1 items-center justify-center border border-[var(--df-line)] px-4 text-[10px] font-semibold uppercase tracking-[0.12em] transition-colors hover:border-red-300 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50 lg:flex-none"
                        >
                          {submitting ? "Removing..." : "Remove"}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* Pagination */}
        {!loadingList && metadata.totalPages > 1 && (
          <div className="flex items-center justify-between border-b border-[var(--df-line)] py-5">
            <button
              type="button"
              onClick={goToPrevious}
              disabled={!metadata.hasPreviousPage}
              className="text-xs font-semibold uppercase tracking-[0.12em] disabled:cursor-not-allowed disabled:opacity-30"
            >
              ← Previous
            </button>

            <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--df-muted)]">
              Page {metadata.currentPage} of {metadata.totalPages}
            </span>

            <button
              type="button"
              onClick={goToNext}
              disabled={!metadata.hasNextPage}
              className="text-xs font-semibold uppercase tracking-[0.12em] disabled:cursor-not-allowed disabled:opacity-30"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </main>
  );
}