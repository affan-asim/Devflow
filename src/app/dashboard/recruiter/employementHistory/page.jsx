"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
    ArrowDown,
    ArrowUp,
    BriefcaseBusiness,
    ChevronLeft,
    ChevronRight,
    CircleAlert,
    Clock3,
    ExternalLink,
    Filter,
    Mail,
    Search,
    SlidersHorizontal,
    UserRound,
    X,
} from "lucide-react";

import {
    fetchRecruiterEmploymentHistory,
} from "@/lib/redux/slices/employmentHistorySlice";

const EMPLOYMENT_TYPES = [
    "FULLTIME",
    "PARTTIME",
    "CONTRACT",
    "INTERN",
];

const SORT_OPTIONS = [
    {
        value: "",
        label: "Latest activity",
    },
    {
        value: "startDate",
        label: "Oldest start date",
    },
    {
        value: "salary",
        label: "Highest salary",
    },
    {
        value: "endDate",
        label: "Recent end date",
    },
];

function formatDate(date) {
    if (!date) return "—";

    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    }).format(new Date(date));
}

function getInitials(name = "") {
    return (
        name
            .split(" ")
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => part[0]?.toUpperCase())
            .join("") || "?"
    );
}

function formatEmploymentType(type) {
    if (!type) return "—";

    return type
        .toLowerCase()
        .replaceAll("_", " ")
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getDuration(startDate, endDate, isCurrent) {
    if (!startDate) return "—";

    const start = new Date(startDate);
    const end = isCurrent
        ? new Date()
        : endDate
        ? new Date(endDate)
        : null;

    if (!end || end < start) return "—";

    const months =
        (end.getFullYear() - start.getFullYear()) * 12 +
        (end.getMonth() - start.getMonth());

    if (months < 1) return "< 1 month";

    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;

    if (years === 0) {
        return `${remainingMonths} ${
            remainingMonths === 1 ? "month" : "months"
        }`;
    }

    if (remainingMonths === 0) {
        return `${years} ${years === 1 ? "year" : "years"}`;
    }

    return `${years}y ${remainingMonths}m`;
}

function StatusBadge({ current, events = [] }) {
    const pendingResignation = events.some(
        (event) =>
            event.type === "RESIGN" &&
            event.status === "PENDING"
    );

    if (pendingResignation) {
        return (
            <span className="inline-flex items-center gap-1.5 border border-amber-300 bg-amber-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-amber-800">
                <Clock3 className="h-3 w-3" />
                Resignation pending
            </span>
        );
    }

    if (current) {
        return (
            <span className="inline-flex items-center border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-emerald-800">
                Current employee
            </span>
        );
    }

    return (
        <span className="inline-flex items-center border border-[var(--df-line)] bg-[var(--df-paper)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--df-muted)]">
            Employment ended
        </span>
    );
}

function SkeletonRow() {
    return (
        <div className="animate-pulse border-b border-[var(--df-line)] px-5 py-5">
            <div className="flex gap-4">
                <div className="h-11 w-11 shrink-0 bg-black/10" />

                <div className="min-w-0 flex-1 space-y-3">
                    <div className="h-4 w-40 bg-black/10" />
                    <div className="h-3 w-56 bg-black/10" />
                    <div className="h-3 w-32 bg-black/10" />
                </div>

                <div className="hidden h-6 w-24 bg-black/10 sm:block" />
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

    const {
        currentPage,
        totalPages,
        hasNextPage,
        hasPreviousPage,
    } = metadata;

    const pages = [];

    const start = Math.max(1, currentPage - 2);
    const end = Math.min(totalPages, currentPage + 2);

    for (let page = start; page <= end; page++) {
        pages.push(page);
    }

    return (
        <div className="flex flex-col gap-4 border-t border-[var(--df-line)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-[var(--df-muted)]">
                Page {currentPage} of {totalPages}
            </p>

            <div className="flex items-center gap-1">
                <button
                    type="button"
                    disabled={!hasPreviousPage}
                    onClick={() =>
                        onPageChange(currentPage - 1)
                    }
                    className="inline-flex h-9 w-9 items-center justify-center border border-[var(--df-line)] transition hover:border-[var(--df-text)] disabled:cursor-not-allowed disabled:opacity-30"
                >
                    <ChevronLeft className="h-4 w-4" />
                </button>

                {start > 1 && (
                    <>
                        <button
                            type="button"
                            onClick={() => onPageChange(1)}
                            className="h-9 min-w-9 border border-[var(--df-line)] px-2 text-xs font-semibold"
                        >
                            1
                        </button>

                        {start > 2 && (
                            <span className="px-1 text-xs text-[var(--df-muted)]">
                                ...
                            </span>
                        )}
                    </>
                )}

                {pages.map((page) => (
                    <button
                        key={page}
                        type="button"
                        onClick={() => onPageChange(page)}
                        className={`h-9 min-w-9 border px-2 text-xs font-semibold transition ${
                            page === currentPage
                                ? "border-[var(--df-text)] bg-[var(--df-text)] text-[var(--df-paper)]"
                                : "border-[var(--df-line)] hover:border-[var(--df-text)]"
                        }`}
                    >
                        {page}
                    </button>
                ))}

                {end < totalPages && (
                    <>
                        {end < totalPages - 1 && (
                            <span className="px-1 text-xs text-[var(--df-muted)]">
                                ...
                            </span>
                        )}

                        <button
                            type="button"
                            onClick={() =>
                                onPageChange(totalPages)
                            }
                            className="h-9 min-w-9 border border-[var(--df-line)] px-2 text-xs font-semibold"
                        >
                            {totalPages}
                        </button>
                    </>
                )}

                <button
                    type="button"
                    disabled={!hasNextPage}
                    onClick={() =>
                        onPageChange(currentPage + 1)
                    }
                    className="inline-flex h-9 w-9 items-center justify-center border border-[var(--df-line)] transition hover:border-[var(--df-text)] disabled:cursor-not-allowed disabled:opacity-30"
                >
                    <ChevronRight className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}

export default function EmploymentHistoryPage() {
    const dispatch = useDispatch();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const {
        employments,
        metadata,
        loadingList,
        errorList,
    } = useSelector(
        (state) => state.employmentHistory
    );

    const [searchInput, setSearchInput] = useState(
        searchParams.get("search") || ""
    );

    const search = searchParams.get("search") || "";
    const employmentType =
        searchParams.get("employmentType") || "";
    const sort = searchParams.get("sort") || "";
    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 10);

    const updateUrl = useCallback(
        (updates = {}) => {
            const params = new URLSearchParams(
                searchParams.toString()
            );

            Object.entries(updates).forEach(
                ([key, value]) => {
                    if (
                        value === undefined ||
                        value === null ||
                        value === ""
                    ) {
                        params.delete(key);
                    } else {
                        params.set(key, String(value));
                    }
                }
            );

            router.replace(
                `${pathname}?${params.toString()}`,
                {
                    scroll: false,
                }
            );
        },
        [pathname, router, searchParams]
    );

    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchInput !== search) {
                updateUrl({
                    search: searchInput,
                    page: 1,
                });
            }
        }, 400);

        return () => clearTimeout(timer);
    }, [
        searchInput,
        search,
        updateUrl,
    ]);

    useEffect(() => {
        const params = {
            page,
            limit,
        };

        if (search) {
            params.search = search;
        }

        if (employmentType) {
            params.employmentType = employmentType;
        }

        if (sort) {
            params.sort = sort;
        }

        dispatch(
            fetchRecruiterEmploymentHistory(params)
        );
    }, [
        dispatch,
        page,
        limit,
        search,
        employmentType,
        sort,
    ]);

    const clearFilters = () => {
        setSearchInput("");

        router.replace(pathname, {
            scroll: false,
        });
    };

    const hasFilters =
        Boolean(search) ||
        Boolean(employmentType) ||
        Boolean(sort);

    const totalEmployees = metadata?.totalCount || 0;

    const currentCount = useMemo(
        () =>
            employments.filter(
                (employment) => employment.isCurrent
            ).length,
        [employments]
    );

    return (
        <main className="min-h-screen bg-[var(--df-paper)] text-[var(--df-text)]">
            <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8 lg:py-10">
                {/* Header */}
                <header className="border-b border-[var(--df-line)] pb-7">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--df-accent)]">
                                Recruiter workspace
                            </p>

                            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
                                Employment history
                            </h1>

                            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--df-muted)]">
                                View your company's employee
                                employment records, review resignation
                                requests, and manage active employment.
                            </p>
                        </div>

                        <div className="flex items-center gap-6 text-sm">
                            <div>
                                <p className="text-[10px] uppercase tracking-[0.14em] text-[var(--df-muted)]">
                                    Records
                                </p>
                                <p className="mt-1 text-xl font-semibold">
                                    {totalEmployees}
                                </p>
                            </div>

                            <div className="h-8 w-px bg-[var(--df-line)]" />

                            <div>
                                <p className="text-[10px] uppercase tracking-[0.14em] text-[var(--df-muted)]">
                                    Current
                                </p>
                                <p className="mt-1 text-xl font-semibold">
                                    {currentCount}
                                </p>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Filters */}
                <section className="border-b border-[var(--df-line)] py-5">
                    <div className="flex flex-col gap-3 lg:flex-row">
                        <div className="relative min-w-0 flex-1">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--df-muted)]" />

                            <input
                                value={searchInput}
                                onChange={(event) =>
                                    setSearchInput(
                                        event.target.value
                                    )
                                }
                                placeholder="Search role, description, or currency..."
                                className="h-11 w-full border border-[var(--df-line)] bg-transparent pl-10 pr-10 text-sm outline-none transition placeholder:text-[var(--df-muted)] focus:border-[var(--df-text)]"
                            />

                            {searchInput && (
                                <button
                                    type="button"
                                    onClick={() =>
                                        setSearchInput("")
                                    }
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--df-muted)] hover:text-[var(--df-text)]"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>

                        <div className="relative">
                            <SlidersHorizontal className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--df-muted)]" />

                            <select
                                value={employmentType}
                                onChange={(event) =>
                                    updateUrl({
                                        employmentType:
                                            event.target.value,
                                        page: 1,
                                    })
                                }
                                className="h-11 w-full appearance-none border border-[var(--df-line)] bg-[var(--df-paper)] pl-10 pr-9 text-sm outline-none focus:border-[var(--df-text)] sm:w-52"
                            >
                                <option value="">
                                    All employment types
                                </option>

                                {EMPLOYMENT_TYPES.map(
                                    (type) => (
                                        <option
                                            key={type}
                                            value={type}
                                        >
                                            {formatEmploymentType(
                                                type
                                            )}
                                        </option>
                                    )
                                )}
                            </select>
                        </div>

                        <div className="relative">
                            <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--df-muted)]" />

                            <select
                                value={sort}
                                onChange={(event) =>
                                    updateUrl({
                                        sort: event.target.value,
                                        page: 1,
                                    })
                                }
                                className="h-11 w-full appearance-none border border-[var(--df-line)] bg-[var(--df-paper)] pl-10 pr-9 text-sm outline-none focus:border-[var(--df-text)] sm:w-52"
                            >
                                {SORT_OPTIONS.map(
                                    (option) => (
                                        <option
                                            key={option.value}
                                            value={option.value}
                                        >
                                            {option.label}
                                        </option>
                                    )
                                )}
                            </select>
                        </div>

                        {hasFilters && (
                            <button
                                type="button"
                                onClick={clearFilters}
                                className="inline-flex h-11 items-center justify-center gap-2 border border-[var(--df-line)] px-4 text-sm font-medium transition hover:border-[var(--df-text)]"
                            >
                                <X className="h-4 w-4" />
                                Clear
                            </button>
                        )}
                    </div>
                </section>

                {/* Error */}
                {errorList && (
                    <div className="mt-6 flex items-start gap-3 border border-red-300 bg-red-50 p-4 text-red-800">
                        <CircleAlert className="mt-0.5 h-5 w-5 shrink-0" />

                        <div>
                            <p className="text-sm font-semibold">
                                Unable to load employment history
                            </p>

                            <p className="mt-1 text-xs leading-5">
                                {errorList}
                            </p>

                            <button
                                type="button"
                                onClick={() =>
                                    dispatch(
                                        fetchRecruiterEmploymentHistory(
                                            {
                                                page,
                                                limit,
                                                ...(search && {
                                                    search,
                                                }),
                                                ...(employmentType && {
                                                    employmentType,
                                                }),
                                                ...(sort && {
                                                    sort,
                                                }),
                                            }
                                        )
                                    )
                                }
                                className="mt-3 text-xs font-bold underline"
                            >
                                Try again
                            </button>
                        </div>
                    </div>
                )}

                {/* Desktop table */}
                <section className="mt-6 hidden overflow-hidden border border-[var(--df-line)] lg:block">
                    <div className="grid grid-cols-[minmax(280px,1.7fr)_1fr_1fr_1fr_150px] border-b border-[var(--df-line)] bg-black/[0.025] px-5 py-3">
                        <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--df-muted)]">
                            Employee
                        </div>

                        <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--df-muted)]">
                            Role
                        </div>

                        <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--df-muted)]">
                            Employment
                        </div>

                        <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--df-muted)]">
                            Status
                        </div>

                        <div />
                    </div>

                    {loadingList ? (
                        <>
                            <SkeletonRow />
                            <SkeletonRow />
                            <SkeletonRow />
                            <SkeletonRow />
                        </>
                    ) : employments.length === 0 ? (
                        <EmptyState hasFilters={hasFilters} />
                    ) : (
                        employments.map((employment) => {
                            const employee =
                                employment.developer;

                            const user = employee?.user;

                            return (
                                <button
                                    key={employment.id}
                                    type="button"
                                    onClick={() =>
                                        router.push(
                                            `/dashboard/recruiter/employementHistory/${employment.id}`
                                        )
                                    }
                                    className="group grid w-full grid-cols-[minmax(280px,1.7fr)_1fr_1fr_1fr_150px] items-center border-b border-[var(--df-line)] px-5 py-5 text-left transition last:border-b-0 hover:bg-black/[0.025]"
                                >
                                    <div className="flex min-w-0 items-center gap-3">
                                        <div className="flex h-11 w-11 shrink-0 items-center justify-center bg-[var(--df-text)] text-xs font-bold text-[var(--df-paper)]">
                                            {getInitials(
                                                user?.name
                                            )}
                                        </div>

                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-semibold">
                                                {user?.name ||
                                                    "Unnamed employee"}
                                            </p>

                                            <p className="mt-1 flex items-center gap-1.5 truncate text-xs text-[var(--df-muted)]">
                                                <Mail className="h-3 w-3" />
                                                {user?.email ||
                                                    "No email"}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-medium">
                                            {employment.roleTitle ||
                                                "No role"}
                                        </p>

                                        <p className="mt-1 text-xs text-[var(--df-muted)]">
                                            {formatEmploymentType(
                                                employment.employmentType
                                            )}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-sm">
                                            {formatDate(
                                                employment.startDate
                                            )}
                                        </p>

                                        <p className="mt-1 text-xs text-[var(--df-muted)]">
                                            {employment.isCurrent
                                                ? "Present"
                                                : formatDate(
                                                      employment.endDate
                                                  )}
                                        </p>
                                    </div>

                                    <div>
                                        <StatusBadge
                                            current={
                                                employment.isCurrent
                                            }
                                            events={
                                                employment.employmentEvents ||
                                                []
                                            }
                                        />
                                    </div>

                                    <div className="flex justify-end">
                                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--df-muted)] transition group-hover:text-[var(--df-text)]">
                                            View
                                            <ExternalLink className="h-3.5 w-3.5" />
                                        </span>
                                    </div>
                                </button>
                            );
                        })
                    )}

                    {!loadingList &&
                        employments.length > 0 && (
                            <Pagination
                                metadata={metadata}
                                onPageChange={(nextPage) =>
                                    updateUrl({
                                        page: nextPage,
                                    })
                                }
                            />
                        )}
                </section>

                {/* Mobile cards */}
                <section className="mt-6 space-y-3 lg:hidden">
                    {loadingList ? (
                        <>
                            <div className="border border-[var(--df-line)]">
                                <SkeletonRow />
                            </div>

                            <div className="border border-[var(--df-line)]">
                                <SkeletonRow />
                            </div>

                            <div className="border border-[var(--df-line)]">
                                <SkeletonRow />
                            </div>
                        </>
                    ) : employments.length === 0 ? (
                        <EmptyState hasFilters={hasFilters} />
                    ) : (
                        employments.map((employment) => {
                            const employee =
                                employment.developer;

                            const user = employee?.user;

                            return (
                                <button
                                    key={employment.id}
                                    type="button"
                                    onClick={() =>
                                        router.push(
                                            `/dashboard/recruiter/employees/${employee?.userId}/employment/${employment.id}`
                                        )
                                    }
                                    className="block w-full border border-[var(--df-line)] p-4 text-left transition active:bg-black/[0.025]"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex min-w-0 gap-3">
                                            <div className="flex h-11 w-11 shrink-0 items-center justify-center bg-[var(--df-text)] text-xs font-bold text-[var(--df-paper)]">
                                                {getInitials(
                                                    user?.name
                                                )}
                                            </div>

                                            <div className="min-w-0">
                                                <h3 className="truncate text-sm font-semibold">
                                                    {user?.name ||
                                                        "Unnamed employee"}
                                                </h3>

                                                <p className="mt-1 truncate text-xs text-[var(--df-muted)]">
                                                    {user?.email ||
                                                        "No email"}
                                                </p>
                                            </div>
                                        </div>

                                        <ChevronRight className="h-4 w-4 shrink-0 text-[var(--df-muted)]" />
                                    </div>

                                    <div className="mt-5 grid grid-cols-2 gap-4 border-t border-[var(--df-line)] pt-4">
                                        <div>
                                            <p className="text-[10px] uppercase tracking-[0.12em] text-[var(--df-muted)]">
                                                Role
                                            </p>

                                            <p className="mt-1 truncate text-sm font-medium">
                                                {employment.roleTitle ||
                                                    "No role"}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-[10px] uppercase tracking-[0.12em] text-[var(--df-muted)]">
                                                Type
                                            </p>

                                            <p className="mt-1 truncate text-sm font-medium">
                                                {formatEmploymentType(
                                                    employment.employmentType
                                                )}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-[10px] uppercase tracking-[0.12em] text-[var(--df-muted)]">
                                                Started
                                            </p>

                                            <p className="mt-1 text-sm font-medium">
                                                {formatDate(
                                                    employment.startDate
                                                )}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-[10px] uppercase tracking-[0.12em] text-[var(--df-muted)]">
                                                Duration
                                            </p>

                                            <p className="mt-1 text-sm font-medium">
                                                {getDuration(
                                                    employment.startDate,
                                                    employment.endDate,
                                                    employment.isCurrent
                                                )}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-4">
                                        <StatusBadge
                                            current={
                                                employment.isCurrent
                                            }
                                            events={
                                                employment.employmentEvents ||
                                                []
                                            }
                                        />
                                    </div>
                                </button>
                            );
                        })
                    )}

                    {!loadingList &&
                        employments.length > 0 && (
                            <div className="border border-[var(--df-line)]">
                                <Pagination
                                    metadata={metadata}
                                    onPageChange={(nextPage) =>
                                        updateUrl({
                                            page: nextPage,
                                        })
                                    }
                                />
                            </div>
                        )}
                </section>
            </div>
        </main>
    );
}

function EmptyState({ hasFilters }) {
    return (
        <div className="border border-dashed border-[var(--df-line)] px-6 py-16 text-center">
            <div className="mx-auto flex h-11 w-11 items-center justify-center bg-black/[0.04]">
                {hasFilters ? (
                    <Search className="h-5 w-5 text-[var(--df-muted)]" />
                ) : (
                    <BriefcaseBusiness className="h-5 w-5 text-[var(--df-muted)]" />
                )}
            </div>

            <h3 className="mt-4 text-sm font-semibold">
                {hasFilters
                    ? "No employment records found"
                    : "No employment records yet"}
            </h3>

            <p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-[var(--df-muted)]">
                {hasFilters
                    ? "Try changing your search or filters."
                    : "Employees and their employment records will appear here."}
            </p>
        </div>
    );
}
