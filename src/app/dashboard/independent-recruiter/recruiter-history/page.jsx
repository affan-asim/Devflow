"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  Search,
  SlidersHorizontal,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  Clock3,
  CheckCircle2,
  X,
  RefreshCcw,
  History,
  MapPin,
  UserRound,
} from "lucide-react";

import { fetchRecruiterHistory } from "@/lib/redux/slices/recruiterHistorySlice";

const PAGE_SIZE = 10;
const SEARCH_DELAY = 400;

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatDateRange(item) {
  const start = formatDate(item.startDate);
  const end = item.isCurrent ? "Present" : formatDate(item.endDate);

  if (start === "—" && end === "—") {
    return "Dates unavailable";
  }

  return `${start} — ${end}`;
}

function getCompanyName(item) {
  return (
    item.company?.name ||
    item.companyName ||
    item.recruiter?.company?.name ||
    "Company unavailable"
  );
}

function getRole(item) {
  return (
    item.jobTitle ||
    item.roleTitle ||
    item.position ||
    item.recruiter?.jobTitle ||
    "Recruiter"
  );
}

function getLocation(item) {
  return (
    item.location ||
    item.company?.country ||
    item.country ||
    null
  );
}

function getStatus(item) {
  if (item.isCurrent) {
    return {
      label: "Current",
      icon: Clock3,
    };
  }

  return {
    label: "Former",
    icon: CheckCircle2,
  };
}

function getCompanyInitials(name) {
  if (!name || name === "Company unavailable") return "CO";

  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

function buildQueryString(currentParams, updates = {}) {
  const params = new URLSearchParams(currentParams);

  Object.entries(updates).forEach(([key, value]) => {
    if (
      value === undefined ||
      value === null ||
      value === "" ||
      value === false
    ) {
      params.delete(key);
    } else {
      params.set(key, String(value));
    }
  });

  return params.toString();
}

export default function IndependentRecruiterHistoryPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const {
    employments,
    metadata,
    loadingList,
    errorList,
  } = useSelector((state) => state.recruiterHistory);

  const queryString = searchParams.toString();

  const query = useMemo(() => {
    const params = new URLSearchParams(queryString);

    return {
      search: params.get("search") || "",
      status: params.get("status") || "all",
      sort: params.get("sort") || "newest",
      page: Number(params.get("page") || 1),
    };
  }, [queryString]);

  const [searchValue, setSearchValue] = useState(query.search);

  useEffect(() => {
    setSearchValue(query.search);
  }, [query.search]);

  useEffect(() => {
    const params = {
      page: query.page,
      limit: PAGE_SIZE,
      sort: query.sort,
    };

    if (query.search) {
      params.search = query.search;
    }

    if (query.status !== "all") {
      params.status = query.status;
    }

    dispatch(fetchRecruiterHistory(params));
  }, [
    dispatch,
    query.page,
    query.search,
    query.sort,
    query.status,
  ]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchValue === query.search) return;

      const nextQuery = buildQueryString(queryString, {
        search: searchValue.trim(),
        page: 1,
      });

      router.replace(
        nextQuery ? `${pathname}?${nextQuery}` : pathname,
        { scroll: false }
      );
    }, SEARCH_DELAY);

    return () => clearTimeout(timer);
  }, [
    searchValue,
    query.search,
    queryString,
    pathname,
    router,
  ]);

  const updateQuery = (updates) => {
    const nextQuery = buildQueryString(queryString, updates);

    router.replace(
      nextQuery ? `${pathname}?${nextQuery}` : pathname,
      { scroll: false }
    );
  };

  const clearFilters = () => {
    setSearchValue("");

    router.replace(pathname, {
      scroll: false,
    });
  };

  const hasFilters =
    Boolean(query.search) ||
    query.status !== "all" ||
    query.sort !== "newest";

  const totalHistory = metadata?.totalCount || 0;

  const currentCount = employments?.filter(
    (item) => item.isCurrent
  ).length || 0;

  const previousCount =
    employments?.filter((item) => !item.isCurrent).length || 0;

  return (
    <main className="min-h-screen bg-[var(--df-paper)] text-[var(--df-text)]">
      <div className="mx-auto w-full max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {/* Header */}
        <header className="border-b border-[var(--df-line)] pb-7">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--df-muted)]">
                <History className="h-3.5 w-3.5" />
                Independent recruiter
              </div>

              <h1 className="text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">
                Recruiter history
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--df-muted)] sm:text-[15px]">
                A record of your recruiting career, previous companies,
                responsibilities, and professional experience.
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-6 border-t border-[var(--df-line)] pt-4 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
              <SummaryMetric
                label="Total history"
                value={totalHistory}
              />

              <SummaryMetric
                label="Current"
                value={currentCount}
              />

              <SummaryMetric
                label="Previous"
                value={previousCount}
              />
            </div>
          </div>
        </header>

        {/* Filters */}
        <section className="border-b border-[var(--df-line)] py-5">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
            {/* Search */}
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--df-muted)]" />

              <input
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                placeholder="Search by role, company, or location..."
                className="h-11 w-full border border-[var(--df-line)] bg-transparent pl-10 pr-10 text-sm outline-none transition placeholder:text-[var(--df-muted)] focus:border-[var(--df-text)]"
              />

              {searchValue && (
                <button
                  type="button"
                  onClick={() => setSearchValue("")}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--df-muted)] transition hover:text-[var(--df-text)]"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <FilterSelect
                value={query.status}
                onChange={(value) =>
                  updateQuery({
                    status: value,
                    page: 1,
                  })
                }
                options={[
                  { value: "all", label: "All positions" },
                  { value: "current", label: "Current" },
                  { value: "former", label: "Former" },
                ]}
              />

              <FilterSelect
                value={query.sort}
                onChange={(value) =>
                  updateQuery({
                    sort: value,
                    page: 1,
                  })
                }
                options={[
                  { value: "newest", label: "Newest first" },
                  { value: "oldest", label: "Oldest first" },
                ]}
              />

              {hasFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="inline-flex h-11 items-center justify-center gap-2 border border-[var(--df-line)] px-4 text-sm font-medium transition hover:border-[var(--df-text)]"
                >
                  <RefreshCcw className="h-3.5 w-3.5" />
                  Reset
                </button>
              )}
            </div>
          </div>

          <div className="mt-3 flex items-center gap-2 text-xs text-[var(--df-muted)]">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>
              {loadingList
                ? "Updating history..."
                : `${totalHistory} ${totalHistory === 1 ? "record" : "records"}`}
            </span>
          </div>
        </section>

        {/* Content */}
        <section className="pt-5">
          {loadingList && employments.length === 0 ? (
            <HistorySkeleton />
          ) : errorList ? (
            <HistoryError
              message={errorList}
              onRetry={() =>
                dispatch(
                  fetchRecruiterHistory({
                    page: query.page,
                    limit: PAGE_SIZE,
                    sort: query.sort,
                    ...(query.search
                      ? { search: query.search }
                      : {}),
                    ...(query.status !== "all"
                      ? { status: query.status }
                      : {}),
                  })
                )
              }
            />
          ) : employments.length === 0 ? (
            <EmptyHistory hasFilters={hasFilters} onReset={clearFilters} />
          ) : (
            <>
              <div className="hidden md:block">
                <DesktopHistoryList employments={employments} />
              </div>

              <div className="md:hidden">
                <MobileHistoryList employments={employments} />
              </div>

              <Pagination
                metadata={metadata}
                onPageChange={(page) =>
                  updateQuery({ page })
                }
              />
            </>
          )}
        </section>
      </div>
    </main>
  );
}

/* =========================================================
   SUMMARY
========================================================= */

function SummaryMetric({ label, value }) {
  return (
    <div>
      <div className="text-xl font-semibold tracking-[-0.02em]">
        {value}
      </div>

      <div className="mt-1 whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--df-muted)]">
        {label}
      </div>
    </div>
  );
}

/* =========================================================
   DESKTOP LIST
========================================================= */

function DesktopHistoryList({ employments }) {
  return (
    <div className="border-t border-[var(--df-line)]">
      <div className="grid grid-cols-[minmax(280px,1.5fr)_minmax(190px,1fr)_180px_130px_40px] gap-6 border-b border-[var(--df-line)] px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--df-muted)]">
        <span>Position</span>
        <span>Company</span>
        <span>Period</span>
        <span>Status</span>
        <span />
      </div>

      {employments.map((item) => (
        <HistoryRow key={item.id} item={item} />
      ))}
    </div>
  );
}

function HistoryRow({ item }) {
  const companyName = getCompanyName(item);
  const role = getRole(item);
  const location = getLocation(item);
  const status = getStatus(item);

  const StatusIcon = status.icon;

  return (
    <Link
      href={`/dashboard/independent-recruiter/recruiter-history/${item.id}`}
      className="group grid grid-cols-[minmax(280px,1.5fr)_minmax(190px,1fr)_180px_130px_40px] items-center gap-6 border-b border-[var(--df-line)] px-4 py-5 transition-colors hover:bg-[color-mix(in_srgb,var(--df-text)_3%,transparent)]"
    >
      <div className="flex min-w-0 items-center gap-4">
        <CompanyMark name={companyName} logo={item.company?.logo} />

        <div className="min-w-0">
          <div className="truncate text-sm font-semibold">
            {role}
          </div>

          {location && (
            <div className="mt-1 flex items-center gap-1.5 text-xs text-[var(--df-muted)]">
              <MapPin className="h-3 w-3 shrink-0" />
              <span className="truncate">{location}</span>
            </div>
          )}
        </div>
      </div>

      <div className="min-w-0">
        <div className="truncate text-sm font-medium">
          {companyName}
        </div>

        {item.company?.industry && (
          <div className="mt-1 truncate text-xs text-[var(--df-muted)]">
            {item.company.industry}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 text-xs text-[var(--df-muted)]">
        <CalendarDays className="h-3.5 w-3.5 shrink-0" />
        {formatDateRange(item)}
      </div>

      <div>
        <span
          className={`inline-flex items-center gap-1.5 text-xs font-medium ${
            item.isCurrent
              ? "text-[var(--df-text)]"
              : "text-[var(--df-muted)]"
          }`}
        >
          <StatusIcon className="h-3.5 w-3.5" />
          {status.label}
        </span>
      </div>

      <ArrowUpRight className="h-4 w-4 text-[var(--df-muted)] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--df-text)]" />
    </Link>
  );
}

/* =========================================================
   MOBILE LIST
========================================================= */

function MobileHistoryList({ employments }) {
  return (
    <div className="divide-y divide-[var(--df-line)] border-y border-[var(--df-line)]">
      {employments.map((item) => {
        const companyName = getCompanyName(item);
        const role = getRole(item);
        const status = getStatus(item);
        const StatusIcon = status.icon;

        return (
          <Link
            key={item.id}
            href={`/dashboard/independent-recruiter/recruiter-history/${item.id}`}
            className="block py-5"
          >
            <div className="flex gap-3.5">
              <CompanyMark
                name={companyName}
                logo={item.company?.logo}
              />

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-semibold">
                      {role}
                    </h3>

                    <p className="mt-1 truncate text-sm text-[var(--df-muted)]">
                      {companyName}
                    </p>
                  </div>

                  <ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0 text-[var(--df-muted)]" />
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-[var(--df-muted)]">
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {formatDateRange(item)}
                  </span>

                  <span className="inline-flex items-center gap-1.5">
                    <StatusIcon className="h-3.5 w-3.5" />
                    {status.label}
                  </span>

                  {getLocation(item) && (
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5" />
                      {getLocation(item)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

/* =========================================================
   COMPANY MARK
========================================================= */

function CompanyMark({ name, logo }) {
  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden border border-[var(--df-line)] bg-[var(--df-paper)]">
      {logo ? (
        <img
          src={logo}
          alt=""
          className="h-full w-full object-contain"
          loading="lazy"
          referrerPolicy="no-referrer"
        />
      ) : (
        <span className="text-xs font-semibold text-[var(--df-muted)]">
          {getCompanyInitials(name)}
        </span>
      )}
    </div>
  );
}

/* =========================================================
   SELECT
========================================================= */

function FilterSelect({ value, onChange, options }) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-11 min-w-[150px] border border-[var(--df-line)] bg-[var(--df-paper)] px-3 text-sm outline-none transition focus:border-[var(--df-text)]"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

/* =========================================================
   PAGINATION
========================================================= */

function Pagination({ metadata, onPageChange }) {
  if (!metadata || metadata.totalPages <= 1) {
    return null;
  }

  const currentPage = metadata.currentPage;
  const totalPages = metadata.totalPages;

  const pages = [];

  const start = Math.max(1, currentPage - 2);
  const end = Math.min(totalPages, currentPage + 2);

  for (let page = start; page <= end; page++) {
    pages.push(page);
  }

  return (
    <div className="mt-6 flex flex-col gap-4 border-t border-[var(--df-line)] pt-5 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs text-[var(--df-muted)]">
        Page {currentPage} of {totalPages}
      </p>

      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={!metadata.hasPreviousPage}
          onClick={() => onPageChange(currentPage - 1)}
          className="inline-flex h-9 w-9 items-center justify-center border border-[var(--df-line)] transition hover:border-[var(--df-text)] disabled:cursor-not-allowed disabled:opacity-30"
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {pages.map((page) => (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            className={`h-9 min-w-9 border px-2 text-xs font-medium transition ${
              page === currentPage
                ? "border-[var(--df-text)] bg-[var(--df-text)] text-[var(--df-paper)]"
                : "border-[var(--df-line)] hover:border-[var(--df-text)]"
            }`}
          >
            {page}
          </button>
        ))}

        <button
          type="button"
          disabled={!metadata.hasNextPage}
          onClick={() => onPageChange(currentPage + 1)}
          className="inline-flex h-9 w-9 items-center justify-center border border-[var(--df-line)] transition hover:border-[var(--df-text)] disabled:cursor-not-allowed disabled:opacity-30"
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

/* =========================================================
   LOADING
========================================================= */

function HistorySkeleton() {
  return (
    <div className="border-t border-[var(--df-line)]">
      {[1, 2, 3, 4, 5].map((item) => (
        <div
          key={item}
          className="flex items-center gap-4 border-b border-[var(--df-line)] px-4 py-5"
        >
          <div className="h-11 w-11 shrink-0 animate-pulse bg-[var(--df-line)]/50" />

          <div className="flex-1">
            <div className="h-3.5 w-44 animate-pulse bg-[var(--df-line)]/50" />
            <div className="mt-2 h-3 w-28 animate-pulse bg-[var(--df-line)]/50" />
          </div>

          <div className="hidden h-3 w-28 animate-pulse bg-[var(--df-line)]/50 md:block" />
          <div className="hidden h-3 w-20 animate-pulse bg-[var(--df-line)]/50 lg:block" />
        </div>
      ))}
    </div>
  );
}

/* =========================================================
   ERROR
========================================================= */

function HistoryError({ message, onRetry }) {
  return (
    <div className="border-y border-[var(--df-line)] py-16 text-center">
      <div className="mx-auto flex h-10 w-10 items-center justify-center border border-[var(--df-line)]">
        <RefreshCcw className="h-4 w-4" />
      </div>

      <h2 className="mt-5 text-sm font-semibold">
        We couldn't load your recruiter history
      </h2>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--df-muted)]">
        {message || "Something went wrong while loading your history."}
      </p>

      <button
        type="button"
        onClick={onRetry}
        className="mt-5 inline-flex h-10 items-center gap-2 border border-[var(--df-text)] px-4 text-sm font-medium transition hover:bg-[var(--df-text)] hover:text-[var(--df-paper)]"
      >
        <RefreshCcw className="h-3.5 w-3.5" />
        Try again
      </button>
    </div>
  );
}

/* =========================================================
   EMPTY
========================================================= */

function EmptyHistory({ hasFilters, onReset }) {
  return (
    <div className="border-y border-[var(--df-line)] py-20 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center border border-[var(--df-line)]">
        <BriefcaseBusiness className="h-5 w-5 text-[var(--df-muted)]" />
      </div>

      <h2 className="mt-5 text-base font-semibold">
        {hasFilters
          ? "No history matches these filters"
          : "Your recruiting history is empty"}
      </h2>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--df-muted)]">
        {hasFilters
          ? "Try changing your search or filters to find another record."
          : "Your previous recruiting positions will appear here once they are available on your profile."}
      </p>

      {hasFilters && (
        <button
          type="button"
          onClick={onReset}
          className="mt-5 text-sm font-medium underline underline-offset-4"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}