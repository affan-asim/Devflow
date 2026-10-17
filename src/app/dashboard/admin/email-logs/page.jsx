
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Activity,
  AlertCircle,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Mail,
  RefreshCw,
  Search,
  ShieldAlert,
  Trash2,
  X,
  LoaderCircle,
  CircleCheck,
  CircleX,
  CircleDashed,
} from "lucide-react";

import {
  fetchAdminEmailLogs,
  deleteAdminEmailLog,
  clearAdminEmailLogDeleteError,
} from "@/lib/redux/slices/adminEmailLogsSlice";

const PAGE_SIZE = 20;

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "PENDING", label: "Pending" },
  { value: "COMPLETED", label: "Completed" },
  { value: "FAILED", label: "Failed" },
];

const TYPE_OPTIONS = [
  { value: "", label: "All email types" },
  { value: "SEND_VERIFICATION_EMAIL", label: "Email verification" },
  { value: "INVITATION_EMAIL", label: "Recruiter invitation" },
  {
    value: "SEND_COMPANY_VERIFICATION_EMAIL",
    label: "Company verification",
  },
  { value: "EMPLOYMENT_EVENT_EMAIL", label: "Employment event" },
  { value: "APPLICATION_ACCEPTED_EMAIL", label: "Application accepted" },
  {
    value: "COMPANY_JOIN_REQUEST_STATUS_EMAIL",
    label: "Company join request status",
  },
];

const inputClass =
  "h-11 w-full rounded-lg border border-[var(--df-line)] bg-[var(--df-paper)] px-4 text-sm text-[var(--df-text)] outline-none transition placeholder:text-[var(--df-muted)] focus:border-[var(--df-accent)]";

const secondaryButton =
  "df-btn df-btn-outline !min-h-10 !px-4 disabled:cursor-not-allowed disabled:opacity-50";

const primaryButton =
  "df-btn df-btn-accent !min-h-10 !px-4 disabled:cursor-not-allowed disabled:opacity-50";

function formatLabel(value) {
  if (!value) return "Unknown";
  return String(value)
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-PK", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getStatusTone(status) {
  const normalized = String(status || "").toUpperCase();

  if (["SENT", "SUCCESS", "DELIVERED", "COMPLETED"].includes(normalized)) {
    return {
      icon: CircleCheck,
      className: "border-emerald-700/20 text-emerald-700",
      dotClass: "bg-emerald-600",
    };
  }

  if (["FAILED", "ERROR", "BOUNCED", "REJECTED"].includes(normalized)) {
    return {
      icon: CircleX,
      className: "border-red-700/20 text-red-700",
      dotClass: "bg-red-600",
    };
  }

  if (
    ["PENDING", "QUEUED", "PROCESSING", "RETRYING", "SCHEDULED"].includes(
      normalized
    )
  ) {
    return {
      icon: CircleDashed,
      className: "border-amber-700/20 text-amber-700",
      dotClass: "bg-amber-600",
    };
  }

  return {
    icon: Activity,
    className: "border-[var(--df-line)] text-[var(--df-muted)]",
    dotClass: "bg-[var(--df-muted)]",
  };
}

function StatusBadge({ status }) {
  const tone = getStatusTone(status);

  return (
    <span
      className={`inline-flex items-center gap-2 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs ${tone.className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${tone.dotClass}`} />
      {formatLabel(status)}
    </span>
  );
}

function Metric({ label, value, note, icon: Icon }) {
  return (
    <div className="border border-[var(--df-line)] p-4 sm:p-5">
      <div className="flex items-center justify-between gap-2">
        <p className="df-eyebrow">{label}</p>
        <Icon size={15} className="text-[var(--df-muted)]" strokeWidth={1.7} />
      </div>
      <p className="mt-5 text-[30px] font-medium leading-none tracking-[-0.07em] text-[var(--df-text-strong)]">
        {value}
      </p>
      <p className="mt-2 text-[10px] text-[var(--df-muted)]">{note}</p>
    </div>
  );
}

function SkeletonRows() {
  return Array.from({ length: 6 }).map((_, index) => (
    <tr key={index} className="border-t border-[var(--df-line)]">
      {Array.from({ length: 5 }).map((__, cellIndex) => (
        <td key={cellIndex} className="px-5 py-5">
          <div className="h-3.5 animate-pulse rounded bg-[var(--df-paper-2)]" />
        </td>
      ))}
    </tr>
  ));
}

function ConfirmDeleteDialog({ log, busy, onCancel, onConfirm }) {
  if (!log) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !busy) onCancel();
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape" && !busy) onCancel();
      }}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-email-log-title"
        aria-describedby="delete-email-log-description"
        className="w-full max-w-md border border-[var(--df-line)] bg-[var(--df-paper)] p-6 shadow-2xl"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center border border-red-600/20 text-red-600">
            <ShieldAlert size={20} />
          </div>

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--df-muted)]">
              Admin action
            </p>
            <h2
              id="delete-email-log-title"
              className="mt-1 text-lg font-semibold tracking-tight text-[var(--df-text)]"
            >
              Delete email log?
            </h2>
          </div>
        </div>

        <p
          id="delete-email-log-description"
          className="mt-5 break-words text-sm leading-6 text-[var(--df-muted)]"
        >
          This will permanently remove the log record for{" "}
          <span className="font-semibold text-[var(--df-text)]">
            {log.email || "this email event"}
          </span>
          . It does not recall or unsend an email that has already been sent.
        </p>

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            disabled={busy}
            onClick={onCancel}
            className={secondaryButton}
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={busy}
            onClick={onConfirm}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-red-600 px-5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
          >
            {busy ? (
              <LoaderCircle size={16} className="animate-spin" />
            ) : (
              <Trash2 size={15} />
            )}
            {busy ? "Deleting…" : "Delete log"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminEmailLogsPage() {
  const dispatch = useDispatch();

  const {
    emailLogs = [],
    pagination = {},
    loadingList,
    deletingEmailLogIds = [],
    errorList,
    deleteErrors = {},
  } = useSelector((state) => state.adminEmailLogs);

  const [status, setStatus] = useState("");
  const [type, setType] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [filters, setFilters] = useState({ status: "", type: "", email: "" });
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [page, setPage] = useState(1);
  const [selectedLog, setSelectedLog] = useState(null);
  const [notice, setNotice] = useState(null);

  const limit = pagination.limit || PAGE_SIZE;
  const total = pagination.total || 0;
  const totalPages = pagination.totalPages || 0;

  const loadLogs = useCallback(() => {
    return dispatch(
      fetchAdminEmailLogs({
        page,
        limit: PAGE_SIZE,
        ...(filters.status ? { status: filters.status } : {}),
        ...(filters.type ? { type: filters.type } : {}),
        ...(filters.email ? { email: filters.email } : {}),
        sortBy,
        sortOrder,
      })
    );
  }, [dispatch, page, filters, sortBy, sortOrder]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const deleting = selectedLog
    ? deletingEmailLogIds.includes(selectedLog.id)
    : false;

  const visibleStats = useMemo(() => {
    const successful = emailLogs.filter((log) =>
      ["SENT", "SUCCESS", "DELIVERED", "COMPLETED"].includes(
        String(log.status || "").toUpperCase()
      )
    ).length;

    const failed = emailLogs.filter((log) =>
      ["FAILED", "ERROR", "BOUNCED", "REJECTED"].includes(
        String(log.status || "").toUpperCase()
      )
    ).length;

    const pending = emailLogs.filter((log) =>
      ["PENDING", "QUEUED", "PROCESSING", "RETRYING", "SCHEDULED"].includes(
        String(log.status || "").toUpperCase()
      )
    ).length;

    return { successful, failed, pending };
  }, [emailLogs]);

  const hasFilters = Boolean(filters.status || filters.type || filters.email);

  function applyFilters(event) {
    event.preventDefault();
    setPage(1);
    setFilters({ status, type, email: emailInput.trim() });
    setNotice(null);
  }

  function clearFilters() {
    setStatus("");
    setType("");
    setEmailInput("");
    setFilters({ status: "", type: "", email: "" });
    setPage(1);
    setNotice(null);
  }

  function changeSort(nextSort) {
    if (sortBy === nextSort) {
      setSortOrder((current) => (current === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(nextSort);
      setSortOrder(nextSort === "createdAt" ? "desc" : "asc");
    }

    setPage(1);
  }

  async function handleDelete() {
    if (!selectedLog || deleting) return;

    const log = selectedLog;

    try {
      await dispatch(deleteAdminEmailLog(log.id)).unwrap();

      setSelectedLog(null);
      setNotice({
        type: "success",
        message: "Email log deleted successfully.",
      });

      // If this was the only row on a later page, move back one page.
      if (emailLogs.length === 1 && page > 1) {
        setPage((current) => Math.max(1, current - 1));
      } else {
        await loadLogs();
      }
    } catch {
      setNotice({
        type: "error",
        message: "The email log could not be deleted. Please try again.",
      });
    }
  }

  const startRow = total === 0 ? 0 : (page - 1) * limit + 1;
  const endRow = Math.min(page * limit, total);

  return (
    <main className="min-h-full text-[var(--df-text)]">
      <div className="mx-auto max-w-[1440px]">
        {/* Heading */}
        <header className="flex flex-col gap-5 border-b border-[var(--df-line)] pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="df-eyebrow">
              Admin workspace <span className="mx-2 opacity-50">/</span>{" "}
              Communications
            </p>

            <h1 className="mt-3 text-3xl font-medium tracking-[-0.045em] sm:text-4xl">
              Email logs
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--df-muted)]">
              Review email activity, monitor delivery outcomes, and investigate
              failed email events across the platform.
            </p>
          </div>

          <button
            type="button"
            onClick={() => loadLogs()}
            disabled={loadingList}
            className={secondaryButton}
          >
            <RefreshCw
              size={15}
              className={loadingList ? "animate-spin" : ""}
            />
            Refresh data
          </button>
        </header>

        {/* Feedback */}
        {notice && (
          <div
            role="status"
            className={`mt-5 flex items-start gap-3 border px-4 py-3 text-sm ${
              notice.type === "success"
                ? "border-emerald-700/20 text-emerald-700"
                : "border-red-700/20 text-red-700"
            }`}
          >
            {notice.type === "success" ? (
              <CheckCircle2 size={17} className="mt-0.5 shrink-0" />
            ) : (
              <AlertCircle size={17} className="mt-0.5 shrink-0" />
            )}

            <span className="flex-1">{notice.message}</span>

            <button
              type="button"
              aria-label="Dismiss notification"
              onClick={() => setNotice(null)}
              className="opacity-70 transition hover:opacity-100"
            >
              <X size={15} />
            </button>
          </div>
        )}

        {/* Summary strip */}
        <section
          aria-label="Email log statistics"
          className="mt-6 grid grid-cols-1 gap-3 min-[480px]:grid-cols-2 xl:grid-cols-4"
        >
          <div>
            <Metric
              label="Matching logs"
              value={total.toLocaleString()}
              note="Across matching pages"
              icon={Mail}
            />
          </div>

          <div>
            <Metric
              label="Successful"
              value={visibleStats.successful.toLocaleString()}
              note="On this page"
              icon={CheckCircle2}
            />
          </div>

          <div>
            <Metric
              label="Failed"
              value={visibleStats.failed.toLocaleString()}
              note="On this page"
              icon={AlertCircle}
            />
          </div>

          <div>
            <Metric
              label="Pending"
              value={visibleStats.pending.toLocaleString()}
              note="On this page"
              icon={Clock3}
            />
          </div>
        </section>

        {/* Filters */}
        <section className="mt-8 border border-[var(--df-line)] bg-[var(--df-paper)] p-4 sm:p-6">
          <div className="flex flex-col gap-2 border-b border-[var(--df-line)] pb-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="df-eyebrow">Email operations</p>
              <h2 className="mt-2 text-xl font-medium tracking-tight">
                Activity records
              </h2>
            </div>

            <p className="text-xs text-[var(--df-muted)]">
              {total.toLocaleString()} matching{" "}
              {total === 1 ? "record" : "records"}
            </p>
          </div>

          <form
            onSubmit={applyFilters}
            className="grid grid-cols-1 gap-3 pt-5 sm:grid-cols-2 xl:grid-cols-[1fr_1fr_1.5fr_auto_auto] xl:items-end"
          >
            <div>
              <label
                htmlFor="email-log-status"
                className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--df-muted)]"
              >
                Status
              </label>

              <select
                id="email-log-status"
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                className={inputClass}
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="email-log-type"
                className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--df-muted)]"
              >
                Email type
              </label>

              <select
                id="email-log-type"
                value={type}
                onChange={(event) => setType(event.target.value)}
                className={inputClass}
              >
                {TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="email-log-recipient"
                className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--df-muted)]"
              >
                Recipient email
              </label>

              <div className="relative">
                <Search
                  size={15}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--df-muted)]"
                />

                <input
                  id="email-log-recipient"
                  type="search"
                  value={emailInput}
                  onChange={(event) => setEmailInput(event.target.value)}
                  placeholder="Search email address"
                  autoComplete="off"
                  className={`${inputClass} pl-10`}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loadingList}
              className={primaryButton}
            >
              <Search size={15} />
              Apply filters
            </button>

            <button
              type="button"
              disabled={loadingList || (!hasFilters && !status && !type && !emailInput)}
              onClick={clearFilters}
              className={secondaryButton}
            >
              <X size={15} />
              Clear
            </button>
          </form>
        </section>

        {/* Load error */}
        {errorList && !loadingList && (
          <div className="mt-5 flex flex-col gap-3 border border-red-700/20 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-600" />

              <div>
                <p className="text-sm font-semibold">
                  Could not load email logs
                </p>
                <p className="mt-1 break-words text-sm text-[var(--df-muted)]">
                  {typeof errorList === "string"
                    ? errorList
                    : errorList?.message || "An unexpected error occurred."}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => loadLogs()}
              className={secondaryButton}
            >
              Try again
            </button>
          </div>
        )}

        {/* Logs table */}
        <section className="mt-5 overflow-hidden border border-[var(--df-line)] bg-[var(--df-paper)]">
          <div className="flex flex-col gap-2 border-b border-[var(--df-line)] py-4 sm:flex-row sm:items-center sm:justify-between mx-5">
            <p className="text-xs text-[var(--df-muted)]">
              Showing{" "}
              <span className="font-medium text-[var(--df-text)]">
                {startRow}–{endRow}
              </span>{" "}
              of{" "}
              <span className="font-medium text-[var(--df-text)]">
                {total.toLocaleString()}
              </span>{" "}
              records
            </p>

            <p className="text-xs text-[var(--df-muted)]">
              Sorted by {sortBy} ·{" "}
              {sortOrder === "desc" ? "Newest first" : "Oldest first"}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px] border-collapse text-left">
              <thead>
                <tr className="border-b border-[var(--df-line)]">
                  <th className="px-5 py-4 text-[10px] font-semibold uppercase tracking-[0.13em] text-[var(--df-muted)]">
                    Recipient
                  </th>

                  <th className="px-5 py-4 text-[10px] font-semibold uppercase tracking-[0.13em] text-[var(--df-muted)]">
                    Email type
                  </th>

                  <th className="px-5 py-4 text-[10px] font-semibold uppercase tracking-[0.13em] text-[var(--df-muted)]">
                    Status
                  </th>

                  <th className="px-5 py-4 text-[10px] font-semibold uppercase tracking-[0.13em] text-[var(--df-muted)]">
                    Delivery details
                  </th>

                  <th className="px-5 py-4">
                    <button
                      type="button"
                      onClick={() => changeSort("createdAt")}
                      className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.13em] text-[var(--df-muted)] transition hover:text-[var(--df-text)]"
                    >
                      Created
                      {sortBy === "createdAt" ? (
                        sortOrder === "asc" ? (
                          <ArrowUp size={13} />
                        ) : (
                          <ArrowDown size={13} />
                        )
                      ) : (
                        <ArrowUpDown size={13} />
                      )}
                    </button>
                  </th>

                  <th className="px-5 py-4 text-right text-[10px] font-semibold uppercase tracking-[0.13em] text-[var(--df-muted)]">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {loadingList ? (
                  <SkeletonRows />
                ) : errorList ? null : emailLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-20 text-center">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center border border-[var(--df-line)] text-[var(--df-muted)]">
                        <Mail size={20} />
                      </div>

                      <p className="mt-4 text-sm font-semibold">
                        No email logs found
                      </p>

                      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[var(--df-muted)]">
                        {hasFilters
                          ? "No records match these filters. Try changing or clearing your filters."
                          : "Email activity will appear here when log records are available."}
                      </p>

                      {hasFilters && (
                        <button
                          type="button"
                          onClick={clearFilters}
                          className="mt-4 text-xs font-semibold underline underline-offset-4"
                        >
                          Clear filters
                        </button>
                      )}
                    </td>
                  </tr>
                ) : (
                  emailLogs.map((log) => {
                    const isDeleting = deletingEmailLogIds.includes(log.id);
                    const deleteError = deleteErrors[log.id];

                    // Optional properties are only displayed if the API returns them.
                    const detail =
                      log.error ||
                      log.errorMessage ||
                      log.failureReason ||
                      log.subject ||
                      log.message;

                    return (
                      <tr
                        key={log.id}
                        className="border-b border-[var(--df-line)] transition last:border-b-0 hover:bg-[var(--df-paper-2)]/50"
                      >
                        <td className="max-w-[290px] px-5 py-5">
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5 shrink-0 text-[var(--df-muted)]">
                              <Mail size={17} strokeWidth={1.7} />
                            </div>

                            <div className="min-w-0">
                              <p
                                className="truncate text-sm font-medium"
                                title={log.email || ""}
                              >
                                {log.email || "Unknown recipient"}
                              </p>

                              <p
                                className="mt-1 truncate font-mono text-[10px] text-[var(--df-muted)]"
                                title={log.id}
                              >
                                ID: {log.id}
                              </p>
                            </div>
                          </div>

                          {deleteError && (
                            <div className="mt-3 flex items-start gap-2 text-xs leading-5 text-red-600">
                              <AlertCircle
                                size={13}
                                className="mt-0.5 shrink-0"
                              />
                              <span>{deleteError}</span>

                              <button
                                type="button"
                                aria-label="Dismiss delete error"
                                onClick={() =>
                                  dispatch(
                                    clearAdminEmailLogDeleteError(log.id)
                                  )
                                }
                                className="ml-auto shrink-0"
                              >
                                <X size={12} />
                              </button>
                            </div>
                          )}
                        </td>

                        <td className="px-5 py-5">
                          <p className="text-sm font-medium">
                            {formatLabel(log.type)}
                          </p>

                          {log.subject && (
                            <p
                              className="mt-1 max-w-[200px] truncate text-xs text-[var(--df-muted)]"
                              title={log.subject}
                            >
                              {log.subject}
                            </p>
                          )}
                        </td>

                        <td className="px-5 py-5">
                          <StatusBadge status={log.status} />
                        </td>

                        <td className="max-w-[260px] px-5 py-5">
                          {detail ? (
                            <p
                              className={`line-clamp-2 text-xs leading-5 ${
                                ["FAILED", "ERROR", "BOUNCED"].includes(
                                  String(log.status || "").toUpperCase()
                                )
                                  ? "text-red-700"
                                  : "text-[var(--df-muted)]"
                              }`}
                              title={String(detail)}
                            >
                              {String(detail)}
                            </p>
                          ) : (
                            <span className="text-xs text-[var(--df-muted)]">
                              No additional details
                            </span>
                          )}
                        </td>

                        <td className="whitespace-nowrap px-5 py-5 text-sm text-[var(--df-muted)]">
                          {formatDate(log.createdAt)}
                        </td>

                        <td className="px-5 py-5 text-right">
                          <button
                            type="button"
                            aria-label={`Delete email log for ${log.email || log.id}`}
                            title="Delete email log"
                            disabled={isDeleting}
                            onClick={() => {
                              setNotice(null);
                              setSelectedLog(log);
                            }}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[var(--df-muted)] transition hover:bg-red-600/10 hover:text-red-600 disabled:opacity-40"
                          >
                            {isDeleting ? (
                              <LoaderCircle
                                size={16}
                                className="animate-spin"
                              />
                            ) : (
                              <Trash2 size={16} />
                            )}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex flex-col gap-4 border-t border-[var(--df-line)] py-4 sm:flex-row sm:items-center sm:justify-between mx-5">
            <p className="text-xs text-[var(--df-muted)]">
              Page{" "}
              <span className="font-medium text-[var(--df-text)]">{page}</span>{" "}
              of{" "}
              <span className="font-medium text-[var(--df-text)]">
                {Math.max(totalPages, 1)}
              </span>
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Previous page"
                disabled={loadingList || page <= 1}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                className={secondaryButton}
              >
                <ChevronLeft size={15} />
                Previous
              </button>

              <button
                type="button"
                aria-label="Next page"
                disabled={
                  loadingList ||
                  !(pagination.hasNextPage ?? page < totalPages)
                }
                onClick={() =>
                  setPage((current) =>
                    Math.min(totalPages || 1, current + 1)
                  )
                }
                className={secondaryButton}
              >
                Next
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        </section>

        <p className="mt-4 text-xs leading-5 text-[var(--df-muted)]">
          This page displays email-log metadata only. It does not send, retry,
          or recall emails.
        </p>
      </div>

      <ConfirmDeleteDialog
        log={selectedLog}
        busy={deleting}
        onCancel={() => setSelectedLog(null)}
        onConfirm={handleDelete}
      />
    </main>
  );
}
