"use client";

export default function Error({ reset }) {
  return (
    <main className="min-h-screen bg-[var(--df-paper)] px-5 py-12 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="border-y border-[var(--df-line)] py-20 text-center">
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[var(--df-muted)]">
            Something went wrong
          </p>

          <h1 className="mt-4 text-3xl font-medium tracking-[-0.03em]">
            Dashboard unavailable
          </h1>

          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[var(--df-muted)]">
            We couldn&apos;t load the recruiter dashboard.
          </p>

          <button
            onClick={() => reset()}
            className="mt-8 border border-[var(--df-text)] bg-[var(--df-text)] px-5 py-3 text-xs font-medium uppercase tracking-[0.16em] text-[var(--df-paper)] transition-opacity hover:opacity-80"
          >
            Try again
          </button>
        </div>
      </div>
    </main>
  );
}