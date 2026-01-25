"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  User, Activity, ArrowLeft, Calendar, ClipboardList, Edit3, Save, X, Plus, 
  Download, Eye, FileText, Camera, Loader2
} from "lucide-react";

import { useUpdatePatient } from "~/hooks/useUpdatePatient";
import type { ClientJSONType } from "~/models/client";
import type { AttachmentType } from "~/models/attachment";

type Client = ClientJSONType; 
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

export default function ClientDetails() {
    const { id } = useParams();
    const router = useRouter();

    const [client, setClient] = useState<Client | null>(null);
    const [visits, setVisits] = useState<Visit[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [fetchError, setFetchError] = useState<string | null>(null);

    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<Partial<Client>>({});
    const [newProfileImage, setNewProfileImage] = useState<File | null>(null);
    
    const [selectedImage, setSelectedImage] = useState<{ id: string; fileName: string; data: Blob } | null>(null);

    const { updatePatient, isSaving, updateError } = useUpdatePatient(id as string);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                // Fetch Client Details
                const res = await fetch(`/api/clients/${id}`);
                if (!res.ok) throw new Error("Failed to load patient data.");
                const data = await res.json();
                const loadedClient = data.details || data; 
                setClient(loadedClient);
                setFormData(loadedClient);

                // Fetch Visits
                const resVisits = await fetch(`/api/visits?clientId=${id}`);
                if (resVisits.ok) {
                    const visitData = await resVisits.json();
                    
                    // Fetch attachments for each visit
                    const visitsWithAttachments = await Promise.all(
                        visitData.map(async (visit: Visit) => {
                            const attachRes = await fetch(`/api/attachments?visitId=${visit.id}`);
                            const attachments = attachRes.ok ? await attachRes.json() : [];
                            return { ...visit, attachments };
                        })
                    );
                    setVisits(visitsWithAttachments);
                }
            } catch (err: any) {
                setFetchError(err.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [id]);

    // File Handling
    const handleViewImage = async (attachmentId: string, fileName: string) => {
        try {
            const res = await fetch(`/api/attachments/${attachmentId}`);
            if (!res.ok) throw new Error("Failed to load image");
            const blob = await res.blob();
            setSelectedImage({ id: attachmentId, fileName, data: blob });
        } catch (err: any) {
            alert(err.message || "Failed to load image");
        }
    };

    const handleDownloadFile = async (attachmentId: string, fileName: string) => {
        try {
            const res = await fetch(`/api/attachments/${attachmentId}`);
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = fileName;
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            alert("Download failed");
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
    };

    const handleSaveAction = async () => {
        const result = await updatePatient(formData, newProfileImage);
        if (result.success) {
            setClient(result.details);
            setIsEditing(false);
            setNewProfileImage(null);
        }
    };

    if (isLoading) return <div className="flex justify-center p-20"><Activity className="animate-spin text-brand-orange" size={48} /></div>;

    return (
        <div className="max-w-6xl mx-auto space-y-10 pb-20 animate-in fade-in duration-500">
            {/* Top Navigation Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <Link href="/" className="flex items-center gap-2 text-brand-orange font-bold hover:underline">
                    <ArrowLeft size={20} strokeWidth={3} />
                    Back to Patient List
                </Link>
                <div className="flex gap-3">
                    <button 
                        onClick={() => isEditing ? handleSaveAction() : setIsEditing(true)}
                        disabled={isSaving}
                        className="flex items-center gap-2 bg-white border-2 border-brand-orange text-brand-orange px-5 py-2.5 rounded-xl font-bold hover:bg-orange-50 transition-all shadow-sm"
                    >
                        {isSaving ? <Loader2 className="animate-spin" size={18} /> : (isEditing ? <Save size={18} /> : <Edit3 size={18} />)}
                        {isSaving ? "Saving..." : (isEditing ? "Save Changes" : "Edit Profile")}
                    </button>
                    {isEditing && (
                        <button onClick={() => { setIsEditing(false); setFormData(client!); }} className="px-5 py-2.5 bg-gray-100 rounded-xl font-bold text-gray-600">
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
                                    <input type="file" className="hidden" onChange={(e) => setNewProfileImage(e.target.files?.[0] || null)} />
                                    <div className="w-44 h-44 bg-gray-50 rounded-3xl border-2 border-dashed border-brand-orange/30 flex flex-col items-center justify-center text-brand-orange">
                                        <Camera size={32} />
                                        <span className="text-xs font-black mt-2 uppercase tracking-tighter">Change Photo</span>
                                    </div>
                                </label>
                            ) : (
                                <div className="w-44 h-44 rounded-3xl overflow-hidden shadow-lg border-4 border-white">
                                    {client?.profileImage ? (
                                        <img src={`data:image/jpeg;base64,${client.profileImage}`} className="w-full h-full object-cover" alt="Profile" />
                                    ) : (
                                        <div className="w-full h-full bg-orange-100 flex items-center justify-center"><User size={64} className="text-brand-orange" /></div>
                                    )}
                                </div>
                            )}
                        </div>
                        <span className="bg-orange-100 text-brand-dark-orange text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-widest">ID: #{client?.id}</span>
                    </div>

                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                        <DetailItem label="Full Name" name="fullName" value={client?.fullName} editValue={formData.fullName} isEditing={isEditing} onChange={setFormData} />
                        <DetailItem label="Gender" name="gender" value={client?.gender} editValue={formData.gender} isEditing={isEditing} onChange={setFormData} type="select" options={["Male", "Female", "Other"]} />
                        <DetailItem label="Date of Birth" name="dob" value={client?.dob ? new Date(client.dob).toLocaleDateString() : "N/A"} editValue={formData.dob} isEditing={isEditing} onChange={setFormData} type="date" />
                        <DetailItem label="Phone" name="phoneNumber" value={client?.phoneNumber} editValue={formData.phoneNumber} isEditing={isEditing} onChange={setFormData} />
                        <DetailItem label="Email" name="email" value={client?.email} editValue={formData.email} isEditing={isEditing} onChange={setFormData} />
                        <DetailItem label="Address" name="address" value={client?.address} editValue={formData.address} isEditing={isEditing} onChange={setFormData} />
                    </div>
                </div>

                <div className="mt-14 pt-12 border-t border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-8">
                    <HistoryItem label="Drug History (Dh)" name="drugHistory" value={client?.drugHistory} editValue={formData.drugHistory} isEditing={isEditing} onChange={setFormData} />
                    <HistoryItem label="Family History (Fh)" name="familyHistory" value={client?.familyHistory} editValue={formData.familyHistory} isEditing={isEditing} onChange={setFormData} />
                    <HistoryItem label="Social History (Sh)" name="socialHistory" value={client?.socialHistory} editValue={formData.socialHistory} isEditing={isEditing} onChange={setFormData} />
                </div>
            </div>

            {/* Visit History Section */}
            <div className="space-y-6 pt-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-black text-gray-800 flex items-center gap-3">
                        <ClipboardList className="text-brand-orange" size={28} />
                        Medical Visit History
                    </h2>
                    {!isEditing && (
                        <Link href={`/clients/${id}/new-visit`} className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-emerald-700 transition-all shadow-md">
                            <Plus size={18} strokeWidth={3} /> New Visit Report
                        </Link>
                    )}
                </div>
                
                {visits.length === 0 ? (
                    <div className="bg-white p-16 rounded-3xl text-center border-2 border-dashed border-gray-100 text-gray-400 font-bold">No clinical visits recorded yet.</div>
                ) : (
                    <div className="grid gap-8">
                        {visits.map((visit) => (
                            <div key={visit.id} className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 hover:shadow-md transition-all">
                                {/* Visit Card Header */}
                                <div className="flex flex-col md:flex-row justify-between mb-8 pb-8 border-b border-gray-50 gap-6">
                                    <div className="flex items-center gap-5">
                                        <div className="bg-orange-50 p-4 rounded-2xl text-brand-orange shadow-sm"><Calendar size={28} /></div>
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Visit Date</p>
                                            <p className="text-xl font-bold text-gray-800">{new Date(visit.visitDate).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Consulting Clinician</p>
                                        <p className="text-xl font-bold text-gray-800">{visit.doctorName}</p>
                                    </div>
                                </div>

                                {/* Detailed Medical Fields */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                                    <VisitDetail label="pc - Presenting Complaint" value={visit.presentingComplaint} />
                                    <VisitDetail label="oe - Observation & Exam" value={visit.observationAndExamination} />
                                    <VisitDetail label="hpc - History of Presenting Complaint" value={visit.historyOfPresentingComplaint} />
                                    <VisitDetail label="Clinical Impression" value={visit.impression} />
                                    <VisitDetail label="Management Plan" value={visit.plan} />
                                    <VisitDetail label="Internal Notes" value={visit.notes} />
                                </div>

                                {/* Original Functionality: Attachments */}
                                {visit.attachments && visit.attachments.length > 0 && (
                                    <div className="mt-10 pt-8 border-t border-gray-50">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Attached Documents & Images</p>
                                        <div className="flex flex-wrap gap-4">
                                            {visit.attachments.map((att) => (
                                                <div key={att.id} className="flex items-center gap-4 bg-gray-50 border border-gray-100 p-3.5 rounded-2xl">
                                                    <FileText size={20} className="text-brand-orange" />
                                                    <div>
                                                        <p className="text-sm font-bold text-gray-700 leading-none">{att.fileName}</p>
                                                        <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold">{formatFileSize(att.fileSize)}</p>
                                                    </div>
                                                    <div className="flex gap-2 ml-4">
                                                        {att.fileType.startsWith("image/") && (
                                                            <button 
                                                                onClick={() => handleViewImage(att.id, att.fileName)} 
                                                                className="p-2.5 bg-white rounded-xl text-brand-orange hover:bg-orange-100 shadow-sm transition-all"
                                                                title="View Image"
                                                            >
                                                                <Eye size={18}/>
                                                            </button>
                                                        )}
                                                        <button 
                                                            onClick={() => handleDownloadFile(att.id, att.fileName)} 
                                                            className="p-2.5 bg-white rounded-xl text-gray-600 hover:bg-gray-100 shadow-sm transition-all"
                                                            title="Download File"
                                                        >
                                                            <Download size={18}/>
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

            {/* Original Functionality: Image Modal */}
            {selectedImage && (
                <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-6 sm:p-20 animate-in fade-in duration-300" onClick={() => setSelectedImage(null)}>
                    <button className="absolute top-10 right-10 text-white hover:text-brand-orange transition-colors"><X size={48}/></button>
                    <div className="bg-white p-2 rounded-3xl shadow-2xl max-w-full max-h-full overflow-hidden" onClick={e => e.stopPropagation()}>
                        <img 
                            src={URL.createObjectURL(selectedImage.data)} 
                            alt="Preview" 
                            className="max-w-full max-h-[80vh] rounded-2xl" 
                        />
                        <div className="p-4 text-center">
                            <p className="font-bold text-gray-800">{selectedImage.fileName}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function DetailItem({ label, name, value, editValue, isEditing, onChange, type = "text", options = [] }: any) {
    return (
        <div className="space-y-2">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{label}</p>
            {isEditing ? (
                type === "select" ? (
                    <select value={editValue || ""} onChange={(e) => onChange((prev: any) => ({ ...prev, [name]: e.target.value }))} className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:ring-4 focus:ring-orange-100 outline-none transition-all font-semibold">
                        <option value="">Select...</option>
                        {options.map((o: string) => <option key={o} value={o}>{o}</option>)}
                    </select>
                ) : (
                    <input type={type} value={type === "date" && editValue ? new Date(editValue).toISOString().split('T')[0] : (editValue || "")} onChange={(e) => onChange((prev: any) => ({ ...prev, [name]: e.target.value }))} className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:ring-4 focus:ring-orange-100 outline-none transition-all font-semibold" />
                )
            ) : (
                <p className="text-lg font-bold text-gray-800 leading-tight">{value || "—"}</p>
            )}
        </div>
    );
}

function HistoryItem({ label, name, value, editValue, isEditing, onChange }: any) {
    return (
        <div className="bg-orange-50/40 p-8 rounded-[2rem] border border-orange-100/60">
            <p className="text-[10px] font-black text-brand-dark-orange uppercase tracking-[0.2em] mb-4">{label}</p>
            {isEditing ? (
                <textarea value={editValue || ""} onChange={(e) => onChange((prev: any) => ({ ...prev, [name]: e.target.value }))} className="w-full bg-white border border-orange-200 p-4 rounded-2xl focus:ring-4 focus:ring-orange-100 outline-none min-h-[140px] font-medium" />
            ) : (
                <p className="text-gray-700 leading-relaxed font-semibold">{value || "No records provided."}</p>
            )}
        </div>
    );
}

function VisitDetail({ label, value }: { label: string, value?: string }) {
    if (!value) return null;
    return (
        <div className="space-y-1.5">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{label}</p>
            <p className="text-gray-700 font-semibold leading-relaxed text-sm lg:text-base">{value}</p>
        </div>
    );
}