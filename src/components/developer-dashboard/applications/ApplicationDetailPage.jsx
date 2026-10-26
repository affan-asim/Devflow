"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  BriefcaseBusiness,
  CalendarDays,
  ExternalLink,
  Globe2,
  MapPin,
} from "lucide-react";
import { useParams } from "next/navigation";

import ApplicationStatus from "./ApplicationStatus";
import ApplicationTimeline from "./ApplicationTimeline";
import ApplicationDocuments from "./ApplicationDocuments";
import { fetchDeveloperApplicationById,clearCurrentApplication } from "@/lib/redux/slices/applicationSlice";

function formatEnum(value) {
  if (!value) return "—";

  return value
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatDate(value) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
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

  return `${symbol}${Number(min).toLocaleString()} – ${symbol}${Number(
    max
  ).toLocaleString()}`;
}

export default function ApplicationDetailPage() {
  const params = useParams();
  const dispatch = useDispatch();

  const {
    currentApplication,
    loadingDetail,
    errorDetail,
  } = useSelector((state) => state.applications);

  useEffect(() => {
    if (!params?.id) return;

    dispatch(fetchDeveloperApplicationById(params.id));

    return () => {
      dispatch(clearCurrentApplication());
    };
  }, [dispatch, params?.id]);

  if (loadingDetail) {
    return (
      <main className="min-h-screen bg-[var(--df-paper)]">
        <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8 lg:px-10">
          <div className="h-5 w-28 animate-pulse bg-[var(--df-line)]" />
          <div className="mt-8 h-12 max-w-2xl animate-pulse bg-[var(--df-line)]" />
          <div className="mt-3 h-5 max-w-md animate-pulse bg-[var(--df-line)]" />
        </div>
        <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8 lg:px-10">
          <div className="h-5 w-28 animate-pulse bg-[var(--df-line)]" />
          <div className="mt-8 h-12 max-w-2xl animate-pulse bg-[var(--df-line)]" />
          <div className="mt-3 h-5 max-w-md animate-pulse bg-[var(--df-line)]" />
        </div>
        <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8 lg:px-10">
          <div className="h-5 w-28 animate-pulse bg-[var(--df-line)]" />
          <div className="mt-8 h-12 max-w-2xl animate-pulse bg-[var(--df-line)]" />
          <div className="mt-3 h-5 max-w-md animate-pulse bg-[var(--df-line)]" />
        </div>
      </main>
    );
  }

  if (errorDetail || !currentApplication) {
    return (
      <main className="min-h-screen bg-[var(--df-paper)]">
        <div className="mx-auto max-w-3xl px-5 py-20 text-center">
          <p className="text-2xl font-semibold tracking-tight">
            Application not found
          </p>

          <p className="mt-2 text-sm text-[var(--df-muted)]">
            {errorDetail ||
              "This application could not be loaded."}
          </p>

          <Link
            href="/dashboard/applications"
            className="mt-6 inline-flex h-11 items-center bg-[var(--df-text)] px-5 text-sm font-medium text-[var(--df-paper)]"
          >
            Back to applications
          </Link>
        </div>
      </main>
    );
  }

  const application = currentApplication;
  const job = application.job;
  const company = job?.company;
  const profile = application.developerProfile;

  console.log(application.resume, "-----------")

  return (
    <main className="min-h-screen bg-[var(--df-paper)]">
      <div className="mx-auto px-5 py-10 sm:px-8 sm:py-14 lg:px-10">
        {/* BACK */}
        <Link
          href="/dashboard/developer/applications"
          className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--df-muted)] hover:text-[var(--df-text)]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Applications
        </Link>

        {/* HERO */}
        <header className="mt-10 border-b border-[var(--df-line)] pb-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-3xl">
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--df-muted)]">
                {company?.name || "Company"}
              </p>

              <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
                {job?.title}
              </h1>

              <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs text-[var(--df-muted)]">
                <span>
                  Applied {formatDate(application.createdAt)}
                </span>

                <span>
                  Application #{application.id.slice(0, 8)}
                </span>
              </div>
            </div>

            <ApplicationStatus status={application.status} />
          </div>
        </header>

        {/* CONTENT */}
        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-6">
            <ApplicationTimeline
              status={application.status}
              createdAt={application.createdAt}
              rejectionReason={application.rejectionReason}
            />

            <ApplicationDocuments
              resume={application.resume}
              coverLetter={application.coverLetter}
            />

            {/* PROFILE */}
            <section className="border border-[var(--df-line)]">
              <div className="border-b border-[var(--df-line)] px-5 py-4 sm:px-6">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--df-muted)]">
                  Your profile
                </p>
              </div>

              <div className="p-5 sm:p-6">
                <div className="grid gap-5 sm:grid-cols-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.12em] text-[var(--df-muted)]">
                      Experience
                    </p>

                    <p className="mt-2 text-sm font-medium">
                      {profile?.yearsOfExp || 0} years
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] uppercase tracking-[0.12em] text-[var(--df-muted)]">
                      Preference
                    </p>

                    <p className="mt-2 text-sm font-medium">
                      {formatEnum(profile?.locationPreference)}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] uppercase tracking-[0.12em] text-[var(--df-muted)]">
                      Portfolio
                    </p>

                    {profile?.portfolioUrl ? (
                      <a
                        href={profile.portfolioUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium hover:underline"
                      >
                        Visit
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      <p className="mt-2 text-sm text-[var(--df-muted)]">
                        Not provided
                      </p>
                    )}
                  </div>
                </div>

                {profile?.bio && (
                  <div className="mt-6 border-t border-[var(--df-line)] pt-5">
                    <p className="text-[10px] uppercase tracking-[0.12em] text-[var(--df-muted)]">
                      Bio
                    </p>

                    <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--df-muted)]">
                      {profile.bio}
                    </p>
                  </div>
                )}

                {profile?.githubUrl && (
                  <a
                    href={profile.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-5 inline-flex items-center gap-2 text-xs font-medium hover:underline"
                  >
                    GitHub
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            </section>
          </div>

          {/* SIDEBAR */}
          <aside>
            <div className="space-y-4 lg:sticky lg:top-6">
              {/* ROLE */}
              <section className="border border-[var(--df-line)] p-5 sm:p-6">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--df-muted)]">
                  Role details
                </p>

                <h2 className="mt-3 text-xl font-semibold tracking-tight">
                  {job?.title}
                </h2>

                <p className="mt-1 text-xs text-[var(--df-muted)]">
                  {company?.name}
                </p>

                <div className="mt-6 space-y-4 border-t border-[var(--df-line)] pt-5">
                  <Detail
                    icon={BriefcaseBusiness}
                    label="Employment"
                    value={formatEnum(job?.employmentType)}
                  />

                  <Detail
                    icon={MapPin}
                    label="Location"
                    value={formatEnum(job?.locationPreference)}
                  />

                  <Detail
                    icon={Globe2}
                    label="Experience"
                    value={formatEnum(job?.experienceLevel)}
                  />

                  <Detail
                    icon={CalendarDays}
                    label="Deadline"
                    value={formatDate(job?.deadline)}
                  />
                </div>

                {formatSalary(
                  job?.minSalary,
                  job?.maxSalary,
                  job?.currency
                ) && (
                  <div className="mt-6 border-t border-[var(--df-line)] pt-5">
                    <p className="text-[10px] uppercase tracking-[0.12em] text-[var(--df-muted)]">
                      Compensation
                    </p>

                    <p className="mt-2 text-lg font-semibold">
                      {formatSalary(
                        job.minSalary,
                        job.maxSalary,
                        job.currency
                      )}
                    </p>
                  </div>
                )}

                <Link
                  href={`/dashboard/developer/jobs/${job.id}`}
                  className="group mt-6 flex h-11 items-center justify-between bg-[var(--df-text)] px-4 text-xs font-medium text-[var(--df-paper)] hover:opacity-90"
                >
                  <span>View job</span>

                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
              </section>

              {/* COMPANY */}
              <section className="border border-[var(--df-line)] p-5 sm:p-6">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--df-muted)]">
                  Company
                </p>

                <p className="mt-3 text-base font-semibold">
                  {company?.name}
                </p>

                <p className="mt-1 text-xs text-[var(--df-muted)]">
                  {company?.industry || "Technology"} ·{" "}
                  {company?.country}
                </p>

                {company?.websiteUrl && (
                  <a
                    href={company.websiteUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-5 inline-flex items-center gap-2 text-xs font-medium hover:underline"
                  >
                    Company website
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </a>
                )}
              </section>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

function Detail({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[var(--df-muted)]" />

      <div>
        <p className="text-[10px] uppercase tracking-[0.1em] text-[var(--df-muted)]">
          {label}
        </p>

        <p className="mt-1 text-xs font-medium">
          {value}
        </p>
      </div>
    </div>
  );
}