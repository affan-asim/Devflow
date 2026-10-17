
"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Globe2,
  MapPin,
  SavePlus,
  Bookmark, Loader2
} from "lucide-react";
import { useDispatch } from "react-redux";
import { saveJob } from "@/lib/redux/slices/savedJobSlice";
import { useState } from "react";

export default function JobCard({
  job,
  index,
}) {
  const initialIsSaved = Boolean(job?.savedBy?.length);

  const dispatch = useDispatch();
  const [jobSaved, setJobSaved] = useState(initialIsSaved);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const handleSaveJob = async (id) => {
    if (jobSaved || loading) return;
  
    try {
      setLoading(true);
      setError(null);
      await dispatch(saveJob(id)).unwrap();
      setJobSaved(true);
    } catch (err) {
      setError(err?.error || err?.message || "Failed to save job");
    } finally {
      setLoading(false);
    }
  };
  return (
    <article className="group relative border-b border-[var(--df-line)] p-5 transition last:border-b-0 hover:bg-[var(--df-text)]/[0.018] sm:p-6 lg:p-7">
      <div className="grid gap-6 lg:grid-cols-[48px_minmax(0,1fr)_230px] lg:gap-8">
        {/* INDEX */}

        <div className="hidden pt-1 text-[10px] font-medium text-[var(--df-muted)] lg:block">
          {String(index + 1).padStart(2, "0")}
        </div>

        {/* MAIN */}

        <div className="min-w-0">
          {/* BADGES */}

          <div className="flex flex-wrap items-center gap-2">
            {job.isFeatured && (
              <span className="border border-[var(--df-accent)] bg-[var(--df-accent)]/[0.06] px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-[var(--df-accent)]">
                Featured
              </span>
            )}

            <span className="border border-[var(--df-line)] px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-[var(--df-muted)]">
              {formatExperience(
                job.experienceLevel
              )}
            </span>
          </div>

          {/* TITLE */}

          <Link
            href={`/dashboard/developer/jobs/${job.id}`}
            className="mt-3 block"
          >
            <h2 className="text-lg font-semibold tracking-tight transition group-hover:underline sm:text-xl">
              {job.title}
            </h2>
          </Link>

          {/* COMPANY */}

          <div className="mt-2 flex items-center gap-2">
            <p className="text-sm font-medium">
              {job.company?.name || "Company"}
            </p>

            {job.company?.isVerified && (
              <CheckCircle2 className="h-3.5 w-3.5 text-[var(--df-accent)]" />
            )}

            {job.company?.industry && (
              <>
                <span className="h-1 w-1 bg-[var(--df-line)]" />

                <span className="text-xs text-[var(--df-muted)]">
                  {formatValue(job.company.industry)}
                </span>
              </>
            )}
          </div>

          {/* META */}

          <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2">
            <Meta
              icon={MapPin}
              value={formatValue(
                job.locationPreference
              )}
            />

            <Meta
              icon={BriefcaseBusiness}
              value={formatValue(
                job.employmentType
              )}
            />

            {job.company?.country && (
              <Meta
                icon={Globe2}
                value={job.company.country}
              />
            )}
          </div>

          {/* SKILLS */}

          {job.skills?.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {job.skills
                .slice(0, 6)
                .map((skill) => (
                  <span
                    key={skill.id}
                    className="border border-[var(--df-line)] px-2.5 py-1.5 text-[10px] font-medium text-[var(--df-muted)]"
                  >
                    {skill.name}
                  </span>
                ))}

              {job.skills.length > 6 && (
                <span className="px-1 py-1.5 text-[10px] text-[var(--df-muted)]">
                  +{job.skills.length - 6}
                </span>
              )}
            </div>
          )}
        </div>

        {/* SIDE INFO */}

        <div className="flex flex-col justify-between lg:text-right">
          <div>
            <p className="text-base font-semibold tracking-tight">
              {formatSalary(
                job.minSalary,
                job.maxSalary,
                job.currency
              )}
            </p>

            {job.currency && (
              <p className="mt-1 text-[10px] text-[var(--df-muted)]">
                {job.currency} · salary range
              </p>
            )}
          </div>

          <div className="mt-5 space-y-2 lg:mt-0">
            {job.deadline && (
              <div className="flex items-center gap-2 text-[10px] text-[var(--df-muted)] lg:justify-end">
                <CalendarDays className="h-3.5 w-3.5" />

                <span>
                  Apply by {formatDate(job.deadline)}
                </span>
              </div>
            )}

            {job.createdAt && (
              <div className="flex items-center gap-2 text-[10px] text-[var(--df-muted)] lg:justify-end">
                <Clock3 className="h-3.5 w-3.5" />

                <span>
                  Posted {formatRelativeDate(job.createdAt)}
                </span>
              </div>
            )}
          </div>

          <Link
            href={`/dashboard/developer/jobs/${job.id}`}
            className="mt-5 inline-flex items-center justify-between gap-3 border border-[var(--df-line)] px-3 py-2.5 text-xs font-medium transition hover:border-[var(--df-text)] lg:mt-6"
          >
            View details

            <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
          <button
      type="button"
      disabled={jobSaved || loading}
      onClick={() => handleSaveJob(job.id)}
      className={`inline-flex items-center justify-between gap-2.5 px-3 py-2.5 text-xs font-medium transition ${
        jobSaved
          ? "cursor-default border border-[var(--df-line)] bg-transparent text-[var(--df-text)] opacity-80"
          : "cursor-pointer bg-[var(--df-text)] text-[var(--df-paper)] hover:opacity-90"
      }`}
    >
      <span>
        {loading
          ? "Saving..."
          : jobSaved
          ? "You already saved this"
          : "Save Job"}
      </span>

      {loading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : jobSaved ? (
        <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
      ) : (
        <Bookmark className="h-3.5 w-3.5 shrink-0" />
      )}
    </button>
        </div>
        {error && (
      <p className="text-[11px] text-red-500 font-medium">
        {typeof error === "string" ? error : "An error occurred"}
      </p>
    )}
      </div>
    </article>
  );
}

function Meta({ icon: Icon, value }) {
  return (
    <div className="flex items-center gap-2 text-xs text-[var(--df-muted)]">
      <Icon className="h-3.5 w-3.5" />

      <span>{value}</span>
    </div>
  );
}

function formatValue(value) {
  if (!value) return "Not specified";

  return value
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
}

function formatExperience(value) {
  return formatValue(value);
}

function formatDate(value) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function formatRelativeDate(value) {
  const date = new Date(value);
  const now = new Date();

  const diff =
    now.getTime() - date.getTime();

  const days = Math.floor(
    diff / (1000 * 60 * 60 * 24)
  );

  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 7) return `${days} days ago`;

  if (days < 30) {
    const weeks = Math.floor(days / 7);

    return `${weeks}w ago`;
  }

  const months = Math.floor(days / 30);

  return `${months}mo ago`;
}

function formatSalary(min, max, currency) {
  if (!min && !max) {
    return "Salary not listed";
  }

  const symbol =
    {
      USD: "$",
      EUR: "€",
      GBP: "£",
      PKR: "PKR ",
      INR: "₹",
      AED: "AED ",
    }[currency] || `${currency || ""} `;

  const format = (value) =>
    Number(value).toLocaleString("en-US");

  if (min && max) {
    return `${symbol}${format(min)} – ${symbol}${format(max)}`;
  }

  if (min) {
    return `${symbol}${format(min)}+`;
  }

  return `${symbol}${format(max)}`;
}
