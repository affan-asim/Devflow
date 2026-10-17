import Link from "next/link";
import {
  ArrowRight,
  Check,
} from "lucide-react";

const stages = [
  {
    label: "Applied",
    date: "Mar 08",
    done: true,
  },
  {
    label: "Review",
    date: "Mar 10",
    done: true,
  },
  {
    label: "Interview",
    date: "Mar 14",
    done: true,
  },
  {
    label: "Decision",
    date: "In progress",
    done: false,
  },
];

export default function ApplicationJourney() {
  return (
    <section className="bg-[var(--df-black)] text-white">
      <div className="df-container py-24 lg:py-36">
        <div className="grid grid-cols-12 gap-12 lg:gap-8">
          {/* Copy */}
          <div className="col-span-12 lg:col-span-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-500">
              04 / Application journey
            </p>

            <h2 className="mt-7 max-w-xl text-[clamp(3rem,5vw,5.5rem)] font-medium leading-[0.92] tracking-[-0.06em]">
            Your application
  <br />
  has a timeline.
            </h2>

            <p className="mt-8 max-w-md text-sm leading-6 text-neutral-400">
            Apply once and follow the entire hiring journey.
  DevFlow keeps developers informed as recruiters review,
  interview and make decisions.
            </p>

            <Link
              href="/applications"
              className="df-btn df-btn-outline mt-8 border-white/10 text-white"
            >
              See how it works
              <ArrowRight size={14} />
            </Link>
          </div>

          {/* Application */}
          <div className="col-span-12 lg:col-span-7">
            <div className="border border-white/[0.07] bg-[#141715]">
              {/* Header */}
              <div className="flex items-start justify-between border-b border-white/[0.06] p-6 lg:p-8">
                <div>
                  <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
                    Application
                  </p>

                  <h3 className="mt-3 text-xl font-medium tracking-[-0.035em]">
                    Senior Backend Engineer
                  </h3>

                  <p className="mt-1 text-xs text-neutral-500">
                    Northstar
                  </p>
                </div>

                <span className="flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--df-accent)]">
                  <span className="df-dot" />
                  Interview
                </span>
              </div>

              {/* Timeline */}
              <div className="p-6 lg:p-8">
                <div className="relative">
                  <div className="absolute left-[10px] top-4 h-[calc(100%-32px)] w-px bg-white/[0.08]" />

                  <div className="space-y-8">
                    {stages.map((stage) => (
                      <div
                        key={stage.label}
                        className="relative flex items-center gap-5"
                      >
                        <div
                          className={`relative z-10 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                            stage.done
                              ? "bg-[var(--df-accent)] text-black"
                              : "border border-white/15 bg-[#141715]"
                          }`}
                        >
                          {stage.done && (
                            <Check size={11} strokeWidth={3} />
                          )}
                        </div>

                        <div className="flex flex-1 items-center justify-between">
                          <div>
                            <p
                              className={`text-sm ${
                                stage.done
                                  ? "text-white"
                                  : "text-neutral-500"
                              }`}
                            >
                              {stage.label}
                            </p>
                          </div>

                          <span className="text-[10px] text-neutral-600">
                            {stage.date}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-white/[0.06] px-6 py-5 lg:px-8">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-[0.16em] text-neutral-600">
                    Updated 2 hours ago
                  </span>

                  <span className="text-xs text-neutral-400">
                    3 of 4 stages complete
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}