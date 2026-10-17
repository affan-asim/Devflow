
"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowLeft,
  ExternalLink,
  FileText,
  Download,
  BriefcaseBusiness,
  Building2,
  UserRound,
  Mail,
  CalendarDays,
  ShieldCheck,
  ShieldAlert,
  CircleCheck,
  CircleX,
  Clock3,
  Activity,
  Globe,
  MapPin,
  Hash,
  RefreshCw,
  Users,
} from "lucide-react";
import {
  clearCurrentApplication,
  fetchAdminApplicationById,
} from "@/lib/redux/slices/applicationSlice";

const statusStyles = {
  PENDING: "border-amber-200 bg-amber-50 text-amber-800",
  REVIEW: "border-blue-200 bg-blue-50 text-blue-800",
  ACCEPTED: "border-emerald-200 bg-emerald-50 text-emerald-800",
  REJECTED: "border-rose-200 bg-rose-50 text-rose-800",
};

const formatDate = (value, withTime = false) => {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "long",
    year: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  }).format(date);
};

const initials = (name = "") =>
  name.trim().split(/\s+/).slice(0, 2).map((part) => part[0] || "").join("").toUpperCase() || "NA";

const humanize = (value) =>
  String(value || "Unknown").replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

function StatusBadge({ status }) {
  const value = String(status || "UNKNOWN").toUpperCase();

  return (
    <span
      className={`inline-flex items-center gap-2 border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] ${
        statusStyles[value] || "border-[var(--df-line)] bg-[var(--df-paper-2)] text-[var(--df-muted)]"
      }`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {humanize(value)}
    </span>
  );
}

function SectionHeading({ eyebrow, title, count }) {
  return (
    <div className="mb-5 flex items-end justify-between gap-3">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--df-muted)]">
          {eyebrow}
        </p>
        <h2 className="mt-1 text-xl font-semibold tracking-[-0.045em]">{title}</h2>
      </div>
      {count !== undefined && (
        <span className="text-xs text-[var(--df-muted)]">{count}</span>
      )}
    </div>
  );
}

function InfoRow({ icon: Icon, label, value, href }) {
  const content = value || "Not provided";

  return (
    <div className="flex min-w-0 gap-3 border-b border-[var(--df-line-soft)] py-3 last:border-0">
      <Icon size={16} className="mt-0.5 shrink-0 text-[var(--df-muted)]" />
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--df-muted)]">
          {label}
        </p>
        {href && value ? (
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            className="mt-1 inline-flex max-w-full items-center gap-1 break-all text-sm font-medium underline decoration-[var(--df-line)] underline-offset-4 hover:decoration-current"
          >
            {content}
            <ExternalLink size={12} className="shrink-0" />
          </a>
        ) : (
          <p className="mt-1 break-words text-sm font-medium">{content}</p>
        )}
      </div>
    </div>
  );
}

function DocumentCard({ title, document, applicationId, type }) {
  const available = Boolean(document);

  // This route must authorize the admin and resolve the document from the
  // application record. It must not accept a client-supplied storage key.
  const downloadUrl = available
    ? `/api/admin/applications/${encodeURIComponent(applicationId)}/documents/${type}`
    : null;

  return (
    <div className="flex flex-col gap-4 border border-[var(--df-line)] bg-[var(--df-paper)] p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
      <div className="flex min-w-0 items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center border border-[var(--df-line)] bg-[var(--df-paper-2)]">
          <FileText size={19} />
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-semibold">{title}</h3>
          <p className="mt-1 text-xs text-[var(--df-muted)]">
            {available
              ? `${humanize(document.type)} · Uploaded ${formatDate(document.createdAt)}`
              : "No document attached to this application"}
          </p>
          {available && document.status && (
            <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--df-muted)]">
              File status: {humanize(document.status)}
            </p>
          )}
        </div>
      </div>

      {available ? (
        <a
          href={downloadUrl}
          className="inline-flex h-10 shrink-0 items-center justify-center gap-2 border border-[var(--df-line)] px-3 text-xs font-semibold transition hover:border-[var(--df-black)] hover:bg-[var(--df-black)] hover:text-white"
        >
          <Download size={14} />
          Open document
          <ExternalLink size={12} />
        </a>
      ) : (
        <span className="text-xs text-[var(--df-soft)]">Unavailable</span>
      )}
    </div>
  );
}

function StatCard({ label, value, icon: Icon }) {
  return (
    <div className="border border-[var(--df-line)] p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--df-muted)]">
          {label}
        </p>
        <Icon size={15} className="text-[var(--df-muted)]" />
      </div>
      <p className="mt-3 text-2xl font-semibold tracking-[-0.06em]">{value ?? 0}</p>
    </div>
  );
}

export default function AdminApplicationDetailPage() {
  const { id } = useParams();
  const dispatch = useDispatch();

  const {
    currentApplication,
    loadingDetail,
    errorDetail,
  } = useSelector((state) => state.applications);

  const application =
    currentApplication?.id === id ? currentApplication : null;

  useEffect(() => {
    if (id) dispatch(fetchAdminApplicationById(id));

    return () => {
      dispatch(clearCurrentApplication());
    };
  }, [dispatch, id]);

  if (loadingDetail && !application) {
    return (
      <main className="min-h-screen bg-[var(--df-paper)] px-4 py-10 sm:px-8">
        <div className="mx-auto max-w-[1200px] animate-pulse">
          <div className="h-4 w-36 bg-[var(--df-paper-3)]" />
          <div className="mt-8 h-12 w-2/3 bg-[var(--df-paper-3)]" />
          <div className="mt-8 grid gap-5 lg:grid-cols-[1.4fr_.8fr]">
            <div className="h-64 border border-[var(--df-line)] bg-[var(--df-paper-2)]" />
            <div className="h-64 border border-[var(--df-line)] bg-[var(--df-paper-2)]" />
          </div>
          <div className="mt-5 h-60 border border-[var(--df-line)] bg-[var(--df-paper-2)]" />
        </div>
      </main>
    );
  }

  if (errorDetail || !application) {
    return (
      <main className="min-h-screen bg-[var(--df-paper)] px-4 py-10 sm:px-8">
        <div className="mx-auto max-w-2xl border border-[var(--df-line)] p-6 sm:p-9">
          <div className="flex h-12 w-12 items-center justify-center border border-rose-200 bg-rose-50 text-rose-700">
            <CircleX size={22} />
          </div>
          <h1 className="mt-5 text-2xl font-semibold tracking-[-0.05em]">
            Application unavailable
          </h1>
          <p className="mt-2 text-sm leading-6 text-[var(--df-muted)]">
            {typeof errorDetail === "string"
              ? errorDetail
              : "This application could not be loaded. It may have been removed or you may not have permission to view it."}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => dispatch(fetchAdminApplicationById(id))}
              className="inline-flex h-10 items-center gap-2 bg-[var(--df-black)] px-4 text-sm font-semibold text-white"
            >
              <RefreshCw size={14} /> Try again
            </button>
            <Link
              href="/dashboard/admin/applications"
              className="inline-flex h-10 items-center border border-[var(--df-line)] px-4 text-sm font-semibold"
            >
              Back to applications
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const applicant = application.developerProfile?.user;
  const profile = application.developerProfile;
  const job = application.job;
  const company = job?.company;
  const recruiter = job?.recruiter?.user;
  const stats = application.jobApplicationStats;
  const breakdown = stats?.breakdown || {};

  return (
    <main className="min-h-screen bg-[var(--df-paper)] text-[var(--df-text)]">
      <div className="mx-auto max-w-[1440px] px-4 py-7 sm:px-6 lg:px-10 lg:py-10">
        <Link
          href="/dashboard/admin/applications"
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--df-muted)] transition hover:text-[var(--df-text)]"
        >
          <ArrowLeft size={15} />
          All applications
        </Link>

        <div className="mt-7 flex flex-col justify-between gap-6 border-b border-[var(--df-line)] pb-7 lg:flex-row lg:items-end">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--df-muted)]">
              Application record / {application.id}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-semibold tracking-[-0.065em] sm:text-5xl">
                Application review<span className="text-[var(--df-muted)]">.</span>
              </h1>
              <StatusBadge status={application.status} />
            </div>
            <p className="mt-3 text-sm text-[var(--df-muted)]">
              Submitted {formatDate(application.createdAt, true)}
              {application.updatedAt && (
                <> · Last updated {formatDate(application.updatedAt, true)}</>
              )}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {applicant?.email && (
              <a
                href={`mailto:${applicant.email}`}
                className="inline-flex h-10 items-center gap-2 border border-[var(--df-line)] px-3 text-xs font-semibold transition hover:bg-[var(--df-paper-2)]"
              >
                <Mail size={14} /> Contact applicant
              </a>
            )}
            {job?.id && (
              <Link
                href={`/dashboard/admin/jobs/${job.id}`}
                className="inline-flex h-10 items-center gap-2 bg-[var(--df-black)] px-3 text-xs font-semibold text-white transition hover:opacity-85"
              >
                <BriefcaseBusiness size={14} /> View job
              </Link>
            )}
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Applications for job" value={stats?.total} icon={Users} />
          <StatCard label="Pending" value={breakdown.PENDING} icon={Clock3} />
          <StatCard label="Accepted" value={breakdown.ACCEPTED} icon={CircleCheck} />
          <StatCard label="Rejected" value={breakdown.REJECTED} icon={CircleX} />
        </div>

        <div className="mt-8 grid items-start gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(330px,.8fr)]">
          <div className="min-w-0 space-y-6">
            <section className="border border-[var(--df-line)]">
              <div className="flex flex-col gap-4 border-b border-[var(--df-line)] p-5 sm:flex-row sm:items-center sm:p-6">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center border border-[var(--df-line)] bg-[var(--df-paper-2)] text-sm font-semibold">
                  {initials(applicant?.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--df-muted)]">
                    Applicant profile
                  </p>
                  <h2 className="mt-1 break-words text-2xl font-semibold tracking-[-0.05em]">
                    {applicant?.name || "Unknown applicant"}
                  </h2>
                  <p className="mt-1 break-all text-sm text-[var(--df-muted)]">
                    {applicant?.email || "Email unavailable"}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className={`inline-flex items-center gap-1.5 border px-2 py-1 text-[10px] font-semibold uppercase ${
                    applicant?.isVerified
                      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                      : "border-[var(--df-line)] text-[var(--df-muted)]"
                  }`}>
                    {applicant?.isVerified ? <ShieldCheck size={12} /> : <ShieldAlert size={12} />}
                    {applicant?.isVerified ? "Verified" : "Unverified"}
                  </span>
                  <span className={`border px-2 py-1 text-[10px] font-semibold uppercase ${
                    applicant?.isActive
                      ? "border-[var(--df-line)] text-[var(--df-text)]"
                      : "border-rose-200 bg-rose-50 text-rose-800"
                  }`}>
                    {applicant?.isActive ? "Active account" : "Inactive account"}
                  </span>
                </div>
              </div>

              <div className="grid gap-x-8 px-5 py-2 sm:grid-cols-2 sm:px-6">
                <InfoRow icon={Mail} label="Email address" value={applicant?.email} />
                <InfoRow icon={Hash} label="Developer profile ID" value={profile?.id} />
                <InfoRow icon={CalendarDays} label="Account created" value={formatDate(applicant?.createdAt)} />
                <InfoRow icon={ShieldCheck} label="Account verification" value={applicant?.isVerified ? "Verified" : "Not verified"} />
              </div>
            </section>

            <section className="border border-[var(--df-line)] p-5 sm:p-6">
              <SectionHeading eyebrow="Submitted materials" title="Application documents" />
              <div className="space-y-3">
                <DocumentCard
                  title="Resume / CV"
                  document={application.resume}
                  applicationId={application.id}
                  type="resume"
                />
                <DocumentCard
                  title="Cover letter"
                  document={application.coverLetter}
                  applicationId={application.id}
                  type="cover-letter"
                />
              </div>
              <p className="mt-4 text-xs leading-5 text-[var(--df-muted)]">
                Documents open through an authenticated admin endpoint. Access
                is subject to file availability and your server's document permissions.
              </p>
            </section>

            {application.rejectionReason && (
              <section className="border border-rose-200 bg-rose-50 p-5 sm:p-6">
                <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-rose-700">
                  Recorded rejection reason
                </p>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-rose-950">
                  {application.rejectionReason}
                </p>
              </section>
            )}
          </div>

          <aside className="min-w-0 space-y-6">
            <section className="border border-[var(--df-line)] p-5 sm:p-6">
              <SectionHeading eyebrow="Opportunity" title="Job details" />
              <div className="flex items-start gap-3 border-b border-[var(--df-line)] pb-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center border border-[var(--df-line)] bg-[var(--df-paper-2)]">
                  <BriefcaseBusiness size={19} />
                </div>
                <div className="min-w-0">
                  <h3 className="break-words font-semibold">
                    {job?.title || "Job details unavailable"}
                  </h3>
                  {job?.id && (
                    <p className="mt-1 break-all text-xs text-[var(--df-muted)]">
                      Job ID: {job.id}
                    </p>
                  )}
                </div>
              </div>
              <InfoRow icon={Building2} label="Company" value={company?.name} />
              <InfoRow icon={Globe} label="Industry" value={company?.industry} />
              <InfoRow icon={MapPin} label="Country" value={company?.country} />
              <InfoRow icon={ShieldCheck} label="Company verification" value={company?.isVerified ? "Verified company" : "Not verified"} />
              <InfoRow icon={CalendarDays} label="Application submitted" value={formatDate(application.createdAt, true)} />
              {company?.websiteUrl && (
                <InfoRow icon={Globe} label="Company website" value={company.websiteUrl} href={company.websiteUrl} />
              )}
            </section>

            <section className="border border-[var(--df-line)] p-5 sm:p-6">
              <SectionHeading eyebrow="Hiring team" title="Recruiter" />
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center border border-[var(--df-line)] bg-[var(--df-paper-2)] text-xs font-semibold">
                  {initials(recruiter?.name)}
                </div>
                <div className="min-w-0">
                  <p className="break-words text-sm font-semibold">
                    {recruiter?.name || "Recruiter unavailable"}
                  </p>
                  <p className="mt-1 break-all text-xs text-[var(--df-muted)]">
                    {recruiter?.email || "No email available"}
                  </p>
                </div>
              </div>
              {recruiter?.email && (
                <a
                  href={`mailto:${recruiter.email}`}
                  className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 border border-[var(--df-line)] text-xs font-semibold transition hover:bg-[var(--df-paper-2)]"
                >
                  <Mail size={14} /> Email recruiter
                </a>
              )}
            </section>

            <section className="border border-[var(--df-line)] p-5 sm:p-6">
              <SectionHeading eyebrow="Job pipeline" title="Application breakdown" />
              {[
                ["Pending", breakdown.PENDING],
                ["In review", breakdown.REVIEW],
                ["Accepted", breakdown.ACCEPTED],
                ["Rejected", breakdown.REJECTED],
              ].map(([label, value]) => {
                const percentage = stats?.total
                  ? Math.round(((value || 0) / stats.total) * 100)
                  : 0;

                return (
                  <div key={label} className="mb-4 last:mb-0">
                    <div className="mb-2 flex items-center justify-between gap-3 text-xs">
                      <span className="text-[var(--df-muted)]">{label}</span>
                      <span className="font-semibold">{value || 0}</span>
                    </div>
                    <div className="h-1.5 w-full bg-[var(--df-paper-3)]">
                      <div
                        className="h-full bg-[var(--df-black)] transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
              <p className="mt-4 border-t border-[var(--df-line)] pt-4 text-xs leading-5 text-[var(--df-muted)]">
                Counts are calculated across all applications for this job, not
                just the current list page.
              </p>
            </section>
          </aside>
        </div>

        <footer className="mt-8 flex flex-col gap-3 border-t border-[var(--df-line)] pt-5 text-xs text-[var(--df-muted)] sm:flex-row sm:items-center sm:justify-between">
          <span>Application record: {application.id}</span>
          <span className="inline-flex items-center gap-2">
            <Activity size={13} />
            Last updated {formatDate(application.updatedAt, true)}
          </span>
        </footer>
      </div>
    </main>
  );
}
