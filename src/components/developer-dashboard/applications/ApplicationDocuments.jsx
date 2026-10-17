"use client";

import { useState } from "react";
import {
  ExternalLink,
  FileText,
  Loader2,
} from "lucide-react";
import api from "@/lib/api/axios";

async function getFileUrl(key) {
  const response = await api.get(`/api/get-presignedUrl?key=${key}`);

  return response.data.data;
}

function DocumentRow({ label, file }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleView = async () => {
    if (!file?.key) return;

    try {
      setLoading(true);
      setError(null);

      const url = await getFileUrl(file.key);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "Unable to open this document."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-between gap-4 py-4">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center border border-[var(--df-line)]">
          <FileText className="h-4 w-4 text-[var(--df-muted)]" />
        </div>

        <div className="min-w-0">
          <p className="text-xs font-medium">
            {label}
          </p>

          {file ? (
            <p className="mt-1 truncate text-[10px] text-[var(--df-muted)]">
              {file.key?.split("/").pop()}
            </p>
          ) : (
            <p className="mt-1 text-[10px] text-[var(--df-muted)]">
              Not submitted
            </p>
          )}
        </div>
      </div>

      {file && (
        <div className="shrink-0">
          <button
            type="button"
            disabled={loading}
            onClick={handleView}
            className="inline-flex cursor-pointer items-center gap-2 text-xs font-medium hover:underline disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Opening
              </>
            ) : (
              <>
                View
                <ExternalLink className="h-3.5 w-3.5" />
              </>
            )}
          </button>

          {error && (
            <p className="mt-1 max-w-40 text-right text-[10px] text-red-600">
              {error}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default function ApplicationDocuments({
  resume,
  coverLetter,
}) {
  console.log(resume, "-----------")
  return (
    <section className="border border-[var(--df-line)]">
      <div className="border-b border-[var(--df-line)] px-5 py-4 sm:px-6">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--df-muted)]">
          Submitted documents
        </p>
      </div>

      <div className="divide-y divide-[var(--df-line)] px-5 sm:px-6">
        <DocumentRow
          label="Resume"
          file={resume}
        />

        <DocumentRow
          label="Cover letter"
          file={coverLetter}
        />
      </div>
    </section>
  );
}