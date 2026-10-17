export default function Loading() {
    return (
      <main className="min-h-screen bg-[var(--df-paper)] text-[var(--df-text)]">
        <div className="mx-auto max-w-[1200px] px-5 py-8 sm:px-8 lg:px-10 lg:py-12">
          <div className="h-3 w-32 animate-pulse bg-[var(--df-line)]" />
  
          <section className="mt-12 border-b border-[var(--df-line)] pb-8">
            <div className="h-3 w-32 animate-pulse bg-[var(--df-line)]" />
            <div className="mt-5 h-12 w-3/4 animate-pulse bg-[var(--df-line)]" />
            <div className="mt-3 h-4 w-40 animate-pulse bg-[var(--df-line)]" />
          </section>
  
          <div className="grid gap-8 py-8 lg:grid-cols-[1fr_320px]">
            <div className="space-y-5">
              <div>
                <div className="h-3 w-20 animate-pulse bg-[var(--df-line)]" />
                <div className="mt-3 h-7 w-3/4 animate-pulse bg-[var(--df-line)]" />
              </div>
  
              <div className="h-60 animate-pulse border border-[var(--df-line)]" />
              <div className="h-60 animate-pulse border border-[var(--df-line)]" />
            </div>
  
            <div className="h-72 animate-pulse border border-[var(--df-line)]" />
          </div>
        </div>
      </main>
    );
  }