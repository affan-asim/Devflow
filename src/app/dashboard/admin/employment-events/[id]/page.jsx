
"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  Activity,
  ArrowLeft,
  ArrowUpRight,
  BadgeCheck,
  Building2,
  CalendarDays,
  CircleAlert,
  Clock3,
  FileText,
  Globe,
  Hash,
  Mail,
  RefreshCw,
  ShieldCheck,
  ShieldX,
  UserRound,
} from "lucide-react";

import {
  clearCurrentAdminEmploymentEvent,
  fetchAdminEmploymentEventById,
} from "@/lib/redux/slices/adminEmploymentEventsSlice";

const cx = (...classes) => classes.filter(Boolean).join(" ");

function formatDate(value, withTime = true) {
  if (!value) return "Not provided";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not provided";

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

function safeExternalUrl(value) {
  if (!value || typeof value !== "string") return null;

  try {
    const candidate = new URL(
      /^[a-z][a-z\d+.-]*:/i.test(value) ? value : `https://${value}`
    );

    if (!["https:", "http:"].includes(candidate.protocol)) return null;
    return candidate.href;
  } catch {
    return null;
  }
}

function statusClass(status) {
  switch (String(status || "").toUpperCase()) {
    case "APPROVED":
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
        "inline-flex items-center gap-2 border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em]",
        statusClass(status)
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {humanize(status)}
    </span>
  );
}

function Section({ eyebrow, title, icon: Icon, children, className }) {
  return (
    <section
      className={cx(
        "border border-[var(--df-line)] bg-[var(--df-paper)]",
        className
      )}
    >
      <div className="flex items-center gap-3 border-b border-[var(--df-line)] px-5 py-4">
        {Icon && (
          <span className="flex h-8 w-8 items-center justify-center border border-[var(--df-line)] bg-[var(--df-paper-2)]">
            <Icon size={15} strokeWidth={1.7} />
          </span>
        )}
        <div>
          {eyebrow && (
            <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-[var(--df-muted)]">
              {eyebrow}
            </p>
          )}
          <h2 className="mt-0.5 text-sm font-semibold text-[var(--df-text-strong)]">
            {title}
          </h2>
        </div>
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

function DetailField({ label, value, mono = false }) {
  return (
    <div className="min-w-0 border-b border-[var(--df-line-soft)] py-3 last:border-b-0">
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--df-muted)]">
        {label}
      </p>
      <p
        className={cx(
          "mt-1.5 break-words text-sm text-[var(--df-text)]",
          mono && "font-mono text-xs"
        )}
      >
        {value === null || value === undefined || value === ""
          ? "Not provided"
          : value}
      </p>
    </div>
  );
}

function PersonCard({ title, person, user, icon: Icon }) {
  const name = user?.name || "Unknown person";
  const email = user?.email;
  const profileId = person?.id;

  return (
    <div className="flex min-w-0 gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-[var(--df-line)] bg-[var(--df-paper-2)]">
        <Icon size={17} strokeWidth={1.6} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--df-muted)]">
          {title}
        </p>
        <p className="mt-1 truncate text-sm font-semibold text-[var(--df-text-strong)]">
          {name}
        </p>
        {email ? (
          <a
            href={`mailto:${email}`}
            className="mt-1 flex max-w-full items-center gap-1.5 truncate text-xs text-[var(--df-muted)] hover:text-[var(--df-text-strong)] hover:underline"
          >
            <Mail size={12} className="shrink-0" />
            <span className="truncate">{email}</span>
          </a>
        ) : (
          <p className="mt-1 text-xs text-[var(--df-muted)]">
            No email available
          </p>
        )}
        {profileId && (
          <p className="mt-2 break-all font-mono text-[10px] text-[var(--df-soft)]">
            Profile ID: {profileId}
          </p>
        )}
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="mx-auto max-w-[1440px] space-y-6 px-4 py-8 sm:px-6 lg:px-10">
      <div className="h-4 w-36 animate-pulse bg-[var(--df-paper-3)]" />
      <div className="h-10 w-72 max-w-full animate-pulse bg-[var(--df-paper-3)]" />
      <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
        <div className="h-64 animate-pulse border border-[var(--df-line)] bg-[var(--df-paper-2)]" />
        <div className="h-64 animate-pulse border border-[var(--df-line)] bg-[var(--df-paper-2)]" />
        <div className="h-52 animate-pulse border border-[var(--df-line)] bg-[var(--df-paper-2)]" />
        <div className="h-52 animate-pulse border border-[var(--df-line)] bg-[var(--df-paper-2)]" />
      </div>
    </div>
  );
}

export default function AdminEmploymentEventDetailPage() {
  const params = useParams();
  const dispatch = useDispatch();

  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const {
    currentEvent,
    loadingDetail,
    errorDetail,
  } = useSelector((state) => state.adminEmploymentEvents);

  // Do not render a previous event while a new route is being loaded.
  const event = currentEvent?.id === id ? currentEvent : null;

  useEffect(() => {
    if (!id) return;

    dispatch(fetchAdminEmploymentEventById(id));

    return () => {
      dispatch(clearCurrentAdminEmploymentEvent());
    };
  }, [dispatch, id]);

  const history = event?.employmentHistory;
  const developer = history?.developer;
  const developerUser = developer?.user;
  const company = history?.company;
  const recruiter = history?.hiredByRecruiter;
  const recruiterUser = recruiter?.user;
  const approver = event?.approvedBy;
  const approverUser = approver?.user;

  const companyWebsite = useMemo(
    () => safeExternalUrl(company?.websiteUrl),
    [company?.websiteUrl]
  );

  if (loadingDetail && !event) {
    return <LoadingSkeleton />;
  }

  if (errorDetail && !event) {
    return (
      <main className="min-h-screen bg-[var(--df-paper)] px-4 py-10 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-3xl">
          <Link
            href="/dashboard/admin/employment-events"
            className="mb-8 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.1em] text-[var(--df-muted)] hover:text-[var(--df-text-strong)]"
          >
            <ArrowLeft size={14} />
            Back to employment events
          </Link>

          <div className="border border-rose-800/15 bg-[var(--df-paper)] p-6 sm:p-8">
            <CircleAlert size={22} className="text-rose-800" />
            <h1 className="mt-4 text-xl font-semibold tracking-tight text-[var(--df-text-strong)]">
              Unable to load this event
            </h1>
            <p className="mt-2 break-words text-sm leading-6 text-[var(--df-muted)]">
              {String(errorDetail)}
            </p>
            <button
              type="button"
              onClick={() => dispatch(fetchAdminEmploymentEventById(id))}
              className="mt-5 inline-flex h-10 items-center gap-2 border border-[var(--df-line)] px-4 text-xs font-semibold uppercase tracking-[0.08em] hover:border-[var(--df-ink)] hover:bg-[var(--df-paper-2)]"
            >
              <RefreshCw size={14} />
              Try again
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (!event) {
    return (
      <main className="min-h-screen bg-[var(--df-paper)] px-4 py-10 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-3xl border border-[var(--df-line)] p-8">
          <h1 className="text-xl font-semibold text-[var(--df-text-strong)]">
            Employment event not found
          </h1>
          <p className="mt-2 text-sm text-[var(--df-muted)]">
            The event may have been removed or you may not have permission to
            view it.
          </p>
          <Link
            href="/dashboard/admin/employment-events"
            className="mt-5 inline-flex items-center gap-2 text-sm font-semibold hover:underline"
          >
            <ArrowLeft size={15} />
            Return to event directory
          </Link>
        </div>
      </main>
    );
  }

  const isApproved = String(event.status || "").toUpperCase() === "APPROVED";
  const isRejected = String(event.status || "").toUpperCase() === "REJECTED";

  return (
    <main className="min-h-screen bg-[var(--df-paper)] text-[var(--df-text)]">
      <div className="mx-auto max-w-[1440px] px-4 py-7 sm:px-6 lg:px-10 lg:py-10">
        <Link
          href="/dashboard/admin/employment-events"
          className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--df-muted)] transition hover:text-[var(--df-text-strong)]"
        >
          <ArrowLeft size={14} />
          Employment events
        </Link>

        <div className="mt-7 flex flex-col justify-between gap-5 border-b border-[var(--df-line)] pb-7 xl:flex-row xl:items-end">
          <div className="min-w-0">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--df-muted)]">
                <Activity size={13} />
                Event record
              </span>
              <span className="text-[var(--df-soft)]">/</span>
              <span className="font-mono text-[10px] text-[var(--df-muted)]">
                {event.id}
              </span>
            </div>

            <h1 className="max-w-4xl break-words text-3xl font-semibold tracking-[-0.055em] text-[var(--df-text-strong)] sm:text-4xl">
              {humanize(event.type)}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--df-muted)]">
              Inspect this employment event, the people involved, and the
              employment-history record it belongs to.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge status={event.status} />
            <button
              type="button"
              onClick={() => dispatch(fetchAdminEmploymentEventById(id))}
              disabled={loadingDetail}
              className="inline-flex h-10 items-center gap-2 border border-[var(--df-line)] px-4 text-xs font-semibold uppercase tracking-[0.08em] transition hover:border-[var(--df-ink)] hover:bg-[var(--df-paper-2)] disabled:opacity-50"
            >
              <RefreshCw
                size={14}
                className={loadingDetail ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-px border border-[var(--df-line)] bg-[var(--df-line)] sm:grid-cols-3">
          <div className="bg-[var(--df-paper)] p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-[var(--df-muted)]">
              Event status
            </p>
            <div className="mt-3">
              <StatusBadge status={event.status} />
            </div>
            <p className="mt-3 text-xs leading-5 text-[var(--df-muted)]">
              Current recorded status of this event.
            </p>
          </div>
          <div className="bg-[var(--df-paper)] p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-[var(--df-muted)]">
              Created
            </p>
            <p className="mt-3 flex items-center gap-2 text-sm font-semibold text-[var(--df-text-strong)]">
              <CalendarDays size={15} />
              {formatDate(event.createdAt)}
            </p>
            <p className="mt-3 text-xs text-[var(--df-muted)]">
              {event.updatedAt
                ? `Last updated ${formatDate(event.updatedAt)}`
                : "No update timestamp available"}
            </p>
          </div>
          <div className="bg-[var(--df-paper)] p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-[var(--df-muted)]">
              Review metadata
            </p>
            <p className="mt-3 flex items-center gap-2 text-sm font-semibold text-[var(--df-text-strong)]">
              {isApproved ? (
                <ShieldCheck size={16} />
              ) : isRejected ? (
                <ShieldX size={16} />
              ) : (
                <Clock3 size={16} />
              )}
              {approverUser?.name ||
                (isApproved || isRejected
                  ? "Reviewer not available"
                  : "Awaiting review")}
            </p>
            <p className="mt-3 text-xs text-[var(--df-muted)]">
              {event.approvedAt
                ? `Reviewed ${formatDate(event.approvedAt)}`
                : "No review timestamp available"}
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.85fr)]">
          <div className="space-y-5">
            <Section
              eyebrow="Event information"
              title="Record details"
              icon={FileText}
            >
              <div className="grid grid-cols-1 gap-x-8 sm:grid-cols-2">
                <DetailField label="Event ID" value={event.id} mono />
                <DetailField label="Event type" value={humanize(event.type)} />
                <DetailField label="Status" value={humanize(event.status)} />
                <DetailField
                  label="Created at"
                  value={formatDate(event.createdAt)}
                />
                <DetailField
                  label="Last updated"
                  value={formatDate(event.updatedAt)}
                />
                <DetailField
                  label="Employment history ID"
                  value={history?.id}
                  mono
                />
                <DetailField
                  label="Reviewed at"
                  value={formatDate(event.approvedAt)}
                />
                <DetailField
                  label="Reviewer profile ID"
                  value={approver?.id}
                  mono
                />
              </div>
            </Section>

            <Section
              eyebrow="Employment record"
              title="Associated company"
              icon={Building2}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center border border-[var(--df-line)] bg-[var(--df-paper-2)]">
                  <Building2 size={20} strokeWidth={1.5} />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="break-words text-lg font-semibold tracking-tight text-[var(--df-text-strong)]">
                    {company?.name || "Company not available"}
                  </h3>
                  <p className="mt-1 text-xs text-[var(--df-muted)]">
                    {company?.industry || "Industry not provided"}
                    {company?.country ? ` · ${company.country}` : ""}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {company?.isVerified === true && (
                      <span className="inline-flex items-center gap-1.5 border border-emerald-700/15 bg-emerald-700/[0.06] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-emerald-800">
                        <BadgeCheck size={12} />
                        Verified company
                      </span>
                    )}
                    {companyWebsite && (
                      <a
                        href={companyWebsite}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 border border-[var(--df-line)] px-2.5 py-1.5 text-xs font-medium hover:border-[var(--df-ink)]"
                      >
                        <Globe size={12} />
                        Website
                        <ArrowUpRight size={12} />
                      </a>
                    )}
                  </div>
                  <p className="mt-4 break-all font-mono text-[10px] text-[var(--df-soft)]">
                    Company ID: {company?.id || "Not available"}
                  </p>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-x-8 sm:grid-cols-2">
                <DetailField label="Industry" value={company?.industry} />
                <DetailField label="Country" value={company?.country} />
                <DetailField
                  label="Company verification"
                  value={
                    company?.isVerified === true
                      ? "Verified"
                      : company?.isVerified === false
                        ? "Not verified"
                        : "Not available"
                  }
                />
                <DetailField
                  label="Website"
                  value={companyWebsite || "Not provided"}
                />
              </div>
            </Section>

            <Section
              eyebrow="People"
              title="Developer and recruiter"
              icon={UserRound}
            >
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <PersonCard
                  title="Developer"
                  person={developer}
                  user={developerUser}
                  icon={UserRound}
                />
                <PersonCard
                  title="Hiring recruiter"
                  person={recruiter}
                  user={recruiterUser}
                  icon={Building2}
                />
              </div>

              {developerUser && (
                <div className="mt-5 grid grid-cols-1 gap-x-8 sm:grid-cols-2">
                  <DetailField
                    label="Developer account"
                    value={developerUser.isActive === true
                      ? "Active"
                      : developerUser.isActive === false
                        ? "Inactive"
                        : "Not available"}
                  />
                  <DetailField
                    label="Developer verification"
                    value={developerUser.isVerified === true
                      ? "Verified"
                      : developerUser.isVerified === false
                        ? "Not verified"
                        : "Not available"}
                  />
                  <DetailField
                    label="Developer profile ID"
                    value={developer?.id}
                    mono
                  />
                  <DetailField
                    label="Recruiter profile ID"
                    value={recruiter?.id}
                    mono
                  />
                </div>
              )}
            </Section>
          </div>

          <aside className="space-y-5">
            <Section
              eyebrow="Approval trail"
              title="Review information"
              icon={ShieldCheck}
            >
              <div className="flex items-start gap-3">
                <div
                  className={cx(
                    "flex h-9 w-9 shrink-0 items-center justify-center border",
                    isApproved
                      ? "border-emerald-700/15 bg-emerald-700/[0.06] text-emerald-800"
                      : isRejected
                        ? "border-rose-700/15 bg-rose-700/[0.06] text-rose-800"
                        : "border-[var(--df-line)] bg-[var(--df-paper-2)] text-[var(--df-muted)]"
                  )}
                >
                  {isApproved ? (
                    <ShieldCheck size={17} />
                  ) : isRejected ? (
                    <ShieldX size={17} />
                  ) : (
                    <Clock3 size={17} />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[var(--df-text-strong)]">
                    {isApproved
                      ? "Event approved"
                      : isRejected
                        ? "Event rejected"
                        : "Review pending"}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-[var(--df-muted)]">
                    {isApproved
                      ? "The event is recorded as approved."
                      : isRejected
                        ? "The event is recorded as rejected."
                        : "No completed review is recorded on this event."}
                  </p>
                </div>
              </div>

              <div className="mt-5">
                <DetailField
                  label="Reviewer"
                  value={approverUser?.name}
                />
                <DetailField
                  label="Reviewer email"
                  value={approverUser?.email}
                />
                <DetailField
                  label="Review timestamp"
                  value={formatDate(event.approvedAt)}
                />
              </div>
            </Section>

            <Section
              eyebrow="Record reference"
              title="Identifiers"
              icon={Hash}
            >
              <DetailField label="Event ID" value={event.id} mono />
              <DetailField
                label="Employment history ID"
                value={history?.id}
                mono
              />
              <DetailField
                label="Developer profile ID"
                value={developer?.id}
                mono
              />
              <DetailField
                label="Company ID"
                value={company?.id}
                mono
              />
              <DetailField
                label="Recruiter profile ID"
                value={recruiter?.id}
                mono
              />
            </Section>

            <div className="border border-[var(--df-line)] bg-[var(--df-paper-2)] p-5">
              <div className="flex items-start gap-3">
                <CircleAlert
                  size={16}
                  className="mt-0.5 shrink-0 text-[var(--df-muted)]"
                />
                <div>
                  <h3 className="text-xs font-semibold text-[var(--df-text-strong)]">
                    Administrative record
                  </h3>
                  <p className="mt-1.5 text-xs leading-5 text-[var(--df-muted)]">
                    This page displays the current API record. Approval or
                    rejection changes should be performed only through a
                    dedicated, authorized workflow with an audit trail.
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>

        <div className="mt-8 border-t border-[var(--df-line)] pt-5">
          <Link
            href="/dashboard/admin/employment-events"
            className="inline-flex h-10 items-center gap-2 border border-[var(--df-line)] px-4 text-xs font-semibold uppercase tracking-[0.08em] transition hover:border-[var(--df-ink)] hover:bg-[var(--df-paper-2)]"
          >
            <ArrowLeft size={14} />
            Back to event directory
          </Link>
        </div>
      </div>
    </main>
  );
}
