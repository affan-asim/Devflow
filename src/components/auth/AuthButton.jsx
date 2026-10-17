
"use client";

import { ArrowRight } from "lucide-react";

export default function AuthButton({
  children,
  type = "button",
}) {
  return (
    <button
      type={type}
      className="group flex h-12 w-full items-center justify-center gap-2 bg-[var(--df-text)] px-5 text-sm font-semibold text-[var(--df-paper)] transition hover:opacity-90"
    >
      {children}

      <ArrowRight
        size={16}
        className="transition-transform group-hover:translate-x-1"
      />
    </button>
  );
}
