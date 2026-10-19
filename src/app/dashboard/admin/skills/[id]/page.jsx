
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowLeft,
  ArrowUpRight,
  BadgeCheck,
  CalendarDays,
  Check,
  Code2,
  Layers3,
  LoaderCircle,
  Pencil,
  RefreshCw,
  ShieldAlert,
  Tag,
  Trash2,
  Users,
  BriefcaseBusiness,
} from "lucide-react";

import {
  fetchAdminSkillById,
  updateSkill,
  deleteSkill,
  clearCurrentSkill,
} from "@/lib/redux/slices/skillSlice";

const cx = (...values) => values.filter(Boolean).join(" ");

function humanize(value) {
  if (!value) return "Uncategorized";
  return String(value).replace(/[_-]+/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDate(value) {
  if (!value) return "Not available";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not available";
  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function StatusBadge({ active }) {
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

function Field({ label, value, mono = false }) {
  return (
    <div className="border-b border-[var(--df-line-soft)] py-3 last:border-b-0">
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--df-muted)]">
        {label}
      </p>
      <p className={cx("mt-1.5 break-words text-sm text-[var(--df-text)]", mono && "font-mono text-xs")}>
        {value === null || value === undefined || value === "" ? "Not provided" : value}
      </p>
    </div>
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

function EditSkillDialog({ skill, submitting, error, onClose, onSave }) {
  const [name, setName] = useState(skill?.name || "");
  const [category, setCategory] = useState(skill?.category || "");
  const [localError, setLocalError] = useState("");

  useEffect(() => {
    setName(skill?.name || "");
    setCategory(skill?.category || "");
    setLocalError("");
  }, [skill]);

  const submit = async (event) => {
    event.preventDefault();
    if (!name.trim() || !category.trim()) {
      setLocalError("Both skill name and category are required.");
      return;
    }

    const result = await onSave({
      id: skill.id,
      name: name.trim(),
      category: category.trim(),
    });

    if (result?.ok) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
      <form
        onSubmit={submit}
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-skill-title"
        className="w-full max-w-lg border border-[var(--df-line)] bg-[var(--df-paper)]"
      >
        <div className="border-b border-[var(--df-line)] p-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--df-muted)]">
            Catalog management
          </p>
          <h2 id="edit-skill-title" className="mt-1 text-xl font-semibold tracking-tight text-[var(--df-text-strong)]">
            Edit skill
          </h2>
        </div>
        <div className="space-y-4 p-5">
          {(localError || error) && (
            <p role="alert" className="border border-rose-800/15 bg-rose-800/[0.04] p-3 text-xs text-rose-900">
              {localError || error}
            </p>
          )}
          <label className="block">
            <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--df-muted)]">
              Name
            </span>
            <input
              autoFocus
              value={name}
              maxLength={100}
              onChange={(event) => setName(event.target.value)}
              className="h-11 w-full border border-[var(--df-line)] bg-transparent px-3 text-sm outline-none focus:border-[var(--df-ink)]"
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
              className="h-11 w-full border border-[var(--df-line)] bg-[var(--df-paper)] px-3 text-sm outline-none focus:border-[var(--df-ink)]"
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
        </div>
        <div className="flex flex-col-reverse gap-2 border-t border-[var(--df-line)] p-5 sm:flex-row sm:justify-end">
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
            className="inline-flex h-10 items-center justify-center gap-2 bg-[var(--df-ink)] px-4 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--df-paper)] disabled:opacity-50"
          >
            {submitting ? <LoaderCircle size={14} className="animate-spin" /> : <Check size={14} />}
            Save changes
          </button>
        </div>
      </form>
    </div>
  );
}

export default function AdminSkillDetailPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const {
    currentSkill,
    loadingDetail,
    submitting,
    errorDetail,
    submitError,
  } = useSelector((state) => state.skills);

  const skill = currentSkill?.id === id ? currentSkill : null;

  const [showEdit, setShowEdit] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [actionError, setActionError] = useState(null);

  const loadSkill = useCallback(() => {
    if (id) dispatch(fetchAdminSkillById(id));
  }, [dispatch, id]);

  useEffect(() => {
    loadSkill();
    return () => {
      dispatch(clearCurrentSkill());
    };
  }, [loadSkill, dispatch]);

  const isActive = skill?.isActive !== false;

  const handleSave = async (values) => {
    setActionError(null);
    const result = await dispatch(updateSkill(values));

    if (result.meta.requestStatus !== "fulfilled") {
      setActionError(result.payload || "Unable to update this skill.");
      return { ok: false };
    }

    await dispatch(fetchAdminSkillById(id));
    return { ok: true };
  };

  const handleDeactivate = async () => {
    if (!skill?.id) return;
    setActionError(null);

    const result = await dispatch(deleteSkill(skill.id));
    if (result.meta.requestStatus !== "fulfilled") {
      setActionError(result.payload || "Unable to deactivate this skill.");
      return;
    }

    setShowDeleteConfirm(false);
    router.push("/dashboard/admin/skills");
  };

  if (loadingDetail && !skill) {
    return (
      <main className="min-h-screen bg-[var(--df-paper)] px-4 py-8 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-[1440px] animate-pulse space-y-6">
          <div className="h-4 w-40 bg-[var(--df-paper-3)]" />
          <div className="h-12 w-72 max-w-full bg-[var(--df-paper-3)]" />
          <div className="grid gap-5 lg:grid-cols-[1.3fr_0.7fr]">
            <div className="h-72 border border-[var(--df-line)] bg-[var(--df-paper-2)]" />
            <div className="h-72 border border-[var(--df-line)] bg-[var(--df-paper-2)]" />
          </div>
        </div>
      </main>
    );
  }

  if (errorDetail && !skill) {
    return (
      <main className="min-h-screen bg-[var(--df-paper)] px-4 py-10 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-3xl border border-[var(--df-line)] p-7">
          <ShieldAlert size={22} className="text-rose-800" />
          <h1 className="mt-4 text-xl font-semibold text-[var(--df-text-strong)]">
            Unable to load skill
          </h1>
          <p className="mt-2 break-words text-sm leading-6 text-[var(--df-muted)]">
            {String(errorDetail)}
          </p>
          <div className="mt-5 flex gap-2">
            <button onClick={loadSkill} className="inline-flex h-10 items-center gap-2 border border-[var(--df-line)] px-4 text-xs font-semibold">
              <RefreshCw size={14} /> Retry
            </button>
            <Link href="/dashboard/admin/skills" className="inline-flex h-10 items-center border border-[var(--df-line)] px-4 text-xs font-semibold">
              Back to skills
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (!skill) {
    return (
      <main className="min-h-screen bg-[var(--df-paper)] px-4 py-10 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-3xl border border-[var(--df-line)] p-7">
          <Code2 size={22} />
          <h1 className="mt-4 text-xl font-semibold text-[var(--df-text-strong)]">
            Skill not found
          </h1>
          <p className="mt-2 text-sm leading-6 text-[var(--df-muted)]">
            This skill may have been removed or the identifier may be incorrect.
          </p>
          <Link href="/dashboard/admin/skills" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold hover:underline">
            <ArrowLeft size={15} /> Return to skills catalog
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--df-paper)] text-[var(--df-text)]">
      <div className="mx-auto max-w-[1440px] px-4 py-7 sm:px-6 lg:px-10 lg:py-10">
        <Link
          href="/dashboard/admin/skills"
          className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--df-muted)] hover:text-[var(--df-text-strong)]"
        >
          <ArrowLeft size={14} /> Skills catalog
        </Link>

        <header className="mt-7 flex flex-col justify-between gap-5 border-b border-[var(--df-line)] pb-7 xl:flex-row xl:items-end">
          <div className="min-w-0">
            <div className="mb-3 flex flex-wrap items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.13em] text-[var(--df-muted)]">
              <span>Skill record</span>
              <span>/</span>
              <span className="font-mono normal-case">{skill.id}</span>
            </div>
            <h1 className="break-words text-3xl font-semibold tracking-[-0.055em] text-[var(--df-text-strong)] sm:text-4xl">
              {skill.name}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--df-muted)]">
              Inspect and maintain this catalog entry used across developer profiles and job requirements.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge active={isActive} />
            <button
              type="button"
              onClick={loadSkill}
              disabled={loadingDetail}
              className="inline-flex h-10 items-center gap-2 border border-[var(--df-line)] px-3 text-xs font-semibold uppercase tracking-[0.08em] hover:border-[var(--df-ink)] disabled:opacity-50"
            >
              <RefreshCw size={14} className={loadingDetail ? "animate-spin" : ""} />
              Refresh
            </button>
            <button
              type="button"
              onClick={() => {
                setActionError(null);
                setShowEdit(true);
              }}
              className="inline-flex h-10 items-center gap-2 bg-[var(--df-ink)] px-4 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--df-paper)] hover:bg-[var(--df-charcoal)]"
            >
              <Pencil size={14} /> Edit skill
            </button>
          </div>
        </header>

        {actionError && !showEdit && !showDeleteConfirm && (
          <div role="alert" className="mt-5 border border-rose-800/15 bg-rose-800/[0.04] px-4 py-3 text-sm text-rose-900">
            {actionError}
          </div>
        )}

        <section className="mt-6 grid grid-cols-1 gap-px border border-[var(--df-line)] bg-[var(--df-line)] sm:grid-cols-3">
          <div className="bg-[var(--df-paper)] p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-[var(--df-muted)]">Catalog status</p>
            <div className="mt-3"><StatusBadge active={isActive} /></div>
            <p className="mt-3 text-xs text-[var(--df-muted)]">
              {isActive ? "Available in the active catalog." : "Hidden from active catalog results."}
            </p>
          </div>
          <div className="bg-[var(--df-paper)] p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-[var(--df-muted)]">Category</p>
            <p className="mt-3 flex items-center gap-2 text-lg font-semibold tracking-tight text-[var(--df-text-strong)]">
              <Layers3 size={18} /> {humanize(skill.category)}
            </p>
            <p className="mt-2 text-xs text-[var(--df-muted)]">Skill classification</p>
          </div>
          <div className="bg-[var(--df-paper)] p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-[var(--df-muted)]">Record ID</p>
            <p className="mt-3 break-all font-mono text-sm text-[var(--df-text-strong)]">{skill.id}</p>
            <p className="mt-2 text-xs text-[var(--df-muted)]">Unique catalog identifier</p>
          </div>
        </section>

        <div className="mt-6 grid grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.75fr)]">
          <section className="border border-[var(--df-line)] bg-[var(--df-paper)]">
            <div className="flex items-center gap-3 border-b border-[var(--df-line)] px-5 py-4">
              <span className="flex h-8 w-8 items-center justify-center border border-[var(--df-line)] bg-[var(--df-paper-2)]">
                <Tag size={15} />
              </span>
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-[var(--df-muted)]">Catalog metadata</p>
                <h2 className="mt-0.5 text-sm font-semibold text-[var(--df-text-strong)]">Skill information</h2>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-x-8 px-5 sm:grid-cols-2">
              <Field label="Skill name" value={skill.name} />
              <Field label="Category" value={humanize(skill.category)} />
              <Field label="Created at" value={formatDate(skill.createdAt)} />
              <Field label="Last updated" value={formatDate(skill.updatedAt)} />
              <Field label="Active status" value={isActive ? "Active" : "Inactive"} />
              <Field label="Skill ID" value={skill.id} mono />
            </div>
          </section>

          <aside className="space-y-5">
            <section className="border border-[var(--df-line)] bg-[var(--df-paper)]">
              <div className="border-b border-[var(--df-line)] px-5 py-4">
                <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-[var(--df-muted)]">Usage overview</p>
                <h2 className="mt-0.5 text-sm font-semibold text-[var(--df-text-strong)]">Where this skill is used</h2>
              </div>
              <div className="p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center border border-[var(--df-line)] bg-[var(--df-paper-2)]">
                    <Users size={16} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-[var(--df-text-strong)]">Developer profiles</p>
                    <p className="mt-1 text-xs leading-5 text-[var(--df-muted)]">
                      {Number.isFinite(skill._count?.developerSkills)
                        ? `${skill._count.developerSkills} linked developer profiles`
                        : "Usage count not returned by API"}
                    </p>
                  </div>
                </div>
                <div className="mt-5 flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center border border-[var(--df-line)] bg-[var(--df-paper-2)]">
                    <BriefcaseBusiness size={16} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-[var(--df-text-strong)]">Job requirements</p>
                    <p className="mt-1 text-xs leading-5 text-[var(--df-muted)]">
                      {Number.isFinite(skill._count?.jobSkills)
                        ? `${skill._count.jobSkills} linked job requirements`
                        : "Usage count not returned by API"}
                    </p>
                  </div>
                </div>
                <p className="mt-5 border-t border-[var(--df-line-soft)] pt-4 text-xs leading-5 text-[var(--df-muted)]">
                  Usage counts are shown only when the API includes the corresponding Prisma relation counts.
                </p>
              </div>
            </section>

            <section className="border border-[var(--df-line)] bg-[var(--df-paper-2)] p-5">
              <div className="flex items-start gap-3">
                <BadgeCheck size={17} className="mt-0.5 shrink-0 text-[var(--df-muted)]" />
                <div>
                  <h3 className="text-xs font-semibold text-[var(--df-text-strong)]">Safe catalog management</h3>
                  <p className="mt-1.5 text-xs leading-5 text-[var(--df-muted)]">
                    Deactivate a skill to remove it from active listings while preserving existing relations and historical data.
                  </p>
                </div>
              </div>
              {isActive && (
                <button
                  type="button"
                  onClick={() => {
                    setActionError(null);
                    setShowDeleteConfirm(true);
                  }}
                  className="mt-5 inline-flex h-10 items-center gap-2 border border-rose-800/20 px-4 text-xs font-semibold uppercase tracking-[0.08em] text-rose-800 hover:bg-rose-800/[0.05]"
                >
                  <Trash2 size={14} /> Deactivate skill
                </button>
              )}
            </section>
          </aside>
        </div>

        <div className="mt-8 border-t border-[var(--df-line)] pt-5">
          <Link
            href="/dashboard/admin/skills"
            className="inline-flex h-10 items-center gap-2 border border-[var(--df-line)] px-4 text-xs font-semibold uppercase tracking-[0.08em] hover:border-[var(--df-ink)] hover:bg-[var(--df-paper-2)]"
          >
            <ArrowLeft size={14} /> Back to skills
          </Link>
        </div>
      </div>

      {showEdit && (
        <EditSkillDialog
          skill={skill}
          submitting={submitting}
          error={actionError || submitError}
          onClose={() => {
            if (!submitting) {
              setShowEdit(false);
              setActionError(null);
            }
          }}
          onSave={handleSave}
        />
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
          <section role="alertdialog" aria-modal="true" aria-labelledby="confirm-deactivate-title" className="w-full max-w-md border border-[var(--df-line)] bg-[var(--df-paper)] p-6">
            <div className="flex h-10 w-10 items-center justify-center border border-rose-800/15 bg-rose-800/[0.05] text-rose-800">
              <Trash2 size={18} />
            </div>
            <h2 id="confirm-deactivate-title" className="mt-4 text-xl font-semibold tracking-tight text-[var(--df-text-strong)]">
              Deactivate {skill.name}?
            </h2>
            <p className="mt-2 text-sm leading-6 text-[var(--df-muted)]">
              This removes the skill from the active catalog but should preserve existing references.
            </p>
            {(actionError || submitError) && (
              <p role="alert" className="mt-3 text-xs text-rose-800">{actionError || submitError}</p>
            )}
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={submitting}
                onClick={() => setShowDeleteConfirm(false)}
                className="h-10 border border-[var(--df-line)] px-4 text-xs font-semibold uppercase tracking-[0.08em] disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleDeactivate}
                className="inline-flex h-10 items-center justify-center gap-2 bg-rose-800 px-4 text-xs font-semibold uppercase tracking-[0.08em] text-white disabled:opacity-50"
              >
                {submitting && <LoaderCircle size={14} className="animate-spin" />}
                Confirm deactivation
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
