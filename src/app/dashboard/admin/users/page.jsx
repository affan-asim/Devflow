"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
Activity,
ArrowDown,
ArrowDownUp,
ArrowLeft,
ArrowRight,
Building2,
CalendarDays,
Check,
CheckCircle2,
ChevronDown,
CircleUserRound,
Clock3,
ExternalLink,
FileText,
Filter,
LoaderCircle,
Mail,
MapPin,
RefreshCw,
Search,
ShieldCheck,
SlidersHorizontal,
UserCheck,
UserRoundX,
Users,
X,
} from "lucide-react";

import {
fetchAdminUsers,
fetchAdminUserById,
updateAdminUserStatus,
clearCurrentAdminUser,
clearAdminUsersErrors,
} from "@/lib/redux/slices/adminUsersSlice";

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

const INITIAL_FILTERS = {
role: "",
isActive: "",
isVerified: "",
sortBy: "createdAt",
sortOrder: "desc",
};

function formatDate(value, options = {}) {
if (!value) return "—";
const date = new Date(value);
if (Number.isNaN(date.getTime())) return "—";

return new Intl.DateTimeFormat("en", {
month: "short",
day: "numeric",
year: "numeric",
...options,
}).format(date);
}

function formatRole(role) {
if (!role) return "Unknown";
return String(role)
.toLowerCase()
.replaceAll("_", " ")
.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getInitials(name) {
return (
String(name || "User")
.trim()
.split(/\s+/)
.slice(0, 2)
.map((part) => part[0])
.join("")
.toUpperCase() || "U"
);
}

function getProfile(user) {
return user?.profile || user?.developerProfile || user?.recruiterProfile || null;
}

function getCompanyName(user) {
const profile = getProfile(user);
return (
profile?.company?.name ||
profile?.companyName ||
(user?.role === "DEVELOPER" ? "Developer profile" : "Independent recruiter")
);
}

function getUserLocation(user) {
const profile = getProfile(user);
const preference = profile?.locationPreference;

if (Array.isArray(preference)) return preference.join(", ");
if (typeof preference === "string") return preference;
return profile?.location || profile?.country || "Location not provided";
}

function StatusTag({ active, label }) {
const isGood = Boolean(active);

return (
<span
className={`inline-flex min-h-6 items-center gap-1.5 rounded-full border px-2.5 text-[10px] font-medium ${
        isGood
          ? "border-[#a8d878]/60 bg-[#b9f45b]/20 text-[var(--df-text)]"
          : "border-[var(--df-line)] bg-[var(--df-paper-2)] text-[var(--df-muted)]"
      }`}
>
<span
className={`h-[5px] w-[5px] rounded-full ${
          isGood ? "bg-[#719f39]" : "bg-[var(--df-soft)]"
        }`}
/>
{label} </span>
);
}

function RoleTag({ role }) {
const Icon =
role === "ADMIN"
? ShieldCheck
: role === "RECRUITER"
? Building2
: CircleUserRound;

return ( <span className="inline-flex items-center gap-1.5 text-[11px] text-[var(--df-muted)]"> <Icon size={13} strokeWidth={1.7} />
{formatRole(role)} </span>
);
}

function Avatar({ user, size = "md" }) {
const sizeClass =
size === "lg" ? "h-14 w-14 text-base" : "h-10 w-10 text-[11px]";

return (
<div
className={`flex shrink-0 items-center justify-center rounded-full border border-[var(--df-line)] bg-[var(--df-paper-2)] font-semibold tracking-[-0.03em] text-[var(--df-text)] ${sizeClass}`}
aria-label={`${user?.name || "User"} avatar`}
>
{getInitials(user?.name)} </div>
);
}

function Metric({ label, value, detail, icon: Icon }) {
return ( <div className="border border-[var(--df-line)] p-4 sm:p-5"> <div className="flex items-center justify-between gap-2"> <p className="df-eyebrow">{label}</p> <Icon size={15} className="text-[var(--df-muted)]" strokeWidth={1.7} /> </div> <p className="mt-5 text-[30px] font-medium leading-none tracking-[-0.07em] text-[var(--df-text-strong)]">
{Number(value || 0).toLocaleString()} </p> <p className="mt-2 text-[10px] text-[var(--df-muted)]">{detail}</p> </div>
);
}

function Field({ label, value, icon: Icon }) {
return ( <div className="flex gap-3 py-3">
{Icon && ( <Icon size={15} className="mt-0.5 shrink-0 text-[var(--df-muted)]" />
)} <div className="min-w-0"> <p className="df-eyebrow">{label}</p> <p className="mt-1.5 break-words text-[12px] text-[var(--df-text)]">
{value || "Not provided"} </p> </div> </div>
);
}

function LoadingRows({ count = 6 }) {
return ( <div className="divide-y divide-[var(--df-line-soft)]">
{Array.from({ length: count }).map((_, index) => ( <div key={index} className="flex animate-pulse items-center gap-4 px-5 py-4"> <div className="h-10 w-10 rounded-full bg-[var(--df-paper-3)]" /> <div className="flex-1 space-y-2"> <div className="h-3 w-36 max-w-full bg-[var(--df-paper-3)]" /> <div className="h-2.5 w-48 max-w-full bg-[var(--df-paper-2)]" /> </div> <div className="hidden h-5 w-20 bg-[var(--df-paper-2)] sm:block" /> </div>
))} </div>
);
}

function EmptyState({ hasFilters, onReset }) {
return ( <div className="flex min-h-[280px] flex-col items-center justify-center px-6 py-12 text-center"> <span className="flex h-12 w-12 items-center justify-center rounded-full border border-[var(--df-line)] text-[var(--df-muted)]"> <Users size={20} strokeWidth={1.5} /> </span> <h3 className="mt-5 text-[16px] font-medium tracking-[-0.04em]">
{hasFilters ? "No users match these filters" : "Your user directory is empty"} </h3> <p className="mt-2 max-w-sm text-[12px] leading-5 text-[var(--df-muted)]">
{hasFilters
? "Try another search or remove a filter to see more accounts."
: "Users will appear here when their accounts are available to the platform."} </p>
{hasFilters && ( <button type="button" onClick={onReset} className="df-btn df-btn-outline mt-5 !min-h-10">
Clear filters </button>
)} </div>
);
}

function ConfirmStatusDialog({ user, submitting, error, onClose, onConfirm }) {
if (!user) return null;

const willActivate = !user.isActive;

return (
<div
className="fixed inset-0 z-[80] flex items-center justify-center bg-black/35 p-4 backdrop-blur-[2px]"
role="presentation"
onMouseDown={(event) => {
if (event.target === event.currentTarget && !submitting) onClose();
}}
> <section
     role="dialog"
     aria-modal="true"
     aria-labelledby="status-dialog-title"
     className="w-full max-w-md border border-[var(--df-line)] bg-[var(--df-paper)] p-6 shadow-2xl sm:p-7"
   > <div className="flex items-start justify-between gap-4"> <span className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--df-line)] bg-[var(--df-paper-2)]">
{willActivate ? ( <UserCheck size={19} />
) : ( <UserRoundX size={19} />
)} </span> <button
         type="button"
         disabled={submitting}
         onClick={onClose}
         aria-label="Close confirmation"
         className="rounded-full p-2 text-[var(--df-muted)] hover:bg-[var(--df-paper-2)] disabled:opacity-50"
       > <X size={17} /> </button> </div>


    <p className="df-eyebrow mt-6">ACCOUNT MANAGEMENT</p>
    <h2 id="status-dialog-title" className="mt-2 text-[24px] font-medium tracking-[-0.06em]">
      {willActivate ? "Reactivate this account?" : "Deactivate this account?"}
    </h2>
    <p className="mt-3 text-[12px] leading-6 text-[var(--df-muted)]">
      You are about to {willActivate ? "reactivate" : "deactivate"}{" "}
      <span className="font-semibold text-[var(--df-text)]">
        {user.name || user.email}
      </span>
      . {willActivate
        ? "The account will be marked active again."
        : "The account will be marked inactive. This action does not delete the user's data."}
    </p>

    {error && (
      <div role="alert" className="mt-4 border border-red-500/25 bg-red-500/[0.04] p-3 text-[11px] leading-5 text-[var(--df-text)]">
        {error}
      </div>
    )}

    <div className="mt-7 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
      <button
        type="button"
        disabled={submitting}
        onClick={onClose}
        className="df-btn df-btn-outline !min-h-11 disabled:opacity-50"
      >
        Cancel
      </button>
      <button
        type="button"
        disabled={submitting}
        onClick={onConfirm}
        className={`df-btn !min-h-11 disabled:cursor-not-allowed disabled:opacity-60 ${
          willActivate ? "df-btn-accent" : "df-btn-primary"
        }`}
      >
        {submitting ? (
          <LoaderCircle size={15} className="animate-spin" />
        ) : willActivate ? (
          <Check size={15} />
        ) : (
          <UserRoundX size={15} />
        )}
        {submitting
          ? "Saving changes…"
          : willActivate
            ? "Reactivate account"
            : "Deactivate account"}
      </button>
    </div>
  </section>
</div>


);
}

function UserDetailsDrawer({ user, loading, error, onClose, onRetry, onStatus }) {
if (!user && !loading && !error) return null;

const profile = getProfile(user);
const files = user?.files || [];
const skills = profile?.skills || [];
const applications = profile?.applications || [];
const jobs = profile?.jobs || [];
const history = profile?.employmentHistory || profile?.recruiterHistory || [];

return (
<div
className="fixed inset-0 z-[70] flex justify-end bg-black/30"
role="presentation"
onMouseDown={(event) => {
if (event.target === event.currentTarget) onClose();
}}
> <aside
     role="dialog"
     aria-modal="true"
     aria-label="User details"
     className="flex h-full w-full max-w-[580px] flex-col border-l border-[var(--df-line)] bg-[var(--df-paper)] shadow-2xl"
   > <header className="flex items-center justify-between border-b border-[var(--df-line)] px-5 py-4 sm:px-7"> <div> <p className="df-eyebrow">USER DIRECTORY / PROFILE</p> <p className="mt-1 text-[12px] text-[var(--df-muted)]">
Account details and platform activity </p> </div> <button
         type="button"
         onClick={onClose}
         aria-label="Close user details"
         className="rounded-full border border-[var(--df-line)] p-2 text-[var(--df-muted)] hover:bg-[var(--df-paper-2)]"
       > <X size={17} /> </button> </header>


    <div className="flex-1 overflow-y-auto">
      {loading && !user ? (
        <div className="space-y-4 p-7">
          <div className="h-14 w-14 animate-pulse rounded-full bg-[var(--df-paper-3)]" />
          <div className="h-5 w-48 animate-pulse bg-[var(--df-paper-3)]" />
          <div className="h-3 w-64 max-w-full animate-pulse bg-[var(--df-paper-2)]" />
          <div className="mt-8 h-32 animate-pulse bg-[var(--df-paper-2)]" />
        </div>
      ) : error && !user ? (
        <div className="p-7">
          <div role="alert" className="border border-red-500/25 p-4 text-[12px]">
            {error}
          </div>
          <button type="button" onClick={onRetry} className="df-btn df-btn-outline mt-4">
            <RefreshCw size={14} />
            Retry loading
          </button>
        </div>
      ) : user ? (
        <div className="p-5 sm:p-7">
          <div className="flex items-start gap-4">
            <Avatar user={user} size="lg" />
            <div className="min-w-0 flex-1 pt-1">
              <h2 className="break-words text-[25px] font-medium leading-tight tracking-[-0.065em] text-[var(--df-text-strong)]">
                {user.name || "Unnamed user"}
              </h2>
              <p className="mt-2 break-all text-[12px] text-[var(--df-muted)]">{user.email}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <RoleTag role={user.role} />
                <StatusTag active={user.isActive} label={user.isActive ? "Active" : "Inactive"} />
                <StatusTag active={user.isVerified} label={user.isVerified ? "Verified" : "Unverified"} />
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2 border-b border-[var(--df-line)] pb-6">
            <button
              type="button"
              disabled={loading}
              onClick={() => onStatus(user)}
              className={`df-btn !min-h-10 !px-4 ${
                user.isActive ? "df-btn-outline" : "df-btn-accent"
              }`}
            >
              {user.isActive ? <UserRoundX size={14} /> : <UserCheck size={14} />}
              {user.isActive ? "Deactivate account" : "Reactivate account"}
            </button>
            <button
              type="button"
              onClick={() => {
                if (user.email) window.location.href = `mailto:${user.email}`;
              }}
              className="df-btn df-btn-outline !min-h-10 !px-4"
            >
              <Mail size={14} />
              Email user
            </button>
          </div>

          <section className="mt-7">
            <p className="df-eyebrow">ACCOUNT INFORMATION</p>
            <div className="mt-3 grid grid-cols-1 gap-x-6 sm:grid-cols-2">
              <Field label="Account ID" value={user.id} />
              <Field label="Role" value={formatRole(user.role)} icon={ShieldCheck} />
              <Field label="Joined" value={formatDate(user.createdAt)} icon={CalendarDays} />
              <Field label="Last updated" value={formatDate(user.updatedAt)} icon={Clock3} />
              <Field label="Email address" value={user.email} icon={Mail} />
              <Field label="Location" value={getUserLocation(user)} icon={MapPin} />
            </div>
          </section>

          {profile && (
            <section className="mt-7 border-t border-[var(--df-line)] pt-6">
              <p className="df-eyebrow">PROFILE DETAILS</p>
              <div className="mt-3 grid grid-cols-1 gap-x-6 sm:grid-cols-2">
                <Field
                  label="Profile ID"
                  value={profile.id}
                />
                {user.role === "DEVELOPER" && (
                  <Field
                    label="Years of experience"
                    value={
                      profile.yearsOfExp != null
                        ? `${profile.yearsOfExp} years`
                        : "Not provided"
                    }
                  />
                )}
                {user.role === "RECRUITER" && (
                  <>
                    <Field label="Job title" value={profile.jobTitle} />
                    <Field label="Company" value={profile.company?.name || "Independent recruiter"} icon={Building2} />
                    <Field label="Company industry" value={profile.company?.industry} />
                    <Field label="Company country" value={profile.company?.country} />
                  </>
                )}
              </div>

              {skills.length > 0 && (
                <div className="mt-4">
                  <p className="df-eyebrow mb-3">SKILLS</p>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill) => (
                      <span key={skill.id || skill.name} className="df-tag">
                        {skill.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </section>
          )}

          {user.role === "DEVELOPER" && (
            <section className="mt-7 border-t border-[var(--df-line)] pt-6">
              <div className="flex items-center justify-between gap-3">
                <p className="df-eyebrow">APPLICATION HISTORY</p>
                <span className="text-[10px] text-[var(--df-muted)]">{applications.length} records</span>
              </div>
              {applications.length ? (
                <div className="mt-3 divide-y divide-[var(--df-line-soft)]">
                  {applications.slice(0, 8).map((application) => (
                    <div key={application.id} className="py-3">
                      <p className="text-[12px] font-medium">{application.job?.title || "Job application"}</p>
                      <div className="mt-1 flex flex-wrap items-center justify-between gap-2 text-[10px] text-[var(--df-muted)]">
                        <span>{application.job?.company?.name || "Company not available"}</span>
                        <span>{formatDate(application.createdAt)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-[11px] text-[var(--df-muted)]">No application records available.</p>
              )}
            </section>
          )}

          {user.role === "RECRUITER" && (
            <section className="mt-7 border-t border-[var(--df-line)] pt-6">
              <div className="flex items-center justify-between gap-3">
                <p className="df-eyebrow">JOB LISTINGS</p>
                <span className="text-[10px] text-[var(--df-muted)]">{jobs.length} records</span>
              </div>
              {jobs.length ? (
                <div className="mt-3 divide-y divide-[var(--df-line-soft)]">
                  {jobs.slice(0, 8).map((job) => (
                    <div key={job.id} className="flex items-center justify-between gap-3 py-3">
                      <div className="min-w-0">
                        <p className="truncate text-[12px] font-medium">{job.title}</p>
                        <p className="mt-1 text-[10px] text-[var(--df-muted)]">{formatDate(job.createdAt)}</p>
                      </div>
                      <span className="df-tag shrink-0">{formatRole(job.status)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-[11px] text-[var(--df-muted)]">No job listings available.</p>
              )}
            </section>
          )}

          {history.length > 0 && (
            <section className="mt-7 border-t border-[var(--df-line)] pt-6">
              <p className="df-eyebrow">EMPLOYMENT / RECRUITER HISTORY</p>
              <div className="mt-3 divide-y divide-[var(--df-line-soft)]">
                {history.slice(0, 8).map((record) => (
                  <div key={record.id} className="py-3">
                    <p className="text-[12px] font-medium">
                      {record.company?.name || record.jobTitle || "History record"}
                    </p>
                    <p className="mt-1 text-[10px] text-[var(--df-muted)]">
                      {formatDate(record.startDate)}
                      {record.endDate ? ` — ${formatDate(record.endDate)}` : " — Present"}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="mt-7 border-t border-[var(--df-line)] pt-6">
            <div className="flex items-center justify-between gap-3">
              <p className="df-eyebrow">UPLOADED FILES</p>
              <span className="text-[10px] text-[var(--df-muted)]">{files.length} records</span>
            </div>
            {files.length ? (
              <div className="mt-3 divide-y divide-[var(--df-line-soft)]">
                {files.slice(0, 8).map((file) => (
                  <div key={file.id} className="flex items-center gap-3 py-3">
                    <FileText size={16} className="shrink-0 text-[var(--df-muted)]" />
                    <div className="min-w-0 flex-1">
                      <p className="break-all text-[11px] font-medium">{file.type || "Uploaded file"}</p>
                      <p className="mt-1 text-[10px] text-[var(--df-muted)]">{formatDate(file.createdAt)}</p>
                    </div>
                    <span className="df-tag">{formatRole(file.status)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-[11px] text-[var(--df-muted)]">No uploaded files returned for this account.</p>
            )}
          </section>

          {error && (
            <p role="alert" className="mt-5 text-[11px] text-red-600">{error}</p>
          )}
        </div>
      ) : null}
    </div>
  </aside>
</div>


);
}

export default function AdminUsersPage() {
const dispatch = useDispatch();

const {
users = [],
pagination = { total: 0, page: 1, limit: 20, totalPages: 0 },
currentUser,
loadingList,
loadingDetail,
submitting,
errorList,
errorDetail,
submitError,
} = useSelector((state) => state.adminUsers);

const [searchInput, setSearchInput] = useState("");
const [search, setSearch] = useState("");
const [filters, setFilters] = useState(INITIAL_FILTERS);
const [page, setPage] = useState(1);
const [limit, setLimit] = useState(20);
const [filtersOpen, setFiltersOpen] = useState(false);
const [selectedUserId, setSelectedUserId] = useState(null);
const [statusTarget, setStatusTarget] = useState(null);
const [localStatusError, setLocalStatusError] = useState(null);
const [statusSuccess, setStatusSuccess] = useState(null);
const [sortMenuOpen, setSortMenuOpen] = useState(false);

const queryParams = useMemo(
() => ({
page,
limit,
...(search.trim() ? { search: search.trim() } : {}),
...(filters.role ? { role: filters.role } : {}),
...(filters.isActive !== "" ? { isActive: filters.isActive } : {}),
...(filters.isVerified !== "" ? { isVerified: filters.isVerified } : {}),
sortBy: filters.sortBy,
sortOrder: filters.sortOrder,
}),
[page, limit, search, filters]
);

const loadUsers = useCallback(
(params = queryParams) => dispatch(fetchAdminUsers(params)),
[dispatch, queryParams]
);

useEffect(() => {
const timer = setTimeout(() => {
setPage(1);
setSearch(searchInput.trim());
}, 300);


return () => clearTimeout(timer);


}, [searchInput]);

useEffect(() => {
dispatch(fetchAdminUsers(queryParams));
}, [dispatch, queryParams]);

useEffect(() => {
if (!selectedUserId) return;


dispatch(fetchAdminUserById(selectedUserId));

return () => {
  dispatch(clearCurrentAdminUser());
};


}, [dispatch, selectedUserId]);

useEffect(() => {
if (!statusSuccess) return;
const timer = setTimeout(() => setStatusSuccess(null), 4500);
return () => clearTimeout(timer);
}, [statusSuccess]);

const total = Number(pagination?.total || 0);
const currentPage = Number(pagination?.page || page);
const pageSize = Number(pagination?.limit || limit);
const totalPages = Math.max(1, Number(pagination?.totalPages || 1));
const startRow = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
const endRow = Math.min(currentPage * pageSize, total);

const hasFilters = Boolean(
search ||
filters.role ||
filters.isActive !== "" ||
filters.isVerified !== ""
);

const resetFilters = () => {
setSearchInput("");
setSearch("");
setFilters(INITIAL_FILTERS);
setPage(1);
setStatusSuccess(null);
};

const updateFilter = (key, value) => {
setFilters((current) => ({ ...current, [key]: value }));
setPage(1);
};

const handleSort = (sortBy) => {
setFilters((current) => ({
...current,
sortBy,
sortOrder:
current.sortBy === sortBy && current.sortOrder === "desc"
? "asc"
: "desc",
}));
setPage(1);
setSortMenuOpen(false);
};

const openDetails = (userId) => {
setSelectedUserId(userId);
dispatch(clearAdminUsersErrors());
};

const closeDetails = () => {
setSelectedUserId(null);
dispatch(clearCurrentAdminUser());
};

const confirmStatusChange = async () => {
if (!statusTarget) return;


setLocalStatusError(null);
setStatusSuccess(null);

const result = await dispatch(
  updateAdminUserStatus({
    userId: statusTarget.id,
    isActive: !statusTarget.isActive,
  })
);

if (updateAdminUserStatus.fulfilled.match(result)) {
  const updatedUser = result.payload?.data;
  const name = updatedUser?.name || statusTarget.name || statusTarget.email;
  setStatusTarget(null);
  setStatusSuccess(
    `${name} has been ${updatedUser?.isActive ? "reactivated" : "deactivated"}.`
  );

  // Refresh the server-side list to keep totals, filters, and pagination accurate.
  dispatch(fetchAdminUsers(queryParams));

  // Fetch fresh profile details if this account is open.
  if (selectedUserId === statusTarget.id) {
    dispatch(fetchAdminUserById(statusTarget.id));
  }
} else {
  setLocalStatusError(
    result.payload || result.error?.message || "Unable to update account status."
  );
}


};

const activeCount = users.filter((user) => user.isActive).length;
const verifiedCount = users.filter((user) => user.isVerified).length;
const inactiveCount = users.filter((user) => !user.isActive).length;

const detailUser =
currentUser?.id === selectedUserId ? currentUser : null;

return ( <div className="mx-auto max-w-[1440px]">
{/* Page heading */} <section className="mb-8 border-b border-[var(--df-line)] pb-8 sm:mb-10 sm:pb-10"> <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end"> <div> <div className="mb-5 flex items-center gap-2"> <span className="df-dot" /> <p className="df-eyebrow">ADMINISTRATION / USER DIRECTORY</p> </div> <h1 className="df-display text-[clamp(42px,6vw,72px)] text-[var(--df-text-strong)]">
People & access<span className="text-[var(--df-muted)]">.</span> </h1> <p className="mt-6 max-w-xl text-[13px] leading-6 text-[var(--df-muted)]">
Manage user accounts, review profile information, and control
access across the DevFlow hiring ecosystem. </p> </div>


      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => {
            dispatch(clearAdminUsersErrors());
            loadUsers();
          }}
          disabled={loadingList}
          className="df-btn df-btn-outline !min-h-10 !px-4 disabled:opacity-50"
        >
          <RefreshCw size={14} className={loadingList ? "animate-spin" : ""} />
          Refresh
        </button>
        <button
          type="button"
          onClick={() => setFiltersOpen((value) => !value)}
          aria-expanded={filtersOpen}
          className={`df-btn !min-h-10 !px-4 ${
            filtersOpen || hasFilters ? "df-btn-accent" : "df-btn-primary"
          }`}
        >
          <SlidersHorizontal size={14} />
          Filters
          {hasFilters && (
            <span className="ml-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-black/10 px-1 text-[9px]">
              {[search, filters.role, filters.isActive, filters.isVerified].filter((value) => value !== "" && Boolean(value)).length}
            </span>
          )}
        </button>
      </div>
    </div>
  </section>

  {/* Notices */}
  {statusSuccess && (
    <div
      role="status"
      className="mb-5 flex items-center justify-between gap-3 border border-[#a8d878]/60 bg-[#b9f45b]/15 px-4 py-3"
    >
      <div className="flex items-center gap-2 text-[12px] text-[var(--df-text)]">
        <CheckCircle2 size={16} />
        {statusSuccess}
      </div>
      <button
        type="button"
        onClick={() => setStatusSuccess(null)}
        aria-label="Dismiss success message"
        className="p-1 text-[var(--df-muted)]"
      >
        <X size={15} />
      </button>
    </div>
  )}

  {errorList && (
    <div role="alert" className="mb-5 flex flex-wrap items-center justify-between gap-3 border border-red-500/25 bg-red-500/[0.04] p-4">
      <div>
        <p className="text-[12px] font-semibold">Unable to load users</p>
        <p className="mt-1 text-[11px] text-[var(--df-muted)]">{String(errorList)}</p>
      </div>
      <button
        type="button"
        onClick={() => loadUsers()}
        className="df-btn df-btn-outline !min-h-9 !px-3"
      >
        <RefreshCw size={13} />
        Retry
      </button>
    </div>
  )}

  {/* Summary */}
  <section className="mb-10">
    <div className="mb-4 flex items-center justify-between gap-3">
      <p className="df-eyebrow">DIRECTORY SNAPSHOT</p>
      <p className="text-[10px] text-[var(--df-muted)]">
        Active page · {users.length} records
      </p>
    </div>

    <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
      <Metric
        label="Total accounts"
        value={total}
        detail="Matching current query"
        icon={Users}
      />
      <Metric
        label="Active on page"
        value={activeCount}
        detail="Accounts currently active"
        icon={Activity}
      />
      <Metric
        label="Verified on page"
        value={verifiedCount}
        detail="Verified email / account status"
        icon={ShieldCheck}
      />
      <Metric
        label="Inactive on page"
        value={inactiveCount}
        detail="Accounts marked inactive"
        icon={UserRoundX}
      />
    </div>
    <p className="mt-3 text-[10px] leading-5 text-[var(--df-muted)]">
      The first metric reflects the server-reported total for the current filters.
      The other metrics describe the currently loaded page, not the entire database.
    </p>
  </section>

  {/* Search and controls */}
  <section className="mb-5">
    <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
      <label className="relative block w-full xl:max-w-[480px]">
        <Search
          size={16}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--df-muted)]"
        />
        <input
          type="search"
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          placeholder="Search by name or email…"
          aria-label="Search users by name or email"
          className="min-h-[46px] w-full border border-[var(--df-line)] bg-[rgba(255,255,255,0.22)] pl-11 pr-11 text-[12px] text-[var(--df-text)] outline-none transition-colors placeholder:text-[var(--df-soft)] focus:border-[var(--df-muted)]"
        />
        {searchInput && (
          <button
            type="button"
            onClick={() => {
              setSearchInput("");
              setSearch("");
              setPage(1);
            }}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[var(--df-muted)] hover:text-[var(--df-text)]"
          >
            <X size={14} />
          </button>
        )}
      </label>

      <div className="flex flex-wrap items-center gap-2">
        <label className="flex min-h-10 items-center gap-2 border border-[var(--df-line)] px-3">
          <span className="text-[10px] text-[var(--df-muted)]">Rows</span>
          <select
            value={limit}
            onChange={(event) => {
              setLimit(Number(event.target.value));
              setPage(1);
            }}
            className="bg-transparent text-[11px] text-[var(--df-text)] outline-none"
            aria-label="Rows per page"
          >
            {PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        </label>

        <div className="relative">
          <button
            type="button"
            onClick={() => setSortMenuOpen((value) => !value)}
            aria-expanded={sortMenuOpen}
            className="df-btn df-btn-outline !min-h-10 !px-3"
          >
            <ArrowDownUp size={14} />
            Sort
            <ChevronDown size={13} />
          </button>
          {sortMenuOpen && (
            <div className="absolute right-0 top-full z-20 mt-2 w-48 border border-[var(--df-line)] bg-[var(--df-paper)] p-1 shadow-lg">
              {[
                { label: "Newest first", field: "createdAt", order: "desc" },
                { label: "Oldest first", field: "createdAt", order: "asc" },
                { label: "Name A–Z", field: "name", order: "asc" },
                { label: "Name Z–A", field: "name", order: "desc" },
                { label: "Email A–Z", field: "email", order: "asc" },
              ].map((option) => (
                <button
                  key={`${option.field}-${option.order}`}
                  type="button"
                  onClick={() => {
                    setFilters((current) => ({
                      ...current,
                      sortBy: option.field,
                      sortOrder: option.order,
                    }));
                    setPage(1);
                    setSortMenuOpen(false);
                  }}
                  className="flex w-full items-center justify-between px-3 py-2.5 text-left text-[11px] text-[var(--df-text)] hover:bg-[var(--df-paper-2)]"
                >
                  {option.label}
                  {filters.sortBy === option.field && filters.sortOrder === option.order && (
                    <Check size={13} />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>

    {filtersOpen && (
      <div className="mt-3 border border-[var(--df-line)] bg-[rgba(255,255,255,0.15)] p-4 sm:p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-[var(--df-muted)]" />
            <p className="text-[12px] font-semibold">Refine user directory</p>
          </div>
          <button
            type="button"
            onClick={resetFilters}
            className="text-[11px] text-[var(--df-muted)] underline underline-offset-4 hover:text-[var(--df-text)]"
          >
            Reset all
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <label className="flex flex-col gap-2">
            <span className="df-eyebrow">ROLE</span>
            <select
              value={filters.role}
              onChange={(event) => updateFilter("role", event.target.value)}
              className="min-h-11 border border-[var(--df-line)] bg-[var(--df-paper)] px-3 text-[12px] outline-none focus:border-[var(--df-muted)]"
            >
              <option value="">All roles</option>
              <option value="DEVELOPER">Developer</option>
              <option value="RECRUITER">Recruiter</option>
              <option value="ADMIN">Admin</option>
            </select>
          </label>

          <label className="flex flex-col gap-2">
            <span className="df-eyebrow">ACCOUNT STATUS</span>
            <select
              value={filters.isActive}
              onChange={(event) => updateFilter("isActive", event.target.value)}
              className="min-h-11 border border-[var(--df-line)] bg-[var(--df-paper)] px-3 text-[12px] outline-none focus:border-[var(--df-muted)]"
            >
              <option value="">All statuses</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </label>

          <label className="flex flex-col gap-2">
            <span className="df-eyebrow">VERIFICATION</span>
            <select
              value={filters.isVerified}
              onChange={(event) => updateFilter("isVerified", event.target.value)}
              className="min-h-11 border border-[var(--df-line)] bg-[var(--df-paper)] px-3 text-[12px] outline-none focus:border-[var(--df-muted)]"
            >
              <option value="">All verification states</option>
              <option value="true">Verified</option>
              <option value="false">Unverified</option>
            </select>
          </label>
        </div>
      </div>
    )}

    {hasFilters && (
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="text-[10px] text-[var(--df-muted)]">ACTIVE FILTERS</span>
        {search && <span className="df-tag">Search: {search}</span>}
        {filters.role && <span className="df-tag">{formatRole(filters.role)}</span>}
        {filters.isActive !== "" && (
          <span className="df-tag">{filters.isActive === "true" ? "Active accounts" : "Inactive accounts"}</span>
        )}
        {filters.isVerified !== "" && (
          <span className="df-tag">{filters.isVerified === "true" ? "Verified" : "Unverified"}</span>
        )}
        <button
          type="button"
          onClick={resetFilters}
          className="ml-1 text-[10px] text-[var(--df-muted)] underline underline-offset-4 hover:text-[var(--df-text)]"
        >
          Clear all
        </button>
      </div>
    )}
  </section>

  {/* User table */}
  <section className="overflow-hidden border border-[var(--df-line)]">
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--df-line)] px-5 py-4 sm:px-6">
      <div>
        <p className="df-eyebrow">USER DIRECTORY</p>
        <h2 className="mt-1.5 text-[17px] font-medium tracking-[-0.045em]">
          Accounts
          <span className="ml-2 text-[12px] font-normal text-[var(--df-muted)]">
            ({total.toLocaleString()})
          </span>
        </h2>
      </div>
      <span className="inline-flex items-center gap-2 text-[10px] text-[var(--df-muted)]">
        <span className="df-dot !shadow-none" />
        Server-side results
      </span>
    </div>

    <div className="hidden overflow-x-auto md:block">
      <table className="w-full min-w-[850px] border-collapse text-left">
        <thead className="bg-[var(--df-paper-2)]/70">
          <tr className="border-b border-[var(--df-line)]">
            <th className="px-5 py-3.5 text-[9px] font-semibold uppercase tracking-[0.15em] text-[var(--df-muted)]">
              <button type="button" onClick={() => handleSort("name")} className="inline-flex items-center gap-1.5 hover:text-[var(--df-text)]">
                User <ArrowDownUp size={11} />
              </button>
            </th>
            <th className="px-4 py-3.5 text-[9px] font-semibold uppercase tracking-[0.15em] text-[var(--df-muted)]">Role</th>
            <th className="px-4 py-3.5 text-[9px] font-semibold uppercase tracking-[0.15em] text-[var(--df-muted)]">Account</th>
            <th className="px-4 py-3.5 text-[9px] font-semibold uppercase tracking-[0.15em] text-[var(--df-muted)]">
              <button type="button" onClick={() => handleSort("createdAt")} className="inline-flex items-center gap-1.5 hover:text-[var(--df-text)]">
                Joined <ArrowDownUp size={11} />
              </button>
            </th>
            <th className="px-4 py-3.5 text-right text-[9px] font-semibold uppercase tracking-[0.15em] text-[var(--df-muted)]">Actions</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-[var(--df-line-soft)]">
          {loadingList && users.length === 0 ? (
            <tr>
              <td colSpan={5} className="p-0">
                <LoadingRows />
              </td>
            </tr>
          ) : users.length === 0 ? (
            <tr>
              <td colSpan={5}>
                <EmptyState hasFilters={hasFilters} onReset={resetFilters} />
              </td>
            </tr>
          ) : (
            users.map((user) => (
              <tr
                key={user.id}
                className="group transition-colors hover:bg-[rgba(255,255,255,0.32)]"
              >
                <td className="px-5 py-4">
                  <button
                    type="button"
                    onClick={() => openDetails(user.id)}
                    className="flex min-w-0 items-center gap-3 text-left"
                  >
                    <Avatar user={user} />
                    <span className="min-w-0">
                      <span className="block max-w-[245px] truncate text-[12px] font-semibold text-[var(--df-text)] group-hover:underline group-hover:underline-offset-4">
                        {user.name || "Unnamed user"}
                      </span>
                      <span className="mt-1 block max-w-[245px] truncate text-[11px] text-[var(--df-muted)]">
                        {user.email}
                      </span>
                    </span>
                  </button>
                </td>

                <td className="px-4 py-4">
                  <RoleTag role={user.role} />
                </td>

                <td className="px-4 py-4">
                  <div className="flex flex-col items-start gap-1.5">
                    <StatusTag active={user.isActive} label={user.isActive ? "Active" : "Inactive"} />
                    <span className="inline-flex items-center gap-1 text-[10px] text-[var(--df-muted)]">
                      {user.isVerified ? (
                        <CheckCircle2 size={11} />
                      ) : (
                        <Clock3 size={11} />
                      )}
                      {user.isVerified ? "Verified" : "Unverified"}
                    </span>
                  </div>
                </td>

                <td className="px-4 py-4">
                  <span className="text-[11px] text-[var(--df-muted)]">
                    {formatDate(user.createdAt)}
                  </span>
                </td>

                <td className="px-4 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => openDetails(user.id)}
                      className="inline-flex min-h-8 items-center gap-1.5 rounded-full border border-[var(--df-line)] px-3 text-[10px] font-medium hover:bg-[var(--df-paper-2)]"
                    >
                      View
                      <ExternalLink size={11} />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setLocalStatusError(null);
                        setStatusTarget(user);
                      }}
                      disabled={submitting}
                      className="inline-flex min-h-8 items-center gap-1.5 rounded-full px-3 text-[10px] font-medium text-[var(--df-muted)] hover:bg-[var(--df-paper-2)] hover:text-[var(--df-text)] disabled:opacity-40"
                    >
                      {user.isActive ? "Deactivate" : "Activate"}
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>

    {/* Mobile card directory */}
    <div className="divide-y divide-[var(--df-line-soft)] md:hidden">
      {loadingList && users.length === 0 ? (
        <LoadingRows />
      ) : users.length === 0 ? (
        <EmptyState hasFilters={hasFilters} onReset={resetFilters} />
      ) : (
        users.map((user) => (
          <article key={user.id} className="p-4">
            <div className="flex items-start gap-3">
              <Avatar user={user} />
              <div className="min-w-0 flex-1">
                <button
                  type="button"
                  onClick={() => openDetails(user.id)}
                  className="block max-w-full truncate text-left text-[12px] font-semibold hover:underline hover:underline-offset-4"
                >
                  {user.name || "Unnamed user"}
                </button>
                <p className="mt-1 break-all text-[11px] text-[var(--df-muted)]">{user.email}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <RoleTag role={user.role} />
                  <StatusTag active={user.isActive} label={user.isActive ? "Active" : "Inactive"} />
                  <StatusTag active={user.isVerified} label={user.isVerified ? "Verified" : "Unverified"} />
                </div>
                <p className="mt-3 text-[10px] text-[var(--df-muted)]">
                  Joined {formatDate(user.createdAt)}
                </p>
              </div>
            </div>
            <div className="mt-4 flex gap-2 border-t border-[var(--df-line-soft)] pt-3">
              <button
                type="button"
                onClick={() => openDetails(user.id)}
                className="df-btn df-btn-outline !min-h-9 flex-1 !px-3"
              >
                View profile
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={() => {
                  setLocalStatusError(null);
                  setStatusTarget(user);
                }}
                className={`df-btn !min-h-9 flex-1 !px-3 ${
                  user.isActive ? "df-btn-outline" : "df-btn-accent"
                }`}
              >
                {user.isActive ? "Deactivate" : "Activate"}
              </button>
            </div>
          </article>
        ))
      )}
    </div>

    {/* Pagination */}
    <footer className="flex flex-col gap-4 border-t border-[var(--df-line)] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
      <p className="text-[10px] text-[var(--df-muted)]">
        Showing <span className="font-semibold text-[var(--df-text)]">{startRow}–{endRow}</span> of{" "}
        <span className="font-semibold text-[var(--df-text)]">{total.toLocaleString()}</span> users
      </p>

      <div className="flex items-center justify-between gap-3 sm:justify-end">
        <span className="text-[10px] text-[var(--df-muted)]">
          Page {currentPage} of {totalPages}
        </span>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            aria-label="Previous page"
            disabled={currentPage <= 1 || loadingList}
            onClick={() => setPage((value) => Math.max(1, value - 1))}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--df-line)] text-[var(--df-text)] transition-colors hover:bg-[var(--df-paper-2)] disabled:cursor-not-allowed disabled:opacity-35"
          >
            <ArrowLeft size={14} />
          </button>
          <button
            type="button"
            aria-label="Next page"
            disabled={currentPage >= totalPages || loadingList}
            onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--df-line)] text-[var(--df-text)] transition-colors hover:bg-[var(--df-paper-2)] disabled:cursor-not-allowed disabled:opacity-35"
          >
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </footer>
  </section>

  {loadingList && users.length > 0 && (
    <div className="mt-3 flex items-center gap-2 text-[10px] text-[var(--df-muted)]">
      <LoaderCircle size={12} className="animate-spin" />
      Updating directory…
    </div>
  )}

  <footer className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--df-line)] pt-5">
    <p className="text-[10px] text-[var(--df-muted)]">DEVFLOW / USER ACCESS MANAGEMENT</p>
    <p className="text-[10px] text-[var(--df-muted)]">Account status changes are recorded by the server.</p>
  </footer>

  {/* User details drawer */}
  {selectedUserId && (
    <UserDetailsDrawer
      user={detailUser}
      loading={loadingDetail}
      error={errorDetail}
      onClose={closeDetails}
      onRetry={() => dispatch(fetchAdminUserById(selectedUserId))}
      onStatus={(user) => {
        setLocalStatusError(null);
        setStatusTarget(user);
      }}
    />
  )}

  {/* Account status confirmation */}
  <ConfirmStatusDialog
    user={statusTarget}
    submitting={submitting}
    error={localStatusError || submitError}
    onClose={() => {
      if (!submitting) {
        setStatusTarget(null);
        setLocalStatusError(null);
      }
    }}
    onConfirm={confirmStatusChange}
  />
</div>


);
}
