"use client";

import { useState, useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  Clock3,
  Cloud,
  Database,
  ExternalLink,
  HardDrive,
  LoaderCircle,
  Play,
  RefreshCw,
  RotateCcw,
  Server,
  ShieldCheck,
  Wifi,
  X,
  XCircle,
  Zap,
} from "lucide-react";
import api from "@/lib/api/axios";

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

function FailedJobsModal({ queueName, isOpen, onClose, onJobRetried }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [expandedJobId, setExpandedJobId] = useState(null);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [retryingId, setRetryingId] = useState(null);

  const fetchFailedJobs = useCallback(async () => {
    if (!queueName) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/api/admin/system/queues/${queueName}/failed?limit=50`);
      setJobs(res.data?.data || []);
    } catch (err) {
      setError(typeof err === "string" ? err : err?.message || "Failed to load jobs");
    } finally {
      setLoading(false);
    }
  }, [queueName]);

  useEffect(() => {
    if (isOpen) {
      fetchFailedJobs();
      setSuccessMessage(null);
      setError(null);
    }
  }, [isOpen, fetchFailedJobs]);

  const handleRetrySingle = async (jobId) => {
    setRetryingId(jobId);
    setError(null);
    setSuccessMessage(null);
    try {
      await api.post(`/api/admin/system/queues/${queueName}`, { jobId });
      setSuccessMessage(`Job ${jobId} successfully re-queued for processing!`);
      await fetchFailedJobs();
      if (onJobRetried) onJobRetried();
    } catch (err) {
      setError(typeof err === "string" ? err : err?.message || "Failed to retry job");
    } finally {
      setRetryingId(null);
    }
  };

  const handleRetryAll = async () => {
    if (!confirm(`Are you sure you want to retry all failed jobs in the '${queueName}' queue?`)) {
      return;
    }
    setActionLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const res = await api.post(`/api/admin/system/queues/${queueName}`, { count: 100 });
      setSuccessMessage(res.data?.message || "All failed jobs re-queued!");
      await fetchFailedJobs();
      if (onJobRetried) onJobRetried();
    } catch (err) {
      setError(typeof err === "string" ? err : err?.message || "Failed to retry jobs");
    } finally {
      setActionLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden border border-[var(--df-line)] bg-[var(--df-paper)] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--df-line)] bg-[var(--df-paper)] px-6 py-5">
          <div>
            <p className="df-eyebrow">Queue Operations / Failures</p>
            <h3 className="mt-1 text-xl font-semibold tracking-[-0.03em] text-[var(--df-text)] capitalize">
              {queueName} queue &mdash; Failed jobs
            </h3>
            <p className="mt-1 text-xs text-[var(--df-muted)]">
              Inspect failure stack traces, raw job payloads, and trigger retries.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRetryAll}
              disabled={actionLoading || loading || jobs.length === 0}
              className="df-btn df-btn-accent !min-h-9 !px-4 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RotateCcw size={13} className={actionLoading ? "animate-spin" : ""} />
              Retry all ({jobs.length})
            </button>
            <button
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center border border-[var(--df-line)] text-[var(--df-muted)] transition-colors hover:border-[var(--df-text)] hover:text-[var(--df-text)]"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mx-6 mt-4 flex items-center gap-2 border border-rose-200 bg-rose-50/70 p-3.5 text-xs text-rose-800">
            <AlertTriangle size={14} className="shrink-0 text-rose-700" />
            <span>{error}</span>
          </div>
        )}
        {successMessage && (
          <div className="mx-6 mt-4 flex items-center gap-2 border border-emerald-200 bg-emerald-50/70 p-3.5 text-xs text-emerald-800">
            <CheckCircle2 size={14} className="shrink-0 text-emerald-700" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {loading ? (
            <div className="py-16 text-center text-xs text-[var(--df-muted)]">
              <LoaderCircle className="mx-auto mb-3 animate-spin text-[var(--df-text)]" size={24} />
              Loading failed jobs...
            </div>
          ) : jobs.length === 0 ? (
            <div className="border border-dashed border-[var(--df-line)] bg-white/40 py-16 text-center">
              <CheckCircle2 className="mx-auto mb-2 text-emerald-700" size={28} />
              <p className="text-sm font-semibold text-[var(--df-text)]">No failed jobs recorded</p>
              <p className="mt-1 text-xs text-[var(--df-muted)]">
                All background jobs for this queue processed successfully or have been resolved.
              </p>
            </div>
          ) : (
            jobs.map((job) => {
              const isExpanded = expandedJobId === job.id;
              const isRetrying = retryingId === job.id;

              return (
                <div
                  key={job.id}
                  className="border border-[var(--df-line)] bg-[rgba(255,255,255,0.4)] p-4 transition-colors hover:bg-[rgba(255,255,255,0.7)]"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div
                      className="cursor-pointer flex-1"
                      onClick={() => setExpandedJobId(isExpanded ? null : job.id)}
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        {isExpanded ? (
                          <ChevronDown size={14} className="text-[var(--df-muted)]" />
                        ) : (
                          <ChevronRight size={14} className="text-[var(--df-muted)]" />
                        )}
                        <span className="font-mono text-xs font-semibold text-[var(--df-text)]">
                          {job.name || "Unnamed job"}
                        </span>
                        <span className="border border-[var(--df-line)] bg-[var(--df-paper)] px-2 py-0.5 font-mono text-[10px] uppercase text-[var(--df-muted)]">
                          ID: {job.id}
                        </span>
                        <span className="border border-rose-200 bg-rose-50 px-2 py-0.5 text-[10px] font-semibold text-rose-800">
                          {job.attemptsMade} attempts
                        </span>
                      </div>

                      <p className="mt-2 text-xs font-medium text-rose-700">
                        {job.failedReason || "Failure reason not specified"}
                      </p>
                      <p className="mt-1 text-[11px] text-[var(--df-muted)]">
                        Failed at: {formatTime(job.finishedOn || job.timestamp)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleRetrySingle(job.id)}
                        disabled={isRetrying || actionLoading}
                        className="df-btn df-btn-outline !min-h-8 !px-3 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Play size={11} className={isRetrying ? "animate-spin" : ""} />
                        {isRetrying ? "Retrying..." : "Retry job"}
                      </button>
                    </div>
                  </div>

                  {/* Expanded JSON Inspector */}
                  {isExpanded && (
                    <div className="mt-4 space-y-3 border-t border-[var(--df-line)] pt-3 text-xs">
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 border border-[var(--df-line)] bg-[var(--df-paper)] p-3 text-[11px]">
                        <div>
                          <span className="block font-semibold uppercase text-[9px] tracking-wider text-[var(--df-muted)]">
                            Created
                          </span>
                          <span className="mt-0.5 block font-mono text-[var(--df-text)]">{formatTime(job.timestamp)}</span>
                        </div>
                        <div>
                          <span className="block font-semibold uppercase text-[9px] tracking-wider text-[var(--df-muted)]">
                            Processed
                          </span>
                          <span className="mt-0.5 block font-mono text-[var(--df-text)]">{formatTime(job.processedOn)}</span>
                        </div>
                        <div>
                          <span className="block font-semibold uppercase text-[9px] tracking-wider text-[var(--df-muted)]">
                            Finished
                          </span>
                          <span className="mt-0.5 block font-mono text-[var(--df-text)]">{formatTime(job.finishedOn)}</span>
                        </div>
                        <div>
                          <span className="block font-semibold uppercase text-[9px] tracking-wider text-[var(--df-muted)]">
                            Attempts / Max
                          </span>
                          <span className="mt-0.5 block font-mono text-[var(--df-text)]">
                            {job.attemptsMade} / {job.maxAttempts}
                          </span>
                        </div>
                      </div>

                      <div>
                        <span className="text-[11px] font-semibold text-[var(--df-muted)] uppercase tracking-wider">
                          Job Data Payload:
                        </span>
                        <pre className="mt-1.5 max-h-44 overflow-auto border border-[var(--df-line)] bg-stone-900 p-3 font-mono text-[11px] leading-relaxed text-emerald-400">
                          {JSON.stringify(job.data, null, 2)}
                        </pre>
                      </div>

                      {job.opts && (
                        <div>
                          <span className="text-[11px] font-semibold text-[var(--df-muted)] uppercase tracking-wider">
                            Job Options:
                          </span>
                          <pre className="mt-1.5 max-h-36 overflow-auto border border-[var(--df-line)] bg-stone-900 p-3 font-mono text-[11px] leading-relaxed text-sky-300">
                            {JSON.stringify(job.opts, null, 2)}
                          </pre>
                        </div>
                      )}

                      {job.stacktrace && job.stacktrace.length > 0 && (
                        <div>
                          <span className="text-[11px] font-semibold text-[var(--df-muted)] uppercase tracking-wider">
                            Error Stacktrace:
                          </span>
                          <pre className="mt-1.5 max-h-44 overflow-auto border border-[var(--df-line)] bg-stone-900 p-3 font-mono text-[11px] leading-relaxed text-rose-300">
                            {job.stacktrace.join("\n")}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-[var(--df-line)] bg-[var(--df-paper)] px-6 py-4">
          <span className="text-xs text-[var(--df-muted)]">
            Showing up to 50 latest failures
          </span>
          <button
            onClick={onClose}
            className="df-btn df-btn-outline !min-h-9 !px-4 text-xs font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function QueueCard({ queueKey, title, queue, onInspectFailed }) {
  const counts = queue?.counts;
  const connected = queue?.connected === true;
  const failed = queue?.connected === false;
  const failedJobsCount = counts?.failed || 0;

  const entries = [
    ["Waiting", counts?.waiting],
    ["Active", counts?.active],
    ["Delayed", counts?.delayed],
    ["Failed jobs", counts?.failed],
    ["Completed", counts?.completed],
    ["Paused", counts?.paused],
  ];

  return (
    <article className="border border-[var(--df-line)] bg-[rgba(255,255,255,0.24)] p-5 sm:p-6 flex flex-col justify-between transition-colors hover:bg-[rgba(255,255,255,0.48)]">
      <div>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="df-eyebrow">Queue</p>
            <h3 className="mt-1 font-semibold text-[var(--df-text)]">{title}</h3>
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
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
            {entries.map(([label, value]) => (
              <Metric
                key={label}
                label={label}
                value={typeof value === "number" ? value.toLocaleString() : "—"}
              />
            ))}
          </div>
        ) : (
          <div className="mt-6 border border-[var(--df-line)] bg-stone-50 p-4 text-xs text-[var(--df-muted)]">
            {queue?.error || "Queue metrics are not available."}
          </div>
        )}

        {queue?.error && counts && (
          <p className="mt-3 text-xs text-rose-700">{queue.error}</p>
        )}
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-[var(--df-line)] pt-4">
        <span className="text-xs text-[var(--df-muted)] font-mono">
          {failedJobsCount > 0 ? (
            <span className="font-semibold text-rose-700">{failedJobsCount} failed</span>
          ) : (
            "0 failures"
          )}
        </span>
        <button
          type="button"
          onClick={() => onInspectFailed(queueKey)}
          className="df-btn df-btn-outline !min-h-8 !px-3 text-xs font-semibold"
        >
          Inspect & retry
        </button>
      </div>
    </article>
  );
}

export default function AdminSystemHealthPage() {
  const dispatch = useDispatch();
  const [selectedQueueForModal, setSelectedQueueForModal] = useState(null);
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
                  queueKey="email"
                  title="Email queue"
                  queue={services?.queues?.email}
                  onInspectFailed={(key) => setSelectedQueueForModal(key)}
                />
                <QueueCard
                  queueKey="notification"
                  title="Notification queue"
                  queue={services?.queues?.notification}
                  onInspectFailed={(key) => setSelectedQueueForModal(key)}
                />
                <QueueCard
                  queueKey="storage"
                  title="Storage queue"
                  queue={services?.queues?.storage}
                  onInspectFailed={(key) => setSelectedQueueForModal(key)}
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

        {/* Failed Jobs Inspection & Retry Modal */}
        <FailedJobsModal
          queueName={selectedQueueForModal}
          isOpen={Boolean(selectedQueueForModal)}
          onClose={() => setSelectedQueueForModal(null)}
          onJobRetried={refresh}
        />
      </div>
    </main>
  );
}