"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowLeft,
  BriefcaseBusiness,
  CalendarDays,
  ExternalLink,
  Globe,
  Mail,
  MapPin,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import {
  clearRecruiterExploreProfile,
  fetchRecruiterProfileById,
} from "@/lib/redux/slices/recruiterSlice";

import {
  formatDate,
  formatExperience,
  formatLocationPreference,
  getInitials,
  getRecruiterStatus,
  getStatusClasses,
} from "@/lib/recruiter/recruiterManagement";
import { FiGithub } from "react-icons/fi";


export default function RecruiterManagementDetailPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useDispatch();

  const recruiterId = params?.id;

  const {
    currentExploreProfile,
    loadingExploreProfile,
    errorExploreProfile,
  } = useSelector((state) => state.recruiter);

  useEffect(() => {
    if (!recruiterId) return;

    dispatch(clearRecruiterExploreProfile());
    dispatch(fetchRecruiterProfileById(recruiterId));

    return () => {
      dispatch(clearRecruiterExploreProfile());
    };
  }, [dispatch, recruiterId]);

  if (loadingExploreProfile) {
    return <DetailSkeleton />;
  }

  if (errorExploreProfile) {
    return (
      <main className="min-h-screen bg-[var(--df-paper)] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <BackButton onClick={() => router.back()} />

          <div className="mt-6 border border-red-200 bg-red-50 p-6 dark:border-red-900 dark:bg-red-950/30">
            <p className="text-sm font-semibold text-red-800 dark:text-red-300">
              Unable to load recruiter
            </p>

            <p className="mt-1 text-sm text-red-700 dark:text-red-300">
              {errorExploreProfile}
            </p>

            <button
              type="button"
              onClick={() =>
                dispatch(fetchRecruiterProfileById(recruiterId))
              }
              className="mt-4 border border-red-200 bg-[var(--df-paper-2)] px-4 py-2 text-xs font-medium text-red-800 dark:border-red-900 dark:text-red-300"
            >
              Try again
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (!currentExploreProfile) {
    return null;
  }

  const recruiter = currentExploreProfile;
  const user = recruiter.user;
  const status = getRecruiterStatus(recruiter);

  return (
    <main className="min-h-screen bg-[var(--df-paper)] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <BackButton
          onClick={() => router.back()}
        />

        {/* Profile header */}
        <section className="mt-6 border-y border-[var(--df-line)] bg-[var(--df-paper-2)]">
          <div className="p-5 sm:p-7">
            <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
              <div className="flex min-w-0 gap-4 sm:gap-5">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center border border-[var(--df-line)] bg-[var(--df-paper)] text-lg font-semibold text-[var(--df-text)] sm:h-20 sm:w-20">
                  {getInitials(user?.name)}
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-2xl font-semibold tracking-tight text-[var(--df-text)]">
                      {user?.name || "Unnamed recruiter"}
                    </h1>

                    {user?.isVerified && (
                      <span
                        title="Verified account"
                        className="text-emerald-600"
                      >
                        <ShieldCheck size={18} />
                      </span>
                    )}
                  </div>

                  <p className="mt-1 text-sm text-[var(--df-muted)]">
                    {recruiter.jobTitle ||
                      "Recruiter role not specified"}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-[var(--df-muted)]">
                    <span className="inline-flex items-center gap-1.5">
                      <Mail size={13} />
                      {user?.email || "No email"}
                    </span>

                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays size={13} />
                      Joined {formatDate(user?.createdAt)}
                    </span>
                  </div>
                </div>
              </div>

              <StatusBadge status={status} />
            </div>
          </div>

          {/* Quick profile facts */}
          <div className="grid border-t border-[var(--df-line)] sm:grid-cols-3">
            <Fact
              icon={<BriefcaseBusiness size={15} />}
              label="Experience"
              value={formatExperience(recruiter.yearsOfExp)}
            />

            <Fact
              icon={<MapPin size={15} />}
              label="Work preference"
              value={formatLocationPreference(
                recruiter.locationPreference
              )}
            />

            <Fact
              icon={<UserRound size={15} />}
              label="Account"
              value={
                user?.isActive
                  ? "Active"
                  : "Inactive"
              }
            />
          </div>
        </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          {/* Main */}
          <div className="space-y-6">
            <Section
              eyebrow="Profile"
              title="About the recruiter"
            >
              {recruiter.bio || recruiter.description ? (
                <div className="space-y-5">
                  {recruiter.bio && (
                    <div>
                      <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--df-muted)]">
                        Bio
                      </p>

                      <p className="whitespace-pre-line text-sm leading-7 text-[var(--df-text)]">
                        {recruiter.bio}
                      </p>
                    </div>
                  )}

                  {recruiter.description && (
                    <div>
                      <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--df-muted)]">
                        Description
                      </p>

                      <p className="whitespace-pre-line text-sm leading-7 text-[var(--df-text)]">
                        {recruiter.description}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <EmptySection message="No profile description has been provided." />
              )}
            </Section>

            <Section
              eyebrow="Professional"
              title="Online presence"
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <ExternalProfile
                  icon={<FiGithub size={17} />}
                  label="GitHub"
                  value={recruiter.githubUrl}
                />

                <ExternalProfile
                  icon={<Globe size={17} />}
                  label="Portfolio"
                  value={recruiter.portfolioUrl}
                />
              </div>
            </Section>

            <Section
              eyebrow="Employment"
              title="Recruiter history"
            >
              {recruiter.recruiterHistory?.length ? (
                <div className="divide-y divide-[var(--df-line)] border-y border-[var(--df-line)]">
                  {recruiter.recruiterHistory.map(
                    (history) => (
                      <HistoryItem
                        key={history.id}
                        history={history}
                      />
                    )
                  )}
                </div>
              ) : (
                <EmptySection message="No previous recruiter history is available." />
              )}
            </Section>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            <Section
              eyebrow="Company"
              title="Current company"
            >
              <CompanyCard company={recruiter.company} />
            </Section>

            <Section
              eyebrow="Account"
              title="Recruiter details"
            >
              <div className="space-y-4">
                <DetailRow
                  label="Profile ID"
                  value={recruiter.id}
                  mono
                />

                <DetailRow
                  label="User ID"
                  value={recruiter.userId}
                  mono
                />

                <DetailRow
                  label="Email"
                  value={user?.email}
                />

                <DetailRow
                  label="Account created"
                  value={formatDate(user?.createdAt)}
                />

                <DetailRow
                  label="Verification"
                  value={
                    user?.isVerified
                      ? "Verified"
                      : "Not verified"
                  }
                />

                <DetailRow
                  label="Account status"
                  value={
                    user?.isActive
                      ? "Active"
                      : "Inactive"
                  }
                />
              </div>
            </Section>
          </aside>
        </div>
      </div>
    </main>
  );
}

function BackButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 text-xs font-medium text-[var(--df-muted)] transition hover:text-[var(--df-text)]"
    >
      <ArrowLeft size={14} />
      Back to recruiters
    </button>
  );
}

function Section({ eyebrow, title, children }) {
  return (
    <section className="border border-[var(--df-line)] bg-[var(--df-paper-2)]">
      <div className="border-b border-[var(--df-line)] px-5 py-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--df-muted)]">
          {eyebrow}
        </p>

        <h2 className="mt-1 text-base font-semibold text-[var(--df-text)]">
          {title}
        </h2>
      </div>

      <div className="p-5">{children}</div>
    </section>
  );
}

function Fact({ icon, label, value }) {
  return (
    <div className="flex items-center gap-3 border-b border-[var(--df-line)] p-4 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0">
      <div className="text-[var(--df-muted)]">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-wider text-[var(--df-muted)]">
          {label}
        </p>

        <p className="mt-0.5 truncate text-sm font-medium text-[var(--df-text)]">
          {value}
        </p>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex w-fit items-center border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${getStatusClasses(
        status.tone
      )}`}
    >
      {status.label}
    </span>
  );
}

function ExternalProfile({
  icon,
  label,
  value,
}) {
  if (!value) {
    return (
      <div className="border border-[var(--df-line)] p-4">
        <div className="flex items-center gap-2 text-[var(--df-muted)]">
          {icon}
          <span className="text-xs font-medium">
            {label}
          </span>
        </div>

        <p className="mt-2 text-xs text-[var(--df-muted)]">
          Not provided
        </p>
      </div>
    );
  }

  return (
    <a
      href={value}
      target="_blank"
      rel="noreferrer"
      className="group border border-[var(--df-line)] p-4 transition hover:border-[var(--df-text)]"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[var(--df-text)]">
          {icon}

          <span className="text-xs font-semibold">
            {label}
          </span>
        </div>

        <ExternalLink
          size={13}
          className="text-[var(--df-muted)] transition group-hover:text-[var(--df-text)]"
        />
      </div>

      <p className="mt-2 truncate text-xs text-[var(--df-muted)]">
        {value}
      </p>
    </a>
  );
}

function CompanyCard({ company }) {
  if (!company) {
    return (
      <EmptySection message="This recruiter is not currently associated with a company." />
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3">
        {company.logo ? (
          <img
            src={company.logo}
            alt=""
            className="h-11 w-11 border border-[var(--df-line)] object-cover"
          />
        ) : (
          <div className="flex h-11 w-11 items-center justify-center border border-[var(--df-line)] bg-[var(--df-paper)] text-sm font-semibold">
            {getInitials(company.name)}
          </div>
        )}

        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-[var(--df-text)]">
            {company.name}
          </p>

          <div className="mt-1 flex items-center gap-1.5 text-xs text-[var(--df-muted)]">
            {company.isVerified && (
              <>
                <ShieldCheck
                  size={12}
                  className="text-emerald-600"
                />
                Verified company
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailRow({
  label,
  value,
  mono = false,
}) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--df-muted)]">
        {label}
      </p>

      <p
        className={`mt-1 break-all text-xs text-[var(--df-text)] ${
          mono ? "font-mono" : ""
        }`}
      >
        {value || "—"}
      </p>
    </div>
  );
}

function HistoryItem({ history }) {
  return (
    <div className="py-5 first:pt-0 last:pb-0">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center border border-[var(--df-line)] bg-[var(--df-paper)]">
            {history.company?.logo ? (
              <img
                src={history.company.logo}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <BriefcaseBusiness
                size={15}
                className="text-[var(--df-muted)]"
              />
            )}
          </div>

          <div>
            <p className="text-sm font-semibold text-[var(--df-text)]">
              {history.company?.name ||
                "Unknown company"}
            </p>

            <p className="mt-1 text-xs text-[var(--df-muted)]">
              {history.roleTitle ||
                history.jobTitle ||
                "Recruiter"}
            </p>
          </div>
        </div>

        <div className="text-xs text-[var(--df-muted)] sm:text-right">
          <p>
            {formatDate(history.startDate)}
            {" — "}
            {history.endDate
              ? formatDate(history.endDate)
              : "Present"}
          </p>
        </div>
      </div>
    </div>
  );
}

function EmptySection({ message }) {
  return (
    <p className="text-sm leading-6 text-[var(--df-muted)]">
      {message}
    </p>
  );
}

function DetailSkeleton() {
  return (
    <main className="min-h-screen bg-[var(--df-paper)] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="h-4 w-32 animate-pulse bg-[var(--df-paper-2)]" />

        <div className="mt-6 border-y border-[var(--df-line)] bg-[var(--df-paper-2)] p-7">
          <div className="flex gap-5">
            <div className="h-20 w-20 animate-pulse bg-[var(--df-paper)]" />

            <div className="flex-1">
              <div className="h-7 w-56 animate-pulse bg-[var(--df-paper)]" />
              <div className="mt-3 h-4 w-40 animate-pulse bg-[var(--df-paper)]" />
              <div className="mt-3 h-3 w-72 max-w-full animate-pulse bg-[var(--df-paper)]" />
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="h-72 animate-pulse bg-[var(--df-paper-2)]" />
          <div className="h-64 animate-pulse bg-[var(--df-paper-2)]" />
        </div>
      </div>
    </main>
  );
}
