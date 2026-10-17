"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";

export default function EditProfileError({ error, reset }) {
  useEffect(() => {
    console.error("Edit developer profile error:", error);
  }, [error]);

  return (
    <main className="min-h-screen bg-[var(--df-paper)] text-[var(--df-text)]">
      <div className="mx-auto flex min-h-screen max-w-[800px] items-center px-5 py-12">
        <div className="w-full border border-[var(--df-line)] p-8 sm:p-10">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--df-muted)]">
            Profile settings
          </p>

          <h1 className="mt-4 text-4xl font-semibold tracking-tight">
            Something went wrong.
          </h1>

          <p className="mt-4 text-sm leading-7 text-[var(--df-muted)]">
            We couldn't load the profile editor.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => reset()}
              className="inline-flex h-11 items-center justify-center gap-2 bg-[var(--df-text)] px-5 text-sm font-medium text-[var(--df-paper)]"
            >
              Try again
              <ArrowUpRight className="h-4 w-4" />
            </button>

            <Link
              href="/dashboard/profile"
              className="inline-flex h-11 items-center justify-center gap-2 border border-[var(--df-line)] px-5 text-sm font-medium"
            >
              <ArrowLeft className="h-4 w-4" />
              Profile
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}