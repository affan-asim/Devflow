
"use client";

import Link from "next/link";
import { ArrowLeft, Moon, Sun } from "lucide-react";
import { useTheme } from "../context/ThemeProvider";
import DevFlowLogo from "@/components/brand/DevFlowLogo";

export default function AuthHeader({
  backHref = "/",
  showBack = true,
}) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="flex h-20 items-center justify-between border-b border-[var(--df-line)] px-5 sm:px-8">
      <div className="flex items-center gap-5">
        {showBack && (
          <Link
            href={backHref}
            className="group flex items-center gap-2 text-xs font-medium text-[var(--df-muted)] transition hover:text-[var(--df-text)]"
          >
            <ArrowLeft
              size={14}
              className="transition-transform group-hover:-translate-x-1"
            />
            Back
          </Link>
        )}

        <Link
          href="/"
          aria-label="DevFlow home"
          className="flex items-center"
        >
          <DevFlowLogo size="header" />
        </Link>
      </div>

      <button
        type="button"
        onClick={toggleTheme}
        aria-label="Toggle theme"
        className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--df-line)] text-[var(--df-muted)] transition hover:border-[var(--df-text)] hover:text-[var(--df-text)]"
      >
        {theme === "light" ? (
          <Moon size={15} />
        ) : (
          <Sun size={15} />
        )}
      </button>
    </header>
  );
}
