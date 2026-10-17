"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
Activity,
ArrowDownRight,
ArrowRight,
ArrowUpRight,
BriefcaseBusiness,
Building2,
CheckCircle2,
Clock3,
FileText,
Mail,
RefreshCw,
ShieldCheck,
Users,
} from "lucide-react";

import {
fetchAdminUserAnalytics,
fetchAdminJobAnalytics,
fetchAdminApplicationAnalytics,
fetchAdminCompanyAnalytics,
clearAdminAnalyticsErrors,
} from "@/lib/redux/slices/adminAnalyticsSlice";
import { fetchAdminHealthMetrics } from "@/lib/redux/slices/adminHealthSlice";

const PERIODS = [
{ label: "7 days", value: "7" },
{ label: "30 days", value: "30" },
{ label: "90 days", value: "90" },
{ label: "12 months", value: "365" },
{ label: "All time", value: "all" },
{ label: "Custom", value: "custom" },
];

function toDateInput(date) {
const year = date.getFullYear();
const month = String(date.getMonth() + 1).padStart(2, "0");
const day = String(date.getDate()).padStart(2, "0");
return `${year}-${month}-${day}`;
}

function getRange(period) {
if (period === "all") return { from: "", to: "" };

const to = new Date();
const from = new Date(to);

if (period === "365") {
from.setDate(from.getDate() - 364);
} else {
from.setDate(from.getDate() - (Number(period) - 1));
}

return { from: toDateInput(from), to: toDateInput(to) };
}

function formatNumber(value) {
return Number(value || 0).toLocaleString();
}

function formatPercent(value) {
return `${Number(value || 0).toFixed(1)}%`;
}

function getCount(row) {
if (typeof row?._count === "number") return row._count;
return Number(row?._count?.id ?? row?._count?._all ?? row?.count ?? 0);
}

function getLabel(row, fallback = "Other") {
const value =
row?.label ??
row?.name ??
row?.type ??
row?.experienceLevel ??
row?.industry ??
row?.country ??
row?.location ??
row?.status ??
row?.jobId;

if (!value) return fallback;

return String(value)
.replaceAll("_", " ")
.replace(/\b\w/g, (character) => character.toUpperCase());
}

function getDateKey(value) {
const date = new Date(value);
if (Number.isNaN(date.getTime())) return null;

return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function formatDay(key, includeYear = false) {
const date = new Date(`${key}T12:00:00`);
if (Number.isNaN(date.getTime())) return key;

return date.toLocaleDateString("en", {
month: "short",
day: "numeric",
...(includeYear ? { year: "2-digit" } : {}),
});
}

function aggregateByDay(rows = []) {
const grouped = new Map();

for (const row of rows) {
const rawDate = row?.createdAt ?? row?.date ?? row?.day;
if (!rawDate) continue;


const key = getDateKey(rawDate);
if (!key) continue;

grouped.set(key, (grouped.get(key) || 0) + getCount(row));


}

return [...grouped.entries()]
.sort(([a], [b]) => a.localeCompare(b))
.map(([date, value]) => ({ date, value }));
}

function MetricCard({ label, value, detail, icon: Icon, accent = false }) {
return (
<article
className={`group relative flex min-h-[166px] flex-col justify-between border p-5 transition-colors duration-300 sm:p-6 ${
        accent
          ? "border-[var(--df-accent)] bg-[var(--df-accent)]"
          : "border-[var(--df-line)] bg-[rgba(255,255,255,0.24)] hover:bg-[rgba(255,255,255,0.48)]"
      }`}
> <div className="flex items-start justify-between gap-3">
<p className={`df-eyebrow ${accent ? "!text-[#354226]" : ""}`}>{label}</p>
<span
className={`flex h-9 w-9 items-center justify-center rounded-full border ${
            accent
              ? "border-black/10 text-[#26311d]"
              : "border-[var(--df-line)] text-[var(--df-muted)]"
          }`}
> <Icon size={17} strokeWidth={1.7} /> </span> </div>


  <div>
    <p className="text-[36px] font-medium leading-none tracking-[-0.075em] text-[var(--df-text-strong)] sm:text-[42px]">
      {formatNumber(value)}
    </p>
    <p className={`mt-3 text-[11px] ${accent ? "text-[#354226]" : "text-[var(--df-muted)]"}`}>
      {detail}
    </p>
  </div>
</article>


);
}

function SectionHeading({ eyebrow, title, description, action }) {
return ( <div className="mb-5 flex flex-wrap items-end justify-between gap-3"> <div> <p className="df-eyebrow">{eyebrow}</p> <h2 className="mt-2 text-[20px] font-medium tracking-[-0.055em] text-[var(--df-text-strong)] sm:text-[23px]">
{title} </h2>
{description && ( <p className="mt-2 max-w-xl text-[12px] leading-5 text-[var(--df-muted)]">
{description} </p>
)} </div>
{action} </div>
);
}

function TrendChart({ title, subtitle, data = [], color = "accent" }) {
const max = Math.max(1, ...data.map((item) => item.value));
const chartColor =
color === "dark" ? "var(--df-text-strong)" : "var(--df-accent)";
const total = data.reduce((sum, item) => sum + item.value, 0);

return ( <section className="border border-[var(--df-line)] bg-[rgba(255,255,255,0.18)] p-5 sm:p-6"> <div className="flex items-start justify-between gap-4"> <div> <h3 className="text-[14px] font-semibold tracking-[-0.025em] text-[var(--df-text)]">
{title} </h3> <p className="mt-1 text-[11px] text-[var(--df-muted)]">{subtitle}</p> </div> <div className="text-right"> <p className="text-[23px] font-medium leading-none tracking-[-0.06em]">
{formatNumber(total)} </p> <p className="mt-1 text-[9px] uppercase tracking-[0.13em] text-[var(--df-muted)]">
Total in chart </p> </div> </div>


  {data.length === 0 ? (
    <div className="flex h-[190px] items-center justify-center text-center text-[12px] text-[var(--df-muted)]">
      No trend data available for this period.
    </div>
  ) : (
    <>
      <div className="mt-7 flex h-[170px] items-end gap-[3px] border-b border-[var(--df-line)] pb-0">
        {data.map((item, index) => {
          const height = Math.max(3, (item.value / max) * 100);

          return (
            <div
              key={item.date}
              className="group relative flex h-full min-w-0 flex-1 items-end justify-center"
              title={`${formatDay(item.date, true)}: ${formatNumber(item.value)}`}
            >
              <div
                className="w-full max-w-[26px] rounded-t-[2px] transition-[height,opacity] duration-300 group-hover:opacity-70"
                style={{
                  height: `${height}%`,
                  background: chartColor,
                  opacity: color === "accent" ? 0.95 : 0.72,
                }}
              />
              <div className="pointer-events-none absolute bottom-full z-10 mb-2 hidden whitespace-nowrap border border-[var(--df-line)] bg-[var(--df-paper)] px-2 py-1 text-[10px] text-[var(--df-text)] group-hover:block">
                {formatDay(item.date, true)} · {formatNumber(item.value)}
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-3 flex items-center justify-between text-[10px] text-[var(--df-muted)]">
        <span>{formatDay(data[0].date, true)}</span>
        <span>{data.length} active date{data.length === 1 ? "" : "s"}</span>
        <span>{formatDay(data[data.length - 1].date, true)}</span>
      </div>
    </>
  )}
</section>


);
}

function BreakdownList({ title, eyebrow, rows = [], emptyLabel = "No breakdown data available." }) {
const normalized = [...rows]
.map((row) => ({ label: getLabel(row), value: getCount(row) }))
.sort((a, b) => b.value - a.value)
.slice(0, 6);

const max = Math.max(1, ...normalized.map((item) => item.value));

return ( <section className="border border-[var(--df-line)] bg-[rgba(255,255,255,0.18)] p-5 sm:p-6"> <p className="df-eyebrow">{eyebrow}</p> <h3 className="mt-2 text-[17px] font-medium tracking-[-0.045em] text-[var(--df-text-strong)]">
{title} </h3>


  {normalized.length === 0 ? (
    <p className="py-8 text-[12px] text-[var(--df-muted)]">{emptyLabel}</p>
  ) : (
    <div className="mt-5">
      {normalized.map((item, index) => (
        <div
          key={`${item.label}-${index}`}
          className="border-t border-[var(--df-line-soft)] py-3 first:border-t-0"
        >
          <div className="mb-2 flex items-center justify-between gap-3">
            <span className="truncate text-[12px] text-[var(--df-text)]">
              {item.label}
            </span>
            <span className="shrink-0 text-[11px] tabular-nums text-[var(--df-muted)]">
              {formatNumber(item.value)}
            </span>
          </div>
          <div className="h-[3px] w-full bg-[var(--df-paper-3)]">
            <div
              className="h-full transition-[width] duration-500"
              style={{
                width: `${(item.value / max) * 100}%`,
                background:
                  index === 0 ? "var(--df-accent)" : "var(--df-text-strong)",
                opacity: index === 0 ? 1 : Math.max(0.22, 0.68 - index * 0.07),
              }}
            />
          </div>
        </div>
      ))}
    </div>
  )}
</section>


);
}

function HealthRow({ icon: Icon, label, description, value, status = "neutral" }) {
return ( <div className="flex items-center gap-3 border-t border-[var(--df-line-soft)] py-4 first:border-t-0"> <span className="flex h-9 w-9 shrink-0 items-center justify-center border border-[var(--df-line)] text-[var(--df-muted)]"> <Icon size={16} strokeWidth={1.7} /> </span> <div className="min-w-0 flex-1"> <p className="text-[12px] font-medium text-[var(--df-text)]">{label}</p> <p className="mt-1 text-[11px] text-[var(--df-muted)]">{description}</p> </div>
<span
className={`shrink-0 text-[11px] font-medium ${
          status === "good" ? "text-[var(--df-text)]" : "text-[var(--df-muted)]"
        }`}
>
{value} </span> </div>
);
}

function ErrorNotice({ errors, onRetry }) {
const entries = Object.entries(errors).filter(([, error]) => error);

if (!entries.length) return null;

return ( <div className="mb-6 border border-red-500/25 bg-red-500/[0.04] p-4"> <div className="flex flex-wrap items-start justify-between gap-3"> <div> <p className="text-[12px] font-semibold text-[var(--df-text)]">
Some analytics could not be loaded </p> <ul className="mt-2 space-y-1">
{entries.map(([name, error]) => ( <li key={name} className="text-[11px] text-[var(--df-muted)]"> <span className="font-medium capitalize">{name}:</span> {String(error)} </li>
))} </ul> </div> <button type="button" onClick={onRetry} className="df-btn df-btn-outline !min-h-9 !px-3"> <RefreshCw size={13} />
Retry </button> </div> </div>
);
}

export default function AdminDashboardPage() {
const dispatch = useDispatch();

const {
users,
jobs,
applications,
companies,
loadingUsers,
loadingJobs,
loadingApplications,
loadingCompanies,
errorUsers,
errorJobs,
errorApplications,
errorCompanies,
} = useSelector((state) => state.adminAnalytics);
const {
  metrics: healthMetrics,
  loading: loadingHealth,
  error: healthError,
} = useSelector((state) => state.adminHealth);

const [period, setPeriod] = useState("30");
const initialRange = getRange("30");
const [from, setFrom] = useState(initialRange.from);
const [to, setTo] = useState(initialRange.to);
const [appliedRange, setAppliedRange] = useState(initialRange);

const loading =
loadingUsers || loadingJobs || loadingApplications || loadingCompanies;

const errors = useMemo(
() => ({
users: errorUsers,
jobs: errorJobs,
applications: errorApplications,
companies: errorCompanies,
}),
[errorUsers, errorJobs, errorApplications, errorCompanies]
);

const fetchAll = useCallback(
(range = {}) => {
const params = {};
if (range.from) params.from = range.from;
if (range.to) params.to = range.to;


  dispatch(fetchAdminUserAnalytics(params));
  dispatch(fetchAdminJobAnalytics(params));
  dispatch(fetchAdminApplicationAnalytics(params));
  dispatch(fetchAdminCompanyAnalytics(params));
  setAppliedRange({ from: range.from || "", to: range.to || "" });
},
[dispatch]


);

useEffect(() => {
fetchAll(getRange("30"));
dispatch(fetchAdminHealthMetrics());
}, [dispatch, fetchAll]);

const applyPreset = (nextPeriod) => {
setPeriod(nextPeriod);
if (nextPeriod === "custom") return;


const range = getRange(nextPeriod);
setFrom(range.from);
setTo(range.to);
fetchAll(range);


};

const applyCustomRange = () => {
if (from && to && from > to) return;
fetchAll({ from, to });
};

const refresh = () => {
dispatch(clearAdminAnalyticsErrors());
fetchAll(appliedRange);
};

const userOverview = users?.overview || {};
const jobOverview = jobs?.overview || {};
const applicationOverview = applications?.overview || {};
const companyOverview = companies?.overview || {};

const userTrend = useMemo(
() => aggregateByDay(users?.newUsersOverTime),
[users?.newUsersOverTime]
);

const jobTrend = useMemo(
() => aggregateByDay(jobs?.jobsOverTime),
[jobs?.jobsOverTime]
);

const applicationTrend = useMemo(
() => aggregateByDay(applications?.applicationsOverTime),
[applications?.applicationsOverTime]
);

const companyTrend = useMemo(
() => aggregateByDay(companies?.companyGrowth),
[companies?.companyGrowth]
);

const hasData = Boolean(users || jobs || applications || companies);

const dateDescription =
appliedRange.from && appliedRange.to
? `${appliedRange.from} — ${appliedRange.to}`
: "All available dates";

return ( <div className="mx-auto max-w-[1440px]"> <ErrorNotice errors={errors} onRetry={refresh} />


  {/* Page introduction */}
  <section className="mb-9 border-b border-[var(--df-line)] pb-8 sm:mb-10 sm:pb-10">
    <div className="flex flex-col justify-between gap-7 xl:flex-row xl:items-end">
      <div>
        <div className="mb-5 flex items-center gap-2">
          <span className="df-dot" />
          <p className="df-eyebrow">PLATFORM OVERVIEW / ADMINISTRATION</p>
        </div>
        <h1 className="df-display max-w-3xl text-[clamp(42px,6vw,76px)] text-[var(--df-text-strong)]">
          Control the
          <br />
          bigger picture<span className="text-[var(--df-muted)]">.</span>
        </h1>
        <p className="mt-6 max-w-xl text-[13px] leading-6 text-[var(--df-muted)]">
          A clear view of the people, companies, jobs, and applications
          shaping the DevFlow hiring ecosystem.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2 xl:justify-end">
        <span className="mr-2 text-[10px] text-[var(--df-muted)]">
          {dateDescription}
        </span>
        <button
          type="button"
          onClick={refresh}
          disabled={loading}
          className="df-btn df-btn-outline !min-h-[42px] !px-4 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>
    </div>
  </section>

  {/* Filters */}
  <section className="mb-8 flex flex-col gap-4 border-b border-[var(--df-line)] pb-6 xl:flex-row xl:items-end xl:justify-between">
    <div>
      <p className="df-eyebrow mb-3">REPORTING PERIOD</p>
      <div className="flex flex-wrap gap-2">
        {PERIODS.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => applyPreset(item.value)}
            className={`min-h-9 rounded-full border px-4 text-[11px] font-medium transition-colors ${
              period === item.value
                ? "border-[var(--df-accent)] bg-[var(--df-accent)] text-[#11140f]"
                : "border-[var(--df-line)] bg-transparent text-[var(--df-muted)] hover:bg-[var(--df-paper-2)] hover:text-[var(--df-text)]"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>

    {period === "custom" && (
      <div className="flex flex-wrap items-end gap-2">
        <label className="flex flex-col gap-2">
          <span className="df-eyebrow">FROM</span>
          <input
            type="date"
            value={from}
            max={to || undefined}
            onChange={(event) => setFrom(event.target.value)}
            className="min-h-10 border border-[var(--df-line)] bg-transparent px-3 text-[12px] text-[var(--df-text)] outline-none focus:border-[var(--df-muted)]"
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="df-eyebrow">TO</span>
          <input
            type="date"
            value={to}
            min={from || undefined}
            onChange={(event) => setTo(event.target.value)}
            className="min-h-10 border border-[var(--df-line)] bg-transparent px-3 text-[12px] text-[var(--df-text)] outline-none focus:border-[var(--df-muted)]"
          />
        </label>
        <button
          type="button"
          onClick={applyCustomRange}
          disabled={Boolean(from && to && from > to) || loading}
          className="df-btn df-btn-primary !min-h-10 !px-4 disabled:opacity-50"
        >
          Apply range
          <ArrowRight size={14} />
        </button>
      </div>
    )}
  </section>

  {/* Loading state */}
  {loading && !hasData && (
    <div className="mb-6 flex items-center gap-3 border border-[var(--df-line)] p-4 text-[12px] text-[var(--df-muted)]">
      <RefreshCw size={15} className="animate-spin" />
      Loading platform analytics…
    </div>
  )}

  {/* Key metrics */}
  <section className="mb-11">
    <SectionHeading
      eyebrow="01 / KEY INDICATORS"
      title="Platform at a glance"
      description="Core platform counts for the selected creation-date period."
      action={
        <span className="text-[10px] text-[var(--df-muted)]">
          {loading ? "Updating…" : "Analytics summary"}
        </span>
      }
    />

    <div className="grid grid-cols-1 gap-3 min-[480px]:grid-cols-2 xl:grid-cols-4">
      <MetricCard
        label="Total users"
        value={userOverview.totalUsers}
        detail={`${formatNumber(userOverview.developerCount)} developers · ${formatNumber(userOverview.recruiterCount)} recruiters`}
        icon={Users}
        accent
      />
      <MetricCard
        label="Companies"
        value={companyOverview.totalCompanies}
        detail={`${formatNumber(companyOverview.verified)} verified companies`}
        icon={Building2}
      />
      <MetricCard
        label="Jobs published"
        value={jobOverview.totalJobs}
        detail={`${formatNumber(jobOverview.activeJobs)} currently active`}
        icon={BriefcaseBusiness}
      />
      <MetricCard
        label="Applications"
        value={applicationOverview.totalApplications}
        detail={`${formatNumber(applicationOverview.pending)} pending review`}
        icon={FileText}
      />
    </div>
  </section>

  {/* Secondary indicators */}
  <section className="mb-12">
    <SectionHeading
      eyebrow="02 / STATUS SNAPSHOT"
      title="A closer look"
      description="Status and conversion indicators across the selected period."
    />

    <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
      {[
        {
          label: "Active users",
          value: userOverview.activeUsers,
          detail: `${formatNumber(userOverview.inactiveUsers)} inactive`,
          icon: Activity,
        },
        {
          label: "Verified users",
          value: userOverview.verifiedUsers,
          detail: `${formatNumber(userOverview.unverifiedUsers)} unverified`,
          icon: ShieldCheck,
        },
        {
          label: "Closed / expired jobs",
          value:
            Number(jobOverview.closedJobs || 0) +
            Number(jobOverview.expiredJobs || 0),
          detail: `${formatNumber(jobOverview.expiredJobs)} expired`,
          icon: Clock3,
        },
        {
          label: "Application acceptance",
          value: formatPercent(applicationOverview.acceptanceRate),
          detail: `${formatPercent(applicationOverview.rejectionRate)} rejection rate`,
          icon: CheckCircle2,
        },
      ].map((item) => {
        const Icon = item.icon;
        return (
          <article
            key={item.label}
            className="flex min-h-[126px] flex-col justify-between border border-[var(--df-line)] p-4 sm:p-5"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-[11px] text-[var(--df-muted)]">{item.label}</p>
              <Icon size={15} className="text-[var(--df-muted)]" strokeWidth={1.7} />
            </div>
            <div>
              <p className="mt-4 text-[27px] font-medium leading-none tracking-[-0.065em] text-[var(--df-text-strong)] sm:text-[32px]">
                {typeof item.value === "string" ? item.value : formatNumber(item.value)}
              </p>
              <p className="mt-2 text-[10px] text-[var(--df-muted)]">{item.detail}</p>
            </div>
          </article>
        );
      })}
    </div>
  </section>

  {/* Growth charts */}
  <section className="mb-12">
    <SectionHeading
      eyebrow="03 / GROWTH & ACTIVITY"
      title="Momentum over time"
      description="Daily activity grouped by calendar date. Hover over a bar to inspect its value."
      action={
        <span className="inline-flex items-center gap-2 text-[10px] text-[var(--df-muted)]">
          <span className="h-[6px] w-[6px] bg-[var(--df-accent)]" />
          Daily volume
        </span>
      }
    />

    <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
      <TrendChart
        title="User growth"
        subtitle="Newly registered users"
        data={userTrend}
      />
      <TrendChart
        title="Job activity"
        subtitle="Jobs created"
        data={jobTrend}
        color="dark"
      />
      <TrendChart
        title="Application activity"
        subtitle="Applications submitted"
        data={applicationTrend}
      />
      <TrendChart
        title="Company growth"
        subtitle="Newly created companies"
        data={companyTrend}
        color="dark"
      />
    </div>
  </section>

  {/* Platform breakdowns */}
  <section className="mb-12">
    <SectionHeading
      eyebrow="04 / PLATFORM COMPOSITION"
      title="What's on the platform"
      description="Understand the makeup of jobs and the companies using DevFlow."
    />
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
      <BreakdownList
        eyebrow="JOBS"
        title="By employment type"
        rows={jobs?.breakdown?.jobsByType}
      />
      <BreakdownList
        eyebrow="JOBS"
        title="By experience level"
        rows={jobs?.breakdown?.jobsByExperience}
      />
      <BreakdownList
        eyebrow="COMPANIES"
        title="By industry"
        rows={companies?.breakdown?.companiesByIndustry}
      />
      <BreakdownList
        eyebrow="JOBS"
        title="By industry"
        rows={jobs?.breakdown?.jobsByIndustry}
      />
      <BreakdownList
        eyebrow="COMPANIES"
        title="By country"
        rows={companies?.breakdown?.companiesByCountry}
      />
      <BreakdownList
        eyebrow="JOBS"
        title="By location"
        rows={jobs?.breakdown?.jobsByLocation}
      />
    </div>
  </section>

  {/* Operational overview */}
  <section className="mb-5">
    <SectionHeading
      eyebrow="05 / ADMINISTRATION"
      title="Platform operations"
      description="Shortcuts to the areas that need regular administrative attention."
    />

    <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1.15fr_0.85fr]">
      <div className="border border-[var(--df-line)] p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="df-eyebrow">REVIEW QUEUE</p>
            <h3 className="mt-2 text-[20px] font-medium tracking-[-0.055em]">
              Keep the platform in order.
            </h3>
            <p className="mt-2 max-w-md text-[12px] leading-5 text-[var(--df-muted)]">
              Review user activity, company verification, job listings,
              and applications from their dedicated management pages.
            </p>
          </div>
          <span className="hidden h-10 w-10 items-center justify-center rounded-full bg-[var(--df-accent)] text-[#11140f] sm:flex">
            <ShieldCheck size={19} />
          </span>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {[
            {
              label: "Manage users",
              detail: `${formatNumber(userOverview.unverifiedUsers)} unverified users`,
              href: "/dashboard/admin/users",
            },
            {
              label: "Company verification",
              detail: `${formatNumber(companyOverview.unverified)} awaiting verification`,
              href: "/dashboard/admin/companies",
            },
            {
              label: "Review job listings",
              detail: `${formatNumber(jobOverview.activeJobs)} active jobs`,
              href: "/dashboard/admin/jobs",
            },
            {
              label: "Applications",
              detail: `${formatNumber(applicationOverview.pending)} pending applications`,
              href: "/dashboard/admin/applications",
            },
          ].map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="group flex items-center justify-between gap-3 border border-[var(--df-line-soft)] px-4 py-4 transition-colors hover:bg-[var(--df-paper-2)]"
            >
              <span className="min-w-0">
                <span className="block text-[12px] font-medium text-[var(--df-text)]">
                  {item.label}
                </span>
                <span className="mt-1 block truncate text-[10px] text-[var(--df-muted)]">
                  {item.detail}
                </span>
              </span>
              <ArrowUpRight
                size={15}
                className="shrink-0 text-[var(--df-muted)] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </a>
          ))}
        </div>
      </div>

      <div className="border border-[var(--df-line)] p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="df-eyebrow">SYSTEM HEALTH</p>
            <h3 className="mt-2 text-[20px] font-medium tracking-[-0.055em]">
              Service status
            </h3>
          </div>
          <button
            type="button"
            onClick={() => dispatch(fetchAdminHealthMetrics())}
            disabled={loadingHealth}
            aria-label="Refresh system health"
            className="df-btn df-btn-outline !min-h-9 !w-9 !px-0 disabled:opacity-50"
          >
            <RefreshCw size={14} className={loadingHealth ? "animate-spin" : ""} />
          </button>
        </div>

        <p className="mt-2 text-[12px] leading-5 text-[var(--df-muted)]">
          Live checks for the database, Redis, background queues, and storage.
        </p>

        <div className="mt-4 border border-[var(--df-line-soft)] px-4">
          {healthError ? (
            <div className="flex items-center justify-between gap-3 py-4">
              <p role="alert" className="text-[11px] text-red-600">
                Could not load service health.
              </p>
              <button
                type="button"
                onClick={() => dispatch(fetchAdminHealthMetrics())}
                className="text-[11px] font-medium underline underline-offset-4"
              >
                Retry
              </button>
            </div>
          ) : (
            <>
              <HealthRow
                icon={Activity}
                label="Overall status"
                description={healthMetrics?.timestamp
                  ? `Checked ${new Date(healthMetrics.timestamp).toLocaleTimeString()}`
                  : "Waiting for health check"}
                value={healthMetrics?.status || (loadingHealth ? "Checking…" : "Unknown")}
                status={healthMetrics?.status === "HEALTHY" ? "good" : "neutral"}
              />
              <HealthRow
                icon={Building2}
                label="Database"
                description={healthMetrics?.services?.database?.latencyMs != null
                  ? `${healthMetrics.services.database.latencyMs} ms response`
                  : "Connection check"}
                value={healthMetrics?.services?.database?.connected ? "Connected" : loadingHealth ? "Checking…" : "Unavailable"}
                status={healthMetrics?.services?.database?.connected ? "good" : "neutral"}
              />
              <HealthRow
                icon={Activity}
                label="Redis"
                description="Cache and queue connection"
                value={healthMetrics?.services?.redis?.connected ? "Connected" : loadingHealth ? "Checking…" : "Unavailable"}
                status={healthMetrics?.services?.redis?.connected ? "good" : "neutral"}
              />
              <HealthRow
                icon={Activity}
                label="Background queues"
                description={healthMetrics?.services?.queues?.error
                  ? "Queue checks returned an error"
                  : "Email, notification, and storage jobs"}
                value={healthMetrics?.services?.queues?.error
                  ? "Unavailable"
                  : healthMetrics?.services?.queues
                    ? `${Object.values(healthMetrics.services.queues).reduce(
                        (total, queue) => total + Number(queue?.failed || 0),
                        0
                      )} failed`
                    : loadingHealth ? "Checking…" : "Unknown"}
                status={healthMetrics?.services?.queues && !healthMetrics.services.queues.error ? "good" : "neutral"}
              />
              <HealthRow
                icon={FileText}
                label="Storage"
                description="Object storage availability"
                value={healthMetrics?.services?.storage?.reachable ? "Reachable" : loadingHealth ? "Checking…" : "Unavailable"}
                status={healthMetrics?.services?.storage?.reachable ? "good" : "neutral"}
              />
            </>
          )}
        </div>

        <p className="df-eyebrow mt-7">SYSTEM DIRECTORY</p>
        <h3 className="mt-2 text-[20px] font-medium tracking-[-0.055em]">
          Operations & records
        </h3>
        <p className="mt-2 text-[12px] leading-5 text-[var(--df-muted)]">
          Access records for investigating issues and tracking platform events.
        </p>
        <div className="mt-5">
          <HealthRow
            icon={Activity}
            label="Employment events"
            description="Employment history and event records"
            value="Open records"
          />
          <HealthRow
            icon={Users}
            label="Recruiter events"
            description="Recruiter activity and history"
            value="Open records"
          />
          <HealthRow
            icon={FileText}
            label="Files"
            description="Uploaded file records and metadata"
            value="Browse files"
          />
          <HealthRow
            icon={Mail}
            label="Email logs"
            description="Delivery records and troubleshooting"
            value="View logs"
          />
          <HealthRow
            icon={Activity}
            label="Queues & workers"
            description="Background jobs and failed tasks"
            value="Inspect queues"
          />
        </div>

      </div>
    </div>
  </section>

  <footer className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--df-line)] pt-5">
    <p className="text-[10px] text-[var(--df-muted)]">
      DEVFLOW / ADMINISTRATIVE OVERVIEW
    </p>
    <p className="text-[10px] text-[var(--df-muted)]">
      Metrics reflect the selected reporting period.
    </p>
  </footer>
</div>


);
}
