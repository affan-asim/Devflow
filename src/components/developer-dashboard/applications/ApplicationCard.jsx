"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  MapPin,
} from "lucide-react";

import ApplicationStatus from "./ApplicationStatus";

function formatDate(value) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function formatEnum(value) {
  if (!value) return "—";

  return value
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) =>
      char.toUpperCase()
    );
}

function formatSalary(min, max, currency) {
  if (!min && !max) return null;

  const symbol =
    {
      USD: "$",
      EUR: "€",
      GBP: "£",
      PKR: "₨",
      INR: "₹",
      AED: "AED ",
    }[currency] || currency || "";

  const format = (value) =>
    Number(value).toLocaleString("en-US");

  if (min && max) {
    return `${symbol}${format(min)} – ${symbol}${format(max)}`;
  }

  if (min) {
    return `${symbol}${format(min)}+`;
  }

  return `Up to ${symbol}${format(max)}`;
}

function getDescription(description) {
  if (!description) {
    return "No job description provided.";
  }

  const clean = description.replace(/\s+/g, " ").trim();

  if (clean.length <= 180) {
    return clean;
  }

  return `${clean.slice(0, 180)}…`;
}

export default function ApplicationCard({
  application,
}) {
  const job = application.job;
  const company = job?.company;

  const salary = formatSalary(
    job?.minSalary,
    job?.maxSalary,
    job?.currency
  );

  return (
    <Link
      href={`/dashboard/developer/applications/${application.id}`}
      className="group block border border-[var(--df-line)] bg-[var(--df-paper)] transition-all hover:border-[var(--df-text)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)]"
    >
      {/* =================================================
          HEADER
      ================================================== */}

      <div className="p-5 sm:p-6">
        <div className="flex items-start gap-4">
          {/* COMPANY LOGO */}

          <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden border border-[var(--df-line)] bg-[var(--df-line)]">
            {company?.logo ? (
              <img
                src={company.logo}
                alt={company.name || "Company"}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-sm font-semibold text-[var(--df-muted)]">
                {company?.name
                  ?.charAt(0)
                  ?.toUpperCase() || "C"}
              </span>
            )}
          </div>

          {/* COMPANY + TITLE */}

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-xs font-semibold">
                {company?.name || "Company"}
              </p>

              {company?.isVerified && (
                <CheckCircle2 className="h-3.5 w-3.5 text-[var(--df-accent)]" />
              )}

              {job?.isFeatured && (
                <span className="border border-[var(--df-accent)]/30 bg-[var(--df-accent)]/[0.05] px-2 py-0.5 text-[8px] font-semibold uppercase tracking-[0.1em] text-[var(--df-accent)]">
                  Featured
                </span>
              )}
            </div>

            <h2 className="mt-2 text-xl font-semibold tracking-[-0.025em] sm:text-2xl">
              {job?.title || "Untitled role"}
            </h2>
          </div>

          {/* STATUS */}

          <div className="hidden shrink-0 sm:block">
            <ApplicationStatus
              status={application.status}
            />
          </div>
        </div>

        {/* MOBILE STATUS */}

        <div className="mt-4 sm:hidden">
          <ApplicationStatus
            status={application.status}
          />
        </div>

        {/* =================================================
            DESCRIPTION
        ================================================== */}

        <p className="mt-5 max-w-3xl text-sm leading-6 text-[var(--df-muted)]">
          {getDescription(job?.description)}
        </p>

        {/* =================================================
            JOB META
        ================================================== */}

        <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 border-t border-[var(--df-line)] pt-5">
          <MetaItem
            icon={MapPin}
            value={formatEnum(
              job?.locationPreference
            )}
          />

          <MetaItem
            icon={BriefcaseBusiness}
            value={formatEnum(job?.employmentType)}
          />

          <MetaItem
            icon={Clock3}
            value={formatEnum(
              job?.experienceLevel
            )}
          />

          {salary && (
            <span className="text-xs font-medium">
              {salary}
            </span>
          )}
        </div>
      </div>

      {/* =================================================
          FOOTER
      ================================================== */}

      <div className="border-t border-[var(--df-line)] px-5 py-4 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-[var(--df-muted)]">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5" />

              Applied{" "}
              <span className="font-medium text-[var(--df-text)]">
                {formatDate(application.createdAt)}
              </span>
            </span>

            {job?.deadline && (
              <span className="inline-flex items-center gap-1.5">
                <Clock3 className="h-3.5 w-3.5" />

                Deadline{" "}
                <span className="font-medium text-[var(--df-text)]">
                  {formatDate(job.deadline)}
                </span>
              </span>
            )}

            <span className="inline-flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5" />

              {application.resumeId
                ? "Resume attached"
                : "No resume"}
            </span>

            {application.coverLetterId && (
              <span>Cover letter attached</span>
            )}
          </div>

          <span className="inline-flex shrink-0 items-center gap-2 text-xs font-semibold text-[var(--df-text)]">
            View application

            <span className="flex h-7 w-7 items-center justify-center border border-[var(--df-line)] transition group-hover:border-[var(--df-text)]">
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </span>
          </span>
        </div>
      </div>
    </Link>
  );
}

function MetaItem({
  icon: Icon,
  value,
}) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-[var(--df-muted)]">
      <Icon className="h-3.5 w-3.5" />
      {value || "Not specified"}
    </span>
  );
}