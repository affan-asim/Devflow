"use client";

import { clearEmploymentErrors,fetchDeveloperEmploymentHistory } from "@/lib/redux/slices/employmentHistorySlice";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

function formatDate(date) {
  if (!date) return null;

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

function formatEmploymentType(type) {
  if (!type) return null;

  return type
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatSalary(salary, currency) {
  if (salary == null) return null;

  const numericSalary = Number(salary);

  if (Number.isNaN(numericSalary)) {
    return `${salary}${currency ? ` ${currency}` : ""}`;
  }

  return `${numericSalary.toLocaleString()}${currency ? ` ${currency}` : ""}`;
}

function getEmploymentStatus(employment) {
  if (!employment?.employmentEvents?.length) {
    return null;
  }

  const events = [...employment.employmentEvents];

  const latestEvent = events[events.length - 1];

  return latestEvent?.status || null;
}

function formatEventStatus(status) {
  if (!status) return null;

  return status
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function getDuration(startDate, endDate) {
  if (!startDate) return null;

  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : new Date();

  const months =
    (end.getFullYear() - start.getFullYear()) * 12 +
    (end.getMonth() - start.getMonth());

  if (months < 1) return "Less than a month";

  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;

  const parts = [];

  if (years > 0) {
    parts.push(`${years} ${years === 1 ? "year" : "years"}`);
  }

  if (remainingMonths > 0) {
    parts.push(
      `${remainingMonths} ${
        remainingMonths === 1 ? "month" : "months"
      }`
    );
  }

  return parts.join(" ");
}

function CompanyMark({ company }) {
  if (company?.logo) {
    return (
      <div className="h-12 w-12 shrink-0 overflow-hidden border border-[var(--df-line)] bg-[var(--df-paper)]">
        <img
          src={company.logo}
          alt=""
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  const initial = company?.name?.charAt(0)?.toUpperCase() || "C";

  return (
    <div className="flex h-12 w-12 shrink-0 items-center justify-center border border-[var(--df-line)] bg-[var(--df-text)] text-sm font-medium text-[var(--df-paper)]">
      {initial}
    </div>
  );
}

function EmploymentCard({ employment }) {
  const company = employment.company;

  const status = getEmploymentStatus(employment);

  const start = formatDate(employment.startDate);
  const end = employment.endDate
    ? formatDate(employment.endDate)
    : "Present";

  const duration = getDuration(
    employment.startDate,
    employment.endDate
  );

  return (
    <article className="group border-t border-[var(--df-line)] py-7 first:border-t-0">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 gap-4">
          <CompanyMark company={company} />

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <h2 className="text-lg font-medium tracking-[-0.02em] text-[var(--df-text)]">
                {employment.roleTitle || "Untitled role"}
              </h2>

              {company?.isVerified && (
                <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--df-muted)]">
                  Verified
                </span>
              )}
            </div>

            <p className="mt-1 text-sm text-[var(--df-muted)]">
              {company?.name || "Unknown company"}
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-[var(--df-muted)]">
              {(start || end) && (
                <span>
                  {start || "Unknown"} — {end}
                </span>
              )}

              {employment.employmentType && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>
                    {formatEmploymentType(employment.employmentType)}
                  </span>
                </>
              )}

              {duration && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>{duration}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <Link
          href={`/dashboard/developer/employment-history/${employment.id}`}
          className="inline-flex shrink-0 items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--df-text)] transition-opacity hover:opacity-60"
        >
          View details
          <span aria-hidden="true">↗</span>
        </Link>
      </div>

      <div className="mt-6 grid gap-6 pl-0 md:grid-cols-[1fr_auto] md:pl-16">
        <div>
          {employment.description && (
            <p className="max-w-3xl text-sm leading-7 text-[var(--df-muted)]">
              {employment.description}
            </p>
          )}

          <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2">
            {employment.company?.country && (
              <span className="text-xs text-[var(--df-muted)]">
                {employment.company.country}
              </span>
            )}

            {employment.company?.industry && (
              <span className="text-xs text-[var(--df-muted)]">
                {employment.company.industry}
              </span>
            )}

            {employment.location && (
              <span className="text-xs text-[var(--df-muted)]">
                {employment.location}
              </span>
            )}
          </div>
        </div>

        <div className="md:text-right">
          {employment.salary != null && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--df-muted)]">
                Compensation
              </p>

              <p className="mt-1 text-sm font-medium text-[var(--df-text)]">
                {formatSalary(
                  employment.salary,
                  employment.currency
                )}
              </p>
            </div>
          )}

          {status && (
            <div className="mt-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--df-muted)]">
                Record status
              </p>

              <p className="mt-1 text-xs text-[var(--df-muted)]">
                {formatEventStatus(status)}
              </p>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

function EmploymentSkeleton() {
  return (
    <div className="space-y-7 border-t border-[var(--df-line)] pt-7">
      {[1, 2, 3].map((item) => (
        <div
          key={item}
          className="animate-pulse border-b border-[var(--df-line)] pb-7"
        >
          <div className="flex gap-4">
            <div className="h-12 w-12 bg-[var(--df-line)]" />

            <div className="flex-1">
              <div className="h-5 w-56 bg-[var(--df-line)]" />
              <div className="mt-2 h-4 w-32 bg-[var(--df-line)]" />
              <div className="mt-4 h-3 w-64 bg-[var(--df-line)]" />
            </div>
          </div>

          <div className="mt-6 h-12 max-w-2xl bg-[var(--df-line)]" />
        </div>
      ))}
    </div>
  );
}

export default function EmploymentHistoryPage() {
  const dispatch = useDispatch();

  const {
    employments = [],
    metadata,
    loadingList,
    errorList,
  } = useSelector((state) => state.employmentHistory || {});

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("");

  useEffect(() => {
    dispatch(
      fetchDeveloperEmploymentHistory({
        page: 1,
        limit: 10,
      })
    );

    return () => {
      dispatch(clearEmploymentErrors());
    };
  }, [dispatch]);

  const filteredEmployments = useMemo(() => {
    if (!search.trim()) return employments;

    const query = search.toLowerCase();

    return employments.filter((employment) => {
      const role = employment.roleTitle?.toLowerCase() || "";
      const company = employment.company?.name?.toLowerCase() || "";
      const description =
        employment.description?.toLowerCase() || "";

      return (
        role.includes(query) ||
        company.includes(query) ||
        description.includes(query)
      );
    });
  }, [employments, search]);

  const handleSort = (value) => {
    setSort(value);

    dispatch(
      fetchDeveloperEmploymentHistory({
        page: 1,
        limit: 10,
        ...(value ? { sort: value } : {}),
        ...(search.trim() ? { search: search.trim() } : {}),
      })
    );
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();

    dispatch(
      fetchDeveloperEmploymentHistory({
        page: 1,
        limit: 10,
        ...(sort ? { sort } : {}),
        ...(search.trim() ? { search: search.trim() } : {}),
      })
    );
  };

  const handlePageChange = (page) => {
    dispatch(
      fetchDeveloperEmploymentHistory({
        page,
        limit: metadata?.pageSize || 10,
        ...(sort ? { sort } : {}),
        ...(search.trim() ? { search: search.trim() } : {}),
      })
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <main className="min-h-screen bg-[var(--df-paper)] text-[var(--df-text)]">
      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8 lg:px-10 lg:py-14">
        {/* Header */}
        <header className="border-b border-[var(--df-line)] pb-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--df-muted)]">
                Developer profile
              </p>

              <h1 className="mt-3 text-3xl font-medium tracking-[-0.04em] sm:text-4xl">
                Employment history
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-6 text-[var(--df-muted)]">
                Your professional experience and employment records
                connected to verified companies.
              </p>
            </div>
          </div>
        </header>

        {/* Controls */}
        <section className="border-b border-[var(--df-line)] py-5">
          <div className="flex flex-col gap-3 md:flex-row">
            <form
              onSubmit={handleSearchSubmit}
              className="flex min-w-0 flex-1"
            >
              <input
                type="search"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search roles, companies..."
                className="h-11 w-full border border-[var(--df-line)] bg-transparent px-4 text-sm outline-none placeholder:text-[var(--df-muted)] focus:border-[var(--df-text)]"
              />

              <button
                type="submit"
                className="h-11 border-y border-r border-[var(--df-text)] bg-[var(--df-text)] px-5 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--df-paper)] transition-opacity hover:opacity-85"
              >
                Search
              </button>
            </form>

            <select
              value={sort}
              onChange={(event) =>
                handleSort(event.target.value)
              }
              className="h-11 border border-[var(--df-line)] bg-[var(--df-paper)] px-4 text-sm text-[var(--df-text)] outline-none focus:border-[var(--df-text)]"
            >
              <option value="">Sort by</option>
              <option value="startDate">
                Oldest start date
              </option>
              <option value="endDate">
                Most recent end date
              </option>
              <option value="salary">
                Highest salary
              </option>
            </select>
          </div>
        </section>

        {/* Content */}
        <section className="pt-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--df-muted)]">
                Career history
              </p>

              <p className="mt-2 text-sm text-[var(--df-muted)]">
                {metadata?.totalCount || 0}{" "}
                {metadata?.totalCount === 1
                  ? "employment record"
                  : "employment records"}
              </p>
            </div>
          </div>

          {loadingList ? (
            <EmploymentSkeleton />
          ) : errorList ? (
            <div className="border-y border-[var(--df-line)] py-12 text-center">
              <p className="text-sm font-medium">
                Unable to load employment history.
              </p>

              <p className="mt-2 text-sm text-[var(--df-muted)]">
                {errorList}
              </p>

              <button
                type="button"
                onClick={() =>
                  dispatch(
                    fetchDeveloperEmploymentHistory({
                      page: metadata?.currentPage || 1,
                      limit: metadata?.pageSize || 10,
                    })
                  )
                }
                className="mt-5 border border-[var(--df-text)] px-5 py-3 text-xs font-semibold uppercase tracking-[0.12em] hover:bg-[var(--df-text)] hover:text-[var(--df-paper)]"
              >
                Try again
              </button>
            </div>
          ) : filteredEmployments.length === 0 ? (
            <div className="border-y border-[var(--df-line)] py-16 text-center">
              <p className="text-lg font-medium tracking-[-0.02em]">
                {search
                  ? "No matching employment records"
                  : "No employment history yet"}
              </p>

              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[var(--df-muted)]">
                {search
                  ? "Try a different company name, role, or description."
                  : "Employment records will appear here when companies add verified experience to your developer profile."}
              </p>
            </div>
          ) : (
            <div className="border-b border-[var(--df-line)]">
              {filteredEmployments.map((employment) => (
                <EmploymentCard
                  key={employment.id}
                  employment={employment}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {!loadingList &&
            !errorList &&
            metadata?.totalPages > 1 && (
              <div className="flex items-center justify-between border-b border-[var(--df-line)] py-5">
                <button
                  type="button"
                  disabled={!metadata.hasPreviousPage}
                  onClick={() =>
                    handlePageChange(
                      metadata.currentPage - 1
                    )
                  }
                  className="text-xs font-semibold uppercase tracking-[0.12em] disabled:cursor-not-allowed disabled:opacity-30"
                >
                  ← Previous
                </button>

                <span className="text-xs text-[var(--df-muted)]">
                  Page {metadata.currentPage} of{" "}
                  {metadata.totalPages}
                </span>

                <button
                  type="button"
                  disabled={!metadata.hasNextPage}
                  onClick={() =>
                    handlePageChange(
                      metadata.currentPage + 1
                    )
                  }
                  className="text-xs font-semibold uppercase tracking-[0.12em] disabled:cursor-not-allowed disabled:opacity-30"
                >
                  Next →
                </button>
              </div>
            )}
        </section>
      </div>
    </main>
  );
}