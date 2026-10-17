"use client";

import { motion } from "framer-motion";
import {
  BriefcaseBusiness,
  Building2,
  Code2,
  UserRound,
  Users,
} from "lucide-react";

const nodes = [
  {
    id: "developer",
    label: "Developer",
    description: "Identity, skills & experience",
    icon: UserRound,
    className: "left-[5%] top-[18%]",
  },
  {
    id: "skills",
    label: "Skills",
    description: "React · Node · Next.js",
    icon: Code2,
    className: "left-[37%] top-[5%]",
  },
  {
    id: "jobs",
    label: "Jobs",
    description: "Open opportunities",
    icon: BriefcaseBusiness,
    className: "right-[6%] top-[20%]",
  },
  {
    id: "company",
    label: "Company",
    description: "Teams hiring talent",
    icon: Building2,
    className: "left-[25%] bottom-[10%]",
  },
  {
    id: "recruiter",
    label: "Recruiter",
    description: "Discover & evaluate",
    icon: Users,
    className: "right-[24%] bottom-[7%]",
  },
];

const connections = [
  { x1: "12%", y1: "25%", x2: "43%", y2: "12%" },
  { x1: "50%", y1: "12%", x2: "87%", y2: "27%" },
  { x1: "12%", y1: "25%", x2: "32%", y2: "80%" },
  { x1: "87%", y1: "27%", x2: "75%", y2: "79%" },
  { x1: "32%", y1: "80%", x2: "75%", y2: "79%" },
  { x1: "43%", y1: "12%", x2: "75%", y2: "79%" },
];

export default function NetworkGraph() {
  return (
    <section className="relative overflow-hidden border-t border-[var(--df-line)] bg-[var(--df-paper)]">
      <div className="mx-auto max-w-[1320px] px-5 py-24 sm:px-8 lg:py-32">
        <div className="grid gap-16 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          {/* Copy */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7 }}
          >
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--df-muted)]">
              The DevFlow network
            </p>

            <h2 className="max-w-xl text-4xl font-semibold leading-[0.95] tracking-[-0.04em] text-[var(--df-text)] sm:text-5xl lg:text-6xl">
              Hiring works better when everything is connected.
            </h2>

            <p className="mt-7 max-w-lg text-base leading-7 text-[var(--df-muted)] sm:text-lg">
              DevFlow connects the people, skills, opportunities and companies
              involved in developer hiring — so developers can build their
              careers while teams find the people they actually need.
            </p>

            <div className="mt-10 grid max-w-md grid-cols-2 gap-x-8 gap-y-7 border-t border-[var(--df-line)] pt-7">
              <div>
                <p className="text-sm font-semibold text-[var(--df-text)]">
                  Developers
                </p>
                <p className="mt-1 text-sm text-[var(--df-muted)]">
                  Profiles, skills & applications
                </p>
              </div>

              <div>
                <p className="text-sm font-semibold text-[var(--df-text)]">
                  Recruiters
                </p>
                <p className="mt-1 text-sm text-[var(--df-muted)]">
                  Jobs, candidates & hiring
                </p>
              </div>

              <div>
                <p className="text-sm font-semibold text-[var(--df-text)]">
                  Companies
                </p>
                <p className="mt-1 text-sm text-[var(--df-muted)]">
                  Teams & opportunities
                </p>
              </div>

              <div>
                <p className="text-sm font-semibold text-[var(--df-text)]">
                  Applications
                </p>
                <p className="mt-1 text-sm text-[var(--df-muted)]">
                  One connected journey
                </p>
              </div>
            </div>
          </motion.div>

          {/* Graph */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.8 }}
            className="relative h-[560px] overflow-hidden rounded-[2rem] border border-[var(--df-line)] bg-[var(--df-paper-2)]"
          >
            {/* Grid */}
            <div
              className="absolute inset-0 opacity-40"
              style={{
                backgroundImage:
                  "linear-gradient(var(--df-line-soft) 1px, transparent 1px), linear-gradient(90deg, var(--df-line-soft) 1px, transparent 1px)",
                backgroundSize: "48px 48px",
              }}
            />

            {/* SVG connections */}
            <svg
              className="absolute inset-0 h-full w-full"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              {connections.map((line, index) => (
                <motion.line
                  key={index}
                  x1={line.x1}
                  y1={line.y1}
                  x2={line.x2}
                  y2={line.y2}
                  stroke="var(--df-muted)"
                  strokeWidth="0.15"
                  strokeDasharray="1 1"
                  initial={{ pathLength: 0, opacity: 0 }}
                  whileInView={{ pathLength: 1, opacity: 0.55 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 1.2,
                    delay: index * 0.12,
                  }}
                />
              ))}
            </svg>

            {/* Center pulse */}
            <motion.div
              animate={{
                scale: [1, 1.15, 1],
                opacity: [0.4, 0.7, 0.4],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[var(--df-accent)]"
            />

            <div className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[var(--df-accent)] text-[var(--df-black)]">
              <span className="text-xs font-black tracking-widest">
                DF
              </span>
            </div>

            {/* Nodes */}
            {nodes.map((node, index) => {
              const Icon = node.icon;

              return (
                <motion.div
                  key={node.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.5,
                    delay: 0.15 + index * 0.1,
                  }}
                  whileHover={{ y: -5 }}
                  className={`absolute ${node.className} w-40 sm:w-48`}
                >
                  <div className="border border-[var(--df-line)] bg-[var(--df-paper)] p-4 shadow-[0_12px_40px_rgba(0,0,0,0.04)]">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center border border-[var(--df-line)] bg-[var(--df-paper-2)]">
                        <Icon size={17} />
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-[var(--df-text)]">
                          {node.label}
                        </p>

                        <p className="mt-0.5 text-[10px] leading-4 text-[var(--df-muted)]">
                          {node.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
}