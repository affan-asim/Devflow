"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { BriefcaseBusiness, ChevronLeft, ChevronRight, MapPin, Search, SlidersHorizontal, UserRound } from "lucide-react";
import { fetchRecruiterProfiles } from "@/lib/redux/slices/recruiterSlice";

const initialFilters = { search: "", email: "", jobTitle: "", minExp: "", maxExp: "", locationPreference: "", isVerified: "", sortBy: "createdAt", sortOrder: "desc" };

export default function RecruiterExplorePage() {
  const dispatch = useDispatch();
  const { profiles = [], profilesMetadata: metadata, loadingProfiles, errorProfiles } = useSelector((state) => state.recruiter);
  const [filters, setFilters] = useState(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState(initialFilters);
  const [page, setPage] = useState(1);
  const limit = 12;

  const loadProfiles = useCallback((nextPage, activeFilters) => {
    const params = { page: nextPage, limit };
    Object.entries(activeFilters).forEach(([key, value]) => { if (value !== "") params[key] = value; });
    dispatch(fetchRecruiterProfiles(params));
  }, [dispatch]);

  useEffect(() => { loadProfiles(page, appliedFilters); }, [loadProfiles, page, appliedFilters]);

  const applyFilters = (event) => { event.preventDefault(); setPage(1); setAppliedFilters(filters); };
  const resetFilters = () => { setFilters(initialFilters); setPage(1); setAppliedFilters(initialFilters); };

  return (
    <main className="min-h-screen bg-[var(--df-paper)] px-5 py-10 text-[var(--df-text)] sm:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <div className="border-b border-[var(--df-line)] pb-8">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--df-muted)]">Recruiter management / talent network</p>
          <div className="mt-5 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div><h1 className="text-4xl font-semibold tracking-[-0.055em] sm:text-5xl">Explore recruiters</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--df-muted)]">Find experienced recruiters across DevFlow and invite the right people to join your company.</p></div>
            <div className="border-l border-[var(--df-line)] pl-5"><p className="text-2xl font-semibold">{metadata?.totalCount || 0}</p><p className="mt-1 text-[9px] uppercase tracking-[0.16em] text-[var(--df-muted)]">Profiles available</p></div>
          </div>
        </div>

        <form onSubmit={applyFilters} className="mt-8 border border-[var(--df-line)] bg-[var(--df-paper)] p-5 sm:p-6">
          <div className="mb-5 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em]"><SlidersHorizontal size={14} /> Search and filters</div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <label className="lg:col-span-2"><span className="mb-2 block text-[10px] font-medium uppercase tracking-wider text-[var(--df-muted)]">Search profiles</span><div className="flex items-center gap-2 border border-[var(--df-line)] px-3"><Search size={15} className="text-[var(--df-muted)]" /><input value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} placeholder="Name, company, title or bio" className="h-11 w-full bg-transparent text-sm outline-none" /></div></label>
            <Field label="Email" value={filters.email} onChange={(email) => setFilters({ ...filters, email })} placeholder="name@example.com" />
            <Field label="Job title" value={filters.jobTitle} onChange={(jobTitle) => setFilters({ ...filters, jobTitle })} placeholder="Talent acquisition" />
            <Field label="Minimum years" type="number" value={filters.minExp} onChange={(minExp) => setFilters({ ...filters, minExp })} placeholder="0" />
            <Field label="Maximum years" type="number" value={filters.maxExp} onChange={(maxExp) => setFilters({ ...filters, maxExp })} placeholder="Any" />
            <label><span className="mb-2 block text-[10px] font-medium uppercase tracking-wider text-[var(--df-muted)]">Work preference</span><select value={filters.locationPreference} onChange={(e) => setFilters({ ...filters, locationPreference: e.target.value })} className="h-11 w-full border border-[var(--df-line)] bg-transparent px-3 text-sm"><option value="">Any location</option><option value="REMOTE">Remote</option><option value="HYBRID">Hybrid</option><option value="ONSITE">On-site</option></select></label>
            <label><span className="mb-2 block text-[10px] font-medium uppercase tracking-wider text-[var(--df-muted)]">Email verified</span><select value={filters.isVerified} onChange={(e) => setFilters({ ...filters, isVerified: e.target.value })} className="h-11 w-full border border-[var(--df-line)] bg-transparent px-3 text-sm"><option value="">Any</option><option value="true">Verified</option><option value="false">Unverified</option></select></label>
            <label><span className="mb-2 block text-[10px] font-medium uppercase tracking-wider text-[var(--df-muted)]">Sort by</span><select value={`${filters.sortBy}:${filters.sortOrder}`} onChange={(e) => { const [sortBy, sortOrder] = e.target.value.split(":"); setFilters({ ...filters, sortBy, sortOrder }); }} className="h-11 w-full border border-[var(--df-line)] bg-transparent px-3 text-sm"><option value="createdAt:desc">Recently joined</option><option value="yearsOfExp:desc">Most experience</option><option value="yearsOfExp:asc">Least experience</option><option value="name:asc">Name A to Z</option></select></label>
          </div>
          <div className="mt-5 flex flex-wrap gap-3"><button className="bg-[var(--df-text)] px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--df-paper)]">Apply filters</button><button type="button" onClick={resetFilters} className="border border-[var(--df-line)] px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.14em]">Reset</button></div>
        </form>

        <div className="mt-9 flex items-end justify-between border-b border-[var(--df-line)] pb-4"><div><h2 className="text-xl font-semibold tracking-tight">Recruiter profiles</h2><p className="mt-1 text-xs text-[var(--df-muted)]">{metadata?.totalCount || 0} matching profiles</p></div><p className="text-[10px] uppercase tracking-wider text-[var(--df-muted)]">Page {metadata?.currentPage || page} of {metadata?.totalPages || 0}</p></div>
        {errorProfiles && <div className="mt-6 border border-red-300 p-4 text-sm text-red-700">{errorProfiles}</div>}
        {loadingProfiles ? <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-56 animate-pulse border border-[var(--df-line)] bg-[var(--df-paper-2)]" />)}</div> : profiles.length === 0 ? <div className="mt-6 border-y border-[var(--df-line)] py-16 text-center"><UserRound className="mx-auto text-[var(--df-muted)]" /><h3 className="mt-4 text-lg font-semibold">No recruiter profiles found</h3><p className="mt-2 text-sm text-[var(--df-muted)]">Try changing your filters or search terms.</p></div> : <div className="mt-5 grid gap-px border border-[var(--df-line)] bg-[var(--df-line)] md:grid-cols-2 xl:grid-cols-3">
          {profiles.map((profile) => <Link key={profile.id} href={`/dashboard/recruiter/explore-recruiters/${profile.id}`} className="group bg-[var(--df-paper)] p-6 transition-colors hover:bg-[var(--df-paper-2)]"><div className="flex items-start justify-between gap-3"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--df-paper-3)] text-sm font-semibold">{profile.user?.name?.split(/\s+/).map((part) => part[0]).slice(0, 2).join("").toUpperCase()}</div><span className="text-[9px] uppercase tracking-wider text-[var(--df-muted)]">{profile.user?.isVerified ? "Verified" : "Member"}</span></div><h3 className="mt-5 text-lg font-semibold tracking-tight group-hover:underline">{profile.user?.name || "Recruiter"}</h3><p className="mt-1 text-xs text-[var(--df-muted)]">{profile.jobTitle || "Recruiter"}{profile.company?.name ? ` · ${profile.company.name}` : ""}</p><p className="mt-4 line-clamp-3 min-h-[4.5rem] text-sm leading-6 text-[var(--df-muted)]">{profile.bio || profile.description || "No profile summary provided."}</p><div className="mt-5 flex items-center justify-between border-t border-[var(--df-line)] pt-4 text-[10px] uppercase tracking-wider text-[var(--df-muted)]"><span className="inline-flex items-center gap-1.5"><BriefcaseBusiness size={13} />{profile.yearsOfExp == null ? "Experience not listed" : `${Number(profile.yearsOfExp)} yrs experience`}</span><span className="inline-flex items-center gap-1.5"><MapPin size={13} />{formatLocation(profile.locationPreference)}</span></div></Link>)}</div>}
        {!loadingProfiles && metadata?.totalPages > 1 && <div className="mt-8 flex items-center justify-between border-t border-[var(--df-line)] pt-5"><button disabled={!metadata.hasPreviousPage} onClick={() => setPage((current) => current - 1)} className="inline-flex items-center gap-2 text-xs disabled:opacity-40"><ChevronLeft size={15} />Previous</button><span className="text-xs text-[var(--df-muted)]">{metadata.currentPage} / {metadata.totalPages}</span><button disabled={!metadata.hasNextPage} onClick={() => setPage((current) => current + 1)} className="inline-flex items-center gap-2 text-xs disabled:opacity-40">Next<ChevronRight size={15} /></button></div>}
      </div>
    </main>
  );
}

function Field({ label, value, onChange, placeholder, type = "text" }) {
  return <label><span className="mb-2 block text-[10px] font-medium uppercase tracking-wider text-[var(--df-muted)]">{label}</span><input type={type} min={type === "number" ? "0" : undefined} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="h-11 w-full border border-[var(--df-line)] bg-transparent px-3 text-sm outline-none focus:border-[var(--df-text)]" /></label>;
}

function formatLocation(value) { return ({ REMOTE: "Remote", HYBRID: "Hybrid", ONSITE: "On-site" })[value] || "Flexible"; }
