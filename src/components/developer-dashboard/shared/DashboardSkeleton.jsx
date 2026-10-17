export function DashboardSkeleton() {
    return (
        <div className="mx-auto max-w-[1320px] px-5 py-10 sm:px-8 lg:py-14">
            <div className="animate-pulse">
                <div className="h-3 w-32 bg-[var(--df-paper-3)]" />

                <div className="mt-5 h-10 w-80 bg-[var(--df-paper-3)]" />

                <div className="mt-3 h-4 w-[500px] max-w-full bg-[var(--df-paper-2)]" />

                <div className="mt-12 grid gap-px border border-[var(--df-line)] bg-[var(--df-line)] sm:grid-cols-2 lg:grid-cols-4">
                    {Array.from({ length: 4 }).map((_, index) => (
                        <div
                            key={index}
                            className="h-32 bg-[var(--df-paper)] p-6"
                        />
                    ))}
                </div>

                <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_340px]">
                    <div className="space-y-8">
                        <div className="h-60 bg-[var(--df-paper-2)]" />
                        <div className="h-72 bg-[var(--df-paper-2)]" />
                    </div>

                    <div className="h-80 bg-[var(--df-paper-2)]" />
                </div>
            </div>
        </div>
    );
}