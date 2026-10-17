"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  Download,
  ExternalLink,
  FileText,
  Globe2,
  Loader2,
  MapPin,
  UserRound,
  X,
  XCircle,
} from "lucide-react";

import api from "@/lib/api/axios";
import {
  clearCurrentApplication,
  fetchRecruiterApplicationById,
  updateApplicationStatus,
} from "@/lib/redux/slices/applicationSlice";

async function getFileUrl(key) {
  const response = await api.get(`/api/get-presignedUrl?key=${key}`);
  return response.data.data;
}

function formatStatus(status) {
  return (
    status
      ?.replaceAll("_", " ")
      ?.toLowerCase()
      ?.replace(/\b\w/g, (char) => char.toUpperCase()) ||
    "Unknown"
  );
}

function formatDate(date, withTime = false) {
  if (!date) return "—";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    ...(withTime
      ? {
          hour: "numeric",
          minute: "2-digit",
        }
      : {}),
  }).format(new Date(date));
}

function getCandidateName(application) {
  const profile = application?.developerProfile;

  return (
    profile?.user?.name ||
    profile?.name ||
    profile?.fullName ||
    "Developer applicant"
  );
}

function formatSalary(job) {
  const min = job?.minSalary;
  const max = job?.maxSalary;
  const currency = job?.currency || "";

  if (min == null && max == null) {
    return "Not specified";
  }

  const formatter = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  });

  if (min != null && max != null) {
    return `${currency} ${formatter.format(
      Number(min)
    )} – ${formatter.format(Number(max))}`;
  }

  if (min != null) {
    return `${currency} ${formatter.format(Number(min))}+`;
  }

  return `Up to ${currency} ${formatter.format(Number(max))}`;
}

function statusClasses(status) {
  switch (status) {
    case "PENDING":
      return "border-[#e8d7aa] bg-[#fbf7ea] text-[#8a6b19] dark:border-[#6b5727] dark:bg-[#292316] dark:text-[#e6c66e]";

    case "REVIEW":
      return "border-[#cfd9e7] bg-[#f3f6fa] text-[#425d7c] dark:border-[#35465b] dark:bg-[#18202a] dark:text-[#a9c3e4]";

    case "ACCEPTED":
      return "border-[#cbded0] bg-[#f2f7f3] text-[#42654b] dark:border-[#34543b] dark:bg-[#172219] dark:text-[#a8d2b1]";

    case "REJECTED":
      return "border-[#ead0cc] bg-[#faf3f2] text-[#8a4942] dark:border-[#633a36] dark:bg-[#281918] dark:text-[#e3a7a0]";

    default:
      return "border-[var(--df-line)] bg-[var(--df-paper)] text-[var(--df-muted)]";
  }
}

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center gap-2 border px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.13em] ${statusClasses(
        status
      )}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {formatStatus(status)}
    </span>
  );
}

function SectionTitle({
  eyebrow,
  title,
  description,
}) {
  return (
    <div className="border-b border-[var(--df-line)] pb-5">
      {eyebrow && (
        <p className="mb-2 text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--df-muted)]">
          {eyebrow}
        </p>
      )}

      <h2 className="text-xl font-semibold tracking-[-0.03em]">
        {title}
      </h2>

      {description && (
        <p className="mt-1.5 max-w-2xl text-sm leading-6 text-[var(--df-muted)]">
          {description}
        </p>
      )}
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-5 border-b border-[var(--df-line)] py-3 last:border-b-0">
      <span className="text-xs text-[var(--df-muted)]">
        {label}
      </span>

      <span className="max-w-[60%] text-right text-xs font-semibold">
        {value || "—"}
      </span>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <main className="min-h-screen bg-[var(--df-paper)] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1400px] animate-pulse">
        <div className="h-4 w-32 rounded bg-[var(--df-paper-3)]" />

        <div className="mt-7 border-y border-[var(--df-line)] py-8">
          <div className="h-3 w-36 rounded bg-[var(--df-paper-3)]" />
          <div className="mt-4 h-10 w-2/3 rounded bg-[var(--df-paper-3)]" />
          <div className="mt-3 h-4 w-1/3 rounded bg-[var(--df-paper-3)]" />
        </div>

        <div className="mt-7 grid gap-8 lg:grid-cols-[minmax(0,1fr)_330px]">
          <div className="space-y-8">
            <div className="h-64 border-y border-[var(--df-line)] bg-[var(--df-paper-2)]" />
            <div className="h-80 border-y border-[var(--df-line)] bg-[var(--df-paper-2)]" />
          </div>

          <div className="space-y-6">
            <div className="h-72 border border-[var(--df-line)] bg-[var(--df-paper-2)]" />
            <div className="h-64 border border-[var(--df-line)] bg-[var(--df-paper-2)]" />
          </div>
        </div>
      </div>
    </main>
  );
}

export default function RecruiterApplicationDetailPage() {
  const params = useParams();
  const dispatch = useDispatch();

  const {
    currentApplication,
    loadingDetail,
    submitting,
    errorDetail,
    submitError,
  } = useSelector((state) => state.applications);

  const id = params?.id;

  const [modal, setModal] = useState(null);

  const [form, setForm] = useState({
    roleTitle: "",
    employmentType: "",
    salary: "",
    currency: "USD",
    description: "",
    startDate: "",
    rejectionReason: "",
  });

  useEffect(() => {
    if (!id) return;

    dispatch(clearCurrentApplication());

    dispatch(
      fetchRecruiterApplicationById({
        id,
      })
    );

    return () => {
      dispatch(clearCurrentApplication());
    };
  }, [dispatch, id]);

  const application = currentApplication;

  const candidateName = useMemo(
    () => getCandidateName(application),
    [application]
  );

  useEffect(() => {
    if (!application) return;

    setForm((current) => ({
      ...current,
      roleTitle:
        current.roleTitle ||
        application.job?.title ||
        "",
      employmentType:
        current.employmentType ||
        application.job?.employmentType ||
        "",
      currency:
        application.job?.currency ||
        current.currency ||
        "USD",
    }));
  }, [application]);

  if (loadingDetail || !application) {
    if (errorDetail) {
      return (
        <main className="min-h-screen bg-[var(--df-paper)] px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1400px]">
            <Link
              href="/dashboard/recruiter/applications"
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.1em] text-[var(--df-muted)] transition hover:text-[var(--df-text)]"
            >
              <ArrowLeft size={14} />
              Applications
            </Link>

            <div className="mt-8 border-y border-red-200 bg-red-50 px-5 py-8 dark:border-red-900/60 dark:bg-red-950/30">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-red-600 dark:text-red-300">
                Application error
              </p>

              <h1 className="mt-2 text-2xl font-semibold text-red-900 dark:text-red-200">
                Couldn't load this application
              </h1>

              <p className="mt-2 text-sm text-red-700 dark:text-red-300">
                {errorDetail}
              </p>
            </div>
          </div>
        </main>
      );
    }

    return <DetailSkeleton />;
  }

  const status = application.status;

  const canReview = status === "PENDING";
  const canDecide = status === "REVIEW";

  async function moveToReview() {
    try {
      await dispatch(
        updateApplicationStatus({
          id,
          status: "REVIEW",
        })
      ).unwrap();

      setModal(null);

      await dispatch(
        fetchRecruiterApplicationById({
          id,
        })
      );
    } catch {}
  }

  async function rejectApplication(event) {
    event.preventDefault();

    if (!form.rejectionReason.trim()) return;

    try {
      await dispatch(
        updateApplicationStatus({
          id,
          status: "REJECTED",
          rejectionReason:
            form.rejectionReason.trim(),
        })
      ).unwrap();

      setModal(null);

      await dispatch(
        fetchRecruiterApplicationById({
          id,
        })
      );
    } catch {}
  }

  async function acceptApplication(event) {
    event.preventDefault();

    if (
      !form.roleTitle.trim() ||
      !form.employmentType.trim() ||
      !form.salary ||
      !form.currency.trim() ||
      !form.description.trim() ||
      !form.startDate
    ) {
      return;
    }

    try {
      await dispatch(
        updateApplicationStatus({
          id,
          status: "ACCEPTED",
          roleTitle: form.roleTitle.trim(),
          employmentType:
            form.employmentType.trim(),
          salary: Number(form.salary),
          currency:
            form.currency.trim().toUpperCase(),
          description: form.description.trim(),
          startDate: new Date(
            form.startDate
          ).toISOString(),
        })
      ).unwrap();

      setModal(null);

      await dispatch(
        fetchRecruiterApplicationById({
          id,
        })
      );
    } catch {}
  }

  return (
    <main className="min-h-screen bg-[var(--df-paper)] text-[var(--df-text)]">
      <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8">
        {/* TOP NAV */}
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard/recruiter/applications"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.1em] text-[var(--df-muted)] transition hover:text-[var(--df-text)]"
          >
            <ArrowLeft size={14} />
            Applications
          </Link>

          <StatusBadge status={status} />
        </div>

        {/* HERO */}
        <header className="border-b border-[var(--df-line)] pb-8 pt-8">
          <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center border border-[var(--df-line)] bg-[var(--df-paper-2)] text-sm font-bold">
                {candidateName
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--df-muted)]">
                  Candidate application
                </p>

                <h1 className="mt-2 text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">
                  {candidateName}
                </h1>

                <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[var(--df-muted)]">
                  <span>Applied for</span>

                  <span className="font-semibold text-[var(--df-text)]">
                    {application.job?.title}
                  </span>

                  <span className="hidden sm:inline">
                    /
                  </span>

                  <span>
                    {formatDate(
                      application.createdAt
                    )}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 border border-[var(--df-line)] bg-[var(--df-paper-2)] sm:grid-cols-3">
              <HeroMeta
                label="Experience"
                value={
                  application.developerProfile
                    ?.yearsOfExp != null
                    ? `${application.developerProfile.yearsOfExp} yrs`
                    : "—"
                }
              />

              <HeroMeta
                label="Location"
                value={
                  application
                    .developerProfile
                    ?.locationPreference ||
                  "—"
                }
              />

              <HeroMeta
                label="Applied"
                value={formatDate(
                  application.createdAt
                )}
                className="col-span-2 sm:col-span-1"
              />
            </div>
          </div>
        </header>

        {/* ERROR */}
        {submitError && (
          <div className="mt-5 border border-red-200 bg-red-50 px-4 py-3 dark:border-red-900/60 dark:bg-red-950/30">
            <p className="text-xs font-semibold text-red-800 dark:text-red-200">
              {submitError}
            </p>
          </div>
        )}

        {/* CONTENT */}
        <div className="grid gap-10 pt-8 lg:grid-cols-[minmax(0,1fr)_330px]">
          {/* MAIN */}
          <div className="min-w-0 space-y-10">
            {/* PROFILE */}
            <section>
              <SectionTitle
                eyebrow="01 / Candidate"
                title="Candidate profile"
                description="Profile information provided by the developer."
              />

              <div className="pt-6">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--df-muted)]">
                  About
                </p>

                <p className="mt-3 max-w-4xl whitespace-pre-line text-sm leading-7 text-[var(--df-text)]">
                  {application.developerProfile
                    ?.bio ||
                    application.developerProfile
                      ?.description ||
                    "No profile description was provided."}
                </p>
              </div>

              {application.developerProfile
                ?.skills?.length > 0 && (
                <div className="mt-7 border-t border-[var(--df-line)] pt-6">
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--df-muted)]">
                    Skills
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {application.developerProfile.skills.map(
                      (skill) => (
                        <span
                          key={skill.id}
                          className="border border-[var(--df-line)] bg-[var(--df-paper-2)] px-3 py-1.5 text-xs font-medium"
                        >
                          {skill.name}
                        </span>
                      )
                    )}
                  </div>
                </div>
              )}

              <div className="mt-7 flex flex-wrap gap-2 border-t border-[var(--df-line)] pt-6">
                {application.developerProfile
                  ?.githubUrl && (
                  <ExternalLinkButton
                    href={
                      application
                        .developerProfile.githubUrl
                    }
                    label="GitHub"
                  />
                )}

                {application.developerProfile
                  ?.portfolioUrl && (
                  <ExternalLinkButton
                    href={
                      application
                        .developerProfile
                        .portfolioUrl
                    }
                    label="Portfolio"
                  />
                )}
              </div>
            </section>

            {/* FILES */}
            <section>
              <SectionTitle
                eyebrow="02 / Documents"
                title="Application documents"
                description="Files submitted with this application."
              />

              <div className="grid gap-px overflow-hidden border border-[var(--df-line)] bg-[var(--df-line)] sm:grid-cols-2">
                <DocumentRow
                  label="Resume"
                  document={application.resume}
                />

                <DocumentRow
                  label="Cover letter"
                  document={
                    application.coverLetter
                  }
                />
              </div>
            </section>

            {/* JOB */}
            <section>
              <SectionTitle
                eyebrow="03 / Position"
                title="Applied position"
                description="The position this candidate applied for."
              />

              <div className="border-b border-[var(--df-line)] bg-[var(--df-paper-2)]">
                <div className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-xl font-semibold tracking-[-0.03em]">
                      {application.job?.title}
                    </h3>

                    <p className="mt-1 text-sm text-[var(--df-muted)]">
                      {application.job?.company?.name ||
                        "Your company"}
                    </p>
                  </div>

                  {application.job?.id && (
                    <Link
                      href={`/dashboard/recruiter/jobs/${application.job.id}`}
                      className="inline-flex h-9 items-center gap-2 border border-[var(--df-line)] px-3 text-xs font-bold uppercase tracking-[0.08em] transition hover:border-[var(--df-text)]"
                    >
                      View job
                      <ArrowRight size={13} />
                    </Link>
                  )}
                </div>

                <div className="grid border-t border-[var(--df-line)] sm:grid-cols-4">
                  <JobMeta
                    label="Employment"
                    value={
                      application.job
                        ?.employmentType
                    }
                  />

                  <JobMeta
                    label="Experience"
                    value={
                      application.job
                        ?.experienceLevel
                    }
                  />

                  <JobMeta
                    label="Location"
                    value={
                      application.job
                        ?.locationPreference
                    }
                  />

                  <JobMeta
                    label="Salary"
                    value={formatSalary(
                      application.job
                    )}
                  />
                </div>

                {application.job?.description && (
                  <div className="border-t border-[var(--df-line)] px-5 py-6">
                    <p className="mb-3 text-xs font-bold uppercase tracking-[0.12em] text-[var(--df-muted)]">
                      Description
                    </p>

                    <p className="whitespace-pre-line text-sm leading-7 text-[var(--df-text)]">
                      {application.job.description}
                    </p>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* SIDEBAR */}
          <aside className="space-y-5 lg:sticky lg:top-5 lg:self-start">
            {/* STATUS */}
            <section className="border border-[var(--df-line)] bg-[var(--df-paper-2)]">
              <div className="border-b border-[var(--df-line)] px-5 py-4">
                <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[var(--df-muted)]">
                  Application status
                </p>
              </div>

              <div className="px-5 py-5">
                <StatusBadge status={status} />

                <div className="mt-5">
                  <StatusProgress
                    status={status}
                  />
                </div>
              </div>
            </section>

            {/* ACTIONS */}
            <section className="border border-[var(--df-line)] bg-[var(--df-text)] text-white">
              <div className="border-b border-white/10 px-5 py-4">
                <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/45">
                  Recruiter actions
                </p>
              </div>

              <div className="p-5">
                {status === "PENDING" && (
                  <>
                    <p className="text-sm font-semibold">
                      Ready for review?
                    </p>

                    <p className="mt-2 text-xs leading-5 text-white/55">
                      Move this application into the review
                      stage when you start evaluating the candidate.
                    </p>

                    <button
                      type="button"
                      disabled={submitting}
                      onClick={() =>
                        setModal("review")
                      }
                      className="mt-5 cursor-pointer flex h-10 w-full items-center justify-center gap-2 bg-white px-4 text-xs font-bold uppercase tracking-[0.08em] text-[var(--df-text)] transition hover:bg-white/90 disabled:opacity-50"
                    >
                      Move to review
                      <ArrowRight size={14} />
                    </button>
                  </>
                )}

                {status === "REVIEW" && (
                  <>
                    <p className="text-sm font-semibold">
                      Hiring decision
                    </p>

                    <p className="mt-2 text-xs leading-5 text-white/55">
                      This application is ready for a final
                      decision.
                    </p>

                    <div className="mt-5 space-y-2">
                      <button
                        type="button"
                        disabled={submitting}
                        onClick={() =>
                          setModal("accept")
                        }
                        className="flex cursor-pointer h-10 w-full items-center justify-center gap-2 bg-white px-4 text-xs font-bold uppercase tracking-[0.08em] text-[var(--df-text)] disabled:opacity-50"
                      >
                        <Check size={14} />
                        Accept & hire
                      </button>

                      <button
                        type="button"
                        disabled={submitting}
                        onClick={() =>
                          setModal("reject")
                        }
                        className="flex cursor-pointer h-10 w-full items-center justify-center gap-2 border border-white/15 px-4 text-xs font-bold uppercase tracking-[0.08em] text-white transition hover:bg-white/10 disabled:opacity-50"
                      >
                        <X size={14} />
                        Reject
                      </button>
                    </div>
                  </>
                )}

                {status === "ACCEPTED" && (
                  <>
                    <CheckCircle2
                      size={24}
                      strokeWidth={1.5}
                    />

                    <p className="mt-4 text-sm font-semibold">
                      Candidate accepted
                    </p>

                    <p className="mt-2 text-xs leading-5 text-white/55">
                      Employment history has been created for
                      this developer.
                    </p>
                  </>
                )}

                {status === "REJECTED" && (
                  <>
                    <XCircle
                      size={24}
                      strokeWidth={1.5}
                    />

                    <p className="mt-4 text-sm font-semibold">
                      Application rejected
                    </p>

                    {application.rejectionReason && (
                      <div className="mt-4 border-t border-white/10 pt-4">
                        <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-white/40">
                          Reason
                        </p>

                        <p className="mt-2 text-xs leading-5 text-white/65">
                          {
                            application.rejectionReason
                          }
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </section>

            {/* APPLICATION INFO */}
            <section className="border border-[var(--df-line)] bg-[var(--df-paper-2)]">
              <div className="border-b border-[var(--df-line)] px-5 py-4">
                <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[var(--df-muted)]">
                  Record
                </p>
              </div>

              <div className="px-5">
                <InfoRow
                  label="Application ID"
                  value={application.id}
                />

                <InfoRow
                  label="Submitted"
                  value={formatDate(
                    application.createdAt,
                    true
                  )}
                />

                <InfoRow
                  label="Last updated"
                  value={formatDate(
                    application.updatedAt,
                    true
                  )}
                />

                <InfoRow
                  label="Deadline"
                  value={formatDate(
                    application.job?.deadline
                  )}
                />
              </div>
            </section>
          </aside>
        </div>
      </div>

      {/* REVIEW MODAL */}
      {modal === "review" && (
        <Modal
          title="Move to review?"
          description="This will move the candidate from pending into your review stage."
          onClose={() =>
            !submitting && setModal(null)
          }
        >
          <div className="mt-7 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              disabled={submitting}
              onClick={() => setModal(null)}
              className="h-10 border cursor-pointer border-[var(--df-line)] px-4 text-xs font-bold uppercase tracking-[0.08em]"
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={submitting}
              onClick={moveToReview}
              className="h-10 bg-[var(--df-text)] cursor-pointer px-5 text-xs font-bold uppercase tracking-[0.08em] text-white disabled:opacity-50"
            >
              {submitting
                ? "Updating..."
                : "Move to review"}
            </button>
          </div>
        </Modal>
      )}

      {/* REJECT MODAL */}
      {modal === "reject" && (
        <Modal
          title="Reject application"
          description="Give the candidate application a clear rejection reason."
          onClose={() =>
            !submitting && setModal(null)
          }
        >
          <form
            onSubmit={rejectApplication}
            className="mt-6"
          >
            <label>
              <span className="text-xs font-bold uppercase tracking-[0.1em]">
                Rejection reason
              </span>

              <textarea
                rows={6}
                value={form.rejectionReason}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    rejectionReason:
                      event.target.value,
                  }))
                }
                placeholder="Explain why the application is not moving forward..."
                className="mt-2 w-full resize-none border border-[var(--df-line)] bg-[var(--df-paper)] px-4 py-3 text-sm leading-6 outline-none focus:border-[var(--df-text)]"
                required
              />
            </label>

            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={submitting}
                onClick={() => setModal(null)}
                className="h-10 cursor-pointer border border-[var(--df-line)] px-4 text-xs font-bold uppercase tracking-[0.08em]"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={
                  submitting ||
                  !form.rejectionReason.trim()
                }
                className="h-10 cursor-pointer bg-[#8a4942] px-5 text-xs font-bold uppercase tracking-[0.08em] text-white disabled:opacity-50"
              >
                {submitting
                  ? "Rejecting..."
                  : "Reject application"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ACCEPT MODAL */}
      {modal === "accept" && (
        <Modal
          title="Accept & hire candidate"
          description="This action creates the developer's employment history using the information below."
          wide
          onClose={() =>
            !submitting && setModal(null)
          }
        >
          <form
            onSubmit={acceptApplication}
            className="mt-6 space-y-5"
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <FormField label="Role title" required>
                <input
                  value={form.roleTitle}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      roleTitle:
                        event.target.value,
                    }))
                  }
                  placeholder="Senior Frontend Developer"
                  required
                />
              </FormField>

              <FormField
                label="Employment type"
                required
              >
                <select
                  value={form.employmentType}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      employmentType:
                        event.target.value,
                    }))
                  }
                  required
                >
                  <option value="">
                    Select employment
                  </option>
                  <option value="FULLTIME">
                    Full-time
                  </option>
                  <option value="PARTTIME">
                    Part-time
                  </option>
                  <option value="CONTRACT">
                    Contract
                  </option>
                  <option value="INTERN">
                    Internship
                  </option>
                </select>
              </FormField>

              <FormField label="Salary" required>
                <input
                  type="number"
                  min="0"
                  value={form.salary}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      salary: event.target.value,
                    }))
                  }
                  placeholder="50000"
                  required
                />
              </FormField>

              <FormField label="Currency" required>
                <select
                  value={form.currency}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      currency: event.target.value,
                    }))
                  }
                  required
                >
                  <option value="">Select currency</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="PKR">PKR</option>
                  <option value="INR">INR</option>
                  <option value="GBP">GBP</option>
                  <option value="AED">AED</option>
                </select>
              </FormField>

              <FormField
                label="Start date"
                required
              >
                <input
                  type="date"
                  value={form.startDate}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      startDate:
                        event.target.value,
                    }))
                  }
                  required
                />
              </FormField>
            </div>

            <FormField
              label="Employment description"
              required
            >
              <textarea
                rows={6}
                value={form.description}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    description:
                      event.target.value,
                  }))
                }
                placeholder="Describe the employment arrangement, responsibilities and expectations..."
                required
              />
            </FormField>

            <div className="flex flex-col-reverse gap-2 border-t border-[var(--df-line)] pt-5 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={submitting}
                onClick={() => setModal(null)}
                className="h-10  cursor-pointer border border-[var(--df-line)] px-4 text-xs font-bold uppercase tracking-[0.08em]"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="h-10  cursor-pointer bg-[var(--df-text)] px-5 text-xs font-bold uppercase tracking-[0.08em] text-white disabled:opacity-50"
              >
                {submitting
                  ? "Creating employment..."
                  : "Accept & create employment"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </main>
  );
}

/* =========================================================
   SMALL COMPONENTS
========================================================= */

function HeroMeta({
  label,
  value,
  className = "",
}) {
  return (
    <div
      className={`border-r border-[var(--df-line)] px-4 py-3 last:border-r-0 ${className}`}
    >
      <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-[var(--df-muted)]">
        {label}
      </p>

      <p className="mt-1 text-xs font-semibold">
        {value}
      </p>
    </div>
  );
}

function JobMeta({ label, value }) {
  return (
    <div className="border-r border-[var(--df-line)] px-5 py-4 last:border-r-0">
      <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-[var(--df-muted)]">
        {label}
      </p>

      <p className="mt-2 text-xs font-semibold">
        {value || "—"}
      </p>
    </div>
  );
}

function StatusProgress({ status }) {
  const steps = [
    {
      value: "PENDING",
      label: "Pending",
    },
    {
      value: "REVIEW",
      label: "Review",
    },
    {
      value: "ACCEPTED",
      label: "Accepted",
    },
  ];

  const rejected = status === "REJECTED";

  return (
    <div>
      {steps.map((step, index) => {
        const active =
          step.value === status ||
          (status === "REVIEW" &&
            step.value === "PENDING");

        return (
          <div
            key={step.value}
            className="flex items-center gap-3"
          >
            <div className="flex w-4 flex-col items-center">
              <span
                className={`h-2.5 w-2.5 rounded-full border ${
                  active
                    ? "border-[var(--df-text)] bg-[var(--df-text)]"
                    : "border-[var(--df-line)] bg-[var(--df-paper-2)]"
                }`}
              />

              {index < steps.length - 1 && (
                <span className="h-7 w-px bg-[var(--df-line)]" />
              )}
            </div>

            <span
              className={`text-xs ${
                active
                  ? "font-semibold text-[var(--df-text)]"
                  : "text-[var(--df-muted)]"
              }`}
            >
              {step.label}
            </span>
          </div>
        );
      })}

      {rejected && (
        <div className="mt-1 flex items-center gap-3">
          <div className="flex w-4 justify-center">
            <span className="h-2.5 w-2.5 rounded-full bg-[#8a4942]" />
          </div>

          <span className="text-xs font-semibold text-[#8a4942]">
            Rejected
          </span>
        </div>
      )}
    </div>
  );
}

function DocumentRow({ label, document }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fileKey =
    document?.key ||
    document?.fileKey ||
    document?.path;

  const handleView = async () => {
    if (!fileKey) return;

    try {
      setLoading(true);
      setError(null);

      const url = await getFileUrl(fileKey);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "Unable to open this document."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[var(--df-paper-2)] px-5 py-5">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center border border-[var(--df-line)] bg-[var(--df-paper)]">
            <FileText
              size={15}
              className="text-[var(--df-muted)]"
            />
          </div>

          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.1em]">
              {label}
            </p>

            <p className="mt-1 truncate text-[11px] text-[var(--df-muted)]">
              {document?.originalName ||
                document?.fileName ||
                document?.name ||
                (fileKey
                  ? fileKey.split("/").pop()
                  : "No document attached")}
            </p>
          </div>
        </div>

        {document && fileKey && (
          <div className="shrink-0">
            <button
              type="button"
              disabled={loading}
              onClick={handleView}
              className="flex h-8 w-8 cursor-pointer items-center justify-center border border-[var(--df-line)] transition hover:border-[var(--df-text)] disabled:opacity-50"
              title={`Open ${label}`}
            >
              {loading ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <ExternalLink size={13} />
              )}
            </button>

            {error && (
              <p className="mt-1 max-w-40 text-right text-[10px] text-red-600">
                {error}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ExternalLinkButton({ href, label }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex h-9 items-center gap-2 border border-[var(--df-line)] bg-[var(--df-paper-2)] px-3 text-[10px] font-bold uppercase tracking-[0.08em] transition hover:border-[var(--df-text)]"
    >
      <Globe2 size={13} />
      {label}
      <ExternalLink size={12} />
    </a>
  );
}

function Modal({
  title,
  description,
  onClose,
  children,
  wide = false,
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/35 p-0 backdrop-blur-[2px] sm:items-center sm:p-5">
      <div
        className={`w-full ${
          wide ? "max-w-3xl" : "max-w-lg"
        } border border-[var(--df-line)] bg-[var(--df-paper)] p-6 shadow-2xl sm:p-7`}
      >
        <div className="flex items-start justify-between gap-6">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[var(--df-muted)]">
              Recruiter action
            </p>

            <h2 className="mt-2 text-xl font-semibold tracking-[-0.03em]">
              {title}
            </h2>

            {description && (
              <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--df-muted)]">
                {description}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex cursor-pointer h-8 w-8 shrink-0 items-center justify-center border border-[var(--df-line)] bg-[var(--df-paper-2)]"
          >
            <X size={14} />
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}

function FormField({ label, required, children }) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-[0.1em]">
        {label}

        {required && (
          <span className="ml-1 text-red-600">
            *
          </span>
        )}
      </span>

      <div className="mt-2 [&_input]:h-10 [&_input]:w-full [&_input]:border [&_input]:border-[var(--df-line)] [&_input]:bg-[var(--df-paper)] [&_input]:px-3 [&_input]:text-sm [&_input]:outline-none [&_input]:focus:border-[var(--df-text)] [&_select]:h-10 [&_select]:w-full [&_select]:border [&_select]:border-[var(--df-line)] [&_select]:bg-[var(--df-paper)] [&_select]:px-3 [&_select]:text-sm [&_select]:outline-none [&_select]:focus:border-[var(--df-text)] [&_textarea]:w-full [&_textarea]:resize-none [&_textarea]:border [&_textarea]:border-[var(--df-line)] [&_textarea]:bg-[var(--df-paper)] [&_textarea]:px-3 [&_textarea]:py-3 [&_textarea]:text-sm [&_textarea]:leading-6 [&_textarea]:outline-none [&_textarea]:focus:border-[var(--df-text)]">
        {children}
      </div>
    </label>
  );
}
