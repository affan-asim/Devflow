"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  Building2,
  MapPin,
} from "lucide-react";

export default function CompanyCard({
  company,
  index = 0,
}) {
  const jobCount =
    company.jobs?.length ??
    company.jobCount ??
    company._count?.jobs ??
    0;

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
        href={`/companies/${company.id}`}
        className="block p-6 sm:p-7 lg:p-8"
      >
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              {company.isVerified && (
                <span className="bg-[var(--df-accent)] px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.15em] text-[var(--df-black)]">
                  Verified
                </span>
              )}
              <span className="text-[10px] uppercase tracking-[0.16em] text-[var(--df-muted)]">
                {company.industry ? formatText(company.industry) : "Company"}
              </span>
            </div>

            <div className="mt-4 flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center border border-[var(--df-line)] bg-[var(--df-paper-2)]">
                {company.logo ? (
                  <img src={company.logo} alt={`${company.name} logo`} className="h-full w-full object-cover" />
                ) : (
                  <Building2 size={21} strokeWidth={1.5} className="text-[var(--df-muted)]" />
                )}
              </div>
              <div className="min-w-0">
                <h2 className="text-2xl font-semibold tracking-[-0.04em] sm:text-3xl">{company.name}</h2>
                <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2 text-xs text-[var(--df-muted)]">
                  {company.country && <span className="inline-flex items-center gap-1.5"><MapPin size={13} />{formatText(company.country)}</span>}
                  {company.industry && <span>{formatText(company.industry)}</span>}
                </div>
              </div>
            </div>

            {company.description && (
              <p className="mt-5 line-clamp-2 max-w-3xl text-sm leading-6 text-[var(--df-muted)]">
                {company.description}
              </p>
            )}
          </div>

          <div className="flex items-end justify-between gap-8 lg:min-w-[210px] lg:flex-col lg:items-end">
            <div className="lg:text-right">
              <p className="text-[10px] uppercase tracking-[0.15em] text-[var(--df-soft)]">Open opportunities</p>
              <p className="mt-2 text-sm font-semibold text-[var(--df-text)]">{jobCount} {jobCount === 1 ? "position" : "positions"}</p>
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

function formatText(value) {
  if (!value) return "";

  return value
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}
