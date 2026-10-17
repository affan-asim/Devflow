export default function JobDetailSkeleton() {
    return (
        <div className="animate-pulse p-10">
            <div className="h-3 w-24 bg-[var(--df-line)]" />

            <div className="mt-12 border-b border-[var(--df-line)] pb-10">
                <div className="h-3 w-40 bg-[var(--df-line)]" />

                <div className="mt-6 h-14 max-w-3xl bg-[var(--df-line)]" />

                <div className="mt-8 h-10 w-56 bg-[var(--df-line)]" />
            </div>

            <div className="grid gap-14 py-12 lg:grid-cols-[minmax(0,1fr)_330px]">
                <div>
                    <div className="h-5 w-36 bg-[var(--df-line)]" />

                    <div className="mt-7 space-y-3">
                        <div className="h-3 w-full bg-[var(--df-line)]" />
                        <div className="h-3 w-11/12 bg-[var(--df-line)]" />
                        <div className="h-3 w-10/12 bg-[var(--df-line)]" />
                        <div className="h-3 w-9/12 bg-[var(--df-line)]" />
                    </div>

                    <div className="mt-14 h-5 w-32 bg-[var(--df-line)]" />

                    <div className="mt-7 border-y border-[var(--df-line)]">
                        {Array.from({ length: 4 }).map((_, index) => (
                            <div
                                key={index}
                                className="flex justify-between border-b border-[var(--df-line)] py-5 last:border-b-0"
                            >
                                <div className="h-3 w-24 bg-[var(--df-line)]" />
                                <div className="h-3 w-28 bg-[var(--df-line)]" />
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <div className="border-t border-[var(--df-text)] pt-5">
                        <div className="h-3 w-24 bg-[var(--df-line)]" />

                        <div className="mt-5 h-8 w-40 bg-[var(--df-line)]" />
                    </div>

                    <div className="mt-8 h-40 border-y border-[var(--df-line)]" />

                    <div className="mt-8 h-14 bg-[var(--df-line)]" />
                </div>
            </div>
        </div>
    );
}