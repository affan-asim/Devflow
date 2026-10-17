"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowLeft,
  BriefcaseBusiness,
  CalendarDays,
  ExternalLink,
  Mail,
  MapPin,
  UserRound,
} from "lucide-react";

import {
  fetchDeveloperProfile,
} from "@/lib/redux/slices/developerSlice";
import { FiGithub } from "react-icons/fi";

function formatDate(value) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function formatExperience(years) {
  if (years === null || years === undefined) {
    return "—";
  }

  return `${years} ${years === 1 ? "year" : "years"}`;
}

function locationLabel(value) {
  if (!value) return "Not specified";

  return value
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function EmployeeDetailPage() {
  const { userId } = useParams();
  const router = useRouter();
  const dispatch = useDispatch();

  const {
    currentDeveloper,
    loadingDetail,
    errorDetail,
  } = useSelector((state) => state.developers);

  useEffect(() => {
    if (userId) {
      dispatch(fetchDeveloperProfile(userId));
    }
  }, [dispatch, userId]);

  if (loadingDetail) {
    return (
      <main className="min-h-screen bg-[var(--df-paper)]">
        <div className="mx-auto max-w-[1200px] px-4 py-10">
          <div className="h-6 w-40 animate-pulse bg-black/5" />
          <div className="mt-8 h-56 animate-pulse border border-[var(--df-line)]" />
          <div className="mt-4 h-72 animate-pulse border border-[var(--df-line)]" />
        </div>
      </main>
    );
  }

  if (errorDetail || !currentDeveloper) {
    return (
      <main className="min-h-screen bg-[var(--df-paper)]">
        <div className="mx-auto max-w-[1000px] px-4 py-20 text-center">
          <p className="font-medium">
            {errorDetail ||
              "Developer profile not found."}
          </p>

          <button
            type="button"
            onClick={() =>
              router.push(
                "/dashboard/recruiter/employees"
              )
            }
            className="mt-4 text-sm underline"
          >
            Back to employees
          </button>
        </div>
      </main>
    );
  }

  const user = currentDeveloper.user;

  const currentEmployment =
    currentDeveloper.employmentHistory?.find(
      (employment) => employment.isCurrent
    );

  return (
    <main className="min-h-screen bg-[var(--df-paper)] text-[var(--df-text)]">
      <div className="mx-auto max-w-[1200px] px-4 py-6 sm:px-6 lg:px-8 lg:py-10">

        {/* Back */}
        <button
          type="button"
          onClick={() =>
            router.push(
              "/dashboard/recruiter/employees"
            )
          }
          className="mb-7 inline-flex items-center gap-2 text-sm text-[var(--df-muted)] hover:text-[var(--df-text)]"
        >
          <ArrowLeft size={16} />
          Employee management
        </button>

        {/* Profile header */}
        <section className="border-b border-[var(--df-line)] pb-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">

            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center border border-[var(--df-line)] text-lg font-semibold">
                {(user?.name || "U")
                  .split(/\s+/)
                  .slice(0, 2)
                  .map((part) => part[0])
                  .join("")
                  .toUpperCase()}
              </div>

              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--df-muted)]">
                  Company employee
                </p>

                <h1 className="text-3xl font-semibold tracking-[-0.035em]">
                  {user?.name || "Unnamed developer"}
                </h1>

                {currentDeveloper.jobTitle && (
                  <p className="mt-2 text-sm text-[var(--df-muted)]">
                    {currentDeveloper.jobTitle}
                  </p>
                )}

                {user?.email && (
                  <div className="mt-3 flex items-center gap-2 text-sm text-[var(--df-muted)]">
                    <Mail size={15} />
                    {user.email}
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {currentDeveloper.githubUrl && (
                <a
                  href={currentDeveloper.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 border border-[var(--df-line)] px-3 py-2 text-sm"
                >
                  <FiGithub size={15} />
                  GitHub
                  <ExternalLink size={13} />
                </a>
              )}

              {currentDeveloper.portfolioUrl && (
                <a
                  href={currentDeveloper.portfolioUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 border border-[var(--df-line)] px-3 py-2 text-sm"
                >
                  Portfolio
                  <ExternalLink size={13} />
                </a>
              )}
            </div>
          </div>
        </section>

        {/* Overview */}
        <section className="mt-8 grid gap-px border border-[var(--df-line)] bg-[var(--df-line)] sm:grid-cols-2 lg:grid-cols-4">
          <Info
            icon={<BriefcaseBusiness size={16} />}
            label="Experience"
            value={formatExperience(
              currentDeveloper.yearsOfExp
            )}
          />

          <Info
            icon={<MapPin size={16} />}
            label="Work preference"
            value={locationLabel(
              currentDeveloper.locationPreference
            )}
          />

          <Info
            icon={<UserRound size={16} />}
            label="Account"
            value={
              user?.isActive
                ? "Active"
                : "Inactive"
            }
          />

          <Info
            icon={<CalendarDays size={16} />}
            label="Member since"
            value={formatDate(user?.createdAt)}
          />
        </section>

        {/* Bio */}
        <section className="mt-8 border border-[var(--df-line)]">
          <div className="border-b border-[var(--df-line)] px-5 py-4">
            <h2 className="font-semibold">
              About the developer
            </h2>
          </div>

          <div className="p-5">
            <p className="text-sm leading-7 text-[var(--df-muted)]">
              {currentDeveloper.bio ||
                "No professional bio has been provided."}
            </p>
          </div>
        </section>

        {/* Skills */}
        <section className="mt-8 border border-[var(--df-line)]">
          <div className="border-b border-[var(--df-line)] px-5 py-4">
            <h2 className="font-semibold">
              Skills
            </h2>
          </div>

          <div className="p-5">
            {currentDeveloper.skills?.length ? (
              <div className="flex flex-wrap gap-2">
                {currentDeveloper.skills.map((skill) => (
                  <div
                    key={skill.id}
                    className="border border-[var(--df-line)] px-3 py-2"
                  >
                    <p className="text-sm font-medium">
                      {skill.name}
                    </p>

                    {skill.category && (
                      <p className="mt-0.5 text-[11px] text-[var(--df-muted)]">
                        {skill.category}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[var(--df-muted)]">
                No skills listed.
              </p>
            )}
          </div>
        </section>

        {/* Current employment */}
        <section className="mt-8 border border-[var(--df-line)]">
          <div className="border-b border-[var(--df-line)] px-5 py-4">
            <h2 className="font-semibold">
              Current employment
            </h2>
          </div>

          {currentEmployment ? (
            <div className="grid gap-px bg-[var(--df-line)] sm:grid-cols-2 lg:grid-cols-4">
              <Info
                label="Role"
                value={currentEmployment.roleTitle}
              />

              <Info
                label="Employment type"
                value={currentEmployment.employmentType}
              />

              <Info
                label="Started"
                value={formatDate(
                  currentEmployment.startDate
                )}
              />

              <Info
                label="Company"
                value={
                  currentEmployment.company?.name ||
                  "Current company"
                }
              />
            </div>
          ) : (
            <div className="p-5 text-sm text-[var(--df-muted)]">
              No current employment record found.
            </div>
          )}
        </section>

        {/* Employment history */}
        <section className="mt-8">
          <div className="mb-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--df-muted)]">
              Career record
            </p>

            <h2 className="mt-1 text-2xl font-semibold">
              Employment history
            </h2>
          </div>

          {!currentDeveloper.employmentHistory?.length ? (
            <div className="border border-[var(--df-line)] p-8 text-center text-sm text-[var(--df-muted)]">
              No employment history available.
            </div>
          ) : (
            <div className="relative border-l border-[var(--df-line)]">
              {currentDeveloper.employmentHistory.map(
                (employment) => (
                  <article
                    key={employment.id}
                    className="relative ml-6 pb-8 last:pb-0"
                  >
                    <span className="absolute -left-[31px] top-1.5 h-2.5 w-2.5 rounded-full border border-[var(--df-text)] bg-[var(--df-paper)]" />

                    <div className="border border-[var(--df-line)] p-5">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <h3 className="font-semibold">
                            {employment.roleTitle ||
                              "Developer"}
                          </h3>

                          <p className="mt-1 text-sm text-[var(--df-muted)]">
                            {employment.company?.name ||
                              "Company"}
                          </p>
                        </div>

                        {employment.isCurrent && (
                          <span className="border border-[var(--df-line)] px-2 py-1 text-xs">
                            Current
                          </span>
                        )}
                      </div>

                      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-[var(--df-muted)]">
                        <span>
                          {formatDate(
                            employment.startDate
                          )}
                        </span>

                        <span>—</span>

                        <span>
                          {employment.endDate
                            ? formatDate(
                                employment.endDate
                              )
                            : "Present"}
                        </span>

                        {employment.employmentType && (
                          <span>
                            {employment.employmentType}
                          </span>
                        )}
                      </div>

                      {employment.description && (
                        <p className="mt-4 text-sm leading-6 text-[var(--df-muted)]">
                          {employment.description}
                        </p>
                      )}

                      {employment.hiredByRecruiter?.user
                        ?.name && (
                        <p className="mt-4 text-xs text-[var(--df-muted)]">
                          Hired by{" "}
                          <span className="font-medium text-[var(--df-text)]">
                            {
                              employment
                                .hiredByRecruiter.user
                                .name
                            }
                          </span>
                        </p>
                      )}
                    </div>
                  </article>
                )
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function Info({ icon, label, value }) {
  return (
    <div className="bg-[var(--df-paper)] p-5">
      {icon && (
        <div className="mb-3 text-[var(--df-muted)]">
          {icon}
        </div>
      )}

      <p className="text-xs font-semibold uppercase tracking-wider text-[var(--df-muted)]">
        {label}
      </p>

      <p className="mt-2 text-sm font-medium">
        {value || "—"}
      </p>
    </div>
  );
}