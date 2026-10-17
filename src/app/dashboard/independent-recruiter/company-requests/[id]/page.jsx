"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle2,
  Clock3,
  Edit3,
  FileText,
  Globe2,
  MapPin,
  MessageSquare,
  Send,
  ShieldCheck,
  UserRound,
  XCircle,
} from "lucide-react";

import {
  clearSelectedCompanyJoinRequest,
  fetchCompanyJoinRequestById,
  updateCompanyJoinRequest,
} from "@/lib/redux/slices/companyJoinRequestSlice";

const STATUS_CONFIG = {
  PENDING: {
    label: "Pending review",
    icon: Clock3,
    className:
      "border-amber-200 bg-amber-50 text-amber-700",
  },
  ACCEPTED: {
    label: "Accepted",
    icon: CheckCircle2,
    className:
      "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  REJECTED: {
    label: "Rejected",
    icon: XCircle,
    className:
      "border-rose-200 bg-rose-50 text-rose-700",
  },
  CANCELLED: {
    label: "Cancelled",
    icon: XCircle,
    className:
      "border-neutral-200 bg-neutral-50 text-neutral-600",
  },
};

function formatDate(value) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function formatDateTime(value) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] ${config.className}`}
    >
      <Icon size={14} strokeWidth={1.8} />
      {config.label}
    </span>
  );
}

function DetailSkeleton() {
  return (
    <div className="mx-auto max-w-[1200px] px-4 py-8 md:px-8 md:py-12">
      <div className="h-4 w-28 animate-pulse bg-[var(--df-text)]/[0.06]" />

      <div className="mt-10 border-b border-[var(--df-line)] pb-10">
        <div className="flex gap-5">
          <div className="h-16 w-16 animate-pulse bg-[var(--df-text)]/[0.06]" />

          <div className="flex-1">
            <div className="h-3 w-28 animate-pulse bg-[var(--df-text)]/[0.06]" />
            <div className="mt-3 h-10 w-80 max-w-full animate-pulse bg-[var(--df-text)]/[0.06]" />
            <div className="mt-3 h-4 w-56 animate-pulse bg-[var(--df-text)]/[0.05]" />
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_330px]">
        <div className="space-y-6">
          <div className="h-48 animate-pulse bg-[var(--df-text)]/[0.04]" />
          <div className="h-48 animate-pulse bg-[var(--df-text)]/[0.04]" />
        </div>

        <div className="h-64 animate-pulse bg-[var(--df-text)]/[0.04]" />
      </div>
    </div>
  );
}

export default function CompanyJoinRequestDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const dispatch = useDispatch();

  const {
    selectedRequest,
    loadingDetail,
    errorDetail,
    submitting,
    submitError,
  } = useSelector((state) => state.companyJoinRequests);

  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState("");
  const [savedMessage, setSavedMessage] = useState(false);

  useEffect(() => {
    if (!id) return;

    dispatch(clearSelectedCompanyJoinRequest());
    dispatch(fetchCompanyJoinRequestById(id));

    return () => {
      dispatch(clearSelectedCompanyJoinRequest());
    };
  }, [dispatch, id]);

  useEffect(() => {
    if (selectedRequest) {
      setMessage(selectedRequest.message || "");
    }
  }, [selectedRequest]);

  const isPending = selectedRequest?.status === "PENDING";

  const company = selectedRequest?.company;
  const recruiter = selectedRequest?.recruiter;
  const recruiterUser = recruiter?.user;

  const hasCompanyWebsite = useMemo(() => {
    return Boolean(company?.websiteUrl);
  }, [company]);

  const handleSaveMessage = async () => {
    if (!selectedRequest?.id) return;

    try {
      await dispatch(
        updateCompanyJoinRequest({
          id: selectedRequest.id,
          data: {
            message: message.trim() || null,
          },
        })
      ).unwrap();

      setEditing(false);
      setSavedMessage(true);

      const timer = setTimeout(() => {
        setSavedMessage(false);
      }, 2500);

      return () => clearTimeout(timer);
    } catch {
      // Redux submitError handles the visible error state.
    }
  };

  if (loadingDetail && !selectedRequest) {
    return <DetailSkeleton />;
  }

  if (errorDetail) {
    return (
      <main className="min-h-full bg-[var(--df-paper)]">
        <div className="mx-auto max-w-[900px] px-4 py-16 text-center md:px-8">
          <div className="mx-auto flex h-12 w-12 items-center justify-center border border-rose-200 bg-rose-50 text-rose-700">
            <XCircle size={20} />
          </div>

          <h1 className="mt-5 text-xl font-semibold">
            Request not found
          </h1>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--df-muted)]">
            {errorDetail}
          </p>

          <Link
            href="/dashboard/independent-recruiter/company-requests"
            className="mt-6 inline-flex items-center gap-2 bg-[var(--df-text)] px-4 py-2.5 text-sm font-medium text-[var(--df-paper)]"
          >
            <ArrowLeft size={15} />
            Back to requests
          </Link>
        </div>
      </main>
    );
  }

  if (!selectedRequest) return null;

  return (
    <main className="min-h-full bg-[var(--df-paper)] text-[var(--df-text)]">
      {/* Top navigation */}
      <div className="border-b border-[var(--df-line)]">
        <div className="mx-auto max-w-[1200px] px-4 py-4 md:px-8">
          <button
            type="button"
            onClick={() =>
              router.push(
                "/dashboard/independent-recruiter/company-requests"
              )
            }
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--df-muted)] transition-colors hover:text-[var(--df-text)]"
          >
            <ArrowLeft size={15} />
            Company requests
          </button>
        </div>
      </div>

      {/* Hero */}
      <section className="border-b border-[var(--df-line)]">
        <div className="mx-auto max-w-[1200px] px-4 py-9 md:px-8 md:py-12">
          <div className="flex flex-col gap-7 md:flex-row md:items-start md:justify-between">
            <div className="flex min-w-0 gap-5">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden border border-[var(--df-line)]">
                {company?.logo ? (
                  <img
                    src={company.logo}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Building2
                    size={25}
                    strokeWidth={1.5}
                    className="text-[var(--df-muted)]"
                  />
                )}
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--df-accent)]">
                    Company introduction
                  </p>

                  {company?.isVerified && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-emerald-700">
                      <ShieldCheck size={12} />
                      Verified company
                    </span>
                  )}
                </div>

                <h1 className="mt-3 text-3xl font-semibold tracking-[-0.035em] md:text-5xl">
                  {company?.name || "Company"}
                </h1>

                <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-[var(--df-muted)]">
                  {company?.industry && (
                    <span>{company.industry}</span>
                  )}

                  {company?.country && (
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin size={14} />
                      {company.country}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <StatusBadge status={selectedRequest.status} />
          </div>

          <div className="mt-10 flex flex-col gap-5 border-t border-[var(--df-line)] pt-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--df-muted)]">
                Request sent
              </p>

              <p className="mt-1 text-sm">
                {formatDateTime(selectedRequest.createdAt)}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--df-muted)]">
                Current status
              </p>

              <p className="mt-1 text-sm">
                {STATUS_CONFIG[selectedRequest.status]?.label ||
                  selectedRequest.status}
              </p>
            </div>

            {company?.id && (
              <Link
                href={`/dashboard/independent-recruiter/explore-companies/${company.id}`}
                className="inline-flex items-center gap-2 border border-[var(--df-line)] px-4 py-2.5 text-sm font-medium hover:bg-[var(--df-text)] hover:text-[var(--df-paper)]"
              >
                View company
                <ArrowRight size={15} />
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Main */}
      <section className="mx-auto max-w-[1200px] px-4 py-8 md:px-8 md:py-12">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_330px]">
          {/* Main content */}
          <div className="min-w-0">
            {/* Intro */}
            <section className="border-b border-[var(--df-line)] pb-10">
              <div className="flex items-center gap-2">
                <MessageSquare
                  size={17}
                  strokeWidth={1.5}
                  className="text-[var(--df-muted)]"
                />

                <p className="text-xs font-semibold uppercase tracking-[0.12em]">
                  Your introduction
                </p>
              </div>

              <div className="mt-6">
                {editing ? (
                  <>
                    <textarea
                      value={message}
                      onChange={(event) =>
                        setMessage(event.target.value)
                      }
                      rows={8}
                      maxLength={2000}
                      autoFocus
                      placeholder="Introduce yourself, explain your recruiting experience, and tell the company how you could help."
                      className="w-full resize-y border border-[var(--df-line)] bg-transparent px-4 py-4 text-sm leading-7 outline-none placeholder:text-[var(--df-muted)] focus:border-[var(--df-text)]"
                    />

                    <div className="mt-3 flex items-center justify-between gap-4">
                      <p className="text-xs text-[var(--df-muted)]">
                        {message.length}/2000
                      </p>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditing(false);
                            setMessage(
                              selectedRequest.message || ""
                            );
                          }}
                          disabled={submitting}
                          className="border border-[var(--df-line)] px-4 py-2.5 text-sm font-medium disabled:opacity-50"
                        >
                          Cancel
                        </button>

                        <button
                          type="button"
                          onClick={handleSaveMessage}
                          disabled={submitting}
                          className="inline-flex items-center gap-2 bg-[var(--df-text)] px-4 py-2.5 text-sm font-medium text-[var(--df-paper)] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Send size={14} />
                          {submitting ? "Saving..." : "Save message"}
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="max-w-3xl">
                      {selectedRequest.message ? (
                        <p className="whitespace-pre-wrap text-[17px] leading-8 text-[var(--df-text)]">
                          {selectedRequest.message}
                        </p>
                      ) : (
                        <p className="text-sm italic text-[var(--df-muted)]">
                          No message was included with this request.
                        </p>
                      )}
                    </div>

                    {isPending && (
                      <button
                        type="button"
                        onClick={() => setEditing(true)}
                        className="mt-6 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--df-muted)] hover:text-[var(--df-text)]"
                      >
                        <Edit3 size={14} />
                        Edit message
                      </button>
                    )}

                    {savedMessage && (
                      <p className="mt-4 text-xs font-medium text-emerald-700">
                        Your message has been updated.
                      </p>
                    )}
                  </>
                )}

                {submitError && (
                  <div className="mt-4 border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    {submitError}
                  </div>
                )}
              </div>
            </section>

            {/* Recruiter profile snapshot */}
            <section className="border-b border-[var(--df-line)] py-10">
              <div className="flex items-center gap-2">
                <UserRound
                  size={17}
                  strokeWidth={1.5}
                  className="text-[var(--df-muted)]"
                />

                <p className="text-xs font-semibold uppercase tracking-[0.12em]">
                  Recruiter profile shared
                </p>
              </div>

              <div className="mt-6 grid gap-6 sm:grid-cols-2">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--df-muted)]">
                    Name
                  </p>
                  <p className="mt-2 text-sm font-medium">
                    {recruiterUser?.name || "Not provided"}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--df-muted)]">
                    Email
                  </p>
                  <p className="mt-2 break-all text-sm font-medium">
                    {recruiterUser?.email || "Not provided"}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--df-muted)]">
                    Current role
                  </p>
                  <p className="mt-2 text-sm font-medium">
                    {recruiter?.jobTitle || "Independent recruiter"}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--df-muted)]">
                    Profile verification
                  </p>

                  <p className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium">
                    {recruiterUser?.isVerified ? (
                      <>
                        <CheckCircle2
                          size={15}
                          className="text-emerald-700"
                        />
                        Verified
                      </>
                    ) : (
                      "Not verified"
                    )}
                  </p>
                </div>
              </div>

              {recruiter?.bio && (
                <div className="mt-8 border-t border-[var(--df-line)] pt-6">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--df-muted)]">
                    Bio
                  </p>

                  <p className="mt-3 max-w-3xl whitespace-pre-wrap text-sm leading-7 text-[var(--df-muted)]">
                    {recruiter.bio}
                  </p>
                </div>
              )}
            </section>

            {/* Status explanation */}
            <section className="pt-10">
              <div className="flex items-start gap-4">
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center border border-[var(--df-line)]">
                  {selectedRequest.status === "ACCEPTED" ? (
                    <CheckCircle2
                      size={17}
                      className="text-emerald-700"
                    />
                  ) : selectedRequest.status === "REJECTED" ? (
                    <XCircle
                      size={17}
                      className="text-rose-700"
                    />
                  ) : (
                    <Clock3
                      size={17}
                      className="text-amber-700"
                    />
                  )}
                </div>

                <div>
                  <h2 className="text-sm font-semibold">
                    {selectedRequest.status === "PENDING"
                      ? "Waiting for the company"
                      : selectedRequest.status === "ACCEPTED"
                      ? "The company accepted your introduction"
                      : selectedRequest.status === "REJECTED"
                      ? "The company declined this request"
                      : "This request is no longer active"}
                  </h2>

                  <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--df-muted)]">
                    {selectedRequest.status === "PENDING"
                      ? "The company owner can review your recruiter profile and message before deciding whether to bring you onto the team."
                      : selectedRequest.status === "ACCEPTED"
                      ? "Your recruiter profile has been accepted by this company. Your company relationship and recruiter history are now managed from the company recruiter area."
                      : selectedRequest.status === "REJECTED"
                      ? "This request was not accepted by the company. You can explore other verified companies and introduce yourself to them."
                      : "This request is no longer available for further action."}
                  </p>
                </div>
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <aside className="lg:border-l lg:border-[var(--df-line)] lg:pl-8">
            <div className="lg:sticky lg:top-6">
              {/* Company */}
              <div className="border-b border-[var(--df-line)] pb-7">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--df-muted)]">
                  Company
                </p>

                <div className="mt-5 flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden border border-[var(--df-line)]">
                    {company?.logo ? (
                      <img
                        src={company.logo}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Building2
                        size={19}
                        className="text-[var(--df-muted)]"
                      />
                    )}
                  </div>

                  <div className="min-w-0">
                    <h2 className="text-sm font-semibold">
                      {company?.name || "Company"}
                    </h2>

                    {company?.isVerified && (
                      <p className="mt-1 inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700">
                        <ShieldCheck size={12} />
                        Verified company
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-5 space-y-3 text-sm">
                  {company?.industry && (
                    <div className="flex items-start gap-3">
                      <Building2
                        size={15}
                        className="mt-0.5 shrink-0 text-[var(--df-muted)]"
                      />
                      <span>{company.industry}</span>
                    </div>
                  )}

                  {company?.country && (
                    <div className="flex items-start gap-3">
                      <MapPin
                        size={15}
                        className="mt-0.5 shrink-0 text-[var(--df-muted)]"
                      />
                      <span>{company.country}</span>
                    </div>
                  )}

                  {hasCompanyWebsite && (
                    <a
                      href={company.websiteUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-start gap-3 text-[var(--df-muted)] hover:text-[var(--df-text)]"
                    >
                      <Globe2
                        size={15}
                        className="mt-0.5 shrink-0"
                      />
                      <span className="truncate">
                        Company website
                      </span>
                    </a>
                  )}
                </div>

                <Link
                  href={`/dashboard/independent-recruiter/explore-companies/${company?.id}`}
                  className="mt-6 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--df-text)]"
                >
                  Company profile
                  <ArrowRight size={14} />
                </Link>
              </div>

              {/* Request facts */}
              <div className="border-b border-[var(--df-line)] py-7">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--df-muted)]">
                  Request details
                </p>

                <dl className="mt-5 space-y-5">
                  <div>
                    <dt className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--df-muted)]">
                      Submitted
                    </dt>
                    <dd className="mt-1.5 text-sm">
                      {formatDate(selectedRequest.createdAt)}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--df-muted)]">
                      Last updated
                    </dt>
                    <dd className="mt-1.5 text-sm">
                      {formatDate(selectedRequest.updatedAt)}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--df-muted)]">
                      Status
                    </dt>
                    <dd className="mt-2">
                      <StatusBadge status={selectedRequest.status} />
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Profile intent */}
              <div className="pt-7">
                <div className="flex items-start gap-3">
                  <FileText
                    size={17}
                    strokeWidth={1.5}
                    className="mt-0.5 text-[var(--df-muted)]"
                  />

                  <div>
                    <p className="text-sm font-semibold">
                      What this request means
                    </p>

                    <p className="mt-2 text-xs leading-5 text-[var(--df-muted)]">
                      You are introducing yourself as an independent
                      recruiter. The company can review your profile
                      and decide whether it needs your recruiting
                      support.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}