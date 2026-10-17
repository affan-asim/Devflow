import {
    ArrowLeft,
    ArrowUpRight,
    BriefcaseBusiness,
    Building2,
    CalendarDays,
    MapPin,
    Users,
  } from "lucide-react";

import { formatDate, formatEmployment, formatExperience, formatLocation, formatSalary, formatText, JobDescription, JobMeta, SectionLabel } from "./SectionLabel";
import { motion } from "framer-motion";

export function JobContent({ job }) {
    const companyName = job.company?.name || "Company";

    return (
        <section>
            <div className="mx-auto grid max-w-[1320px] lg:grid-cols-[1fr_340px]">
                {/* Main */}
                <div className="px-5 py-16 sm:px-8 lg:border-r lg:border-[var(--df-line)] lg:px-12 lg:py-20">
                    <article>
                        <SectionLabel number="01" title="About the role" />

                        <div className="mt-8 max-w-3xl text-[15px] leading-8 text-[var(--df-muted)]">
                            <JobDescription description={job.description} />
                        </div>
                    </article>

                    {job.skills?.length > 0 && (
                        <article className="mt-20 border-t border-[var(--df-line)] pt-12">
                            <SectionLabel number="02" title="Skills & technologies" />

                            <div className="mt-7 flex flex-wrap gap-2">
                                {job.skills.map((skill) => (
                                    <span
                                        key={skill.id || skill.name}
                                        className="border border-[var(--df-line)] px-4 py-2 text-xs font-medium text-[var(--df-text)]"
                                    >
                                        {skill.name}
                                    </span>
                                ))}
                            </div>
                        </article>
                    )}

                    <article className="mt-20 border-t border-[var(--df-line)] pt-12">
                        <SectionLabel number="03" title="About the company" />

                        <div className="mt-8">
                            <div className="flex items-center gap-4">
                                <div className="flex h-14 w-14 items-center justify-center border border-[var(--df-line)] bg-[var(--df-paper-2)]">
                                    {job.company?.logo ? (
                                        <img
                                            src={job.company.logo}
                                            alt={companyName}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <Building2
                                            size={20}
                                            className="text-[var(--df-muted)]"
                                        />
                                    )}
                                </div>

                                <div>
                                    <h2 className="text-lg font-semibold tracking-[-0.03em]">
                                        {companyName}
                                    </h2>

                                    {job.company?.industry && (
                                        <p className="mt-1 text-xs text-[var(--df-muted)]">
                                            {formatText(job.company.industry)}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {job.company?.description && (
                                <p className="mt-6 max-w-2xl text-sm leading-7 text-[var(--df-muted)]">
                                    {job.company.description}
                                </p>
                            )}

                            {job.company?.websiteUrl && (
                                <a
                                    href={job.company.websiteUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="mt-6 inline-flex items-center gap-2 text-xs font-semibold text-[var(--df-text)] underline underline-offset-4"
                                >
                                    Visit company website
                                    <ArrowUpRight size={13} />
                                </a>
                            )}
                        </div>
                    </article>
                </div>

                {/* Sidebar */}
                <aside className="border-t border-[var(--df-line)] lg:border-t-0">
                    <div className="sticky top-0 p-5 sm:p-8 lg:p-10">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--df-muted)]">
                            Job information
                        </p>

                        <div className="mt-7">
                            <JobMeta
                                icon={MapPin}
                                label="Location"
                                value={formatLocation(job.locationPreference)}
                            />

                            <JobMeta
                                icon={BriefcaseBusiness}
                                label="Employment"
                                value={formatEmployment(job.employmentType)}
                            />

                            <JobMeta
                                icon={Users}
                                label="Experience"
                                value={formatExperience(job.experienceLevel)}
                            />

                            <JobMeta
                                icon={CalendarDays}
                                label="Posted"
                                value={formatDate(job.createdAt)}
                            />
                        </div>

                        <div className="mt-8 border-t border-[var(--df-line)] pt-7">
                            <p className="text-[10px] uppercase tracking-[0.15em] text-[var(--df-soft)]">
                                Compensation
                            </p>

                            <p className="mt-2 text-lg font-semibold tracking-[-0.03em]">
                                {formatSalary(job)}
                            </p>
                        </div>

                        <div className="mt-8 border-t border-[var(--df-line)] pt-7">
                            <p className="text-[10px] uppercase tracking-[0.15em] text-[var(--df-soft)]">
                                Published
                            </p>

                            <p className="mt-2 text-sm text-[var(--df-muted)]">
                                {formatDate(job.publishedAt || job.createdAt)}
                            </p>
                        </div>
                    </div>
                </aside>
            </div>
        </section>
    );
}