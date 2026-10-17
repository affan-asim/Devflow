
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  ExternalLink,
  Globe2,
  MapPin,
  RefreshCw,
  Search,
  ShieldCheck,
  ShieldX,
  Users,
  X,
  LoaderCircle,
  CircleAlert,
  UserRound,
  History,
  Layers3,
} from "lucide-react";

import { useDispatch, useSelector } from "react-redux";
import {
  clearCurrentAdminCompany,
  fetchAdminCompanies,
  fetchAdminCompanyById,
  updateAdminCompanyVerification,
} from "@/lib/redux/slices/adminCompaniesSlice";

const PAGE_SIZE = 10;

const SORT_OPTIONS = [
  { value: "desc", label: "Newest first" },
  { value: "asc", label: "Oldest first" },
  { value: "country", label: "Country A–Z" },
];

const VERIFICATION_OPTIONS = [
  { value: "all", label: "All verification states" },
  { value: "true", label: "Verified" },
  { value: "false", label: "Unverified" },
];

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

function formatDate(value, options = {}) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...options,
  }).format(date);
}

function formatDateRange(start, end) {
  if (!start && !end) return "Dates unavailable";
  return `${start ? formatDate(start, { month: "short", year: "numeric" }) : "Start unknown"} – ${
    end ? formatDate(end, { month: "short", year: "numeric" }) : "Present"
  }`;
}

function initials(name = "") {
  return (
    name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "CO"
  );
}

function companyName(company) {
  return company?.name || "Unnamed company";
}

function ownerUser(company) {
  return company?.owner?.user || company?.owner || null;
}

function recruiterUser(recruiter) {
  return recruiter?.user || recruiter || null;
}

function employmentDeveloper(item) {
  return item?.developer?.user || item?.developer || item?.user || null;
}

function jobCount(company) {
  return company?._count?.jobs ?? company?.jobs?.length ?? 0;
}

function getError(error) {
  if (!error) return "Something went wrong. Please try again.";
  return typeof error === "string"
    ? error
    : error.message || "Something went wrong. Please try again.";
}

function Avatar({ name, logo, size = "md" }) {
  const [failed, setFailed] = useState(false);

  useEffect(() => setFailed(false), [logo]);

  const sizes = {
    sm: "h-9 w-9 text-xs",
    md: "h-11 w-11 text-sm",
    lg: "h-[68px] w-[68px] text-lg",
  };

  return (
    <div
      className={cx(
        "flex shrink-0 items-center justify-center overflow-hidden border border-[var(--df-line)] bg-[var(--df-paper-2)] font-semibold text-[var(--df-text-strong)]",
        sizes[size] || sizes.md
      )}
    >
      {logo && !failed ? (
        <img
          src={logo}
          alt={`${name || "Company"} logo`}
          loading="lazy"
          onError={() => setFailed(true)}
          className="h-full w-full object-contain p-1.5"
        />
      ) : (
        initials(name)
      )}
    </div>
  );
}

function Status({ verified }) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 border px-2.5 py-1 text-[11px] font-semibold",
        verified
          ? "border-[rgba(89,126,37,.25)] bg-[rgba(185,244,91,.22)] text-[var(--df-text-strong)]"
          : "border-[var(--df-line)] bg-[var(--df-paper-2)] text-[var(--df-muted)]"
      )}
    >
      {verified ? <CheckCircle2 size={13} /> : <Clock3 size={13} />}
      {verified ? "Verified" : "Unverified"}
    </span>
  );
}

function FilterSelect({ value, onChange, options, label }) {
  return (
    <label className="relative flex min-w-0 items-center border border-[var(--df-line)] bg-[var(--df-paper)]">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-label={label}
        className="h-10 w-full appearance-none bg-transparent px-3 pr-9 text-sm text-[var(--df-text)] outline-none"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={15}
        className="pointer-events-none absolute right-3 text-[var(--df-muted)]"
      />
    </label>
  );
}

function MetricCard({ icon: Icon, label, value, note }) {
  return (
    <div className="border border-[var(--df-line)] bg-[var(--df-paper)] p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[10px] font-semibold uppercase tracking-[.13em] text-[var(--df-muted)]">
          {label}
        </span>
        <Icon size={16} strokeWidth={1.6} className="text-[var(--df-muted)]" />
      </div>
      <div className="mt-3 text-2xl font-semibold tracking-[-.05em] text-[var(--df-text-strong)]">
        {value}
      </div>
      {note && <p className="mt-1 text-xs text-[var(--df-muted)]">{note}</p>}
    </div>
  );
}

function MiniLabel({ children, trailing }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <p className="text-[10px] font-semibold uppercase tracking-[.15em] text-[var(--df-muted)]">
        {children}
      </p>
      {trailing !== undefined && (
        <span className="text-xs tabular-nums text-[var(--df-muted)]">
          {trailing}
        </span>
      )}
    </div>
  );
}

function PersonRow({ name, email, subtitle, avatar = true }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      {avatar && (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center border border-[var(--df-line)] bg-[var(--df-paper-2)] text-[var(--df-muted)]">
          <UserRound size={16} strokeWidth={1.6} />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-[var(--df-text-strong)]">
          {name || "Name unavailable"}
        </p>
        {email && (
          <p className="mt-0.5 truncate text-xs text-[var(--df-muted)]">{email}</p>
        )}
        {subtitle && (
          <p className="mt-0.5 truncate text-xs text-[var(--df-muted)]">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}

function JobCard({ job }) {
  return (
    <div className="flex items-start gap-3 border border-[var(--df-line-soft)] bg-[var(--df-paper)] p-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center border border-[var(--df-line)] bg-[var(--df-paper-2)]">
        <BriefcaseBusiness size={16} strokeWidth={1.6} className="text-[var(--df-muted)]" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="break-words text-sm font-medium text-[var(--df-text-strong)]">
          {job.title || "Untitled job"}
        </p>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[var(--df-muted)]">
          {job.status && <span>{job.status}</span>}
          {job.status && job.createdAt && <span>·</span>}
          {job.createdAt && <span>{formatDate(job.createdAt)}</span>}
        </div>
      </div>
    </div>
  );
}

function TimelineItem({ title, subtitle, date, description }) {
  return (
    <div className="relative pl-5">
      <span className="absolute left-0 top-[5px] h-2.5 w-2.5 border-2 border-[var(--df-accent)] bg-[var(--df-paper)]" />
      <p className="text-sm font-medium leading-5 text-[var(--df-text-strong)]">
        {title || "History record"}
      </p>
      {subtitle && (
        <p className="mt-1 text-xs leading-5 text-[var(--df-muted)]">{subtitle}</p>
      )}
      {description && (
        <p className="mt-1 text-xs leading-5 text-[var(--df-muted)]">
          {description}
        </p>
      )}
      {date && (
        <p className="mt-1.5 text-[10px] font-medium uppercase tracking-[.08em] text-[var(--df-soft)]">
          {date}
        </p>
      )}
    </div>
  );
}

function EmptyInline({ children }) {
  return (
    <div className="border border-dashed border-[var(--df-line)] px-3 py-4 text-xs leading-5 text-[var(--df-muted)]">
      {children}
    </div>
  );
}

function CompanyDrawer({
  company,
  loading,
  error,
  submitting,
  submitError,
  onClose,
  onVerify,
}) {
  const owner = ownerUser(company);
  const recruiters = Array.isArray(company?.recruiters) ? company.recruiters : [];
  const jobs = Array.isArray(company?.jobs) ? company.jobs : [];
  const employment = Array.isArray(company?.employmentHistory)
    ? company.employmentHistory
    : [];
  const recruiterHistory = Array.isArray(company?.recruiterHistory)
    ? company.recruiterHistory
    : [];

  useEffect(() => {
    if (!company) return;

    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [company, onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="absolute inset-0 bg-black/40" />

      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="company-profile-heading"
        className="relative flex h-full w-full max-w-[720px] flex-col border-l border-[var(--df-line)] bg-[var(--df-paper)]"
      >
        <header className="flex shrink-0 items-center justify-between border-b border-[var(--df-line)] px-5 py-4 sm:px-7">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[.17em] text-[var(--df-muted)]">
              DevFlow / Company record
            </p>
            <p className="mt-1 text-sm font-semibold text-[var(--df-text-strong)]">
              Admin workspace
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close company profile"
            className="flex h-9 w-9 items-center justify-center border border-[var(--df-line)] transition hover:bg-[var(--df-paper-2)]"
          >
            <X size={17} />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {loading && !company ? (
            <div className="space-y-4 p-5 sm:p-7">
              <div className="h-36 animate-pulse bg-[var(--df-paper-2)]" />
              <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="h-24 animate-pulse bg-[var(--df-paper-2)]" />
                ))}
              </div>
              <div className="h-48 animate-pulse bg-[var(--df-paper-2)]" />
            </div>
          ) : error ? (
            <div className="m-5 border border-[var(--df-line)] p-5 sm:m-7">
              <CircleAlert size={21} className="text-[var(--df-muted)]" />
              <h3 className="mt-3 font-semibold text-[var(--df-text-strong)]">
                Company details unavailable
              </h3>
              <p className="mt-1 text-sm leading-6 text-[var(--df-muted)]">
                {getError(error)}
              </p>
            </div>
          ) : company ? (
            <div className="pb-8">
              {/* Company identity */}
              <section className="relative overflow-hidden border-b border-[var(--df-line)] px-5 pb-6 pt-6 sm:px-7 sm:pt-8">
                <div className="pointer-events-none absolute right-0 top-0 h-40 w-40 translate-x-10 -translate-y-10 border border-[var(--df-line-soft)]" />
                <div className="relative flex items-start gap-4">
                  <Avatar name={company.name} logo={company.logo} size="lg" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Status verified={Boolean(company.isVerified)} />
                      <span className="text-[10px] uppercase tracking-[.1em] text-[var(--df-soft)]">
                        ID · {String(company.id || "").slice(0, 8) || "—"}
                      </span>
                    </div>
                    <h2
                      id="company-profile-heading"
                      className="mt-3 break-words text-[25px] font-semibold leading-tight tracking-[-.055em] text-[var(--df-text-strong)] sm:text-[30px]"
                    >
                      {companyName(company)}
                    </h2>
                    <p className="mt-1.5 text-sm text-[var(--df-muted)]">
                      {company.industry || "Industry not specified"}
                      {company.country ? ` · ${company.country}` : ""}
                    </p>
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      {company.websiteUrl && (
                        <a
                          href={company.websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex min-h-9 items-center gap-2 border border-[var(--df-line)] px-3 text-xs font-semibold transition hover:bg-[var(--df-paper-2)]"
                        >
                          Visit website <ArrowUpRight size={14} />
                        </a>
                      )}
                      <button
                        type="button"
                        disabled={submitting}
                        onClick={() => onVerify(company)}
                        className={cx(
                          "inline-flex min-h-9 items-center gap-2 border px-3 text-xs font-semibold transition disabled:opacity-60",
                          company.isVerified
                            ? "border-[var(--df-line)] hover:bg-[var(--df-paper-2)]"
                            : "border-[var(--df-accent)] bg-[var(--df-accent)] hover:bg-[var(--df-accent-hover)]"
                        )}
                      >
                        {submitting ? (
                          <LoaderCircle size={14} className="animate-spin" />
                        ) : company.isVerified ? (
                          <ShieldX size={14} />
                        ) : (
                          <ShieldCheck size={14} />
                        )}
                        {company.isVerified ? "Revoke verification" : "Verify company"}
                      </button>
                    </div>
                    {submitError && (
                      <p role="alert" className="mt-2 text-xs text-red-700">
                        {getError(submitError)}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-3 gap-2 sm:gap-3">
                  <MetricCard
                    icon={BriefcaseBusiness}
                    label="Jobs"
                    value={jobCount(company)}
                    note="Total listed"
                  />
                  <MetricCard
                    icon={Users}
                    label="Recruiters"
                    value={recruiters.length}
                    note="Associated accounts"
                  />
                  <MetricCard
                    icon={Layers3}
                    label="People records"
                    value={employment.length + recruiterHistory.length}
                    note="Combined history"
                  />
                </div>
              </section>

              {/* Quick facts */}
              <section className="grid grid-cols-1 gap-3 border-b border-[var(--df-line)] px-5 py-5 sm:grid-cols-2 sm:px-7">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center border border-[var(--df-line)] bg-[var(--df-paper-2)]">
                    <MapPin size={16} className="text-[var(--df-muted)]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-[.12em] text-[var(--df-muted)]">
                      Location
                    </p>
                    <p className="mt-1 break-words text-sm font-medium text-[var(--df-text-strong)]">
                      {[company.city, company.state, company.country]
                        .filter(Boolean)
                        .join(", ") ||
                        company.location ||
                        "Not provided"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center border border-[var(--df-line)] bg-[var(--df-paper-2)]">
                    <CalendarDays size={16} className="text-[var(--df-muted)]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-[.12em] text-[var(--df-muted)]">
                      Joined DevFlow
                    </p>
                    <p className="mt-1 text-sm font-medium text-[var(--df-text-strong)]">
                      {formatDate(company.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center border border-[var(--df-line)] bg-[var(--df-paper-2)]">
                    <Globe2 size={16} className="text-[var(--df-muted)]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-[.12em] text-[var(--df-muted)]">
                      Website
                    </p>
                    {company.websiteUrl ? (
                      <a
                        href={company.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 block break-all text-sm font-medium text-[var(--df-text-strong)] underline decoration-[var(--df-line)] underline-offset-4"
                      >
                        {company.websiteUrl}
                      </a>
                    ) : (
                      <p className="mt-1 text-sm text-[var(--df-muted)]">Not provided</p>
                    )}
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center border border-[var(--df-line)] bg-[var(--df-paper-2)]">
                    <UserRound size={16} className="text-[var(--df-muted)]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-[.12em] text-[var(--df-muted)]">
                      Company owner
                    </p>
                    <p className="mt-1 break-words text-sm font-medium text-[var(--df-text-strong)]">
                      {owner?.user?.name || owner?.name || "Owner unavailable"}
                    </p>
                    <p className="mt-0.5 break-all text-xs text-[var(--df-muted)]">
                      {owner?.user?.email || owner?.email || "No email available"}
                    </p>
                  </div>
                </div>
              </section>

              {/* Recruiter roster */}
              <section className="border-b border-[var(--df-line)] px-5 py-6 sm:px-7">
                <MiniLabel trailing={recruiters.length}>Recruiter team</MiniLabel>
                <p className="mt-1 text-xs text-[var(--df-muted)]">
                  People associated with this company
                </p>
                {recruiters.length ? (
                  <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {recruiters.map((recruiter, index) => {
                      const user = recruiterUser(recruiter);
                      return (
                        <div
                          key={recruiter.id || user?.email || index}
                          className="border border-[var(--df-line)] p-3"
                        >
                          <PersonRow
                            name={user?.name || "Recruiter"}
                            email={user?.email}
                            subtitle={
                              recruiter.jobTitle ||
                              recruiter.title ||
                              recruiter.role ||
                              null
                            }
                          />
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="mt-4">
                    <EmptyInline>No recruiter accounts were returned for this company.</EmptyInline>
                  </div>
                )}
              </section>

              {/* Jobs */}
              <section className="border-b border-[var(--df-line)] px-5 py-6 sm:px-7">
                <MiniLabel trailing={jobs.length}>Recent jobs</MiniLabel>
                <p className="mt-1 text-xs text-[var(--df-muted)]">
                  Latest job records associated with this company
                </p>
                {jobs.length ? (
                  <div className="mt-4 space-y-2">
                    {jobs.slice(0, 6).map((job) => (
                      <JobCard key={job.id} job={job} />
                    ))}
                    {jobs.length > 6 && (
                      <p className="pt-1 text-xs text-[var(--df-muted)]">
                        Showing 6 of {jobs.length} jobs
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="mt-4">
                    <EmptyInline>No job records were returned.</EmptyInline>
                  </div>
                )}
              </section>

              {/* Employment history */}
              <section className="border-b border-[var(--df-line)] px-5 py-6 sm:px-7">
                <MiniLabel trailing={employment.length}>Employment history</MiniLabel>
                <p className="mt-1 text-xs text-[var(--df-muted)]">
                  Developers connected to this company
                </p>
                {employment.length ? (
                  <div className="relative mt-5 space-y-5 before:absolute before:bottom-1 before:left-[4px] before:top-1 before:w-px before:bg-[var(--df-line)]">
                    {employment.slice(0, 8).map((item, index) => {
                      const developer = employmentDeveloper(item);
                      const title =
                        item.title ||
                        item.position ||
                        item.jobTitle ||
                        item.role ||
                        "Employment record";
                      const dates = formatDateRange(
                        item.startDate || item.startedAt,
                        item.endDate || item.endedAt
                      );

                      return (
                        <TimelineItem
                          key={item.id || `employment-${index}`}
                          title={developer?.name || "Developer"}
                          subtitle={title}
                          description={item.description || item.employmentType || ""}
                          date={dates}
                        />
                      );
                    })}
                    {employment.length > 8 && (
                      <p className="pl-5 text-xs text-[var(--df-muted)]">
                        Showing 8 of {employment.length} records
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="mt-4">
                    <EmptyInline>No employment-history records were returned.</EmptyInline>
                  </div>
                )}
              </section>

              {/* Recruiter history */}
              <section className="px-5 py-6 sm:px-7">
                <MiniLabel trailing={recruiterHistory.length}>Recruiter history</MiniLabel>
                <p className="mt-1 text-xs text-[var(--df-muted)]">
                  Historical recruiter associations
                </p>
                {recruiterHistory.length ? (
                  <div className="relative mt-5 space-y-5 before:absolute before:bottom-1 before:left-[4px] before:top-1 before:w-px before:bg-[var(--df-line)]">
                    {recruiterHistory.slice(0, 8).map((item, index) => (
                      <TimelineItem
                        key={item.id || `recruiter-history-${index}`}
                        title={
                          item.recruiter?.user?.name ||
                          item.recruiterName ||
                          item.title ||
                          item.role ||
                          "Recruiter association"
                        }
                        subtitle={
                          item.roleTitle ||
                          item.jobTitle ||
                          item.position ||
                          item.action ||
                          item.eventType ||
                          ""
                        }
                        description={item.description || ""}
                        date={formatDateRange(
                          item.startDate || item.createdAt,
                          item.endDate
                        )}
                      />
                    ))}
                    {recruiterHistory.length > 8 && (
                      <p className="pl-5 text-xs text-[var(--df-muted)]">
                        Showing 8 of {recruiterHistory.length} records
                      </p>
                    )}
                  </div>
                ) : (
                  <EmptyInline>No recruiter-history records were returned.</EmptyInline>
                )}
              </section>
            </div>
          ) : null}
        </div>
      </aside>
    </div>
  );
}

function VerifyDialog({ company, loading, error, onCancel, onConfirm }) {
  useEffect(() => {
    if (!company) return;

    const handleKey = (event) => {
      if (event.key === "Escape" && !loading) onCancel();
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [company, loading, onCancel]);

  if (!company) return null;

  const nextVerified = !company.isVerified;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !loading) onCancel();
      }}
    >
      <div className="absolute inset-0 bg-black/40" />
      <section
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="verify-title"
        className="relative w-full max-w-md border border-[var(--df-line)] bg-[var(--df-paper)] p-5 sm:p-6"
      >
        <div className="flex h-11 w-11 items-center justify-center border border-[var(--df-line)] bg-[var(--df-paper-2)]">
          {nextVerified ? <ShieldCheck size={20} /> : <ShieldX size={20} />}
        </div>
        <h2 id="verify-title" className="mt-4 text-lg font-semibold tracking-[-.03em] text-[var(--df-text-strong)]">
          {nextVerified ? "Verify this company?" : "Revoke verification?"}
        </h2>
        <p className="mt-2 text-sm leading-6 text-[var(--df-muted)]">
          {nextVerified
            ? `Confirm that ${companyName(company)} meets your verification requirements before approving its status.`
            : `This will remove the verified status from ${companyName(company)}.`}
        </p>
        {error && (
          <p role="alert" className="mt-3 border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            {getError(error)}
          </p>
        )}
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            disabled={loading}
            onClick={onCancel}
            className="min-h-10 border border-[var(--df-line)] px-4 text-sm font-medium hover:bg-[var(--df-paper-2)] disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            className="inline-flex min-h-10 items-center justify-center gap-2 border border-[var(--df-accent)] bg-[var(--df-accent)] px-4 text-sm font-semibold text-[var(--df-text-strong)] hover:bg-[var(--df-accent-hover)] disabled:opacity-50"
          >
            {loading && <LoaderCircle size={15} className="animate-spin" />}
            {loading ? "Saving…" : nextVerified ? "Confirm verification" : "Confirm revocation"}
          </button>
        </div>
      </section>
    </div>
  );
}

function EmptyDirectory({ filtered, reset }) {
  return (
    <div className="flex flex-col items-center px-5 py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center border border-[var(--df-line)] bg-[var(--df-paper-2)]">
        <Building2 size={21} strokeWidth={1.5} className="text-[var(--df-muted)]" />
      </div>
      <h3 className="mt-4 text-base font-semibold text-[var(--df-text-strong)]">
        {filtered ? "No matching companies" : "No companies found"}
      </h3>
      <p className="mt-1 max-w-sm text-sm leading-6 text-[var(--df-muted)]">
        {filtered
          ? "Try another search or clear your filters."
          : "Company records will appear here when available."}
      </p>
      {filtered && (
        <button
          type="button"
          onClick={reset}
          className="mt-4 text-sm font-semibold underline underline-offset-4"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}

export default function AdminCompaniesPage() {
  const dispatch = useDispatch();
  const state = useSelector((store) => store.adminCompanies || {});

  const {
    companies = [],
    metadata = {},
    currentCompany,
    loadingList = false,
    loadingDetail = false,
    submitting = false,
    errorList,
    errorDetail,
    submitError,
  } = state;

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [industry, setIndustry] = useState("all");
  const [country, setCountry] = useState("all");
  const [verification, setVerification] = useState("all");
  const [sort, setSort] = useState("desc");
  const [page, setPage] = useState(1);
  const [selectedCompanyId, setSelectedCompanyId] = useState(null);
  const [confirmationCompany, setConfirmationCompany] = useState(null);
  const [notice, setNotice] = useState("");

  const requestParams = useMemo(
    () => ({
      page,
      limit: PAGE_SIZE,
      ...(search ? { name: search } : {}),
      ...(industry !== "all" ? { industry } : {}),
      ...(country !== "all" ? { country } : {}),
      ...(verification !== "all" ? { isVerified: verification } : {}),
      sort,
    }),
    [page, search, industry, country, verification, sort]
  );

  const loadCompanies = useCallback(
    () => dispatch(fetchAdminCompanies(requestParams)),
    [dispatch, requestParams]
  );

  useEffect(() => {
    const timer = window.setTimeout(() => setSearch(searchInput.trim()), 350);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    setPage(1);
  }, [search, industry, country, verification, sort]);

  useEffect(() => {
    loadCompanies();
  }, [loadCompanies]);

  useEffect(() => {
    if (selectedCompanyId) {
      dispatch(fetchAdminCompanyById(selectedCompanyId));
    }
  }, [dispatch, selectedCompanyId]);

  useEffect(() => {
    return () => {
      dispatch(clearCurrentAdminCompany());
    };
  }, [dispatch]);

  const openCompany = useCallback(
    (company) => {
      setNotice("");
      dispatch(clearCurrentAdminCompany());
      setSelectedCompanyId(company.id);
    },
    [dispatch]
  );

  const closeCompany = useCallback(() => {
    setSelectedCompanyId(null);
    dispatch(clearCurrentAdminCompany());
  }, [dispatch]);

  const resetFilters = useCallback(() => {
    setSearchInput("");
    setSearch("");
    setIndustry("all");
    setCountry("all");
    setVerification("all");
    setSort("desc");
    setPage(1);
  }, []);

  const requestVerification = useCallback((company) => {
    setConfirmationCompany(company);
  }, []);

  const confirmVerification = useCallback(async () => {
    if (!confirmationCompany?.id) return;

    const target = confirmationCompany;
    const nextVerified = !target.isVerified;

    try {
      await dispatch(
        updateAdminCompanyVerification({
          companyId: target.id,
          isVerified: nextVerified,
        })
      ).unwrap();

      setConfirmationCompany(null);
      setNotice(
        nextVerified
          ? `${companyName(target)} is now verified.`
          : `Verification was revoked for ${companyName(target)}.`
      );

      dispatch(fetchAdminCompanies(requestParams));

      if (selectedCompanyId === target.id) {
        dispatch(fetchAdminCompanyById(target.id));
      }
    } catch {
      // Keep the dialog open. The slice exposes the error for retry feedback.
    }
  }, [confirmationCompany, dispatch, requestParams, selectedCompanyId]);

  const industries = useMemo(() => {
    const values = [...new Set(companies.map((item) => item.industry).filter(Boolean))];
    return [
      { value: "all", label: "All industries" },
      ...values.sort((a, b) => a.localeCompare(b)).map((value) => ({
        value,
        label: value,
      })),
    ];
  }, [companies]);

  const countries = useMemo(() => {
    const values = [...new Set(companies.map((item) => item.country).filter(Boolean))];
    return [
      { value: "all", label: "All countries" },
      ...values.sort((a, b) => a.localeCompare(b)).map((value) => ({
        value,
        label: value,
      })),
    ];
  }, [companies]);

  const currentPage = metadata.currentPage || page;
  const pageSize = metadata.pageSize || PAGE_SIZE;
  const totalCount = metadata.totalCount ?? 0;
  const totalPages = metadata.totalPages ?? 0;
  const verifiedOnPage = companies.filter((company) => company.isVerified).length;
  const unverifiedOnPage = companies.length - verifiedOnPage;
  const jobsOnPage = companies.reduce((total, company) => total + jobCount(company), 0);
  const hasFilters =
    Boolean(search) ||
    industry !== "all" ||
    country !== "all" ||
    verification !== "all";

  const start = totalCount ? (currentPage - 1) * pageSize + 1 : 0;
  const end = Math.min(currentPage * pageSize, totalCount);
  const drawerCompany =
    currentCompany?.id === selectedCompanyId ? currentCompany : null;

  return (
    <main className="min-h-full bg-[var(--df-paper)] text-[var(--df-text)]">
      <div className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-6 sm:py-8 xl:px-9">
        <header className="flex flex-col gap-5 border-b border-[var(--df-line)] pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <span className="h-2 w-2 bg-[var(--df-accent)]" />
              <p className="text-[10px] font-semibold uppercase tracking-[.18em] text-[var(--df-muted)]">
                Administration / Directory
              </p>
            </div>
            <h1 className="text-3xl font-semibold tracking-[-.055em] text-[var(--df-text-strong)] sm:text-4xl">
              Companies
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--df-muted)]">
              Review company profiles, recruiting activity, and verification status.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setNotice("");
              loadCompanies();
            }}
            disabled={loadingList}
            className="inline-flex min-h-10 items-center justify-center gap-2 self-start border border-[var(--df-line)] px-4 text-sm font-medium transition hover:bg-[var(--df-paper-2)] disabled:opacity-50 md:self-auto"
          >
            <RefreshCw size={15} className={loadingList ? "animate-spin" : ""} />
            Refresh list
          </button>
        </header>

        <section className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            icon={Building2}
            label="Matching companies"
            value={totalCount.toLocaleString()}
            note="Based on current filters"
          />
          <MetricCard
            icon={ShieldCheck}
            label="Verified on page"
            value={verifiedOnPage.toLocaleString()}
            note="Visible records only"
          />
          <MetricCard
            icon={Clock3}
            label="Unverified on page"
            value={unverifiedOnPage.toLocaleString()}
            note="Visible records only"
          />
          <MetricCard
            icon={BriefcaseBusiness}
            label="Jobs on page"
            value={jobsOnPage.toLocaleString()}
            note="Across visible companies"
          />
        </section>

        <section className="mt-7 border border-[var(--df-line)] bg-[var(--df-paper)]">
          <div className="border-b border-[var(--df-line)] p-4 sm:p-5">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-base font-semibold tracking-[-.025em] text-[var(--df-text-strong)]">
                  Company directory
                </h2>
                <p className="mt-1 text-xs text-[var(--df-muted)]">
                  Search, filter, and manage verification
                </p>
              </div>
              <p className="text-xs text-[var(--df-muted)]">
                {totalCount.toLocaleString()} result{totalCount === 1 ? "" : "s"}
              </p>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-[minmax(220px,1.7fr)_repeat(3,minmax(150px,1fr))_minmax(150px,1fr)]">
              <label className="relative flex min-w-0 items-center border border-[var(--df-line)]">
                <Search size={16} className="ml-3 shrink-0 text-[var(--df-muted)]" />
                <input
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder="Search company name…"
                  aria-label="Search company name"
                  className="h-10 w-full min-w-0 bg-transparent px-2.5 text-sm outline-none placeholder:text-[var(--df-soft)]"
                />
                {searchInput && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchInput("");
                      setSearch("");
                    }}
                    aria-label="Clear search"
                    className="mr-2 flex h-7 w-7 items-center justify-center text-[var(--df-muted)]"
                  >
                    <X size={14} />
                  </button>
                )}
              </label>

              <FilterSelect label="Industry" value={industry} onChange={setIndustry} options={industries} />
              <FilterSelect label="Country" value={country} onChange={setCountry} options={countries} />
              <FilterSelect label="Verification status" value={verification} onChange={setVerification} options={VERIFICATION_OPTIONS} />
              <FilterSelect label="Sort companies" value={sort} onChange={setSort} options={SORT_OPTIONS} />
            </div>

            {hasFilters && (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="text-xs text-[var(--df-muted)]">Filters applied</span>
                {search && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchInput("");
                      setSearch("");
                    }}
                    className="inline-flex items-center gap-1 border border-[var(--df-line)] px-2 py-1 text-xs"
                  >
                    Search: {search} <X size={11} />
                  </button>
                )}
                {industry !== "all" && (
                  <button type="button" onClick={() => setIndustry("all")} className="inline-flex items-center gap-1 border border-[var(--df-line)] px-2 py-1 text-xs">
                    {industry} <X size={11} />
                  </button>
                )}
                {country !== "all" && (
                  <button type="button" onClick={() => setCountry("all")} className="inline-flex items-center gap-1 border border-[var(--df-line)] px-2 py-1 text-xs">
                    {country} <X size={11} />
                  </button>
                )}
                {verification !== "all" && (
                  <button type="button" onClick={() => setVerification("all")} className="inline-flex items-center gap-1 border border-[var(--df-line)] px-2 py-1 text-xs">
                    {verification === "true" ? "Verified" : "Unverified"} <X size={11} />
                  </button>
                )}
                <button type="button" onClick={resetFilters} className="ml-auto text-xs font-semibold underline underline-offset-4">
                  Reset all
                </button>
              </div>
            )}
          </div>

          {notice && (
            <div role="status" className="flex items-start gap-2 border-b border-[var(--df-line)] bg-[rgba(185,244,91,.13)] px-4 py-3 text-sm sm:px-5">
              <Check size={16} className="mt-0.5 shrink-0" />
              <span>{notice}</span>
              <button type="button" onClick={() => setNotice("")} aria-label="Dismiss notification" className="ml-auto">
                <X size={15} />
              </button>
            </div>
          )}

          {errorList && (
            <div role="alert" className="flex flex-col gap-3 border-b border-[var(--df-line)] p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <div className="flex items-start gap-2 text-sm">
                <CircleAlert size={17} className="mt-0.5 shrink-0 text-[var(--df-muted)]" />
                <div>
                  <p className="font-medium">Unable to load companies</p>
                  <p className="mt-1 text-[var(--df-muted)]">{getError(errorList)}</p>
                </div>
              </div>
              <button type="button" onClick={loadCompanies} disabled={loadingList} className="min-h-9 border border-[var(--df-line)] px-3 text-sm hover:bg-[var(--df-paper-2)] disabled:opacity-50">
                Try again
              </button>
            </div>
          )}

          <div className="hidden grid-cols-[minmax(220px,1.7fr)_minmax(120px,1fr)_minmax(100px,.8fr)_100px_110px] gap-4 border-b border-[var(--df-line)] bg-[var(--df-paper-2)] px-5 py-3 lg:grid">
            {["Company", "Industry / Country", "Jobs", "Verification", "Action"].map((heading) => (
              <div key={heading} className="text-[10px] font-semibold uppercase tracking-[.13em] text-[var(--df-muted)]">
                {heading}
              </div>
            ))}
          </div>

          {loadingList && companies.length === 0 ? (
            <div className="space-y-0">
              {[1, 2, 3, 4, 5].map((item) => (
                <div key={item} className="flex items-center gap-3 border-b border-[var(--df-line-soft)] px-5 py-5">
                  <div className="h-11 w-11 animate-pulse bg-[var(--df-paper-3)]" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 w-40 animate-pulse bg-[var(--df-paper-3)]" />
                    <div className="h-3 w-24 animate-pulse bg-[var(--df-paper-2)]" />
                  </div>
                </div>
              ))}
            </div>
          ) : !errorList && companies.length === 0 ? (
            <EmptyDirectory filtered={hasFilters} reset={resetFilters} />
          ) : (
            companies.map((company) => (
              <article
                key={company.id}
                className="grid grid-cols-1 gap-4 border-b border-[var(--df-line-soft)] px-4 py-4 transition last:border-0 hover:bg-[var(--df-paper-2)]/60 sm:px-5 sm:py-5 lg:grid-cols-[minmax(220px,1.7fr)_minmax(120px,1fr)_minmax(100px,.8fr)_100px_110px] lg:items-center"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar name={company.name} logo={company.logo} />
                  <div className="min-w-0">
                    <button type="button" onClick={() => openCompany(company)} className="block max-w-full truncate text-left text-sm font-semibold text-[var(--df-text-strong)] hover:underline hover:underline-offset-4">
                      {companyName(company)}
                    </button>
                    <p className="mt-1 truncate text-xs text-[var(--df-muted)]">
                      Added {formatDate(company.createdAt)}
                    </p>
                    <div className="mt-2 lg:hidden">
                      <Status verified={Boolean(company.isVerified)} />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 lg:block">
                  <div>
                    <p className="text-[10px] uppercase tracking-[.1em] text-[var(--df-muted)] lg:hidden">Industry</p>
                    <p className="mt-1 truncate text-sm lg:mt-0">{company.industry || "—"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[.1em] text-[var(--df-muted)] lg:hidden">Country</p>
                    <p className="mt-1 truncate text-sm text-[var(--df-muted)] lg:mt-1">{company.country || "—"}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between lg:block">
                  <span className="text-xs text-[var(--df-muted)] lg:hidden">Jobs</span>
                  <span className="inline-flex items-center gap-2 text-sm">
                    <BriefcaseBusiness size={15} className="text-[var(--df-muted)]" />
                    {jobCount(company)}
                  </span>
                </div>

                <div className="hidden lg:block">
                  <Status verified={Boolean(company.isVerified)} />
                </div>

                <div className="flex items-center gap-2 lg:justify-end">
                  <button type="button" onClick={() => openCompany(company)} className="inline-flex min-h-9 flex-1 items-center justify-center gap-1.5 border border-[var(--df-line)] px-3 text-xs font-semibold transition hover:bg-[var(--df-paper-2)] sm:flex-none">
                    View <ChevronRight size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => requestVerification(company)}
                    aria-label={`${company.isVerified ? "Revoke verification for" : "Verify"} ${companyName(company)}`}
                    className={cx(
                      "inline-flex min-h-9 items-center justify-center gap-1.5 border px-3 text-xs font-semibold transition",
                      company.isVerified
                        ? "border-[var(--df-line)] text-[var(--df-muted)] hover:bg-[var(--df-paper-2)] hover:text-[var(--df-text)]"
                        : "border-[var(--df-accent)] bg-[var(--df-accent)] hover:bg-[var(--df-accent-hover)]"
                    )}
                  >
                    {company.isVerified ? <ShieldX size={14} /> : <ShieldCheck size={14} />}
                    <span className="sm:hidden">{company.isVerified ? "Revoke" : "Verify"}</span>
                  </button>
                </div>
              </article>
            ))
          )}

          <footer className="flex flex-col gap-3 border-t border-[var(--df-line)] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <p className="text-xs text-[var(--df-muted)]">
              {totalCount ? `Showing ${start}–${end} of ${totalCount.toLocaleString()} companies` : "No companies to show"}
              {loadingList && companies.length > 0 ? " · Updating…" : ""}
            </p>
            <div className="flex items-center justify-between gap-2 sm:justify-end">
              <span className="mr-2 text-xs text-[var(--df-muted)]">
                Page {currentPage} of {Math.max(totalPages, 1)}
              </span>
              <button
                type="button"
                aria-label="Previous page"
                disabled={currentPage <= 1 || loadingList}
                onClick={() => setPage((value) => Math.max(1, value - 1))}
                className="flex h-9 w-9 items-center justify-center border border-[var(--df-line)] transition hover:bg-[var(--df-paper-2)] disabled:cursor-not-allowed disabled:opacity-35"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                aria-label="Next page"
                disabled={loadingList || !(metadata.hasNextPage ?? currentPage < totalPages)}
                onClick={() => setPage((value) => Math.min(totalPages || value + 1, value + 1))}
                className="flex h-9 w-9 items-center justify-center border border-[var(--df-line)] transition hover:bg-[var(--df-paper-2)] disabled:cursor-not-allowed disabled:opacity-35"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </footer>
        </section>
      </div>

      {selectedCompanyId && (
        <CompanyDrawer
          company={drawerCompany}
          loading={loadingDetail}
          error={errorDetail}
          submitting={submitting}
          submitError={submitError}
          onClose={closeCompany}
          onVerify={requestVerification}
        />
      )}

      <VerifyDialog
        company={confirmationCompany}
        loading={submitting}
        error={submitError}
        onCancel={() => setConfirmationCompany(null)}
        onConfirm={confirmVerification}
      />
    </main>
  );
}
