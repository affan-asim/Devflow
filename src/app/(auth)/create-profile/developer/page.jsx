
"use client";

import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  BriefcaseBusiness,
  ChevronDown,
  Globe,
  MapPin,
  Search,
  UserRound,
  X,
  Check,
} from "lucide-react";
import { FiGithub } from "react-icons/fi";
import DevFlowLogo from "@/components/brand/DevFlowLogo";

import { createDeveloperProfile } from "@/lib/redux/slices/developerSlice";
import { fetchSkills } from "@/lib/redux/slices/skillSlice";

const LOCATION_OPTIONS = [
  {
    value: "REMOTE",
    label: "Remote",
    description: "Work from anywhere",
  },
  {
    value: "HYBRID",
    label: "Hybrid",
    description: "Remote + office",
  },
  {
    value: "ONSITE",
    label: "On-site",
    description: "Work from an office",
  },
];

const EXPERIENCE_OPTIONS = [
  { value: "0", label: "Less than 1 year" },
  { value: "1", label: "1 year" },
  { value: "2", label: "2 years" },
  { value: "3", label: "3 years" },
  { value: "4", label: "4 years" },
  { value: "5", label: "5 years" },
  { value: "6", label: "6 years" },
  { value: "7", label: "7 years" },
  { value: "8", label: "8 years" },
  { value: "9", label: "9 years" },
  { value: "10", label: "10+ years" },
];

function FieldLabel({ children, required = false }) {
  return (
    <label className="mb-2.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--df-muted)]">
      {children}

      {required && (
        <span className="ml-1 text-[var(--df-accent)]">*</span>
      )}
    </label>
  );
}

function SectionLabel({ eyebrow, title, description }) {
  return (
    <div className="mb-7">
      <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--df-muted)]">
        {eyebrow}
      </div>

      <h2 className="text-base font-semibold tracking-tight text-[var(--df-text)]">
        {title}
      </h2>

      {description && (
        <p className="mt-1.5 max-w-xl text-xs leading-5 text-[var(--df-muted)]">
          {description}
        </p>
      )}
    </div>
  );
}

function InputShell({ icon: Icon, children }) {
  return (
    <div className="relative">
      {Icon && (
        <Icon className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--df-muted)]" />
      )}

      {children}
    </div>
  );
}

function SnapshotRow({ label, value, muted = false }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[var(--df-line)] py-3.5 last:border-b-0">
      <span className="text-xs text-[var(--df-muted)]">{label}</span>

      <span
        className={`max-w-[170px] truncate text-right text-xs font-medium ${muted
          ? "text-[var(--df-muted)]"
          : "text-[var(--df-text)]"
          }`}
      >
        {value}
      </span>
    </div>
  );
}

function SnapshotSection({ title, children }) {
  return (
    <div className="border-t border-[var(--df-line)] pt-6">
      <div className="mb-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--df-muted)]">
        {title}
      </div>

      {children}
    </div>
  );
}

export default function DeveloperProfileCreationPage() {
  const router = useRouter();
  const dispatch = useDispatch();

  const { user, isAuthenticated, isInitialized } = useSelector(
    (state) => state.auth
  );

  const { submitting, submitError } = useSelector(
    (state) => state.developers
  );

  const {
    skills,
    loadingList: loadingSkills,
    errorList: skillsError,
  } = useSelector((state) => state.skills);

  const [form, setForm] = useState({
    bio: "",
    githubUrl: "",
    portfolioUrl: "",
    yearsOfExp: "",
    locationPreference: "",
    skills: [],
  });

  const [skillSearch, setSkillSearch] = useState("");
  const [showSkillDropdown, setShowSkillDropdown] = useState(false);
  const [validationError, setValidationError] = useState("");

  useEffect(() => {
    if (user?.developerProfile?.id && user?.role === "DEVELOPER") {
      router.replace("/dashboard/developer");
    }
  }, [user?.developerProfile, user?.role])

  /*
   * --------------------------------------------------
   * AUTH / ROLE GUARD
   * --------------------------------------------------
   */

  useEffect(() => {
    if (!isInitialized) return;

    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    if (user?.role !== "DEVELOPER") {
      router.replace("/");
    }
  }, [isInitialized, isAuthenticated, user?.role, router]);

  /*
   * --------------------------------------------------
   * LOAD SKILLS
   * --------------------------------------------------
   */

  useEffect(() => {
    if (
      !isInitialized ||
      !isAuthenticated ||
      user?.role !== "DEVELOPER"
    ) {
      return;
    }

    dispatch(
      fetchSkills({
        page: 1,
        limit: 100,
      })
    );
  }, [dispatch, isInitialized, isAuthenticated, user?.role]);

  /*
   * --------------------------------------------------
   * FILTER SKILLS
   * --------------------------------------------------
   */

  const filteredSkills = useMemo(() => {
    const query = skillSearch.trim().toLowerCase();

    return skills
      .filter(
        (skill) =>
          !form.skills.some(
            (selectedSkill) => selectedSkill.id === skill.id
          )
      )
      .filter((skill) => {
        if (!query) return true;

        return (
          skill.name?.toLowerCase().includes(query) ||
          skill.category?.toLowerCase().includes(query)
        );
      })
      .slice(0, 12);
  }, [skills, form.skills, skillSearch]);

  /*
   * --------------------------------------------------
   * HELPERS
   * --------------------------------------------------
   */

  const updateField = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));

    setValidationError("");
  };

  const toggleSkill = (skill) => {
    setForm((previous) => {
      const exists = previous.skills.some(
        (selectedSkill) => selectedSkill.id === skill.id
      );

      return {
        ...previous,
        skills: exists
          ? previous.skills.filter(
            (selectedSkill) => selectedSkill.id !== skill.id
          )
          : [...previous.skills, skill],
      };
    });

    setSkillSearch("");
    setShowSkillDropdown(false);
    setValidationError("");
  };

  const removeSkill = (skillId) => {
    setForm((previous) => ({
      ...previous,
      skills: previous.skills.filter(
        (skill) => skill.id !== skillId
      ),
    }));
  };

  /*
   * --------------------------------------------------
   * PROFILE COMPLETION
   * --------------------------------------------------
   */

  const requiredFields = [
    Boolean(form.bio.trim()),
    Boolean(form.yearsOfExp),
    Boolean(form.locationPreference),
    form.skills.length > 0,
  ];

  const completedFields = requiredFields.filter(Boolean).length;

  const completionPercentage = Math.round(
    (completedFields / requiredFields.length) * 100
  );

  /*
   * --------------------------------------------------
   * VALIDATION
   * --------------------------------------------------
   */

  const isValidUrl = (value) => {
    try {
      const url = new URL(value);

      return ["http:", "https:"].includes(url.protocol);
    } catch {
      return false;
    }
  };

  const validateForm = () => {
    if (!form.bio.trim()) {
      return "Tell employers a little about yourself.";
    }

    if (form.bio.trim().length < 30) {
      return "Your bio should be at least 30 characters.";
    }

    if (!form.yearsOfExp) {
      return "Select your years of experience.";
    }

    if (!form.locationPreference) {
      return "Select your preferred work location.";
    }

    if (form.skills.length === 0) {
      return "Add at least one skill.";
    }

    if (form.githubUrl && !isValidUrl(form.githubUrl)) {
      return "Enter a valid GitHub URL.";
    }

    if (form.portfolioUrl && !isValidUrl(form.portfolioUrl)) {
      return "Enter a valid portfolio URL.";
    }

    return null;
  };

  /*
   * --------------------------------------------------
   * SUBMIT
   * --------------------------------------------------
   */

  const handleSubmit = async (event) => {
    event.preventDefault();

    const error = validateForm();

    if (error) {
      setValidationError(error);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      return;
    }

    const payload = {
      bio: form.bio.trim(),
      githubUrl: form.githubUrl.trim() || undefined,
      portfolioUrl: form.portfolioUrl.trim() || undefined,
      yearsOfExp: Number(form.yearsOfExp),
      locationPreference: form.locationPreference,

      skills: form.skills.map((skill) => ({
        name: skill.name,
        category: skill.category,
      })),
    };

    try {
      const result = await dispatch(
        createDeveloperProfile(payload)
      ).unwrap();

      if (result?.data) {
        router.replace("/dashboard/developer");
      }
    } catch {
      // Redux handles submitError.
    }
  };

  /*
   * --------------------------------------------------
   * LOADING
   * --------------------------------------------------
   */

  if (
    !isInitialized ||
    !isAuthenticated ||
    user?.role !== "DEVELOPER"
  ) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--df-paper)]">
        <div className="h-5 w-5 animate-spin border-2 border-[var(--df-line)] border-t-[var(--df-accent)]" />
      </div>
    );
  }

  const experienceLabel = form.yearsOfExp
    ? EXPERIENCE_OPTIONS.find(
      (item) => item.value === form.yearsOfExp
    )?.label
    : "Not selected";

  const locationLabel = form.locationPreference
    ? LOCATION_OPTIONS.find(
      (item) => item.value === form.locationPreference
    )?.label
    : "Not selected";

  return (
    <main className="min-h-screen bg-[var(--df-paper)] text-[var(--df-text)]">
      {/* =====================================================
          HEADER
      ====================================================== */}

      <header className="border-b border-[var(--df-line)]">
        <div className="mx-auto flex h-16 max-w-[1240px] items-center justify-between px-5 sm:px-8 lg:px-10">
          <Link
            href="/"
            aria-label="DevFlow home"
            className="flex items-center"
          >
            <DevFlowLogo size="header" />
          </Link>

          <div className="flex items-center gap-4">
            <div className="hidden text-right sm:block">
              <p className="text-[10px] uppercase tracking-[0.14em] text-[var(--df-muted)]">
                Profile setup
              </p>

              <p className="mt-0.5 text-xs font-medium">
                Developer
              </p>
            </div>

            <div className="h-8 w-px bg-[var(--df-line)]" />

            <div className="flex items-center gap-2">
              <span className="text-xs font-medium">
                {completedFields}/{requiredFields.length}
              </span>

              <span className="hidden text-xs text-[var(--df-muted)] sm:inline">
                complete
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* =====================================================
          PAGE
      ====================================================== */}

      <div className="mx-auto max-w-[1240px] px-5 py-8 sm:px-8 sm:py-12 lg:px-10 lg:py-14">
        {/* =================================================
            PAGE INTRO
        ================================================== */}

        <div className="max-w-3xl">
          <div className="mb-4 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--df-muted)]">
            <UserRound className="h-3.5 w-3.5" />

            Developer profile
          </div>

          <h1 className="text-3xl font-semibold tracking-[-0.03em] sm:text-4xl lg:text-5xl">
            Create your developer profile.
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-6 text-[var(--df-muted)] sm:text-base">
            Tell companies what you build, what you know, and
            where you work best. You can update everything later
            from your dashboard.
          </p>
        </div>

        {/* =================================================
            COMPLETION BAR
        ================================================== */}

        <div className="mt-8 max-w-3xl border-y border-[var(--df-line)] py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium">
                Profile completion
              </span>

              <span className="text-xs text-[var(--df-muted)]">
                {completedFields} of {requiredFields.length} required
              </span>
            </div>

            <span className="text-xs font-medium">
              {completionPercentage}%
            </span>
          </div>

          <div className="mt-3 h-1 w-full bg-[var(--df-line)]">
            <div
              className="h-full bg-[var(--df-text)] transition-all duration-300"
              style={{
                width: `${completionPercentage}%`,
              }}
            />
          </div>
        </div>

        {/* =================================================
            ERROR
        ================================================== */}

        {(validationError || submitError) && (
          <div className="mt-6 max-w-3xl border-l-2 border-red-500 bg-red-500/[0.04] px-4 py-3">
            <div className="flex items-start gap-3 text-sm text-red-600">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 bg-red-500" />

              <span>{validationError || submitError}</span>
            </div>
          </div>
        )}

        {/* =================================================
            MAIN LAYOUT
        ================================================== */}

        <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-10">
          {/* =================================================
              FORM
          ================================================== */}

          <form
            onSubmit={handleSubmit}
            className="min-w-0 border border-[var(--df-line)]"
          >
            {/* =================================================
                ABOUT
            ================================================== */}

            <section className="border-b border-[var(--df-line)] p-5 sm:p-7 lg:p-8">
              <SectionLabel
                eyebrow="About"
                title="Tell companies about yourself"
                description="Give employers a concise introduction to who you are and what you build."
              />

              <FieldLabel required>
                Professional bio
              </FieldLabel>

              <textarea
                value={form.bio}
                onChange={(event) =>
                  updateField("bio", event.target.value)
                }
                placeholder="Example: Full-stack JavaScript developer focused on building reliable SaaS products with React, Next.js and Node.js..."
                rows={6}
                maxLength={1000}
                className="w-full resize-none border border-[var(--df-line)] bg-transparent px-4 py-3.5 text-sm leading-6 outline-none transition placeholder:text-[var(--df-muted)]/50 focus:border-[var(--df-accent)]"
              />

              <div className="mt-2.5 flex justify-between gap-4 text-[10px] text-[var(--df-muted)]">
                <span>
                  Minimum 30 characters.
                </span>

                <span>{form.bio.length}/1000</span>
              </div>
            </section>

            {/* =================================================
                EXPERIENCE
            ================================================== */}

            <section className="border-b border-[var(--df-line)] p-5 sm:p-7 lg:p-8">
              <SectionLabel
                eyebrow="Experience"
                title="Experience & work preference"
                description="Help companies understand your experience level and preferred working environment."
              />

              <div className="grid gap-6 sm:grid-cols-2">
                {/* EXPERIENCE */}

                <div>
                  <FieldLabel required>
                    Years of experience
                  </FieldLabel>

                  <InputShell icon={BriefcaseBusiness}>
                    <select
                      value={form.yearsOfExp}
                      onChange={(event) =>
                        updateField(
                          "yearsOfExp",
                          event.target.value
                        )
                      }
                      className="h-12 w-full appearance-none border border-[var(--df-line)] bg-transparent pl-10 pr-10 text-sm outline-none transition focus:border-[var(--df-accent)]"
                    >
                      <option value="">
                        Select experience
                      </option>

                      {EXPERIENCE_OPTIONS.map((option) => (
                        <option
                          key={option.value}
                          value={option.value}
                        >
                          {option.label}
                        </option>
                      ))}
                    </select>

                    <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--df-muted)]" />
                  </InputShell>
                </div>

                {/* LOCATION */}

                <div>
                  <FieldLabel required>
                    Work preference
                  </FieldLabel>

                  <InputShell icon={MapPin}>
                    <select
                      value={form.locationPreference}
                      onChange={(event) =>
                        updateField(
                          "locationPreference",
                          event.target.value
                        )
                      }
                      className="h-12 w-full appearance-none border border-[var(--df-line)] bg-transparent pl-10 pr-10 text-sm outline-none transition focus:border-[var(--df-accent)]"
                    >
                      <option value="">
                        Select preference
                      </option>

                      {LOCATION_OPTIONS.map((option) => (
                        <option
                          key={option.value}
                          value={option.value}
                        >
                          {option.label} — {option.description}
                        </option>
                      ))}
                    </select>

                    <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--df-muted)]" />
                  </InputShell>
                </div>
              </div>
            </section>

            {/* =================================================
                SKILLS
            ================================================== */}

            <section className="border-b border-[var(--df-line)] p-5 sm:p-7 lg:p-8">
              <SectionLabel
                eyebrow="Skills"
                title="What do you work with?"
                description="Choose the technologies and skills you want companies to discover you for."
              />

              {/* SELECTED SKILLS */}

              {form.skills.length > 0 && (
                <div className="mb-6">
                  <FieldLabel>
                    Selected skills
                  </FieldLabel>

                  <div className="flex flex-wrap gap-2">
                    {form.skills.map((skill) => (
                      <button
                        key={skill.id}
                        type="button"
                        onClick={() => removeSkill(skill.id)}
                        className="group inline-flex items-center gap-2 border border-[var(--df-line)] bg-[var(--df-text)] px-3 py-2 text-xs font-medium text-[var(--df-paper)] transition hover:opacity-80"
                      >
                        {skill.name}

                        <X className="h-3 w-3 opacity-60 transition group-hover:opacity-100" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* SEARCH */}

              <FieldLabel required={form.skills.length === 0}>
                Add skills
              </FieldLabel>

              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--df-muted)]" />

                <input
                  type="text"
                  value={skillSearch}
                  onFocus={() =>
                    setShowSkillDropdown(true)
                  }
                  onChange={(event) => {
                    setSkillSearch(event.target.value);
                    setShowSkillDropdown(true);
                  }}
                  placeholder="Search React, Node.js, TypeScript..."
                  className="h-12 w-full border border-[var(--df-line)] bg-transparent pl-11 pr-4 text-sm outline-none transition placeholder:text-[var(--df-muted)]/50 focus:border-[var(--df-accent)]"
                />

                {showSkillDropdown && (
                  <>
                    <button
                      type="button"
                      aria-label="Close skill search"
                      onClick={() =>
                        setShowSkillDropdown(false)
                      }
                      className="fixed inset-0 z-20 cursor-default"
                    />

                    <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-30 max-h-72 overflow-y-auto border border-[var(--df-line)] bg-[var(--df-paper)] shadow-[0_12px_35px_rgba(0,0,0,0.08)]">
                      {loadingSkills ? (
                        <div className="flex items-center justify-center py-10">
                          <div className="h-4 w-4 animate-spin border-2 border-[var(--df-line)] border-t-[var(--df-accent)]" />
                        </div>
                      ) : skillsError ? (
                        <div className="px-4 py-8 text-center text-sm text-red-500">
                          {skillsError}
                        </div>
                      ) : filteredSkills.length === 0 ? (
                        <div className="px-4 py-8 text-center text-sm text-[var(--df-muted)]">
                          No matching skills found.
                        </div>
                      ) : (
                        filteredSkills.map((skill) => (
                          <button
                            key={skill.id}
                            type="button"
                            onClick={() =>
                              toggleSkill(skill)
                            }
                            className="flex w-full items-center justify-between border-b border-[var(--df-line)] px-4 py-3.5 text-left transition last:border-b-0 hover:bg-[var(--df-text)]/[0.035]"
                          >
                            <div>
                              <p className="text-sm font-medium text-[var(--df-text)]">
                                {skill.name}
                              </p>

                              {skill.category && (
                                <p className="mt-0.5 text-[10px] uppercase tracking-[0.1em] text-[var(--df-muted)]">
                                  {skill.category}
                                </p>
                              )}
                            </div>

                            <ArrowRight className="h-4 w-4 text-[var(--df-muted)]" />
                          </button>
                        ))
                      )}
                    </div>
                  </>
                )}
              </div>

              <div className="mt-2.5 flex items-center justify-between gap-4 text-[10px] text-[var(--df-muted)]">
                <span>
                  Select the skills that best represent your
                  expertise.
                </span>

                <span className="shrink-0">
                  {form.skills.length} selected
                </span>
              </div>
            </section>

            {/* =================================================
                LINKS
            ================================================== */}

            <section className="border-b border-[var(--df-line)] p-5 sm:p-7 lg:p-8">
              <SectionLabel
                eyebrow="Developer links"
                title="Showcase your work"
                description="Optional links that allow recruiters to explore your projects and experience."
              />

              <div className="grid gap-6 sm:grid-cols-2">
                {/* GITHUB */}

                <div>
                  <FieldLabel>
                    GitHub
                  </FieldLabel>

                  <InputShell icon={FiGithub}>
                    <input
                      type="url"
                      value={form.githubUrl}
                      onChange={(event) =>
                        updateField(
                          "githubUrl",
                          event.target.value
                        )
                      }
                      placeholder="https://github.com/yourusername"
                      className="h-12 w-full border border-[var(--df-line)] bg-transparent pl-10 pr-4 text-sm outline-none transition placeholder:text-[var(--df-muted)]/50 focus:border-[var(--df-accent)]"
                    />
                  </InputShell>
                </div>

                {/* PORTFOLIO */}

                <div>
                  <FieldLabel>
                    Portfolio
                  </FieldLabel>

                  <InputShell icon={Globe}>
                    <input
                      type="url"
                      value={form.portfolioUrl}
                      onChange={(event) =>
                        updateField(
                          "portfolioUrl",
                          event.target.value
                        )
                      }
                      placeholder="https://yourportfolio.com"
                      className="h-12 w-full border border-[var(--df-line)] bg-transparent pl-10 pr-4 text-sm outline-none transition placeholder:text-[var(--df-muted)]/50 focus:border-[var(--df-accent)]"
                    />
                  </InputShell>
                </div>
              </div>
            </section>

            {/* =================================================
                SUBMIT
            ================================================== */}

            <div className="bg-[var(--df-text)]/[0.02] p-5 sm:p-7 lg:p-8">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-[var(--df-accent)]" />

                    <p className="text-sm font-medium">
                      Ready to create your profile?
                    </p>
                  </div>

                  <p className="mt-1.5 text-xs leading-5 text-[var(--df-muted)]">
                    You can edit your profile at any time from
                    your dashboard.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="group inline-flex h-12 shrink-0 items-center justify-center gap-7 bg-[var(--df-text)] px-5 text-sm font-medium text-[var(--df-paper)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <span className="h-4 w-4 animate-spin border-2 border-white/30 border-t-white" />

                      Creating profile...
                    </>
                  ) : (
                    <>
                      Create profile

                      <span className="flex h-7 w-7 items-center justify-center bg-[var(--df-paper)] text-[var(--df-text)] transition-transform group-hover:translate-x-1">
                        <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>

          {/* =================================================
              PROFILE SNAPSHOT
          ================================================== */}

          <aside className="hidden lg:block">
            <div className="sticky top-8 border border-[var(--df-line)]">
              {/* SNAPSHOT HEADER */}

              <div className="border-b border-[var(--df-line)] p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--df-muted)]">
                      Profile snapshot
                    </p>

                    <h2 className="mt-2 text-lg font-semibold tracking-tight">
                      {user?.name || "Developer"}
                    </h2>
                  </div>

                  <div className="flex h-9 w-9 items-center justify-center border border-[var(--df-line)] bg-[var(--df-text)] text-xs font-semibold text-[var(--df-paper)]">
                    {user?.name
                      ? user.name.charAt(0).toUpperCase()
                      : "D"}
                  </div>
                </div>

                <p className="mt-4 text-xs leading-5 text-[var(--df-muted)]">
                  This is a quick preview of the information
                  companies will find on your profile.
                </p>
              </div>

              {/* BASIC INFO */}

              <div className="px-6">
                <SnapshotSection title="Overview">
                  <SnapshotRow
                    label="Role"
                    value="Developer"
                  />

                  <SnapshotRow
                    label="Experience"
                    value={experienceLabel}
                    muted={!form.yearsOfExp}
                  />

                  <SnapshotRow
                    label="Work preference"
                    value={locationLabel}
                    muted={!form.locationPreference}
                  />
                </SnapshotSection>

                {/* SKILLS */}

                <SnapshotSection title="Skills">
                  {form.skills.length > 0 ? (
                    <div className="flex flex-wrap gap-2 pb-6">
                      {form.skills.slice(0, 6).map((skill) => (
                        <span
                          key={skill.id}
                          className="border border-[var(--df-line)] px-2.5 py-1.5 text-[10px] font-medium"
                        >
                          {skill.name}
                        </span>
                      ))}

                      {form.skills.length > 6 && (
                        <span className="px-1.5 py-1.5 text-[10px] text-[var(--df-muted)]">
                          +{form.skills.length - 6} more
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="pb-6 text-xs text-[var(--df-muted)]">
                      No skills selected yet.
                    </div>
                  )}
                </SnapshotSection>

                {/* BIO */}

                <SnapshotSection title="Bio">
                  <div className="pb-6">
                    {form.bio.trim() ? (
                      <p className="line-clamp-5 text-xs leading-5 text-[var(--df-muted)]">
                        {form.bio}
                      </p>
                    ) : (
                      <p className="text-xs text-[var(--df-muted)]">
                        Your professional introduction will appear
                        here.
                      </p>
                    )}
                  </div>
                </SnapshotSection>

                {/* LINKS */}

                <SnapshotSection title="Links">
                  <div className="space-y-3 pb-6">
                    {form.githubUrl ? (
                      <div className="flex items-center gap-2 text-xs font-medium">
                        <FiGithub className="h-3.5 w-3.5" />

                        <span className="truncate">
                          GitHub
                        </span>

                        <Check className="ml-auto h-3.5 w-3.5 text-[var(--df-accent)]" />
                      </div>
                    ) : null}

                    {form.portfolioUrl ? (
                      <div className="flex items-center gap-2 text-xs font-medium">
                        <Globe className="h-3.5 w-3.5" />

                        <span className="truncate">
                          Portfolio
                        </span>

                        <Check className="ml-auto h-3.5 w-3.5 text-[var(--df-accent)]" />
                      </div>
                    ) : null}

                    {!form.githubUrl &&
                      !form.portfolioUrl && (
                        <p className="text-xs text-[var(--df-muted)]">
                          Optional links can be added below.
                        </p>
                      )}
                  </div>
                </SnapshotSection>
              </div>

              {/* COMPLETION */}

              <div className="border-t border-[var(--df-line)] bg-[var(--df-text)]/[0.02] p-6">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium">
                    Required information
                  </span>

                  <span className="text-xs font-medium">
                    {completedFields}/{requiredFields.length}
                  </span>
                </div>

                <div className="mt-3 h-1 bg-[var(--df-line)]">
                  <div
                    className="h-full bg-[var(--df-text)] transition-all duration-300"
                    style={{
                      width: `${completionPercentage}%`,
                    }}
                  />
                </div>

                <p className="mt-3 text-[10px] leading-4 text-[var(--df-muted)]">
                  {completionPercentage === 100
                    ? "Everything required is ready. You can create your profile."
                    : "Complete the required fields to create your profile."}
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
