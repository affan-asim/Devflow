"use client";

import { Search, SlidersHorizontal, X } from "lucide-react";

export default function DeveloperFilters({
  filters,
  setFilters,
  onSearch,
  onReset,
}) {
  const updateFilter = (key, value) => {
    setFilters((current) => ({
      ...current,
      [key]: value,
    }));
  };

  return (
    <div className="border-y border-[var(--df-line)]">
      <div className="grid lg:grid-cols-[1fr_auto]">
        {/* Search */}
        <div className="border-b border-[var(--df-line)] lg:border-b-0 lg:border-r">
          <div className="relative">
            <Search
              size={17}
              strokeWidth={1.5}
              className="
                pointer-events-none
                absolute left-0 top-1/2
                -translate-y-1/2
                text-[var(--df-muted)]
              "
            />

            <input
              value={filters.bio}
              onChange={(e) => updateFilter("bio", e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") onSearch();
              }}
              placeholder="Search developers by bio..."
              className="
                h-14 w-full
                border-0
                bg-transparent
                pl-7 pr-5
                text-sm
                text-[var(--df-text)]
                outline-none
                placeholder:text-[var(--df-soft)]
              "
            />
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap">
          {/* Location */}
          <select
            value={filters.locationPreference}
            onChange={(e) =>
              updateFilter("locationPreference", e.target.value)
            }
            className="
              h-14
              min-w-[145px]
              border-b border-[var(--df-line)]
              bg-[var(--df-paper)]
              px-4
              text-xs font-medium
              text-[var(--df-text)]
              outline-none
              transition-colors
              hover:bg-[var(--df-paper-2)]
              focus:bg-[var(--df-paper-2)]
              lg:border-b-0
              lg:border-l
            "
          >
            <option value="">All locations</option>
            <option value="REMOTE">Remote</option>
            <option value="HYBRID">Hybrid</option>
            <option value="ONSITE">On-site</option>
          </select>

          {/* Min experience */}
          <div className="border-b border-[var(--df-line)] lg:border-l lg:border-b-0">
            <input
              type="number"
              min="0"
              value={filters.minExp}
              onChange={(e) => updateFilter("minExp", e.target.value)}
              placeholder="Min exp"
              className="
                h-14 w-[105px]
                bg-transparent
                px-4
                text-xs
                text-[var(--df-text)]
                outline-none
                placeholder:text-[var(--df-soft)]
              "
            />
          </div>

          {/* Max experience */}
          <div className="border-b border-[var(--df-line)] lg:border-l lg:border-b-0">
            <input
              type="number"
              min="0"
              value={filters.maxExp}
              onChange={(e) => updateFilter("maxExp", e.target.value)}
              placeholder="Max exp"
              className="
                h-14 w-[105px]
                bg-transparent
                px-4
                text-xs
                text-[var(--df-text)]
                outline-none
                placeholder:text-[var(--df-soft)]
              "
            />
          </div>

          {/* Sort */}
          <select
            value={filters.sort}
            onChange={(e) => updateFilter("sort", e.target.value)}
            className="
              h-14
              min-w-[145px]
              border-b border-[var(--df-line)]
              bg-[var(--df-paper)]
              px-4
              text-xs font-medium
              text-[var(--df-text)]
              outline-none
              transition-colors
              hover:bg-[var(--df-paper-2)]
              focus:bg-[var(--df-paper-2)]
              lg:border-l
              lg:border-b-0
            "
          >
            <option value="">Experience</option>
            <option value="exp_asc">Experience ↑</option>
            <option value="exp_desc">Experience ↓</option>
          </select>

          {/* Filter */}
          <button
            type="button"
            onClick={onSearch}
            className="
              inline-flex
              h-14
              items-center
              gap-2
              border-b border-[var(--df-line)]
              bg-[var(--df-text)]
              px-5
              text-xs
              font-semibold
              text-[var(--df-paper)]
              transition-opacity
              hover:opacity-80
              lg:border-b-0
              lg:border-l
            "
          >
            <SlidersHorizontal size={15} strokeWidth={1.5} />
            Apply
          </button>

          {/* Reset */}
          <button
            type="button"
            onClick={onReset}
            className="
              inline-flex
              h-14
              w-14
              items-center
              justify-center
              border-l border-[var(--df-line)]
              bg-[var(--df-paper)]
              text-[var(--df-muted)]
              transition-colors
              hover:bg-[var(--df-paper-2)]
              hover:text-[var(--df-text)]
            "
            aria-label="Reset filters"
          >
            <X size={16} strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </div>
  );
}