"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, FileText, Loader2, Upload, X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  clearRecruiterErrors,
  fetchRecruiterProfile,
  updateRecruiterProfile,
} from "@/lib/redux/slices/recruiterSlice";
import { uploadFileToStorage } from "@/lib/storage/uploadFile";
import api from "@/lib/api/axios";

const LOCATION_OPTIONS = [
  { value: "REMOTE", label: "Remote" },
  { value: "ONSITE", label: "On-site" },
  { value: "HYBRID", label: "Hybrid" },
];

const EMPTY_FORM = {
  bio: "",
  description: "",
  jobTitle: "",
  yearsOfExp: "",
  githubUrl: "",
  portfolioUrl: "",
  locationPreference: "REMOTE",
};

export default function EditRecruiterProfilePage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { user } = useSelector((state) => state.auth);
  const { profile, loadingProfile, submitting, submitError, errorProfile } = useSelector((state) => state.recruiter);
  const [form, setForm] = useState(EMPTY_FORM);
  const [initialized, setInitialized] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeTempKey, setResumeTempKey] = useState(null);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [localError, setLocalError] = useState(null);

  useEffect(() => {
    if (!user?.id) return;
    dispatch(clearRecruiterErrors());
    dispatch(fetchRecruiterProfile());
  }, [dispatch, user?.id]);

  useEffect(() => {
    if (!profile || initialized) return;
    setForm({
      bio: profile.bio || "",
      description: profile.description || "",
      jobTitle: profile.jobTitle || "",
      yearsOfExp: profile.yearsOfExp == null ? "" : String(profile.yearsOfExp),
      githubUrl: profile.githubUrl || "",
      portfolioUrl: profile.portfolioUrl || "",
      locationPreference: profile.locationPreference || "REMOTE",
    });
    setInitialized(true);
  }, [profile, initialized]);

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleResumeChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const acceptedTypes = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    if (!acceptedTypes.includes(file.type)) {
      setLocalError("Choose a PDF, DOC, or DOCX file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setLocalError("Resume must be 5MB or smaller.");
      return;
    }

    setLocalError(null);
    setResumeFile(file);
    setUploadingResume(true);
    try {
      const tempKey = await uploadFileToStorage(file, "RESUME");
      if (!tempKey) throw new Error("The upload did not return a file key.");
      setResumeTempKey(tempKey);
    } catch (error) {
      setResumeFile(null);
      setResumeTempKey(null);
      setLocalError(error.response?.data?.error || error.message || "Failed to upload resume.");
    } finally {
      setUploadingResume(false);
    }
  };

  const openCurrentResume = async () => {
    if (!profile?.resume?.key) return;
    const resumeWindow = window.open("about:blank", "_blank");
    try {
      const response = await api.get(`/api/get-presignedUrl?key=${encodeURIComponent(profile.resume.key)}`);
      if (resumeWindow) resumeWindow.location.href = response.data.data;
      else window.location.href = response.data.data;
    } catch (error) {
      resumeWindow?.close();
      setLocalError(error.response?.data?.error || "Unable to open the current resume.");
    }
  };

  const submit = async (event) => {
    event.preventDefault();
    const payload = {
      ...form,
      yearsOfExp: form.yearsOfExp === "" ? undefined : Number(form.yearsOfExp),
      ...(resumeTempKey ? { tempKey: resumeTempKey } : {}),
    };
    const result = await dispatch(updateRecruiterProfile(payload));
    if (updateRecruiterProfile.fulfilled.match(result)) {
      router.push("/dashboard/independent-recruiter/profile");
    }
  };

  if (!user?.id || loadingProfile || (!initialized && profile)) {
    return <main className="grid min-h-screen place-items-center bg-[var(--df-paper)]"><Loader2 className="h-5 w-5 animate-spin" /></main>;
  }

  const inputClass = "mt-2 h-11 w-full border border-[var(--df-line)] bg-transparent px-3 text-sm outline-none focus:border-[var(--df-text)]";
  const labelClass = "text-[10px] font-semibold uppercase tracking-[0.12em]";

  return (
    <main className="min-h-screen bg-[var(--df-paper)] text-[var(--df-text)]">
      <div className="mx-auto max-w-[900px] px-5 py-8 sm:px-8 lg:px-10 lg:py-12">
        <Link href="/dashboard/independent-recruiter/profile" className="inline-flex items-center gap-2 text-xs text-[var(--df-muted)] hover:text-[var(--df-text)]"><ArrowLeft className="h-4 w-4" />Back to profile</Link>
        <header className="mt-10 border-b border-[var(--df-line)] pb-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--df-muted)]">Recruiter profile</p>
          <h1 className="mt-3 text-3xl font-semibold">Edit profile</h1>
        </header>

        {(errorProfile || (!profile && !loadingProfile)) && <p className="mt-6 border border-[var(--df-line)] p-4 text-sm">{errorProfile || "Recruiter profile not found. Complete recruiter onboarding first."}</p>}

        {profile && <form onSubmit={submit} className="mt-6 space-y-5">
          <section className="grid gap-5 border border-[var(--df-line)] p-5 sm:grid-cols-2 sm:p-6">
            <label className={labelClass}>Job title<input name="jobTitle" value={form.jobTitle} onChange={updateField} className={inputClass} placeholder="Talent acquisition manager" /></label>
            <label className={labelClass}>Years of experience<input name="yearsOfExp" type="number" min="0" step="0.1" value={form.yearsOfExp} onChange={updateField} className={inputClass} placeholder="e.g. 5" /></label>
            <label className={`${labelClass} sm:col-span-2`}>Work preference<select name="locationPreference" value={form.locationPreference} onChange={updateField} className={inputClass}>{LOCATION_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
            <label className={`${labelClass} sm:col-span-2`}>Bio<textarea name="bio" value={form.bio} onChange={updateField} maxLength={500} rows={4} className="mt-2 w-full border border-[var(--df-line)] bg-transparent p-3 text-sm outline-none focus:border-[var(--df-text)]" placeholder="A short professional introduction" /></label>
            <label className={`${labelClass} sm:col-span-2`}>Description<textarea name="description" value={form.description} onChange={updateField} maxLength={700} rows={5} className="mt-2 w-full border border-[var(--df-line)] bg-transparent p-3 text-sm outline-none focus:border-[var(--df-text)]" placeholder="Your recruiting background and focus" /></label>
          </section>

          <section className="grid gap-5 border border-[var(--df-line)] p-5 sm:grid-cols-2 sm:p-6">
            <label className={labelClass}>GitHub URL<input name="githubUrl" type="url" value={form.githubUrl} onChange={updateField} className={inputClass} placeholder="https://github.com/username" /></label>
            <label className={labelClass}>Portfolio URL<input name="portfolioUrl" type="url" value={form.portfolioUrl} onChange={updateField} className={inputClass} placeholder="https://example.com" /></label>
          </section>

          <section className="border border-[var(--df-line)] p-5 sm:p-6">
            <p className={labelClass}>Resume</p>
            <div className="mt-4 flex flex-col gap-4 border border-[var(--df-line)] p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <FileText className="h-5 w-5 shrink-0" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{resumeFile?.name || (profile.resume ? "Resume uploaded" : "No resume uploaded")}</p>
                  <p className="mt-1 text-xs text-[var(--df-muted)]">PDF, DOC or DOCX Â· Maximum 5MB</p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {profile.resume && !resumeFile && <button type="button" onClick={openCurrentResume} className="border border-[var(--df-line)] px-3 py-2 text-xs hover:border-[var(--df-text)]">View resume</button>}
                {resumeFile && <button type="button" onClick={() => { setResumeFile(null); setResumeTempKey(null); }} className="border border-[var(--df-line)] p-2" aria-label="Remove selected resume"><X className="h-4 w-4" /></button>}
                <label htmlFor="recruiter-resume" className="inline-flex cursor-pointer items-center gap-2 bg-[var(--df-text)] px-3 py-2 text-xs text-[var(--df-paper)]"><Upload className="h-3.5 w-3.5" />{uploadingResume ? "Uploading..." : profile.resume ? "Replace" : "Upload"}</label>
                <input id="recruiter-resume" type="file" accept=".pdf,.doc,.docx" disabled={uploadingResume || submitting} onChange={handleResumeChange} className="hidden" />
              </div>
            </div>
          </section>

          {(submitError || localError) && <p className="border border-red-300 p-4 text-sm text-red-700">{localError || submitError}</p>}
          <div className="flex justify-end border-t border-[var(--df-line)] pt-5">
            <button type="submit" disabled={submitting} className="inline-flex h-11 items-center gap-2 bg-[var(--df-text)] px-5 text-sm font-medium text-[var(--df-paper)] disabled:opacity-50">{submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}{submitting ? "Saving..." : "Save profile"}</button>
          </div>
        </form>}
      </div>
    </main>
  );
}
