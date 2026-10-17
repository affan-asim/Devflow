"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  Bookmark,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  Code2,
  ExternalLink,
  Globe2,
  Loader2,
  MapPin,
  ShieldCheck,
  Sparkles,
  UserRound,
  Wallet,
} from "lucide-react";
import { useDispatch } from "react-redux";

import ApplyJobModal from "@/components/developer-dashboard/applications/ApplyJobModal";
import { saveJob } from "@/lib/redux/slices/savedJobSlice";

const cx = (...classes) => classes.filter(Boolean).join(" ");

function formatValue(value) {
  if (!value) return "Not specified";

  return String(value)
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatDate(value) {
  if (!value) return "Not specified";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Not specified";

  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatSalary(value, currency) {
  if (value === null || value === undefined || value === "") return null;

  const amount = Number(value);

  if (!Number.isFinite(amount)) return String(value);

  try {
    return new Intl.NumberFormat("en", {
      style: "currency",
      currency: currency || "USD",
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency || ""} ${amount.toLocaleString()}`.trim();
  }
}

function getRecruiterName(recruiter) {
  return (
    recruiter?.user?.name ||
    recruiter?.name ||
    recruiter?.userName ||
    "Hiring recruiter"
  );
}

function getExternalUrl(url) {
  if (!url) return null;

  const value = String(url).trim();

  if (!value) return null;

  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}

function Section({ number, title, description, children, className }) {
  return (
    <section className={cx("border-t border-[var(--df-line)] py-8 sm:py-10", className)}>
      <div className="mb-6 flex gap-4">
        <span className="pt-1 text-[10px] font-semibold tabular-nums tracking-[0.14em] text-[var(--df-muted)]">
          {number}
        </span>

        <div className="min-w-0">
          <h2 className="text-xl font-semibold tracking-[-0.035em] sm:text-2xl">
            {title}
          </h2>

          {description && (
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--df-muted)]">
              {description}
            </p>
          )}
        </div>
      </div>

      {children}
    </section>
  );
}

function DetailRow({ icon: Icon, label, value, last = false }) {
  if (value === null || value === undefined || value === "") return null;

  return (
    <div
      className={cx(
        "flex items-start justify-between gap-4 py-4",
        !last && "border-b border-[var(--df-line)]"
      )}
    >
      <div className="flex min-w-0 items-center gap-2.5 text-sm text-[var(--df-muted)]">
        {Icon && <Icon className="h-4 w-4 shrink-0" />}
        <span>{label}</span>
      </div>

      <span className="max-w-[58%] break-words text-right text-sm font-medium">
        {value}
      </span>
    </div>
  );
}

function Tag({ children, accent = false }) {
  return (
    <span
      className={cx(
        "inline-flex items-center border px-2.5 py-1.5 text-[10px] font-medium",
        accent
          ? "border-[var(--df-accent)] bg-[var(--df-accent)]/[0.08] text-[var(--df-text)]"
          : "border-[var(--df-line)] text-[var(--df-muted)]"
      )}
    >
      {children}
    </span>
  );
}

function CompanyLogo({ company, size = "large" }) {
  const sizeClass =
    size === "small" ? "h-10 w-10" : "h-16 w-16";

  return (
    <div
      className={cx(
        "flex shrink-0 items-center justify-center overflow-hidden border border-[var(--df-line)] bg-[var(--df-paper)]",
        sizeClass
      )}
    >
      {company?.logo ? (
        <img
          src={company.logo}
          alt={`${company?.name || "Company"} logo`}
          className="h-full w-full object-cover"
        />
      ) : (
        <Building2 className="h-6 w-6 text-[var(--df-muted)]" />
      )}
    </div>
  );
}

export default function JobDetail({ job }) {
  const dispatch = useDispatch();

  const [applyOpen, setApplyOpen] = useState(false);
  const [jobSaved, setJobSaved] = useState(
    Boolean(job?.isSaved || job?.savedBy?.length)
  );
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState("");

  const company = job?.company;
  const recruiter = job?.recruiter;

  const hasApplied = Boolean(
    job?.hasApplied || job?.applications?.length
  );

  const isExpired = job?.deadline
    ? new Date(job.deadline).getTime() < Date.now()
    : false;

  const isClosed =
    job?.status === "CLOSED" ||
    job?.status === "EXPIRED" ||
    isExpired;

  const skillsByCategory = useMemo(() => {
    const skills = Array.isArray(job?.skills) ? job.skills : [];

    return skills.reduce((groups, skill) => {
      const category = formatValue(skill.category || "OTHER");

      if (!groups[category]) groups[category] = [];
      groups[category].push(skill);

      return groups;
    }, {});
  }, [job?.skills]);

  const salaryMin = formatSalary(job?.minSalary, job?.currency);
  const salaryMax = formatSalary(job?.maxSalary, job?.currency);

  const salaryRange =
    salaryMin && salaryMax
      ? `${salaryMin} – ${salaryMax}`
      : salaryMin || salaryMax || "Compensation not listed";

  const deadlineText = isExpired
    ? "Application deadline has passed"
    : job?.deadline
      ? `Apply before ${formatDate(job.deadline)}`
      : "No deadline provided";

  async function handleSaveJob() {
    if (jobSaved || saveLoading || !job?.id) return;

    try {
      setSaveLoading(true);
      setSaveError("");

      await dispatch(saveJob(job.id)).unwrap();
      setJobSaved(true);
    } catch (error) {
      setSaveError(
        error?.error || error?.message || "Couldn't save this job. Please try again."
      );
    } finally {
      setSaveLoading(false);
    }
  }

  if (!job) {
    return (
      <div className="mx-auto max-w-5xl px-5 py-16 sm:px-8">
        <p className="text-sm text-[var(--df-muted)]">
          This job could not be loaded.
        </p>
        <Link
          href="/dashboard/developer/jobs"
          className="mt-4 inline-flex items-center gap-2 text-sm font-medium underline underline-offset-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to jobs
        </Link>
      </div>
    );
  }

  return (
    <article className="mx-auto w-full max-w-[1440px] px-4 pb-16 pt-5 sm:px-7 sm:pt-8 lg:px-10">
      <Link
        href="/dashboard/developer/jobs"
        className="inline-flex items-center gap-2 text-xs font-medium text-[var(--df-muted)] transition hover:text-[var(--df-text)]"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to jobs
      </Link>

      {/* Job introduction */}
      <header className="mt-7 border border-[var(--df-line)]">
        <div className="p-5 sm:p-8 lg:p-10">
          <div className="flex flex-wrap items-center gap-2">
            {job.isFeatured && (
              <Tag accent>
                <span className="inline-flex items-center gap-1.5">
                  <Sparkles className="h-3 w-3" />
                  Featured opportunity
                </span>
              </Tag>
            )}

            <Tag>{formatValue(job.status || "ACTIVE")}</Tag>
            <Tag>{formatValue(job.employmentType)}</Tag>
            <Tag>{formatValue(job.locationPreference)}</Tag>
            <Tag>{formatValue(job.experienceLevel)}</Tag>
          </div>

          <div className="mt-7 grid gap-7 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.17em] text-[var(--df-muted)]">
                Opportunity at {company?.name || "the hiring company"}
              </p>

              <h1 className="mt-3 max-w-4xl break-words text-3xl font-semibold leading-[1.08] tracking-[-0.055em] sm:text-4xl lg:text-5xl">
                {job.title || "Untitled position"}
              </h1>

              <div className="mt-6 flex items-center gap-3.5">
                <CompanyLogo company={company} size="small" />

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-sm font-semibold">
                      {company?.name || "Company not specified"}
                    </h2>

                    {company?.isVerified && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-medium">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Verified
                      </span>
                    )}
                  </div>

                  <p className="mt-1 text-xs text-[var(--df-muted)]">
                    {[formatValue(company?.industry), formatValue(company?.country)]
                      .filter((value) => value !== "Not specified")
                      .join(" · ") || "Company information"}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-[var(--df-line)] pt-5 lg:min-w-[210px] lg:border-l lg:border-t-0 lg:pl-7 lg:pt-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--df-muted)]">
                Salary range
              </p>
              <p className="mt-2 break-words text-xl font-semibold tracking-[-0.04em] sm:text-2xl">
                {salaryRange}
              </p>
              <p className="mt-2 text-xs text-[var(--df-muted)]">
                {job.minSalary != null || job.maxSalary != null
                  ? "As listed by the employer"
                  : "Ask the recruiter for details"}
              </p>
            </div>
          </div>
        </div>

        <div className="grid border-t border-[var(--df-line)] sm:grid-cols-2 lg:grid-cols-4">
          <HeroItem
            icon={MapPin}
            label="Work arrangement"
            value={formatValue(job.locationPreference)}
          />
          <HeroItem
            icon={BriefcaseBusiness}
            label="Employment"
            value={formatValue(job.employmentType)}
            border
          />
          <HeroItem
            icon={Code2}
            label="Experience"
            value={formatValue(job.experienceLevel)}
            border
          />
          <HeroItem
            icon={CalendarDays}
            label="Published"
            value={formatDate(job.publishedAt || job.createdAt)}
            border
          />
        </div>
      </header>

      {/* Main content and application card */}
      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-12">
        <div className="min-w-0">
          <Section
            number="01"
            title="About the role"
            description="Read the role description and what the employer has shared about this opportunity."
            className="border-t-0 pt-0"
          >
            {job.description ? (
              <div className="whitespace-pre-line break-words text-sm leading-7 text-[var(--df-muted)]">
                {job.description}
              </div>
            ) : (
              <p className="text-sm text-[var(--df-muted)]">
                The employer hasn't added a job description yet.
              </p>
            )}
          </Section>

          <Section
            number="02"
            title="Skills & technologies"
            description="Skills associated with this job posting."
          >
            {Object.keys(skillsByCategory).length ? (
              <div className="space-y-6">
                {Object.entries(skillsByCategory).map(([category, skills]) => (
                  <div key={category}>
                    <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.13em] text-[var(--df-muted)]">
                      {category}
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {skills.map((skill) => (
                        <span
                          key={skill.id || skill.name}
                          className="inline-flex items-center gap-2 border border-[var(--df-line)] px-3 py-2 text-xs font-medium"
                        >
                          <span className="h-1.5 w-1.5 bg-[var(--df-accent)]" />
                          {skill.name}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="border border-dashed border-[var(--df-line)] p-5">
                <p className="text-sm font-medium">No skills listed</p>
                <p className="mt-1 text-xs leading-5 text-[var(--df-muted)]">
                  The employer hasn't attached any skills to this posting.
                </p>
              </div>
            )}
          </Section>

          <Section
            number="03"
            title="Job details"
            description="A quick reference for the terms and timeline of this position."
          >
            <div className="border-y border-[var(--df-line)]">
              <DetailRow
                icon={BriefcaseBusiness}
                label="Employment type"
                value={formatValue(job.employmentType)}
              />
              <DetailRow
                icon={MapPin}
                label="Work arrangement"
                value={formatValue(job.locationPreference)}
              />
              <DetailRow
                icon={Code2}
                label="Experience level"
                value={formatValue(job.experienceLevel)}
              />
              <DetailRow
                icon={Wallet}
                label="Minimum salary"
                value={salaryMin}
              />
              <DetailRow
                icon={Wallet}
                label="Maximum salary"
                value={salaryMax}
              />
              <DetailRow
                icon={Globe2}
                label="Salary currency"
                value={job.currency}
              />
              <DetailRow
                icon={CalendarDays}
                label="Published on"
                value={formatDate(job.publishedAt || job.createdAt)}
              />
              <DetailRow
                icon={Clock3}
                label="Last updated"
                value={formatDate(job.updatedAt)}
              />
              <DetailRow
                icon={CalendarDays}
                label="Application deadline"
                value={formatDate(job.deadline)}
                last
              />
            </div>
          </Section>

          {company && (
            <Section
              number="04"
              title="About the company"
              description="Learn more about the organization behind this opportunity."
            >
              <div className="border border-[var(--df-line)]">
                <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:p-6">
                  <CompanyLogo company={company} />

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-semibold tracking-[-0.03em]">
                        {company.name}
                      </h3>

                      {company.isVerified && (
                        <span className="inline-flex items-center gap-1 border border-[var(--df-line)] px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.1em]">
                          <ShieldCheck className="h-3 w-3" />
                          Verified
                        </span>
                      )}
                    </div>

                    <p className="mt-2 text-xs text-[var(--df-muted)]">
                      {[formatValue(company.industry), formatValue(company.country)]
                        .filter((value) => value !== "Not specified")
                        .join(" · ") || "Company profile"}
                    </p>

                    {company.description && (
                      <p className="mt-4 whitespace-pre-line text-sm leading-7 text-[var(--df-muted)]">
                        {company.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid border-t border-[var(--df-line)] sm:grid-cols-2">
                  <CompanyFact
                    icon={Building2}
                    label="Industry"
                    value={formatValue(company.industry)}
                  />
                  <CompanyFact
                    icon={Globe2}
                    label="Country"
                    value={formatValue(company.country)}
                    border
                  />
                  <CompanyFact
                    icon={CheckCircle2}
                    label="Verification"
                    value={company.isVerified ? "Verified company" : "Not verified"}
                  />
                  <CompanyFact
                    icon={CalendarDays}
                    label="On DevFlow since"
                    value={formatDate(company.createdAt)}
                    border
                  />
                </div>

                {company.websiteUrl && (
                  <div className="border-t border-[var(--df-line)] p-5 sm:p-6">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-[var(--df-muted)]">
                      Company website
                    </p>

                    <a
                      href={getExternalUrl(company.websiteUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex max-w-full items-center gap-2 break-all text-sm font-medium underline decoration-[var(--df-line)] underline-offset-4 transition hover:decoration-current"
                    >
                      {company.websiteUrl}
                      <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                    </a>
                  </div>
                )}
              </div>
            </Section>
          )}

          {recruiter && (
            <Section
              number="05"
              title="Hiring team"
              description="Get to know the recruiter responsible for this job posting."
            >
              <div className="border border-[var(--df-line)]">
                <div className="flex gap-4 p-5 sm:p-6">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center border border-[var(--df-line)]">
                    <UserRound className="h-5 w-5 text-[var(--df-muted)]" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="break-words text-base font-semibold">
                      {getRecruiterName(recruiter)}
                    </h3>

                    <p className="mt-1 text-xs text-[var(--df-muted)]">
                      {recruiter.jobTitle || "Hiring recruiter"}
                    </p>

                    {recruiter.yearsOfExp != null && (
                      <p className="mt-3 text-xs text-[var(--df-muted)]">
                        {recruiter.yearsOfExp} years of experience
                      </p>
                    )}
                  </div>
                </div>

                {(recruiter.bio || recruiter.description) && (
                  <div className="border-t border-[var(--df-line)] p-5 sm:p-6">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-[var(--df-muted)]">
                      Professional background
                    </p>

                    {recruiter.bio && (
                      <p className="mt-3 whitespace-pre-line text-sm leading-7 text-[var(--df-muted)]">
                        {recruiter.bio}
                      </p>
                    )}

                    {recruiter.description &&
                      recruiter.description !== recruiter.bio && (
                        <p className="mt-3 whitespace-pre-line text-sm leading-7 text-[var(--df-muted)]">
                          {recruiter.description}
                        </p>
                      )}
                  </div>
                )}

                <div className="border-t border-[var(--df-line)] px-5 sm:px-6">
                  <DetailRow
                    icon={UserRound}
                    label="Role"
                    value={recruiter.jobTitle}
                  />
                  <DetailRow
                    icon={MapPin}
                    label="Work preference"
                    value={formatValue(recruiter.locationPreference)}
                  />
                  <DetailRow
                    icon={BriefcaseBusiness}
                    label="Experience"
                    value={
                      recruiter.yearsOfExp != null
                        ? `${recruiter.yearsOfExp} years`
                        : null
                    }
                    last
                  />
                </div>

                {(recruiter.githubUrl || recruiter.portfolioUrl) && (
                  <div className="flex flex-wrap gap-4 border-t border-[var(--df-line)] p-5 sm:px-6">
                    {recruiter.githubUrl && (
                      <ExternalProfileLink
                        href={recruiter.githubUrl}
                        label="GitHub profile"
                      />
                    )}

                    {recruiter.portfolioUrl && (
                      <ExternalProfileLink
                        href={recruiter.portfolioUrl}
                        label="Portfolio"
                      />
                    )}
                  </div>
                )}
              </div>
            </Section>
          )}
        </div>

        {/* Application sidebar */}
        <aside className="min-w-0 lg:sticky lg:top-6">
          <div className="border border-[var(--df-line)]">
            <div className="p-5 sm:p-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--df-muted)]">
                Your next move
              </p>

              <h2 className="mt-3 text-2xl font-semibold tracking-[-0.045em]">
                {hasApplied ? "Application submitted" : "Interested in this role?"}
              </h2>

              <p className="mt-2 text-sm leading-6 text-[var(--df-muted)]">
                {hasApplied
                  ? "Your application has been submitted. You can follow its progress from your applications dashboard."
                  : isClosed
                    ? "This opportunity is no longer accepting applications."
                    : "Review the role details, then apply when you're ready."}
              </p>

              <div className="mt-6 border-y border-[var(--df-line)] py-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-[var(--df-muted)]">
                  Compensation
                </p>
                <p className="mt-2 break-words text-2xl font-semibold tracking-[-0.045em]">
                  {salaryRange}
                </p>
                <p className="mt-2 text-xs text-[var(--df-muted)]">
                  {job.minSalary != null || job.maxSalary != null
                    ? `${job.currency || "Currency not specified"} · Employer-provided range`
                    : "Compensation details aren't available"}
                </p>
              </div>

              <div className="mt-5 space-y-0">
                <DetailRow
                  icon={BriefcaseBusiness}
                  label="Employment"
                  value={formatValue(job.employmentType)}
                />
                <DetailRow
                  icon={MapPin}
                  label="Location"
                  value={formatValue(job.locationPreference)}
                />
                <DetailRow
                  icon={Code2}
                  label="Experience"
                  value={formatValue(job.experienceLevel)}
                />
                <DetailRow
                  icon={CalendarDays}
                  label="Deadline"
                  value={formatDate(job.deadline)}
                  last
                />
              </div>

              <button
                type="button"
                onClick={() => setApplyOpen(true)}
                disabled={hasApplied || isClosed}
                className={cx(
                  "mt-6 flex w-full items-center justify-center gap-2 px-4 py-3.5 text-sm font-semibold transition",
                  hasApplied || isClosed
                    ? "cursor-not-allowed border border-[var(--df-line)] bg-[var(--df-line)]/20 text-[var(--df-muted)]"
                    : "bg-[var(--df-text)] text-[var(--df-paper)] hover:opacity-85"
                )}
              >
                {hasApplied ? (
                  <>
                    <Check className="h-4 w-4" />
                    Already applied
                  </>
                ) : isClosed ? (
                  "Applications closed"
                ) : (
                  <>
                    Apply for this role
                    <ArrowUpRight className="h-4 w-4" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleSaveJob}
                disabled={jobSaved || saveLoading}
                className="mt-3 flex w-full items-center justify-center gap-2 border border-[var(--df-line)] px-4 py-3 text-sm font-medium transition hover:bg-[var(--df-line)]/20 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {saveLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : jobSaved ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Bookmark className="h-4 w-4" />
                )}

                {saveLoading
                  ? "Saving job..."
                  : jobSaved
                    ? "Job saved"
                    : "Save for later"}
              </button>

              {saveError && (
                <p role="alert" className="mt-3 text-xs leading-5 text-red-600">
                  {saveError}
                </p>
              )}

              <div className="mt-5 flex items-start gap-2 border-t border-[var(--df-line)] pt-4">
                <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--df-muted)]" />
                <p className="text-xs leading-5 text-[var(--df-muted)]">
                  {deadlineText}
                </p>
              </div>
            </div>
          </div>

          {company && (
            <div className="mt-4 border border-[var(--df-line)] p-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-[var(--df-muted)]">
                Hiring company
              </p>

              <div className="mt-4 flex items-center gap-3">
                <CompanyLogo company={company} size="small" />
                <div className="min-w-0">
                  <p className="break-words text-sm font-semibold">
                    {company.name}
                  </p>
                  <p className="mt-1 text-xs text-[var(--df-muted)]">
                    {formatValue(company.industry)}
                  </p>
                </div>
              </div>

              {company.isVerified && (
                <p className="mt-4 flex items-center gap-2 text-xs text-[var(--df-muted)]">
                  <ShieldCheck className="h-4 w-4" />
                  Company verified by DevFlow
                </p>
              )}
            </div>
          )}
        </aside>
      </div>

      <ApplyJobModal
        job={job}
        open={applyOpen}
        onClose={() => setApplyOpen(false)}
      />
    </article>
  );
}

function HeroItem({ icon: Icon, label, value, border = false }) {
  return (
    <div
      className={cx(
        "flex items-start gap-3 p-4 sm:p-5",
        border && "border-t border-[var(--df-line)] sm:border-l sm:border-t-0"
      )}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[var(--df-muted)]" />
      <div className="min-w-0">
        <p className="text-[9px] font-semibold uppercase tracking-[0.13em] text-[var(--df-muted)]">
          {label}
        </p>
        <p className="mt-1 break-words text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}

function CompanyFact({ icon: Icon, label, value, border = false }) {
  return (
    <div
      className={cx(
        "flex items-start gap-3 p-4 sm:p-5",
        border && "border-t border-[var(--df-line)] sm:border-l sm:border-t-0"
      )}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[var(--df-muted)]" />
      <div className="min-w-0">
        <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[var(--df-muted)]">
          {label}
        </p>
        <p className="mt-1 break-words text-xs font-medium">
          {value || "Not specified"}
        </p>
      </div>
    </div>
  );
}

function ExternalProfileLink({ href, label }) {
  const externalUrl = getExternalUrl(href);

  if (!externalUrl) return null;

  return (
    <a
      href={externalUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 text-xs font-medium underline decoration-[var(--df-line)] underline-offset-4 transition hover:decoration-current"
    >
      {label}
      <ArrowUpRight className="h-3.5 w-3.5" />
    </a>
  );
}