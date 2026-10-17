"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  ExternalLink,
  Globe2,
  MapPin,
} from "lucide-react";

const getInitials = (developer) => {
  const name =
    developer?.user?.name ||
    developer?.name ||
    developer?.username ||
    "Developer";

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
};

const formatValue = (value) => {
  if (!value) return "";

  return value
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

export default function DeveloperCard({ developer, index = 0 }) {
  const name =
    developer?.user?.name ||
    developer?.name ||
    developer?.username ||
    "Developer";

  const skills = developer?.skills || [];

  const experience =
    developer?.yearsOfExp !== undefined &&
    developer?.yearsOfExp !== null
      ? Number(developer.yearsOfExp)
      : null;

  const profileId = developer?.userId || developer?.id;

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.35,
        delay: Math.min(index * 0.04, 0.2),
      }}
      whileHover={{ y: -3 }}
      className="
        group
        flex
        h-full
        flex-col
        border
        border-[var(--df-line)]
        bg-[var(--df-paper)]
        transition-colors
        duration-300
        hover:border-[var(--df-text)]
      "
    >
      {/* Card Header */}
      <div className="p-6 sm:p-7">
        <div className="flex items-start justify-between gap-5">
          <div className="flex min-w-0 items-center gap-4">
            {/* Avatar */}
            <div
              className="
                flex
                h-14
                w-14
                shrink-0
                items-center
                justify-center
                border
                border-[var(--df-line)]
                bg-[var(--df-paper-2)]
                text-sm
                font-semibold
                tracking-[-0.02em]
                text-[var(--df-text)]
              "
            >
              {getInitials(developer)}
            </div>

            <div className="min-w-0">
              <h2
                className="
                  truncate
                  text-lg
                  font-semibold
                  tracking-[-0.035em]
                  text-[var(--df-text)]
                "
              >
                {name}
              </h2>

              {developer?.username && (
                <p className="mt-1 truncate text-xs text-[var(--df-muted)]">
                  @{developer.username}
                </p>
              )}
            </div>
          </div>

          {/* Profile Arrow */}
          <Link
            href={`/developers/${profileId}`}
            aria-label={`View ${name}'s profile`}
            className="
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-full
              border
              border-[var(--df-line)]
              text-[var(--df-muted)]
              transition-all
              duration-300
              group-hover:border-[var(--df-text)]
              group-hover:text-[var(--df-text)]
              group-hover:translate-x-0.5
              group-hover:-translate-y-0.5
            "
          >
            <ArrowUpRight size={15} strokeWidth={1.5} />
          </Link>
        </div>

        {/* Bio */}
        <p
          className="
            mt-7
            line-clamp-3
            min-h-[66px]
            text-sm
            leading-6
            text-[var(--df-muted)]
          "
        >
          {developer?.bio ||
            "Developer profile on DevFlow. Explore skills, experience and work."}
        </p>

        {/* Meta */}
        <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2">
          {developer?.locationPreference && (
            <div className="flex items-center gap-2 text-xs text-[var(--df-muted)]">
              <MapPin size={14} strokeWidth={1.5} />
              <span>{formatValue(developer.locationPreference)}</span>
            </div>
          )}

          {experience !== null && !Number.isNaN(experience) && (
            <div className="flex items-center gap-2 text-xs text-[var(--df-muted)]">
              <BriefcaseBusiness size={14} strokeWidth={1.5} />
              <span>
                {experience} {experience === 1 ? "year" : "years"} experience
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Skills */}
      <div className="border-t border-[var(--df-line)] px-6 py-5 sm:px-7">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--df-soft)]">
            Skills
          </span>

          {skills.length > 0 && (
            <span className="text-[10px] tracking-[0.12em] text-[var(--df-soft)]">
              {String(skills.length).padStart(2, "0")}
            </span>
          )}
        </div>

        {skills.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {skills.slice(0, 5).map((skill) => {
              const skillName = skill?.name || skill;

              return (
                <span
                  key={skill?.id || skillName}
                  className="
                    border
                    border-[var(--df-line)]
                    bg-[var(--df-paper-2)]
                    px-2.5
                    py-1.5
                    text-[11px]
                    text-[var(--df-text)]
                  "
                >
                  {skillName}
                </span>
              );
            })}

            {skills.length > 5 && (
              <span
                className="
                  border
                  border-[var(--df-line)]
                  px-2.5
                  py-1.5
                  text-[11px]
                  text-[var(--df-muted)]
                "
              >
                +{skills.length - 5}
              </span>
            )}
          </div>
        ) : (
          <p className="mt-4 text-xs text-[var(--df-soft)]">
            No skills added yet.
          </p>
        )}
      </div>

      {/* Footer */}
      <div
        className="
          mt-auto
          flex
          items-center
          justify-between
          border-t
          border-[var(--df-line)]
          px-6
          py-4
          sm:px-7
        "
      >
        <div className="flex items-center gap-4">
          {developer?.githubUrl && (
            <a
              href={developer.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${name}'s GitHub`}
              className="
                text-[var(--df-muted)]
                transition-colors
                hover:text-[var(--df-text)]
              "
            >
              <ExternalLink size={15} strokeWidth={1.5} />
            </a>
          )}

          {developer?.portfolioUrl && (
            <a
              href={developer.portfolioUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${name}'s portfolio`}
              className="
                text-[var(--df-muted)]
                transition-colors
                hover:text-[var(--df-text)]
              "
            >
              <Globe2 size={15} strokeWidth={1.5} />
            </a>
          )}
        </div>

        <Link
          href={`/developers/${profileId}`}
          className="
            inline-flex
            items-center
            gap-2
            text-xs
            font-semibold
            text-[var(--df-text)]
            transition-colors
            hover:text-[var(--df-muted)]
          "
        >
          View profile
          <ArrowUpRight
            size={14}
            strokeWidth={1.5}
            className="
              transition-transform
              duration-300
              group-hover:translate-x-0.5
              group-hover:-translate-y-0.5
            "
          />
        </Link>
      </div>
    </motion.article>
  );
}