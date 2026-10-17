import Link from "next/link";
import {
  ArrowUpRight,
  MapPin,
} from "lucide-react";

const candidates = [
  {
    name: "Muhammad Ali",
    role: "Backend Engineer",
    location: "Islamabad, PK",
    skills: ["Node.js", "PostgreSQL"],
    match: "94%",
  },
  {
    name: "Sarah Rahman",
    role: "Product Engineer",
    location: "Dhaka, BD",
    skills: ["React", "Next.js"],
    match: "91%",
  },
  {
    name: "Daniel Kim",
    role: "Frontend Engineer",
    location: "Seoul, KR",
    skills: ["React", "Design Systems"],
    match: "89%",
  },
];

export default function RecruiterSection() {
  return (
    <section className="bg-[var(--df-paper-2)]">
      <div className="df-container py-24 lg:py-36">
        <div className="grid grid-cols-12 gap-12 lg:gap-8">
          {/* Copy */}
          <div className="col-span-12 lg:col-span-5">
            <p className="df-eyebrow">
              06 / For teams
            </p>

            <h2 className="df-section-title mt-7 max-w-xl text-[clamp(3rem,5vw,5.5rem)]">
              Find people who move the work forward.
            </h2>

            <p className="mt-8 max-w-md text-sm leading-6 text-[var(--df-muted)]">
              Stop sorting through keyword matches. Discover
              developers through skills, experience, work
              preferences and the context behind their profile.
            </p>

            <Link
              href="/recruiters"
              className="df-btn df-btn-primary mt-8"
            >
              Explore hiring
              <ArrowUpRight size={14} />
            </Link>
          </div>

          {/* Candidates */}
          <div className="col-span-12 lg:col-span-7">
            <div className="border-y border-[var(--df-line)]">
              {candidates.map((candidate, index) => (
                <div
                  key={candidate.name}
                  className="group grid grid-cols-12 gap-4 border-b border-[var(--df-line-soft)] py-7 last:border-b-0"
                >
                  <div className="col-span-1">
                    <span className="df-number">
                      0{index + 1}
                    </span>
                  </div>

                  <div className="col-span-11 sm:col-span-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center bg-[var(--df-black)] text-[9px] font-semibold text-white">
                        {candidate.name
                          .split(" ")
                          .map((x) => x[0])
                          .join("")}
                      </div>

                      <div>
                        <p className="text-sm font-medium tracking-[-0.02em]">
                          {candidate.name}
                        </p>

                        <p className="mt-0.5 text-[10px] text-[var(--df-muted)]">
                          {candidate.role}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="col-span-6 mt-4 sm:col-span-3 sm:mt-0">
                    <p className="flex items-center gap-1.5 text-[10px] text-[var(--df-muted)]">
                      <MapPin size={11} />
                      {candidate.location}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-1">
                      {candidate.skills.map((skill) => (
                        <span
                          key={skill}
                          className="df-tag"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="col-span-6 mt-4 flex items-start justify-end sm:col-span-3 sm:mt-0">
                    <div className="text-right">
                      <span className="text-[9px] uppercase tracking-[0.13em] text-[var(--df-muted)]">
                        Context match
                      </span>

                      <p className="mt-1 text-2xl font-medium tracking-[-0.05em]">
                        {candidate.match}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 flex justify-end">
              <Link
                href="/developers"
                className="df-link text-xs font-semibold uppercase tracking-[0.15em]"
              >
                Explore developer network
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}