"use client";

import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal, X } from "lucide-react";

import CompanyCard from "./CompanyCard";
import CompanyListSkeleton from "./CompanyListSkeleton";
import CompanyEmptyState from "./CompanyEmptyState";
import { fetchCompanies } from "@/lib/redux/slices/companySlice";

export default function PublicCompaniesPage() {
  const dispatch = useDispatch();

  const {
    companies,
    metadata,
    loadingList,
    errorList,
  } = useSelector((state) => state.company);

  const [search, setSearch] = useState("");
  const [industry, setIndustry] = useState("");
  const [country, setCountry] = useState("");
  const [page, setPage] = useState(1);

  const loadCompanies = useCallback(() => {
    const params = {
      page,
      pageSize: 10,
    };

    if (search.trim()) {
      params.search = search.trim();
    }

    if (industry) {
      params.industry = industry;
    }

    if (country) {
      params.country = country;
    }

    dispatch(fetchCompanies(params));
  }, [dispatch, page, search, industry, country]);

  useEffect(() => {
    loadCompanies();
  }, [loadCompanies]);

  const handleSearch = (event) => {
    event.preventDefault();

    setPage(1);

    loadCompanies();
  };

  const clearFilters = () => {
    setSearch("");
    setIndustry("");
    setCountry("");
    setPage(1);
  };

  const hasFilters =
    search ||
    industry ||
    country;

  return (
    <main className="min-h-screen bg-[var(--df-paper)] text-[var(--df-text)]">

      {/* Page introduction */}
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
                03 / Companies
              </p>

              <h1 className="mt-6 max-w-4xl text-5xl font-semibold leading-[0.88] tracking-[-0.055em] sm:text-6xl lg:text-8xl">
                Meet the companies
                <br />
                <span className="text-[var(--df-muted)]">
                  behind the work.
                </span>
              </h1>
            </div>

            <p className="max-w-md text-base leading-7 text-[var(--df-muted)] lg:justify-self-end">
              Explore companies hiring through DevFlow, understand what
              they build and discover the opportunities connected to
              each organization.
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
                placeholder="Search companies..."
                className="h-14 w-full border border-[var(--df-line)] bg-[var(--df-paper)] pl-11 pr-4 text-sm text-[var(--df-text)] outline-none transition placeholder:text-[var(--df-soft)] focus:border-[var(--df-text)]"
              />
            </div>

            <button
              type="submit"
              className="flex h-14 items-center justify-center gap-2 bg-[var(--df-text)] px-8 text-sm font-semibold text-[var(--df-paper)] transition hover:opacity-90"
            >
              Search
            </button>
          </form>

          <div className="mt-4 flex flex-wrap gap-2">
            <FilterSelect
              value={industry}
              onChange={(value) => {
                setIndustry(value);
                setPage(1);
              }}
              placeholder="Industry"
              options={[
                { label: "Technology", value: "TECHNOLOGY" },
                { label: "Finance", value: "FINANCE" },
                { label: "Healthcare", value: "HEALTHCARE" },
                { label: "Retail", value: "RETAIL" },
                { label: "Manufacturing", value: "MANUFACTURING" },
                { label: "Education", value: "EDUCATION" },
                { label: "Consulting", value: "CONSULTING" },
              ]}
            />

            <FilterSelect
              value={country}
              onChange={(value) => {
                setCountry(value);
                setPage(1);
              }}
              placeholder="Country"
              options={[
                { label: "Pakistan", value: "PAKISTAN" },
                { label: "United States", value: "UNITED_STATES" },
                { label: "United Kingdom", value: "UNITED_KINGDOM" },
                { label: "Canada", value: "CANADA" },
                { label: "Germany", value: "GERMANY" },
                { label: "United Arab Emirates", value: "UAE" },
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
                The network
              </p>

              <p className="mt-2 text-sm text-[var(--df-muted)]">
                {metadata?.totalCount || 0} companies
              </p>
            </div>

            <div className="hidden items-center gap-2 text-xs text-[var(--df-muted)] sm:flex">
              <SlidersHorizontal size={14} />
              Explore the network
            </div>
          </div>

          {loadingList ? (
            <CompanyListSkeleton />
          ) : errorList ? (
            <CompanyEmptyState
              title="Unable to load companies"
              description={errorList}
              actionLabel="Try again"
              onAction={loadCompanies}
            />
          ) : companies.length === 0 ? (
            <CompanyEmptyState
              title="No companies found."
              description="Try adjusting your search or removing some filters."
              actionLabel="Clear filters"
              onAction={clearFilters}
            />
          ) : (
            <div className="space-y-3">
              {companies.map((company, index) => (
                <CompanyCard
                  key={company.id}
                  company={company}
                  index={index}
                />
              ))}
            </div>
          )}

          {!loadingList && companies.length > 0 && (
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
        <option
          key={option.value}
          value={option.value}
        >
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
