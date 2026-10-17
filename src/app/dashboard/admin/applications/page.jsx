
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  Search,
  SlidersHorizontal,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ExternalLink,
  FileText,
  Users,
  Clock3,
  CheckCircle2,
  XCircle,
  Eye,
  X,
} from "lucide-react";
import { fetchAdminApplications } from "@/lib/redux/slices/applicationSlice";

const STATUSES = ["ALL", "PENDING", "REVIEW", "ACCEPTED", "REJECTED"];

const statusStyles = {
  PENDING: "bg-amber-50 text-amber-800 border-amber-200",
  REVIEW: "bg-blue-50 text-blue-800 border-blue-200",
  ACCEPTED: "bg-emerald-50 text-emerald-800 border-emerald-200",
  REJECTED: "bg-rose-50 text-rose-800 border-rose-200",
};

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : new Intl.DateTimeFormat("en", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(date);
};

const initials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0] || "")
    .join("")
    .toUpperCase() || "NA";

function StatusBadge({ status }) {
  const value = String(status || "UNKNOWN").toUpperCase();

  return (
    <span
      className={`inline-flex items-center gap-2 whitespace-nowrap border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] ${
        statusStyles[value] || "border-[var(--df-line)] bg-[var(--df-paper-2)] text-[var(--df-muted)]"
      }`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {value.replaceAll("_", " ")}
    </span>
  );
}

function Metric({ label, value, icon: Icon, note }) {
  return (
    <div className="min-w-0 border border-[var(--df-line)] bg-[var(--df-paper)] p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-medium uppercase tracking-[0.12em] text-[var(--df-muted)]">
          {label}
        </p>
        <Icon size={17} className="shrink-0 text-[var(--df-muted)]" />
      </div>
      <p className="mt-4 text-3xl font-semibold tracking-[-0.06em] text-[var(--df-text-strong)]">
        {value}
      </p>
      <p className="mt-1 text-xs text-[var(--df-muted)]">{note}</p>
    </div>
  );
}

export default function AdminApplicationsPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();

  const {
    applications = [],
    metadata = {},
    loadingList,
    errorList,
  } = useSelector((state) => state.applications);

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [status, setStatus] = useState(searchParams.get("status") || "ALL");
  const [sortBy, setSortBy] = useState(searchParams.get("sortBy") || "createdAt");
  const [sortOrder, setSortOrder] = useState(searchParams.get("sortOrder") || "desc");
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);
  const [limit, setLimit] = useState(Number(searchParams.get("limit")) || 20);
  const [showFilters, setShowFilters] = useState(false);

  const loadApplications = useCallback(
    (overrides = {}) => {
      const params = {
        page,
        limit,
        search: search.trim() || undefined,
        status: status === "ALL" ? undefined : status,
        sortBy,
        sortOrder,
        ...overrides,
      };

      Object.keys(params).forEach((key) => {
        if (params[key] === undefined || params[key] === "") delete params[key];
      });

      dispatch(fetchAdminApplications(params));
    },
    [dispatch, page, limit, search, status, sortBy, sortOrder]
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadApplications();
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());
      if (status !== "ALL") params.set("status", status);
      params.set("sortBy", sortBy);
      params.set("sortOrder", sortOrder);
      params.set("page", String(page));
      params.set("limit", String(limit));
      router.replace(`?${params.toString()}`, { scroll: false });
    }, 250);

    return () => window.clearTimeout(timer);
  }, [loadApplications, router, search, status, sortBy, sortOrder, page, limit]);

  const pageCounts = useMemo(() => {
    const counts = { PENDING: 0, REVIEW: 0, ACCEPTED: 0, REJECTED: 0 };
    applications.forEach((application) => {
      if (counts[application.status] !== undefined) counts[application.status]++;
    });
    return counts;
  }, [applications]);

  const total = metadata.totalCount ?? metadata.total ?? 0;
  const totalPages = metadata.totalPages ?? 0;
  const currentPage = metadata.currentPage ?? metadata.page ?? page;

  const changeStatus = (nextStatus) => {
    setStatus(nextStatus);
    setPage(1);
  };

  const changeSort = (field) => {
    if (sortBy === field) {
      setSortOrder((current) => (current === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortOrder(field === "status" ? "asc" : "desc");
    }
    setPage(1);
  };

  return (
    <main className="min-h-screen bg-[var(--df-paper)] text-[var(--df-text)]">
      <div className="mx-auto w-full max-w-[1440px] px-4 py-7 sm:px-6 lg:px-10 lg:py-10">
        <div className="flex flex-col justify-between gap-6 border-b border-[var(--df-line)] pb-7 md:flex-row md:items-end">
          <div>
            <p className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--df-muted)]">
              <span className="h-2 w-2 bg-[var(--df-accent)]" />
              DevFlow / Administration
            </p>
            <h1 className="text-4xl font-semibold tracking-[-0.07em] sm:text-5xl">
              Applications<span className="text-[var(--df-muted)]">.</span>
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-[var(--df-muted)]">
              Review candidate submissions, track hiring progress, and inspect
              the records attached to each application.
            </p>
          </div>

          <button
            type="button"
            onClick={() => loadApplications()}
            disabled={loadingList}
            className="inline-flex h-11 items-center justify-center gap-2 border border-[var(--df-line)] px-4 text-sm font-semibold transition hover:bg-[var(--df-paper-2)] disabled:opacity-50"
          >
            <RefreshCw size={15} className={loadingList ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 xl:grid-cols-4">
          <Metric label="All results" value={total} icon={Users} note="Matching current filters" />
          <Metric label="Pending" value={pageCounts.PENDING} icon={Clock3} note="On this page" />
          <Metric label="In review" value={pageCounts.REVIEW} icon={FileText} note="On this page" />
          <Metric label="Accepted" value={pageCounts.ACCEPTED} icon={CheckCircle2} note="On this page" />
        </div>

        <section className="mt-8">
          <div className="flex flex-col gap-4 border-b border-[var(--df-line)] pb-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-1">
              {STATUSES.map((item) => (
                <button
                  type="button"
                  key={item}
                  onClick={() => changeStatus(item)}
                  className={`px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.1em] transition ${
                    status === item
                      ? "bg-[var(--df-black)] text-white"
                      : "text-[var(--df-muted)] hover:bg-[var(--df-paper-2)] hover:text-[var(--df-text)]"
                  }`}
                >
                  {item.replaceAll("_", " ")}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              <label className="flex h-10 min-w-0 flex-1 items-center gap-2 border border-[var(--df-line)] px-3 sm:min-w-[250px]">
                <Search size={16} className="shrink-0 text-[var(--df-muted)]" />
                <input
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setPage(1);
                  }}
                  placeholder="Search applicant, job, company..."
                  className="w-full bg-transparent text-sm outline-none placeholder:text-[var(--df-soft)]"
                />
                {search && (
                  <button type="button" onClick={() => setSearch("")} aria-label="Clear search">
                    <X size={15} className="text-[var(--df-muted)]" />
                  </button>
                )}
              </label>

              <button
                type="button"
                onClick={() => setShowFilters((value) => !value)}
                className={`inline-flex h-10 items-center gap-2 border px-3 text-sm ${
                  showFilters
                    ? "border-[var(--df-black)] bg-[var(--df-paper-2)]"
                    : "border-[var(--df-line)] hover:bg-[var(--df-paper-2)]"
                }`}
              >
                <SlidersHorizontal size={15} />
                Sort
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="grid gap-3 border-b border-[var(--df-line)] bg-[var(--df-paper-2)] p-4 sm:grid-cols-3">
              <label className="text-xs font-medium text-[var(--df-muted)]">
                Sort by
                <select
                  value={sortBy}
                  onChange={(event) => {
                    setSortBy(event.target.value);
                    setPage(1);
                  }}
                  className="mt-2 block h-10 w-full border border-[var(--df-line)] bg-[var(--df-paper)] px-3 text-sm text-[var(--df-text)]"
                >
                  <option value="createdAt">Application date</option>
                  <option value="updatedAt">Last updated</option>
                  <option value="status">Status</option>
                </select>
              </label>
              <label className="text-xs font-medium text-[var(--df-muted)]">
                Direction
                <select
                  value={sortOrder}
                  onChange={(event) => {
                    setSortOrder(event.target.value);
                    setPage(1);
                  }}
                  className="mt-2 block h-10 w-full border border-[var(--df-line)] bg-[var(--df-paper)] px-3 text-sm text-[var(--df-text)]"
                >
                  <option value="desc">Descending</option>
                  <option value="asc">Ascending</option>
                </select>
              </label>
              <label className="text-xs font-medium text-[var(--df-muted)]">
                Rows per page
                <select
                  value={limit}
                  onChange={(event) => {
                    setLimit(Number(event.target.value));
                    setPage(1);
                  }}
                  className="mt-2 block h-10 w-full border border-[var(--df-line)] bg-[var(--df-paper)] px-3 text-sm text-[var(--df-text)]"
                >
                  <option value={10}>10 rows</option>
                  <option value={20}>20 rows</option>
                  <option value={50}>50 rows</option>
                  <option value={100}>100 rows</option>
                </select>
              </label>
            </div>
          )}

          {errorList && (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
              <span>{typeof errorList === "string" ? errorList : "Unable to load applications."}</span>
              <button type="button" onClick={() => loadApplications()} className="font-semibold underline">
                Try again
              </button>
            </div>
          )}

          <div className="mt-4 overflow-x-auto border border-[var(--df-line)]">
            <table className="w-full min-w-[950px] border-collapse text-left">
              <thead className="bg-[var(--df-paper-2)]">
                <tr className="border-b border-[var(--df-line)] text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--df-muted)]">
                  <th className="px-5 py-4">Applicant</th>
                  <th className="px-5 py-4">Position / Company</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">
                    <button onClick={() => changeSort("createdAt")} className="inline-flex items-center gap-2">
                      Applied <ArrowUpDown size={12} />
                    </button>
                  </th>
                  <th className="px-5 py-4">Documents</th>
                  <th className="px-5 py-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody>
                {loadingList && applications.length === 0 ? (
                  Array.from({ length: 6 }).map((_, index) => (
                    <tr key={index} className="border-b border-[var(--df-line-soft)]">
                      {Array.from({ length: 6 }).map((__, cell) => (
                        <td key={cell} className="px-5 py-5">
                          <div className="h-4 animate-pulse bg-[var(--df-paper-3)]" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : applications.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center border border-[var(--df-line)]">
                        <FileText size={20} className="text-[var(--df-muted)]" />
                      </div>
                      <p className="mt-4 font-semibold">No applications found</p>
                      <p className="mt-1 text-sm text-[var(--df-muted)]">
                        Try changing your search or status filter.
                      </p>
                    </td>
                  </tr>
                ) : (
                  applications.map((application) => {
                    const applicant = application.developerProfile?.user;
                    const job = application.job;

                    return (
                      <tr
                        key={application.id}
                        className="border-b border-[var(--df-line-soft)] transition last:border-b-0 hover:bg-[var(--df-paper-2)]/70"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-[var(--df-line)] bg-[var(--df-paper-2)] text-xs font-semibold">
                              {initials(applicant?.name)}
                            </div>
                            <div className="min-w-0">
                              <p className="max-w-[210px] truncate text-sm font-semibold">
                                {applicant?.name || "Unknown applicant"}
                              </p>
                              <p className="mt-1 max-w-[220px] truncate text-xs text-[var(--df-muted)]">
                                {applicant?.email || "No email"}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <p className="max-w-[250px] truncate text-sm font-semibold">
                            {job?.title || "Untitled position"}
                          </p>
                          <p className="mt-1 text-xs text-[var(--df-muted)]">
                            {job?.company?.name || "Unknown company"}
                          </p>
                        </td>
                        <td className="px-5 py-4">
                          <StatusBadge status={application.status} />
                        </td>
                        <td className="whitespace-nowrap px-5 py-4 text-sm text-[var(--df-muted)]">
                          {formatDate(application.createdAt)}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <span title={application.resume ? "Resume attached" : "No resume"}>
                              <FileText
                                size={16}
                                className={application.resume ? "text-[var(--df-text)]" : "text-[var(--df-soft)]"}
                              />
                            </span>
                            <span title={application.coverLetter ? "Cover letter attached" : "No cover letter"}>
                              <span className={`inline-block h-4 w-3 border ${application.coverLetter ? "border-[var(--df-text)]" : "border-[var(--df-soft)]"}`} />
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <Link
                            href={`/dashboard/admin/applications/${application.id}`}
                            className="inline-flex h-9 items-center gap-2 border border-[var(--df-line)] px-3 text-xs font-semibold transition hover:border-[var(--df-black)] hover:bg-[var(--df-black)] hover:text-white"
                          >
                            <Eye size={14} />
                            Review
                            <ExternalLink size={12} />
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-3 py-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-[var(--df-muted)]">
              Showing {applications.length ? (currentPage - 1) * limit + 1 : 0}
              {"–"}
              {Math.min((currentPage - 1) * limit + applications.length, total)} of {total} results
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1 || loadingList}
                onClick={() => setPage((value) => Math.max(1, value - 1))}
                className="inline-flex h-10 items-center gap-1 border border-[var(--df-line)] px-3 text-sm disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft size={16} /> Previous
              </button>
              <span className="min-w-[95px] text-center text-xs text-[var(--df-muted)]">
                Page {currentPage} of {Math.max(1, totalPages)}
              </span>
              <button
                type="button"
                disabled={page >= totalPages || loadingList}
                onClick={() => setPage((value) => value + 1)}
                className="inline-flex h-10 items-center gap-1 border border-[var(--df-line)] px-3 text-sm disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
