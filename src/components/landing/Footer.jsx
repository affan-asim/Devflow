"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  Menu,
  Moon,
  Sun,
  X,
} from "lucide-react";
import { useState } from "react";
import { useTheme } from "../context/ThemeProvider";
import DevFlowLogo from "@/components/brand/DevFlowLogo";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="relative z-50">
      <div className="df-container">
        <div className="flex h-[82px] items-center justify-between">
          <Link
            href="/"
            aria-label="DevFlow home"
            className="group flex items-center"
          >
            <DevFlowLogo size="home" />
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <Link
              href="/jobs"
              className="text-[13px] text-[var(--df-muted)] transition-colors hover:text-[var(--df-text)]"
            >
              Find jobs
            </Link>

            <Link
              href="/developers"
              className="text-[13px] text-[var(--df-muted)] transition-colors hover:text-[var(--df-text)]"
            >
              Developers
            </Link>

            <Link
              href="/companies"
              className="text-[13px] text-[var(--df-muted)] transition-colors hover:text-[var(--df-text)]"
            >
              Companies
            </Link>

            <Link
              href="/recruiters"
              className="text-[13px] text-[var(--df-muted)] transition-colors hover:text-[var(--df-text)]"
            >
              For recruiters
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            {/* Theme */}
            <button
              onClick={toggleTheme}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--df-line)] text-[var(--df-muted)] transition-all duration-300 hover:bg-[var(--df-paper-2)] hover:text-[var(--df-text)]"
              aria-label="Toggle theme"
            >
              {theme === "light" ? (
                <Moon size={15} />
              ) : (
                <Sun size={15} />
              )}
            </button>

            <Link
              href="/login"
              className="hidden px-4 py-2.5 text-[13px] font-medium sm:block"
            >
              Sign in
            </Link>

            <Link
              href="/register"
              className="df-btn df-btn-primary hidden sm:inline-flex"
            >
              Join DevFlow
              <ArrowUpRight size={14} />
            </Link>

            <button
              onClick={() => setOpen(!open)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--df-line)] md:hidden"
            >
              {open ? <X size={17} /> : <Menu size={17} />}
            </button>
          </div>
        </div>

        {open && (
          <div className="border-t border-[var(--df-line-soft)] py-6 md:hidden">
            <div className="flex flex-col">
              {[
                ["Find jobs", "/jobs"],
                ["Developers", "/developers"],
                ["Companies", "/companies"],
                ["For recruiters", "/recruiters"],
                ["Sign in", "/login"],
              ].map(([label, href]) => (
                <Link
                  key={label}
                  href={href}
                  onClick={() => setOpen(false)}
                  className="border-b border-[var(--df-line-soft)] py-4 text-sm"
                >
                  {label}
                </Link>
              ))}

              <Link
                href="/register"
                className="df-btn df-btn-primary mt-5 w-full"
              >
                Join DevFlow
                <ArrowUpRight size={14} />
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
