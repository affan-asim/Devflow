
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import api from "@/lib/api/axios";
import {
  Activity,
  ArrowDown,
  ArrowDownUp,
  ArrowRight,
  ArrowUp,
  Building2,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  Clock3,
  RefreshCw,
  Search,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";

import {
  fetchAdminEmploymentEvents,
  clearAdminEmploymentEventsErrors,
} from "@/lib/redux/slices/adminEmploymentEventsSlice";

const PAGE_SIZE = 20;

const STATUS_OPTIONS = [
  { label: "All statuses", value: "" },
  { label: "Pending", value: "PENDING" },
  { label: "Accepted", value: "ACCEPTED" },
  { label: "Rejected", value: "REJECTED" },
];

const TYPE_OPTIONS = [
  { label: "All event types", value: "" },
  { label: "Resignation", value: "RESIGN" },
  { label: "Termination", value: "TERMINATE" },
];

const SORT_OPTIONS = [
  { label: "Newest first", sortBy: "createdAt", sortOrder: "desc" },
  { label: "Oldest first", sortBy: "createdAt", sortOrder: "asc" },
  { label: "Status", sortBy: "status", sortOrder: "asc" },
  { label: "Event type", sortBy: "type", sortOrder: "asc" },
];

const cx = (...classes) => classes.filter(Boolean).join(" ");

function formatDate(value, withTime = false) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  }).format(date);
}

function humanize(value) {
  if (!value) return "Unknown";
  return String(value)
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getStatusStyle(status) {
  switch (String(status || "").toUpperCase()) {
    case "ACCEPTED":
      return "border-emerald-700/15 bg-emerald-700/[0.07] text-emerald-800";
    case "REJECTED":
      return "border-rose-700/15 bg-rose-700/[0.06] text-rose-800";
    case "PENDING":
      return "border-amber-700/15 bg-amber-700/[0.07] text-amber-800";
    default:
      return "border-[var(--df-line)] bg-[var(--df-paper-2)] text-[var(--df-muted)]";
  }
}

function StatusBadge({ status }) {
  return (
    <span
      className={cx(
        "inline-flex w-fit items-center gap-2 whitespace-nowrap border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em]",
        getStatusStyle(status)
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {humanize(status)}
    </span>
  );
}

function FilterSelect({ label, value, onChange, options }) {
  return (
    <label className="flex min-w-0 flex-col gap-1.5">
      <span className="text-[10px] font-semibold uppercase tracking-[0.13em] text-[var(--df-muted)]">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 min-w-0 border border-[var(--df-line)] bg-[var(--df-paper)] px-3 text-sm text-[var(--df-text)] outline-none transition focus:border-[var(--df-ink)]"
      >
        {options.map((option) => (
          <option
            key={`${option.value ?? option.sortBy}-${option.label}`}
            value={option.value ?? `${option.sortBy}:${option.sortOrder}`}
          >
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function EntityFilterSelect({ kind, label, value, onChange }) {
  const [open, setOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput.trim()), 250);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    setPage(1);
    setItems([]);
  }, [search]);

  useEffect(() => {
    if (!open) return undefined;
    let active = true;
    setLoading(true);
    setError("");

    api
      .get("/api/admin/employment-events/options", {
        params: { kind, page, limit: 20, ...(search ? { search } : {}) },
      })
      .then(({ data }) => {
        if (!active) return;
        const nextItems = Array.isArray(data.items) ? data.items : [];
        setItems((current) =>
          page === 1 ? nextItems : [...current, ...nextItems]
        );
        setHasNextPage(Boolean(data.pagination?.hasNextPage));
        if (value) {
          const selected = nextItems.find((item) => item.id === value);
          if (selected) setSelectedItem(selected);
        }
      })
      .catch((requestError) => {
        if (active) setError(requestError.response?.data?.error || "Could not load options.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [kind, open, page, search, value]);

  useEffect(() => {
    if (!value) setSelectedItem(null);
  }, [value]);

  const labelFor = (item) =>
    kind === "companies"
      ? item.name
      : `${item.name}${item.email ? ` · ${item.email}` : ""}`;

  return (
    <div className="relative flex min-w-0 flex-col gap-1.5">
      <span className="text-[10px] font-semibold uppercase tracking-[0.13em] text-[var(--df-muted)]">
        {label}
      </span>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="flex h-10 min-w-0 items-center justify-between gap-2 border border-[var(--df-line)] bg-[var(--df-paper)] px-3 text-left text-sm text-[var(--df-text)] outline-none focus:border-[var(--df-ink)]"
      >
        <span className="truncate">{value && selectedItem ? labelFor(selectedItem) : `All ${kind}`}</span>
        <span aria-hidden="true" className="text-xs text-[var(--df-muted)]">▾</span>
      </button>
      {open && (
        <div className="absolute left-0 top-full z-30 mt-1 w-full min-w-[260px] border border-[var(--df-line)] bg-[var(--df-paper)] shadow-lg">
          <div className="border-b border-[var(--df-line)] p-2">
            <input
              autoFocus
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder={`Search ${kind}...`}
              className="h-9 w-full border border-[var(--df-line)] bg-transparent px-2.5 text-sm outline-none focus:border-[var(--df-ink)]"
            />
          </div>
          <div
            role="listbox"
            aria-label={label}
            onScroll={(event) => {
              const element = event.currentTarget;
              if (
                hasNextPage &&
                !loading &&
                element.scrollTop + element.clientHeight >= element.scrollHeight - 24
              ) {
                setPage((current) => current + 1);
              }
            }}
            className="max-h-56 overflow-y-auto py-1"
          >
            <button
              type="button"
              role="option"
              aria-selected={!value}
              onClick={() => {
                onChange("");
                setSelectedItem(null);
                setOpen(false);
              }}
              className="block w-full px-3 py-2 text-left text-sm hover:bg-[var(--df-paper-2)]"
            >
              All {kind}
            </button>
            {items.map((item) => (
              <button
                key={item.id}
                type="button"
                role="option"
                aria-selected={value === item.id}
                onClick={() => {
                  setSelectedItem(item);
                  onChange(item.id);
                  setOpen(false);
                }}
                className="block w-full truncate px-3 py-2 text-left text-sm hover:bg-[var(--df-paper-2)]"
              >
                {labelFor(item)}
              </button>
            ))}
            {loading && <p className="px-3 py-2 text-xs text-[var(--df-muted)]">Loading…</p>}
            {!loading && !items.length && !error && (
              <p className="px-3 py-2 text-xs text-[var(--df-muted)]">No matches found.</p>
            )}
            {error && <p role="alert" className="px-3 py-2 text-xs text-rose-800">{error}</p>}
          </div>
        </div>
      )}
    </div>
  );
}

function EventRow({ event }) {
  const history = event?.employmentHistory;
  const developer = history?.developer;
  const company = history?.company;
  const user = developer?.user;

  return (
    <tr className="group border-b border-[var(--df-line-soft)] transition hover:bg-[var(--df-paper-2)]/70">
      <td className="px-4 py-4 align-top sm:px-5">
        <Link
          href={`/dashboard/admin/employment-events/${encodeURIComponent(event.id)}`}
          className="group/link inline-flex max-w-[260px] items-start gap-3"
        >
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center border border-[var(--df-line)] bg-[var(--df-paper-2)]">
            <Activity size={16} strokeWidth={1.7} />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold text-[var(--df-text-strong)] group-hover/link:underline">
              {humanize(event.type)}
            </span>
            <span className="mt-1 block text-xs text-[var(--df-muted)]">
              ID: {String(event.id).slice(0, 12)}
            </span>
          </span>
        </Link>
      </td>

      <td className="px-4 py-4 align-top sm:px-5">
        <div className="flex min-w-[150px] items-start gap-2.5">
          <UserRound
            size={15}
            className="mt-0.5 shrink-0 text-[var(--df-muted)]"
          />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-[var(--df-text)]">
              {user?.name || "Unknown developer"}
            </p>
            <p className="mt-1 max-w-[220px] truncate text-xs text-[var(--df-muted)]">
              {user?.email || "No email available"}
            </p>
          </div>
        </div>
      </td>

      <td className="px-4 py-4 align-top sm:px-5">
        <div className="flex min-w-[130px] items-start gap-2.5">
          <Building2
            size={15}
            className="mt-0.5 shrink-0 text-[var(--df-muted)]"
          />
          <span className="text-sm text-[var(--df-text)]">
            {company?.name || "Unknown company"}
          </span>
        </div>
      </td>

      <td className="px-4 py-4 align-top sm:px-5">
        <StatusBadge status={event.status} />
      </td>

      <td className="whitespace-nowrap px-4 py-4 align-top text-sm text-[var(--df-muted)] sm:px-5">
        <span className="inline-flex items-center gap-2">
          <CalendarDays size={14} />
          {formatDate(event.createdAt)}
        </span>
      </td>

      <td className="px-4 py-4 text-right align-top sm:px-5">
        <Link
          href={`/dashboard/admin/employment-events/${encodeURIComponent(event.id)}`}
          aria-label={`View employment event ${event.id}`}
          className="inline-flex h-8 w-8 items-center justify-center border border-[var(--df-line)] text-[var(--df-text)] transition hover:border-[var(--df-ink)] hover:bg-[var(--df-accent)]"
        >
          <ArrowRight size={15} />
        </Link>
      </td>
    </tr>
  );
}

function EventRowSkeleton() {
  return (
    <tr className="border-b border-[var(--df-line-soft)]">
      {Array.from({ length: 6 }).map((_, index) => (
        <td key={index} className="px-5 py-5">
          <div className="h-4 w-24 animate-pulse bg-[var(--df-paper-3)]" />
        </td>
      ))}
    </tr>
  );
}

export default function AdminEmploymentEventsPage() {
  const dispatch = useDispatch();

  const {
    events = [],
    pagination = {},
    loadingList,
    errorList,
  } = useSelector((state) => state.adminEmploymentEvents);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [type, setType] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [developerId, setDeveloperId] = useState("");
  const [sort, setSort] = useState("createdAt:desc");
  const [page, setPage] = useState(1);

  const [sortBy, sortOrder] = useMemo(() => {
    const [field, order] = sort.split(":");
    return [field || "createdAt", order || "desc"];
  }, [sort]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    setPage(1);
  }, [search, status, type, companyId, developerId, sort]);

  const loadEvents = useCallback(() => {
    dispatch(
      fetchAdminEmploymentEvents({
        page,
        limit: PAGE_SIZE,
        ...(search ? { search } : {}),
        ...(status ? { status } : {}),
        ...(type ? { type } : {}),
        ...(companyId.trim() ? { companyId: companyId.trim() } : {}),
        ...(developerId.trim() ? { developerId: developerId.trim() } : {}),
        sortBy,
        sortOrder,
      })
    );
  }, [
    dispatch,
    page,
    search,
    status,
    type,
    companyId,
    developerId,
    sortBy,
    sortOrder,
  ]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const total = pagination.total ?? 0;
  const currentPage = pagination.page ?? 1;
  const totalPages = pagination.totalPages ?? 0;
  const limit = pagination.limit ?? PAGE_SIZE;
  const start = total === 0 ? 0 : (currentPage - 1) * limit + 1;
  const end = Math.min(currentPage * limit, total);

  const hasFilters =
    Boolean(searchInput || status || type || companyId || developerId) ||
    sort !== "createdAt:desc";

  const resetFilters = () => {
    setSearchInput("");
    setSearch("");
    setStatus("");
    setType("");
    setCompanyId("");
    setDeveloperId("");
    setSort("createdAt:desc");
    setPage(1);
    dispatch(clearAdminEmploymentEventsErrors());
  };

  return (
    <main className="min-h-screen bg-[var(--df-paper)] text-[var(--df-text)]">
      <div className="mx-auto w-full max-w-[1440px] px-4 py-7 sm:px-6 lg:px-10 lg:py-10">
        <div className="mb-8 flex flex-col justify-between gap-5 border-b border-[var(--df-line)] pb-7 md:flex-row md:items-end">
          <div>
            <div className="mb-3 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--df-muted)]">
              <span className="h-1.5 w-1.5 bg-[var(--df-accent)]" />
              DevFlow / Administration
            </div>
            <h1 className="text-3xl font-semibold tracking-[-0.055em] text-[var(--df-text-strong)] sm:text-4xl">
              Employment events
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--df-muted)]">
              Review employment history events, their associated developers,
              companies, and approval status.
            </p>
          </div>

          <button
            type="button"
            onClick={loadEvents}
            disabled={loadingList}
            className="inline-flex h-10 items-center justify-center gap-2 self-start border border-[var(--df-line)] px-4 text-xs font-semibold uppercase tracking-[0.08em] transition hover:border-[var(--df-ink)] hover:bg-[var(--df-paper-2)] disabled:cursor-not-allowed disabled:opacity-50 md:self-auto"
          >
            <RefreshCw size={14} className={loadingList ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        <section className="mb-6 grid grid-cols-1 gap-px border border-[var(--df-line)] bg-[var(--df-line)] sm:grid-cols-3">
          <div className="bg-[var(--df-paper)] p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--df-muted)]">
              Matching events
            </p>
            <div className="mt-3 flex items-end justify-between">
              <span className="text-3xl font-semibold tracking-[-0.05em] text-[var(--df-text-strong)]">
                {total.toLocaleString()}
              </span>
              <Activity size={18} className="mb-1 text-[var(--df-muted)]" />
            </div>
            <p className="mt-2 text-xs text-[var(--df-muted)]">
              Records matching current filters
            </p>
          </div>

          <div className="bg-[var(--df-paper)] p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--df-muted)]">
              Current page
            </p>
            <div className="mt-3 flex items-end justify-between">
              <span className="text-3xl font-semibold tracking-[-0.05em] text-[var(--df-text-strong)]">
                {total === 0 ? "0" : currentPage}
                <span className="ml-1 text-base font-normal text-[var(--df-muted)]">
                  / {totalPages}
                </span>
              </span>
              <CalendarDays size={18} className="mb-1 text-[var(--df-muted)]" />
            </div>
            <p className="mt-2 text-xs text-[var(--df-muted)]">
              {start}–{end} of {total.toLocaleString()}
            </p>
          </div>

          <div className="bg-[var(--df-paper)] p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--df-muted)]">
              Data integrity
            </p>
            <div className="mt-3 flex items-center gap-2">
              <ShieldCheck size={20} className="text-[var(--df-text)]" />
              <span className="text-sm font-semibold text-[var(--df-text-strong)]">
                Admin review
              </span>
            </div>
            <p className="mt-2 text-xs leading-5 text-[var(--df-muted)]">
              Open an event to inspect its associated records and approval
              metadata.
            </p>
          </div>
        </section>

        <section className="border border-[var(--df-line)] bg-[var(--df-paper)]">
          <div className="flex flex-col gap-4 border-b border-[var(--df-line)] p-4 sm:p-5">
            <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
              <div>
                <h2 className="text-sm font-semibold text-[var(--df-text-strong)]">
                  Event directory
                </h2>
                <p className="mt-1 text-xs text-[var(--df-muted)]">
                  Search and filter server-side records.
                </p>
              </div>
              {hasFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="inline-flex items-center gap-1.5 self-start text-xs font-semibold text-[var(--df-muted)] transition hover:text-[var(--df-text-strong)]"
                >
                  <X size={13} />
                  Clear filters
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <label className="flex min-w-0 flex-col gap-1.5 xl:col-span-2">
                <span className="text-[10px] font-semibold uppercase tracking-[0.13em] text-[var(--df-muted)]">
                  Search
                </span>
                <span className="flex h-10 items-center gap-2 border border-[var(--df-line)] px-3 focus-within:border-[var(--df-ink)]">
                  <Search size={15} className="shrink-0 text-[var(--df-muted)]" />
                  <input
                    value={searchInput}
                    onChange={(event) => setSearchInput(event.target.value)}
                    placeholder="Developer, email, or company..."
                    className="w-full bg-transparent text-sm outline-none placeholder:text-[var(--df-soft)]"
                  />
                  {searchInput && (
                    <button
                      type="button"
                      aria-label="Clear search"
                      onClick={() => setSearchInput("")}
                      className="text-[var(--df-muted)] hover:text-[var(--df-text)]"
                    >
                      <X size={14} />
                    </button>
                  )}
                </span>
              </label>

              <FilterSelect
                label="Status"
                value={status}
                onChange={setStatus}
                options={STATUS_OPTIONS}
              />

              <FilterSelect
                label="Event type"
                value={type}
                onChange={setType}
                options={TYPE_OPTIONS}
              />

              <EntityFilterSelect
                kind="companies"
                label="Company"
                value={companyId}
                onChange={setCompanyId}
              />

              <EntityFilterSelect
                kind="developers"
                label="Developer"
                value={developerId}
                onChange={setDeveloperId}
              />

              <FilterSelect
                label="Sort"
                value={sort}
                onChange={setSort}
                options={SORT_OPTIONS.map((option) => ({
                  label: option.label,
                  value: `${option.sortBy}:${option.sortOrder}`,
                }))}
              />
            </div>
          </div>

          {errorList && (
            <div
              role="alert"
              className="flex items-start gap-3 border-b border-rose-800/15 bg-rose-800/[0.04] px-5 py-4"
            >
              <CircleAlert size={17} className="mt-0.5 shrink-0 text-rose-800" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-rose-900">
                  Unable to load employment events
                </p>
                <p className="mt-1 break-words text-xs text-rose-900/80">
                  {String(errorList)}
                </p>
              </div>
              <button
                type="button"
                onClick={loadEvents}
                className="shrink-0 text-xs font-semibold text-rose-900 underline"
              >
                Retry
              </button>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full min-w-[930px] border-collapse text-left">
              <thead>
                <tr className="border-b border-[var(--df-line)] bg-[var(--df-paper-2)]/60">
                  {[
                    "Event",
                    "Developer",
                    "Company",
                    "Status",
                    "Created",
                    "",
                  ].map((heading, index) => (
                    <th
                      key={`${heading}-${index}`}
                      className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.13em] text-[var(--df-muted)] sm:px-5"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loadingList && events.length === 0 ? (
                  Array.from({ length: 6 }).map((_, index) => (
                    <EventRowSkeleton key={index} />
                  ))
                ) : events.length > 0 ? (
                  events.map((event) => (
                    <EventRow key={event.id} event={event} />
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-5 py-16 text-center">
                      <div className="mx-auto flex h-11 w-11 items-center justify-center border border-[var(--df-line)] bg-[var(--df-paper-2)]">
                        <Clock3 size={18} className="text-[var(--df-muted)]" />
                      </div>
                      <p className="mt-4 text-sm font-semibold text-[var(--df-text-strong)]">
                        No employment events found
                      </p>
                      <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-[var(--df-muted)]">
                        Try changing your search or clearing the active filters.
                      </p>
                      {hasFilters && (
                        <button
                          type="button"
                          onClick={resetFilters}
                          className="mt-4 border border-[var(--df-line)] px-3 py-2 text-xs font-semibold hover:bg-[var(--df-paper-2)]"
                        >
                          Clear filters
                        </button>
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-3 border-t border-[var(--df-line)] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <p className="text-xs text-[var(--df-muted)]">
              Showing{" "}
              <span className="font-semibold text-[var(--df-text)]">
                {start}–{end}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-[var(--df-text)]">
                {total.toLocaleString()}
              </span>{" "}
              events
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={loadingList || currentPage <= 1}
                onClick={() => setPage((value) => Math.max(1, value - 1))}
                className="inline-flex h-9 items-center gap-1 border border-[var(--df-line)] px-3 text-xs font-semibold transition hover:border-[var(--df-ink)] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft size={14} />
                Previous
              </button>
              <span className="min-w-[84px] text-center text-xs tabular-nums text-[var(--df-muted)]">
                Page {total === 0 ? 0 : currentPage} of {totalPages}
              </span>
              <button
                type="button"
                disabled={
                  loadingList ||
                  !pagination.hasNextPage &&
                    currentPage >= totalPages
                }
                onClick={() =>
                  setPage((value) =>
                    Math.min(totalPages || 1, value + 1)
                  )
                }
                className="inline-flex h-9 items-center gap-1 border border-[var(--df-line)] px-3 text-xs font-semibold transition hover:border-[var(--df-ink)] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
