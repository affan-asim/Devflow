import { Bell } from "lucide-react";

export function DashboardNotifications({ notifications = [] }) {
    return (
      <section className="border-t border-[var(--df-line)] py-10">
        <div className="flex items-center gap-3">
          <Bell size={15} strokeWidth={1.5} />
  
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--df-soft)]">
              04
            </p>
  
            <h2 className="mt-1 text-lg font-semibold tracking-[-0.03em]">
              Notifications
            </h2>
          </div>
        </div>
  
        {!notifications.length ? (
          <div className="mt-6 border-y border-dashed border-[var(--df-line)] py-7">
            <p className="text-sm text-[var(--df-muted)]">
              You're all caught up.
            </p>
          </div>
        ) : (
          <div className="mt-6 divide-y divide-[var(--df-line)] border-y border-[var(--df-line)]">
            {notifications.map((notification) => (
              <a
                key={notification.id}
                href="/dashboard/developer/notifications"
                className="block py-5"
              >
                <div className="flex gap-3">
                  {!notification.isRead && (
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 bg-[var(--df-text)]" />
                  )}
  
                  <div>
                    <p className="text-sm font-medium">
                      {notification.title ||
                        notification.message ||
                        "New notification"}
                    </p>
  
                    {notification.message &&
                      notification.title && (
                        <p className="mt-1 line-clamp-2 text-xs leading-5 text-[var(--df-muted)]">
                          {notification.message}
                        </p>
                      )}
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </section>
    );
  }