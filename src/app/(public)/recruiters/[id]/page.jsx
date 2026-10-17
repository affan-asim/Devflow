
"use client";

import { use, useEffect } from "react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import {
    ArrowLeft,
    ArrowUpRight,
    BadgeCheck,
    BriefcaseBusiness,
    Building2,
    CalendarDays,
    Clock3,
    Link2,
    RefreshCw,
    ShieldCheck,
} from "lucide-react";

import {
    fetchRecruiterProfileById,
    clearRecruiterExploreProfile,
} from "@/lib/redux/slices/recruiterSlice";
import { FiGithub } from "react-icons/fi";

function safeUrl(value) {
    if (!value || typeof value !== "string") return null;

    try {
        const parsed = new URL(value);

        return ["https:", "http:"].includes(parsed.protocol)
            ? parsed.href
            : null;
    } catch {
        return null;
    }
}

function formatDate(value, includeDay = false) {
    if (!value) return null;

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return null;

    return new Intl.DateTimeFormat("en", {
        month: "short",
        ...(includeDay ? { day: "numeric" } : {}),
        year: "numeric",
    }).format(date);
}

function getDuration(startDate, endDate, isCurrent) {
    if (!startDate) return null;

    const start = new Date(startDate);
    const end = isCurrent || !endDate ? new Date() : new Date(endDate);

    if (
        Number.isNaN(start.getTime()) ||
        Number.isNaN(end.getTime()) ||
        end < start
    ) {
        return null;
    }

    const totalMonths = Math.max(
        0,
        (end.getFullYear() - start.getFullYear()) * 12 +
        end.getMonth() -
        start.getMonth()
    );

    const years = Math.floor(totalMonths / 12);
    const months = totalMonths % 12;

    if (years === 0 && months === 0) return "Less than a month";
    if (years === 0) return `${months} ${months === 1 ? "month" : "months"}`;
    if (months === 0) return `${years} ${years === 1 ? "year" : "years"}`;

    return `${years}y ${months}m`;
}

function getInitials(name) {
    if (!name) return "R";

    return name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase();
}

function formatPreference(value) {
    const preferences = {
        REMOTE: "Remote",
        ONSITE: "On-site",
        HYBRID: "Hybrid",
    };

    return preferences[value] || "Not specified";
}

function formatEmploymentType(value) {
    if (!value) return null;

    return value
        .toLowerCase()
        .replaceAll("_", " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());
}

function Eyebrow({ children, className = "" }) {
    return (
        <p
            className={`text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--df-muted)] ${className}`}
        >
            {children}
        </p>
    );
}

function SectionHeading({ eyebrow, title, count }) {
    return (
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
                <Eyebrow>{eyebrow}</Eyebrow>
                <h2 className="mt-2 text-xl font-semibold tracking-[-0.035em] sm:text-2xl">
                    {title}
                </h2>
            </div>
            {typeof count === "number" && (
                <span className="text-xs text-[var(--df-muted)]">
                    {count} {count === 1 ? "record" : "records"}
                </span>
            )}
        </div>
    );
}

function EmploymentItem({ item, index }) {
    const companyName = item.company?.name || "Organization";
    const start = formatDate(item.startDate);
    const end = item.isCurrent
        ? "Present"
        : formatDate(item.endDate) || "End date not provided";
    const duration = getDuration(
        item.startDate,
        item.endDate,
        item.isCurrent
    );

    return (
        <article className="relative pb-8 last:pb-0">
            {index !== undefined && (
                <div className="absolute bottom-0 left-[15px] top-9 w-px bg-[var(--df-line)] last:hidden" />
            )}

            <div className="relative flex gap-4 sm:gap-5">
                <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[var(--df-line)] bg-white">
                    {item.company?.logo ? (
                        <img
                            src={item.company.logo}
                            alt={`${companyName} logo`}
                            loading="lazy"
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <Building2 size={15} className="text-[var(--df-muted)]" />
                    )}
                </div>

                <div className="min-w-0 flex-1">
                    <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
                        <div>
                            <h3 className="font-semibold text-[var(--df-text)]">
                                {item.roleTitle || "Recruiting professional"}
                            </h3>
                            <p className="mt-1 text-sm text-[var(--df-muted)]">
                                {companyName}
                            </p>
                        </div>

                        {item.isCurrent && (
                            <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-[var(--df-line)] px-2.5 py-1 text-[10px] font-semibold text-[var(--df-text)]">
                                <span className="h-1.5 w-1.5 rounded-full bg-[var(--df-accent)]" />
                                Current role
                            </span>
                        )}
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-[var(--df-muted)]">
                        <span className="inline-flex items-center gap-1.5">
                            <CalendarDays size={12} />
                            {start || "Start date not provided"} – {end}
                        </span>

                        {duration && (
                            <span className="inline-flex items-center gap-1.5">
                                <Clock3 size={12} />
                                {duration}
                            </span>
                        )}

                        {item.employmentType && (
                            <span className="rounded-full border border-[var(--df-line)] px-2 py-1">
                                {formatEmploymentType(item.employmentType)}
                            </span>
                        )}
                    </div>

                    {item.description && (
                        <p className="mt-4 whitespace-pre-line text-sm leading-7 text-[var(--df-muted)]">
                            {item.description}
                        </p>
                    )}
                </div>
            </div>
        </article>
    );
}

function ProfileSkeleton() {
    return (
        <div className="animate-pulse">
            <div className="h-3 w-36 rounded bg-stone-200" />
            <div className="mt-10 flex flex-col gap-5 border-b border-[var(--df-line)] pb-10 sm:flex-row">
                <div className="h-24 w-24 shrink-0 rounded-2xl bg-stone-200" />
                <div className="flex-1">
                    <div className="h-7 w-64 max-w-full rounded bg-stone-200" />
                    <div className="mt-4 h-4 w-44 rounded bg-stone-100" />
                    <div className="mt-6 h-3 w-full max-w-xl rounded bg-stone-100" />
                    <div className="mt-3 h-3 w-4/5 max-w-lg rounded bg-stone-100" />
                </div>
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
                {[1, 2, 3].map((item) => (
                    <div key={item} className="h-32 rounded-xl bg-stone-100" />
                ))}
            </div>
        </div>
    );
}

export default function RecruiterDetailPage({ params }) {
    const {id} = use(params)
    const dispatch = useDispatch();

    const {
        currentExploreProfile: profile,
        loadingExploreProfile: loading,
        errorExploreProfile: error,
    } = useSelector((state) => state.recruiter);

    useEffect(() => {
        if (!id) return;

        dispatch(clearRecruiterExploreProfile());
        dispatch(fetchRecruiterProfileById(id));

        return () => {
            dispatch(clearRecruiterExploreProfile());
        };
    }, [dispatch, id]);

    const history = Array.isArray(profile?.recruiterHistory)
        ? profile.recruiterHistory
        : [];

    const currentRoles = history.filter((item) => item.isCurrent);
    const previousRoles = history.filter((item) => !item.isCurrent);

    const name = profile?.user?.name || "Recruiter";
    const portfolioUrl = safeUrl(profile?.portfolioUrl);
    const githubUrl = safeUrl(profile?.githubUrl);
    const hasProfileContent = Boolean(
        profile?.bio || profile?.description
    );

    if (loading && !profile) {
        return (
            <main className="min-h-screen bg-[var(--df-paper)] px-5 py-8 text-[var(--df-text)] sm:px-8 lg:px-12">
                <div className="mx-auto max-w-[1180px]">
                    <ProfileSkeleton />
                </div>
            </main>
        );
    }

    if (error || !profile) {
        return (
            <main className="min-h-screen bg-[var(--df-paper)] px-5 py-8 text-[var(--df-text)] sm:px-8 lg:px-12">
                <div className="mx-auto max-w-[900px]">
                    <Link
                        href="/recruiters"
                        className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--df-muted)] transition-colors hover:text-[var(--df-text)]"
                    >
                        <ArrowLeft size={14} />
                        Back to recruiter directory
                    </Link>

                    <div className="mt-16 border-y border-[var(--df-line)] py-14 sm:py-20">
                        <Eyebrow>Recruiter profile</Eyebrow>
                        <h1 className="mt-4 text-3xl font-semibold tracking-[-0.045em] sm:text-5xl">
                            {error?.toLowerCase().includes("not found")
                                ? "Profile not found."
                                : "This profile is unavailable."}
                        </h1>
                        <p className="mt-4 max-w-lg text-sm leading-7 text-[var(--df-muted)]">
                            {error ||
                                "We couldn't load this recruiter profile. It may have been removed or is temporarily unavailable."}
                        </p>

                        <div className="mt-7 flex flex-wrap gap-3">
                            <button
                                type="button"
                                onClick={() =>
                                    id &&
                                    dispatch(fetchRecruiterProfileById(id))
                                }
                                className="df-btn inline-flex items-center gap-2"
                            >
                                <RefreshCw size={14} />
                                Try again
                            </button>

                            <Link
                                href="/recruiters"
                                className="inline-flex items-center gap-2 rounded-lg border border-[var(--df-line)] px-4 py-2.5 text-xs font-semibold hover:bg-white"
                            >
                                Browse recruiters
                                <ArrowUpRight size={13} />
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-[var(--df-paper)] text-[var(--df-text)]">
            <div className="mx-auto max-w-6xl px-5 pb-12 pt-7 sm:px-8 sm:pt-10">
                <nav className="flex flex-wrap items-center justify-between gap-3">
                    <Link
                        href="/recruiters"
                        className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--df-muted)] transition-colors hover:text-[var(--df-text)]"
                    >
                        <ArrowLeft size={14} />
                        Recruiter directory
                    </Link>

                    <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--df-muted)]">
                        DevFlow / Profile
                    </span>
                </nav>

                <header className="mt-8 overflow-hidden border border-[var(--df-line)] bg-white">
                    <div className="h-1.5 bg-[var(--df-accent)]" />
                    <div className="grid lg:grid-cols-[minmax(0,1fr)_280px]">
                        <div className="p-5 sm:p-8 lg:p-10">
                            <Eyebrow>Recruiter profile</Eyebrow>
                            <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-start">
                                <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[var(--df-line)] bg-[var(--df-paper)] text-xl font-semibold tracking-tight sm:h-24 sm:w-24">
                                    {profile.company?.logo ? (
                                        <img src={profile.company.logo} alt={`${profile.company.name || "Company"} logo`} className="h-full w-full object-cover" />
                                    ) : getInitials(name)}
                                </div>
                                <div className="min-w-0 flex-1">
                                    {profile.user?.isVerified && (
                                        <span title="Verified recruiter account" className="inline-flex items-center gap-1.5 bg-[var(--df-accent)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--df-black)]">
                                            <BadgeCheck size={13} /> Verified recruiter
                                        </span>
                                    )}
                                    <h1 className="mt-3 break-words text-3xl font-semibold leading-tight tracking-[-0.05em] sm:text-5xl">{name}</h1>
                                    <p className="mt-2 text-base text-[var(--df-muted)] sm:text-lg">
                                        {profile.jobTitle || "Recruiting professional"}
                                        {profile.company?.name && <><span className="mx-2">·</span>{profile.company.name}</>}
                                    </p>
                                    <p className="mt-5 max-w-2xl text-sm leading-7 text-[var(--df-muted)] sm:text-base">
                                        {profile.bio || profile.description || "Explore this recruiter's professional experience, work preferences, and career history."}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-[var(--df-line)] bg-[var(--df-paper)] p-5 sm:p-8 lg:border-l lg:border-t-0 lg:p-7">
                            <Eyebrow>At a glance</Eyebrow>
                            <dl className="mt-4 divide-y divide-[var(--df-line)]">
                                <div className="flex items-start justify-between gap-4 py-3">
                                    <dt className="text-xs text-[var(--df-muted)]">Experience</dt>
                                    <dd className="text-right text-sm font-semibold">{typeof profile.yearsOfExp === "number" ? `${profile.yearsOfExp} ${profile.yearsOfExp === 1 ? "year" : "years"}` : "Not specified"}</dd>
                                </div>
                                <div className="flex items-start justify-between gap-4 py-3">
                                    <dt className="text-xs text-[var(--df-muted)]">Work preference</dt>
                                    <dd className="text-right text-sm font-semibold">{formatPreference(profile.locationPreference)}</dd>
                                </div>
                                <div className="flex items-start justify-between gap-4 py-3">
                                    <dt className="text-xs text-[var(--df-muted)]">Organization</dt>
                                    <dd className="max-w-36 text-right text-sm font-semibold">{profile.company?.name || "Independent"}</dd>
                                </div>
                                {profile.user?.createdAt && (
                                    <div className="flex items-start justify-between gap-4 py-3">
                                        <dt className="text-xs text-[var(--df-muted)]">Member since</dt>
                                        <dd className="text-right text-sm font-semibold">{formatDate(profile.user.createdAt)}</dd>
                                    </div>
                                )}
                            </dl>
                            {profile.company?.isVerified && <p className="mt-4 inline-flex items-center gap-2 text-xs font-medium text-[var(--df-muted)]"><ShieldCheck size={14} /> Verified company</p>}
                        </div>
                    </div>
                </header>

                <section className="grid gap-8 py-9 lg:grid-cols-[minmax(0,1fr)_260px] lg:gap-10 lg:py-12">
                    <div className="min-w-0">
                        <section>
                            <SectionHeading
                                eyebrow="About"
                                title="Professional overview"
                            />

                            {hasProfileContent ? (
                                <div className="space-y-5">
                                    {profile.bio && (
                                        <p className="whitespace-pre-line text-sm leading-8 text-[var(--df-text)]">
                                            {profile.bio}
                                        </p>
                                    )}

                                    {profile.description && (
                                        <div className="whitespace-pre-line text-sm leading-8 text-[var(--df-muted)]">
                                            {profile.description}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <p className="text-sm leading-7 text-[var(--df-muted)]">
                                    This recruiter hasn't added a detailed professional
                                    introduction yet. Explore the available profile information
                                    and career history below.
                                </p>
                            )}
                        </section>

                        <section className="mt-12 border-t border-[var(--df-line)] pt-9 sm:mt-14 sm:pt-11">
                            <SectionHeading
                                eyebrow="Career"
                                title="Professional experience"
                                count={history.length}
                            />

                            {history.length === 0 ? (
                                <div className="rounded-xl border border-dashed border-[var(--df-line)] p-7 sm:p-9">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--df-line)] bg-white">
                                        <BriefcaseBusiness size={17} />
                                    </div>
                                    <h3 className="mt-4 font-semibold">
                                        No employment history available
                                    </h3>
                                    <p className="mt-2 max-w-lg text-sm leading-7 text-[var(--df-muted)]">
                                        Employment history hasn't been added to this public
                                        profile yet.
                                    </p>
                                </div>
                            ) : (
                                <div>
                                    {currentRoles.length > 0 && (
                                        <div className="mb-8">
                                            <p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.13em] text-[var(--df-muted)]">
                                                Current positions
                                            </p>
                                            <div>
                                                {currentRoles.map((item, index) => (
                                                    <EmploymentItem
                                                        key={item.id || `${item.roleTitle}-${index}`}
                                                        item={item}
                                                        index={index}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {previousRoles.length > 0 && (
                                        <div
                                            className={
                                                currentRoles.length
                                                    ? "border-t border-[var(--df-line)] pt-7"
                                                    : ""
                                            }
                                        >
                                            <p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.13em] text-[var(--df-muted)]">
                                                Previous positions
                                            </p>
                                            <div>
                                                {previousRoles.map((item, index) => (
                                                    <EmploymentItem
                                                        key={item.id || `${item.roleTitle}-${index}`}
                                                        item={item}
                                                        index={index}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </section>
                    </div>

                    <aside>
                        <div className="border border-[var(--df-line)] p-5 sm:p-6">
                            <Eyebrow>Professional links</Eyebrow>
                            <h2 className="mt-2 text-lg font-semibold tracking-tight">
                                Around the web
                            </h2>

                            <div className="mt-5 space-y-3">
                                {portfolioUrl && (
                                    <a
                                        href={portfolioUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-between gap-3 rounded-lg border border-[var(--df-line)] p-3 transition-colors hover:bg-white"
                                    >
                                        <span className="flex items-center gap-2 text-sm font-medium">
                                            <Link2 size={15} />
                                            Portfolio
                                        </span>
                                        <ArrowUpRight size={14} className="text-[var(--df-muted)]" />
                                    </a>
                                )}

                                {githubUrl && (
                                    <a
                                        href={githubUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-between gap-3 rounded-lg border border-[var(--df-line)] p-3 transition-colors hover:bg-white"
                                    >
                                        <span className="flex items-center gap-2 text-sm font-medium">
                                            <FiGithub size={15} />
                                            GitHub
                                        </span>
                                        <ArrowUpRight size={14} className="text-[var(--df-muted)]" />
                                    </a>
                                )}

                                {!portfolioUrl && !githubUrl && (
                                    <p className="text-sm leading-6 text-[var(--df-muted)]">
                                        No external professional links have been added to this
                                        profile.
                                    </p>
                                )}
                            </div>
                        </div>

                    </aside>
                </section>

                <footer className="flex flex-col justify-between gap-4 border-t border-[var(--df-line)] py-6 sm:flex-row sm:items-center">
                    <p className="text-xs text-[var(--df-muted)]">
                        DevFlow / Recruiter profiles
                    </p>
                    <Link
                        href="/recruiters"
                        className="inline-flex items-center gap-2 text-xs font-semibold hover:opacity-70"
                    >
                        <ArrowLeft size={13} />
                        Return to directory
                    </Link>
                </footer>
            </div>
        </main>
    );
}
