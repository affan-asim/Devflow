"use client";

import { motion } from "framer-motion";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  MapPin,
  Search,
  Sparkles,
} from "lucide-react";

const jobs = [
  {
    company: "Northstar Labs",
    initials: "NL",
    title: "Senior Frontend Engineer",
    skills: ["React", "Next.js", "TypeScript"],
    location: "Remote",
    type: "Full-time",
    salary: "$120k — $150k",
    featured: true,
  },
  {
    company: "Layer Systems",
    initials: "LS",
    title: "Backend Engineer",
    skills: ["Node.js", "PostgreSQL", "Redis"],
    location: "Hybrid",
    type: "Full-time",
    salary: "$110k — $140k",
    featured: false,
  },
  {
    company: "Orbit Health",
    initials: "OH",
    title: "Full Stack Developer",
    skills: ["Next.js", "Prisma", "AWS"],
    location: "Remote",
    type: "Contract",
    salary: "$80 — $100/hr",
    featured: false,
  },
];

export default function JobDiscovery() {
  return (
    <section className="border-t border-[var(--df-line)] bg-[var(--df-paper-2)]">
      <div className="mx-auto max-w-[1320px] px-5 py-24 sm:px-8 lg:py-32">
        {/* Heading */}
        <div className="grid gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:items-end">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.65 }}
          >
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--df-muted)]">
              Opportunities
            </p>

            <h2 className="text-4xl font-semibold leading-none tracking-[-0.04em] text-[var(--df-text)] sm:text-5xl lg:text-6xl">
              Search.
              <br />
              Compare.
              <br />
              Apply.
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.65, delay: 0.1 }}
          >
            <p className="max-w-2xl text-lg leading-8 text-[var(--df-muted)]">
              Find developer roles by technology, location, experience and
              employment type. DevFlow puts the opportunity first — without
              burying it beneath noise.
            </p>
          </motion.div>
        </div>

        {/* Search interface */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="mt-16 border border-[var(--df-line)] bg-[var(--df-paper)]"
        >
          {/* Search row */}
          <div className="grid lg:grid-cols-[1fr_0.7fr_auto]">
            <div className="flex items-center gap-3 border-b border-[var(--df-line)] px-5 py-4 lg:border-b-0 lg:border-r">
              <Search size={18} className="text-[var(--df-muted)]" />

              <input
                type="text"
                placeholder="Search jobs, skills or companies"
                className="w-full bg-transparent text-sm text-[var(--df-text)] outline-none placeholder:text-[var(--df-soft)]"
              />
            </div>

            <div className="flex items-center gap-3 border-b border-[var(--df-line)] px-5 py-4 lg:border-b-0 lg:border-r">
              <MapPin size={18} className="text-[var(--df-muted)]" />

              <input
                type="text"
                placeholder="Location or remote"
                className="w-full bg-transparent text-sm text-[var(--df-text)] outline-none placeholder:text-[var(--df-soft)]"
              />
            </div>

            <button className="flex items-center justify-center gap-2 bg-[var(--df-accent)] px-7 py-4 text-sm font-semibold text-[var(--df-black)] transition hover:opacity-90">
              Search jobs
              <ArrowUpRight size={16} />
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2 border-t border-[var(--df-line)] px-5 py-4">
            {["All jobs", "Remote", "Full-time", "Frontend", "Backend"].map(
              (filter, index) => (
                <button
                  key={filter}
                  className={`rounded-full border px-4 py-2 text-xs font-medium transition ${
                    index === 0
                      ? "border-[var(--df-text)] bg-[var(--df-text)] text-[var(--df-paper)]"
                      : "border-[var(--df-line)] text-[var(--df-muted)] hover:border-[var(--df-text)] hover:text-[var(--df-text)]"
                  }`}
                >
                  {filter}
                </button>
              )
            )}
          </div>
        </motion.div>

        {/* Job list */}
        <div className="mt-6">
          {jobs.map((job, index) => (
            <motion.article
              key={job.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.55,
                delay: index * 0.08,
              }}
              whileHover={{ x: 5 }}
              className="group border-b border-[var(--df-line)] py-7 transition-colors first:border-t hover:bg-[var(--df-paper)]"
            >
              <div className="grid gap-6 lg:grid-cols-[1.6fr_2fr_0.8fr_auto] lg:items-center">
                {/* Company */}
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center border border-[var(--df-line)] bg-[var(--df-paper)] text-xs font-bold group-hover:bg-[var(--df-accent)]">
                    {job.initials}
                  </div>

                  <div>
                    <p className="text-xs text-[var(--df-muted)]">
                      {job.company}
                    </p>

                    <h3 className="mt-1 text-base font-semibold tracking-tight text-[var(--df-text)]">
                      {job.title}
                    </h3>
                  </div>
                </div>

                {/* Skills */}
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full border border-[var(--df-line)] px-3 py-1.5 text-[11px] text-[var(--df-muted)]"
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                {/* Meta */}
                <div className="flex flex-col gap-1 text-xs text-[var(--df-muted)]">
                  <span>{job.location}</span>
                  <span>{job.type}</span>
                  <span className="font-medium text-[var(--df-text)]">
                    {job.salary}
                  </span>
                </div>

                {/* Arrow */}
                <ArrowUpRight
                  size={20}
                  className="text-[var(--df-soft)] transition group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-[var(--df-text)]"
                />
              </div>

              {job.featured && (
                <div className="mt-5 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--df-accent-dark)]">
                  <Sparkles size={13} />
                  Featured opportunity
                </div>
              )}
            </motion.article>
          ))}
        </div>

        {/* Bottom */}
        <div className="mt-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <p className="text-sm text-[var(--df-muted)]">
            Built for developers searching for meaningful work.
          </p>

          <button className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--df-text)]">
            Explore all jobs
            <ArrowUpRight size={16} />
          </button>
        </div>
      </div>
    </section>
  );
}