
"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowLeft,
  ArrowUpRight,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  Code2,
  ExternalLink,
  Globe,
  MapPin,
  Sparkles,
} from "lucide-react";
import {
  clearCurrentDeveloper,
  fetchDeveloperProfile,
} from "@/lib/redux/slices/developerSlice";
import { FiGithub } from "react-icons/fi";

function formatLabel(value) {
  if (!value) return "Not specified";

  return String(value)
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getInitials(name) {
  return (
    name
      ?.trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "D"
  );
}

function formatDate(value) {
  if (!value) return "Present";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Date unavailable";

  return new Intl.DateTimeFormat("en", {
    month: "short",
    year: "numeric",
  }).format(date);
}

function durationLabel(startDate, endDate, isCurrent) {
  if (!startDate) return "Dates not specified";

  const start = new Date(startDate);
  const end = isCurrent || !endDate ? new Date() : new Date(endDate);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return "Dates not specified";
  }

  const months = Math.max(
    0,
    (end.getFullYear() - start.getFullYear()) * 12 +
    end.getMonth() -
    start.getMonth()
  );

  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;

  if (years === 0 && remainingMonths === 0) return "Less than a month";
  if (years === 0) return `${remainingMonths} mo`;
  if (remainingMonths === 0) return `${years} yr`;

  return `${years} yr ${remainingMonths} mo`;
}

function safeExternalUrl(value) {
  if (!value) return null;

  try {
    const url = new URL(value);

    return ["https:", "http:"].includes(url.protocol)
      ? url.href
      : null;
  } catch {
    return null;
  }
}

function SectionHeading({ eyebrow, title, count }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3 border-b border-[var(--df-line)] pb-4">
      <div>
        <p className="df-eyebrow">{eyebrow}</p>
        <h2 className="mt-2 text-xl font-semibold tracking-tight">{title}</h2>
      </div>

      {count != null && (
        <span className="text-xs text-[var(--df-muted)]">
          {count} {count === 1 ? "item" : "items"}
        </span>
      )}
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <main className="min-h-screen bg-[var(--df-paper)]">
      <div className="mx-auto max-w-6xl animate-pulse px-5 py-10 sm:px-8">
        <div className="h-4 w-32 bg-[var(--df-line)]" />

        <div className="mt-12 border border-[var(--df-line)] bg-white p-6 sm:p-10">
          <div className="size-20 rounded-full bg-[var(--df-line)]" />
          <div className="mt-8 h-8 max-w-sm bg-[var(--df-line)]" />
          <div className="mt-4 h-4 max-w-xl bg-[var(--df-line)]" />
          <div className="mt-3 h-4 max-w-md bg-[var(--df-line)]" />
        </div>

        <div className="mt-8 grid gap-8 md:grid-cols-[1fr_280px]">
          <div className="h-64 bg-[var(--df-line)]" />
          <div className="h-48 bg-[var(--df-line)]" />
        </div>
      </div>
    </main>
  );
}

function EmptySection({ children }) {
  return (
    <div className="border border-dashed border-[var(--df-line)] px-5 py-8 text-sm leading-6 text-[var(--df-muted)]">
      {children}
    </div>
  );
}

function ExperienceItem({ item, last }) {
  return (
    <article className="relative pl-8">
      <span className="absolute left-0 top-1.5 z-10 flex size-3 items-center justify-center rounded-full border border-[var(--df-text)] bg-[var(--df-paper)]" />

      {!last && (
        <span className="absolute bottom-0 left-[5px] top-5 w-px bg-[var(--df-line)]" />
      )}

      <div className="pb-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold tracking-tight">
              {item.roleTitle || "Developer"}
            </h3>

            <p className="mt-1 text-sm text-[var(--df-muted)]">
              {item.company?.name || "Company not specified"}
            </p>
          </div>

          {item.isCurrent && (
            <span className="inline-flex items-center gap-1.5 border border-[var(--df-line)] px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider">
              <span className="size-1.5 rounded-full bg-[var(--df-accent)]" />
              Current
            </span>
          )}
        </div>

        <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-[var(--df-muted)]">
          <span>
            {formatDate(item.startDate)} —{" "}
            {item.isCurrent ? "Present" : formatDate(item.endDate)}
          </span>

          <span>·</span>

          <span>
            {durationLabel(item.startDate, item.endDate, item.isCurrent)}
          </span>
        </div>

        {item.description && (
          <p className="mt-4 whitespace-pre-line text-sm leading-7 text-[var(--df-muted)]">
            {item.description}
          </p>
        )}
      </div>
    </article>
  );
}

function ExternalLinkCard({ href, label, description, icon: Icon }) {
  if (!href) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center gap-3 border border-[var(--df-line)] bg-white p-4 transition-colors hover:border-[var(--df-text)]"
    >
      <span className="flex size-10 shrink-0 items-center justify-center border border-[var(--df-line)]">
        <Icon size={17} />
      </span>

      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium">{label}</span>
        <span className="mt-1 block truncate text-xs text-[var(--df-muted)]">
          {description}
        </span>
      </span>

      <ArrowUpRight
        size={16}
        className="shrink-0 text-[var(--df-muted)] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
      />
    </a>
  );
}

export default function DeveloperDetailPage({ userId }) {
  console.log(userId, "FFFR")
  const dispatch = useDispatch();

  const {
    currentDeveloper: profile,
    loadingDetail,
    errorDetail,
  } = useSelector((state) => state.developers);

  useEffect(() => {
    if (!userId) return;

    dispatch(clearCurrentDeveloper());
    dispatch(fetchDeveloperProfile(userId));

    return () => {
      dispatch(clearCurrentDeveloper());
    };
  }, [dispatch, userId]);

  if (loadingDetail && !profile) {
    return <ProfileSkeleton />;
  }

  if (errorDetail || !profile) {
    return (
      <main className="min-h-screen bg-[var(--df-paper)] px-5 py-10 text-[var(--df-text)] sm:px-8">
        <div className="mx-auto max-w-3xl">
          <Link
            href="/developers"
            className="inline-flex items-center gap-2 text-sm text-[var(--df-muted)] hover:text-[var(--df-text)]"
          >
            <ArrowLeft size={16} />
            Back to developers
          </Link>

          <section className="mt-12 border border-[var(--df-line)] bg-white px-6 py-14 text-center sm:px-12">
            <div className="mx-auto flex size-12 items-center justify-center border border-[var(--df-line)]">
              <Code2 size={20} />
            </div>

            <p className="df-eyebrow mt-6">Profile unavailable</p>

            <h1 className="mt-3 text-2xl font-semibold tracking-tight">
              We couldn’t find this developer.
            </h1>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[var(--df-muted)]">
              {errorDetail ||
                "This profile may have been removed or is no longer available."}
            </p>

            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Link
                href="/developers"
                className="inline-flex min-h-11 items-center gap-2 bg-[var(--df-text)] px-5 text-sm font-medium text-white"
              >
                Explore developers
                <ArrowUpRight size={15} />
              </Link>

              {errorDetail && (
                <button
                  onClick={() => dispatch(fetchDeveloperProfile(userId))}
                  className="min-h-11 border border-[var(--df-line)] px-5 text-sm hover:border-[var(--df-text)]"
                >
                  Try again
                </button>
              )}
            </div>
          </section>
        </div>
      </main>
    );
  }

  const user = profile.user || {};
  const name = user.name || "Developer";
  const skills = profile.skills || [];
  const history = profile.employmentHistory || [];
  const githubUrl = safeExternalUrl(profile.githubUrl);
  const portfolioUrl = safeExternalUrl(profile.portfolioUrl);
  const joinedDate = user.createdAt ? formatDate(user.createdAt) : null;

  return (
    <main className="min-h-screen bg-[var(--df-paper)] text-[var(--df-text)]">
      <div className="mx-auto max-w-6xl px-5 pb-16 pt-8 sm:px-8 sm:pt-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/developers"
            className="inline-flex items-center gap-2 text-sm text-[var(--df-muted)] transition-colors hover:text-[var(--df-text)]"
          >
            <ArrowLeft size={16} />
            All developers
          </Link>

          <p className="df-eyebrow">DevFlow / Developer profile</p>
        </div>

        <section className="mt-8 border border-[var(--df-line)] bg-white">
          <div className="h-1.5 bg-[var(--df-accent)]" />

          <div className="p-6 sm:p-10 lg:p-12">
            <div className="flex flex-col gap-7 sm:flex-row sm:items-start">
              <div className="flex size-20 shrink-0 items-center justify-center rounded-full border border-[var(--df-line)] bg-[var(--df-paper)] text-xl font-semibold tracking-tight">
                {getInitials(name)}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="df-eyebrow">Developer profile</p>

                  {user.isVerified && (
                    <span className="inline-flex items-center gap-1 border border-[var(--df-line)] px-2 py-1 text-[10px] font-medium uppercase tracking-wider">
                      <Check size={12} />
                      Verified
                    </span>
                  )}
                </div>

                <h1 className="mt-4 break-words text-3xl font-semibold leading-tight tracking-[-0.045em] sm:text-5xl">
                  {name}
                </h1>

                {profile.bio && (
                  <p className="mt-5 max-w-3xl whitespace-pre-line text-base leading-7 text-[var(--df-muted)]">
                    {profile.bio}
                  </p>
                )}

                <div className="mt-6 flex flex-wrap gap-x-5 gap-y-3 text-sm text-[var(--df-muted)]">
                  <span className="inline-flex items-center gap-2">
                    <BriefcaseBusiness size={16} />
                    {profile.yearsOfExp == null
                      ? "Experience not specified"
                      : `${profile.yearsOfExp} ${profile.yearsOfExp === 1 ? "year" : "years"
                      } of experience`}
                  </span>

                  <span className="inline-flex items-center gap-2">
                    <MapPin size={16} />
                    {formatLabel(profile.locationPreference)}
                  </span>

                  {joinedDate && (
                    <span className="inline-flex items-center gap-2">
                      <CalendarDays size={16} />
                      Joined {joinedDate}
                    </span>
                  )}
                </div>

                <div className="mt-7 flex flex-wrap gap-3">
                  {portfolioUrl && (
                    <a
                      href={portfolioUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-11 items-center gap-2 bg-[var(--df-text)] px-5 text-sm font-medium text-white transition-opacity hover:opacity-85"
                    >
                      Visit portfolio
                      <ExternalLink size={15} />
                    </a>
                  )}

                  {githubUrl && (
                    <a
                      href={githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-11 items-center gap-2 border border-[var(--df-line)] px-5 text-sm font-medium transition-colors hover:border-[var(--df-text)]"
                    >
                      <FiGithub size={16} />
                      GitHub
                      <ArrowUpRight size={14} />
                    </a>
                  )}
                </div>
              </div>
            </div>

            {profile.description && (
              <div className="mt-10 border-t border-[var(--df-line)] pt-7">
                <p className="df-eyebrow">Professional overview</p>

                <p className="mt-4 max-w-4xl whitespace-pre-line text-sm leading-7 text-[var(--df-muted)] sm:text-base sm:leading-8">
                  {profile.description}
                </p>
              </div>
            )}
          </div>

          <div className="grid border-t border-[var(--df-line)] sm:grid-cols-3">
            <div className="border-b border-[var(--df-line)] p-5 sm:border-b-0 sm:border-r sm:p-6">
              <p className="df-eyebrow">Experience</p>
              <p className="mt-3 text-2xl font-semibold tracking-tight">
                {profile.yearsOfExp == null
                  ? "—"
                  : `${profile.yearsOfExp} yrs`}
              </p>
            </div>

            <div className="border-b border-[var(--df-line)] p-5 sm:border-b-0 sm:border-r sm:p-6">
              <p className="df-eyebrow">Skills listed</p>
              <p className="mt-3 text-2xl font-semibold tracking-tight">
                {skills.length}
              </p>
            </div>

            <div className="p-5 sm:p-6">
              <p className="df-eyebrow">Experience entries</p>
              <p className="mt-3 text-2xl font-semibold tracking-tight">
                {history.length}
              </p>
            </div>
          </div>
        </section>

        <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="min-w-0 space-y-10">
            <section>
              <SectionHeading
                eyebrow="01 / Technical toolkit"
                title="Skills & technologies"
                count={skills.length}
              />

              {skills.length ? (
                <div className="mt-5 flex flex-wrap gap-2.5">
                  {skills.map((skill, index) => (
                    <div
                      key={skill.id || `${skill.name}-${index}`}
                      className="flex items-center gap-2 border border-[var(--df-line)] bg-white px-3.5 py-2.5"
                    >
                      <Code2
                        size={14}
                        className="text-[var(--df-muted)]"
                      />

                      <span className="text-sm font-medium">{skill.name}</span>

                      {skill.category && (
                        <span className="ml-1 border-l border-[var(--df-line)] pl-2 text-xs text-[var(--df-muted)]">
                          {formatLabel(skill.category)}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-5">
                  <EmptySection>
                    This developer hasn’t added their technical skills yet.
                  </EmptySection>
                </div>
              )}
            </section>

            <section>
              <SectionHeading
                eyebrow="02 / Career"
                title="Professional experience"
                count={history.length}
              />

              {history.length ? (
                <div className="mt-6">
                  {history.map((item, index) => (
                    <ExperienceItem
                      key={item.id || `${item.roleTitle}-${index}`}
                      item={item}
                      last={index === history.length - 1}
                    />
                  ))}
                </div>
              ) : (
                <div className="mt-5">
                  <EmptySection>
                    No employment history has been shared on this profile yet.
                  </EmptySection>
                </div>
              )}
            </section>
          </div>

          <aside className="space-y-5">
            <section className="border border-[var(--df-line)] bg-white p-5 sm:p-6">
              <p className="df-eyebrow">At a glance</p>
              <h2 className="mt-3 text-lg font-semibold tracking-tight">
                Developer snapshot
              </h2>

              <div className="mt-5 divide-y divide-[var(--df-line)]">
                <div className="flex items-start justify-between gap-4 py-3">
                  <span className="text-sm text-[var(--df-muted)]">
                    Location
                  </span>
                  <span className="max-w-36 text-right text-sm font-medium">
                    {formatLabel(profile.locationPreference)}
                  </span>
                </div>

                <div className="flex items-start justify-between gap-4 py-3">
                  <span className="text-sm text-[var(--df-muted)]">
                    Experience
                  </span>
                  <span className="text-right text-sm font-medium">
                    {profile.yearsOfExp == null
                      ? "Not specified"
                      : `${profile.yearsOfExp} years`}
                  </span>
                </div>

                <div className="flex items-start justify-between gap-4 py-3">
                  <span className="text-sm text-[var(--df-muted)]">
                    Verification
                  </span>
                  <span className="text-right text-sm font-medium">
                    {user.isVerified ? "Verified" : "Not verified"}
                  </span>
                </div>
              </div>
            </section>

            {(portfolioUrl || githubUrl) && (
              <section className="space-y-3">
                <p className="df-eyebrow">03 / Around the web</p>

                <ExternalLinkCard
                  href={portfolioUrl}
                  label="Portfolio"
                  description="Personal website and projects"
                  icon={Globe}
                />

                <ExternalLinkCard
                  href={githubUrl}
                  label="GitHub"
                  description="Code and open-source work"
                  icon={FiGithub}
                />
              </section>
            )}

            <section className="border border-[var(--df-line)] bg-white p-5 sm:p-6">
              <span className="flex size-9 items-center justify-center border border-[var(--df-line)]">
                <Sparkles size={17} />
              </span>

              <h2 className="mt-4 text-base font-semibold tracking-tight">
                Good work starts with the right people.
              </h2>

              <p className="mt-2 text-sm leading-6 text-[var(--df-muted)]">
                Keep exploring the directory to discover more developers and
                technical skill sets.
              </p>

              <Link
                href="/developers"
                className="mt-5 inline-flex items-center gap-2 text-sm font-medium hover:underline"
              >
                Explore more profiles
                <ArrowUpRight size={15} />
              </Link>
            </section>
          </aside>
        </div>

        <footer className="mt-16 flex flex-col gap-3 border-t border-[var(--df-line)] pt-5 text-xs text-[var(--df-muted)] sm:flex-row sm:items-center sm:justify-between">
          <span>DEVFLOW / DEVELOPER PROFILE</span>
          <Link href="/developers" className="hover:text-[var(--df-text)]">
            Return to developer directory
          </Link>
        </footer>
      </div>
    </main>
  );
}
