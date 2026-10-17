import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export default function Manifesto() {
  return (
    <section className="bg-[var(--df-black)] text-white">
      <div className="df-container py-28 lg:py-44">
        <div className="grid grid-cols-12">
          <div className="col-span-12 lg:col-span-10">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-500">
              07 / Why DevFlow
            </p>

            <h2 className="mt-10 text-[clamp(3.5rem,8vw,8rem)] font-medium leading-[0.86] tracking-[-0.075em]">
              Hiring isn't
              <br />
              keyword
              <br />
              <span className="text-neutral-500">
                matching.
              </span>
            </h2>

            <div className="mt-16 grid grid-cols-12 gap-8 border-t border-white/[0.07] pt-8">
              <div className="col-span-12 lg:col-span-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
                  Context
                </p>
              </div>

              <div className="col-span-12 lg:col-span-8">
                <p className="max-w-2xl text-xl leading-8 tracking-[-0.025em] text-neutral-300 lg:text-2xl">
                  A developer is more than a list of technologies.
                  A company is more than a job description. The
                  right opportunity lives somewhere between the two.
                </p>
              </div>
            </div>

            <div className="mt-12 grid grid-cols-12 gap-8 border-t border-white/[0.07] pt-8">
              <div className="col-span-12 lg:col-span-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
                  Discovery
                </p>
              </div>

              <div className="col-span-12 lg:col-span-8">
                <p className="max-w-2xl text-xl leading-8 tracking-[-0.025em] text-neutral-300 lg:text-2xl">
                  DevFlow is built around the relationships between
                  people, skills, work and companies — not just
                  searchable keywords.
                </p>
              </div>
            </div>

            <Link
              href="/about"
              className="df-btn df-btn-outline mt-14 border-white/10 text-white"
            >
              Why we built DevFlow
              <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}