"use client";

import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import {
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  MapPin,
  BriefcaseBusiness,
  X,
  Users,
} from "lucide-react";

import { fetchDevelopers } from "@/lib/redux/slices/developerSlice";
import { fetchSkills } from "@/lib/redux/slices/skillSlice";

const PAGE_SIZE = 10;

const LOCATION_OPTIONS = [
  { value: "", label: "All work preferences" },
  { value: "REMOTE", label: "Remote" },
  { value: "HYBRID", label: "Hybrid" },
  { value: "ONSITE", label: "On-site" },
];

const SORT_OPTIONS = [
  { value: "", label: "Most experienced" },
  { value: "exp_desc", label: "Experience: high → low" },
  { value: "exp_asc", label: "Experience: low → high" },
];

function formatExperience(years) {
  if (years === null || years === undefined) {
    return "—";
  }

  return `${years} ${years === 1 ? "year" : "years"}`;
}

function getInitials(name = "") {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "U"
  );
}

function getLocationLabel(value) {
  const found = LOCATION_OPTIONS.find(
    (option) => option.value === value
  );

  return found?.label || value || "Not specified";
}

export default function EmployeeManagementPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const {
    developers,
    metadata,
    loadingList,
    errorList,
  } = useSelector((state) => state.developers);

  const {
    user
  } = useSelector((state) => state.auth);
  const { skills: availableSkills = [], loadingList: loadingSkills, errorList: skillsError } = useSelector((state) => state.skills || {});

  const [searchInput, setSearchInput] = useState(
    searchParams.get("bio") || ""
  );

  const bio = searchParams.get("bio") || "";
  const locationPreference =
    searchParams.get("locationPreference") || "";
  const minExp = searchParams.get("minExp") || "";
  const maxExp = searchParams.get("maxExp") || "";
  const selectedSkillIds = searchParams.getAll("skills");
  const sort = searchParams.get("sort") || "";
  const page = Number(searchParams.get("page") || 1);

  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    dispatch(fetchSkills({ limit: 100, sort: "name" }));
  }, [dispatch]);

  const updateParams = useCallback(
    (updates) => {
      const params = new URLSearchParams(
        searchParams.toString()
      );

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

      const query = params.toString();

      router.push(
        query ? `${pathname}?${query}` : pathname
      );
    },
    [pathname, router, searchParams]
  );

  useEffect(() => {
    const timeout = setTimeout(() => {
      const trimmed = searchInput.trim();

      if (trimmed !== bio) {
        updateParams({
          bio: trimmed,
          page: 1,
        });
      }
    }, 400);

    return () => clearTimeout(timeout);
  }, [searchInput, bio, updateParams]);

  useEffect(() => {
    const selectedSkills = selectedSkillIds
      .map((id) => availableSkills.find((skill) => skill.id === id)?.name)
      .filter(Boolean);

    dispatch(
      fetchDevelopers({
        bio,
        locationPreference,
        minExp,
        maxExp,
        ...(selectedSkills.length > 0 && { skills: selectedSkills.join(",") }),
        sort,
        page,
        limit: PAGE_SIZE,
        companyId: user?.recruiterProfile?.companyId
      })
    );
  }, [
    dispatch,
    bio,
    locationPreference,
    minExp,
    maxExp,
    selectedSkillIds.join(","),
    availableSkills,
    sort,
    page,
    user?.recruiterProfile
  ]);

  const hasFilters =
    Boolean(bio) ||
    Boolean(locationPreference) ||
    Boolean(minExp) ||
    Boolean(maxExp) ||
    selectedSkillIds.length > 0 ||
    Boolean(sort);

  const clearFilters = () => {
    setSearchInput("");
    router.push(pathname);
  };

  const goToPage = (nextPage) => {
    updateParams({
      page: nextPage,
    });
  };

  const updateSelectedSkills = (nextSkillIds) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("skills");
    nextSkillIds.forEach((id) => params.append("skills", id));
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  const addSelectedSkill = (skillId) => {
    if (skillId && !selectedSkillIds.includes(skillId)) {
      updateSelectedSkills([...selectedSkillIds, skillId]);
    }
  };

  return (
    <main className="min-h-screen bg-[var(--df-paper)] text-[var(--df-text)]">
      <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8 lg:py-10">

        {/* Header */}
        <header className="mb-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--df-muted)]">
                Company
              </p>

              <h1 className="text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">
                Employee management
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--df-muted)]">
                Manage developers currently employed by your company
                and review their professional profiles.
              </p>
            </div>

            <div className="flex items-center gap-2 text-sm text-[var(--df-muted)]">
              <Users size={16} />
              {metadata?.totalCount || 0} employees
            </div>
          </div>
        </header>

        {/* Search / filters */}
        <section className="mb-6 border-y border-[var(--df-line)] py-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">

            <div className="relative min-w-0 flex-1">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--df-muted)]"
              />

              <input
                value={searchInput}
                onChange={(event) =>
                  setSearchInput(event.target.value)
                }
                placeholder="Search by developer bio..."
                className="h-11 w-full border border-[var(--df-line)] bg-transparent pl-10 pr-4 text-sm outline-none transition focus:border-[var(--df-text)]"
              />
            </div>

            <button
              type="button"
              onClick={() =>
                setShowFilters((value) => !value)
              }
              className={`inline-flex h-11 items-center justify-center gap-2 border px-4 text-sm ${
                showFilters
                  ? "border-[var(--df-text)]"
                  : "border-[var(--df-line)]"
              }`}
            >
              <SlidersHorizontal size={16} />
              Filters
            </button>

            <div className="flex items-center gap-2">
              <ArrowUpDown
                size={16}
                className="text-[var(--df-muted)]"
              />

              <select
                value={sort}
                onChange={(event) =>
                  updateParams({
                    sort: event.target.value,
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

          {showFilters && (
            <div className="mt-4 grid gap-3 border-t border-[var(--df-line)] pt-4 sm:grid-cols-2 lg:grid-cols-4">

              <label>
                <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[var(--df-muted)]">
                  Work preference
                </span>

                <select
                  value={locationPreference}
                  onChange={(event) =>
                    updateParams({
                      locationPreference:
                        event.target.value,
                    })
                  }
                  className="h-11 w-full border border-[var(--df-line)] bg-[var(--df-paper)] px-3 text-sm outline-none"
                >
                  {LOCATION_OPTIONS.map((option) => (
                    <option
                      key={option.value}
                      value={option.value}
                    >
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[var(--df-muted)]">
                  Minimum experience
                </span>

                <input
                  type="number"
                  min="0"
                  value={minExp}
                  onChange={(event) =>
                    updateParams({
                      minExp: event.target.value,
                    })
                  }
                  placeholder="e.g. 2"
                  className="h-11 w-full border border-[var(--df-line)] bg-transparent px-3 text-sm outline-none focus:border-[var(--df-text)]"
                />
              </label>

              <label>
                <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[var(--df-muted)]">
                  Maximum experience
                </span>

                <input
                  type="number"
                  min="0"
                  value={maxExp}
                  onChange={(event) =>
                    updateParams({
                      maxExp: event.target.value,
                    })
                  }
                  placeholder="e.g. 10"
                  className="h-11 w-full border border-[var(--df-line)] bg-transparent px-3 text-sm outline-none focus:border-[var(--df-text)]"
                />
              </label>

              <div>
                <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[var(--df-muted)]">
                  Skills
                </span>

                <select
                  value=""
                  onChange={(event) => addSelectedSkill(event.target.value)}
                  disabled={loadingSkills}
                  aria-label="Add a skill filter"
                  className="h-11 w-full border border-[var(--df-line)] bg-[var(--df-paper)] px-3 text-sm outline-none focus:border-[var(--df-text)] disabled:opacity-60"
                >
                  <option value="">{loadingSkills ? "Loading skills..." : "Select a skill"}</option>
                  {availableSkills.map((skill) => (
                    <option key={skill.id} value={skill.id} disabled={selectedSkillIds.includes(skill.id)}>
                      {skill.name}
                    </option>
                  ))}
                </select>
                {selectedSkillIds.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {selectedSkillIds.map((id) => {
                      const skill = availableSkills.find((item) => item.id === id);
                      if (!skill) return null;
                      return (
                        <span key={id} className="inline-flex items-center gap-1.5 border border-[var(--df-line)] px-2 py-1 text-xs">
                          {skill.name}
                          <button type="button" onClick={() => updateSelectedSkills(selectedSkillIds.filter((selectedId) => selectedId !== id))} aria-label={`Remove ${skill.name}`} className="text-[var(--df-muted)] hover:text-[var(--df-text)]">
                            <X size={12} />
                          </button>
                        </span>
                      );
                    })}
                  </div>
                )}
                <p className="mt-1 text-xs text-[var(--df-muted)]">{loadingSkills ? "Loading skills…" : skillsError || "Select one or more skills"}</p>
              </div>
            </div>
          )}
        </section>

        {/* Error */}
        {errorList && (
          <div className="mb-6 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorList}
          </div>
        )}

        {/* Desktop */}
        <section className="hidden overflow-hidden border border-[var(--df-line)] lg:block">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-[var(--df-line)] bg-black/[0.02]">
                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider">
                  Developer
                </th>

                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider">
                  Experience
                </th>

                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider">
                  Work preference
                </th>

                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider">
                  Skills
                </th>

                <th className="px-5 py-4" />
              </tr>
            </thead>

            <tbody>
              {loadingList ? (
                Array.from({ length: 7 }).map((_, index) => (
                  <tr
                    key={index}
                    className="border-b border-[var(--df-line)]"
                  >
                    <td colSpan={5} className="px-5 py-6">
                      <div className="h-5 w-full animate-pulse bg-black/5" />
                    </td>
                  </tr>
                ))
              ) : developers?.length ? (
                developers.map((developer) => (
                  <tr
                    key={developer.id}
                    className="border-b border-[var(--df-line)] transition hover:bg-black/[0.018]"
                  >
                    <td className="px-5 py-5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-[var(--df-line)] text-xs font-semibold">
                          {getInitials(
                            developer.user?.name
                          )}
                        </div>

                        <div>
                          <p className="font-medium">
                            {developer.user?.name ||
                              "Unnamed developer"}
                          </p>

                          <p className="mt-1 text-xs text-[var(--df-muted)]">
                            {developer.user?.email || "—"}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-5 text-sm">
                      {formatExperience(
                        developer.yearsOfExp
                      )}
                    </td>

                    <td className="px-5 py-5">
                      <span className="inline-flex items-center gap-1.5 text-sm">
                        <MapPin size={14} />
                        {getLocationLabel(
                          developer.locationPreference
                        )}
                      </span>
                    </td>

                    <td className="max-w-[330px] px-5 py-5">
                      <div className="flex flex-wrap gap-1.5">
                        {developer.skills
                          ?.slice(0, 4)
                          .map((skill) => (
                            <span
                              key={skill.id}
                              className="border border-[var(--df-line)] px-2 py-1 text-xs"
                            >
                              {skill.name}
                            </span>
                          ))}

                        {developer.skills?.length > 4 && (
                          <span className="px-1 py-1 text-xs text-[var(--df-muted)]">
                            +{developer.skills.length - 4}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-5 py-5 text-right">
                      <button
                        type="button"
                        onClick={() =>
                          router.push(
                            `/dashboard/recruiter/employees/${developer.userId}`
                          )
                        }
                        className="inline-flex items-center gap-2 text-sm font-medium hover:underline"
                      >
                        View profile
                        <Eye size={15} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-20 text-center"
                  >
                    <Users
                      size={22}
                      className="mx-auto mb-3 text-[var(--df-muted)]"
                    />

                    <p className="font-medium">
                      No employees found
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
          {loadingList &&
            Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="h-48 animate-pulse border border-[var(--df-line)] bg-black/[0.02]"
              />
            ))}

          {!loadingList &&
            developers?.map((developer) => (
              <article
                key={developer.id}
                className="border border-[var(--df-line)] p-4"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center border border-[var(--df-line)] text-xs font-semibold">
                    {getInitials(
                      developer.user?.name
                    )}
                  </div>

                  <div className="min-w-0">
                    <h2 className="font-semibold">
                      {developer.user?.name ||
                        "Unnamed developer"}
                    </h2>

                    <p className="mt-1 truncate text-xs text-[var(--df-muted)]">
                      {developer.user?.email || "—"}
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-[var(--df-muted)]">
                      Experience
                    </p>

                    <p className="mt-1 text-sm">
                      {formatExperience(
                        developer.yearsOfExp
                      )}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-[var(--df-muted)]">
                      Preference
                    </p>

                    <p className="mt-1 text-sm">
                      {getLocationLabel(
                        developer.locationPreference
                      )}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {developer.skills
                    ?.slice(0, 5)
                    .map((skill) => (
                      <span
                        key={skill.id}
                        className="border border-[var(--df-line)] px-2 py-1 text-xs"
                      >
                        {skill.name}
                      </span>
                    ))}
                </div>

                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      `/dashboard/recruiter/employees/${developer.userId}`
                    )
                  }
                  className="mt-5 flex w-full items-center justify-center gap-2 border border-[var(--df-line)] py-2.5 text-sm font-medium"
                >
                  View profile
                  <Eye size={15} />
                </button>
              </article>
            ))}
        </section>

        {/* Pagination */}
        {!loadingList && metadata?.totalPages > 0 && (
          <footer className="mt-6 flex items-center justify-between border-t border-[var(--df-line)] pt-4">
            <p className="text-sm text-[var(--df-muted)]">
              Page {metadata.currentPage} of{" "}
              {metadata.totalPages}
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
