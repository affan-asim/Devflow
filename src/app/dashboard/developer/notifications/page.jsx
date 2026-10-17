"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  clearNotificationErrors,
} from "@/lib/redux/slices/notificationSlice";

function getNotificationUrl(notification) {
  const { referenceType, actionType, referenceId } = notification || {};

  if (!referenceType || !referenceId) return null;

  switch (referenceType) {
    case "JOB":
      return `/dashboard/developer/jobs/${referenceId}`;

    case "APPLICATION":
      switch (actionType) {
        case "APPLICATION_SUBMITTED":
        case "APPLICATION_RECEIVED":
        case "APPLICATION_STATUS_CHANGED":
          return `/dashboard/developer/applications/${referenceId}`;
        default:
          return `/dashboard/developer/applications/${referenceId}`;
      }

    case "EMPLOYMENT":
    case "EMPLOYMENT_EVENT":
      switch (actionType) {
        case "EMPLOYMENT_CREATED":
        case "EMPLOYMENT_RESIGNED":
        case "EMPLOYMENT_TERMINATED":
          return `/dashboard/developer/employment-history/${referenceId}`;
        default:
          return `/dashboard/developer/employment-history/${referenceId}`;
      }

    case "RECRUITER_HISTORY":
    case "RECRUITER_EVENT":
      switch (actionType) {
        case "RECRUITER_INVITED":
        case "RECRUITER_JOINED":
        case "RECRUITER_RESIGNED":
        case "RECRUITER_TERMINATED":
          return `/dashboard/developer/recruiters/${referenceId}`;
        default:
          return `/dashboard/developer/recruiters/${referenceId}`;
      }

    case "COMPANY":
      return `/dashboard/developer/company/${referenceId}`;

    case "INVITE":
      return `/dashboard/developer/invites/${referenceId}`;

    default:
      return null;
  }
}

function formatNotificationType(type) {
  if (!type) return "Notification";

  return type
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatDate(date) {
  if (!date) return "";

  try {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(date));
  } catch {
    return "";
  }
}

function formatRelativeTime(date) {
  if (!date) return "";

  const timestamp = new Date(date).getTime();

  if (Number.isNaN(timestamp)) return "";

  const diff = Date.now() - timestamp;

  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const week = 7 * day;

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

  if (diff < week) {
    const days = Math.floor(diff / day);
    return `${days}d ago`;
  }

  return formatDate(date);
}

function getReferenceLabel(referenceType) {
  if (!referenceType) return null;

  return referenceType
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function NotificationSkeleton() {
  return (
    <div className="animate-pulse divide-y divide-[var(--df-line)] border-y border-[var(--df-line)]">
      {[1, 2, 3, 4, 5].map((item) => (
        <div key={item} className="flex gap-4 px-1 py-6">
          <div className="mt-1 h-2.5 w-2.5 shrink-0 bg-[var(--df-line)]" />

          <div className="min-w-0 flex-1">
            <div className="h-3 w-32 bg-[var(--df-line)]" />

            <div className="mt-3 h-4 w-3/4 bg-[var(--df-line)]" />

            <div className="mt-2 h-3 w-1/3 bg-[var(--df-line)]" />
          </div>
        </div>
      ))}
    </div>
  );
}

function NotificationItem({ notification, onMarkAsRead }) {
  const isUnread = !notification.isRead;
  const targetUrl = getNotificationUrl(notification);

  const handleNotificationClick = () => {
    if (isUnread) {
      onMarkAsRead(notification.id);
    }
  };

  const ContentWrapper = ({ children }) => {
    if (targetUrl) {
      return (
        <Link
          href={targetUrl}
          onClick={handleNotificationClick}
          className="group/link block min-w-0 flex-1 hover:opacity-80 transition-opacity"
        >
          {children}
        </Link>
      );
    }

    return <div className="min-w-0 flex-1">{children}</div>;
  };

  return (
    <article
      className={`group relative border-b border-[var(--df-line)] px-1 py-6 last:border-b-0 ${
        isUnread ? "bg-[var(--df-text)]/[0.025]" : ""
      }`}
    >
      <div className="flex gap-4">
        {/* Unread indicator */}
        <div className="flex w-3 shrink-0 justify-center">
          <span
            className={`mt-1.5 h-2.5 w-2.5 rounded-full ${
              isUnread
                ? "bg-[var(--df-text)]"
                : "border border-[var(--df-line)]"
            }`}
          />
        </div>

        <ContentWrapper>
          {/* Top row */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--df-muted)]">
                {formatNotificationType(notification.actionType)}
              </p>

              <p
                className={`mt-2 max-w-3xl text-sm leading-6 ${
                  isUnread
                    ? "font-medium text-[var(--df-text)]"
                    : "text-[var(--df-muted)]"
                }`}
              >
                {notification.message || "You have a new notification."}
              </p>
            </div>

            <time
              dateTime={notification.createdAt}
              title={formatDate(notification.createdAt)}
              className="shrink-0 text-[11px] text-[var(--df-muted)]"
            >
              {formatRelativeTime(notification.createdAt)}
            </time>
          </div>

          {/* Bottom metadata */}
          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
            {notification.referenceType && (
              <span className="text-[11px] text-[var(--df-muted)]">
                {getReferenceLabel(notification.referenceType)}
              </span>
            )}

            {notification.referenceId && (
              <span className="max-w-[220px] truncate text-[11px] text-[var(--df-muted)]">
                Ref: {notification.referenceId}
              </span>
            )}

            {isUnread && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  onMarkAsRead(notification.id);
                }}
                className="text-[10px] font-semibold uppercase tracking-[0.13em] text-[var(--df-text)] hover:opacity-60 relative z-10"
              >
                Mark as read
              </button>
            )}

            {!isUnread && (
              <span className="text-[10px] font-semibold uppercase tracking-[0.13em] text-[var(--df-muted)]">
                Read
              </span>
            )}
          </div>
        </ContentWrapper>
      </div>
    </article>
  );
}

export default function NotificationsPage() {
  const dispatch = useDispatch();

  const {
    notifications = [],
    unreadCount = 0,
    metadata,
    loadingList,
    submitting,
    errorList,
    submitError,
  } = useSelector((state) => state.notifications || {});

  const [readFilter, setReadFilter] = useState("all");
  const [sort, setSort] = useState("desc");

  const loadNotifications = ({
    page = 1,
    isRead = readFilter,
    currentSort = sort,
  } = {}) => {
    const params = {
      page,
      limit: metadata?.pageSize || 10,
    };

    if (isRead !== "all") {
      params.isRead = isRead === "read";
    }

    if (currentSort) {
      params.sort = currentSort;
    }

    dispatch(fetchNotifications(params));
  };

  useEffect(() => {
    loadNotifications({
      page: 1,
      isRead: "all",
      currentSort: "desc",
    });

    return () => {
      dispatch(clearNotificationErrors());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  const handleFilterChange = (value) => {
    setReadFilter(value);

    loadNotifications({
      page: 1,
      isRead: value,
      currentSort: sort,
    });
  };

  const handleSortChange = (value) => {
    setSort(value);

    loadNotifications({
      page: 1,
      isRead: readFilter,
      currentSort: value,
    });
  };

  const handleMarkAsRead = async (id) => {
    await dispatch(markNotificationAsRead(id));
  };

  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0 || submitting) {
      return;
    }

    await dispatch(markAllNotificationsAsRead());
  };

  const handlePageChange = (page) => {
    loadNotifications({
      page,
      isRead: readFilter,
      currentSort: sort,
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <main className="min-h-screen bg-[var(--df-paper)] text-[var(--df-text)]">
      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-10 lg:py-14">
        {/* Header */}
        <header className="border-b border-[var(--df-line)] pb-8">
          <div className="flex flex-col gap-7 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--df-muted)]">
                Developer dashboard
              </p>

              <h1 className="mt-3 text-3xl font-medium tracking-[-0.045em] sm:text-4xl">
                Notifications
              </h1>

              <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-[var(--df-muted)]">
                <span>{metadata?.totalCount || 0} total</span>

                <span aria-hidden="true">·</span>

                <span>{unreadCount} unread</span>
              </div>
            </div>
          </div>
        </header>

        {/* Controls */}
        <section className="border-b border-[var(--df-line)] py-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Filters */}
            <div className="flex flex-wrap gap-1">
              {[
                ["all", "All"],
                ["unread", "Unread"],
                ["read", "Read"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => handleFilterChange(value)}
                  className={`px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.13em] transition-colors ${
                    readFilter === value
                      ? "bg-[var(--df-text)] text-[var(--df-paper)]"
                      : "text-[var(--df-muted)] hover:text-[var(--df-text)]"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-5">
              <select
                value={sort}
                onChange={(event) => handleSortChange(event.target.value)}
                className="h-9 border border-[var(--df-line)] bg-transparent px-3 text-xs text-[var(--df-text)] outline-none focus:border-[var(--df-text)]"
              >
                <option value="desc">Newest first</option>

                <option value="asc">Oldest first</option>
              </select>

              <button
                type="button"
                disabled={unreadCount === 0 || submitting}
                onClick={handleMarkAllAsRead}
                className="text-[10px] cursor-pointer font-semibold uppercase tracking-[0.13em] text-[var(--df-text)] disabled:cursor-not-allowed disabled:opacity-30"
              >
                {submitting ? "Updating..." : "Mark all as read"}
              </button>
            </div>
          </div>
        </section>

        {/* Error */}
        {submitError && (
          <div className="border-b border-[var(--df-line)] py-4">
            <p className="text-xs text-[var(--df-muted)]">{submitError}</p>
          </div>
        )}

        {/* Notification list */}
        <section className="pt-8">
          {loadingList ? (
            <NotificationSkeleton />
          ) : errorList ? (
            <div className="border-y border-[var(--df-line)] py-14 text-center">
              <p className="text-lg font-medium tracking-[-0.02em]">
                Unable to load notifications
              </p>

              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[var(--df-muted)]">
                {errorList}
              </p>

              <button
                type="button"
                onClick={() =>
                  loadNotifications({
                    page: metadata?.currentPage || 1,
                  })
                }
                className="mt-6 border border-[var(--df-text)] bg-[var(--df-text)] px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.13em] text-[var(--df-paper)] hover:opacity-85"
              >
                Try again
              </button>
            </div>
          ) : notifications.length === 0 ? (
            <div className="border-y border-[var(--df-line)] py-16 text-center">
              <p className="text-lg font-medium tracking-[-0.025em]">
                {readFilter === "unread"
                  ? "You're all caught up"
                  : readFilter === "read"
                  ? "No read notifications"
                  : "No notifications yet"}
              </p>

              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[var(--df-muted)]">
                {readFilter === "unread"
                  ? "There are no unread notifications at the moment."
                  : "Notifications about applications, jobs, employment and other account activity will appear here."}
              </p>
            </div>
          ) : (
            <div className="border-t border-[var(--df-line)]">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={handleMarkAsRead}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {!loadingList &&
            !errorList &&
            notifications.length > 0 &&
            metadata?.totalPages > 1 && (
              <div className="flex items-center justify-between border-b border-[var(--df-line)] py-5">
                <button
                  type="button"
                  disabled={!metadata.hasPreviousPage}
                  onClick={() => handlePageChange(metadata.currentPage - 1)}
                  className="text-[10px] font-semibold uppercase tracking-[0.13em] disabled:cursor-not-allowed disabled:opacity-30"
                >
                  ← Previous
                </button>

                <span className="text-xs text-[var(--df-muted)]">
                  Page {metadata.currentPage} of {metadata.totalPages}
                </span>

                <button
                  type="button"
                  disabled={!metadata.hasNextPage}
                  onClick={() => handlePageChange(metadata.currentPage + 1)}
                  className="text-[10px] font-semibold uppercase tracking-[0.13em] disabled:cursor-not-allowed disabled:opacity-30"
                >
                  Next →
                </button>
              </div>
            )}
        </section>
      </div>
    </main>
  );
}
