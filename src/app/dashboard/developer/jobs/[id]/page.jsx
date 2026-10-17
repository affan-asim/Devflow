
"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "next/navigation";

import { fetchJobById } from "@/lib/redux/slices/jobSlice";

import JobDetail from "@/components/developer-dashboard/dashboard/jobs/JobDetail";
import JobDetailSkeleton from "@/components/developer-dashboard/dashboard/jobs/JobDetailSkeleton";

export default function DeveloperJobDetailPage() {
  const params = useParams();
  const dispatch = useDispatch();

  const {
    currentJob,
    loadingDetail,
    errorDetail,
  } = useSelector((state) => state.jobs);

  const jobId = params?.id;

  useEffect(() => {
    if (!jobId) return;

    dispatch(fetchJobById(jobId));
  }, [dispatch, jobId]);

  if (loadingDetail) {
    return <JobDetailSkeleton />;
  }

  if (errorDetail) {
    return (
      <div className="p-10 border border-[var(--df-line)] px-6 py-20 text-center">
        <p className="text-sm font-medium text-red-500">
          {errorDetail}
        </p>

        <button
          type="button"
          onClick={() =>
            dispatch(fetchJobById(jobId))
          }
          className="mt-4 text-xs font-medium underline underline-offset-4"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!currentJob) {
    return (
      <div className="p-10 border border-[var(--df-line)] px-6 py-20 text-center">
        <p className="text-sm font-medium">
          Job not found.
        </p>
      </div>
    );
  }

  return <JobDetail job={currentJob} />;
}
