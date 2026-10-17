"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { ArrowLeft, BriefcaseBusiness, CheckCircle2, ExternalLink, MapPin, Send, ShieldCheck } from "lucide-react";
import { fetchRecruiterProfileById } from "@/lib/redux/slices/recruiterSlice";
import { createRecruiterInvitation } from "@/lib/redux/slices/recruiterInvitationSlice";
import { fetchCompanyById } from "@/lib/redux/slices/companySlice";

const invitationDefaults = { roleTitle: "", employmentType: "FULLTIME", salary: "", currency: "USD", description: "" };

export default function RecruiterExploreDetailPage({ profileId }) {
  const dispatch = useDispatch();
  const router = useRouter();
  const user = useSelector((state) => state.auth.user);
  const { currentExploreProfile: profile, loadingExploreProfile, errorExploreProfile } = useSelector((state) => state.recruiter);
  const { currentCompany } = useSelector((state) => state.company);
  const { submitting, submitError } = useSelector((state) => state.recruiterInvitations);
  const [form, setForm] = useState(invitationDefaults);
  const [success, setSuccess] = useState("");

  useEffect(() => { if (profileId) dispatch(fetchRecruiterProfileById(profileId)); }, [dispatch, profileId]);
  useEffect(() => { if (user?.recruiterProfile?.companyId) dispatch(fetchCompanyById(user.recruiterProfile.companyId)); }, [dispatch, user?.recruiterProfile?.companyId]);

  const ownerUserId = useMemo(() => currentCompany?.owner?.userId || currentCompany?.owner?.user?.id || currentCompany?.ownerId, [currentCompany]);
  const isOwner = Boolean(user?.id && ownerUserId && String(user.id) === String(ownerUserId));

  const sendInvite = async (event) => {
    event.preventDefault();
    if (!profile?.user?.email || !isOwner) return;
    setSuccess("");
    const payload = {
      email: profile.user.email,
      roleTitle: form.roleTitle,
      employmentType: form.employmentType,
      currency: form.currency,
      description: form.description,
      ...(form.salary !== "" ? { salary: Number(form.salary) } : {}),
    };
    const action = await dispatch(createRecruiterInvitation(payload));
    if (createRecruiterInvitation.fulfilled.match(action)) {
      setSuccess(`Invitation sent to ${profile.user.email}.`);
      setForm(invitationDefaults);
    }
  };

  if (loadingExploreProfile) return <main className="min-h-screen bg-[var(--df-paper)] px-6 py-12"><div className="mx-auto max-w-5xl animate-pulse"><div className="h-4 w-28 bg-[var(--df-paper-3)]"/><div className="mt-10 h-52 bg-[var(--df-paper-2)]"/><div className="mt-8 h-80 bg-[var(--df-paper-2)]"/></div></main>;
  if (errorExploreProfile || !profile) return <main className="min-h-[70vh] bg-[var(--df-paper)] px-6 py-20 text-center"><p className="text-xs uppercase tracking-widest text-[var(--df-muted)]">Profile unavailable</p><h1 className="mt-3 text-3xl font-semibold">Could not load this recruiter</h1><p className="mt-3 text-sm text-[var(--df-muted)]">{errorExploreProfile || "The profile may have been removed."}</p><Link href="/dashboard/recruiter/explore-recruiters" className="mt-7 inline-flex items-center gap-2 text-sm underline"><ArrowLeft size={15}/>Return to recruiter search</Link></main>;

  const name = profile.user?.name || "Recruiter";
  const initials = name.split(/\s+/).map((part) => part[0]).slice(0, 2).join("").toUpperCase();

  return (
    <main className="min-h-screen bg-[var(--df-paper)] text-[var(--df-text)]">
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-12">
        <Link href="/dashboard/recruiter/explore-recruiters" className="inline-flex items-center gap-2 text-xs text-[var(--df-muted)] hover:text-[var(--df-text)]"><ArrowLeft size={14}/>All recruiters</Link>
        <section className="mt-7 border-y border-[var(--df-line)] py-9 sm:py-12">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[var(--df-paper-3)] text-2xl font-semibold">{initials}</div>
            <div className="min-w-0 flex-1"><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--df-muted)]">Recruiter profile</p><h1 className="mt-2 text-4xl font-semibold tracking-[-0.05em]">{name}</h1><p className="mt-2 text-sm text-[var(--df-muted)]">{profile.jobTitle || "Recruiter"}{profile.company?.name ? ` · ${profile.company.name}` : ""}</p><div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-[var(--df-muted)]"><span className="inline-flex items-center gap-1.5"><MapPin size={14}/>{formatLocation(profile.locationPreference)}</span><span className="inline-flex items-center gap-1.5"><BriefcaseBusiness size={14}/>{profile.yearsOfExp == null ? "Experience not listed" : `${Number(profile.yearsOfExp)} years of experience`}</span>{profile.user?.isVerified && <span className="inline-flex items-center gap-1.5"><ShieldCheck size={14}/>Verified account</span>}</div></div>
            <a href={`mailto:${profile.user?.email}`} className="inline-flex items-center gap-2 border border-[var(--df-line)] px-4 py-3 text-xs"><ExternalLink size={14}/>Contact recruiter</a>
          </div>
        </section>

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="py-9">
            <SectionTitle>About</SectionTitle><p className="whitespace-pre-line text-sm leading-7 text-[var(--df-muted)]">{profile.bio || profile.description || "This recruiter has not added a profile summary."}</p>
            <div className="mt-12"><SectionTitle>Professional experience</SectionTitle>{profile.recruiterHistory?.length ? <div className="divide-y divide-[var(--df-line)]">{profile.recruiterHistory.map((history) => <div key={history.id} className="py-5 first:pt-0"><div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="font-semibold">{history.roleTitle}</h3><p className="mt-1 text-sm text-[var(--df-muted)]">{history.company?.name || "Company"}</p></div><span className="text-xs text-[var(--df-muted)]">{formatDate(history.startDate)} — {history.isCurrent ? "Present" : formatDate(history.endDate)}</span></div>{history.description && <p className="mt-3 text-sm leading-6 text-[var(--df-muted)]">{history.description}</p>}</div>)}</div> : <p className="text-sm text-[var(--df-muted)]">No professional history has been added.</p>}</div>
            {(profile.githubUrl || profile.portfolioUrl) && <div className="mt-12"><SectionTitle>Links</SectionTitle><div className="flex flex-wrap gap-3">{profile.portfolioUrl && <ExternalLinkButton href={profile.portfolioUrl}>Portfolio</ExternalLinkButton>}{profile.githubUrl && <ExternalLinkButton href={profile.githubUrl}>GitHub</ExternalLinkButton>}</div></div>}
          </div>

          <aside className="border-t border-[var(--df-line)] py-9 lg:border-l lg:border-t-0 lg:pl-8">
            <SectionTitle>Invite to your company</SectionTitle>
            {!isOwner ? <p className="text-sm leading-6 text-[var(--df-muted)]">Only your company owner can send recruiter invitations.</p> : profile.companyId === user?.recruiterProfile?.companyId ? <p className="text-sm leading-6 text-[var(--df-muted)]">This recruiter is already a member of your company.</p> : <form onSubmit={sendInvite} className="space-y-4">
              <div className="border border-[var(--df-line)] px-3 py-3"><p className="text-[9px] uppercase tracking-wider text-[var(--df-muted)]">Invitation email</p><p className="mt-1 break-all text-sm">{profile.user?.email}</p></div>
              <label className="block"><span className="mb-2 block text-[10px] font-medium uppercase tracking-wider text-[var(--df-muted)]">Role title</span><input required value={form.roleTitle} onChange={(e) => setForm({ ...form, roleTitle: e.target.value })} className="h-11 w-full border border-[var(--df-line)] bg-transparent px-3 text-sm outline-none" placeholder="Senior recruiter" /></label>
              <label className="block"><span className="mb-2 block text-[10px] font-medium uppercase tracking-wider text-[var(--df-muted)]">Employment type</span><select value={form.employmentType} onChange={(e) => setForm({ ...form, employmentType: e.target.value })} className="h-11 w-full border border-[var(--df-line)] bg-transparent px-3 text-sm"><option value="FULLTIME">Full time</option><option value="PARTTIME">Part time</option><option value="CONTRACT">Contract</option><option value="INTERN">Intern</option></select></label>
              <div className="grid grid-cols-[1fr_100px] gap-3"><label className="block"><span className="mb-2 block text-[10px] font-medium uppercase tracking-wider text-[var(--df-muted)]">Salary (optional)</span><input type="number" min="0" step="0.01" value={form.salary} onChange={(e) => setForm({ ...form, salary: e.target.value })} className="h-11 w-full border border-[var(--df-line)] bg-transparent px-3 text-sm" placeholder="0" /></label><label className="block"><span className="mb-2 block text-[10px] font-medium uppercase tracking-wider text-[var(--df-muted)]">Currency</span><select value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} className="h-11 w-full border border-[var(--df-line)] bg-transparent px-2 text-sm"><option>USD</option><option>EUR</option><option>PKR</option><option>INR</option><option>GBP</option><option>AED</option></select></label></div>
              <label className="block"><span className="mb-2 block text-[10px] font-medium uppercase tracking-wider text-[var(--df-muted)]">Message (optional)</span><textarea rows={4} maxLength={700} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full resize-y border border-[var(--df-line)] bg-transparent px-3 py-2.5 text-sm outline-none" placeholder="Share a few details about the opportunity." /></label>
              {submitError && <p className="text-xs text-red-700">{submitError}</p>}{success && <p className="inline-flex items-center gap-2 text-xs text-emerald-700"><CheckCircle2 size={14}/>{success}</p>}
              <button disabled={submitting} className="inline-flex w-full items-center justify-center gap-2 bg-[var(--df-text)] px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--df-paper)] disabled:opacity-50"><Send size={13}/>{submitting ? "Sending invitation…" : "Send invitation"}</button>
            </form>}
            <div className="mt-7 border-t border-[var(--df-line)] pt-5"><p className="text-[10px] uppercase tracking-wider text-[var(--df-muted)]">Invitation expiry</p><p className="mt-2 text-xs leading-5 text-[var(--df-muted)]">Invitations are valid for 24 hours. The recruiter must sign in with this email to accept.</p></div>
          </aside>
        </div>
      </div>
    </main>
  );
}

function SectionTitle({ children }) { return <div className="mb-5 flex items-center gap-3"><span className="text-[10px] font-semibold uppercase tracking-[0.17em]">{children}</span><span className="h-px flex-1 bg-[var(--df-line)]"/></div>; }
function ExternalLinkButton({ href, children }) { return <a href={href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 border border-[var(--df-line)] px-3 py-2 text-xs">{children}<ExternalLink size={12}/></a>; }
function formatLocation(value) { return ({ REMOTE: "Remote", HYBRID: "Hybrid", ONSITE: "On-site" })[value] || "Location preference not set"; }
function formatDate(value) { return value ? new Intl.DateTimeFormat("en", { month: "short", year: "numeric" }).format(new Date(value)) : "—"; }
