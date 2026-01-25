"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  User, ArrowLeft, Calendar,
   ClipboardList, Edit3, Save, Plus, Camera, Loader2, X
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
    const [client, setClient] = useState<Client | null>(null);
    const [visits, setVisits] = useState<Visit[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<Partial<Client>>({});
    const [newProfileImage, setNewProfileImage] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState<{ id: string; fileName: string; data: Blob } | null>(null);

    const { updatePatient, isSaving, updateError } = useUpdatePatient(id as string);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const res = await fetch(`/api/clients/${id}`);
                const data = await res.json();
                const loaded = data.details || data;
                setClient(loaded);
                setFormData(loaded);

                const resVisits = await fetch(`/api/visits?clientId=${id}`);
                if (resVisits.ok) {
                    const visitData = await resVisits.json();
                    const visitsWithAttachments = await Promise.all(
                        visitData.map(async (visit: Visit) => {
                            const attachRes = await fetch(`/api/attachments?visitId=${visit.id}`);
                            const attachments = attachRes.ok ? await attachRes.json() : [];
                            return { ...visit, attachments };
                        })
                    );
                    setVisits(visitsWithAttachments);
                }
            } catch (e) {
                console.error("Failed to fetch patient data");
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const handleSaveAction = async () => {
        const result = await updatePatient(formData, newProfileImage);
        if (result.success) {
            setClient(result.details);
            setIsEditing(false);
            setNewProfileImage(null);
        }
    };

    if (isLoading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-brand-orange" size={40} /></div>;

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-20 animate-in fade-in duration-500">
            {/* Top Navigation */}
            <div className="flex justify-between items-center">
                <Link href="/" className="flex items-center gap-2 text-brand-orange font-bold hover:underline">
                    <ArrowLeft size={20} strokeWidth={3} /> Back to List
                </Link>
                <div className="flex gap-3">
                    <button 
                        onClick={() => isEditing ? handleSaveAction() : setIsEditing(true)}
                        disabled={isSaving}
                        className="flex items-center gap-2 bg-white border-2 border-brand-orange text-brand-orange px-6 py-2 rounded-xl font-bold hover:bg-orange-50 transition-all disabled:opacity-50 shadow-sm"
                    >
                        {isSaving ? <Loader2 className="animate-spin" size={18} /> : (isEditing ? <Save size={18} /> : <Edit3 size={18} />)}
                        {isSaving ? "Saving..." : (isEditing ? "Save Changes" : "Edit Profile")}
                    </button>
                    {isEditing && (
                        <button onClick={() => { setIsEditing(false); setFormData(client!); }} className="px-6 py-2 bg-gray-100 rounded-xl font-bold text-gray-600 hover:bg-gray-200">
                            Cancel
                        </button>
                    )}
                </div>
            </div>

            {updateError && (
                <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl font-bold">
                    {updateError}
                </div>
            )}

            {/* Profile Card */}
            <div className="bg-white rounded-3xl shadow-clean border border-gray-100 p-8 md:p-12">
                <div className="flex flex-col md:flex-row gap-12">
                    <div className="flex flex-col items-center space-y-4">
                        {isEditing ? (
                            <label className="cursor-pointer group">
                                <input type="file" className="hidden" onChange={(e) => setNewProfileImage(e.target.files?.[0] || null)} />
                                <div className="w-40 h-40 bg-gray-50 rounded-3xl border-2 border-dashed border-brand-orange/30 flex flex-col items-center justify-center text-brand-orange group-hover:bg-orange-50">
                                    <Camera size={32} />
                                    <span className="text-xs font-bold mt-2 uppercase">{newProfileImage ? "Ready" : "Change"}</span>
                                </div>
                            </label>
                        ) : (
                            <div className="w-40 h-40 rounded-3xl overflow-hidden shadow-lg border-4 border-white bg-orange-100 flex items-center justify-center">
                                {client?.profileImage ? (
                                    <img src={`data:image/jpeg;base64,${client.profileImage}`} className="w-full h-full object-cover" alt="Profile" />
                                ) : (
                                    <User size={64} className="text-brand-orange" />
                                )}
                            </div>
                        )}
                        <span className="bg-orange-100 text-brand-dark-orange text-xs font-black px-4 py-1 rounded-full uppercase">ID: #{client?.id}</span>
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

                <div className="mt-12 pt-12 border-t border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <HistoryItem label="Drug History (Dh)" name="drugHistory" value={client?.drugHistory} editValue={formData.drugHistory} isEditing={isEditing} onChange={setFormData} />
                    <HistoryItem label="Family History (Fh)" name="familyHistory" value={client?.familyHistory} editValue={formData.familyHistory} isEditing={isEditing} onChange={setFormData} />
                    <HistoryItem label="Social History (Sh)" name="socialHistory" value={client?.socialHistory} editValue={formData.socialHistory} isEditing={isEditing} onChange={setFormData} />
                </div>
            </div>

            {/* Visit History Timeline */}
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-black text-gray-800 flex items-center gap-3">
                        <ClipboardList className="text-brand-orange" size={28} /> Visit History
                    </h2>
                    {!isEditing && (
                        <Link href={`/clients/${id}/new-visit`} className="bg-emerald-600 text-white px-5 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-emerald-700 transition-all">
                            <Plus size={18} /> New Visit
                        </Link>
                    )}
                </div>
                
                {visits.length === 0 ? (
                    <div className="bg-white p-12 rounded-3xl text-center border-2 border-dashed border-gray-100 text-gray-400 font-bold">No visits recorded.</div>
                ) : (
                    <div className="grid gap-6">
                        {visits.map((visit) => (
                            <div key={visit.id} className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                                <div className="flex justify-between mb-6 pb-6 border-b border-gray-50">
                                    <div className="flex items-center gap-4">
                                        <Calendar className="text-brand-orange" size={24} />
                                        <div>
                                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Date</p>
                                            <p className="text-lg font-bold text-gray-800">{new Date(visit.visitDate).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Doctor</p>
                                        <p className="text-lg font-bold text-gray-800">{visit.doctorName}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <VisitDetail label="Presenting Complaint" value={visit.presentingComplaint} />
                                    <VisitDetail label="Observations" value={visit.observationAndExamination} />
                                    <VisitDetail label="Clinical Impression" value={visit.impression} />
                                    <VisitDetail label="Treatment Plan" value={visit.plan} />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Image */}
            {selectedImage && (
                <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-10" onClick={() => setSelectedImage(null)}>
                    <button className="absolute top-10 right-10 text-white"><X size={40}/></button>
                    <div className="bg-white p-2 rounded-3xl max-w-full max-h-full overflow-hidden" onClick={e => e.stopPropagation()}>
                    </div>
                </div>
            )}
        </div>
    );
}

function DetailItem({ label, name, value, editValue, isEditing, onChange, type = "text", options = [] }: any) {
    return (
        <div className="space-y-1">
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">{label}</p>
            {isEditing ? (
                type === "select" ? (
                    <select value={editValue || ""} onChange={(e) => onChange((prev: any) => ({ ...prev, [name]: e.target.value }))} className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl outline-none font-bold text-gray-800 focus:ring-4 focus:ring-orange-100">
                        <option value="">Select...</option>
                        {options.map((o: string) => <option key={o} value={o}>{o}</option>)}
                    </select>
                ) : (
                    <input type={type} value={type === "date" && editValue ? new Date(editValue).toISOString().split('T')[0] : (editValue || "")} onChange={(e) => onChange((prev: any) => ({ ...prev, [name]: e.target.value }))} className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl outline-none font-bold text-gray-800 focus:ring-4 focus:ring-orange-100" />
                )
            ) : (
                <p className="text-xl font-bold text-gray-800">{value || "—"}</p>
            )}
        </div>
    );
}

function HistoryItem({ label, name, value, editValue, isEditing, onChange }: any) {
    return (
        <div className="bg-orange-50/40 p-6 rounded-3xl border border-orange-100/50">
            <p className="text-xs font-black text-brand-dark-orange uppercase tracking-widest mb-3">{label}</p>
            {isEditing ? (
                <textarea value={editValue || ""} onChange={(e) => onChange((prev: any) => ({ ...prev, [name]: e.target.value }))} className="w-full bg-white border border-orange-200 p-4 rounded-2xl outline-none font-medium min-h-[120px]" />
            ) : (
                <p className="text-gray-700 leading-relaxed font-semibold">{value || "No records."}</p>
            )}
        </div>
    );
}

function VisitDetail({ label, value }: { label: string, value?: string }) {
    if (!value) return null;
    return (
        <div className="space-y-1">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
            <p className="text-gray-700 font-semibold leading-relaxed">{value}</p>
        </div>
    );
}