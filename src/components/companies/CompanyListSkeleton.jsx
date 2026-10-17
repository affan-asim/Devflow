export default function CompanyListSkeleton() {
    return (
        <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, index) => (
                <div
                    key={index}
                    className="animate-pulse border border-[var(--df-line)] p-6 sm:p-8"
                >
                    <div className="h-16 w-16 bg-[var(--df-paper-3)]" />

                    <div className="mt-6 h-8 w-2/3 bg-[var(--df-paper-3)]" />

                    <div className="mt-4 h-4 w-1/3 bg-[var(--df-paper-3)]" />

                    <div className="mt-6 h-12 w-full bg-[var(--df-paper-3)]" />

                    <div className="mt-8 border-t border-[var(--df-line)] pt-5">
                        <div className="h-4 w-28 bg-[var(--df-paper-3)]" />
                    </div>
                </div>
            ))}
        </div>
    );
}
