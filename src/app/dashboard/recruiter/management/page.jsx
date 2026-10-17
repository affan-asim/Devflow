"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Mail,
  RefreshCw,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  UserRound,
  Users,
  X,
} from "lucide-react";

import { fetchRecruiterProfiles } from "@/lib/redux/slices/recruiterSlice";

import {
  ACTIVE_OPTIONS,
  LOCATION_OPTIONS,
  RECRUITER_PAGE_SIZE,
  SORT_OPTIONS,
  VERIFIED_OPTIONS,
  formatExperience,
  formatLocationPreference,
  formatRelativeDate,
  getInitials,
  getRecruiterStatus,
  getStatusClasses,
} from "@/lib/recruiter/recruiterManagement";

export default function RecruiterManagementPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  /*
   * IMPORTANT:
   * Adjust this selector only if your auth slice uses another state path.
   *
   * Expected:
   * state.auth.user.recruiterProfile.companyId
   */
  const user = useSelector((state) => state.auth?.user);

  const {
    profiles,
    profilesMetadata,
    loadingProfiles,
    errorProfiles,
  } = useSelector((state) => state.recruiter);

  const companyId = user?.recruiterProfile?.companyId;

  const [searchInput, setSearchInput] = useState(
    searchParams.get("search") || ""
  );

  const search = searchParams.get("search") || "";
  const locationPreference =
    searchParams.get("locationPreference") || "";
  const isActive = searchParams.get("isActive") || "";
  const isVerified = searchParams.get("isVerified") || "";
  const sort = searchParams.get("sort") || "createdAt:desc";
  const page = Number(searchParams.get("page") || 1);

  const selectedSort = useMemo(() => {
    return (
      SORT_OPTIONS.find((option) => option.value === sort) ||
      SORT_OPTIONS[0]
    );
  }, [sort]);

  const updateQuery = useCallback(
    (updates, options = {}) => {
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

      if (options.resetPage !== false) {
        params.set("page", "1");
      }

      router.replace(`${pathname}?${params.toString()}`, {
        scroll: false,
      });
    },
    [pathname, router, searchParams]
  );

  /*
   * Debounced search.
   *
   * The API supports searching name, email, bio, description,
   * job title and company name.
   */
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (searchInput !== search) {
        updateQuery({
          search: searchInput.trim(),
        });
      }
    }, 350);

    return () => clearTimeout(timeout);
  }, [searchInput, search, updateQuery]);

  /*
   * Fetch company recruiters.
   *
   * companyId is always taken from authenticated /me state.
   */
  const loadRecruiters = useCallback(() => {
    if (!companyId) return;

    dispatch(
      fetchRecruiterProfiles({
        companyId,
        search: search || undefined,
        locationPreference: locationPreference || undefined,
        isActive: isActive || undefined,
        isVerified: isVerified || undefined,
        page,
        limit: RECRUITER_PAGE_SIZE,
        sortBy: selectedSort.sortBy,
        sortOrder: selectedSort.sortOrder,
      })
    );
  }, [
    companyId,
    dispatch,
    isActive,
    isVerified,
    locationPreference,
    page,
    search,
    selectedSort,
  ]);

  useEffect(() => {
    loadRecruiters();
  }, [loadRecruiters]);

  const handleClearFilters = () => {
    setSearchInput("");

    router.replace(pathname, {
      scroll: false,
    });
  };

  const hasFilters =
    Boolean(search) ||
    Boolean(locationPreference) ||
    Boolean(isActive) ||
    Boolean(isVerified) ||
    sort !== "createdAt:desc";

  const visibleVerifiedCount = profiles.filter(
    (profile) => profile.user?.isVerified
  ).length;

  const visibleActiveCount = profiles.filter(
    (profile) => profile.user?.isActive
  ).length;

  /*
   * Missing company/profile state.
   *
   * We intentionally don't call the endpoint without companyId.
   */
  if (!user) {
    return <PageSkeleton />;
  }

  if (!companyId) {
    return (
      <main className="min-h-screen bg-[var(--df-paper)] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="border border-[var(--df-line)] bg-[var(--df-paper-2)] p-8">
            <div className="mb-4 flex h-11 w-11 items-center justify-center border border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300">
              <BriefcaseBusiness size={20} />
            </div>

            <h1 className="text-xl font-semibold tracking-tight text-[var(--df-text)]">
              Company profile required
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--df-muted)]">
              Your recruiter account is not currently attached to a company.
              Recruiter management is available after your recruiter profile
              is connected to a verified company.
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--df-paper)] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <header className="mb-7">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--df-muted)]">
                Recruiter management
              </p>

              <h1 className="text-2xl font-semibold tracking-tight text-[var(--df-text)] sm:text-3xl">
                Company recruiters
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--df-muted)]">
                Manage and review the recruiters currently associated with
                your company.
              </p>
            </div>

            <button
              type="button"
              onClick={loadRecruiters}
              disabled={loadingProfiles}
              className="inline-flex h-10 items-center justify-center gap-2 border border-[var(--df-line)] bg-[var(--df-paper-2)] px-4 text-sm font-medium text-[var(--df-text)] transition hover:border-[var(--df-text)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw
                size={15}
                className={loadingProfiles ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </div>
        </header>

        {/* Summary */}
        <section className="mb-6 grid grid-cols-1 border-y border-[var(--df-line)] bg-[var(--df-paper-2)] sm:grid-cols-3">
          <SummaryItem
            label="Total recruiters"
            value={profilesMetadata.totalCount ?? 0}
            icon={<Users size={17} />}
          />

          <SummaryItem
            label="Active on this page"
            value={`${visibleActiveCount}/${profiles.length}`}
            icon={<CheckCircle2 size={17} />}
          />

          <SummaryItem
            label="Verified on this page"
            value={`${visibleVerifiedCount}/${profiles.length}`}
            icon={<ShieldCheck size={17} />}
          />
        </section>

        {/* Filters */}
        <section className="mb-5 border border-[var(--df-line)] bg-[var(--df-paper-2)]">
          <div className="flex flex-col gap-4 p-4 lg:flex-row lg:items-center">
            {/* Search */}
            <div className="relative min-w-0 flex-1">
              <Search
                size={17}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--df-muted)]"
              />

              <input
                value={searchInput}
                onChange={(event) =>
                  setSearchInput(event.target.value)
                }
                placeholder="Search recruiters by name, email or role..."
                className="h-10 w-full border border-[var(--df-line)] bg-[var(--df-paper)] pl-10 pr-10 text-sm text-[var(--df-text)] outline-none transition placeholder:text-[var(--df-muted)] focus:border-[var(--df-text)]"
              />

              {searchInput && (
                <button
                  type="button"
                  onClick={() => setSearchInput("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--df-muted)] hover:text-[var(--df-text)]"
                  aria-label="Clear search"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <FilterSelect
                value={locationPreference}
                onChange={(value) =>
                  updateQuery({
                    locationPreference: value,
                  })
                }
                options={LOCATION_OPTIONS}
              />

              <FilterSelect
                value={isActive}
                onChange={(value) =>
                  updateQuery({
                    isActive: value,
                  })
                }
                options={ACTIVE_OPTIONS}
              />

              <FilterSelect
                value={isVerified}
                onChange={(value) =>
                  updateQuery({
                    isVerified: value,
                  })
                }
                options={VERIFIED_OPTIONS}
              />

              <FilterSelect
                value={sort}
                onChange={(value) =>
                  updateQuery({
                    sort: value,
                  })
                }
                options={SORT_OPTIONS}
              />
            </div>
          </div>

          {hasFilters && (
            <div className="flex items-center justify-between border-t border-[var(--df-line)] px-4 py-3">
              <div className="flex items-center gap-2 text-xs text-[var(--df-muted)]">
                <SlidersHorizontal size={14} />
                Filters are active
              </div>

              <button
                type="button"
                onClick={handleClearFilters}
                className="text-xs font-medium text-[var(--df-text)] underline underline-offset-4"
              >
                Clear all
              </button>
            </div>
          )}
        </section>

        {/* Error */}
        {errorProfiles && (
          <ErrorState
            message={errorProfiles}
            onRetry={loadRecruiters}
          />
        )}

        {/* Desktop table */}
        <section className="hidden overflow-hidden border border-[var(--df-line)] bg-[var(--df-paper-2)] lg:block">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] border-collapse">
              <thead>
                <tr className="border-b border-[var(--df-line)] bg-[var(--df-paper)]">
                  <TableHead>Recruiter</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Experience</TableHead>
                  <TableHead>Work preference</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Added</TableHead>
                  <TableHead />
                </tr>
              </thead>

              <tbody>
                {loadingProfiles && profiles.length === 0 ? (
                  <TableSkeleton />
                ) : profiles.length === 0 ? (
                  <tr>
                    <td colSpan={7}>
                      <EmptyState hasFilters={hasFilters} />
                    </td>
                  </tr>
                ) : (
                  profiles.map((recruiter) => (
                    <RecruiterRow
                      key={recruiter.id}
                      recruiter={recruiter}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Mobile/tablet cards */}
        <section className="space-y-3 lg:hidden">
          {loadingProfiles && profiles.length === 0 ? (
            <MobileSkeleton />
          ) : profiles.length === 0 ? (
            <EmptyState hasFilters={hasFilters} />
          ) : (
            profiles.map((recruiter) => (
              <RecruiterCard
                key={recruiter.id}
                recruiter={recruiter}
              />
            ))
          )}
        </section>

        {/* Pagination */}
        {profilesMetadata.totalPages > 0 && (
          <Pagination
            metadata={profilesMetadata}
            onPrevious={() =>
              updateQuery(
                {
                  page: Math.max(1, page - 1),
                },
                { resetPage: false }
              )
            }
            onNext={() =>
              updateQuery(
                {
                  page: Math.min(
                    profilesMetadata.totalPages,
                    page + 1
                  ),
                },
                { resetPage: false }
              )
            }
          />
        )}
      </div>
    </main>
  );
}

function SummaryItem({ label, value, icon }) {
  return (
    <div className="flex items-center gap-3 border-b border-[var(--df-line)] p-4 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center border border-[var(--df-line)] text-[var(--df-muted)]">
        {icon}
      </div>

      <div>
        <p className="text-[11px] font-medium uppercase tracking-wider text-[var(--df-muted)]">
          {label}
        </p>
        <p className="mt-0.5 text-lg font-semibold text-[var(--df-text)]">
          {value}
        </p>
      </div>
    </div>
  );
}

function FilterSelect({ value, onChange, options }) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-10 min-w-[155px] border border-[var(--df-line)] bg-[var(--df-paper)] px-3 text-sm text-[var(--df-text)] outline-none focus:border-[var(--df-text)]"
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
  );
}

function TableHead({ children }) {
  return (
    <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--df-muted)]">
      {children}
    </th>
  );
}

function RecruiterRow({ recruiter }) {
  const user = recruiter.user;
  const status = getRecruiterStatus(recruiter);

  return (
    <tr className="group border-b border-[var(--df-line)] last:border-b-0 hover:bg-[var(--df-paper)]">
      <td className="px-4 py-4">
        <Link
          href={`/dashboard/recruiter/management/${recruiter.id}`}
          className="flex items-center gap-3"
        >
          <Avatar
            name={user?.name}
            size="md"
          />

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-[var(--df-text)]">
              {user?.name || "Unnamed recruiter"}
            </p>

            <p className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-[var(--df-muted)]">
              <Mail size={12} />
              {user?.email || "No email"}
            </p>
          </div>
        </Link>
      </td>

      <td className="px-4 py-4">
        <p className="text-sm text-[var(--df-text)]">
          {recruiter.jobTitle || "Role not specified"}
        </p>
      </td>

      <td className="px-4 py-4">
        <span className="text-sm text-[var(--df-text)]">
          {formatExperience(recruiter.yearsOfExp)}
        </span>
      </td>

      <td className="px-4 py-4">
        <span className="text-sm text-[var(--df-muted)]">
          {formatLocationPreference(
            recruiter.locationPreference
          )}
        </span>
      </td>

      <td className="px-4 py-4">
        <StatusBadge status={status} />
      </td>

      <td className="px-4 py-4">
        <span
          title={
            user?.createdAt
              ? new Date(user.createdAt).toLocaleString()
              : undefined
          }
          className="text-xs text-[var(--df-muted)]"
        >
          {formatRelativeDate(user?.createdAt)}
        </span>
      </td>

      <td className="px-4 py-4 text-right">
        <Link
          href={`/dashboard/recruiter/management/${recruiter.id}`}
          className="inline-flex h-8 items-center gap-1.5 border border-transparent px-2.5 text-xs font-medium text-[var(--df-text)] transition hover:border-[var(--df-line)] hover:bg-[var(--df-paper-2)]"
        >
          View
          <ArrowRight size={13} />
        </Link>
      </td>
    </tr>
  );
}

function RecruiterCard({ recruiter }) {
  const user = recruiter.user;
  const status = getRecruiterStatus(recruiter);

  return (
    <Link
      href={`/dashboard/recruiter/management/${recruiter.id}`}
      className="block border border-[var(--df-line)] bg-[var(--df-paper-2)] p-4 transition hover:border-[var(--df-text)]"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar
            name={user?.name}
            size="md"
          />

          <div className="min-w-0">
            <h2 className="truncate text-sm font-semibold text-[var(--df-text)]">
              {user?.name || "Unnamed recruiter"}
            </h2>

            <p className="mt-0.5 truncate text-xs text-[var(--df-muted)]">
              {user?.email || "No email"}
            </p>
          </div>
        </div>

        <StatusBadge status={status} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-px border border-[var(--df-line)] bg-[var(--df-line)]">
        <InfoCell
          label="Role"
          value={recruiter.jobTitle || "Not specified"}
        />

        <InfoCell
          label="Experience"
          value={formatExperience(recruiter.yearsOfExp)}
        />

        <InfoCell
          label="Work preference"
          value={formatLocationPreference(
            recruiter.locationPreference
          )}
        />

        <InfoCell
          label="Added"
          value={formatRelativeDate(user?.createdAt)}
        />
      </div>

      <div className="mt-4 flex items-center justify-end text-xs font-medium text-[var(--df-text)]">
        View recruiter
        <ArrowRight
          size={13}
          className="ml-1"
        />
      </div>
    </Link>
  );
}

function InfoCell({ label, value }) {
  return (
    <div className="bg-[var(--df-paper)] p-3">
      <p className="text-[10px] uppercase tracking-wider text-[var(--df-muted)]">
        {label}
      </p>

      <p className="mt-1 truncate text-xs font-medium text-[var(--df-text)]">
        {value}
      </p>
    </div>
  );
}

function Avatar({ name, size = "md" }) {
  const dimensions =
    size === "lg"
      ? "h-16 w-16 text-lg"
      : "h-10 w-10 text-xs";

  return (
    <div
      className={`flex shrink-0 items-center justify-center border border-[var(--df-line)] bg-[var(--df-paper)] font-semibold text-[var(--df-text)] ${dimensions}`}
    >
      {getInitials(name)}
    </div>
  );
}

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap border px-2 py-1 text-[10px] font-semibold uppercase tracking-wider ${getStatusClasses(
        status.tone
      )}`}
    >
      {status.label}
    </span>
  );
}

function Pagination({
  metadata,
  onPrevious,
  onNext,
}) {
  return (
    <div className="mt-5 flex flex-col gap-3 border-t border-[var(--df-line)] pt-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs text-[var(--df-muted)]">
        Page {metadata.currentPage} of {metadata.totalPages}
        <span className="mx-1">·</span>
        {metadata.totalCount} recruiters
      </p>

      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={!metadata.hasPreviousPage}
          onClick={onPrevious}
          className="inline-flex h-9 items-center gap-1 border border-[var(--df-line)] bg-[var(--df-paper-2)] px-3 text-xs font-medium text-[var(--df-text)] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft size={14} />
          Previous
        </button>

        <button
          type="button"
          disabled={!metadata.hasNextPage}
          onClick={onNext}
          className="inline-flex h-9 items-center gap-1 border border-[var(--df-line)] bg-[var(--df-paper-2)] px-3 text-xs font-medium text-[var(--df-text)] disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}

function EmptyState({ hasFilters }) {
  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center px-6 py-12 text-center">
      <div className="mb-4 flex h-11 w-11 items-center justify-center border border-[var(--df-line)] text-[var(--df-muted)]">
        <UserRound size={19} />
      </div>

      <h3 className="text-sm font-semibold text-[var(--df-text)]">
        {hasFilters
          ? "No recruiters match your filters"
          : "No recruiters found"}
      </h3>

      <p className="mt-2 max-w-sm text-xs leading-5 text-[var(--df-muted)]">
        {hasFilters
          ? "Try changing your search or removing one of the filters."
          : "Recruiters associated with your company will appear here."}
      </p>
    </div>
  );
}

function ErrorState({ message, onRetry }) {
  return (
    <div className="mb-5 flex flex-col gap-3 border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/30 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-semibold text-red-800 dark:text-red-300">
          Unable to load recruiters
        </p>

        <p className="mt-1 text-xs text-red-700 dark:text-red-300">
          {message}
        </p>
      </div>

      <button
        type="button"
        onClick={onRetry}
        className="inline-flex h-9 items-center justify-center gap-2 border border-red-200 bg-[var(--df-paper-2)] px-3 text-xs font-medium text-red-800 dark:border-red-900 dark:text-red-300"
      >
        <RefreshCw size={13} />
        Try again
      </button>
    </div>
  );
}

function TableSkeleton() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, index) => (
        <tr
          key={index}
          className="border-b border-[var(--df-line)]"
        >
          {Array.from({ length: 7 }).map((__, cellIndex) => (
            <td
              key={cellIndex}
              className="px-4 py-5"
            >
              <div className="h-3 animate-pulse bg-[var(--df-paper)]" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

function MobileSkeleton() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="border border-[var(--df-line)] bg-[var(--df-paper-2)] p-4"
        >
          <div className="h-10 animate-pulse bg-[var(--df-paper)]" />
          <div className="mt-4 h-20 animate-pulse bg-[var(--df-paper)]" />
        </div>
      ))}
    </>
  );
}

function PageSkeleton() {
  return (
    <main className="min-h-screen bg-[var(--df-paper)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="h-8 w-64 animate-pulse bg-[var(--df-paper-2)]" />
        <div className="mt-3 h-4 w-96 max-w-full animate-pulse bg-[var(--df-paper-2)]" />

        <div className="mt-8 h-20 animate-pulse bg-[var(--df-paper-2)]" />

        <div className="mt-6 h-16 animate-pulse bg-[var(--df-paper-2)]" />
      </div>
    </main>
  );
}

/*
 * Keeps the summary compact without pretending the page contains
 * the entire company's active recruiter count.
 */
function activeCountLabel(activeCount, total) {
  return `${activeCount}/${total}`;
}
