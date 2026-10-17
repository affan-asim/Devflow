"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  FileText,
  Globe2,
  MapPin,
  Sparkles,
  X,
} from "lucide-react";
import { createJob } from "@/lib/redux/slices/jobSlice";
import { fetchSkills } from "@/lib/redux/slices/skillSlice";

const initialForm = {
  title: "",
  description: "",
  employmentType: "",
  experienceLevel: "",
  locationPreference: "",
  currency: "USD",
  minSalary: "",
  maxSalary: "",
  deadline: "",
  skills: [],
  status: "DRAFT",
};

const employmentTypes = [
  { value: "FULLTIME", label: "Full-time" },
  { value: "PARTTIME", label: "Part-time" },
  { value: "CONTRACT", label: "Contract" },
  { value: "INTERN", label: "Internship" },
];

const experienceLevels = [
  { value: "BEGINNER", label: "Beginner", description: "Entry-level experience" },
  {
    value: "INTERMEDIATE",
    label: "Intermediate",
    description: "Some professional experience",
  },
  {
    value: "EXPERT",
    label: "Expert",
    description: "Senior / advanced experience",
  },
];

const locations = [
  { value: "REMOTE", label: "Remote", description: "Work from anywhere" },
  { value: "ONSITE", label: "On-site", description: "Work from your office" },
  { value: "HYBRID", label: "Hybrid", description: "Combination of remote and office" },
];

const currencies = ["USD", "EUR", "PKR", "INR", "GBP", "AED"];

export default function CreateJobPage() {
  const router = useRouter();
  const dispatch = useDispatch();

  const { submitting, submitError } = useSelector(
    (state) => state.jobs
  );

  const { skills: availableSkills = [], loadingList: loadingSkills } = useSelector(
    (state) => state.skills || {}
  );

  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    dispatch(fetchSkills());
  }, [dispatch]);

  const update = (key, value) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));

    setErrors((current) => ({
      ...current,
      [key]: "",
    }));
  };
  const addSkill = (skillId) => {
    if (!skillId) return;

    const selectedObj = availableSkills.find(
      (s) => (typeof s === "object" ? String(s.id) === String(skillId) : s === skillId)
    );

    if (!selectedObj) return;

    const exists = form.skills.some(
      (s) => (s.id && selectedObj.id ? s.id === selectedObj.id : s.name === selectedObj.name)
    );

    if (exists) return;

    const skillObject = typeof selectedObj === "string"
      ? { name: selectedObj }
      : selectedObj;

    setForm((current) => ({
      ...current,
      skills: [...current.skills, skillObject],
    }));

    setErrors((current) => ({
      ...current,
      skills: "",
    }));
  };

  const removeSkill = (targetSkill) => {
    setForm((current) => ({
      ...current,
      skills: current.skills.filter((s) =>
        s.id ? s.id !== targetSkill.id : s.name !== targetSkill.name
      ),
    }));
  };

  const validate = () => {
    const nextErrors = {};

    if (!form.title.trim()) {
      nextErrors.title = "Job title is required.";
    }

    if (!form.description.trim()) {
      nextErrors.description = "Job description is required.";
    }

    if (!form.employmentType) {
      nextErrors.employmentType = "Employment type is required.";
    }

    if (!form.experienceLevel) {
      nextErrors.experienceLevel = "Experience level is required.";
    }

    if (!form.skills || form.skills.length === 0) {
      nextErrors.skills = "At least one skill is required.";
    }

    if (!form.locationPreference) {
      nextErrors.locationPreference = "Work arrangement is required.";
    }

    if (!form.currency.trim()) {
      nextErrors.currency = "Currency is required.";
    }

    if (form.minSalary === "") {
      nextErrors.minSalary = "Minimum salary is required.";
    } else if (
      Number.isNaN(Number(form.minSalary)) ||
      Number(form.minSalary) < 0
    ) {
      nextErrors.minSalary = "Enter a valid minimum salary.";
    }

    if (form.maxSalary === "") {
      nextErrors.maxSalary = "Maximum salary is required.";
    } else if (
      Number.isNaN(Number(form.maxSalary)) ||
      Number(form.maxSalary) < 0
    ) {
      nextErrors.maxSalary = "Enter a valid maximum salary.";
    }

    if (
      form.minSalary !== "" &&
      form.maxSalary !== "" &&
      !Number.isNaN(Number(form.minSalary)) &&
      !Number.isNaN(Number(form.maxSalary)) &&
      Number(form.minSalary) >= Number(form.maxSalary)
    ) {
      nextErrors.maxSalary =
        "Maximum salary must be greater than minimum salary.";
    }

    if (!form.deadline) {
      nextErrors.deadline = "Application deadline is required.";
    } else {
      const deadline = new Date(form.deadline);
      if (deadline <= new Date()) {
        nextErrors.deadline = "Deadline must be in the future.";
      }
    }

    return nextErrors;
  };

  const submit = async (e) => {
    e.preventDefault();

    const validationErrors = validate();

    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);

      const firstError = Object.keys(validationErrors)[0];
      document
        .querySelector(`[data-field="${firstError}"]`)
        ?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });

      return;
    }

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      employmentType: form.employmentType,
      experienceLevel: form.experienceLevel,
      locationPreference: form.locationPreference,
      currency: form.currency.trim().toUpperCase(),
      minSalary: Number(form.minSalary),
      maxSalary: Number(form.maxSalary),
      deadline: new Date(form.deadline).toISOString(),
      skills: form.skills,
      status: form.status,
    };

    try {
      const result = await dispatch(createJob(payload)).unwrap();
      const createdJob = result?.data;

      if (createdJob?.id) {
        router.replace(`/dashboard/recruiter/jobs/${createdJob.id}`);
      } else {
        router.replace("/dashboard/recruiter/jobs");
      }
    } catch {
      // Redux stores submitError.
    }
  };

  return (
    <main className="min-h-screen bg-[var(--df-paper)] text-[var(--df-text)]">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        {/* Top navigation */}
        <div className="flex items-center justify-between border-b border-[var(--df-line)] pb-5">
          <Link
            href="/dashboard/recruiter/jobs"
            className="group inline-flex items-center gap-2 text-sm font-medium text-[var(--df-muted)] transition-colors hover:text-[var(--df-text)]"
          >
            <ArrowLeft
              size={15}
              className="transition-transform group-hover:-translate-x-0.5"
            />
            Jobs
          </Link>

          <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--df-muted)]">
            Recruiter workspace
          </span>
        </div>

        {/* Page heading */}
        <header className="py-10 lg:py-14">
          <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
            <div className="max-w-3xl">
              <div className="mb-4 inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--df-accent)]">
                <BriefcaseBusiness size={13} />
                New position
              </div>

              <h1 className="text-4xl font-semibold tracking-[-0.045em] sm:text-5xl lg:text-6xl">
                Post a job.
              </h1>

              <p className="mt-5 max-w-2xl text-sm leading-7 text-[var(--df-muted)] sm:text-base">
                Create a clear, useful job posting that gives
                developers enough information to decide whether
                the opportunity is right for them.
              </p>
            </div>

            <div className="hidden lg:block">
              <div className="flex items-center gap-2 border border-[var(--df-line)] px-4 py-3">
                <div className="flex h-7 w-7 items-center justify-center bg-[var(--df-text)] text-[var(--df-paper)]">
                  <Building2 size={14} />
                </div>

                <div>
                  <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--df-muted)]">
                    Posting status
                  </p>
                  <p className="mt-0.5 text-xs font-semibold">
                    {form.status === "ACTIVE"
                      ? "Ready to publish"
                      : "Draft"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {submitError && (
          <div className="mb-8 flex items-start gap-3 border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700">
            <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-red-500" />
            <div>
              <p className="font-semibold">
                Couldn&apos;t create the job
              </p>
              <p className="mt-1 text-xs leading-5">
                {submitError}
              </p>
            </div>
          </div>
        )}

        <form onSubmit={submit}>
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
            {/* Main form */}
            <div className="space-y-6">
              {/* Position */}
              <section className="border border-[var(--df-line)] bg-[var(--df-paper)]">
                <SectionHeader
                  icon={<FileText size={17} />}
                  number="01"
                  title="Position"
                  description="Define the role and give candidates a clear understanding of the work."
                />

                <div className="space-y-7 p-5 sm:p-7 lg:p-8">
                  <Field
                    label="Job title"
                    required
                    error={errors.title}
                    dataField="title"
                  >
                    <input
                      value={form.title}
                      onChange={(e) =>
                        update("title", e.target.value)
                      }
                      placeholder="e.g. Senior Frontend Developer"
                      className={inputClass(!!errors.title)}
                    />
                  </Field>

                  <Field
                    label="Job description"
                    required
                    hint={`${form.description.length}/5000`}
                    error={errors.description}
                    dataField="description"
                  >
                    <textarea
                      rows={12}
                      maxLength={5000}
                      value={form.description}
                      onChange={(e) =>
                        update("description", e.target.value)
                      }
                      placeholder="Describe the role, responsibilities, expectations, team, technology and what the developer will work on..."
                      className={`${inputClass(
                        !!errors.description
                      )} min-h-[280px] resize-y`}
                    />
                  </Field>
                </div>
              </section>

              {/* Requirements */}
              <section className="border border-[var(--df-line)] bg-[var(--df-paper)]">
                <SectionHeader
                  icon={<Sparkles size={17} />}
                  number="02"
                  title="Requirements"
                  description="Define the experience level and technical skills you are looking for."
                />

                <div className="space-y-7 p-5 sm:p-7 lg:p-8">
                  <div className="grid gap-6 md:grid-cols-2">
                    <Field
                      label="Employment type"
                      required
                      error={errors.employmentType}
                      dataField="employmentType"
                    >
                      <Select
                        value={form.employmentType}
                        onChange={(e) =>
                          update(
                            "employmentType",
                            e.target.value
                          )
                        }
                        error={!!errors.employmentType}
                      >
                        <option value="">
                          Select employment type
                        </option>

                        {employmentTypes.map((type) => (
                          <option
                            key={type.value}
                            value={type.value}
                          >
                            {type.label}
                          </option>
                        ))}
                      </Select>
                    </Field>

                    <Field
                      label="Experience level"
                      required
                      error={errors.experienceLevel}
                      dataField="experienceLevel"
                    >
                      <Select
                        value={form.experienceLevel}
                        onChange={(e) =>
                          update(
                            "experienceLevel",
                            e.target.value
                          )
                        }
                        error={!!errors.experienceLevel}
                      >
                        <option value="">
                          Select experience
                        </option>

                        {experienceLevels.map((level) => (
                          <option
                            key={level.value}
                            value={level.value}
                          >
                            {level.label}
                          </option>
                        ))}
                      </Select>
                    </Field>
                  </div>

                  <Field
                    label="Skills"
                    required
                    error={errors.skills}
                    dataField="skills"
                  >
                    <Select
                      value=""
                      onChange={(e) => addSkill(e.target.value)}
                      error={!!errors.skills}
                      disabled={loadingSkills}
                    >
                      <option value="">
                        {loadingSkills ? "Loading skills..." : "Select required skills"}
                      </option>
                      {availableSkills.map((sk) => {
                        const skillId = typeof sk === "object" ? sk.id : sk;
                        const skillName = typeof sk === "object" ? sk.name : sk;
                        return (
                          <option key={skillId} value={skillId}>
                            {skillName}
                          </option>
                        );
                      })}
                    </Select>

                    {form.skills.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {form.skills.map((skill) => (
                          <span
                            key={skill.id || skill.name}
                            className="inline-flex items-center gap-1.5 border border-[var(--df-line)] bg-[var(--df-paper)] px-2.5 py-1.5 text-[11px] font-medium"
                          >
                            {skill.name}
                            <button
                              type="button"
                              onClick={() => removeSkill(skill)}
                              className="text-[var(--df-muted)] hover:text-[var(--df-text)]"
                              aria-label={`Remove ${skill.name}`}
                            >
                              <X size={11} />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </Field>
                </div>
              </section>

              {/* Location and compensation */}
              <section className="border border-[var(--df-line)] bg-[var(--df-paper)]">
                <SectionHeader
                  icon={<CircleDollarSign size={17} />}
                  number="03"
                  title="Location & compensation"
                  description="Tell candidates where they will work and what compensation range is available."
                />

                <div className="space-y-7 p-5 sm:p-7 lg:p-8">
                  <Field
                    label="Work arrangement"
                    required
                    error={errors.locationPreference}
                    dataField="locationPreference"
                  >
                    <div className="grid gap-3 sm:grid-cols-3">
                      {locations.map((location) => {
                        const selected =
                          form.locationPreference ===
                          location.value;

                        return (
                          <button
                            key={location.value}
                            type="button"
                            onClick={() =>
                              update(
                                "locationPreference",
                                location.value
                              )
                            }
                            className={`border p-4 text-left transition-all ${selected
                              ? "border-[var(--df-text)] bg-[var(--df-text)] text-[var(--df-paper)]"
                              : "border-[var(--df-line)] hover:border-[var(--df-text)]"
                              }`}
                          >
                            <div className="flex items-center justify-between">
                              <MapPin
                                size={15}
                                className={
                                  selected
                                    ? "text-[var(--df-paper)]"
                                    : "text-[var(--df-muted)]"
                                }
                              />

                              {selected && (
                                <CheckCircle2 size={14} />
                              )}
                            </div>

                            <p className="mt-5 text-xs font-semibold">
                              {location.label}
                            </p>

                            <p
                              className={`mt-1 text-[10px] leading-4 ${selected
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
                  </Field>

                  <div className="grid gap-6 md:grid-cols-[180px_1fr_1fr]">
                    <Field
                      label="Currency"
                      required
                      error={errors.currency}
                      dataField="currency"
                    >
                      <Select
                        value={form.currency}
                        onChange={(e) =>
                          update(
                            "currency",
                            e.target.value
                          )
                        }
                        error={!!errors.currency}
                      >
                        {currencies.map((currency) => (
                          <option
                            key={currency}
                            value={currency}
                          >
                            {currency}
                          </option>
                        ))}
                      </Select>
                    </Field>

                    <Field
                      label="Minimum salary"
                      required
                      error={errors.minSalary}
                      dataField="minSalary"
                    >
                      <div className="relative">
                        <CircleDollarSign
                          size={15}
                          className="absolute left-0 top-3.5 text-[var(--df-muted)]"
                        />

                        <input
                          type="number"
                          min="0"
                          value={form.minSalary}
                          onChange={(e) =>
                            update(
                              "minSalary",
                              e.target.value
                            )
                          }
                          placeholder="50000"
                          className={`${inputClass(
                            !!errors.minSalary
                          )} pl-7`}
                        />
                      </div>
                    </Field>

                    <Field
                      label="Maximum salary"
                      required
                      error={errors.maxSalary}
                      dataField="maxSalary"
                    >
                      <div className="relative">
                        <CircleDollarSign
                          size={15}
                          className="absolute left-0 top-3.5 text-[var(--df-muted)]"
                        />

                        <input
                          type="number"
                          min="0"
                          value={form.maxSalary}
                          onChange={(e) =>
                            update(
                              "maxSalary",
                              e.target.value
                            )
                          }
                          placeholder="80000"
                          className={`${inputClass(
                            !!errors.maxSalary
                          )} pl-7`}
                        />
                      </div>
                    </Field>
                  </div>
                </div>
              </section>

              {/* Publishing */}
              <section className="border border-[var(--df-line)] bg-[var(--df-paper)]">
                <SectionHeader
                  icon={<Globe2 size={17} />}
                  number="04"
                  title="Publishing"
                  description="Choose when this position should become visible to developers."
                />

                <div className="space-y-7 p-5 sm:p-7 lg:p-8">
                  <div className="grid gap-6 md:grid-cols-2">
                    <Field
                      label="Application deadline"
                      required
                      error={errors.deadline}
                      dataField="deadline"
                    >
                      <div className="relative">
                        <CalendarDays
                          size={15}
                          className="absolute left-0 top-3.5 text-[var(--df-muted)]"
                        />

                        <input
                          type="datetime-local"
                          value={form.deadline}
                          onChange={(e) =>
                            update(
                              "deadline",
                              e.target.value
                            )
                          }
                          className={`${inputClass(
                            !!errors.deadline
                          )} pl-7`}
                        />
                      </div>
                    </Field>

                    <Field label="Initial status">
                      <Select
                        value={form.status}
                        onChange={(e) =>
                          update("status", e.target.value)
                        }
                      >
                        <option value="DRAFT">
                          Save as draft
                        </option>
                        <option value="ACTIVE">
                          Publish immediately
                        </option>
                      </Select>
                    </Field>
                  </div>

                  {form.status === "ACTIVE" && (
                    <div className="flex gap-3 border border-[var(--df-line)] bg-[var(--df-text)] p-4 text-[var(--df-paper)]">
                      <CheckCircle2
                        size={17}
                        className="mt-0.5 shrink-0"
                      />

                      <div>
                        <p className="text-xs font-semibold">
                          Publishing immediately
                        </p>

                        <p className="mt-1 text-[11px] leading-5 text-[var(--df-paper)]/70">
                          This position will become available
                          to developers after your backend
                          verifies that your company can publish
                          jobs.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {/* Mobile actions */}
              <div className="flex flex-col gap-3 border-t border-[var(--df-line)] pt-6 sm:flex-row sm:justify-end lg:hidden">
                <Link
                  href="/dashboard/recruiter/jobs"
                  className="inline-flex h-12 items-center justify-center border border-[var(--df-line)] px-6 text-xs font-semibold uppercase tracking-[0.12em] transition-colors hover:border-[var(--df-text)]"
                >
                  Cancel
                </Link>

                <SubmitButton
                  submitting={submitting}
                  active={form.status === "ACTIVE"}
                />
              </div>
            </div>

            {/* Desktop side panel */}
            <aside className="hidden lg:block">
              <div className="sticky top-6 space-y-4">
                <PreviewCard
                  form={form}
                  skillList={form.skills}
                />

                <div className="border border-[var(--df-line)] p-5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--df-muted)]">
                    Before publishing
                  </p>

                  <div className="mt-5 space-y-3">
                    <ChecklistItem
                      complete={Boolean(form.title.trim())}
                      label="Add a clear job title"
                    />

                    <ChecklistItem
                      complete={Boolean(form.description.trim())}
                      label="Write the job description"
                    />

                    <ChecklistItem
                      complete={Boolean(form.employmentType)}
                      label="Choose employment type"
                    />

                    <ChecklistItem
                      complete={Boolean(form.experienceLevel)}
                      label="Set experience level"
                    />

                    <ChecklistItem
                      complete={Boolean(form.locationPreference)}
                      label="Choose work arrangement"
                    />

                    <ChecklistItem
                      complete={form.skills.length > 0}
                      label="Add required skills"
                    />
                  </div>
                </div>

                <div className="flex gap-3 border-t border-[var(--df-line)] pt-5">
                  <Link
                    href="/dashboard/recruiter/jobs"
                    className="inline-flex h-12 flex-1 items-center justify-center border border-[var(--df-line)] px-4 text-[10px] font-semibold uppercase tracking-[0.12em] transition-colors hover:border-[var(--df-text)]"
                  >
                    Cancel
                  </Link>

                  <SubmitButton
                    submitting={submitting}
                    active={form.status === "ACTIVE"}
                    className="flex-1"
                  />
                </div>
              </div>
            </aside>
          </div>
        </form>
      </div>
    </main>
  );
}

function SectionHeader({
  icon,
  number,
  title,
  description,
}) {
  return (
    <div className="flex gap-4 border-b border-[var(--df-line)] p-5 sm:p-7">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center border border-[var(--df-line)] text-[var(--df-muted)]">
        {icon}
      </div>

      <div>
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[var(--df-muted)]">
            {number}
          </span>

          <span className="h-px w-4 bg-[var(--df-line)]" />

          <h2 className="text-sm font-semibold tracking-[-0.01em]">
            {title}
          </h2>
        </div>

        <p className="mt-1.5 max-w-2xl text-xs leading-5 text-[var(--df-muted)]">
          {description}
        </p>
      </div>
    </div>
  );
}

function Field({
  label,
  required,
  hint,
  error,
  children,
  dataField,
}) {
  return (
    <div data-field={dataField}>
      <div className="mb-2.5 flex items-center justify-between gap-3">
        <label className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--df-text)]">
          {label}
          {required && (
            <span className="ml-1 text-[var(--df-accent)]">
              *
            </span>
          )}
        </label>

        {hint && (
          <span className="text-[9px] font-medium uppercase tracking-[0.1em] text-[var(--df-muted)]">
            {hint}
          </span>
        )}
      </div>

      {children}

      {error && (
        <p className="mt-2 text-[11px] font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

function Select({ value, onChange, error, disabled, children }) {
  return (
    <select
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={selectClass(error)}
    >
      {children}
    </select>
  );
}

function inputClass(error = false) {
  return `w-full border bg-transparent px-3 py-3.5 text-sm outline-none transition-all placeholder:text-[var(--df-muted)]/60 ${error
    ? "border-red-400 focus:border-red-500"
    : "border-[var(--df-line)] focus:border-[var(--df-text)]"
    }`;
}

function selectClass(error = false) { 
  return `w-full appearance-none border bg-[var(--df-paper)] px-3 py-3.5 text-sm outline-none transition-all ${
    error 
      ? "border-red-400 focus:border-red-500" 
      : "border-[var(--df-line)] focus:border-[var(--df-text)]"
  }`;
}

function ChecklistItem({ complete, label }) {
  return (
    <div className="flex items-center gap-2.5">
      <CheckCircle2
        size={15}
        className={
          complete
            ? "text-[var(--df-text)]"
            : "text-[var(--df-line)]"
        }
      />

      <span
        className={`text-xs ${complete
          ? "text-[var(--df-text)]"
          : "text-[var(--df-muted)]"
          }`}
      >
        {label}
      </span>
    </div>
  );
}

function PreviewCard({ form, skillList }) {
  return (
    <div className="overflow-hidden border border-[var(--df-line)]">
      <div className="border-b border-[var(--df-line)] bg-[var(--df-text)] p-5 text-[var(--df-paper)]">
        <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[var(--df-paper)]/60">
          Posting preview
        </p>

        <h3 className="mt-3 text-xl font-semibold tracking-[-0.03em]">
          {form.title || "Your job title"}
        </h3>

        <p className="mt-1 text-xs text-[var(--df-paper)]/65">
          Your company
        </p>
      </div>

      <div className="space-y-5 p-5">
        <div className="grid grid-cols-2 gap-2">
          <PreviewStat
            label="Work"
            value={
              formatEnum(form.locationPreference) || "—"
            }
          />

          <PreviewStat
            label="Type"
            value={
              formatEnum(form.employmentType) || "—"
            }
          />

          <PreviewStat
            label="Level"
            value={
              formatEnum(form.experienceLevel) || "—"
            }
          />

          <PreviewStat
            label="Salary"
            value={
              form.minSalary || form.maxSalary
                ? `${form.currency} ${form.minSalary || "—"
                }`
                : "—"
            }
          />
        </div>

        <div>
          <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--df-muted)]">
            Description
          </p>

          <p className="mt-2 line-clamp-5 text-xs leading-5 text-[var(--df-muted)]">
            {form.description ||
              "Your job description will appear here as you write it."}
          </p>
        </div>

        {skillList.length > 0 && (
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--df-muted)]">
              Skills
            </p>

            <div className="mt-2 flex flex-wrap gap-1.5">
              {skillList.slice(0, 6).map((skill) => (
                <span
                  key={skill.id || skill.name}
                  className="border border-[var(--df-line)] px-2 py-1 text-[9px] font-medium"
                >
                  {skill.name || skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function PreviewStat({ label, value }) {
  return (
    <div className="border border-[var(--df-line)] p-3">
      <p className="text-[8px] font-semibold uppercase tracking-[0.1em] text-[var(--df-muted)]">
        {label}
      </p>

      <p className="mt-1.5 truncate text-[11px] font-semibold">
        {value}
      </p>
    </div>
  );
}

function SubmitButton({
  submitting,
  active,
  className = "",
}) {
  return (
    <button
      type="submit"
      disabled={submitting}
      className={`inline-flex h-12 items-center justify-center gap-2 bg-[var(--df-text)] px-5 text-[10px] font-semibold uppercase tracking-[0.13em] text-[var(--df-paper)] transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      {submitting
        ? "Creating..."
        : active
          ? "Publish job"
          : "Create draft"}

      {!submitting && <ArrowRight size={14} />}
    </button>
  );
}

function formatEnum(value) {
  if (!value) return "";

  return value
    .toLowerCase()
    .split("_")
    .map(
      (word) =>
        word.charAt(0).toUpperCase() + word.slice(1)
    )
    .join(" ");
}