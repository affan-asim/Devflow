export default function Loading() {
    return (
      <main className="min-h-screen bg-[var(--df-paper)] text-[var(--df-text)]">
        <div className="mx-auto max-w-[1300px] px-5 py-8 sm:px-8 lg:px-10 lg:py-12">
          <div className="h-3 w-24 animate-pulse bg-[var(--df-line)]" />
  
          <section className="mt-12 border-b border-[var(--df-line)] pb-10">
            <div className="h-3 w-28 animate-pulse bg-[var(--df-line)]" />
  
            <div className="mt-5 flex items-center gap-4">
              <div className="h-16 w-16 animate-pulse bg-[var(--df-line)]" />
  
              <div>
                <div className="h-12 w-64 animate-pulse bg-[var(--df-line)]" />
                <div className="mt-3 h-4 w-40 animate-pulse bg-[var(--df-line)]" />
              </div>
            </div>
          </section>
  
          <section className="grid border-b border-[var(--df-line)] sm:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div key={item} className="py-6">
                <div className="h-3 w-20 animate-pulse bg-[var(--df-line)]" />
                <div className="mt-3 h-5 w-28 animate-pulse bg-[var(--df-line)]" />
              </div>
            ))}
          </section>
  
          <div className="grid gap-8 py-8 lg:grid-cols-[1fr_330px]">
            <div className="space-y-8">
              <div className="h-48 animate-pulse border border-[var(--df-line)]" />
              <div className="h-56 animate-pulse border border-[var(--df-line)]" />
              <div className="h-56 animate-pulse border border-[var(--df-line)]" />
            </div>
  
            <div className="h-72 animate-pulse border border-[var(--df-line)]" />
          </div>
        </div>
      </main>
    );
  }