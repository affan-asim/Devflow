
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowDownRight,
  ArrowLeft,
  ArrowRight,
  ArrowUpDown,
  BriefcaseBusiness,
  Code2,
  MapPin,
  Search,
  SlidersHorizontal,
  Sparkles,
  X,
} from "lucide-react";
import { fetchDevelopers } from "@/lib/redux/slices/developerSlice";

const PAGE_SIZE = 10;

function formatLabel(value) {
  if (!value) return "Not specified";

  return String(value)
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getInitials(name) {
  return (
    name
      ?.trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "D"
  );
}

function DeveloperCard({ developer, index }) {
  const name = developer.user?.name || "Developer";
  const skills = developer.skills || [];

  return (
    <article className="group relative flex h-full flex-col overflow-hidden border border-[var(--df-line)] bg-transparent transition-all duration-300 hover:-translate-y-1 hover:border-[var(--df-text)] hover:bg-[var(--df-paper-2)]">
      <div className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-[var(--df-accent)] transition-transform duration-300 group-hover:scale-x-100" />
      <div className="flex items-start justify-between gap-4 px-5 pb-4 pt-6 sm:px-6 sm:pt-7">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex size-12 shrink-0 items-center justify-center border border-[var(--df-line)] bg-transparent text-sm font-semibold transition-colors group-hover:border-[var(--df-accent)] group-hover:bg-[var(--df-accent)]">
            {getInitials(name)}
          </div>

          <div className="min-w-0">
            <h2 className="truncate text-base font-semibold tracking-tight">
              {name}
            </h2>
            <p className="mt-1 text-xs text-[var(--df-muted)]">
              {developer.yearsOfExp == null
                ? "Experience not specified"
                : `${developer.yearsOfExp} ${
                    developer.yearsOfExp === 1 ? "year" : "years"
                  } experience`}
            </p>
          </div>
        </div>

        <span className="shrink-0 font-mono text-xs text-[var(--df-muted)]">
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>

      <div className="flex flex-1 flex-col px-5 pb-5 sm:px-6 sm:pb-6">
        <p className="line-clamp-3 min-h-[4.5rem] whitespace-pre-line text-sm leading-6 text-[var(--df-muted)]">
          {developer.bio || "This developer hasn't added a bio yet."}
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          {skills.slice(0, 5).map((skill, skillIndex) => (
            <span
              key={skill.id || `${skill.name}-${skillIndex}`}
              className="border border-[var(--df-line)] bg-transparent px-2.5 py-1 text-xs transition-colors group-hover:bg-[var(--df-paper)]"
            >
              {skill.name}
            </span>
          ))}

          {skills.length > 5 && (
            <span className="px-1 py-1 text-xs text-[var(--df-muted)]">
              +{skills.length - 5} more
            </span>
          )}

          {!skills.length && (
            <span className="text-xs text-[var(--df-muted)]">
              No skills listed
            </span>
          )}
        </div>

        <div className="mt-6 flex flex-wrap gap-x-4 gap-y-2 border-t border-[var(--df-line)] pt-4 text-xs text-[var(--df-muted)]">
          <span className="inline-flex items-center gap-1.5">
            <MapPin size={14} />
            {formatLabel(developer.locationPreference)}
          </span>

          <span className="inline-flex items-center gap-1.5">
            <BriefcaseBusiness size={14} />
            {developer.yearsOfExp == null
              ? "Experience N/A"
              : `${developer.yearsOfExp} ${
                  developer.yearsOfExp === 1 ? "year" : "years"
                }`}
          </span>
        </div>

        <Link
          href={`/developers/${encodeURIComponent(developer.userId)}`}
          className="mt-6 inline-flex min-h-11 items-center justify-between border border-[var(--df-line)] bg-transparent px-4 text-sm font-semibold transition-colors group-hover:border-[var(--df-text)] group-hover:bg-[var(--df-text)] group-hover:text-[var(--df-paper)]"
        >
          View profile
          <ArrowDownRight size={16} />
        </Link>
      </div>
    </article>
  );
}

function DeveloperCardSkeleton() {
  return (
    <div className="animate-pulse border border-[var(--df-line)] bg-transparent p-6">
      <div className="flex items-center gap-3">
        <div className="size-12 rounded-full bg-[var(--df-line)]" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-2/3 bg-[var(--df-line)]" />
          <div className="h-3 w-1/3 bg-[var(--df-line)]" />
        </div>
      </div>
      <div className="mt-7 h-3 w-full bg-[var(--df-line)]" />
      <div className="mt-3 h-3 w-4/5 bg-[var(--df-line)]" />
      <div className="mt-6 flex gap-2">
        <div className="h-7 w-16 bg-[var(--df-line)]" />
        <div className="h-7 w-20 bg-[var(--df-line)]" />
        <div className="h-7 w-14 bg-[var(--df-line)]" />
      </div>
      <div className="mt-8 h-11 bg-[var(--df-paper)]" />
    </div>
  );
}

export default function DevelopersPage() {
  const dispatch = useDispatch();

  const {
    developers = [],
    metadata = {},
    loadingList,
    errorList,
  } = useSelector((state) => state.developers);

  const [bio, setBio] = useState("");
  const [locationPreference, setLocationPreference] = useState("");
  const [minExp, setMinExp] = useState("");
  const [maxExp, setMaxExp] = useState("");
  const [skills, setSkills] = useState("");
  const [sort, setSort] = useState("desc");
  const [page, setPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [submittedFilters, setSubmittedFilters] = useState({
    bio: "",
    locationPreference: "",
    minExp: "",
    maxExp: "",
    skills: "",
  });

  const loadDevelopers = useCallback(() => {
    const params = {
      page,
      limit: PAGE_SIZE,
      sort,
    };

    Object.entries(submittedFilters).forEach(([key, value]) => {
      if (value !== "") params[key] = value;
    });

    dispatch(fetchDevelopers(params));
  }, [dispatch, page, sort, submittedFilters]);

  useEffect(() => {
    loadDevelopers();
  }, [loadDevelopers]);

  function applyFilters(event) {
    event.preventDefault();

    setPage(1);
    setSubmittedFilters({
      bio: bio.trim(),
      locationPreference,
      minExp,
      maxExp,
      skills: skills.trim(),
    });
    setFiltersOpen(false);
  }

  function resetFilters() {
    setBio("");
    setLocationPreference("");
    setMinExp("");
    setMaxExp("");
    setSkills("");
    setPage(1);
    setSubmittedFilters({
      bio: "",
      locationPreference: "",
      minExp: "",
      maxExp: "",
      skills: "",
    });
  }

  const activeFilterCount = [
    submittedFilters.bio,
    submittedFilters.locationPreference,
    submittedFilters.minExp !== "" || submittedFilters.maxExp !== "",
    submittedFilters.skills,
  ].filter(Boolean).length;

  const currentPage = metadata.currentPage || page;
  const totalPages = metadata.totalPages || 0;
  const totalCount = metadata.totalCount || 0;

  return (
    <main className="min-h-screen bg-[var(--df-paper)] text-[var(--df-text)]">
      <div className="mx-auto max-w-7xl px-5 pb-16 pt-10 sm:px-8 sm:pt-14 lg:px-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="df-eyebrow flex items-center gap-2">
            <span className="size-2 rounded-full bg-[var(--df-accent)]" />
            DevFlow / Talent directory
          </p>

          <span className="text-xs text-[var(--df-muted)]">
            Discover people. Build better products.
          </span>
        </div>

        <section className="grid gap-8 border-b border-[var(--df-line)] pb-10 pt-10 md:grid-cols-[1fr_auto] md:items-end md:pt-16">
          <div className="max-w-3xl">
            <p className="mb-5 text-xs font-medium uppercase tracking-[0.18em] text-[var(--df-muted)]">
              The developer network
            </p>

            <h1 className="text-4xl font-semibold leading-[1.05] tracking-[-0.055em] sm:text-6xl lg:text-7xl">
              People who
              <br />
              <span className="text-[var(--df-muted)]">
                build what’s next.
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-sm leading-7 text-[var(--df-muted)] sm:text-base">
              Explore developer profiles, compare technical skills, and
              discover people whose experience fits the work you want to build.
            </p>
          </div>

          <div className="min-w-36 border-l border-[var(--df-line)] pl-5">
            <p className="font-mono text-4xl tracking-tight">
              {loadingList && !developers.length
                ? "—"
                : totalCount.toLocaleString()}
            </p>
            <p className="mt-2 text-xs uppercase tracking-[0.13em] text-[var(--df-muted)]">
              Developer profiles
            </p>
          </div>
        </section>

        <section className="py-7">
          <form onSubmit={applyFilters} className="flex flex-col gap-3 sm:flex-row">
            <label className="flex min-h-12 flex-1 items-center gap-3 border border-[var(--df-line)] px-4 focus-within:border-[var(--df-text)]">
              <Search size={17} className="shrink-0 text-[var(--df-muted)]" />

              <input
                value={bio}
                onChange={(event) => setBio(event.target.value)}
                placeholder="Search developer bios..."
                className="w-full bg-transparent text-sm outline-none placeholder:text-[var(--df-muted)]"
              />

              {bio && (
                <button
                  type="button"
                  onClick={() => setBio("")}
                  aria-label="Clear bio search"
                  className="text-[var(--df-muted)] hover:text-[var(--df-text)]"
                >
                  <X size={16} />
                </button>
              )}
            </label>

            <button
              type="button"
              onClick={() => setFiltersOpen((open) => !open)}
              aria-expanded={filtersOpen}
              className="inline-flex min-h-12 items-center justify-center gap-2 border border-[var(--df-line)] px-4 text-sm transition-colors hover:border-[var(--df-text)]"
            >
              <SlidersHorizontal size={16} />
              Filters
              {activeFilterCount > 0 && (
                <span className="flex size-5 items-center justify-center rounded-full bg-[var(--df-accent)] text-[10px] font-semibold text-black">
                  {activeFilterCount}
                </span>
              )}
            </button>

            <label className="flex min-h-12 items-center gap-2 border border-[var(--df-line)] px-3">
              <ArrowUpDown size={15} className="text-[var(--df-muted)]" />
              <select
                value={sort}
                onChange={(event) => {
                  setSort(event.target.value);
                  setPage(1);
                }}
                className="max-w-44 bg-transparent text-sm outline-none"
                aria-label="Sort developers"
              >
                <option value="desc">Most experienced</option>
                <option value="asc">Least experienced</option>
              </select>
            </label>

            <button
              type="submit"
              className="min-h-12 bg-[var(--df-text)] px-6 text-sm font-medium text-white transition-opacity hover:opacity-85"
            >
              Search
            </button>
          </form>

          {filtersOpen && (
            <div className="mt-3 border border-[var(--df-line)] p-5">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <label className="flex flex-col gap-2 text-xs font-medium">
                  Location preference
                  <select
                    value={locationPreference}
                    onChange={(event) => setLocationPreference(event.target.value)}
                    className="h-11 border border-[var(--df-line)] px-3 text-sm font-normal outline-none focus:border-[var(--df-text)]"
                  >
                    <option value="">Any location</option>
                    <option value="REMOTE">Remote</option>
                    <option value="HYBRID">Hybrid</option>
                    <option value="ONSITE">On-site</option>
                  </select>
                </label>

                <label className="flex flex-col gap-2 text-xs font-medium">
                  Minimum experience (years)
                  <input
                    type="number"
                    min="0"
                    value={minExp}
                    onChange={(event) => setMinExp(event.target.value)}
                    placeholder="e.g. 1"
                    className="h-11 border border-[var(--df-line)] px-3 text-sm font-normal outline-none focus:border-[var(--df-text)]"
                  />
                </label>

                <label className="flex flex-col gap-2 text-xs font-medium">
                  Maximum experience (years)
                  <input
                    type="number"
                    min="0"
                    value={maxExp}
                    onChange={(event) => setMaxExp(event.target.value)}
                    placeholder="e.g. 5"
                    className="h-11 border border-[var(--df-line)] px-3 text-sm font-normal outline-none focus:border-[var(--df-text)]"
                  />
                </label>

                <label className="flex flex-col gap-2 text-xs font-medium">
                  Skills
                  <input
                    value={skills}
                    onChange={(event) => setSkills(event.target.value)}
                    placeholder="React, Node.js"
                    className="h-11 border border-[var(--df-line)] px-3 text-sm font-normal outline-none focus:border-[var(--df-text)]"
                  />
                </label>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={applyFilters.bind(null, {
                    preventDefault() {},
                  })}
                  className="min-h-10 bg-[var(--df-text)] px-5 text-sm font-medium text-white hover:opacity-85"
                >
                  Apply filters
                </button>

                <button
                  type="button"
                  onClick={resetFilters}
                  className="min-h-10 px-3 text-sm text-[var(--df-muted)] hover:text-[var(--df-text)]"
                >
                  Clear all
                </button>
              </div>
            </div>
          )}

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-xs text-[var(--df-muted)]">
            <p>
              Showing{" "}
              <span className="font-medium text-[var(--df-text)]">
                {developers.length}
              </span>{" "}
              profiles on this page
            </p>
            <p className="flex items-center gap-2">
              <Sparkles size={14} />
              Sorted by experience
            </p>
          </div>
        </section>

        {errorList && (
          <div
            role="alert"
            className="mb-6 flex flex-col gap-3 border border-red-300 bg-white p-5 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="text-sm font-semibold">Couldn’t load developers</p>
              <p className="mt-1 text-sm text-[var(--df-muted)]">{errorList}</p>
            </div>

            <button
              onClick={loadDevelopers}
              type="button"
              className="min-h-10 border border-[var(--df-line)] px-4 text-sm hover:border-[var(--df-text)]"
            >
              Try again
            </button>
          </div>
        )}

        {loadingList && !developers.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <DeveloperCardSkeleton key={index} />
            ))}
          </div>
        ) : !errorList && developers.length === 0 ? (
          <div className="border border-dashed border-[var(--df-line)] px-6 py-20 text-center">
            <div className="mx-auto flex size-12 items-center justify-center border border-[var(--df-line)] bg-white">
              <Code2 size={20} />
            </div>

            <h2 className="mt-5 text-xl font-semibold tracking-tight">
              No matching developers
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--df-muted)]">
              Try different keywords or remove a filter to discover more
              profiles.
            </p>

            <button
              type="button"
              onClick={resetFilters}
              className="mt-6 border border-[var(--df-line)] px-5 py-3 text-sm hover:border-[var(--df-text)]"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {developers.map((developer, index) => (
              <DeveloperCard
                key={developer.id || developer.userId}
                developer={developer}
                index={(currentPage - 1) * PAGE_SIZE + index}
              />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <nav
            aria-label="Developer pagination"
            className="mt-10 flex flex-col gap-4 border-t border-[var(--df-line)] pt-5 sm:flex-row sm:items-center sm:justify-between"
          >
            <p className="text-xs text-[var(--df-muted)]">
              Page{" "}
              <span className="font-medium text-[var(--df-text)]">
                {currentPage}
              </span>{" "}
              of {totalPages}
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={!metadata.hasPreviousPage || loadingList}
                onClick={() => setPage((value) => Math.max(1, value - 1))}
                className="inline-flex min-h-10 items-center gap-2 border border-[var(--df-line)] px-4 text-sm disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ArrowLeft size={15} />
                Previous
              </button>

              <button
                type="button"
                disabled={!metadata.hasNextPage || loadingList}
                onClick={() => setPage((value) => value + 1)}
                className="inline-flex min-h-10 items-center gap-2 border border-[var(--df-text)] bg-[var(--df-text)] px-4 text-sm text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
                <ArrowRight size={15} />
              </button>
            </div>
          </nav>
        )}

        <footer className="mt-16 flex flex-col gap-3 border-t border-[var(--df-line)] pt-5 text-xs text-[var(--df-muted)] sm:flex-row sm:items-center sm:justify-between">
          <span>DEVFLOW / DEVELOPER DIRECTORY</span>
          <span>Discover talent. Build something meaningful.</span>
        </footer>
      </div>
    </main>
  );
}
