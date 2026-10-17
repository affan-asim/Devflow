import {
    ArrowLeft,
    ArrowUpRight,
    Building2,
    ExternalLink,
    Globe2,
    MapPin,
    Users,
  } from "lucide-react";
  
  import { motion } from "framer-motion";
  import Link from "next/link";
  
  import {
    formatText,
    getOpenJobCount,
    getRecruiterCount,
  } from "./CompanyHelpers";
  
  export function CompanyHero({ company }) {
    const recruiterCount = getRecruiterCount(company);
  
    return (
      <section className="border-b border-[var(--df-line)]">
        <div className="mx-auto max-w-[1320px] px-5 py-16 sm:px-8 lg:py-24">
  
          <Link
            href="/companies"
            className="group inline-flex items-center gap-2 text-xs font-medium text-[var(--df-muted)] transition hover:text-[var(--df-text)]"
          >
            <ArrowLeft
              size={14}
              className="transition-transform group-hover:-translate-x-1"
            />
  
            All companies
          </Link>
  
          <div className="mt-14 grid gap-12 lg:grid-cols-[1fr_320px] lg:items-end">
  
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65 }}
            >
              <div className="flex items-start gap-5">
  
                {/* Logo */}
                <div className="flex h-20 w-20 shrink-0 items-center justify-center border border-[var(--df-line)] bg-[var(--df-paper-2)] sm:h-24 sm:w-24">
                  {company.logo ? (
                    <img
                      src={company.logo}
                      alt={company.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Building2
                      size={32}
                      strokeWidth={1.3}
                      className="text-[var(--df-muted)]"
                    />
                  )}
                </div>
  
                <div className="pt-1">
                  <div className="flex flex-wrap items-center gap-3">
                    {company.isVerified && (
                      <span className="inline-flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.16em] text-[var(--df-muted)]">
                        <span className="h-1.5 w-1.5 rounded-full bg-[var(--df-accent)]" />
                        Verified company
                      </span>
                    )}
                  </div>
  
                  <h1 className="mt-3 max-w-4xl text-5xl font-semibold leading-[0.88] tracking-[-0.06em] sm:text-6xl lg:text-8xl">
                    {company.name}
                  </h1>
                </div>
              </div>
  
              {/* Metadata */}
              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-[var(--df-muted)]">
  
                {company.industry && (
                  <span className="inline-flex items-center gap-2">
                    <Building2 size={14} />
                    {formatText(company.industry)}
                  </span>
                )}
  
                {company.country && (
                  <span className="inline-flex items-center gap-2">
                    <MapPin size={14} />
                    {formatText(company.country)}
                  </span>
                )}
  
                {recruiterCount > 0 && (
                  <span className="inline-flex items-center gap-2">
                    <Users size={14} />
                    {recruiterCount}{" "}
                    {recruiterCount === 1 ? "recruiter" : "recruiters"}
                  </span>
                )}
  
                {company.websiteUrl && (
                  <a
                    href={company.websiteUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-[var(--df-text)] underline underline-offset-4"
                  >
                    <Globe2 size={14} />
                    Website
                    <ExternalLink size={11} />
                  </a>
                )}
              </div>
            </motion.div>
  
            {/* Right stat */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="border-t border-[var(--df-line)] pt-5 lg:border-l lg:border-t-0 lg:pl-8"
            >
              <div className="flex items-end justify-between gap-8">
  
                <div>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-[var(--df-soft)]">
                    Open opportunities
                  </p>
  
                  <p className="mt-2 text-4xl font-semibold tracking-[-0.05em]">
                    {getOpenJobCount(company)}
                  </p>
                </div>
  
                <div className="pb-1 text-right">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-[var(--df-soft)]">
                    Recruiting team
                  </p>
  
                  <p className="mt-2 text-2xl font-semibold tracking-[-0.04em]">
                    {recruiterCount}
                  </p>
                </div>
              </div>
  
              <Link
                href="#open-roles"
                className="mt-6 inline-flex items-center gap-2 text-xs font-semibold"
              >
                Explore open roles
                <ArrowUpRight size={13} />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>
    );
  }