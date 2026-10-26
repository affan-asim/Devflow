"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowLeft,
  Building2,
  Check,
  Globe2,
  Image as ImageIcon,
  Loader2,
  MapPin,
  Save,
  ShieldCheck,
  X,
} from "lucide-react";

import {
  fetchCompanyById,
  updateCompany,
  clearCurrentCompany,
  clearCompanyErrors,
} from "@/lib/redux/slices/companySlice";
import { Country } from "@/generated/prisma/client";

const COUNTRIES = Object.values(Country).map((c) => ({
  value: c,
  label: c
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase()),
})).sort((a, b) => a.label.localeCompare(b.label));

const INDUSTRIES = [
  "Software",
  "Technology",
  "Fintech",
  "Healthcare",
  "E-commerce",
  "Education",
  "Marketing",
  "Finance",
  "Consulting",
  "Gaming",
  "Media",
  "Manufacturing",
  "Real Estate",
  "Transportation",
  "Other",
];

function FieldLabel({ children, required = false }) {
  return (
    <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--df-muted)]">
      {children}

      {required && (
        <span className="ml-1 text-[var(--df-accent)]">*</span>
      )}
    </label>
  );
}

function InputField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
  disabled = false,
}) {
  return (
    <div>
      <FieldLabel required={required}>{label}</FieldLabel>

      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className="h-11 w-full border border-[var(--df-line)] bg-[var(--df-paper)] px-3.5 text-sm text-[var(--df-text)] outline-none transition placeholder:text-[var(--df-muted)] focus:border-[var(--df-text)] disabled:cursor-not-allowed disabled:bg-black/[0.025] disabled:opacity-60"
      />
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder,
  required = false,
}) {
  return (
    <div>
      <FieldLabel required={required}>{label}</FieldLabel>

      <div className="relative">
        <select
          value={value}
          onChange={onChange}
          className="h-11 w-full appearance-none border border-[var(--df-line)] bg-[var(--df-paper)] px-3.5 pr-8 text-sm text-[var(--df-text)] outline-none transition focus:border-[var(--df-text)] cursor-pointer"
        >
          <option value="">{placeholder}</option>

          {options.map((option) => {
            const val = typeof option === "object" ? option.value : option;
            const lbl = typeof option === "object" ? option.label : option;
            return (
              <option key={val} value={val}>
                {lbl}
              </option>
            );
          })}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[var(--df-muted)]">
          <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ eyebrow, title, description }) {
  return (
    <div className="border-b border-[var(--df-line)] pb-5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--df-muted)]">
        {eyebrow}
      </p>

      <h2 className="mt-2 text-xl font-semibold tracking-tight text-[var(--df-text)]">
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

function PageSkeleton() {
  return (
    <main className="min-h-screen bg-[var(--df-paper)]">
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10">
        <div className="animate-pulse">
          <div className="h-4 w-24 bg-[var(--df-line)]" />

          <div className="mt-8 h-9 w-64 bg-[var(--df-line)]" />

          <div className="mt-3 h-4 w-96 max-w-full bg-[var(--df-line)]" />

          <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="space-y-10">
              <div className="h-72 border border-[var(--df-line)]" />
              <div className="h-52 border border-[var(--df-line)]" />
            </div>

            <div className="h-96 border border-[var(--df-line)]" />
          </div>
        </div>
      </div>
    </main>
  );
}

function AccessDenied({ router }) {
  return (
    <main className="min-h-screen bg-[var(--df-paper)] text-[var(--df-text)]">
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-xs font-medium text-[var(--df-muted)] transition hover:text-[var(--df-text)]"
        >
          <ArrowLeft size={15} />
          Back
        </button>

        <div className="mx-auto max-w-lg py-28 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center border border-[var(--df-line)]">
            <ShieldCheck
              size={24}
              strokeWidth={1.3}
              className="text-[var(--df-muted)]"
            />
          </div>

          <p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--df-muted)]">
            Restricted access
          </p>

          <h1 className="mt-3 text-2xl font-semibold tracking-tight">
            You cannot edit this company
          </h1>

          <p className="mt-3 text-sm leading-6 text-[var(--df-muted)]">
            Only the company owner can update company information.
          </p>

          <button
            onClick={() => router.back()}
            className="mt-7 inline-flex items-center gap-2 border border-[var(--df-text)] bg-[var(--df-text)] px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.1em] text-[var(--df-paper)]"
          >
            <ArrowLeft size={14} />
            Go back
          </button>
        </div>
      </div>
    </main>
  );
}

export default function EditCompanyPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useDispatch();

  const companyId = params?.id;

  const {
    currentCompany,
    loadingDetail,
    submitting,
    errorDetail,
    submitError,
  } = useSelector((state) => state.company);

  const {
    user,
    isAuthenticated,
    isInitialized,
  } = useSelector((state) => state.auth);

  const [form, setForm] = useState({
    name: "",
    logo: "",
    websiteUrl: "",
    industry: "",
    country: "",
  });

  const [errors, setErrors] = useState({});

  /*
   * Owner belongs to RecruiterProfile.
   * The important value is owner.userId, which should match auth.user.id.
   */
  const ownerId = useMemo(() => {
    if (!currentCompany) return null;

    return (
      currentCompany.owner?.userId ||
      currentCompany.ownerId ||
      null
    );
  }, [currentCompany]);

  const authenticatedUserId = user?.id || user?.userId || null;

  const isOwner =
    Boolean(isAuthenticated) &&
    Boolean(isInitialized) &&
    Boolean(authenticatedUserId) &&
    Boolean(ownerId) &&
    String(authenticatedUserId) === String(ownerId);

  /*
   * Load company
   */
  useEffect(() => {
    if (!companyId) return;

    dispatch(fetchCompanyById(companyId));

    return () => {
      dispatch(clearCurrentCompany());
      dispatch(clearCompanyErrors());
    };
  }, [dispatch, companyId]);

  /*
   * Populate form once company arrives.
   */
  useEffect(() => {
    if (!currentCompany) return;

    setForm({
      name: currentCompany.name || "",
      logo: currentCompany.logo || "",
      websiteUrl: currentCompany.websiteUrl || "",
      industry: currentCompany.industry || "",
      country: currentCompany.country || "",
    });
  }, [currentCompany]);

  const handleChange = (field) => (event) => {
    const value = event.target.value;

    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const validate = () => {
    const nextErrors = {};

    if (!form.name.trim()) {
      nextErrors.name = "Company name is required.";
    }

    if (form.name.trim().length < 2) {
      nextErrors.name = "Company name must contain at least 2 characters.";
    }

    if (
      form.websiteUrl.trim() &&
      !/^https?:\/\/.+/i.test(form.websiteUrl.trim())
    ) {
      nextErrors.websiteUrl =
        "Website must start with http:// or https://.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!isOwner) {
      return;
    }

    if (!validate()) {
      return;
    }

    const payload = {
      name: form.name.trim(),
      logo: form.logo.trim() || null,
      websiteUrl: form.websiteUrl.trim() || null,
      industry: form.industry || null,
      country: form.country.trim() || null,
    };

    try {
      await dispatch(updateCompany(payload)).unwrap();

      router.push(`/dashboard/recruiter/company`);
    } catch (error) {
      console.error("Failed to update company:", error);
    }
  };

  /*
   * Wait for auth + company.
   */
  if (!isInitialized || loadingDetail) {
    return <PageSkeleton />;
  }

  /*
   * If company failed to load.
   */
  if (errorDetail) {
    return (
      <main className="min-h-screen bg-[var(--df-paper)] text-[var(--df-text)]">
        <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10">

          <div className="mx-auto max-w-lg py-24 text-center">
            <Building2
              size={32}
              strokeWidth={1.2}
              className="mx-auto text-[var(--df-muted)]"
            />

            <h1 className="mt-5 text-2xl font-semibold">
              Unable to load company
            </h1>

            <p className="mt-3 text-sm leading-6 text-[var(--df-muted)]">
              {errorDetail}
            </p>

            <button
              onClick={() => dispatch(fetchCompanyById(companyId))}
              className="mt-7 border border-[var(--df-text)] bg-[var(--df-text)] px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.1em] text-[var(--df-paper)]"
            >
              Try again
            </button>
          </div>
        </div>
      </main>
    );
  }

  /*
   * No company.
   */
  if (!currentCompany) {
    return (
      <main className="min-h-screen bg-[var(--df-paper)] text-[var(--df-text)]">
        <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-xs font-medium text-[var(--df-muted)]"
          >
            <ArrowLeft size={15} />
            Back
          </button>

          <div className="py-24 text-center">
            <h1 className="text-2xl font-semibold">
              Company not found
            </h1>

            <p className="mt-2 text-sm text-[var(--df-muted)]">
              The company you're trying to edit does not exist.
            </p>
          </div>
        </div>
      </main>
    );
  }

  /*
   * Owner check.
   */
  if (!isOwner) {
    return <AccessDenied router={router} />;
  }

  return (
    <main className="min-h-screen bg-[var(--df-paper)] text-[var(--df-text)]">
      <div className="mx-auto max-w-7xl px-5 py-7 sm:px-8 lg:px-10">
        {/* =========================================
            HEADER
        ========================================= */}
        <header className="border-b border-[var(--df-line)] pb-8">
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={() =>
                router.push(`/dashboard/company/${companyId}`)
              }
              className="group inline-flex items-center gap-2 text-xs font-medium text-[var(--df-muted)] transition hover:text-[var(--df-text)]"
            >
              <ArrowLeft
                size={15}
                className="transition-transform group-hover:-translate-x-0.5"
              />
              Company profile
            </button>

            <span className="hidden items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--df-muted)] sm:inline-flex">
              <ShieldCheck size={13} />
              Owner access
            </span>
          </div>

          <div className="mt-9">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--df-muted)]">
              Company settings
            </p>

            <div className="mt-3 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <div>
                <h1 className="text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
                  Edit {currentCompany.name}
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--df-muted)]">
                  Keep your company profile accurate so developers and
                  recruiters see the right information.
                </p>
              </div>

              {currentCompany.isVerified && (
                <span className="inline-flex w-fit items-center gap-1.5 border border-[var(--df-line)] px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em]">
                  <Check size={12} />
                  Verified company
                </span>
              )}
            </div>
          </div>
        </header>

        {/* =========================================
            CONTENT
        ========================================= */}
        <form onSubmit={handleSubmit}>
          <div className="mt-10 grid gap-12 lg:grid-cols-[minmax(0,1fr)_320px]">
            {/* =====================================
                MAIN FORM
            ===================================== */}
            <div className="min-w-0 space-y-12">
              {/* Identity */}
              <section>
                <SectionHeader
                  eyebrow="01 / Identity"
                  title="Company identity"
                  description="The core information developers will see across DevFlow."
                />

                <div className="mt-7 grid gap-6">
                  <div>
                    <InputField
                      label="Company name"
                      value={form.name}
                      onChange={handleChange("name")}
                      placeholder="e.g. Acme Technologies"
                      required
                    />

                    {errors.name && (
                      <p className="mt-2 text-xs text-red-600">
                        {errors.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <InputField
                      label="Logo URL"
                      value={form.logo}
                      onChange={handleChange("logo")}
                      placeholder="https://example.com/logo.png"
                    />

                    <p className="mt-2 text-xs text-[var(--df-muted)]">
                      Use a publicly accessible image URL. A square logo
                      works best.
                    </p>

                    {errors.logo && (
                      <p className="mt-2 text-xs text-red-600">
                        {errors.logo}
                      </p>
                    )}
                  </div>
                </div>
              </section>

              {/* Business */}
              <section>
                <SectionHeader
                  eyebrow="02 / Business"
                  title="Business information"
                  description="Help developers understand what your company does and where it operates."
                />

                <div className="mt-7 grid gap-6 sm:grid-cols-2">
                  <SelectField
                    label="Industry"
                    value={form.industry}
                    onChange={handleChange("industry")}
                    options={INDUSTRIES}
                    placeholder="Select industry"
                  />

                  <SelectField
                    label="Country"
                    value={form.country}
                    onChange={handleChange("country")}
                    options={COUNTRIES}
                    placeholder="Select country"
                  />
                </div>
              </section>

              {/* Online presence */}
              <section>
                <SectionHeader
                  eyebrow="03 / Online presence"
                  title="Website"
                  description="Give candidates a direct path to learn more about your company."
                />

                <div className="mt-7">
                  <InputField
                    label="Website URL"
                    value={form.websiteUrl}
                    onChange={handleChange("websiteUrl")}
                    placeholder="https://yourcompany.com"
                  />

                  {errors.websiteUrl && (
                    <p className="mt-2 text-xs text-red-600">
                      {errors.websiteUrl}
                    </p>
                  )}
                </div>
              </section>

              {/* Submit */}
              <section className="border-t border-[var(--df-line)] pt-7">
                {submitError && (
                  <div className="mb-5 flex items-start gap-3 border border-red-200 bg-red-50 px-4 py-3">
                    <X
                      size={16}
                      className="mt-0.5 shrink-0 text-red-600"
                    />

                    <div>
                      <p className="text-xs font-semibold text-red-700">
                        Unable to save changes
                      </p>

                      <p className="mt-1 text-xs leading-5 text-red-600">
                        {submitError}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    type="button"
                    onClick={() =>
                      router.push(`/dashboard/recruiter/company`)
                    }
                    disabled={submitting}
                    className="inline-flex h-11 items-center justify-center border border-[var(--df-line)] px-5 text-xs font-semibold uppercase tracking-[0.1em] transition hover:border-[var(--df-text)] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex h-11 items-center justify-center gap-2 bg-[var(--df-text)] px-6 text-xs font-semibold uppercase tracking-[0.1em] text-[var(--df-paper)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submitting ? (
                      <>
                        <Loader2
                          size={15}
                          className="animate-spin"
                        />
                        Saving
                      </>
                    ) : (
                      <>
                        <Save size={15} />
                        Save changes
                      </>
                    )}
                  </button>
                </div>
              </section>
            </div>

            {/* =====================================
                LIVE SUMMARY
            ===================================== */}
            <aside className="lg:sticky lg:top-6 lg:self-start">
              <div className="border border-[var(--df-line)]">
                {/* Preview */}
                <div className="border-b border-[var(--df-line)] p-5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.17em] text-[var(--df-muted)]">
                    Profile preview
                  </p>

                  <div className="mt-6">
                    <div className="flex h-16 w-16 items-center justify-center overflow-hidden border border-[var(--df-line)] bg-white">
                      {form.logo ? (
                        <img
                          src={form.logo}
                          alt=""
                          className="h-full w-full object-contain p-2"
                        />
                      ) : (
                        <ImageIcon
                          size={22}
                          strokeWidth={1.3}
                          className="text-[var(--df-muted)]"
                        />
                      )}
                    </div>

                    <h3 className="mt-5 break-words text-xl font-semibold tracking-tight">
                      {form.name || "Company name"}
                    </h3>

                    <div className="mt-3 space-y-2">
                      {form.industry && (
                        <div className="flex items-center gap-2 text-xs text-[var(--df-muted)]">
                          <Building2 size={14} />
                          <span>{form.industry}</span>
                        </div>
                      )}

                      {form.country && (
                        <div className="flex items-center gap-2 text-xs text-[var(--df-muted)]">
                          <MapPin size={14} />
                          <span>
                            {COUNTRIES.find((c) => c.value === form.country)?.label || form.country}
                          </span>
                        </div>
                      )}

                      {form.websiteUrl && (
                        <div className="flex items-center gap-2 text-xs text-[var(--df-muted)]">
                          <Globe2 size={14} />
                          <span className="truncate">
                            {form.websiteUrl.replace(
                              /^https?:\/\//,
                              ""
                            )}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Verification */}
                <div className="border-b border-[var(--df-line)] p-5">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center border border-[var(--df-line)]">
                      <ShieldCheck
                        size={17}
                        strokeWidth={1.4}
                        className="text-[var(--df-muted)]"
                      />
                    </div>

                    <div>
                      <p className="text-sm font-semibold">
                        {currentCompany.isVerified
                          ? "Verified company"
                          : "Verification status"}
                      </p>

                      <p className="mt-1 text-xs leading-5 text-[var(--df-muted)]">
                        {currentCompany.isVerified
                          ? "Editing these details will not remove your existing verification."
                          : "Verification is managed separately by DevFlow administrators."}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Owner */}
                <div className="bg-black/[0.025] p-5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.17em] text-[var(--df-muted)]">
                    Permissions
                  </p>

                  <div className="mt-3 flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center bg-[var(--df-text)]">
                      <Check
                        size={13}
                        className="text-[var(--df-paper)]"
                      />
                    </div>

                    <p className="text-xs font-medium">
                      You are the company owner
                    </p>
                  </div>

                  <p className="mt-3 text-xs leading-5 text-[var(--df-muted)]">
                    Only the owner can update this company's public profile
                    information.
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </form>
      </div>
    </main>
  );
}