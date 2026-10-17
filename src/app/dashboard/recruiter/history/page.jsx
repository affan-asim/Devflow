"use client";

import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  BriefcaseBusiness,
  Clock3,
  Eye,
  X,
} from "lucide-react";
import { fetchRecruiterHistory } from "@/lib/redux/slices/recruiterHistorySlice";

const PAGE_SIZE = 10;

const EMPLOYMENT_TYPES = [
  { value: "", label: "All employment types" },
  { value: "FULLTIME", label: "Full time" },
  { value: "PARTTIME", label: "Part time" },
  { value: "CONTRACT", label: "Contract" },
  { value: "INTERN", label: "Internship" },
];

const SORT_OPTIONS = [
  { value: "", label: "Default order" },
  { value: "startDate", label: "Start date" },
  { value: "endDate", label: "End date" },
  { value: "salary", label: "Salary" },
];

function formatDate(value) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function getRecruiterName(item) {
  return (
    item?.recruiter?.user?.name ||
    item?.user?.name ||
    item?.recruiterName ||
    "Unknown recruiter"
  );
}

function getRecruiterEmail(item) {
  return item?.recruiter?.user?.email || item?.user?.email || "";
}

function getEmploymentStatus(item) {
  if (item?.isCurrent) return "Current";
  if (item?.endDate) return "Ended";
  return "Inactive";
}

function getLatestEvent(item) {
  return item?.recruiterEvents?.[0] || null;
}

export default function RecruiterHistoryManagementPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const {
    employments,
    metadata,
    loadingList,
    errorList,
  } = useSelector((state) => state.recruiterHistory);

  const [searchInput, setSearchInput] = useState(
    searchParams.get("search") || ""
  );

  const search = searchParams.get("search") || "";
  const employmentType = searchParams.get("employmentType") || "";
  const sort = searchParams.get("sort") || "";
  const currentPage = Number(searchParams.get("page") || 1);

  const updateParams = useCallback(
    (updates) => {
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
    const timeout = setTimeout(() => {
      if (searchInput !== search) {
        updateParams({
          search: searchInput.trim(),
          page: 1,
        });
      }
    }, 400);

    return () => clearTimeout(timeout);
  }, [searchInput, search, updateParams]);

  useEffect(() => {
    dispatch(
      fetchRecruiterHistory({
        search,
        employmentType,
        sort,
        page: currentPage,
        limit: PAGE_SIZE,
      })
    );
  }, [
    dispatch,
    search,
    employmentType,
    sort,
    currentPage,
  ]);

  const hasFilters = Boolean(
    search || employmentType || sort
  );

  const clearFilters = () => {
    setSearchInput("");
    router.push(pathname);
  };

  const goToPage = (page) => {
    updateParams({ page });
  };

  return (
    <main className="min-h-screen bg-[var(--df-paper)] text-[var(--df-text)]">
      <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8 lg:py-10">

        {/* Header */}
        <header className="mb-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--df-muted)]">
                Recruiter management
              </p>

              <h1 className="text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">
                Employment history
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--df-muted)]">
                Review your company&apos;s recruiter employment records,
                current assignments, and employment events.
              </p>
            </div>

            <div className="flex items-center gap-2 text-sm text-[var(--df-muted)]">
              <BriefcaseBusiness size={16} />
              {metadata?.totalCount || 0} records
            </div>
          </div>
        </header>

        {/* Filters */}
        <section className="mb-6 border-y border-[var(--df-line)] py-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">

            <div className="relative min-w-0 flex-1">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--df-muted)]"
              />

              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search recruiter, role or description..."
                className="h-11 w-full border border-[var(--df-line)] bg-transparent pl-10 pr-4 text-sm outline-none transition focus:border-[var(--df-text)]"
              />
            </div>

            <select
              value={employmentType}
              onChange={(e) =>
                updateParams({
                  employmentType: e.target.value,
                })
              }
              className="h-11 border border-[var(--df-line)] bg-[var(--df-paper)] px-3 text-sm outline-none"
            >
              {EMPLOYMENT_TYPES.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                >
                  {option.label}
                </option>
              ))}
            </select>

            <div className="flex items-center gap-2">
              <ArrowUpDown
                size={16}
                className="text-[var(--df-muted)]"
              />

              <select
                value={sort}
                onChange={(e) =>
                  updateParams({
                    sort: e.target.value,
                  })
                }
                className="h-11 border border-[var(--df-line)] bg-[var(--df-paper)] px-3 text-sm outline-none"
              >
                {SORT_OPTIONS.map((option) => (
                  <option
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex h-11 items-center justify-center gap-2 px-3 text-sm text-[var(--df-muted)] hover:text-[var(--df-text)]"
              >
                <X size={15} />
                Clear
              </button>
            )}
          </div>
        </section>

        {/* Error */}
        {errorList && (
          <div className="mb-6 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorList}
          </div>
        )}

        {/* Desktop table */}
        <section className="hidden overflow-hidden border border-[var(--df-line)] lg:block">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-[var(--df-line)] bg-black/[0.02]">
                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider">
                  Recruiter
                </th>
                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider">
                  Role
                </th>
                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider">
                  Employment
                </th>
                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider">
                  Period
                </th>
                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider">
                  Status
                </th>
                <th className="px-5 py-4" />
              </tr>
            </thead>

            <tbody>
              {loadingList ? (
                Array.from({ length: 6 }).map((_, index) => (
                  <tr
                    key={index}
                    className="border-b border-[var(--df-line-soft)]"
                  >
                    <td colSpan={6} className="px-5 py-6">
                      <div className="h-5 w-full animate-pulse bg-black/5" />
                    </td>
                  </tr>
                ))
              ) : employments?.length ? (
                employments.map((item) => {
                  const latestEvent = getLatestEvent(item);

                  return (
                    <tr
                      key={item.id}
                      className="border-b border-[var(--df-line-soft)] transition hover:bg-black/[0.018]"
                    >
                      <td className="px-5 py-5">
                        <div className="font-medium">
                          {getRecruiterName(item)}
                        </div>

                        <div className="mt-1 text-xs text-[var(--df-muted)]">
                          {getRecruiterEmail(item)}
                        </div>
                      </td>

                      <td className="px-5 py-5 text-sm">
                        {item.roleTitle || "—"}
                      </td>

                      <td className="px-5 py-5 text-sm">
                        {item.employmentType || "—"}
                      </td>

                      <td className="px-5 py-5 text-sm">
                        <div>{formatDate(item.startDate)}</div>
                        <div className="mt-1 text-xs text-[var(--df-muted)]">
                          {item.endDate
                            ? `to ${formatDate(item.endDate)}`
                            : "Present"}
                        </div>
                      </td>

                      <td className="px-5 py-5">
                        <div className="flex flex-col items-start gap-1">
                          <span className="inline-flex items-center border border-[var(--df-line)] px-2 py-1 text-xs font-medium">
                            {getEmploymentStatus(item)}
                          </span>

                          {latestEvent?.status === "PENDING" && (
                            <span className="text-xs font-medium text-amber-700">
                              Pending event
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-5 py-5 text-right">
                        <button
                          type="button"
                          onClick={() =>
                            router.push(
                              `/dashboard/recruiter/history/${item.id}`
                            )
                          }
                          className="inline-flex items-center gap-2 text-sm font-medium hover:underline"
                        >
                          View
                          <Eye size={15} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-20 text-center"
                  >
                    <Clock3
                      size={22}
                      className="mx-auto mb-3 text-[var(--df-muted)]"
                    />

                    <p className="font-medium">
                      No employment history found
                    </p>

                    <p className="mt-1 text-sm text-[var(--df-muted)]">
                      Try changing your search or filters.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>

        {/* Mobile */}
        <section className="space-y-3 lg:hidden">
          {!loadingList &&
            employments?.map((item) => {
              const latestEvent = getLatestEvent(item);

              return (
                <article
                  key={item.id}
                  className="border border-[var(--df-line)] p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="font-semibold">
                        {getRecruiterName(item)}
                      </h2>

                      <p className="mt-1 text-xs text-[var(--df-muted)]">
                        {getRecruiterEmail(item)}
                      </p>
                    </div>

                    <span className="border border-[var(--df-line)] px-2 py-1 text-xs">
                      {getEmploymentStatus(item)}
                    </span>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-xs text-[var(--df-muted)]">
                        Role
                      </p>
                      <p className="mt-1">
                        {item.roleTitle || "—"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-[var(--df-muted)]">
                        Employment
                      </p>
                      <p className="mt-1">
                        {item.employmentType || "—"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-[var(--df-muted)]">
                        Started
                      </p>
                      <p className="mt-1">
                        {formatDate(item.startDate)}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-[var(--df-muted)]">
                        Ended
                      </p>
                      <p className="mt-1">
                        {item.endDate
                          ? formatDate(item.endDate)
                          : "Present"}
                      </p>
                    </div>
                  </div>

                  {latestEvent?.status === "PENDING" && (
                    <div className="mt-4 border-l-2 border-amber-500 pl-3 text-xs text-amber-700">
                      Pending employment event
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() =>
                      router.push(
                        `/dashboard/recruiter/history/${item.id}`
                      )
                    }
                    className="mt-5 flex w-full items-center justify-center gap-2 border border-[var(--df-line)] py-2.5 text-sm font-medium"
                  >
                    View history
                    <Eye size={15} />
                  </button>
                </article>
              );
            })}

          {loadingList &&
            Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-44 animate-pulse border border-[var(--df-line)] bg-black/[0.02]"
              />
            ))}
        </section>

        {/* Pagination */}
        {!loadingList && metadata?.totalPages > 0 && (
          <footer className="mt-6 flex items-center justify-between border-t border-[var(--df-line)] pt-4">
            <p className="text-sm text-[var(--df-muted)]">
              Page {metadata.currentPage} of {metadata.totalPages}
            </p>

            <div className="flex items-center gap-1">
              <button
                disabled={!metadata.hasPreviousPage}
                onClick={() =>
                  goToPage(metadata.currentPage - 1)
                }
                className="flex h-9 w-9 items-center justify-center border border-[var(--df-line)] disabled:cursor-not-allowed disabled:opacity-30"
              >
                <ChevronLeft size={16} />
              </button>

              <button
                disabled={!metadata.hasNextPage}
                onClick={() =>
                  goToPage(metadata.currentPage + 1)
                }
                className="flex h-9 w-9 items-center justify-center border border-[var(--df-line)] disabled:cursor-not-allowed disabled:opacity-30"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </footer>
        )}
      </div>
    </main>
  );
}
