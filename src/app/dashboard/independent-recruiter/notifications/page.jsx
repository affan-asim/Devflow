"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import {
  Bell,
  BellRing,
  Check,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  Clock3,
  ExternalLink,
  Inbox,
  Loader2,
  RefreshCw,
} from "lucide-react";

import {
  fetchNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "@/lib/redux/slices/notificationSlice";

/* =========================================================
   HELPERS
========================================================= */

function formatNotificationDate(date) {
  if (!date) return "";

  const value = new Date(date);
  const now = new Date();

  const diff = now.getTime() - value.getTime();

  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diff < minute) {
    return "Just now";
  }

  if (diff < hour) {
    const minutes = Math.floor(diff / minute);
    return `${minutes}m ago`;
  }

  if (diff < day) {
    const hours = Math.floor(diff / hour);
    return `${hours}h ago`;
  }

  if (diff < 7 * day) {
    const days = Math.floor(diff / day);
    return `${days}d ago`;
  }

  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(value);
}

function formatFullDate(date) {
  if (!date) return "—";

  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date));
}

function formatActionType(actionType) {
  if (!actionType) return "Notification";

  return actionType
    .replaceAll("_", " ")
    .replaceAll("-", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getNotificationType(notification) {
  const actionType = String(
    notification?.actionType || ""
  ).toLowerCase();

  if (
    actionType.includes("application") ||
    actionType.includes("job")
  ) {
    return "work";
  }

  if (
    actionType.includes("message") ||
    actionType.includes("chat")
  ) {
    return "message";
  }

  if (
    actionType.includes("company") ||
    actionType.includes("recruiter")
  ) {
    return "company";
  }

  if (
    actionType.includes("profile") ||
    actionType.includes("resume")
  ) {
    return "profile";
  }

  return "general";
}

function getNotificationIcon(notification) {
  const type = getNotificationType(notification);

  switch (type) {
    case "work":
      return CheckCheck;

    case "message":
      return BellRing;

    case "company":
      return Inbox;

    case "profile":
      return Bell;

    default:
      return Bell;
  }
}

/*
 * Adjust these routes if your actual DevFlow routes differ.
 */
function getNotificationRoute(notification) {
  if (!notification?.referenceId) {
    return null;
  }

  const referenceType = String(
    notification.referenceType || ""
  ).toLowerCase();

  switch (referenceType) {
    case "application":
    case "applications":
      return `/dashboard/recruiter/applications/${notification.referenceId}`;

    case "job":
    case "jobs":
      return `/dashboard/recruiter/jobs/${notification.referenceId}`;

    case "company":
    case "companies":
      return `/dashboard/company/${notification.referenceId}`;

    case "developer":
    case "developer_profile":
    case "profile":
      return `/dashboard/developers/${notification.referenceId}`;

    case "message":
    case "conversation":
      return `/dashboard/messages/${notification.referenceId}`;

    default:
      return null;
  }
}

/* =========================================================
   STATUS / FILTER
========================================================= */

function FilterButton({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "h-9 border px-3.5 text-[10px] font-semibold uppercase tracking-[0.12em] transition",
        active
          ? "border-[var(--df-text)] bg-[var(--df-text)] text-[var(--df-paper)]"
          : "border-[var(--df-line)] bg-[var(--df-paper)] text-[var(--df-muted)] hover:border-[var(--df-text)] hover:text-[var(--df-text)]",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

/* =========================================================
   NOTIFICATION ROW
========================================================= */

function NotificationRow({
  notification,
  onOpen,
  onMarkRead,
  markingId,
}) {
  const Icon = getNotificationIcon(notification);
  const route = getNotificationRoute(notification);
  const isUnread = !notification.isRead;
  const isMarking = markingId === notification.id;

  return (
    <article
      onClick={() => onOpen(notification)}
      className={[
        "group relative border-b border-[var(--df-line)] transition",
        route || isUnread
          ? "cursor-pointer hover:bg-black/[0.02]"
          : "",
        isUnread ? "bg-black/[0.018]" : "bg-transparent",
      ].join(" ")}
    >
      <div className="flex gap-4 px-4 py-5 sm:px-5">
        {/* Unread indicator */}
        <div className="flex w-2 shrink-0 justify-center pt-2">
          {isUnread && (
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--df-accent)]" />
          )}
        </div>

        {/* Icon */}
        <div
          className={[
            "flex h-10 w-10 shrink-0 items-center justify-center border",
            isUnread
              ? "border-[var(--df-text)] bg-[var(--df-text)] text-[var(--df-paper)]"
              : "border-[var(--df-line)] text-[var(--df-muted)]",
          ].join(" ")}
        >
          <Icon size={17} strokeWidth={1.5} />
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p
                  className={[
                    "text-sm leading-5",
                    isUnread
                      ? "font-semibold text-[var(--df-text)]"
                      : "font-medium text-[var(--df-text)]",
                  ].join(" ")}
                >
                  {formatActionType(notification.actionType)}
                </p>

                {isUnread && (
                  <span className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--df-accent)]">
                    New
                  </span>
                )}
              </div>

              <p
                className={[
                  "mt-1.5 max-w-3xl text-sm leading-6",
                  isUnread
                    ? "text-[var(--df-text)]"
                    : "text-[var(--df-muted)]",
                ].join(" ")}
              >
                {notification.message}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-2 text-[10px] text-[var(--df-muted)]">
              <Clock3 size={12} strokeWidth={1.5} />
              <span title={formatFullDate(notification.createdAt)}>
                {formatNotificationDate(notification.createdAt)}
              </span>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
            {notification.referenceType && (
              <span className="border border-[var(--df-line)] px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-[var(--df-muted)]">
                {notification.referenceType.replaceAll("_", " ")}
              </span>
            )}

            {route && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--df-text)]">
                Open
                <ExternalLink size={11} />
              </span>
            )}

            {isUnread && (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onMarkRead(notification.id);
                }}
                disabled={isMarking}
                className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--df-muted)] transition hover:text-[var(--df-text)] disabled:opacity-50"
              >
                {isMarking ? (
                  <Loader2 size={11} className="animate-spin" />
                ) : (
                  <Check size={11} />
                )}

                Mark as read
              </button>
            )}
          </div>
        </div>

        {/* Open arrow */}
        {route && (
          <div className="hidden shrink-0 pt-1 text-[var(--df-muted)] transition group-hover:translate-x-0.5 group-hover:text-[var(--df-text)] sm:block">
            <ExternalLink size={15} strokeWidth={1.5} />
          </div>
        )}
      </div>
    </article>
  );
}

/* =========================================================
   SKELETON
========================================================= */

function NotificationSkeleton() {
  return (
    <div className="animate-pulse border border-[var(--df-line)]">
      {[1, 2, 3, 4, 5].map((item) => (
        <div
          key={item}
          className="flex gap-4 border-b border-[var(--df-line)] px-5 py-5 last:border-b-0"
        >
          <div className="h-10 w-10 shrink-0 bg-[var(--df-line)]" />

          <div className="flex-1">
            <div className="h-4 w-40 bg-[var(--df-line)]" />
            <div className="mt-3 h-3 w-3/4 bg-[var(--df-line)]" />
            <div className="mt-2 h-3 w-1/2 bg-[var(--df-line)]" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* =========================================================
   EMPTY STATE
========================================================= */

function EmptyNotifications({ filter }) {
  const unread = filter === "unread";
  const read = filter === "read";

  return (
    <div className="border border-dashed border-[var(--df-line)] px-6 py-20 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center border border-[var(--df-line)]">
        {unread ? (
          <CheckCheck
            size={24}
            strokeWidth={1.3}
            className="text-[var(--df-muted)]"
          />
        ) : (
          <Inbox
            size={24}
            strokeWidth={1.3}
            className="text-[var(--df-muted)]"
          />
        )}
      </div>

      <p className="mt-5 text-sm font-semibold">
        {unread
          ? "You're all caught up"
          : read
          ? "No read notifications"
          : "No notifications yet"}
      </p>

      <p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-[var(--df-muted)]">
        {unread
          ? "There are no unread notifications waiting for you."
          : read
          ? "Notifications you have already viewed will appear here."
          : "Activity related to your jobs, applications, company and account will appear here."}
      </p>
    </div>
  );
}

/* =========================================================
   ERROR STATE
========================================================= */

function ErrorState({ error, onRetry }) {
  return (
    <div className="border border-red-200 bg-red-50 px-5 py-8">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-red-600">
        Notifications
      </p>

      <h2 className="mt-2 text-lg font-semibold text-red-800">
        Something went wrong
      </h2>

      <p className="mt-1 text-sm text-red-700">
        {error || "Unable to load your notifications."}
      </p>

      <button
        type="button"
        onClick={onRetry}
        className="mt-5 inline-flex items-center gap-2 border border-red-700 bg-red-700 px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-white"
      >
        <RefreshCw size={13} />
        Try again
      </button>
    </div>
  );
}

/* =========================================================
   PAGINATION
========================================================= */

function Pagination({
  metadata,
  onPrevious,
  onNext,
}) {
  const {
    currentPage = 1,
    totalPages = 0,
    totalCount = 0,
    pageSize = 10,
    hasNextPage,
    hasPreviousPage,
  } = metadata || {};

  const start =
    totalCount === 0
      ? 0
      : (currentPage - 1) * pageSize + 1;

  const end = Math.min(
    currentPage * pageSize,
    totalCount
  );

  if (totalPages <= 1 && totalCount <= pageSize) {
    return (
      <div className="flex items-center justify-between border-t border-[var(--df-line)] pt-5">
        <p className="text-xs text-[var(--df-muted)]">
          {totalCount === 0
            ? "No notifications"
            : `${totalCount} notification${
                totalCount === 1 ? "" : "s"
              }`}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 border-t border-[var(--df-line)] pt-5 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs text-[var(--df-muted)]">
        Showing{" "}
        <span className="font-medium text-[var(--df-text)]">
          {start}–{end}
        </span>{" "}
        of{" "}
        <span className="font-medium text-[var(--df-text)]">
          {totalCount}
        </span>
      </p>

      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={!hasPreviousPage}
          onClick={onPrevious}
          className="inline-flex h-9 items-center gap-1.5 border border-[var(--df-line)] px-3 text-[10px] font-semibold uppercase tracking-[0.1em] transition hover:border-[var(--df-text)] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft size={14} />
          Previous
        </button>

        <span className="flex h-9 min-w-9 items-center justify-center border border-[var(--df-text)] bg-[var(--df-text)] px-2 text-[10px] font-semibold text-[var(--df-paper)]">
          {currentPage}
        </span>

        <button
          type="button"
          disabled={!hasNextPage}
          onClick={onNext}
          className="inline-flex h-9 items-center gap-1.5 border border-[var(--df-line)] px-3 text-[10px] font-semibold uppercase tracking-[0.1em] transition hover:border-[var(--df-text)] disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}

/* =========================================================
   PAGE
========================================================= */

export default function NotificationsPage() {
  const dispatch = useDispatch();
  const router = useRouter();

  const {
    notifications,
    unreadCount,
    metadata,
    loadingList,
    errorList,
    submitting,
  } = useSelector((state) => state.notifications);

  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("desc");
  const [page, setPage] = useState(1);
  const [markingId, setMarkingId] = useState(null);

  const loadNotifications = useCallback(() => {
    const params = {
      page,
      limit: 10,
      sort,
    };

    if (filter === "read") {
      params.isRead = true;
    }

    if (filter === "unread") {
      params.isRead = false;
    }

    dispatch(fetchNotifications(params));
  }, [dispatch, page, sort, filter]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  /*
   * Filter/sort changes should always start at page 1.
   */
  const changeFilter = (nextFilter) => {
    setFilter(nextFilter);
    setPage(1);
  };

  const changeSort = (event) => {
    setSort(event.target.value);
    setPage(1);
  };

  /*
   * Mark a single notification read.
   */
  const handleMarkRead = async (id) => {
    if (!id) return;

    setMarkingId(id);

    try {
      await dispatch(markNotificationAsRead(id)).unwrap();
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    } finally {
      setMarkingId(null);
    }
  };

  /*
   * Mark everything as read.
   */
  const handleMarkAllRead = async () => {
    if (!unreadCount || submitting) return;

    try {
      await dispatch(markAllNotificationsAsRead()).unwrap();
    } catch (error) {
      console.error(
        "Failed to mark all notifications as read:",
        error
      );
    }
  };

  /*
   * Notification click.
   *
   * 1. Mark unread notification as read.
   * 2. Navigate if notification has a known reference.
   */
  const handleOpenNotification = async (notification) => {
    if (!notification) return;

    if (!notification.isRead) {
      await handleMarkRead(notification.id);
    }

    const route = getNotificationRoute(notification);

    if (route) {
      router.push(route);
    }
  };

  const visibleNotifications = useMemo(
    () => notifications || [],
    [notifications]
  );

  return (
    <main className="min-h-screen bg-[var(--df-paper)] text-[var(--df-text)]">
      <div className="mx-auto max-w-6xl px-5 py-7 sm:px-8 lg:px-10">
        {/* =================================================
            HEADER
        ================================================= */}
        <header className="border-b border-[var(--df-line)] pb-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--df-muted)]">
                  Activity
                </p>

                {unreadCount > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center bg-[var(--df-text)] px-1.5 text-[9px] font-bold text-[var(--df-paper)]">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </div>

              <h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
                Notifications
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--df-muted)]">
                Stay up to date with applications, jobs, company activity and
                other important events across DevFlow.
              </p>
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                disabled={submitting}
                className="inline-flex h-10 w-fit items-center gap-2 border border-[var(--df-line)] px-4 text-[10px] font-semibold uppercase tracking-[0.11em] transition hover:border-[var(--df-text)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <CheckCheck size={14} />
                )}
                Mark all as read
              </button>
            )}
          </div>
        </header>

        {/* =================================================
            SUMMARY STRIP
        ================================================= */}
        <section className="grid gap-px border-x border-b border-[var(--df-line)] bg-[var(--df-line)] sm:grid-cols-3">
          <div className="bg-[var(--df-paper)] px-5 py-4">
            <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[var(--df-muted)]">
              Total
            </p>

            <p className="mt-2 text-xl font-semibold tracking-tight">
              {metadata?.totalCount || 0}
            </p>
          </div>

          <div className="bg-[var(--df-paper)] px-5 py-4">
            <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[var(--df-muted)]">
              Unread
            </p>

            <p className="mt-2 text-xl font-semibold tracking-tight">
              {unreadCount || 0}
            </p>
          </div>

          <div className="bg-[var(--df-paper)] px-5 py-4">
            <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[var(--df-muted)]">
              Current page
            </p>

            <p className="mt-2 text-xl font-semibold tracking-tight">
              {metadata?.currentPage || 1}
              <span className="ml-1 text-sm font-normal text-[var(--df-muted)]">
                / {metadata?.totalPages || 1}
              </span>
            </p>
          </div>
        </section>

        {/* =================================================
            TOOLBAR
        ================================================= */}
        <section className="mt-8 flex flex-col gap-4 border-y border-[var(--df-line)] py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            <FilterButton
              active={filter === "all"}
              onClick={() => changeFilter("all")}
            >
              All
            </FilterButton>

            <FilterButton
              active={filter === "unread"}
              onClick={() => changeFilter("unread")}
            >
              Unread
            </FilterButton>

            <FilterButton
              active={filter === "read"}
              onClick={() => changeFilter("read")}
            >
              Read
            </FilterButton>
          </div>

          <div className="flex items-center gap-3">
            <label
              htmlFor="notification-sort"
              className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--df-muted)]"
            >
              Sort
            </label>

            <select
              id="notification-sort"
              value={sort}
              onChange={changeSort}
              className="h-9 border border-[var(--df-line)] bg-[var(--df-paper)] px-3 text-xs font-medium outline-none focus:border-[var(--df-text)]"
            >
              <option value="desc">Newest first</option>
              <option value="asc">Oldest first</option>
            </select>

            <button
              type="button"
              onClick={loadNotifications}
              disabled={loadingList}
              aria-label="Refresh notifications"
              className="flex h-9 w-9 items-center justify-center border border-[var(--df-line)] text-[var(--df-muted)] transition hover:border-[var(--df-text)] hover:text-[var(--df-text)] disabled:opacity-50"
            >
              <RefreshCw
                size={14}
                className={loadingList ? "animate-spin" : ""}
              />
            </button>
          </div>
        </section>

        {/* =================================================
            LIST
        ================================================= */}
        <section className="mt-6">
          {loadingList ? (
            <NotificationSkeleton />
          ) : errorList ? (
            <ErrorState
              error={errorList}
              onRetry={loadNotifications}
            />
          ) : visibleNotifications.length === 0 ? (
            <EmptyNotifications filter={filter} />
          ) : (
            <>
              <div className="border-t border-[var(--df-line)]">
                {visibleNotifications.map((notification) => (
                  <NotificationRow
                    key={notification.id}
                    notification={notification}
                    onOpen={handleOpenNotification}
                    onMarkRead={handleMarkRead}
                    markingId={markingId}
                  />
                ))}
              </div>

              {/* =================================================
                  PAGINATION
              ================================================= */}
              <div className="mt-6">
                <Pagination
                  metadata={metadata}
                  onPrevious={() =>
                    setPage((current) =>
                      Math.max(1, current - 1)
                    )
                  }
                  onNext={() =>
                    setPage((current) =>
                      Math.min(
                        metadata?.totalPages || current,
                        current + 1
                      )
                    )
                  }
                />
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}