"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import {
  Search,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Mail,
  BriefcaseBusiness,
  Building2,
  UserRound,
  Clock3,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Send,
  Inbox,
} from "lucide-react";

import { fetchRecruiterInvitations } from "@/lib/redux/slices/recruiterInvitationSlice";

const STATUS_OPTIONS = [
  {
    value: "",
    label: "All statuses",
  },
  {
    value: "PENDING",
    label: "Pending",
  },
  {
    value: "ACCEPTED",
    label: "Accepted",
  },
  {
    value: "REJECTED",
    label: "Rejected",
  },
  {
    value: "EXPIRED",
    label: "Expired",
  },
];

const PAGE_SIZE = 10;

function getStatusLabel(status) {
  if (!status) return "Unknown";

  return status
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/^\w/, (char) => char.toUpperCase());
}

function getStatusTone(status) {
  switch (status) {
    case "PENDING":
      return "text-[var(--df-accent)]";

    case "ACCEPTED":
      return "text-[var(--df-accent)]";

    case "REJECTED":
      return "text-[var(--df-muted)]";

    case "EXPIRED":
      return "text-[var(--df-muted)]";

    default:
      return "text-[var(--df-muted)]";
  }
}

function getStatusIcon(status) {
  switch (status) {
    case "PENDING":
      return <Clock3 size={14} />;

    case "ACCEPTED":
      return <CheckCircle2 size={14} />;

    case "REJECTED":
      return <XCircle size={14} />;

    case "EXPIRED":
      return <AlertCircle size={14} />;

    default:
      return <Clock3 size={14} />;
  }
}

function formatDate(value, includeTime = false) {
  if (!value) return "Not available";

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    ...(includeTime
      ? {
          hour: "numeric",
          minute: "2-digit",
        }
      : {}),
  }).format(new Date(value));
}

function formatMoney(value, currency) {
  if (value === null || value === undefined || value === "") {
    return "Not specified";
  }

  const amount = Number(value);

  if (Number.isNaN(amount)) {
    return `${value} ${currency || ""}`.trim();
  }

  try {
    return new Intl.NumberFormat("en", {
      style: "currency",
      currency: currency || "USD",
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency || ""} ${amount}`.trim();
  }
}

function InvitationStatus({ status }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] ${getStatusTone(
        status
      )}`}
    >
      {getStatusIcon(status)}
      {getStatusLabel(status)}
    </span>
  );
}

function InvitationRow({ invitation }) {
  const recruiter = invitation.recruiter;
  const recruiterUser = recruiter?.user;
  const invitedBy = invitation.invitedBy;
  const invitedByUser = invitedBy?.user;

  return (
    <article className="border-b border-[var(--df-line)] bg-[var(--df-paper)] last:border-b-0">
      <div className="grid gap-5 px-5 py-5 lg:grid-cols-[minmax(250px,1.5fr)_1fr_1fr_auto] lg:items-center lg:px-6">
        {/* Recruiter */}
        <div className="min-w-0">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-[var(--df-line)] bg-[#eeeae2]">
              {recruiterUser?.name ? (
                recruiterUser.name
                  .split(" ")
                  .slice(0, 2)
                  .map((part) => part[0])
                  .join("")
                  .toUpperCase()
              ) : (
                <UserRound size={17} />
              )}
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="truncate text-sm font-semibold">
                  {recruiterUser?.name || "Recruiter not claimed"}
                </h2>

                <InvitationStatus status={invitation.status} />
              </div>

              <p className="mt-1 truncate text-xs text-[var(--df-muted)]">
                {invitation.invitedEmail}
              </p>
            </div>
          </div>
        </div>

        {/* Role */}
        <div>
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--df-muted)]">
            Role
          </p>

          <div className="flex items-center gap-2 text-sm">
            <BriefcaseBusiness size={15} className="text-[var(--df-muted)]" />
            <span className="truncate">
              {invitation.roleTitle || "Recruiter"}
            </span>
          </div>
        </div>

        {/* Timeline */}
        <div>
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--df-muted)]">
            Timeline
          </p>

          <div className="text-sm">
            <p>
              Sent {formatDate(invitation.createdAt)}
            </p>

            {invitation.expiresAt && (
              <p className="mt-1 text-xs text-[var(--df-muted)]">
                Expires {formatDate(invitation.expiresAt)}
              </p>
            )}
          </div>
        </div>

        {/* Action */}
        <div className="flex justify-end">
          <Link
            href={`/dashboard/recruiter/invitations/${invitation.id}`}
            className="inline-flex items-center gap-2 border border-[var(--df-line)] px-4 py-2 text-xs font-medium transition-colors hover:border-[var(--df-text)]"
          >
            View
            <ExternalLink size={14} />
          </Link>
        </div>
      </div>
    </article>
  );
}

function InvitationSkeleton() {
  return (
    <div className="border-b border-[var(--df-line)] px-5 py-6 last:border-0">
      <div className="animate-pulse">
        <div className="flex gap-4">
          <div className="h-10 w-10 bg-[#e9e5dd]" />

          <div className="flex-1 space-y-3">
            <div className="h-4 w-48 bg-[#e9e5dd]" />
            <div className="h-3 w-32 bg-[#e9e5dd]" />
          </div>
        </div>

        <div className="mt-5 h-3 w-64 bg-[#e9e5dd]" />
      </div>
    </div>
  );
}

export default function RecruiterInvitationsPage() {
  const dispatch = useDispatch();

  const {
    invitations,
    metadata,
    loadingList,
    errorList,
  } = useSelector((state) => state.recruiterInvitations);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const loadInvitations = useCallback(() => {
    const params = {
      page,
      limit: PAGE_SIZE,
    };

    if (search) {
      params.search = search;
    }

    if (status) {
      params.status = status;
    }

    dispatch(fetchRecruiterInvitations({params, type: "company"}));
  }, [dispatch, page, search, status]);

  useEffect(() => {
    loadInvitations();
  }, [loadInvitations]);

  const resetFilters = () => {
    setSearchInput("");
    setSearch("");
    setStatus("");
    setPage(1);
  };

  const hasFilters = useMemo(
    () => Boolean(search || status),
    [search, status]
  );

  return (
    <main className="min-h-screen bg-[var(--df-paper)] text-[var(--df-text)]">
      <div className="mx-auto max-w-[1450px] px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="border-b border-[var(--df-line)] pb-7">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-[var(--df-muted)]">
                <Inbox size={14} />
                Recruiter workspace
              </div>

              <h1 className="text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">
                Invitations
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--df-muted)]">
                Track recruiter invitations sent by your company, monitor
                their status, and review each invitation in detail.
              </p>
            </div>

            <Link
              href="/dashboard/recruiter/explore-recruiters"
              className="inline-flex items-center justify-center gap-2 border border-[var(--df-text)] px-5 py-3 text-sm font-medium"
            >
              <Send size={16} />
              Find recruiters
            </Link>
          </div>
        </header>

        {/* Search */}
        <section className="mt-7">
          <div className="flex flex-col border border-[var(--df-line)] sm:flex-row">
            <div className="flex flex-1 items-center gap-3 px-4">
              <Search
                size={18}
                strokeWidth={1.7}
                className="shrink-0 text-[var(--df-muted)]"
              />

              <input
                value={searchInput}
                onChange={(event) =>
                  setSearchInput(event.target.value)
                }
                placeholder="Search by email or role title..."
                className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-[var(--df-muted)]"
              />
            </div>

            <div className="border-t border-[var(--df-line)] sm:border-l sm:border-t-0">
              <select
                value={status}
                onChange={(event) => {
                  setStatus(event.target.value);
                  setPage(1);
                }}
                className="h-12 w-full min-w-[170px] bg-transparent px-4 text-sm outline-none"
              >
                {STATUS_OPTIONS.map((option) => (
                  <option
                    key={option.value || "all"}
                    value={option.value}
                  >
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {hasFilters && (
            <div className="mt-3 flex justify-end">
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.08em] text-[var(--df-muted)] hover:text-[var(--df-text)]"
              >
                <RotateCcw size={14} />
                Clear filters
              </button>
            </div>
          )}
        </section>

        {/* Stats */}
        <section className="mt-8 grid gap-px border border-[var(--df-line)] bg-[var(--df-line)] sm:grid-cols-3">
          <Stat
            label="Total invitations"
            value={metadata.totalCount || 0}
            icon={<Mail size={17} />}
          />

          <Stat
            label="Current page"
            value={metadata.currentPage || 1}
            icon={<Inbox size={17} />}
          />

          <Stat
            label="Total pages"
            value={metadata.totalPages || 0}
            icon={<BriefcaseBusiness size={17} />}
          />
        </section>

        {/* Content */}
        <section className="mt-8">
          {errorList && (
            <div className="border border-[var(--df-line)] p-6">
              <div className="flex items-start gap-3">
                <AlertCircle size={18} />

                <div>
                  <h2 className="text-sm font-semibold">
                    Unable to load invitations
                  </h2>

                  <p className="mt-1 text-sm text-[var(--df-muted)]">
                    {errorList}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={loadInvitations}
                className="mt-5 inline-flex items-center gap-2 border border-[var(--df-text)] px-4 py-2 text-sm font-medium"
              >
                <RotateCcw size={15} />
                Try again
              </button>
            </div>
          )}

          {!errorList && loadingList && (
            <div className="border border-[var(--df-line)]">
              {Array.from({ length: 7 }).map((_, index) => (
                <InvitationSkeleton key={index} />
              ))}
            </div>
          )}

          {!errorList &&
            !loadingList &&
            invitations.length === 0 && (
              <div className="border border-[var(--df-line)] px-6 py-16 text-center">
                <Mail
                  size={28}
                  strokeWidth={1.5}
                  className="mx-auto text-[var(--df-muted)]"
                />

                <h2 className="mt-5 text-lg font-semibold">
                  No invitations found
                </h2>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--df-muted)]">
                  {hasFilters
                    ? "No invitations match your current filters."
                    : "Your company has not sent any recruiter invitations yet."}
                </p>

                {hasFilters ? (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="mt-6 border border-[var(--df-text)] px-5 py-2.5 text-sm font-medium"
                  >
                    Clear filters
                  </button>
                ) : (
                  <Link
                    href="/dashboard/recruiter/profiles"
                    className="mt-6 inline-flex items-center gap-2 border border-[var(--df-text)] px-5 py-2.5 text-sm font-medium"
                  >
                    <Send size={15} />
                    Find recruiters
                  </Link>
                )}
              </div>
            )}

          {!errorList &&
            !loadingList &&
            invitations.length > 0 && (
              <>
                <div className="overflow-hidden border border-[var(--df-line)]">
                  <div className="hidden border-b border-[var(--df-line)] bg-[#f5f1ea] px-6 py-3 lg:grid lg:grid-cols-[minmax(250px,1.5fr)_1fr_1fr_auto] lg:gap-5">
                    <HeaderCell>Recruiter</HeaderCell>
                    <HeaderCell>Role</HeaderCell>
                    <HeaderCell>Timeline</HeaderCell>
                    <span />
                  </div>

                  {invitations.map((invitation) => (
                    <InvitationRow
                      key={invitation.id}
                      invitation={invitation}
                    />
                  ))}
                </div>

                {/* Pagination */}
                <div className="mt-6 flex flex-col gap-4 border-t border-[var(--df-line)] pt-5 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-[var(--df-muted)]">
                    Page {metadata.currentPage} of{" "}
                    {metadata.totalPages || 1}
                  </p>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={!metadata.hasPreviousPage}
                      onClick={() =>
                        setPage((current) =>
                          Math.max(1, current - 1)
                        )
                      }
                      className="inline-flex items-center gap-2 border border-[var(--df-line)] px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <ChevronLeft size={16} />
                      Previous
                    </button>

                    <button
                      type="button"
                      disabled={!metadata.hasNextPage}
                      onClick={() =>
                        setPage((current) => current + 1)
                      }
                      className="inline-flex items-center gap-2 border border-[var(--df-line)] px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Next
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </>
            )}
        </section>
      </div>
    </main>
  );
}

function HeaderCell({ children }) {
  return (
    <span className="text-[10px] font-semibold uppercase tracking-[0.13em] text-[var(--df-muted)]">
      {children}
    </span>
  );
}

function Stat({ label, value, icon }) {
  return (
    <div className="bg-[var(--df-paper)] p-5">
      <div className="flex items-center gap-2 text-[var(--df-muted)]">
        {icon}

        <span className="text-[10px] font-semibold uppercase tracking-[0.12em]">
          {label}
        </span>
      </div>

      <p className="mt-3 text-2xl font-semibold tracking-[-0.03em]">
        {value}
      </p>
    </div>
  );
}