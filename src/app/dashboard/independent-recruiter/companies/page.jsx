"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpRight,
  Building2,
  Check,
  ChevronLeft,
  ChevronRight,
  Globe2,
  MapPin,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Sparkles,
  X,
} from "lucide-react";

import { fetchCompanies } from "@/lib/redux/slices/companySlice";

const INDUSTRIES = [
  { value: "", label: "All industries" },
  { value: "TECHNOLOGY", label: "Technology" },
  { value: "SOFTWARE", label: "Software" },
  { value: "FINANCE", label: "Finance" },
  { value: "HEALTHCARE", label: "Healthcare" },
  { value: "EDUCATION", label: "Education" },
  { value: "E_COMMERCE", label: "E-commerce" },
  { value: "MARKETING", label: "Marketing" },
  { value: "OTHER", label: "Other" },
];

const SORT_OPTIONS = [
  { value: "desc", label: "Newest first" },
  { value: "asc", label: "Oldest first" },
  { value: "country", label: "Country" },
];

const PAGE_SIZE = 12;

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
  }).format(date);
}

function getInitials(name = "") {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "C"
  );
}

function CompanyLogo({ company, size = "large" }) {
  const name = company?.name || "Company";

  const dimensions =
    size === "small"
      ? "h-10 w-10"
      : size === "medium"
      ? "h-12 w-12"
      : "h-14 w-14";

  if (company?.logo) {
    return (
      <div
        className={`${dimensions} flex shrink-0 items-center justify-center overflow-hidden border border-[var(--df-line)] bg-[var(--df-paper-2)]`}
      >
        <img
          src={company.logo}
          alt={`${name} logo`}
          className="h-full w-full object-contain"
        />
      </div>
    );
  }

  return (
    <div
      className={`${dimensions} flex shrink-0 items-center justify-center border border-[var(--df-line)] bg-[var(--df-paper-2)] text-[12px] font-semibold tracking-tight text-[var(--df-text)]`}
    >
      {getInitials(name)}
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--df-muted)]">
        {label}
      </span>

      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-full border border-[var(--df-line)] bg-[var(--df-paper)] px-3 text-[11px] font-medium text-[var(--df-text)] outline-none transition-colors focus:border-[var(--df-text)]"
      >
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function CompanyResult({ company }) {
  const jobCount = company?._count?.jobs ?? 0;

  return (
    <article className="group border-t border-[var(--df-line)] py-6 first:border-t-0">
      <div className="grid grid-cols-1 gap-5 md:grid-cols-[auto_1fr_auto] md:items-start">
        <CompanyLogo
          company={company}
          size="medium"
        />

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <Link
              href={`/dashboard/independent-recruiter/companies/${company.id}`}
              className="text-[17px] font-semibold tracking-[-0.025em] text-[var(--df-text)] hover:underline"
            >
              {company.name}
            </Link>

            {company.isVerified && (
              <span className="inline-flex items-center gap-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-[var(--df-accent)]">
                <Check size={11} strokeWidth={2.5} />
                Verified
              </span>
            )}
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-[var(--df-muted)]">
            {company.industry && (
              <span className="font-medium">
                {company.industry.replaceAll("_", " ")}
              </span>
            )}

            {company.country && (
              <span className="inline-flex items-center gap-1">
                <MapPin size={11} />
                {company.country}
              </span>
            )}

            <span>
              Established {formatDate(company.createdAt)}
            </span>
          </div>

          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-[10px] text-[var(--df-muted)]">
            <span>
              <strong className="font-semibold text-[var(--df-text)]">
                {jobCount}
              </strong>{" "}
              open {jobCount === 1 ? "position" : "positions"}
            </span>

            {company.websiteUrl && (
              <span className="inline-flex items-center gap-1">
                <Globe2 size={11} />
                Website available
              </span>
            )}
          </div>
        </div>

        <Link
          href={`/dashboard/independent-recruiter/companies/${company.id}`}
          className="inline-flex h-9 items-center justify-center gap-2 border border-[var(--df-line)] px-3 text-[10px] font-semibold text-[var(--df-text)] transition-colors hover:border-[var(--df-text)] md:self-center"
        >
          View company
          <ArrowUpRight size={13} />
        </Link>
      </div>
    </article>
  );
}

function EmptyState({ hasFilters, onReset }) {
  return (
    <div className="border-t border-[var(--df-line)] py-20 text-center">
      <Building2
        size={25}
        strokeWidth={1.4}
        className="mx-auto text-[var(--df-muted)]"
      />

      <h3 className="mt-5 text-base font-semibold tracking-[-0.02em]">
        No companies found
      </h3>

      <p className="mx-auto mt-2 max-w-md text-[11px] leading-5 text-[var(--df-muted)]">
        {hasFilters
          ? "Nothing matched your current search and filters. Try widening your search."
          : "There are currently no verified companies available to explore."}
      </p>

      {hasFilters && (
        <button
          type="button"
          onClick={onReset}
          className="mt-5 inline-flex items-center gap-2 border border-[var(--df-text)] px-4 py-2.5 text-[10px] font-semibold transition-colors hover:bg-[var(--df-text)] hover:text-[var(--df-paper)]"
        >
          <X size={12} />
          Clear filters
        </button>
      )}
    </div>
  );
}

function CompanySkeleton() {
  return (
    <div className="animate-pulse border-t border-[var(--df-line)] py-6">
      <div className="flex gap-5">
        <div className="h-12 w-12 shrink-0 bg-[var(--df-line)]" />

        <div className="flex-1">
          <div className="h-4 w-48 bg-[var(--df-line)]" />
          <div className="mt-3 h-2.5 w-72 max-w-full bg-[var(--df-line)]" />
          <div className="mt-5 h-2.5 w-40 bg-[var(--df-line)]" />
        </div>
      </div>
    </div>
  );
}

function Pagination({
  metadata,
  onPageChange,
}) {
  if (!metadata || metadata.totalPages <= 1) {
    return null;
  }

  const currentPage = metadata.currentPage || 1;
  const totalPages = metadata.totalPages || 1;

  const pages = [];

  let start = Math.max(1, currentPage - 2);
  let end = Math.min(totalPages, currentPage + 2);

  if (currentPage <= 2) {
    end = Math.min(totalPages, 5);
  }

  if (currentPage >= totalPages - 1) {
    start = Math.max(1, totalPages - 4);
  }

  for (let page = start; page <= end; page += 1) {
    pages.push(page);
  }

  return (
    <div className="flex flex-col gap-4 border-t border-[var(--df-line)] pt-5 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-[10px] text-[var(--df-muted)]">
        Page{" "}
        <span className="font-semibold text-[var(--df-text)]">
          {currentPage}
        </span>{" "}
        of{" "}
        <span className="font-semibold text-[var(--df-text)]">
          {totalPages}
        </span>{" "}
        · {metadata.totalCount || 0} companies
      </p>

      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={!metadata.hasPreviousPage}
          onClick={() => onPageChange(currentPage - 1)}
          className="flex h-8 w-8 items-center justify-center border border-[var(--df-line)] text-[var(--df-muted)] transition-colors hover:border-[var(--df-text)] hover:text-[var(--df-text)] disabled:cursor-not-allowed disabled:opacity-35"
          aria-label="Previous page"
        >
          <ChevronLeft size={14} />
        </button>

        {pages.map((page) => (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            className={`flex h-8 min-w-8 items-center justify-center border px-2 text-[10px] font-semibold transition-colors ${
              page === currentPage
                ? "border-[var(--df-text)] bg-[var(--df-text)] text-[var(--df-paper)]"
                : "border-[var(--df-line)] text-[var(--df-muted)] hover:border-[var(--df-text)] hover:text-[var(--df-text)]"
            }`}
          >
            {page}
          </button>
        ))}

        <button
          type="button"
          disabled={!metadata.hasNextPage}
          onClick={() => onPageChange(currentPage + 1)}
          className="flex h-8 w-8 items-center justify-center border border-[var(--df-line)] text-[var(--df-muted)] transition-colors hover:border-[var(--df-text)] hover:text-[var(--df-text)] disabled:cursor-not-allowed disabled:opacity-35"
          aria-label="Next page"
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}

export default function IndependentRecruiterCompaniesPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const {
    companies,
    metadata,
    loadingList,
    errorList,
  } = useSelector((state) => state.company);

  const urlName = searchParams.get("name") || "";
  const urlIndustry = searchParams.get("industry") || "";
  const urlCountry = searchParams.get("country") || "";
  const urlSort = searchParams.get("sort") || "desc";
  const urlPage = Number(searchParams.get("page") || 1);

  const [searchInput, setSearchInput] = useState(urlName);
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    setSearchInput(urlName);
  }, [urlName]);

  const updateParams = useCallback(
    (updates = {}) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (
          value === undefined ||
          value === null ||
          value === ""
        ) {
          params.delete(key);
        } else {
          params.set(key, String(value));
        }
      });

      if (!("page" in updates)) {
        params.set("page", "1");
      }

      router.push(`${pathname}?${params.toString()}`);
    },
    [pathname, router, searchParams]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput === urlName) return;

      updateParams({
        name: searchInput.trim(),
        page: 1,
      });
    }, 450);

    return () => clearTimeout(timer);
  }, [searchInput, urlName, updateParams]);

  useEffect(() => {
    dispatch(
      fetchCompanies({
        name: urlName || undefined,
        industry: urlIndustry || undefined,
        country: urlCountry || undefined,
        sort: urlSort || undefined,
        page: urlPage,
        limit: PAGE_SIZE,
      })
    );
  }, [
    dispatch,
    urlName,
    urlIndustry,
    urlCountry,
    urlSort,
    urlPage,
  ]);

  const hasFilters = Boolean(
    urlName || urlIndustry || urlCountry || urlSort !== "desc"
  );

  const activeFilterCount = useMemo(() => {
    let count = 0;

    if (urlIndustry) count += 1;
    if (urlCountry) count += 1;
    if (urlSort !== "desc") count += 1;

    return count;
  }, [urlIndustry, urlCountry, urlSort]);

  const resetFilters = () => {
    router.push(pathname);
    setSearchInput("");
  };

  const retry = () => {
    dispatch(
      fetchCompanies({
        name: urlName || undefined,
        industry: urlIndustry || undefined,
        country: urlCountry || undefined,
        sort: urlSort || undefined,
        page: urlPage,
        limit: PAGE_SIZE,
      })
    );
  };

  return (
    <div className="min-h-screen bg-[var(--df-paper)] text-[var(--df-text)]">
      {/* Page intro */}
      <header className="border-b border-[var(--df-line)]">
        <div className="mx-auto max-w-[1500px] px-4 py-8 sm:px-6 lg:px-10 lg:py-11">
          <div className="max-w-4xl">
            <div className="mb-4 flex items-center gap-2">
              <span className="h-1.5 w-1.5 bg-[var(--df-accent)]" />

              <span className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[var(--df-muted)]">
                Independent recruiter / discovery
              </span>
            </div>

            <div className="flex flex-col justify-between gap-7 lg:flex-row lg:items-end">
              <div>
                <h1 className="text-3xl font-semibold tracking-[-0.055em] sm:text-4xl">
                  Explore companies
                </h1>

                <p className="mt-3 max-w-2xl text-[12px] leading-6 text-[var(--df-muted)]">
                  Discover verified organizations, understand where they
                  operate, and identify companies where your recruiting
                  experience could be valuable.
                </p>
              </div>

              <div className="flex items-center gap-3 border-l border-[var(--df-line)] pl-4">
                <Sparkles
                  size={17}
                  strokeWidth={1.4}
                  className="text-[var(--df-accent)]"
                />

                <div>
                  <p className="text-[11px] font-semibold">
                    Company network
                  </p>

                  <p className="mt-0.5 text-[9px] text-[var(--df-muted)]">
                    Browse verified organizations
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
        {/* Search / controls */}
        <section className="border-y border-[var(--df-line)]">
          <div className="flex flex-col gap-3 py-4 lg:flex-row lg:items-end">
            <label className="block flex-1">
              <span className="mb-1.5 block text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--df-muted)]">
                Search companies
              </span>

              <div className="relative">
                <Search
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--df-muted)]"
                />

                <input
                  value={searchInput}
                  onChange={(event) =>
                    setSearchInput(event.target.value)
                  }
                  placeholder="Search by company name..."
                  className="h-10 w-full border border-[var(--df-line)] bg-[var(--df-paper)] pl-9 pr-9 text-[11px] outline-none transition-colors placeholder:text-[var(--df-muted)] focus:border-[var(--df-text)]"
                />

                {searchInput && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchInput("");
                      updateParams({ name: "", page: 1 });
                    }}
                    className="absolute right-2.5 top-1/2 flex -translate-y-1/2 items-center justify-center text-[var(--df-muted)] hover:text-[var(--df-text)]"
                    aria-label="Clear search"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </label>

            <button
              type="button"
              onClick={() => setFiltersOpen((value) => !value)}
              className={`flex h-10 items-center justify-center gap-2 border px-4 text-[10px] font-semibold transition-colors ${
                filtersOpen || activeFilterCount > 0
                  ? "border-[var(--df-text)] bg-[var(--df-text)] text-[var(--df-paper)]"
                  : "border-[var(--df-line)] hover:border-[var(--df-text)]"
              }`}
            >
              <SlidersHorizontal size={14} />

              Filters

              {activeFilterCount > 0 && (
                <span className="flex h-4 min-w-4 items-center justify-center bg-[var(--df-accent)] px-1 text-[8px] text-[var(--df-paper)]">
                  {activeFilterCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={retry}
              className="flex h-10 items-center justify-center gap-2 border border-[var(--df-line)] px-4 text-[10px] font-semibold transition-colors hover:border-[var(--df-text)]"
            >
              <RefreshCw
                size={13}
                className={loadingList ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </div>

          {filtersOpen && (
            <div className="grid grid-cols-1 gap-3 border-t border-[var(--df-line)] py-4 sm:grid-cols-2 lg:grid-cols-4">
              <FilterSelect
                label="Industry"
                value={urlIndustry}
                onChange={(value) =>
                  updateParams({
                    industry: value,
                    page: 1,
                  })
                }
                options={INDUSTRIES}
              />

              <label className="block">
                <span className="mb-1.5 block text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--df-muted)]">
                  Country
                </span>

                <input
                  value={urlCountry}
                  onChange={(event) =>
                    updateParams({
                      country: event.target.value,
                      page: 1,
                    })
                  }
                  placeholder="e.g. Pakistan"
                  className="h-10 w-full border border-[var(--df-line)] bg-[var(--df-paper)] px-3 text-[11px] outline-none placeholder:text-[var(--df-muted)] focus:border-[var(--df-text)]"
                />
              </label>

              <FilterSelect
                label="Sort"
                value={urlSort}
                onChange={(value) =>
                  updateParams({
                    sort: value,
                    page: 1,
                  })
                }
                options={SORT_OPTIONS}
              />

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={resetFilters}
                  className="h-10 w-full border border-[var(--df-line)] px-3 text-[10px] font-semibold text-[var(--df-muted)] transition-colors hover:border-[var(--df-text)] hover:text-[var(--df-text)]"
                >
                  Clear all filters
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Results meta */}
        <div className="flex flex-col justify-between gap-2 py-5 sm:flex-row sm:items-center">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--df-muted)]">
              Companies
            </p>

            <p className="mt-1 text-[12px] text-[var(--df-text)]">
              {loadingList
                ? "Loading companies..."
                : `${metadata?.totalCount || 0} organizations found`}
            </p>
          </div>

          {(urlName || urlIndustry || urlCountry) && (
            <div className="flex flex-wrap items-center gap-2">
              {urlName && (
                <span className="border border-[var(--df-line)] px-2.5 py-1 text-[9px] font-medium">
                  Search: {urlName}
                </span>
              )}

              {urlIndustry && (
                <span className="border border-[var(--df-line)] px-2.5 py-1 text-[9px] font-medium">
                  {urlIndustry.replaceAll("_", " ")}
                </span>
              )}

              {urlCountry && (
                <span className="border border-[var(--df-line)] px-2.5 py-1 text-[9px] font-medium">
                  {urlCountry}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Error */}
        {errorList && !loadingList && (
          <div className="border border-[var(--df-line)] bg-[var(--df-paper-2)] px-5 py-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[11px] font-semibold">
                  Companies could not be loaded
                </p>

                <p className="mt-1 text-[10px] text-[var(--df-muted)]">
                  {errorList}
                </p>
              </div>

              <button
                type="button"
                onClick={retry}
                className="inline-flex h-8 items-center justify-center gap-2 border border-[var(--df-text)] px-3 text-[9px] font-semibold hover:bg-[var(--df-text)] hover:text-[var(--df-paper)]"
              >
                Try again
                <RefreshCw size={11} />
              </button>
            </div>
          </div>
        )}

        {/* Results */}
        {!errorList && (
          <section>
            {loadingList ? (
              <div>
                {Array.from({ length: 6 }).map((_, index) => (
                  <CompanySkeleton key={index} />
                ))}
              </div>
            ) : companies.length > 0 ? (
              <>
                <div className="border-b border-[var(--df-line)]">
                  {companies.map((company) => (
                    <CompanyResult
                      key={company.id}
                      company={company}
                    />
                  ))}
                </div>

                <div className="pt-5">
                  <Pagination
                    metadata={metadata}
                    onPageChange={(page) =>
                      updateParams({ page })
                    }
                  />
                </div>
              </>
            ) : (
              <EmptyState
                hasFilters={hasFilters}
                onReset={resetFilters}
              />
            )}
          </section>
        )}
      </main>
    </div>
  );
}