export default function Loading() {
    return (
      <main className="min-h-screen bg-[var(--df-paper)] text-[var(--df-text)]">
        <div className="mx-auto max-w-5xl px-5 py-10 sm:px-8 lg:px-10 lg:py-14">
          <div className="animate-pulse">
            <div className="h-3 w-32 bg-[var(--df-line)]" />
            <div className="mt-4 h-10 w-40 bg-[var(--df-line)]" />
            <div className="mt-4 h-4 w-96 max-w-full bg-[var(--df-line)]" />
  
            <div className="mt-12 border-y border-[var(--df-line)] py-10">
              <div className="h-4 w-24 bg-[var(--df-line)]" />
              <div className="mt-6 h-11 w-full bg-[var(--df-line)]" />
            </div>
  
            <div className="border-b border-[var(--df-line)] py-10">
              <div className="h-4 w-32 bg-[var(--df-line)]" />
              <div className="mt-6 h-40 bg-[var(--df-line)]" />
            </div>
  
            <div className="py-10">
              <div className="h-4 w-24 bg-[var(--df-line)]" />
              <div className="mt-6 h-11 w-full bg-[var(--df-line)]" />
              <div className="mt-4 h-11 w-full bg-[var(--df-line)]" />
              <div className="mt-4 h-11 w-full bg-[var(--df-line)]" />
            </div>
          </div>
        </div>
      </main>
    );
  }