import {
    BriefcaseBusiness,
    CalendarDays,
    Users,
} from "lucide-react";

import { motion } from "framer-motion";

import {
    formatDate,
    formatText,
} from "./CompanyHelpers";

function HistoryItem({ item, type }) {
    return (
        <motion.div
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="relative border-l border-[var(--df-line)] pl-7"
        >
            <span className="absolute -left-[4px] top-1.5 h-2 w-2 rounded-full bg-[var(--df-text)]" />

            <div className="flex flex-wrap items-center gap-3">
                <span className="text-[9px] font-semibold uppercase tracking-[0.15em] text-[var(--df-soft)]">
                    {type === "recruiter" ? "Recruiting" : "Employment"}
                </span>

                {item.isCurrent && (
                    <span className="text-[9px] font-semibold uppercase tracking-[0.15em] text-[var(--df-muted)]">
                        Current
                    </span>
                )}
            </div>

            <h3 className="mt-3 text-lg font-semibold tracking-[-0.03em]">
                {item.roleTitle || "Role"}
            </h3>

            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-[var(--df-muted)]">
                {item.employmentType && (
                    <span className="inline-flex items-center gap-2">
                        <BriefcaseBusiness size={13} />
                        {formatText(item.employmentType)}
                    </span>
                )}

                {item.startDate && (
                    <span className="inline-flex items-center gap-2">
                        <CalendarDays size={13} />
                        {formatDate(item.startDate)}
                        {" — "}
                        {item.isCurrent ? "Present" : formatDate(item.endDate)}
                    </span>
                )}
            </div>

            {item.description && (
                <p className="mt-4 max-w-xl text-sm leading-6 text-[var(--df-muted)]">
                    {item.description}
                </p>
            )}
        </motion.div>
    );
}

export function CompanyHistory({ company }) {
    const employmentHistory = company.employmentHistory || [];
    const recruiterHistory = company.recruiterHistory || [];

    const history = [
        ...employmentHistory.map((item) => ({
            ...item,
            type: "employment",
            sortDate: item.startDate || item.endDate,
        })),

        ...recruiterHistory.map((item) => ({
            ...item,
            type: "recruiter",
            sortDate: item.startDate || item.endDate,
        })),
    ].sort((a, b) => {
        return new Date(b.sortDate || 0) - new Date(a.sortDate || 0);
    });

    if (!history.length) {
        return (
            <div className="mt-8 border border-[var(--df-line)] p-8">
                <p className="text-sm font-medium">
                    No company history available yet.
                </p>

                <p className="mt-2 text-sm leading-6 text-[var(--df-muted)]">
                    People and roles connected to this company will appear here as
                    activity is recorded.
                </p>
            </div>
        );
    }

    return (
        <div className="mt-10 space-y-9">
            {history.map((item) => (
                <HistoryItem
                    key={`${item.type}-${item.id}`}
                    item={item}
                    type={item.type}
                />
            ))}
        </div>
    );
}