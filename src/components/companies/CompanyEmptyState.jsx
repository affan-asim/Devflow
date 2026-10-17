export default function CompanyEmptyState({
    title,
    description,
    actionLabel,
    onAction,
}) {
    return (
        <div className="border border-[var(--df-line)] px-6 py-20 text-center">
            <div className="mx-auto h-2 w-2 bg-[var(--df-accent)]" />

            <h2 className="mt-6 text-2xl font-semibold tracking-[-0.04em]">
                {title}
            </h2>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[var(--df-muted)]">
                {description}
            </p>

            {actionLabel && onAction && (
                <button
                    onClick={onAction}
                    className="mt-7 h-11 bg-[var(--df-text)] px-6 text-xs font-semibold text-[var(--df-paper)]"
                >
                    {actionLabel}
                </button>
            )}
        </div>
    );
}