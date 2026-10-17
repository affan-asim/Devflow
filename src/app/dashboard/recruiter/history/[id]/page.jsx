"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowLeft, CalendarDays, Check, Clock3, Edit3, FileText, Loader2,
  Mail, Upload, UserRound, X, XCircle,
} from "lucide-react";
import { uploadFileToStorage } from "@/lib/storage/uploadFile";
import api from "@/lib/api/axios";
import {
  fetchRecruiterHistoryDetail,
  updateRecruiterEmploymentHistory,
} from "@/lib/redux/slices/recruiterHistorySlice";
import {
  processRecruiterEmploymentEvent,
  updateRecruiterHistoryStatus,
} from "@/lib/redux/slices/recruiterEventsSlice";

const MAX_LETTER_SIZE = 5 * 1024 * 1024;
const ACCEPTED_LETTER_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

function formatDate(value) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(value));
}

function formatEventType(type) {
  if (!type) return "Employment event";
  return type.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
}

function statusClass(status) {
  if (status === "ACCEPTED") return "border-green-200 bg-green-50 text-green-700";
  if (status === "PENDING") return "border-amber-200 bg-amber-50 text-amber-700";
  if (status === "REJECTED") return "border-red-200 bg-red-50 text-red-700";
  return "border-[var(--df-line)]";
}

export default function RecruiterHistoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const id = params?.id;
  const { selectedHistory, loadingDetail, submitting, submitError } = useSelector((state) => state.recruiterHistory);
  const { submittingEvent, updatingStatus, eventError, statusError } = useSelector((state) => state.recruiterEvents);
  const [editing, setEditing] = useState(false);
  const [eventFormOpen, setEventFormOpen] = useState(false);
  const [form, setForm] = useState({ roleTitle: "", description: "", salary: "", currency: "", employmentType: "" });
  const [eventForm, setEventForm] = useState({ reason: "", letterUrl: "" });
  const [letterFile, setLetterFile] = useState(null);
  const [uploadingLetter, setUploadingLetter] = useState(false);
  const [letterError, setLetterError] = useState(null);

  useEffect(() => { if (id) dispatch(fetchRecruiterHistoryDetail(id)); }, [dispatch, id]);
  useEffect(() => {
    if (!selectedHistory) return;
    setForm({ roleTitle: selectedHistory.roleTitle || "", description: selectedHistory.description || "", salary: selectedHistory.salary ?? "", currency: selectedHistory.currency || "", employmentType: selectedHistory.employmentType || "" });
  }, [selectedHistory]);

  const recruiter = selectedHistory?.recruiter || selectedHistory?.recruiterProfile;
  const recruiterUser = recruiter?.user || selectedHistory?.user;
  const events = selectedHistory?.recruiterEvents || [];
  const pendingEvent = events.find((event) => event.status === "PENDING");

  const handleSave = async (event) => {
    event.preventDefault();
    const result = await dispatch(updateRecruiterEmploymentHistory({ id, data: {
      roleTitle: form.roleTitle, description: form.description,
      salary: form.salary === "" ? undefined : Number(form.salary),
      currency: form.currency, employmentType: form.employmentType,
    } }));
    if (updateRecruiterEmploymentHistory.fulfilled.match(result)) {
      setEditing(false);
      dispatch(fetchRecruiterHistoryDetail(id));
    }
  };

  const handleTerminate = async (event) => {
    event.preventDefault();
    setLetterError(null);
    let letterUrl = eventForm.letterUrl || undefined;
    try {
      if (letterFile) {
        setUploadingLetter(true);
        letterUrl = await uploadFileToStorage(letterFile, "COVER_LETTER");
      }
      const result = await dispatch(processRecruiterEmploymentEvent({ historyId: id, data: { reason: eventForm.reason, letterUrl } }));
      if (processRecruiterEmploymentEvent.fulfilled.match(result)) {
        setEventFormOpen(false);
        setEventForm({ reason: "", letterUrl: "" });
        setLetterFile(null);
        dispatch(fetchRecruiterHistoryDetail(id));
      }
    } catch (error) {
      setLetterError(typeof error === "string" ? error : error?.message || "Unable to upload the letter. Please try again.");
    } finally { setUploadingLetter(false); }
  };

  const handleViewLetter = async (key) => {
    try {
      const response = await api.get(`/api/get-presignedUrl?key=${encodeURIComponent(key)}`);
      window.open(response.data.data, "_blank", "noopener,noreferrer");
    } catch { setLetterError("Unable to open this letter."); }
  };

  const handleEventStatus = async (status) => {
    if (!pendingEvent) return;
    const result = await dispatch(updateRecruiterHistoryStatus({ eventId: pendingEvent.id, status }));
    if (updateRecruiterHistoryStatus.fulfilled.match(result)) dispatch(fetchRecruiterHistoryDetail(id));
  };

  if (loadingDetail) return <main className="min-h-screen bg-[var(--df-paper)]"><div className="mx-auto max-w-[1200px] px-4 py-10"><div className="h-8 w-48 animate-pulse bg-black/5"/><div className="mt-8 h-72 animate-pulse border border-[var(--df-line)]"/></div></main>;
  if (!selectedHistory) return <main className="min-h-screen bg-[var(--df-paper)]"><div className="mx-auto max-w-[1200px] px-4 py-16 text-center"><p className="font-medium">Employment history not found.</p><button onClick={() => router.push("/dashboard/recruiter/history")} className="mt-4 text-sm underline">Back to history</button></div></main>;

  return <main className="min-h-screen bg-[var(--df-paper)] text-[var(--df-text)]"><div className="mx-auto max-w-[1200px] px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
    <div className="mb-8"><button onClick={() => router.push("/dashboard/recruiter/history")} className="mb-6 inline-flex items-center gap-2 text-sm text-[var(--df-muted)] hover:text-[var(--df-text)]"><ArrowLeft size={16}/>Employment history</button>
      <div className="flex flex-col gap-5 border-b border-[var(--df-line)] pb-7 md:flex-row md:items-end md:justify-between"><div><p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--df-muted)]">Employment record</p><h1 className="text-3xl font-semibold tracking-[-0.035em]">{recruiterUser?.name || selectedHistory.roleTitle || "Recruiter employment"}</h1>{recruiterUser?.email && <div className="mt-2 flex items-center gap-2 text-sm text-[var(--df-muted)]"><Mail size={15}/>{recruiterUser.email}</div>}</div>
        <div className="flex flex-wrap gap-2">{selectedHistory.isCurrent && <button type="button" onClick={() => setEventFormOpen(true)} className="inline-flex items-center gap-2 border border-[var(--df-text)] bg-[var(--df-text)] px-4 py-2.5 text-sm font-medium text-[var(--df-paper)]"><XCircle size={16}/>Terminate recruiter</button>}<button type="button" onClick={() => setEditing((value) => !value)} className="inline-flex items-center gap-2 border border-[var(--df-line)] px-4 py-2.5 text-sm font-medium"><Edit3 size={16}/>{editing ? "Cancel edit" : "Edit employment"}</button></div>
      </div>
    </div>

    {(submitError || eventError || statusError) && <div className="mb-6 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{submitError || eventError || statusError}</div>}
    <section className="border border-[var(--df-line)]"><div className="border-b border-[var(--df-line)] px-5 py-4"><h2 className="font-semibold">Employment details</h2></div>
      {editing ? <form onSubmit={handleSave} className="grid gap-5 p-5 md:grid-cols-2">
        <Field label="Role title"><input value={form.roleTitle} onChange={(e) => setForm({...form, roleTitle:e.target.value})} className="h-11 w-full border border-[var(--df-line)] bg-transparent px-3 text-sm outline-none focus:border-[var(--df-text)]"/></Field>
        <Field label="Employment type"><input value={form.employmentType} onChange={(e) => setForm({...form, employmentType:e.target.value})} className="h-11 w-full border border-[var(--df-line)] bg-transparent px-3 text-sm outline-none focus:border-[var(--df-text)]"/></Field>
        <Field label="Salary"><input type="number" value={form.salary} onChange={(e) => setForm({...form, salary:e.target.value})} className="h-11 w-full border border-[var(--df-line)] bg-transparent px-3 text-sm outline-none focus:border-[var(--df-text)]"/></Field>
        <Field label="Currency"><input value={form.currency} onChange={(e) => setForm({...form, currency:e.target.value})} className="h-11 w-full border border-[var(--df-line)] bg-transparent px-3 text-sm uppercase outline-none focus:border-[var(--df-text)]"/></Field>
        <Field label="Description" className="md:col-span-2"><textarea value={form.description} onChange={(e) => setForm({...form, description:e.target.value})} rows={5} className="w-full resize-none border border-[var(--df-line)] bg-transparent p-3 text-sm outline-none focus:border-[var(--df-text)]"/></Field>
        <div className="flex gap-2 md:col-span-2"><button type="submit" disabled={submitting} className="bg-[var(--df-text)] px-5 py-2.5 text-sm font-medium text-[var(--df-paper)] disabled:opacity-50">{submitting ? "Saving..." : "Save changes"}</button><button type="button" onClick={() => setEditing(false)} className="border border-[var(--df-line)] px-5 py-2.5 text-sm">Cancel</button></div>
      </form> : <div className="grid gap-px bg-[var(--df-line)] sm:grid-cols-2 lg:grid-cols-4">
        <Info label="Role" value={selectedHistory.roleTitle}/><Info label="Employment" value={selectedHistory.employmentType}/><Info label="Start date" value={formatDate(selectedHistory.startDate)}/><Info label="End date" value={selectedHistory.endDate ? formatDate(selectedHistory.endDate) : "Present"}/><Info label="Salary" value={selectedHistory.salary != null ? `${selectedHistory.currency || ""} ${selectedHistory.salary}` : "—"}/><Info label="Status" value={selectedHistory.isCurrent ? "Current" : "Ended"}/><div className="bg-[var(--df-paper)] p-5 sm:col-span-2"><p className="text-xs font-semibold uppercase tracking-wider text-[var(--df-muted)]">Description</p><p className="mt-2 text-sm leading-6">{selectedHistory.description || "No description."}</p></div>
      </div>}
    </section>

    {pendingEvent && <section className="mt-8 border border-amber-200 bg-amber-50/50"><div className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between"><div><div className="flex items-center gap-2 text-sm font-semibold text-amber-800"><Clock3 size={16}/>Pending {formatEventType(pendingEvent.type)}</div><p className="mt-2 max-w-2xl text-sm leading-6 text-amber-900/80">{pendingEvent.reason || "This employment event requires owner action."}</p></div><div className="flex gap-2"><button disabled={updatingStatus} onClick={() => handleEventStatus("REJECTED")} className="inline-flex items-center gap-2 border border-red-300 px-4 py-2.5 text-sm text-red-700"><X size={15}/>Reject</button><button disabled={updatingStatus} onClick={() => handleEventStatus("ACCEPTED")} className="inline-flex items-center gap-2 bg-[var(--df-text)] px-4 py-2.5 text-sm text-[var(--df-paper)]"><Check size={15}/>Approve</button></div></div></section>}

    <section className="mt-8"><div className="mb-5"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--df-muted)]">Employment events</p><h2 className="mt-1 text-2xl font-semibold tracking-[-0.025em]">Event history</h2></div>
      {!events.length ? <div className="border border-[var(--df-line)] px-5 py-12 text-center"><FileText size={22} className="mx-auto mb-3 text-[var(--df-muted)]"/><p className="font-medium">No employment events</p><p className="mt-1 text-sm text-[var(--df-muted)]">There are no recorded events for this employment.</p></div> : <div className="relative ml-2 border-l border-[var(--df-line)]">{events.map((event) => <article key={event.id} className="relative ml-6 pb-8 last:pb-0"><span className="absolute -left-[31px] top-1 h-2.5 w-2.5 rounded-full border border-[var(--df-text)] bg-[var(--df-paper)]"/><div className="border border-[var(--df-line)] p-5"><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><div className="flex items-center gap-2"><h3 className="font-semibold">{formatEventType(event.type)}</h3><span className={`border px-2 py-1 text-[11px] font-medium ${statusClass(event.status)}`}>{event.status}</span></div><p className="mt-1 text-xs text-[var(--df-muted)]">{formatDate(event.createdAt)}</p></div></div>{event.reason && <p className="mt-4 text-sm leading-6 text-[var(--df-muted)]">{event.reason}</p>}{event.letterUrl && <button type="button" onClick={() => handleViewLetter(event.letterUrl)} className="mt-4 inline-flex items-center gap-2 text-sm font-medium underline"><FileText size={15}/>View document</button>}</div></article>)}</div>}
    </section>

    {eventFormOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"><div className="w-full max-w-lg border border-[var(--df-line)] bg-[var(--df-paper)]"><div className="flex items-center justify-between border-b border-[var(--df-line)] p-5"><div><h2 className="font-semibold">Terminate recruiter</h2><p className="mt-1 text-xs text-[var(--df-muted)]">This will end the current employment.</p></div><button onClick={() => setEventFormOpen(false)} className="text-[var(--df-muted)]"><X size={18}/></button></div>
      <form onSubmit={handleTerminate} className="space-y-5 p-5"><label className="block"><span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[var(--df-muted)]">Reason</span><textarea required value={eventForm.reason} onChange={(e) => setEventForm({...eventForm, reason:e.target.value})} rows={5} className="w-full resize-none border border-[var(--df-line)] bg-transparent p-3 text-sm outline-none focus:border-[var(--df-text)]" placeholder="Explain why the employment is being terminated..."/></label>
        <div><label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[var(--df-muted)]">Supporting letter <span className="font-normal normal-case">(optional)</span></label><input type="file" accept=".pdf,.doc,.docx" disabled={uploadingLetter || submittingEvent} onChange={(event) => {const file=event.target.files?.[0];event.target.value="";setLetterError(null);if(!file)return;if(!ACCEPTED_LETTER_TYPES.includes(file.type)){setLetterError("Only PDF, DOC or DOCX files are supported.");setLetterFile(null);return;}if(file.size>MAX_LETTER_SIZE){setLetterError("File size must be 5MB or less.");setLetterFile(null);return;}setLetterFile(file);}} className="block w-full text-sm file:mr-3 file:border-0 file:bg-[var(--df-text)] file:px-4 file:py-2 file:text-[var(--df-paper)]"/><p className="mt-2 text-xs text-[var(--df-muted)]">PDF, DOC or DOCX · Maximum 5MB</p>{letterFile && <div className="mt-2 flex items-center justify-between gap-2 text-sm"><span className="truncate">{letterFile.name}</span><button type="button" onClick={() => setLetterFile(null)} className="text-xs underline">Remove</button></div>}{letterError && <p role="alert" className="mt-2 text-sm text-red-600">{letterError}</p>}</div>
        <div className="flex justify-end gap-2"><button type="button" onClick={() => setEventFormOpen(false)} className="border border-[var(--df-line)] px-4 py-2.5 text-sm">Cancel</button><button type="submit" disabled={submittingEvent || uploadingLetter} className="bg-[var(--df-text)] px-4 py-2.5 text-sm font-medium text-[var(--df-paper)] disabled:opacity-50">{uploadingLetter || submittingEvent ? <><Loader2 size={15} className="mr-2 inline animate-spin"/>{uploadingLetter ? "Uploading letter..." : "Processing..."}</> : "Confirm termination"}</button></div>
      </form></div></div>}
  </div></main>;
}

function Field({ label, className = "", children }) {
  return <label className={`block ${className}`}><span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[var(--df-muted)]">{label}</span>{children}</label>;
}

function Info({ label, value }) {
  return <div className="bg-[var(--df-paper)] p-5"><p className="text-xs font-semibold uppercase tracking-wider text-[var(--df-muted)]">{label}</p><p className="mt-2 text-sm font-medium">{value || "—"}</p></div>;
}
