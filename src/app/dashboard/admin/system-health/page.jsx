
"use client";

import { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  CircleHelp,
  Clock3,
  Cloud,
  Database,
  HardDrive,
  LoaderCircle,
  RefreshCw,
  Server,
  ShieldCheck,
  Wifi,
  XCircle,
  Zap,
} from "lucide-react";

import {
  fetchAdminHealthMetrics,
  clearAdminHealthError,
} from "@/lib/redux/slices/adminHealthSlice";

const REFRESH_INTERVAL = 30_000;

function formatTime(value) {
  if (!value) return "Not available";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Not available";

  return new Intl.DateTimeFormat("en", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    month: "short",
    day: "numeric",
  }).format(date);
}

function formatLatency(value) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "—";
  }

  return `${value} ms`;
}

function StatusPill({ status, children }) {
  const styles = {
    healthy: "bg-emerald-50 text-emerald-800 ring-emerald-200",
    degraded: "bg-amber-50 text-amber-800 ring-amber-200",
    failed: "bg-rose-50 text-rose-800 ring-rose-200",
    unknown: "bg-stone-100 text-stone-600 ring-stone-200",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] ring-1 ring-inset ${
        styles[status] || styles.unknown
      }`}
    >
      {children}
    </span>
  );
}

function Metric({ label, value, detail }) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--df-muted)]">
        {label}
      </p>
      <p className="mt-1.5 truncate text-xl font-semibold tracking-tight text-[var(--df-text)]">
        {value}
      </p>
      {detail && (
        <p className="mt-1 text-xs text-[var(--df-muted)]">{detail}</p>
      )}
    </div>
  );
}

function ServiceCard({
  title,
  description,
  icon: Icon,
  connected,
  latency,
  error,
  extra,
}) {
  const healthy = connected === true;
  const failed = connected === false;
  const status = healthy ? "healthy" : failed ? "failed" : "unknown";

  return (
    <article className="rounded-xl border border-[var(--df-line)] bg-[var(--df-paper)] p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[var(--df-line)] bg-white text-[var(--df-text)]">
            <Icon size={18} strokeWidth={1.7} />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-[var(--df-text)]">{title}</h3>
            <p className="mt-1 text-xs leading-5 text-[var(--df-muted)]">
              {description}
            </p>
          </div>
        </div>
        <StatusPill status={status}>
          {healthy ? (
            <CheckCircle2 size={12} />
          ) : failed ? (
            <XCircle size={12} />
          ) : (
            <CircleHelp size={12} />
          )}
          {healthy ? "Online" : failed ? "Offline" : "Unknown"}
        </StatusPill>
      </div>

      <div className="mt-5 flex items-end justify-between gap-3 border-t border-[var(--df-line)] pt-4">
        <Metric label="Response time" value={formatLatency(latency)} />
        {extra}
      </div>

      {error && (
        <div className="mt-4 flex gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs leading-5 text-rose-800">
          <AlertTriangle className="mt-0.5 shrink-0" size={14} />
          <span>{error}</span>
        </div>
      )}
    </article>
  );
}

function QueueCard({ title, queue }) {
  const counts = queue?.counts;
  const connected = queue?.connected === true;
  const failed = queue?.connected === false;
  const entries = [
    ["Waiting", counts?.waiting],
    ["Active", counts?.active],
    ["Delayed", counts?.delayed],
    ["Failed jobs", counts?.failed],
    ["Completed", counts?.completed],
    ["Paused", counts?.paused],
  ];

  return (
    <article className="rounded-xl border border-[var(--df-line)] bg-[var(--df-paper)] p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-[var(--df-text)]">{title}</h3>
          <p className="mt-1 text-xs text-[var(--df-muted)]">
            Background job processing
          </p>
        </div>
        <StatusPill
          status={connected ? "healthy" : failed ? "failed" : "unknown"}
        >
          {connected ? "Reachable" : failed ? "Unavailable" : "Unknown"}
        </StatusPill>
      </div>

      {counts ? (
        <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {entries.map(([label, value]) => (
            <Metric
              key={label}
              label={label}
              value={typeof value === "number" ? value.toLocaleString() : "—"}
            />
          ))}
        </div>
      ) : (
        <div className="mt-5 rounded-lg bg-stone-50 p-4 text-sm text-[var(--df-muted)]">
          {queue?.error || "Queue metrics are not available."}
        </div>
      )}

      {queue?.error && counts && (
        <p className="mt-3 text-xs text-rose-700">{queue.error}</p>
      )}
    </article>
  );
}

export default function AdminSystemHealthPage() {
  const dispatch = useDispatch();
  const { metrics, loading, error, lastFetchedAt } = useSelector(
    (state) => state.adminHealth
  );

  const refresh = useCallback(() => {
    dispatch(clearAdminHealthError());
    dispatch(fetchAdminHealthMetrics());
  }, [dispatch]);

  useEffect(() => {
    refresh();

    const interval = setInterval(refresh, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [refresh]);

  const services = metrics?.services;
  const overallHealthy = metrics?.status === "HEALTHY";

  const serviceChecks = [
    services?.database?.connected,
    services?.redis?.connected,
    services?.storage?.reachable,
    services?.queues?.email?.connected,
    services?.queues?.notification?.connected,
    services?.queues?.storage?.connected,
  ];

  const checksKnown = serviceChecks.filter(
    (value) => typeof value === "boolean"
  ).length;

  const checksOnline = serviceChecks.filter((value) => value === true).length;

  const totalQueueJobs = ["email", "notification", "storage"].reduce(
    (total, name) => {
      const counts = services?.queues?.[name]?.counts;
      return total + (counts?.waiting || 0) + (counts?.active || 0);
    },
    0
  );

  const hasMetrics = Boolean(metrics);

  return (
    <main className="min-h-screen bg-[var(--df-paper)] px-4 py-6 text-[var(--df-text)] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1440px]">
        <header className="flex flex-col justify-between gap-5 border-b border-[var(--df-line)] pb-6 md:flex-row md:items-end">
          <div>
            <p className="df-eyebrow flex items-center gap-2">
              <Activity size={13} />
              Operations / Monitoring
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">
              System health
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--df-muted)]">
              Monitor core infrastructure, background workers, and storage
              connectivity from one place.
            </p>
          </div>

          <button
            type="button"
            onClick={refresh}
            disabled={loading}
            className="df-btn inline-flex min-h-10 items-center justify-center gap-2 self-start disabled:cursor-not-allowed disabled:opacity-60 md:self-auto"
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
            {loading && !hasMetrics ? "Checking..." : "Refresh checks"}
          </button>
        </header>

        {error && (
          <div
            role="alert"
            className="mt-5 flex flex-col gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex gap-3">
              <AlertTriangle className="mt-0.5 shrink-0 text-amber-700" size={18} />
              <div>
                <p className="text-sm font-semibold text-amber-900">
                  Could not refresh system metrics
                </p>
                <p className="mt-1 text-sm text-amber-800">{error}</p>
                {hasMetrics && (
                  <p className="mt-1 text-xs text-amber-800">
                    Showing the last successful check from{" "}
                    {formatTime(lastFetchedAt || metrics.timestamp)}.
                  </p>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={refresh}
              className="shrink-0 text-sm font-semibold text-amber-900 underline underline-offset-4"
            >
              Try again
            </button>
          </div>
        )}

        {!hasMetrics && loading && (
          <div className="mt-6 rounded-xl border border-[var(--df-line)] p-10 text-center">
            <LoaderCircle
              className="mx-auto animate-spin text-[var(--df-muted)]"
              size={26}
            />
            <p className="mt-3 text-sm font-medium">Checking infrastructure</p>
            <p className="mt-1 text-xs text-[var(--df-muted)]">
              Connecting to the database, Redis, queues, and storage.
            </p>
          </div>
        )}

        {!hasMetrics && !loading && error && (
          <div className="mt-6 rounded-xl border border-[var(--df-line)] p-10 text-center">
            <Server className="mx-auto text-[var(--df-muted)]" size={28} />
            <h2 className="mt-3 font-semibold">Health data unavailable</h2>
            <p className="mt-1 text-sm text-[var(--df-muted)]">
              The monitoring endpoint could not provide system metrics.
            </p>
            <button
              type="button"
              onClick={refresh}
              className="df-btn mt-5"
            >
              Retry health check
            </button>
          </div>
        )}

        {hasMetrics && (
          <>
            <section className="mt-6 overflow-hidden rounded-xl border border-[var(--df-line)] bg-[var(--df-paper)]">
              <div className="grid gap-0 lg:grid-cols-[1.5fr_1fr]">
                <div className="p-6 sm:p-8">
                  <p className="df-eyebrow">Current system status</p>
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                        overallHealthy
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {overallHealthy ? (
                        <ShieldCheck size={25} />
                      ) : (
                        <AlertTriangle size={25} />
                      )}
                    </div>
                    <div>
                      <h2 className="text-2xl font-semibold tracking-tight">
                        {overallHealthy ? "All systems operational" : "System degraded"}
                      </h2>
                      <p className="mt-1 text-sm text-[var(--df-muted)]">
                        {overallHealthy
                          ? "All monitored dependencies are responding."
                          : "One or more dependencies need attention."}
                      </p>
                    </div>
                  </div>
                  <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-[var(--df-muted)]">
                    <span className="inline-flex items-center gap-1.5">
                      <Clock3 size={13} />
                      Checked {formatTime(metrics.timestamp)}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <RefreshCw size={13} />
                      Auto-refresh every 30 seconds
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 border-t border-[var(--df-line)] bg-white/50 p-6 sm:p-8 lg:border-l lg:border-t-0">
                  <Metric
                    label="Checks online"
                    value={`${checksOnline}/${checksKnown || 6}`}
                    detail="Core dependencies"
                  />
                  <Metric
                    label="Queued workload"
                    value={totalQueueJobs.toLocaleString()}
                    detail="Waiting and active jobs"
                  />
                  <Metric
                    label="Last successful fetch"
                    value={formatTime(lastFetchedAt || metrics.timestamp)}
                    detail="Browser retrieval time"
                  />
                  <Metric
                    label="Health response"
                    value={metrics.status || "Unknown"}
                    detail="API-reported state"
                  />
                </div>
              </div>
            </section>

            <section className="mt-9">
              <div className="mb-4 flex items-end justify-between gap-3">
                <div>
                  <p className="df-eyebrow">Infrastructure</p>
                  <h2 className="mt-1 text-xl font-semibold tracking-tight">
                    Service connectivity
                  </h2>
                </div>
                <span className="text-xs text-[var(--df-muted)]">
                  {checksOnline} of {checksKnown || 6} responding
                </span>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <ServiceCard
                  title="PostgreSQL"
                  description="Primary application database"
                  icon={Database}
                  connected={services?.database?.connected}
                  latency={services?.database?.latencyMs}
                  error={services?.database?.error}
                />
                <ServiceCard
                  title="Redis"
                  description="Cache and queue connection"
                  icon={Zap}
                  connected={services?.redis?.connected}
                  latency={services?.redis?.latencyMs}
                  error={services?.redis?.error}
                />
                <ServiceCard
                  title="Object storage"
                  description="S3-compatible bucket availability"
                  icon={Cloud}
                  connected={services?.storage?.reachable}
                  latency={services?.storage?.latencyMs}
                  error={services?.storage?.error}
                />
                <ServiceCard
                  title="Queue infrastructure"
                  description="Email, notifications, and storage queues"
                  icon={Wifi}
                  connected={
                    services?.queues &&
                    ["email", "notification", "storage"].every(
                      (key) =>
                        typeof services.queues[key]?.connected === "boolean" &&
                        services.queues[key].connected
                    )
                  }
                  latency={null}
                  error={services?.queues?.error}
                  extra={
                    <Metric
                      label="Active jobs"
                      value={["email", "notification", "storage"]
                        .reduce(
                          (sum, key) =>
                            sum +
                            (services?.queues?.[key]?.counts?.active || 0),
                          0
                        )
                        .toLocaleString()}
                    />
                  }
                />
              </div>
            </section>

            <section className="mt-9 pb-10">
              <div className="mb-4">
                <p className="df-eyebrow">Background processing</p>
                <h2 className="mt-1 text-xl font-semibold tracking-tight">
                  Queue activity
                </h2>
                <p className="mt-1 text-sm text-[var(--df-muted)]">
                  Inspect pending workloads and failed jobs by queue.
                </p>
              </div>

              <div className="grid gap-4 lg:grid-cols-3">
                <QueueCard
                  title="Email queue"
                  queue={services?.queues?.email}
                />
                <QueueCard
                  title="Notification queue"
                  queue={services?.queues?.notification}
                />
                <QueueCard
                  title="Storage queue"
                  queue={services?.queues?.storage}
                />
              </div>

              <div className="mt-5 flex flex-col gap-2 border-t border-[var(--df-line)] pt-4 text-xs text-[var(--df-muted)] sm:flex-row sm:items-center sm:justify-between">
                <span className="inline-flex items-center gap-2">
                  <HardDrive size={13} />
                  Metrics reflect the latest endpoint response.
                </span>
                <span>
                  Last checked: {formatTime(metrics.timestamp)}
                </span>
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}