
"use client";

import { motion } from "framer-motion";
import {
  Search,
  UserRound,
  FileCheck2,
  ArrowRight,
  Users,
  BriefcaseBusiness,
  Eye,
  CheckCircle2,
} from "lucide-react";

const developerSteps = [
  {
    icon: Search,
    number: "01",
    title: "Discover",
    description:
      "Search opportunities by role, skills, location and employment type.",
  },
  {
    icon: UserRound,
    number: "02",
    title: "Build",
    description:
      "Create a professional developer profile with skills, experience and work preferences.",
  },
  {
    icon: FileCheck2,
    number: "03",
    title: "Apply",
    description:
      "Apply with your profile, resume and cover letter.",
  },
  {
    icon: ArrowRight,
    number: "04",
    title: "Track",
    description:
      "Follow your application through review, interview and decision.",
  },
];

const recruiterSteps = [
  {
    icon: BriefcaseBusiness,
    number: "01",
    title: "Post",
    description:
      "Create and publish opportunities with the context candidates need.",
  },
  {
    icon: Search,
    number: "02",
    title: "Discover",
    description:
      "Find developers through skills, experience and profile context.",
  },
  {
    icon: Eye,
    number: "03",
    title: "Review",
    description:
      "Review applications and move candidates through your hiring process.",
  },
  {
    icon: CheckCircle2,
    number: "04",
    title: "Hire",
    description:
      "Turn successful applications into employment relationships.",
  },
];

function Workflow({
  label,
  flow,
  steps,
  icon: HeaderIcon,
}) {
  return (
    <div className="border-t border-[var(--df-line)]">
      {/* Workflow header */}
      <div className="flex flex-col gap-4 border-b border-[var(--df-line)] py-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--df-line)]">
            <HeaderIcon
              size={14}
              strokeWidth={1.6}
              className="text-[var(--df-muted)]"
            />
          </span>

          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--df-text)]">
            {label}
          </span>
        </div>

        <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-[var(--df-muted)]">
          {flow}
        </span>
      </div>

      {/* Steps */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((step, index) => {
          const Icon = step.icon;

          return (
            <motion.div
              key={step.title}
              initial={{
                opacity: 0,
                y: 24,
              }}
              whileInView={{
                opacity: 1,
                y: 0,
              }}
              viewport={{
                once: true,
                margin: "-80px",
              }}
              transition={{
                duration: 0.55,
                delay: index * 0.08,
              }}
              className={`
                group relative min-h-[230px] border-b border-[var(--df-line-soft)] p-6
                transition-colors duration-300
                hover:bg-[var(--df-paper-2)]
                lg:min-h-[250px]
                ${index !== 0 ? "lg:border-l" : ""}
                ${index === steps.length - 1 ? "sm:border-b-0" : ""}
              `}
            >
              {/* Number + icon */}
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-medium tracking-[0.16em] text-[var(--df-soft)]">
                  {step.number}
                </span>

                <motion.div
                  whileHover={{
                    rotate: 8,
                    scale: 1.08,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 15,
                  }}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--df-line)] bg-[var(--df-paper)]"
                >
                  <Icon
                    size={16}
                    strokeWidth={1.5}
                    className="text-[var(--df-muted)]"
                  />
                </motion.div>
              </div>

              {/* Content */}
              <div className="mt-16">
                <h3 className="text-xl font-medium tracking-[-0.035em] text-[var(--df-text)]">
                  {step.title}
                </h3>

                <p className="mt-3 max-w-xs text-sm leading-6 text-[var(--df-muted)]">
                  {step.description}
                </p>
              </div>

              {/* Connector */}
              {index !== steps.length - 1 && (
                <div className="absolute right-[-9px] top-1/2 z-10 hidden h-[18px] w-[18px] -translate-y-1/2 items-center justify-center rounded-full border border-[var(--df-line)] bg-[var(--df-paper)] lg:flex">
                  <ArrowRight
                    size={9}
                    className="text-[var(--df-muted)]"
                  />
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export default function HowItWorks() {
  return (
    <section className="border-t border-[var(--df-line)] bg-[var(--df-paper)]">
      <div className="mx-auto max-w-[1320px] px-5 py-24 sm:px-8 lg:py-32">
        {/* Intro */}
        <motion.div
          initial={{
            opacity: 0,
            y: 25,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
            margin: "-80px",
          }}
          transition={{
            duration: 0.7,
          }}
          className="mb-16 grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end"
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--df-muted)]">
              01 / How DevFlow works
            </p>

            <h2 className="mt-6 max-w-4xl text-5xl font-semibold leading-[0.9] tracking-[-0.05em] text-[var(--df-text)] sm:text-6xl lg:text-8xl">
              One network.
              <br />
              <span className="text-[var(--df-muted)]">
                Two sides.
              </span>
            </h2>
          </div>

          <p className="max-w-md text-base leading-7 text-[var(--df-muted)] lg:justify-self-end">
            DevFlow brings developers and recruiters into the same connected
            hiring ecosystem — from the first search to the final hire.
          </p>
        </motion.div>

        {/* Developer workflow */}
        <Workflow
          label="For developers"
          flow="DISCOVER → GET HIRED"
          steps={developerSteps}
          icon={UserRound}
        />

        {/* Recruiter workflow */}
        <div className="mt-16">
          <Workflow
            label="For recruiters"
            flow="POST → HIRE"
            steps={recruiterSteps}
            icon={Users}
          />
        </div>
      </div>
    </section>
  );
}
