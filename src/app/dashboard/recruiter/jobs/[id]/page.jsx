"use client";

import { useEffect, useMemo, useState } from "react";
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
  DollarSign,
  Edit3,
  ExternalLink,
  Globe2,
  MapPin,
  Pencil,
  Trash2,
  Users,
  X,
} from "lucide-react";

import {
  clearCurrentJob,
  deleteJob,
  fetchJobById,
  updateJobStatus,
} from "@/lib/redux/slices/jobSlice";

function formatDate(date) {
  if (!date) return "—";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

function formatDateTime(date) {
  if (!date) return "—";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date));
}

function formatSalary(job) {
  if (
    job.minSalary == null &&
    job.maxSalary == null
  ) {
    return "Not specified";
  }

  const currency = job.currency || "";

  const formatter = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  });

  if (
    job.minSalary != null &&
    job.maxSalary != null
  ) {
    return `${currency} ${formatter.format(
      Number(job.minSalary)
    )} – ${formatter.format(
      Number(job.maxSalary)
    )}`;
  }

  if (job.minSalary != null) {
    return `${currency} ${formatter.format(
      Number(job.minSalary)
    )}+`;
  }

  return `Up to ${currency} ${formatter.format(
    Number(job.maxSalary)
  )}`;
}

function formatLabel(value) {
  return value?.replaceAll("_", " ") || "—";
}

function StatusBadge({ status }) {
  const statusClass =
    status?.toLowerCase() || "unknown";

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] status-${statusClass}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {formatLabel(status)}
    </span>
  );
}

export default function RecruiterJobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useDispatch();

  const {
    currentJob,
    loadingDetail,
    errorDetail,
  } = useSelector((state) => state.jobs);

  const [showDelete, setShowDelete] =
    useState(false);

  const [showStatus, setShowStatus] =
    useState(false);

  const [changingStatus, setChangingStatus] =
    useState(false);

  const [deleting, setDeleting] =
    useState(false);

  const id = params.id;

  useEffect(() => {
    dispatch(clearCurrentJob());
    dispatch(fetchJobById(id));

    return () => {
      dispatch(clearCurrentJob());
    };
  }, [dispatch, id]);

  const handleStatus = async (status) => {
    try {
      setChangingStatus(true);

      await dispatch(
        updateJobStatus({
          id,
          status,
        })
      ).unwrap();

      setShowStatus(false);
    } catch {
      // Redux owns the error state.
    } finally {
      setChangingStatus(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);

      await dispatch(deleteJob(id)).unwrap();

      router.replace(
        "/dashboard/recruiter/jobs"
      );
    } catch {
      setDeleting(false);
    }
  };

  if (loadingDetail) {
    return <DetailSkeleton />;
  }

  if (errorDetail || !currentJob) {
    return (
      <main className="min-h-screen bg-[var(--df-paper)] px-4 py-10 text-[var(--df-text)] sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <Link
            href="/dashboard/recruiter/jobs"
            className="inline-flex items-center gap-2 text-xs font-medium text-[var(--df-muted)] hover:text-[var(--df-text)]"
          >
            <ArrowLeft size={14} />
            Back to jobs
          </Link>

          <div className="mt-12 border border-[var(--df-line)] p-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center border border-[var(--df-line)]">
              <BriefcaseBusiness size={18} />
            </div>

            <h1 className="mt-5 text-2xl font-semibold">
              Job not found
            </h1>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--df-muted)]">
              {errorDetail ||
                "This job could not be loaded or no longer exists."}
            </p>

            <Link
              href="/dashboard/recruiter/jobs"
              className="mt-6 inline-flex h-10 items-center gap-2 bg-[var(--df-text)] px-4 text-xs font-semibold text-[var(--df-paper)]"
            >
              View all jobs
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const job = currentJob;

  const applicationCount =
    job._count?.applications ??
    job.applicationCount ??
    0;

  const canActivate =
    job.status === "DRAFT";

  const canClose =
    job.status === "ACTIVE";

  const statusActionLabel =
    job.status === "DRAFT"
      ? "Publish job"
      : job.status === "ACTIVE"
      ? "Close job"
      : null;

  return (
    <main className="min-h-screen bg-[var(--df-paper)] text-[var(--df-text)]">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* Top navigation */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/dashboard/recruiter/jobs"
            className="inline-flex items-center gap-2 text-xs font-medium text-[var(--df-muted)] transition-colors hover:text-[var(--df-text)]"
          >
            <ArrowLeft size={14} />
            All jobs
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href={`/dashboard/recruiter/jobs/${job.id}/edit`}
              className="inline-flex h-9 items-center gap-2 border border-[var(--df-line)] px-3 text-xs font-semibold hover:border-[var(--df-text)]"
            >
              <Edit3 size={14} />
              Edit
            </Link>

            <button
              onClick={() => setShowDelete(true)}
              className="inline-flex h-9 items-center gap-2 border border-red-200 px-3 text-xs font-semibold text-red-600 hover:bg-red-50"
            >
              <Trash2 size={14} />
              Delete
            </button>
          </div>
        </div>

        {/* Hero */}
        <header className="mt-6 border border-[var(--df-line)]">
          <div className="p-5 sm:p-7 lg:p-8">
            <div className="flex flex-col gap-7 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={job.status} />

                  {job.isFeatured && (
                    <span className="rounded-full border border-[var(--df-line)] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.08em]">
                      Featured
                    </span>
                  )}
                </div>

                <h1 className="mt-4 max-w-4xl text-3xl font-semibold tracking-[-0.045em] sm:text-4xl lg:text-5xl">
                  {job.title}
                </h1>

                <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-[var(--df-muted)]">
                  <span className="inline-flex items-center gap-2 font-medium text-[var(--df-text)]">
                    <Building2 size={15} />
                    {job.company?.name ||
                      "Your company"}
                  </span>

                  {job.company?.isVerified && (
                    <span className="inline-flex items-center gap-1.5 text-xs">
                      <CheckCircle2
                        size={14}
                      />
                      Verified company
                    </span>
                  )}

                  <span>
                    Posted {formatDate(job.createdAt)}
                  </span>
                </div>
              </div>

              {/* Primary action */}
              {statusActionLabel && (
                <button
                  onClick={() =>
                    setShowStatus(true)
                  }
                  className="inline-flex h-11 shrink-0 items-center justify-center gap-2 bg-[var(--df-text)] px-5 text-xs font-semibold text-[var(--df-paper)] hover:opacity-85"
                >
                  {job.status === "DRAFT" ? (
                    <ArrowUpRight size={15} />
                  ) : (
                    <X size={15} />
                  )}

                  {statusActionLabel}
                </button>
              )}
            </div>

            {/* Key metrics */}
            <div className="mt-8 grid border border-[var(--df-line)] sm:grid-cols-2 lg:grid-cols-4">
              <Metric
                label="Applications"
                value={applicationCount}
                icon={Users}
              />

              <Metric
                label="Deadline"
                value={formatDate(job.deadline)}
                icon={CalendarDays}
              />

              <Metric
                label="Compensation"
                value={formatSalary(job)}
                icon={DollarSign}
              />

              <Metric
                label="Location"
                value={formatLabel(
                  job.locationPreference
                )}
                icon={MapPin}
              />
            </div>
          </div>
        </header>

        {/* Main content */}
        <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
          {/* Main */}
          <div className="space-y-5">
            {/* Description */}
            <section className="border border-[var(--df-line)]">
              <SectionHeading
                title="Job description"
                description="What candidates should know about this role."
              />

              <div className="border-t border-[var(--df-line)] p-5 sm:p-7">
                {job.description ? (
                  <div className="space-y-4 text-sm leading-7 text-[var(--df-muted)]">
                    {job.description
                      .split("\n")
                      .filter(Boolean)
                      .map(
                        (paragraph, index) => (
                          <p key={index}>
                            {paragraph}
                          </p>
                        )
                      )}
                  </div>
                ) : (
                  <p className="text-sm text-[var(--df-muted)]">
                    No job description has been
                    added yet.
                  </p>
                )}
              </div>
            </section>

            {/* Skills */}
            {job.skills?.length > 0 && (
              <section className="border border-[var(--df-line)]">
                <SectionHeading
                  title="Required skills"
                  description={`${job.skills.length} skill${
                    job.skills.length === 1
                      ? ""
                      : "s"
                  } associated with this role.`}
                />

                <div className="flex flex-wrap gap-2 border-t border-[var(--df-line)] p-5 sm:p-7">
                  {job.skills.map((skill) => (
                    <span
                      key={
                        skill.id ||
                        skill.name
                      }
                      className="border border-[var(--df-line)] px-3 py-2 text-xs font-medium"
                    >
                      {skill.name}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Recruiter */}
            <section className="border border-[var(--df-line)]">
              <SectionHeading
                title="Recruiter"
                description="The recruiter associated with this posting."
              />

              <div className="border-t border-[var(--df-line)] p-5 sm:p-7">
                <div className="flex gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center border border-[var(--df-line)] bg-[var(--df-text)] text-xs font-semibold text-[var(--df-paper)]">
                    {getInitials(
                      job.recruiter
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm font-semibold">
                      {getRecruiterName(
                        job.recruiter
                      )}
                    </p>

                    {job.recruiter
                      ?.jobTitle && (
                      <p className="mt-1 text-xs text-[var(--df-muted)]">
                        {
                          job.recruiter
                            .jobTitle
                        }
                      </p>
                    )}

                    {job.recruiter
                      ?.bio && (
                      <p className="mt-4 max-w-2xl text-sm leading-6 text-[var(--df-muted)]">
                        {
                          job.recruiter
                            .bio
                        }
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <aside className="space-y-5">
            {/* Job details */}
            <section className="border border-[var(--df-line)]">
              <SectionHeading title="Job details" />

              <div className="border-t border-[var(--df-line)]">
                <DetailRow
                  label="Employment"
                  value={formatLabel(
                    job.employmentType
                  )}
                  icon={BriefcaseBusiness}
                />

                <DetailRow
                  label="Experience"
                  value={formatLabel(
                    job.experienceLevel
                  )}
                />

                <DetailRow
                  label="Location"
                  value={formatLabel(
                    job.locationPreference
                  )}
                  icon={MapPin}
                />

                <DetailRow
                  label="Salary"
                  value={formatSalary(job)}
                  icon={DollarSign}
                />

                <DetailRow
                  label="Deadline"
                  value={formatDate(
                    job.deadline
                  )}
                  icon={CalendarDays}
                />

                <DetailRow
                  label="Created"
                  value={formatDate(
                    job.createdAt
                  )}
                />

                {job.publishedAt && (
                  <DetailRow
                    label="Published"
                    value={formatDate(
                      job.publishedAt
                    )}
                  />
                )}

                {job.updatedAt && (
                  <DetailRow
                    label="Updated"
                    value={formatDate(
                      job.updatedAt
                    )}
                  />
                )}
              </div>
            </section>

            {/* Company */}
            <section className="border border-[var(--df-line)]">
              <SectionHeading title="Company" />

              <div className="border-t border-[var(--df-line)] p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden border border-[var(--df-line)]">
                    {job.company?.logo ? (
                      <img
                        src={job.company.logo}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Building2
                        size={18}
                        className="text-[var(--df-muted)]"
                      />
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm font-semibold">
                      {job.company
                        ?.name ||
                        "Your company"}
                    </p>

                    {job.company
                      ?.isVerified && (
                      <p className="mt-1 inline-flex items-center gap-1 text-[10px] font-medium text-[var(--df-muted)]">
                        <CheckCircle2
                          size={12}
                        />
                        Verified
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-5 space-y-3 text-xs">
                  {job.company?.industry && (
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-[var(--df-muted)]">
                        Industry
                      </span>

                      <span className="text-right font-medium">
                        {formatLabel(
                          job.company
                            .industry
                        )}
                      </span>
                    </div>
                  )}

                  {job.company?.country && (
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-[var(--df-muted)]">
                        Country
                      </span>

                      <span className="text-right font-medium">
                        {formatLabel(
                          job.company
                            .country
                        )}
                      </span>
                    </div>
                  )}
                </div>

                {job.company
                  ?.websiteUrl && (
                  <a
                    href={
                      job.company
                        .websiteUrl
                    }
                    target="_blank"
                    rel="noreferrer"
                    className="mt-5 inline-flex w-full items-center justify-center gap-2 border border-[var(--df-line)] px-3 py-2.5 text-xs font-semibold hover:border-[var(--df-text)]"
                  >
                    <Globe2 size={14} />
                    Visit website
                    <ExternalLink
                      size={12}
                    />
                  </a>
                )}
              </div>
            </section>

            {/* Record info */}
            <section className="border border-[var(--df-line)]">
              <SectionHeading title="Posting record" />

              <div className="border-t border-[var(--df-line)] p-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--df-muted)]">
                  Job ID
                </p>

                <p className="mt-2 break-all font-mono text-[10px] leading-5 text-[var(--df-muted)]">
                  {job.id}
                </p>

                {job.updatedAt && (
                  <div className="mt-5 flex items-center gap-2 text-[10px] text-[var(--df-muted)]">
                    <Clock3 size={12} />
                    Last updated{" "}
                    {formatDateTime(
                      job.updatedAt
                    )}
                  </div>
                )}
              </div>
            </section>
          </aside>
        </div>
      </div>

      {showStatus && (
        <StatusModal
          job={job}
          loading={changingStatus}
          onClose={() =>
            setShowStatus(false)
          }
          onConfirm={handleStatus}
        />
      )}

      {showDelete && (
        <DeleteModal
          job={job}
          deleting={deleting}
          onCancel={() =>
            !deleting &&
            setShowDelete(false)
          }
          onConfirm={handleDelete}
        />
      )}
    </main>
  );
}

function Metric({
  label,
  value,
  icon: Icon,
}) {
  return (
    <div className="border-b border-[var(--df-line)] p-4 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0">
      <div className="flex items-center gap-2 text-[var(--df-muted)]">
        <Icon size={14} />

        <span className="text-[10px] font-semibold uppercase tracking-[0.1em]">
          {label}
        </span>
      </div>

      <p className="mt-3 truncate text-sm font-semibold">
        {value}
      </p>
    </div>
  );
}

function SectionHeading({
  title,
  description,
}) {
  return (
    <div className="px-5 py-5 sm:px-7">
      <h2 className="text-sm font-semibold tracking-[-0.02em]">
        {title}
      </h2>

      {description && (
        <p className="mt-1 text-xs leading-5 text-[var(--df-muted)]">
          {description}
        </p>
      )}
    </div>
  );
}

function DetailRow({
  label,
  value,
  icon: Icon,
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[var(--df-line)] px-5 py-4 last:border-b-0">
      <div className="flex min-w-0 items-center gap-2">
        {Icon && (
          <Icon
            size={14}
            className="shrink-0 text-[var(--df-muted)]"
          />
        )}

        <span className="text-xs text-[var(--df-muted)]">
          {label}
        </span>
      </div>

      <span className="text-right text-xs font-semibold">
        {value || "—"}
      </span>
    </div>
  );
}

function getRecruiterName(recruiter) {
  if (!recruiter) return "Recruiter";

  return (
    recruiter.user?.name ||
    recruiter.name ||
    [
      recruiter.user?.firstName,
      recruiter.user?.lastName,
    ]
      .filter(Boolean)
      .join(" ") ||
    "Recruiter"
  );
}

function getInitials(recruiter) {
  const name = getRecruiterName(
    recruiter
  );

  if (!name || name === "Recruiter") {
    return "R";
  }

  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function StatusModal({
  job,
  loading,
  onClose,
  onConfirm,
}) {
  const nextStatus =
    job.status === "DRAFT"
      ? "ACTIVE"
      : job.status === "ACTIVE"
      ? "CLOSED"
      : null;

  if (!nextStatus) return null;

  const isPublishing =
    nextStatus === "ACTIVE";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md border border-[var(--df-line)] bg-[var(--df-paper)] p-6 shadow-2xl sm:p-7">
        <div
          className={`flex h-10 w-10 items-center justify-center ${
            isPublishing
              ? "bg-[var(--df-text)] text-[var(--df-paper)]"
              : "border border-orange-200 bg-orange-50 text-orange-600"
          }`}
        >
          {isPublishing ? (
            <ArrowUpRight size={18} />
          ) : (
            <X size={18} />
          )}
        </div>

        <h2 className="mt-5 text-xl font-semibold tracking-[-0.03em]">
          {isPublishing
            ? "Publish this job?"
            : "Close this job?"}
        </h2>

        <p className="mt-2 text-sm leading-6 text-[var(--df-muted)]">
          {isPublishing
            ? "This will make the posting available to candidates and allow applications."
            : "Closing the job will remove it from your active hiring pipeline. You can no longer treat it as an active opening."}
        </p>

        <div className="mt-7 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            onClick={onClose}
            disabled={loading}
            className="h-10 border border-[var(--df-line)] px-4 text-xs font-semibold hover:border-[var(--df-text)] disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            onClick={() =>
              onConfirm(nextStatus)
            }
            disabled={loading}
            className={`h-10 px-4 text-xs font-semibold ${
              isPublishing
                ? "bg-[var(--df-text)] text-[var(--df-paper)]"
                : "bg-orange-600 text-white"
            } disabled:opacity-50`}
          >
            {loading
              ? "Updating..."
              : isPublishing
              ? "Publish job"
              : "Close job"}
          </button>
        </div>
      </div>
    </div>
  );
}

function DeleteModal({
  job,
  deleting,
  onCancel,
  onConfirm,
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md border border-[var(--df-line)] bg-[var(--df-paper)] p-6 shadow-2xl sm:p-7">
        <div className="flex h-10 w-10 items-center justify-center border border-red-200 bg-red-50 text-red-600">
          <Trash2 size={17} />
        </div>

        <h2 className="mt-5 text-xl font-semibold tracking-[-0.03em]">
          Delete this job?
        </h2>

        <p className="mt-2 text-sm leading-6 text-[var(--df-muted)]">
          <span className="font-medium text-[var(--df-text)]">
            “{job.title}”
          </span>{" "}
          will be permanently deleted. This action cannot be
          undone.
        </p>

        <div className="mt-7 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            onClick={onCancel}
            disabled={deleting}
            className="h-10 border border-[var(--df-line)] px-4 text-xs font-semibold hover:border-[var(--df-text)] disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            disabled={deleting}
            className="h-10 bg-red-600 px-4 text-xs font-semibold text-white disabled:opacity-50"
          >
            {deleting
              ? "Deleting..."
              : "Delete job"}
          </button>
        </div>
      </div>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <main className="min-h-screen bg-[var(--df-paper)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl animate-pulse">
        <div className="h-4 w-20 bg-[var(--df-line)]" />

        <div className="mt-6 border border-[var(--df-line)] p-6 sm:p-8">
          <div className="h-5 w-20 bg-[var(--df-line)]" />
          <div className="mt-5 h-10 w-3/4 bg-[var(--df-line)]" />
          <div className="mt-3 h-4 w-48 bg-[var(--df-line)]" />

          <div className="mt-8 grid grid-cols-2 border border-[var(--df-line)] lg:grid-cols-4">
            {Array.from({ length: 4 }).map(
              (_, index) => (
                <div
                  key={index}
                  className="border-r border-[var(--df-line)] p-5"
                >
                  <div className="h-3 w-20 bg-[var(--df-line)]" />
                  <div className="mt-3 h-4 w-28 bg-[var(--df-line)]" />
                </div>
              )
            )}
          </div>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-5">
            <SkeletonBlock height="h-72" />
            <SkeletonBlock height="h-40" />
          </div>

          <div className="space-y-5">
            <SkeletonBlock height="h-72" />
            <SkeletonBlock height="h-48" />
          </div>
        </div>
      </div>
    </main>
  );
}

function SkeletonBlock({ height }) {
  return (
    <div
      className={`border border-[var(--df-line)] ${height}`}
    >
      <div className="border-b border-[var(--df-line)] p-5">
        <div className="h-4 w-24 bg-[var(--df-line)]" />
      </div>

      <div className="space-y-3 p-5">
        <div className="h-3 w-full bg-[var(--df-line)]" />
        <div className="h-3 w-5/6 bg-[var(--df-line)]" />
        <div className="h-3 w-4/6 bg-[var(--df-line)]" />
      </div>
    </div>
  );
}