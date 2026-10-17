import Link from "next/link";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto max-w-[1440px] px-6 pb-24 pt-20 lg:px-10 lg:pb-32 lg:pt-28">
        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 lg:col-span-10">
            <p className="mb-8 text-xs font-medium uppercase tracking-[0.22em] text-[var(--df-muted)]">
              The developer network
            </p>

            <h1 className="max-w-[1200px] text-[160px] font-semibold leading-[1] tracking-[-0.075em]">
              The people
              <br />
              behind the
              <br />
              <span className="text-[var(--df-muted)]">software.</span>
            </h1>
          </div>

          <div className="col-span-12 flex flex-col justify-end lg:col-span-4 lg:col-start-9">
            <p className="max-w-md text-lg leading-7 text-[var(--df-muted)]">
              DevFlow connects developers, teams and the work worth building —
              with the context that hiring platforms usually leave behind.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/jobs"
                className="group flex items-center gap-3 rounded-full bg-[var(--df-black)] px-6 py-3.5 text-sm font-medium text-white"
              >
                Explore opportunities
                <ArrowUpRight
                  size={16}
                  className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1"
                />
              </Link>

              <Link
                href="/developers"
                className="flex items-center gap-3 rounded-full border border-[var(--df-line)] px-6 py-3.5 text-sm font-medium"
              >
                Meet developers
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-20 flex items-center justify-between border-t border-[var(--df-line)] pt-5 text-xs uppercase tracking-[0.18em] text-[var(--df-soft)]">
          <span>People</span>
          <ArrowDownRight size={15} />
          <span>Work</span>
          <ArrowDownRight size={15} />
          <span>Companies</span>
          <ArrowDownRight size={15} />
          <span>Opportunity</span>
        </div>
      </div>
    </section>
  );
}