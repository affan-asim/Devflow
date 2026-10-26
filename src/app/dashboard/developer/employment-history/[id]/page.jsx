"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowLeft,
  ArrowUpRight,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Globe2,
  MapPin,
  UserRound,
  Building2,
  ExternalLink,
  LogOut,
} from "lucide-react";

import {
  fetchDeveloperEmploymentHistoryById,
  clearCurrentEmployment,
  clearEmploymentErrors,
} from "@/lib/redux/slices/employmentHistorySlice";
import {
  clearEmploymentEventErrors,
  submitEmploymentResignation,
} from "@/lib/redux/slices/employmentEventsSlice";

/* =========================================================
   FORMATTERS
========================================================= */

function formatDate(date, options = {}) {
  if (!date) return null;

  try {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      year: "numeric",
      ...options,
    }).format(new Date(date));
  } catch {
    return null;
  }
}

function formatFullDate(date) {
  if (!date) return null;

  try {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(date));
  } catch {
    return null;
  }
}

function formatEnum(value) {
  if (!value) return null;

  return value
    .toLowerCase()
    .split("_")
    .map(
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1)
    )
    .join(" ");
}

function formatSalary(salary, currency) {
  if (salary == null) return null;

  const amount = Number(salary);

  if (Number.isNaN(amount)) {
    return `${salary}${currency ? ` ${currency}` : ""}`;
  }

  return `${amount.toLocaleString()}${
    currency ? ` ${currency}` : ""
  }`;
}

function calculateDuration(startDate, endDate) {
  if (!startDate) return null;

  const start = new Date(startDate);
  const end = endDate
    ? new Date(endDate)
    : new Date();

  let months =
    (end.getFullYear() - start.getFullYear()) * 12 +
    (end.getMonth() - start.getMonth());

  if (months < 1) {
    return "Less than a month";
  }

  const years = Math.floor(months / 12);

  months %= 12;

  const parts = [];

  if (years > 0) {
    parts.push(
      `${years} ${years === 1 ? "year" : "years"}`
    );
  }

  if (months > 0) {
    parts.push(
      `${months} ${
        months === 1 ? "month" : "months"
      }`
    );
  }

  return parts.join(" ");
}

/* =========================================================
   COMPANY LOGO
========================================================= */

function CompanyLogo({
  company,
  size = "large",
}) {
  const sizeClasses =
    size === "large"
      ? "h-16 w-16"
      : "h-12 w-12";

  if (company?.logo) {
    return (
      <div
        className={`${sizeClasses} shrink-0 overflow-hidden border border-[var(--df-line)] bg-[var(--df-paper)]`}
      >
        <img
          src={company.logo}
          alt={company.name || "Company"}
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  const initial =
    company?.name?.charAt(0)?.toUpperCase() || "C";

  return (
    <div
      className={`${sizeClasses} flex shrink-0 items-center justify-center border border-[var(--df-line)] bg-[var(--df-text)] font-semibold text-[var(--df-paper)]`}
    >
      {initial}
    </div>
  );
}

/* =========================================================
   SKELETON
========================================================= */

function DetailSkeleton() {
  return (
    <main className="min-h-screen bg-[var(--df-paper)]">
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10 lg:py-12">
        <div className="animate-pulse">
          <div className="h-3 w-32 bg-[var(--df-line)]" />

          <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_340px]">
            <div>
              <div className="h-3 w-28 bg-[var(--df-line)]" />

              <div className="mt-4 h-12 w-4/5 bg-[var(--df-line)]" />

              <div className="mt-4 h-4 w-48 bg-[var(--df-line)]" />

              <div className="mt-8 h-16 w-full bg-[var(--df-line)]" />
            </div>

            <div className="h-64 bg-[var(--df-line)]" />
          </div>

          <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_340px]">
            <div className="space-y-8">
              <div className="h-40 bg-[var(--df-line)]" />
              <div className="h-56 bg-[var(--df-line)]" />
              <div className="h-64 bg-[var(--df-line)]" />
            </div>

            <div className="h-72 bg-[var(--df-line)]" />
          </div>
        </div>
      </div>
    </main>
  );
}

/* =========================================================
   STATUS BADGE
========================================================= */

function StatusBadge({ status }) {
  if (!status) return null;

  return (
    <span className="inline-flex items-center gap-2 border border-[var(--df-line)] bg-[var(--df-paper)] px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.13em]">
      <span className="h-1.5 w-1.5 rounded-full bg-[var(--df-accent)]" />

      {formatEnum(status)}
    </span>
  );
}

/* =========================================================
   SUMMARY ITEM
========================================================= */

function SummaryItem({
  icon: Icon,
  label,
  value,
  border = false,
}) {
  if (!value) return null;

  return (
    <div
      className={`flex items-start gap-3 p-5 ${
        border
          ? "border-t border-[var(--df-line)] sm:border-l sm:border-t-0"
          : ""
      }`}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[var(--df-muted)]" />

      <div className="min-w-0">
        <p className="text-[9px] font-semibold uppercase tracking-[0.13em] text-[var(--df-muted)]">
          {label}
        </p>

        <p className="mt-1 text-xs font-medium">
          {value}
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   TIMELINE
========================================================= */

function EventTimeline({ events = [] }) {
  if (!events.length) {
    return (
      <div className="border border-[var(--df-line)] p-6">
        <div className="flex items-start gap-3">
          <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--df-muted)]" />

          <div>
            <p className="text-sm font-medium">
              No events recorded
            </p>

            <p className="mt-1 text-xs leading-5 text-[var(--df-muted)]">
              There are currently no employment events attached
              to this record.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const sortedEvents = [...events].sort((a, b) => {
    if (!a.createdAt || !b.createdAt) return 0;

    return (
      new Date(a.createdAt) -
      new Date(b.createdAt)
    );
  });

  return (
    <div className="border border-[var(--df-line)]">
      {sortedEvents.map((event, index) => {
        const isLast =
          index === sortedEvents.length - 1;

        return (
          <div
            key={
              event.id ||
              `${event.type}-${index}`
            }
            className="relative flex gap-5 p-5 sm:p-6"
          >
            {/* TIMELINE */}

            <div className="relative flex w-4 shrink-0 justify-center">
              <span
                className={`relative z-10 mt-1 h-3 w-3 rounded-full border ${
                  isLast
                    ? "border-[var(--df-accent)] bg-[var(--df-accent)]"
                    : "border-[var(--df-text)] bg-[var(--df-paper)]"
                }`}
              />

              {!isLast && (
                <span className="absolute left-1/2 top-4 h-full w-px -translate-x-1/2 bg-[var(--df-line)]" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-semibold">
                    {formatEnum(event.type) ||
                      "Employment event"}
                  </p>

                  {event.status && (
                    <p className="mt-1 text-xs text-[var(--df-muted)]">
                      Status:{" "}
                      {formatEnum(event.status)}
                    </p>
                  )}
                </div>

                {event.createdAt && (
                  <time className="text-[10px] font-medium uppercase tracking-[0.1em] text-[var(--df-muted)]">
                    {formatFullDate(
                      event.createdAt
                    )}
                  </time>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* =========================================================
   COMPANY CARD
========================================================= */

function CompanyCard({ company }) {
  if (!company) return null;

  return (
    <section className="border border-[var(--df-line)]">
      <div className="border-b border-[var(--df-line)] px-5 py-4">
        <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-[var(--df-muted)]">
          Company
        </p>
      </div>

      <div className="p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <CompanyLogo
            company={company}
            size="small"
          />

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-sm font-semibold">
                {company.name ||
                  "Unknown company"}
              </h2>

              {company.isVerified && (
                <CheckCircle2 className="h-3.5 w-3.5 text-[var(--df-accent)]" />
              )}
            </div>

            {company.industry && (
              <p className="mt-1 text-xs text-[var(--df-muted)]">
                {formatEnum(company.industry)}
              </p>
            )}
          </div>
        </div>

        <div className="mt-6 space-y-0 border-t border-[var(--df-line)]">
          {company.country && (
            <SideInfo
              icon={Globe2}
              label="Country"
              value={formatEnum(
                company.country
              )}
            />
          )}

          {company.createdAt && (
            <SideInfo
              icon={CalendarDays}
              label="Established"
              value={formatFullDate(
                company.createdAt
              )}
            />
          )}

          {company.isVerified !== undefined && (
            <SideInfo
              icon={CheckCircle2}
              label="Verification"
              value={
                company.isVerified
                  ? "Verified company"
                  : "Not verified"
              }
            />
          )}
        </div>

        {company.description && (
          <div className="mt-5 border-t border-[var(--df-line)] pt-5">
            <p className="text-xs leading-6 text-[var(--df-muted)]">
              {company.description}
            </p>
          </div>
        )}

        {company.websiteUrl && (
          <a
            href={company.websiteUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-flex items-center gap-2 text-xs font-semibold underline underline-offset-4"
          >
            Visit company
            <ArrowUpRight className="h-3 w-3" />
          </a>
        )}
      </div>
    </section>
  );
}

/* =========================================================
   RECRUITER CARD
========================================================= */

function RecruiterCard({ recruiter }) {
  if (!recruiter) return null;

  const recruiterName =
    recruiter.user?.name ||
    [
      recruiter.user?.firstName,
      recruiter.user?.lastName,
    ]
      .filter(Boolean)
      .join(" ") ||
    recruiter.name ||
    recruiter.jobTitle ||
    "Hiring recruiter";

  return (
    <section className="border border-[var(--df-line)]">
      <div className="border-b border-[var(--df-line)] px-5 py-4">
        <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-[var(--df-muted)]">
          Hiring contact
        </p>
      </div>

      <div className="p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center border border-[var(--df-line)]">
            <UserRound className="h-5 w-5 text-[var(--df-muted)]" />
          </div>

          <div className="min-w-0">
            <h2 className="text-sm font-semibold">
              {recruiterName}
            </h2>

            {recruiter.jobTitle && (
              <p className="mt-1 text-xs text-[var(--df-muted)]">
                {recruiter.jobTitle}
              </p>
            )}
          </div>
        </div>

        {recruiter.bio && (
          <p className="mt-5 border-t border-[var(--df-line)] pt-5 text-xs leading-6 text-[var(--df-muted)]">
            {recruiter.bio}
          </p>
        )}

        {recruiter.locationPreference && (
          <div className="mt-5 border-t border-[var(--df-line)] pt-5">
            <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[var(--df-muted)]">
              Work preference
            </p>

            <p className="mt-1 text-xs font-medium">
              {formatEnum(
                recruiter.locationPreference
              )}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

/* =========================================================
   SIDE INFO
========================================================= */

function SideInfo({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="flex items-center gap-3 border-b border-[var(--df-line)] py-3 last:border-b-0">
      <Icon className="h-3.5 w-3.5 shrink-0 text-[var(--df-muted)]" />

      <div className="min-w-0">
        <p className="text-[9px] uppercase tracking-[0.1em] text-[var(--df-muted)]">
          {label}
        </p>

        <p className="mt-0.5 text-xs font-medium">
          {value}
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   DEVELOPER SNAPSHOT
========================================================= */

function DeveloperSnapshot({ developer }) {
  if (!developer) return null;

  return (
    <section>
      <div className="mb-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.17em] text-[var(--df-muted)]">
          Developer context
        </p>

        <h2 className="mt-2 text-xl font-semibold tracking-tight">
          Profile at the time
        </h2>
      </div>

      <div className="border border-[var(--df-line)] p-5 sm:p-6">
        {developer.bio && (
          <p className="text-sm leading-7 text-[var(--df-muted)]">
            {developer.bio}
          </p>
        )}

        {developer.skills?.length > 0 && (
          <div className="mt-6 border-t border-[var(--df-line)] pt-6">
            <p className="text-[9px] font-semibold uppercase tracking-[0.13em] text-[var(--df-muted)]">
              Skills
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              {developer.skills.map((skill) => (
                <span
                  key={skill.id}
                  className="border border-[var(--df-line)] px-3 py-1.5 text-xs font-medium"
                >
                  {skill.name}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 border-t border-[var(--df-line)] pt-5">
          {developer.locationPreference && (
            <span className="inline-flex items-center gap-2 text-xs text-[var(--df-muted)]">
              <MapPin className="h-3.5 w-3.5" />

              {formatEnum(
                developer.locationPreference
              )}
            </span>
          )}

          {developer.portfolioUrl && (
            <a
              href={developer.portfolioUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-xs font-medium underline underline-offset-4"
            >
              Portfolio
              <ArrowUpRight className="h-3 w-3" />
            </a>
          )}

          {developer.githubUrl && (
            <a
              href={developer.githubUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-xs font-medium underline underline-offset-4 hover:text-[var(--df-accent)]"
            >
              GitHub
              <ArrowUpRight className="h-3 w-3" />
            </a>
          )}
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   PAGE
========================================================= */

export default function EmploymentHistoryDetailPage({
  params,
}) {
  const { id } = use(params);

  const dispatch = useDispatch();
  const [showResignationForm, setShowResignationForm] = useState(false);
  const [resignationReason, setResignationReason] = useState("");

  const {
    currentEmployment,
    loadingDetail,
    errorDetail,
  } = useSelector(
    (state) => state.employmentHistory || {}
  );
  const { submittingResignation, resignationError } = useSelector(
    (state) => state.employmentEvents || {}
  );

  useEffect(() => {
    if (!id) return;

    dispatch(clearEmploymentErrors());

    dispatch(
      fetchDeveloperEmploymentHistoryById(id)
    );

    return () => {
      dispatch(clearCurrentEmployment());
    };
  }, [dispatch, id]);

  /* =======================================================
     LOADING
  ====================================================== */

  if (loadingDetail) {
    return <DetailSkeleton />;
  }

  /* =======================================================
     ERROR
  ====================================================== */

  if (errorDetail) {
    return (
      <main className="min-h-screen bg-[var(--df-paper)] text-[var(--df-text)]">
        <div className="mx-auto flex min-h-screen max-w-3xl items-center px-5 py-10 sm:px-8">
          <div className="w-full border border-[var(--df-line)] p-8 text-center sm:p-12">
            <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[var(--df-muted)]">
              Employment history
            </p>

            <h1 className="mt-4 text-2xl font-semibold tracking-tight">
              Employment record unavailable
            </h1>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[var(--df-muted)]">
              {errorDetail}
            </p>

            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={() =>
                  dispatch(
                    fetchDeveloperEmploymentHistoryById(
                      id
                    )
                  )
                }
                className="inline-flex h-10 items-center bg-[var(--df-text)] px-5 text-xs font-semibold text-[var(--df-paper)] transition hover:opacity-85"
              >
                Try again
              </button>

              <Link
                href="/dashboard/employment-history"
                className="inline-flex h-10 items-center border border-[var(--df-line)] px-5 text-xs font-semibold transition hover:border-[var(--df-text)]"
              >
                Back to history
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!currentEmployment) {
    return null;
  }

  const employment = currentEmployment;
  const company = employment.company;
  const developer = employment.developer;
  const recruiter = employment.hiredByRecruiter;
  const hasPendingResignation = employment.employmentEvents?.some(
    (event) => event.type === "RESIGN" && event.status === "PENDING"
  );

  async function handleSubmitResignation(event) {
    event.preventDefault();
    try {
      await dispatch(
        submitEmploymentResignation({
          historyId: employment.id,
          data: { reason: resignationReason.trim() || undefined },
        })
      ).unwrap();
      setResignationReason("");
      setShowResignationForm(false);
      dispatch(fetchDeveloperEmploymentHistoryById(id));
    } catch {
      // The Redux error is displayed alongside the form.
    }
  }

  const startDate = formatDate(
    employment.startDate
  );

  const endDate = employment.endDate
    ? formatDate(employment.endDate)
    : "Present";

  const duration = calculateDuration(
    employment.startDate,
    employment.endDate
  );

  /* =======================================================
     PAGE
  ====================================================== */

  return (
    <main className="min-h-screen bg-[var(--df-paper)] text-[var(--df-text)]">
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10 lg:py-12">
        {/* =================================================
            BACK
        ================================================== */}

        <Link
          href="/dashboard/developer/employment-history"
          className="inline-flex items-center gap-2 text-xs font-medium text-[var(--df-muted)] transition hover:text-[var(--df-text)]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Employment history
        </Link>

        {/* =================================================
            HERO
        ================================================== */}

        <header className="mt-8 border border-[var(--df-line)]">
          <div className="p-6 sm:p-8 lg:p-10">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
              {/* LEFT */}

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[9px] font-semibold uppercase tracking-[0.17em] text-[var(--df-muted)]">
                    Employment record
                  </span>

                  {employment.status && (
                    <StatusBadge
                      status={employment.status}
                    />
                  )}
                </div>

                <h1 className="mt-4 max-w-4xl text-3xl font-semibold tracking-[-0.045em] sm:text-4xl lg:text-5xl">
                  {employment.roleTitle ||
                    "Employment record"}
                </h1>

                {company?.name && (
                  <div className="mt-5 flex flex-wrap items-center gap-3">
                    <span className="text-base text-[var(--df-muted)]">
                      {company.name}
                    </span>

                    {company.isVerified && (
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-medium text-black">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Verified company
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* RIGHT DATE */}

              <div className="shrink-0 border-l border-[var(--df-line)] pl-5 lg:min-w-52">
                <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--df-muted)]">
                  Employment period
                </p>

                <p className="mt-2 text-sm font-medium">
                  {startDate || "Unknown"} — {endDate}
                </p>

                {duration && (
                  <p className="mt-1 text-xs text-[var(--df-muted)]">
                    {duration}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* SUMMARY */}

          <div className="grid border-t border-[var(--df-line)] sm:grid-cols-2 lg:grid-cols-4">
            <SummaryItem
              icon={BriefcaseBusiness}
              label="Employment type"
              value={formatEnum(
                employment.employmentType
              )}
            />

            <SummaryItem
              icon={CalendarDays}
              label="Start date"
              value={formatFullDate(
                employment.startDate
              )}
              border
            />

            <SummaryItem
              icon={Clock3}
              label="Duration"
              value={duration}
              border
            />

            <SummaryItem
              icon={Building2}
              label="Company"
              value={company?.name}
              border
            />
          </div>
        </header>

        {employment.isCurrent && (
          <section className="mt-6 border border-[var(--df-line)] p-5 sm:p-6" aria-live="polite">
            {hasPendingResignation ? (
              <div className="flex items-start gap-3">
                <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--df-accent)]" />
                <div>
                  <h2 className="text-sm font-semibold">Resignation pending</h2>
                  <p className="mt-1 text-xs leading-5 text-[var(--df-muted)]">
                    Your request has been submitted and is waiting for the company to review it.
                  </p>
                </div>
              </div>
            ) : showResignationForm ? (
              <form onSubmit={handleSubmitResignation}>
                <h2 className="text-sm font-semibold">Submit resignation</h2>
                <p className="mt-1 text-xs leading-5 text-[var(--df-muted)]">
                  This sends a resignation request to {company?.name || "the company"}. Your employment remains active until it is approved.
                </p>
                <label className="mt-4 block text-xs font-medium" htmlFor="resignation-reason">
                  Reason <span className="font-normal text-[var(--df-muted)]">(optional)</span>
                </label>
                <textarea
                  id="resignation-reason"
                  rows={4}
                  maxLength={2000}
                  value={resignationReason}
                  onChange={(e) => setResignationReason(e.target.value)}
                  placeholder="Share a note with the company"
                  className="mt-2 w-full resize-y border border-[var(--df-line)] bg-transparent px-3 py-2.5 text-sm outline-none focus:border-[var(--df-text)]"
                />
                {resignationError && (
                  <p className="mt-2 text-xs text-red-600" role="alert">
                    {resignationError}
                  </p>
                )}
                <div className="mt-4 flex flex-wrap gap-3">
                  <button type="submit" disabled={submittingResignation} className="inline-flex h-10 items-center gap-2 bg-[var(--df-text)] px-4 text-xs font-semibold text-[var(--df-paper)] transition hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-60">
                    <LogOut className="h-3.5 w-3.5" />
                    {submittingResignation ? "Submitting…" : "Submit resignation"}
                  </button>
                  <button type="button" onClick={() => setShowResignationForm(false)} disabled={submittingResignation} className="h-10 border border-[var(--df-line)] px-4 text-xs font-semibold transition hover:border-[var(--df-text)] disabled:opacity-60">
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-sm font-semibold">Leaving this role?</h2>
                  <p className="mt-1 text-xs leading-5 text-[var(--df-muted)]">
                    Submit a resignation request for the company to review.
                  </p>
                </div>
                <button type="button" onClick={() => { dispatch(clearEmploymentEventErrors()); setShowResignationForm(true); }} className="inline-flex h-10 shrink-0 items-center justify-center gap-2 border border-[var(--df-line)] px-4 text-xs font-semibold transition hover:border-[var(--df-text)]">
                  <LogOut className="h-3.5 w-3.5" />
                  Resign
                </button>
              </div>
            )}
          </section>
        )}

        {/* =================================================
            CONTENT
        ================================================== */}

        <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-10">
          {/* =================================================
              MAIN
          ================================================== */}

          <div className="min-w-0 space-y-8">
            {/* ROLE DESCRIPTION */}

            <section className="border border-[var(--df-line)]">
              <div className="border-b border-[var(--df-line)] px-5 py-4 sm:px-6">
                <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-[var(--df-muted)]">
                  Role overview
                </p>
              </div>

              <div className="p-5 sm:p-7">
                {employment.description ? (
                  <p className="max-w-3xl whitespace-pre-line text-sm leading-8 text-[var(--df-muted)]">
                    {employment.description}
                  </p>
                ) : (
                  <p className="text-sm text-[var(--df-muted)]">
                    No description was provided for this
                    employment record.
                  </p>
                )}
              </div>
            </section>

            {/* EMPLOYMENT DETAILS */}

            <section className="border border-[var(--df-line)]">
              <div className="border-b border-[var(--df-line)] px-5 py-4 sm:px-6">
                <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-[var(--df-muted)]">
                  Employment details
                </p>
              </div>

              <div className="px-5 sm:px-6">
                <DetailRow
                  label="Role"
                  value={employment.roleTitle}
                />

                <DetailRow
                  label="Employment type"
                  value={formatEnum(
                    employment.employmentType
                  )}
                />

                <DetailRow
                  label="Start date"
                  value={formatFullDate(
                    employment.startDate
                  )}
                />

                <DetailRow
                  label="End date"
                  value={
                    employment.endDate
                      ? formatFullDate(
                          employment.endDate
                        )
                      : "Present"
                  }
                />

                <DetailRow
                  label="Duration"
                  value={duration}
                />

                <DetailRow
                  label="Compensation"
                  value={formatSalary(
                    employment.salary,
                    employment.currency
                  )}
                />

                {employment.locationPreference && (
                  <DetailRow
                    label="Work preference"
                    value={formatEnum(
                      employment.locationPreference
                    )}
                  />
                )}
              </div>
            </section>

            {/* EVENT TIMELINE */}

            <section>
              <div className="mb-5">
                <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[var(--df-muted)]">
                  Record history
                </p>

                <h2 className="mt-2 text-xl font-semibold tracking-tight">
                  Employment timeline
                </h2>

                <p className="mt-2 max-w-xl text-xs leading-5 text-[var(--df-muted)]">
                  Important events associated with this
                  employment record.
                </p>
              </div>

              <EventTimeline
                events={
                  employment.employmentEvents
                }
              />
            </section>

            {/* DEVELOPER SNAPSHOT */}

            <DeveloperSnapshot
              developer={developer}
            />
          </div>

          {/* =================================================
              SIDEBAR
          ================================================== */}

          <aside className="space-y-5">
            <CompanyCard company={company} />

            <RecruiterCard
              recruiter={recruiter}
            />

            {/* RECORD META */}

            <section className="border border-[var(--df-line)]">
              <div className="border-b border-[var(--df-line)] px-5 py-4">
                <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-[var(--df-muted)]">
                  Record information
                </p>
              </div>

              <div className="px-5 sm:px-6">
                <SideInfo
                  icon={CalendarDays}
                  label="Created"
                  value={formatFullDate(
                    employment.createdAt
                  )}
                />

                {employment.updatedAt && (
                  <SideInfo
                    icon={Clock3}
                    label="Last updated"
                    value={formatFullDate(
                      employment.updatedAt
                    )}
                  />
                )}

                <div className="border-b border-[var(--df-line)] py-4 last:border-b-0">
                  <p className="text-[9px] uppercase tracking-[0.1em] text-[var(--df-muted)]">
                    Record ID
                  </p>

                  <p className="mt-1 break-all text-[10px] text-[var(--df-muted)]">
                    {employment.id}
                  </p>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}

/* =========================================================
   DETAIL ROW
========================================================= */

function DetailRow({
  label,
  value,
}) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  return (
    <div className="flex flex-col gap-1 border-b border-[var(--df-line)] py-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
      <span className="text-xs text-[var(--df-muted)]">
        {label}
      </span>

      <span className="text-sm font-medium sm:text-right">
        {value}
      </span>
    </div>
  );
}
