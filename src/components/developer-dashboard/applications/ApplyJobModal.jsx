"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowUpRight,
  Check,
  FileText,
  Loader2,
  Upload,
  X,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";

import { createApplication } from "@/lib/redux/slices/applicationSlice";
import { uploadFileToStorage } from "@/lib/storage/uploadFile";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ACCEPTED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

function formatFileSize(bytes) {
  if (!bytes) return "";

  const mb = bytes / (1024 * 1024);

  return `${mb.toFixed(1)} MB`;
}

function FileUpload({
  label,
  description,
  file,
  onChange,
  onRemove,
  required = false,
  disabled = false,
}) {
  const inputRef = useRef(null);

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <label className="text-xs font-medium">
          {label}
          {!required && (
            <span className="ml-1 text-[var(--df-muted)]">
              Optional
            </span>
          )}
        </label>

        {file && (
          <button
            type="button"
            onClick={onRemove}
            disabled={disabled}
            className="text-[10px] font-medium text-[var(--df-muted)] transition hover:text-[var(--df-text)]"
          >
            Remove
          </button>
        )}
      </div>

      {file ? (
        <div className="flex items-center justify-between border border-[var(--df-line)] bg-[var(--df-paper)] p-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center bg-[var(--df-text)] text-[var(--df-paper)]">
              <FileText className="h-4 w-4" />
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-medium">
                {file.name}
              </p>

              <p className="mt-0.5 text-[10px] text-[var(--df-muted)]">
                {formatFileSize(file.size)}
              </p>
            </div>
          </div>

          <div className="ml-3 flex h-7 w-7 shrink-0 items-center justify-center border border-[var(--df-line)]">
            <Check className="h-3.5 w-3.5" />
          </div>
        </div>
      ) : (
        <button
          type="button"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
          className="group flex w-full items-center gap-4 border border-dashed border-[var(--df-line)] p-4 text-left transition hover:border-[var(--df-text)]"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-[var(--df-text)] text-[var(--df-paper)]">
            <Upload className="h-4 w-4" />
          </div>

          <div>
            <p className="text-sm font-medium">
              {description}
            </p>

            <p className="mt-1 text-[10px] text-[var(--df-muted)]">
              PDF, DOC or DOCX · Maximum 5MB
            </p>
          </div>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        hidden
        accept=".pdf,.doc,.docx"
        onChange={(event) => {
          const selectedFile = event.target.files?.[0];

          if (!selectedFile) return;

          onChange(selectedFile);

          event.target.value = "";
        }}
      />
    </div>
  );
}

export default function ApplyJobModal({
  job,
  open,
  onClose,
}) {
  const dispatch = useDispatch();
  const router = useRouter();

  const { submitting, submitError } = useSelector(
    (state) => state.applications
  );

  const [resume, setResume] = useState(null);
  const [coverLetter, setCoverLetter] = useState(null);
  const [localError, setLocalError] = useState(null);
  const [uploadingDocument, setUploadingDocument] = useState(false);

  useEffect(() => {
    if (!open) {
      setResume(null);
      setCoverLetter(null);
      setLocalError(null);
    }
  }, [open]);

  if (!open) return null;

  function validateFile(file) {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return "Only PDF, DOC or DOCX files are supported.";
    }

    if (file.size > MAX_FILE_SIZE) {
      return "File size must be 5MB or less.";
    }

    return null;
  }

  function handleResumeChange(file) {
    const error = validateFile(file);

    if (error) {
      setLocalError(error);
      return;
    }

    setLocalError(null);
    setResume(file);
  }

  function handleCoverLetterChange(file) {
    const error = validateFile(file);

    if (error) {
      setLocalError(error);
      return;
    }

    setLocalError(null);
    setCoverLetter(file);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setLocalError(null);

    try {
      setUploadingDocument(true);

      let resumeTempKey = null;
      let coverLetterTempKey = null;

      /*
       * Upload documents directly to object storage.
       * The application API only receives temporary keys.
       */

      if (resume) {
        resumeTempKey = await uploadFileToStorage(
          resume,
          "RESUME"
        );
      }

      if (coverLetter) {
        coverLetterTempKey = await uploadFileToStorage(
          coverLetter,
          "COVER_LETTER"
        );
      }

      setUploadingDocument(false);

      await dispatch(
        createApplication({
          jobId: job.id,
          resumeTempKey,
          coverLetterTempKey,
        })
      ).unwrap();

      onClose();

      router.push("/dashboard/developer/applications");
    } catch (error) {
      setUploadingDocument(false);

      setLocalError(
        typeof error === "string"
          ? error
          : error?.message || "Something went wrong. Please try again."
      );
    }
  }

  const isSubmitting = submitting || uploadingDocument;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4 py-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isSubmitting) {
          onClose();
        }
      }}
    >
      <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto border border-[var(--df-line)] bg-[var(--df-paper)] shadow-2xl">
        {/* HEADER */}

        <div className="flex items-start justify-between border-b border-[var(--df-line)] p-5 sm:p-6">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--df-muted)]">
              Application
            </p>

            <h2 className="mt-2 text-2xl font-semibold tracking-tight">
              Apply for this role
            </h2>

            <p className="mt-2 max-w-md text-xs leading-5 text-[var(--df-muted)]">
              Submit your application for{" "}
              <span className="font-medium text-[var(--df-text)]">
                {job.title}
              </span>
              {job.company?.name && (
                <>
                  {" "}
                  at{" "}
                  <span className="font-medium text-[var(--df-text)]">
                    {job.company.name}
                  </span>
                </>
              )}
              .
            </p>
          </div>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center border border-[var(--df-line)] transition hover:bg-[var(--df-text)] hover:text-[var(--df-paper)]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* FORM */}

        <form onSubmit={handleSubmit}>
          <div className="space-y-6 p-5 sm:p-6">
            <div className="border border-[var(--df-line)] p-4">
              <div className="flex gap-3">
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center bg-[var(--df-text)] text-[var(--df-paper)]">
                  <FileText className="h-3.5 w-3.5" />
                </div>

                <div>
                  <p className="text-xs font-medium">
                    Your application
                  </p>

                  <p className="mt-1 text-[11px] leading-5 text-[var(--df-muted)]">
                    A resume is recommended. A cover letter is optional.
                    Your profile information will be included with the
                    application automatically.
                  </p>
                </div>
              </div>
            </div>

            <FileUpload
              label="Resume"
              description="Upload your resume"
              file={resume}
              onChange={handleResumeChange}
              onRemove={() => setResume(null)}
              disabled={isSubmitting}
            />

            <FileUpload
              label="Cover letter"
              description="Add a cover letter"
              file={coverLetter}
              onChange={handleCoverLetterChange}
              onRemove={() => setCoverLetter(null)}
              disabled={isSubmitting}
            />

            {(localError || submitError) && (
              <div className="border border-red-200 bg-red-50 p-3 text-xs leading-5 text-red-700">
                {localError || submitError}
              </div>
            )}
          </div>

          {/* FOOTER */}

          <div className="flex flex-col-reverse gap-2 border-t border-[var(--df-line)] p-5 sm:flex-row sm:justify-end sm:p-6">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onClose}
              className="h-11 border border-[var(--df-line)] px-5 text-sm font-medium transition hover:bg-[var(--df-soft)] disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="group flex h-11 items-center justify-center gap-3 bg-[var(--df-text)] px-5 text-sm font-medium text-[var(--df-paper)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />

                  <span>
                    {uploadingDocument
                      ? "Uploading documents..."
                      : "Submitting..."}
                  </span>
                </>
              ) : (
                <>
                  <span>Submit application</span>

                  <span className="flex h-6 w-6 items-center justify-center bg-[var(--df-paper)] text-[var(--df-text)]">
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}