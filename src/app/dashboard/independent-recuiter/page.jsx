"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    ArrowRight,
    Bell,
    BriefcaseBusiness,
    Building2,
    CheckCircle2,
    ChevronRight,
    CircleAlert,
    CircleUserRound,
    ClipboardList,
    Clock3,
    FileClock,
    FileText,
    MapPin,
    Search,
    ShieldCheck,
    Sparkles,
    UserRound,
    Users,
} from "lucide-react";

import { fetchRecruiterDashboard, fetchRecruiterProfile } from "@/lib/redux/slices/recruiterSlice";

function formatDate(date) {
    if (!date) return "â€”";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
        return "â€”";
    }

    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    }).format(parsed);
}

function getInitials(name = "") {
    return (
        name
            .trim()
            .split(/\s+/)
            .slice(0, 2)
            .map((part) => part[0]?.toUpperCase())
            .join("") || "R"
    );
}

function truncate(value, length = 90) {
    if (!value) return "";

    return value.length > length
        ? `${value.slice(0, length).trim()}â€¦`
        : value;
}

function StatCard({
    label,
    value,
    description,
    icon: Icon,
    href,
}) {
    const content = (
        <div className="group border border-[var(--df-line)] bg-[var(--df-paper)] p-5 transition-colors hover:border-[var(--df-text)]">
            <div className="flex items-start justify-between gap-4">
                <div className="flex h-9 w-9 items-center justify-center border border-[var(--df-line)] text-[var(--df-text)]">
                    <Icon size={16} strokeWidth={1.7} />
                </div>

                {href && (
                    <ArrowRight
                        size={15}
                        className="text-[var(--df-muted)] transition-transform group-hover:translate-x-1 group-hover:text-[var(--df-text)]"
                    />
                )}
            </div>

            <div className="mt-7">
                <p className="text-2xl font-semibold tracking-[-0.04em] text-[var(--df-text)]">
                    {value}
                </p>

                <p className="mt-1 text-[12px] font-semibold text-[var(--df-text)]">
                    {label}
                </p>

                {description && (
                    <p className="mt-1 text-[11px] leading-4 text-[var(--df-muted)]">
                        {description}
                    </p>
                )}
            </div>
        </div>
    );

    return href ? (
        <Link href={href} className="block">
            {content}
        </Link>
    ) : (
        content
    );
}

function ProgressRing({ percentage = 0 }) {
    const safePercentage = Math.min(
        100,
        Math.max(0, Number(percentage) || 0)
    );

    const radius = 38;
    const circumference = 2 * Math.PI * radius;
    const offset =
        circumference - (safePercentage / 100) * circumference;

    return (
        <div className="relative h-[104px] w-[104px] shrink-0">
            <svg
                width="104"
                height="104"
                viewBox="0 0 104 104"
                className="-rotate-90"
            >
                <circle
                    cx="52"
                    cy="52"
                    r={radius}
                    fill="none"
                    stroke="var(--df-line)"
                    strokeWidth="7"
                />

                <circle
                    cx="52"
                    cy="52"
                    r={radius}
                    fill="none"
                    stroke="var(--df-accent)"
                    strokeWidth="7"
                    strokeLinecap="square"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                />
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-semibold tracking-[-0.04em]">
                    {safePercentage}%
                </span>

                <span className="text-[8px] font-semibold uppercase tracking-[0.15em] text-[var(--df-muted)]">
                    Complete
                </span>
            </div>
        </div>
    );
}

function ProfileCompletion({ dashboard }) {
    console.log(dashboard)
    const percentage = Number(dashboard?.profile.completenessPercentage) || 0;

    const checks = [
        {
            label: "Professional bio",
            complete: Boolean(dashboard?.bio?.trim()),
        },
        {
            label: "Profile description",
            complete: Boolean(dashboard?.description?.trim()),
        },
        {
            label: "GitHub profile",
            complete: Boolean(dashboard?.githubUrl),
        },
        {
            label: "Portfolio",
            complete: Boolean(dashboard?.portfolioUrl),
        },
        {
            label: "Resume",
            complete: Boolean(dashboard?.resumeId),
        },
        {
            label: "Location preference",
            complete: Boolean(dashboard?.locationPreference),
        },
        {
            label: "Years of experience",
            complete: dashboard?.yearsOfExp !== null && dashboard?.yearsOfExp !== undefined,
        },
        {
            label: "Employment history",
            complete: Number(dashboard?._count?.recruiterHistory) > 0,
        },
    ];

    return (
        <section className="border border-[var(--df-line)] bg-[var(--df-paper)]">
            <div className="border-b border-[var(--df-line)] px-5 py-4 sm:px-6">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--df-muted)]">
                            Profile strength
                        </p>

                        <h2 className="mt-1 text-[15px] font-semibold tracking-[-0.02em]">
                            Make your recruiter profile work harder
                        </h2>
                    </div>

                    <Link
                        href="/dashboard/recruiter/independent/profile"
                        className="hidden items-center gap-1 text-[11px] font-semibold text-[var(--df-text)] hover:underline sm:flex"
                    >
                        Complete profile
                        <ArrowRight size={13} />
                    </Link>
                </div>
            </div>

            <div className="flex flex-col gap-7 p-5 sm:p-6 lg:flex-row lg:items-center">
                <ProgressRing percentage={percentage} />

                <div className="min-w-0 flex-1">
                    <div className="mb-4 flex items-end justify-between gap-4">
                        <div>
                            <p className="text-sm font-semibold">
                                {percentage >= 80
                                    ? "Strong profile"
                                    : percentage >= 50
                                        ? "Good progress"
                                        : "Needs attention"}
                            </p>

                            <p className="mt-1 max-w-xl text-[12px] leading-5 text-[var(--df-muted)]">
                                A complete recruiter profile gives companies more context
                                when deciding whether to work with you.
                            </p>
                        </div>

                        <span className="shrink-0 text-[11px] font-medium text-[var(--df-muted)]">
                            {percentage}/100
                        </span>
                    </div>

                    <div className="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
                        {checks.map((item) => (
                            <div
                                key={item.label}
                                className="flex items-center gap-2 py-1"
                            >
                                {item.complete ? (
                                    <CheckCircle2
                                        size={14}
                                        className="shrink-0 text-[var(--df-accent)]"
                                    />
                                ) : (
                                    <CircleAlert
                                        size={14}
                                        className="shrink-0 text-[var(--df-muted)]"
                                    />
                                )}

                                <span
                                    className={`text-[11px] ${item.complete
                                            ? "text-[var(--df-text)]"
                                            : "text-[var(--df-muted)]"
                                        }`}
                                >
                                    {item.label}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <Link
                    href="/dashboard/recruiter/independent/profile"
                    className="flex items-center justify-center gap-2 border border-[var(--df-text)] px-4 py-2.5 text-[11px] font-semibold transition-colors hover:bg-[var(--df-text)] hover:text-[var(--df-paper)] sm:hidden"
                >
                    Complete profile
                    <ArrowRight size={13} />
                </Link>
            </div>
        </section>
    );
}

function CompanyCard({ company }) {
    const companyName =
        company?.name ||
        company?.companyName ||
        "Unnamed company";

    const companyDescription =
        company?.description ||
        company?.about ||
        "Explore this verified company and discover opportunities to collaborate.";

    const jobsCount =
        company?._count?.jobs ??
        company?.jobsCount ??
        company?.jobCount ??
        null;

    return (
        <Link
            href={`/dashboard/recruiter/independent/companies/${company?.id}`}
            className="group block border border-[var(--df-line)] bg-[var(--df-paper)] p-5 transition-colors hover:border-[var(--df-text)]"
        >
            <div className="flex items-start justify-between gap-4">
                <div className="flex h-10 w-10 items-center justify-center border border-[var(--df-line)] bg-[var(--df-paper-2)]">
                    <Building2 size={17} strokeWidth={1.6} />
                </div>

                <ArrowRight
                    size={15}
                    className="text-[var(--df-muted)] transition-transform group-hover:translate-x-1 group-hover:text-[var(--df-text)]"
                />
            </div>

            <div className="mt-5">
                <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-semibold tracking-[-0.015em]">
                        {companyName}
                    </h3>

                    {company?.isVerified && (
                        <ShieldCheck
                            size={14}
                            className="text-[var(--df-accent)]"
                        />
                    )}
                </div>

                <p className="mt-2 text-[11px] leading-5 text-[var(--df-muted)]">
                    {truncate(companyDescription, 100)}
                </p>

                <div className="mt-5 flex items-center justify-between border-t border-[var(--df-line)] pt-3">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--df-muted)]">
                        Verified company
                    </span>

                    {jobsCount !== null && (
                        <span className="text-[11px] font-medium text-[var(--df-text)]">
                            {jobsCount} {jobsCount === 1 ? "job" : "jobs"}
                        </span>
                    )}
                </div>
            </div>
        </Link>
    );
}

function InvitationItem({ invitation }) {
    const companyName =
        invitation?.company?.name ||
        invitation?.company?.companyName ||
        "Company";

    return (
        <div className="flex items-start gap-3 border-b border-[var(--df-line)] py-4 last:border-b-0">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center border border-[var(--df-line)] bg-[var(--df-paper-2)]">
                <Building2 size={14} />
            </div>

            <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <p className="text-[12px] font-semibold text-[var(--df-text)]">
                            {companyName}
                        </p>

                        <p className="mt-1 text-[10px] leading-4 text-[var(--df-muted)]">
                            {invitation?.message ||
                                invitation?.note ||
                                "You have received an invitation to work with this company."}
                        </p>
                    </div>

                    <span className="shrink-0 border border-[var(--df-line)] px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.1em] text-[var(--df-muted)]">
                        Pending
                    </span>
                </div>

                <p className="mt-2 text-[9px] text-[var(--df-muted)]">
                    {formatDate(invitation?.createdAt)}
                </p>
            </div>
        </div>
    );
}

function RequestItem({ request }) {
    const companyName =
        request?.company?.name ||
        request?.company?.companyName ||
        "Company";

    return (
        <div className="flex items-start gap-3 border-b border-[var(--df-line)] py-4 last:border-b-0">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center border border-[var(--df-line)] bg-[var(--df-paper-2)]">
                <FileText size={14} />
            </div>

            <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <p className="text-[12px] font-semibold">
                            {companyName}
                        </p>

                        <p className="mt-1 text-[10px] leading-4 text-[var(--df-muted)]">
                            Your request to join this company is awaiting a response.
                        </p>
                    </div>

                    <span className="shrink-0 border border-[var(--df-line)] px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.1em] text-[var(--df-muted)]">
                        Pending
                    </span>
                </div>

                <p className="mt-2 text-[9px] text-[var(--df-muted)]">
                    {formatDate(request?.createdAt)}
                </p>
            </div>
        </div>
    );
}

function NotificationItem({ notification }) {
    return (
        <div className="flex gap-3 border-b border-[var(--df-line)] py-4 last:border-b-0">
            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center border border-[var(--df-line)]">
                <Bell size={13} />
            </div>

            <div className="min-w-0">
                <p className="text-[11px] font-medium leading-5 text-[var(--df-text)]">
                    {notification?.title ||
                        notification?.message ||
                        "You have a new notification."}
                </p>

                {notification?.message &&
                    notification?.title && (
                        <p className="mt-1 text-[10px] leading-4 text-[var(--df-muted)]">
                            {truncate(notification.message, 100)}
                        </p>
                    )}

                <p className="mt-1 text-[9px] text-[var(--df-muted)]">
                    {formatDate(notification?.createdAt)}
                </p>
            </div>
        </div>
    );
}

function SectionHeader({
    eyebrow,
    title,
    description,
    href,
    actionLabel = "View all",
}) {
    return (
        <div className="mb-4 flex items-end justify-between gap-4">
            <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--df-muted)]">
                    {eyebrow}
                </p>

                <h2 className="mt-1 text-[15px] font-semibold tracking-[-0.02em]">
                    {title}
                </h2>

                {description && (
                    <p className="mt-1 text-[11px] leading-4 text-[var(--df-muted)]">
                        {description}
                    </p>
                )}
            </div>

            {href && (
                <Link
                    href={href}
                    className="hidden shrink-0 items-center gap-1 text-[10px] font-semibold text-[var(--df-text)] hover:underline sm:flex"
                >
                    {actionLabel}
                    <ArrowRight size={12} />
                </Link>
            )}
        </div>
    );
}

function LoadingDashboard() {
    return (
        <div className="min-h-screen">
            <div className="border-b border-[var(--df-line)]">
                <div className="mx-auto max-w-[1500px] px-4 py-8 sm:px-6 lg:px-8">
                    <div className="h-3 w-24 animate-pulse bg-[var(--df-line)]" />
                    <div className="mt-4 h-8 w-72 animate-pulse bg-[var(--df-line)]" />
                    <div className="mt-3 h-4 w-full max-w-xl animate-pulse bg-[var(--df-line)]" />
                </div>
            </div>

            <div className="mx-auto max-w-[1500px] space-y-6 px-4 py-6 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    {[1, 2, 3, 4].map((item) => (
                        <div
                            key={item}
                            className="h-[160px] animate-pulse border border-[var(--df-line)] bg-[var(--df-paper-2)]"
                        />
                    ))}
                </div>

                <div className="h-[260px] animate-pulse border border-[var(--df-line)] bg-[var(--df-paper-2)]" />

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.45fr_1fr]">
                    <div className="h-[420px] animate-pulse border border-[var(--df-line)] bg-[var(--df-paper-2)]" />
                    <div className="h-[420px] animate-pulse border border-[var(--df-line)] bg-[var(--df-paper-2)]" />
                </div>
            </div>
        </div>
    );
}

export default function IndependentRecruiterDashboard() {
    const dispatch = useDispatch();

    const {
        dashboard,
        loadingProfile,
        errorProfile,
    } = useSelector((state) => state.recruiter);

    useEffect(() => {
        dispatch(fetchRecruiterDashboard("independent-recruiter"));
    }, [dispatch]);

    if (loadingProfile && !profile) {
        return <LoadingDashboard />;
    }

    if (errorProfile && !profile) {
        return (
            <div className="min-h-screen">
                <div className="mx-auto flex min-h-[70vh] max-w-2xl items-center justify-center px-5">
                    <div className="w-full border border-[var(--df-line)] p-8 text-center">
                        <CircleAlert
                            size={24}
                            className="mx-auto text-[var(--df-muted)]"
                        />

                        <h1 className="mt-4 text-lg font-semibold">
                            Unable to load your recruiter dashboard
                        </h1>

                        <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-[var(--df-muted)]">
                            {errorProfile ||
                                "Something went wrong while loading your independent recruiter profile."}
                        </p>

                        <button
                            type="button"
                            onClick={() => dispatch(dispatch(fetchRecruiterDashboard("independent-recruiter")))}
                            className="mt-6 border border-[var(--df-text)] px-5 py-2.5 text-xs font-semibold transition-colors hover:bg-[var(--df-text)] hover:text-[var(--df-paper)]"
                        >
                            Try again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const invitations = dashboard?.invitations || [];
    const joinRequests = dashboard?.joinRequests || [];
    const recommendedCompanies = dashboard?.recommendedCompanies || [];
    const notifications = dashboard?.notifications || [];

    const pendingInvitations =
        dashboard?.pendingInvitations ?? invitations.length;

    const pendingJoinRequests =
        dashboard?.pendingJoinRequests ?? joinRequests.length;

    const availableCompanies =
        dashboard?.availableCompanies ??
        recommendedCompanies.length;

    const userName =
        dashboard?.user?.name ||
        dashboard?.name ||
        "Recruiter";

    const firstName = userName.split(" ")[0];

    const profileHistoryCount =
        dashboard?._count?.recruiterHistory ?? 0;

    return (
        <div className="min-h-screen">
            {/* Header */}
            <header className="border-b border-[var(--df-line)]">
                <div className="mx-auto max-w-[1500px] px-4 py-7 sm:px-6 lg:px-8 lg:py-9">
                    <div className="flex flex-col justify-between gap-6 xl:flex-row xl:items-end">
                        <div>
                            <div className="mb-3 flex items-center gap-2">
                                <span className="h-1.5 w-1.5 bg-[var(--df-accent)]" />

                                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--df-muted)]">
                                    Independent recruiter
                                </span>
                            </div>

                            <h1 className="text-2xl font-semibold tracking-[-0.045em] sm:text-3xl">
                                Welcome back, {firstName}.
                            </h1>

                            <p className="mt-2 max-w-2xl text-[12px] leading-5 text-[var(--df-muted)] sm:text-[13px]">
                                Build your recruiting profile, discover verified companies,
                                and manage opportunities to join your next organization.
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <Link
                                href="/dashboard/recruiter/independent/companies"
                                className="flex items-center gap-2 border border-[var(--df-line)] px-4 py-2.5 text-[11px] font-semibold transition-colors hover:border-[var(--df-text)]"
                            >
                                <Search size={14} />
                                Explore companies
                            </Link>

                            <Link
                                href="/dashboard/recruiter/independent/profile"
                                className="flex items-center gap-2 bg-[var(--df-text)] px-4 py-2.5 text-[11px] font-semibold text-[var(--df-paper)] transition-opacity hover:opacity-90"
                            >
                                <UserRound size={14} />
                                My profile
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            <div className="mx-auto max-w-[1500px] space-y-7 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
                {/* Status strip */}
                <div className="flex flex-col justify-between gap-4 border border-[var(--df-line)] bg-[var(--df-paper-2)] px-5 py-4 sm:flex-row sm:items-center">
                    <div className="flex items-start gap-3">
                        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center border border-[var(--df-line)] bg-[var(--df-paper)]">
                            <CircleUserRound size={15} />
                        </div>

                        <div>
                            <div className="flex flex-wrap items-center gap-2">
                                <p className="text-[12px] font-semibold">
                                    Independent recruiter status
                                </p>

                                <span className="border border-[var(--df-accent)] px-2 py-0.5 text-[8px] font-bold uppercase tracking-[0.12em] text-[var(--df-accent)]">
                                    Available
                                </span>
                            </div>

                            <p className="mt-1 text-[10px] leading-4 text-[var(--df-muted)]">
                                You are currently not attached to a company.
                                Explore companies or review pending invitations.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-5 text-[10px] text-[var(--df-muted)]">
                        <div>
                            <span className="font-semibold text-[var(--df-text)]">
                                {profileHistoryCount}
                            </span>{" "}
                            career records
                        </div>

                        <div className="hidden h-4 w-px bg-[var(--df-line)] sm:block" />

                        <div>
                            <span className="font-semibold text-[var(--df-text)]">
                                {availableCompanies}
                            </span>{" "}
                            companies available
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <StatCard
                        label="Pending invitations"
                        value={pendingInvitations}
                        description="Companies waiting for your response"
                        icon={BriefcaseBusiness}
                        href="/dashboard/recruiter/independent/invitations"
                    />

                    <StatCard
                        label="Join requests"
                        value={pendingJoinRequests}
                        description="Requests currently awaiting review"
                        icon={ClipboardList}
                        href="/dashboard/recruiter/independent/company-requests"
                    />

                    <StatCard
                        label="Available companies"
                        value={availableCompanies}
                        description="Verified companies available to explore"
                        icon={Building2}
                        href="/dashboard/recruiter/independent/companies"
                    />

                    <StatCard
                        label="Profile completeness"
                        value={`${Number(
                            dashboard?.completenessPercentage || 0
                        )}%`}
                        description="Your recruiter profile strength"
                        icon={UserRound}
                        href="/dashboard/recruiter/independent/profile"
                    />
                </section>

                {/* Profile completion */}
                <ProfileCompletion dashboard={dashboard} />

                {/* Main workspace */}
                <div className="grid grid-cols-1 gap-7 xl:grid-cols-[1.5fr_1fr]">
                    {/* Recommended companies */}
                    <section>
                        <SectionHeader
                            eyebrow="Discovery"
                            title="Recommended companies"
                            description="Verified companies you may want to work with."
                            href="/dashboard/recruiter/independent/companies"
                            actionLabel="Explore all"
                        />

                        {recommendedCompanies.length > 0 ? (
                            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                {recommendedCompanies.slice(0, 6).map((company) => (
                                    <CompanyCard
                                        key={company.id}
                                        company={company}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="border border-[var(--df-line)] px-6 py-12 text-center">
                                <Building2
                                    size={22}
                                    className="mx-auto text-[var(--df-muted)]"
                                />

                                <h3 className="mt-4 text-sm font-semibold">
                                    No recommended companies yet
                                </h3>

                                <p className="mx-auto mt-2 max-w-sm text-[11px] leading-5 text-[var(--df-muted)]">
                                    Explore verified companies to find organizations
                                    that match your recruiting background.
                                </p>

                                <Link
                                    href="/dashboard/recruiter/independent/companies"
                                    className="mt-5 inline-flex items-center gap-2 border border-[var(--df-text)] px-4 py-2.5 text-[10px] font-semibold hover:bg-[var(--df-text)] hover:text-[var(--df-paper)]"
                                >
                                    Explore companies
                                    <ArrowRight size={12} />
                                </Link>
                            </div>
                        )}
                    </section>

                    {/* Right column */}
                    <div className="space-y-7">
                        {/* Invitations */}
                        <section>
                            <SectionHeader
                                eyebrow="Incoming"
                                title="Company invitations"
                                description="Recent invitations waiting for your response."
                                href="/dashboard/recruiter/independent/invitations"
                            />

                            <div className="border border-[var(--df-line)] px-5">
                                {invitations.length > 0 ? (
                                    <>
                                        {invitations.slice(0, 3).map((invitation) => (
                                            <InvitationItem
                                                key={invitation.id}
                                                invitation={invitation}
                                            />
                                        ))}

                                        <Link
                                            href="/dashboard/recruiter/independent/invitations"
                                            className="flex items-center justify-between border-t border-[var(--df-line)] py-3 text-[10px] font-semibold"
                                        >
                                            <span>Review invitations</span>
                                            <ChevronRight size={13} />
                                        </Link>
                                    </>
                                ) : (
                                    <div className="py-10 text-center">
                                        <Clock3
                                            size={20}
                                            className="mx-auto text-[var(--df-muted)]"
                                        />

                                        <p className="mt-3 text-[11px] font-semibold">
                                            No pending invitations
                                        </p>

                                        <p className="mt-1 text-[10px] leading-4 text-[var(--df-muted)]">
                                            New company invitations will appear here.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* Requests */}
                        <section>
                            <SectionHeader
                                eyebrow="Outgoing"
                                title="Company requests"
                                description="Requests you have submitted to companies."
                                href="/dashboard/recruiter/independent/company-requests"
                            />

                            <div className="border border-[var(--df-line)] px-5">
                                {joinRequests.length > 0 ? (
                                    <>
                                        {joinRequests.slice(0, 3).map((request) => (
                                            <RequestItem
                                                key={request.id}
                                                request={request}
                                            />
                                        ))}

                                        <Link
                                            href="/dashboard/recruiter/independent/company-requests"
                                            className="flex items-center justify-between border-t border-[var(--df-line)] py-3 text-[10px] font-semibold"
                                        >
                                            <span>Review requests</span>
                                            <ChevronRight size={13} />
                                        </Link>
                                    </>
                                ) : (
                                    <div className="py-10 text-center">
                                        <FileText
                                            size={20}
                                            className="mx-auto text-[var(--df-muted)]"
                                        />

                                        <p className="mt-3 text-[11px] font-semibold">
                                            No pending requests
                                        </p>

                                        <p className="mt-1 text-[10px] leading-4 text-[var(--df-muted)]">
                                            Requests you send to companies will appear here.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>
                </div>

                {/* Notifications */}
                <section className="w-full">
                    <div className="border border-[var(--df-line)] px-5 py-4 sm:px-6">
                        {notifications && notifications.length > 0 ? (
                            <div className="grid grid-cols-1 gap-x-8 gap-y-4 md:grid-cols-2">
                                {notifications.slice(0, 4).map((notification) => (
                                    <NotificationItem
                                        key={notification.id}
                                        notification={notification}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="py-12 text-center">
                                <Bell
                                    size={21}
                                    className="mx-auto text-[var(--df-muted)]"
                                />

                                <p className="mt-3 text-[11px] font-semibold">
                                    Nothing new
                                </p>

                                <p className="mt-1 text-[10px] text-[var(--df-muted)]">
                                    Your recent activity will appear here.
                                </p>
                            </div>
                        )}
                    </div>
                </section>

                {/* Bottom information */}
                <section className="grid grid-cols-1 gap-3 md:grid-cols-3">
                    <Link
                        href="/dashboard/recruiter/independent/companies"
                        className="group border border-[var(--df-line)] p-5 transition-colors hover:border-[var(--df-text)]"
                    >
                        <Sparkles
                            size={17}
                            strokeWidth={1.6}
                        />

                        <h3 className="mt-5 text-[13px] font-semibold">
                            Find your next company
                        </h3>

                        <p className="mt-2 text-[10px] leading-5 text-[var(--df-muted)]">
                            Browse verified organizations and discover where your
                            recruiting experience could fit.
                        </p>

                        <div className="mt-4 flex items-center gap-1 text-[10px] font-semibold">
                            Explore companies
                            <ArrowRight
                                size={12}
                                className="transition-transform group-hover:translate-x-1"
                            />
                        </div>
                    </Link>

                    <Link
                        href="/dashboard/recruiter/independent/employment-history"
                        className="group border border-[var(--df-line)] p-5 transition-colors hover:border-[var(--df-text)]"
                    >
                        <FileClock
                            size={17}
                            strokeWidth={1.6}
                        />

                        <h3 className="mt-5 text-[13px] font-semibold">
                            Review your career history
                        </h3>

                        <p className="mt-2 text-[10px] leading-5 text-[var(--df-muted)]">
                            Keep your previous recruiting experience visible and
                            organized for future companies.
                        </p>

                        <div className="mt-4 flex items-center gap-1 text-[10px] font-semibold">
                            Employment history
                            <ArrowRight
                                size={12}
                                className="transition-transform group-hover:translate-x-1"
                            />
                        </div>
                    </Link>

                    <Link
                        href="/dashboard/recruiter/independent/profile"
                        className="group border border-[var(--df-line)] p-5 transition-colors hover:border-[var(--df-text)]"
                    >
                        <ShieldCheck
                            size={17}
                            strokeWidth={1.6}
                        />

                        <h3 className="mt-5 text-[13px] font-semibold">
                            Strengthen your profile
                        </h3>

                        <p className="mt-2 text-[10px] leading-5 text-[var(--df-muted)]">
                            Add your experience, portfolio, resume and professional
                            details to improve your profile.
                        </p>

                        <div className="mt-4 flex items-center gap-1 text-[10px] font-semibold">
                            Update profile
                            <ArrowRight
                                size={12}
                                className="transition-transform group-hover:translate-x-1"
                            />
                        </div>
                    </Link>
                </section>
            </div>
        </div>
    );
}