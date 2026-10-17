"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ExternalLink, FileText, Globe, Mail, MapPin, Pencil } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { FiGithub } from "react-icons/fi";
import { clearRecruiterErrors, fetchRecruiterProfile } from "@/lib/redux/slices/recruiterSlice";
import api from "@/lib/api/axios";

const LOCATION_LABELS = { REMOTE: "Remote", ONSITE: "On-site", HYBRID: "Hybrid" };

function ProfileLoading() {
  return <main className="min-h-screen bg-[var(--df-paper)] p-8"><div className="mx-auto max-w-4xl animate-pulse space-y-5"><div className="h-12 w-1/2 bg-[var(--df-line)]" /><div className="h-48 border border-[var(--df-line)]" /></div></main>;
}

export default function RecruiterProfilePage() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { profile, loadingProfile, errorProfile } = useSelector((state) => state.recruiter);
  const [resumeError, setResumeError] = useState(null);

  const viewResume = async () => {
    if (!profile?.resume?.key) return;
    setResumeError(null);
    const resumeWindow = window.open("about:blank", "_blank");
    try {
      const response = await api.get(`/api/get-presignedUrl?key=${encodeURIComponent(profile.resume.key)}`);
      if (resumeWindow) resumeWindow.location.href = response.data.data;
      else window.location.href = response.data.data;
    } catch (error) {
      resumeWindow?.close();
      setResumeError(error.response?.data?.error || "Unable to open your resume.");
    }
  };

  useEffect(() => {
    if (!user?.id) return;
    dispatch(clearRecruiterErrors());
    dispatch(fetchRecruiterProfile());
  }, [dispatch, user?.id]);

  if (!user?.id || loadingProfile) return <ProfileLoading />;

  if (errorProfile || !profile) {
    return <main className="grid min-h-screen place-items-center bg-[var(--df-paper)] p-6 text-center text-sm"><div><h1 className="text-2xl font-semibold">Unable to load recruiter profile</h1><p className="mt-3 text-[var(--df-muted)]">{errorProfile || "Complete recruiter onboarding to create your profile."}</p><button onClick={() => dispatch(fetchRecruiterProfile())} className="mt-5 border border-[var(--df-line)] px-4 py-2">Try again</button></div></main>;
  }

  const name = profile.user?.name || user.name || "Recruiter";
  const recruiterHistory = profile.recruiterHistory || [];
  const links = [
    { label: "GitHub", href: profile.githubUrl, icon: FiGithub },
    { label: "Portfolio", href: profile.portfolioUrl, icon: Globe },
  ].filter((link) => link.href);

  return (
    <main className="min-h-screen bg-[var(--df-paper)] text-[var(--df-text)]">
      <div className="mx-auto max-w-[1100px] px-5 py-8 sm:px-8 lg:px-10 lg:py-12">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--df-muted)] hover:text-[var(--df-text)]"><ArrowLeft className="h-4 w-4" />Dashboard</Link>
        <header className="mt-10 flex flex-col gap-6 border-b border-[var(--df-line)] pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--df-muted)]">Recruiter profile</p>
            <div className="mt-4 flex items-center gap-4">
              <div className="grid h-16 w-16 place-items-center bg-[var(--df-text)] text-xl font-semibold text-[var(--df-paper)]">{name.charAt(0).toUpperCase()}</div>
              <div><h1 className="text-4xl font-semibold tracking-tight">{name}</h1><p className="mt-2 flex items-center gap-2 text-sm text-[var(--df-muted)]"><Mail className="h-4 w-4" />{profile.user?.email || user.email}</p></div>
            </div>
          </div>
          <Link href="/dashboard/recruiter/profile/edit" className="inline-flex h-11 items-center justify-center gap-2 bg-[var(--df-text)] px-5 text-sm font-medium text-[var(--df-paper)]"><Pencil className="h-4 w-4" />Edit profile</Link>
        </header>

        <div className="grid gap-8 py-8 lg:grid-cols-[1fr_320px]">
          <div className="space-y-8">
            <section className="border-b border-[var(--df-line)] pb-7">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--df-muted)]">Role</p>
              <h2 className="mt-2 text-2xl font-semibold">{profile.jobTitle || "Recruiter"}</h2>
            </section>
            <section>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--df-muted)]">About</p>
              <h2 className="mt-2 text-2xl font-semibold">Professional overview</h2>
              <p className="mt-4 whitespace-pre-line text-sm leading-7">{profile.bio || profile.description || "No professional summary has been added yet."}</p>
              {profile.bio && profile.description && <p className="mt-4 whitespace-pre-line text-sm leading-7 text-[var(--df-muted)]">{profile.description}</p>}
            </section>
            <section className="border-t border-[var(--df-line)] pt-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--df-muted)]">Experience</p>
              <h2 className="mt-2 text-2xl font-semibold">Recruiter history</h2>
              <div className="mt-4 space-y-3">
                {recruiterHistory.length ? recruiterHistory.map((history) => (
                  <article key={history.id} className="border border-[var(--df-line)] p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-semibold">{history.roleTitle || "Recruiter"}</h3>
                        <p className="mt-1 text-sm text-[var(--df-muted)]">{history.company?.name || "Company"}</p>
                      </div>
                      {history.isCurrent && <span className="border border-[var(--df-line)] px-2 py-1 text-[9px] font-semibold uppercase tracking-wider">Current</span>}
                    </div>
                    {history.description && <p className="mt-3 text-sm leading-6">{history.description}</p>}
                    {(history.startDate || history.endDate) && <p className="mt-3 text-xs text-[var(--df-muted)]">{history.startDate ? new Date(history.startDate).toLocaleDateString() : "Start date unavailable"} – {history.endDate ? new Date(history.endDate).toLocaleDateString() : history.isCurrent ? "Present" : "End date unavailable"}</p>}
                  </article>
                )) : <p className="text-sm text-[var(--df-muted)]">No recruiter history has been added yet.</p>}
              </div>
            </section>
            <section className="border-t border-[var(--df-line)] pt-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--df-muted)]">Resume</p>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border border-[var(--df-line)] p-4">
                <div className="flex items-center gap-3"><FileText className="h-5 w-5" /><div><p className="text-sm font-medium">{profile.resume ? "Resume uploaded" : "No resume uploaded"}</p><p className="mt-1 text-xs text-[var(--df-muted)]">{profile.resume ? "Open your resume in a new page" : "Add a resume from Edit profile"}</p></div></div>
                {profile.resume && <button type="button" onClick={viewResume} className="border border-[var(--df-line)] px-4 py-2 text-sm hover:border-[var(--df-text)]">View resume</button>}
              </div>
              {resumeError && <p role="alert" className="mt-2 text-sm text-red-700">{resumeError}</p>}
            </section>
            <section className="border-t border-[var(--df-line)] pt-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--df-muted)]">Professional links</p>
              <div className="mt-4 flex flex-wrap gap-3">
                {links.length ? links.map(({ label, href, icon: Icon }) => <a key={label} href={href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 border border-[var(--df-line)] px-4 py-3 text-sm hover:border-[var(--df-text)]"><Icon className="h-4 w-4" />{label}<ExternalLink className="h-3.5 w-3.5 text-[var(--df-muted)]" /></a>) : <p className="text-sm text-[var(--df-muted)]">No external links have been added.</p>}
              </div>
            </section>
          </div>
          <aside className="h-fit border border-[var(--df-line)] p-5 sm:p-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--df-muted)]">Profile details</p>
            <div className="mt-5 space-y-5">
              <div><p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--df-muted)]">Experience</p><p className="mt-1 text-sm">{profile.yearsOfExp == null ? "Not specified" : `${profile.yearsOfExp} ${Number(profile.yearsOfExp) === 1 ? "year" : "years"}`}</p></div>
              <div><p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--df-muted)]">Work preference</p><p className="mt-1 flex items-center gap-2 text-sm"><MapPin className="h-4 w-4 text-[var(--df-muted)]" />{LOCATION_LABELS[profile.locationPreference] || "Not specified"}</p></div>
              {profile.company && <div><p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--df-muted)]">Company</p><p className="mt-1 text-sm">{profile.company.name}</p></div>}
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
