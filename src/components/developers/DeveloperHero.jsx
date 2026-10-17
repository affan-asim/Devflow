"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  BriefcaseBusiness,
  Globe2,
  GitBranch,
  MapPin,
} from "lucide-react";

export default function DeveloperHero({ developer }) {
  const name =
    developer?.user?.name ||
    developer?.name ||
    developer?.username ||
    "Developer";

  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  const experience =
    developer?.yearsOfExp !== null &&
    developer?.yearsOfExp !== undefined
      ? Number(developer.yearsOfExp)
      : null;

  return (
    <section className="border-b border-[var(--df-line)]">
      <div className="mx-auto max-w-[1320px] px-5 py-16 sm:px-8 lg:py-24">
        {/* Back */}
        <Link
          href="/developers"
          className="
            group
            inline-flex
            items-center
            gap-2
            text-xs
            font-medium
            text-[var(--df-muted)]
            transition-colors
            hover:text-[var(--df-text)]
          "
        >
          <ArrowLeft
            size={14}
            strokeWidth={1.5}
            className="transition-transform group-hover:-translate-x-1"
          />
          All developers
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="
            mt-14
            grid
            gap-12
            lg:grid-cols-[1fr_300px]
            lg:items-end
          "
        >
          {/* Identity */}
          <div className="flex flex-col gap-8 sm:flex-row sm:items-end">
            <div
              className="
                flex
                h-28
                w-28
                shrink-0
                items-center
                justify-center
                border
                border-[var(--df-line)]
                bg-[var(--df-paper-2)]
                text-3xl
                font-semibold
                tracking-[-0.04em]
                text-[var(--df-text)]
              "
            >
              {initials}
            </div>

            <div>
              <div className="mb-5 flex items-center gap-3">
                <span className="h-1.5 w-1.5 bg-[var(--df-text)]" />

                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--df-muted)]">
                  Developer profile
                </span>
              </div>

              <h1
                className="
                  max-w-4xl
                  text-4xl
                  font-semibold
                  leading-[0.95]
                  tracking-[-0.055em]
                  text-[var(--df-text)]
                  sm:text-5xl
                  lg:text-7xl
                "
              >
                {name}
              </h1>

              <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3">
                {developer?.locationPreference && (
                  <span className="flex items-center gap-2 text-xs text-[var(--df-muted)]">
                    <MapPin size={14} strokeWidth={1.5} />
                    {formatValue(developer.locationPreference)}
                  </span>
                )}

                {experience !== null && !Number.isNaN(experience) && (
                  <span className="flex items-center gap-2 text-xs text-[var(--df-muted)]">
                    <BriefcaseBusiness
                      size={14}
                      strokeWidth={1.5}
                    />
                    {experience}{" "}
                    {experience === 1 ? "year" : "years"} experience
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Links */}
          <div className="lg:justify-self-end lg:w-full">
            <div className="border-t border-[var(--df-line)]">
              {developer?.githubUrl && (
                <a
                  href={developer.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="
                    group
                    flex
                    items-center
                    justify-between
                    border-b
                    border-[var(--df-line)]
                    py-4
                    text-sm
                    text-[var(--df-text)]
                    transition-colors
                    hover:text-[var(--df-muted)]
                  "
                >
                  <span className="flex items-center gap-3">
                    <GitBranch size={15} strokeWidth={1.5} />
                    GitHub
                  </span>

                  <ArrowUpRight
                    size={15}
                    strokeWidth={1.5}
                    className="
                      transition-transform
                      group-hover:translate-x-0.5
                      group-hover:-translate-y-0.5
                    "
                  />
                </a>
              )}

              {developer?.portfolioUrl && (
                <a
                  href={developer.portfolioUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="
                    group
                    flex
                    items-center
                    justify-between
                    border-b
                    border-[var(--df-line)]
                    py-4
                    text-sm
                    text-[var(--df-text)]
                    transition-colors
                    hover:text-[var(--df-muted)]
                  "
                >
                  <span className="flex items-center gap-3">
                    <Globe2 size={15} strokeWidth={1.5} />
                    Portfolio
                  </span>

                  <ArrowUpRight
                    size={15}
                    strokeWidth={1.5}
                    className="
                      transition-transform
                      group-hover:translate-x-0.5
                      group-hover:-translate-y-0.5
                    "
                  />
                </a>
              )}

              {!developer?.githubUrl &&
                !developer?.portfolioUrl && (
                  <div className="border-b border-[var(--df-line)] py-4">
                    <span className="text-xs text-[var(--df-soft)]">
                      No external links available
                    </span>
                  </div>
                )}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function formatValue(value) {
  if (!value) return "";

  return value
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}