"use client";

import Link from "next/link";
import { useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowLeft,
  ArrowUpRight,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock3,
  ExternalLink,
  History,
  Mail,
  MapPin,
  ShieldCheck,
  UserRound,
  Users,
  Globe2,
  RefreshCcw,
} from "lucide-react";

import {
  fetchRecruiterHistoryDetail,
  clearSelectedHistory,
} from "@/lib/redux/slices/recruiterHistorySlice";

function formatDate(value, fallback = "—") {
  if (!value) return fallback;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return fallback;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function formatMonthYear(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
  }).format(date);
}

function getCompany(history) {
  return (
    history?.company ||
    history?.recruiter?.company ||
    null
  );
}

function getCompanyName(history) {
  return (
    getCompany(history)?.name ||
    history?.companyName ||
    "Company"
  );
}

function getRole(history) {
  return (
    history?.jobTitle ||
    history?.roleTitle ||
    history?.position ||
    history?.recruiter?.jobTitle ||
    "Recruiter"
  );
}

function getUserName(history) {
  return (
    history?.recruiter?.user?.name ||
    history?.user?.name ||
    "Recruiter"
  );
}

function getInitials(value) {
  if (!value) return "CO";

  return value
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

export default function RecruiterHistoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useDispatch();

  const id = params?.id;

  const {
    selectedHistory,
    loadingDetail,
    errorDetail,
  } = useSelector((state) => state.recruiterHistory);

  useEffect(() => {
    if (!id) return;

    dispatch(fetchRecruiterHistoryDetail(id));

    return () => {
      dispatch(clearSelectedHistory());
    };
  }, [dispatch, id]);

  const company = useMemo(
    () => getCompany(selectedHistory),
    [selectedHistory]
  );

  const companyName = getCompanyName(selectedHistory);
  const role = getRole(selectedHistory);

  if (loadingDetail && !selectedHistory) {
    return <DetailSkeleton />;
  }

  if (errorDetail) {
    return (
      <DetailError
        message={errorDetail}
        onRetry={() => {
          if (id) {
            dispatch(fetchRecruiterHistoryDetail(id));
          }
        }}
        onBack={() => router.push(
          "/dashboard/independent-recruiter/recruiter-history"
        )}
      />
    );
  }

  if (!selectedHistory) {
    return (
      <DetailError
        message="This recruiter history record could not be found."
        onRetry={() => {
          if (id) {
            dispatch(fetchRecruiterHistoryDetail(id));
          }
        }}
        onBack={() => router.push(
          "/dashboard/independent-recruiter/recruiter-history"
        )}
      />
    );
  }

  const isCurrent = Boolean(selectedHistory.isCurrent);

  const events = Array.isArray(selectedHistory.recruiterEvents)
    ? selectedHistory.recruiterEvents
    : [];

  const website =
    company?.websiteUrl ||
    selectedHistory.companyWebsite ||
    null;

  return (
    <main className="min-h-screen bg-[var(--df-paper)] text-[var(--df-text)]">
      <div className="mx-auto w-full max-w-[1300px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {/* Back */}
        <Link
          href="/dashboard/independent-recruiter/recruiter-history"
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--df-muted)] transition hover:text-[var(--df-text)]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Recruiter history
        </Link>

        {/* Hero */}
        <header className="mt-8 border-y border-[var(--df-line)] py-7 sm:py-9">
          <div className="flex flex-col gap-7 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex min-w-0 gap-4 sm:gap-5">
              <CompanyLogo
                logo={company?.logo}
                name={companyName}
              />

              <div className="min-w-0">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] ${
                      isCurrent
                        ? "text-[var(--df-text)]"
                        : "text-[var(--df-muted)]"
                    }`}
                  >
                    {isCurrent ? (
                      <Clock3 className="h-3.5 w-3.5" />
                    ) : (
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    )}

                    {isCurrent ? "Current position" : "Previous position"}
                  </span>

                  {selectedHistory.recruiter?.user?.isVerified && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--df-muted)]">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      Verified profile
                    </span>
                  )}
                </div>

                <h1 className="max-w-3xl text-2xl font-semibold tracking-[-0.035em] sm:text-3xl lg:text-4xl">
                  {role}
                </h1>

                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-[var(--df-muted)]">
                  <span className="inline-flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5" />
                    {companyName}
                  </span>

                  {company?.country && (
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5" />
                      {company.country}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {website && (
              <a
                href={website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-10 shrink-0 items-center justify-center gap-2 border border-[var(--df-line)] px-4 text-sm font-medium transition hover:border-[var(--df-text)]"
              >
                <Globe2 className="h-3.5 w-3.5" />
                Company website
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
        </header>

        {/* Main content */}
        <div className="grid gap-10 py-8 lg:grid-cols-[minmax(0,1fr)_330px]">
          <div className="min-w-0">
            {/* Position overview */}
            <section>
              <SectionHeading
                eyebrow="Position"
                title="Employment overview"
              />

              <div className="mt-5 grid border-y border-[var(--df-line)] sm:grid-cols-2">
                <InfoCell
                  icon={BriefcaseBusiness}
                  label="Role"
                  value={role}
                />

                <InfoCell
                  icon={Building2}
                  label="Company"
                  value={companyName}
                />

                <InfoCell
                  icon={CalendarDays}
                  label="Started"
                  value={formatDate(
                    selectedHistory.startDate
                  )}
                />

                <InfoCell
                  icon={CalendarDays}
                  label="Ended"
                  value={
                    isCurrent
                      ? "Present"
                      : formatDate(selectedHistory.endDate)
                  }
                />

                {selectedHistory.location && (
                  <InfoCell
                    icon={MapPin}
                    label="Location"
                    value={selectedHistory.location}
                  />
                )}

                {selectedHistory.employmentType && (
                  <InfoCell
                    icon={Users}
                    label="Employment type"
                    value={selectedHistory.employmentType}
                  />
                )}

                {selectedHistory.department && (
                  <InfoCell
                    icon={BriefcaseBusiness}
                    label="Department"
                    value={selectedHistory.department}
                  />
                )}
              </div>
            </section>

            {/* Description */}
            {(selectedHistory.description ||
              selectedHistory.summary ||
              selectedHistory.notes) && (
              <section className="mt-12">
                <SectionHeading
                  eyebrow="Context"
                  title="Role details"
                />

                <div className="mt-5 max-w-3xl">
                  <p className="whitespace-pre-line text-sm leading-7 text-[var(--df-muted)]">
                    {selectedHistory.description ||
                      selectedHistory.summary ||
                      selectedHistory.notes}
                  </p>
                </div>
              </section>
            )}

            {/* Events */}
            {events.length > 0 && (
              <section className="mt-12">
                <SectionHeading
                  eyebrow="Activity"
                  title="Recruiter history events"
                />

                <div className="mt-6 border-l border-[var(--df-line)] pl-5">
                  {events.map((event, index) => (
                    <EventItem
                      key={event.id || index}
                      event={event}
                      isLast={index === events.length - 1}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <aside className="lg:border-l lg:border-[var(--df-line)] lg:pl-8">
            <div className="lg:sticky lg:top-8">
              <section>
                <SectionHeading
                  eyebrow="Record"
                  title="History information"
                />

                <div className="mt-5 divide-y divide-[var(--df-line)] border-y border-[var(--df-line)]">
                  <SideInfo
                    label="Status"
                    value={isCurrent ? "Currently active" : "Former position"}
                  />

                  <SideInfo
                    label="Created"
                    value={formatDate(selectedHistory.createdAt)}
                  />

                  {selectedHistory.updatedAt && (
                    <SideInfo
                      label="Last recorded"
                      value={formatDate(selectedHistory.updatedAt)}
                    />
                  )}
                </div>
              </section>

              {/* Recruiter */}
              {selectedHistory.recruiter && (
                <section className="mt-10">
                  <SectionHeading
                    eyebrow="Profile"
                    title="Recruiter"
                  />

                  <div className="mt-5 border-y border-[var(--df-line)] py-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center border border-[var(--df-line)]">
                        <UserRound className="h-4 w-4 text-[var(--df-muted)]" />
                      </div>

                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold">
                          {getUserName(selectedHistory)}
                        </div>

                        {selectedHistory.recruiter.jobTitle && (
                          <div className="mt-1 text-xs text-[var(--df-muted)]">
                            {selectedHistory.recruiter.jobTitle}
                          </div>
                        )}
                      </div>
                    </div>

                    {selectedHistory.recruiter.user?.email && (
                      <a
                        href={`mailto:${selectedHistory.recruiter.user.email}`}
                        className="mt-4 flex items-center gap-2 text-xs text-[var(--df-muted)] transition hover:text-[var(--df-text)]"
                      >
                        <Mail className="h-3.5 w-3.5" />
                        {selectedHistory.recruiter.user.email}
                      </a>
                    )}
                  </div>
                </section>
              )}

              {/* Company */}
              {company && (
                <section className="mt-10">
                  <SectionHeading
                    eyebrow="Organization"
                    title="Company"
                  />

                  <div className="mt-5 border-y border-[var(--df-line)] py-5">
                    <div className="flex items-center gap-3">
                      <CompanyLogo
                        logo={company.logo}
                        name={companyName}
                        size="small"
                      />

                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold">
                          {companyName}
                        </div>

                        {company.industry && (
                          <div className="mt-1 text-xs text-[var(--df-muted)]">
                            {company.industry}
                          </div>
                        )}
                      </div>
                    </div>

                    {company.country && (
                      <div className="mt-4 flex items-center gap-2 text-xs text-[var(--df-muted)]">
                        <MapPin className="h-3.5 w-3.5" />
                        {company.country}
                      </div>
                    )}

                    {website && (
                      <a
                        href={website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 flex items-center gap-2 text-xs font-medium underline underline-offset-4"
                      >
                        Visit website
                        <ArrowUpRight className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </section>
              )}
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

/* =========================================================
   COMPONENTS
========================================================= */

function SectionHeading({ eyebrow, title }) {
  return (
    <div>
      <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--df-muted)]">
        {eyebrow}
      </div>

      <h2 className="mt-1.5 text-lg font-semibold tracking-[-0.02em]">
        {title}
      </h2>
    </div>
  );
}

function InfoCell({ icon: Icon, label, value }) {
    return (
      <div className="flex min-h-[86px] items-start gap-3 border-b border-[var(--df-line)] p-4">
        <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[var(--df-muted)]" />
  
        <div className="min-w-0">
          <div className="text-[10px] font-semibold uppercase tracking-[0.13em] text-[var(--df-muted)]">
            {label}
          </div>
  
          <div className="mt-1.5 break-words text-sm font-medium">
            {value || "—"}
          </div>
        </div>
      </div>
    );
  }

function SideInfo({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 py-4">
      <span className="text-xs text-[var(--df-muted)]">
        {label}
      </span>

      <span className="text-right text-xs font-medium">
        {value}
      </span>
    </div>
  );
}

function EventItem({ event, isLast }) {
  const title =
    event.title ||
    event.eventType ||
    event.type ||
    "Recruiter activity";

  const description =
    event.description ||
    event.message ||
    event.notes ||
    null;

  return (
    <div className={`relative ${isLast ? "" : "pb-8"}`}>
      <span className="absolute -left-[25px] top-1.5 h-2.5 w-2.5 border border-[var(--df-text)] bg-[var(--df-paper)]" />

      <div className="flex flex-col gap-1">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-sm font-semibold">
            {title}
          </h3>

          <span className="text-[11px] text-[var(--df-muted)]">
            {formatDate(event.createdAt)}
          </span>
        </div>

        {description && (
          <p className="max-w-2xl text-sm leading-6 text-[var(--df-muted)]">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}

function CompanyLogo({ logo, name, size = "large" }) {
  const dimensions =
    size === "small"
      ? "h-10 w-10"
      : "h-14 w-14 sm:h-16 sm:w-16";

  return (
    <div
      className={`flex ${dimensions} shrink-0 items-center justify-center overflow-hidden border border-[var(--df-line)]`}
    >
      {logo ? (
        <img
          src={logo}
          alt=""
          className="h-full w-full object-contain"
          loading="lazy"
          referrerPolicy="no-referrer"
        />
      ) : (
        <span className="text-xs font-semibold text-[var(--df-muted)]">
          {getInitials(name)}
        </span>
      )}
    </div>
  );
}

/* =========================================================
   LOADING
========================================================= */

function DetailSkeleton() {
  return (
    <main className="min-h-screen bg-[var(--df-paper)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1300px]">
        <div className="h-3 w-32 animate-pulse bg-[var(--df-line)]/50" />

        <div className="mt-8 border-y border-[var(--df-line)] py-9">
          <div className="flex gap-5">
            <div className="h-16 w-16 animate-pulse bg-[var(--df-line)]/50" />

            <div>
              <div className="h-3 w-24 animate-pulse bg-[var(--df-line)]/50" />
              <div className="mt-3 h-8 w-72 animate-pulse bg-[var(--df-line)]/50" />
              <div className="mt-3 h-3 w-48 animate-pulse bg-[var(--df-line)]/50" />
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_330px]">
          <div>
            <div className="h-5 w-36 animate-pulse bg-[var(--df-line)]/50" />
            <div className="mt-5 h-48 animate-pulse border-y border-[var(--df-line)] bg-[var(--df-line)]/10" />
          </div>

          <div className="h-48 animate-pulse border-y border-[var(--df-line)] bg-[var(--df-line)]/10" />
        </div>
      </div>
    </main>
  );
}

/* =========================================================
   ERROR
========================================================= */

function DetailError({ message, onRetry, onBack }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--df-paper)] px-5 text-[var(--df-text)]">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center border border-[var(--df-line)]">
          <History className="h-5 w-5 text-[var(--df-muted)]" />
        </div>

        <h1 className="mt-5 text-lg font-semibold">
          Unable to load this history record
        </h1>

        <p className="mt-2 text-sm leading-6 text-[var(--df-muted)]">
          {message}
        </p>

        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex h-10 items-center justify-center gap-2 border border-[var(--df-text)] px-4 text-sm font-medium transition hover:bg-[var(--df-text)] hover:text-[var(--df-paper)]"
          >
            <RefreshCcw className="h-3.5 w-3.5" />
            Try again
          </button>

          <button
            type="button"
            onClick={onBack}
            className="inline-flex h-10 items-center justify-center gap-2 border border-[var(--df-line)] px-4 text-sm font-medium"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to history
          </button>
        </div>
      </div>
    </main>
  );
}