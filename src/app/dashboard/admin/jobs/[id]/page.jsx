"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowLeft,
  ArrowUpRight,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock3,
  ExternalLink,
  FileText,
  Globe,
  MapPin,
  Star,
  Users,
  Wallet,
} from "lucide-react";

import {
  fetchJobByAdmin,
  updateJobFeaturedStatus,
  clearCurrentJob,
} from "@/lib/redux/slices/jobSlice";

function dateLabel(value, withTime = false) {
  if (!value) return "Not provided";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not provided";

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    ...(withTime ? { timeStyle: "short" } : {}),
  }).format(date);
}

function salaryLabel(job) {
  const { minSalary, maxSalary, currency = "USD" } = job;

  if (minSalary == null && maxSalary == null) return "Not specified";

  const format = (value) =>
    value == null
      ? null
      : new Intl.NumberFormat("en", {
          notation: "compact",
          maximumFractionDigits: 1,
        }).format(value);

  if (minSalary != null && maxSalary != null) {
    return `${currency} ${format(minSalary)} – ${format(maxSalary)}`;
  }

  return `${currency} ${format(minSalary ?? maxSalary)}+`;
}

function Pill({ children, accent = false }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 text-[10px] font-bold uppercase tracking-[.12em] ${
        accent
          ? "bg-[var(--df-accent)] text-[var(--df-black)]"
          : "bg-[var(--df-paper-2)] text-[var(--df-text)]"
      }`}
    >
      {children}
    </span>
  );
}

function Section({ eyebrow, title, children, action }) {
  return (
    <section className="border border-[var(--df-line)] bg-[var(--df-paper)]">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[var(--df-line)] px-5 py-4 sm:px-6">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[.18em] text-[var(--df-muted)]">{eyebrow}</p>
          <h2 className="mt-1 text-lg font-semibold tracking-[-.03em] text-[var(--df-text-strong)]">{title}</h2>
        </div>
        {action}
      </div>
      <div className="p-5 sm:p-6">{children}</div>
    </section>
  );
}

function Fact({ label, value, icon: Icon, href }) {
  return (
    <div className="min-w-0 border-b border-[var(--df-line)] py-3 last:border-b-0">
      <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.13em] text-[var(--df-muted)]">
        {Icon && <Icon size={13} />} {label}
      </p>
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="mt-2 inline-flex max-w-full items-center gap-1 break-all text-sm font-medium text-[var(--df-text-strong)] underline underline-offset-4"
        >
          {value || "Not provided"} <ExternalLink size={12} />
        </a>
      ) : (
        <p className="mt-2 break-words text-sm font-medium text-[var(--df-text-strong)]">
          {value || "Not provided"}
        </p>
      )}
    </div>
  );
}

function ApplicationMetric({ label, value }) {
  return (
    <div className="border border-[var(--df-line)] p-4">
      <p className="text-xs text-[var(--df-muted)]">{label}</p>
      <p className="mt-3 text-2xl font-semibold tracking-[-.04em] text-[var(--df-text-strong)]">
        {Number(value || 0).toLocaleString()}
      </p>
    </div>
  );
}

export default function AdminJobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useDispatch();

  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const {
    jobs = [],
    currentJob,
    loadingDetail,
    submitting,
    errorDetail,
    submitError,
  } = useSelector((state) => state.jobs);

  const [hasAttemptedFetch, setHasAttemptedFetch] = useState(false);
  const [notice, setNotice] = useState("");

  const fallbackJob = useMemo(
    () => jobs.find((item) => item.id === id) || null,
    [jobs, id]
  );
  const job = (currentJob?.id === id ? currentJob : null) || fallbackJob;

  useEffect(() => {
    if (!id) return;

    let isMounted = true;
    const promise = dispatch(fetchJobByAdmin(id));

    promise.finally(() => {
      if (isMounted) {
        setHasAttemptedFetch(true);
      }
    });

    return () => {
      isMounted = false;
      promise.abort?.();
    };
  }, [dispatch, id]);

  useEffect(() => {
    return () => {
      dispatch(clearCurrentJob());
    };
  }, [dispatch]);

  const toggleFeatured = async () => {
    if (!job) return;

    setNotice("");

    const result = await dispatch(
      updateJobFeaturedStatus({
        jobId: job.id,
        isFeatured: !job.isFeatured,
      })
    );

    if (updateJobFeaturedStatus.fulfilled.match(result)) {
      setNotice(
        `Featured status ${job.isFeatured ? "removed" : "enabled"} successfully.`
      );
      if (id) {
        dispatch(fetchJobByAdmin(id));
      }
    }
  };

  const isLoading = (loadingDetail || !hasAttemptedFetch) && !job;

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[var(--df-paper)] px-4 py-12 sm:px-8">
        <div className="mx-auto max-w-[1200px] animate-pulse">
          <div className="h-4 w-32 bg-[var(--df-paper-3)]" />
          <div className="mt-8 h-12 max-w-lg bg-[var(--df-paper-3)]" />
          <div className="mt-8 h-64 bg-[var(--df-paper-2)]" />
        </div>
      </main>
    );
  }

  if (!job) {
    return (
      <main className="min-h-screen bg-[var(--df-paper)] px-4 py-12 sm:px-8">
        <div className="mx-auto max-w-[800px] border border-[var(--df-line)] p-6 sm:p-10">
          <p className="text-[10px] font-bold uppercase tracking-[.18em] text-[var(--df-muted)]">Admin / Jobs</p>
          <h1 className="mt-4 text-3xl font-semibold tracking-[-.05em]">Job unavailable.</h1>
          <p className="mt-3 text-sm text-[var(--df-muted)]">
            {errorDetail || "The job could not be loaded or no longer exists."}
          </p>
          <Link href="/dashboard/admin/jobs" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold underline underline-offset-4">
            <ArrowLeft size={15} /> Back to jobs
          </Link>
        </div>
      </main>
    );
  }

  const applications = job.applicationStats || {};
  const breakdown = applications.breakdown || {};
  const companyOwner = job.company?.owner?.user;
  const recruiterUser = job.recruiter?.user;

  return (
    <main className="min-h-screen bg-[var(--df-paper)] text-[var(--df-text)]">
      <div className="mx-auto max-w-[1440px] px-4 py-7 sm:px-6 lg:px-10 lg:py-10">
        <Link
          href="/dashboard/admin/jobs"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--df-muted)] transition hover:text-[var(--df-text)]"
        >
          <ArrowLeft size={15} /> Back to job directory
        </Link>

        <header className="mt-7 border-b border-[var(--df-line)] pb-7">
          <div className="flex flex-col justify-between gap-6 xl:flex-row xl:items-start">
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[.2em] text-[var(--df-muted)]">
                Job review / {job.id}
              </p>
              <h1 className="mt-3 max-w-4xl break-words text-4xl font-semibold tracking-[-.06em] text-[var(--df-text-strong)] sm:text-5xl">
                {job.title}
                <span className="text-[var(--df-muted)]">.</span>
              </h1>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <Pill accent={job.status === "ACTIVE"}>{job.status || "Unknown status"}</Pill>
                <Pill>{String(job.employmentType || "Unspecified").replaceAll("_", " ")}</Pill>
                {job.experienceLevel && <Pill>{String(job.experienceLevel).replaceAll("_", " ")}</Pill>}
                {job.isFeatured && <Pill accent>Featured</Pill>}
              </div>

              <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs text-[var(--df-muted)]">
                <span className="inline-flex items-center gap-1.5"><Building2 size={14} /> {job.company?.name || "Company unavailable"}</span>
                <span className="inline-flex items-center gap-1.5"><MapPin size={14} /> {job.locationPreference || "Location not specified"}</span>
                <span className="inline-flex items-center gap-1.5"><CalendarDays size={14} /> Created {dateLabel(job.createdAt)}</span>
              </div>
            </div>

            <div className="flex shrink-0 flex-wrap gap-2">
              <button
                type="button"
                onClick={toggleFeatured}
                disabled={submitting}
                className="inline-flex items-center gap-2 border border-[var(--df-line)] px-4 py-3 text-sm disabled:opacity-50"
              >
                <Star size={15} fill={job.isFeatured ? "currentColor" : "none"} />
                {job.isFeatured ? "Remove featured" : "Feature job"}
              </button>
            </div>
          </div>
        </header>

        {notice && <div role="status" className="mt-5 border border-[var(--df-line)] px-4 py-3 text-sm">{notice}</div>}
        {submitError && <div role="alert" className="mt-5 border border-red-300 px-4 py-3 text-sm text-red-700">{String(submitError)}</div>}

        <div className="grid gap-5 py-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,.8fr)]">
          <div className="space-y-5">
            <Section eyebrow="01 / Overview" title="Job description">
              {job.description ? (
                <div className="whitespace-pre-wrap break-words text-sm leading-7 text-[var(--df-text)]">
                  {job.description}
                </div>
              ) : (
                <p className="text-sm text-[var(--df-muted)]">No description was provided.</p>
              )}

              {job.requirements && (
                <div className="mt-7 border-t border-[var(--df-line)] pt-5">
                  <h3 className="mb-3 text-sm font-semibold">Requirements</h3>
                  <div className="whitespace-pre-wrap break-words text-sm leading-7 text-[var(--df-muted)]">
                    {job.requirements}
                  </div>
                </div>
              )}

              {job.responsibilities && (
                <div className="mt-7 border-t border-[var(--df-line)] pt-5">
                  <h3 className="mb-3 text-sm font-semibold">Responsibilities</h3>
                  <div className="whitespace-pre-wrap break-words text-sm leading-7 text-[var(--df-muted)]">
                    {job.responsibilities}
                  </div>
                </div>
              )}
            </Section>

            <Section eyebrow="02 / Skills" title="Required skills">
              {job.skills?.length ? (
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill, index) => {
                    const label = typeof skill === "string"
                      ? skill
                      : skill.name || skill.title || skill.skill?.name || `Skill ${index + 1}`;

                    return (
                      <span key={skill.id || `${label}-${index}`} className="border border-[var(--df-line)] px-3 py-2 text-xs">
                        {label}
                      </span>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-[var(--df-muted)]">No skills are attached to this job.</p>
              )}
            </Section>

            <Section eyebrow="03 / Hiring activity" title="Application overview">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <ApplicationMetric label="Total applications" value={applications.total ?? job._count?.applications ?? 0} />
                <ApplicationMetric label="Pending" value={breakdown.PENDING} />
                <ApplicationMetric label="In review" value={breakdown.REVIEW} />
                <ApplicationMetric label="Accepted" value={breakdown.ACCEPTED} />
                <ApplicationMetric label="Rejected" value={breakdown.REJECTED} />
                <ApplicationMetric label="Saved" value={job._count?.savedBy ?? 0} />
              </div>
              <p className="mt-4 text-xs leading-5 text-[var(--df-muted)]">
                Counts reflect the data available from the admin API. If your application workflow uses additional statuses, include them in the service response.
              </p>
            </Section>
          </div>

          <aside className="space-y-5">
            <Section eyebrow="04 / Compensation" title="Job facts">
              <Fact label="Salary range" value={salaryLabel(job)} icon={Wallet} />
              <Fact label="Location preference" value={job.locationPreference} icon={MapPin} />
              <Fact label="Experience level" value={job.experienceLevel?.replaceAll("_", " ")} icon={Users} />
              <Fact label="Employment type" value={job.employmentType?.replaceAll("_", " ")} icon={BriefcaseBusiness} />
              <Fact label="Deadline" value={dateLabel(job.deadline)} icon={Clock3} />
              <Fact label="Published at" value={dateLabel(job.publishedAt, true)} icon={CalendarDays} />
              <Fact label="Created at" value={dateLabel(job.createdAt, true)} icon={CalendarDays} />
              <Fact label="Last updated" value={dateLabel(job.updatedAt, true)} icon={Clock3} />
            </Section>

            <Section eyebrow="05 / Organization" title={job.company?.name || "Company"}>
              {job.company?.logo && (
                <div className="mb-4 flex h-16 w-16 items-center justify-center border border-[var(--df-line)] bg-[var(--df-paper-2)] p-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={job.company.logo} alt="" className="max-h-full max-w-full object-contain" />
                </div>
              )}

              <Fact label="Company name" value={job.company?.name} icon={Building2} />
              <Fact label="Industry" value={job.company?.industry} />
              <Fact label="Country" value={job.company?.country} />
              <Fact label="Verification" value={job.company?.isVerified ? "Verified" : "Not verified"} icon={CheckCircle2} />
              <Fact label="Website" value={job.company?.websiteUrl} href={job.company?.websiteUrl} icon={Globe} />
              <Fact label="Company owner" value={companyOwner?.name} />
              <Fact label="Owner email" value={companyOwner?.email} href={companyOwner?.email ? `mailto:${companyOwner.email}` : undefined} />
            </Section>

            <Section eyebrow="06 / Posting account" title="Recruiter">
              <Fact label="Recruiter name" value={recruiterUser?.name} icon={Users} />
              <Fact label="Recruiter email" value={recruiterUser?.email} href={recruiterUser?.email ? `mailto:${recruiterUser.email}` : undefined} />
              <Fact label="Recruiter ID" value={job.recruiter?.id} />
              <Fact label="Company ID" value={job.companyId} />
              <Fact label="Job ID" value={job.id} />
            </Section>

            <Section eyebrow="07 / Record" title="Technical metadata">
              <Fact label="Recruiter ID" value={job.recruiterId} />
              <Fact label="Company ID" value={job.companyId} />
              <Fact label="Created" value={dateLabel(job.createdAt, true)} />
              <Fact label="Updated" value={dateLabel(job.updatedAt, true)} />
              <Fact label="Featured" value={job.isFeatured ? "Yes" : "No"} icon={Star} />
            </Section>
          </aside>
        </div>
      </div>

    </main>
  );
}