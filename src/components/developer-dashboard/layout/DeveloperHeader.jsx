"use client";

import Link from "next/link";
import { Bell, Menu, Search } from "lucide-react";
import DevFlowLogo from "@/components/brand/DevFlowLogo";

export default function DeveloperHeader({ onMenuClick }) {
  return (
    <header
      className="
        sticky
        top-0
        z-30
        flex
        h-16
        items-center
        justify-between
        border-b
        border-[var(--df-line)]
        bg-[var(--df-paper)]/95
        px-5
        backdrop-blur
        sm:px-8
      "
    >
      <div className="flex items-center gap-4">
        {/* Mobile menu */}
        <button
          type="button"
          onClick={onMenuClick}
          className="
            flex
            h-9
            w-9
            items-center
            justify-center
            border
            border-[var(--df-line)]
            text-[var(--df-muted)]
            hover:text-[var(--df-text)]
            lg:hidden
          "
          aria-label="Open sidebar"
        >
          <Menu size={17} strokeWidth={1.5} />
        </button>

        <Link href="/dashboard/developer" aria-label="DevFlow dashboard" className="lg:hidden">
          <DevFlowLogo size="header" />
        </Link>

        <div className="hidden items-center gap-2 md:flex">
          <Search
            size={15}
            strokeWidth={1.5}
            className="text-[var(--df-soft)]"
          />

          <span className="text-xs text-[var(--df-muted)]">
            Search jobs, companies, developers...
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/notifications"
          className="
            relative
            flex
            h-9
            w-9
            items-center
            justify-center
            text-[var(--df-muted)]
            transition-colors
            hover:text-[var(--df-text)]
          "
          aria-label="Notifications"
        >
          <Bell size={17} strokeWidth={1.5} />

          {/* Notification indicator */}
          <span
            className="
              absolute
              right-1
              top-1
              h-1.5
              w-1.5
              bg-[var(--df-text)]
            "
          />
        </Link>

        <div className="h-6 w-px bg-[var(--df-line)]" />

        <Link
          href="/dashboard/profile"
          className="
            flex
            items-center
            gap-2
            text-xs
            font-medium
            text-[var(--df-text)]
          "
        >
          <span
            className="
              flex
              h-8
              w-8
              items-center
              justify-center
              bg-[var(--df-paper-3)]
              text-[10px]
              font-semibold
            "
          >
            D
          </span>

          <span className="hidden sm:block">Developer</span>
        </Link>
      </div>
    </header>
  );
}
