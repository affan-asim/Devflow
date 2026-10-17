"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  MapPin,
  Users,
} from "lucide-react";

import Navbar from "@/components/landing/Navbar";
import { fetchJobById } from "@/lib/redux/slices/jobSlice";
import { JobDetailSkeleton } from "./SectionLabel";
import { JobHero } from "./JobHero";
import { JobContent } from "./JobContent";

export default function JobDetailPage({ jobId }) {
  const dispatch = useDispatch();

  const {
    currentJob,
    loadingDetail,
    errorDetail,
  } = useSelector((state) => state.jobs);

  useEffect(() => {
    if (jobId) {
      dispatch(fetchJobById(jobId));
    }
  }, [dispatch, jobId]);

  if (loadingDetail) {
    return (
      <main className="min-h-screen bg-[var(--df-paper)] text-[var(--df-text)]">
        <JobDetailSkeleton />
      </main>
    );
  }

  if (errorDetail || !currentJob) {
    return (
      <main className="min-h-screen bg-[var(--df-paper)] text-[var(--df-text)]">

        <div className="mx-auto flex min-h-[70vh] max-w-[1320px] items-center justify-center px-5 sm:px-8">
          <div className="max-w-lg text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--df-muted)]">
              Job unavailable
            </p>

            <h1 className="mt-5 text-4xl font-semibold tracking-[-0.05em]">
              This opportunity couldn't be loaded.
            </h1>

            <p className="mt-4 text-sm leading-6 text-[var(--df-muted)]">
              {errorDetail || "The requested job may no longer exist."}
            </p>

            <Link
              href="/jobs"
              className="mt-8 inline-flex items-center gap-2 bg-[var(--df-text)] px-6 py-3 text-xs font-semibold text-[var(--df-paper)]"
            >
              <ArrowLeft size={14} />
              Back to jobs
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--df-paper)] text-[var(--df-text)]">

      <JobHero job={currentJob} />

      <JobContent job={currentJob} />
    </main>
  );
}