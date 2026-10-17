"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Clock3,
  FileText,
  RefreshCw,
  Search,
  Send,
  XCircle,
} from "lucide-react";

import { fetchCompanyJoinRequests } from "@/lib/redux/slices/companyJoinRequestSlice";

const PAGE_SIZE = 10;

const STATUS_OPTIONS = [
  { value: "", label: "All requests" },
  { value: "PENDING", label: "Pending" },
  { value: "ACCEPTED", label: "Accepted" },
  { value: "REJECTED", label: "Rejected" },
  { value: "CANCELLED", label: "Cancelled" },
];

const STATUS_CONFIG = {
  PENDING: {
    label: "Pending",
    icon: Clock3,
    className:
      "border-amber-200 bg-amber-50 text-amber-700",
  },
  ACCEPTED: {
    label: "Accepted",
    icon: CheckCircle2,
    className:
      "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  REJECTED: {
    label: "Rejected",
    icon: XCircle,
    className:
      "border-rose-200 bg-rose-50 text-rose-700",
  },
  CANCELLED: {
    label: "Cancelled",
    icon: XCircle,
    className:
      "border-neutral-200 bg-neutral-50 text-neutral-600",
  },
};

function formatDate(value) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] ${config.className}`}
    >
      <Icon size={13} strokeWidth={1.8} />
      {config.label}
    </span>
  );
}

function RequestRow({ request }) {
  const company = request.company;

  return (
    <Link
      href={`/dashboard/independent-recruiter/company-requests/${request.id}`}
      className="group block border-b border-[var(--df-line)] transition-colors hover:bg-[var(--df-text)]/[0.025]"
    >
      <div className="grid gap-5 px-4 py-5 md:grid-cols-[minmax(0,1fr)_180px_150px_24px] md:items-center md:px-6">
        {/* Company */}
        <div className="flex min-w-0 items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden border border-[var(--df-line)] bg-[var(--df-paper)]">
            {company?.logo ? (
              <img
                src={company.logo}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <Building2
                size={20}
                strokeWidth={1.5}
                className="text-[var(--df-muted)]"
              />
            )}
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="truncate text-[15px] font-semibold text-[var(--df-text)]">
                {company?.name || "Company"}
              </h3>

              {company?.isVerified && (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-emerald-700">
                  <CheckCircle2 size={12} />
                  Verified
                </span>
              )}
            </div>

            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--df-muted)]">
              {company?.industry && <span>{company.industry}</span>}
              {company?.country && (
                <>
                  <span className="text-[var(--df-line)]">/</span>
                  <span>{company.country}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Message */}
        <div className="hidden min-w-0 md:block">
          <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--df-muted)]">
            Your message
          </p>

          <p className="mt-1 truncate text-sm text-[var(--df-text)]">
            {request.message || "No message attached"}
          </p>
        </div>

        {/* Status / Date */}
        <div className="flex items-center justify-between gap-4 md:block">
          <div>
            <StatusBadge status={request.status} />
          </div>

          <p className="mt-2 text-xs text-[var(--df-muted)]">
            Sent {formatDate(request.createdAt)}
          </p>
        </div>

        <ArrowRight
          size={18}
          strokeWidth={1.5}
          className="hidden text-[var(--df-muted)] transition-transform group-hover:translate-x-1 md:block"
        />
      </div>
    </Link>
  );
}

function LoadingRow() {
  return (
    <div className="border-b border-[var(--df-line)] px-4 py-5 md:px-6">
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 animate-pulse bg-[var(--df-text)]/[0.06]" />

        <div className="flex-1">
          <div className="h-4 w-48 animate-pulse bg-[var(--df-text)]/[0.06]" />
          <div className="mt-2 h-3 w-32 animate-pulse bg-[var(--df-text)]/[0.05]" />
        </div>

        <div className="hidden h-7 w-20 animate-pulse bg-[var(--df-text)]/[0.05] md:block" />
      </div>
    </div>
  );
}

export default function CompanyRequestsPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const {
    requests,
    metadata,
    loadingList,
    errorList,
    submitting,
  } = useSelector((state) => state.companyJoinRequests);

  const queryString = searchParams.toString();

  const filters = useMemo(() => {
    const params = new URLSearchParams(queryString);

    return {
      page: Number(params.get("page") || 1),
      search: params.get("search") || "",
      status: params.get("status") || "",
    };
  }, [queryString]);

  const [searchInput, setSearchInput] = useState(filters.search);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    setSearchInput(filters.search);
  }, [filters.search]);

  const updateQuery = useCallback(
    (changes, resetPage = true) => {
      const params = new URLSearchParams(queryString);

      Object.entries(changes).forEach(([key, value]) => {
        if (value === undefined || value === null || value === "") {
          params.delete(key);
        } else {
          params.set(key, String(value));
        }
      });

      if (resetPage && changes.page === undefined) {
        params.delete("page");
      }

      const nextQuery = params.toString();

      router.replace(
        nextQuery ? `${pathname}?${nextQuery}` : pathname,
        { scroll: false }
      );
    },
    [pathname, queryString, router]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      const trimmed = searchInput.trim();

      if (trimmed !== filters.search) {
        updateQuery({ search: trimmed });
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [searchInput, filters.search, updateQuery]);

  useEffect(() => {
    const params = {
      type: "sent",
      page: filters.page,
      limit: PAGE_SIZE,
    };

    if (filters.search) {
      params.search = filters.search;
    }

    if (filters.status) {
      params.status = filters.status;
    }

    dispatch(fetchCompanyJoinRequests(params));
  }, [dispatch, filters]);

  const handleRefresh = async () => {
    setSyncing(true);

    try {
      await dispatch(
        fetchCompanyJoinRequests({
          type: "sent",
          page: filters.page,
          limit: PAGE_SIZE,
          ...(filters.search ? { search: filters.search } : {}),
          ...(filters.status ? { status: filters.status } : {}),
        })
      ).unwrap();
    } finally {
      setSyncing(false);
    }
  };

  const handleReset = () => {
    setSearchInput("");
    router.replace(pathname, { scroll: false });
  };

  const hasFilters = Boolean(filters.search || filters.status);

  return (
    <main className="min-h-full bg-[var(--df-paper)] text-[var(--df-text)]">
      {/* Header */}
      <section className="border-b border-[var(--df-line)]">
        <div className="mx-auto max-w-[1500px] px-4 py-8 md:px-8 md:py-12">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--df-accent)]">
                Independent recruiter / Company requests
              </p>

              <h1 className="mt-3 text-3xl font-semibold tracking-[-0.035em] md:text-5xl">
                Your introductions to companies.
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-6 text-[var(--df-muted)] md:text-base">
                Reach out to verified companies with your recruiter profile,
                experience and message. If they need recruiting support, they
                can accept your request and bring you onto their team.
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-3">
              <Link
                href="/dashboard/independent-recruiter/explore-companies"
                className="inline-flex items-center gap-2 border border-[var(--df-line)] px-4 py-2.5 text-sm font-medium transition-colors hover:bg-[var(--df-text)] hover:text-[var(--df-paper)]"
              >
                <Building2 size={16} strokeWidth={1.7} />
                Explore companies
              </Link>

              <button
                type="button"
                onClick={handleRefresh}
                disabled={syncing || loadingList}
                className="inline-flex items-center gap-2 border border-[var(--df-text)] bg-[var(--df-text)] px-4 py-2.5 text-sm font-medium text-[var(--df-paper)] transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RefreshCw
                  size={15}
                  className={syncing ? "animate-spin" : ""}
                  strokeWidth={1.7}
                />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Toolbar */}
      <section className="border-b border-[var(--df-line)]">
        <div className="mx-auto flex max-w-[1500px] flex-col gap-3 px-4 py-4 md:flex-row md:items-center md:px-8">
          <div className="relative min-w-0 flex-1 md:max-w-xl">
            <Search
              size={17}
              strokeWidth={1.6}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--df-muted)]"
            />

            <input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search companies..."
              className="h-11 w-full border border-[var(--df-line)] bg-transparent pl-10 pr-4 text-sm outline-none transition-colors placeholder:text-[var(--df-muted)] focus:border-[var(--df-text)]"
            />
          </div>

          <select
            value={filters.status}
            onChange={(event) =>
              updateQuery({ status: event.target.value })
            }
            className="h-11 border border-[var(--df-line)] bg-[var(--df-paper)] px-3 text-sm text-[var(--df-text)] outline-none focus:border-[var(--df-text)] md:w-48"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {hasFilters && (
            <button
              type="button"
              onClick={handleReset}
              className="h-11 px-2 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--df-muted)] hover:text-[var(--df-text)]"
            >
              Clear filters
            </button>
          )}
        </div>
      </section>

      {/* Content */}
      <section className="mx-auto max-w-[1500px] px-0 md:px-8">
        <div className="flex items-center justify-between border-b border-[var(--df-line)] px-4 py-4 md:px-0">
          <div>
            <p className="text-sm font-semibold">
              {metadata.totalCount || 0}{" "}
              {metadata.totalCount === 1 ? "request" : "requests"}
            </p>

            <p className="mt-1 text-xs text-[var(--df-muted)]">
              Requests you have sent to companies
            </p>
          </div>

          <Send
            size={18}
            strokeWidth={1.5}
            className="text-[var(--df-muted)]"
          />
        </div>

        {loadingList ? (
          <div>
            <LoadingRow />
            <LoadingRow />
            <LoadingRow />
            <LoadingRow />
            <LoadingRow />
          </div>
        ) : errorList ? (
          <div className="px-4 py-16 text-center md:px-0">
            <div className="mx-auto max-w-md">
              <div className="mx-auto flex h-12 w-12 items-center justify-center border border-rose-200 bg-rose-50 text-rose-700">
                <XCircle size={20} strokeWidth={1.6} />
              </div>

              <h2 className="mt-5 text-lg font-semibold">
                Couldn&apos;t load your requests
              </h2>

              <p className="mt-2 text-sm leading-6 text-[var(--df-muted)]">
                {errorList}
              </p>

              <button
                type="button"
                onClick={handleRefresh}
                className="mt-6 border border-[var(--df-text)] px-4 py-2.5 text-sm font-medium"
              >
                Try again
              </button>
            </div>
          </div>
        ) : requests.length === 0 ? (
          <div className="px-4 py-20 text-center md:px-0">
            <div className="mx-auto flex h-14 w-14 items-center justify-center border border-[var(--df-line)]">
              <FileText
                size={22}
                strokeWidth={1.5}
                className="text-[var(--df-muted)]"
              />
            </div>

            <h2 className="mt-6 text-xl font-semibold tracking-[-0.02em]">
              {hasFilters
                ? "No requests match your filters."
                : "You haven't sent any company requests yet."}
            </h2>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[var(--df-muted)]">
              {hasFilters
                ? "Try clearing your filters or searching for another company."
                : "Explore verified companies and introduce yourself when you think your recruiting experience could help."}
            </p>

            <div className="mt-6 flex justify-center gap-3">
              {hasFilters && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="border border-[var(--df-line)] px-4 py-2.5 text-sm font-medium"
                >
                  Clear filters
                </button>
              )}

              <Link
                href="/dashboard/independent-recruiter/explore-companies"
                className="inline-flex items-center gap-2 bg-[var(--df-text)] px-4 py-2.5 text-sm font-medium text-[var(--df-paper)]"
              >
                Explore companies
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div>
              {requests.map((request) => (
                <RequestRow
                  key={request.id}
                  request={request}
                />
              ))}
            </div>

            {/* Pagination */}
            {metadata.totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-[var(--df-line)] px-4 py-5 md:px-0">
                <p className="text-xs text-[var(--df-muted)]">
                  Page {metadata.currentPage} of {metadata.totalPages}
                </p>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={!metadata.hasPreviousPage}
                    onClick={() =>
                      updateQuery(
                        { page: metadata.currentPage - 1 },
                        false
                      )
                    }
                    className="border border-[var(--df-line)] px-3 py-2 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-35"
                  >
                    Previous
                  </button>

                  <button
                    type="button"
                    disabled={!metadata.hasNextPage}
                    onClick={() =>
                      updateQuery(
                        { page: metadata.currentPage + 1 },
                        false
                      )
                    }
                    className="border border-[var(--df-line)] px-3 py-2 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-35"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}