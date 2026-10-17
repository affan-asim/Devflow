import { ArrowUpRight } from "lucide-react";

export function DashboardActivity({ analytics }) {
    const distribution = analytics?.statusDistribution || {};
  
    const items = [
      ["Pending", distribution.pending || 0],
      ["Review", distribution.review || 0],
      ["Accepted", distribution.accepted || 0],
      ["Rejected", distribution.rejected || 0],
    ];
  
    const total = items.reduce((sum, [, value]) => sum + value, 0);
  
    return (
      <section className="py-10">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--df-soft)]">
              01
            </p>
  
            <h2 className="mt-2 text-xl font-semibold tracking-[-0.035em]">
              Application activity
            </h2>
          </div>
  
          <a
            href="/dashboard/developer/applications"
            className="
              hidden
              items-center
              gap-2
              text-xs
              font-medium
              text-[var(--df-muted)]
              hover:text-[var(--df-text)]
              sm:flex
            "
          >
            View all
            <ArrowUpRight size={13} strokeWidth={1.5} />
          </a>
        </div>
  
        <div className="mt-7 border-y border-[var(--df-line)]">
          {items.map(([label, value]) => {
            const percentage =
              total > 0 ? Math.round((value / total) * 100) : 0;
  
            return (
              <div
                key={label}
                className="border-b border-[var(--df-line)] py-5 last:border-b-0"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[var(--df-muted)]">
                    {label}
                  </span>
  
                  <span className="text-xs font-medium">
                    {value}
                  </span>
                </div>
  
                <div className="mt-3 h-1 bg-[var(--df-paper-3)]">
                  <div
                    className="h-full bg-[var(--df-text)]"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>
    );
  }