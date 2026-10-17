"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  MapPin,
} from "lucide-react";

export default function JobCard({ job, index = 0 }) {
  const companyName =
    job.company?.name ||
    job.companyName ||
    "Company";

  const skills = job.skills || [];

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{
        duration: 0.5,
        delay: Math.min(index * 0.04, 0.2),
      }}
      className="group border border-[var(--df-line)] transition-colors duration-300 hover:bg-[var(--df-paper-2)]"
    >
      <Link
        href={`/jobs/${job.id}`}
        className="block p-6 sm:p-7 lg:p-8"
      >
        <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-start">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              {job.isFeatured && (
                <span className="bg-[var(--df-accent)] px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.15em] text-[var(--df-black)]">
                  Featured
                </span>
              )}

              <span className="text-[10px] uppercase tracking-[0.16em] text-[var(--df-muted)]">
                {job.status || "ACTIVE"}
              </span>
            </div>

            <h2 className="mt-4 max-w-3xl text-2xl font-semibold tracking-[-0.04em] text-[var(--df-text)] sm:text-3xl">
              {job.title}
            </h2>

            <p className="mt-2 text-sm font-medium text-[var(--df-muted)]">
              {companyName}
            </p>

            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-xs text-[var(--df-muted)]">
              {job.locationPreference && (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin size={13} />
                  {formatLocation(job.locationPreference)}
                </span>
              )}

              {job.employmentType && (
                <span className="inline-flex items-center gap-1.5">
                  <BriefcaseBusiness size={13} />
                  {formatEmployment(job.employmentType)}
                </span>
              )}

              {job.experienceLevel && (
                <span>
                  {formatExperience(job.experienceLevel)}
                </span>
              )}
            </div>

            {skills.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {skills.slice(0, 6).map((skill) => (
                  <span
                    key={skill.id || skill.name}
                    className="border border-[var(--df-line)] px-2.5 py-1.5 text-[10px] font-medium text-[var(--df-muted)]"
                  >
                    {skill.name}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-end justify-between gap-8 lg:min-w-[210px] lg:flex-col lg:items-end">
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-[0.15em] text-[var(--df-soft)]">
                Compensation
              </p>

              <p className="mt-2 text-sm font-semibold text-[var(--df-text)]">
                {formatSalary(job)}
              </p>
            </div>

            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--df-line)] transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1">
              <ArrowUpRight size={16} />
            </span>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}

export function formatLocation(value) {
  return value
    ?.toLowerCase()
    .replace("_", "-")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function formatEmployment(value) {
  return value
    ?.toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function formatExperience(value) {
  return value
    ?.toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function formatSalary(job) {
  if (!job.minSalary && !job.maxSalary) {
    return "Salary not specified";
  }

  const currency = job.currency || "";

  if (job.minSalary && job.maxSalary) {
    return `${currency} ${Number(job.minSalary).toLocaleString()} — ${Number(
      job.maxSalary
    ).toLocaleString()}`;
  }

  if (job.minSalary) {
    return `${currency} ${Number(job.minSalary).toLocaleString()}+`;
  }

  return `${currency} ${Number(job.maxSalary).toLocaleString()} max`;
}