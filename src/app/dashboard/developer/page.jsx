"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    ArrowUpRight,
    Bell,
    BriefcaseBusiness,
    CheckCircle2,
    Clock3,
    FileText,
    UserRound,
} from "lucide-react";

import { fetchDeveloperDashboard } from "@/lib/redux/slices/developerSlice";
import { DashboardSkeleton } from "@/components/developer-dashboard/shared/DashboardSkeleton";
import { DashboardStats } from "@/components/developer-dashboard/dashboard/DashboardStats";
import { DashboardActivity } from "@/components/developer-dashboard/dashboard/DashboardActivity";
import { DashboardRecommendedJobs } from "@/components/developer-dashboard/dashboard/DashboardRecommendedJobs";
import { DashboardRecentApplications } from "@/components/developer-dashboard/dashboard/DashboardRecentApplications";
import { DashboardNotifications } from "@/components/developer-dashboard/dashboard/DashboardNotifications";

export default function DeveloperDashboardPage() {
    const dispatch = useDispatch();

    const {
        dashboard,
        loadingDashboard,
        errorDashboard,
    } = useSelector((state) => state.developers);

    useEffect(() => {
        dispatch(fetchDeveloperDashboard());
    }, [dispatch]);

    if (loadingDashboard) {
        return <DashboardSkeleton />;
    }

    if (errorDashboard) {
        return (
            <div className="mx-auto max-w-[1320px] px-5 py-10 sm:px-8">
                <div className="border-y border-[var(--df-line)] py-12">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--df-soft)]">
                        Dashboard
                    </p>

                    <h1 className="mt-3 text-2xl font-semibold tracking-[-0.035em]">
                        Something went wrong
                    </h1>

                    <p className="mt-2 text-sm text-[var(--df-muted)]">
                        {errorDashboard}
                    </p>
                </div>
            </div>
        );
    }

    const {
        profile,
        stats,
        applicationAnalytics,
        recommendedJobs,
        recentApplications,
        recentNotifications,
    } = dashboard;

    const userName =
        profile?.user?.name ||
        "Developer";

    return (
        <div className="mx-auto max-w-[1320px] px-5 py-10 sm:px-8 lg:py-14">
            {/* Header */}
            <section className="border-b border-[var(--df-line)] pb-10">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--df-soft)]">
                    Developer dashboard
                </p>

                <div className="mt-4 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h1
                            className="
                text-3xl
                font-semibold
                tracking-[-0.045em]
                sm:text-4xl
              "
                        >
                            Welcome back, {userName}.
                        </h1>

                        <p className="mt-3 max-w-xl text-sm leading-6 text-[var(--df-muted)]">
                            Track your applications, discover relevant jobs and keep
                            your developer profile ready for opportunities.
                        </p>
                    </div>

                    <a
                        href="/dashboard/developer/jobs"
                        className="
              inline-flex
              h-10
              shrink-0
              items-center
              justify-center
              gap-2
              bg-[var(--df-text)]
              px-4
              text-xs
              font-semibold
              text-[var(--df-paper)]
              transition-opacity
              hover:opacity-80
            "
                    >
                        Discover jobs
                        <ArrowUpRight size={14} strokeWidth={1.5} />
                    </a>
                </div>
            </section>

            {/* Profile completion */}
            <section className="border-b border-[var(--df-line)] py-8">
                <div className="grid gap-8 lg:grid-cols-[1fr_300px] lg:items-center">
                    <div>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--df-soft)]">
                                    Profile completion
                                </p>

                                <p className="mt-2 text-sm text-[var(--df-muted)]">
                                    Complete your profile to present a stronger
                                    developer presence.
                                </p>
                            </div>

                            <span className="text-2xl font-semibold tracking-[-0.04em]">
                                {profile?.completenessPercentage || 0}%
                            </span>
                        </div>

                        <div className="mt-5 h-1 bg-[var(--df-paper-3)]">
                            <div
                                className="h-full bg-[var(--df-text)] transition-all duration-500"
                                style={{
                                    width: `${profile?.completenessPercentage || 0}%`,
                                }}
                            />
                        </div>
                    </div>

                    <a
                        href="/dashboard/developer/profile/edit"
                        className="
              flex
              items-center
              justify-between
              border
              border-[var(--df-line)]
              px-4
              py-3
              text-xs
              font-medium
              transition-colors
              hover:bg-[var(--df-paper-2)]
            "
                    >
                        <span className="flex items-center gap-2">
                            <UserRound size={15} strokeWidth={1.5} />
                            Improve profile
                        </span>

                        <ArrowUpRight size={14} strokeWidth={1.5} />
                    </a>
                </div>
            </section>

            {/* Stats */}
            <DashboardStats stats={stats} />

            {/* Main grid */}
            <div className="grid lg:grid-cols-[1fr_340px]">
                <div className="lg:border-r lg:border-[var(--df-line)] lg:pr-10">
                    <DashboardActivity
                        analytics={applicationAnalytics}
                    />

                    <DashboardRecommendedJobs
                        jobs={recommendedJobs}
                    />
                </div>

                <aside className="border-t border-[var(--df-line)] lg:border-t-0 lg:pl-10">
                    <DashboardRecentApplications
                        applications={recentApplications}
                    />

                    <DashboardNotifications
                        notifications={recentNotifications}
                    />
                </aside>
            </div>
        </div>
    );
}


export function formatValue(value) {
    if (!value) return "";

    return value
        .toLowerCase()
        .replace(/_/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function formatDate(value) {
    if (!value) return "";
  
    return new Date(value).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}