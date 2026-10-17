export default function Loading() {
    return (
      <main className="min-h-screen bg-[var(--df-paper)] text-[var(--df-text)]">
        <div className="mx-auto max-w-[1100px] px-5 py-8 sm:px-8 lg:px-10 lg:py-12">
          <div className="h-3 w-32 animate-pulse bg-[var(--df-line)]" />
  
          <section className="mt-12 border-b border-[var(--df-line)] pb-8">
            <div className="h-3 w-28 animate-pulse bg-[var(--df-line)]" />
  
            <div className="mt-5 h-12 w-3/4 animate-pulse bg-[var(--df-line)]" />
  
            <div className="mt-4 h-4 w-1/2 animate-pulse bg-[var(--df-line)]" />
          </section>
  
          <div className="space-y-5 py-8">
            <div className="h-64 animate-pulse border border-[var(--df-line)]" />
            <div className="h-40 animate-pulse border border-[var(--df-line)]" />
            <div className="h-64 animate-pulse border border-[var(--df-line)]" />
            <div className="h-44 animate-pulse border border-[var(--df-line)]" />
          </div>
        </div>
      </main>
    );
  }