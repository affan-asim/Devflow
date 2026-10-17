"use client";

import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal, X } from "lucide-react";

import JobCard from "./JobCard";
import JobListSkeleton from "./JobListSkeleton";
import JobEmptyState from "./JobEmptyState";
import { fetchJobs } from "@/lib/redux/slices/jobSlice";

export default function PublicJobsPage() {
  const dispatch = useDispatch();

  const {
    jobs,
    metadata,
    loadingList,
    errorList,
  } = useSelector((state) => state.jobs);

  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [employmentType, setEmploymentType] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [page, setPage] = useState(1);

  const loadJobs = useCallback(() => {
    const params = {
      page,
      pageSize: 10,
    };

    if (search.trim()) {
      params.search = search.trim();
    }

    if (location) {
      params.locationPreference = location;
    }

    if (employmentType) {
      params.employmentType = employmentType;
    }

    if (experienceLevel) {
      params.experienceLevel = experienceLevel;
    }

    dispatch(fetchJobs(params));
  }, [
    dispatch,
    page,
    search,
    location,
    employmentType,
    experienceLevel,
  ]);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  const handleSearch = (event) => {
    event.preventDefault();
    setPage(1);
    loadJobs();
  };

  const clearFilters = () => {
    setSearch("");
    setLocation("");
    setEmploymentType("");
    setExperienceLevel("");
    setPage(1);
  };

  const hasFilters =
    search ||
    location ||
    employmentType ||
    experienceLevel;

  return (
    <main className="min-h-screen bg-[var(--df-paper)] text-[var(--df-text)]">
      {/* Header */}
      <section className="border-b border-[var(--df-line)]">
        <div className="mx-auto max-w-[1320px] px-5 py-20 sm:px-8 lg:py-28">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65 }}
            className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-end"
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--df-muted)]">
                02 / Opportunities
              </p>

              <h1 className="mt-6 max-w-4xl text-5xl font-semibold leading-[0.88] tracking-[-0.055em] sm:text-6xl lg:text-8xl">
                Find work that
                <br />
                <span className="text-[var(--df-muted)]">
                  fits how you build.
                </span>
              </h1>
            </div>

            <p className="max-w-md text-base leading-7 text-[var(--df-muted)] lg:justify-self-end">
              Explore developer opportunities from companies looking
              for people with the skills, experience and context to
              build meaningful products.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Search */}
      <section className="border-b border-[var(--df-line)]">
        <div className="mx-auto max-w-[1320px] px-5 py-6 sm:px-8">
          <form
            onSubmit={handleSearch}
            className="flex flex-col gap-3 lg:flex-row"
          >
            <div className="relative flex-1">
              <Search
                size={17}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--df-muted)]"
              />

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search roles, skills or companies..."
                className="h-14 w-full border border-[var(--df-line)] bg-[var(--df-paper)] pl-11 pr-4 text-sm text-[var(--df-text)] outline-none transition placeholder:text-[var(--df-soft)] focus:border-[var(--df-text)]"
              />
            </div>

            <button
              type="submit"
              className="flex h-14 items-center justify-center gap-2 bg-[var(--df-text)] px-8 text-sm font-semibold text-[var(--df-paper)] transition hover:opacity-90"
            >
              Search jobs
            </button>
          </form>

          {/* Filters */}
          <div className="mt-4 flex flex-wrap gap-2">
            <FilterSelect
              value={location}
              onChange={(value) => {
                setLocation(value);
                setPage(1);
              }}
              placeholder="Location"
              options={[
                { label: "Remote", value: "REMOTE" },
                { label: "Hybrid", value: "HYBRID" },
                { label: "On-site", value: "ONSITE" },
              ]}
            />

            <FilterSelect
              value={employmentType}
              onChange={(value) => {
                setEmploymentType(value);
                setPage(1);
              }}
              placeholder="Employment"
              options={[
                { label: "Full-time", value: "FULLTIME" },
                { label: "Part-time", value: "PARTTIME" },
                { label: "Contract", value: "CONTRACT" },
                { label: "Internship", value: "INTERN" },
              ]}
            />

            <FilterSelect
              value={experienceLevel}
              onChange={(value) => {
                setExperienceLevel(value);
                setPage(1);
              }}
              placeholder="Experience"
              options={[
                { label: "Beginner", value: "BEGINNER" },
                { label: "Intermediate", value: "INTERMEDIATE" },
                { label: "Expert", value: "EXPERT" },
              ]}
            />

            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex h-10 items-center gap-2 border border-[var(--df-line)] px-4 text-xs font-medium text-[var(--df-muted)] transition hover:border-[var(--df-text)] hover:text-[var(--df-text)]"
              >
                <X size={13} />
                Clear
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Results */}
      <section>
        <div className="mx-auto max-w-[1320px] px-5 py-12 sm:px-8 lg:py-16">
          <div className="mb-8 flex items-end justify-between border-b border-[var(--df-line)] pb-5">
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] text-[var(--df-muted)]">
                Opportunities
              </p>

              <p className="mt-2 text-sm text-[var(--df-muted)]">
                {metadata?.totalCount || 0} positions
              </p>
            </div>

            <div className="hidden items-center gap-2 text-xs text-[var(--df-muted)] sm:flex">
              <SlidersHorizontal size={14} />
              Updated opportunities
            </div>
          </div>

          {loadingList ? (
            <JobListSkeleton />
          ) : errorList ? (
            <JobEmptyState
              title="Unable to load jobs"
              description={errorList}
              actionLabel="Try again"
              onAction={loadJobs}
            />
          ) : jobs.length === 0 ? (
            <JobEmptyState
              title="No opportunities found."
              description="Try adjusting your search or removing some filters."
              actionLabel="Clear filters"
              onAction={clearFilters}
            />
          ) : (
            <div className="space-y-3">
              {jobs.map((job, index) => (
                <JobCard
                  key={job.id}
                  job={job}
                  index={index}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {!loadingList && jobs.length > 0 && (
            <Pagination
              metadata={metadata}
              page={page}
              setPage={setPage}
            />
          )}
        </div>
      </section>
    </main>
  );
}

function FilterSelect({
  value,
  onChange,
  placeholder,
  options,
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-10 border border-[var(--df-line)] bg-[var(--df-paper)] px-4 text-xs font-medium text-[var(--df-text)] outline-none transition focus:border-[var(--df-text)]"
    >
      <option value="">{placeholder}</option>

      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

function Pagination({ metadata, page, setPage }) {
  if (!metadata?.totalPages || metadata.totalPages <= 1) {
    return null;
  }

  return (
    <div className="mt-12 flex items-center justify-center gap-2">
      <button
        disabled={!metadata.hasPreviousPage}
        onClick={() => setPage((current) => current - 1)}
        className="h-10 border border-[var(--df-line)] px-4 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-30"
      >
        Previous
      </button>

      <span className="px-4 text-xs text-[var(--df-muted)]">
        {page} / {metadata.totalPages}
      </span>

      <button
        disabled={!metadata.hasNextPage}
        onClick={() => setPage((current) => current + 1)}
        className="h-10 border border-[var(--df-line)] px-4 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-30"
      >
        Next
      </button>
    </div>
  );
}
