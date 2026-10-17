"use client";

import { Menu } from "lucide-react";
import { useSelector } from "react-redux";
import Link from "next/link";
import DevFlowLogo from "@/components/brand/DevFlowLogo";
import LogoutButton from "@/components/auth/LogoutButton";

export default function RecruiterHeader({ onMenu }) {
  const user = useSelector((state) => state.auth.user);

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--df-line)] bg-[var(--df-paper)]/95 backdrop-blur">
      <div className="flex h-16 items-center justify-between px-5 sm:px-8 lg:px-10">
        <button
          onClick={onMenu}
          className="flex h-9 w-9 items-center justify-center border border-[var(--df-line)] lg:hidden"
          aria-label="Open navigation"
        >
          <Menu size={17} />
        </button>

        <Link href="/dashboard/recruiter" aria-label="DevFlow dashboard" className="ml-3 lg:hidden">
          <DevFlowLogo size="header" />
        </Link>

        <div className="hidden lg:block">
          <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-[var(--df-muted)]">
            Recruiter workspace
          </span>
        </div>

        <div className="ml-auto flex items-center gap-3">
          <LogoutButton className="rounded-full border border-[var(--df-line)] px-3 py-2 hover:bg-[var(--df-soft)]" />
          <div className="text-right">
            <p className="text-xs font-medium">
              {user?.name || "Recruiter"}
            </p>

            <p className="text-[9px] uppercase tracking-[0.14em] text-[var(--df-muted)]">
              {user?.role || "RECRUITER"}
            </p>
          </div>

          <div className="flex h-9 w-9 items-center justify-center border border-[var(--df-line)] text-xs font-medium uppercase">
            {user?.name?.charAt(0)?.toUpperCase() || "R"}
          </div>
        </div>
      </div>
    </header>
  );
}
