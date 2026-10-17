export default function Loading() {
    return (
      <main className="min-h-screen bg-[var(--df-paper)] text-[var(--df-text)]">
        <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-10 lg:py-14">
          <div className="h-3 w-24 animate-pulse bg-[var(--df-line)]" />
  
          <div className="mt-12 max-w-4xl">
            <div className="h-3 w-28 animate-pulse bg-[var(--df-line)]" />
            <div className="mt-5 h-14 w-3/4 animate-pulse bg-[var(--df-line)]" />
            <div className="mt-5 h-5 w-1/3 animate-pulse bg-[var(--df-line)]" />
          </div>
  
          <div className="mt-12 grid gap-12 border-t border-[var(--df-line)] pt-10 lg:grid-cols-[1fr_300px]">
            <div>
              <div className="h-5 w-32 animate-pulse bg-[var(--df-line)]" />
              <div className="mt-7 h-4 w-full animate-pulse bg-[var(--df-line)]" />
              <div className="mt-2 h-4 w-full animate-pulse bg-[var(--df-line)]" />
              <div className="mt-2 h-4 w-4/5 animate-pulse bg-[var(--df-line)]" />
            </div>
  
            <div className="h-40 animate-pulse bg-[var(--df-line)]" />
          </div>
        </div>
      </main>
    );
  }