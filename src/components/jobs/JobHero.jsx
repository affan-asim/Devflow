import Link from "next/link";
import {
    ArrowLeft,
    ArrowUpRight,
    BriefcaseBusiness,
    Building2,
    CalendarDays,
    MapPin,
    Users,
  } from "lucide-react";
import { formatEmployment, formatLocation } from "./SectionLabel";
import { motion } from "framer-motion";

export function JobHero({ job }) {
    const companyName = job.company?.name || "Company";

    return (
        <section className="border-b border-[var(--df-line)]">
            <div className="mx-auto max-w-[1320px] px-5 py-16 sm:px-8 lg:py-24">
                <Link
                    href="/jobs"
                    className="group inline-flex items-center gap-2 text-xs font-medium text-[var(--df-muted)] transition hover:text-[var(--df-text)]"
                >
                    <ArrowLeft
                        size={14}
                        className="transition-transform group-hover:-translate-x-1"
                    />
                    All opportunities
                </Link>

                <div className="mt-14 grid gap-12 lg:grid-cols-[1fr_auto] lg:items-end">
                    <motion.div
                        initial={{ opacity: 0, y: 25 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.65 }}
                    >
                        <div className="flex flex-wrap gap-2">
                            {job.isFeatured && (
                                <span className="bg-[var(--df-accent)] px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.15em] text-[var(--df-black)]">
                                    Featured
                                </span>
                            )}

                            <span className="border border-[var(--df-line)] px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.15em] text-[var(--df-muted)]">
                                {job.status}
                            </span>
                        </div>

                        <h1 className="mt-6 max-w-5xl text-5xl font-semibold leading-[0.88] tracking-[-0.06em] sm:text-6xl lg:text-8xl">
                            {job.title}
                        </h1>

                        <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-[var(--df-muted)]">
                            <span className="font-medium text-[var(--df-text)]">
                                {companyName}
                            </span>

                            {job.locationPreference && (
                                <span className="inline-flex items-center gap-1.5">
                                    <MapPin size={14} />
                                    {formatLocation(job.locationPreference)}
                                </span>
                            )}

                            {job.employmentType && (
                                <span className="inline-flex items-center gap-1.5">
                                    <BriefcaseBusiness size={14} />
                                    {formatEmployment(job.employmentType)}
                                </span>
                            )}
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.15 }}
                        className="lg:min-w-[250px]"
                    >
                        {/* UI only for now */}
                        <button
                            type="button"
                            className="group flex h-14 w-full items-center justify-center gap-3 bg-[var(--df-text)] px-7 text-sm font-semibold text-[var(--df-paper)] transition hover:opacity-90"
                        >
                            Apply for this position
                            <ArrowUpRight
                                size={16}
                                className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1"
                            />
                        </button>

                        <p className="mt-3 text-center text-[10px] uppercase tracking-[0.15em] text-[var(--df-soft)]">
                            Application requires a DevFlow account
                        </p>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}