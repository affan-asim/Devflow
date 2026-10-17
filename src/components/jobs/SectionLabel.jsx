import { motion } from "framer-motion";
import {
    ArrowLeft,
    ArrowUpRight,
    BriefcaseBusiness,
    Building2,
    CalendarDays,
    MapPin,
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

export function JobMeta({ icon: Icon, label, value }) {
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

            <p className="mt-2 text-sm font-medium">{value || "Not specified"}</p>
        </div>
    );
}

export function JobDescription({ description }) {
    if (!description) {
        return <p>No description provided for this opportunity.</p>;
    }

    return (
        <div className="whitespace-pre-line">
            {description}
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

export function formatLocation(value) {
    return formatText(value);
}

export function formatEmployment(value) {
    return formatText(value);
}

export function formatExperience(value) {
    return formatText(value);
}

export function formatDate(value) {
    if (!value) return "Not specified";

    return new Date(value).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

export function formatSalary(job) {
    if (!job.minSalary && !job.maxSalary) {
        return "Salary not specified";
    }

    const currency = job.currency || "";

    if (job.minSalary && job.maxSalary) {
        return `${currency} ${Number(job.minSalary).toLocaleString()} — ${Number(
            job.maxSalary
        ).toLocaleString()}`;
    }

    if (job.minSalary) {
        return `${currency} ${Number(job.minSalary).toLocaleString()}+`;
    }

    return `${currency} ${Number(job.maxSalary).toLocaleString()} max`;
}

export function JobDetailSkeleton() {
    return (
        <div className="mx-auto max-w-[1320px] animate-pulse px-5 py-20 sm:px-8">
            <div className="h-3 w-28 bg-[var(--df-paper-3)]" />

            <div className="mt-14 h-20 max-w-3xl bg-[var(--df-paper-3)]" />

            <div className="mt-6 h-5 w-72 bg-[var(--df-paper-3)]" />

            <div className="mt-12 grid gap-8 lg:grid-cols-3">
                <div className="h-14 bg-[var(--df-paper-3)]" />
                <div className="h-14 bg-[var(--df-paper-3)]" />
                <div className="h-14 bg-[var(--df-paper-3)]" />
            </div>

            <div className="mt-20 h-96 bg-[var(--df-paper-3)]" />
        </div>
    );
}