// import Link from "next/link";
// import {
//   ArrowUpRight,
//   MapPin,
// } from "lucide-react";

// const skills = [
//   "TypeScript",
//   "React",
//   "Next.js",
//   "Node.js",
//   "PostgreSQL",
//   "Redis",
// ];

// export default function DeveloperIdentity() {
//   return (
//     <section className="bg-[var(--df-paper-2)]">
//       <div className="max-w-[1200px] mx-auto py-24 lg:py-36">
//         <div className="grid grid-cols-12 gap-12 lg:gap-8">
//           {/* Intro */}
//           <div className="col-span-12 lg:col-span-5">
//             <p className="df-eyebrow">
//               03 / Developer identity
//             </p>

//             <h2 className="df-section-title mt-7 max-w-xl text-[clamp(3rem,5vw,5.5rem)]">
//               More than a resume.
//             </h2>

//             <p className="mt-8 max-w-md text-sm leading-6 text-[var(--df-muted)]">
//               Your resume tells people where you've been.
//               Your DevFlow profile shows how you work, what
//               you know, and where you want to go next.
//             </p>

//             <Link
//               href="/register"
//               className="df-btn df-btn-primary mt-8"
//             >
//               Build your profile
//               <ArrowUpRight size={14} />
//             </Link>
//           </div>

//           {/* Profile */}
//           <div className="col-span-12 lg:col-span-7">
//             <div className="border-y border-[var(--df-line)]">
//               {/* Identity */}
//               <div className="grid grid-cols-12 gap-6 py-8">
//                 <div className="col-span-3">
//                   <div className="flex aspect-square max-w-[100px] items-center justify-center bg-[var(--df-black)] text-3xl font-semibold tracking-[-0.06em] text-white">
//                     AK
//                   </div>
//                 </div>

//                 <div className="col-span-9">
//                   <div className="flex flex-wrap items-center gap-3">
//                     <h3 className="text-3xl font-medium tracking-[-0.05em]">
//                       Alex Khan
//                     </h3>

//                     <span className="flex items-center gap-2 bg-[var(--df-accent)] px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-black">
//                       <span className="h-1.5 w-1.5 rounded-full bg-black" />
//                       Open to work
//                     </span>
//                   </div>

//                   <p className="mt-2 text-sm text-[var(--df-muted)]">
//                     Full-stack developer
//                   </p>

//                   <div className="mt-4 flex flex-wrap gap-4 text-xs text-[var(--df-muted)]">
//                     <span className="flex items-center gap-1.5">
//                       <MapPin size={13} />
//                       Lahore, PK
//                     </span>

//                     <span>
//                       4 years experience
//                     </span>
//                   </div>
//                 </div>
//               </div>

//               {/* About */}
//               <div className="border-t border-[var(--df-line-soft)] py-8">
//                 <p className="max-w-2xl text-lg leading-7 tracking-[-0.02em]">
//                   Building products from interface to
//                   infrastructure. Interested in developer tools,
//                   distributed systems and thoughtful product
//                   experiences.
//                 </p>
//               </div>

//               {/* Skills */}
//               <div className="border-t border-[var(--df-line-soft)] py-8">
//                 <div className="flex items-center justify-between">
//                   <span className="df-eyebrow">
//                     Core skills
//                   </span>

//                   <span className="df-number">
//                     06
//                   </span>
//                 </div>

//                 <div className="mt-5 flex flex-wrap gap-2">
//                   {skills.map((skill) => (
//                     <span
//                       key={skill}
//                       className="border border-[var(--df-line)] px-3 py-2 text-xs text-[var(--df-muted)]"
//                     >
//                       {skill}
//                     </span>
//                   ))}
//                 </div>
//               </div>

//               {/* Footer */}
//               <div className="flex items-center justify-between border-t border-[var(--df-line-soft)] py-5">
//                 <span className="text-[10px] uppercase tracking-[0.17em] text-[var(--df-soft)]">
//                   Available remotely
//                 </span>

//                 <Link
//                   href="/developers"
//                   className="flex items-center gap-2 text-xs font-medium"
//                 >
//                   View profile
//                   <ArrowUpRight size={13} />
//                 </Link>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// }

"use client";

import { motion } from "framer-motion";
import {
  ArrowUpRight,
  Check,
  LucideFolderGit2,
  Globe,
  MapPin,
  Sparkles,
} from "lucide-react";

const skills = [
  "React",
  "Next.js",
  "TypeScript",
  "Node.js",
  "PostgreSQL",
  "Redis",
];

const experience = [
  {
    role: "Frontend Engineer",
    company: "Northstar Labs",
    period: "2024 — Present",
  },
  {
    role: "Software Engineer",
    company: "Layer Systems",
    period: "2022 — 2024",
  },
];

export default function DeveloperIdentity() {
  return (
    <section className="border-t border-[var(--df-line)] bg-[var(--df-paper)]">
      <div className="mx-auto max-w-[1320px] px-5 py-24 sm:px-8 lg:py-32">
        <div className="grid gap-16 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          {/* Copy */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.7 }}
          >
            <div className="mb-6 flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--df-accent)] text-[var(--df-black)]">
                <Sparkles size={16} />
              </span>

              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--df-muted)]">
                Developer identity
              </p>
            </div>

            <h2 className="max-w-xl text-4xl font-semibold leading-[0.95] tracking-[-0.045em] text-[var(--df-text)] sm:text-5xl lg:text-6xl">
              More than a resume.
              <br />
              <span className="text-[var(--df-muted)]">
                A professional identity.
              </span>
            </h2>

            <p className="mt-7 max-w-lg text-base leading-7 text-[var(--df-muted)] sm:text-lg">
              Build a developer profile that brings your skills, experience,
              work history, resume and preferences together in one place.
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <button className="inline-flex items-center gap-2 bg-[var(--df-text)] px-5 py-3 text-sm font-semibold text-[var(--df-paper)] transition hover:opacity-90">
                Create your profile
                <ArrowUpRight size={16} />
              </button>

              <button className="inline-flex items-center gap-2 border border-[var(--df-line)] px-5 py-3 text-sm font-semibold text-[var(--df-text)] transition hover:border-[var(--df-text)]">
                See developer profiles
              </button>
            </div>
          </motion.div>

          {/* Profile */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.7 }}
            className="relative"
          >
            <div className="border border-[var(--df-line)] bg-[var(--df-paper-2)]">
              {/* Profile header */}
              <div className="border-b border-[var(--df-line)] p-6 sm:p-8">
                <div className="flex flex-col justify-between gap-6 sm:flex-row">
                  <div className="flex gap-4">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[var(--df-text)] text-lg font-bold text-[var(--df-paper)]">
                      AK
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-semibold tracking-tight text-[var(--df-text)]">
                          Alex Kim
                        </h3>

                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--df-accent)]">
                          <Check
                            size={11}
                            strokeWidth={3}
                            className="text-[var(--df-black)]"
                          />
                        </span>
                      </div>

                      <p className="mt-1 text-sm text-[var(--df-muted)]">
                        Full Stack Developer
                      </p>

                      <div className="mt-2 flex flex-wrap gap-3 text-xs text-[var(--df-soft)]">
                        <span className="inline-flex items-center gap-1">
                          <MapPin size={12} />
                          Remote
                        </span>

                        <span>5 years experience</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button className="flex h-9 w-9 items-center justify-center border border-[var(--df-line)]">
                      <LucideFolderGit2 size={15} />
                    </button>

                    <button className="flex h-9 w-9 items-center justify-center border border-[var(--df-line)]">
                      <Globe size={15} />
                    </button>
                  </div>
                </div>

                <p className="mt-7 max-w-2xl text-sm leading-6 text-[var(--df-muted)]">
                  Full stack developer focused on building reliable web
                  products with React, Next.js and Node.js.
                </p>
              </div>

              {/* Skills */}
              <div className="border-b border-[var(--df-line)] p-6 sm:p-8">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold uppercase tracking-[0.15em] text-[var(--df-muted)]">
                    Skills
                  </h4>

                  <span className="text-xs text-[var(--df-soft)]">
                    6 technologies
                  </span>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  {skills.map((skill, index) => (
                    <motion.span
                      key={skill}
                      initial={{ opacity: 0, y: 8 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.06 }}
                      className="rounded-full border border-[var(--df-line)] bg-[var(--df-paper)] px-4 py-2 text-xs font-medium text-[var(--df-text)]"
                    >
                      {skill}
                    </motion.span>
                  ))}
                </div>
              </div>

              {/* Experience */}
              <div className="p-6 sm:p-8">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold uppercase tracking-[0.15em] text-[var(--df-muted)]">
                    Experience
                  </h4>

                  <span className="text-xs text-[var(--df-soft)]">
                    Work history
                  </span>
                </div>

                <div className="mt-5 space-y-5">
                  {experience.map((item, index) => (
                    <div
                      key={item.role}
                      className="relative flex gap-4"
                    >
                      <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center border border-[var(--df-line)] bg-[var(--df-paper)] text-[10px] font-bold">
                        0{index + 1}
                      </div>

                      <div className="flex-1">
                        <div className="flex flex-col justify-between gap-1 sm:flex-row">
                          <p className="text-sm font-semibold text-[var(--df-text)]">
                            {item.role}
                          </p>

                          <span className="text-xs text-[var(--df-soft)]">
                            {item.period}
                          </span>
                        </div>

                        <p className="mt-1 text-xs text-[var(--df-muted)]">
                          {item.company}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="flex flex-col gap-4 border-t border-[var(--df-line)] bg-[var(--df-paper)] p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-semibold text-[var(--df-text)]">
                    Resume attached
                  </p>

                  <p className="mt-1 text-[11px] text-[var(--df-muted)]">
                    Available for hiring opportunities
                  </p>
                </div>

                <button className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--df-text)]">
                  View profile
                  <ArrowUpRight size={14} />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}