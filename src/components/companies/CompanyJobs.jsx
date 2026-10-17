import Link from "next/link";

import {
  ArrowUpRight,
  CalendarDays,
  Star,
} from "lucide-react";

import { motion } from "framer-motion";

import {
  formatDate,
  formatSalary,
  formatText,
} from "./CompanyHelpers";

export function CompanyJobs({ company }) {
  const jobs = (company.jobs || []).filter(
    (job) => job.status === "ACTIVE"
  );

  if (!jobs.length) {
    return (
      <div className="mt-8 border border-[var(--df-line)] p-8">
        <p className="text-sm font-medium">
          No open opportunities right now.
        </p>

        <p className="mt-2 text-sm leading-6 text-[var(--df-muted)]">
          Check back later for new positions from this company.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8 divide-y divide-[var(--df-line)] border-y border-[var(--df-line)]">

      {jobs.map((job, index) => {
        const salary = formatSalary(
          job.minSalary,
          job.maxSalary,
          job.currency
        );

        return (
          <motion.div
            key={job.id}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{
              duration: 0.4,
              delay: index * 0.04,
            }}
          >
            <Link
              href={`/jobs/${job.id}`}
              className="group block py-8"
            >
              <div className="flex flex-col gap-6">

                {/* Top */}
                <div className="flex items-start justify-between gap-5">

                  <div className="flex gap-5">

                    <span className="pt-1 text-[10px] tracking-[0.15em] text-[var(--df-soft)]">
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <div>
                      <div className="flex flex-wrap items-center gap-3">

                        <h3 className="text-xl font-semibold tracking-[-0.035em] transition group-hover:text-[var(--df-muted)] sm:text-2xl">
                          {job.title}
                        </h3>

                        {job.isFeatured && (
                          <span className="inline-flex items-center gap-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-[var(--df-soft)]">
                            <Star size={11} />
                            Featured
                          </span>
                        )}
                      </div>

                      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-[var(--df-muted)]">

                        {job.locationPreference && (
                          <span>
                            {formatText(job.locationPreference)}
                          </span>
                        )}

                        {job.employmentType && (
                          <span>
                            {formatText(job.employmentType)}
                          </span>
                        )}

                        {job.experienceLevel && (
                          <span>
                            {formatText(job.experienceLevel)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--df-line)] transition-transform group-hover:translate-x-1 group-hover:-translate-y-1">
                    <ArrowUpRight size={15} />
                  </span>
                </div>

                {/* Description */}
                {job.description && (
                  <p className="max-w-3xl pl-9 text-sm leading-6 text-[var(--df-muted)] line-clamp-2">
                    {job.description}
                  </p>
                )}

                {/* Bottom metadata */}
                <div className="flex flex-wrap items-center gap-x-7 gap-y-3 pl-9">

                  {salary && (
                    <span className="text-sm font-medium">
                      {salary}
                    </span>
                  )}

                  {job.deadline && (
                    <span className="inline-flex items-center gap-2 text-xs text-[var(--df-muted)]">
                      <CalendarDays size={13} />
                      Apply by {formatDate(job.deadline)}
                    </span>
                  )}

                  {job.publishedAt && (
                    <span className="text-xs text-[var(--df-soft)]">
                      Published {formatDate(job.publishedAt)}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}