"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  FileText,
  Globe2,
  MapPin,
  Save,
  Sparkles,
  X,
} from "lucide-react";

import {
  fetchJobById,
  updateJob,
} from "@/lib/redux/slices/jobSlice";
import { fetchSkills } from "@/lib/redux/slices/skillSlice";

const employmentTypes = [
  { value: "FULLTIME", label: "Full-time" },
  { value: "PARTTIME", label: "Part-time" },
  { value: "CONTRACT", label: "Contract" },
  { value: "INTERN", label: "Internship" },
];

const experienceLevels = [
  { value: "BEGINNER", label: "Beginner" },
  { value: "INTERMEDIATE", label: "Intermediate" },
  { value: "EXPERT", label: "Expert" },
];

const locations = [
  {
    value: "REMOTE",
    label: "Remote",
    description: "Work from anywhere",
  },
  {
    value: "ONSITE",
    label: "On-site",
    description: "Work from your office",
  },
  {
    value: "HYBRID",
    label: "Hybrid",
    description: "Remote + office",
  },
];

const currencies = ["USD", "EUR", "PKR", "INR", "GBP", "AED"];

export default function EditJobPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useDispatch();

  const {
    currentJob,
    loadingDetail,
    submitting,
    submitError,
  } = useSelector((state) => state.jobs);

  const { skills: availableSkills = [], loadingList: loadingSkills } = useSelector(
    (state) => state.skills || {}
  );

  const [form, setForm] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    dispatch(fetchJobById(params.id));
    dispatch(fetchSkills());
  }, [dispatch, params.id]);

  useEffect(() => {
    if (!currentJob) return;

    setForm({
      title: currentJob.title || "",
      description: currentJob.description || "",
      employmentType: currentJob.employmentType || "",
      experienceLevel: currentJob.experienceLevel || "",
      locationPreference: currentJob.locationPreference || "",
      currency: currentJob.currency || "USD",
      minSalary:
        currentJob.minSalary != null
          ? String(currentJob.minSalary)
          : "",
      maxSalary:
        currentJob.maxSalary != null
          ? String(currentJob.maxSalary)
          : "",
      deadline: currentJob.deadline
        ? toDateTimeLocal(currentJob.deadline)
        : "",
      skills: Array.isArray(currentJob.skills) ? currentJob.skills : [],
    });
  }, [currentJob]);

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
    const next = {};

    if (!form.title.trim()) {
      next.title = "Job title is required.";
    }

    if (!form.description.trim()) {
      next.description = "Description is required.";
    }

    if (!form.employmentType) {
      next.employmentType = "Employment type is required.";
    }

    if (!form.experienceLevel) {
      next.experienceLevel = "Experience level is required.";
    }

    if (!form.locationPreference) {
      next.locationPreference = "Location preference is required.";
    }

    if (!form.skills || form.skills.length === 0) {
      next.skills = "At least one skill is required.";
    }

    if (
      form.minSalary !== "" &&
      (Number.isNaN(Number(form.minSalary)) ||
        Number(form.minSalary) < 0)
    ) {
      next.minSalary = "Enter a valid salary.";
    }

    if (
      form.maxSalary !== "" &&
      (Number.isNaN(Number(form.maxSalary)) ||
        Number(form.maxSalary) < 0)
    ) {
      next.maxSalary = "Enter a valid salary.";
    }

    if (
      form.minSalary !== "" &&
      form.maxSalary !== "" &&
      Number(form.minSalary) >= Number(form.maxSalary)
    ) {
      next.maxSalary = "Maximum salary must be greater than minimum salary.";
    }

    if (form.deadline) {
      const deadline = new Date(form.deadline);

      if (
        deadline <= new Date() &&
        currentJob?.status !== "CLOSED" &&
        currentJob?.status !== "EXPIRED"
      ) {
        next.deadline = "Deadline must be in the future.";
      }
    }

    return next;
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

    try {
      await dispatch(
        updateJob({
          id: params.id,
          title: form.title.trim(),
          description: form.description.trim(),
          employmentType: form.employmentType,
          experienceLevel: form.experienceLevel,
          locationPreference: form.locationPreference,
          currency: form.currency.trim().toUpperCase(),
          minSalary:
            form.minSalary === ""
              ? undefined
              : Number(form.minSalary),
          maxSalary:
            form.maxSalary === ""
              ? undefined
              : Number(form.maxSalary),
          deadline: form.deadline
            ? new Date(form.deadline).toISOString()
            : undefined,
          skills: form.skills, // Sends entire array of skill objects
        })
      ).unwrap();

      router.replace(`/dashboard/recruiter/jobs/${params.id}`);
    } catch {
      // Redux stores submitError.
    }
  };

  if (loadingDetail || !form) {
    return <EditJobSkeleton />;
  }

  return (
    <main className="min-h-screen bg-[var(--df-paper)] text-[var(--df-text)]">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        {/* Top navigation */}
        <div className="flex items-center justify-between border-b border-[var(--df-line)] pb-5">
          <Link
            href={`/dashboard/recruiter/jobs/${params.id}`}
            className="group inline-flex items-center gap-2 text-sm font-medium text-[var(--df-muted)] transition-colors hover:text-[var(--df-text)]"
          >
            <ArrowLeft
              size={15}
              className="transition-transform group-hover:-translate-x-0.5"
            />
            Back to job
          </Link>

          <div className="flex items-center gap-3">
            <StatusBadge status={currentJob?.status} />

            <span className="hidden text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--df-muted)] sm:inline">
              Editing posting
            </span>
          </div>
        </div>

        {/* Heading */}
        <header className="py-10 lg:py-14">
          <div className="flex flex-col justify-between gap-7 lg:flex-row lg:items-end">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--df-accent)]">
                <Save size={13} />
                Edit posting
              </div>

              <h1 className="max-w-4xl text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">
                {form.title || "Edit job"}
              </h1>

              <p className="mt-3 text-sm text-[var(--df-muted)]">
                {currentJob?.company?.name || "Your company"}
              </p>
            </div>

            <div className="border border-[var(--df-line)] px-4 py-3 lg:min-w-[220px]">
              <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[var(--df-muted)]">
                Current status
              </p>

              <div className="mt-2">
                <StatusBadge status={currentJob?.status} />
              </div>
            </div>
          </div>
        </header>

        {submitError && (
          <div className="mb-8 flex items-start gap-3 border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700">
            <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-red-500" />

            <div>
              <p className="font-semibold">
                Couldn&apos;t save your changes
              </p>

              <p className="mt-1 text-xs leading-5">
                {submitError}
              </p>
            </div>
          </div>
        )}

        <form onSubmit={submit}>
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
            {/* Form */}
            <div className="space-y-6">
              <section className="border border-[var(--df-line)]">
                <SectionHeader
                  number="01"
                  icon={<FileText size={17} />}
                  title="Position"
                  description="Update the title and description shown to candidates."
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
                      onChange={(e) => update("title", e.target.value)}
                      className={inputClass(!!errors.title)}
                      placeholder="e.g. Senior Frontend Developer"
                    />
                  </Field>

                  <Field
                    label="Description"
                    required
                    hint={`${form.description.length}/5000`}
                    error={errors.description}
                    dataField="description"
                  >
                    <textarea
                      rows={12}
                      maxLength={5000}
                      value={form.description}
                      onChange={(e) => update("description", e.target.value)}
                      className={`${inputClass(
                        !!errors.description
                      )} min-h-[280px] resize-y`}
                      placeholder="Describe the role, responsibilities, expectations and what the candidate will work on..."
                    />
                  </Field>
                </div>
              </section>

              <section className="border border-[var(--df-line)]">
                <SectionHeader
                  number="02"
                  icon={<Sparkles size={17} />}
                  title="Requirements"
                  description="Keep the requirements clear so candidates understand what you expect."
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
                          update("employmentType", e.target.value)
                        }
                        error={!!errors.employmentType}
                      >
                        <option value="">
                          Select employment type
                        </option>

                        {employmentTypes.map((type) => (
                          <option key={type.value} value={type.value}>
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
                          update("experienceLevel", e.target.value)
                        }
                        error={!!errors.experienceLevel}
                      >
                        <option value="">
                          Select experience
                        </option>

                        {experienceLevels.map((level) => (
                          <option key={level.value} value={level.value}>
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
                        {loadingSkills
                          ? "Loading skills..."
                          : "Select required skills"}
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

              <section className="border border-[var(--df-line)]">
                <SectionHeader
                  number="03"
                  icon={<Globe2 size={17} />}
                  title="Location & compensation"
                  description="Update the working arrangement and compensation range."
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
                          form.locationPreference === location.value;

                        return (
                          <button
                            key={location.value}
                            type="button"
                            onClick={() =>
                              update("locationPreference", location.value)
                            }
                            className={`border p-4 text-left transition-all ${
                              selected
                                ? "border-[var(--df-text)] bg-[var(--df-text)] text-[var(--df-paper)]"
                                : "border-[var(--df-line)] hover:border-[var(--df-text)]"
                            }`}
                          >
                            <div className="flex justify-between">
                              <MapPin
                                size={15}
                                className={
                                  selected
                                    ? ""
                                    : "text-[var(--df-muted)]"
                                }
                              />

                              {selected && <CheckCircle2 size={14} />}
                            </div>

                            <p className="mt-5 text-xs font-semibold">
                              {location.label}
                            </p>

                            <p
                              className={`mt-1 text-[10px] leading-4 ${
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
                  </Field>

                  <div className="grid gap-6 md:grid-cols-3">
                    <Field label="Currency">
                      <Select
                        value={form.currency}
                        onChange={(e) => update("currency", e.target.value)}
                      >
                        {currencies.map((currency) => (
                          <option key={currency} value={currency}>
                            {currency}
                          </option>
                        ))}
                      </Select>
                    </Field>

                    <Field
                      label="Minimum salary"
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
                          onChange={(e) => update("minSalary", e.target.value)}
                          className={`${inputClass(
                            !!errors.minSalary
                          )} pl-7`}
                          placeholder="50000"
                        />
                      </div>
                    </Field>

                    <Field
                      label="Maximum salary"
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
                          onChange={(e) => update("maxSalary", e.target.value)}
                          className={`${inputClass(
                            !!errors.maxSalary
                          )} pl-7`}
                          placeholder="80000"
                        />
                      </div>
                    </Field>
                  </div>
                </div>
              </section>

              <section className="border border-[var(--df-line)]">
                <SectionHeader
                  number="04"
                  icon={<CalendarDays size={17} />}
                  title="Application deadline"
                  description="Control when candidates should stop applying."
                />

                <div className="p-5 sm:p-7 lg:p-8">
                  <Field
                    label="Deadline"
                    hint={
                      currentJob.status === "CLOSED" ||
                      currentJob.status === "EXPIRED"
                        ? "Editing a closed posting"
                        : "Optional"
                    }
                    error={errors.deadline}
                    dataField="deadline"
                  >
                    <div className="relative max-w-xl">
                      <CalendarDays
                        size={15}
                        className="absolute left-0 top-3.5 text-[var(--df-muted)]"
                      />

                      <input
                        type="datetime-local"
                        value={form.deadline}
                        onChange={(e) => update("deadline", e.target.value)}
                        className={`${inputClass(
                          !!errors.deadline
                        )} pl-7`}
                      />
                    </div>
                  </Field>
                </div>
              </section>

              {/* Mobile actions */}
              <div className="flex flex-col gap-3 border-t border-[var(--df-line)] pt-6 sm:flex-row sm:justify-end lg:hidden">
                <Link
                  href={`/dashboard/recruiter/jobs/${params.id}`}
                  className="inline-flex h-12 items-center justify-center border border-[var(--df-line)] px-6 text-xs font-semibold uppercase tracking-[0.12em]"
                >
                  Cancel
                </Link>

                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex h-12 items-center justify-center gap-2 bg-[var(--df-text)] px-6 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--df-paper)] disabled:opacity-50"
                >
                  {submitting ? "Saving..." : "Save changes"}
                  {!submitting && <ArrowRight size={14} />}
                </button>
              </div>
            </div>

            {/* Side panel */}
            <aside className="hidden lg:block">
              <div className="sticky top-6 space-y-4">
                <div className="border border-[var(--df-line)]">
                  <div className="border-b border-[var(--df-line)] bg-[var(--df-text)] p-5 text-[var(--df-paper)]">
                    <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[var(--df-paper)]/60">
                      Editing
                    </p>

                    <h2 className="mt-3 text-lg font-semibold tracking-[-0.02em]">
                      {form.title || "Untitled position"}
                    </h2>

                    <p className="mt-1 text-xs text-[var(--df-paper)]/60">
                      {currentJob?.company?.name || "Your company"}
                    </p>
                  </div>

                  <div className="p-5">
                    <div className="grid grid-cols-2 gap-2">
                      <MiniInfo
                        label="Status"
                        value={formatEnum(currentJob.status)}
                      />

                      <MiniInfo
                        label="Location"
                        value={formatEnum(form.locationPreference)}
                      />

                      <MiniInfo
                        label="Type"
                        value={formatEnum(form.employmentType)}
                      />

                      <MiniInfo
                        label="Experience"
                        value={formatEnum(form.experienceLevel)}
                      />
                    </div>
                  </div>
                </div>

                <div className="border border-[var(--df-line)] p-5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--df-muted)]">
                    Posting information
                  </p>

                  <div className="mt-5 space-y-4">
                    <MetaRow
                      label="Created"
                      value={formatDate(currentJob.createdAt)}
                    />

                    <MetaRow
                      label="Published"
                      value={formatDate(currentJob.publishedAt)}
                    />

                    <MetaRow
                      label="Last updated"
                      value={formatDate(currentJob.updatedAt)}
                    />
                  </div>
                </div>

                <div className="flex gap-3 border-t border-[var(--df-line)] pt-5">
                  <Link
                    href={`/dashboard/recruiter/jobs/${params.id}`}
                    className="inline-flex h-12 flex-1 items-center justify-center border border-[var(--df-line)] text-[10px] font-semibold uppercase tracking-[0.12em] transition-colors hover:border-[var(--df-text)]"
                  >
                    Cancel
                  </Link>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex h-12 flex-1 items-center justify-center gap-2 bg-[var(--df-text)] text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--df-paper)] disabled:opacity-50"
                  >
                    {submitting ? "Saving..." : "Save changes"}
                    {!submitting && <CheckCircle2 size={14} />}
                  </button>
                </div>
              </div>
            </aside>
          </div>
        </form>
      </div>
    </main>
  );
}

function SectionHeader({ number, icon, title, description }) {
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

          <h2 className="text-sm font-semibold">{title}</h2>
        </div>

        <p className="mt-1.5 max-w-2xl text-xs leading-5 text-[var(--df-muted)]">
          {description}
        </p>
      </div>
    </div>
  );
}

function Field({ label, required, hint, error, children, dataField }) {
  return (
    <div data-field={dataField}>
      <div className="mb-2.5 flex items-center justify-between gap-3">
        <label className="text-[10px] font-semibold uppercase tracking-[0.14em]">
          {label}

          {required && (
            <span className="ml-1 text-[var(--df-accent)]">*</span>
          )}
        </label>

        {hint && (
          <span className="text-[9px] uppercase tracking-[0.1em] text-[var(--df-muted)]">
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
      className={inputClass(error)}
    >
      {children}
    </select>
  );
}

function inputClass(error = false) {
  return `w-full border bg-transparent px-3 py-3.5 text-sm outline-none transition-all placeholder:text-[var(--df-muted)]/60 ${
    error
      ? "border-red-400 focus:border-red-500"
      : "border-[var(--df-line)] focus:border-[var(--df-text)]"
  }`;
}

function StatusBadge({ status }) {
  const styles = {
    DRAFT: "border-amber-200 bg-amber-50 text-amber-700",
    ACTIVE: "border-emerald-200 bg-emerald-50 text-emerald-700",
    CLOSED: "border-slate-200 bg-slate-50 text-slate-600",
    EXPIRED: "border-red-200 bg-red-50 text-red-600",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 border px-2.5 py-1.5 text-[9px] font-semibold uppercase tracking-[0.1em] ${
        styles[status] || "border-[var(--df-line)] text-[var(--df-muted)]"
      }`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {formatEnum(status) || "Unknown"}
    </span>
  );
}

function MiniInfo({ label, value }) {
  return (
    <div className="border border-[var(--df-line)] p-3">
      <p className="text-[8px] font-semibold uppercase tracking-[0.1em] text-[var(--df-muted)]">
        {label}
      </p>

      <p className="mt-1.5 truncate text-[11px] font-semibold">
        {value || "—"}
      </p>
    </div>
  );
}

function MetaRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[var(--df-line)] pb-3 last:border-0 last:pb-0">
      <span className="text-[10px] uppercase tracking-[0.1em] text-[var(--df-muted)]">
        {label}
      </span>

      <span className="text-xs font-medium">{value}</span>
    </div>
  );
}

function formatEnum(value) {
  if (!value) return "";

  return value
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatDate(date) {
  if (!date) return "—";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

function toDateTimeLocal(date) {
  const value = new Date(date);

  const offset = value.getTimezoneOffset();
  const local = new Date(value.getTime() - offset * 60000);

  return local.toISOString().slice(0, 16);
}

function EditJobSkeleton() {
  return (
    <main className="min-h-screen bg-[var(--df-paper)]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="h-5 w-24 animate-pulse bg-[var(--df-line)]" />

        <div className="mt-12 h-10 w-2/3 max-w-xl animate-pulse bg-[var(--df-line)]" />

        <div className="mt-4 h-4 w-96 max-w-full animate-pulse bg-[var(--df-line)]" />

        <div className="mt-12 grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-6">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="border border-[var(--df-line)] p-8"
              >
                <div className="h-5 w-32 animate-pulse bg-[var(--df-line)]" />

                <div className="mt-8 space-y-5">
                  <div className="h-12 animate-pulse bg-[var(--df-line)]" />
                  <div className="h-12 animate-pulse bg-[var(--df-line)]" />
                </div>
              </div>
            ))}
          </div>

          <div className="hidden space-y-4 lg:block">
            <div className="h-64 animate-pulse bg-[var(--df-line)]" />
            <div className="h-48 animate-pulse bg-[var(--df-line)]" />
          </div>
        </div>
      </div>
    </main>
  );
}