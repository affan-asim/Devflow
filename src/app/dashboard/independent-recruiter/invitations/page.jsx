"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  Building2,
  CalendarClock,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Inbox,
  Mail,
  RefreshCcw,
  Search,
  ShieldCheck,
  X,
  XCircle,
} from "lucide-react";

import {
  fetchRecruiterInvitations,
  claimRecruiterInvitations,
} from "@/lib/redux/slices/recruiterInvitationSlice";

const PAGE_SIZE = 10;
const SEARCH_DELAY = 400;

function formatDate(value) {
  if (!value) return "â€”";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "â€”";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function formatRelativeDate(value) {
  if (!value) return "â€”";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "â€”";
  }

  const diff = date.getTime() - Date.now();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

  if (days > 1) return `Expires in ${days} days`;
  if (days === 1) return "Expires tomorrow";
  if (days === 0) return "Expires today";
  if (days === -1) return "Expired yesterday";

  return "Expired";
}

function isExpired(invitation) {
  if (!invitation?.expiresAt) return false;

  return new Date(invitation.expiresAt).getTime() <= Date.now();
}

function getStatus(invitation) {
  if (isExpired(invitation) && invitation.status === "PENDING") {
    return {
      label: "Expired",
      icon: Clock3,
      className: "text-[var(--df-muted)]",
    };
  }

  switch (invitation.status) {
    case "ACCEPTED":
      return {
        label: "Accepted",
        icon: CheckCircle2,
        className: "text-[var(--df-text)]",
      };

    case "REJECTED":
      return {
        label: "Declined",
        icon: XCircle,
        className: "text-[var(--df-muted)]",
      };

    case "EXPIRED":
      return {
        label: "Expired",
        icon: Clock3,
        className: "text-[var(--df-muted)]",
      };

    default:
      return {
        label: "Pending",
        icon: Clock3,
        className: "text-[var(--df-text)]",
      };
  }
}

function getCompanyName(invitation) {
  return (
    invitation?.company?.name ||
    invitation?.companyName ||
    "Company"
  );
}

function getRole(invitation) {
  return (
    invitation?.roleTitle ||
    invitation?.role ||
    "Recruiter"
  );
}

function getInviterName(invitation) {
  return (
    invitation?.invitedBy?.user?.name ||
    invitation?.invitedBy?.name ||
    "Company owner"
  );
}

function getInitials(name) {
  if (!name) return "CO";

  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
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

export default function IndependentRecruiterInvitationsPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const {
    invitations,
    metadata,
    loadingList,
    submitting,
    errorList,
    submitError,
  } = useSelector((state) => state.recruiterInvitations);

  const queryString = searchParams.toString();

  const query = useMemo(() => {
    const params = new URLSearchParams(queryString);

    return {
      search: params.get("search") || "",
      status: params.get("status") || "ALL",
      page: Number(params.get("page") || 1),
    };
  }, [queryString]);

  const [searchValue, setSearchValue] = useState(query.search);
  const [claimMessage, setClaimMessage] = useState("");

  useEffect(() => {
    setSearchValue(query.search);
  }, [query.search]);

  /*
   * Claim invitations first.
   *
   * This handles invitations sent before the recruiter had
   * a recruiterProfileId attached to the invitation.
   */
  useEffect(() => {
    let cancelled = false;

    const claim = async () => {
      const result = await dispatch(claimRecruiterInvitations());

      if (!cancelled && claimRecruiterInvitations.fulfilled.match(result)) {
        const claimed = result.payload?.data || [];

        if (claimed.length > 0) {
          setClaimMessage(
            `${claimed.length} new invitation${
              claimed.length === 1 ? "" : "s"
            } found.`
          );
        }
      }
    };

    claim();

    return () => {
      cancelled = true;
    };
  }, [dispatch]);

  useEffect(() => {
    const params = {
      page: query.page,
      limit: PAGE_SIZE,
    };

    if (query.search) {
      params.search = query.search;
    }

    /*
     * Backend expects InviteStatus values.
     * We intentionally don't send ALL.
     */
    if (query.status !== "ALL") {
      params.status = query.status;
    }

    dispatch(fetchRecruiterInvitations({params, type: "recruiter"}));
  }, [
    dispatch,
    query.page,
    query.search,
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
    query.status !== "ALL";

  const pendingCount = invitations.filter(
    (item) =>
      item.status === "PENDING" &&
      !isExpired(item)
  ).length;

  const acceptedCount = invitations.filter(
    (item) => item.status === "ACCEPTED"
  ).length;

  const totalCount = metadata?.totalCount || 0;

  return (
    <main className="min-h-screen bg-[var(--df-paper)] text-[var(--df-text)]">
      <div className="mx-auto w-full max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {/* Header */}
        <header className="border-b border-[var(--df-line)] pb-7">
          <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--df-muted)]">
                <Inbox className="h-3.5 w-3.5" />
                Independent recruiter
              </div>

              <h1 className="text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">
                Company invitations
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--df-muted)] sm:text-[15px]">
                Review invitations from verified companies and decide
                which recruiting opportunities you want to accept.
              </p>
            </div>

            <div className="flex items-center gap-6 border-t border-[var(--df-line)] pt-4 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
              <SummaryMetric
                label="Total"
                value={totalCount}
              />

              <SummaryMetric
                label="Pending"
                value={pendingCount}
              />

              <SummaryMetric
                label="Accepted"
                value={acceptedCount}
              />
            </div>
          </div>
        </header>

        {/* Newly claimed message */}
        {claimMessage && (
          <div className="flex items-center justify-between gap-4 border-b border-[var(--df-line)] py-3">
            <div className="flex items-center gap-2 text-xs">
              <CheckCircle2 className="h-3.5 w-3.5" />
              {claimMessage}
            </div>

            <button
              type="button"
              onClick={() => setClaimMessage("")}
              className="text-[var(--df-muted)] hover:text-[var(--df-text)]"
              aria-label="Dismiss"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Claim error */}
        {submitError && (
          <div className="border-b border-[var(--df-line)] py-3 text-xs text-[var(--df-muted)]">
            We couldn't automatically claim new email invitations.
            You can refresh the page and try again.
          </div>
        )}

        {/* Filters */}
        <section className="border-b border-[var(--df-line)] py-5">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--df-muted)]" />

              <input
                value={searchValue}
                onChange={(event) =>
                  setSearchValue(event.target.value)
                }
                placeholder="Search company or role..."
                className="h-11 w-full border border-[var(--df-line)] bg-transparent pl-10 pr-10 text-sm outline-none transition placeholder:text-[var(--df-muted)] focus:border-[var(--df-text)]"
              />

              {searchValue && (
                <button
                  type="button"
                  onClick={() => setSearchValue("")}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--df-muted)] hover:text-[var(--df-text)]"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <select
                value={query.status}
                onChange={(event) =>
                  updateQuery({
                    status: event.target.value,
                    page: 1,
                  })
                }
                className="h-11 min-w-[160px] border border-[var(--df-line)] bg-[var(--df-paper)] px-3 text-sm outline-none focus:border-[var(--df-text)]"
              >
                <option value="ALL">All invitations</option>
                <option value="PENDING">Pending</option>
                <option value="ACCEPTED">Accepted</option>
                <option value="REJECTED">Declined</option>
                <option value="EXPIRED">Expired</option>
              </select>

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
            <Mail className="h-3.5 w-3.5" />

            <span>
              {loadingList
                ? "Updating invitations..."
                : `${totalCount} ${
                    totalCount === 1
                      ? "invitation"
                      : "invitations"
                  }`}
            </span>
          </div>
        </section>

        {/* Content */}
        <section className="pt-5">
          {loadingList && invitations.length === 0 ? (
            <InvitationSkeleton />
          ) : errorList ? (
            <InvitationError
              message={errorList}
              onRetry={() =>
                dispatch(
                  fetchRecruiterInvitations({
                    page: query.page,
                    limit: PAGE_SIZE,
                    ...(query.search
                      ? { search: query.search }
                      : {}),
                    ...(query.status !== "ALL"
                      ? { status: query.status }
                      : {}),
                  })
                )
              }
            />
          ) : invitations.length === 0 ? (
            <EmptyInvitations
              hasFilters={hasFilters}
              onReset={clearFilters}
            />
          ) : (
            <>
              <div className="hidden md:block">
                <DesktopInvitationList
                  invitations={invitations}
                />
              </div>

              <div className="md:hidden">
                <MobileInvitationList
                  invitations={invitations}
                />
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

        {submitting && (
          <div
            className="pointer-events-none fixed bottom-5 left-1/2 z-50 -translate-x-1/2 border border-[var(--df-line)] bg-[var(--df-paper)] px-4 py-2.5 text-xs shadow-sm"
            role="status"
          >
            Updating invitation...
          </div>
        )}
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
   DESKTOP
========================================================= */

function DesktopInvitationList({ invitations }) {
  return (
    <div className="border-t border-[var(--df-line)]">
      <div className="grid grid-cols-[minmax(280px,1.4fr)_minmax(180px,1fr)_170px_130px_40px] gap-6 border-b border-[var(--df-line)] px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--df-muted)]">
        <span>Opportunity</span>
        <span>Invited by</span>
        <span>Received</span>
        <span>Status</span>
        <span />
      </div>

      {invitations.map((invitation) => (
        <DesktopInvitationRow
          key={invitation.id}
          invitation={invitation}
        />
      ))}
    </div>
  );
}

function DesktopInvitationRow({ invitation }) {
  const companyName = getCompanyName(invitation);
  const role = getRole(invitation);
  const inviter = getInviterName(invitation);
  const status = getStatus(invitation);

  const StatusIcon = status.icon;

  return (
    <Link
      href={`/dashboard/independent-recruiter/invitations/${invitation.id}`}
      className="group grid grid-cols-[minmax(280px,1.4fr)_minmax(180px,1fr)_170px_130px_40px] items-center gap-6 border-b border-[var(--df-line)] px-4 py-5 transition hover:bg-[color-mix(in_srgb,var(--df-text)_3%,transparent)]"
    >
      <div className="flex min-w-0 items-center gap-4">
        <CompanyMark
          name={companyName}
          logo={invitation.company?.logo}
        />

        <div className="min-w-0">
          <div className="truncate text-sm font-semibold">
            {role}
          </div>

          <div className="mt-1 flex items-center gap-1.5 text-xs text-[var(--df-muted)]">
            <Building2 className="h-3 w-3 shrink-0" />
            <span className="truncate">
              {companyName}
            </span>

            {invitation.company?.isVerified && (
              <ShieldCheck className="h-3 w-3 shrink-0" />
            )}
          </div>
        </div>
      </div>

      <div className="min-w-0">
        <div className="truncate text-sm font-medium">
          {inviter}
        </div>

        {invitation.invitedBy?.user?.email && (
          <div className="mt-1 truncate text-xs text-[var(--df-muted)]">
            {invitation.invitedBy.user.email}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 text-xs text-[var(--df-muted)]">
        <CalendarClock className="h-3.5 w-3.5 shrink-0" />
        {formatDate(invitation.createdAt)}
      </div>

      <div>
        <span
          className={`inline-flex items-center gap-1.5 text-xs font-medium ${status.className}`}
        >
          <StatusIcon className="h-3.5 w-3.5" />
          {status.label}
        </span>
      </div>

      <ArrowUpRight className="h-4 w-4 text-[var(--df-muted)] transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--df-text)]" />
    </Link>
  );
}

/* =========================================================
   MOBILE
========================================================= */

function MobileInvitationList({ invitations }) {
  return (
    <div className="divide-y divide-[var(--df-line)] border-y border-[var(--df-line)]">
      {invitations.map((invitation) => {
        const companyName = getCompanyName(invitation);
        const role = getRole(invitation);
        const status = getStatus(invitation);
        const StatusIcon = status.icon;

        return (
          <Link
            key={invitation.id}
            href={`/dashboard/independent-recruiter/invitations/${invitation.id}`}
            className="block py-5"
          >
            <div className="flex gap-3.5">
              <CompanyMark
                name={companyName}
                logo={invitation.company?.logo}
              />

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-semibold">
                      {role}
                    </h3>

                    <div className="mt-1 flex items-center gap-1.5 text-sm text-[var(--df-muted)]">
                      <span className="truncate">
                        {companyName}
                      </span>

                      {invitation.company?.isVerified && (
                        <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
                      )}
                    </div>
                  </div>

                  <ArrowUpRight className="h-4 w-4 shrink-0 text-[var(--df-muted)]" />
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-[var(--df-muted)]">
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarClock className="h-3.5 w-3.5" />
                    {formatDate(invitation.createdAt)}
                  </span>

                  <span
                    className={`inline-flex items-center gap-1.5 font-medium ${status.className}`}
                  >
                    <StatusIcon className="h-3.5 w-3.5" />
                    {status.label}
                  </span>
                </div>

                {invitation.status === "PENDING" &&
                  invitation.expiresAt && (
                    <div className="mt-3 text-[11px] text-[var(--df-muted)]">
                      {formatRelativeDate(invitation.expiresAt)}
                    </div>
                  )}
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
    <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden border border-[var(--df-line)]">
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
          {getInitials(name)}
        </span>
      )}
    </div>
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
          onClick={() =>
            onPageChange(currentPage - 1)
          }
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
          onClick={() =>
            onPageChange(currentPage + 1)
          }
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

function InvitationSkeleton() {
  return (
    <div className="border-t border-[var(--df-line)]">
      {[1, 2, 3, 4, 5].map((item) => (
        <div
          key={item}
          className="flex items-center gap-4 border-b border-[var(--df-line)] px-4 py-5"
        >
          <div className="h-11 w-11 shrink-0 animate-pulse bg-[var(--df-line)]/50" />

          <div className="flex-1">
            <div className="h-3.5 w-48 animate-pulse bg-[var(--df-line)]/50" />
            <div className="mt-2 h-3 w-32 animate-pulse bg-[var(--df-line)]/50" />
          </div>

          <div className="hidden h-3 w-24 animate-pulse bg-[var(--df-line)]/50 md:block" />
          <div className="hidden h-3 w-20 animate-pulse bg-[var(--df-line)]/50 lg:block" />
        </div>
      ))}
    </div>
  );
}

/* =========================================================
   ERROR
========================================================= */

function InvitationError({ message, onRetry }) {
  return (
    <div className="border-y border-[var(--df-line)] py-16 text-center">
      <div className="mx-auto flex h-10 w-10 items-center justify-center border border-[var(--df-line)]">
        <RefreshCcw className="h-4 w-4" />
      </div>

      <h2 className="mt-5 text-sm font-semibold">
        We couldn't load your invitations
      </h2>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--df-muted)]">
        {message || "Something went wrong while loading your invitations."}
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

function EmptyInvitations({ hasFilters, onReset }) {
  return (
    <div className="border-y border-[var(--df-line)] py-20 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center border border-[var(--df-line)]">
        <Inbox className="h-5 w-5 text-[var(--df-muted)]" />
      </div>

      <h2 className="mt-5 text-base font-semibold">
        {hasFilters
          ? "No invitations match these filters"
          : "No company invitations yet"}
      </h2>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--df-muted)]">
        {hasFilters
          ? "Try changing your search or status filter."
          : "When a verified company owner invites you to join their recruiting team, the invitation will appear here."}
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