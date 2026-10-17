export default function JobListSkeleton() {
    return (
        <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
                <div
                    key={index}
                    className="animate-pulse border border-[var(--df-line)] p-7"
                >
                    <div className="h-3 w-20 bg-[var(--df-paper-3)]" />

                    <div className="mt-5 h-8 w-2/3 bg-[var(--df-paper-3)]" />

                    <div className="mt-3 h-4 w-40 bg-[var(--df-paper-3)]" />

                    <div className="mt-7 h-3 w-56 bg-[var(--df-paper-3)]" />

                    <div className="mt-6 flex gap-2">
                        <div className="h-7 w-20 bg-[var(--df-paper-3)]" />
                        <div className="h-7 w-24 bg-[var(--df-paper-3)]" />
                        <div className="h-7 w-16 bg-[var(--df-paper-3)]" />
                    </div>
                </div>
            ))}
        </div>
    );
}