"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
    ArrowLeft,
    ArrowUpRight,
    Check,
    FileText,
    Loader2,
    Upload,
    X,
} from "lucide-react";

import {
    fetchDeveloperApplicationById,
    updateApplication,
    clearCurrentApplication,
    clearApplicationErrors,
} from "@/lib/redux/slices/applicationSlice";

import api from "@/lib/api/axios";
import { uploadFileToStorage } from "@/lib/storage/uploadFile";

function formatDate(date) {
    if (!date) return "—";

    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    }).format(new Date(date));
}

function getStatusLabel(status) {
    switch (status) {
        case "PENDING":
            return "Pending";
        case "REVIEW":
            return "In review";
        case "ACCEPTED":
            return "Accepted";
        case "REJECTED":
            return "Rejected";
        default:
            return status || "Unknown";
    }
}

function StatusBadge({ status }) {
    const isPending = status === "PENDING";

    return (
        <span
            className={`inline-flex items-center border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${isPending
                    ? "border-[var(--df-text)] bg-[var(--df-text)] text-[var(--df-paper)]"
                    : "border-[var(--df-line)] text-[var(--df-muted)]"
                }`}
        >
            {getStatusLabel(status)}
        </span>
    );
}

function DocumentUpload({
    label,
    description,
    existingFile,
    selectedFile,
    onChange,
    onRemove,
    disabled,
    accept,
}) {
    const inputId = `file-${label.toLowerCase().replace(/\s+/g, "-")}`;

    return (
        <div className="border border-[var(--df-line)]">
            <div className="border-b border-[var(--df-line)] p-5">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--df-muted)]">
                            {label}
                        </p>

                        <p className="mt-2 text-sm leading-6 text-[var(--df-muted)]">
                            {description}
                        </p>
                    </div>

                    <FileText className="h-5 w-5 shrink-0 text-[var(--df-muted)]" />
                </div>
            </div>

            <div className="p-5">
                {selectedFile ? (
                    <div className="flex items-center justify-between gap-4 border border-[var(--df-line)] p-4">
                        <div className="flex min-w-0 items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center bg-[var(--df-text)] text-[var(--df-paper)]">
                                <FileText className="h-4 w-4" />
                            </div>

                            <div className="min-w-0">
                                <p className="truncate text-sm font-medium">
                                    {selectedFile.name}
                                </p>

                                <p className="mt-1 text-[10px] uppercase tracking-[0.1em] text-[var(--df-muted)]">
                                    New file ·{" "}
                                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                            </div>
                        </div>

                        {!disabled && (
                            <button
                                type="button"
                                onClick={onRemove}
                                className="flex h-8 w-8 shrink-0 items-center justify-center border border-[var(--df-line)] transition hover:border-[var(--df-text)]"
                                aria-label={`Remove ${label}`}
                            >
                                <X className="h-3.5 w-3.5" />
                            </button>
                        )}
                    </div>
                ) : existingFile ? (
                    <div className="border border-[var(--df-line)] p-4">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex min-w-0 items-center gap-3">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center border border-[var(--df-line)]">
                                    <FileText className="h-4 w-4" />
                                </div>

                                <div className="min-w-0">
                                    <p className="text-sm font-medium">
                                        Current {label.toLowerCase()}
                                    </p>

                                    <p className="mt-1 truncate text-[10px] text-[var(--df-muted)]">
                                        {existingFile.key?.split("/").pop() || "Uploaded document"}
                                    </p>
                                </div>
                            </div>

                            {!disabled && (
                                <label
                                    htmlFor={inputId}
                                    className="inline-flex h-9 shrink-0 cursor-pointer items-center justify-center gap-2 border border-[var(--df-line)] px-3 text-[10px] font-semibold uppercase tracking-[0.1em] transition hover:border-[var(--df-text)]"
                                >
                                    <Upload className="h-3.5 w-3.5" />
                                    Replace
                                </label>
                            )}
                        </div>
                    </div>
                ) : (
                    <label
                        htmlFor={inputId}
                        className={`flex min-h-[130px] cursor-pointer flex-col items-center justify-center border border-dashed border-[var(--df-line)] px-5 text-center transition ${disabled
                                ? "cursor-not-allowed opacity-50"
                                : "hover:border-[var(--df-text)]"
                            }`}
                    >
                        <Upload className="h-5 w-5 text-[var(--df-muted)]" />

                        <p className="mt-3 text-sm font-medium">
                            Upload {label.toLowerCase()}
                        </p>

                        <p className="mt-1 text-[10px] text-[var(--df-muted)]">
                            Click to choose a file
                        </p>
                    </label>
                )}

                <input
                    id={inputId}
                    type="file"
                    accept={accept}
                    disabled={disabled}
                    onChange={(event) => {
                        const file = event.target.files?.[0];

                        if (file) {
                            onChange(file);
                        }

                        event.target.value = "";
                    }}
                    className="hidden"
                />
            </div>
        </div>
    );
}

function NotEditableState({ application }) {
    return (
        <div className="border border-[var(--df-line)] p-6 sm:p-8">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--df-muted)]">
                Application locked
            </p>

            <h2 className="mt-3 text-2xl font-semibold tracking-tight">
                This application can no longer be edited.
            </h2>

            <p className="mt-3 max-w-xl text-sm leading-6 text-[var(--df-muted)]">
                Applications can only be updated while they are pending. This
                application is currently{" "}
                <span className="font-medium text-[var(--df-text)]">
                    {getStatusLabel(application?.status)}
                </span>
                .
            </p>

            <div className="mt-6">
                <Link
                    href={`/dashboard/applications/${application.id}`}
                    className="inline-flex h-11 items-center gap-2 bg-[var(--df-text)] px-5 text-sm font-medium text-[var(--df-paper)] transition hover:opacity-90"
                >
                    View application
                    <ArrowUpRight className="h-4 w-4" />
                </Link>
            </div>
        </div>
    );
}

export default function UpdateApplicationPage() {
    const params = useParams();
    const router = useRouter();
    const dispatch = useDispatch();

    const applicationId = params?.id;

    const {
        currentApplication,
        loadingDetail,
        submitting,
        errorDetail,
        submitError,
    } = useSelector((state) => state.applications);

    const [resumeFile, setResumeFile] = useState(null);
    const [coverLetterFile, setCoverLetterFile] = useState(null);

    const [uploadingResume, setUploadingResume] = useState(false);
    const [uploadingCoverLetter, setUploadingCoverLetter] = useState(false);

    const [resumeTempKey, setResumeTempKey] = useState(null);
    const [coverLetterTempKey, setCoverLetterTempKey] = useState(null);

    const [localError, setLocalError] = useState(null);

    useEffect(() => {
        if (!applicationId) return;

        dispatch(clearApplicationErrors());
        dispatch(fetchDeveloperApplicationById(applicationId));

        return () => {
            dispatch(clearCurrentApplication());
        };
    }, [dispatch, applicationId]);

    const isPending = currentApplication?.status === "PENDING";

    const hasChanges = useMemo(() => {
        return Boolean(resumeFile || coverLetterFile);
    }, [resumeFile, coverLetterFile]);

    async function uploadFile(file, type) {

        const isResume = type === "RESUME";

        if (isResume) {
            setUploadingResume(true);
        } else {
            setUploadingCoverLetter(true);
        }

        let resumeTempKey;
        let coverLetterTempKey;

        try {
            if (file && isResume) {
                resumeTempKey = await uploadFileToStorage(
                    file,
                    "RESUME"
                );
            }

            if (file && !isResume) {
                coverLetterTempKey = await uploadFileToStorage(
                    file,
                    "COVER_LETTER"
                );
            }

            if (!resumeTempKey && !coverLetterTempKey) {
                throw new Error("Temp keys in not recicved from server.");
            }

            if (isResume) {
                setResumeTempKey(resumeTempKey);
            } else {
                setCoverLetterTempKey(coverLetterTempKey);
            }

            return resumeTempKey ? resumeTempKey : coverLetterTempKey;
        } catch (error) {
            throw new Error(
                error.response?.data?.error ||
                error.message ||
                "Failed to upload file."
            );
        } finally {
            if (isResume) {
                setUploadingResume(false);
            } else {
                setUploadingCoverLetter(false);
            }
        }
    }

    async function handleResumeChange(file) {
        setLocalError(null);
        setResumeFile(file);

        try {
            await uploadFile(file, "RESUME");
        } catch (error) {
            setResumeFile(null);
            setResumeTempKey(null);
            setLocalError(error.message);
        }
    }

    async function handleCoverLetterChange(file) {
        setLocalError(null);
        setCoverLetterFile(file);

        try {
            await uploadFile(file, "COVERLETTER");
        } catch (error) {
            setCoverLetterFile(null);
            setCoverLetterTempKey(null);
            setLocalError(error.message);
        }
    }

    function removeResume() {
        setResumeFile(null);
        setResumeTempKey(null);
    }

    function removeCoverLetter() {
        setCoverLetterFile(null);
        setCoverLetterTempKey(null);
    }

    async function handleSubmit(event) {
        event.preventDefault();

        setLocalError(null);

        if (!currentApplication) return;

        if (currentApplication.status !== "PENDING") {
            setLocalError(
                "This application is no longer pending and cannot be updated."
            );
            return;
        }

        if (!hasChanges) {
            setLocalError("Choose at least one document to replace.");
            return;
        }

        if (uploadingResume || uploadingCoverLetter) {
            setLocalError("Please wait for the file upload to finish.");
            return;
        }

        const result = await dispatch(
            updateApplication({
                id: applicationId,
                resumeTempKey,
                coverLetterTempKey,
            })
        );

        if (updateApplication.fulfilled.match(result)) {
            router.push(`/dashboard/developer/applications/${applicationId}`);
        }
    }

    if (loadingDetail) {
        return (
            <main className="min-h-screen bg-[var(--df-paper)] text-[var(--df-text)]">
                <div className="mx-auto px-5 py-8 sm:px-8 lg:px-10 lg:py-12">
                    <div className="h-3 w-28 animate-pulse bg-[var(--df-line)]" />

                    <div className="mt-12 max-w-3xl">
                        <div className="h-3 w-32 animate-pulse bg-[var(--df-line)]" />

                        <div className="mt-5 h-12 w-3/4 animate-pulse bg-[var(--df-line)]" />

                        <div className="mt-3 h-4 w-1/2 animate-pulse bg-[var(--df-line)]" />
                    </div>

                    <div className="mt-10 grid gap-4 lg:grid-cols-[1fr_320px]">
                        <div className="space-y-4">
                            <div className="h-64 animate-pulse border border-[var(--df-line)] bg-[var(--df-paper)]" />
                            <div className="h-64 animate-pulse border border-[var(--df-line)] bg-[var(--df-paper)]" />
                        </div>

                        <div className="h-72 animate-pulse border border-[var(--df-line)]" />
                    </div>
                </div>
            </main>
        );
    }

    if (errorDetail) {
        return (
            <main className="min-h-screen bg-[var(--df-paper)] text-[var(--df-text)]">
                <div className="mx-auto flex min-h-screen max-w-[800px] items-center px-5 py-12">
                    <div className="w-full border border-[var(--df-line)] p-8 sm:p-10">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--df-muted)]">
                            Application
                        </p>

                        <h1 className="mt-3 text-3xl font-semibold tracking-tight">
                            We couldn't load this application.
                        </h1>

                        <p className="mt-3 text-sm leading-6 text-[var(--df-muted)]">
                            {errorDetail}
                        </p>

                        <Link
                            href="/dashboard/applications"
                            className="mt-6 inline-flex h-11 items-center gap-2 bg-[var(--df-text)] px-5 text-sm font-medium text-[var(--df-paper)]"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to applications
                        </Link>
                    </div>
                </div>
            </main>
        );
    }

    if (!currentApplication) {
        return null;
    }

    const job = currentApplication.job;
    const company = job?.company;

    return (
        <main className="min-h-screen bg-[var(--df-paper)] text-[var(--df-text)]">
            <div className="mx-auto max-w-[1400px] px-5 py-8 sm:px-8 lg:px-10 lg:py-12">
                {/* Back */}
                <Link
                    href={`/dashboard/applications/${applicationId}`}
                    className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--df-muted)] transition hover:text-[var(--df-text)]"
                >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Back to application
                </Link>

                {/* Header */}
                <section className="mt-10 border-b border-[var(--df-line)] pb-8 lg:mt-14">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--df-muted)]">
                                Update application
                            </p>

                            <h1 className="mt-3 text-4xl font-semibold tracking-[-0.035em] sm:text-5xl">
                                {job?.title || "Application"}
                            </h1>

                            <p className="mt-3 text-sm text-[var(--df-muted)]">
                                {company?.name || "Company"}
                            </p>
                        </div>

                        <StatusBadge status={currentApplication.status} />
                    </div>
                </section>

                {/* Locked application */}
                {!isPending ? (
                    <section className="py-8">
                        <NotEditableState application={currentApplication} />
                    </section>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div className="grid gap-8 py-8 lg:grid-cols-[1fr_320px]">
                            {/* Main */}
                            <div className="space-y-5">
                                <div>
                                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--df-muted)]">
                                        Documents
                                    </p>

                                    <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                                        Update the documents attached to your application.
                                    </h2>

                                    <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--df-muted)]">
                                        You can replace your resume or cover letter while the
                                        application is still pending.
                                    </p>
                                </div>

                                <DocumentUpload
                                    label="Resume"
                                    description="Replace the resume attached to this application."
                                    existingFile={currentApplication.resume}
                                    selectedFile={resumeFile}
                                    onChange={handleResumeChange}
                                    onRemove={removeResume}
                                    disabled={submitting || uploadingResume}
                                    accept=".pdf,.doc,.docx"
                                />

                                <DocumentUpload
                                    label="Cover letter"
                                    description="Optionally replace the cover letter attached to this application."
                                    existingFile={currentApplication.coverLetter}
                                    selectedFile={coverLetterFile}
                                    onChange={handleCoverLetterChange}
                                    onRemove={removeCoverLetter}
                                    disabled={submitting || uploadingCoverLetter}
                                    accept=".pdf,.doc,.docx,.txt"
                                />

                                {/* Errors */}
                                {(localError || submitError) && (
                                    <div className="border border-[var(--df-line)] p-5">
                                        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--df-muted)]">
                                            Update failed
                                        </p>

                                        <p className="mt-2 text-sm leading-6">
                                            {localError || submitError}
                                        </p>
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex flex-col-reverse gap-3 border-t border-[var(--df-line)] pt-6 sm:flex-row sm:justify-end">
                                    <Link
                                        href={`/dashboard/applications/${applicationId}`}
                                        className="inline-flex h-11 items-center justify-center border border-[var(--df-line)] px-5 text-sm font-medium transition hover:border-[var(--df-text)]"
                                    >
                                        Cancel
                                    </Link>

                                    <button
                                        type="submit"
                                        disabled={
                                            submitting ||
                                            uploadingResume ||
                                            uploadingCoverLetter ||
                                            !hasChanges
                                        }
                                        className="inline-flex h-11 items-center justify-center gap-2 bg-[var(--df-text)] px-6 text-sm font-medium text-[var(--df-paper)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        {submitting ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                Updating...
                                            </>
                                        ) : (
                                            <>
                                                <Check className="h-4 w-4" />
                                                Save changes
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Sidebar */}
                            <aside>
                                <div className="sticky top-6 border border-[var(--df-line)] p-5 sm:p-6">
                                    <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--df-muted)]">
                                        Application status
                                    </p>

                                    <div className="mt-3">
                                        <StatusBadge status={currentApplication.status} />
                                    </div>

                                    <div className="mt-6 space-y-4 border-t border-[var(--df-line)] pt-5">
                                        <div>
                                            <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--df-muted)]">
                                                Submitted
                                            </p>

                                            <p className="mt-1 text-sm">
                                                {formatDate(currentApplication.createdAt)}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--df-muted)]">
                                                Last updated
                                            </p>

                                            <p className="mt-1 text-sm">
                                                {formatDate(currentApplication.updatedAt)}
                                            </p>
                                        </div>

                                        {job?.deadline && (
                                            <div>
                                                <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--df-muted)]">
                                                    Application deadline
                                                </p>

                                                <p className="mt-1 text-sm">
                                                    {formatDate(job.deadline)}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-6 border-t border-[var(--df-line)] pt-5">
                                        <p className="text-xs leading-6 text-[var(--df-muted)]">
                                            Updates are only allowed while your application remains
                                            pending. Once the recruiter moves it to review, the
                                            documents can no longer be changed.
                                        </p>
                                    </div>
                                </div>
                            </aside>
                        </div>
                    </form>
                )}
            </div>
        </main>
    );
}