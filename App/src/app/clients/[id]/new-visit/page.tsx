"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  User, Activity, ArrowLeft, Calendar, FileText, 
  Upload, X, CheckCircle2, Loader2, ClipboardCheck,
  Stethoscope, MessageSquare
} from "lucide-react";

import type { ClientJSONType } from "~/models/client";
import type { AttachmentType } from "~/models/attachment";

type Client = Pick<ClientJSONType, 'id' | 'fullName' | 'gender' | 'dob'>;

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

  const [visitDate, setVisitDate] = useState(new Date().toISOString().split('T')[0]); 
  const [doctorName, setDoctorName] = useState("");
  const [presentingComplaint, setPresentingComplaint] = useState("");
  const [historyOfPresentingComplaint, setHistoryOfPresentingComplaint] = useState("");
  const [observationAndExamination, setObservationAndExamination] = useState("");
  const [impression, setImpression] = useState("");
  const [plan, setPlan] = useState("");
  const [notes, setNotes] = useState("");

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
    return Math.abs(new Date(Date.now() - dob.getTime()).getUTCFullYear() - 1970);
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
      const res = await fetch("/api/attachments", { method: "POST", body: formData });
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
      const res = await fetch(`/api/attachments/${attachmentId}`, { method: "DELETE" });
      if (res.ok) setAttachments(attachments.filter(a => a.id !== attachmentId));
    } catch (err: any) {
      alert("Failed to delete");
    }
  };

  if (isLoading) return <div className="flex justify-center p-20"><Activity className="animate-spin text-[#266AFB]" size={48} /></div>;
  if (!client) return <div className="p-10 text-center font-bold text-gray-500">Patient not found.</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20 animate-in fade-in duration-500">
      {/* Header & Patient Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <Link href={`/clients/${id}`} className="flex items-center gap-2 text-[#266AFB] hover:text-[#003588] font-bold hover:underline">
          <ArrowLeft size={20} strokeWidth={3} />
          Back to Profile
        </Link>
        <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-[#D6E4FF] flex items-center gap-4">
          <div className="w-10 h-10 bg-[#EBF1FF] rounded-full flex items-center justify-center text-[#266AFB]">
            <User size={20} />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Active Patient</p>
            <p className="font-bold text-gray-800 leading-none">
              {client.fullName} <span className="text-gray-400 font-medium ml-1 text-sm">({client.gender}, {getAge(client.dob)} y/o)</span>
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-3xl shadow-clean border border-gray-100 p-8 space-y-6">
            <h2 className="text-xl font-black text-gray-800 flex items-center gap-3">
              <Calendar className="text-[#266AFB]" />
              Visit Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Visit Date</label>
                <input 
                  type="date" 
                  value={visitDate}
                  onChange={(e) => setVisitDate(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-100 p-3 rounded-xl focus:ring-4 focus:ring-blue-100 outline-none font-semibold transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Seen By (Doctor) *</label>
                <div className="relative">
                  <Stethoscope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="text" 
                    placeholder="Enter doctor's name"
                    value={doctorName}
                    required
                    onChange={(e) => setDoctorName(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-100 pl-10 pr-4 py-3 rounded-xl focus:ring-4 focus:ring-blue-100 outline-none font-semibold transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Clinical Documentation */}
          <div className="bg-white rounded-3xl shadow-clean border border-gray-100 p-8 space-y-8">
            <h2 className="text-xl font-black text-gray-800 flex items-center gap-3">
              <ClipboardCheck className="text-[#266AFB]" />
              Clinical Documentation
            </h2>
            
            <div className="space-y-6">
              <DocField label="pc - Presenting Complaint" value={presentingComplaint} setter={setPresentingComplaint} />
              <DocField label="hpc - History of Presenting Complaint" value={historyOfPresentingComplaint} setter={setHistoryOfPresentingComplaint} />
              <DocField label="oe - Observation & Examination" value={observationAndExamination} setter={setObservationAndExamination} />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DocField label="Clinical Impression" value={impression} setter={setImpression} rows={4} />
                <DocField label="Management Plan" value={plan} setter={setPlan} rows={4} />
              </div>

              <DocField label="Extra Notes" value={notes} setter={setNotes} icon={<MessageSquare size={16} />} />
            </div>
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
                className="w-full bg-[#266AFB] hover:bg-[#003588] text-white py-4 rounded-2xl font-black shadow-lg shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {isSaving ? <Loader2 className="animate-spin" /> : <ClipboardCheck size={20} />}
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
            <div className={`space-y-4 pt-4 border-t border-gray-50 transition-opacity ${!visitId ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Supporting Files</h3>
                {isUploadingFile && <Loader2 className="animate-spin text-[#266AFB]" size={16} />}
              </div>
              
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50 hover:bg-[#EBF1FF] hover:border-[#266AFB]/30 transition-all cursor-pointer group">
                <Upload className="text-gray-400 group-hover:text-[#266AFB] mb-2" size={24} />
                <span className="text-xs font-bold text-gray-500 uppercase tracking-tighter">Click to upload</span>
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
                  <div key={att.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-100 group">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <FileText size={16} className="text-[#266AFB] flex-shrink-0" />
                      <span className="text-xs font-bold text-gray-700 truncate">{att.fileName}</span>
                    </div>
                    <button onClick={() => handleDeleteAttachment(att.id)} className="text-gray-400 hover:text-red-500 transition-colors">
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

function DocField({ label, value, setter, rows = 3, icon }: { label: string, value: string, setter: (v: string) => void, rows?: number, icon?: React.ReactNode }) {
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
        className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:bg-white outline-none font-medium transition-all text-gray-800 placeholder:text-gray-300 shadow-sm"
        placeholder={`Enter details for ${label.toLowerCase()}...`}
      />
    </div>
  );
}