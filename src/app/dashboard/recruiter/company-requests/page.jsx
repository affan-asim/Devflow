"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  Search,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  UserRound,
  Building2,
  Clock3,
  CheckCircle2,
  XCircle,
  Inbox,
  RefreshCw,
  BriefcaseBusiness,
} from "lucide-react";

import {
  fetchCompanyJoinRequests,
  clearCompanyJoinRequestErrors,
} from "@/lib/redux/slices/companyJoinRequestSlice";

const STATUS_OPTIONS = [
  { value: "ALL", label: "All requests" },
  { value: "PENDING", label: "Pending" },
  { value: "ACCEPTED", label: "Accepted" },
  { value: "REJECTED", label: "Rejected" },
  { value: "CANCELLED", label: "Cancelled" },
];

const statusConfig = {
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
      "border-red-200 bg-red-50 text-red-700",
  },
  CANCELLED: {
    label: "Cancelled",
    icon: XCircle,
    className:
      "border-[var(--df-line)] bg-[var(--df-paper)] text-[var(--df-muted)]",
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

function formatRelativeDate(value) {
  if (!value) return "—";

  const date = new Date(value);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;

  return formatDate(value);
}

function StatusBadge({ status }) {
  const config = statusConfig[status] || statusConfig.PENDING;
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] ${config.className}`}
    >
      <Icon size={12} />
      {config.label}
    </span>
  );
}

function RequestSkeleton() {
  return (
    <div className="animate-pulse border-b border-[var(--df-line)] px-5 py-5">
      <div className="flex gap-4">
        <div className="h-11 w-11 bg-[var(--df-line)]" />

        <div className="flex-1 space-y-3">
          <div className="h-4 w-48 bg-[var(--df-line)]" />
          <div className="h-3 w-72 max-w-full bg-[var(--df-line)]" />
          <div className="h-3 w-32 bg-[var(--df-line)]" />
        </div>
      </div>
    </div>
  );
}

export default function CompanyJoinRequestsPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const {
    requests,
    metadata,
    loadingList,
    errorList,
  } = useSelector((state) => state.companyJoinRequests);

  const [searchInput, setSearchInput] = useState(
    searchParams.get("search") || ""
  );

  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "ALL";
  const page = Number(searchParams.get("page") || 1);

  const updateUrl = (updates = {}) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (
        value === undefined ||
        value === null ||
        value === "" ||
        value === "ALL" ||
        (key === "page" && value === 1)
      ) {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    });

    router.push(`${pathname}?${params.toString()}`);
  };

  useEffect(() => {
    dispatch(clearCompanyJoinRequestErrors());
  }, [dispatch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== search) {
        updateUrl({
          search: searchInput.trim(),
          page: 1,
        });
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [searchInput, search]);

  useEffect(() => {
    dispatch(
      fetchCompanyJoinRequests({
        type: "received",
        page,
        limit: 10,
        ...(search ? { search } : {}),
        ...(status !== "ALL" ? { status } : {}),
      })
    );
  }, [dispatch, page, search, status]);

  const counts = useMemo(() => {
    return {
      total: metadata?.totalCount || 0,
      visible: requests?.length || 0,
      pending:
        requests?.filter((request) => request.status === "PENDING").length || 0,
      accepted:
        requests?.filter((request) => request.status === "ACCEPTED").length ||
        0,
    };
  }, [requests, metadata]);

  const clearFilters = () => {
    setSearchInput("");
    router.push(pathname);
  };

  const hasFilters = Boolean(search || status !== "ALL");

  return (
    <main className="min-h-screen bg-[var(--df-paper)] text-[var(--df-text)]">
      <div className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {/* Header */}
        <header className="border-b border-[var(--df-line)] pb-7">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--df-muted)]">
                <Inbox size={14} />
                Company management
              </div>

              <h1 className="max-w-3xl text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">
                Recruiter join requests
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--df-muted)]">
                Review independent recruiters who want to join your company,
                evaluate their profile and message, then decide whether to
                bring them onto your recruiting team.
              </p>
            </div>

            <Link
              href="/dashboard/recruiter"
              className="inline-flex items-center gap-2 self-start border border-[var(--df-line)] px-4 py-2.5 text-sm font-medium transition hover:border-[var(--df-text)] lg:self-auto"
            >
              Back to dashboard
              <ArrowUpRight size={15} />
            </Link>
          </div>

          {/* Summary */}
          <div className="mt-7 grid grid-cols-2 border border-[var(--df-line)] sm:grid-cols-4">
            <div className="border-b border-[var(--df-line)] p-4 sm:border-b-0 sm:border-r">
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--df-muted)]">
                Total
              </p>
              <p className="mt-2 text-2xl font-semibold tracking-tight">
                {counts.total}
              </p>
            </div>

            <div className="border-b border-[var(--df-line)] p-4 sm:border-b-0 sm:border-r">
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--df-muted)]">
                On page
              </p>
              <p className="mt-2 text-2xl font-semibold tracking-tight">
                {counts.visible}
              </p>
            </div>

            <div className="border-r border-[var(--df-line)] p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--df-muted)]">
                Pending
              </p>
              <p className="mt-2 text-2xl font-semibold tracking-tight">
                {counts.pending}
              </p>
            </div>

            <div className="p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--df-muted)]">
                Accepted
              </p>
              <p className="mt-2 text-2xl font-semibold tracking-tight">
                {counts.accepted}
              </p>
            </div>
          </div>
        </header>

        {/* Filters */}
        <section className="mt-6 border border-[var(--df-line)]">
          <div className="flex flex-col gap-4 p-4 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--df-muted)]"
              />

              <input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search recruiter name or email..."
                className="h-11 w-full border border-[var(--df-line)] bg-transparent pl-10 pr-4 text-sm outline-none transition placeholder:text-[var(--df-muted)] focus:border-[var(--df-text)]"
              />
            </div>

            <div className="flex items-center gap-2">
              <div className="flex h-11 items-center gap-2 border border-[var(--df-line)] px-3 text-[var(--df-muted)]">
                <SlidersHorizontal size={15} />

                <select
                  value={status}
                  onChange={(event) =>
                    updateUrl({
                      status: event.target.value,
                      page: 1,
                    })
                  }
                  className="bg-transparent text-sm text-[var(--df-text)] outline-none"
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {hasFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="h-11 border border-[var(--df-line)] px-4 text-sm font-medium transition hover:border-[var(--df-text)]"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Error */}
        {errorList && (
          <div className="mt-5 flex items-start justify-between gap-4 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <div>
              <p className="font-semibold">Unable to load requests</p>
              <p className="mt-1">{errorList}</p>
            </div>

            <button
              type="button"
              onClick={() =>
                dispatch(
                  fetchCompanyJoinRequests({
                    type: "received",
                    page,
                    limit: 10,
                    ...(search ? { search } : {}),
                    ...(status !== "ALL" ? { status } : {}),
                  })
                )
              }
              className="shrink-0 inline-flex items-center gap-2 border border-red-200 px-3 py-2 text-xs font-semibold"
            >
              <RefreshCw size={13} />
              Retry
            </button>
          </div>
        )}

        {/* List */}
        <section className="mt-6 border border-[var(--df-line)]">
          <div className="flex items-center justify-between border-b border-[var(--df-line)] px-5 py-4">
            <div>
              <p className="text-sm font-semibold">Incoming requests</p>
              <p className="mt-1 text-xs text-[var(--df-muted)]">
                Requests sent to your company by independent recruiters.
              </p>
            </div>

            <BriefcaseBusiness
              size={18}
              className="text-[var(--df-muted)]"
            />
          </div>

          {loadingList ? (
            <div>
              <RequestSkeleton />
              <RequestSkeleton />
              <RequestSkeleton />
              <RequestSkeleton />
            </div>
          ) : requests?.length ? (
            <div>
              {requests.map((request) => {
                const recruiter = request.recruiter;
                const user = recruiter?.user;

                return (
                  <Link
                    key={request.id}
                    href={`/dashboard/recruiter/company-requests/${request.id}`}
                    className="group block border-b border-[var(--df-line)] px-5 py-5 last:border-b-0 transition hover:bg-[var(--df-soft)]"
                  >
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex min-w-0 gap-4">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center border border-[var(--df-line)] bg-[var(--df-paper)]">
                          {user?.name ? (
                            <span className="text-sm font-semibold">
                              {user.name
                                .split(" ")
                                .map((part) => part[0])
                                .slice(0, 2)
                                .join("")
                                .toUpperCase()}
                            </span>
                          ) : (
                            <UserRound
                              size={18}
                              className="text-[var(--df-muted)]"
                            />
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h2 className="truncate text-sm font-semibold">
                              {user?.name || "Unknown recruiter"}
                            </h2>

                            {user?.isVerified && (
                              <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--df-accent)]">
                                Verified
                              </span>
                            )}
                          </div>

                          <p className="mt-1 text-sm text-[var(--df-muted)]">
                            {recruiter?.jobTitle || "Independent recruiter"}
                          </p>

                          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--df-muted)]">
                            {user?.email && <span>{user.email}</span>}

                            <span className="inline-flex items-center gap-1">
                              <Clock3 size={12} />
                              {formatRelativeDate(request.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-4">
                        <StatusBadge status={request.status} />

                        <ArrowUpRight
                          size={16}
                          className="text-[var(--df-muted)] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                        />
                      </div>
                    </div>

                    {request.message && (
                      <div className="mt-4 border-l-2 border-[var(--df-line)] pl-4">
                        <p className="line-clamp-2 text-sm leading-6 text-[var(--df-muted)]">
                          “{request.message}”
                        </p>
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="px-6 py-20 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center border border-[var(--df-line)]">
                <Inbox size={19} className="text-[var(--df-muted)]" />
              </div>

              <h2 className="mt-5 text-lg font-semibold">
                No join requests found
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--df-muted)]">
                {hasFilters
                  ? "No incoming requests match your current search and filters."
                  : "When independent recruiters request to join your company, they will appear here."}
              </p>

              {hasFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-5 border border-[var(--df-line)] px-4 py-2.5 text-sm font-medium hover:border-[var(--df-text)]"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}

          {/* Pagination */}
          {!loadingList && metadata?.totalPages > 0 && (
            <div className="flex flex-col gap-3 border-t border-[var(--df-line)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-[var(--df-muted)]">
                Page {metadata.currentPage} of {metadata.totalPages}
                {metadata.totalCount
                  ? ` · ${metadata.totalCount} total requests`
                  : ""}
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={!metadata.hasPreviousPage}
                  onClick={() =>
                    updateUrl({
                      page: Math.max(1, metadata.currentPage - 1),
                    })
                  }
                  className="inline-flex h-9 items-center gap-1 border border-[var(--df-line)] px-3 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft size={14} />
                  Previous
                </button>

                <button
                  type="button"
                  disabled={!metadata.hasNextPage}
                  onClick={() =>
                    updateUrl({
                      page: metadata.currentPage + 1,
                    })
                  }
                  className="inline-flex h-9 items-center gap-1 border border-[var(--df-line)] px-3 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}