export const RECRUITER_PAGE_SIZE = 10;

export const LOCATION_OPTIONS = [
  { value: "", label: "All work preferences" },
  { value: "REMOTE", label: "Remote" },
  { value: "HYBRID", label: "Hybrid" },
  { value: "ONSITE", label: "On-site" },
];

export const ACTIVE_OPTIONS = [
  { value: "", label: "All account states" },
  { value: "true", label: "Active" },
  { value: "false", label: "Inactive" },
];

export const VERIFIED_OPTIONS = [
  { value: "", label: "All verification states" },
  { value: "true", label: "Verified" },
  { value: "false", label: "Unverified" },
];

export const SORT_OPTIONS = [
  {
    value: "createdAt:desc",
    label: "Newest added",
    sortBy: "createdAt",
    sortOrder: "desc",
  },
  {
    value: "createdAt:asc",
    label: "Oldest added",
    sortBy: "createdAt",
    sortOrder: "asc",
  },
  {
    value: "name:asc",
    label: "Name A–Z",
    sortBy: "name",
    sortOrder: "asc",
  },
  {
    value: "name:desc",
    label: "Name Z–A",
    sortBy: "name",
    sortOrder: "desc",
  },
  {
    value: "yearsOfExp:desc",
    label: "Most experience",
    sortBy: "yearsOfExp",
    sortOrder: "desc",
  },
  {
    value: "yearsOfExp:asc",
    label: "Least experience",
    sortBy: "yearsOfExp",
    sortOrder: "asc",
  },
];

export function getInitials(name = "") {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (!parts.length) return "?";

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function formatDate(date) {
  if (!date) return "—";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "—";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(parsed);
}

export function formatRelativeDate(date) {
  if (!date) return "—";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "—";

  const diff = Date.now() - parsed.getTime();
  const minutes = Math.floor(diff / 60000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);

  if (days < 30) return `${days}d ago`;

  return formatDate(date);
}

export function formatExperience(years) {
  if (years === null || years === undefined) return "Experience not specified";

  if (years === 0) return "Entry level";

  if (years === 1) return "1 year";

  return `${years} years`;
}

export function formatLocationPreference(value) {
  switch (value) {
    case "REMOTE":
      return "Remote";

    case "HYBRID":
      return "Hybrid";

    case "ONSITE":
      return "On-site";

    default:
      return "Not specified";
  }
}

export function getRecruiterStatus(recruiter) {
  if (!recruiter?.user) {
    return {
      label: "Unknown",
      tone: "neutral",
    };
  }

  if (!recruiter.user.isActive) {
    return {
      label: "Inactive",
      tone: "danger",
    };
  }

  if (recruiter.user.isVerified) {
    return {
      label: "Verified",
      tone: "success",
    };
  }

  return {
    label: "Unverified",
    tone: "warning",
  };
}

export function getStatusClasses(tone) {
  switch (tone) {
    case "success":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";

    case "warning":
      return "border-amber-200 bg-amber-50 text-amber-700";

    case "danger":
      return "border-red-200 bg-red-50 text-red-700";

    default:
      return "border-[var(--df-line)] bg-[var(--df-paper)] text-[var(--df-muted)]";
  }
}