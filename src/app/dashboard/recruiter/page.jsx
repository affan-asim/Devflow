"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  CheckCircle2,
  Clock3,
  FileText,
  Plus,
  Users,
  Bell,
  Building2,
} from "lucide-react";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

import {
  fetchRecruiterDashboard,
  clearRecruiterErrors,
} from "@/lib/redux/slices/recruiterSlice";

const formatDate = (date) => {
  if (!date) return "—";

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
};

const formatRelativeTime = (date) => {
  if (!date) return "";

  const diff = Date.now() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;

  return formatDate(date);
};

const statusLabel = (status) => {
  const labels = {
    PENDING: "Pending",
    REVIEW: "Review",
    ACCEPTED: "Accepted",
    REJECTED: "Rejected",
  };

  return labels[status] || status || "Unknown";
};

const statusClass = (status) => {
  const classes = {
    PENDING: "bg-[var(--df-paper)] text-[var(--df-text)]",
    REVIEW: "bg-[var(--df-text)] text-[var(--df-paper)]",
    ACCEPTED: "bg-[var(--df-paper)] text-[var(--df-text)]",
    REJECTED: "bg-[var(--df-muted)]/10 text-[var(--df-muted)]",
  };

  return classes[status] || classes.PENDING;
};

const getApplicantName = (application) => {
  return (
    application?.developer?.user?.name ||
    application?.devProfile?.user?.name ||
    application?.developerProfile?.user?.name ||
    "Applicant"
  );
};

export default function RecruiterDashboardPage() {
  const dispatch = useDispatch();

  const {
    dashboard,
    loadingDashboard,
    errorDashboard,
  } = useSelector((state) => state.recruiter);

  useEffect(() => {
    dispatch(clearRecruiterErrors());
    dispatch(fetchRecruiterDashboard("CompanyRecuiter"));
  }, [dispatch]);

  if (loadingDashboard && !dashboard) {
    return <RecruiterDashboardSkeleton />;
  }

  if (errorDashboard && !dashboard) {
    return (
      <main className="min-h-screen bg-[var(--df-paper)] px-6 py-12">
        <div className="mx-auto max-w-7xl">
          <div className="border-y border-[var(--df-line)] py-16 text-center">
            <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-[var(--df-muted)]">
              Dashboard Error
            </p>

            <h1 className="text-3xl font-medium tracking-tight text-[var(--df-text)]">
              Unable to load your dashboard
            </h1>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[var(--df-muted)]">
              {errorDashboard}
            </p>

            <button
              onClick={() => dispatch(fetchRecruiterDashboard())}
              className="mt-8 border border-[var(--df-text)] bg-[var(--df-text)] px-5 py-3 text-xs font-medium uppercase tracking-[0.16em] text-[var(--df-paper)] transition-opacity hover:opacity-80"
            >
              Try again
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (!dashboard) return null;

  const {
    profile,
    company,
    stats,
    applicationAnalytics,
    recentApplications = [],
    recentActiveJobs = [],
    recentNotifications = [],
  } = dashboard;

  const distribution =
    applicationAnalytics?.statusDistribution || {};

  const activity = applicationAnalytics?.activity || [];

  const recruiterName =
    profile?.user?.name ||
    profile?.name ||
    "Recruiter";

  return (
    <main className="min-h-screen bg-[var(--df-paper)] text-[var(--df-text)]">
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10 lg:py-12">
        {/* Header */}
        <header className="border-b border-[var(--df-line)] pb-8">
          <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
            <div>
              <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--df-muted)]">
                Recruiter / Overview
              </p>

              <h1 className="max-w-3xl text-4xl font-medium tracking-[-0.04em] sm:text-5xl lg:text-6xl">
                Welcome back, {recruiterName}.
              </h1>

              <p className="mt-5 max-w-xl text-sm leading-7 text-[var(--df-muted)]">
                Manage your company&apos;s open roles, applications, and
                hiring activity from one place.
              </p>
            </div>

            <Link
              href="/dashboard/recruiter/jobs/create"
              className="inline-flex h-12 shrink-0 items-center justify-center gap-2 bg-[var(--df-text)] px-5 text-xs font-medium uppercase tracking-[0.16em] text-[var(--df-paper)] transition-opacity hover:opacity-80"
            >
              <Plus size={15} />
              Post a job
            </Link>
          </div>
        </header>

        {/* Company */}
        <section className="border-b border-[var(--df-line)] py-6">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center border border-[var(--df-line)] bg-[var(--df-paper)]">
                {company?.logo ? (
                  <img
                    src={company.logo}
                    alt={company.name || "Company"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Building2
                    size={18}
                    className="text-[var(--df-muted)]"
                  />
                )}
              </div>

              <div>
                <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--df-muted)]">
                  Your company
                </p>

                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-medium">
                    {company?.name || "Company"}
                  </h2>

                  {company?.isVerified && (
                    <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.12em] text-[var(--df-muted)]">
                      <CheckCircle2 size={12} />
                      Verified
                    </span>
                  )}
                </div>
              </div>
            </div>

            {company?.id && (
              <Link
                href={`/dashboard/recruiter/company/${company.id}`}
                className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.15em] text-[var(--df-text)] transition-opacity hover:opacity-60"
              >
                View company
                <ArrowUpRight size={14} />
              </Link>
            )}
          </div>
        </section>

        {/* Stats */}
        <section className="grid grid-cols-2 border-b border-[var(--df-line)] md:grid-cols-4">
          <Stat
            label="Active jobs"
            value={stats?.activeJobs ?? 0}
            icon={<BriefcaseBusiness size={16} />}
          />

          <Stat
            label="Total jobs"
            value={stats?.totalJobs ?? 0}
            icon={<FileText size={16} />}
          />

          <Stat
            label="Applications"
            value={stats?.totalApplications ?? 0}
            icon={<Users size={16} />}
          />

          <Stat
            label="Pending review"
            value={stats?.pendingApplications ?? 0}
            icon={<Clock3 size={16} />}
          />
        </section>

        {/* Application overview */}
        <section className="grid border-b border-[var(--df-line)] lg:grid-cols-[0.8fr_1.2fr]">
          <div className="border-b border-[var(--df-line)] py-10 lg:border-b-0 lg:border-r lg:pr-10">
            <SectionHeading
              eyebrow="Applications"
              title="Hiring pipeline"
              action={
                <Link
                  href="/dashboard/recruiter/applications"
                  className="inline-flex items-center gap-1 text-[10px] font-medium uppercase tracking-[0.15em] text-[var(--df-text)]"
                >
                  View all
                  <ArrowUpRight size={12} />
                </Link>
              }
            />

            <div className="mt-8 space-y-0">
              <PipelineRow
                label="Pending"
                value={distribution.pending ?? 0}
              />
              <PipelineRow
                label="Review"
                value={distribution.review ?? 0}
              />
              <PipelineRow
                label="Accepted"
                value={distribution.accepted ?? 0}
              />
              <PipelineRow
                label="Rejected"
                value={distribution.rejected ?? 0}
              />
            </div>
          </div>

          <div className="py-10 lg:pl-10">
            <SectionHeading
              eyebrow="Last 30 days"
              title="Application activity"
            />

            <ActivityChart activity={activity} />
          </div>
        </section>

        {/* Recent applications + jobs */}
        <section className="grid border-b border-[var(--df-line)] lg:grid-cols-2">
          <div className="border-b border-[var(--df-line)] py-10 lg:border-b-0 lg:border-r lg:pr-10">
            <SectionHeading
              eyebrow="Latest"
              title="Recent applications"
              action={
                <Link
                  href="/dashboard/recruiter/applications"
                  className="inline-flex items-center gap-1 text-[10px] font-medium uppercase tracking-[0.15em]"
                >
                  View all
                  <ArrowUpRight size={12} />
                </Link>
              }
            />

            <div className="mt-7">
              {recentApplications.length ? (
                recentApplications.map((application) => (
                  <Link
                    key={application.id}
                    href={`/dashboard/recruiter/applications/${application.id}`}
                    className="group block border-t border-[var(--df-line)] py-5 first:border-t-0"
                  >
                    <div className="flex items-start justify-between gap-5">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {getApplicantName(application)}
                        </p>

                        <p className="mt-1 truncate text-xs text-[var(--df-muted)]">
                          {application?.job?.title || "Job application"}
                        </p>
                      </div>

                      <span
                        className={`shrink-0 px-2 py-1 text-[9px] font-medium uppercase tracking-[0.12em] ${statusClass(
                          application?.status
                        )}`}
                      >
                        {statusLabel(application?.status)}
                      </span>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-[10px] uppercase tracking-[0.12em] text-[var(--df-muted)]">
                      <span>
                        {formatRelativeTime(application?.createdAt)}
                      </span>

                      <ArrowUpRight
                        size={13}
                        className="opacity-0 transition-opacity group-hover:opacity-100"
                      />
                    </div>
                  </Link>
                ))
              ) : (
                <EmptyState text="No applications yet." />
              )}
            </div>
          </div>

          <div className="py-10 lg:pl-10">
            <SectionHeading
              eyebrow="Open roles"
              title="Recent active jobs"
              action={
                <Link
                  href="/dashboard/recruiter/jobs"
                  className="inline-flex items-center gap-1 text-[10px] font-medium uppercase tracking-[0.15em]"
                >
                  View all
                  <ArrowUpRight size={12} />
                </Link>
              }
            />

            <div className="mt-7">
              {recentActiveJobs.length ? (
                recentActiveJobs.map((job) => (
                  <Link
                    key={job.id}
                    href={`/dashboard/recruiter/jobs/${job.id}`}
                    className="group block border-t border-[var(--df-line)] py-5 first:border-t-0"
                  >
                    <div className="flex items-start justify-between gap-5">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {job.title}
                        </p>

                        <p className="mt-1 text-xs text-[var(--df-muted)]">
                          {job.employmentType || "Employment"}{" "}
                          {job.locationPreference
                            ? `· ${job.locationPreference}`
                            : ""}
                        </p>
                      </div>

                      <span className="shrink-0 text-[10px] uppercase tracking-[0.12em] text-[var(--df-muted)]">
                        Active
                      </span>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <p className="text-[10px] uppercase tracking-[0.12em] text-[var(--df-muted)]">
                        Deadline: {formatDate(job.deadline)}
                      </p>

                      <ArrowUpRight
                        size={13}
                        className="opacity-0 transition-opacity group-hover:opacity-100"
                      />
                    </div>
                  </Link>
                ))
              ) : (
                <EmptyState text="No active jobs yet." />
              )}
            </div>
          </div>
        </section>

        {/* Notifications */}
        <section className="py-10">
          <SectionHeading
            eyebrow="Activity"
            title="Recent notifications"
            action={
              <Link
                href="/dashboard/recruiter/notifications"
                className="inline-flex items-center gap-1 text-[10px] font-medium uppercase tracking-[0.15em]"
              >
                View all
                <ArrowUpRight size={12} />
              </Link>
            }
          />

          <div className="mt-7">
            {recentNotifications.length ? (
              <div className="grid border-t border-[var(--df-line)] md:grid-cols-2 md:divide-x md:divide-[var(--df-line)]">
                {recentNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="border-b border-[var(--df-line)] py-5 md:px-6 md:first:pl-0"
                  >
                    <div className="flex gap-4">
                      <div className="mt-0.5 shrink-0">
                        <Bell
                          size={15}
                          className={
                            notification.isRead
                              ? "text-[var(--df-muted)]"
                              : "text-[var(--df-text)]"
                          }
                        />
                      </div>

                      <div className="min-w-0">
                        <p className="text-sm leading-6">
                          {notification.message}
                        </p>

                        <p className="mt-2 text-[10px] uppercase tracking-[0.12em] text-[var(--df-muted)]">
                          {formatRelativeTime(notification.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState text="No recent notifications." />
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function Stat({ label, value, icon }) {
  return (
    <div className="border-r border-[var(--df-line)] px-5 py-7 first:pl-0 md:px-7">
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-[0.16em] text-[var(--df-muted)]">
          {label}
        </span>

        <span className="text-[var(--df-muted)]">{icon}</span>
      </div>

      <p className="mt-5 text-3xl font-medium tracking-[-0.04em]">
        {value}
      </p>
    </div>
  );
}

function SectionHeading({ eyebrow, title, action }) {
  return (
    <div className="flex items-end justify-between gap-5">
      <div>
        <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[var(--df-muted)]">
          {eyebrow}
        </p>

        <h2 className="mt-2 text-2xl font-medium tracking-[-0.03em]">
          {title}
        </h2>
      </div>

      {action}
    </div>
  );
}

function PipelineRow({ label, value }) {
  return (
    <div className="flex items-center justify-between border-t border-[var(--df-line)] py-4 first:border-t-0">
      <span className="text-sm">{label}</span>

      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="border border-[var(--df-line)] bg-[var(--df-paper)] px-3 py-2 shadow-sm">
        <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-[var(--df-muted)]">
          {label}
        </p>
        <p className="mt-1 text-xs font-semibold text-[var(--df-text)]">
          {payload[0].value} {payload[0].value === 1 ? "application" : "applications"}
        </p>
      </div>
    );
  }
  return null;
}

function ActivityChart({ activity = [] }) {
  if (!activity.length) {
    return (
      <div className="mt-8 flex h-52 items-center justify-center border-y border-[var(--df-line)]">
        <p className="text-xs uppercase tracking-[0.15em] text-[var(--df-muted)]">
          No activity yet
        </p>
      </div>
    );
  }

  // Ensure chronological order and proper formatting
  const chartData = [...activity]
    .reverse()
    .map((item) => ({
      date: new Date(item.date).toLocaleDateString("en", {
        month: "short",
        day: "numeric",
      }),
      count: Number(item.count) || 0,
    }));

  return (
    <div className="mt-8 h-52 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "var(--df-muted)", fontSize: 10 }}
            interval="preserveStartEnd"
          />
          <YAxis
            allowDecimals={false}
            axisLine={false}
            tickLine={false}
            tick={{ fill: "var(--df-muted)", fontSize: 10 }}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(0,0,0,0.04)" }} />
          <Bar
            dataKey="count"
            fill="var(--df-text)"
            radius={[2, 2, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div className="border-t border-[var(--df-line)] py-10 text-center">
      <p className="text-xs uppercase tracking-[0.15em] text-[var(--df-muted)]">
        {text}
      </p>
    </div>
  );
}

function RecruiterDashboardSkeleton() {
  return (
    <main className="min-h-screen bg-[var(--df-paper)]">
      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-10">
        <div className="animate-pulse">
          <div className="border-b border-[var(--df-line)] pb-10">
            <div className="h-3 w-28 bg-[var(--df-line)]" />
            <div className="mt-6 h-14 max-w-xl bg-[var(--df-line)]" />
            <div className="mt-5 h-4 max-w-lg bg-[var(--df-line)]" />
          </div>

          <div className="grid grid-cols-2 border-b border-[var(--df-line)] md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="border-r border-[var(--df-line)] py-8"
              >
                <div className="h-3 w-20 bg-[var(--df-line)]" />
                <div className="mt-5 h-9 w-16 bg-[var(--df-line)]" />
              </div>
            ))}
          </div>

          <div className="grid gap-10 border-b border-[var(--df-line)] py-12 lg:grid-cols-2">
            <div>
              <div className="h-3 w-20 bg-[var(--df-line)]" />
              <div className="mt-3 h-7 w-40 bg-[var(--df-line)]" />
              <div className="mt-8 h-48 bg-[var(--df-line)]" />
            </div>

            <div>
              <div className="h-3 w-20 bg-[var(--df-line)]" />
              <div className="mt-3 h-7 w-40 bg-[var(--df-line)]" />
              <div className="mt-8 h-48 bg-[var(--df-line)]" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}