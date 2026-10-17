"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowLeft,
  ArrowUpRight,
  BadgeCheck,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  FileText,
  Mail,
  MapPin,
  MessageSquare,
  ShieldCheck,
  UserRound,
  X,
  XCircle,
  Loader2,
  Download,
} from "lucide-react";

import {
  fetchCompanyJoinRequestById,
  updateCompanyJoinRequestStatus,
  clearSelectedCompanyJoinRequest,
  clearCompanyJoinRequestErrors,
} from "@/lib/redux/slices/companyJoinRequestSlice";
import api from "@/lib/api/axios";

const EMPLOYMENT_TYPES = [
  { value: "FULLTIME", label: "Full time" },
  { value: "PARTTIME", label: "Part time" },
  { value: "CONTRACT", label: "Contract" },
  { value: "FREELANCE", label: "Freelance" },
  { value: "INTERNSHIP", label: "Internship" }
];

const CURRENCIES = ["USD", "EUR", "PKR", "INR", "GBP", "AED"];

const statusConfig = {
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
      "border-red-200 bg-red-50 text-red-700",
  },
  CANCELLED: {
    label: "Cancelled",
    icon: XCircle,
    className:
      "border-[var(--df-line)] bg-[var(--df-paper)] text-[var(--df-muted)]",
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
  const config = statusConfig[status] || statusConfig.PENDING;
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] ${config.className}`}
    >
      <Icon size={13} />
      {config.label}
    </span>
  );
}

function Initials({ name }) {
  if (!name) {
    return <UserRound size={20} className="text-[var(--df-muted)]" />;
  }

  const initials = name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <span className="text-lg font-semibold tracking-tight">
      {initials}
    </span>
  );
}

function DetailItem({ icon: Icon, label, children }) {
  return (
    <div>
      <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--df-muted)]">
        <Icon size={13} />
        {label}
      </div>

      <div className="mt-1.5 text-sm">{children || "—"}</div>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <main className="min-h-screen bg-[var(--df-paper)]">
      <div className="mx-auto max-w-[1400px] animate-pulse px-4 py-8 sm:px-6 lg:px-8">
        <div className="h-4 w-32 bg-[var(--df-line)]" />

        <div className="mt-8 h-10 w-96 max-w-full bg-[var(--df-line)]" />
        <div className="mt-3 h-4 w-[520px] max-w-full bg-[var(--df-line)]" />

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="h-96 border border-[var(--df-line)] bg-[var(--df-paper)]" />
          <div className="h-96 border border-[var(--df-line)] bg-[var(--df-paper)]" />
        </div>
      </div>
    </main>
  );
}

export default function CompanyJoinRequestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useDispatch();

  const requestId = params?.id;

  const {
    selectedRequest,
    loadingDetail,
    submitting,
    errorDetail,
    submitError,
  } = useSelector((state) => state.companyJoinRequests);

  const [decision, setDecision] = useState(null);
  const [showAcceptForm, setShowAcceptForm] = useState(false);

  const [roleTitle, setRoleTitle] = useState("");
  const [employmentType, setEmploymentType] = useState("FULLTIME");
  const [salary, setSalary] = useState("");
  const [currency, setCurrency] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [resumeError, setResumeError] = useState(null);

  useEffect(() => {
    if (!requestId) return;

    dispatch(clearSelectedCompanyJoinRequest());
    dispatch(clearCompanyJoinRequestErrors());
    dispatch(fetchCompanyJoinRequestById(requestId));
  }, [dispatch, requestId]);

  useEffect(() => {
    if (!selectedRequest) return;

    setRoleTitle(selectedRequest.recruiter?.jobTitle || "");
  }, [selectedRequest]);

  const recruiter = selectedRequest?.recruiter;
  const user = recruiter?.user;
  const company = selectedRequest?.company;

  const isPending = selectedRequest?.status === "PENDING";
  const isAccepted = selectedRequest?.status === "ACCEPTED";
  const isRejected = selectedRequest?.status === "REJECTED";

  const companyLocation = useMemo(() => {
    return [company?.country].filter(Boolean).join(", ");
  }, [company]);

  const openResume = async () => {
    if (!recruiter?.resume?.key) return;

    const resumeWindow = window.open("about:blank", "_blank");
    setResumeError(null);
    try {
      const response = await api.get(
        `/api/get-presignedUrl?key=${encodeURIComponent(recruiter.resume.key)}`
      );
      if (resumeWindow) resumeWindow.location.href = response.data.data;
      else window.location.href = response.data.data;
    } catch (error) {
      resumeWindow?.close();
      setResumeError(
        error.response?.data?.error || "Unable to open the recruiter’s resume."
      );
    }
  };

  const handleAccept = async (event) => {
    event.preventDefault();

    if (!roleTitle.trim()) {
      setDecision("Role title is required before accepting this request.");
      return;
    }

    if (!employmentType) {
      setDecision("Employment type is required before accepting this request.");
      return;
    }

    setDecision(null);

    try {
      await dispatch(
        updateCompanyJoinRequestStatus({
          id: requestId,
          status: "ACCEPTED",
          roleTitle: roleTitle.trim(),
          employmentType,
          salary: salary ? Number(salary) : undefined,
          currency: currency.trim() || undefined,
          description: description.trim() || undefined,
          startDate: startDate
            ? new Date(`${startDate}T00:00:00`).toISOString()
            : undefined,
        })
      ).unwrap();

      setShowAcceptForm(false);
    } catch (error) {
      setDecision(
        typeof error === "string"
          ? error
          : "Unable to accept this request."
      );
    }
  };

  const handleReject = async () => {
    setDecision(null);

    try {
      await dispatch(
        updateCompanyJoinRequestStatus({
          id: requestId,
          status: "REJECTED",
        })
      ).unwrap();
    } catch (error) {
      setDecision(
        typeof error === "string"
          ? error
          : "Unable to reject this request."
      );
    }
  };

  if (loadingDetail && !selectedRequest) {
    return <DetailSkeleton />;
  }

  if (errorDetail && !selectedRequest) {
    return (
      <main className="min-h-screen bg-[var(--df-paper)] text-[var(--df-text)]">
        <div className="mx-auto max-w-[900px] px-4 py-10 sm:px-6">
          <button
            type="button"
            onClick={() =>
              router.push("/dashboard/recruiter/company-requests")
            }
            className="inline-flex items-center gap-2 text-sm text-[var(--df-muted)] hover:text-[var(--df-text)]"
          >
            <ArrowLeft size={15} />
            Back to requests
          </button>

          <div className="mt-8 border border-red-200 bg-red-50 p-6">
            <h1 className="text-lg font-semibold">
              Unable to load this request
            </h1>

            <p className="mt-2 text-sm leading-6 text-red-700">
              {errorDetail}
            </p>

            <button
              type="button"
              onClick={() =>
                dispatch(fetchCompanyJoinRequestById(requestId))
              }
              className="mt-5 border border-red-200 px-4 py-2.5 text-sm font-semibold"
            >
              Try again
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (!selectedRequest) return null;

  return (
    <main className="min-h-screen bg-[var(--df-paper)] text-[var(--df-text)]">
      <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {/* Breadcrumb */}
        <button
          type="button"
          onClick={() =>
            router.push("/dashboard/recruiter/company-requests")
          }
          className="inline-flex items-center gap-2 text-sm text-[var(--df-muted)] transition hover:text-[var(--df-text)]"
        >
          <ArrowLeft size={15} />
          All join requests
        </button>

        {/* Header */}
        <header className="mt-7 border-b border-[var(--df-line)] pb-7">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex min-w-0 gap-4 sm:gap-5">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center border border-[var(--df-line)]">
                <Initials name={user?.name} />
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl font-semibold tracking-[-0.025em] sm:text-3xl">
                    {user?.name || "Unknown recruiter"}
                  </h1>

                  <StatusBadge status={selectedRequest.status} />
                </div>

                <p className="mt-2 text-sm text-[var(--df-muted)]">
                  {recruiter?.jobTitle || "Independent recruiter"}
                </p>

                <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-[var(--df-muted)]">
                  {user?.email && (
                    <span className="inline-flex items-center gap-1.5">
                      <Mail size={13} />
                      {user.email}
                    </span>
                  )}

                  {user?.isVerified && (
                    <span className="inline-flex items-center gap-1.5 text-[var(--df-accent)]">
                      <BadgeCheck size={13} />
                      Verified account
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="text-left lg:text-right">
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--df-muted)]">
                Request submitted
              </p>
              <p className="mt-1 text-sm font-medium">
                {formatDateTime(selectedRequest.createdAt)}
              </p>
            </div>
          </div>
        </header>

        {/* Decision error */}
        {(decision || submitError) && (
          <div className="mt-6 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <p className="font-semibold">Action could not be completed</p>
            <p className="mt-1">{decision || submitError}</p>
          </div>
        )}

        <div className="mt-7 grid gap-7 lg:grid-cols-[minmax(0,1fr)_380px]">
          {/* Main */}
          <div className="min-w-0 space-y-7">
            {/* Recruiter profile */}
            <section className="border border-[var(--df-line)]">
              <div className="border-b border-[var(--df-line)] px-5 py-4 sm:px-6">
                <div className="flex items-center gap-2">
                  <UserRound size={16} />
                  <h2 className="text-sm font-semibold">
                    Recruiter profile
                  </h2>
                </div>

                <p className="mt-1 text-xs text-[var(--df-muted)]">
                  Information attached to the recruiter's DevFlow profile.
                </p>
              </div>

              <div className="grid gap-6 p-5 sm:p-6 md:grid-cols-2">
                <DetailItem icon={UserRound} label="Name">
                  {user?.name}
                </DetailItem>

                <DetailItem icon={Mail} label="Email">
                  {user?.email}
                </DetailItem>

                <DetailItem icon={BriefcaseBusiness} label="Current title">
                  {recruiter?.jobTitle}
                </DetailItem>

                <DetailItem icon={ShieldCheck} label="Account verification">
                  {user?.isVerified ? "Verified" : "Not verified"}
                </DetailItem>
              </div>

              {recruiter?.bio && (
                <div className="border-t border-[var(--df-line)] p-5 sm:p-6">
                  <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--df-muted)]">
                    <FileText size={13} />
                    Recruiter bio
                  </div>

                  <p className="mt-3 whitespace-pre-line text-sm leading-7 text-[var(--df-muted)]">
                    {recruiter.bio}
                  </p>
                </div>
              )}
            </section>

            {/* Resume */}
            <section className="border border-[var(--df-line)]">
              <div className="border-b border-[var(--df-line)] px-5 py-4 sm:px-6">
                <div className="flex items-center gap-2">
                  <FileText size={16} />
                  <h2 className="text-sm font-semibold">Recruiter resume</h2>
                </div>
                <p className="mt-1 text-xs text-[var(--df-muted)]">
                  Review the resume attached to the recruiter’s profile.
                </p>
              </div>

              <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                {recruiter?.resume ? (
                  <div className="flex min-w-0 items-center gap-3">
                    <FileText size={18} className="shrink-0 text-[var(--df-muted)]" />
                    <p className="truncate text-sm font-medium">
                      Uploaded resume
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-[var(--df-muted)]">
                    The recruiter hasn’t uploaded a resume yet.
                  </p>
                )}

                {recruiter?.resume && (
                  <button
                    type="button"
                    onClick={openResume}
                    className="inline-flex shrink-0 items-center justify-center gap-2 border border-[var(--df-line)] px-4 py-2.5 text-sm font-medium transition hover:border-[var(--df-text)]"
                  >
                    <Download size={15} />
                    View resume
                  </button>
                )}
              </div>

              {resumeError && (
                <p role="alert" className="border-t border-red-200 bg-red-50 px-5 py-3 text-sm text-red-700 sm:px-6">
                  {resumeError}
                </p>
              )}
            </section>

            {/* Message */}
            <section className="border border-[var(--df-line)]">
              <div className="border-b border-[var(--df-line)] px-5 py-4 sm:px-6">
                <div className="flex items-center gap-2">
                  <MessageSquare size={16} />
                  <h2 className="text-sm font-semibold">
                    Message from recruiter
                  </h2>
                </div>
              </div>

              <div className="p-5 sm:p-6">
                {selectedRequest.message ? (
                  <blockquote className="border-l-2 border-[var(--df-text)] pl-5 text-sm leading-7 text-[var(--df-muted)]">
                    “{selectedRequest.message}”
                  </blockquote>
                ) : (
                  <p className="text-sm text-[var(--df-muted)]">
                    The recruiter did not include a message with this
                    request.
                  </p>
                )}
              </div>
            </section>

            {/* Request timeline */}
            <section className="border border-[var(--df-line)]">
              <div className="border-b border-[var(--df-line)] px-5 py-4 sm:px-6">
                <div className="flex items-center gap-2">
                  <Clock3 size={16} />
                  <h2 className="text-sm font-semibold">
                    Request history
                  </h2>
                </div>

                <p className="mt-1 text-xs text-[var(--df-muted)]">
                  Lifecycle information available from the join request.
                </p>
              </div>

              <div className="p-5 sm:p-6">
                <div className="relative pl-8">
                  <div className="absolute bottom-2 left-[7px] top-2 w-px bg-[var(--df-line)]" />

                  <div className="relative pb-7">
                    <span className="absolute -left-8 top-0 flex h-4 w-4 items-center justify-center border border-[var(--df-text)] bg-[var(--df-paper)]">
                      <span className="h-1.5 w-1.5 bg-[var(--df-text)]" />
                    </span>

                    <p className="text-sm font-semibold">
                      Request submitted
                    </p>

                    <p className="mt-1 text-xs text-[var(--df-muted)]">
                      {formatDateTime(selectedRequest.createdAt)}
                    </p>
                  </div>

                  <div className="relative">
                    <span
                      className={`absolute -left-8 top-0 flex h-4 w-4 items-center justify-center border ${
                        isAccepted
                          ? "border-emerald-500"
                          : isRejected
                          ? "border-red-500"
                          : "border-amber-500"
                      } bg-[var(--df-paper)]`}
                    >
                      <span
                        className={`h-1.5 w-1.5 ${
                          isAccepted
                            ? "bg-emerald-500"
                            : isRejected
                            ? "bg-red-500"
                            : "bg-amber-500"
                        }`}
                      />
                    </span>

                    <p className="text-sm font-semibold">
                      Current decision
                    </p>

                    <div className="mt-2">
                      <StatusBadge status={selectedRequest.status} />
                    </div>

                    {selectedRequest.updatedAt && (
                      <p className="mt-2 text-xs text-[var(--df-muted)]">
                        Last updated {formatDateTime(selectedRequest.updatedAt)}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-7 border-t border-[var(--df-line)] pt-5 text-xs leading-5 text-[var(--df-muted)]">
                  <p>
                    This timeline reflects the information currently exposed
                    by the company join request API. A full status audit trail
                    would require a dedicated request-event/history relation
                    in the backend.
                  </p>
                </div>
              </div>
            </section>

            {/* Resulting employment history */}
            {isAccepted && (
              <section className="border border-emerald-200 bg-emerald-50">
                <div className="border-b border-emerald-200 px-5 py-4 sm:px-6">
                  <div className="flex items-center gap-2 text-emerald-700">
                    <CheckCircle2 size={17} />
                    <h2 className="text-sm font-semibold">
                      Company relationship created
                    </h2>
                  </div>
                </div>

                <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
                  <DetailItem icon={Building2} label="Company">
                    {company?.name}
                  </DetailItem>

                  <DetailItem icon={BriefcaseBusiness} label="Recruiter">
                    {user?.name}
                  </DetailItem>

                  <div className="sm:col-span-2">
                    <p className="text-sm leading-6 text-emerald-800">
                      Accepting this request attached the recruiter to your
                      company and created their current recruiter employment
                      history record.
                    </p>
                  </div>
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Company */}
            <section className="border border-[var(--df-line)]">
              <div className="border-b border-[var(--df-line)] px-5 py-4">
                <div className="flex items-center gap-2">
                  <Building2 size={16} />
                  <h2 className="text-sm font-semibold">
                    Your company
                  </h2>
                </div>
              </div>

              <div className="p-5">
                <p className="text-lg font-semibold">{company?.name}</p>

                {company?.industry && (
                  <p className="mt-1 text-sm text-[var(--df-muted)]">
                    {company.industry}
                  </p>
                )}

                {companyLocation && (
                  <div className="mt-4 flex items-center gap-2 text-xs text-[var(--df-muted)]">
                    <MapPin size={13} />
                    {companyLocation}
                  </div>
                )}

                <div className="mt-5 flex flex-wrap gap-2">
                  {company?.isVerified && (
                    <span className="inline-flex items-center gap-1.5 border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-emerald-700">
                      <BadgeCheck size={12} />
                      Verified company
                    </span>
                  )}
                </div>

                <Link
                  href={`/dashboard/recruiter/company/${company?.id}`}
                  className="mt-5 inline-flex items-center gap-2 text-sm font-semibold underline decoration-[var(--df-line)] underline-offset-4 hover:decoration-[var(--df-text)]"
                >
                  View company
                  <ArrowUpRight size={14} />
                </Link>
              </div>
            </section>

            {/* Decision */}
            {isPending && (
              <section className="border border-[var(--df-text)]">
                <div className="border-b border-[var(--df-text)] bg-[var(--df-text)] px-5 py-4 text-[var(--df-paper)]">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.15em]">
                    Owner decision
                  </p>

                  <h2 className="mt-1 text-lg font-semibold">
                    Review this recruiter
                  </h2>
                </div>

                <div className="p-5">
                  {!showAcceptForm ? (
                    <>
                      <p className="text-sm leading-6 text-[var(--df-muted)]">
                        Accepting will attach this recruiter to your company
                        and create their current employment history record.
                      </p>

                      <div className="mt-5 grid gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setDecision(null);
                            setShowAcceptForm(true);
                          }}
                          disabled={submitting}
                          className="inline-flex h-11 items-center justify-center gap-2 bg-[var(--df-text)] px-4 text-sm font-semibold text-[var(--df-paper)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Check size={16} />
                          Accept recruiter
                        </button>

                        <button
                          type="button"
                          onClick={handleReject}
                          disabled={submitting}
                          className="inline-flex h-11 items-center justify-center gap-2 border border-red-200 px-4 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {submitting ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <X size={16} />
                          )}
                          Reject request
                        </button>
                      </div>
                    </>
                  ) : (
                    <form onSubmit={handleAccept}>
                      <div>
                        <label className="text-xs font-semibold">
                          Role title <span className="text-red-500">*</span>
                        </label>

                        <input
                          value={roleTitle}
                          onChange={(event) =>
                            setRoleTitle(event.target.value)
                          }
                          placeholder="e.g. Senior Technical Recruiter"
                          className="mt-2 h-11 w-full border border-[var(--df-line)] bg-transparent px-3 text-sm outline-none focus:border-[var(--df-text)]"
                        />
                      </div>

                      <div className="mt-4">
                        <label className="text-xs font-semibold">
                          Employment type{" "}
                          <span className="text-red-500">*</span>
                        </label>

                        <select
                          value={employmentType}
                          onChange={(event) =>
                            setEmploymentType(event.target.value)
                          }
                          className="mt-2 h-11 w-full border border-[var(--df-line)] bg-transparent px-3 text-sm outline-none focus:border-[var(--df-text)]"
                        >
                          {EMPLOYMENT_TYPES.map((type) => (
                            <option
                              key={type.value}
                              value={type.value}
                            >
                              {type.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-semibold">
                            Salary
                          </label>

                          <input
                            type="number"
                            min="0"
                            value={salary}
                            onChange={(event) =>
                              setSalary(event.target.value)
                            }
                            placeholder="Optional"
                            className="mt-2 h-11 w-full border border-[var(--df-line)] bg-transparent px-3 text-sm outline-none focus:border-[var(--df-text)]"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-semibold">
                            Currency
                          </label>

                          <select
                            value={currency}
                            onChange={(event) =>
                              setCurrency(event.target.value)
                            }
                            className="mt-2 h-11 w-full border border-[var(--df-line)] bg-[var(--df-paper)] px-3 text-sm outline-none focus:border-[var(--df-text)]"
                          >
                            <option value="">Select currency</option>
                            {CURRENCIES.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="mt-4">
                        <label className="text-xs font-semibold">
                          Start date
                        </label>

                        <div className="relative">
                          <CalendarDays
                            size={15}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--df-muted)]"
                          />

                          <input
                            type="date"
                            value={startDate}
                            onChange={(event) =>
                              setStartDate(event.target.value)
                            }
                            className="mt-2 h-11 w-full border border-[var(--df-line)] bg-transparent pl-9 pr-3 text-sm outline-none focus:border-[var(--df-text)]"
                          />
                        </div>
                      </div>

                      <div className="mt-4">
                        <label className="text-xs font-semibold">
                          Employment description
                        </label>

                        <textarea
                          value={description}
                          onChange={(event) =>
                            setDescription(event.target.value)
                          }
                          rows={4}
                          placeholder="Describe the recruiter's role and responsibilities..."
                          className="mt-2 w-full resize-none border border-[var(--df-line)] bg-transparent px-3 py-3 text-sm leading-6 outline-none focus:border-[var(--df-text)]"
                        />
                      </div>

                      <div className="mt-5 border-t border-[var(--df-line)] pt-4">
                        <p className="text-xs leading-5 text-[var(--df-muted)]">
                          Accepting will immediately attach the recruiter to
                          your company and create their current recruiter
                          history record.
                        </p>
                      </div>

                      <div className="mt-5 grid gap-2">
                        <button
                          type="submit"
                          disabled={submitting}
                          className="inline-flex h-11 items-center justify-center gap-2 bg-[var(--df-text)] px-4 text-sm font-semibold text-[var(--df-paper)] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {submitting ? (
                            <Loader2
                              size={16}
                              className="animate-spin"
                            />
                          ) : (
                            <Check size={16} />
                          )}
                          Confirm acceptance
                        </button>

                        <button
                          type="button"
                          disabled={submitting}
                          onClick={() => setShowAcceptForm(false)}
                          className="h-10 border border-[var(--df-line)] px-4 text-sm font-medium"
                        >
                          Back
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </section>
            )}

            {/* Final state */}
            {!isPending && (
              <section
                className={`border ${
                  isAccepted
                    ? "border-emerald-200 bg-emerald-50"
                    : "border-[var(--df-line)]"
                }`}
              >
                <div className="p-5">
                  <StatusBadge status={selectedRequest.status} />

                  <h2 className="mt-4 text-lg font-semibold">
                    {isAccepted
                      ? "Recruiter accepted"
                      : "Request closed"}
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-[var(--df-muted)]">
                    {isAccepted
                      ? "This recruiter is now attached to your company."
                      : "This request is no longer awaiting a decision."}
                  </p>
                </div>
              </section>
            )}

            {/* Security note */}
            <div className="flex gap-3 border-t border-[var(--df-line)] pt-5">
              <ShieldCheck
                size={16}
                className="mt-0.5 shrink-0 text-[var(--df-muted)]"
              />

              <p className="text-xs leading-5 text-[var(--df-muted)]">
                Only the owner of this company can accept or reject its join
                requests. The final decision is validated by the server.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
