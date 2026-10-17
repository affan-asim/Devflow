import { Code2 } from "lucide-react";

export default function DeveloperEmptyState() {
  return (
    <div
      className="
        flex min-h-[360px]
        flex-col items-center justify-center
        rounded-2xl
        border border-dashed border-[var(--border)]
        bg-[var(--card)]
        px-6 text-center
      "
    >
      <div
        className="
          flex h-14 w-14 items-center justify-center
          rounded-2xl
          border border-[var(--border)]
          bg-[var(--muted)]
        "
      >
        <Code2 size={25} className="text-[var(--muted-foreground)]" />
      </div>

      <h3 className="mt-5 text-lg font-semibold text-[var(--foreground)]">
        No developers found
      </h3>

      <p className="mt-2 max-w-md text-sm leading-6 text-[var(--muted-foreground)]">
        Try changing your search or removing some filters.
      </p>
    </div>
  );
}