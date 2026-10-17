import {
    ArrowUpRight,
    BriefcaseBusiness,
    GitBranch,
    Globe2,
    MapPin,
} from "lucide-react";

import { motion } from "framer-motion";

import { formatText } from "./CompanyHelpers";

function RecruiterCard({ recruiter, isOwner }) {
    return (
        <motion.article
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
            className="group border border-[var(--df-line)] p-6 transition hover:bg-[var(--df-paper-2)]"
        >
            <div className="flex items-start justify-between gap-5">

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[var(--df-line)] text-sm font-semibold uppercase">
                    {(recruiter.jobTitle || "R").charAt(0)}
                </div>

                {isOwner && (
                    <span className="text-[9px] font-semibold uppercase tracking-[0.15em] text-[var(--df-soft)]">
                        Company owner
                    </span>
                )}
            </div>

            <h3 className="mt-6 text-lg font-semibold tracking-[-0.03em]">
                {recruiter.jobTitle || "Recruiter"}
            </h3>

            {recruiter.bio && (
                <p className="mt-3 line-clamp-3 text-sm leading-6 text-[var(--df-muted)]">
                    {recruiter.bio}
                </p>
            )}

            <div className="mt-6 space-y-3 border-t border-[var(--df-line)] pt-5">

                {recruiter.locationPreference && (
                    <div className="flex items-center gap-2 text-xs text-[var(--df-muted)]">
                        <MapPin size={13} />
                        {formatText(recruiter.locationPreference)}
                    </div>
                )}

                {recruiter.yearsOfExp && (
                    <div className="flex items-center gap-2 text-xs text-[var(--df-muted)]">
                        <BriefcaseBusiness size={13} />
                        {recruiter.yearsOfExp} years experience
                    </div>
                )}
            </div>

            {(recruiter.githubUrl || recruiter.portfolioUrl) && (
                <div className="mt-6 flex gap-4">

                    {recruiter.githubUrl && (
                        <a
                            href={recruiter.githubUrl}
                            target="_blank"
                            rel="noreferrer"
                            aria-label="GitHub"
                            className="text-[var(--df-muted)] transition hover:text-[var(--df-text)]"
                        >
                            <GitBranch size={16} />
                        </a>
                    )}

                    {recruiter.portfolioUrl && (
                        <a
                            href={recruiter.portfolioUrl}
                            target="_blank"
                            rel="noreferrer"
                            aria-label="Portfolio"
                            className="text-[var(--df-muted)] transition hover:text-[var(--df-text)]"
                        >
                            <Globe2 size={16} />
                        </a>
                    )}
                </div>
            )}

            <div className="mt-6 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--df-soft)] transition group-hover:text-[var(--df-text)]">
                Recruiting team member
                <ArrowUpRight size={12} />
            </div>
        </motion.article>
    );
}

export function CompanyTeam({ company }) {
    const recruiters = company.recruiters || [];

    if (!recruiters.length) {
        return (
            <div className="mt-8 border border-[var(--df-line)] p-8">
                <p className="text-sm font-medium">
                    No recruiting team information available.
                </p>
            </div>
        );
    }

    return (
        <div className="mt-8 grid gap-4 md:grid-cols-2">
            {recruiters.map((recruiter) => (
                <RecruiterCard
                    key={recruiter.id}
                    recruiter={recruiter}
                    isOwner={recruiter.id === company.ownerId}
                />
            ))}
        </div>
    );
}