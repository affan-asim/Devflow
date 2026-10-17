
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  ChevronLeft,
  ChevronRight,
  Search,
  Clock3,
  FileText,
  RefreshCw,
  SlidersHorizontal,
  Users,
} from "lucide-react";

import {
  fetchRecruiterApplications,
} from "@/lib/redux/slices/applicationSlice";

import { fetchJobs } from "@/lib/redux/slices/jobSlice";

const PAGE_SIZE = 10;

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "PENDING", label: "Pending" },
  { value: "REVIEW", label: "In review" },
  { value: "ACCEPTED", label: "Accepted" },
  { value: "REJECTED", label: "Rejected" },
];

const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
];

function formatStatus(status) {
  return (
    status
      ?.replaceAll("_", " ")
      ?.toLowerCase()
      ?.replace(/\b\w/g, (char) => char.toUpperCase()) ||
    "Unknown"
  );
}

function formatDate(date) {
  if (!date) return "—";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

function getCandidateName(application) {
  const profile = application?.developerProfile;

  return (
    profile?.user?.name ||
    profile?.name ||
    profile?.fullName ||
    "Developer applicant"
  );
}

function getInitials(name) {
  if (!name) return "DA";

  const parts = name.trim().split(/\s+/);

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function StatusBadge({ status }) {
  const styles = {
    PENDING:
      "border-[#d8c99f] bg-[#f7f3e6] text-[#776329]",
    REVIEW:
      "border-[#c6d0dc] bg-[#f1f4f7] text-[#42566d]",
    ACCEPTED:
      "border-[#c6d6ca] bg-[#eef4ef] text-[#45604c]",
    REJECTED:
      "border-[#dcc5c1] bg-[#f6eeee] text-[#76504b]",
  };

  return (
    <span
      className={`inline-flex items-center gap-2 border px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-[0.14em] ${
        styles[status] ||
        "border-[var(--df-line)] bg-transparent text-[var(--df-muted)]"
      }`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {formatStatus(status)}
    </span>
  );
}

function Metric({ index, label, value, icon: Icon }) {
  return (
    <div className="relative flex min-h-[104px] flex-1 flex-col justify-between border-r border-[var(--df-line)] px-5 py-4 last:border-r-0">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[9px] font-bold tracking-[0.16em] text-[var(--df-muted)]">
          {index}
        </span>

        <Icon
          size={14}
          strokeWidth={1.5}
          className="text-[var(--df-muted)]"
        />
      </div>

      <div>
        <p className="text-2xl font-semibold tracking-[-0.05em] text-[var(--df-text)]">
          {value}
        </p>

        <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.15em] text-[var(--df-muted)]">
          {label}
        </p>
      </div>
    </div>
  );
}

function Pagination({ metadata, page, onPageChange }) {
  if (!metadata || metadata.totalPages <= 1) return null;

  const pages = [];

  for (let i = 1; i <= metadata.totalPages; i++) {
    if (
      i === 1 ||
      i === metadata.totalPages ||
      Math.abs(i - page) <= 1
    ) {
      pages.push(i);
    } else if (i === page - 2 || i === page + 2) {
      pages.push("...");
    }
  }

  return (
    <div className="flex items-center justify-between border-t border-[var(--df-line)] pt-4">
      <div className="font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--df-muted)]">
        Page {metadata.currentPage} / {metadata.totalPages}
      </div>

      <div className="flex items-center">
        <button
          type="button"
          disabled={!metadata.hasPreviousPage}
          onClick={() => onPageChange(page - 1)}
          className="flex h-8 w-8 items-center justify-center border border-r-0 border-[var(--df-line)] bg-[var(--df-paper)] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ChevronLeft size={14} />
        </button>

        {pages.map((item, index) =>
          item === "..." ? (
            <span
              key={`dots-${index}`}
              className="flex h-8 w-8 items-center justify-center border-t border-b border-[var(--df-line)] text-[10px] text-[var(--df-muted)]"
            >
              …
            </span>
          ) : (
            <button
              key={item}
              type="button"
              onClick={() => onPageChange(item)}
              className={`h-8 min-w-8 border border-r-0 px-2 text-[10px] font-bold ${
                item === page
                  ? "border-[var(--df-text)] bg-[var(--df-text)] text-white"
                  : "border-[var(--df-line)] bg-[var(--df-paper)] hover:bg-white"
              }`}
            >
              {item}
            </button>
          )
        )}

        <button
          type="button"
          disabled={!metadata.hasNextPage}
          onClick={() => onPageChange(page + 1)}
          className="flex h-8 w-8 items-center justify-center border border-[var(--df-line)] bg-[var(--df-paper)] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}

function ApplicationsSkeleton() {
  return (
    <div className="border-y border-[var(--df-line)]">
      {Array.from({ length: 7 }).map((_, index) => (
        <div
          key={index}
          className="grid animate-pulse gap-4 border-b border-[var(--df-line)] px-4 py-5 lg:grid-cols-[minmax(280px,1.7fr)_minmax(220px,1.1fr)_150px_130px_36px]"
        >
          <div className="flex gap-3">
            <div className="h-9 w-9 bg-black/[0.04]" />
            <div className="space-y-2">
              <div className="h-3 w-36 bg-black/[0.05]" />
              <div className="h-2.5 w-24 bg-black/[0.04]" />
            </div>
          </div>

          <div className="space-y-2">
            <div className="h-3 w-32 bg-black/[0.05]" />
            <div className="h-2.5 w-20 bg-black/[0.04]" />
          </div>

          <div className="h-6 w-20 bg-black/[0.04]" />
          <div className="h-3 w-20 bg-black/[0.04]" />
          <div className="h-8 w-8 bg-black/[0.04]" />
        </div>
      ))}
    </div>
  );
}

export default function RecruiterApplicationsPage() {
  const dispatch = useDispatch();
  const searchParams = useSearchParams();

  const {
    applications,
    metadata,
    loadingList,
    errorList,
  } = useSelector((state) => state.applications);

  const {
    jobs,
    loadingList: loadingJobs,
  } = useSelector((state) => state.jobs);

  const [page, setPage] = useState(1);

  const [filters, setFilters] = useState({
    status: searchParams.get("status") || "",
    sort: searchParams.get("sort") || "newest",
    jobId: searchParams.get("jobId") || "",
    search: searchParams.get("search") || "",
  });
  const [searchInput, setSearchInput] = useState(filters.search);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setPage(1);
      setFilters((current) =>
        current.search === searchInput
          ? current
          : { ...current, search: searchInput }
      );
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchInput]);

  const loadApplications = useCallback(() => {
    dispatch(
      fetchRecruiterApplications({
        status: filters.status || undefined,
        sort: filters.sort || undefined,
        jobId: filters.jobId || undefined,
        search: filters.search.trim() || undefined,
        page,
        limit: PAGE_SIZE,
      })
    );
  }, [dispatch, filters, page]);

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  useEffect(() => {
    dispatch(
      fetchJobs({
        page: 1,
        limit: 100,
      })
    );
  }, [dispatch]);

  const updateFilter = (key, value) => {
    setPage(1);

    setFilters((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const clearFilters = () => {
    setPage(1);
    setSearchInput("");

    setFilters({
      status: "",
      sort: "newest",
      jobId: "",
      search: "",
    });
  };

  const total = metadata?.totalCount || 0;

  const pageStats = useMemo(
    () => ({
      pending: applications.filter(
        (application) => application.status === "PENDING"
      ).length,

      review: applications.filter(
        (application) => application.status === "REVIEW"
      ).length,

      accepted: applications.filter(
        (application) => application.status === "ACCEPTED"
      ).length,
    }),
    [applications]
  );

  const hasFilters = filters.status || filters.jobId || filters.search;

  return (
    <main className="min-h-screen bg-[var(--df-paper)] text-[var(--df-text)]">
      <div className="mx-auto max-w-[1500px] px-4 py-5 sm:px-6 lg:px-8">
        {/* -------------------------------------------------
            PAGE HEADER
        -------------------------------------------------- */}
        <header className="border-b border-[var(--df-line)] pb-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-4 flex items-center gap-2">
                <span className="font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-[var(--df-muted)]">
                  Recruiter / Hiring
                </span>

                <span className="text-[var(--df-muted)]">/</span>

                <span className="font-mono text-[9px] font-bold uppercase tracking-[0.18em]">
                  Applications
                </span>
              </div>

              <h1 className="text-[clamp(2rem,4vw,3.4rem)] font-semibold leading-[0.95] tracking-[-0.06em]">
                Applications
              </h1>

              <p className="mt-3 max-w-xl text-[13px] leading-5 text-[var(--df-muted)]">
                Review incoming candidates, move applications through
                the hiring pipeline, and manage active recruitment.
              </p>
            </div>

            <div className="flex items-center">
              <Link
                href="/dashboard/recruiter/jobs"
                className="inline-flex h-9 items-center gap-2 border border-[var(--df-line)] px-3 text-[10px] font-bold uppercase tracking-[0.12em] transition hover:bg-white"
              >
                <BriefcaseBusiness size={13} />
                Jobs
              </Link>

              <button
                type="button"
                onClick={loadApplications}
                className="ml-[-1px] flex h-9 w-9 items-center justify-center border border-[var(--df-line)] transition hover:bg-white"
                title="Refresh applications"
              >
                <RefreshCw
                  size={13}
                  className={loadingList ? "animate-spin" : ""}
                />
              </button>
            </div>
          </div>
        </header>

        {/* -------------------------------------------------
            PIPELINE METRICS
        -------------------------------------------------- */}
        <section className="border-b border-[var(--df-line)]">
          <div className="grid grid-cols-2 lg:grid-cols-4">
            <Metric
              index="01"
              icon={FileText}
              label="Total applications"
              value={total}
            />

            <Metric
              index="02"
              icon={Clock3}
              label="Pending"
              value={pageStats.pending}
            />

            <Metric
              index="03"
              icon={SlidersHorizontal}
              label="In review"
              value={pageStats.review}
            />

            <Metric
              index="04"
              icon={Users}
              label="Accepted"
              value={pageStats.accepted}
            />
          </div>
        </section>

        {/* -------------------------------------------------
            FILTER BAR
        -------------------------------------------------- */}
        <section className="border-b border-[var(--df-line)] py-4">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[9px] font-bold uppercase tracking-[0.16em] text-[var(--df-muted)]">
                Filter
              </span>

              <span className="h-3 w-px bg-[var(--df-line)]" />

              <span className="font-mono text-[10px] text-[var(--df-muted)]">
                {total} records
              </span>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <label className="relative flex h-9 min-w-[220px] items-center border border-[var(--df-line)] bg-[var(--df-paper)] focus-within:border-[var(--df-text)]">
                <Search
                  size={13}
                  className="ml-3 shrink-0 text-[var(--df-muted)]"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder="Search applicants or jobs"
                  aria-label="Search applicants or jobs"
                  className="h-full w-full bg-transparent px-2 text-[10px] outline-none placeholder:text-[var(--df-muted)]"
                />
              </label>

              <select
                value={filters.jobId}
                disabled={loadingJobs}
                onChange={(event) =>
                  updateFilter("jobId", event.target.value)
                }
                className="h-9 min-w-[190px] border border-[var(--df-line)] bg-[var(--df-paper)] px-3 text-[10px] font-bold uppercase tracking-[0.08em] outline-none transition focus:border-[var(--df-text)]"
              >
                <option value="">All positions</option>

                {jobs?.map((job) => (
                  <option key={job.id} value={job.id}>
                    {job.title}
                  </option>
                ))}
              </select>

              <select
                value={filters.status}
                onChange={(event) =>
                  updateFilter("status", event.target.value)
                }
                className="h-9 min-w-[145px] border border-[var(--df-line)] bg-[var(--df-paper)] px-3 text-[10px] font-bold uppercase tracking-[0.08em] outline-none transition focus:border-[var(--df-text)]"
              >
                {STATUS_OPTIONS.map((option) => (
                  <option
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </option>
                ))}
              </select>

              <select
                value={filters.sort}
                onChange={(event) =>
                  updateFilter("sort", event.target.value)
                }
                className="h-9 min-w-[130px] border border-[var(--df-line)] bg-[var(--df-paper)] px-3 text-[10px] font-bold uppercase tracking-[0.08em] outline-none transition focus:border-[var(--df-text)]"
              >
                {SORT_OPTIONS.map((option) => (
                  <option
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </option>
                ))}
              </select>

              {hasFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="h-9 border border-[var(--df-text)] px-3 text-[10px] font-bold uppercase tracking-[0.1em] transition hover:bg-[var(--df-text)] hover:text-white"
                >
                  Reset
                </button>
              )}
            </div>
          </div>
        </section>

        {/* -------------------------------------------------
            ERROR
        -------------------------------------------------- */}
        {errorList && (
          <div className="border-b border-[#dcc5c1] bg-[#f7eeee] px-4 py-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.08em] text-[#76504b]">
                  Unable to load applications
                </p>

                <p className="mt-1 text-xs text-[#76504b]">
                  {errorList}
                </p>
              </div>

              <button
                type="button"
                onClick={loadApplications}
                className="h-8 border border-[#dcc5c1] bg-[var(--df-paper)] px-3 text-[10px] font-bold uppercase tracking-[0.1em] text-[#76504b]"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* -------------------------------------------------
            APPLICATION LEDGER
        -------------------------------------------------- */}
        <section className="pt-5">
          <div className="mb-3 flex items-end justify-between">
            <div>
              <p className="font-mono text-[9px] font-bold uppercase tracking-[0.16em] text-[var(--df-muted)]">
                Candidate pipeline
              </p>

              <p className="mt-1 text-xs text-[var(--df-muted)]">
                Current applications received by your company.
              </p>
            </div>
          </div>

          {loadingList ? (
            <ApplicationsSkeleton />
          ) : applications?.length === 0 ? (
            <div className="border-y border-[var(--df-line)] py-20 text-center">
              <div className="mx-auto flex h-10 w-10 items-center justify-center border border-[var(--df-line)]">
                <Users
                  size={18}
                  strokeWidth={1.5}
                  className="text-[var(--df-muted)]"
                />
              </div>

              <h2 className="mt-4 text-sm font-semibold tracking-tight">
                No applications found
              </h2>

              <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-[var(--df-muted)]">
                {hasFilters
                  ? "No applications match the current filters."
                  : "Applications submitted to your company's positions will appear here."}
              </p>

              {hasFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-5 border border-[var(--df-line)] px-4 py-2 text-[9px] font-bold uppercase tracking-[0.12em] transition hover:border-[var(--df-text)]"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <>
              {/* DESKTOP COLUMN LABELS */}
              <div className="hidden grid-cols-[minmax(280px,1.7fr)_minmax(220px,1.1fr)_150px_130px_36px] gap-4 border-y border-[var(--df-line)] bg-black/[0.018] px-4 py-2.5 lg:grid">
                <span className="font-mono text-[8px] font-bold uppercase tracking-[0.18em] text-[var(--df-muted)]">
                  Candidate
                </span>

                <span className="font-mono text-[8px] font-bold uppercase tracking-[0.18em] text-[var(--df-muted)]">
                  Position
                </span>

                <span className="font-mono text-[8px] font-bold uppercase tracking-[0.18em] text-[var(--df-muted)]">
                  Status
                </span>

                <span className="font-mono text-[8px] font-bold uppercase tracking-[0.18em] text-[var(--df-muted)]">
                  Applied
                </span>

                <span />
              </div>

              {/* APPLICATION ROWS */}
              <div className="border-b border-[var(--df-line)]">
                {applications.map((application, index) => {
                  const candidateName =
                    getCandidateName(application);

                  return (
                    <Link
                      key={application.id}
                      href={`/dashboard/recruiter/applications/${application.id}`}
                      className="group block border-t border-[var(--df-line)] px-4 py-4 transition hover:bg-white"
                    >
                      <div className="grid gap-4 lg:grid-cols-[minmax(280px,1.7fr)_minmax(220px,1.1fr)_150px_130px_36px] lg:items-center">
                        {/* CANDIDATE */}
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="relative flex h-9 w-9 shrink-0 items-center justify-center border border-[var(--df-line)] bg-white font-mono text-[10px] font-bold">
                            {getInitials(candidateName)}

                            <span className="absolute -bottom-px -right-px h-1.5 w-1.5 bg-[var(--df-text)]" />
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="truncate text-[13px] font-semibold tracking-[-0.02em]">
                                {candidateName}
                              </p>

                              <span className="font-mono text-[8px] text-[var(--df-muted)]">
                                #{String(index + 1).padStart(2, "0")}
                              </span>
                            </div>

                            <p className="mt-1 truncate text-[10px] text-[var(--df-muted)]">
                              {application
                                .developerProfile
                                ?.locationPreference ||
                                "Developer applicant"}
                            </p>
                          </div>
                        </div>

                        {/* POSITION */}
                        <div className="min-w-0">
                          <div className="flex min-w-0 items-center gap-2">
                            <p className="truncate text-[12px] font-medium">
                              {application.job?.title ||
                                "Position"}
                            </p>
                            {application.job?.status === "EXPIRED" && (
                              <span className="shrink-0 border border-amber-300 bg-amber-50 px-1.5 py-0.5 font-mono text-[8px] font-bold uppercase tracking-[0.08em] text-amber-800">
                                Expired
                              </span>
                            )}
                          </div>

                          <div className="mt-1 flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.06em] text-[var(--df-muted)]">
                            <span>
                              {application.job
                                ?.employmentType || "—"}
                            </span>

                            <span className="text-[var(--df-line)]">
                              /
                            </span>

                            <span>
                              {application.job
                                ?.locationPreference || "—"}
                            </span>
                          </div>
                        </div>

                        {/* STATUS */}
                        <div>
                          <StatusBadge
                            status={application.status}
                          />
                        </div>

                        {/* DATE */}
                        <div>
                          <p className="font-mono text-[10px] font-medium">
                            {formatDate(
                              application.createdAt
                            )}
                          </p>

                          <p className="mt-1 font-mono text-[8px] uppercase tracking-[0.12em] text-[var(--df-muted)]">
                            Received
                          </p>
                        </div>

                        {/* ACTION */}
                        <div className="flex justify-end">
                          <span className="flex h-8 w-8 items-center justify-center border border-[var(--df-line)] transition group-hover:border-[var(--df-text)] group-hover:bg-[var(--df-text)] group-hover:text-white">
                            <ArrowUpRight size={13} />
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>

              <div className="mt-5">
                <Pagination
                  metadata={metadata}
                  page={page}
                  onPageChange={setPage}
                />
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
