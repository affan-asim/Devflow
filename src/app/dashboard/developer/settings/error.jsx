"use client";

export default function Error({ reset }) {
  return (
    <main className="min-h-screen bg-[var(--df-paper)] text-[var(--df-text)]">
      <div className="mx-auto flex min-h-[70vh] max-w-2xl items-center px-5 py-10">
        <div className="w-full border-y border-[var(--df-line)] py-12">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-red-600">
            Settings
          </p>

          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em]">
            Something went wrong
          </h1>

          <p className="mt-4 text-sm leading-6 text-[var(--df-muted)]">
            We couldn't load your account settings.
          </p>

          <button
            type="button"
            onClick={() => reset()}
            className="mt-7 h-10 border border-[var(--df-text)] bg-[var(--df-text)] px-5 text-xs font-semibold uppercase tracking-[0.12em] text-white"
          >
            Try again
          </button>
        </div>
      </div>
    </main>
  );
}