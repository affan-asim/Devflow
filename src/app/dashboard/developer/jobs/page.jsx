
"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { fetchJobs } from "@/lib/redux/slices/jobSlice";

import JobsHeader from "@/components/developer-dashboard/dashboard/jobs/JobsHeader";
import JobFilters from "@/components/developer-dashboard/dashboard/jobs/JobFilters";
import JobList from "@/components/developer-dashboard/dashboard/jobs/JobList";
import JobListSkeleton from "@/components/developer-dashboard/dashboard/jobs/JobListSkeleton";

export default function DeveloperJobsPage() {
  const dispatch = useDispatch();

  const {
    jobs,
    metadata,
    loadingList,
    errorList,
  } = useSelector((state) => state.jobs);

  const [filters, setFilters] = useState({
    search: "",
    locationPreference: "",
    employmentType: "",
    experienceLevel: "",
    sort: "newest",
    page: 1,
    limit: 10,
  });

  useEffect(() => {
    dispatch(fetchJobs(filters));
  }, [dispatch, filters]);

  const updateFilter = (field, value) => {
    setFilters((previous) => ({
      ...previous,
      [field]: value,
      page: 1,
    }));
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      locationPreference: "",
      employmentType: "",
      experienceLevel: "",
      sort: "newest",
      page: 1,
      limit: 10,
    });
  };

  const changePage = (page) => {
    setFilters((previous) => ({
      ...previous,
      page,
    }));

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const hasFilters =
    filters.search ||
    filters.locationPreference ||
    filters.employmentType ||
    filters.experienceLevel;

  return (
    <div className="p-10 pb-16">
      <JobsHeader
        totalCount={metadata?.totalCount || 0}
        currentPage={metadata?.currentPage || 1}
        totalPages={metadata?.totalPages || 0}
      />

      <JobFilters
        filters={filters}
        onChange={updateFilter}
        onClear={clearFilters}
        hasFilters={Boolean(hasFilters)}
      />

      <div className="mt-8">
        {loadingList ? (
          <JobListSkeleton />
        ) : errorList ? (
          <div className="border border-[var(--df-line)] px-6 py-16 text-center">
            <p className="text-sm font-medium text-red-500">
              {errorList}
            </p>

            <button
              type="button"
              onClick={() => dispatch(fetchJobs(filters))}
              className="mt-4 text-xs font-medium underline underline-offset-4"
            >
              Try again
            </button>
          </div>
        ) : (
          <JobList
            jobs={jobs}
            metadata={metadata}
            onPageChange={changePage}
          />
        )}
      </div>
    </div>
  );
}
