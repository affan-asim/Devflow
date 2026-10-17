"use client";

import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  AlertCircle,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import Link from "next/link";

import ApplicationCard from "./ApplicationCard";
import ApplicationFilters from "./ApplicationFilters";
import { fetchDeveloperApplications } from "@/lib/redux/slices/applicationSlice";

const PAGE_SIZE = 10;

export default function ApplicationsPage() {
  const dispatch = useDispatch();

  const {
    applications = [],
    metadata = {},
    loadingList,
    errorList,
  } = useSelector((state) => state.applications);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const [status, setStatus] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);

  /*
   * Debounce search.
   * This prevents an API request for every single keystroke.
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 350);

    return () => clearTimeout(timer);
  }, [searchInput]);

  /*
   * Fetch applications.
   */
  useEffect(() => {
    dispatch(
      fetchDeveloperApplications({
        search: search || undefined,
        status: status || undefined,
        sort,
        page,
        limit: PAGE_SIZE,
      })
    );
  }, [dispatch, search, status, sort, page]);

  /*
   * Reset page whenever a filter changes.
   */
  const handleStatusChange = (value) => {
    setStatus(value);
    setPage(1);
  };

  const handleSortChange = (value) => {
    setSort(value);
    setPage(1);
  };

  const clearSearch = () => {
    setSearchInput("");
    setSearch("");
    setPage(1);
  };

  const clearAllFilters = () => {
    setSearchInput("");
    setSearch("");
    setStatus("");
    setSort("newest");
    setPage(1);
  };

  const hasActiveFilters =
    Boolean(search) ||
    Boolean(status) ||
    sort !== "newest";

  /*
   * Pagination range.
   */
  const paginationItems = useMemo(() => {
    const totalPages = metadata.totalPages || 0;
    const currentPage = metadata.currentPage || page;

    if (totalPages <= 7) {
      return Array.from(
        { length: totalPages },
        (_, index) => index + 1
      );
    }

    const items = [];

    items.push(1);

    if (currentPage > 4) {
      items.push("ellipsis-start");
    }

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(
      totalPages - 1,
      currentPage + 1
    );

    for (let value = start; value <= end; value++) {
      items.push(value);
    }

    if (currentPage < totalPages - 3) {
      items.push("ellipsis-end");
    }

    items.push(totalPages);

    return items;
  }, [metadata.totalPages, metadata.currentPage, page]);

  const totalCount = metadata.totalCount || 0;
  const currentPage = metadata.currentPage || page;
  const pageSize = metadata.pageSize || PAGE_SIZE;

  const rangeStart =
    totalCount === 0
      ? 0
      : (currentPage - 1) * pageSize + 1;

  const rangeEnd = Math.min(
    currentPage * pageSize,
    totalCount
  );

  return (
    <main className="min-h-screen bg-[var(--df-paper)]">
      <div className="mx-auto px-5 py-8 sm:px-8 sm:py-10 lg:px-10">
        {/* =================================================
            HEADER
        ================================================== */}

        <header className="border-b border-[var(--df-line)] pb-8">

          <div className="mt-7 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--df-muted)]">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--df-accent)]" />
                Application tracker
              </div>

              <h1 className="mt-3 max-w-3xl text-3xl font-semibold tracking-[-0.045em] sm:text-4xl lg:text-5xl">
                Keep track of every opportunity.
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-6 text-[var(--df-muted)]">
                Search your applications, review their current
                status, and quickly return to the roles you've
                applied for.
              </p>
            </div>

            <div className="shrink-0 border border-[var(--df-line)] px-5 py-4">
              <p className="text-2xl font-semibold tracking-tight">
                {totalCount}
              </p>

              <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--df-muted)]">
                {totalCount === 1
                  ? "Application"
                  : "Applications"}
              </p>
            </div>
          </div>
        </header>

        {/* =================================================
            SEARCH + FILTERS
        ================================================== */}

        <section className="mt-6">
          <div className="border border-[var(--df-line)]">
            {/* SEARCH */}

            <div className="flex items-center gap-3 px-4 py-3.5 sm:px-5">
              <Search className="h-4 w-4 shrink-0 text-[var(--df-muted)]" />

              <input
                type="text"
                value={searchInput}
                onChange={(event) =>
                  setSearchInput(event.target.value)
                }
                placeholder="Search jobs, job descriptions, companies..."
                className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[var(--df-muted)]"
              />

              {searchInput && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="flex h-7 w-7 items-center justify-center text-[var(--df-muted)] transition hover:text-[var(--df-text)]"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* FILTERS */}

            <ApplicationFilters
              status={status}
              sort={sort}
              onStatusChange={handleStatusChange}
              onSortChange={handleSortChange}
              hasActiveFilters={hasActiveFilters}
              onClear={clearAllFilters}
            />
          </div>
        </section>

        {/* =================================================
            RESULTS HEADER
        ================================================== */}

        {!loadingList && !errorList && (
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-3.5 w-3.5 text-[var(--df-muted)]" />

              <p className="text-xs text-[var(--df-muted)]">
                {totalCount > 0 ? (
                  <>
                    Showing{" "}
                    <span className="font-medium text-[var(--df-text)]">
                      {rangeStart}–{rangeEnd}
                    </span>{" "}
                    of{" "}
                    <span className="font-medium text-[var(--df-text)]">
                      {totalCount}
                    </span>
                  </>
                ) : (
                  "No results"
                )}
              </p>

              {search && (
                <span className="hidden text-xs text-[var(--df-muted)] sm:inline">
                  for "{search}"
                </span>
              )}
            </div>

            {metadata.totalPages > 1 && (
              <p className="text-xs text-[var(--df-muted)]">
                Page{" "}
                <span className="font-medium text-[var(--df-text)]">
                  {currentPage}
                </span>{" "}
                of{" "}
                <span className="font-medium text-[var(--df-text)]">
                  {metadata.totalPages}
                </span>
              </p>
            )}
          </div>
        )}

        {/* =================================================
            ERROR
        ================================================== */}

        {errorList && (
          <div className="mt-5 border border-red-200 bg-red-50 p-5">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />

              <div>
                <p className="text-sm font-semibold text-red-800">
                  Couldn't load applications.
                </p>

                <p className="mt-1 text-xs leading-5 text-red-700">
                  {errorList}
                </p>

                <button
                  type="button"
                  onClick={() =>
                    dispatch(
                      fetchDeveloperApplications({
                        search: search || undefined,
                        status: status || undefined,
                        sort,
                        page,
                        limit: PAGE_SIZE,
                      })
                    )
                  }
                  className="mt-4 text-xs font-semibold text-red-800 underline underline-offset-4"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =================================================
            LOADING
        ================================================== */}

        {loadingList && (
          <div className="mt-5 space-y-3">
            {[1, 2, 3].map((item) => (
              <ApplicationCardSkeleton key={item} />
            ))}
          </div>
        )}

        {/* =================================================
            EMPTY
        ================================================== */}

        {!loadingList &&
          !errorList &&
          applications.length === 0 && (
            <div className="mt-5 border border-[var(--df-line)] px-6 py-16 text-center sm:px-10">
              <div className="mx-auto flex h-12 w-12 items-center justify-center border border-[var(--df-line)]">
                <Search className="h-5 w-5 text-[var(--df-muted)]" />
              </div>

              <h2 className="mt-5 text-xl font-semibold tracking-tight">
                {hasActiveFilters
                  ? "No applications match your search."
                  : "No applications yet."}
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--df-muted)]">
                {hasActiveFilters
                  ? "Try a different search term or clear your filters to see more applications."
                  : "Once you apply to a role, it will appear here so you can track its progress."}
              </p>

              {hasActiveFilters ? (
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="mt-6 inline-flex h-10 items-center border border-[var(--df-line)] px-4 text-xs font-medium transition hover:border-[var(--df-text)]"
                >
                  Clear filters
                </button>
              ) : (
                <Link
                  href="/dashboard/developer/jobs"
                  className="mt-6 inline-flex h-11 items-center bg-[var(--df-text)] px-5 text-sm font-medium text-[var(--df-paper)] transition hover:opacity-90"
                >
                  Explore jobs
                </Link>
              )}
            </div>
          )}

        {/* =================================================
            APPLICATIONS
        ================================================== */}

        {!loadingList &&
          !errorList &&
          applications.length > 0 && (
            <div className="mt-5 space-y-3">
              {applications.map((application) => (
                <ApplicationCard
                  key={application.id}
                  application={application}
                />
              ))}
            </div>
          )}

        {/* =================================================
            PAGINATION
        ================================================== */}

        {!loadingList &&
          !errorList &&
          applications.length > 0 &&
          metadata.totalPages > 1 && (
            <nav
              className="mt-8 flex flex-col gap-4 border-t border-[var(--df-line)] pt-5 sm:flex-row sm:items-center sm:justify-between"
              aria-label="Applications pagination"
            >
              <button
                type="button"
                disabled={!metadata.hasPreviousPage}
                onClick={() =>
                  setPage((previous) =>
                    Math.max(1, previous - 1)
                  )
                }
                className="inline-flex h-9 items-center justify-center gap-2 border border-[var(--df-line)] px-3 text-xs font-medium transition hover:border-[var(--df-text)] disabled:cursor-not-allowed disabled:opacity-35"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                Previous
              </button>

              <div className="flex items-center justify-center gap-1">
                {paginationItems.map((item) => {
                  if (
                    item === "ellipsis-start" ||
                    item === "ellipsis-end"
                  ) {
                    return (
                      <span
                        key={item}
                        className="flex h-9 w-8 items-center justify-center text-xs text-[var(--df-muted)]"
                      >
                        …
                      </span>
                    );
                  }

                  const active =
                    item === currentPage;

                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setPage(item)}
                      className={`flex h-9 min-w-9 items-center justify-center px-2 text-xs font-medium transition ${
                        active
                          ? "bg-[var(--df-text)] text-[var(--df-paper)]"
                          : "text-[var(--df-muted)] hover:bg-[var(--df-soft)] hover:text-[var(--df-text)]"
                      }`}
                    >
                      {item}
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                disabled={!metadata.hasNextPage}
                onClick={() =>
                  setPage((previous) =>
                    previous + 1
                  )
                }
                className="inline-flex h-9 items-center justify-center gap-2 border border-[var(--df-line)] px-3 text-xs font-medium transition hover:border-[var(--df-text)] disabled:cursor-not-allowed disabled:opacity-35"
              >
                Next
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </nav>
          )}
      </div>
    </main>
  );
}

function ApplicationCardSkeleton() {
  return (
    <div className="animate-pulse border border-[var(--df-line)] p-5 sm:p-6">
      <div className="flex justify-between gap-5">
        <div className="min-w-0 flex-1">
          <div className="h-2.5 w-24 bg-[var(--df-line)]" />
          <div className="mt-3 h-6 max-w-md bg-[var(--df-line)]" />
          <div className="mt-3 h-3 w-72 max-w-full bg-[var(--df-line)]" />
        </div>

        <div className="h-7 w-20 bg-[var(--df-line)]" />
      </div>

      <div className="mt-6 flex gap-4">
        <div className="h-3 w-24 bg-[var(--df-line)]" />
        <div className="h-3 w-28 bg-[var(--df-line)]" />
        <div className="h-3 w-24 bg-[var(--df-line)]" />
      </div>

      <div className="mt-6 border-t border-[var(--df-line)] pt-4">
        <div className="h-3 w-48 bg-[var(--df-line)]" />
      </div>
    </div>
  );
}