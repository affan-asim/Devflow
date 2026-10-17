import Link from "next/link";
import {
  ArrowUpRight,
  Plus,
} from "lucide-react";

export default function FinalCTA() {
  return (
    <section className="overflow-hidden">
      <div className="df-container py-24 lg:py-36">
        <div className="relative overflow-hidden border border-[var(--df-line)] bg-[var(--df-paper-2)] px-6 py-20 lg:px-16 lg:py-28">
          {/* Decorative crosshair */}
          <div className="absolute left-5 top-5">
            <Plus
              size={16}
              strokeWidth={1}
              className="text-[var(--df-soft)]"
            />
          </div>

          <div className="absolute bottom-5 right-5">
            <Plus
              size={16}
              strokeWidth={1}
              className="text-[var(--df-soft)]"
            />
          </div>

          <div className="relative mx-auto max-w-4xl text-center">
            <p className="df-eyebrow">
              08 / Join the network
            </p>

            <h2 className="df-section-title mt-8 text-[clamp(3.2rem,7vw,7rem)]">
              Build your career around work worth doing.
            </h2>

            <p className="mx-auto mt-8 max-w-xl text-sm leading-6 text-[var(--df-muted)]">
              Whether you're looking for your next opportunity
              or the person who can help build it, start with
              DevFlow.
            </p>

            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <Link
                href="/register"
                className="df-btn df-btn-primary group"
              >
                Join DevFlow
                <ArrowUpRight
                  size={14}
                  className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </Link>

              <Link
                href="/jobs"
                className="df-btn df-btn-outline"
              >
                Explore opportunities
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}