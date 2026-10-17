"use client";

import { useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowLeft,
  ArrowUpRight,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  Check,
  ExternalLink,
  Globe2,
  MapPin,
  Pencil,
  ShieldCheck,
  Users,
} from "lucide-react";
import { clearCurrentCompany,fetchCompanyById } from "@/lib/redux/slices/companySlice";


function formatDate(date) {
  if (!date) return "—";

  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

function StatusBadge({ verified }) {
  if (verified) {
    return (
      <span className="inline-flex items-center gap-1.5 border border-[var(--df-line)] bg-[var(--df-text)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--df-paper)]">
        <Check size={11} strokeWidth={2.5} />
        Verified
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 border border-[var(--df-line)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--df-muted)]">
      <span className="h-1.5 w-1.5 rounded-full bg-[var(--df-muted)]" />
      Unverified
    </span>
  );
}

function DetailItem({ icon: Icon, label, value, href }) {
  return (
    <div className="flex gap-3 border-b border-[var(--df-line)] py-4 last:border-b-0">
      <div className="mt-0.5 shrink-0 text-[var(--df-muted)]">
        <Icon size={17} strokeWidth={1.6} />
      </div>

      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--df-muted)]">
          {label}
        </p>

        {href ? (
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            className="mt-1 inline-flex max-w-full items-center gap-1.5 truncate text-sm font-medium text-[var(--df-text)] underline decoration-[var(--df-line)] underline-offset-4 transition hover:decoration-[var(--df-text)]"
          >
            <span className="truncate">{value}</span>
            <ExternalLink size={13} className="shrink-0" />
          </a>
        ) : (
          <p className="mt-1 truncate text-sm font-medium text-[var(--df-text)]">
            {value || "Not provided"}
          </p>
        )}
      </div>
    </div>
  );
}

function Metric({ value, label, icon: Icon }) {
  return (
    <div className="border border-[var(--df-line)] bg-[var(--df-paper)] p-5">
      <div className="flex items-start justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--df-muted)]">
          {label}
        </span>

        <Icon
          size={17}
          strokeWidth={1.5}
          className="text-[var(--df-muted)]"
        />
      </div>

      <p className="mt-5 text-2xl font-semibold tracking-tight text-[var(--df-text)]">
        {value}
      </p>
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--df-muted)]">
        {children}
      </span>

      <div className="h-px flex-1 bg-[var(--df-line)]" />
    </div>
  );
}

function CompanySkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-4 w-24 bg-[var(--df-line)]" />

      <div className="mt-8 h-10 w-72 bg-[var(--df-line)]" />
      <div className="mt-4 h-4 w-96 max-w-full bg-[var(--df-line)]" />

      <div className="mt-10 grid gap-4 md:grid-cols-3">
        <div className="h-28 border border-[var(--df-line)]" />
        <div className="h-28 border border-[var(--df-line)]" />
        <div className="h-28 border border-[var(--df-line)]" />
      </div>
    </div>
  );
}

export default function CompanyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useDispatch();

  const {
    currentCompany,
    loadingDetail,
    errorDetail,
  } = useSelector((state) => state.company);

  const {
    user,
    isAuthenticated,
    isInitialized,
  } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!user?.recruiterProfile?.companyId) return;

    dispatch(fetchCompanyById(user?.recruiterProfile?.companyId));

    return () => {
      dispatch(clearCurrentCompany());
    };
  }, [dispatch, user]);

  /*
   * Your company API returns the owner.
   *
   * Depending on your exact Prisma serialization, this may be:
   *
   * company.owner.id
   * company.owner.userId
   * company.ownerId
   *
   * The comparison below supports all three without making the UI
   * dependent on one exact response shape.
   */
  const ownerId = useMemo(() => {
    if (!currentCompany) return null;

    return (
      currentCompany.owner?.userId ||
      currentCompany.owner?.id ||
      currentCompany.ownerId ||
      currentCompany.userId ||
      null
    );
  }, [currentCompany]);

  const authenticatedUserId = user?.id || user?.userId || null;

  const isOwner =
    Boolean(isAuthenticated) &&
    Boolean(isInitialized) &&
    Boolean(authenticatedUserId) &&
    Boolean(ownerId) &&
    String(authenticatedUserId) === String(ownerId);

  const jobs = currentCompany?.jobs || [];
  const recruiters = currentCompany?.recruiters || [];
  const employmentHistory = currentCompany?.employmentHistory || [];
  const recruiterHistory = currentCompany?.recruiterHistory || [];

  const activeJobs = jobs.filter(
    (job) =>
      job?.status === "ACTIVE" ||
      job?.status === "PUBLISHED"
  );

  if (loadingDetail || !isInitialized) {
    return (
      <main className="min-h-screen bg-[var(--df-paper)] text-[var(--df-text)]">
        <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10">
          <button
            onClick={() => router.back()}
            className="mb-10 inline-flex items-center gap-2 text-xs font-medium text-[var(--df-muted)] transition hover:text-[var(--df-text)]"
          >
            <ArrowLeft size={15} />
            Back
          </button>

          <CompanySkeleton />
        </div>
      </main>
    );
  }

  if (errorDetail) {
    return (
      <main className="min-h-screen bg-[var(--df-paper)] text-[var(--df-text)]">
        <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-xs font-medium text-[var(--df-muted)] transition hover:text-[var(--df-text)]"
          >
            <ArrowLeft size={15} />
            Back
          </button>

          <div className="mt-20 max-w-xl">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--df-muted)]">
              Company
            </p>

            <h1 className="mt-4 text-3xl font-semibold tracking-tight">
              Unable to load company
            </h1>

            <p className="mt-3 text-sm leading-6 text-[var(--df-muted)]">
              {errorDetail}
            </p>

            <button
              onClick={() => dispatch(fetchCompanyById(user?.recruiterProfile?.companyId))}
              className="mt-7 border border-[var(--df-text)] bg-[var(--df-text)] px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--df-paper)] transition hover:opacity-90"
            >
              Try again
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (!currentCompany) {
    return (
      <main className="min-h-screen bg-[var(--df-paper)] text-[var(--df-text)]">
        <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-xs font-medium text-[var(--df-muted)]"
          >
            <ArrowLeft size={15} />
            Back
          </button>

          <div className="py-24 text-center">
            <Building2
              size={34}
              strokeWidth={1.2}
              className="mx-auto text-[var(--df-muted)]"
            />

            <h1 className="mt-5 text-2xl font-semibold">
              Company not found
            </h1>

            <p className="mt-2 text-sm text-[var(--df-muted)]">
              This company may have been removed or is no longer available.
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--df-paper)] text-[var(--df-text)]">
      <div className="mx-auto max-w-7xl px-5 py-7 sm:px-8 lg:px-10">
        {/* =========================================
            TOP NAV
        ========================================= */}
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={() => router.back()}
            className="group inline-flex items-center gap-2 text-xs font-medium text-[var(--df-muted)] transition hover:text-[var(--df-text)]"
          >
            <ArrowLeft
              size={15}
              className="transition-transform group-hover:-translate-x-0.5"
            />
            Back
          </button>

          {isOwner && (
            <button
              onClick={() =>
                router.push(`/dashboard/recruiter/company/${currentCompany.id}/edit`)
              }
              className="inline-flex cursor-pointer items-center gap-2 border border-[var(--df-line)] bg-[var(--df-paper)] px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.1em] text-[var(--df-text)] transition hover:border-[var(--df-text)]"
            >
              <Pencil size={14} strokeWidth={1.8} />
              Edit company
            </button>
          )}
        </div>

        {/* =========================================
            HERO
        ========================================= */}
        <section className="mt-10 border-b border-[var(--df-line)] pb-10">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--df-muted)]">
                  Company profile
                </p>

                <StatusBadge verified={currentCompany.isVerified} />
              </div>

              <div className="mt-6 flex items-start gap-5">
                {/* Company logo */}
                <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden border border-[var(--df-line)] bg-white">
                  {currentCompany.logo ? (
                    <img
                      src={currentCompany.logo}
                      alt={currentCompany.name}
                      className="h-full w-full object-contain p-3"
                    />
                  ) : (
                    <Building2
                      size={30}
                      strokeWidth={1.2}
                      className="text-[var(--df-muted)]"
                    />
                  )}
                </div>

                <div className="min-w-0">
                  <h1 className="max-w-4xl text-3xl font-semibold tracking-[-0.03em] sm:text-4xl lg:text-5xl">
                    {currentCompany.name}
                  </h1>

                  <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-[var(--df-muted)]">
                    {currentCompany.industry && (
                      <span className="inline-flex items-center gap-1.5">
                        <BriefcaseBusiness size={14} />
                        {currentCompany.industry}
                      </span>
                    )}

                    {currentCompany.country && (
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin size={14} />
                        {currentCompany.country}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:text-right">
              <p className="text-[10px] font-semibold uppercase tracking-[0.17em] text-[var(--df-muted)]">
                Member since
              </p>

              <p className="mt-2 text-sm font-medium">
                {formatDate(currentCompany.createdAt)}
              </p>
            </div>
          </div>
        </section>

        {/* =========================================
            METRICS
        ========================================= */}
        <section className="grid gap-px border border-[var(--df-line)] bg-[var(--df-line)] sm:grid-cols-2 lg:grid-cols-4">
          <Metric
            value={jobs.length}
            label="Jobs posted"
            icon={BriefcaseBusiness}
          />

          <Metric
            value={activeJobs.length}
            label="Active jobs"
            icon={ArrowUpRight}
          />

          <Metric
            value={recruiters.length}
            label="Recruiters"
            icon={Users}
          />

          <Metric
            value={employmentHistory.length}
            label="Hires"
            icon={CalendarDays}
          />
        </section>

        {/* =========================================
            MAIN CONTENT
        ========================================= */}
        <div className="mt-12 grid gap-12 lg:grid-cols-[minmax(0,1fr)_340px]">
          {/* LEFT */}
          <div className="min-w-0 space-y-12">
            {/* About */}
            <section>
              <SectionLabel>About the company</SectionLabel>

              {currentCompany.description ? (
                <p className="max-w-3xl whitespace-pre-line text-[15px] leading-7 text-[var(--df-text)]">
                  {currentCompany.description}
                </p>
              ) : (
                <p className="text-sm text-[var(--df-muted)]">
                  No company description has been added yet.
                </p>
              )}
            </section>

            {/* Jobs */}
            <section>
              <SectionLabel>Openings</SectionLabel>

              {jobs.length > 0 ? (
                <div className="divide-y divide-[var(--df-line)] border-y border-[var(--df-line)]">
                  {jobs.map((job) => (
                    <button
                      key={job.id}
                      onClick={() =>
                        router.push(`/dashboard/recruiter/jobs/${job.id}`)
                      }
                      className="group flex w-full items-center justify-between gap-6 py-5 text-left transition hover:bg-black/[0.02]"
                    >
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="truncate text-sm font-semibold text-[var(--df-text)]">
                            {job.title}
                          </h3>

                          {job.status && (
                            <span className="border border-[var(--df-line)] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-[var(--df-muted)]">
                              {job.status}
                            </span>
                          )}
                        </div>

                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--df-muted)]">
                          {job.employmentType && (
                            <span>{job.employmentType}</span>
                          )}

                          {job.locationPreference && (
                            <span>{job.locationPreference}</span>
                          )}

                          {job.experienceLevel && (
                            <span>{job.experienceLevel}</span>
                          )}
                        </div>
                      </div>

                      <ArrowUpRight
                        size={17}
                        strokeWidth={1.5}
                        className="shrink-0 text-[var(--df-muted)] transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--df-text)]"
                      />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="border border-dashed border-[var(--df-line)] px-6 py-10 text-center">
                  <BriefcaseBusiness
                    size={24}
                    strokeWidth={1.3}
                    className="mx-auto text-[var(--df-muted)]"
                  />

                  <p className="mt-3 text-sm font-medium">
                    No jobs posted yet
                  </p>

                  <p className="mt-1 text-xs text-[var(--df-muted)]">
                    This company has not published any openings.
                  </p>
                </div>
              )}
            </section>

            {/* Recruiters */}
            <section>
              <SectionLabel>Recruiting team</SectionLabel>

              {recruiters.length > 0 ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {recruiters.map((recruiter) => (
                    <div
                      key={recruiter.id}
                      className="border border-[var(--df-line)] p-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center border border-[var(--df-line)] bg-black/[0.025]">
                          <Users
                            size={17}
                            strokeWidth={1.4}
                            className="text-[var(--df-muted)]"
                          />
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold">
                            {recruiter.user?.name || recruiter.name || recruiter.fullName || recruiter.email || "Recruiter"}
                          </p>

                          {recruiter.jobTitle && (
                            <p className="mt-0.5 truncate text-xs text-[var(--df-muted)]">
                              {recruiter.jobTitle}
                            </p>
                          )}
                          {(recruiter.user?.email || recruiter.email) && (
                            <p className="mt-0.5 truncate text-xs text-[var(--df-muted)]">
                              {recruiter.user?.email || recruiter.email}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[var(--df-muted)]">
                  No recruiter information available.
                </p>
              )}
            </section>

            {/* Employment */}
            <section>
              <SectionLabel>Employment history</SectionLabel>

              {employmentHistory.length > 0 ? (
                <div className="divide-y divide-[var(--df-line)] border-y border-[var(--df-line)]">
                  {employmentHistory.map((employment) => (
                    <div
                      key={employment.id}
                      className="flex flex-col gap-2 py-5 sm:flex-row sm:items-start sm:justify-between"
                    >
                      <div>
                        <p className="text-sm font-semibold">
                          {employment.roleTitle || "Position"}
                        </p>

                        {employment.developer?.user?.name && (
                          <p className="mt-1 text-sm text-[var(--df-muted)]">
                            {employment.developer.user.name}
                          </p>
                        )}

                        {employment.employmentType && (
                          <p className="mt-1 text-xs text-[var(--df-muted)]">
                            {employment.employmentType}
                          </p>
                        )}
                      </div>

                      <div className="text-left sm:text-right">
                        <p className="text-xs font-medium">
                          {formatDate(employment.startDate)}
                        </p>

                        <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-[var(--df-muted)]">
                          {employment.isCurrent
                            ? "Current"
                            : "Past employment"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[var(--df-muted)]">
                  No employment history available.
                </p>
              )}
            </section>
          </div>

          {/* RIGHT SIDEBAR */}
          <aside className="lg:sticky lg:top-6 lg:self-start">
            <div className="border border-[var(--df-line)]">
              {/* Company facts */}
              <div className="border-b border-[var(--df-line)] p-5">
                <div className="flex items-center gap-2">
                  <Building2
                    size={16}
                    strokeWidth={1.5}
                    className="text-[var(--df-muted)]"
                  />

                  <p className="text-[10px] font-semibold uppercase tracking-[0.17em] text-[var(--df-muted)]">
                    Company details
                  </p>
                </div>

                <div className="mt-4">
                  <DetailItem
                    icon={BriefcaseBusiness}
                    label="Industry"
                    value={currentCompany.industry}
                  />

                  <DetailItem
                    icon={MapPin}
                    label="Country"
                    value={currentCompany.country}
                  />

                  <DetailItem
                    icon={Globe2}
                    label="Website"
                    value={currentCompany.websiteUrl}
                    href={currentCompany.websiteUrl}
                  />

                  <DetailItem
                    icon={CalendarDays}
                    label="Founded / joined"
                    value={formatDate(currentCompany.createdAt)}
                  />
                </div>
              </div>

              {/* Verification */}
              <div className="border-b border-[var(--df-line)] p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center border border-[var(--df-line)]">
                    <ShieldCheck
                      size={17}
                      strokeWidth={1.5}
                      className="text-[var(--df-muted)]"
                    />
                  </div>

                  <div>
                    <p className="text-sm font-semibold">
                      {currentCompany.isVerified
                        ? "Verified company"
                        : "Verification pending"}
                    </p>

                    <p className="mt-1 text-xs leading-5 text-[var(--df-muted)]">
                      {currentCompany.isVerified
                        ? "This company has been verified on DevFlow."
                        : "This company has not been verified yet."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Owner-only panel */}
              {isOwner && (
                <div className="bg-black/[0.025] p-5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.17em] text-[var(--df-muted)]">
                    Owner access
                  </p>

                  <p className="mt-2 text-sm font-medium">
                    You manage this company
                  </p>

                  <p className="mt-1 text-xs leading-5 text-[var(--df-muted)]">
                    You can update the company name, logo, website, industry,
                    and country.
                  </p>

                  <button
                    onClick={() =>
                      router.push(
                        `/dashboard/recruiter/company/${currentCompany.id}/edit`
                      )
                    }
                    className="mt-5 cursor-pointer flex w-full items-center justify-center gap-2 bg-[var(--df-text)] px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.1em] text-[var(--df-paper)] transition hover:opacity-90"
                  >
                    <Pencil size={14} />
                    Edit company
                  </button>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
