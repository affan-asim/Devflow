"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowLeft,
  ArrowUpRight,
  BriefcaseBusiness,
  Building2,
  CalendarClock,
  Check,
  CheckCircle2,
  Clock3,
  ExternalLink,
  Globe2,
  Mail,
  MapPin,
  ShieldCheck,
  UserRound,
  X,
  XCircle,
  AlertTriangle,
  RefreshCcw,
} from "lucide-react";

import {
  fetchRecruiterInvitationById,
  respondToRecruiterInvitation,
  clearCurrentRecruiterInvitation,
} from "@/lib/redux/slices/recruiterInvitationSlice";

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function formatDateTime(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function formatMoney(value, currency) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return String(value);
  }

  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${amount.toLocaleString()} ${currency || ""}`.trim();
  }
}

function isInvitationExpired(invitation) {
  if (!invitation?.expiresAt) return false;

  return new Date(invitation.expiresAt).getTime() <= Date.now();
}

function getCompanyName(invitation) {
  return (
    invitation?.company?.name ||
    invitation?.companyName ||
    "Company"
  );
}

function getRole(invitation) {
  return (
    invitation?.roleTitle ||
    invitation?.role ||
    "Recruiter"
  );
}

function getInviter(invitation) {
  return (
    invitation?.invitedBy?.user ||
    invitation?.invitedBy ||
    null
  );
}

function getInitials(value) {
  if (!value) return "CO";

  return value
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export default function RecruiterInvitationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useDispatch();

  const id = params?.id;

  const {
    currentInvitation,
    loadingDetail,
    submitting,
    errorDetail,
    submitError,
  } = useSelector((state) => state.recruiterInvitations);

  const [confirmAction, setConfirmAction] = useState(null);

  useEffect(() => {
    if (!id) return;

    dispatch(fetchRecruiterInvitationById(id));

    return () => {
      dispatch(clearCurrentRecruiterInvitation());
    };
  }, [dispatch, id]);

  const company = useMemo(
    () => currentInvitation?.company || null,
    [currentInvitation]
  );

  if (loadingDetail && !currentInvitation) {
    return <InvitationDetailSkeleton />;
  }

  if (errorDetail) {
    return (
      <InvitationDetailError
        message={errorDetail}
        onRetry={() => {
          if (id) {
            dispatch(fetchRecruiterInvitationById(id));
          }
        }}
        onBack={() =>
          router.push(
            "/dashboard/independent-recruiter/invitations"
          )
        }
      />
    );
  }

  if (!currentInvitation) {
    return (
      <InvitationDetailError
        message="This invitation could not be found."
        onRetry={() => {
          if (id) {
            dispatch(fetchRecruiterInvitationById(id));
          }
        }}
        onBack={() =>
          router.push(
            "/dashboard/independent-recruiter/invitations"
          )
        }
      />
    );
  }

  const companyName = getCompanyName(currentInvitation);
  const role = getRole(currentInvitation);
  const inviter = getInviter(currentInvitation);

  const pending =
    currentInvitation.status === "PENDING";

  const expired =
    pending && isInvitationExpired(currentInvitation);

  const canRespond = pending && !expired;

  const salary = formatMoney(
    currentInvitation.salary,
    currentInvitation.currency
  );

  const handleResponse = async (status) => {
    if (!id || !canRespond) return;

    const result = await dispatch(
      respondToRecruiterInvitation({
        id,
        status,
      })
    );

    if (
      respondToRecruiterInvitation.fulfilled.match(result)
    ) {
      setConfirmAction(null);

      /*
       * Keep the recruiter on the detail page so they get
       * immediate confirmation of the state change.
       *
       * The backend has already performed the actual
       * company attachment/history creation.
       */

      router.replace("/dashboard/recruiter")
      return;
    }

    setConfirmAction(null);
  };

  return (
    <main className="min-h-screen bg-[var(--df-paper)] text-[var(--df-text)]">
      <div className="mx-auto w-full max-w-[1300px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <Link
          href="/dashboard/independent-recruiter/invitations"
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--df-muted)] transition hover:text-[var(--df-text)]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Company invitations
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
                  {company?.isVerified && (
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em]">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      Verified company
                    </span>
                  )}

                  <StatusBadge
                    status={currentInvitation.status}
                    expired={expired}
                  />
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

            {company?.websiteUrl && (
              <a
                href={company.websiteUrl}
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

        {/* Expiration notice */}
        {expired && (
          <div className="flex items-start gap-3 border-b border-[var(--df-line)] py-4">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--df-muted)]" />

            <div>
              <div className="text-sm font-medium">
                This invitation has expired.
              </div>

              <p className="mt-1 text-xs leading-5 text-[var(--df-muted)]">
                The company invitation can no longer be accepted or declined.
              </p>
            </div>
          </div>
        )}

        {/* Response error */}
        {submitError && (
          <div className="flex items-start gap-3 border-b border-[var(--df-line)] py-4">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />

            <div>
              <div className="text-sm font-medium">
                We couldn't update this invitation.
              </div>

              <p className="mt-1 text-xs leading-5 text-[var(--df-muted)]">
                {submitError}
              </p>
            </div>
          </div>
        )}

        <div className="grid gap-10 py-8 lg:grid-cols-[minmax(0,1fr)_330px]">
          {/* Main */}
          <div className="min-w-0">
            <section>
              <SectionHeading
                eyebrow="Opportunity"
                title="Invitation details"
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
                  icon={CalendarClock}
                  label="Invited"
                  value={formatDate(currentInvitation.createdAt)}
                />

                <InfoCell
                  icon={Clock3}
                  label="Expires"
                  value={formatDate(currentInvitation.expiresAt)}
                />

                {currentInvitation.employmentType && (
                  <InfoCell
                    icon={BriefcaseBusiness}
                    label="Employment type"
                    value={currentInvitation.employmentType}
                  />
                )}

                {currentInvitation.location && (
                  <InfoCell
                    icon={MapPin}
                    label="Location"
                    value={currentInvitation.location}
                  />
                )}

                {salary && (
                  <InfoCell
                    icon={BriefcaseBusiness}
                    label="Compensation"
                    value={salary}
                  />
                )}

                {currentInvitation.currency &&
                  !currentInvitation.salary && (
                    <InfoCell
                      icon={BriefcaseBusiness}
                      label="Currency"
                      value={currentInvitation.currency}
                    />
                  )}
              </div>
            </section>

            {/* Description */}
            {currentInvitation.description && (
              <section className="mt-12">
                <SectionHeading
                  eyebrow="Message"
                  title="About this opportunity"
                />

                <p className="mt-5 max-w-3xl whitespace-pre-line text-sm leading-7 text-[var(--df-muted)]">
                  {currentInvitation.description}
                </p>
              </section>
            )}

            {/* Decision */}
            {canRespond && (
              <section className="mt-12 border-y border-[var(--df-line)] py-7">
                <div className="max-w-2xl">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--df-muted)]">
                    Your decision
                  </div>

                  <h2 className="mt-1.5 text-lg font-semibold">
                    Do you want to join {companyName}?
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-[var(--df-muted)]">
                    Accepting this invitation will attach your recruiter
                    profile to this company and create a current recruiter
                    history record.
                  </p>
                </div>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() =>
                      setConfirmAction("ACCEPTED")
                    }
                    className="inline-flex h-11 items-center justify-center gap-2 bg-[var(--df-text)] px-5 text-sm font-medium text-[var(--df-paper)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Check className="h-4 w-4" />
                    Accept invitation
                  </button>

                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() =>
                      setConfirmAction("REJECTED")
                    }
                    className="inline-flex h-11 items-center justify-center gap-2 border border-[var(--df-line)] px-5 text-sm font-medium transition hover:border-[var(--df-text)] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <X className="h-4 w-4" />
                    Decline invitation
                  </button>
                </div>
              </section>
            )}

            {/* Final state */}
            {!canRespond && !expired && (
              <section className="mt-12 border-y border-[var(--df-line)] py-7">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />

                  <div>
                    <h2 className="text-sm font-semibold">
                      {currentInvitation.status === "ACCEPTED"
                        ? "You accepted this invitation"
                        : "You declined this invitation"}
                    </h2>

                    <p className="mt-1 text-sm leading-6 text-[var(--df-muted)]">
                      This invitation has already been processed and
                      cannot be changed.
                    </p>
                  </div>
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <aside className="lg:border-l lg:border-[var(--df-line)] lg:pl-8">
            <div className="lg:sticky lg:top-8">
              {/* Inviter */}
              <section>
                <SectionHeading
                  eyebrow="Invitation"
                  title="Sent by"
                />

                <div className="mt-5 border-y border-[var(--df-line)] py-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center border border-[var(--df-line)]">
                      <UserRound className="h-4 w-4 text-[var(--df-muted)]" />
                    </div>

                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold">
                        {inviter?.name || "Company owner"}
                      </div>

                      {inviter?.email && (
                        <div className="mt-1 truncate text-xs text-[var(--df-muted)]">
                          {inviter.email}
                        </div>
                      )}
                    </div>
                  </div>

                  {inviter?.email && (
                    <a
                      href={`mailto:${inviter.email}`}
                      className="mt-4 inline-flex items-center gap-2 text-xs text-[var(--df-muted)] underline underline-offset-4 transition hover:text-[var(--df-text)]"
                    >
                      <Mail className="h-3.5 w-3.5" />
                      Contact owner
                    </a>
                  )}
                </div>
              </section>

              {/* Company */}
              <section className="mt-10">
                <SectionHeading
                  eyebrow="Organization"
                  title="Company"
                />

                <div className="mt-5 border-y border-[var(--df-line)] py-5">
                  <div className="flex items-center gap-3">
                    <CompanyLogo
                      logo={company?.logo}
                      name={companyName}
                      size="small"
                    />

                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold">
                        {companyName}
                      </div>

                      {company?.industry && (
                        <div className="mt-1 text-xs text-[var(--df-muted)]">
                          {company.industry}
                        </div>
                      )}
                    </div>
                  </div>

                  {company?.country && (
                    <div className="mt-4 flex items-center gap-2 text-xs text-[var(--df-muted)]">
                      <MapPin className="h-3.5 w-3.5" />
                      {company.country}
                    </div>
                  )}

                  {company?.websiteUrl && (
                    <a
                      href={company.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium underline underline-offset-4"
                    >
                      Visit company website
                      <ArrowUpRight className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </section>

              {/* Record */}
              <section className="mt-10">
                <SectionHeading
                  eyebrow="Record"
                  title="Invitation information"
                />

                <div className="mt-5 divide-y divide-[var(--df-line)] border-y border-[var(--df-line)]">
                  <SideInfo
                    label="Status"
                    value={
                      expired
                        ? "Expired"
                        : currentInvitation.status
                    }
                  />

                  <SideInfo
                    label="Received"
                    value={formatDateTime(
                      currentInvitation.createdAt
                    )}
                  />

                  <SideInfo
                    label="Expires"
                    value={formatDateTime(
                      currentInvitation.expiresAt
                    )}
                  />
                </div>
              </section>
            </div>
          </aside>
        </div>
      </div>

      {confirmAction && (
        <ConfirmationDialog
          action={confirmAction}
          companyName={companyName}
          submitting={submitting}
          onCancel={() => setConfirmAction(null)}
          onConfirm={() =>
            handleResponse(confirmAction)
          }
        />
      )}
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

function StatusBadge({ status, expired }) {
  if (expired) {
    return (
      <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--df-muted)]">
        <Clock3 className="h-3.5 w-3.5" />
        Expired
      </span>
    );
  }

  const config = {
    PENDING: {
      icon: Clock3,
      label: "Pending",
    },
    ACCEPTED: {
      icon: CheckCircle2,
      label: "Accepted",
    },
    REJECTED: {
      icon: XCircle,
      label: "Declined",
    },
    EXPIRED: {
      icon: Clock3,
      label: "Expired",
    },
  };

  const current = config[status] || config.PENDING;
  const Icon = current.icon;

  return (
    <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--df-muted)]">
      <Icon className="h-3.5 w-3.5" />
      {current.label}
    </span>
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

function ConfirmationDialog({
  action,
  companyName,
  submitting,
  onCancel,
  onConfirm,
}) {
  const accepting = action === "ACCEPTED";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="invitation-confirm-title"
    >
      <div className="w-full max-w-md border border-[var(--df-line)] bg-[var(--df-paper)] p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-[var(--df-line)]">
            {accepting ? (
              <Check className="h-4 w-4" />
            ) : (
              <X className="h-4 w-4" />
            )}
          </div>

          <div>
            <h2
              id="invitation-confirm-title"
              className="text-base font-semibold"
            >
              {accepting
                ? "Accept this invitation?"
                : "Decline this invitation?"}
            </h2>

            <p className="mt-2 text-sm leading-6 text-[var(--df-muted)]">
              {accepting
                ? `Accepting will attach your recruiter profile to ${companyName} and create your current employment history.`
                : `Declining will notify the company owner that you do not want to join ${companyName}.`}
            </p>
          </div>
        </div>

        <div className="mt-7 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            disabled={submitting}
            onClick={onCancel}
            className="h-10 border border-[var(--df-line)] px-4 text-sm font-medium transition hover:border-[var(--df-text)] disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={submitting}
            onClick={onConfirm}
            className={`h-10 px-4 text-sm font-medium ${
              accepting
                ? "bg-[var(--df-text)] text-[var(--df-paper)]"
                : "border border-[var(--df-text)]"
            } disabled:cursor-not-allowed disabled:opacity-50`}
          >
            {submitting
              ? "Processing..."
              : accepting
                ? "Accept invitation"
                : "Decline invitation"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   LOADING
========================================================= */

function InvitationDetailSkeleton() {
  return (
    <main className="min-h-screen bg-[var(--df-paper)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1300px]">
        <div className="h-3 w-32 animate-pulse bg-[var(--df-line)]/50" />

        <div className="mt-8 border-y border-[var(--df-line)] py-9">
          <div className="flex gap-5">
            <div className="h-16 w-16 animate-pulse bg-[var(--df-line)]/50" />

            <div>
              <div className="h-3 w-28 animate-pulse bg-[var(--df-line)]/50" />
              <div className="mt-3 h-8 w-72 animate-pulse bg-[var(--df-line)]/50" />
              <div className="mt-3 h-3 w-52 animate-pulse bg-[var(--df-line)]/50" />
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_330px]">
          <div>
            <div className="h-5 w-40 animate-pulse bg-[var(--df-line)]/50" />

            <div className="mt-5 h-48 animate-pulse border-y border-[var(--df-line)] bg-[var(--df-line)]/10" />
          </div>

          <div className="h-56 animate-pulse border-y border-[var(--df-line)] bg-[var(--df-line)]/10" />
        </div>
      </div>
    </main>
  );
}

/* =========================================================
   ERROR
========================================================= */

function InvitationDetailError({
  message,
  onRetry,
  onBack,
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--df-paper)] px-5 text-[var(--df-text)]">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center border border-[var(--df-line)]">
          <Mail className="h-5 w-5 text-[var(--df-muted)]" />
        </div>

        <h1 className="mt-5 text-lg font-semibold">
          Unable to load this invitation
        </h1>

        <p className="mt-2 text-sm leading-6 text-[var(--df-muted)]">
          {message}
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex h-10 items-center justify-center gap-2 border border-[var(--df-text)] px-4 text-sm font-medium"
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
            Back to invitations
          </button>
        </div>
      </div>
    </main>
  );
}