"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  User,
  Activity,
  ArrowLeft,
  Calendar,
  FileText,
  Upload,
  X,
  CheckCircle2,
  Loader2,
  ClipboardCheck,
  Stethoscope,
  MessageSquare,
} from "lucide-react";

import { DocField } from "~/components/DocField";
import { getAge } from "~/lib/format";
import type { PatientJSON } from "~/models/patient";
import type { AttachmentType } from "~/models/attachment";

type PatientSummary = Pick<PatientJSON, "id" | "fullName" | "gender" | "dob">;

interface VisitForm {
  visitDate: string;
  doctorName: string;
  presentingComplaint: string;
  historyOfPresentingComplaint: string;
  observationAndExamination: string;
  impression: string;
  plan: string;
  notes: string;
}

const INITIAL_FORM: VisitForm = {
  visitDate: new Date().toISOString().slice(0, 10),
  doctorName: "",
  presentingComplaint: "",
  historyOfPresentingComplaint: "",
  observationAndExamination: "",
  impression: "",
  plan: "",
  notes: "",
};

export default function NewVisitPage() {
  const { id } = useParams();
  const router = useRouter();

  const [patient, setPatient] = useState<PatientSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [visitSaved, setVisitSaved] = useState(false);
  const [visitId, setVisitId] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<AttachmentType[]>([]);
  const [form, setForm] = useState<VisitForm>(INITIAL_FORM);

  const updateField = (field: keyof VisitForm) => (value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const res = await fetch(`/api/patients/${id}`);
        if (!res.ok) throw new Error("Failed");
        const data = await res.json();
        setPatient(data.details || data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    if (id) fetchPatient();
  }, [id]);

  const handleSave = async () => {
    if (!form.doctorName.trim()) {
      alert("Please enter the name of the clinician seen by the patient.");
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch("/api/visits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId: id, ...form }),
      });

      if (!res.ok) throw new Error("Failed to save visit");
      const savedVisit = await res.json();
      setVisitId(savedVisit.id);
      setVisitSaved(true);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to save visit");
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!visitId) return;
    setIsUploadingFile(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("visitId", visitId);
      const res = await fetch("/api/attachments", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Upload failed");
      const newAttachment = await res.json();
      setAttachments((prev) => [newAttachment, ...prev]);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploadingFile(false);
    }
  };

  const handleDeleteAttachment = async (attachmentId: string) => {
    if (!confirm("Remove this document?")) return;
    try {
      const res = await fetch(`/api/attachments/${attachmentId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setAttachments((prev) => prev.filter((a) => a.id !== attachmentId));
      }
    } catch {
      alert("Failed to delete");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-20">
        <Activity className="animate-spin text-brand-orange" size={48} />
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="p-10 text-center font-bold text-gray-500">
        Patient not found.
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <Link
          href={`/patients/${id}`}
          className="flex items-center gap-2 text-brand-orange font-bold hover:underline"
        >
          <ArrowLeft size={20} strokeWidth={3} />
          Back to Profile
        </Link>
        <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-orange-100 flex items-center gap-4">
          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-brand-orange">
            <User size={20} />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">
              Active Patient
            </p>
            <p className="font-bold text-gray-800 leading-none">
              {patient.fullName}{" "}
              <span className="text-gray-400 font-medium ml-1 text-sm">
                ({patient.gender}, {getAge(patient.dob)} y/o)
              </span>
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Visit Info */}
          <div className="bg-white rounded-3xl shadow-clean border border-gray-100 p-8 space-y-6">
            <h2 className="text-xl font-black text-gray-800 flex items-center gap-3">
              <Calendar className="text-brand-orange" />
              Visit Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">
                  Visit Date
                </label>
                <input
                  type="date"
                  value={form.visitDate}
                  onChange={(e) => updateField("visitDate")(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-100 p-3 rounded-xl focus:ring-4 focus:ring-orange-100 outline-none font-semibold transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">
                  Seen By (Doctor) *
                </label>
                <div className="relative">
                  <Stethoscope
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    type="text"
                    placeholder="Enter doctor's name"
                    value={form.doctorName}
                    required
                    onChange={(e) =>
                      updateField("doctorName")(e.target.value)
                    }
                    className="w-full bg-gray-50 border border-gray-100 pl-10 pr-4 py-3 rounded-xl focus:ring-4 focus:ring-orange-100 outline-none font-semibold transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Clinical Documentation */}
          <div className="bg-white rounded-3xl shadow-clean border border-gray-100 p-8 space-y-8">
            <h2 className="text-xl font-black text-gray-800 flex items-center gap-3">
              <ClipboardCheck className="text-brand-orange" />
              Clinical Documentation
            </h2>

            <div className="space-y-6">
              <DocField
                label="pc - Presenting Complaint"
                value={form.presentingComplaint}
                onChange={updateField("presentingComplaint")}
              />
              <DocField
                label="hpc - History of Presenting Complaint"
                value={form.historyOfPresentingComplaint}
                onChange={updateField("historyOfPresentingComplaint")}
              />
              <DocField
                label="oe - Observation & Examination"
                value={form.observationAndExamination}
                onChange={updateField("observationAndExamination")}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DocField
                  label="Clinical Impression"
                  value={form.impression}
                  onChange={updateField("impression")}
                  rows={4}
                />
                <DocField
                  label="Management Plan"
                  value={form.plan}
                  onChange={updateField("plan")}
                  rows={4}
                />
              </div>

              <DocField
                label="Extra Notes"
                value={form.notes}
                onChange={updateField("notes")}
                icon={<MessageSquare size={16} />}
              />
            </div>
          </div>
        </div>

        {/* Sidebar - Save & Files */}
        <div className="space-y-8">
          <div className="bg-white rounded-3xl shadow-clean border border-gray-100 p-8 space-y-6 sticky top-8">
            <h2 className="text-lg font-black text-gray-800">
              Finalize Visit
            </h2>

            {visitSaved && (
              <div className="flex items-center gap-3 bg-emerald-50 text-emerald-700 p-4 rounded-2xl border border-emerald-100 text-sm font-bold animate-in zoom-in duration-300">
                <CheckCircle2 size={20} />
                Visit saved successfully!
              </div>
            )}

            {!visitId ? (
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="w-full bg-brand-orange hover:bg-brand-dark-orange text-white py-4 rounded-2xl font-black shadow-lg shadow-orange-500/20 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {isSaving ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <ClipboardCheck size={20} />
                )}
                {isSaving ? "SAVING RECORD..." : "SAVE VISIT RECORD"}
              </button>
            ) : (
              <button
                onClick={() => router.push(`/patients/${id}`)}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-2xl font-black shadow-lg shadow-emerald-500/20 transition-all active:scale-95 flex items-center justify-center gap-3"
              >
                <CheckCircle2 size={20} />
                FINISH & EXIT
              </button>
            )}

            {/* File Upload */}
            <div
              className={`space-y-4 pt-4 border-t border-gray-50 transition-opacity ${!visitId ? "opacity-40 pointer-events-none" : "opacity-100"}`}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">
                  Supporting Files
                </h3>
                {isUploadingFile && (
                  <Loader2
                    className="animate-spin text-brand-orange"
                    size={16}
                  />
                )}
              </div>

              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50 hover:bg-orange-50 hover:border-brand-orange/30 transition-all cursor-pointer group">
                <Upload
                  className="text-gray-400 group-hover:text-brand-orange mb-2"
                  size={24}
                />
                <span className="text-xs font-bold text-gray-500 uppercase tracking-tighter">
                  Click to upload
                </span>
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) =>
                    e.target.files?.[0] &&
                    handleFileUpload(e.target.files[0])
                  }
                  disabled={isUploadingFile || !visitId}
                />
              </label>

              <div className="space-y-2">
                {attachments.map((att) => (
                  <div
                    key={att.id}
                    className="flex items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-100 group"
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <FileText
                        size={16}
                        className="text-brand-orange flex-shrink-0"
                      />
                      <span className="text-xs font-bold text-gray-700 truncate">
                        {att.fileName}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDeleteAttachment(att.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
