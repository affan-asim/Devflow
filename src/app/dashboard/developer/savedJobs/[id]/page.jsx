"use client";

import Link from "next/link";
import { use, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  fetchSavedJobById,
  deleteSavedJob,
  clearCurrentSavedJob,
  clearSavedJobErrors,
} from "@/lib/redux/slices/savedJobSlice";

const formatDate = (date) => {
  if (!date) return "—";

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
};

const formatEnum = (value) => {
  if (!value) return "—";

  return value
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const formatSalary = (job) => {
  if (job?.minSalary == null && job?.maxSalary == null) {
    return "Salary not specified";
  }

  const formatter = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  });

  const currency = job.currency || "";

  const min =
    job.minSalary != null
      ? formatter.format(Number(job.minSalary))
      : null;

  const max =
    job.maxSalary != null
      ? formatter.format(Number(job.maxSalary))
      : null;

  if (min && max) {
    return `${currency} ${min} — ${max}`;
  }

  if (min) {
    return `${currency} ${min}+`;
  }

  return `${currency} ${max}`;
};

const formatLocation = (value) => {
  if (!value) return "Location not specified";

  return value
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

function DetailSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-3 w-24 bg-[var(--df-line)]" />
      <div className="mt-5 h-12 w-3/4 bg-[var(--df-line)]" />
      <div className="mt-4 h-5 w-1/3 bg-[var(--df-line)]" />

      <div className="mt-12 h-5 w-32 bg-[var(--df-line)]" />
      <div className="mt-5 h-4 w-full bg-[var(--df-line)]" />
      <div className="mt-2 h-4 w-full bg-[var(--df-line)]" />
      <div className="mt-2 h-4 w-4/5 bg-[var(--df-line)]" />
    </div>
  );
}

export default function SavedJobDetailPage({ params }) {
  const { id } = use(params);

  const dispatch = useDispatch();

  const {
    currentSavedJob,
    loadingDetail,
    submitting,
    errorDetail,
    submitError,
  } = useSelector((state) => state.savedJobs);

  useEffect(() => {
    dispatch(clearCurrentSavedJob());
    dispatch(fetchSavedJobById(id));

    return () => {
      dispatch(clearCurrentSavedJob());
      dispatch(clearSavedJobErrors());
    };
  }, [dispatch, id]);

  const handleRemove = async () => {
    const result = await dispatch(deleteSavedJob(id));

    if (deleteSavedJob.fulfilled.match(result)) {
      window.location.href = "/dashboard/developer/savedJobs";
    }
  };

  if (loadingDetail) {
    return (
      <main className="min-h-screen bg-[var(--df-paper)] text-[var(--df-text)]">
        <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-10 lg:py-14">
          <Link
            href="/dashboard/developer/savedJobs"
            className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--df-muted)] hover:text-[var(--df-text)]"
          >
            ← Saved jobs
          </Link>

          <div className="mt-12 max-w-4xl">
            <DetailSkeleton />
          </div>
        </div>
      </main>
    );
  }

  if (errorDetail || !currentSavedJob) {
    return (
      <main className="min-h-screen bg-[var(--df-paper)] text-[var(--df-text)]">
        <div className="mx-auto max-w-3xl px-5 py-10 sm:px-8 lg:px-10 lg:py-14">
          <Link
            href="/dashboard/developer/savedJobs"
            className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--df-muted)]"
          >
            ← Saved jobs
          </Link>

          <div className="mt-12 border-y border-[var(--df-line)] py-12">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-red-600">
              Saved job
            </p>

            <h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em]">
              Saved job not found
            </h1>

            <p className="mt-4 text-sm leading-6 text-[var(--df-muted)]">
              {errorDetail ||
                "This saved job may have been removed or is no longer available."}
            </p>

            <Link
              href="/dashboard/developer/savedJobs"
              className="mt-7 inline-flex h-10 items-center border border-[var(--df-text)] bg-[var(--df-text)] px-5 text-xs font-semibold uppercase tracking-[0.12em] text-white"
            >
              Back to saved jobs
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const job = currentSavedJob.savedJob.job;
  const company = job?.company;
  const deadlinePassed =
    job?.deadline &&
    new Date(job.deadline).getTime() < Date.now();

  const isUnavailable =
    job?.status === "CLOSED" ||
    job?.status === "EXPIRED" ||
    deadlinePassed;

  const application = currentSavedJob.application;

  return (
    <main className="min-h-screen bg-[var(--df-paper)] text-[var(--df-text)]">
      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-10 lg:py-14">

        {/* Back */}
        <Link
          href="/dashboard/developer/savedJobs"
          className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--df-muted)] transition-colors hover:text-[var(--df-text)]"
        >
          ← Saved jobs
        </Link>

        {/* Hero */}
        <header className="mt-10 border-b border-[var(--df-line)] pb-10">
          <div className="max-w-4xl">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--df-muted)]">
              <span>Saved {formatDate(job.createdAt)}</span>

              {job?.isFeatured && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="text-[var(--df-text)]">
                    Featured
                  </span>
                </>
              )}

              {isUnavailable && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="text-red-600">
                    No longer active
                  </span>
                </>
              )}
            </div>

            <h1 className="mt-5 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl lg:text-6xl">
              {job?.title}
            </h1>

            <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-[var(--df-muted)]">
              <span>{company?.name || "Unknown company"}</span>

              {company?.isVerified && (
                <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--df-text)]">
                  Verified
                </span>
              )}
            </div>
          </div>
        </header>

        {/* Main */}
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-20">

          {/* Job content */}
          <article className="max-w-4xl py-10">

            <section>
              <h2 className="text-xs font-semibold uppercase tracking-[0.15em]">
                About the role
              </h2>

              <div className="mt-6 whitespace-pre-wrap text-sm leading-7 text-[var(--df-muted)]">
                {job?.description || "No description available."}
              </div>
            </section>

            {/* Skills */}
            {job?.skills?.length > 0 && (
              <section className="mt-12 border-t border-[var(--df-line)] pt-10">
                <h2 className="text-xs font-semibold uppercase tracking-[0.15em]">
                  Skills
                </h2>

                <div className="mt-5 flex flex-wrap gap-2">
                  {job.skills.map((skill) => (
                    <span
                      key={skill.id}
                      className="border border-[var(--df-line)] px-3 py-2 text-xs"
                    >
                      {skill.name}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Job information */}
            <section className="mt-12 border-t border-[var(--df-line)] pt-10">
              <h2 className="text-xs font-semibold uppercase tracking-[0.15em]">
                Job details
              </h2>

              <dl className="mt-6 grid border-t border-[var(--df-line)] sm:grid-cols-2">
                <div className="border-b border-[var(--df-line)] py-5 sm:border-r sm:pr-8">
                  <dt className="text-[10px] font-semibold uppercase tracking-[0.13em] text-[var(--df-muted)]">
                    Employment
                  </dt>
                  <dd className="mt-2 text-sm">
                    {formatEnum(job?.employmentType)}
                  </dd>
                </div>

                <div className="border-b border-[var(--df-line)] py-5 sm:pl-8">
                  <dt className="text-[10px] font-semibold uppercase tracking-[0.13em] text-[var(--df-muted)]">
                    Experience
                  </dt>
                  <dd className="mt-2 text-sm">
                    {formatEnum(job?.experienceLevel)}
                  </dd>
                </div>

                <div className="border-b border-[var(--df-line)] py-5 sm:border-r sm:pr-8">
                  <dt className="text-[10px] font-semibold uppercase tracking-[0.13em] text-[var(--df-muted)]">
                    Location
                  </dt>
                  <dd className="mt-2 text-sm">
                    {formatLocation(job?.locationPreference)}
                  </dd>
                </div>

                <div className="border-b border-[var(--df-line)] py-5 sm:pl-8">
                  <dt className="text-[10px] font-semibold uppercase tracking-[0.13em] text-[var(--df-muted)]">
                    Salary
                  </dt>
                  <dd className="mt-2 text-sm">
                    {formatSalary(job)}
                  </dd>
                </div>

                <div className="border-b border-[var(--df-line)] py-5 sm:border-r sm:pr-8">
                  <dt className="text-[10px] font-semibold uppercase tracking-[0.13em] text-[var(--df-muted)]">
                    Published
                  </dt>
                  <dd className="mt-2 text-sm">
                    {formatDate(job?.publishedAt)}
                  </dd>
                </div>

                <div className="border-b border-[var(--df-line)] py-5 sm:pl-8">
                  <dt className="text-[10px] font-semibold uppercase tracking-[0.13em] text-[var(--df-muted)]">
                    Deadline
                  </dt>
                  <dd className="mt-2 text-sm">
                    {formatDate(job?.deadline)}
                  </dd>
                </div>
              </dl>
            </section>

            {/* Company */}
            <section className="mt-12 border-t border-[var(--df-line)] pt-10">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-xs font-semibold uppercase tracking-[0.15em]">
                    Company
                  </h2>

                  <h3 className="mt-4 text-2xl font-semibold tracking-[-0.025em]">
                    {company?.name}
                  </h3>

                  <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-sm text-[var(--df-muted)]">
                    <span>{formatEnum(company?.industry)}</span>
                    <span>·</span>
                    <span>{formatEnum(company?.country)}</span>
                  </div>
                </div>

                {company?.isVerified && (
                  <span className="text-[10px] font-semibold uppercase tracking-[0.14em]">
                    Verified company
                  </span>
                )}
              </div>
            </section>
          </article>

          {/* Sidebar */}
          <aside className="border-t border-[var(--df-line)] py-10 lg:border-t-0 lg:border-l lg:pl-8">

            <div className="lg:sticky lg:top-8">

              {submitError && (
                <div className="mb-5 border border-red-200 bg-red-50 px-4 py-3 text-xs leading-5 text-red-700">
                  {submitError}
                </div>
              )}

              {/* Primary action */}
              {application?.status ? (
                <div className="border border-[var(--df-line)] px-4 py-4 text-xs leading-5 text-[var(--df-muted)]">
                  You already applied to this job
                </div>
              ) : !isUnavailable ? (
                <Link
                  href={`/dashboard/developer/jobs/${job.id}/apply`}
                  className="flex h-11 w-full items-center justify-center bg-[var(--df-text)] px-5 text-xs font-semibold uppercase tracking-[0.13em] text-white transition-opacity hover:opacity-85"
                >
                  Apply for this job
                </Link>
              ) : (
                <div className="border border-[var(--df-line)] px-4 py-4 text-xs leading-5 text-[var(--df-muted)]">
                  This job is no longer accepting applications.
                </div>
              )}

              <button
                type="button"
                disabled={submitting}
                onClick={handleRemove}
                className="mt-3 flex h-11 w-full items-center justify-center border border-[var(--df-line)] px-5 text-xs font-semibold uppercase tracking-[0.13em] transition-colors hover:border-red-300 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? "Removing..." : "Remove from saved"}
              </button>

              <div className="mt-8 border-t border-[var(--df-line)] pt-6">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--df-muted)]">
                  Saved
                </p>

                <p className="mt-2 text-sm">
                  {formatDate(job.createdAt)}
                </p>
              </div>

              <div className="mt-6 border-t border-[var(--df-line)] pt-6">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--df-muted)]">
                  Job ID
                </p>

                <p className="mt-2 break-all text-xs text-[var(--df-muted)]">
                  {job?.id}
                </p>
              </div>

              <Link
                href={`/dashboard/developer/jobs/${job.id}`}
                className="mt-8 block text-center text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--df-muted)] hover:text-[var(--df-text)]"
              >
                Open original job →
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
