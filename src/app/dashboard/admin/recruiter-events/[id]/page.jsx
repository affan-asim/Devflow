
"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowLeft,
  ArrowUpRight,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock3,
  ExternalLink,
  FileText,
  Mail,
  MapPin,
  ShieldCheck,
  UserRound,
  XCircle,
  BriefcaseBusiness,
  Activity,
  RefreshCw,
} from "lucide-react";

import {
  fetchAdminRecruiterEventById,
  clearCurrentAdminRecruiterEvent,
} from "@/lib/redux/slices/adminRecruiterEventsSlice";

function formatDate(value, withTime = true) {
  if (!value) return "Not recorded";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Invalid date";

  return new Intl.DateTimeFormat("en", {
    month: "long",
    day: "numeric",
    year: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  }).format(date);
}

function titleCase(value) {
  if (!value) return "Unknown";

  return String(value)
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function StatusBadge({ status }) {
  const config = {
    PENDING: {
      Icon: Clock3,
      style: "border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300",
    },
    ACCEPTED: {
      Icon: CheckCircle2,
      style: "border-green-600/25 bg-green-500/15 text-green-800 dark:text-green-400",
    },
    REJECTED: {
      Icon: XCircle,
      style: "border-red-500/25 bg-red-500/10 text-red-700 dark:text-red-300",
    },
  };

  const { Icon, style } = config[status] || {
    Icon: Activity,
    style: "border-[var(--df-line)] text-[var(--df-muted)]",
  };

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] ${style}`}
    >
      <Icon size={13} />
      {titleCase(status)}
    </span>
  );
}

function DetailField({ label, value, icon: Icon }) {
  return (
    <div className="min-w-0 border-b border-[var(--df-line-soft)] py-4 last:border-b-0">
      <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-[var(--df-muted)]">
        {label}
      </p>
      <div className="mt-2 flex min-w-0 items-start gap-2.5">
        {Icon && (
          <Icon size={15} className="mt-0.5 shrink-0 text-[var(--df-muted)]" />
        )}
        <div className="min-w-0 break-words text-sm text-[var(--df-text)]">
          {value || "Not recorded"}
        </div>
      </div>
    </div>
  );
}

function Section({ eyebrow, title, icon: Icon, children }) {
  return (
    <section className="min-w-0 border border-[var(--df-line)] bg-[var(--df-paper)]">
      <div className="flex items-center gap-3 border-b border-[var(--df-line)] px-5 py-4">
        <div className="flex h-8 w-8 items-center justify-center border border-[var(--df-line)] text-[var(--df-muted)]">
          <Icon size={15} />
        </div>
        <div>
          <p className="df-eyebrow">{eyebrow}</p>
          <h2 className="mt-1 text-sm font-medium text-[var(--df-text-strong)]">
            {title}
          </h2>
        </div>
      </div>
      <div className="px-5 py-1">{children}</div>
    </section>
  );
}

export default function AdminRecruiterEventDetailPage() {
  const params = useParams();
  const eventId = params?.id;
  const dispatch = useDispatch();

  const { currentEvent, loadingDetail, errorDetail } = useSelector(
    (state) => state.adminRecruiterEvents || {}
  );

  useEffect(() => {
    if (!eventId) return;

    dispatch(fetchAdminRecruiterEventById(eventId));

    return () => {
      dispatch(clearCurrentAdminRecruiterEvent());
    };
  }, [dispatch, eventId]);

  if (loadingDetail && !currentEvent) {
    return (
      <main className="mx-auto w-full max-w-[1440px] px-5 py-10 sm:px-8 lg:px-10">
        <div className="df-eyebrow">DevFlow / Administration</div>
        <div className="mt-8 h-9 w-64 animate-pulse bg-[var(--df-paper-3)]" />
        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-56 animate-pulse border border-[var(--df-line)] bg-[var(--df-paper)]"
            />
          ))}
        </div>
      </main>
    );
  }

  if (errorDetail || !currentEvent) {
    return (
      <main className="mx-auto w-full max-w-[1440px] px-5 py-10 sm:px-8 lg:px-10">
        <Link
          href="/dashboard/admin/recruiter-events"
          className="inline-flex items-center gap-2 text-xs text-[var(--df-muted)] hover:text-[var(--df-text)]"
        >
          <ArrowLeft size={14} />
          Back to recruiter events
        </Link>

        <div className="mt-8 max-w-xl border border-[var(--df-line)] p-7">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-500/10 text-red-600">
            <Activity size={19} />
          </div>
          <h1 className="mt-5 text-2xl font-semibold tracking-[-0.05em]">
            Unable to load this event.
          </h1>
          <p className="mt-2 text-sm leading-6 text-[var(--df-muted)]">
            {errorDetail || "The event may not exist, or you may not have access to it."}
          </p>
          <button
            type="button"
            onClick={() => dispatch(fetchAdminRecruiterEventById(eventId))}
            className="df-btn df-btn-outline mt-5"
          >
            <RefreshCw size={14} />
            Try again
          </button>
        </div>
      </main>
    );
  }

  const event = currentEvent;
  const history = event.recruiterHistory;
  const recruiter = history?.recruiter;
  const user = recruiter?.user;
  const company = history?.company;
  const approver = event.approvedBy?.user;

  return (
    <main className="mx-auto w-full max-w-[1440px] px-5 py-8 sm:px-8 sm:py-10 lg:px-10">
      <Link
        href="/dashboard/admin/recruiter-events"
        className="inline-flex items-center gap-2 text-xs text-[var(--df-muted)] transition hover:text-[var(--df-text)]"
      >
        <ArrowLeft size={14} />
        All recruiter events
      </Link>

      <header className="mt-7 flex flex-col justify-between gap-5 border-b border-[var(--df-line)] pb-7 xl:flex-row xl:items-start">
        <div className="min-w-0">
          <p className="df-eyebrow">DevFlow / Event record</p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <h1 className="break-words text-3xl font-semibold tracking-[-0.07em] text-[var(--df-text-strong)] sm:text-4xl">
              {titleCase(event.type)}
              <span className="text-[var(--df-muted)]">.</span>
            </h1>
            <StatusBadge status={event.status} />
          </div>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--df-muted)]">
            Review the event details, the associated recruiter employment
            record, and any recorded approval information.
          </p>
          <p className="mt-3 break-all font-mono text-[10px] text-[var(--df-muted)]">
            EVENT ID · {event.id}
          </p>
        </div>

        {event.letterUrl && (
          <a
            href={event.letterUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="df-btn df-btn-outline self-start"
          >
            <FileText size={14} />
            View supporting letter
            <ExternalLink size={12} />
          </a>
        )}
      </header>

      <section className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="border border-[var(--df-line)] p-4">
          <p className="df-eyebrow">Event type</p>
          <p className="mt-3 text-lg font-medium tracking-[-0.04em]">
            {titleCase(event.type)}
          </p>
          <p className="mt-1 text-xs text-[var(--df-muted)]">
            Recruiter employment event
          </p>
        </div>
        <div className="border border-[var(--df-line)] p-4">
          <p className="df-eyebrow">Submitted</p>
          <p className="mt-3 text-lg font-medium tracking-[-0.04em]">
            {formatDate(event.createdAt, false)}
          </p>
          <p className="mt-1 text-xs text-[var(--df-muted)]">
            {formatDate(event.createdAt)}
          </p>
        </div>
        <div className="border border-[var(--df-line)] p-4">
          <p className="df-eyebrow">Decision status</p>
          <div className="mt-4">
            <StatusBadge status={event.status} />
          </div>
          <p className="mt-2 text-xs text-[var(--df-muted)]">
            {event.status === "PENDING"
              ? "No final decision is recorded."
              : `Recorded as ${titleCase(event.status).toLowerCase()}.`}
          </p>
        </div>
      </section>

      <div className="mt-5 grid min-w-0 grid-cols-1 items-start gap-5 xl:grid-cols-2">
        <div className="grid min-w-0 gap-5">
          <Section
            eyebrow="Identity"
            title="Recruiter information"
            icon={UserRound}
          >
            <DetailField label="Full name" value={user?.name} icon={UserRound} />
            <DetailField label="Email address" value={user?.email} icon={Mail} />
            <DetailField
              label="Account verification"
              value={
                user?.isVerified == null
                  ? "Not available"
                  : user.isVerified
                    ? "Verified"
                    : "Not verified"
              }
              icon={ShieldCheck}
            />
            <DetailField
              label="Account status"
              value={
                user?.isActive == null
                  ? "Not available"
                  : user.isActive
                    ? "Active"
                    : "Inactive"
              }
              icon={Activity}
            />
            <DetailField
              label="Recruiter profile ID"
              value={recruiter?.id}
            />
          </Section>

          <Section
            eyebrow="Organization"
            title="Company information"
            icon={Building2}
          >
            <DetailField
              label="Company"
              value={company?.name}
              icon={Building2}
            />
            <DetailField
              label="Company verification"
              value={
                company?.isVerified == null
                  ? "Not available"
                  : company.isVerified
                    ? "Verified"
                    : "Not verified"
              }
              icon={ShieldCheck}
            />
            <DetailField
              label="Employment role"
              value={history?.roleTitle}
              icon={BriefcaseBusiness}
            />
            <DetailField
              label="Employment type"
              value={titleCase(history?.employmentType)}
            />
            <DetailField
              label="Company ID"
              value={company?.id}
            />
          </Section>
        </div>

        <div className="grid min-w-0 gap-5">
          <Section
            eyebrow="Event record"
            title="Reason and supporting documents"
            icon={FileText}
          >
            <DetailField
              label="Event category"
              value={titleCase(event.type)}
              icon={Activity}
            />
            <div className="border-b border-[var(--df-line-soft)] py-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-[var(--df-muted)]">
                Reason provided
              </p>
              <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-7 text-[var(--df-text)]">
                {event.reason || "No reason was provided for this event."}
              </p>
            </div>
            <div className="py-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-[var(--df-muted)]">
                Supporting letter
              </p>
              {event.letterUrl ? (
                <a
                  href={event.letterUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex max-w-full items-center gap-2 break-all text-sm underline underline-offset-4 hover:text-[var(--df-muted)]"
                >
                  <FileText size={15} className="shrink-0" />
                  Open supporting document
                  <ArrowUpRight size={13} className="shrink-0" />
                </a>
              ) : (
                <p className="mt-3 text-sm text-[var(--df-muted)]">
                  No supporting letter is attached.
                </p>
              )}
            </div>
          </Section>

          <Section
            eyebrow="Employment timeline"
            title="Recruiter history"
            icon={CalendarDays}
          >
            <DetailField
              label="Start date"
              value={formatDate(history?.startDate, false)}
              icon={CalendarDays}
            />
            <DetailField
              label="End date"
              value={formatDate(history?.endDate, false)}
              icon={CalendarDays}
            />
            <DetailField
              label="Current employment"
              value={
                history?.isCurrent == null
                  ? "Not recorded"
                  : history.isCurrent
                    ? "Marked as current"
                    : "Not current"
              }
            />
            <DetailField
              label="History record ID"
              value={history?.id}
            />
          </Section>

          <Section
            eyebrow="Governance"
            title="Approval information"
            icon={ShieldCheck}
          >
            <DetailField
              label="Decision status"
              value={titleCase(event.status)}
              icon={ShieldCheck}
            />
            <DetailField
              label="Approved / processed by"
              value={approver?.name}
              icon={UserRound}
            />
            <DetailField
              label="Approver email"
              value={approver?.email}
              icon={Mail}
            />
            <DetailField
              label="Approver recruiter ID"
              value={event.approvedByRecruiterId}
            />
            <DetailField
              label="Record created"
              value={formatDate(event.createdAt)}
              icon={Clock3}
            />
          </Section>
        </div>
      </div>

      <footer className="mt-6 border-t border-[var(--df-line)] pt-4">
        <p className="text-[10px] leading-5 text-[var(--df-muted)]">
          Administrative record view. Event data is displayed as returned by
          the server; this page does not change approval decisions.
        </p>
      </footer>
    </main>
  );
}