"use client";

import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  Check,
  CircleHelp,
  ExternalLink,
  Globe2,
  MapPin,
  UserRound,
} from "lucide-react";

import { createRecruiterProfile } from "@/lib/redux/slices/recruiterSlice";
import { FiGithub } from "react-icons/fi";
import DevFlowLogo from "@/components/brand/DevFlowLogo";

const initialForm = {
  jobTitle: "",
  yearsOfExp: "",
  locationPreference: "",
  bio: "",
  description: "",
  githubUrl: "",
  portfolioUrl: "",
};

const locations = [
  {
    value: "REMOTE",
    label: "Remote",
    description: "Work remotely with your team.",
    icon: Globe2,
  },
  {
    value: "ONSITE",
    label: "On-site",
    description: "Work primarily from an office.",
    icon: MapPin,
  },
  {
    value: "HYBRID",
    label: "Hybrid",
    description: "Split time between remote and office.",
    icon: BriefcaseBusiness,
  },
];

export default function CreateRecruiterProfilePage() {
  const router = useRouter();
  const dispatch = useDispatch();

  const { submitting, submitError } = useSelector(
    (state) => state.recruiter
  );

  const { user, isAuthenticated, isInitialized } = useSelector(
    (state) => state.auth
  );

  const [form, setForm] = useState(initialForm);
  const [createCompany, setCreateCompany] = useState(false);
  const [errors, setErrors] = useState({});

  const completedFields = useMemo(() => {
    const required = [
      form.jobTitle.trim(),
      form.locationPreference,
    ];

    return required.filter(Boolean).length;
  }, [form.jobTitle, form.locationPreference]);

  const progress = Math.round((completedFields / 2) * 100);

  const updateField = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setErrors((current) => ({
      ...current,
      [field]: "",
    }));
  };

  useEffect(() => {
    if (user?.recruiterProfile?.id && user?.recruiterProfile?.company?.id && user?.role === "RECRUITER") {
      router.replace("/dashboard/recruiter");
    } else if (user?.recruiterProfile?.id && user?.role === "RECRUITER") {
      router.replace("/dashboard/independent-recruiter");
    }
  }, [user?.recruiterProfile, user?.role, router]);

  useEffect(() => {
    if (!isInitialized) return;

    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    if (user?.role !== "RECRUITER") {
      router.replace("/");
    }
  }, [isInitialized, isAuthenticated, user?.role, router]);

  const validate = () => {
    const nextErrors = {};

    if (!form.jobTitle.trim()) {
      nextErrors.jobTitle = "Job title is required.";
    }

    if (
      form.yearsOfExp !== "" &&
      (Number(form.yearsOfExp) < 0 || Number(form.yearsOfExp) > 60)
    ) {
      nextErrors.yearsOfExp = "Enter a valid number between 0 and 60.";
    }

    if (!form.locationPreference) {
      nextErrors.locationPreference =
        "Choose how you usually work.";
    }

    if (form.bio.length > 500) {
      nextErrors.bio = "Bio cannot exceed 500 characters.";
    }

    if (form.description.length > 2000) {
      nextErrors.description =
        "Description cannot exceed 2000 characters.";
    }

    if (
      form.githubUrl &&
      !/^https?:\/\/.+/i.test(form.githubUrl.trim())
    ) {
      nextErrors.githubUrl = "Enter a valid URL.";
    }

    if (
      form.portfolioUrl &&
      !/^https?:\/\/.+/i.test(form.portfolioUrl.trim())
    ) {
      nextErrors.portfolioUrl = "Enter a valid URL.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validate()) return;

    const payload = {
      jobTitle: form.jobTitle.trim(),
      yearsOfExp:
        form.yearsOfExp === "" ? null : Number(form.yearsOfExp),
      locationPreference: form.locationPreference,
      bio: form.bio.trim() || null,
      description: form.description.trim() || null,
      githubUrl: form.githubUrl.trim() || null,
      portfolioUrl: form.portfolioUrl.trim() || null,
    };

    try {
      await dispatch(createRecruiterProfile(payload)).unwrap();

      if (createCompany) {
        router.push("/create-profile/recruiter/company");
      } else {
        router.push("/dashboard/independent-recruiter");
      }
    } catch {
      // Error is already stored in recruiterSlice.submitError
    }
  };

  if (!isInitialized || !isAuthenticated || user?.role !== "RECRUITER") {
    return (
      <main className="min-h-screen bg-[var(--df-paper)]">
        <div className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-5">
          <div className="text-center">
            <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-[var(--df-line)] border-t-[var(--df-text)]" />
            <p className="mt-4 text-sm text-[var(--df-muted)]">
              Preparing your profile setup...
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--df-paper)] text-[var(--df-text)]">
      <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
        {/* Top navigation */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            aria-label="DevFlow home"
            className="flex items-center"
          >
            <DevFlowLogo size="header" />
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-medium text-[var(--df-muted)] transition-colors hover:text-[var(--df-text)]"
          >
            <ArrowLeft size={14} />
            Exit setup
          </Link>
        </div>

        {/* Progress */}
        <div className="mt-8 border border-[var(--df-line)] bg-[var(--df-paper)]">
          <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-5">
            <div>
              <p className="text-xs font-semibold">
                Recruiter profile
              </p>

              <p className="mt-0.5 text-[11px] text-[var(--df-muted)]">
                Step 1 of 2
              </p>
            </div>

            <div className="text-right">
              <p className="text-[11px] font-medium">
                {progress}% complete
              </p>
            </div>
          </div>

          <div className="h-1 bg-[var(--df-line)]">
            <div
              className="h-full bg-[var(--df-text)] transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Header */}
        <header className="mt-10 sm:mt-12">
          <div className="flex h-11 w-11 items-center justify-center border border-[var(--df-line)] bg-[var(--df-text)] text-[var(--df-paper)]">
            <UserRound size={19} />
          </div>

          <h1 className="mt-5 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
            Create your recruiter profile
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--df-muted)]">
            Give developers enough context to understand who they
            will be working with. You can change these details later.
          </p>
        </header>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-8">
          {/* Professional information */}
          <section className="border border-[var(--df-line)] bg-[var(--df-paper)]">
            <SectionHeader
              title="Professional information"
              description="Start with the basics about your recruiting role."
            />

            <div className="space-y-6 border-t border-[var(--df-line)] p-5 sm:p-7">
              <div className="grid gap-6 sm:grid-cols-2">
                <Field
                  label="Job title"
                  required
                  error={errors.jobTitle}
                  hint="Required"
                >
                  <input
                    value={form.jobTitle}
                    onChange={(e) =>
                      updateField("jobTitle", e.target.value)
                    }
                    placeholder="Senior Technical Recruiter"
                    className={inputClass(!!errors.jobTitle)}
                  />
                </Field>

                <Field
                  label="Years of experience"
                  error={errors.yearsOfExp}
                  hint="Optional"
                >
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max="60"
                      step="0.1"
                      value={form.yearsOfExp}
                      onChange={(e) =>
                        updateField("yearsOfExp", e.target.value)
                      }
                      placeholder="4"
                      className={`${inputClass(
                        !!errors.yearsOfExp
                      )} pr-20`}
                    />

                    <span className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-xs text-[var(--df-muted)]">
                      years
                    </span>
                  </div>
                </Field>
              </div>

              <Field
                label="Short bio"
                hint={`${form.bio.length}/500`}
                error={errors.bio}
              >
                <textarea
                  value={form.bio}
                  onChange={(e) =>
                    updateField("bio", e.target.value)
                  }
                  maxLength={500}
                  rows={4}
                  placeholder="A short introduction about your recruiting background..."
                  className={`${textareaClass(!!errors.bio)} resize-none`}
                />
              </Field>

              <Field
                label="Professional description"
                hint={`${form.description.length}/2000`}
                error={errors.description}
              >
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    updateField("description", e.target.value)
                  }
                  maxLength={2000}
                  rows={6}
                  placeholder="Tell developers about the teams you hire for, your recruiting experience, and the type of talent you work with..."
                  className={`${textareaClass(
                    !!errors.description
                  )} resize-none`}
                />
              </Field>
            </div>
          </section>

          {/* Work preference */}
          <section className="mt-5 border border-[var(--df-line)] bg-[var(--df-paper)]">
            <SectionHeader
              title="How do you work?"
              description="Choose the work arrangement that best represents your role."
              required
            />

            <div className="border-t border-[var(--df-line)] p-5 sm:p-7">
              <div className="grid gap-3 sm:grid-cols-3">
                {locations.map((location) => {
                  const selected =
                    form.locationPreference === location.value;

                  const Icon = location.icon;

                  return (
                    <button
                      key={location.value}
                      type="button"
                      onClick={() =>
                        updateField(
                          "locationPreference",
                          location.value
                        )
                      }
                      className={`relative min-h-[150px] border p-4 text-left transition-all ${
                        selected
                          ? "border-[var(--df-text)] bg-[var(--df-text)] text-[var(--df-paper)]"
                          : "border-[var(--df-line)] hover:border-[var(--df-text)]"
                      }`}
                    >
                      {selected && (
                        <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--df-paper)] text-[var(--df-text)]">
                          <Check size={12} strokeWidth={3} />
                        </span>
                      )}

                      <Icon
                        size={19}
                        className={
                          selected
                            ? "text-[var(--df-paper)]"
                            : "text-[var(--df-muted)]"
                        }
                      />

                      <p className="mt-8 text-sm font-semibold">
                        {location.label}
                      </p>

                      <p
                        className={`mt-2 text-xs leading-5 ${
                          selected
                            ? "text-[var(--df-paper)]/70"
                            : "text-[var(--df-muted)]"
                        }`}
                      >
                        {location.description}
                      </p>
                    </button>
                  );
                })}
              </div>

              {errors.locationPreference && (
                <p className="mt-3 text-xs font-medium text-red-600">
                  {errors.locationPreference}
                </p>
              )}
            </div>
          </section>

          {/* Links */}
          <section className="mt-5 border border-[var(--df-line)] bg-[var(--df-paper)]">
            <SectionHeader
              title="Professional links"
              description="Optional. Add links that help people learn more about you."
            />

            <div className="grid gap-6 border-t border-[var(--df-line)] p-5 sm:grid-cols-2 sm:p-7">
              <Field
                label="GitHub"
                hint="Optional"
                error={errors.githubUrl}
              >
                <div className="relative">
                  <FiGithub
                    size={16}
                    className="absolute left-0 top-1/2 -translate-y-1/2 text-[var(--df-muted)]"
                  />

                  <input
                    type="url"
                    value={form.githubUrl}
                    onChange={(e) =>
                      updateField("githubUrl", e.target.value)
                    }
                    placeholder="https://github.com/..."
                    className={`${inputClass(
                      !!errors.githubUrl
                    )} pl-7`}
                  />
                </div>
              </Field>

              <Field
                label="Portfolio"
                hint="Optional"
                error={errors.portfolioUrl}
              >
                <div className="relative">
                  <ExternalLink
                    size={16}
                    className="absolute left-0 top-1/2 -translate-y-1/2 text-[var(--df-muted)]"
                  />

                  <input
                    type="url"
                    value={form.portfolioUrl}
                    onChange={(e) =>
                      updateField("portfolioUrl", e.target.value)
                    }
                    placeholder="https://..."
                    className={`${inputClass(
                      !!errors.portfolioUrl
                    )} pl-7`}
                  />
                </div>
              </Field>
            </div>
          </section>

          {/* Company */}
          <section className="mt-5 border border-[var(--df-line)] bg-[var(--df-paper)]">
            <SectionHeader
              title="Company setup"
              description="Choose whether you want to create a company now."
            />

            <div className="border-t border-[var(--df-line)] p-5 sm:p-7">
              <button
                type="button"
                onClick={() =>
                  setCreateCompany((current) => !current)
                }
                className={`flex w-full items-start gap-4 border p-4 text-left transition-all sm:p-5 ${
                  createCompany
                    ? "border-[var(--df-text)] bg-[var(--df-text)] text-[var(--df-paper)]"
                    : "border-[var(--df-line)] hover:border-[var(--df-text)]"
                }`}
              >
                <span
                  className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center border ${
                    createCompany
                      ? "border-[var(--df-paper)] bg-[var(--df-paper)] text-[var(--df-text)]"
                      : "border-[var(--df-line)]"
                  }`}
                >
                  {createCompany && <Check size={14} />}
                </span>

                <span className="min-w-0">
                  <span className="flex items-center gap-2 text-sm font-semibold">
                    <BriefcaseBusiness size={16} />
                    Create a company
                  </span>

                  <span
                    className={`mt-2 block text-xs leading-5 ${
                      createCompany
                        ? "text-[var(--df-paper)]/70"
                        : "text-[var(--df-muted)]"
                    }`}
                  >
                    I manage a company and want to add its details
                    after creating my recruiter profile.
                  </span>
                </span>
              </button>

              <div className="mt-4 flex gap-2 text-xs text-[var(--df-muted)]">
                <CircleHelp size={14} className="mt-0.5 shrink-0" />

                <p>
                  You can also join an existing company later through
                  an invitation.
                </p>
              </div>
            </div>
          </section>

          {/* Error */}
          {submitError && (
            <div className="mt-5 flex gap-3 border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <span className="font-semibold">Error:</span>
              <span>{submitError}</span>
            </div>
          )}

          {/* Submit */}
          <div className="mt-6 border border-[var(--df-line)] bg-[var(--df-paper)] p-4 sm:p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold">
                  Ready to continue?
                </p>

                <p className="mt-1 text-xs text-[var(--df-muted)]">
                  {createCompany
                    ? "Next, you'll add your company information."
                    : "You can complete your company setup later."}
                </p>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex h-11 w-full items-center justify-center gap-2 bg-[var(--df-text)] px-6 text-xs font-semibold text-[var(--df-paper)] transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >
                {submitting
                  ? "Creating profile..."
                  : createCompany
                  ? "Continue to company"
                  : "Create recruiter profile"}

                {!submitting && <ArrowRight size={15} />}
              </button>
            </div>
          </div>

          <p className="mx-auto mt-5 max-w-lg text-center text-[11px] leading-5 text-[var(--df-muted)]">
            Your profile can be edited later from your recruiter
            dashboard.
          </p>
        </form>
      </div>
    </main>
  );
}

function SectionHeader({ title, description, required }) {
  return (
    <div className="flex flex-col gap-1.5 px-5 py-5 sm:px-7 sm:py-6">
      <div className="flex items-center gap-2">
        <h2 className="text-base font-semibold tracking-[-0.02em]">
          {title}
        </h2>

        {required && (
          <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-[var(--df-muted)]">
            Required
          </span>
        )}
      </div>

      <p className="max-w-2xl text-xs leading-5 text-[var(--df-muted)]">
        {description}
      </p>
    </div>
  );
}

function Field({
  label,
  required,
  hint,
  error,
  children,
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <label className="text-xs font-semibold">
          {label}

          {required && (
            <span className="ml-1 text-red-600">*</span>
          )}
        </label>

        {hint && (
          <span
            className={`text-[10px] ${
              error
                ? "text-red-600"
                : "text-[var(--df-muted)]"
            }`}
          >
            {hint}
          </span>
        )}
      </div>

      {children}

      {error && (
        <p className="mt-2 text-xs font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

function inputClass(hasError = false) {
  return `h-11 w-full border bg-transparent px-3 text-sm outline-none transition-colors placeholder:text-[var(--df-muted)]/60 ${
    hasError
      ? "border-red-500 focus:border-red-600"
      : "border-[var(--df-line)] focus:border-[var(--df-text)]"
  }`;
}

function textareaClass(hasError = false) {
  return `w-full border bg-transparent px-3 py-3 text-sm leading-6 outline-none transition-colors placeholder:text-[var(--df-muted)]/60 ${
    hasError
      ? "border-red-500 focus:border-red-600"
      : "border-[var(--df-line)] focus:border-[var(--df-text)]"
  }`;
}
