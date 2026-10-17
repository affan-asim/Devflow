
export default function JobListSkeleton() {
  return (
    <div>
      <div className="mb-4">
        <div className="h-4 w-32 animate-pulse bg-[var(--df-line)]" />

        <div className="mt-2 h-3 w-44 animate-pulse bg-[var(--df-line)]" />
      </div>

      <div className="border border-[var(--df-line)]">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="animate-pulse border-b border-[var(--df-line)] p-6 last:border-b-0"
          >
            <div className="grid gap-6 lg:grid-cols-[48px_minmax(0,1fr)_230px]">
              <div className="hidden h-3 w-5 bg-[var(--df-line)] lg:block" />

              <div>
                <div className="h-5 w-16 bg-[var(--df-line)]" />

                <div className="mt-4 h-6 w-2/3 bg-[var(--df-line)]" />

                <div className="mt-2 h-3 w-40 bg-[var(--df-line)]" />

                <div className="mt-6 flex gap-3">
                  <div className="h-7 w-16 bg-[var(--df-line)]" />
                  <div className="h-7 w-20 bg-[var(--df-line)]" />
                  <div className="h-7 w-24 bg-[var(--df-line)]" />
                </div>

                <div className="mt-5 flex gap-2">
                  <div className="h-6 w-14 bg-[var(--df-line)]" />
                  <div className="h-6 w-20 bg-[var(--df-line)]" />
                  <div className="h-6 w-16 bg-[var(--df-line)]" />
                </div>
              </div>

              <div>
                <div className="ml-auto h-5 w-32 bg-[var(--df-line)]" />

                <div className="ml-auto mt-3 h-3 w-20 bg-[var(--df-line)]" />

                <div className="ml-auto mt-8 h-10 w-28 bg-[var(--df-line)]" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
