"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  Building2,
  ExternalLink,
  Globe2,
  MapPin,
  BriefcaseBusiness,
} from "lucide-react";


import { CompanyDetailSkeleton } from "./CompanyHelpers";
import { CompanyHero } from "./CompanyHero";
import { CompanyContent } from "./CompanyContent";
import { fetchCompanyById } from "@/lib/redux/slices/companySlice";

export default function CompanyDetailPage({
  companyId,
}) {
  const dispatch = useDispatch();

  const {
    currentCompany,
    loadingDetail,
    errorDetail,
  } = useSelector((state) => state.company);

  useEffect(() => {
    if (companyId) {
      dispatch(fetchCompanyById(companyId));
    }
  }, [dispatch, companyId]);

  if (loadingDetail) {
    return (
      <main className="min-h-screen bg-[var(--df-paper)] text-[var(--df-text)]">
        <CompanyDetailSkeleton />
      </main>
    );
  }

  if (errorDetail || !currentCompany) {
    return (
      <main className="min-h-screen bg-[var(--df-paper)] text-[var(--df-text)]">

        <div className="mx-auto flex min-h-[70vh] max-w-[1320px] items-center justify-center px-5 sm:px-8">
          <div className="max-w-lg text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--df-muted)]">
              Company unavailable
            </p>

            <h1 className="mt-5 text-4xl font-semibold tracking-[-0.05em]">
              This company couldn't be loaded.
            </h1>

            <p className="mt-4 text-sm leading-6 text-[var(--df-muted)]">
              {errorDetail ||
                "The requested company may no longer be available."}
            </p>

            <Link
              href="/companies"
              className="mt-8 inline-flex items-center gap-2 bg-[var(--df-text)] px-6 py-3 text-xs font-semibold text-[var(--df-paper)]"
            >
              <ArrowLeft size={14} />
              Back to companies
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--df-paper)] text-[var(--df-text)]">
      <CompanyHero company={currentCompany} />

      <CompanyContent company={currentCompany} />
    </main>
  );
}