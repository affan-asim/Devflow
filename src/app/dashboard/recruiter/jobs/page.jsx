"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import {
  BriefcaseBusiness,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Eye,
  Filter,
  MapPin,
  Pencil,
  Plus,
  Search,
  Trash2,
  Users,
  X,
} from "lucide-react";

import {
  fetchJobs,
  deleteJob,
} from "@/lib/redux/slices/jobSlice";

const PAGE_SIZE = 10;

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "DRAFT", label: "Draft" },
  { value: "ACTIVE", label: "Active" },
  { value: "CLOSED", label: "Closed" },
  { value: "EXPIRED", label: "Expired" },
];

const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "salary", label: "Highest salary" },
  { value: "deadline", label: "Closest deadline" },
];

const LOCATION_OPTIONS = [
  { value: "", label: "All locations" },
  { value: "REMOTE", label: "Remote" },
  { value: "ONSITE", label: "On-site" },
  { value: "HYBRID", label: "Hybrid" },
];

const EXPERIENCE_OPTIONS = [
  { value: "", label: "All experience" },
  { value: "BEGINNER", label: "Beginner" },
  { value: "INTERMEDIATE", label: "Intermediate" },
  { value: "EXPERT", label: "Expert" },
];

function formatStatus(status) {
  return status?.replaceAll("_", " ") || "Unknown";
}

function formatDate(date) {
  if (!date) return "—";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

function formatSalary(job) {
  if (job.minSalary == null && job.maxSalary == null) {
    return "Salary not specified";
  }

  const currency = job.currency || "";
  const formatter = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  });

  if (job.minSalary != null && job.maxSalary != null) {
    return `${currency} ${formatter.format(
      Number(job.minSalary)
    )} – ${formatter.format(Number(job.maxSalary))}`;
  }

  if (job.minSalary != null) {
    return `${currency} ${formatter.format(
      Number(job.minSalary)
    )}+`;
  }

  return `Up to ${currency} ${formatter.format(
    Number(job.maxSalary)
  )}`;
}

function normalize(value) {
  return value?.replaceAll("_", " ") || "—";
}

function StatusBadge({ status }) {
  const statusClass =
    status?.toLowerCase() || "unknown";

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] status-${statusClass}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {formatStatus(status)}
    </span>
  );
}

export default function RecruiterJobsPage() {
  const dispatch = useDispatch();

  const {
    jobs = [],
    metadata = {},
    loadingList,
    errorList,
  } = useSelector((state) => state.jobs);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const [filters, setFilters] = useState({
    status: "",
    locationPreference: "",
    experienceLevel: "",
    sort: "newest",
  });

  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] =
    useState(null);
  const [deleting, setDeleting] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const loadJobs = useCallback(() => {
    dispatch(
      fetchJobs({
        search,
        status: filters.status || undefined,

        // Keep your existing thunk contract here.
        locationPreference:
          filters.locationPreference || undefined,

        experienceLevel:
          filters.experienceLevel || undefined,

        sort: filters.sort || undefined,
        page,
        limit: PAGE_SIZE,
      })
    );
  }, [dispatch, search, filters, page]);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  const handleSearch = (event) => {
    event.preventDefault();

    setPage(1);
    setSearch(searchInput.trim());
  };

  const handleFilterChange = (key, value) => {
    setPage(1);

    setFilters((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const clearFilters = () => {
    setSearchInput("");
    setSearch("");

    setFilters({
      status: "",
      locationPreference: "",
      experienceLevel: "",
      sort: "newest",
    });

    setPage(1);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      setDeleting(true);

      await dispatch(
        deleteJob(deleteTarget.id)
      ).unwrap();

      setDeleteTarget(null);

      if (jobs.length === 1 && page > 1) {
        setPage((current) => current - 1);
      } else {
        loadJobs();
      }
    } catch {
      // Redux slice owns the actual error.
    } finally {
      setDeleting(false);
    }
  };

  const activeFilterCount = useMemo(() => {
    return [
      filters.status,
      filters.locationPreference,
      filters.experienceLevel,
    ].filter(Boolean).length;
  }, [filters]);

  const stats = useMemo(() => {
    return {
      total: metadata.totalCount || 0,
      active: jobs.filter(
        (job) => job.status === "ACTIVE"
      ).length,
      draft: jobs.filter(
        (job) => job.status === "DRAFT"
      ).length,
      closed: jobs.filter(
        (job) =>
          job.status === "CLOSED" ||
          job.status === "EXPIRED"
      ).length,
    };
  }, [jobs, metadata.totalCount]);

  const hasFilters = Boolean(
    search ||
      filters.status ||
      filters.locationPreference ||
      filters.experienceLevel
  );

  return (
    <main className="min-h-screen bg-[var(--df-paper)] text-[var(--df-text)]">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* Header */}
        <header className="flex flex-col gap-5 border-b border-[var(--df-line)] pb-7 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--df-muted)]">
              Recruiter workspace
            </p>

            <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
              Jobs
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--df-muted)]">
              Manage your openings, monitor applications, and keep
              your hiring pipeline moving.
            </p>
          </div>

          <Link
            href="/dashboard/recruiter/jobs/create"
            className="inline-flex h-11 items-center justify-center gap-2 bg-[var(--df-text)] px-5 text-xs font-semibold text-[var(--df-paper)] transition-opacity hover:opacity-85"
          >
            <Plus size={16} />
            Post a job
          </Link>
        </header>

        {/* Stats */}
        <section className="mt-5 grid grid-cols-2 border border-[var(--df-line)] sm:grid-cols-4">
          <StatCard
            label="Total jobs"
            value={stats.total}
            icon={BriefcaseBusiness}
          />

          <StatCard
            label="Active"
            value={stats.active}
            icon={Eye}
          />

          <StatCard
            label="Drafts"
            value={stats.draft}
            icon={Pencil}
          />

          <StatCard
            label="Closed"
            value={stats.closed}
            icon={Clock3}
          />
        </section>

        {/* Search + filters */}
        <section className="mt-5 border border-[var(--df-line)]">
          <div className="flex flex-col gap-3 p-3 sm:p-4 lg:flex-row">
            <form
              onSubmit={handleSearch}
              className="relative flex-1"
            >
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--df-muted)]"
              />

              <input
                value={searchInput}
                onChange={(event) =>
                  setSearchInput(event.target.value)
                }
                placeholder="Search by job title or description..."
                className="h-11 w-full border border-[var(--df-line)] bg-transparent pl-10 pr-10 text-sm outline-none transition-colors placeholder:text-[var(--df-muted)]/60 focus:border-[var(--df-text)]"
              />

              {searchInput && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchInput("");
                    setSearch("");
                    setPage(1);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--df-muted)] hover:text-[var(--df-text)]"
                >
                  <X size={15} />
                </button>
              )}
            </form>

            <button
              type="button"
              onClick={() =>
                setShowFilters((current) => !current)
              }
              className={`inline-flex h-11 items-center justify-center gap-2 border px-4 text-xs font-semibold transition-colors ${
                showFilters || activeFilterCount
                  ? "border-[var(--df-text)]"
                  : "border-[var(--df-line)]"
              }`}
            >
              <Filter size={15} />
              Filters

              {activeFilterCount > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--df-text)] px-1.5 text-[9px] text-[var(--df-paper)]">
                  {activeFilterCount}
                </span>
              )}
            </button>

            <button
              type="submit"
              form="job-search-form"
              onClick={handleSearch}
              className="hidden h-11 bg-[var(--df-text)] px-5 text-xs font-semibold text-[var(--df-paper)] sm:block"
            >
              Search
            </button>
          </div>

          {showFilters && (
            <div className="grid gap-3 border-t border-[var(--df-line)] p-3 sm:grid-cols-2 sm:p-4 lg:grid-cols-4">
              <FilterSelect
                label="Status"
                value={filters.status}
                options={STATUS_OPTIONS}
                onChange={(value) =>
                  handleFilterChange("status", value)
                }
              />

              <FilterSelect
                label="Location"
                value={filters.locationPreference}
                options={LOCATION_OPTIONS}
                onChange={(value) =>
                  handleFilterChange(
                    "locationPreference",
                    value
                  )
                }
              />

              <FilterSelect
                label="Experience"
                value={filters.experienceLevel}
                options={EXPERIENCE_OPTIONS}
                onChange={(value) =>
                  handleFilterChange(
                    "experienceLevel",
                    value
                  )
                }
              />

              <FilterSelect
                label="Sort"
                value={filters.sort}
                options={SORT_OPTIONS}
                onChange={(value) =>
                  handleFilterChange("sort", value)
                }
              />

              {activeFilterCount > 0 && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-left text-xs font-medium text-[var(--df-muted)] underline underline-offset-4 hover:text-[var(--df-text)]"
                >
                  Clear all filters
                </button>
              )}
            </div>
          )}
        </section>

        {/* Search summary */}
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold">
              {metadata.totalCount || 0}{" "}
              {metadata.totalCount === 1
                ? "job"
                : "jobs"}
            </p>

            {search && (
              <p className="mt-1 text-xs text-[var(--df-muted)]">
                Results for{" "}
                <span className="font-medium text-[var(--df-text)]">
                  “{search}”
                </span>
              </p>
            )}
          </div>

          {hasFilters && (
            <button
              onClick={clearFilters}
              className="self-start text-xs font-medium text-[var(--df-muted)] underline underline-offset-4 hover:text-[var(--df-text)]"
            >
              Clear search & filters
            </button>
          )}
        </div>

        {/* Error */}
        {errorList && (
          <div className="mt-4 flex flex-col gap-4 border border-red-200 bg-red-50 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-red-800">
                Couldn&apos;t load jobs
              </p>

              <p className="mt-1 text-xs text-red-700">
                {errorList}
              </p>
            </div>

            <button
              onClick={loadJobs}
              className="h-9 border border-red-300 px-4 text-xs font-semibold text-red-800 hover:bg-red-100"
            >
              Retry
            </button>
          </div>
        )}

        {/* Jobs */}
        <section className="mt-4">
          {loadingList ? (
            <JobsSkeleton />
          ) : jobs.length === 0 ? (
            <EmptyJobs
              hasFilters={hasFilters}
              onClear={clearFilters}
            />
          ) : (
            <>
              <div className="space-y-2">
                {jobs.map((job) => (
                  <JobListCard
                    key={job.id}
                    job={job}
                    onDelete={() =>
                      setDeleteTarget(job)
                    }
                  />
                ))}
              </div>

              <Pagination
                metadata={metadata}
                page={page}
                onPageChange={setPage}
              />
            </>
          )}
        </section>
      </div>

      {deleteTarget && (
        <DeleteModal
          job={deleteTarget}
          deleting={deleting}
          onCancel={() =>
            !deleting && setDeleteTarget(null)
          }
          onConfirm={handleDelete}
        />
      )}
    </main>
  );
}

function StatCard({ label, value, icon: Icon }) {
  return (
    <div className="border-r border-[var(--df-line)] p-4 last:border-r-0 sm:p-5">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--df-muted)]">
          {label}
        </span>

        <Icon
          size={15}
          className="text-[var(--df-muted)]"
        />
      </div>

      <p className="mt-3 text-2xl font-semibold tracking-[-0.04em]">
        {value}
      </p>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--df-muted)]">
        {label}
      </span>

      <select
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="h-10 w-full border border-[var(--df-line)] bg-[var(--df-paper)] px-3 text-xs outline-none focus:border-[var(--df-text)]"
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
    </label>
  );
}

function JobListCard({ job, onDelete }) {
  const applicationCount =
    job._count?.applications ??
    job.applicationCount ??
    0;

  return (
    <article className="group border border-[var(--df-line)] bg-[var(--df-paper)] transition-colors hover:border-[var(--df-text)]">
      <div className="p-4 sm:p-5 lg:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
          {/* Main */}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={job.status} />

              {job.isFeatured && (
                <span className="rounded-full border border-[var(--df-line)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em]">
                  Featured
                </span>
              )}
            </div>

            <Link
              href={`/dashboard/recruiter/jobs/${job.id}`}
              className="mt-3 block"
            >
              <h2 className="text-lg font-semibold tracking-[-0.025em] transition-opacity group-hover:opacity-70 sm:text-xl">
                {job.title}
              </h2>

              <p className="mt-1 text-sm text-[var(--df-muted)]">
                {job.company?.name ||
                  "Your company"}
              </p>
            </Link>

            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-[var(--df-muted)]">
              <span className="inline-flex items-center gap-1.5">
                <MapPin size={13} />
                {normalize(
                  job.locationPreference
                )}
              </span>

              <span className="inline-flex items-center gap-1.5">
                <BriefcaseBusiness size={13} />
                {normalize(job.employmentType)}
              </span>

              <span>
                {normalize(job.experienceLevel)}
              </span>
            </div>
          </div>

          {/* Applications */}
          <div className="flex items-center gap-4 border-y border-[var(--df-line)] py-4 lg:w-36 lg:flex-col lg:items-start lg:border-y-0 lg:border-l lg:py-0 lg:pl-6">
            <div className="flex items-center gap-2 text-[var(--df-muted)]">
              <Users size={15} />
              <span className="text-[10px] font-semibold uppercase tracking-[0.1em]">
                Applications
              </span>
            </div>

            <p className="text-xl font-semibold tracking-[-0.03em]">
              {applicationCount}
            </p>
          </div>

          {/* Deadline */}
          <div className="lg:w-44">
            <div className="flex items-center gap-2 text-[var(--df-muted)]">
              <CalendarDays size={14} />

              <span className="text-[10px] font-semibold uppercase tracking-[0.1em]">
                Deadline
              </span>
            </div>

            <p className="mt-2 text-sm font-medium">
              {formatDate(job.deadline)}
            </p>

            <p className="mt-1 text-xs text-[var(--df-muted)]">
              {formatSalary(job)}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 border-t border-[var(--df-line)] pt-4 lg:border-t-0 lg:pt-0">
            <ActionLink
              href={`/dashboard/recruiter/jobs/${job.id}`}
              label="View"
              icon={Eye}
            />

            <ActionLink
              href={`/dashboard/recruiter/jobs/${job.id}/edit`}
              label="Edit"
              icon={Pencil}
            />

            <button
              type="button"
              onClick={onDelete}
              title="Delete job"
              className="flex h-9 w-9 items-center justify-center text-[var(--df-muted)] transition-colors hover:bg-red-50 hover:text-red-600"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2 border-t border-[var(--df-line)] bg-[var(--df-paper)]/60 px-4 py-3 text-[10px] text-[var(--df-muted)] sm:flex-row sm:items-center sm:justify-between sm:px-5 lg:px-6">
        <span>
          Posted {formatDate(job.createdAt)}
        </span>

        {job.publishedAt && (
          <span>
            Published {formatDate(job.publishedAt)}
          </span>
        )}
      </div>
    </article>
  );
}

function ActionLink({
  href,
  label,
  icon: Icon,
}) {
  return (
    <Link
      href={href}
      title={label}
      className="flex h-9 w-9 items-center justify-center text-[var(--df-muted)] transition-colors hover:bg-[var(--df-text)] hover:text-[var(--df-paper)]"
    >
      <Icon size={15} />
    </Link>
  );
}

function Pagination({
  metadata,
  page,
  onPageChange,
}) {
  const totalPages = metadata?.totalPages || 0;

  if (totalPages <= 1) return null;

  const pages = [];

  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    pages.push(1);

    if (page > 3) {
      pages.push("...");
    }

    const start = Math.max(2, page - 1);
    const end = Math.min(
      totalPages - 1,
      page + 1
    );

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (page < totalPages - 2) {
      pages.push("...");
    }

    pages.push(totalPages);
  }

  return (
    <div className="mt-5 flex flex-col gap-4 border-t border-[var(--df-line)] pt-5 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs text-[var(--df-muted)]">
        Page{" "}
        <span className="font-medium text-[var(--df-text)]">
          {page}
        </span>{" "}
        of{" "}
        <span className="font-medium text-[var(--df-text)]">
          {totalPages}
        </span>
      </p>

      <div className="flex items-center gap-1">
        <button
          disabled={!metadata.hasPreviousPage}
          onClick={() => onPageChange(page - 1)}
          className="inline-flex h-9 items-center gap-1.5 border border-[var(--df-line)] px-3 text-xs font-medium transition-colors hover:border-[var(--df-text)] disabled:cursor-not-allowed disabled:opacity-35"
        >
          <ChevronLeft size={14} />
          Previous
        </button>

        <div className="hidden items-center gap-1 sm:flex">
          {pages.map((item, index) =>
            item === "..." ? (
              <span
                key={`ellipsis-${index}`}
                className="px-2 text-xs text-[var(--df-muted)]"
              >
                …
              </span>
            ) : (
              <button
                key={item}
                onClick={() =>
                  onPageChange(item)
                }
                className={`h-9 min-w-9 border px-2 text-xs font-medium ${
                  item === page
                    ? "border-[var(--df-text)] bg-[var(--df-text)] text-[var(--df-paper)]"
                    : "border-[var(--df-line)] hover:border-[var(--df-text)]"
                }`}
              >
                {item}
              </button>
            )
          )}
        </div>

        <button
          disabled={!metadata.hasNextPage}
          onClick={() => onPageChange(page + 1)}
          className="inline-flex h-9 items-center gap-1.5 border border-[var(--df-line)] px-3 text-xs font-medium transition-colors hover:border-[var(--df-text)] disabled:cursor-not-allowed disabled:opacity-35"
        >
          Next
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}

function EmptyJobs({
  hasFilters,
  onClear,
}) {
  return (
    <div className="border border-[var(--df-line)] px-5 py-16 text-center sm:py-20">
      <div className="mx-auto flex h-12 w-12 items-center justify-center border border-[var(--df-line)]">
        {hasFilters ? (
          <Search size={18} />
        ) : (
          <BriefcaseBusiness size={18} />
        )}
      </div>

      <h2 className="mt-5 text-lg font-semibold tracking-[-0.025em]">
        {hasFilters
          ? "No jobs match your filters"
          : "No job postings yet"}
      </h2>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--df-muted)]">
        {hasFilters
          ? "Try changing your search or removing some filters."
          : "Create your first job posting and start building your hiring pipeline."}
      </p>

      <div className="mt-6">
        {hasFilters ? (
          <button
            onClick={onClear}
            className="inline-flex h-10 items-center justify-center border border-[var(--df-line)] px-4 text-xs font-semibold hover:border-[var(--df-text)]"
          >
            Clear filters
          </button>
        ) : (
          <Link
            href="/dashboard/recruiter/jobs/create"
            className="inline-flex h-10 items-center justify-center gap-2 bg-[var(--df-text)] px-4 text-xs font-semibold text-[var(--df-paper)]"
          >
            <Plus size={15} />
            Post your first job
          </Link>
        )}
      </div>
    </div>
  );
}

function JobsSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 6 }).map(
        (_, index) => (
          <div
            key={index}
            className="animate-pulse border border-[var(--df-line)] p-5"
          >
            <div className="h-3 w-20 bg-[var(--df-line)]" />
            <div className="mt-4 h-5 w-64 bg-[var(--df-line)]" />
            <div className="mt-2 h-3 w-32 bg-[var(--df-line)]" />

            <div className="mt-6 flex gap-3">
              <div className="h-3 w-20 bg-[var(--df-line)]" />
              <div className="h-3 w-24 bg-[var(--df-line)]" />
              <div className="h-3 w-20 bg-[var(--df-line)]" />
            </div>
          </div>
        )
      )}
    </div>
  );
}

function DeleteModal({
  job,
  deleting,
  onCancel,
  onConfirm,
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md border border-[var(--df-line)] bg-[var(--df-paper)] p-6 shadow-2xl sm:p-7">
        <div className="flex h-10 w-10 items-center justify-center border border-red-200 bg-red-50 text-red-600">
          <Trash2 size={17} />
        </div>

        <h2 className="mt-5 text-xl font-semibold tracking-[-0.03em]">
          Delete this job?
        </h2>

        <p className="mt-2 text-sm leading-6 text-[var(--df-muted)]">
          <span className="font-medium text-[var(--df-text)]">
            “{job.title}”
          </span>{" "}
          will be permanently deleted. This action cannot be
          undone.
        </p>

        <div className="mt-7 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            onClick={onCancel}
            disabled={deleting}
            className="h-10 border border-[var(--df-line)] px-4 text-xs font-semibold hover:border-[var(--df-text)] disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            disabled={deleting}
            className="h-10 bg-red-600 px-4 text-xs font-semibold text-white disabled:opacity-50"
          >
            {deleting ? "Deleting..." : "Delete job"}
          </button>
        </div>
      </div>
    </div>
  );
}
