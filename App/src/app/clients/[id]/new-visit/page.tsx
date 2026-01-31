"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import MedicalQuestionnaire from "../../../../components/questionnaires/MedicalQuestionnaire";
import RadiationQuestionnaire from "../../../../components/questionnaires/RadiationQuestionnaire";
import SandstormQuestionnaire from "../../../../components/questionnaires/SandstormQuestionnaire";
import CollapsibleSection from "~/components/CollapsibleSection";
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
  BookOpen,
} from "lucide-react";
import type { ClientJSONType } from "~/models/client";
import type { AttachmentType } from "~/models/attachment";

type Client = Pick<ClientJSONType, "id" | "fullName" | "gender" | "dob">;

interface Template {
  id: string;
  title: string;
  content: string;
}

const ORANGE = "#f97316";

const BUTTON_STYLE = {
  padding: "8px 16px",
  backgroundColor: ORANGE,
  color: "white",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
};

export default function NewVisitPage() {
  const { id } = useParams();
  const router = useRouter();

  const [client, setClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [visitSavedMessage, setVisitSavedMessage] = useState(false);
  const [visitId, setVisitId] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<AttachmentType[]>([]);

  const [visitDate, setVisitDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [doctorName, setDoctorName] = useState("");
  const [presentingComplaint, setPresentingComplaint] = useState("");
  const [historyOfPresentingComplaint, setHistoryOfPresentingComplaint] =
    useState("");
  const [observationAndExamination, setObservationAndExamination] = useState("");
  const [impression, setImpression] = useState("");
  const [plan, setPlan] = useState("");
  const [notes, setNotes] = useState("");

  const [medicalFocusQuestionnaire, setMedicalFocusQuestionnaire] =
    useState<any | null>(null);
  const [radiationQuestionnaire, setRadiationQuestionnaire] =
    useState<any | null>(null);
  const [sandstormQuestionnaire, setSandstormQuestionnaire] =
    useState<any | null>(null);

  // Template management states
  const defaultTemplates: Template[] = [
    {
      id: "1",
      title: "Blood Sugar",
      content: "Fasting: mg/dL\nRandom: mg/dL\nHbA1c: %\nNotes: ",
    },
    {
      id: "2",
      title: "Blood Pressure",
      content: "BP: / mmHg\nHeart Rate: bpm\nPosition: Sitting / Standing\nNotes: ",
    },
    {
      id: "3",
      title: "Weight and Height",
      content: "Weight: kg\nHeight: cm\nBMI:\nNotes: ",
    },
    {
      id: "4",
      title: "Vision Test",
      content: "Right Eye:\nLeft Eye:\nWith Glasses: Yes / No\nNotes: ",
    },
    {
      id: "5",
      title: "Malaria Screen",
      content:
        "RDT Performed: Yes / No\nResult: Positive / Negative\nTemperature: °C\nNotes: ",
    },
    {
      id: "6",
      title: "Urine Dip",
      content:
        "Protein:\nGlucose:\nKetones:\nBlood:\nNitrites:\nLeukocytes:\nNotes: ",
    },
    {
      id: "7",
      title: "Peak Flow (Asthma)",
      content: "Peak Flow: L/min\nPredicted: L/min\n% Predicted:\nNotes: ",
    },
  ];

  const [templates, setTemplates] = useState<Template[]>(() => {
    if (typeof window === "undefined") return defaultTemplates;
    const saved = localStorage.getItem("visitTemplates");
    return saved ? JSON.parse(saved) : defaultTemplates;
  });

  const [showTemplateDropdown, setShowTemplateDropdown] = useState(false);
  const [addingTemplate, setAddingTemplate] = useState(false);
  const [newTemplateTitle, setNewTemplateTitle] = useState("");
  const [newTemplateContent, setNewTemplateContent] = useState("");

  // Save templates to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("visitTemplates", JSON.stringify(templates));
  }, [templates]);

  useEffect(() => {
    const fetchClient = async () => {
      try {
        const res = await fetch(`/api/clients/${id}`);
        if (!res.ok) throw new Error("Failed");
        const data = await res.json();
        setClient(data.details || data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    if (id) fetchClient();
  }, [id]);

  const getAge = (dobString?: string | null) => {
    if (!dobString) return "N/A";
    const dob = new Date(dobString);
    return Math.abs(
      new Date(Date.now() - dob.getTime()).getUTCFullYear() - 1970
    );
  };

  const addTemplateToNotes = (template: Template) => {
    const sep = notes ? "\n\n---\n\n" : "";
    setNotes((currentNotes) => currentNotes + sep + `[${template.title}]\n${template.content}`);
    setShowTemplateDropdown(false);
  };

  const saveNewTemplate = () => {
    if (!newTemplateTitle || !newTemplateContent) return;
    const newTemplate = {
      id: Date.now().toString(),
      title: newTemplateTitle,
      content: newTemplateContent,
    };
    setTemplates((prev) => [...prev, newTemplate]);
    setNewTemplateTitle("");
    setNewTemplateContent("");
    setAddingTemplate(false);
    addTemplateToNotes(newTemplate);
  };

  const deleteTemplate = (templateId: string) => {
    if (!confirm("Delete this template?")) return;
    setTemplates((prev) => prev.filter((t) => t.id !== templateId));
  };

  const handleSave = async () => {
    if (!doctorName.trim()) {
      alert("Please enter the name of the clinician seen by the patient.");
      return;
    }
    setIsSaving(true);
    try {
      const res = await fetch("/api/visits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: id,
          doctorName,
          presentingComplaint,
          historyOfPresentingComplaint,
          observationAndExamination,
          impression,
          plan,
          notes,
          visitDate,
          medicalFocusQuestionnaire,
          radiationQuestionnaire,
          sandstormQuestionnaire,
        }),
      });
      if (!res.ok) throw new Error("Failed to save visit");
      const savedVisit = await res.json();
      setVisitId(savedVisit.id);
      setVisitSavedMessage(true);
    } catch (err: any) {
      alert(err.message);
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
      setAttachments([newAttachment, ...attachments]);
    } catch (err: any) {
      alert(err.message);
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
      if (res.ok)
        setAttachments(attachments.filter((a) => a.id !== attachmentId));
    } catch (err: any) {
      alert("Failed to delete");
    }
  };

  if (isLoading)
    return (
      <div className="flex justify-center p-20">
        <Activity className="animate-spin text-brand-orange" size={48} />
      </div>
    );

  if (!client)
    return (
      <div className="p-10 text-center font-bold text-gray-500">
        Patient not found.
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20 animate-in fade-in duration-500">
      {/* Header & Patient Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <Link
          href={`/clients/${id}`}
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
              {client.fullName}{" "}
              <span className="text-gray-400 font-medium ml-1 text-sm">
                ({client.gender}, {getAge(client.dob)} y/o)
              </span>
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
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
                  value={visitDate}
                  onChange={(e) => setVisitDate(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-100 p-3 rounded-xl focus:ring-4 focus:ring-orange-100 outline-none font-semibold transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">
                  Seen By (Doctor) *
                </label>
                <div className="relative">
                  <Stethoscope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Enter doctor's name"
                    value={doctorName}
                    required
                    onChange={(e) => setDoctorName(e.target.value)}
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
            
            {/* Medical Registry Button */}
            <div className="relative">
              <button
                onClick={() => setShowTemplateDropdown(!showTemplateDropdown)}
                className="flex items-center gap-2 bg-brand-orange hover:bg-brand-dark-orange text-white py-3 px-4 rounded-xl font-bold shadow-lg shadow-orange-500/20 transition-all active:scale-95"
              >
                <BookOpen size={18} />
                Medical Registry
              </button>

              {showTemplateDropdown && (
                <div className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-200 w-96 max-h-[400px] overflow-y-auto z-50">
                  <div className="p-4">
                    <h3 className="text-sm font-bold text-gray-700 mb-3">Templates</h3>
                    {templates.map((template) => (
                      <div
                        key={template.id}
                        className="flex items-start justify-between p-3 hover:bg-gray-50 rounded-lg border-b border-gray-100 last:border-b-0"
                      >
                        <button
                          onClick={() => addTemplateToNotes(template)}
                          className="text-left flex-1 cursor-pointer"
                        >
                          <div className="font-medium text-gray-800">{template.title}</div>
                          <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                            {template.content.slice(0, 60)}
                            {template.content.length > 60 ? "…" : ""}
                          </div>
                        </button>
                        <button
                          onClick={() => deleteTemplate(template.id)}
                          className="ml-2 text-gray-400 hover:text-red-500 transition-colors p-1"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>

                  {addingTemplate ? (
                    <div className="p-4 border-t border-gray-200">
                      <div className="space-y-3">
                        <input
                          type="text"
                          placeholder="Template Title"
                          value={newTemplateTitle}
                          onChange={(e) => setNewTemplateTitle(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-200 p-2 rounded-lg text-sm"
                        />
                        <textarea
                          placeholder="Template Content"
                          value={newTemplateContent}
                          onChange={(e) => setNewTemplateContent(e.target.value)}
                          rows={3}
                          className="w-full bg-gray-50 border border-gray-200 p-2 rounded-lg text-sm"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={saveNewTemplate}
                            className="flex-1 bg-brand-orange hover:bg-brand-dark-orange text-white py-2 rounded-lg text-sm font-medium"
                          >
                            Save Template
                          </button>
                          <button
                            onClick={() => {
                              setAddingTemplate(false);
                              setNewTemplateTitle("");
                              setNewTemplateContent("");
                            }}
                            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-lg text-sm font-medium"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setAddingTemplate(true)}
                      className="w-full text-center py-3 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium border-t border-gray-200"
                    >
                      + Add New Template
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-6">
              <DocField
                label="pc - Presenting Complaint"
                value={presentingComplaint}
                setter={setPresentingComplaint}
              />
              <DocField
                label="hpc - History of Presenting Complaint"
                value={historyOfPresentingComplaint}
                setter={setHistoryOfPresentingComplaint}
              />
              <DocField
                label="oe - Observation & Examination"
                value={observationAndExamination}
                setter={setObservationAndExamination}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DocField
                  label="Clinical Impression"
                  value={impression}
                  setter={setImpression}
                  rows={4}
                />
                <DocField
                  label="Management Plan"
                  value={plan}
                  setter={setPlan}
                  rows={4}
                />
              </div>
              <DocField
                label="Extra Notes"
                value={notes}
                setter={setNotes}
                icon={<MessageSquare size={16} />}
              />
            </div>
          </div>

          <div className="space-y-6">
  <CollapsibleSection title="Medical Focus Questionnaire (Optional)">
    <MedicalQuestionnaire onUpdate={setMedicalFocusQuestionnaire} />
  </CollapsibleSection>

  <CollapsibleSection title="Radiation Exposure Questionnaire (Optional)">
    <RadiationQuestionnaire onUpdate={setRadiationQuestionnaire} />
  </CollapsibleSection>

  <CollapsibleSection title="Sandstorm Exposure Questionnaire (Optional)">
    <SandstormQuestionnaire onUpdate={setSandstormQuestionnaire} />
  </CollapsibleSection>
</div>

        </div>

        {/* Files & Actions */}
        <div className="space-y-8">
          {/* Save Action Card */}
          <div className="bg-white rounded-3xl shadow-clean border border-gray-100 p-8 space-y-6 sticky top-8">
            <h2 className="text-lg font-black text-gray-800">Finalize Visit</h2>
            {visitSavedMessage && (
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
                onClick={() => router.push(`/clients/${id}`)}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-2xl font-black shadow-lg shadow-emerald-500/20 transition-all active:scale-95 flex items-center justify-center gap-3"
              >
                <CheckCircle2 size={20} />
                FINISH & EXIT
              </button>
            )}

            {/* Document Upload (Only active after visit is saved) */}
            <div
              className={`space-y-4 pt-4 border-t border-gray-50 transition-opacity ${
                !visitId ? "opacity-40 pointer-events-none" : "opacity-100"
              }`}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">
                  Supporting Files
                </h3>
                {isUploadingFile && (
                  <Loader2 className="animate-spin text-brand-orange" size={16} />
                )}
              </div>
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50 hover:bg-orange-50 hover:border-brand-orange/30 transition-all cursor-pointer group">
                <Upload className="text-gray-400 group-hover:text-brand-orange mb-2" size={24} />
                <span className="text-xs font-bold text-gray-500 uppercase tracking-tighter">
                  Click to upload
                </span>
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                  disabled={isUploadingFile || !visitId}
                />
              </label>

              {/* Uploaded List */}
              <div className="space-y-2">
                {attachments.map((att) => (
                  <div
                    key={att.id}
                    className="flex items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-100 group"
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <FileText size={16} className="text-brand-orange shrink-0" />
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

function DocField({
  label,
  value,
  setter,
  rows = 3,
  icon,
}: {
  label: string;
  value: string;
  setter: (v: string) => void;
  rows?: number;
  icon?: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 ml-1">
        {icon}
        {label}
      </label>
      <textarea
        value={value}
        onChange={(e) => setter(e.target.value)}
        rows={rows}
        className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl focus:ring-4 focus:ring-orange-100 focus:bg-white outline-none font-medium transition-all text-gray-800 placeholder:text-gray-300 shadow-sm"
        placeholder={`Enter details for ${label.toLowerCase()}...`}
      />
    </div>
  );
}