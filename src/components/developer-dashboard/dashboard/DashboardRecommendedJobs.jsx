import { formatValue } from "@/app/dashboard/developer/page";
import { ArrowUpRight } from "lucide-react";

export function DashboardRecommendedJobs({ jobs = [] }) {
    return (
        <section className="border-t border-[var(--df-line)] py-10">
            <div className="flex items-end justify-between">
                <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--df-soft)]">
                        02
                    </p>

                    <h2 className="mt-2 text-xl font-semibold tracking-[-0.035em]">
                        Recommended jobs
                    </h2>
                </div>

                <a
                    href="/dashboard/developer/jobs"
                    className="
              flex
              items-center
              gap-2
              text-xs
              font-medium
              text-[var(--df-muted)]
              hover:text-[var(--df-text)]
            "
                >
                    Browse jobs
                    <ArrowUpRight size={13} strokeWidth={1.5} />
                </a>
            </div>

            {!jobs.length ? (
                <div className="mt-7 border-y border-dashed border-[var(--df-line)] py-8">
                    <p className="text-sm text-[var(--df-muted)]">
                        No matching jobs found right now.
                    </p>
                </div>
            ) : (
                <div className="mt-7 divide-y divide-[var(--df-line)] border-y border-[var(--df-line)]">
                    {jobs.map((job) => (
                        <a
                            key={job.id}
                            href={`/dashboard/developer/jobs/${job.id}`}
                            className="
                  group
                  block
                  py-6
                  transition-colors
                  hover:bg-[var(--df-paper-2)]
                  sm:px-3
                "
                        >
                            <div className="flex items-start justify-between gap-5">
                                <div className="min-w-0">
                                    <h3 className="truncate text-base font-semibold tracking-[-0.025em]">
                                        {job.title}
                                    </h3>

                                    <p className="mt-1 text-xs text-[var(--df-muted)]">
                                        {job.company?.name || "Company"}
                                    </p>
                                </div>

                                {job.matchScore !== undefined && (
                                    <span className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--df-muted)]">
                                        {job.matchScore}% match
                                    </span>
                                )}
                            </div>

                            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-[11px] text-[var(--df-muted)]">
                                {job.locationPreference && (
                                    <span>{formatValue(job.locationPreference)}</span>
                                )}

                                {job.experienceLevel && (
                                    <span>{formatValue(job.experienceLevel)}</span>
                                )}

                                {job.employmentType && (
                                    <span>{formatValue(job.employmentType)}</span>
                                )}
                            </div>

                            <div className="mt-4 flex items-center justify-between">
                                <span className="text-[10px] text-[var(--df-soft)]">
                                    {job.matchedSkillCount || 0} matching skills
                                </span>

                                <ArrowUpRight
                                    size={14}
                                    strokeWidth={1.5}
                                    className="
                      text-[var(--df-muted)]
                      transition-transform
                      group-hover:translate-x-0.5
                      group-hover:-translate-y-0.5
                    "
                                />
                            </div>
                        </a>
                    ))}
                </div>
            )}
        </section>
    );
}