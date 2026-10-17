import { formatDate, formatValue } from "@/app/dashboard/developer/page";

export function DashboardRecentApplications({ applications = [] }) {
    return (
      <section className="py-10">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--df-soft)]">
              03
            </p>
  
            <h2 className="mt-2 text-lg font-semibold tracking-[-0.03em]">
              Recent applications
            </h2>
          </div>
  
          <a
            href="/dashboard/developer/applications"
            className="text-xs text-[var(--df-muted)] hover:text-[var(--df-text)]"
          >
            View all
          </a>
        </div>
  
        {!applications.length ? (
          <div className="mt-6 border-y border-dashed border-[var(--df-line)] py-7">
            <p className="text-sm text-[var(--df-muted)]">
              You haven't applied to any jobs yet.
            </p>
          </div>
        ) : (
          <div className="mt-6 divide-y divide-[var(--df-line)] border-y border-[var(--df-line)]">
            {applications.map((application) => (
              <a
                key={application.id}
                href={`/dashboard/developer/applications/${application.id}`}
                className="block py-5"
              >
                <p className="text-sm font-medium">
                  {application.job?.title || "Job"}
                </p>
  
                <p className="mt-1 text-xs text-[var(--df-muted)]">
                  {application.job?.company?.name || "Company"}
                </p>
  
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-[0.12em] text-[var(--df-soft)]">
                    {formatValue(application.status)}
                  </span>
  
                  <span className="text-[10px] text-[var(--df-soft)]">
                    {application.createdAt
                      ? formatDate(application.createdAt)
                      : ""}
                  </span>
                </div>
              </a>
            ))}
          </div>
        )}
      </section>
    );
  }