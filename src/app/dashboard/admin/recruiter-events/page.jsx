"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowDown,
  ArrowDownUp,
  ArrowRight,
  ArrowUp,
  Building2,
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  Clock3,
  FileText,
  RefreshCw,
  Search,
  SlidersHorizontal,
  UserRound,
  X,
  XCircle,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAdminRecruiterEvents } from "@/lib/redux/slices/adminRecruiterEventsSlice";
import api from "@/lib/api/axios";

const PAGE_SIZE = 20;

const initialFilters = {
  search: "",
  status: "",
  type: "",
  recruiterId: "",
  companyId: "",
  sortBy: "createdAt",
  sortOrder: "desc",
};

const inputClass =
  "min-h-10 w-full border border-[var(--df-line)] bg-transparent px-3 text-xs text-[var(--df-text)] outline-none transition placeholder:text-[var(--df-muted)] focus:border-[var(--df-accent)]";

function formatDate(value, includeTime = false) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    ...(includeTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  }).format(date);
}

function titleCase(value) {
  if (!value) return "Unknown";

  return String(value)
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getEventRecruiter(event) {
  return event?.recruiterHistory?.recruiter?.user;
}

function StatusBadge({ status }) {
  const styles = {
    PENDING: "border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300",
    ACCEPTED: "border-green-600/25 bg-green-500/15 text-green-800 dark:text-green-400",
    REJECTED: "border-red-500/25 bg-red-500/10 text-red-700 dark:text-red-300",
  };

  const icons = {
    PENDING: Clock3,
    ACCEPTED: CheckCircle2,
    REJECTED: XCircle,
  };

  const Icon = icons[status] || Activity;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] ${
        styles[status] || "border-[var(--df-line)] text-[var(--df-muted)]"
      }`}
    >
      <Icon size={12} />
      {titleCase(status)}
    </span>
  );
}

function EventTypeBadge({ type }) {
  const resignation = type === "RESIGN";

  return (
    <span className="inline-flex items-center gap-2 text-xs font-medium text-[var(--df-text)]">
      <span
        className={`flex h-7 w-7 items-center justify-center rounded-full ${
          resignation
            ? "bg-[var(--df-paper-2)] text-[var(--df-muted)]"
            : "bg-red-500/10 text-red-600 dark:text-red-300"
        }`}
      >
        {resignation ? <UserRound size={14} /> : <Activity size={14} />}
      </span>
      {resignation ? "Resignation" : type === "TERMINATE" ? "Termination" : titleCase(type)}
    </span>
  );
}

function MetricCard({ label, value, icon: Icon, description }) {
  return (
    <div className="min-w-0 border border-[var(--df-line)] bg-[var(--df-paper)] p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs text-[var(--df-muted)]">{label}</p>
        <Icon size={17} strokeWidth={1.6} className="shrink-0 text-[var(--df-muted)]" />
      </div>
      <p className="mt-4 text-3xl font-medium tracking-[-0.06em] text-[var(--df-text-strong)]">
        {value}
      </p>
      <p className="mt-2 text-[11px] text-[var(--df-muted)]">{description}</p>
    </div>
  );
}

function LoadingRows() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, index) => (
        <tr key={index} className="border-t border-[var(--df-line)]">
          {Array.from({ length: 5 }).map((__, cell) => (
            <td key={cell} className="px-4 py-5">
              <div className="h-3 w-full max-w-36 animate-pulse rounded bg-[var(--df-paper-3)]" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

/** Searchable Recruiter Select with Infinite Scroll */
function RecruiterSelect({ value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [recruiters, setRecruiters] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedRecruiter, setSelectedRecruiter] = useState(null);

  const fetchRecruiters = useCallback(async (pageNum, query, reset = false) => {
    setLoading(true);
    try {
      const res = await api.get("/api/profile/recruiter/general", {
        params: {
          page: pageNum,
          limit: 20,
          search: query || undefined,
        },
      });
      const payloadData = res.data?.data;
      const data = payloadData?.profiles || payloadData || [];
      const metadata = payloadData?.metadata || {};

      setRecruiters((prev) => (reset ? data : [...prev, ...data]));
      setTotalPages(metadata.totalPages || 1);
    } catch (err) {
      console.error("Failed to fetch recruiters for select:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      setPage(1);
      fetchRecruiters(1, searchQuery, true);
    }, 300);
    return () => clearTimeout(timer);
  }, [isOpen, searchQuery, fetchRecruiters]);

  useEffect(() => {
    if (value && !selectedRecruiter) {
      api
        .get(`/api/profile/recruiter/general/${value}`)
        .then((res) => {
          const r = res.data?.data;
          if (r) setSelectedRecruiter(r);
        })
        .catch(() => {});
    } else if (!value) {
      setSelectedRecruiter(null);
    }
  }, [value, selectedRecruiter]);

  const handleScroll = (e) => {
    const { scrollTop, clientHeight, scrollHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight + 30 && !loading && page < totalPages) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchRecruiters(nextPage, searchQuery, false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    function handleClickOutside(e) {
      if (!e.target.closest("#recruiter-select-container")) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const displayName = selectedRecruiter
    ? selectedRecruiter.user?.name || selectedRecruiter.name || "Recruiter"
    : "All recruiters";

  return (
    <div id="recruiter-select-container" className="relative min-w-[220px] flex-1">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`${inputClass} flex cursor-pointer items-center justify-between select-none`}
      >
        <span className="truncate">
          {selectedRecruiter
            ? `${displayName} (${selectedRecruiter.user?.email || selectedRecruiter.email || ""})`
            : "All recruiters"}
        </span>
        <div className="flex items-center gap-1 text-[var(--df-muted)]">
          {selectedRecruiter && (
            <span
              onClick={(e) => {
                e.stopPropagation();
                setSelectedRecruiter(null);
                onChange("");
              }}
              className="hover:text-[var(--df-text)]"
            >
              <X size={14} />
            </span>
          )}
          <ChevronDown size={15} />
        </div>
      </div>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 border border-[var(--df-line)] bg-[var(--df-paper)] shadow-2xl">
          <div className="border-b border-[var(--df-line)] p-2">
            <div className="relative">
              <Search
                size={14}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--df-muted)]"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search recruiter by name or email..."
                className="w-full border border-[var(--df-line)] bg-transparent py-1.5 pl-9 pr-3 text-xs text-[var(--df-text)] outline-none focus:border-[var(--df-accent)]"
                autoFocus
              />
            </div>
          </div>

          <div
            onScroll={handleScroll}
            className="max-h-60 divide-y divide-[var(--df-line)]/50 overflow-y-auto p-1"
          >
            <div
              onClick={() => {
                setSelectedRecruiter(null);
                onChange("");
                setIsOpen(false);
              }}
              className="cursor-pointer px-3 py-2 text-xs font-medium text-[var(--df-muted)] hover:bg-[var(--df-paper-2)]"
            >
              All recruiters (Clear filter)
            </div>

            {recruiters.map((r) => {
              const name = r.user?.name || r.name || "Unnamed Recruiter";
              const email = r.user?.email || r.email || "";
              return (
                <div
                  key={r.id}
                  onClick={() => {
                    setSelectedRecruiter(r);
                    onChange(r.id);
                    setIsOpen(false);
                  }}
                  className={`cursor-pointer px-3 py-2 text-xs hover:bg-[var(--df-paper-2)] ${
                    value === r.id
                      ? "bg-[var(--df-paper-2)] font-semibold text-[var(--df-text)]"
                      : "text-[var(--df-text)]"
                  }`}
                >
                  <div className="truncate font-medium">{name}</div>
                  <div className="truncate text-[10px] text-[var(--df-muted)]">
                    {email} {r.jobTitle ? `• ${r.jobTitle}` : ""}
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex items-center justify-center gap-2 py-3 text-center text-xs text-[var(--df-muted)]">
                <RefreshCw size={14} className="animate-spin" /> Loading recruiters...
              </div>
            )}

            {!loading && recruiters.length === 0 && (
              <div className="py-4 text-center text-xs text-[var(--df-muted)]">
                No recruiters found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/** Searchable Company Select with Infinite Scroll */
function CompanySelect({ value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [companies, setCompanies] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);

  const fetchCompanies = useCallback(async (pageNum, query, reset = false) => {
    setLoading(true);
    try {
      const res = await api.get("/api/company", {
        params: {
          page: pageNum,
          limit: 20,
          search: query || undefined,
        },
      });
      const payloadData = res.data?.data;
      const data = payloadData?.comapanies || payloadData?.companies || payloadData || [];
      const metadata = payloadData?.metadata || {};

      setCompanies((prev) => (reset ? data : [...prev, ...data]));
      setTotalPages(metadata.totalPages || 1);
    } catch (err) {
      console.error("Failed to fetch companies for select:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      setPage(1);
      fetchCompanies(1, searchQuery, true);
    }, 300);
    return () => clearTimeout(timer);
  }, [isOpen, searchQuery, fetchCompanies]);

  useEffect(() => {
    if (value && !selectedCompany) {
      api
        .get(`/api/company/${value}`)
        .then((res) => {
          const c = res.data?.data;
          if (c) setSelectedCompany(c);
        })
        .catch(() => {});
    } else if (!value) {
      setSelectedCompany(null);
    }
  }, [value, selectedCompany]);

  const handleScroll = (e) => {
    const { scrollTop, clientHeight, scrollHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight + 30 && !loading && page < totalPages) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchCompanies(nextPage, searchQuery, false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    function handleClickOutside(e) {
      if (!e.target.closest("#company-select-container")) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <div id="company-select-container" className="relative min-w-[220px] flex-1">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`${inputClass} flex cursor-pointer items-center justify-between select-none`}
      >
        <span className="truncate">
          {selectedCompany ? selectedCompany.name : "All companies"}
        </span>
        <div className="flex items-center gap-1 text-[var(--df-muted)]">
          {selectedCompany && (
            <span
              onClick={(e) => {
                e.stopPropagation();
                setSelectedCompany(null);
                onChange("");
              }}
              className="hover:text-[var(--df-text)]"
            >
              <X size={14} />
            </span>
          )}
          <ChevronDown size={15} />
        </div>
      </div>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 border border-[var(--df-line)] bg-[var(--df-paper)] shadow-2xl">
          <div className="border-b border-[var(--df-line)] p-2">
            <div className="relative">
              <Search
                size={14}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--df-muted)]"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search company by name..."
                className="w-full border border-[var(--df-line)] bg-transparent py-1.5 pl-9 pr-3 text-xs text-[var(--df-text)] outline-none focus:border-[var(--df-accent)]"
                autoFocus
              />
            </div>
          </div>

          <div
            onScroll={handleScroll}
            className="max-h-60 divide-y divide-[var(--df-line)]/50 overflow-y-auto p-1"
          >
            <div
              onClick={() => {
                setSelectedCompany(null);
                onChange("");
                setIsOpen(false);
              }}
              className="cursor-pointer px-3 py-2 text-xs font-medium text-[var(--df-muted)] hover:bg-[var(--df-paper-2)]"
            >
              All companies (Clear filter)
            </div>

            {companies.map((c) => (
              <div
                key={c.id}
                onClick={() => {
                  setSelectedCompany(c);
                  onChange(c.id);
                  setIsOpen(false);
                }}
                className={`cursor-pointer px-3 py-2 text-xs hover:bg-[var(--df-paper-2)] ${
                  value === c.id
                    ? "bg-[var(--df-paper-2)] font-semibold text-[var(--df-text)]"
                    : "text-[var(--df-text)]"
                }`}
              >
                <div className="truncate font-medium">{c.name}</div>
                <div className="truncate text-[10px] text-[var(--df-muted)]">
                  {c.industry ? `${c.industry} ` : ""} {c.country ? `• ${c.country}` : ""}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-center justify-center gap-2 py-3 text-center text-xs text-[var(--df-muted)]">
                <RefreshCw size={14} className="animate-spin" /> Loading companies...
              </div>
            )}

            {!loading && companies.length === 0 && (
              <div className="py-4 text-center text-xs text-[var(--df-muted)]">
                No companies found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminRecruiterEventsPage() {
  const dispatch = useDispatch();

  const {
    events = [],
    pagination = {},
    loadingList,
    errorList,
  } = useSelector((state) => state.adminRecruiterEvents || {});

  const [filters, setFilters] = useState(initialFilters);
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);

  const [stats, setStats] = useState({
    total: null,
    pending: null,
    accepted: null,
    rejected: null,
  });

  const loadEvents = useCallback(
    (overrides = {}) => {
      const nextFilters = { ...filters, ...overrides };
      const nextPage = overrides.page ?? page;

      return dispatch(
        fetchAdminRecruiterEvents({
          page: nextPage,
          limit: PAGE_SIZE,
          ...(nextFilters.search ? { search: nextFilters.search } : {}),
          ...(nextFilters.status ? { status: nextFilters.status } : {}),
          ...(nextFilters.type ? { type: nextFilters.type } : {}),
          ...(nextFilters.recruiterId ? { recruiterId: nextFilters.recruiterId } : {}),
          ...(nextFilters.companyId ? { companyId: nextFilters.companyId } : {}),
          sortBy: nextFilters.sortBy,
          sortOrder: nextFilters.sortOrder,
        })
      );
    },
    [dispatch, filters, page]
  );

  useEffect(() => {
    let cancelled = false;

    const timer = setTimeout(async () => {
      const result = await loadEvents({ search: searchInput.trim(), page: 1 });

      if (!cancelled && fetchAdminRecruiterEvents.fulfilled.match(result)) {
        const payload = result.payload;
        const data = payload?.data;
        const nextStats = payload?.stats || data?.stats;

        if (nextStats) {
          setStats({
            total: nextStats.total ?? null,
            pending: nextStats.pending ?? null,
            accepted: nextStats.accepted ?? null,
            rejected: nextStats.rejected ?? null,
          });
        }
      }
    }, 250);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [
    searchInput,
    filters.status,
    filters.type,
    filters.recruiterId,
    filters.companyId,
    filters.sortBy,
    filters.sortOrder,
  ]);

  const total = pagination?.total ?? 0;
  const totalPages = pagination?.totalPages ?? Math.ceil(total / PAGE_SIZE);
  const currentPage = pagination?.page ?? page;

  const visibleRange = useMemo(() => {
    if (!total) return { start: 0, end: 0 };

    return {
      start: (currentPage - 1) * PAGE_SIZE + 1,
      end: Math.min(currentPage * PAGE_SIZE, total),
    };
  }, [currentPage, total]);

  function updateFilter(key, value) {
    setFilters((current) => ({ ...current, [key]: value }));
    setPage(1);
  }

  function changeSort(column) {
    const nextOrder =
      filters.sortBy === column && filters.sortOrder === "desc" ? "asc" : "desc";

    setFilters((current) => ({
      ...current,
      sortBy: column,
      sortOrder: nextOrder,
    }));
    setPage(1);
  }

  function goToPage(nextPage) {
    if (nextPage < 1 || nextPage > totalPages || nextPage === page) return;
    setPage(nextPage);
    loadEvents({ page: nextPage });
  }

  function clearFilters() {
    setFilters(initialFilters);
    setSearchInput("");
    setPage(1);
  }

  const hasFilters =
    searchInput.trim() ||
    filters.status ||
    filters.type ||
    filters.recruiterId ||
    filters.companyId;

  const SortLabel = ({ column, children }) => {
    const active = filters.sortBy === column;
    const Icon = !active
      ? ArrowDownUp
      : filters.sortOrder === "desc"
        ? ArrowDown
        : ArrowUp;

    return (
      <button
        type="button"
        onClick={() => changeSort(column)}
        className="inline-flex items-center gap-1.5 whitespace-nowrap transition hover:text-[var(--df-text)]"
      >
        {children}
        <Icon size={12} className={active ? "text-[var(--df-text)]" : ""} />
      </button>
    );
  };

  return (
    <main className="mx-auto w-full max-w-[1440px] px-5 py-8 sm:px-8 sm:py-10 lg:px-10">
      <div className="flex flex-col justify-between gap-5 border-b border-[var(--df-line)] pb-7 sm:flex-row sm:items-start">
        <div>
          <p className="df-eyebrow">DevFlow / Administration</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.075em] text-[var(--df-text-strong)] sm:text-[44px]">
            Recruiter events<span className="text-[var(--df-muted)]">.</span>
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-[var(--df-muted)]">
            Monitor resignation and termination records across recruiter
            employment histories, including review and approval status.
          </p>
        </div>

        <button
          type="button"
          onClick={() => loadEvents()}
          disabled={loadingList}
          className="df-btn df-btn-outline self-start disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw size={14} className={loadingList ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      <section
        aria-label="Recruiter event summary"
        className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4"
      >
        <MetricCard
          label="Total events"
          value={stats.total ?? "—"}
          icon={Activity}
          description="Matching event records"
        />
        <MetricCard
          label="Awaiting review"
          value={stats.pending ?? "—"}
          icon={Clock3}
          description="Pending approval decisions"
        />
        <MetricCard
          label="Accepted"
          value={stats.accepted ?? "—"}
          icon={CheckCircle2}
          description="Approved event records"
        />
        <MetricCard
          label="Rejected"
          value={stats.rejected ?? "—"}
          icon={XCircle}
          description="Declined event records"
        />
      </section>

      <section className="mt-5 border border-[var(--df-line)] bg-[var(--df-paper)]">
        <div className="flex flex-col gap-3 border-b border-[var(--df-line)] p-3 sm:p-4">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
            <label className="flex min-h-10 min-w-0 flex-1 items-center gap-2.5 border border-[var(--df-line)] px-3">
              <Search size={15} className="shrink-0 text-[var(--df-muted)]" />
              <input
                value={searchInput}
                onChange={(event) => {
                  setSearchInput(event.target.value);
                  setPage(1);
                }}
                placeholder="Search recruiter, company, or reason..."
                aria-label="Search recruiter events"
                className="min-w-0 flex-1 bg-transparent py-2 text-xs outline-none placeholder:text-[var(--df-soft)]"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => setSearchInput("")}
                  aria-label="Clear search"
                  className="text-[var(--df-muted)] hover:text-[var(--df-text)]"
                >
                  <XCircle size={14} />
                </button>
              )}
            </label>

            <div className="flex flex-wrap items-center gap-2">
              <SlidersHorizontal size={14} className="mr-1 text-[var(--df-muted)]" />

              {/* Recruiter Profile Searchable Select */}
              <RecruiterSelect
                value={filters.recruiterId}
                onChange={(id) => updateFilter("recruiterId", id)}
              />

              {/* Company Searchable Select */}
              <CompanySelect
                value={filters.companyId}
                onChange={(id) => updateFilter("companyId", id)}
              />

              <select
                value={filters.status}
                onChange={(event) => updateFilter("status", event.target.value)}
                aria-label="Filter by event status"
                className="min-h-10 border border-[var(--df-line)] bg-transparent px-3 text-xs outline-none"
              >
                <option value="">All statuses</option>
                <option value="PENDING">Pending</option>
                <option value="ACCEPTED">Accepted</option>
                <option value="REJECTED">Rejected</option>
              </select>

              <select
                value={filters.type}
                onChange={(event) => updateFilter("type", event.target.value)}
                aria-label="Filter by event type"
                className="min-h-10 border border-[var(--df-line)] bg-transparent px-3 text-xs outline-none"
              >
                <option value="">All types</option>
                <option value="RESIGN">Resignation</option>
                <option value="TERMINATE">Termination</option>
              </select>

              <select
                value={`${filters.sortBy}:${filters.sortOrder}`}
                onChange={(event) => {
                  const [sortBy, sortOrder] = event.target.value.split(":");
                  setFilters((current) => ({ ...current, sortBy, sortOrder }));
                  setPage(1);
                }}
                aria-label="Sort recruiter events"
                className="min-h-10 border border-[var(--df-line)] bg-transparent px-3 text-xs outline-none"
              >
                <option value="createdAt:desc">Newest first</option>
                <option value="createdAt:asc">Oldest first</option>
                <option value="status:asc">Status A–Z</option>
                <option value="type:asc">Type A–Z</option>
              </select>

              {hasFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="px-2 py-2 text-xs text-[var(--df-muted)] underline underline-offset-4 hover:text-[var(--df-text)]"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {errorList && (
          <div
            role="alert"
            className="m-4 flex flex-col gap-3 border border-red-500/25 bg-red-500/5 p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="text-sm font-medium text-red-700 dark:text-red-300">
                Unable to load recruiter events
              </p>
              <p className="mt-1 break-words text-xs text-[var(--df-muted)]">
                {errorList}
              </p>
            </div>
            <button
              type="button"
              onClick={() => loadEvents()}
              className="df-btn df-btn-outline self-start"
            >
              Try again
            </button>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-left">
            <thead className="bg-[var(--df-paper-2)]">
              <tr className="border-b border-[var(--df-line)] text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--df-muted)]">
                <th className="px-4 py-4">
                  <SortLabel column="createdAt">Recruiter / company</SortLabel>
                </th>
                <th className="px-4 py-4">Event</th>
                <th className="px-4 py-4">Status</th>
                <th className="px-4 py-4">
                  <SortLabel column="createdAt">Submitted</SortLabel>
                </th>
                <th className="px-4 py-4 text-right">Details</th>
              </tr>
            </thead>

            <tbody>
              {loadingList && events.length === 0 ? (
                <LoadingRows />
              ) : events.length > 0 ? (
                events.map((event) => {
                  const recruiter = getEventRecruiter(event);
                  const company = event?.recruiterHistory?.company;

                  return (
                    <tr
                      key={event.id}
                      className="border-b border-[var(--df-line)] transition-colors hover:bg-[var(--df-paper-2)]/60"
                    >
                      <td className="px-4 py-4">
                        <div className="flex items-start gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--df-line)] bg-[var(--df-paper-2)] text-[var(--df-muted)]">
                            <UserRound size={15} />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-[var(--df-text)]">
                              {recruiter?.name || "Unknown recruiter"}
                            </p>
                            <p className="mt-1 truncate text-xs text-[var(--df-muted)]">
                              {recruiter?.email || "No email available"}
                            </p>
                            <p className="mt-2 flex items-center gap-1.5 text-[11px] text-[var(--df-muted)]">
                              <Building2 size={12} />
                              {company?.name || "Independent / unknown company"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <EventTypeBadge type={event.type} />
                        <p className="mt-2 max-w-56 truncate text-[11px] text-[var(--df-muted)]">
                          {event.reason || "No reason provided"}
                        </p>
                      </td>

                      <td className="px-4 py-4">
                        <StatusBadge status={event.status} />
                      </td>

                      <td className="px-4 py-4">
                        <p className="whitespace-nowrap text-xs text-[var(--df-text)]">
                          {formatDate(event.createdAt)}
                        </p>
                        <p className="mt-1 text-[10px] text-[var(--df-muted)]">
                          {formatDate(event.createdAt, true).split(", ").at(-1)}
                        </p>
                      </td>

                      <td className="px-4 py-4 text-right">
                        <Link
                          href={`/dashboard/admin/recruiter-events/${encodeURIComponent(event.id)}`}
                          aria-label={`View event details for ${recruiter?.name || "recruiter"}`}
                          className="inline-flex h-9 w-9 items-center justify-center border border-[var(--df-line)] transition hover:border-[var(--df-text)] hover:bg-[var(--df-paper-2)]"
                        >
                          <ArrowRight size={15} />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              ) : (
                !errorList && (
                  <tr>
                    <td colSpan={5} className="px-5 py-16 text-center">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-[var(--df-line)] text-[var(--df-muted)]">
                        <Activity size={20} />
                      </div>
                      <p className="mt-4 text-sm font-medium">No recruiter events found</p>
                      <p className="mt-1 text-xs text-[var(--df-muted)]">
                        {hasFilters
                          ? "Try changing your search or filters."
                          : "Recruiter resignation and termination records will appear here."}
                      </p>
                      {hasFilters && (
                        <button
                          type="button"
                          onClick={clearFilters}
                          className="mt-4 text-xs underline underline-offset-4"
                        >
                          Clear filters
                        </button>
                      )}
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 border-t border-[var(--df-line)] px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[11px] text-[var(--df-muted)]">
            {visibleRange.start}–{visibleRange.end} of {total} events
            {loadingList ? " · Updating…" : ""}
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentPage <= 1 || loadingList}
              onClick={() => goToPage(currentPage - 1)}
              className="df-btn df-btn-outline min-h-9 px-3 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>
            <span className="min-w-20 text-center text-[11px] text-[var(--df-muted)]">
              Page {currentPage} of {Math.max(totalPages, 1)}
            </span>
            <button
              type="button"
              disabled={currentPage >= totalPages || loadingList}
              onClick={() => goToPage(currentPage + 1)}
              className="df-btn df-btn-outline min-h-9 px-3 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </section>

      <p className="mt-4 flex items-center gap-2 text-[10px] text-[var(--df-muted)]">
        <CalendarClock size={13} />
        Event timestamps are displayed in your browser's local time.
      </p>
    </main>
  );
}