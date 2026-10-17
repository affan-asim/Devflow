"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    ArrowLeft,
    Check,
    FileText,
    Globe,
    Loader2,
    Upload,
    X,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { FiGithub } from "react-icons/fi";

import {
    fetchDeveloperProfile,
    updateDeveloperProfile,
    clearCurrentDeveloper,
    clearDeveloperErrors,
} from "@/lib/redux/slices/developerSlice";

import { fetchSkills } from "@/lib/redux/slices/skillSlice";

import api from "@/lib/api/axios";
import { uploadFileToStorage } from "@/lib/storage/uploadFile";

const MAX_RESUME_SIZE = 5 * 1024 * 1024;

const LOCATION_OPTIONS = [
    { value: "REMOTE", label: "Remote" },
    { value: "ONSITE", label: "On-site" },
    { value: "HYBRID", label: "Hybrid" },
];

function EditSkeleton() {
    return (
        <main className="min-h-screen bg-[var(--df-paper)] text-[var(--df-text)]">
            <div className="mx-auto max-w-[1100px] px-5 py-8 sm:px-8 lg:px-10 lg:py-12">
                <div className="h-3 w-32 animate-pulse bg-[var(--df-line)]" />

                <div className="mt-12 border-b border-[var(--df-line)] pb-8">
                    <div className="h-3 w-28 animate-pulse bg-[var(--df-line)]" />
                    <div className="mt-5 h-12 w-2/3 animate-pulse bg-[var(--df-line)]" />
                </div>

                <div className="space-y-5 py-8">
                    {[1, 2, 3, 4].map((item) => (
                        <div
                            key={item}
                            className="h-28 animate-pulse border border-[var(--df-line)]"
                        />
                    ))}
                </div>
            </div>
        </main>
    );
}

export default function EditDeveloperProfilePage() {
    const router = useRouter();
    const dispatch = useDispatch();

    const { user } = useSelector((state) => state.auth);

    const {
        currentDeveloper,
        loadingDetail,
        submitting,
        submitError,
        errorDetail,
    } = useSelector((state) => state.developers);

    const {
        skills: availableSkills = [],
        loading: skillsLoading,
    } = useSelector((state) => state.skills || {});

    const userId = user?.id;

    const [form, setForm] = useState({
        bio: "",
        yearsOfExp: "",
        githubUrl: "",
        portfolioUrl: "",
        locationPreference: "",
        skills: [],
    });

    const [resumeFile, setResumeFile] = useState(null);
    const [resumeTempKey, setResumeTempKey] = useState(null);
    const [uploadingResume, setUploadingResume] = useState(false);

    const [localError, setLocalError] = useState(null);
    const [initialized, setInitialized] = useState(false);

    useEffect(() => {
        if (!userId) return;

        dispatch(clearDeveloperErrors());
        dispatch(fetchDeveloperProfile(userId));
        dispatch(fetchSkills());

        return () => {
            dispatch(clearCurrentDeveloper());
        };
    }, [dispatch, userId]);

    useEffect(() => {
        if (!currentDeveloper || initialized) return;

        setForm({
            bio: currentDeveloper.bio || "",
            yearsOfExp:
                currentDeveloper.yearsOfExp !== null &&
                    currentDeveloper.yearsOfExp !== undefined
                    ? String(currentDeveloper.yearsOfExp)
                    : "",
            githubUrl: currentDeveloper.githubUrl || "",
            portfolioUrl: currentDeveloper.portfolioUrl || "",
            locationPreference:
                currentDeveloper.locationPreference || "",
            skills: (currentDeveloper.skills || []).map(
                (skill) => skill.id
            ),
        });

        setInitialized(true);
    }, [currentDeveloper, initialized]);

    function handleChange(event) {
        const { name, value } = event.target;

        setForm((current) => ({
            ...current,
            [name]: value,
        }));
    }

    function toggleSkill(skillId) {
        setForm((current) => {
            const exists = current.skills.includes(skillId);

            return {
                ...current,
                skills: exists
                    ? current.skills.filter((id) => id !== skillId)
                    : [...current.skills, skillId],
            };
        });
    }

    async function handleResumeChange(event) {
        const file = event.target.files?.[0];

        if (!file) return;

        if (file.size > MAX_RESUME_SIZE) {
            setLocalError("Resume must be 5 MB or smaller.");
            setResumeFile(null);
            setResumeTempKey(null);
            event.target.value = "";
            return;
        }

        setLocalError(null);
        setResumeFile(file);
        setUploadingResume(true);
        let resumeTempKey;

        try {
            resumeTempKey = await uploadFileToStorage(
                file,
                "RESUME"
            );

            if (!resumeTempKey) {
                throw new Error("Temp key in not recicved from server.");
            }

            setResumeTempKey(resumeTempKey);
        } catch (error) {
            setResumeFile(null);
            setResumeTempKey(null);

            setLocalError(
                error.response?.data?.error ||
                error.message ||
                "Failed to upload resume."
            );
        } finally {
            setUploadingResume(false);
        }

        event.target.value = "";
    }

    function removeResume() {
        setResumeFile(null);
        setResumeTempKey(null);
    }

    async function handleSubmit(event) {
        event.preventDefault();

        setLocalError(null);

        const selectedSkillObjects = form.skills
        .map((skillId) => availableSkills.find((s) => s.id === skillId))
        .filter(Boolean);

        const payload = {
            bio: form.bio.trim() || null,
            yearsOfExp:
                form.yearsOfExp === ""
                    ? null
                    : Number(form.yearsOfExp),
            githubUrl: form.githubUrl.trim() || null,
            portfolioUrl: form.portfolioUrl.trim() || null,
            locationPreference:
                form.locationPreference || null,
            skills: selectedSkillObjects,
        };

        if (resumeTempKey) {
            payload.tempKey = resumeTempKey;
        }

        const result = await dispatch(
            updateDeveloperProfile(payload)
        );

        if (updateDeveloperProfile.fulfilled.match(result)) {
            router.push("/dashboard/developer/profile");
        }
    }

    const selectedSkillCount = form.skills.length;

    const groupedSkills = useMemo(() => {
        return availableSkills.reduce((groups, skill) => {
            const category = skill.category || "OTHER";

            if (!groups[category]) {
                groups[category] = [];
            }

            groups[category].push(skill);

            return groups;
        }, {});
    }, [availableSkills]);

    if (loadingDetail || !currentDeveloper || !initialized) {
        return <EditSkeleton />;
    }

    if (errorDetail) {
        return (
            <main className="min-h-screen bg-[var(--df-paper)] text-[var(--df-text)]">
                <div className="mx-auto max-w-[800px] px-5 py-12">
                    <div className="border border-[var(--df-line)] p-8">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--df-muted)]">
                            Developer profile
                        </p>

                        <h1 className="mt-3 text-3xl font-semibold">
                            Unable to load profile.
                        </h1>

                        <p className="mt-3 text-sm text-[var(--df-muted)]">
                            {errorDetail}
                        </p>

                        <Link
                            href="/dashboard/profile"
                            className="mt-6 inline-flex h-11 items-center gap-2 bg-[var(--df-text)] px-5 text-sm text-[var(--df-paper)]"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to profile
                        </Link>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-[var(--df-paper)] text-[var(--df-text)]">
            <div className="mx-auto max-w-[1100px] px-5 py-8 sm:px-8 lg:px-10 lg:py-12">
                <Link
                    href="/dashboard/profile"
                    className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--df-muted)] transition hover:text-[var(--df-text)]"
                >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Back to profile
                </Link>

                <section className="mt-10 border-b border-[var(--df-line)] pb-8 lg:mt-14">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--df-muted)]">
                        Profile settings
                    </p>

                    <h1 className="mt-4 text-4xl font-semibold tracking-[-0.035em] sm:text-5xl">
                        Edit your developer profile.
                    </h1>

                    <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--df-muted)]">
                        Keep your experience, skills, links, and resume current so
                        recruiters see the most accurate version of your profile.
                    </p>
                </section>

                <form onSubmit={handleSubmit} className="py-8">
                    <div className="space-y-5">
                        {/* About */}
                        <section className="border border-[var(--df-line)] p-5 sm:p-6">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--df-muted)]">
                                About
                            </p>

                            <h2 className="mt-2 text-xl font-semibold">
                                Professional overview
                            </h2>

                            <div className="mt-6">
                                <label className="text-[10px] font-semibold uppercase tracking-[0.12em]">
                                    Bio
                                </label>

                                <textarea
                                    name="bio"
                                    value={form.bio}
                                    onChange={handleChange}
                                    rows={7}
                                    placeholder="Tell recruiters about your experience, strengths, and what you build."
                                    className="mt-2 w-full resize-y border border-[var(--df-line)] bg-transparent px-4 py-3 text-sm leading-6 outline-none transition placeholder:text-[var(--df-muted)] focus:border-[var(--df-text)]"
                                />
                            </div>
                        </section>

                        {/* Experience */}
                        <section className="border border-[var(--df-line)] p-5 sm:p-6">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--df-muted)]">
                                Experience
                            </p>

                            <div className="mt-5 grid gap-5 sm:grid-cols-2">
                                <div>
                                    <label
                                        htmlFor="yearsOfExp"
                                        className="text-[10px] font-semibold uppercase tracking-[0.12em]"
                                    >
                                        Years of experience
                                    </label>

                                    <input
                                        id="yearsOfExp"
                                        name="yearsOfExp"
                                        type="number"
                                        min="0"
                                        step="0.5"
                                        value={form.yearsOfExp}
                                        onChange={handleChange}
                                        placeholder="e.g. 2"
                                        className="mt-2 h-11 w-full border border-[var(--df-line)] bg-transparent px-3 text-sm outline-none transition placeholder:text-[var(--df-muted)] focus:border-[var(--df-text)]"
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="locationPreference"
                                        className="text-[10px] font-semibold uppercase tracking-[0.12em]"
                                    >
                                        Work preference
                                    </label>

                                    <select
                                        id="locationPreference"
                                        name="locationPreference"
                                        value={form.locationPreference}
                                        onChange={handleChange}
                                        className="mt-2 h-11 w-full border border-[var(--df-line)] bg-[var(--df-paper)] px-3 text-sm outline-none transition focus:border-[var(--df-text)]"
                                    >
                                        <option value="">Select preference</option>

                                        {LOCATION_OPTIONS.map((option) => (
                                            <option
                                                key={option.value}
                                                value={option.value}
                                            >
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </section>

                        {/* Skills */}
                        <section className="border border-[var(--df-line)] p-5 sm:p-6">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                                <div>
                                    <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--df-muted)]">
                                        Skills
                                    </p>

                                    <h2 className="mt-2 text-xl font-semibold">
                                        Technical capabilities
                                    </h2>
                                </div>

                                <p className="text-xs text-[var(--df-muted)]">
                                    {selectedSkillCount} selected
                                </p>
                            </div>

                            {skillsLoading ? (
                                <div className="mt-6 flex flex-wrap gap-2">
                                    {Array.from({ length: 8 }).map((_, index) => (
                                        <div
                                            key={index}
                                            className="h-9 w-20 animate-pulse bg-[var(--df-line)]"
                                        />
                                    ))}
                                </div>
                            ) : availableSkills.length > 0 ? (
                                <div className="mt-6 space-y-6">
                                    {Object.entries(groupedSkills).map(
                                        ([category, categorySkills]) => (
                                            <div key={category}>
                                                <p className="mb-3 text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--df-muted)]">
                                                    {category}
                                                </p>

                                                <div className="flex flex-wrap gap-2">
                                                    {categorySkills
                                                        .filter(
                                                            (skill) =>
                                                                skill.isActive !== false
                                                        )
                                                        .map((skill) => {
                                                            const selected =
                                                                form.skills.includes(skill.id);

                                                            return (
                                                                <button
                                                                    key={skill.id}
                                                                    type="button"
                                                                    onClick={() =>
                                                                        toggleSkill(skill.id)
                                                                    }
                                                                    className={`inline-flex items-center gap-2 border px-3 py-2 text-xs transition ${selected
                                                                            ? "border-[var(--df-text)] bg-[var(--df-text)] text-[var(--df-paper)]"
                                                                            : "border-[var(--df-line)] hover:border-[var(--df-text)]"
                                                                        }`}
                                                                >
                                                                    {selected && (
                                                                        <Check className="h-3 w-3" />
                                                                    )}

                                                                    {skill.name}
                                                                </button>
                                                            );
                                                        })}
                                                </div>
                                            </div>
                                        )
                                    )}
                                </div>
                            ) : (
                                <p className="mt-6 text-sm text-[var(--df-muted)]">
                                    No skills are currently available.
                                </p>
                            )}
                        </section>

                        {/* Links */}
                        <section className="border border-[var(--df-line)] p-5 sm:p-6">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--df-muted)]">
                                Links
                            </p>

                            <div className="mt-5 space-y-5">
                                <div>
                                    <label
                                        htmlFor="githubUrl"
                                        className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.12em]"
                                    >
                                        <FiGithub className="h-3.5 w-3.5" />
                                        GitHub URL
                                    </label>

                                    <input
                                        id="githubUrl"
                                        name="githubUrl"
                                        type="url"
                                        value={form.githubUrl}
                                        onChange={handleChange}
                                        placeholder="https://github.com/username"
                                        className="mt-2 h-11 w-full border border-[var(--df-line)] bg-transparent px-3 text-sm outline-none transition placeholder:text-[var(--df-muted)] focus:border-[var(--df-text)]"
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="portfolioUrl"
                                        className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.12em]"
                                    >
                                        <Globe className="h-3.5 w-3.5" />
                                        Portfolio URL
                                    </label>

                                    <input
                                        id="portfolioUrl"
                                        name="portfolioUrl"
                                        type="url"
                                        value={form.portfolioUrl}
                                        onChange={handleChange}
                                        placeholder="https://yourportfolio.com"
                                        className="mt-2 h-11 w-full border border-[var(--df-line)] bg-transparent px-3 text-sm outline-none transition placeholder:text-[var(--df-muted)] focus:border-[var(--df-text)]"
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Resume */}
                        <section className="border border-[var(--df-line)] p-5 sm:p-6">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--df-muted)]">
                                Resume
                            </p>

                            <h2 className="mt-2 text-xl font-semibold">
                                Keep your resume current.
                            </h2>

                            <div className="mt-5 border border-[var(--df-line)] p-4">
                                {resumeFile ? (
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex min-w-0 items-center gap-3">
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-[var(--df-text)] text-[var(--df-paper)]">
                                                <FileText className="h-4 w-4" />
                                            </div>

                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-medium">
                                                    {resumeFile.name}
                                                </p>

                                                <p className="mt-1 inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.1em] text-[var(--df-muted)]">
                                                    {uploadingResume && (
                                                        <Loader2
                                                            className="h-3 w-3 animate-spin"
                                                            aria-hidden="true"
                                                        />
                                                    )}
                                                    {uploadingResume ? "Uploading resume" : "New resume"}
                                                </p>
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={removeResume}
                                            disabled={uploadingResume}
                                            aria-label="Remove selected resume"
                                            className="flex h-8 w-8 shrink-0 items-center justify-center border border-[var(--df-line)] hover:border-[var(--df-text)]"
                                        >
                                            <X className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center border border-[var(--df-line)]">
                                                <FileText className="h-4 w-4" />
                                            </div>

                                            <div>
                                                <p className="text-sm font-medium">
                                                    {currentDeveloper.resumeId
                                                        ? "Resume uploaded"
                                                        : "No resume uploaded"}
                                                </p>

                                                <p className="mt-1 text-[10px] text-[var(--df-muted)]">
                                                    Upload a new resume to replace the current one.
                                                </p>
                                            </div>
                                        </div>

                                        <label
                                            htmlFor="resume"
                                            className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 border border-[var(--df-line)] px-4 text-[10px] font-semibold uppercase tracking-[0.1em] transition hover:border-[var(--df-text)]"
                                        >
                                            {uploadingResume ? (
                                                <>
                                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                    Uploading
                                                </>
                                            ) : (
                                                <>
                                                    <Upload className="h-3.5 w-3.5" />
                                                    Replace resume
                                                </>
                                            )}
                                        </label>
                                    </div>
                                )}

                                <input
                                    id="resume"
                                    type="file"
                                    accept=".pdf,.doc,.docx"
                                    disabled={uploadingResume || submitting}
                                    onChange={handleResumeChange}
                                    className="hidden"
                                />
                            </div>
                        </section>

                        {/* Errors */}
                        {(localError || submitError) && (
                            <div className="border border-[var(--df-line)] p-5">
                                <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--df-muted)]">
                                    Unable to save changes
                                </p>

                                <p className="mt-2 text-sm leading-6">
                                    {localError || submitError}
                                </p>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex flex-col-reverse gap-3 border-t border-[var(--df-line)] pt-6 sm:flex-row sm:justify-end">
                            <Link
                                href="/dashboard/developer/profile"
                                className="inline-flex h-11 items-center justify-center border border-[var(--df-line)] px-6 text-sm font-medium transition hover:border-[var(--df-text)]"
                            >
                                Cancel
                            </Link>

                            <button
                                type="submit"
                                disabled={
                                    submitting ||
                                    uploadingResume
                                }
                                className="inline-flex h-11 items-center justify-center gap-2 bg-[var(--df-text)] px-6 text-sm font-medium text-[var(--df-paper)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Saving changes...
                                    </>
                                ) : (
                                    <>
                                        <Check className="h-4 w-4" />
                                        Save profile
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </main>
    );
}
