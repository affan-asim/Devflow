"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import {
  Search,
  SlidersHorizontal,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  MapPin,
  BriefcaseBusiness,
  Building2,
  Mail,
  CheckCircle2,
  XCircle,
  UserRound,
  ArrowUpDown,
  Users,
  ShieldCheck,
} from "lucide-react";

import { fetchRecruiterProfiles } from "@/lib/redux/slices/recruiterSlice";

const LOCATION_OPTIONS = [
  { value: "", label: "All work preferences" },
  { value: "REMOTE", label: "Remote" },
  { value: "ONSITE", label: "On-site" },
  { value: "HYBRID", label: "Hybrid" },
];

const ACTIVE_OPTIONS = [
  { value: "", label: "All activity states" },
  { value: "true", label: "Active" },
  { value: "false", label: "Inactive" },
];

const VERIFIED_OPTIONS = [
  { value: "", label: "All verification states" },
  { value: "true", label: "Verified" },
  { value: "false", label: "Unverified" },
];

const SORT_OPTIONS = [
  { value: "createdAt:desc", label: "Newest profiles" },
  { value: "createdAt:asc", label: "Oldest profiles" },
  { value: "yearsOfExp:desc", label: "Most experience" },
  { value: "yearsOfExp:asc", label: "Least experience" },
  { value: "name:asc", label: "Name A–Z" },
  { value: "name:desc", label: "Name Z–A" },
];

function getInitials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function formatExperience(years) {
  if (years === null || years === undefined) return "Experience not listed";

  const value = Number(years);

  if (value === 0) return "Entry level";
  if (value === 1) return "1 year experience";
  return `${value} years experience`;
}

function formatLocationPreference(value) {
  if (!value) return "Not specified";

  return value
    .toLowerCase()
    .replace("_", " ")
    .replace(/^\w/, (char) => char.toUpperCase());
}

function RecruiterCard({ recruiter }) {
  const user = recruiter.user;
  const company = recruiter.company;

  return (
    <article className="group border border-[var(--df-line)] bg-[var(--df-paper)] transition-colors hover:border-[var(--df-text)]">
      <div className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden border border-[var(--df-line)] bg-[#eeeae2] text-sm font-semibold text-[var(--df-text)]">
              {user?.name ? (
                getInitials(user.name)
              ) : (
                <UserRound size={20} strokeWidth={1.7} />
              )}
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="truncate text-base font-semibold tracking-[-0.01em] text-[var(--df-text)]">
                  {user?.name || "Unnamed recruiter"}
                </h2>

                {user?.isVerified && (
                  <CheckCircle2
                    size={15}
                    className="shrink-0 text-[var(--df-accent)]"
                  />
                )}
              </div>

              <p className="mt-1 truncate text-sm text-[var(--df-muted)]">
                {recruiter.jobTitle || "Recruiter"}
              </p>
            </div>
          </div>

          <span
            className={`shrink-0 text-[10px] font-semibold uppercase tracking-[0.12em] ${
              user?.isActive
                ? "text-[var(--df-accent)]"
                : "text-[var(--df-muted)]"
            }`}
          >
            {user?.isActive ? "Active" : "Inactive"}
          </span>
        </div>

        <div className="mt-6 space-y-3 border-t border-[var(--df-line)] pt-5">
          <div className="flex items-center gap-3 text-sm text-[var(--df-muted)]">
            <BriefcaseBusiness size={16} strokeWidth={1.7} />
            <span>{formatExperience(recruiter.yearsOfExp)}</span>
          </div>

          <div className="flex items-center gap-3 text-sm text-[var(--df-muted)]">
            <MapPin size={16} strokeWidth={1.7} />
            <span>
              {formatLocationPreference(recruiter.locationPreference)}
            </span>
          </div>

          {company?.name && (
            <div className="flex min-w-0 items-center gap-3 text-sm text-[var(--df-muted)]">
              <Building2 size={16} strokeWidth={1.7} />
              <span className="truncate">{company.name}</span>

              {company.isVerified && (
                <CheckCircle2
                  size={14}
                  className="shrink-0 text-[var(--df-accent)]"
                />
              )}
            </div>
          )}

          {user?.email && (
            <div className="flex min-w-0 items-center gap-3 text-sm text-[var(--df-muted)]">
              <Mail size={16} strokeWidth={1.7} />
              <span className="truncate">{user.email}</span>
            </div>
          )}
        </div>

        {recruiter.bio && (
          <p className="mt-5 line-clamp-2 text-sm leading-6 text-[var(--df-muted)]">
            {recruiter.bio}
          </p>
        )}

        <div className="mt-6 flex items-center justify-between border-t border-[var(--df-line)] pt-4">
          <span className="text-xs uppercase tracking-[0.1em] text-[var(--df-muted)]">
            Recruiter profile
          </span>

          <Link
            href={`/dashboard/recruiter/explore-recruiters/${recruiter.id}`}
            className="inline-flex items-center gap-2 text-sm font-medium text-[var(--df-text)] transition-opacity hover:opacity-60"
          >
            View profile
            <ExternalLink size={15} strokeWidth={1.7} />
          </Link>
        </div>
      </div>
    </article>
  );
}

function LoadingCard() {
  return (
    <div className="border border-[var(--df-line)] bg-[var(--df-paper)] p-6">
      <div className="animate-pulse">
        <div className="flex gap-4">
          <div className="h-12 w-12 bg-[#e9e5dd]" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-40 bg-[#e9e5dd]" />
            <div className="h-3 w-28 bg-[#e9e5dd]" />
          </div>
        </div>

        <div className="mt-7 space-y-3">
          <div className="h-3 w-36 bg-[#e9e5dd]" />
          <div className="h-3 w-32 bg-[#e9e5dd]" />
          <div className="h-3 w-44 bg-[#e9e5dd]" />
        </div>
      </div>
    </div>
  );
}

export default function RecruiterProfilesPage() {
  const dispatch = useDispatch();

  const {
    profiles,
    profilesMetadata,
    loadingProfiles,
    errorProfiles,
  } = useSelector((state) => state.recruiter);

  const [search, setSearch] = useState("");
  const [email, setEmail] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [locationPreference, setLocationPreference] = useState("");
  const [isActive, setIsActive] = useState("");
  const [isVerified, setIsVerified] = useState("");
  const [minExp, setMinExp] = useState("");
  const [maxExp, setMaxExp] = useState("");

  const [sort, setSort] = useState("createdAt:desc");
  const [page, setPage] = useState(1);
  const [filtersExpanded, setFiltersExpanded] = useState(false);

  const limit = 12;

  const [searchInput, setSearchInput] = useState("");

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);

    return () => clearTimeout(timeout);
  }, [searchInput]);

  const fetchProfiles = useCallback(() => {
    const [sortBy, sortOrder] = sort.split(":");

    const params = {
      page,
      limit,
      sortBy,
      sortOrder,
      independentOnly: true,
    };

    if (search.trim()) params.search = search.trim();
    if (email.trim()) params.email = email.trim();
    if (jobTitle.trim()) params.jobTitle = jobTitle.trim();

    if (locationPreference) {
      params.locationPreference = locationPreference;
    }

    if (isActive) {
      params.isActive = isActive;
    }

    if (isVerified) {
      params.isVerified = isVerified;
    }

    if (minExp !== "") {
      params.minExp = minExp;
    }

    if (maxExp !== "") {
      params.maxExp = maxExp;
    }

    dispatch(fetchRecruiterProfiles(params));
  }, [
    dispatch,
    page,
    search,
    email,
    jobTitle,
    locationPreference,
    isActive,
    isVerified,
    minExp,
    maxExp,
    sort,
  ]);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  const resetFilters = () => {
    setSearchInput("");
    setSearch("");
    setEmail("");
    setJobTitle("");
    setLocationPreference("");
    setIsActive("");
    setIsVerified("");
    setMinExp("");
    setMaxExp("");
    setSort("createdAt:desc");
    setPage(1);
  };

  const activeFilterCount = useMemo(() => {
    return [
      search,
      email,
      jobTitle,
      locationPreference,
      isActive,
      isVerified,
      minExp,
      maxExp,
    ].filter(Boolean).length;
  }, [
    search,
    email,
    jobTitle,
    locationPreference,
    isActive,
    isVerified,
    minExp,
    maxExp,
  ]);

  return (
    <main className="min-h-screen bg-[var(--df-paper)] text-[var(--df-text)]">
      <div className="mx-auto max-w-[1500px] px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="border-b border-[var(--df-line)] pb-7">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-[var(--df-muted)]">
                <Users size={14} />
                Recruiter workspace
              </div>

              <h1 className="text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">
                Recruiter profiles
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--df-muted)]">
                Explore recruiter profiles, review their experience and
                availability, then invite the right people to your company.
              </p>
            </div>

            <div className="flex items-center gap-3 text-sm text-[var(--df-muted)]">
              <span>
                {profilesMetadata.totalCount || 0} recruiter
                {profilesMetadata.totalCount === 1 ? "" : "s"}
              </span>

              {activeFilterCount > 0 && (
                <span className="border border-[var(--df-line)] px-3 py-1.5 text-xs">
                  {activeFilterCount} filter
                  {activeFilterCount === 1 ? "" : "s"}
                </span>
              )}
            </div>
          </div>
        </header>

        {/* Search */}
        <section className="mt-7">
          <div className="flex flex-col border border-[var(--df-line)] bg-[var(--df-paper)] lg:flex-row">
            <div className="flex flex-1 items-center gap-3 px-4">
              <Search
                size={19}
                strokeWidth={1.7}
                className="shrink-0 text-[var(--df-muted)]"
              />

              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search recruiter, company, email, bio or description..."
                className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-[var(--df-muted)]"
              />
            </div>

            <div className="flex border-t border-[var(--df-line)] lg:border-l lg:border-t-0">
              <select
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value);
                  setPage(1);
                }}
                className="h-12 w-full min-w-[190px] bg-transparent px-4 text-sm outline-none lg:w-auto"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                aria-expanded={filtersExpanded}
                onClick={() => setFiltersExpanded((expanded) => !expanded)}
                className="inline-flex shrink-0 items-center gap-2 border-l border-[var(--df-line)] px-4 text-sm font-medium text-[var(--df-text)] hover:bg-[#eeeae2]"
              >
                <SlidersHorizontal size={16} />
                Filters
                {activeFilterCount > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--df-text)] px-1 text-[10px] text-[var(--df-paper)]">
                    {activeFilterCount}
                  </span>
                )}
                {filtersExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            </div>
          </div>
        </section>

        {/* Filters */}
        {filtersExpanded && <section className="mt-4 border border-[var(--df-line)]">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="text-sm font-medium">Filter recruiters</div>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.08em] text-[var(--df-muted)] hover:text-[var(--df-text)]"
              >
                <RotateCcw size={14} />
                Reset
              </button>
            </div>
          </div>

          <div className="grid gap-px border-t border-[var(--df-line)] bg-[var(--df-line)] sm:grid-cols-2 lg:grid-cols-4">
            <FilterInput
              label="Email"
              value={email}
              onChange={(value) => {
                setEmail(value);
                setPage(1);
              }}
              placeholder="recruiter@email.com"
            />

            <FilterInput
              label="Job title"
              value={jobTitle}
              onChange={(value) => {
                setJobTitle(value);
                setPage(1);
              }}
              placeholder="Talent acquisition..."
            />

            <SelectFilter
              label="Location"
              value={locationPreference}
              onChange={(value) => {
                setLocationPreference(value);
                setPage(1);
              }}
              options={LOCATION_OPTIONS}
            />

            <SelectFilter
              label="Activity"
              value={isActive}
              onChange={(value) => {
                setIsActive(value);
                setPage(1);
              }}
              options={ACTIVE_OPTIONS}
            />

            <SelectFilter
              label="Verification"
              value={isVerified}
              onChange={(value) => {
                setIsVerified(value);
                setPage(1);
              }}
              options={VERIFIED_OPTIONS}
            />

            <FilterInput
              label="Minimum experience"
              type="number"
              min="0"
              value={minExp}
              onChange={(value) => {
                setMinExp(value);
                setPage(1);
              }}
              placeholder="0"
            />

            <FilterInput
              label="Maximum experience"
              type="number"
              min="0"
              value={maxExp}
              onChange={(value) => {
                setMaxExp(value);
                setPage(1);
              }}
              placeholder="10"
            />
          </div>
        </section>}

        {/* Results */}
        <section className="mt-8">
          {errorProfiles && (
            <div className="border border-[var(--df-line)] p-6">
              <p className="text-sm font-medium">Unable to load recruiters.</p>
              <p className="mt-2 text-sm text-[var(--df-muted)]">
                {errorProfiles}
              </p>

              <button
                type="button"
                onClick={fetchProfiles}
                className="mt-4 inline-flex items-center gap-2 border border-[var(--df-text)] px-4 py-2 text-sm font-medium"
              >
                <RotateCcw size={15} />
                Try again
              </button>
            </div>
          )}

          {!errorProfiles && loadingProfiles && (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <LoadingCard key={index} />
              ))}
            </div>
          )}

          {!errorProfiles &&
            !loadingProfiles &&
            profiles.length === 0 && (
              <div className="border border-[var(--df-line)] px-6 py-16 text-center">
                <UserRound
                  size={28}
                  strokeWidth={1.5}
                  className="mx-auto text-[var(--df-muted)]"
                />

                <h2 className="mt-5 text-lg font-semibold">
                  No recruiters found
                </h2>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--df-muted)]">
                  Try changing your search or removing some filters.
                </p>

                <button
                  type="button"
                  onClick={resetFilters}
                  className="mt-6 border border-[var(--df-text)] px-4 py-2 text-sm font-medium"
                >
                  Clear filters
                </button>
              </div>
            )}

          {!errorProfiles &&
            !loadingProfiles &&
            profiles.length > 0 && (
              <>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {profiles.map((recruiter) => (
                    <RecruiterCard
                      key={recruiter.id}
                      recruiter={recruiter}
                    />
                  ))}
                </div>

                {/* Pagination */}
                <div className="mt-8 flex flex-col gap-4 border-t border-[var(--df-line)] pt-5 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-[var(--df-muted)]">
                    Page {profilesMetadata.currentPage} of{" "}
                    {profilesMetadata.totalPages || 1}
                  </p>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={!profilesMetadata.hasPreviousPage}
                      onClick={() =>
                        setPage((current) => Math.max(1, current - 1))
                      }
                      className="inline-flex items-center gap-2 border border-[var(--df-line)] px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <ChevronLeft size={16} />
                      Previous
                    </button>

                    <button
                      type="button"
                      disabled={!profilesMetadata.hasNextPage}
                      onClick={() => setPage((current) => current + 1)}
                      className="inline-flex items-center gap-2 border border-[var(--df-line)] px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Next
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </>
            )}
        </section>
      </div>
    </main>
  );
}

function FilterInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  min,
}) {
  return (
    <label className="bg-[var(--df-paper)] p-4">
      <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.13em] text-[var(--df-muted)]">
        {label}
      </span>

      <input
        type={type}
        min={min}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-9 w-full border-b border-[var(--df-line)] bg-transparent text-sm outline-none transition-colors focus:border-[var(--df-text)] placeholder:text-[var(--df-muted)]"
      />
    </label>
  );
}

function SelectFilter({ label, value, onChange, options }) {
  return (
    <label className="bg-[var(--df-paper)] p-4">
      <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.13em] text-[var(--df-muted)]">
        {label}
      </span>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 w-full border-b border-[var(--df-line)] bg-transparent text-sm outline-none"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
