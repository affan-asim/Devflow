"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BriefcaseBusiness,
  Building2,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleUserRound,
  Clock3,
  ExternalLink,
  FileClock,
  Globe2,
  Mail,
  MapPin,
  MessageSquare,
  RefreshCw,
  Send,
  ShieldCheck,
  UserRound,
  Users,
  X,
  XCircle,
} from "lucide-react";

import {
  clearCurrentCompany,
  fetchCompanyById,
} from "@/lib/redux/slices/companySlice";

import {
  createCompanyJoinRequest,
  fetchCompanyJoinRequests,
} from "@/lib/redux/slices/companyJoinRequestSlice";

function formatDate(value, includeDay = false) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    ...(includeDay ? { day: "numeric" } : {}),
    year: "numeric",
  }).format(date);
}

function formatDateTime(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function getInitials(name = "") {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "C"
  );
}

function getPersonName(person) {
  if (!person) return "Unknown";

  return (
    person.name ||
    person.user?.name ||
    person.profile?.name ||
    "Unknown"
  );
}

function CompanyLogo({ company }) {
  if (company?.logo) {
    return (
      <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden border border-[var(--df-line)] bg-[var(--df-paper-2)] sm:h-24 sm:w-24">
        <img
          src={company.logo}
          alt={`${company.name || "Company"} logo`}
          className="h-full w-full object-contain"
        />
      </div>
    );
  }

  return (
    <div className="flex h-20 w-20 shrink-0 items-center justify-center border border-[var(--df-line)] bg-[var(--df-paper-2)] text-lg font-semibold sm:h-24 sm:w-24">
      {getInitials(company?.name)}
    </div>
  );
}

function Metric({ value, label, icon: Icon }) {
  return (
    <div className="border-l border-[var(--df-line)] pl-4 first:border-l-0 first:pl-0">
      <div className="flex items-center gap-2">
        <Icon
          size={13}
          strokeWidth={1.5}
          className="text-[var(--df-muted)]"
        />

        <span className="text-[20px] font-semibold tracking-[-0.04em]">
          {value}
        </span>
      </div>

      <p className="mt-1 text-[9px] font-semibold uppercase tracking-[0.13em] text-[var(--df-muted)]">
        {label}
      </p>
    </div>
  );
}

function SectionTitle({
  eyebrow,
  title,
  description,
}) {
  return (
    <div className="mb-5">
      <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[var(--df-muted)]">
        {eyebrow}
      </p>

      <h2 className="mt-1 text-[16px] font-semibold tracking-[-0.025em]">
        {title}
      </h2>

      {description && (
        <p className="mt-1 max-w-2xl text-[10px] leading-5 text-[var(--df-muted)]">
          {description}
        </p>
      )}
    </div>
  );
}

function EmptyLine({ children }) {
  return (
    <div className="border-t border-[var(--df-line)] py-8 text-center">
      <p className="text-[10px] text-[var(--df-muted)]">
        {children}
      </p>
    </div>
  );
}

function RecruiterRow({ recruiter }) {
  const name = getPersonName(recruiter);

  const email =
    recruiter?.user?.email ||
    recruiter?.email ||
    recruiter?.profile?.user?.email;

  return (
    <div className="flex items-center gap-3 border-t border-[var(--df-line)] py-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center border border-[var(--df-line)] bg-[var(--df-paper-2)] text-[10px] font-semibold">
        {getInitials(name)}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-[11px] font-semibold">
          {name}
        </p>

        {email && (
          <p className="mt-1 flex items-center gap-1 truncate text-[9px] text-[var(--df-muted)]">
            <Mail size={10} />
            {email}
          </p>
        )}
      </div>

      {recruiter?.jobTitle && (
        <span className="hidden max-w-[130px] truncate text-[9px] font-medium text-[var(--df-muted)] sm:block">
          {recruiter.jobTitle}
        </span>
      )}
    </div>
  );
}

function EmploymentRow({ employment }) {
  const role =
    employment?.roleTitle ||
    employment?.position ||
    employment?.jobTitle ||
    "Recruiting role";

  const current =
    employment?.isCurrent ??
    employment?.current ??
    false;

  return (
    <div className="grid grid-cols-1 gap-3 border-t border-[var(--df-line)] py-4 sm:grid-cols-[1fr_auto] sm:items-center">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-[11px] font-semibold">
            {role}
          </p>

          <span
            className={`border px-2 py-0.5 text-[8px] font-semibold uppercase tracking-[0.1em] ${
              current
                ? "border-[var(--df-accent)] text-[var(--df-accent)]"
                : "border-[var(--df-line)] text-[var(--df-muted)]"
            }`}
          >
            {current ? "Current" : "Ended"}
          </span>
        </div>

        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-[9px] text-[var(--df-muted)]">
          {employment?.employmentType && (
            <span>
              {String(employment.employmentType).replaceAll(
                "_",
                " "
              )}
            </span>
          )}

          {employment?.startDate && (
            <span>
              {formatDate(employment.startDate)}
              {" — "}
              {current
                ? "Present"
                : formatDate(employment.endDate)}
            </span>
          )}
        </div>
      </div>

      {employment?.salary !== undefined &&
        employment?.salary !== null && (
          <p className="text-[10px] font-semibold">
            {employment.salary}
          </p>
        )}
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="min-h-screen animate-pulse">
      <div className="border-b border-[var(--df-line)]">
        <div className="mx-auto max-w-[1500px] px-4 py-8 sm:px-6 lg:px-10">
          <div className="h-2.5 w-24 bg-[var(--df-line)]" />

          <div className="mt-8 flex gap-5">
            <div className="h-24 w-24 bg-[var(--df-line)]" />

            <div className="flex-1">
              <div className="h-6 w-72 max-w-full bg-[var(--df-line)]" />
              <div className="mt-3 h-3 w-96 max-w-full bg-[var(--df-line)]" />
              <div className="mt-5 h-3 w-64 max-w-full bg-[var(--df-line)]" />
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1500px] space-y-7 px-4 py-8 sm:px-6 lg:px-10">
        <div className="h-28 border border-[var(--df-line)] bg-[var(--df-paper-2)]" />

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.45fr_0.75fr]">
          <div className="h-96 border border-[var(--df-line)] bg-[var(--df-paper-2)]" />
          <div className="h-96 border border-[var(--df-line)] bg-[var(--df-paper-2)]" />
        </div>
      </div>
    </div>
  );
}

function JoinRequestModal({
  company,
  message,
  setMessage,
  onClose,
  onSubmit,
  submitting,
  error,
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="join-request-title"
    >
      <div className="w-full max-w-xl border border-[var(--df-line)] bg-[var(--df-paper)] shadow-2xl">
        <div className="flex items-start justify-between border-b border-[var(--df-line)] px-5 py-5 sm:px-7">
          <div className="pr-6">
            <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[var(--df-accent)]">
              Introduce yourself
            </p>

            <h2
              id="join-request-title"
              className="mt-2 text-xl font-semibold tracking-[-0.03em]"
            >
              Send a join request
            </h2>

            <p className="mt-2 text-[11px] leading-5 text-[var(--df-muted)]">
              Tell {company?.name || "this company"} why your
              recruiting experience could be useful to their team.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="flex h-8 w-8 shrink-0 items-center justify-center border border-[var(--df-line)] text-[var(--df-muted)] hover:text-[var(--df-text)] disabled:opacity-50"
            aria-label="Close"
          >
            <X size={15} />
          </button>
        </div>

        <form onSubmit={onSubmit}>
          <div className="px-5 py-6 sm:px-7">
            <div className="border border-[var(--df-line)] bg-[var(--df-paper-2)] p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center border border-[var(--df-line)] bg-[var(--df-paper)]">
                  <UserRound size={15} />
                </div>

                <div>
                  <p className="text-[11px] font-semibold">
                    Your DevFlow recruiter profile is shared
                  </p>

                  <p className="mt-1 text-[9px] leading-5 text-[var(--df-muted)]">
                    The company can review your recruiter profile,
                    experience and other information available to
                    them before deciding.
                  </p>
                </div>
              </div>
            </div>

            <label className="mt-6 block">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-[0.1em]">
                  Your message
                </span>

                <span className="text-[9px] text-[var(--df-muted)]">
                  {message.length}/2000
                </span>
              </div>

              <textarea
                value={message}
                onChange={(event) =>
                  setMessage(event.target.value)
                }
                maxLength={2000}
                rows={8}
                autoFocus
                placeholder="Example: I’m an independent recruiter with experience sourcing frontend and full-stack engineers. I noticed your company is growing and I’d be interested in helping you build your recruiting pipeline..."
                className="mt-2 w-full resize-y border border-[var(--df-line)] bg-transparent px-4 py-3 text-[11px] leading-6 outline-none placeholder:text-[var(--df-muted)] focus:border-[var(--df-text)]"
              />
            </label>

            {error && (
              <div className="mt-4 border border-rose-200 bg-rose-50 px-4 py-3 text-[10px] leading-5 text-rose-700">
                {error}
              </div>
            )}
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-[var(--df-line)] px-5 py-4 sm:flex-row sm:items-center sm:justify-end sm:px-7">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="h-10 border border-[var(--df-line)] px-4 text-[10px] font-semibold disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex h-10 items-center justify-center gap-2 bg-[var(--df-text)] px-5 text-[10px] font-semibold text-[var(--df-paper)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Send size={13} />

              {submitting
                ? "Sending request..."
                : "Send join request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function IndependentRecruiterCompanyDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const dispatch = useDispatch();

  const {
    currentCompany,
    loadingDetail,
    errorDetail,
  } = useSelector((state) => state.company);

  const {
    requests: joinRequests,
    submitting: submittingJoinRequest,
    submitError: joinRequestError,
  } = useSelector((state) => state.companyJoinRequests);

  const currentUser = useSelector(
    (state) => state.auth.user
  );

  const [showJoinModal, setShowJoinModal] = useState(false);
  const [requestMessage, setRequestMessage] = useState("");
  const [requestSuccess, setRequestSuccess] = useState("");

  useEffect(() => {
    if (!id) return;

    dispatch(clearCurrentCompany());

    dispatch(fetchCompanyById(id));

    dispatch(
      fetchCompanyJoinRequests({
        type: "sent",
        companyId: id,
        page: 1,
        limit: 10,
      })
    );

    return () => {
      dispatch(clearCurrentCompany());
    };
  }, [dispatch, id]);

  const company = currentCompany;

  const existingJoinRequest = useMemo(
    () =>
      joinRequests.find(
        (request) => request.companyId === id
      ),
    [joinRequests, id]
  );

  const activeJoinRequest =
    existingJoinRequest?.status === "CANCELLED"
      ? null
      : existingJoinRequest;

  const recruiters = company?.recruiters || [];
  const jobs = company?.jobs || [];
  const employmentHistory =
    company?.employmentHistory || [];
  const recruiterHistory =
    company?.recruiterHistory || [];

  const activeJobs = useMemo(
    () =>
      jobs.filter((job) => {
        const status = String(
          job?.status || job?.jobStatus || ""
        ).toUpperCase();

        return (
          status === "ACTIVE" ||
          status === "OPEN" ||
          status === "PUBLISHED" ||
          !status
        );
      }),
    [jobs]
  );

  const isIndependentRecruiter = !currentUser?.recruiterProfile
    ?.companyId;

  const canRequestToJoin =
    Boolean(company?.isVerified) &&
    isIndependentRecruiter &&
    !activeJoinRequest;

  const handleCreateJoinRequest = async (event) => {
    event.preventDefault();

    if (!company?.id || submittingJoinRequest) return;

    const result = await dispatch(
      createCompanyJoinRequest({
        companyId: company.id,
        message: requestMessage.trim() || undefined,
      })
    );

    if (createCompanyJoinRequest.fulfilled.match(result)) {
      setRequestSuccess(
        "Your join request has been sent to the company owner."
      );

      setRequestMessage("");
      setShowJoinModal(false);

      // Refresh the request state so the CTA immediately changes.
      dispatch(
        fetchCompanyJoinRequests({
          type: "sent",
          companyId: company.id,
          page: 1,
          limit: 10,
        })
      );

      // Remove the success notice after a short period.
      window.setTimeout(() => {
        setRequestSuccess("");
      }, 5000);
    }
  };

  if (loadingDetail && !company) {
    return <DetailSkeleton />;
  }

  if (errorDetail && !company) {
    return (
      <div className="min-h-screen">
        <div className="mx-auto flex min-h-[70vh] max-w-xl items-center justify-center px-5">
          <div className="w-full border border-[var(--df-line)] p-8 text-center">
            <Building2
              size={24}
              strokeWidth={1.4}
              className="mx-auto text-[var(--df-muted)]"
            />

            <h1 className="mt-5 text-lg font-semibold">
              Company unavailable
            </h1>

            <p className="mt-2 text-[11px] leading-5 text-[var(--df-muted)]">
              {errorDetail ||
                "We could not load this company profile."}
            </p>

            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <button
                type="button"
                onClick={() =>
                  dispatch(fetchCompanyById(id))
                }
                className="inline-flex items-center gap-2 border border-[var(--df-text)] px-4 py-2.5 text-[10px] font-semibold hover:bg-[var(--df-text)] hover:text-[var(--df-paper)]"
              >
                <RefreshCw size={12} />
                Try again
              </button>

              <button
                type="button"
                onClick={() => router.back()}
                className="inline-flex items-center gap-2 border border-[var(--df-line)] px-4 py-2.5 text-[10px] font-semibold"
              >
                <ArrowLeft size={12} />
                Go back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!company) {
    return null;
  }

  const owner = company.owner;

  const website = company.websiteUrl
    ? company.websiteUrl.startsWith("http")
      ? company.websiteUrl
      : `https://${company.websiteUrl}`
    : null;

  return (
    <div className="min-h-screen bg-[var(--df-paper)] text-[var(--df-text)]">
      {/* Back */}
      <div className="border-b border-[var(--df-line)]">
        <div className="mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-10">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex h-12 items-center gap-2 text-[10px] font-semibold text-[var(--df-muted)] transition-colors hover:text-[var(--df-text)]"
          >
            <ArrowLeft size={13} />
            Back to companies
          </button>
        </div>
      </div>

      {/* Company identity */}
      <header className="border-b border-[var(--df-line)]">
        <div className="mx-auto max-w-[1500px] px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
          <div className="flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
            <div className="flex flex-col gap-5 sm:flex-row">
              <CompanyLogo company={company} />

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                  <h1 className="text-3xl font-semibold tracking-[-0.055em] sm:text-4xl">
                    {company.name}
                  </h1>

                  {company.isVerified && (
                    <span className="inline-flex items-center gap-1.5 border border-[var(--df-accent)] px-2.5 py-1 text-[8px] font-bold uppercase tracking-[0.13em] text-[var(--df-accent)]">
                      <Check size={11} strokeWidth={2.5} />
                      Verified
                    </span>
                  )}
                </div>

                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-[10px] text-[var(--df-muted)]">
                  {company.industry && (
                    <span>
                      {String(company.industry).replaceAll(
                        "_",
                        " "
                      )}
                    </span>
                  )}

                  {company.country && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin size={11} />
                      {company.country}
                    </span>
                  )}

                  {company.createdAt && (
                    <span>
                      On DevFlow since{" "}
                      {formatDate(company.createdAt)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {website && (
              <a
                href={website}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex h-10 items-center justify-center gap-2 border border-[var(--df-text)] px-4 text-[10px] font-semibold transition-colors hover:bg-[var(--df-text)] hover:text-[var(--df-paper)]"
              >
                <Globe2 size={13} />
                Visit website
                <ExternalLink size={11} />
              </a>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1500px] px-4 py-7 sm:px-6 lg:px-10 lg:py-9">
        {/* Join relationship banner */}
        <section className="border border-[var(--df-text)] bg-[var(--df-text)] text-[var(--df-paper)]">
          <div className="flex flex-col gap-6 px-5 py-6 sm:px-7 lg:flex-row lg:items-center lg:justify-between lg:py-7">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2">
                <Users
                  size={15}
                  strokeWidth={1.6}
                  className="opacity-70"
                />

                <p className="text-[9px] font-semibold uppercase tracking-[0.18em] opacity-60">
                  Recruiter opportunity
                </p>
              </div>

              <h2 className="mt-2 text-xl font-semibold tracking-[-0.025em]">
                Think you could help {company.name} recruit?
              </h2>

              <p className="mt-2 max-w-xl text-[10px] leading-5 opacity-70">
                Introduce yourself to the company owner. Share your
                recruiting experience and explain how you could help
                them source, screen, or build their hiring pipeline.
              </p>
            </div>

            <div className="shrink-0">
              {activeJoinRequest ? (
                <Link
                  href={`/dashboard/independent-recruiter/company-requests/${activeJoinRequest.id}`}
                  className="inline-flex min-h-10 items-center justify-center gap-2 border border-white/25 px-5 text-[10px] font-semibold transition-colors hover:bg-white/10"
                >
                  {activeJoinRequest.status === "PENDING" && (
                    <>
                      Request pending
                      <Clock3 size={13} />
                    </>
                  )}

                  {activeJoinRequest.status === "ACCEPTED" && (
                    <>
                      Request accepted
                      <CheckCircle2 size={13} />
                    </>
                  )}

                  {activeJoinRequest.status === "REJECTED" && (
                    <>
                      Request declined
                      <XCircle size={13} />
                    </>
                  )}

                  {activeJoinRequest.status === "CANCELLED" && (
                    <>
                      Request cancelled
                      <ArrowRight size={13} />
                    </>
                  )}
                </Link>
              ) : canRequestToJoin ? (
                <button
                  type="button"
                  onClick={() => setShowJoinModal(true)}
                  className="inline-flex min-h-10 items-center justify-center gap-2 bg-[var(--df-paper)] px-5 text-[10px] font-semibold text-[var(--df-text)] transition-opacity hover:opacity-90"
                >
                  Send join request
                  <Send size={13} />
                </button>
              ) : !company.isVerified ? (
                <div className="border border-white/20 px-5 py-3 text-[9px] leading-4 opacity-70">
                  Join requests are available for verified
                  companies only.
                </div>
              ) : !isIndependentRecruiter ? (
                <div className="border border-white/20 px-5 py-3 text-[9px] leading-4 opacity-70">
                  Your recruiter profile is already attached to a
                  company.
                </div>
              ) : null}
            </div>
          </div>
        </section>

        {/* Success message */}
        {requestSuccess && (
          <div className="mt-4 flex items-center gap-3 border border-emerald-200 bg-emerald-50 px-4 py-3 text-[10px] text-emerald-700">
            <CheckCircle2 size={15} />
            <span>{requestSuccess}</span>
          </div>
        )}

        {/* Overview metrics */}
        <section className="mt-7 border-y border-[var(--df-line)] py-5">
          <div className="grid grid-cols-2 gap-y-6 sm:grid-cols-4">
            <Metric
              value={jobs.length}
              label="Listed jobs"
              icon={BriefcaseBusiness}
            />

            <Metric
              value={activeJobs.length}
              label="Active positions"
              icon={Clock3}
            />

            <Metric
              value={recruiters.length}
              label="Recruiters"
              icon={Users}
            />

            <Metric
              value={employmentHistory.length}
              label="Employment records"
              icon={FileClock}
            />
          </div>
        </section>

        <div className="mt-9 grid grid-cols-1 gap-10 lg:grid-cols-[1.45fr_0.75fr]">
          {/* Main column */}
          <div className="min-w-0 space-y-10">
            {/* About company */}
            <section>
              <SectionTitle
                eyebrow="Company"
                title="About the organization"
                description="Understand the company before deciding whether your recruiting experience could be useful to them."
              />

              <div className="border-t border-[var(--df-line)] pt-5">
                {company.description ? (
                  <p className="max-w-3xl whitespace-pre-line text-[12px] leading-7 text-[var(--df-text)]">
                    {company.description}
                  </p>
                ) : company.about ? (
                  <p className="max-w-3xl whitespace-pre-line text-[12px] leading-7 text-[var(--df-text)]">
                    {company.about}
                  </p>
                ) : (
                  <EmptyLine>
                    This company has not added a public description yet.
                  </EmptyLine>
                )}
              </div>
            </section>

            {/* Hiring context */}
            <section id="open-positions">
              <SectionTitle
                eyebrow="Hiring context"
                title="What this company is hiring for"
                description="Open positions can help you understand where this company may currently need recruiting support."
              />

              {jobs.length > 0 ? (
                <div className="border-b border-[var(--df-line)]">
                  {jobs.map((job) => {
                    const title =
                      job?.title ||
                      job?.position ||
                      job?.roleTitle ||
                      "Untitled position";

                    const status =
                      job?.status ||
                      job?.jobStatus ||
                      null;

                    return (
                      <Link
                        key={job.id}
                        href={
                          job?.id
                            ? `/jobs/${job.id}`
                            : "#"
                        }
                        className="group flex items-center gap-4 border-t border-[var(--df-line)] py-4"
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center border border-[var(--df-line)]">
                          <BriefcaseBusiness
                            size={14}
                            strokeWidth={1.5}
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[11px] font-semibold group-hover:underline">
                            {title}
                          </p>

                          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[9px] text-[var(--df-muted)]">
                            {job?.location && (
                              <span className="inline-flex items-center gap-1">
                                <MapPin size={9} />
                                {job.location}
                              </span>
                            )}

                            {job?.employmentType && (
                              <span>
                                {String(
                                  job.employmentType
                                ).replaceAll("_", " ")}
                              </span>
                            )}
                          </div>
                        </div>

                        {status && (
                          <span className="hidden border border-[var(--df-line)] px-2 py-1 text-[8px] font-semibold uppercase tracking-[0.1em] text-[var(--df-muted)] sm:block">
                            {String(status).replaceAll(
                              "_",
                              " "
                            )}
                          </span>
                        )}

                        <ChevronRight
                          size={13}
                          className="shrink-0 text-[var(--df-muted)] transition-transform group-hover:translate-x-1"
                        />
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <EmptyLine>
                  This company has no public hiring activity right now.
                </EmptyLine>
              )}
            </section>

            {/* Why recruiters may be useful */}
            <section>
              <SectionTitle
                eyebrow="Recruiting relationship"
                title="Where you could add value"
                description="Your request is an introduction, not a job application."
              />

              <div className="grid border-y border-[var(--df-line)] sm:grid-cols-3">
                <div className="border-b border-[var(--df-line)] px-5 py-5 sm:border-b-0 sm:border-r">
                  <Send
                    size={17}
                    strokeWidth={1.5}
                    className="text-[var(--df-muted)]"
                  />

                  <h3 className="mt-4 text-[11px] font-semibold">
                    Introduce your expertise
                  </h3>

                  <p className="mt-2 text-[9px] leading-5 text-[var(--df-muted)]">
                    Explain what types of roles, candidates, or
                    recruiting workflows you know best.
                  </p>
                </div>

                <div className="border-b border-[var(--df-line)] px-5 py-5 sm:border-b-0 sm:border-r">
                  <Users
                    size={17}
                    strokeWidth={1.5}
                    className="text-[var(--df-muted)]"
                  />

                  <h3 className="mt-4 text-[11px] font-semibold">
                    Support their hiring
                  </h3>

                  <p className="mt-2 text-[9px] leading-5 text-[var(--df-muted)]">
                    Your role can potentially help with sourcing,
                    screening, pipeline building, or candidate
                    coordination.
                  </p>
                </div>

                <div className="px-5 py-5">
                  <ShieldCheck
                    size={17}
                    strokeWidth={1.5}
                    className="text-[var(--df-muted)]"
                  />

                  <h3 className="mt-4 text-[11px] font-semibold">
                    Join if there is a fit
                  </h3>

                  <p className="mt-2 text-[9px] leading-5 text-[var(--df-muted)]">
                    If the owner accepts your request, your recruiter
                    profile becomes attached to the company.
                  </p>
                </div>
              </div>
            </section>

            {/* Employment history */}
            <section>
              <SectionTitle
                eyebrow="Organization history"
                title="Employment footprint"
                description="Existing employment records associated with this company."
              />

              {employmentHistory.length > 0 ? (
                <div className="border-b border-[var(--df-line)]">
                  {employmentHistory.map((employment) => (
                    <EmploymentRow
                      key={employment.id}
                      employment={employment}
                    />
                  ))}
                </div>
              ) : (
                <EmptyLine>
                  No employment history is publicly available for this
                  organization.
                </EmptyLine>
              )}
            </section>

            {/* Recruiter history */}
            <section>
              <SectionTitle
                eyebrow="Recruiting history"
                title="Recruiter activity"
                description="Recruiter history associated with this organization."
              />

              {recruiterHistory.length > 0 ? (
                <div className="border-b border-[var(--df-line)]">
                  {recruiterHistory.map((history) => {
                    const recruiterName = getPersonName(
                      history?.recruiter ||
                        history?.profile ||
                        history
                    );

                    return (
                      <div
                        key={history.id}
                        className="flex items-center gap-4 border-t border-[var(--df-line)] py-4"
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center border border-[var(--df-line)] bg-[var(--df-paper-2)] text-[10px] font-semibold">
                          {getInitials(recruiterName)}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="text-[11px] font-semibold">
                            {recruiterName}
                          </p>

                          <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-[9px] text-[var(--df-muted)]">
                            {history?.roleTitle && (
                              <span>
                                {history.roleTitle}
                              </span>
                            )}

                            {history?.startDate && (
                              <span>
                                {formatDate(
                                  history.startDate,
                                  true
                                )}
                              </span>
                            )}
                          </div>
                        </div>

                        {history?.isCurrent !== undefined && (
                          <span
                            className={`border px-2 py-1 text-[8px] font-semibold uppercase tracking-[0.1em] ${
                              history.isCurrent
                                ? "border-[var(--df-accent)] text-[var(--df-accent)]"
                                : "border-[var(--df-line)] text-[var(--df-muted)]"
                            }`}
                          >
                            {history.isCurrent
                              ? "Current"
                              : "Former"}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <EmptyLine>
                  No recruiter history is available for this company.
                </EmptyLine>
              )}
            </section>
          </div>

          {/* Sidebar */}
          <aside className="space-y-8">
            {/* Primary recruiter CTA */}
            <section className="border border-[var(--df-text)] bg-[var(--df-text)] p-5 text-[var(--df-paper)]">
              <p className="text-[9px] font-semibold uppercase tracking-[0.18em] opacity-60">
                Independent recruiter
              </p>

              <h3 className="mt-2 text-[17px] font-semibold tracking-[-0.025em]">
                Interested in joining their recruiting team?
              </h3>

              <p className="mt-2 text-[10px] leading-5 opacity-70">
                Send the company owner a short introduction. Your
                DevFlow recruiter profile is available for them to
                review with your request.
              </p>

              {activeJoinRequest ? (
                <Link
                  href={`/dashboard/independent-recruiter/company-requests/${activeJoinRequest.id}`}
                  className="mt-5 flex h-10 items-center justify-between border border-white/20 px-3 text-[9px] font-semibold transition-colors hover:bg-white/10"
                >
                  <span>
                    {activeJoinRequest.status === "PENDING"
                      ? "View pending request"
                      : activeJoinRequest.status ===
                        "ACCEPTED"
                      ? "View accepted request"
                      : activeJoinRequest.status ===
                        "REJECTED"
                      ? "View declined request"
                      : "View request"}
                  </span>

                  <ArrowRight size={12} />
                </Link>
              ) : canRequestToJoin ? (
                <button
                  type="button"
                  onClick={() => setShowJoinModal(true)}
                  className="mt-5 flex h-10 w-full items-center justify-between bg-[var(--df-paper)] px-3 text-[9px] font-semibold text-[var(--df-text)] transition-opacity hover:opacity-90"
                >
                  <span>Send join request</span>
                  <Send size={12} />
                </button>
              ) : (
                <div className="mt-5 border border-white/20 px-3 py-3 text-[9px] leading-5 opacity-70">
                  {!company.isVerified
                    ? "This company must be verified before independent recruiters can send join requests."
                    : "Your recruiter profile is already attached to a company."}
                </div>
              )}
            </section>

            {/* Company facts */}
            <section>
              <SectionTitle
                eyebrow="At a glance"
                title="Company facts"
              />

              <div className="border-t border-[var(--df-line)]">
                <div className="flex items-start justify-between gap-5 border-b border-[var(--df-line)] py-4">
                  <span className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[var(--df-muted)]">
                    Industry
                  </span>

                  <span className="max-w-[55%] text-right text-[10px] font-medium">
                    {company.industry
                      ? String(company.industry).replaceAll(
                          "_",
                          " "
                        )
                      : "Not specified"}
                  </span>
                </div>

                <div className="flex items-start justify-between gap-5 border-b border-[var(--df-line)] py-4">
                  <span className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[var(--df-muted)]">
                    Country
                  </span>

                  <span className="max-w-[55%] text-right text-[10px] font-medium">
                    {company.country || "Not specified"}
                  </span>
                </div>

                <div className="flex items-start justify-between gap-5 border-b border-[var(--df-line)] py-4">
                  <span className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[var(--df-muted)]">
                    Verification
                  </span>

                  <span
                    className={`inline-flex items-center gap-1 text-[9px] font-semibold ${
                      company.isVerified
                        ? "text-[var(--df-accent)]"
                        : "text-[var(--df-muted)]"
                    }`}
                  >
                    {company.isVerified && (
                      <ShieldCheck size={11} />
                    )}

                    {company.isVerified
                      ? "Verified"
                      : "Unverified"}
                  </span>
                </div>

                <div className="flex items-start justify-between gap-5 border-b border-[var(--df-line)] py-4">
                  <span className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[var(--df-muted)]">
                    Joined DevFlow
                  </span>

                  <span className="text-right text-[10px] font-medium">
                    {formatDate(company.createdAt)}
                  </span>
                </div>

                {website && (
                  <div className="flex items-start justify-between gap-5 py-4">
                    <span className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[var(--df-muted)]">
                      Website
                    </span>

                    <a
                      href={website}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="inline-flex max-w-[55%] items-center gap-1 truncate text-right text-[10px] font-medium hover:underline"
                    >
                      {company.websiteUrl}
                      <ExternalLink
                        size={10}
                        className="shrink-0"
                      />
                    </a>
                  </div>
                )}
              </div>
            </section>

            {/* Owner */}
            <section>
              <SectionTitle
                eyebrow="Leadership"
                title="Company owner"
                description="The person responsible for reviewing independent recruiter requests."
              />

              {owner ? (
                <div className="border-t border-[var(--df-line)] pt-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center border border-[var(--df-line)] bg-[var(--df-paper-2)] text-[11px] font-semibold">
                      {getInitials(getPersonName(owner))}
                    </div>

                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold">
                        {getPersonName(owner)}
                      </p>

                      {owner?.user?.email && (
                        <p className="mt-1 flex items-center gap-1 text-[9px] text-[var(--df-muted)]">
                          <Mail size={9} />
                          {owner.user.email}
                        </p>
                      )}
                    </div>
                  </div>

                  <p className="mt-4 text-[9px] leading-5 text-[var(--df-muted)]">
                    Your join request will be reviewed by this
                    company owner.
                  </p>
                </div>
              ) : (
                <EmptyLine>
                  Owner information is unavailable.
                </EmptyLine>
              )}
            </section>

            {/* Recruiting team */}
            <section>
              <SectionTitle
                eyebrow="People"
                title="Recruiting team"
                description={`${recruiters.length} recruiter${
                  recruiters.length === 1 ? "" : "s"
                } currently associated with this company.`}
              />

              {recruiters.length > 0 ? (
                <div>
                  {recruiters.map((recruiter) => (
                    <RecruiterRow
                      key={recruiter.id}
                      recruiter={recruiter}
                    />
                  ))}
                </div>
              ) : (
                <EmptyLine>
                  No recruiters are currently listed.
                </EmptyLine>
              )}
            </section>

            {/* What happens after request */}
            <section className="border-t border-[var(--df-line)] pt-6">
              <div className="flex gap-3">
                <MessageSquare
                  size={15}
                  className="mt-0.5 shrink-0 text-[var(--df-muted)]"
                />

                <div>
                  <p className="text-[11px] font-semibold">
                    What happens after you send it?
                  </p>

                  <ol className="mt-3 space-y-3">
                    <li className="flex gap-2.5 text-[9px] leading-5 text-[var(--df-muted)]">
                      <span className="font-semibold text-[var(--df-text)]">
                        01
                      </span>
                      The company owner receives your request.
                    </li>

                    <li className="flex gap-2.5 text-[9px] leading-5 text-[var(--df-muted)]">
                      <span className="font-semibold text-[var(--df-text)]">
                        02
                      </span>
                      They review your recruiter profile and message.
                    </li>

                    <li className="flex gap-2.5 text-[9px] leading-5 text-[var(--df-muted)]">
                      <span className="font-semibold text-[var(--df-text)]">
                        03
                      </span>
                      If they accept, your recruiter profile becomes
                      attached to the company.
                    </li>
                  </ol>
                </div>
              </div>
            </section>

            {/* Data note */}
            <div className="flex gap-3 border-t border-[var(--df-line)] pt-5">
              <CircleUserRound
                size={14}
                className="mt-0.5 shrink-0 text-[var(--df-muted)]"
              />

              <p className="text-[9px] leading-5 text-[var(--df-muted)]">
                Company information is provided by DevFlow and may
                change as the organization updates its profile,
                recruiters, jobs, and employment records.
              </p>
            </div>
          </aside>
        </div>
      </main>

      {/* Join request modal */}
      {showJoinModal && (
        <JoinRequestModal
          company={company}
          message={requestMessage}
          setMessage={setRequestMessage}
          onClose={() => {
            if (!submittingJoinRequest) {
              setShowJoinModal(false);
              setRequestMessage("");
            }
          }}
          onSubmit={handleCreateJoinRequest}
          submitting={submittingJoinRequest}
          error={joinRequestError}
        />
      )}
    </div>
  );
}