export default function DeveloperListSkeleton() {
    return (
        <div className="grid gap-px border border-[var(--df-line)] bg-[var(--df-line)] md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map(
                (_, index) => (
                    <div
                        key={index}
                        className="min-h-[360px] animate-pulse bg-[var(--df-paper)] p-7"
                    >
                        <div className="flex gap-4">
                            <div className="h-12 w-12 bg-[var(--df-paper-3)]" />

                            <div className="flex-1 space-y-2">
                                <div className="h-4 w-32 bg-[var(--df-paper-3)]" />
                                <div className="h-3 w-24 bg-[var(--df-paper-3)]" />
                            </div>
                        </div>

                        <div className="mt-8 space-y-3">
                            <div className="h-3 w-full bg-[var(--df-paper-3)]" />
                            <div className="h-3 w-11/12 bg-[var(--df-paper-3)]" />
                            <div className="h-3 w-8/12 bg-[var(--df-paper-3)]" />
                        </div>

                        <div className="mt-7 h-px bg-[var(--df-paper-3)]" />

                        <div className="mt-6 flex gap-2">
                            <div className="h-6 w-14 bg-[var(--df-paper-3)]" />
                            <div className="h-6 w-16 bg-[var(--df-paper-3)]" />
                            <div className="h-6 w-12 bg-[var(--df-paper-3)]" />
                        </div>
                    </div>
                )
            )}
        </div>
    );
}