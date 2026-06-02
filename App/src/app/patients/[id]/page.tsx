"use client";
import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  User,
  Activity,
  ArrowLeft,
  Calendar,
  ClipboardList,
  Edit3,
  Save,
  X,
  Plus,
  Download,
  Eye,
  FileText,
  Camera,
  Loader2,
  Stethoscope,
  Thermometer,
  Microscope,
  Pill,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from "lucide-react";

import { useUpdatePatient } from "~/hooks/useUpdatePatient";
import { formatFileSize } from "~/lib/format";
import { DetailItem } from "~/components/DetailItem";
import { VisitDetail } from "~/components/VisitDetail";
import type { PatientJSON } from "~/models/patient";
import type { AttachmentType } from "~/models/attachment";

type Visit = {
  id: string;
  visitDate: string;
  doctorName: string;
  notes: string;
  presentingComplaint?: string;
  historyOfPresentingComplaint?: string;
  observationAndExamination?: string;
  impression?: string;
  plan?: string;
  attachments?: AttachmentType[];
};

type ClinicEncounterRecord = {
  id: string;
  createdAt: string;
  status: string;
  session: { clinicName: string; location: string; date: string };
  // Triage
  bloodPressure: string | null;
  heartRate: string | null;
  temperature: string | null;
  spO2: string | null;
  weight: string | null;
  mainComplaint: string | null;
  medicalHistory: string | null;
  currentMedications: string | null;
  allergies: string | null;
  redFlags: string | null;
  // Examination
  examinationPerformed: string | null;
  examinationResults: string | null;
  // Diagnosis
  diagnosis: string | null;
  clinicalNotes: string | null;
  treatmentAdvice: string | null;
  prescription: string | null;
  followUpAdvice: string | null;
  prescriberNotes: string | null;
  referral: boolean;
  medicationNeeded: boolean;
  medicationGivenAt: string | null;
};

const STATUS_DISPLAY: Record<string, { label: string; color: string }> = {
  registered:                { label: "Registered",           color: "bg-sky-100 text-sky-700" },
  in_triage:                 { label: "In Triage",            color: "bg-amber-100 text-amber-700" },
  triage_completed:          { label: "Triage Complete",      color: "bg-violet-100 text-violet-700" },
  in_examination:            { label: "In Examination",       color: "bg-indigo-100 text-indigo-700" },
  examination_completed:     { label: "Exam Complete",        color: "bg-pink-100 text-pink-700" },
  in_diagnosis:              { label: "In Diagnosis",         color: "bg-rose-100 text-rose-700" },
  waiting_medication:        { label: "Awaiting Medication",  color: "bg-orange-100 text-orange-700" },
  completed_medication_given:{ label: "Completed",            color: "bg-emerald-100 text-emerald-700" },
  completed_no_meds:         { label: "Completed — No Meds",  color: "bg-emerald-100 text-emerald-700" },
  referred:                  { label: "Referred",             color: "bg-purple-100 text-purple-700" },
};

function EncounterCard({ encounter }: { encounter: ClinicEncounterRecord }) {
  const [expanded, setExpanded] = useState(false);
  const statusInfo = STATUS_DISPLAY[encounter.status] ?? { label: encounter.status, color: "bg-gray-100 text-gray-600" };
  const sessionDate = new Date(encounter.session.date).toLocaleDateString("en-GB", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
  const hasTriageData = encounter.mainComplaint || encounter.bloodPressure || encounter.heartRate;
  const hasExamData = encounter.examinationPerformed || encounter.examinationResults;
  const hasDiagnosisData = encounter.diagnosis || encounter.prescription;

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all">
      {/* Card header — always visible */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full text-left p-6 flex flex-col sm:flex-row sm:items-center gap-4"
      >
        <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center shrink-0">
          <Stethoscope size={22} className="text-brand-orange" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <p className="font-black text-gray-900 text-lg">{encounter.session.clinicName}</p>
            <span className={`text-xs font-black px-2.5 py-1 rounded-full ${statusInfo.color}`}>
              {statusInfo.label}
            </span>
            {encounter.referral && (
              <span className="text-xs font-black px-2.5 py-1 rounded-full bg-purple-100 text-purple-700">
                Referred
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 font-medium">{encounter.session.location} &bull; {sessionDate}</p>
          {encounter.mainComplaint && (
            <p className="text-xs text-gray-400 italic mt-1 truncate">&ldquo;{encounter.mainComplaint}&rdquo;</p>
          )}
        </div>
        <div className="text-gray-400 shrink-0">
          {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-gray-100 divide-y divide-gray-50">

          {/* Triage */}
          {hasTriageData && (
            <div className="p-6 space-y-4">
              <h4 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <Thermometer size={13} className="text-brand-orange" />
                Triage
              </h4>
              {encounter.mainComplaint && (
                <div>
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Chief Complaint</p>
                  <p className="text-sm text-gray-800 font-medium">{encounter.mainComplaint}</p>
                </div>
              )}
              {(encounter.bloodPressure || encounter.heartRate || encounter.temperature || encounter.spO2 || encounter.weight) && (
                <div className="flex flex-wrap gap-2">
                  {[
                    ["BP", encounter.bloodPressure],
                    ["HR", encounter.heartRate],
                    ["Temp", encounter.temperature],
                    ["SpO₂", encounter.spO2],
                    ["Weight", encounter.weight],
                  ].filter(([, v]) => v).map(([label, value]) => (
                    <div key={label} className="bg-gray-50 rounded-xl px-3 py-2 border border-gray-100">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">{label}</p>
                      <p className="text-sm font-black text-gray-900">{value}</p>
                    </div>
                  ))}
                </div>
              )}
              {encounter.medicalHistory && (
                <div>
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Medical History</p>
                  <p className="text-sm text-gray-700 font-medium whitespace-pre-wrap">{encounter.medicalHistory}</p>
                </div>
              )}
              {encounter.currentMedications && (
                <div>
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Current Medications</p>
                  <p className="text-sm text-gray-700 font-medium">{encounter.currentMedications}</p>
                </div>
              )}
              {encounter.allergies && (
                <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5">
                  <AlertTriangle size={14} className="text-amber-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-black text-amber-700 uppercase tracking-widest">Allergies</p>
                    <p className="text-sm text-amber-900 font-medium">{encounter.allergies}</p>
                  </div>
                </div>
              )}
              {encounter.redFlags && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5">
                  <AlertTriangle size={14} className="text-red-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-black text-red-700 uppercase tracking-widest">Red Flags</p>
                    <p className="text-sm text-red-900 font-medium">{encounter.redFlags}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Examination */}
          {hasExamData && (
            <div className="p-6 space-y-4">
              <h4 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <Microscope size={13} className="text-brand-orange" />
                Examination
              </h4>
              {encounter.examinationPerformed && (
                <div>
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Examination Performed</p>
                  <p className="text-sm text-gray-700 font-medium whitespace-pre-wrap">{encounter.examinationPerformed}</p>
                </div>
              )}
              {encounter.examinationResults && (
                <div>
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Findings</p>
                  <p className="text-sm text-gray-700 font-medium whitespace-pre-wrap">{encounter.examinationResults}</p>
                </div>
              )}
            </div>
          )}

          {/* Diagnosis & Prescription */}
          {hasDiagnosisData && (
            <div className="p-6 space-y-4">
              <h4 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <Pill size={13} className="text-brand-orange" />
                Diagnosis &amp; Prescription
              </h4>
              {encounter.diagnosis && (
                <div>
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Diagnosis</p>
                  <p className="text-base font-black text-gray-900">{encounter.diagnosis}</p>
                </div>
              )}
              {encounter.clinicalNotes && (
                <div>
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Clinical Notes</p>
                  <p className="text-sm text-gray-700 font-medium whitespace-pre-wrap">{encounter.clinicalNotes}</p>
                </div>
              )}
              {encounter.prescription && (
                <div>
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Prescription</p>
                  <pre className="text-sm font-mono text-gray-800 bg-orange-50/60 rounded-xl border border-orange-100 px-4 py-3 whitespace-pre-wrap leading-relaxed">
                    {encounter.prescription}
                  </pre>
                </div>
              )}
              {encounter.treatmentAdvice && (
                <div>
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Treatment Advice</p>
                  <p className="text-sm text-gray-700 font-medium">{encounter.treatmentAdvice}</p>
                </div>
              )}
              {encounter.followUpAdvice && (
                <div>
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Follow-up</p>
                  <p className="text-sm text-gray-700 font-medium">{encounter.followUpAdvice}</p>
                </div>
              )}
              {encounter.prescriberNotes && (
                <div>
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Prescriber Notes</p>
                  <p className="text-sm text-gray-500 font-medium italic">{encounter.prescriberNotes}</p>
                </div>
              )}
              {encounter.medicationGivenAt && (
                <p className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2">
                  ✓ Medication given {new Date(encounter.medicationGivenAt).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function PatientDetailPage() {
  const { id } = useParams();
  const [patient, setPatient] = useState<PatientJSON | null>(null);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [encounters, setEncounters] = useState<ClinicEncounterRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<PatientJSON>>({});
  const [newProfileImage, setNewProfileImage] = useState<File | null>(null);
  const [selectedImage, setSelectedImage] = useState<{
    id: string;
    fileName: string;
    data: Blob;
  } | null>(null);

  const { updatePatient, isSaving } = useUpdatePatient(id as string);

  // Revoke object URL on cleanup to prevent memory leak
  const selectedImageUrl = useMemo(
    () => (selectedImage ? URL.createObjectURL(selectedImage.data) : null),
    [selectedImage],
  );

  useEffect(() => {
    return () => {
      if (selectedImageUrl) URL.revokeObjectURL(selectedImageUrl);
    };
  }, [selectedImageUrl]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/patients/${id}`);
        if (!res.ok) throw new Error("Failed to load patient data.");
        const data = await res.json();
        const loaded = data.details || data;
        setPatient(loaded);
        setFormData(loaded);

        // Visits now include attachments from the API (no N+1)
        const [resVisits, resEncounters] = await Promise.all([
          fetch(`/api/visits?clientId=${id}`),
          fetch(`/api/patients/${id}/encounters`),
        ]);
        if (resVisits.ok) setVisits(await resVisits.json());
        if (resEncounters.ok) setEncounters(await resEncounters.json());
      } catch (err: unknown) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleViewImage = async (attachmentId: string, fileName: string) => {
    try {
      const res = await fetch(`/api/attachments/${attachmentId}`);
      if (!res.ok) throw new Error("Failed to load image");
      const blob = await res.blob();
      setSelectedImage({ id: attachmentId, fileName, data: blob });
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to load image");
    }
  };

  const handleDownloadFile = async (
    attachmentId: string,
    fileName: string,
  ) => {
    try {
      const res = await fetch(`/api/attachments/${attachmentId}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("Download failed");
    }
  };

  const handleSaveAction = async () => {
    const result = await updatePatient(formData, newProfileImage);
    if (result.success) {
      setPatient(result.details);
      setIsEditing(false);
      setNewProfileImage(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-20">
        <Activity className="animate-spin text-brand-orange" size={48} />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20 animate-in fade-in duration-500">
      {/* Top Nav */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <Link
          href="/"
          className="flex items-center gap-2 text-brand-orange font-bold hover:underline"
        >
          <ArrowLeft size={20} strokeWidth={3} />
          Back to Patient List
        </Link>
        <div className="flex gap-3">
          <button
            onClick={() =>
              isEditing ? handleSaveAction() : setIsEditing(true)
            }
            disabled={isSaving}
            className="flex items-center gap-2 bg-white border-2 border-brand-orange text-brand-orange px-5 py-2.5 rounded-xl font-bold hover:bg-orange-50 transition-all shadow-sm"
          >
            {isSaving ? (
              <Loader2 className="animate-spin" size={18} />
            ) : isEditing ? (
              <Save size={18} />
            ) : (
              <Edit3 size={18} />
            )}
            {isSaving
              ? "Saving..."
              : isEditing
                ? "Save Changes"
                : "Edit Profile"}
          </button>
          {isEditing && (
            <button
              onClick={() => {
                setIsEditing(false);
                setFormData(patient!);
              }}
              className="px-5 py-2.5 bg-gray-100 rounded-xl font-bold text-gray-600"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Profile Header Card */}
      <div className="bg-white rounded-[2.5rem] shadow-clean border border-gray-100 p-8 md:p-12">
        <div className="flex flex-col md:flex-row gap-12">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative group">
              {isEditing ? (
                <label className="cursor-pointer">
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) =>
                      setNewProfileImage(e.target.files?.[0] || null)
                    }
                  />
                  <div className="w-44 h-44 bg-gray-50 rounded-3xl border-2 border-dashed border-brand-orange/30 flex flex-col items-center justify-center text-brand-orange">
                    <Camera size={32} />
                    <span className="text-xs font-black mt-2 uppercase tracking-tighter">
                      Change Photo
                    </span>
                  </div>
                </label>
              ) : (
                <div className="w-44 h-44 rounded-3xl overflow-hidden shadow-lg border-4 border-white">
                  {patient?.profileImage ? (
                    <img
                      src={`data:image/jpeg;base64,${patient.profileImage}`}
                      className="w-full h-full object-cover"
                      alt="Profile"
                    />
                  ) : (
                    <div className="w-full h-full bg-orange-100 flex items-center justify-center">
                      <User size={64} className="text-brand-orange" />
                    </div>
                  )}
                </div>
              )}
            </div>
            <span className="bg-orange-100 text-brand-dark-orange text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-widest">
              ID: #{patient?.id}
            </span>
          </div>

          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
            <DetailItem
              label="Full Name"
              name="fullName"
              value={patient?.fullName}
              editValue={formData.fullName}
              isEditing={isEditing}
              onChange={setFormData}
            />
            <DetailItem
              label="Gender"
              name="gender"
              value={patient?.gender}
              editValue={formData.gender}
              isEditing={isEditing}
              onChange={setFormData}
              type="select"
              options={["Male", "Female", "Other"]}
            />
            <DetailItem
              label="Date of Birth"
              name="dob"
              value={
                patient?.dob
                  ? new Date(patient.dob).toLocaleDateString()
                  : "N/A"
              }
              editValue={formData.dob}
              isEditing={isEditing}
              onChange={setFormData}
              type="date"
            />
            <DetailItem
              label="Phone"
              name="phoneNumber"
              value={patient?.phoneNumber}
              editValue={formData.phoneNumber}
              isEditing={isEditing}
              onChange={setFormData}
            />
          </div>
        </div>

      </div>

      {/* Visit History */}
      <div className="space-y-6 pt-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-black text-gray-800 flex items-center gap-3">
            <ClipboardList className="text-brand-orange" size={28} />
            Medical Visit History
          </h2>
          {!isEditing && (
            <Link
              href={`/patients/${id}/new-visit`}
              className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-emerald-700 transition-all shadow-md"
            >
              <Plus size={18} strokeWidth={3} /> New Visit Report
            </Link>
          )}
        </div>

        {visits.length === 0 ? (
          <div className="bg-white p-16 rounded-3xl text-center border-2 border-dashed border-gray-100 text-gray-400 font-bold">
            No clinical visits recorded yet.
          </div>
        ) : (
          <div className="grid gap-8">
            {visits.map((visit) => (
              <div
                key={visit.id}
                className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 hover:shadow-md transition-all"
              >
                {/* Visit Header */}
                <div className="flex flex-col md:flex-row justify-between mb-8 pb-8 border-b border-gray-50 gap-6">
                  <div className="flex items-center gap-5">
                    <div className="bg-orange-50 p-4 rounded-2xl text-brand-orange shadow-sm">
                      <Calendar size={28} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                        Visit Date
                      </p>
                      <p className="text-xl font-bold text-gray-800">
                        {new Date(visit.visitDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                      Consulting Clinician
                    </p>
                    <p className="text-xl font-bold text-gray-800">
                      {visit.doctorName}
                    </p>
                  </div>
                </div>

                {/* Clinical Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                  <VisitDetail
                    label="pc - Presenting Complaint"
                    value={visit.presentingComplaint}
                  />
                  <VisitDetail
                    label="oe - Observation & Exam"
                    value={visit.observationAndExamination}
                  />
                  <VisitDetail
                    label="hpc - History of Presenting Complaint"
                    value={visit.historyOfPresentingComplaint}
                  />
                  <VisitDetail
                    label="Clinical Impression"
                    value={visit.impression}
                  />
                  <VisitDetail label="Management Plan" value={visit.plan} />
                  <VisitDetail label="Internal Notes" value={visit.notes} />
                </div>

                {/* Attachments */}
                {visit.attachments && visit.attachments.length > 0 && (
                  <div className="mt-10 pt-8 border-t border-gray-50">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">
                      Attached Documents & Images
                    </p>
                    <div className="flex flex-wrap gap-4">
                      {visit.attachments.map((att) => (
                        <div
                          key={att.id}
                          className="flex items-center gap-4 bg-gray-50 border border-gray-100 p-3.5 rounded-2xl"
                        >
                          <FileText
                            size={20}
                            className="text-brand-orange"
                          />
                          <div>
                            <p className="text-sm font-bold text-gray-700 leading-none">
                              {att.fileName}
                            </p>
                            <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold">
                              {formatFileSize(att.fileSize)}
                            </p>
                          </div>
                          <div className="flex gap-2 ml-4">
                            {att.fileType.startsWith("image/") && (
                              <button
                                onClick={() =>
                                  handleViewImage(att.id, att.fileName)
                                }
                                className="p-2.5 bg-white rounded-xl text-brand-orange hover:bg-orange-100 shadow-sm transition-all"
                                title="View Image"
                              >
                                <Eye size={18} />
                              </button>
                            )}
                            <button
                              onClick={() =>
                                handleDownloadFile(att.id, att.fileName)
                              }
                              className="p-2.5 bg-white rounded-xl text-gray-600 hover:bg-gray-100 shadow-sm transition-all"
                              title="Download File"
                            >
                              <Download size={18} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Clinic Visit History */}
      {encounters.length > 0 && (
        <div className="space-y-6 pt-6">
          <h2 className="text-2xl font-black text-gray-800 flex items-center gap-3">
            <Stethoscope className="text-brand-orange" size={28} />
            Clinic Visit History
          </h2>
          <div className="grid gap-4">
            {encounters.map((enc) => (
              <EncounterCard key={enc.id} encounter={enc} />
            ))}
          </div>
        </div>
      )}

      {/* Image Modal */}
      {selectedImage && selectedImageUrl && (
        <div
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-6 sm:p-20 animate-in fade-in duration-300"
          onClick={() => setSelectedImage(null)}
        >
          <button className="absolute top-10 right-10 text-white hover:text-brand-orange transition-colors">
            <X size={48} />
          </button>
          <div
            className="bg-white p-2 rounded-3xl shadow-2xl max-w-full max-h-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedImageUrl}
              alt="Preview"
              className="max-w-full max-h-[80vh] rounded-2xl"
            />
            <div className="p-4 text-center">
              <p className="font-bold text-gray-800">
                {selectedImage.fileName}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
