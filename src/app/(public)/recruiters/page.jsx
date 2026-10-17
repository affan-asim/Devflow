
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import {
  ArrowDown,
  ArrowDownRight,
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  ExternalLink,
  Globe2,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Sparkles,
  Users,
  X,
} from "lucide-react";

import { fetchRecruiterProfiles } from "@/lib/redux/slices/recruiterSlice";

const PAGE_SIZE = 10;

const INITIAL_FILTERS = {
  search: "",
  jobTitle: "",
  locationPreference: "",
  minExp: "",
  maxExp: "",
  isVerified: "",
  sortBy: "createdAt",
  sortOrder: "desc",
};

function formatDate(value) {
  if (!value) return null;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat("en", {
    month: "short",
    year: "numeric",
  }).format(date);
}

function getInitials(name) {
  if (!name) return "R";

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function safeUrl(value) {
  if (!value) return null;

  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
}

function formatPreference(value) {
  if (!value) return "Flexible";

  const labels = {
    REMOTE: "Remote",
    ONSITE: "On-site",
    HYBRID: "Hybrid",
  };

  return labels[value] || value;
}

function RecruiterCard({ profile }) {
  const name = profile.user?.name || "Recruiter";
  const company = profile.company;
  const portfolioUrl = safeUrl(profile.portfolioUrl);
  const githubUrl = safeUrl(profile.githubUrl);

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.45 }}
      className="group border border-[var(--df-line)] transition-colors duration-300 hover:bg-[var(--df-paper-2)]"
    >
      <Link href={`/recruiters/${profile.id}`} className="block p-6 sm:p-7 lg:p-8">
        <div className="grid gap-6 sm:grid-cols-[1fr_auto] sm:items-start sm:gap-8">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              {profile.user?.isVerified && (
                <span className="bg-[var(--df-accent)] px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.15em] text-[var(--df-black)]">
                  Verified recruiter
                </span>
              )}
              <span className="text-[10px] uppercase tracking-[0.16em] text-[var(--df-muted)]">
                {company?.isVerified ? "Verified company" : "Recruiting professional"}
              </span>
            </div>

            <div className="mt-4 flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden border border-[var(--df-line)] bg-[var(--df-paper-2)] text-sm font-semibold">
                {company?.logo ? (
                  <img src={company.logo} alt={`${company.name || "Company"} logo`} className="h-full w-full object-cover" loading="lazy" />
                ) : getInitials(name)}
              </div>
              <div className="min-w-0">
                <h2 className="text-2xl font-semibold tracking-[-0.04em] text-[var(--df-text)] sm:text-3xl">{name}</h2>
                <p className="mt-1 text-sm font-medium text-[var(--df-muted)]">
                  {profile.jobTitle || "Recruiting professional"} <span className="mx-1.5">·</span> {company?.name || "Independent recruiter"}
                </p>
              </div>
            </div>

            <p className="mt-5 line-clamp-2 max-w-3xl text-sm leading-6 text-[var(--df-muted)]">
              {profile.bio || profile.description || "View this recruiter’s experience, specialties, and professional profile."}
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              <span className="border border-[var(--df-line)] px-2.5 py-1.5 text-[10px] font-medium text-[var(--df-muted)]">{formatPreference(profile.locationPreference)}</span>
              {typeof profile.yearsOfExp === "number" && <span className="border border-[var(--df-line)] px-2.5 py-1.5 text-[10px] font-medium text-[var(--df-muted)]">{profile.yearsOfExp} {profile.yearsOfExp === 1 ? "year" : "years"} experience</span>}
            </div>
          </div>

          <div className="flex items-end justify-between gap-8 sm:min-w-[180px] sm:flex-col sm:items-end">
            <div className="sm:text-right">
              <p className="text-[10px] uppercase tracking-[0.15em] text-[var(--df-soft)]">Organization</p>
              <p className="mt-2 text-sm font-semibold text-[var(--df-text)]">{company?.name || "Independent"}</p>
              {profile.user?.createdAt && <p className="mt-1 text-xs text-[var(--df-muted)]">Member since {formatDate(profile.user.createdAt)}</p>}
            </div>
            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--df-line)] transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1">
              <ArrowDownRight size={16} />
            </span>
          </div>
        </div>
      </Link>
      {(portfolioUrl || githubUrl) && (
        <div className="flex gap-4 border-t border-[var(--df-line)] px-6 py-3 sm:px-7 lg:px-8">
          {portfolioUrl && <a href={portfolioUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--df-muted)] hover:text-[var(--df-text)]">Portfolio <ExternalLink size={12} /></a>}
          {githubUrl && <a href={githubUrl} target="_blank" rel="noreferrer" aria-label={`${name}'s GitHub`} className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--df-muted)] hover:text-[var(--df-text)]">GitHub <ExternalLink size={12} /></a>}
        </div>
      )}
    </motion.article>
  );
}

function FilterField({ label, children, className = "" }) {
  return (
    <label className={`block min-w-0 ${className}`}>
      <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--df-muted)]">
        {label}
      </span>
      {children}
    </label>
  );
}

const inputClass =
  "h-10 w-full border border-[var(--df-line)] bg-[var(--df-paper)] px-3 text-xs font-medium text-[var(--df-text)] outline-none transition-colors placeholder:text-[var(--df-soft)] hover:bg-[var(--df-paper-2)] focus:border-[var(--df-text)]";

export default function PublicRecruitersPage() {
  const dispatch = useDispatch();

  const {
    profiles = [],
    profilesMetadata,
    loadingProfiles,
    errorProfiles,
  } = useSelector((state) => state.recruiter);

  const [draft, setDraft] = useState(INITIAL_FILTERS);
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [page, setPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const metadata = profilesMetadata || {};
  const totalCount = metadata.totalCount || 0;
  const totalPages = metadata.totalPages || 0;
  const currentPage = metadata.currentPage || page;

  const requestParams = useMemo(
    () => ({
      page,
      limit: PAGE_SIZE,
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
      ...(filters.search.trim() && { search: filters.search.trim() }),
      ...(filters.jobTitle.trim() && { jobTitle: filters.jobTitle.trim() }),
      ...(filters.locationPreference && {
        locationPreference: filters.locationPreference,
      }),
      ...(filters.minExp !== "" && { minExp: filters.minExp }),
      ...(filters.maxExp !== "" && { maxExp: filters.maxExp }),
      ...(filters.isVerified !== "" && {
        isVerified: filters.isVerified,
      }),
    }),
    [page, filters]
  );

  const loadProfiles = useCallback(() => {
    dispatch(fetchRecruiterProfiles(requestParams));
  }, [dispatch, requestParams]);

  useEffect(() => {
    loadProfiles();
  }, [loadProfiles]);

  function updateDraft(key, value) {
    setDraft((previous) => ({ ...previous, [key]: value }));
  }

  function applyFilters(event) {
    event.preventDefault();
    setPage(1);
    setFilters({ ...draft });
    setFiltersOpen(false);
  }

  function clearFilters() {
    setDraft(INITIAL_FILTERS);
    setFilters(INITIAL_FILTERS);
    setPage(1);
  }

  const activeFilterCount = [
    filters.jobTitle,
    filters.locationPreference,
    filters.minExp,
    filters.maxExp,
    filters.isVerified,
  ].filter(Boolean).length;

  return (
    <main className="min-h-screen bg-[var(--df-paper)] text-[var(--df-text)]">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
        <header className="border-b border-[var(--df-line)] pb-10 pt-12 sm:pb-14 sm:pt-16 lg:pb-20 lg:pt-24">
          <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.17em] text-[var(--df-muted)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--df-accent)]" />
            DevFlow / Recruiter directory
          </div>

          <div className="mt-7 grid gap-8 lg:grid-cols-[1.4fr_0.6fr] lg:items-end">
            <div>
              <h1 className="max-w-5xl text-4xl font-semibold leading-[1.06] tracking-[-0.055em] sm:text-6xl lg:text-7xl">
                The people behind
                <br className="hidden sm:block" />{" "}
                <span className="text-[var(--df-muted)]">
                  great opportunities.
                </span>
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-7 text-[var(--df-muted)] sm:text-lg sm:leading-8">
                Meet recruiting professionals connecting skilled developers
                with meaningful work. Explore their experience, specialties,
                and professional profiles.
              </p>
            </div>

            <div className="border-l border-[var(--df-line)] pl-5 lg:mb-1 lg:justify-self-end lg:pl-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--df-muted)]">
                Directory overview
              </p>
              <p className="mt-2 text-4xl font-semibold tracking-[-0.05em]">
                {loadingProfiles && !metadata.totalCount
                  ? "—"
                  : totalCount.toLocaleString()}
              </p>
              <p className="mt-1 text-sm text-[var(--df-muted)]">
                Recruiter profiles
              </p>
            </div>
          </div>

          <div className="mt-9 flex flex-wrap gap-x-6 gap-y-2 border-t border-[var(--df-line)] pt-5 text-xs text-[var(--df-muted)]">
            <span className="inline-flex items-center gap-2">
              <Users size={14} />
              Recruiting professionals
            </span>
            <span className="inline-flex items-center gap-2">
              <BadgeCheck size={14} />
              Verification indicators
            </span>
            <span className="inline-flex items-center gap-2">
              <Globe2 size={14} />
              Remote, hybrid and on-site preferences
            </span>
          </div>
        </header>

        <section className="border-y border-[var(--df-line)] py-7">
          <aside>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--df-muted)]">
                  Discover
                </p>
                <h2 className="mt-1 text-lg font-semibold tracking-tight">
                  Search the recruiter directory
                </h2>
              </div>

            </div>

            <div className="mt-5">
              <form onSubmit={applyFilters} className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <FilterField label="Search" className="min-w-0 flex-1">
                <div className="relative">
                  <Search
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--df-muted)]"
                  />
                  <input
                    value={draft.search}
                    onChange={(event) =>
                      updateDraft("search", event.target.value)
                    }
                    placeholder="Name, bio, company..."
                    className="h-14 w-full border border-[var(--df-line)] bg-[var(--df-paper)] pl-10 pr-4 text-sm text-[var(--df-text)] outline-none transition placeholder:text-[var(--df-soft)] focus:border-[var(--df-text)]"
                  />
                </div>
              </FilterField>
              <button
                type="button"
                onClick={() => setFiltersOpen((open) => !open)}
                aria-expanded={filtersOpen}
                aria-controls="recruiter-filters"
                className="inline-flex min-h-14 items-center justify-center gap-2 border border-[var(--df-line)] px-5 text-sm font-medium transition-colors hover:border-[var(--df-text)]"
              >
                <SlidersHorizontal size={16} />
                Filters
                {activeFilterCount > 0 && <span className="flex size-5 items-center justify-center rounded-full bg-[var(--df-accent)] text-[10px] font-semibold text-black">{activeFilterCount}</span>}
              </button>
              <button type="submit" className="df-btn df-btn-primary min-h-14 rounded-none px-7">
                <Search size={15} /> Search
              </button>
              </form>

              {filtersOpen && (
              <form
              id="recruiter-filters"
              onSubmit={applyFilters}
              className="mt-4 grid grid-cols-1 gap-4 border border-[var(--df-line)] p-5 sm:grid-cols-2 lg:grid-cols-4 lg:items-end"
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--df-muted)] sm:col-span-2 lg:col-span-4">Refine your search</p>
              <div>
                <FilterField label="Job title">
                  <input
                    value={draft.jobTitle}
                    onChange={(event) =>
                      updateDraft("jobTitle", event.target.value)
                    }
                    placeholder="e.g. Technical Recruiter"
                    className={inputClass}
                  />
                </FilterField>
              </div>

              <div>
                <FilterField label="Work preference">
                  <select
                    value={draft.locationPreference}
                    onChange={(event) =>
                      updateDraft("locationPreference", event.target.value)
                    }
                    className={inputClass}
                  >
                    <option value="">Any preference</option>
                    <option value="REMOTE">Remote</option>
                    <option value="HYBRID">Hybrid</option>
                    <option value="ONSITE">On-site</option>
                  </select>
                </FilterField>
              </div>

              <div>
                <FilterField label="Experience (years)">
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      min="0"
                      value={draft.minExp}
                      onChange={(event) =>
                        updateDraft("minExp", event.target.value)
                      }
                      placeholder="Min"
                      className={inputClass}
                    />
                    <input
                      type="number"
                      min="0"
                      value={draft.maxExp}
                      onChange={(event) =>
                        updateDraft("maxExp", event.target.value)
                      }
                      placeholder="Max"
                      className={inputClass}
                    />
                  </div>
                </FilterField>
              </div>

              <div>
                <FilterField label="Account verification">
                  <select
                    value={draft.isVerified}
                    onChange={(event) =>
                      updateDraft("isVerified", event.target.value)
                    }
                    className={inputClass}
                  >
                    <option value="">All accounts</option>
                    <option value="true">Verified</option>
                    <option value="false">Not verified</option>
                  </select>
                </FilterField>
              </div>

              <div>
                <FilterField label="Sort by">
                  <select
                    value={`${draft.sortBy}:${draft.sortOrder}`}
                    onChange={(event) => {
                      const [sortBy, sortOrder] = event.target.value.split(":");
                      setDraft((previous) => ({
                        ...previous,
                        sortBy,
                        sortOrder,
                      }));
                    }}
                    className={inputClass}
                  >
                    <option value="createdAt:desc">Recently joined</option>
                    <option value="createdAt:asc">Oldest members</option>
                    <option value="yearsOfExp:desc">Most experienced</option>
                    <option value="yearsOfExp:asc">Least experienced</option>
                    <option value="jobTitle:asc">Job title A–Z</option>
                  </select>
                </FilterField>
              </div>

              <button
                type="submit"
                className="df-btn df-btn-primary min-h-11 w-full rounded-none"
              >
                <SlidersHorizontal size={14} />
                Apply filters
              </button>

              <button
                type="button"
                onClick={clearFilters}
                className="df-btn df-btn-outline min-h-11 w-full rounded-none"
              >
                <X size={13} />
                Clear all filters
              </button>
            </form>
              )}
            </div>
          </aside>

        </section>

        <section className="py-12 lg:py-16">
          <div className="min-w-0">
            <div className="flex flex-col justify-between gap-4 border-b border-[var(--df-line)] pb-5 sm:flex-row sm:items-end">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--df-muted)]">
                  The directory
                </p>
                <h2 className="mt-1 text-2xl font-semibold tracking-[-0.04em]">
                  Recruiter profiles
                </h2>
                <p className="mt-1.5 text-sm text-[var(--df-muted)]">
                  {totalCount.toLocaleString()}{" "}
                  {totalCount === 1 ? "profile" : "profiles"} found
                  {activeFilterCount > 0
                    ? ` · ${activeFilterCount} additional filter${activeFilterCount === 1 ? "" : "s"}`
                    : ""}
                </p>
              </div>

              <button
                type="button"
                onClick={loadProfiles}
                disabled={loadingProfiles}
                className="inline-flex items-center gap-2 self-start text-xs font-semibold text-[var(--df-text)] disabled:opacity-50 sm:self-auto"
              >
                <RefreshCw
                  size={13}
                  className={loadingProfiles ? "animate-spin" : ""}
                />
                Refresh results
              </button>
            </div>

            {errorProfiles && (
              <div
                role="alert"
                className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-5"
              >
                <div className="flex items-start gap-3">
                  <Sparkles
                    size={18}
                    className="mt-0.5 shrink-0 text-amber-800"
                  />
                  <div>
                    <h3 className="text-sm font-semibold text-amber-950">
                      The directory could not be loaded
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-amber-900">
                      {errorProfiles}
                    </p>
                    <p className="mt-2 text-xs leading-5 text-amber-800">
                      If this is an access restriction, sign in with an
                      authorized account or contact the DevFlow team.
                    </p>
                    <button
                      type="button"
                      onClick={loadProfiles}
                      className="mt-3 text-xs font-semibold text-amber-950 underline underline-offset-4"
                    >
                      Try again
                    </button>
                  </div>
                </div>
              </div>
            )}

            {loadingProfiles && profiles.length === 0 ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="animate-pulse border border-[var(--df-line)] bg-white p-6 sm:p-8">
                    <div className="flex gap-4">
                      <div className="h-14 w-14 rounded-full bg-stone-200" />
                      <div className="flex-1">
                        <div className="h-4 w-40 rounded bg-stone-200" />
                        <div className="mt-3 h-3 w-56 rounded bg-stone-100" />
                        <div className="mt-4 h-3 w-full max-w-lg rounded bg-stone-100" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : !errorProfiles && profiles.length === 0 ? (
              <div className="py-20 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-[var(--df-line)]">
                  <Search size={19} className="text-[var(--df-muted)]" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">
                  No recruiters found
                </h3>
                <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[var(--df-muted)]">
                  Try another search term or remove some filters to explore
                  more profiles.
                </p>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-5 text-sm font-semibold underline underline-offset-4"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <>
                <div className={`space-y-3 ${loadingProfiles ? "opacity-60" : ""}`}>
                  {profiles.map((profile) => (
                    <RecruiterCard key={profile.id} profile={profile} />
                  ))}
                </div>

                <div className="flex flex-col justify-between gap-4 border-t border-[var(--df-line)] py-6 sm:flex-row sm:items-center">
                  <p className="text-xs text-[var(--df-muted)]">
                    Page {currentPage}
                    {totalPages ? ` of ${totalPages}` : ""}
                    {" · "}
                    {profiles.length} results on this page
                  </p>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={!metadata.hasPreviousPage || loadingProfiles}
                      onClick={() => setPage((value) => Math.max(1, value - 1))}
                      className="inline-flex h-9 items-center gap-2 rounded-lg border border-[var(--df-line)] px-3 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <ArrowLeft size={13} />
                      Previous
                    </button>

                    <button
                      type="button"
                      disabled={!metadata.hasNextPage || loadingProfiles}
                      onClick={() => setPage((value) => value + 1)}
                      className="inline-flex h-9 items-center gap-2 rounded-lg border border-[var(--df-line)] px-3 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Next
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </section>

        <footer className="flex flex-col justify-between gap-4 border-t border-[var(--df-line)] py-6 text-xs text-[var(--df-muted)] sm:flex-row sm:items-center">
          <p>DevFlow — connecting talent with opportunity.</p>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 font-medium hover:text-[var(--df-text)]"
          >
            Back to home
            <ArrowDown size={12} className="-rotate-90" />
          </Link>
        </footer>
      </div>
    </main>
  );
}
