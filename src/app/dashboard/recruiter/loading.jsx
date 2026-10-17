export default function Loading() {
    return (
      <main className="min-h-screen bg-[var(--df-paper)]">
        <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-10">
          <div className="animate-pulse">
            <div className="border-b border-[var(--df-line)] pb-10">
              <div className="h-3 w-28 bg-[var(--df-line)]" />
              <div className="mt-6 h-14 max-w-xl bg-[var(--df-line)]" />
              <div className="mt-5 h-4 max-w-lg bg-[var(--df-line)]" />
            </div>
  
            <div className="grid grid-cols-2 border-b border-[var(--df-line)] md:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="border-r border-[var(--df-line)] px-5 py-8"
                >
                  <div className="h-3 w-24 bg-[var(--df-line)]" />
                  <div className="mt-5 h-9 w-14 bg-[var(--df-line)]" />
                </div>
              ))}
            </div>
  
            <div className="grid gap-10 border-b border-[var(--df-line)] py-12 lg:grid-cols-2">
              <div>
                <div className="h-3 w-24 bg-[var(--df-line)]" />
                <div className="mt-3 h-7 w-40 bg-[var(--df-line)]" />
                <div className="mt-8 h-48 bg-[var(--df-line)]" />
              </div>
  
              <div>
                <div className="h-3 w-24 bg-[var(--df-line)]" />
                <div className="mt-3 h-7 w-40 bg-[var(--df-line)]" />
                <div className="mt-8 h-48 bg-[var(--df-line)]" />
              </div>
            </div>
  
            <div className="grid gap-10 py-12 lg:grid-cols-2">
              <div className="h-64 bg-[var(--df-line)]" />
              <div className="h-64 bg-[var(--df-line)]" />
            </div>
          </div>
        </div>
      </main>
    );
  }