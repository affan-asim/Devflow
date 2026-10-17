"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import {
  Search,
  RefreshCw,
  ArrowUpRight,
  Star,
  BriefcaseBusiness,
  Users,
  CheckCircle2,
  FileText,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  X,
} from "lucide-react";

import {
  fetchAdminJobs,
  updateJobFeaturedStatus,
} from "@/lib/redux/slices/jobSlice";

const initialFilters = {
  search: "",
  status: "",
  employmentType: "",
  experienceLevel: "",
  isFeatured: "",
  sort: "newest",
};

const statusOptions = ["DRAFT", "ACTIVE", "CLOSED", "EXPIRED"];

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function formatSalary(job) {
  if (job.minSalary == null && job.maxSalary == null) return "Not specified";

  const currency = job.currency || "USD";
  const money = (value) =>
    value == null
      ? null
      : new Intl.NumberFormat("en", {
          notation: "compact",
          maximumFractionDigits: 1,
        }).format(value);

  if (job.minSalary != null && job.maxSalary != null) {
    return `${currency} ${money(job.minSalary)}–${money(job.maxSalary)}`;
  }

  return `${currency} ${money(job.minSalary ?? job.maxSalary)}+`;
}

function StatusPill({ status }) {
  const styles = {
    ACTIVE: "bg-[var(--df-accent)] text-[var(--df-black)]",
    DRAFT: "bg-[var(--df-paper-3)] text-[var(--df-text)]",
    CLOSED: "bg-[var(--df-paper-2)] text-[var(--df-muted)]",
    EXPIRED: "bg-[var(--df-paper-2)] text-[var(--df-muted)]",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 text-[10px] font-bold uppercase tracking-[.12em] ${
        styles[status] || styles.DRAFT
      }`}
    >
      {status || "UNKNOWN"}
    </span>
  );
}

function Metric({ label, value, icon: Icon, detail }) {
  return (
    <div className="border border-[var(--df-line)] bg-[var(--df-paper)] p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs text-[var(--df-muted)]">{label}</span>
        <Icon size={17} className="text-[var(--df-muted)]" />
      </div>
      <p className="mt-4 text-3xl font-semibold tracking-[-.05em] text-[var(--df-text-strong)]">
        {Number(value || 0).toLocaleString()}
      </p>
      {detail && (
        <p className="mt-1 text-xs text-[var(--df-muted)]">{detail}</p>
      )}
    </div>
  );
}

export default function AdminJobsPage() {
  const dispatch = useDispatch();

  const {
    jobs = [],
    metadata = {},
    adminStats = {},
    loadingList,
    submitting,
    errorList,
    submitError,
  } = useSelector((state) => state.jobs);

  const [filters, setFilters] = useState(initialFilters);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [notice, setNotice] = useState("");

  const loadJobs = useCallback(
    (overrides = {}) => {
      const params = {
        ...filters,
        page,
        limit: 10,
        ...overrides,
      };

      Object.keys(params).forEach((key) => {
        if (params[key] === "" || params[key] == null) delete params[key];
      });

      return dispatch(fetchAdminJobs(params));
    },
    [dispatch, filters, page]
  );

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setPage(1);
      setFilters((current) => ({ ...current, search: searchInput.trim() }));
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [searchInput]);

  useEffect(() => {
    const request = loadJobs();
    return () => request.abort?.();
  }, [loadJobs]);

  const totalPages = metadata.totalPages || 0;
  const currentPage = metadata.currentPage || page;

  const updateFilter = (key, value) => {
    setPage(1);
    setFilters((current) => ({ ...current, [key]: value }));
  };

  const resetFilters = () => {
    setSearchInput("");
    setFilters(initialFilters);
    setPage(1);
  };

  const toggleFeatured = async (job) => {
    setNotice("");

    const result = await dispatch(
      updateJobFeaturedStatus({
        jobId: job.id,
        isFeatured: !job.isFeatured,
      })
    );

    if (updateJobFeaturedStatus.fulfilled.match(result)) {
      setNotice(
        `${job.title} ${job.isFeatured ? "removed from" : "added to"} featured jobs.`
      );
      loadJobs();
    }
  };

  const hasFilters = useMemo(
    () =>
      Boolean(
        filters.search ||
          filters.status ||
          filters.employmentType ||
          filters.experienceLevel ||
          filters.isFeatured
      ),
    [filters]
  );

  return (
    <main className="min-h-screen bg-[var(--df-paper)] text-[var(--df-text)]">
      <div className="mx-auto max-w-[1440px] px-4 py-7 sm:px-6 lg:px-10 lg:py-10">
        <header className="border-b border-[var(--df-line)] pb-7">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div>
              <p className="mb-3 text-[10px] font-bold uppercase tracking-[.2em] text-[var(--df-muted)]">
                DevFlow / Administration
              </p>
              <h1 className="text-4xl font-semibold tracking-[-.06em] text-[var(--df-text-strong)] sm:text-5xl">
                Job directory<span className="text-[var(--df-muted)]">.</span>
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-[var(--df-muted)]">
                Review job postings, manage featured placement, and moderate
                listings across the platform.
              </p>
            </div>

            <button
              type="button"
              onClick={() => loadJobs()}
              disabled={loadingList}
              className="df-btn inline-flex items-center gap-2 border border-[var(--df-line)] px-4 py-3 text-sm disabled:opacity-50"
            >
              <RefreshCw size={15} className={loadingList ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
        </header>

        <section className="grid grid-cols-2 gap-3 py-6 lg:grid-cols-4">
          <Metric label="All jobs" value={adminStats.totalJobs} icon={BriefcaseBusiness} />
          <Metric label="Active listings" value={adminStats.activeCount} icon={CheckCircle2} />
          <Metric label="Featured" value={adminStats.featuredCount} icon={Star} />
          <Metric label="Drafts" value={adminStats.draftCount} icon={FileText} />
        </section>

        <section className="border border-[var(--df-line)] bg-[var(--df-paper)]">
          <div className="flex flex-col gap-3 border-b border-[var(--df-line)] p-4 lg:flex-row lg:items-center">
            <div className="relative min-w-0 flex-1">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--df-muted)]"
              />
              <input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search title, description, or company..."
                className="w-full border border-[var(--df-line)] bg-transparent py-3 pl-9 pr-3 text-sm outline-none transition focus:border-[var(--df-text)]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <SlidersHorizontal size={15} className="hidden text-[var(--df-muted)] sm:block" />

              <select
                aria-label="Filter by status"
                value={filters.status}
                onChange={(event) => updateFilter("status", event.target.value)}
                className="min-w-28 border border-[var(--df-line)] bg-transparent px-3 py-3 text-xs outline-none"
              >
                <option value="">All statuses</option>
                {statusOptions.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>

              <select
                aria-label="Filter by employment type"
                value={filters.employmentType}
                onChange={(event) => updateFilter("employmentType", event.target.value)}
                className="min-w-32 border border-[var(--df-line)] bg-transparent px-3 py-3 text-xs outline-none"
              >
                <option value="">All types</option>
                <option value="FULLTIME">Full-time</option>
                <option value="PARTTIME">Part-time</option>
                <option value="CONTRACT">Contract</option>
                <option value="INTERNSHIP">Internship</option>
              </select>

              <select
                aria-label="Filter by experience"
                value={filters.experienceLevel}
                onChange={(event) => updateFilter("experienceLevel", event.target.value)}
                className="min-w-32 border border-[var(--df-line)] bg-transparent px-3 py-3 text-xs outline-none"
              >
                <option value="">All experience</option>
                <option value="BEGINNER">Entry level</option>
                <option value="INTERMEDIATE">Mid level</option>
                <option value="EXPERT">Senior</option>
              </select>

              <select
                aria-label="Filter by featured status"
                value={filters.isFeatured}
                onChange={(event) => updateFilter("isFeatured", event.target.value)}
                className="min-w-32 border border-[var(--df-line)] bg-transparent px-3 py-3 text-xs outline-none"
              >
                <option value="">All placement</option>
                <option value="true">Featured</option>
                <option value="false">Not featured</option>
              </select>

              <select
                aria-label="Sort jobs"
                value={filters.sort}
                onChange={(event) => updateFilter("sort", event.target.value)}
                className="min-w-32 border border-[var(--df-line)] bg-transparent px-3 py-3 text-xs outline-none"
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="title_asc">Title A–Z</option>
                <option value="title_desc">Title Z–A</option>
                <option value="salary_high">Highest salary</option>
                <option value="salary_low">Lowest salary</option>
                <option value="deadline">Deadline soon</option>
              </select>

              {hasFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="inline-flex items-center gap-1 px-2 py-3 text-xs text-[var(--df-muted)] hover:text-[var(--df-text)]"
                >
                  <X size={13} /> Clear
                </button>
              )}
            </div>
          </div>

          {notice && (
            <div role="status" className="border-b border-[var(--df-line)] px-4 py-3 text-sm">
              {notice}
            </div>
          )}

          {errorList && (
            <div role="alert" className="m-4 border border-red-300 px-4 py-3 text-sm text-red-700">
              {String(errorList)}
            </div>
          )}

          {submitError && (
            <div role="alert" className="m-4 border border-red-300 px-4 py-3 text-sm text-red-700">
              {String(submitError)}
            </div>
          )}

          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[950px] border-collapse text-left">
              <thead className="bg-[var(--df-paper-2)]">
                <tr className="text-[10px] font-bold uppercase tracking-[.14em] text-[var(--df-muted)]">
                  <th className="px-5 py-4">Job / company</th>
                  <th className="px-4 py-4">Status</th>
                  <th className="px-4 py-4">Applications</th>
                  <th className="px-4 py-4">Salary</th>
                  <th className="px-4 py-4">Published</th>
                  <th className="px-4 py-4">Featured</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody>
                {loadingList && jobs.length === 0 ? (
                  <tr><td colSpan={7} className="px-5 py-14 text-center text-sm text-[var(--df-muted)]">Loading jobs…</td></tr>
                ) : jobs.length === 0 ? (
                  <tr><td colSpan={7} className="px-5 py-14 text-center text-sm text-[var(--df-muted)]">No jobs match these filters.</td></tr>
                ) : jobs.map((job) => (
                  <tr key={job.id} className="border-t border-[var(--df-line)] transition hover:bg-[var(--df-paper-2)]/60">
                    <td className="px-5 py-4">
                      <Link href={`/dashboard/admin/jobs/${job.id}`} className="group block max-w-sm">
                        <span className="font-semibold text-[var(--df-text-strong)] group-hover:underline">
                          {job.title}
                        </span>
                        <span className="mt-1 block text-xs text-[var(--df-muted)]">
                          {job.company?.name || "Company unavailable"}
                          {job.company?.isVerified ? " · Verified" : ""}
                        </span>
                      </Link>
                    </td>
                    <td className="px-4 py-4"><StatusPill status={job.status} /></td>
                    <td className="px-4 py-4 text-sm tabular-nums">{job._count?.applications ?? 0}</td>
                    <td className="px-4 py-4 text-xs">{formatSalary(job)}</td>
                    <td className="px-4 py-4 text-xs text-[var(--df-muted)]">{formatDate(job.publishedAt || job.createdAt)}</td>
                    <td className="px-4 py-4">
                      <button
                        type="button"
                        onClick={() => toggleFeatured(job)}
                        disabled={submitting}
                        aria-label={`${job.isFeatured ? "Remove featured status from" : "Feature"} ${job.title}`}
                        className={`inline-flex items-center gap-2 text-xs disabled:opacity-50 ${job.isFeatured ? "text-[var(--df-text-strong)]" : "text-[var(--df-muted)]"}`}
                      >
                        <Star size={16} fill={job.isFeatured ? "currentColor" : "none"} />
                        {job.isFeatured ? "Featured" : "Off"}
                      </button>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end">
                        <Link
                          href={`/dashboard/admin/jobs/${job.id}`}
                          aria-label={`View ${job.title}`}
                          className="text-[var(--df-muted)] hover:text-[var(--df-text)]"
                        >
                          <ArrowUpRight size={17} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="divide-y divide-[var(--df-line)] md:hidden">
            {loadingList && jobs.length === 0 ? (
              <p className="p-6 text-sm text-[var(--df-muted)]">Loading jobs…</p>
            ) : jobs.length === 0 ? (
              <p className="p-6 text-sm text-[var(--df-muted)]">No jobs match these filters.</p>
            ) : jobs.map((job) => (
              <article key={job.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link href={`/dashboard/admin/jobs/${job.id}`} className="font-semibold text-[var(--df-text-strong)]">
                      {job.title}
                    </Link>
                    <p className="mt-1 text-xs text-[var(--df-muted)]">{job.company?.name || "Company unavailable"}</p>
                  </div>
                  <StatusPill status={job.status} />
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                  <div><p className="text-[var(--df-muted)]">Applications</p><p className="mt-1 font-medium">{job._count?.applications ?? 0}</p></div>
                  <div><p className="text-[var(--df-muted)]">Salary</p><p className="mt-1 font-medium">{formatSalary(job)}</p></div>
                  <div><p className="text-[var(--df-muted)]">Created</p><p className="mt-1 font-medium">{formatDate(job.createdAt)}</p></div>
                  <div><p className="text-[var(--df-muted)]">Featured</p><p className="mt-1 font-medium">{job.isFeatured ? "Yes" : "No"}</p></div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-[var(--df-line)] pt-3">
                  <Link href={`/dashboard/admin/jobs/${job.id}`} className="text-xs font-semibold underline underline-offset-4">View details</Link>
                  <button type="button" onClick={() => toggleFeatured(job)} disabled={submitting} className="text-xs disabled:opacity-50">
                    {job.isFeatured ? "Remove featured" : "Feature job"}
                  </button>
                </div>
              </article>
            ))}
          </div>

          <footer className="flex flex-col gap-3 border-t border-[var(--df-line)] px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-[var(--df-muted)]">
              {metadata.totalCount ?? jobs.length} results
              {totalPages > 0 && ` · Page ${currentPage} of ${totalPages}`}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={!metadata.hasPreviousPage || loadingList}
                className="inline-flex items-center gap-1 border border-[var(--df-line)] px-3 py-2 text-xs disabled:opacity-40"
              >
                <ChevronLeft size={14} /> Previous
              </button>
              <button
                type="button"
                onClick={() => setPage((current) => current + 1)}
                disabled={!metadata.hasNextPage || loadingList}
                className="inline-flex items-center gap-1 border border-[var(--df-line)] px-3 py-2 text-xs disabled:opacity-40"
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          </footer>
        </section>
      </div>
    </main>
  );
}