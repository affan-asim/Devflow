
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import {
  Activity,
  ArrowDownUp,
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Code2,
  Layers3,
  LoaderCircle,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Tag,
  Trash2,
  X,
  AlertTriangle,
} from "lucide-react";

import {
  fetchAdminSkills,
  createSkill,
  updateSkill,
  deleteSkill,
  clearSkillErrors,
} from "@/lib/redux/slices/skillSlice";

const PAGE_SIZE = 12;

const SORT_OPTIONS = [
  { label: "Recently updated", value: "updatedAt:desc" },
  { label: "Name A–Z", value: "name:asc" },
  { label: "Name Z–A", value: "name:desc" },
  { label: "Category A–Z", value: "category:asc" },
  { label: "Oldest first", value: "createdAt:asc" },
];

const cx = (...values) => values.filter(Boolean).join(" ");

function humanize(value) {
  if (!value) return "Uncategorized";
  return String(value)
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function IconButton({ label, onClick, children, disabled, danger = false }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={cx(
        "inline-flex h-9 w-9 items-center justify-center border transition disabled:cursor-not-allowed disabled:opacity-40",
        danger
          ? "border-rose-800/15 text-rose-800 hover:bg-rose-800/[0.06]"
          : "border-[var(--df-line)] text-[var(--df-text)] hover:border-[var(--df-ink)] hover:bg-[var(--df-paper-2)]"
      )}
    >
      {children}
    </button>
  );
}

function Status({ active }) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-2 border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.09em]",
        active
          ? "border-emerald-800/15 bg-emerald-800/[0.05] text-emerald-800"
          : "border-[var(--df-line)] bg-[var(--df-paper-2)] text-[var(--df-muted)]"
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {active ? "Active" : "Inactive"}
    </span>
  );
}

const SKILL_CATEGORIES = [
  "FRONTEND",
  "BACKEND",
  "DATABASE",
  "DEVOPS",
  "MOBILE",
  "DESIGN",
  "OTHER",
];

function SkillFormModal({ skill, submitting, error, onClose, onSubmit }) {
  const [name, setName] = useState(skill?.name || "");
  const [category, setCategory] = useState(skill?.category || "");
  const [localError, setLocalError] = useState("");

  useEffect(() => {
    setName(skill?.name || "");
    setCategory(skill?.category || "");
    setLocalError("");
  }, [skill]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLocalError("");

    if (!name.trim()) {
      setLocalError("Skill name is required.");
      return;
    }

    if (!category.trim()) {
      setLocalError("Category is required.");
      return;
    }

    const result = await onSubmit({
      ...(skill ? { id: skill.id } : {}),
      name: name.trim(),
      category: category.trim(),
    });

    if (result?.ok) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !submitting) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="skill-form-title"
        className="w-full max-w-lg border border-[var(--df-line)] bg-[var(--df-paper)] shadow-2xl"
      >
        <header className="flex items-start justify-between border-b border-[var(--df-line)] px-5 py-5 sm:px-6">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--df-muted)]">
              Skill catalog
            </p>
            <h2
              id="skill-form-title"
              className="mt-1 text-xl font-semibold tracking-[-0.04em] text-[var(--df-text-strong)]"
            >
              {skill ? "Edit skill" : "Create skill"}
            </h2>
            <p className="mt-1 text-xs leading-5 text-[var(--df-muted)]">
              Keep skill names and categories consistent across developer
              profiles and job listings.
            </p>
          </div>
          <IconButton label="Close dialog" onClick={onClose} disabled={submitting}>
            <X size={16} />
          </IconButton>
        </header>

        <form onSubmit={handleSubmit} className="space-y-5 p-5 sm:p-6">
          {(localError || error) && (
            <div
              role="alert"
              className="border border-rose-800/15 bg-rose-800/[0.04] px-3 py-2.5 text-xs leading-5 text-rose-900"
            >
              {localError || error}
            </div>
          )}

          <label className="block">
            <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--df-muted)]">
              Skill name
            </span>
            <input
              autoFocus
              maxLength={100}
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. React"
              className="h-11 w-full border border-[var(--df-line)] bg-transparent px-3 text-sm outline-none transition placeholder:text-[var(--df-soft)] focus:border-[var(--df-ink)]"
              disabled={submitting}
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--df-muted)]">
              Category
            </span>
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="h-11 w-full border border-[var(--df-line)] bg-[var(--df-paper)] px-3 text-sm outline-none transition focus:border-[var(--df-ink)]"
              disabled={submitting}
            >
              <option value="">Select a category</option>
              {SKILL_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {humanize(cat)}
                </option>
              ))}
            </select>
          </label>

          <div className="flex flex-col-reverse gap-2 border-t border-[var(--df-line)] pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              disabled={submitting}
              onClick={onClose}
              className="h-10 border border-[var(--df-line)] px-4 text-xs font-semibold uppercase tracking-[0.08em] hover:bg-[var(--df-paper-2)] disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex h-10 items-center justify-center gap-2 bg-[var(--df-ink)] px-5 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--df-paper)] transition hover:bg-[var(--df-charcoal)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? (
                <LoaderCircle size={14} className="animate-spin" />
              ) : (
                <Check size={14} />
              )}
              {skill ? "Save changes" : "Create skill"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function DeleteConfirmation({ skill, submitting, error, onClose, onConfirm }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !submitting) onClose();
      }}
    >
      <section
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-skill-title"
        className="w-full max-w-md border border-[var(--df-line)] bg-[var(--df-paper)] shadow-2xl"
      >
        <div className="p-6">
          <div className="flex h-10 w-10 items-center justify-center border border-rose-800/15 bg-rose-800/[0.05] text-rose-800">
            <AlertTriangle size={19} />
          </div>
          <h2
            id="delete-skill-title"
            className="mt-4 text-xl font-semibold tracking-[-0.04em] text-[var(--df-text-strong)]"
          >
            Deactivate this skill?
          </h2>
          <p className="mt-2 text-sm leading-6 text-[var(--df-muted)]">
            <strong className="text-[var(--df-text)]">{skill?.name}</strong>{" "}
            will be hidden from the active skills catalog. Existing references
            should be preserved. You can reactivate it later if your admin API
            supports that action.
          </p>

          {error && (
            <p role="alert" className="mt-4 text-xs leading-5 text-rose-800">
              {error}
            </p>
          )}

          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              disabled={submitting}
              onClick={onClose}
              className="h-10 border border-[var(--df-line)] px-4 text-xs font-semibold uppercase tracking-[0.08em] hover:bg-[var(--df-paper-2)] disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={onConfirm}
              className="inline-flex h-10 items-center justify-center gap-2 bg-rose-800 px-4 text-xs font-semibold uppercase tracking-[0.08em] text-white hover:bg-rose-900 disabled:opacity-50"
            >
              {submitting && <LoaderCircle size={14} className="animate-spin" />}
              Deactivate skill
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function SkillCard({ skill, onEdit, onDelete }) {
  return (
    <article className="group flex min-w-0 flex-col border border-[var(--df-line)] bg-[var(--df-paper)] transition hover:border-[var(--df-ink)]">
      <div className="flex items-start justify-between gap-3 p-5">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center border border-[var(--df-line)] bg-[var(--df-paper-2)] text-[var(--df-text)] transition group-hover:bg-[var(--df-accent)]">
          <Code2 size={20} strokeWidth={1.6} />
        </div>
        <Status active={skill.isActive !== false} />
      </div>

      <div className="min-w-0 flex-1 px-5 pb-5">
        <h3 className="break-words text-lg font-semibold tracking-[-0.035em] text-[var(--df-text-strong)]">
          {skill.name}
        </h3>
        <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-[var(--df-muted)]">
          <Layers3 size={12} />
          {humanize(skill.category)}
        </p>

        <div className="mt-5 grid grid-cols-2 gap-3 border-t border-[var(--df-line-soft)] pt-4">
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[var(--df-muted)]">
              Created
            </p>
            <p className="mt-1 text-xs text-[var(--df-text)]">
              {formatDate(skill.createdAt)}
            </p>
          </div>
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[var(--df-muted)]">
              Updated
            </p>
            <p className="mt-1 text-xs text-[var(--df-text)]">
              {formatDate(skill.updatedAt)}
            </p>
          </div>
        </div>
      </div>

      <footer className="flex items-center justify-between border-t border-[var(--df-line)] px-4 py-3">
        <Link
          href={`/dashboard/admin/skills/${encodeURIComponent(skill.id)}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--df-text)] hover:underline"
        >
          View details <ArrowRight size={13} />
        </Link>
        <div className="flex items-center gap-1.5">
          <IconButton label={`Edit ${skill.name}`} onClick={() => onEdit(skill)}>
            <Pencil size={14} />
          </IconButton>
          <IconButton
            label={`Deactivate ${skill.name}`}
            danger
            onClick={() => onDelete(skill)}
          >
            <Trash2 size={14} />
          </IconButton>
        </div>
      </footer>
    </article>
  );
}

export default function AdminSkillsPage() {
  const dispatch = useDispatch();
  const {
    skills = [],
    metadata = {},
    loadingList,
    submitting,
    errorList,
    submitError,
  } = useSelector((state) => state.skills);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("active");
  const [sort, setSort] = useState("updatedAt:desc");
  const [page, setPage] = useState(1);
  const [formSkill, setFormSkill] = useState(undefined);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [actionError, setActionError] = useState(null);

  const [sortBy, sortOrder] = useMemo(() => {
    const [field, order] = sort.split(":");
    return [field || "updatedAt", order || "desc"];
  }, [sort]);

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput.trim()), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    setPage(1);
  }, [search, category, status, sort]);

  const loadSkills = useCallback(() => {
    dispatch(
      fetchAdminSkills({
        page,
        limit: PAGE_SIZE,
        ...(search ? { search } : {}),
        ...(category ? { category } : {}),
        ...(status ? { status } : {}),
        sortBy,
        sortOrder,
      })
    );
  }, [dispatch, page, search, category, status, sortBy, sortOrder]);

  useEffect(() => {
    loadSkills();
  }, [loadSkills]);

  const categories = useMemo(() => {
    const values = skills.map((skill) => skill.category).filter(Boolean);
    return [...new Set(values)].sort((a, b) => a.localeCompare(b));
  }, [skills]);

  const total = metadata.totalCount ?? metadata.total ?? 0;
  const currentPage = metadata.currentPage ?? metadata.page ?? page;
  const totalPages = metadata.totalPages ?? 0;

  const activeOnPage = skills.filter((skill) => skill.isActive !== false).length;
  const inactiveOnPage = skills.length - activeOnPage;

  const clearFilters = () => {
    setSearchInput("");
    setSearch("");
    setCategory("");
    setStatus("active");
    setSort("updatedAt:desc");
    setPage(1);
    dispatch(clearSkillErrors());
  };

  const handleCreateOrUpdate = async (values) => {
    setActionError(null);

    const action = values.id
      ? await dispatch(updateSkill(values))
      : await dispatch(createSkill(values));

    if (action.meta.requestStatus !== "fulfilled") {
      const message = action.payload || "Unable to save skill.";
      setActionError(message);
      return { ok: false };
    }

    await dispatch(
      fetchAdminSkills({
        page,
        limit: PAGE_SIZE,
        ...(search ? { search } : {}),
        ...(category ? { category } : {}),
        ...(status ? { status } : {}),
        sortBy,
        sortOrder,
      })
    );

    return { ok: true };
  };

  const handleDelete = async () => {
    if (!deleteTarget?.id) return;

    setActionError(null);
    const result = await dispatch(deleteSkill(deleteTarget.id));

    if (result.meta.requestStatus !== "fulfilled") {
      setActionError(result.payload || "Unable to deactivate skill.");
      return;
    }

    setDeleteTarget(null);
    await dispatch(
      fetchAdminSkills({
        page,
        limit: PAGE_SIZE,
        ...(search ? { search } : {}),
        ...(category ? { category } : {}),
        ...(status ? { status } : {}),
        sortBy,
        sortOrder,
      })
    );
  };

  const hasFilters = Boolean(searchInput || category || sort !== "updatedAt:desc" || status !== "active");

  return (
    <main className="min-h-screen bg-[var(--df-paper)] text-[var(--df-text)]">
      <div className="mx-auto max-w-[1440px] px-4 py-7 sm:px-6 lg:px-10 lg:py-10">
        <header className="mb-8 flex flex-col justify-between gap-5 border-b border-[var(--df-line)] pb-7 md:flex-row md:items-end">
          <div>
            <p className="mb-3 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--df-muted)]">
              <span className="h-1.5 w-1.5 bg-[var(--df-accent)]" />
              DevFlow / Administration
            </p>
            <h1 className="text-3xl font-semibold tracking-[-0.055em] text-[var(--df-text-strong)] sm:text-4xl">
              Skills catalog
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--df-muted)]">
              Maintain the shared skills taxonomy used by developer profiles,
              job requirements, and hiring workflows.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={loadSkills}
              disabled={loadingList}
              className="inline-flex h-10 items-center gap-2 border border-[var(--df-line)] px-4 text-xs font-semibold uppercase tracking-[0.08em] hover:border-[var(--df-ink)] disabled:opacity-50"
            >
              <RefreshCw size={14} className={loadingList ? "animate-spin" : ""} />
              Refresh
            </button>
            <button
              type="button"
              onClick={() => {
                setActionError(null);
                setFormSkill(null);
              }}
              className="inline-flex h-10 items-center gap-2 bg-[var(--df-ink)] px-4 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--df-paper)] transition hover:bg-[var(--df-charcoal)]"
            >
              <Plus size={15} />
              New skill
            </button>
          </div>
        </header>

        <section className="mb-6 grid grid-cols-1 gap-px border border-[var(--df-line)] bg-[var(--df-line)] sm:grid-cols-3">
          <div className="bg-[var(--df-paper)] p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-[var(--df-muted)]">
              Matching skills
            </p>
            <p className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-[var(--df-text-strong)]">
              {total.toLocaleString()}
            </p>
            <p className="mt-2 text-xs text-[var(--df-muted)]">
              Total matching the current filters
            </p>
          </div>
          <div className="bg-[var(--df-paper)] p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-[var(--df-muted)]">
              Active on this page
            </p>
            <p className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-[var(--df-text-strong)]">
              {activeOnPage}
            </p>
            <p className="mt-2 text-xs text-[var(--df-muted)]">
              {inactiveOnPage} inactive on this page
            </p>
          </div>
          <div className="bg-[var(--df-paper)] p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-[var(--df-muted)]">
              Catalog management
            </p>
            <div className="mt-3 flex items-center gap-2">
              <Sparkles size={18} />
              <span className="text-sm font-semibold text-[var(--df-text-strong)]">
                Shared taxonomy
              </span>
            </div>
            <p className="mt-2 text-xs leading-5 text-[var(--df-muted)]">
              Deactivation is safer than deleting a skill referenced by existing
              profiles or jobs.
            </p>
          </div>
        </section>

        <section className="border border-[var(--df-line)] bg-[var(--df-paper)]">
          <div className="border-b border-[var(--df-line)] p-4 sm:p-5">
            <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-sm font-semibold text-[var(--df-text-strong)]">
                  All skills
                </h2>
                <p className="mt-1 text-xs text-[var(--df-muted)]">
                  Search, filter, create, edit, or deactivate catalog items.
                </p>
              </div>
              {hasFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="inline-flex items-center gap-1.5 self-start text-xs font-semibold text-[var(--df-muted)] hover:text-[var(--df-text-strong)]"
                >
                  <X size={13} /> Reset filters
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <label className="flex h-10 min-w-0 items-center gap-2 border border-[var(--df-line)] px-3 focus-within:border-[var(--df-ink)] xl:col-span-2">
                <Search size={15} className="shrink-0 text-[var(--df-muted)]" />
                <input
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder="Search skills..."
                  className="w-full bg-transparent text-sm outline-none placeholder:text-[var(--df-soft)]"
                />
                {searchInput && (
                  <button type="button" onClick={() => setSearchInput("")} aria-label="Clear search">
                    <X size={14} />
                  </button>
                )}
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--df-muted)]">
                  Category
                </span>
                <select
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  className="h-10 border border-[var(--df-line)] bg-[var(--df-paper)] px-3 text-sm outline-none focus:border-[var(--df-ink)]"
                >
                  <option value="">All categories</option>
                  {SKILL_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{humanize(cat)}</option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--df-muted)]">
                  Status
                </span>
                <select
                  value={status}
                  onChange={(event) => setStatus(event.target.value)}
                  className="h-10 border border-[var(--df-line)] bg-[var(--df-paper)] px-3 text-sm outline-none focus:border-[var(--df-ink)]"
                >
                  <option value="">All statuses</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </label>

              <label className="flex flex-col gap-1.5 sm:col-span-2 xl:col-span-1">
                <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--df-muted)]">
                  Sort
                </span>
                <select
                  value={sort}
                  onChange={(event) => setSort(event.target.value)}
                  className="h-10 border border-[var(--df-line)] bg-[var(--df-paper)] px-3 text-sm outline-none focus:border-[var(--df-ink)]"
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          {errorList && (
            <div role="alert" className="border-b border-rose-800/15 bg-rose-800/[0.04] px-5 py-3 text-sm text-rose-900">
              {String(errorList)}
              <button type="button" onClick={loadSkills} className="ml-3 font-semibold underline">Retry</button>
            </div>
          )}

          {actionError && !formSkill && !deleteTarget && (
            <div role="alert" className="border-b border-rose-800/15 bg-rose-800/[0.04] px-5 py-3 text-sm text-rose-900">
              {actionError}
              <button type="button" onClick={() => setActionError(null)} className="ml-3 underline">Dismiss</button>
            </div>
          )}

          <div className="p-4 sm:p-5">
            {loadingList && skills.length === 0 ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="h-56 animate-pulse border border-[var(--df-line)] bg-[var(--df-paper-2)]" />
                ))}
              </div>
            ) : skills.length ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {skills.map((skill) => (
                  <SkillCard
                    key={skill.id}
                    skill={skill}
                    onEdit={(value) => {
                      setActionError(null);
                      setFormSkill(value);
                    }}
                    onDelete={(value) => {
                      setActionError(null);
                      setDeleteTarget(value);
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="px-5 py-16 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center border border-[var(--df-line)] bg-[var(--df-paper-2)]">
                  <Tag size={20} className="text-[var(--df-muted)]" />
                </div>
                <h3 className="mt-4 text-sm font-semibold text-[var(--df-text-strong)]">
                  No skills found
                </h3>
                <p className="mt-1 text-xs text-[var(--df-muted)]">
                  Try a different search or create a new catalog skill.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setActionError(null);
                    setFormSkill(null);
                  }}
                  className="mt-4 inline-flex h-9 items-center gap-2 border border-[var(--df-line)] px-3 text-xs font-semibold hover:bg-[var(--df-paper-2)]"
                >
                  <Plus size={13} /> Create skill
                </button>
              </div>
            )}
          </div>

          <footer className="flex flex-col gap-3 border-t border-[var(--df-line)] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <p className="text-xs text-[var(--df-muted)]">
              Page <strong className="text-[var(--df-text)]">{total ? currentPage : 0}</strong> of{" "}
              <strong className="text-[var(--df-text)]">{totalPages}</strong>
              {" · "}{total.toLocaleString()} matching skills
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={loadingList || currentPage <= 1}
                onClick={() => setPage((value) => Math.max(1, value - 1))}
                className="inline-flex h-9 items-center gap-1 border border-[var(--df-line)] px-3 text-xs font-semibold hover:border-[var(--df-ink)] disabled:opacity-40"
              >
                <ChevronLeft size={14} /> Previous
              </button>
              <button
                type="button"
                disabled={loadingList || currentPage >= totalPages || totalPages === 0}
                onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
                className="inline-flex h-9 items-center gap-1 border border-[var(--df-line)] px-3 text-xs font-semibold hover:border-[var(--df-ink)] disabled:opacity-40"
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          </footer>
        </section>
      </div>

      {formSkill !== undefined && (
        <SkillFormModal
          skill={formSkill || null}
          submitting={submitting}
          error={actionError || submitError}
          onClose={() => {
            if (!submitting) {
              setFormSkill(undefined);
              setActionError(null);
            }
          }}
          onSubmit={handleCreateOrUpdate}
        />
      )}

      {deleteTarget && (
        <DeleteConfirmation
          skill={deleteTarget}
          submitting={submitting}
          error={actionError || submitError}
          onClose={() => {
            if (!submitting) {
              setDeleteTarget(null);
              setActionError(null);
            }
          }}
          onConfirm={handleDelete}
        />
      )}
    </main>
  );
}
