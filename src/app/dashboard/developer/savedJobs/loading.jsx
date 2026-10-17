export default function Loading() {
    return (
      <main className="min-h-screen bg-[var(--df-paper)] text-[var(--df-text)]">
        <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-10 lg:py-14">
          <div className="border-b border-[var(--df-line)] pb-8">
            <div className="h-3 w-32 animate-pulse bg-[var(--df-line)]" />
            <div className="mt-4 h-10 w-56 animate-pulse bg-[var(--df-line)]" />
            <div className="mt-4 h-4 w-96 max-w-full animate-pulse bg-[var(--df-line)]" />
          </div>
  
          <div className="border-b border-[var(--df-line)] py-5">
            <div className="h-4 w-24 animate-pulse bg-[var(--df-line)]" />
          </div>
  
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="border-b border-[var(--df-line)] py-8"
            >
              <div className="h-3 w-28 animate-pulse bg-[var(--df-line)]" />
              <div className="mt-4 h-7 w-2/3 animate-pulse bg-[var(--df-line)]" />
              <div className="mt-3 h-4 w-1/3 animate-pulse bg-[var(--df-line)]" />
              <div className="mt-6 h-4 w-full animate-pulse bg-[var(--df-line)]" />
              <div className="mt-2 h-4 w-4/5 animate-pulse bg-[var(--df-line)]" />
            </div>
          ))}
        </div>
      </main>
    );
  }