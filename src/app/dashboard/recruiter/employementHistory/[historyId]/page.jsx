"use client";

import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useRouter } from "next/navigation";
import {
    ArrowLeft,
    BriefcaseBusiness,
    CalendarDays,
    Check,
    ChevronRight,
    CircleAlert,
    Clock3,
    ExternalLink,
    Globe,
    Mail,
    MapPin,
    Pencil,
    ShieldCheck,
    UserRound,
    X,
    XCircle,
    Loader2,
} from "lucide-react";

import {
    fetchRecruiterEmploymentHistoryById,
    updateEmploymentHistory,
} from "@/lib/redux/slices/employmentHistorySlice";

import {
    terminateEmployee,
    updateDeveloperEmploymentEventStatus,
} from "@/lib/redux/slices/employmentEventsSlice";
import { FiGithub } from "react-icons/fi";
import { uploadFileToStorage } from "@/lib/storage/uploadFile";
import api from "@/lib/api/axios";

const ACCEPTED_LETTER_TYPES = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain"];
const MAX_LETTER_SIZE = 5 * 1024 * 1024;

function formatDate(date) {
    if (!date) return "—";

    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    }).format(new Date(date));
}

function formatDateTime(date) {
    if (!date) return "—";

    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
    }).format(new Date(date));
}

function getInitials(name = "") {
    return (
        name
            .split(" ")
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => part[0]?.toUpperCase())
            .join("") || "?"
    );
}

function formatEmploymentType(type) {
    if (!type) return "—";

    return type
        .toLowerCase()
        .replaceAll("_", " ")
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getDuration(startDate, endDate, isCurrent) {
    if (!startDate) return "—";

    const start = new Date(startDate);

    const end = isCurrent
        ? new Date()
        : endDate
        ? new Date(endDate)
        : null;

    if (!end || end < start) return "—";

    const months =
        (end.getFullYear() - start.getFullYear()) * 12 +
        (end.getMonth() - start.getMonth());

    if (months < 1) return "< 1 month";

    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;

    if (years === 0) {
        return `${remainingMonths} ${
            remainingMonths === 1 ? "month" : "months"
        }`;
    }

    if (remainingMonths === 0) {
        return `${years} ${years === 1 ? "year" : "years"}`;
    }

    return `${years}y ${remainingMonths}m`;
}

function StatusBadge({ status }) {
    const config = {
        PENDING: {
            label: "Pending",
            className:
                "border-amber-300 bg-amber-50 text-amber-800",
            icon: Clock3,
        },

        ACCEPTED: {
            label: "Accepted",
            className:
                "border-emerald-300 bg-emerald-50 text-emerald-800",
            icon: Check,
        },

        REJECTED: {
            label: "Rejected",
            className:
                "border-red-300 bg-red-50 text-red-800",
            icon: X,
        },
    };

    const item = config[status] || {
        label: status,
        className:
            "border-[var(--df-line)] text-[var(--df-muted)]",
        icon: Clock3,
    };

    const Icon = item.icon;

    return (
        <span
            className={`inline-flex items-center gap-1.5 border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] ${item.className}`}
        >
            <Icon className="h-3 w-3" />
            {item.label}
        </span>
    );
}

function Section({
    eyebrow,
    title,
    children,
    action,
}) {
    return (
        <section className="border-t border-[var(--df-line)] pt-6">
            <div className="mb-5 flex items-end justify-between gap-4">
                <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--df-accent)]">
                        {eyebrow}
                    </p>

                    <h2 className="mt-1 text-lg font-semibold tracking-tight">
                        {title}
                    </h2>
                </div>

                {action}
            </div>

            {children}
        </section>
    );
}

function InfoItem({
    icon: Icon,
    label,
    value,
}) {
    return (
        <div className="min-w-0">
            <div className="mb-1 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--df-muted)]">
                <Icon className="h-3.5 w-3.5" />
                {label}
            </div>

            <p className="truncate text-sm font-medium">
                {value || "—"}
            </p>
        </div>
    );
}

function ActionButton({
    children,
    onClick,
    disabled = false,
    variant = "default",
    icon: Icon,
    type = "button",
}) {
    const variants = {
        default:
            "border-[var(--df-line)] bg-[var(--df-paper)] text-[var(--df-text)] hover:border-[var(--df-text)]",

        dark:
            "border-[var(--df-text)] bg-[var(--df-text)] text-[var(--df-paper)] hover:opacity-90",

        danger:
            "border-red-300 bg-red-50 text-red-800 hover:bg-red-100",

        success:
            "border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100",
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`inline-flex min-h-10 items-center justify-center gap-2 border px-4 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]}`}
        >
            {Icon && <Icon className="h-4 w-4" />}
            {children}
        </button>
    );
}

function Modal({
    title,
    children,
    onClose,
    disabled = false,
}) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]">
            <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto border border-[var(--df-line)] bg-[var(--df-paper)] shadow-2xl">
                <div className="flex items-center justify-between border-b border-[var(--df-line)] px-5 py-4">
                    <h2 className="text-lg font-semibold">
                        {title}
                    </h2>

                    <button
                        type="button"
                        disabled={disabled}
                        onClick={onClose}
                        className="inline-flex h-9 w-9 items-center justify-center text-[var(--df-muted)] transition hover:bg-black/5 hover:text-[var(--df-text)] disabled:opacity-50"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {children}
            </div>
        </div>
    );
}

export default function EmploymentDetailPage() {
    const router = useRouter();
    const dispatch = useDispatch();
    const params = useParams();

    const historyId = params?.historyId;

    const {
        currentEmployment,
        loadingDetail,
        submitting,
        submitError,
    } = useSelector(
        (state) => state.employmentHistory
    );

    const {
        updatingEventStatus,
        terminatingEmployee,
        statusError,
        terminationError,
    } = useSelector(
        (state) => state.employmentEvents
    );

    const [showTerminateModal, setShowTerminateModal] =
        useState(false);

    const [showEditModal, setShowEditModal] =
        useState(false);

    const [terminationReason, setTerminationReason] =
        useState("");
    const [terminationLetter, setTerminationLetter] = useState(null);
    const [uploadingLetter, setUploadingLetter] = useState(false);
    const [letterError, setLetterError] = useState(null);
    const [openingLetterId, setOpeningLetterId] = useState(null);

    const handleOpenLetter = async (key) => {
        if (!key) return;
        try {
            setOpeningLetterId(key);
            const response = await api.get(`/api/get-presignedUrl?key=${encodeURIComponent(key)}`);
            const url = response.data?.data;
            if (!url) throw new Error("Unable to open this document.");
            window.open(url, "_blank", "noopener,noreferrer");
        } catch (error) {
            setLetterError(error.response?.data?.error || error.message || "Unable to open this document.");
        } finally {
            setOpeningLetterId(null);
        }
    };

    const [editForm, setEditForm] = useState({
        roleTitle: "",
        description: "",
        salary: "",
        currency: "",
        employmentType: "",
    });

    useEffect(() => {
        if (!historyId) return;

        dispatch(
            fetchRecruiterEmploymentHistoryById(
                historyId
            )
        );
    }, [dispatch, historyId]);

    useEffect(() => {
        if (!currentEmployment) return;

        setEditForm({
            roleTitle:
                currentEmployment.roleTitle || "",

            description:
                currentEmployment.description || "",

            salary:
                currentEmployment.salary !== null &&
                currentEmployment.salary !== undefined
                    ? String(currentEmployment.salary)
                    : "",

            currency:
                currentEmployment.currency || "",

            employmentType:
                currentEmployment.employmentType || "",
        });
    }, [currentEmployment]);

    const events = useMemo(() => {
        return [
            ...(currentEmployment?.employmentEvents || []),
        ].sort(
            (a, b) =>
                new Date(b.createdAt) -
                new Date(a.createdAt)
        );
    }, [currentEmployment]);

    const pendingResignation = useMemo(() => {
        return events.find(
            (event) =>
                event.type === "RESIGN" &&
                event.status === "PENDING"
        );
    }, [events]);

    const employee = currentEmployment?.developer;
    const employeeUser = employee?.user;

    const isCurrent =
        currentEmployment?.isCurrent === true;

    const duration = getDuration(
        currentEmployment?.startDate,
        currentEmployment?.endDate,
        isCurrent
    );

    const reload = async () => {
        if (!historyId) return;

        await dispatch(
            fetchRecruiterEmploymentHistoryById(
                historyId
            )
        );
    };

    const handleResignationDecision = async (
        status
    ) => {
        if (!pendingResignation?.id) return;

        const result = await dispatch(
            updateDeveloperEmploymentEventStatus({
                eventId: pendingResignation.id,
                status,
            })
        );

        if (
            updateDeveloperEmploymentEventStatus.fulfilled.match(
                result
            )
        ) {
            await reload();
        }
    };

    const handleTerminate = async () => {
        const reason = terminationReason.trim();

        if (!reason) return;

        let letterUrl = null;
        if (terminationLetter) {
            try {
                setUploadingLetter(true);
                setLetterError(null);
                letterUrl = await uploadFileToStorage(terminationLetter, "COVER_LETTER");
            } catch (error) {
                setLetterError(error?.message || "Unable to upload the letter. Please try again.");
                setUploadingLetter(false);
                return;
            }
            setUploadingLetter(false);
        }

        const result = await dispatch(
            terminateEmployee({
                historyId,
                reason,
                letterUrl,
            })
        );

        if (
            terminateEmployee.fulfilled.match(result)
        ) {
            setShowTerminateModal(false);
            setTerminationReason("");
            setTerminationLetter(null);

            await reload();
        }
    };

    const handleUpdateEmployment = async (
        event
    ) => {
        event.preventDefault();

        const result = await dispatch(
            updateEmploymentHistory({
                id: historyId,

                roleTitle:
                    editForm.roleTitle.trim(),

                description:
                    editForm.description.trim(),

                salary:
                    editForm.salary === ""
                        ? null
                        : Number(editForm.salary),

                currency:
                    editForm.currency.trim(),

                employmentType:
                    editForm.employmentType.trim(),
            })
        );

        if (
            updateEmploymentHistory.fulfilled.match(
                result
            )
        ) {
            setShowEditModal(false);

            await reload();
        }
    };

    if (
        loadingDetail &&
        !currentEmployment
    ) {
        return <DetailSkeleton />;
    }

    if (!currentEmployment) {
        return (
            <main className="min-h-screen bg-[var(--df-paper)] px-4 py-8 text-[var(--df-text)] sm:px-6 lg:px-8">
                <div className="mx-auto max-w-6xl">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="mb-8 inline-flex items-center gap-2 text-sm text-[var(--df-muted)] hover:text-[var(--df-text)]"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to employees
                    </button>

                    <div className="border border-[var(--df-line)] p-8">
                        <CircleAlert className="mb-4 h-6 w-6 text-red-600" />

                        <h1 className="text-xl font-semibold">
                            Employment record unavailable
                        </h1>

                        <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--df-muted)]">
                            {submitError ||
                                "The employment record could not be loaded or is no longer available."}
                        </p>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <>
            <main className="min-h-screen bg-[var(--df-paper)] text-[var(--df-text)]">
                <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
                    {/* Breadcrumb */}
                    <div className="mb-7 flex flex-wrap items-center gap-2 text-xs text-[var(--df-muted)]">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="inline-flex items-center gap-2 hover:text-[var(--df-text)]"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Employees
                        </button>

                        <ChevronRight className="h-3.5 w-3.5" />

                        <span>
                            {employeeUser?.name ||
                                "Employee"}
                        </span>

                        <ChevronRight className="h-3.5 w-3.5" />

                        <span className="text-[var(--df-text)]">
                            Employment
                        </span>
                    </div>

                    {/* Header */}
                    <header className="border-y border-[var(--df-line)] py-7">
                        <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
                            <div className="flex min-w-0 items-center gap-4">
                                <div className="flex h-16 w-16 shrink-0 items-center justify-center bg-[var(--df-text)] text-lg font-bold text-[var(--df-paper)]">
                                    {getInitials(
                                        employeeUser?.name
                                    )}
                                </div>

                                <div className="min-w-0">
                                    <div className="mb-1 flex flex-wrap items-center gap-2">
                                        <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--df-accent)]">
                                            Employment record
                                        </span>

                                        {isCurrent ? (
                                            <span className="border border-emerald-300 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                                                Active
                                            </span>
                                        ) : (
                                            <span className="border border-[var(--df-line)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--df-muted)]">
                                                Closed
                                            </span>
                                        )}
                                    </div>

                                    <h1 className="truncate text-2xl font-semibold tracking-tight sm:text-3xl">
                                        {employeeUser?.name ||
                                            "Unnamed employee"}
                                    </h1>

                                    <p className="mt-1 text-sm text-[var(--df-muted)]">
                                        {currentEmployment.roleTitle ||
                                            "Employee"}

                                        {" · "}

                                        {currentEmployment.company
                                            ?.name ||
                                            "Company"}
                                    </p>
                                </div>
                            </div>

                            {isCurrent && (
                                <div className="flex flex-col gap-2 sm:flex-row">
                                    {pendingResignation ? (
                                        <div className="inline-flex min-h-10 items-center justify-center gap-2 border border-amber-300 bg-amber-50 px-4 text-sm font-semibold text-amber-800">
                                            <Clock3 className="h-4 w-4" />
                                            Resignation pending
                                        </div>
                                    ) : (
                                        <ActionButton
                                            variant="danger"
                                            icon={XCircle}
                                            onClick={() =>
                                                setShowTerminateModal(
                                                    true
                                                )
                                            }
                                        >
                                            Terminate employee
                                        </ActionButton>
                                    )}

                                    <ActionButton
                                        icon={Pencil}
                                        onClick={() =>
                                            setShowEditModal(
                                                true
                                            )
                                        }
                                    >
                                        Edit employment
                                    </ActionButton>
                                </div>
                            )}
                        </div>
                    </header>

                    {/* Content */}
                    <div className="grid gap-10 py-8 lg:grid-cols-[minmax(0,1fr)_330px]">
                        <div className="space-y-10">
                            {/* Resignation request */}
                            {pendingResignation && (
                                <section className="border border-amber-300 bg-amber-50/70 p-5">
                                    <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                                <Clock3 className="h-5 w-5 text-amber-700" />

                                                <h2 className="font-semibold text-amber-950">
                                                    Resignation request
                                                </h2>
                                            </div>

                                            <p className="mt-3 max-w-2xl whitespace-pre-wrap text-sm leading-7 text-amber-950/80">
                                                {pendingResignation.reason ||
                                                    "The employee has submitted a resignation request without a message."}
                                            </p>

                                            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-amber-900/70">
                                                <span>
                                                    Submitted{" "}
                                                    {formatDateTime(
                                                        pendingResignation.createdAt
                                                    )}
                                                </span>

                                                {pendingResignation.letterUrl && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleOpenLetter(pendingResignation.letterUrl)}
                                                        className="inline-flex items-center gap-1.5 font-semibold hover:underline"
                                                    >
                                                        View resignation
                                                        letter
                                                        <ExternalLink className="h-3 w-3" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
                                            <ActionButton
                                                variant="danger"
                                                disabled={
                                                    updatingEventStatus
                                                }
                                                icon={X}
                                                onClick={() =>
                                                    handleResignationDecision(
                                                        "REJECTED"
                                                    )
                                                }
                                            >
                                                Reject
                                            </ActionButton>

                                            <ActionButton
                                                variant="success"
                                                disabled={
                                                    updatingEventStatus
                                                }
                                                icon={Check}
                                                onClick={() =>
                                                    handleResignationDecision(
                                                        "ACCEPTED"
                                                    )
                                                }
                                            >
                                                {updatingEventStatus
                                                    ? "Processing..."
                                                    : "Accept resignation"}
                                            </ActionButton>
                                        </div>
                                    </div>

                                    {statusError && (
                                        <div className="mt-4 border-t border-amber-200 pt-4 text-xs font-medium text-red-700">
                                            {statusError}
                                        </div>
                                    )}
                                </section>
                            )}

                            {/* Employment details */}
                            <Section
                                eyebrow="01 / Employment"
                                title="Employment details"
                                action={
                                    isCurrent ? (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowEditModal(
                                                    true
                                                )
                                            }
                                            className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--df-muted)] hover:text-[var(--df-text)]"
                                        >
                                            <Pencil className="h-3.5 w-3.5" />
                                            Edit
                                        </button>
                                    ) : null
                                }
                            >
                                <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2 xl:grid-cols-3">
                                    <InfoItem
                                        icon={
                                            BriefcaseBusiness
                                        }
                                        label="Role"
                                        value={
                                            currentEmployment.roleTitle
                                        }
                                    />

                                    <InfoItem
                                        icon={
                                            BriefcaseBusiness
                                        }
                                        label="Employment type"
                                        value={formatEmploymentType(
                                            currentEmployment.employmentType
                                        )}
                                    />

                                    <InfoItem
                                        icon={CalendarDays}
                                        label="Start date"
                                        value={formatDate(
                                            currentEmployment.startDate
                                        )}
                                    />

                                    <InfoItem
                                        icon={CalendarDays}
                                        label="End date"
                                        value={
                                            isCurrent
                                                ? "Present"
                                                : formatDate(
                                                      currentEmployment.endDate
                                                  )
                                        }
                                    />

                                    <InfoItem
                                        icon={Clock3}
                                        label="Duration"
                                        value={duration}
                                    />

                                    <InfoItem
                                        icon={
                                            BriefcaseBusiness
                                        }
                                        label="Compensation"
                                        value={
                                            currentEmployment.salary !==
                                            null
                                                ? `${currentEmployment.salary} ${
                                                      currentEmployment.currency ||
                                                      ""
                                                  }`
                                                : "Not provided"
                                        }
                                    />
                                </div>

                                {currentEmployment.description && (
                                    <div className="mt-7 border-t border-[var(--df-line)] pt-6">
                                        <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--df-muted)]">
                                            Employment description
                                        </p>

                                        <p className="max-w-4xl whitespace-pre-wrap text-sm leading-7">
                                            {
                                                currentEmployment.description
                                            }
                                        </p>
                                    </div>
                                )}
                            </Section>

                            {/* Developer profile */}
                            <Section
                                eyebrow="02 / Employee"
                                title="Developer profile"
                            >
                                <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2 xl:grid-cols-3">
                                    <InfoItem
                                        icon={UserRound}
                                        label="Name"
                                        value={
                                            employeeUser?.name
                                        }
                                    />

                                    <InfoItem
                                        icon={Mail}
                                        label="Email"
                                        value={
                                            employeeUser?.email
                                        }
                                    />

                                    <InfoItem
                                        icon={MapPin}
                                        label="Work preference"
                                        value={
                                            employee?.locationPreference
                                        }
                                    />

                                    <InfoItem
                                        icon={
                                            BriefcaseBusiness
                                        }
                                        label="Experience"
                                        value={
                                            employee?.yearsOfExp !==
                                                null &&
                                            employee?.yearsOfExp !==
                                                undefined
                                                ? `${employee.yearsOfExp} years`
                                                : "Not provided"
                                        }
                                    />
                                </div>

                                {employee?.bio && (
                                    <div className="mt-7 border-t border-[var(--df-line)] pt-6">
                                        <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--df-muted)]">
                                            Bio
                                        </p>

                                        <p className="max-w-4xl whitespace-pre-wrap text-sm leading-7">
                                            {employee.bio}
                                        </p>
                                    </div>
                                )}

                                {employee?.skills?.length >
                                    0 && (
                                    <div className="mt-7">
                                        <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--df-muted)]">
                                            Skills
                                        </p>

                                        <div className="flex flex-wrap gap-2">
                                            {employee.skills.map(
                                                (skill) => (
                                                    <span
                                                        key={
                                                            skill.id
                                                        }
                                                        className="border border-[var(--df-line)] px-2.5 py-1.5 text-xs font-medium"
                                                    >
                                                        {
                                                            skill.name
                                                        }
                                                    </span>
                                                )
                                            )}
                                        </div>
                                    </div>
                                )}

                                <div className="mt-7 flex flex-wrap gap-5 border-t border-[var(--df-line)] pt-5">
                                    {employee?.githubUrl && (
                                        <a
                                            href={
                                                employee.githubUrl
                                            }
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex items-center gap-2 text-sm font-semibold hover:underline"
                                        >
                                            <FiGithub className="h-4 w-4" />
                                            GitHub
                                            <ExternalLink className="h-3 w-3" />
                                        </a>
                                    )}

                                    {employee?.portfolioUrl && (
                                        <a
                                            href={
                                                employee.portfolioUrl
                                            }
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex items-center gap-2 text-sm font-semibold hover:underline"
                                        >
                                            <Globe className="h-4 w-4" />
                                            Portfolio
                                            <ExternalLink className="h-3 w-3" />
                                        </a>
                                    )}
                                </div>
                            </Section>

                            {/* Event history */}
                            <Section
                                eyebrow="03 / Audit trail"
                                title="Employment events"
                                action={
                                    <span className="text-xs text-[var(--df-muted)]">
                                        {events.length}{" "}
                                        {events.length ===
                                        1
                                            ? "event"
                                            : "events"}
                                    </span>
                                }
                            >
                                {events.length === 0 ? (
                                    <div className="border border-dashed border-[var(--df-line)] px-6 py-12 text-center">
                                        <ShieldCheck className="mx-auto h-6 w-6 text-[var(--df-muted)]" />

                                        <p className="mt-3 text-sm font-semibold">
                                            No employment events
                                        </p>

                                        <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-[var(--df-muted)]">
                                            Resignations, termination
                                            actions, and decisions
                                            will appear here.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="relative ml-3 border-l border-[var(--df-line)]">
                                        {events.map(
                                            (event) => {
                                                const reviewer =
                                                    event
                                                        .approvedByRecruiter
                                                        ?.user
                                                        ?.name;

                                                return (
                                                    <article
                                                        key={
                                                            event.id
                                                        }
                                                        className="relative pb-9 pl-7 last:pb-0"
                                                    >
                                                        <span className="absolute -left-[5px] top-1 h-2.5 w-2.5 bg-[var(--df-text)] ring-4 ring-[var(--df-paper)]" />

                                                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                                            <div>
                                                                <div className="flex flex-wrap items-center gap-2">
                                                                    <h3 className="text-sm font-semibold">
                                                                        {event.type ===
                                                                        "RESIGN"
                                                                            ? "Resignation"
                                                                            : event.type ===
                                                                              "TERMINATE"
                                                                            ? "Termination"
                                                                            : event.type}
                                                                    </h3>

                                                                    <StatusBadge
                                                                        status={
                                                                            event.status
                                                                        }
                                                                    />
                                                                </div>

                                                                <p className="mt-1 text-xs text-[var(--df-muted)]">
                                                                    {formatDateTime(
                                                                        event.createdAt
                                                                    )}
                                                                </p>
                                                            </div>

                                                            {reviewer && (
                                                                <p className="text-xs text-[var(--df-muted)]">
                                                                    Reviewed
                                                                    by{" "}
                                                                    <span className="font-semibold text-[var(--df-text)]">
                                                                        {
                                                                            reviewer
                                                                        }
                                                                    </span>
                                                                </p>
                                                            )}
                                                        </div>

                                                        {event.reason && (
                                                            <div className="mt-4 border-l-2 border-[var(--df-line)] pl-4">
                                                                <p className="whitespace-pre-wrap text-sm leading-6 text-[var(--df-muted)]">
                                                                    {
                                                                        event.reason
                                                                    }
                                                                </p>
                                                            </div>
                                                        )}

                                                        {event.letterUrl && (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleOpenLetter(event.letterUrl)}
                                                                className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold hover:underline"
                                                            >
                                                                Open
                                                                document
                                                                {openingLetterId === event.letterUrl ? " (opening...)" : ""}
                                                                <ExternalLink className="h-3 w-3" />
                                                            </button>
                                                        )}
                                                    </article>
                                                );
                                            }
                                        )}
                                    </div>
                                )}
                            </Section>
                        </div>

                        {/* Sidebar */}
                        <aside className="space-y-5">
                            <div className="border border-[var(--df-line)] p-5">
                                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--df-accent)]">
                                    Company
                                </p>

                                <h2 className="mt-2 text-lg font-semibold">
                                    {
                                        currentEmployment
                                            .company?.name
                                    }
                                </h2>

                                <div className="mt-6 space-y-5">
                                    <InfoItem
                                        icon={MapPin}
                                        label="Country"
                                        value={
                                            currentEmployment
                                                .company
                                                ?.country
                                        }
                                    />

                                    <InfoItem
                                        icon={
                                            BriefcaseBusiness
                                        }
                                        label="Industry"
                                        value={
                                            currentEmployment
                                                .company
                                                ?.industry
                                        }
                                    />

                                    <InfoItem
                                        icon={
                                            ShieldCheck
                                        }
                                        label="Verification"
                                        value={
                                            currentEmployment
                                                .company
                                                ?.isVerified
                                                ? "Verified company"
                                                : "Unverified"
                                        }
                                    />
                                </div>

                                {currentEmployment
                                    .company
                                    ?.websiteUrl && (
                                    <a
                                        href={
                                            currentEmployment
                                                .company
                                                .websiteUrl
                                        }
                                        target="_blank"
                                        rel="noreferrer"
                                        className="mt-6 inline-flex items-center gap-2 text-sm font-semibold hover:underline"
                                    >
                                        Company website
                                        <ExternalLink className="h-3.5 w-3.5" />
                                    </a>
                                )}
                            </div>

                            <div className="border border-[var(--df-line)] p-5">
                                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--df-muted)]">
                                    Hiring record
                                </p>

                                <p className="mt-3 text-sm leading-6">
                                    Hired by{" "}
                                    <span className="font-semibold">
                                        {currentEmployment
                                            .hiredByRecruiter
                                            ?.user?.name ||
                                            "Unknown recruiter"}
                                    </span>
                                </p>

                                {currentEmployment
                                    .hiredByRecruiter
                                    ?.user?.email && (
                                    <p className="mt-1 text-xs text-[var(--df-muted)]">
                                        {
                                            currentEmployment
                                                .hiredByRecruiter
                                                .user.email
                                        }
                                    </p>
                                )}
                            </div>

                            {terminationError && (
                                <div className="border border-red-300 bg-red-50 p-4 text-sm leading-6 text-red-800">
                                    {terminationError}
                                </div>
                            )}
                        </aside>
                    </div>
                </div>
            </main>

            {/* Termination modal */}
            {showTerminateModal && (
                <Modal
                    title="Terminate employee"
                    disabled={terminatingEmployee || uploadingLetter}
                    onClose={() =>
                        !terminatingEmployee &&
                        setShowTerminateModal(false)
                    }
                >
                    <div className="p-5">
                        <div className="flex h-11 w-11 items-center justify-center bg-red-100 text-red-700">
                            <XCircle className="h-5 w-5" />
                        </div>

                        <p className="mt-5 text-sm leading-6 text-[var(--df-muted)]">
                            This will end{" "}
                            <span className="font-semibold text-[var(--df-text)]">
                                {employeeUser?.name}
                            </span>
                            's current employment with{" "}
                            <span className="font-semibold text-[var(--df-text)]">
                                {
                                    currentEmployment.company
                                        ?.name
                                }
                            </span>
                        </p>

                        <label className="mt-6 block">
                            <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.14em]">
                                Termination reason
                            </span>

                            <textarea
                                rows={5}
                                value={
                                    terminationReason
                                }
                                onChange={(event) =>
                                    setTerminationReason(
                                        event.target.value
                                    )
                                }
                                placeholder="Provide a clear reason for the termination..."
                                className="w-full resize-none border border-[var(--df-line)] bg-transparent px-3 py-3 text-sm leading-6 outline-none placeholder:text-[var(--df-muted)] focus:border-[var(--df-text)]"
                            />
                        </label>

                        <div className="mt-5">
                            <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.14em]">
                                Supporting letter <span className="font-normal normal-case text-[var(--df-muted)]">(optional)</span>
                            </label>
                            <input
                                type="file"
                                accept=".pdf,.doc,.docx"
                                disabled={terminatingEmployee || uploadingLetter}
                                onChange={(event) => {
                                    const file = event.target.files?.[0];
                                    event.target.value = "";
                                    setLetterError(null);
                                    if (!file) return;
                                    if (!ACCEPTED_LETTER_TYPES.includes(file.type)) {
                                        setLetterError("Only PDF, DOC or DOCX files are supported.");
                                        setTerminationLetter(null);
                                        return;
                                    }
                                    if (file.size > MAX_LETTER_SIZE) {
                                        setLetterError("File size must be 5MB or less.");
                                        setTerminationLetter(null);
                                        return;
                                    }
                                    setTerminationLetter(file);
                                }}
                                className="block w-full text-sm file:mr-3 file:border-0 file:bg-[var(--df-text)] file:px-4 file:py-2 file:text-[var(--df-paper)]"
                            />
                            <p className="mt-2 text-xs text-[var(--df-muted)]">PDF, DOC, DOCX or TXT · Maximum 5MB</p>
                            {terminationLetter && <div className="mt-2 flex items-center justify-between gap-2 text-sm"><span className="truncate">{terminationLetter.name}</span><button type="button" onClick={() => setTerminationLetter(null)} className="text-xs underline">Remove</button></div>}
                            {letterError && <p role="alert" className="mt-2 text-xs text-red-700">{letterError}</p>}
                        </div>

                        {terminationError && (
                            <p className="mt-3 text-xs font-medium text-red-700">
                                {terminationError}
                            </p>
                        )}

                        <div className="mt-6 flex justify-end gap-2">
                            <ActionButton
                                disabled={
                                    terminatingEmployee || uploadingLetter
                                }
                                onClick={() =>
                                    setShowTerminateModal(
                                        false
                                    )
                                }
                            >
                                Cancel
                            </ActionButton>

                            <ActionButton
                                variant="danger"
                                icon={XCircle}
                                disabled={
                                    terminatingEmployee || uploadingLetter ||
                                    !terminationReason.trim()
                                }
                                onClick={
                                    handleTerminate
                                }
                            >
                                {uploadingLetter || terminatingEmployee
                                    ? <><Loader2 className="mr-2 inline h-4 w-4 animate-spin" />{uploadingLetter ? "Uploading letter..." : "Terminating..."}</>
                                    : "Confirm termination"}
                            </ActionButton>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Edit employment modal */}
            {showEditModal && (
                <Modal
                    title="Edit employment"
                    disabled={submitting}
                    onClose={() =>
                        !submitting &&
                        setShowEditModal(false)
                    }
                >
                    <form
                        onSubmit={
                            handleUpdateEmployment
                        }
                        className="p-5"
                    >
                        <p className="text-sm leading-6 text-[var(--df-muted)]">
                            Update the active employment
                            information. Employment dates and
                            current status are controlled by the
                            employment workflow.
                        </p>

                        <div className="mt-6 space-y-5">
                            <label className="block">
                                <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.14em]">
                                    Role title
                                </span>

                                <input
                                    value={
                                        editForm.roleTitle
                                    }
                                    onChange={(event) =>
                                        setEditForm(
                                            (prev) => ({
                                                ...prev,
                                                roleTitle:
                                                    event
                                                        .target
                                                        .value,
                                            })
                                        )
                                    }
                                    className="h-11 w-full border border-[var(--df-line)] bg-transparent px-3 text-sm outline-none focus:border-[var(--df-text)]"
                                />
                            </label>

                            <label className="block">
                                <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.14em]">
                                    Employment type
                                </span>

                                <input
                                    value={
                                        editForm.employmentType
                                    }
                                    onChange={(event) =>
                                        setEditForm(
                                            (prev) => ({
                                                ...prev,
                                                employmentType:
                                                    event
                                                        .target
                                                        .value,
                                            })
                                        )
                                    }
                                    className="h-11 w-full border border-[var(--df-line)] bg-transparent px-3 text-sm outline-none focus:border-[var(--df-text)]"
                                />
                            </label>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <label className="block">
                                    <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.14em]">
                                        Salary
                                    </span>

                                    <input
                                        type="number"
                                        min="0"
                                        value={
                                            editForm.salary
                                        }
                                        onChange={(event) =>
                                            setEditForm(
                                                (prev) => ({
                                                    ...prev,
                                                    salary:
                                                        event
                                                            .target
                                                            .value,
                                                })
                                            )
                                        }
                                        className="h-11 w-full border border-[var(--df-line)] bg-transparent px-3 text-sm outline-none focus:border-[var(--df-text)]"
                                    />
                                </label>

                                <label className="block">
                                    <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.14em]">
                                        Currency
                                    </span>

                                    <input
                                        value={
                                            editForm.currency
                                        }
                                        onChange={(event) =>
                                            setEditForm(
                                                (prev) => ({
                                                    ...prev,
                                                    currency:
                                                        event
                                                            .target
                                                            .value,
                                                })
                                            )
                                        }
                                        placeholder="USD"
                                        className="h-11 w-full border border-[var(--df-line)] bg-transparent px-3 text-sm uppercase outline-none focus:border-[var(--df-text)]"
                                    />
                                </label>
                            </div>

                            <label className="block">
                                <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.14em]">
                                    Description
                                </span>

                                <textarea
                                    rows={6}
                                    value={
                                        editForm.description
                                    }
                                    onChange={(event) =>
                                        setEditForm(
                                            (prev) => ({
                                                ...prev,
                                                description:
                                                    event
                                                        .target
                                                        .value,
                                            })
                                        )
                                    }
                                    className="w-full resize-none border border-[var(--df-line)] bg-transparent px-3 py-3 text-sm leading-6 outline-none focus:border-[var(--df-text)]"
                                />
                            </label>
                        </div>

                        {submitError && (
                            <p className="mt-4 text-xs font-medium text-red-700">
                                {submitError}
                            </p>
                        )}

                        <div className="mt-6 flex justify-end gap-2">
                            <ActionButton
                                disabled={submitting}
                                onClick={() =>
                                    setShowEditModal(
                                        false
                                    )
                                }
                            >
                                Cancel
                            </ActionButton>

                            <ActionButton
                                type="submit"
                                variant="dark"
                                disabled={submitting}
                            >
                                {submitting
                                    ? "Saving..."
                                    : "Save changes"}
                            </ActionButton>
                        </div>
                    </form>
                </Modal>
            )}
        </>
    );
}

function DetailSkeleton() {
    return (
        <main className="min-h-screen bg-[var(--df-paper)] px-4 py-8 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl animate-pulse">
                <div className="h-4 w-28 bg-black/10" />

                <div className="mt-8 border-y border-[var(--df-line)] py-8">
                    <div className="flex items-center gap-4">
                        <div className="h-16 w-16 bg-black/10" />

                        <div className="space-y-3">
                            <div className="h-3 w-32 bg-black/10" />
                            <div className="h-8 w-64 bg-black/10" />
                            <div className="h-4 w-48 bg-black/10" />
                        </div>
                    </div>
                </div>

                <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_330px]">
                    <div className="space-y-10">
                        {[1, 2, 3].map((section) => (
                            <div
                                key={section}
                                className="border-t border-[var(--df-line)] pt-6"
                            >
                                <div className="h-5 w-40 bg-black/10" />

                                <div className="mt-6 grid grid-cols-2 gap-6">
                                    {[1, 2, 3, 4].map(
                                        (item) => (
                                            <div
                                                key={item}
                                                className="space-y-2"
                                            >
                                                <div className="h-3 w-20 bg-black/10" />
                                                <div className="h-4 w-32 bg-black/10" />
                                            </div>
                                        )
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="h-72 border border-[var(--df-line)] bg-black/[0.02]" />
                </div>
            </div>
        </main>
    );
}
