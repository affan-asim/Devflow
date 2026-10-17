import { BriefcaseBusiness, CheckCircle2, Clock3, FileText } from "lucide-react";

export function DashboardStats({ stats }) {
    const items = [
        {
            label: "Applications",
            value: stats?.totalApplications || 0,
            icon: FileText,
        },
        {
            label: "Pending",
            value: stats?.pendingApplications || 0,
            icon: Clock3,
        },
        {
            label: "In review",
            value: stats?.reviewApplications || 0,
            icon: BriefcaseBusiness,
        },
        {
            label: "Accepted",
            value: stats?.acceptedApplications || 0,
            icon: CheckCircle2,
        },
    ];

    return (
        <section className="border-b border-[var(--df-line)]">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4">
                {items.map((item, index) => {
                    const Icon = item.icon;

                    return (
                        <div
                            key={item.label}
                            className={`
                  py-7
                  sm:px-6
                  lg:px-7
                  ${index !== 0
                                    ? "border-t border-[var(--df-line)] sm:border-l sm:border-t-0"
                                    : ""
                                }
                `}
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] uppercase tracking-[0.15em] text-[var(--df-soft)]">
                                    {item.label}
                                </span>

                                <Icon
                                    size={15}
                                    strokeWidth={1.5}
                                    className="text-[var(--df-muted)]"
                                />
                            </div>

                            <p className="mt-4 text-3xl font-semibold tracking-[-0.045em]">
                                {item.value}
                            </p>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}