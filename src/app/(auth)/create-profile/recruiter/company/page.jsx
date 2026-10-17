"use client";

import { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  CircleHelp,
  Globe2,
  MapPin,
} from "lucide-react";

import { createCompany } from "@/lib/redux/slices/companySlice";
import DevFlowLogo from "@/components/brand/DevFlowLogo";

// Prisma Enums from schema.prisma
const INDUSTRIES = [
  "TECHNOLOGY",
  "FINANCE",
  "HEALTHCARE",
  "RETAIL",
  "MANUFACTURING",
  "TELECOMMUNICATIONS",
  "REAL_ESTATE",
  "LOGISTICS",
  "EDUCATION",
  "ENTERTAINMENT",
  "ENERGY",
  "CONSTRUCTION",
  "CONSULTING",
  "AGRICULTURE",
  "GOVERNMENT",
];

const COUNTRIES = [
  "ARGENTINA",
  "AUSTRALIA",
  "AUSTRIA",
  "BANGLADESH",
  "BELGIUM",
  "BRAZIL",
  "CANADA",
  "CHINA",
  "DENMARK",
  "EGYPT",
  "FINLAND",
  "FRANCE",
  "GERMANY",
  "GREECE",
  "HONG_KONG",
  "INDIA",
  "INDONESIA",
  "IRELAND",
  "ITALY",
  "JAPAN",
  "MALAYSIA",
  "MEXICO",
  "NETHERLANDS",
  "NEW_ZEALAND",
  "NIGERIA",
  "NORWAY",
  "PAKISTAN",
  "PHILIPPINES",
  "POLAND",
  "PORTUGAL",
  "QATAR",
  "RUSSIA",
  "SAUDI_ARABIA",
  "SINGAPORE",
  "SOUTH_AFRICA",
  "SOUTH_KOREA",
  "SPAIN",
  "SWEDEN",
  "SWITZERLAND",
  "TAIWAN",
  "THAILAND",
  "TURKEY",
  "UKRAINE",
  "UNITED_ARAB_EMIRATES",
  "UNITED_KINGDOM",
  "UNITED_STATES",
  "VIETNAM",
];

const CURRENCIES = ["USD", "EUR", "PKR", "INR", "GBP", "AED"];

const initialForm = {
  name: "",
  logo: "",
  websiteUrl: "",
  industry: "",
  country: "",
  roleTitle: "",
  description: "",
  salary: "",
  currency: "USD",
  employmentType: "FULLTIME",
};

const employmentTypes = [
  {
    value: "FULLTIME",
    label: "Full-time",
    description: "A regular full-time position.",
  },
  {
    value: "PARTTIME",
    label: "Part-time",
    description: "A reduced-hours position.",
  },
  {
    value: "CONTRACT",
    label: "Contract",
    description: "A fixed or project-based role.",
  },
  {
    value: "INTERN",
    label: "Internship",
    description: "An internship or trainee position.",
  },
];

// Helper to format enum values into user-friendly labels (e.g., UNITED_STATES -> United States)
function formatEnumLabel(val) {
  return val
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default function CreateRecruiterCompanyPage() {
  const router = useRouter();
  const dispatch = useDispatch();

  const { submitting, submitError } = useSelector(
    (state) => state.company || {}
  );

  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});

  const completedRequiredFields = useMemo(() => {
    const fields = [
      form.name.trim(),
      form.websiteUrl.trim(),
      form.industry.trim(),
      form.country.trim(),
      form.roleTitle.trim(),
    ];

    return fields.filter(Boolean).length;
  }, [
    form.name,
    form.websiteUrl,
    form.industry,
    form.country,
    form.roleTitle,
  ]);

  const progress = Math.round(
    (completedRequiredFields / 5) * 100
  );

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

  const validate = () => {
    const nextErrors = {};

    if (!form.name.trim()) {
      nextErrors.name = "Company name is required.";
    } else if (form.name.trim().length > 120) {
      nextErrors.name =
        "Company name cannot exceed 120 characters.";
    }

    if (!form.websiteUrl.trim()) {
      nextErrors.websiteUrl = "Company website is required.";
    } else if (
      !/^https?:\/\/.+/i.test(form.websiteUrl.trim())
    ) {
      nextErrors.websiteUrl = "Enter a valid website URL.";
    }

    if (!form.industry) {
      nextErrors.industry = "Industry is required.";
    }

    if (!form.country) {
      nextErrors.country = "Country is required.";
    }

    if (!form.roleTitle.trim()) {
      nextErrors.roleTitle = "Your role is required.";
    }

    if (form.description.length > 3000) {
      nextErrors.description =
        "Description cannot exceed 3000 characters.";
    }

    if (
      form.logo.trim() &&
      !/^https?:\/\/.+/i.test(form.logo.trim())
    ) {
      nextErrors.logo = "Enter a valid logo URL.";
    }

    if (
      form.salary !== "" &&
      (Number(form.salary) < 0 ||
        Number.isNaN(Number(form.salary)))
    ) {
      nextErrors.salary = "Enter a valid salary.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validate()) return;

    const payload = {
      name: form.name.trim(),
      logo: form.logo.trim() || null,
      websiteUrl: form.websiteUrl.trim(),
      industry: form.industry,
      country: form.country,
      roleTitle: form.roleTitle.trim(),
      description: form.description.trim() || null,
      salary:
        form.salary === "" ? null : Number(form.salary),
      currency: form.currency,
      employmentType: form.employmentType,
    };

    try {
      await dispatch(createCompany(payload)).unwrap();

      router.push("/dashboard/recruiter");
    } catch {
      // Error handled in companySlice
    }
  };

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
            href="/create-profile/recruiter"
            className="inline-flex items-center gap-2 text-xs font-medium text-[var(--df-muted)] transition-colors hover:text-[var(--df-text)]"
          >
            <ArrowLeft size={14} />
            Back to profile
          </Link>
        </div>

        {/* Progress */}
        <div className="mt-8 border border-[var(--df-line)] bg-[var(--df-paper)]">
          <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-5">
            <div>
              <p className="text-xs font-semibold">
                Company setup
              </p>

              <p className="mt-0.5 text-[11px] text-[var(--df-muted)]">
                Step 2 of 2
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
            <Building2 size={19} />
          </div>

          <h1 className="mt-5 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
            Set up your company
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--df-muted)]">
            Add the information developers will see when they
            discover your company and its jobs.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="mt-8">
          {/* Company identity */}
          <section className="border border-[var(--df-line)] bg-[var(--df-paper)]">
            <SectionHeader
              title="Company information"
              description="Start with the details developers need to identify your organization."
            />

            <div className="space-y-6 border-t border-[var(--df-line)] p-5 sm:p-7">
              {/* Company name */}
              <Field
                label="Company name"
                required
                error={errors.name}
                hint="Required"
              >
                <input
                  value={form.name}
                  onChange={(e) =>
                    updateField("name", e.target.value)
                  }
                  placeholder="Acme Technologies"
                  className={inputClass(!!errors.name)}
                />
              </Field>

              {/* Industry + Country Dropdowns */}
              <div className="grid gap-6 sm:grid-cols-2">
                <Field
                  label="Industry"
                  required
                  error={errors.industry}
                  hint="Required"
                >
                  <select
                    value={form.industry}
                    onChange={(e) =>
                      updateField("industry", e.target.value)
                    }
                    className={inputClass(!!errors.industry)}
                  >
                    <option value="" disabled>
                      Select an industry
                    </option>
                    {INDUSTRIES.map((ind) => (
                      <option key={ind} value={ind}>
                        {formatEnumLabel(ind)}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field
                  label="Country"
                  required
                  error={errors.country}
                  hint="Required"
                >
                  <div className="relative">
                    <MapPin
                      size={16}
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--df-muted)]"
                    />

                    <select
                      value={form.country}
                      onChange={(e) =>
                        updateField("country", e.target.value)
                      }
                      className={`${inputClass(
                        !!errors.country
                      )} pl-9`}
                    >
                      <option value="" disabled>
                        Select a country
                      </option>
                      {COUNTRIES.map((c) => (
                        <option key={c} value={c}>
                          {formatEnumLabel(c)}
                        </option>
                      ))}
                    </select>
                  </div>
                </Field>
              </div>

              {/* Website */}
              <Field
                label="Company website"
                required
                error={errors.websiteUrl}
                hint="Required"
              >
                <div className="relative">
                  <Globe2
                    size={16}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--df-muted)]"
                  />

                  <input
                    type="url"
                    value={form.websiteUrl}
                    onChange={(e) =>
                      updateField(
                        "websiteUrl",
                        e.target.value
                      )
                    }
                    placeholder="https://company.com"
                    className={`${inputClass(
                      !!errors.websiteUrl
                    )} pl-9`}
                  />
                </div>
              </Field>

              {/* Logo */}
              <Field
                label="Company logo"
                hint="Optional"
                error={errors.logo}
              >
                <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-start">
                  <input
                    type="url"
                    value={form.logo}
                    onChange={(e) =>
                      updateField("logo", e.target.value)
                    }
                    placeholder="https://company.com/logo.png"
                    className={inputClass(!!errors.logo)}
                  />

                  <LogoPreview logo={form.logo} />
                </div>

                <p className="mt-2 text-[11px] leading-5 text-[var(--df-muted)]">
                  Use a publicly accessible image URL. Square
                  logos usually work best.
                </p>
              </Field>
            </div>
          </section>

          {/* About company */}
          <section className="mt-5 border border-[var(--df-line)] bg-[var(--df-paper)]">
            <SectionHeader
              title="About the company"
              description="Help developers understand what your company does and what they can expect."
            />

            <div className="border-t border-[var(--df-line)] p-5 sm:p-7">
              <Field
                label="Company description"
                hint={`${form.description.length}/3000`}
                error={errors.description}
              >
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    updateField(
                      "description",
                      e.target.value
                    )
                  }
                  maxLength={3000}
                  rows={8}
                  placeholder="Describe what your company builds, the problems it solves, the people it serves, and the environment developers can expect..."
                  className={`${textareaClass(
                    !!errors.description
                  )} resize-none`}
                />
              </Field>
            </div>
          </section>

          {/* Your position */}
          <section className="mt-5 border border-[var(--df-line)] bg-[var(--df-paper)]">
            <SectionHeader
              title="Your position"
              description="This information represents your role in the company."
            />

            <div className="space-y-6 border-t border-[var(--df-line)] p-5 sm:p-7">
              <div className="grid gap-6 sm:grid-cols-2">
                <Field
                  label="Your role"
                  required
                  error={errors.roleTitle}
                  hint="Required"
                >
                  <input
                    value={form.roleTitle}
                    onChange={(e) =>
                      updateField(
                        "roleTitle",
                        e.target.value
                      )
                    }
                    placeholder="Founder & Talent Lead"
                    className={inputClass(!!errors.roleTitle)}
                  />
                </Field>

                <Field
                  label="Employment type"
                  required
                  hint="Required"
                >
                  <select
                    value={form.employmentType}
                    onChange={(e) =>
                      updateField(
                        "employmentType",
                        e.target.value
                      )
                    }
                    className={inputClass()}
                  >
                    {employmentTypes.map((type) => (
                      <option
                        key={type.value}
                        value={type.value}
                      >
                        {type.label}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              {/* Employment type explanation */}
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                {employmentTypes.map((type) => {
                  const selected =
                    form.employmentType === type.value;

                  return (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() =>
                        updateField(
                          "employmentType",
                          type.value
                        )
                      }
                      className={`relative border p-3 text-left transition-colors ${
                        selected
                          ? "border-[var(--df-text)] bg-[var(--df-text)] text-[var(--df-paper)]"
                          : "border-[var(--df-line)] hover:border-[var(--df-text)]"
                      }`}
                    >
                      {selected && (
                        <span className="absolute right-2.5 top-2.5">
                          <Check size={13} />
                        </span>
                      )}

                      <p className="pr-5 text-xs font-semibold">
                        {type.label}
                      </p>

                      <p
                        className={`mt-1 text-[10px] leading-4 ${
                          selected
                            ? "text-[var(--df-paper)]/70"
                            : "text-[var(--df-muted)]"
                        }`}
                      >
                        {type.description}
                      </p>
                    </button>
                  );
                })}
              </div>

              {/* Salary & Currency Dropdown */}
              <div className="border-t border-[var(--df-line)] pt-6">
                <div className="mb-4">
                  <p className="text-sm font-semibold">
                    Compensation
                  </p>

                  <p className="mt-1 text-xs leading-5 text-[var(--df-muted)]">
                    Optional information about your current
                    compensation.
                  </p>
                </div>

                <div className="grid gap-6 sm:grid-cols-[1fr_180px]">
                  <Field
                    label="Salary"
                    hint="Optional"
                    error={errors.salary}
                  >
                    <input
                      type="number"
                      min="0"
                      value={form.salary}
                      onChange={(e) =>
                        updateField(
                          "salary",
                          e.target.value
                        )
                      }
                      placeholder="5000"
                      className={inputClass(!!errors.salary)}
                    />
                  </Field>

                  <Field label="Currency">
                    <select
                      value={form.currency}
                      onChange={(e) =>
                        updateField(
                          "currency",
                          e.target.value
                        )
                      }
                      className={inputClass()}
                    >
                      {CURRENCIES.map((curr) => (
                        <option key={curr} value={curr}>
                          {curr}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>
              </div>
            </div>
          </section>

          {/* Information notice */}
          <div className="mt-5 flex gap-3 border border-[var(--df-line)] p-4">
            <CircleHelp
              size={16}
              className="mt-0.5 shrink-0 text-[var(--df-muted)]"
            />

            <div>
              <p className="text-xs font-semibold">
                What happens next?
              </p>

              <p className="mt-1 text-xs leading-5 text-[var(--df-muted)]">
                Your company will be created and associated with
                your recruiter profile. You can then manage your
                company and start creating jobs from your
                dashboard.
              </p>
            </div>
          </div>

          {/* Error */}
          {submitError && (
            <div className="mt-5 border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <p className="font-semibold">Something went wrong</p>
              <p className="mt-1 text-xs leading-5">
                {submitError}
              </p>
            </div>
          )}

          {/* Submit area */}
          <div className="mt-6 border border-[var(--df-line)] bg-[var(--df-paper)] p-4 sm:p-5">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold">
                  Finish your company setup
                </p>

                <p className="mt-1 text-xs leading-5 text-[var(--df-muted)]">
                  You can update company information later from
                  your recruiter dashboard.
                </p>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex h-11 w-full shrink-0 items-center justify-center gap-2 bg-[var(--df-text)] px-6 text-xs font-semibold text-[var(--df-paper)] transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >
                {submitting
                  ? "Creating company..."
                  : "Create company"}

                {!submitting && <ArrowRight size={15} />}
              </button>
            </div>
          </div>

          <div className="flex justify-center py-5">
            <Link
              href="/create-profile/recruiter"
              className="inline-flex items-center gap-2 text-[11px] font-medium text-[var(--df-muted)] transition-colors hover:text-[var(--df-text)]"
            >
              <ArrowLeft size={13} />
              Back to recruiter profile
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}

function SectionHeader({ title, description }) {
  return (
    <div className="px-5 py-5 sm:px-7 sm:py-6">
      <h2 className="text-base font-semibold tracking-[-0.02em]">
        {title}
      </h2>

      <p className="mt-1.5 max-w-2xl text-xs leading-5 text-[var(--df-muted)]">
        {description}
      </p>
    </div>
  );
}

function Field({ label, required, hint, error, children }) {
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

function LogoPreview({ logo }) {
  const [imageError, setImageError] = useState(false);

  if (!logo || imageError) {
    return (
      <div className="flex h-11 w-11 shrink-0 items-center justify-center border border-[var(--df-line)] bg-[var(--df-paper)]">
        <Building2
          size={17}
          className="text-[var(--df-muted)]"
        />
      </div>
    );
  }

  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden border border-[var(--df-line)] bg-[var(--df-paper)]">
      <img
        src={logo}
        alt=""
        className="h-full w-full object-cover"
        onError={() => setImageError(true)}
      />
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
