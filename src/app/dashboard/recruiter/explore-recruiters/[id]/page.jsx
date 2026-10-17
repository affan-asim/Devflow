"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import {
  ArrowLeft,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  ExternalLink,
  Globe,
  Mail,
  MapPin,
  Send,
  ShieldCheck,
  UserRound,
  X,
  LoaderCircle,
  Clock3,
  AlertCircle,
} from "lucide-react";


import {
  fetchRecruiterProfile,
  fetchRecruiterProfileById,
} from "@/lib/redux/slices/recruiterSlice";

import {
  createRecruiterInvitation,
} from "@/lib/redux/slices/recruiterInvitationSlice";

import {
  fetchCompanyById,
} from "@/lib/redux/slices/companySlice";
import { clearRecruiterExploreProfile } from "@/lib/redux/slices/recruiterSlice";
import { FiGithub } from "react-icons/fi";

const EMPLOYMENT_TYPES = [
  "FULLTIME",
  "PARTTIME",
  "CONTRACT",
  "INTERNSHIP",
];

const CURRENCIES = ["USD", "PKR", "EUR", "GBP", "AED", "INR"];

function getInitials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function formatLocation(value) {
  if (!value) return "Not specified";

  return value
    .toLowerCase()
    .replace("_", " ")
    .replace(/^\w/, (char) => char.toUpperCase());
}

function formatExperience(value) {
  if (value === null || value === undefined) {
    return "Not specified";
  }

  const years = Number(value);

  if (years === 0) return "Entry level";
  if (years === 1) return "1 year";
  return `${years} years`;
}

function formatDate(value) {
  if (!value) return "Not available";

  return new Intl.DateTimeFormat("en", {
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export default function RecruiterProfileDetailPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useDispatch();

  const recruiterId = params?.id;

  const {
    currentExploreProfile,
    loadingExploreProfile,
    errorExploreProfile,
    profile: currentRecruiterProfile,
    loadingProfile,
  } = useSelector((state) => state.recruiter);

  const {
    currentCompany,
  } = useSelector((state) => state.company);

  const {
    submitting,
    submitError,
  } = useSelector((state) => state.recruiterInvitations);

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState(false);

  const [form, setForm] = useState({
    email: "",
    roleTitle: "",
    description: "",
    currency: "USD",
    salary: "",
    employmentType: "FULLTIME",
  });

  useEffect(() => {
    dispatch(clearRecruiterExploreProfile());
    dispatch(fetchRecruiterProfileById(recruiterId));
  }, [dispatch, recruiterId]);

  useEffect(() => {
    dispatch(fetchRecruiterProfile());
  }, [dispatch]);

  /*
   * The recruiter profile contains companyId, but the current profile
   * response may come from Redis without the company relation.
   *
   * Fetch the company explicitly so owner detection is reliable.
   */
  useEffect(() => {
    if (!currentRecruiterProfile?.companyId) return;

    dispatch(fetchCompanyById(currentRecruiterProfile.companyId));
  }, [dispatch, currentRecruiterProfile?.companyId]);

  const isCompanyOwner = useMemo(() => {
    if (!currentRecruiterProfile || !currentCompany) {
      return false;
    }

    /*
     * company.ownerId is the RecruiterProfile ID,
     * not the User ID.
     */
    return (
      String(currentCompany.ownerId) ===
      String(currentRecruiterProfile.id)
    );
  }, [currentRecruiterProfile, currentCompany]);

  const isSelf =
    currentRecruiterProfile?.id &&
    currentExploreProfile?.id &&
    String(currentRecruiterProfile.id) ===
      String(currentExploreProfile.id);

  useEffect(() => {
    if (!currentExploreProfile) return;

    setForm((previous) => ({
      ...previous,
      email: currentExploreProfile.user?.email || "",
      roleTitle: currentExploreProfile.jobTitle || "",
    }));
  }, [currentExploreProfile]);

  const openInviteModal = () => {
    setInviteSuccess(false);

    setForm({
      email: currentExploreProfile?.user?.email || "",
      roleTitle: currentExploreProfile?.jobTitle || "",
      description: "",
      currency: "USD",
      salary: "",
      employmentType: "FULLTIME",
    });

    setShowInviteModal(true);
  };

  const closeInviteModal = () => {
    if (submitting) return;

    setShowInviteModal(false);
  };

  const handleChange = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleInvite = async (event) => {
    event.preventDefault();

    if (!form.email.trim()) return;
    if (!form.roleTitle.trim()) return;
    if (!form.employmentType) return;

    const payload = {
      email: form.email.trim().toLowerCase(),
      roleTitle: form.roleTitle.trim(),
      description: form.description.trim(),
      currency: form.currency,
      salary: form.salary === "" ? undefined : Number(form.salary),
      employmentType: form.employmentType,
    };

    const result = await dispatch(createRecruiterInvitation(payload));

    if (createRecruiterInvitation.fulfilled.match(result)) {
      setInviteSuccess(true);
    }
  };

  if (loadingExploreProfile) {
    return <DetailSkeleton />;
  }

  if (errorExploreProfile) {
    return (
      <main className="min-h-screen bg-[var(--df-paper)]">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
          <button
            onClick={() => router.back()}
            className="mb-8 inline-flex items-center gap-2 text-sm text-[var(--df-muted)] hover:text-[var(--df-text)]"
          >
            <ArrowLeft size={16} />
            Back to recruiters
          </button>

          <div className="border border-[var(--df-line)] p-8">
            <AlertCircle size={22} />

            <h1 className="mt-5 text-xl font-semibold">
              Recruiter profile unavailable
            </h1>

            <p className="mt-2 text-sm text-[var(--df-muted)]">
              {errorExploreProfile}
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (!currentExploreProfile) return null;

  const user = currentExploreProfile.user;
  const company = currentExploreProfile.company;

  return (
    <main className="min-h-screen bg-[var(--df-paper)] text-[var(--df-text)]">
      <div className="mx-auto max-w-[1250px] px-4 py-8 sm:px-6 lg:px-8">
        {/* Back */}
        <button
          onClick={() => router.back()}
          className="mb-8 inline-flex items-center gap-2 text-sm text-[var(--df-muted)] transition-colors hover:text-[var(--df-text)]"
        >
          <ArrowLeft size={16} />
          Back to recruiters
        </button>

        {/* Header */}
        <section className="border-b border-[var(--df-line)] pb-8">
          <div className="flex flex-col gap-7 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex min-w-0 items-start gap-5">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center border border-[var(--df-line)] bg-[#eeeae2] text-xl font-semibold">
                {user?.name ? (
                  getInitials(user.name)
                ) : (
                  <UserRound size={30} strokeWidth={1.5} />
                )}
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">
                    {user?.name || "Unnamed recruiter"}
                  </h1>

                  {user?.isVerified && (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-[var(--df-accent)]">
                      <CheckCircle2 size={15} />
                      Verified
                    </span>
                  )}
                </div>

                <p className="mt-2 text-base text-[var(--df-muted)]">
                  {currentExploreProfile.jobTitle ||
                    "Recruiter profile"}
                </p>

                <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-[var(--df-muted)]">
                  <span className="inline-flex items-center gap-2">
                    <BriefcaseBusiness size={15} />
                    {formatExperience(currentExploreProfile.yearsOfExp)}
                  </span>

                  <span className="inline-flex items-center gap-2">
                    <MapPin size={15} />
                    {formatLocation(
                      currentExploreProfile.locationPreference
                    )}
                  </span>

                  {user?.isActive !== undefined && (
                    <span className="inline-flex items-center gap-2">
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          user.isActive
                            ? "bg-[var(--df-accent)]"
                            : "bg-[var(--df-muted)]"
                        }`}
                      />
                      {user.isActive ? "Active" : "Inactive"}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {isCompanyOwner && !isSelf && (
              <button
                type="button"
                onClick={openInviteModal}
                className="inline-flex shrink-0 items-center justify-center gap-2 border border-[var(--df-text)] bg-[var(--df-text)] px-5 py-3 text-sm font-medium text-[var(--df-paper)] transition-opacity hover:opacity-85"
              >
                <Send size={16} />
                Invite recruiter
              </button>
            )}
          </div>
        </section>

        {/* Content */}
        <div className="grid gap-10 py-10 lg:grid-cols-[minmax(0,1fr)_330px]">
          <div className="space-y-10">
            {/* About */}
            <section>
              <SectionHeading>About</SectionHeading>

              <div className="mt-5">
                {currentExploreProfile.bio ||
                currentExploreProfile.description ? (
                  <div className="space-y-5">
                    {currentExploreProfile.bio && (
                      <p className="text-[15px] leading-7 text-[var(--df-text)]">
                        {currentExploreProfile.bio}
                      </p>
                    )}

                    {currentExploreProfile.description && (
                      <p className="whitespace-pre-line text-[15px] leading-7 text-[var(--df-muted)]">
                        {currentExploreProfile.description}
                      </p>
                    )}
                  </div>
                ) : (
                  <EmptyText text="This recruiter has not added an introduction yet." />
                )}
              </div>
            </section>

            {/* Professional information */}
            <section>
              <SectionHeading>Professional information</SectionHeading>

              <div className="mt-5 grid gap-px border border-[var(--df-line)] bg-[var(--df-line)] sm:grid-cols-2">
                <InfoCell
                  label="Job title"
                  value={currentExploreProfile.jobTitle}
                  icon={<BriefcaseBusiness size={17} />}
                />

                <InfoCell
                  label="Experience"
                  value={formatExperience(
                    currentExploreProfile.yearsOfExp
                  )}
                  icon={<Clock3 size={17} />}
                />

                <InfoCell
                  label="Work preference"
                  value={formatLocation(
                    currentExploreProfile.locationPreference
                  )}
                  icon={<MapPin size={17} />}
                />

                <InfoCell
                  label="Account status"
                  value={user?.isActive ? "Active" : "Inactive"}
                  icon={
                    user?.isActive ? (
                      <CheckCircle2 size={17} />
                    ) : (
                      <X size={17} />
                    )
                  }
                />
              </div>
            </section>

            {/* Company */}
            {company && (
              <section>
                <SectionHeading>Current company</SectionHeading>

                <div className="mt-5 border border-[var(--df-line)] p-5">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center border border-[var(--df-line)] bg-[#eeeae2]">
                      {company.logo ? (
                        <img
                          src={company.logo}
                          alt=""
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <Building2 size={20} strokeWidth={1.6} />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">
                          {company.name}
                        </h3>

                        {company.isVerified && (
                          <CheckCircle2
                            size={15}
                            className="text-[var(--df-accent)]"
                          />
                        )}
                      </div>

                      <p className="mt-1 text-sm text-[var(--df-muted)]">
                        Current company affiliation
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Recruiter history */}
            <section>
              <SectionHeading>Recruiter history</SectionHeading>

              <div className="mt-5">
                {currentExploreProfile.recruiterHistory?.length > 0 ? (
                  <div className="space-y-0 border-y border-[var(--df-line)]">
                    {currentExploreProfile.recruiterHistory.map(
                      (history, index) => (
                        <div
                          key={history.id || index}
                          className="grid gap-3 border-b border-[var(--df-line)] py-5 last:border-b-0 sm:grid-cols-[1fr_auto]"
                        >
                          <div>
                            <p className="font-medium">
                              {history.roleTitle ||
                                history.position ||
                                "Recruiter role"}
                            </p>

                            {history.companyName && (
                              <p className="mt-1 text-sm text-[var(--df-muted)]">
                                {history.companyName}
                              </p>
                            )}
                          </div>

                          {(history.startDate || history.endDate) && (
                            <p className="text-sm text-[var(--df-muted)]">
                              {history.startDate
                                ? formatDate(history.startDate)
                                : "—"}{" "}
                              →{" "}
                              {history.endDate
                                ? formatDate(history.endDate)
                                : "Present"}
                            </p>
                          )}
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  <EmptyText text="No recruiter history has been added." />
                )}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <aside className="space-y-5">
            <div className="border border-[var(--df-line)]">
              <div className="border-b border-[var(--df-line)] px-5 py-4">
                <h2 className="text-sm font-semibold">
                  Contact & links
                </h2>
              </div>

              <div className="divide-y divide-[var(--df-line)]">
                <SidebarLink
                  icon={<Mail size={16} />}
                  label="Email"
                  value={user?.email}
                  href={user?.email ? `mailto:${user.email}` : undefined}
                />

                <SidebarLink
                  icon={<FiGithub size={16} />}
                  label="GitHub"
                  value={currentExploreProfile.githubUrl}
                  href={currentExploreProfile.githubUrl}
                />

                <SidebarLink
                  icon={<Globe size={16} />}
                  label="Portfolio"
                  value={currentExploreProfile.portfolioUrl}
                  href={currentExploreProfile.portfolioUrl}
                />
              </div>
            </div>

            <div className="border border-[var(--df-line)] p-5">
              <div className="flex items-start gap-3">
                <ShieldCheck
                  size={19}
                  strokeWidth={1.6}
                  className="mt-0.5 shrink-0"
                />

                <div>
                  <h3 className="text-sm font-semibold">
                    Profile access
                  </h3>

                  <p className="mt-2 text-xs leading-5 text-[var(--df-muted)]">
                    Recruiter discovery is available to verified company
                    owners. Invitation authorization is enforced by the
                    server.
                  </p>
                </div>
              </div>
            </div>

            {currentExploreProfile.user?.createdAt && (
              <div className="border border-[var(--df-line)] p-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-[var(--df-muted)]">
                  Member since
                </p>

                <p className="mt-2 text-sm">
                  {formatDate(currentExploreProfile.user.createdAt)}
                </p>
              </div>
            )}
          </aside>
        </div>
      </div>

      {/* Invitation modal */}
      {showInviteModal && (
        <InviteModal
          recruiter={currentExploreProfile}
          form={form}
          submitting={submitting}
          submitError={submitError}
          success={inviteSuccess}
          onChange={handleChange}
          onSubmit={handleInvite}
          onClose={closeInviteModal}
        />
      )}
    </main>
  );
}

function SectionHeading({ children }) {
  return (
    <div className="flex items-center justify-between border-b border-[var(--df-line)] pb-3">
      <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--df-muted)]">
        {children}
      </h2>
    </div>
  );
}

function InfoCell({ label, value, icon }) {
  return (
    <div className="bg-[var(--df-paper)] p-5">
      <div className="flex items-center gap-2 text-[var(--df-muted)]">
        {icon}
        <span className="text-[10px] font-semibold uppercase tracking-[0.12em]">
          {label}
        </span>
      </div>

      <p className="mt-3 text-sm font-medium">
        {value || "Not specified"}
      </p>
    </div>
  );
}

function SidebarLink({ icon, label, value, href }) {
  return (
    <div className="p-5">
      <div className="flex items-center gap-2 text-[var(--df-muted)]">
        {icon}
        <span className="text-[10px] font-semibold uppercase tracking-[0.12em]">
          {label}
        </span>
      </div>

      {value ? (
        href ? (
          <a
            href={href}
            target={href.startsWith("http") ? "_blank" : undefined}
            rel={href.startsWith("http") ? "noreferrer" : undefined}
            className="mt-2 block truncate text-sm font-medium hover:underline"
          >
            {value}
          </a>
        ) : (
          <p className="mt-2 truncate text-sm font-medium">{value}</p>
        )
      ) : (
        <p className="mt-2 text-sm text-[var(--df-muted)]">
          Not provided
        </p>
      )}
    </div>
  );
}

function EmptyText({ text }) {
  return (
    <div className="border border-dashed border-[var(--df-line)] px-5 py-8 text-sm text-[var(--df-muted)]">
      {text}
    </div>
  );
}

function InviteModal({
  recruiter,
  form,
  submitting,
  submitError,
  success,
  onChange,
  onSubmit,
  onClose,
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto bg-[var(--df-paper)]">
        <div className="flex items-start justify-between border-b border-[var(--df-line)] px-6 py-5">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--df-muted)]">
              Recruiter invitation
            </p>

            <h2 className="mt-2 text-xl font-semibold tracking-[-0.02em]">
              Invite {recruiter.user?.name || "recruiter"}
            </h2>

            <p className="mt-1 text-sm text-[var(--df-muted)]">
              Send a company invitation to join your recruiting team.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="text-[var(--df-muted)] hover:text-[var(--df-text)] disabled:opacity-40"
          >
            <X size={20} />
          </button>
        </div>

        {success ? (
          <div className="px-6 py-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center border border-[var(--df-accent)]">
              <CheckCircle2
                size={23}
                className="text-[var(--df-accent)]"
              />
            </div>

            <h3 className="mt-5 text-lg font-semibold">
              Invitation sent
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--df-muted)]">
              The invitation has been created and the recruiter will recivied
              the notification and email.
            </p>

            <button
              type="button"
              onClick={onClose}
              className="mt-7 border border-[var(--df-text)] px-5 py-2.5 text-sm font-medium"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="p-6">
            {submitError && (
              <div className="mb-5 flex items-start gap-3 border border-[var(--df-line)] bg-[#f4eee8] p-4 text-sm">
                <AlertCircle
                  size={17}
                  className="mt-0.5 shrink-0"
                />

                <span>{submitError}</span>
              </div>
            )}

            <div className="grid gap-5 sm:grid-cols-2">
              <Field
                label="Recruiter email"
                value={form.email}
                onChange={(value) => onChange("email", value)}
                type="email"
                required
              />

              <Field
                label="Role title"
                value={form.roleTitle}
                onChange={(value) => onChange("roleTitle", value)}
                required
              />

              <SelectField
                label="Employment type"
                value={form.employmentType}
                onChange={(value) =>
                  onChange("employmentType", value)
                }
                options={EMPLOYMENT_TYPES}
                required
              />

              <SelectField
                label="Currency"
                value={form.currency}
                onChange={(value) => onChange("currency", value)}
                options={CURRENCIES}
                required
              />

              <Field
                label="Salary"
                value={form.salary}
                onChange={(value) => onChange("salary", value)}
                type="number"
                min="0"
                placeholder="Optional"
              />

              <div className="flex items-end">
                <div className="w-full border border-[var(--df-line)] p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--df-muted)]">
                    Invitation expires
                  </p>

                  <p className="mt-2 text-sm">
                    24 hours after creation
                  </p>
                </div>
              </div>
            </div>

            <label className="mt-5 block">
              <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--df-muted)]">
                Description
              </span>

              <textarea
                rows={5}
                value={form.description}
                onChange={(e) =>
                  onChange("description", e.target.value)
                }
                placeholder="Explain the role, expectations and why you are inviting this recruiter..."
                className="w-full resize-none border border-[var(--df-line)] bg-transparent p-3 text-sm leading-6 outline-none focus:border-[var(--df-text)]"
              />
            </label>

            <div className="mt-7 flex flex-col-reverse gap-3 border-t border-[var(--df-line)] pt-5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="border border-[var(--df-line)] px-5 py-2.5 text-sm font-medium disabled:opacity-40"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center justify-center gap-2 border border-[var(--df-text)] bg-[var(--df-text)] px-5 py-2.5 text-sm font-medium text-[var(--df-paper)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <LoaderCircle size={16} className="animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    Send invitation
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required = false,
  min,
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--df-muted)]">
        {label}
      </span>

      <input
        type={type}
        min={min}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-11 w-full border border-[var(--df-line)] bg-transparent px-3 text-sm outline-none focus:border-[var(--df-text)] placeholder:text-[var(--df-muted)]"
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  required = false,
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--df-muted)]">
        {label}
      </span>

      <select
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 w-full border border-[var(--df-line)] bg-[var(--df-paper)] px-3 text-sm outline-none focus:border-[var(--df-text)]"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option.replaceAll("_", " ")}
          </option>
        ))}
      </select>
    </label>
  );
}

function DetailSkeleton() {
  return (
    <main className="min-h-screen bg-[var(--df-paper)]">
      <div className="mx-auto max-w-[1250px] animate-pulse px-4 py-8 sm:px-6 lg:px-8">
        <div className="h-4 w-32 bg-[#e9e5dd]" />

        <div className="mt-8 flex gap-5 border-b border-[var(--df-line)] pb-8">
          <div className="h-20 w-20 bg-[#e9e5dd]" />

          <div className="space-y-3">
            <div className="h-8 w-64 bg-[#e9e5dd]" />
            <div className="h-4 w-40 bg-[#e9e5dd]" />
            <div className="h-3 w-72 bg-[#e9e5dd]" />
          </div>
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_330px]">
          <div className="space-y-8">
            <div className="h-40 bg-[#e9e5dd]" />
            <div className="h-44 bg-[#e9e5dd]" />
            <div className="h-32 bg-[#e9e5dd]" />
          </div>

          <div className="h-64 bg-[#e9e5dd]" />
        </div>
      </div>
    </main>
  );
}