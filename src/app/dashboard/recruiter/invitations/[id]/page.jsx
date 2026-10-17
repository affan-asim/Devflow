"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowLeft,
  Mail,
  UserRound,
  Building2,
  BriefcaseBusiness,
  CalendarDays,
  Clock3,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ShieldCheck,
  Send,
  ExternalLink,
  CircleDot,
  LoaderCircle,
} from "lucide-react";

import {
  fetchRecruiterInvitationById,
  clearCurrentRecruiterInvitation,
} from "@/lib/redux/slices/recruiterInvitationSlice";

function getStatusLabel(status) {
  if (!status) return "Unknown";

  return status
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/^\w/, (char) => char.toUpperCase());
}

function getStatusTone(status) {
  switch (status) {
    case "PENDING":
      return "border-[var(--df-accent)] text-[var(--df-accent)]";

    case "ACCEPTED":
      return "border-[var(--df-accent)] text-[var(--df-accent)]";

    case "REJECTED":
      return "border-[var(--df-line)] text-[var(--df-muted)]";

    case "EXPIRED":
      return "border-[var(--df-line)] text-[var(--df-muted)]";

    default:
      return "border-[var(--df-line)] text-[var(--df-muted)]";
  }
}

function getStatusIcon(status) {
  switch (status) {
    case "ACCEPTED":
      return <CheckCircle2 size={18} />;

    case "REJECTED":
      return <XCircle size={18} />;

    case "EXPIRED":
      return <AlertCircle size={18} />;

    case "PENDING":
      return <Clock3 size={18} />;

    default:
      return <CircleDot size={18} />;
  }
}

function formatDate(value, includeTime = false) {
  if (!value) return "Not available";

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    ...(includeTime
      ? {
          hour: "numeric",
          minute: "2-digit",
        }
      : {}),
  }).format(new Date(value));
}

function formatMoney(value, currency) {
  if (value === null || value === undefined || value === "") {
    return "Not specified";
  }

  const numericValue = Number(value);

  if (Number.isNaN(numericValue)) {
    return `${value} ${currency || ""}`.trim();
  }

  try {
    return new Intl.NumberFormat("en", {
      style: "currency",
      currency: currency || "USD",
      maximumFractionDigits: 0,
    }).format(numericValue);
  } catch {
    return `${currency || ""} ${numericValue}`.trim();
  }
}

function formatEmploymentType(value) {
  if (!value) return "Not specified";

  return value
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/^\w/, (char) => char.toUpperCase());
}

export default function RecruiterInvitationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useDispatch();

  const invitationId = params?.id;

  const {
    currentInvitation,
    loadingDetail,
    errorDetail,
  } = useSelector((state) => state.recruiterInvitations);

  useEffect(() => {
    if (!invitationId) return;

    dispatch(clearCurrentRecruiterInvitation());
    dispatch(fetchRecruiterInvitationById(invitationId));

    return () => {
      dispatch(clearCurrentRecruiterInvitation());
    };
  }, [dispatch, invitationId]);

  if (loadingDetail) {
    return <InvitationDetailSkeleton />;
  }

  if (errorDetail) {
    return (
      <main className="min-h-screen bg-[var(--df-paper)] text-[var(--df-text)]">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => router.back()}
            className="mb-8 inline-flex items-center gap-2 text-sm text-[var(--df-muted)] hover:text-[var(--df-text)]"
          >
            <ArrowLeft size={16} />
            Back to invitations
          </button>

          <div className="border border-[var(--df-line)] p-8">
            <AlertCircle size={22} />

            <h1 className="mt-5 text-xl font-semibold">
              Invitation unavailable
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--df-muted)]">
              {errorDetail}
            </p>

            <Link
              href="/dashboard/recruiter/invitations"
              className="mt-6 inline-flex items-center gap-2 border border-[var(--df-text)] px-4 py-2.5 text-sm font-medium"
            >
              <ArrowLeft size={15} />
              View invitations
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (!currentInvitation) return null;

  const invitation = currentInvitation;
  const recruiter = invitation.recruiter;
  const recruiterUser = recruiter?.user;

  const company = invitation.company;

  const invitedBy = invitation.invitedBy;
  const invitedByUser = invitedBy?.user;

  return (
    <main className="min-h-screen bg-[var(--df-paper)] text-[var(--df-text)]">
      <div className="mx-auto max-w-[1250px] px-4 py-8 sm:px-6 lg:px-8">
        {/* Back */}
        <button
          type="button"
          onClick={() => router.back()}
          className="mb-8 inline-flex items-center gap-2 text-sm text-[var(--df-muted)] hover:text-[var(--df-text)]"
        >
          <ArrowLeft size={16} />
          Back to invitations
        </button>

        {/* Header */}
        <header className="border-b border-[var(--df-line)] pb-8">
          <div className="flex flex-col gap-7 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.15em] text-[var(--df-muted)]">
                <Mail size={14} />
                Recruiter invitation
              </div>

              <h1 className="mt-4 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">
                {invitation.roleTitle || "Recruiter invitation"}
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--df-muted)]">
                Invitation sent to {invitation.invitedEmail}.
              </p>
            </div>

            <div
              className={`inline-flex items-center gap-2 self-start border px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] ${getStatusTone(
                invitation.status
              )}`}
            >
              {getStatusIcon(invitation.status)}
              {getStatusLabel(invitation.status)}
            </div>
          </div>
        </header>

        <div className="grid gap-10 py-10 lg:grid-cols-[minmax(0,1fr)_330px]">
          {/* Main */}
          <div className="space-y-10">
            {/* Invitation overview */}
            <section>
              <SectionHeading>Invitation overview</SectionHeading>

              <div className="mt-5 grid gap-px border border-[var(--df-line)] bg-[var(--df-line)] sm:grid-cols-2">
                <InfoCell
                  icon={<Mail size={17} />}
                  label="Invited email"
                  value={invitation.invitedEmail}
                />

                <InfoCell
                  icon={<BriefcaseBusiness size={17} />}
                  label="Role title"
                  value={invitation.roleTitle}
                />

                <InfoCell
                  icon={<BriefcaseBusiness size={17} />}
                  label="Employment type"
                  value={formatEmploymentType(
                    invitation.employmentType
                  )}
                />

                <InfoCell
                  icon={<CalendarDays size={17} />}
                  label="Created"
                  value={formatDate(invitation.createdAt, true)}
                />

                <InfoCell
                  icon={<Clock3 size={17} />}
                  label="Expires"
                  value={formatDate(invitation.expiresAt, true)}
                />

                <InfoCell
                  icon={<ShieldCheck size={17} />}
                  label="Invitation ID"
                  value={invitation.id}
                />
              </div>
            </section>

            {/* Compensation */}
            <section>
              <SectionHeading>Compensation</SectionHeading>

              <div className="mt-5 grid gap-px border border-[var(--df-line)] bg-[var(--df-line)] sm:grid-cols-2">
                <InfoCell
                  label="Salary"
                  value={formatMoney(
                    invitation.salary,
                    invitation.currency
                  )}
                />

                <InfoCell
                  label="Currency"
                  value={invitation.currency || "Not specified"}
                />
              </div>
            </section>

            {/* Description */}
            <section>
              <SectionHeading>Invitation description</SectionHeading>

              <div className="mt-5">
                {invitation.description ? (
                  <div className="border border-[var(--df-line)] p-6">
                    <p className="whitespace-pre-line text-[15px] leading-7 text-[var(--df-text)]">
                      {invitation.description}
                    </p>
                  </div>
                ) : (
                  <div className="border border-dashed border-[var(--df-line)] p-6 text-sm text-[var(--df-muted)]">
                    No description was included with this invitation.
                  </div>
                )}
              </div>
            </section>

            {/* Recruiter */}
            <section>
              <SectionHeading>Recruiter</SectionHeading>

              <div className="mt-5 border border-[var(--df-line)] p-5">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center border border-[var(--df-line)] bg-[#eeeae2]">
                      {recruiterUser?.name ? (
                        recruiterUser.name
                          .split(" ")
                          .slice(0, 2)
                          .map((part) => part[0])
                          .join("")
                          .toUpperCase()
                      ) : (
                        <UserRound size={19} />
                      )}
                    </div>

                    <div>
                      <p className="font-semibold">
                        {recruiterUser?.name ||
                          "Recruiter has not claimed this invitation"}
                      </p>

                      <p className="mt-1 text-sm text-[var(--df-muted)]">
                        {recruiterUser?.email ||
                          invitation.invitedEmail}
                      </p>
                    </div>
                  </div>

                  {recruiter?.id && (
                    <Link
                      href={`/dashboard/recruiter/profiles/${recruiter.id}`}
                      className="inline-flex items-center gap-2 text-sm font-medium hover:opacity-60"
                    >
                      View profile
                      <ExternalLink size={15} />
                    </Link>
                  )}
                </div>
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <aside className="space-y-5">
            {/* Company */}
            <div className="border border-[var(--df-line)]">
              <div className="border-b border-[var(--df-line)] px-5 py-4">
                <h2 className="text-sm font-semibold">
                  Company
                </h2>
              </div>

              <div className="p-5">
                {company ? (
                  <div>
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center border border-[var(--df-line)] bg-[#eeeae2]">
                        {company.logo ? (
                          <img
                            src={company.logo}
                            alt=""
                            className="h-full w-full object-contain"
                          />
                        ) : (
                          <Building2 size={18} />
                        )}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">
                          {company.name}
                        </p>

                        {company.isVerified && (
                          <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--df-accent)]">
                            <CheckCircle2 size={12} />
                            Verified company
                          </span>
                        )}
                      </div>
                    </div>

                    <Link
                      href={`/dashboard/company/${company.id}`}
                      className="mt-5 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.08em] hover:opacity-60"
                    >
                      View company
                      <ExternalLink size={14} />
                    </Link>
                  </div>
                ) : (
                  <p className="text-sm text-[var(--df-muted)]">
                    Company information unavailable.
                  </p>
                )}
              </div>
            </div>

            {/* Invited by */}
            <div className="border border-[var(--df-line)]">
              <div className="border-b border-[var(--df-line)] px-5 py-4">
                <h2 className="text-sm font-semibold">
                  Invited by
                </h2>
              </div>

              <div className="p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center border border-[var(--df-line)] bg-[#eeeae2]">
                    <UserRound size={17} />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {invitedByUser?.name ||
                        "Unknown recruiter"}
                    </p>

                    <p className="mt-1 truncate text-xs text-[var(--df-muted)]">
                      {invitedByUser?.email ||
                        "Email unavailable"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="border border-[var(--df-line)]">
              <div className="border-b border-[var(--df-line)] px-5 py-4">
                <h2 className="text-sm font-semibold">
                  Timeline
                </h2>
              </div>

              <div className="space-y-5 p-5">
                <TimelineItem
                  label="Invitation created"
                  value={formatDate(invitation.createdAt, true)}
                  active
                />

                <TimelineItem
                  label="Invitation expires"
                  value={formatDate(invitation.expiresAt, true)}
                  active={invitation.status === "PENDING"}
                />

                <TimelineItem
                  label="Current status"
                  value={getStatusLabel(invitation.status)}
                  active
                />
              </div>
            </div>

            {/* Current capabilities */}
            <div className="border border-[var(--df-line)] p-5">
              <div className="flex items-start gap-3">
                <ShieldCheck
                  size={18}
                  className="mt-0.5 shrink-0"
                />

                <div>
                  <h3 className="text-sm font-semibold">
                    Invitation record
                  </h3>

                  <p className="mt-2 text-xs leading-5 text-[var(--df-muted)]">
                    This page reflects the invitation state returned by
                    the server. No client-side status is inferred or
                    overwritten.
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

function SectionHeading({ children }) {
  return (
    <div className="border-b border-[var(--df-line)] pb-3">
      <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--df-muted)]">
        {children}
      </h2>
    </div>
  );
}

function InfoCell({ icon, label, value }) {
  return (
    <div className="bg-[var(--df-paper)] p-5">
      <div className="flex items-center gap-2 text-[var(--df-muted)]">
        {icon}

        <span className="text-[10px] font-semibold uppercase tracking-[0.12em]">
          {label}
        </span>
      </div>

      <p className="mt-3 break-words text-sm font-medium">
        {value || "Not specified"}
      </p>
    </div>
  );
}

function TimelineItem({ label, value, active }) {
  return (
    <div className="flex gap-3">
      <div
        className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
          active
            ? "bg-[var(--df-accent)]"
            : "bg-[var(--df-muted)]"
        }`}
      />

      <div>
        <p className="text-xs font-medium">{label}</p>
        <p className="mt-1 text-xs leading-5 text-[var(--df-muted)]">
          {value}
        </p>
      </div>
    </div>
  );
}

function InvitationDetailSkeleton() {
  return (
    <main className="min-h-screen bg-[var(--df-paper)]">
      <div className="mx-auto max-w-[1250px] animate-pulse px-4 py-8 sm:px-6 lg:px-8">
        <div className="h-4 w-32 bg-[#e9e5dd]" />

        <div className="mt-8 border-b border-[var(--df-line)] pb-8">
          <div className="h-3 w-36 bg-[#e9e5dd]" />
          <div className="mt-4 h-9 w-72 bg-[#e9e5dd]" />
          <div className="mt-4 h-4 w-96 max-w-full bg-[#e9e5dd]" />
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_330px]">
          <div className="space-y-8">
            <div className="h-48 bg-[#e9e5dd]" />
            <div className="h-32 bg-[#e9e5dd]" />
            <div className="h-40 bg-[#e9e5dd]" />
          </div>

          <div className="space-y-5">
            <div className="h-48 bg-[#e9e5dd]" />
            <div className="h-32 bg-[#e9e5dd]" />
            <div className="h-48 bg-[#e9e5dd]" />
          </div>
        </div>
      </div>
    </main>
  );
}