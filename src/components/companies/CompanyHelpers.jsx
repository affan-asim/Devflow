import {
    BriefcaseBusiness,
    CalendarDays,
    CheckCircle2,
    Users,
} from "lucide-react";

export function SectionLabel({ number, title }) {
    return (
        <div className="flex items-center gap-4">
            <span className="text-[10px] tracking-[0.16em] text-[var(--df-soft)]">
                {number}
            </span>

            <span className="text-xs font-semibold uppercase tracking-[0.18em]">
                {title}
            </span>
        </div>
    );
}

export function CompanyMeta({ icon: Icon, label, value }) {
    return (
        <div className="border-b border-[var(--df-line)] py-5 first:border-t">
            <div className="flex items-center gap-3">
                <Icon
                    size={15}
                    strokeWidth={1.5}
                    className="text-[var(--df-muted)]"
                />

                <span className="text-[10px] uppercase tracking-[0.15em] text-[var(--df-soft)]">
                    {label}
                </span>
            </div>

            <p className="mt-2 text-sm font-medium">
                {value || "Not specified"}
            </p>
        </div>
    );
}

export function formatText(value) {
    if (!value) return "";

    return value
        .toLowerCase()
        .replace(/_/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function getOpenJobCount(company) {
    if (typeof company.jobCount === "number") {
        return company.jobCount;
    }

    if (company._count?.jobs !== undefined) {
        return company._count.jobs;
    }

    if (Array.isArray(company.jobs)) {
        return company.jobs.filter((job) => job.status === "ACTIVE").length;
    }

    return 0;
}

export function getRecruiterCount(company) {
    if (!Array.isArray(company.recruiters)) {
        return 0;
    }

    return company.recruiters.length;
}

export function getEmploymentHistoryCount(company) {
    if (!Array.isArray(company.employmentHistory)) {
        return 0;
    }

    return company.employmentHistory.length;
}

export function getRecruiterHistoryCount(company) {
    if (!Array.isArray(company.recruiterHistory)) {
        return 0;
    }

    return company.recruiterHistory.length;
}

export function formatDate(date) {
    if (!date) return "Not specified";

    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        year: "numeric",
    }).format(new Date(date));
}

export function formatFullDate(date) {
    if (!date) return "Not specified";

    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    }).format(new Date(date));
}

export function formatSalary(minSalary, maxSalary, currency) {
    if (!minSalary && !maxSalary) {
        return null;
    }

    const min = minSalary ? Number(minSalary).toLocaleString() : null;
    const max = maxSalary ? Number(maxSalary).toLocaleString() : null;

    if (min && max) {
        return `${currency || ""} ${min} – ${max}`.trim();
    }

    if (min) {
        return `From ${currency || ""} ${min}`.trim();
    }

    return `Up to ${currency || ""} ${max}`.trim();
}

export function getCompanyStats(company) {
    return [
        {
            label: "Open roles",
            value: getOpenJobCount(company),
            icon: BriefcaseBusiness,
        },
        {
            label: "Recruiters",
            value: getRecruiterCount(company),
            icon: Users,
        },
        {
            label: "Verified",
            value: company.isVerified ? "Yes" : "No",
            icon: CheckCircle2,
        },
        {
            label: "On DevFlow",
            value: formatDate(company.createdAt),
            icon: CalendarDays,
        },
    ];
}

export function CompanyDetailSkeleton() {
    return (
        <div className="mx-auto max-w-[1320px] animate-pulse px-5 py-20 sm:px-8">
            <div className="h-3 w-28 bg-[var(--df-paper-3)]" />

            <div className="mt-14 flex gap-5">
                <div className="h-24 w-24 bg-[var(--df-paper-3)]" />

                <div className="flex-1">
                    <div className="h-16 max-w-2xl bg-[var(--df-paper-3)]" />
                    <div className="mt-5 h-4 w-80 bg-[var(--df-paper-3)]" />
                </div>
            </div>

            <div className="mt-20 grid gap-8 lg:grid-cols-[1fr_340px]">
                <div className="h-80 bg-[var(--df-paper-3)]" />
                <div className="h-80 bg-[var(--df-paper-3)]" />
            </div>
        </div>
    );
}