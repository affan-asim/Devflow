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
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  File,
  FileImage,
  FileText,
  LoaderCircle,
  RefreshCw,
  Search,
  ShieldAlert,
  Trash2,
  UserRound,
  X,
} from "lucide-react";

import {
  fetchAdminFiles,
  deleteAdminFile,
  clearAdminFileDeleteError,
} from "@/lib/redux/slices/adminFilesSlice";

import api from "@/lib/api/axios";

const PAGE_SIZE = 20;

const TYPE_OPTIONS = [
  { value: "", label: "All file types" },
  { value: "RESUME", label: "Resume" },
  { value: "COVER_LETTER", label: "Cover letter" },
  { value: "AVATAR", label: "Avatar" },
];

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "PERMANENT", label: "Permanent" },
  { value: "TEMP", label: "Temporary" },
];

const inputClass =
  "min-h-10 w-full border border-[var(--df-line)] bg-transparent px-3 text-xs text-[var(--df-text)] outline-none transition placeholder:text-[var(--df-muted)] focus:border-[var(--df-accent)]";

const secondaryButton =
  "df-btn df-btn-outline inline-flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-50";

const primaryButton =
  "df-btn df-btn-accent inline-flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-50";

function getFileName(key) {
  if (!key) return "Unnamed file";
  return String(key).split("/").filter(Boolean).pop() || "Unnamed file";
}

function getInitials(name) {
  if (!name?.trim()) return "U";

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
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

function formatType(type) {
  const labels = {
    RESUME: "Resume",
    COVER_LETTER: "Cover letter",
    AVATAR: "Avatar",
  };

  return labels[type] || String(type || "Unknown").replaceAll("_", " ");
}

function formatStatus(status) {
  const labels = {
    PERMANENT: "Permanent",
    TEMP: "Temporary",
  };

  return labels[status] || String(status || "Unknown").replaceAll("_", " ");
}

function TypeIcon({ type, size = 17 }) {
  if (type === "AVATAR") return <FileImage size={size} strokeWidth={1.7} />;

  if (type === "RESUME" || type === "COVER_LETTER") {
    return <FileText size={size} strokeWidth={1.7} />;
  }

  return <File size={size} strokeWidth={1.7} />;
}

function StatusBadge({ status }) {
  const isPermanent = status === "PERMANENT";
  const isTemporary = status === "TEMP";

  const tone = isPermanent
    ? "border-emerald-700/20 text-emerald-700"
    : isTemporary
      ? "border-amber-700/25 text-amber-700"
      : "border-[var(--df-line)] text-[var(--df-muted)]";

  const dot = isPermanent
    ? "bg-emerald-600"
    : isTemporary
      ? "bg-amber-600"
      : "bg-[var(--df-muted)]";

  return (
    <span
      className={`inline-flex items-center gap-2 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs ${tone}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {formatStatus(status)}
    </span>
  );
}

function TypeBadge({ type }) {
  return (
    <span className="inline-flex items-center gap-2 whitespace-nowrap text-sm text-[var(--df-text)]">
      <span className="text-[var(--df-muted)]">
        <TypeIcon type={type} size={16} />
      </span>
      {formatType(type)}
    </span>
  );
}

function Metric({ label, value, note, icon: Icon }) {
  return (
    <div className="min-w-0 border border-[var(--df-line)] bg-[var(--df-paper)] p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs text-[var(--df-muted)]">{label}</p>
        <Icon size={17} strokeWidth={1.6} className="shrink-0 text-[var(--df-muted)]" />
      </div>
      <p className="mt-4 text-3xl font-medium tracking-[-0.06em] text-[var(--df-text-strong)]">
        {value}
      </p>
      <p className="mt-2 text-[11px] text-[var(--df-muted)]">{note}</p>
    </div>
  );
}

function SkeletonRows() {
  return Array.from({ length: 6 }).map((_, index) => (
    <tr key={index} className="border-t border-[var(--df-line)]">
      {Array.from({ length: 6 }).map((__, cellIndex) => (
        <td key={cellIndex} className="px-5 py-5">
          <div className="h-3.5 animate-pulse rounded bg-[var(--df-paper-2)]" />
        </td>
      ))}
    </tr>
  ));
}

function ConfirmDeleteDialog({ file, busy, onCancel, onConfirm }) {
  if (!file) return null;

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
        aria-labelledby="delete-file-title"
        aria-describedby="delete-file-description"
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
              id="delete-file-title"
              className="mt-1 text-lg font-semibold tracking-tight text-[var(--df-text)]"
            >
              Delete file record?
            </h2>
          </div>
        </div>

        <p
          id="delete-file-description"
          className="mt-5 break-words text-sm leading-6 text-[var(--df-muted)]"
        >
          You are about to delete{" "}
          <span className="font-semibold text-[var(--df-text)]">
            {getFileName(file.key)}
          </span>
          . This action cannot be undone from this screen.
        </p>

        <div className="mt-4 border-l-2 border-red-600 bg-red-600/5 px-3 py-3 text-xs leading-5 text-[var(--df-muted)]">
          This removes the database record. Physical object-storage cleanup is
          handled separately by the background queue.
        </div>

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
            className="df-btn inline-flex items-center justify-center gap-2 !border-red-600 !bg-red-600 !text-white hover:!bg-red-700 disabled:opacity-50"
          >
            {busy ? (
              <LoaderCircle size={16} className="animate-spin" />
            ) : (
              <Trash2 size={15} />
            )}
            {busy ? "Deleting…" : "Delete record"}
          </button>
        </div>
      </div>
    </div>
  );
}

/** Searchable User Select with Infinite Scroll */
function UserSelect({ value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Fetch users with search and pagination matching getUsersList
  const fetchUsers = useCallback(async (pageNum, query, reset = false) => {
    setLoading(true);
    try {
      const res = await api.get("/api/admin/users", {
        params: {
          page: pageNum,
          limit: 20,
          search: query || undefined,
        },
      });
      const data = res.data?.data || res.data?.users || [];
      const paginationData = res.data?.pagination || {};

      setUsers((prev) => (reset ? data : [...prev, ...data]));
      setTotalPages(paginationData.totalPages || 1);
    } catch (err) {
      console.error("Failed to fetch users for select:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced search & open fetch
  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      setPage(1);
      fetchUsers(1, searchQuery, true);
    }, 300);
    return () => clearTimeout(timer);
  }, [isOpen, searchQuery, fetchUsers]);

  // Sync selected user object if value prop changes externally (e.g. clear filters)
  useEffect(() => {
    if (value && !selectedUser) {
      api
        .get(`/api/admin/users/${value}`)
        .then((res) => {
          const u = res.data?.data;
          if (u) setSelectedUser(u);
        })
        .catch(() => {});
    } else if (!value) {
      setSelectedUser(null);
    }
  }, [value, selectedUser]);

  // Handle infinite scroll inside dropdown list
  const handleScroll = (e) => {
    const { scrollTop, clientHeight, scrollHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight + 30 && !loading && page < totalPages) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchUsers(nextPage, searchQuery, false);
    }
  };

  // Close dropdown on click outside
  useEffect(() => {
    if (!isOpen) return;
    function handleClickOutside(e) {
      if (!e.target.closest("#user-select-container")) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <div id="user-select-container" className="relative">
      <label
        htmlFor="file-user-select"
        className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--df-muted)]"
      >
        Owner User
      </label>

      <div
        id="file-user-select"
        onClick={() => setIsOpen(!isOpen)}
        className={`${inputClass} flex cursor-pointer items-center justify-between select-none`}
      >
        <span className="truncate">
          {selectedUser
            ? `${selectedUser.name} (${selectedUser.email})`
            : "All users"}
        </span>
        <div className="flex items-center gap-1 text-[var(--df-muted)]">
          {selectedUser && (
            <span
              onClick={(e) => {
                e.stopPropagation();
                setSelectedUser(null);
                onChange("");
              }}
              className="hover:text-[var(--df-text)]"
            >
              <X size={14} />
            </span>
          )}
          <ChevronDown size={15} />
        </div>
      </div>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 border border-[var(--df-line)] bg-[var(--df-paper)] shadow-2xl">
          <div className="border-b border-[var(--df-line)] p-2">
            <div className="relative">
              <Search
                size={14}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--df-muted)]"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search user by name or email..."
                className="w-full border border-[var(--df-line)] bg-transparent py-1.5 pl-9 pr-3 text-xs text-[var(--df-text)] outline-none focus:border-[var(--df-accent)]"
                autoFocus
              />
            </div>
          </div>

          <div
            onScroll={handleScroll}
            className="max-h-60 divide-y divide-[var(--df-line)]/50 overflow-y-auto p-1"
          >
            <div
              onClick={() => {
                setSelectedUser(null);
                onChange("");
                setIsOpen(false);
              }}
              className="cursor-pointer px-3 py-2 text-xs font-medium text-[var(--df-muted)] hover:bg-[var(--df-paper-2)]"
            >
              All users (Clear filter)
            </div>

            {users.map((u) => (
              <div
                key={u.id}
                onClick={() => {
                  setSelectedUser(u);
                  onChange(u.id);
                  setIsOpen(false);
                }}
                className={`cursor-pointer px-3 py-2 text-xs hover:bg-[var(--df-paper-2)] ${
                  value === u.id
                    ? "bg-[var(--df-paper-2)] font-semibold text-[var(--df-text)]"
                    : "text-[var(--df-text)]"
                }`}
              >
                <div className="truncate font-medium">
                  {u.name || "Unnamed user"}
                </div>
                <div className="truncate text-[10px] text-[var(--df-muted)]">
                  {u.email}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-center justify-center gap-2 py-3 text-center text-xs text-[var(--df-muted)]">
                <LoaderCircle size={14} className="animate-spin" /> Loading
                more users...
              </div>
            )}

            {!loading && users.length === 0 && (
              <div className="py-4 text-center text-xs text-[var(--df-muted)]">
                No users found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminFilesPage() {
  const dispatch = useDispatch();

  const {
    files = [],
    pagination = {},
    loadingList,
    deletingFileIds = [],
    errorList,
    deleteErrors = {},
  } = useSelector((state) => state.adminFiles);

  const [status, setStatus] = useState("");
  const [type, setType] = useState("");
  const [userId, setUserId] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [page, setPage] = useState(1);
  const [selectedFile, setSelectedFile] = useState(null);
  const [notice, setNotice] = useState(null);

  const limit = pagination.limit || PAGE_SIZE;
  const total = pagination.total || 0;
  const totalPages = pagination.totalPages || 0;

  const loadFiles = useCallback(() => {
    return dispatch(
      fetchAdminFiles({
        page,
        limit: PAGE_SIZE,
        ...(status ? { status } : {}),
        ...(type ? { type } : {}),
        ...(userId ? { userId } : {}),
        sortBy,
        sortOrder,
      })
    );
  }, [dispatch, page, status, type, userId, sortBy, sortOrder]);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  const deleting = selectedFile
    ? deletingFileIds.includes(selectedFile.id)
    : false;

  const visibleStats = useMemo(
    () => ({
      permanent: files.filter((file) => file.status === "PERMANENT").length,
      temporary: files.filter((file) => file.status === "TEMP").length,
      unknown: files.filter(
        (file) => !["PERMANENT", "TEMP"].includes(file.status)
      ).length,
    }),
    [files]
  );

  const hasFilters = Boolean(status || type || userId);

  function applyFilters(event) {
    event.preventDefault();
    setPage(1);
    setNotice(null);
  }

  function clearFilters() {
    setStatus("");
    setType("");
    setUserId("");
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
    if (!selectedFile || deleting) return;

    const file = selectedFile;

    try {
      await dispatch(deleteAdminFile(file.id)).unwrap();
      setSelectedFile(null);
      setNotice({
        type: "success",
        message: "File record deleted successfully.",
      });

      await loadFiles();
    } catch {
      setNotice({
        type: "error",
        message: "The file could not be deleted. Review the error and try again.",
      });
    }
  }

  const startPage = total === 0 ? 0 : (page - 1) * limit + 1;
  const endPage = Math.min(page * limit, total);

  return (
    <main className="mx-auto w-full max-w-[1440px] px-5 py-8 text-[var(--df-text)] sm:px-8 sm:py-10 lg:px-10">
      {/* Page heading */}
      <header className="flex flex-col justify-between gap-5 border-b border-[var(--df-line)] pb-7 sm:flex-row sm:items-start">
        <div>
          <p className="df-eyebrow">DevFlow / Administration</p>

          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.075em] text-[var(--df-text-strong)] sm:text-[44px]">
            Files<span className="text-[var(--df-muted)]">.</span>
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--df-muted)]">
            Review stored file records, verify ownership, and manage uploads
            across the platform.
          </p>
        </div>

        <button
          type="button"
          onClick={() => loadFiles()}
          disabled={loadingList}
          className={`${secondaryButton} self-start`}
        >
          <RefreshCw size={15} className={loadingList ? "animate-spin" : ""} />
          Refresh
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

      {/* Metrics */}
      <section
        aria-label="File statistics"
        className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4"
      >
        <div>
          <Metric
            label="Matching records"
            value={total.toLocaleString()}
            note="All matching pages"
            icon={FileText}
          />
        </div>

        <div>
          <Metric
            label="Permanent"
            value={visibleStats.permanent.toLocaleString()}
            note="On this page"
            icon={CheckCircle2}
          />
        </div>

        <div>
          <Metric
            label="Temporary"
            value={visibleStats.temporary.toLocaleString()}
            note="On this page"
            icon={Activity}
          />
        </div>

        <div>
          <Metric
            label="Page"
            value={`${page}${totalPages ? ` / ${totalPages}` : ""}`}
            note={`${files.length} records loaded`}
            icon={File}
          />
        </div>
      </section>

      {/* Filters */}
      <section className="mt-5 border border-[var(--df-line)] bg-[var(--df-paper)]">
        <div className="flex flex-col gap-3 border-b border-[var(--df-line)] p-3 sm:p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-semibold text-[var(--df-text-strong)]">
                File records
              </h2>
              <p className="mt-1 text-xs text-[var(--df-muted)]">
                Filter and sort stored uploads
              </p>
            </div>

            <p className="text-xs text-[var(--df-muted)]">
              {total.toLocaleString()} matching{" "}
              {total === 1 ? "record" : "records"}
            </p>
          </div>

          <form
            onSubmit={applyFilters}
            className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-[1fr_1fr_1.4fr_auto_auto] xl:items-end"
          >
            <div>
              <label
                htmlFor="file-status"
                className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--df-muted)]"
              >
                Status
              </label>

              <select
                id="file-status"
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
                htmlFor="file-type"
                className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--df-muted)]"
              >
                File type
              </label>

              <select
                id="file-type"
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

            {/* Custom Searchable User Select Box with Infinite Scroll */}
            <UserSelect
              value={userId}
              onChange={(id) => {
                setUserId(id);
                setPage(1);
                setNotice(null);
              }}
            />

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
              disabled={!hasFilters}
              onClick={clearFilters}
              className={secondaryButton}
            >
              <X size={15} />
              Clear
            </button>
          </form>
        </div>
      </section>

      {/* Load error */}
      {errorList && !loadingList && (
        <div className="mt-5 flex flex-col gap-3 border border-red-700/20 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-600" />

            <div>
              <p className="text-sm font-semibold">
                Could not load file records
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
            onClick={() => loadFiles()}
            className={secondaryButton}
          >
            Try again
          </button>
        </div>
      )}

      {/* Table */}
      <section className="mt-5 border border-[var(--df-line)] bg-[var(--df-paper)]">
        <div className="flex flex-col gap-2 border-b border-[var(--df-line)] bg-[var(--df-paper-2)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-[var(--df-muted)]">
            Showing{" "}
            <span className="font-medium text-[var(--df-text)]">
              {startPage}–{endPage}
            </span>{" "}
            of{" "}
            <span className="font-medium text-[var(--df-text)]">
              {total.toLocaleString()}
            </span>{" "}
            records
          </p>

          <p className="text-xs text-[var(--df-muted)]">
            Sorted by {sortBy === "createdAt" ? "date created" : sortBy} ·{" "}
            {sortOrder === "desc" ? "Newest first" : "Oldest first"}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-left">
            <thead className="bg-[var(--df-paper-2)]">
              <tr className="border-b border-[var(--df-line)]">
                {["File", "Owner", "Type", "Status"].map((heading) => (
                  <th
                    key={heading}
                    className="px-4 py-4 text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--df-muted)]"
                  >
                    {heading}
                  </th>
                ))}

                <th className="px-4 py-4">
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

                <th className="px-4 py-4 text-right text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--df-muted)]">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {loadingList ? (
                <SkeletonRows />
              ) : errorList ? null : files.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-20 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center border border-[var(--df-line)] text-[var(--df-muted)]">
                      <File size={20} />
                    </div>

                    <p className="mt-4 text-sm font-semibold">No files found</p>

                    <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[var(--df-muted)]">
                      {hasFilters
                        ? "No records match these filters. Try changing or clearing your filters."
                        : "There are no file records to display yet."}
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
                files.map((file) => {
                  const isDeleting = deletingFileIds.includes(file.id);
                  const deleteError = deleteErrors[file.id];
                  const owner = file.user;

                  return (
                    <tr
                      key={file.id}
                      className="border-b border-[var(--df-line)] transition last:border-b-0 hover:bg-[var(--df-paper-2)]/50"
                    >
                      <td className="max-w-[320px] px-5 py-5">
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 shrink-0 text-[var(--df-muted)]">
                            <TypeIcon type={file.type} size={18} />
                          </div>

                          <div className="min-w-0">
                            <p
                              className="truncate text-sm font-medium"
                              title={getFileName(file.key)}
                            >
                              {getFileName(file.key)}
                            </p>

                            <p
                              className="mt-1 truncate font-mono text-[10px] text-[var(--df-muted)]"
                              title={file.id}
                            >
                              ID: {file.id}
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
                                dispatch(clearAdminFileDeleteError(file.id))
                              }
                              className="ml-auto shrink-0"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        )}
                      </td>

                      <td className="px-5 py-5">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[var(--df-line)] text-[10px] font-semibold text-[var(--df-muted)]">
                            {owner?.name ? (
                              getInitials(owner.name)
                            ) : (
                              <UserRound size={14} />
                            )}
                          </div>

                          <div className="min-w-0">
                            <p className="max-w-[200px] truncate text-sm font-medium">
                              {owner?.name || "Unknown user"}
                            </p>

                            <p className="mt-1 max-w-[200px] truncate text-xs text-[var(--df-muted)]">
                              {owner?.email || "No email available"}
                            </p>

                            {owner?.role && (
                              <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-[var(--df-muted)]">
                                {owner.role}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-5">
                        <TypeBadge type={file.type} />
                      </td>

                      <td className="px-5 py-5">
                        <StatusBadge status={file.status} />
                      </td>

                      <td className="whitespace-nowrap px-5 py-5 text-sm text-[var(--df-muted)]">
                        {formatDate(file.createdAt)}
                      </td>

                      <td className="px-5 py-5 text-right">
                        <div className="inline-flex items-center gap-1">
                          <a
                            href={`/api/admin/files/${encodeURIComponent(file.id)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`Open ${getFileName(file.key)}`}
                            title="Open document"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[var(--df-muted)] transition hover:bg-[var(--df-paper-2)] hover:text-[var(--df-text)]"
                          >
                            <ExternalLink size={16} />
                          </a>

                          <button
                            type="button"
                            aria-label={`Delete ${getFileName(file.key)}`}
                            title="Delete file record"
                            disabled={isDeleting}
                            onClick={() => {
                              setNotice(null);
                              setSelectedFile(file);
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
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col gap-4 border-t border-[var(--df-line)] py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-[var(--df-muted)]">
            Page <span className="font-medium text-[var(--df-text)]">{page}</span>{" "}
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
                loadingList || !(pagination.hasNextPage ?? page < totalPages)
              }
              onClick={() =>
                setPage((current) => Math.min(totalPages || 1, current + 1))
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
        File names are derived from storage keys. Private object-storage URLs
        and file contents are not exposed in this view.
      </p>

      <ConfirmDeleteDialog
        file={selectedFile}
        busy={deleting}
        onCancel={() => setSelectedFile(null)}
        onConfirm={handleDelete}
      />
    </main>
  );
}