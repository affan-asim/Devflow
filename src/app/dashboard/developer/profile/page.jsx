"use client";

import { useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  BriefcaseBusiness,
  Check,
  ExternalLink,
  FileText,
  Globe,
  Mail,
  MapPin,
  Pencil,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchDeveloperProfile,
  clearCurrentDeveloper,
  clearDeveloperErrors,
} from "@/lib/redux/slices/developerSlice";
import { FiGithub } from "react-icons/fi";

function formatDate(date) {
  if (!date) return "—";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

function formatLocation(location) {
  if (!location) return "Not specified";

  const map = {
    REMOTE: "Remote",
    ONSITE: "On-site",
    HYBRID: "Hybrid",
  };

  return map[location] || location;
}

function formatExperience(years) {
  if (years === null || years === undefined || years === "") {
    return "Not specified";
  }

  const value = Number(years);

  if (value === 0) return "Less than 1 year";
  if (value === 1) return "1 year";

  return `${value} years`;
}

function StatusBadge({ children }) {
  return (
    <span className="inline-flex items-center gap-1.5 border border-[var(--df-line)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]">
      <span className="h-1.5 w-1.5 bg-[var(--df-text)]" />
      {children}
    </span>
  );
}

function ProfileSkeleton() {
  return (
    <main className="min-h-screen bg-[var(--df-paper)] text-[var(--df-text)]">
      <div className="mx-auto max-w-[1300px] px-5 py-8 sm:px-8 lg:px-10 lg:py-12">
        <div className="h-3 w-24 animate-pulse bg-[var(--df-line)]" />

        <section className="mt-12 border-b border-[var(--df-line)] pb-10">
          <div className="h-3 w-28 animate-pulse bg-[var(--df-line)]" />
          <div className="mt-5 h-14 w-2/3 animate-pulse bg-[var(--df-line)]" />
          <div className="mt-4 h-4 w-1/3 animate-pulse bg-[var(--df-line)]" />
        </section>

        <div className="grid gap-8 py-8 lg:grid-cols-[1fr_330px]">
          <div className="space-y-5">
            <div className="h-48 animate-pulse border border-[var(--df-line)]" />
            <div className="h-56 animate-pulse border border-[var(--df-line)]" />
            <div className="h-56 animate-pulse border border-[var(--df-line)]" />
          </div>

          <div className="h-72 animate-pulse border border-[var(--df-line)]" />
        </div>
      </div>
    </main>
  );
}

function ProfileError({ message, onRetry }) {
  return (
    <main className="min-h-screen bg-[var(--df-paper)] text-[var(--df-text)]">
      <div className="mx-auto flex min-h-screen max-w-[800px] items-center px-5 py-12">
        <div className="w-full border border-[var(--df-line)] p-8 sm:p-10">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--df-muted)]">
            Developer profile
          </p>

          <h1 className="mt-4 text-3xl font-semibold tracking-tight">
            We couldn't load your profile.
          </h1>

          <p className="mt-3 text-sm leading-6 text-[var(--df-muted)]">
            {message || "Something went wrong while loading your profile."}
          </p>

          <button
            type="button"
            onClick={onRetry}
            className="mt-7 inline-flex h-11 items-center gap-2 bg-[var(--df-text)] px-5 text-sm font-medium text-[var(--df-paper)] transition hover:opacity-90"
          >
            Try again
            <ArrowUpRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </main>
  );
}

export default function DeveloperProfilePage() {
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);

  const {
    currentDeveloper,
    loadingDetail,
    errorDetail,
  } = useSelector((state) => state.developers);

  const userId = user?.id;

  useEffect(() => {
    if (!userId) return;

    dispatch(clearDeveloperErrors());
    dispatch(fetchDeveloperProfile(userId));

    return () => {
      dispatch(clearCurrentDeveloper());
    };
  }, [dispatch, userId]);

  function handleRetry() {
    if (userId) {
      dispatch(fetchDeveloperProfile(userId));
    }
  }

  if (loadingDetail || !userId) {
    return <ProfileSkeleton />;
  }

  if (errorDetail) {
    return (
      <ProfileError
        message={errorDetail}
        onRetry={handleRetry}
      />
    );
  }

  if (!currentDeveloper) {
    return (
      <ProfileError
        message="Developer profile was not found."
        onRetry={handleRetry}
      />
    );
  }

  const profile = currentDeveloper;
  const profileUser = profile.user;

  const employmentHistory = profile.employmentHistory || [];
  const skills = profile.skills || [];

  return (
    <main className="min-h-screen bg-[var(--df-paper)] text-[var(--df-text)]">
      <div className="mx-auto max-w-[1300px] px-5 py-8 sm:px-8 lg:px-10 lg:py-12">
        {/* Back */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--df-muted)] transition hover:text-[var(--df-text)]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Dashboard
        </Link>

        {/* Header */}
        <section className="mt-10 border-b border-[var(--df-line)] pb-8 lg:mt-14 lg:pb-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--df-muted)]">
                Developer profile
              </p>

              <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center bg-[var(--df-text)] text-xl font-semibold text-[var(--df-paper)]">
                  {profileUser?.name?.charAt(0)?.toUpperCase() || "D"}
                </div>

                <div>
                  <h1 className="text-4xl font-semibold tracking-[-0.035em] sm:text-5xl lg:text-6xl">
                    {profileUser?.name || "Developer"}
                  </h1>

                  <p className="mt-2 flex items-center gap-2 text-sm text-[var(--df-muted)]">
                    <Mail className="h-3.5 w-3.5" />
                    {profileUser?.email || "—"}
                  </p>
                </div>
              </div>
            </div>

            <Link
              href="/dashboard/developer/profile/edit"
              className="inline-flex h-11 items-center justify-center gap-2 bg-[var(--df-text)] px-5 text-sm font-medium text-[var(--df-paper)] transition hover:opacity-90"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit profile
            </Link>
          </div>
        </section>

        {/* Account information */}
        <section className="grid border-b border-[var(--df-line)] sm:grid-cols-3">
          <div className="border-b border-[var(--df-line)] py-6 sm:border-b-0 sm:border-r sm:pr-8">
            <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-[var(--df-muted)]">
              Account
            </p>

            <div className="mt-3">
              <StatusBadge>
                {profileUser?.role || "DEVELOPER"}
              </StatusBadge>
            </div>
          </div>

          <div className="border-b border-[var(--df-line)] py-6 sm:border-b-0 sm:border-r sm:px-8">
            <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-[var(--df-muted)]">
              Email
            </p>

            <div className="mt-3">
              {profileUser?.isVerified ? (
                <StatusBadge>Email verified</StatusBadge>
              ) : (
                <span className="text-sm text-[var(--df-muted)]">
                  Email not verified
                </span>
              )}
            </div>
          </div>

          <div className="py-6 sm:pl-8">
            <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-[var(--df-muted)]">
              Member since
            </p>

            <p className="mt-3 text-sm">
              {formatDate(profileUser?.createdAt)}
            </p>
          </div>
        </section>

        <div className="grid gap-8 py-8 lg:grid-cols-[1fr_330px]">
          {/* Main */}
          <div className="space-y-8">
            {/* About */}
            <section>
              <div className="border-b border-[var(--df-line)] pb-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--df-muted)]">
                  About
                </p>

                <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                  Professional overview
                </h2>
              </div>

              <div className="pt-5">
                {profile.bio ? (
                  <p className="max-w-3xl whitespace-pre-line text-sm leading-7">
                    {profile.bio}
                  </p>
                ) : (
                  <p className="text-sm text-[var(--df-muted)]">
                    No professional bio has been added yet.
                  </p>
                )}
              </div>
            </section>

            {/* Skills */}
            <section>
              <div className="border-b border-[var(--df-line)] pb-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--df-muted)]">
                  Skills
                </p>

                <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                  Technical capabilities
                </h2>
              </div>

              <div className="pt-5">
                {skills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill) => (
                      <div
                        key={skill.id}
                        className="border border-[var(--df-line)] px-3 py-2"
                      >
                        <p className="text-xs font-medium">
                          {skill.name}
                        </p>

                        {skill.category && (
                          <p className="mt-1 text-[9px] font-semibold uppercase tracking-[0.1em] text-[var(--df-muted)]">
                            {skill.category}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-[var(--df-muted)]">
                    No skills have been added yet.
                  </p>
                )}
              </div>
            </section>

            {/* Employment */}
            <section>
              <div className="border-b border-[var(--df-line)] pb-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--df-muted)]">
                  Experience
                </p>

                <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                  Employment history
                </h2>
              </div>

              <div className="pt-5">
                {employmentHistory.length > 0 ? (
                  <div className="space-y-3">
                    {employmentHistory.map((employment) => (
                      <div
                        key={employment.id}
                        className="border border-[var(--df-line)] p-5"
                      >
                        <div className="flex gap-4">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-[var(--df-line)]">
                            <BriefcaseBusiness className="h-4 w-4" />
                          </div>

                          <div className="min-w-0">
                            <h3 className="text-sm font-semibold">
                              {employment.position ||
                                employment.title ||
                                "Employment"}
                            </h3>

                            <p className="mt-1 text-xs text-[var(--df-muted)]">
                              {employment.company?.name ||
                                "Company not specified"}
                            </p>

                            {(employment.startDate ||
                              employment.endDate) && (
                              <p className="mt-3 text-[10px] uppercase tracking-[0.1em] text-[var(--df-muted)]">
                                {formatDate(employment.startDate)}{" "}
                                —{" "}
                                {employment.endDate
                                  ? formatDate(employment.endDate)
                                  : "Present"}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="border border-[var(--df-line)] p-6">
                    <p className="text-sm text-[var(--df-muted)]">
                      No employment history has been added yet.
                    </p>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <aside>
            <div className="sticky top-6 space-y-4">
              {/* Profile details */}
              <section className="border border-[var(--df-line)] p-5 sm:p-6">
                <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--df-muted)]">
                  Profile details
                </p>

                <div className="mt-5 space-y-5">
                  <div>
                    <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--df-muted)]">
                      Experience
                    </p>

                    <p className="mt-1 text-sm">
                      {formatExperience(profile.yearsOfExp)}
                    </p>
                  </div>

                  <div>
                    <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--df-muted)]">
                      Work preference
                    </p>

                    <p className="mt-1 flex items-center gap-2 text-sm">
                      <MapPin className="h-3.5 w-3.5 text-[var(--df-muted)]" />
                      {formatLocation(profile.locationPreference)}
                    </p>
                  </div>

                  <div>
                    <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--df-muted)]">
                      Resume
                    </p>

                    {profile.resumeId ? (
                      <div className="mt-2 flex items-center gap-2 text-sm">
                        <FileText className="h-4 w-4" />
                        Resume uploaded
                      </div>
                    ) : (
                      <p className="mt-1 text-sm text-[var(--df-muted)]">
                        No resume uploaded
                      </p>
                    )}
                  </div>
                </div>
              </section>

              {/* Links */}
              <section className="border border-[var(--df-line)] p-5 sm:p-6">
                <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--df-muted)]">
                  Links
                </p>

                <div className="mt-5 space-y-2">
                  {profile.githubUrl ? (
                    <a
                      href={profile.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between border border-[var(--df-line)] p-3 text-sm transition hover:border-[var(--df-text)]"
                    >
                      <span className="flex items-center gap-2">
                        <FiGithub className="h-4 w-4" />
                        GitHub
                      </span>

                      <ExternalLink className="h-3.5 w-3.5 text-[var(--df-muted)]" />
                    </a>
                  ) : null}

                  {profile.portfolioUrl ? (
                    <a
                      href={profile.portfolioUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between border border-[var(--df-line)] p-3 text-sm transition hover:border-[var(--df-text)]"
                    >
                      <span className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        Portfolio
                      </span>

                      <ExternalLink className="h-3.5 w-3.5 text-[var(--df-muted)]" />
                    </a>
                  ) : null}

                  {!profile.githubUrl && !profile.portfolioUrl && (
                    <p className="text-sm text-[var(--df-muted)]">
                      No external links have been added.
                    </p>
                  )}
                </div>
              </section>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}