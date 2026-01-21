"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

export const dynamic = 'force-dynamic';

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
    const params = useParams();
    const { id } = params;

    const [client, setClient] = useState<Client | null>(null);
    const [visits, setVisits] = useState<Visit[]>([]);
    
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<Partial<Client>>({});
    const [isSaving, setIsSaving] = useState(false);

    const [selectedImage, setSelectedImage] = useState<{ id: string; fileName: string; data: Blob } | null>(null);
    const [newProfileImage, setNewProfileImage] = useState<File | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const res = await fetch(`/api/clients/${id}`);
                if (!res.ok) throw new Error("Failed to load client.");
                const data = await res.json();
                
                const loadedClient = data.details || data; 
                setClient(loadedClient);
                setFormData(loadedClient); // Pre-fill edit form

                try {
                    const resVisits = await fetch(`/api/visits?clientId=${id}`);
                    if (resVisits.ok) {
                        const visitData = await resVisits.json();
                        
                        // Fetch attachments for each visit
                        const visitsWithAttachments = await Promise.all(
                            visitData.map(async (visit: Visit) => {
                                try {
                                    const attachRes = await fetch(`/api/attachments?visitId=${visit.id}`);
                                    if (attachRes.ok) {
                                        const attachments = await attachRes.json();
                                        return { ...visit, attachments };
                                    }
                                } catch (e) {
                                    console.error(`Failed to load attachments for visit ${visit.id}`);
                                }
                                return visit;
                            })
                        );
                        
                        setVisits(visitsWithAttachments);
                    }
                } catch (e) {
                    console.log("No visits found or API not ready");
                }

            } catch (err: any) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            let res: Response;
            
            if (newProfileImage) {
                const formDataToSend = new FormData();
                // Only include updateable fields
                const updateableFields = ['fullName', 'gender', 'dob', 'email', 'phoneNumber', 'address', 'drugHistory', 'familyHistory', 'socialHistory'];
                updateableFields.forEach(key => {
                    const value = formData[key as keyof typeof formData];
                    if (value !== null && value !== undefined) {
                        formDataToSend.append(key, value.toString());
                    }
                });
                formDataToSend.append('profileImage', newProfileImage);
                
                res = await fetch(`/api/clients/${id}`, {
                    method: "PUT",
                    body: formDataToSend,
                });
            } else {
                const updateData = {
                    fullName: formData.fullName,
                    gender: formData.gender,
                    dob: formData.dob,
                    email: formData.email,
                    phoneNumber: formData.phoneNumber,
                    address: formData.address,
                    drugHistory: formData.drugHistory,
                    familyHistory: formData.familyHistory,
                    socialHistory: formData.socialHistory,
                };
                
                res = await fetch(`/api/clients/${id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(updateData),
                });
            }

            if (!res.ok) throw new Error("Failed to update.");
            
            const responseData = await res.json();
            setClient(responseData.details);
            setIsEditing(false);
            setNewProfileImage(null);
        } catch (err: any) {
            alert(err.message);
        } finally {
            setIsSaving(false);
        }
    };

    const isImageFile = (fileType: string) => {
        return fileType.startsWith("image/");
    };

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
            if (!res.ok) throw new Error("Failed to download file");
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (err: any) {
            alert(err.message || "Failed to download file");
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
    };

    if (isLoading) return <p>Loading...</p>;
    if (error) return <p style={{ color: "red" }}>{error}</p>;
    if (!client) return <p>Client not found.</p>;

    return (
        <main style={{ padding: '20px' }}>
            {/* Top Navigation */}
            <div style={{ marginBottom: '20px' }}>
                <button>
                    <Link href="/">Back to List</Link>
                </button>
            </div>

            {/* Header with Edit Toggle */}
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                <h1>{client.fullName}</h1>
                <button onClick={() => isEditing ? handleSave() : setIsEditing(true)} disabled={isSaving}>
                    {isSaving ? "Saving..." : (isEditing ? "Save Changes" : "Edit Patient")}
                </button>
                {isEditing && (
                    <button onClick={() => { setIsEditing(false); setFormData(client); setNewProfileImage(null); }}>
                        Cancel
                    </button>
                )}
            </div>

            {/* Profile Image */}
            <div style={{ margin: '20px 0' }}>
                {isEditing ? (
                    <div>
                        <div style={{ marginBottom: '10px' }}>
                            <strong>Current Profile Image:</strong>
                        </div>
                        {client.profileImage ? (
                            <img src={`data:image/jpeg;base64,${client.profileImage}`} alt="Profile" style={{ maxWidth: '200px', maxHeight: '200px', borderRadius: '8px', marginBottom: '10px' }} />
                        ) : (
                            <div style={{
                                width: '100px',
                                height: '100px',
                                backgroundColor: '#e5e7eb',
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '2px solid #d1d5db',
                                marginBottom: '10px'
                            }}>
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="12" cy="8" r="3" fill="#9ca3af"/>
                                    <path d="M12 14c-4 0-7 2-7 4v1h14v-1c0-2-3-4-7-4z" fill="#9ca3af"/>
                                </svg>
                            </div>
                        )}
                        <div>
                            <label htmlFor="profileImageEdit"><strong>Change Profile Image (optional, max 5MB):</strong></label>
                            <input
                                id="profileImageEdit"
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    const file = e.target.files?.[0] || null;
                                    if (file && file.size > 5 * 1024 * 1024) {
                                        alert("Profile image must be smaller than 5MB");
                                        e.target.value = "";
                                        setNewProfileImage(null);
                                    } else {
                                        setNewProfileImage(file);
                                    }
                                }}
                                style={{ display: 'block', marginTop: '5px' }}
                            />
                            {newProfileImage && (
                                <div style={{ marginTop: '5px', fontSize: '14px', color: '#059669' }}>
                                    New image selected: {newProfileImage.name}
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    client.profileImage ? (
                        <img src={`data:image/jpeg;base64,${client.profileImage}`} alt="Profile" style={{ maxWidth: '200px', maxHeight: '200px', borderRadius: '8px' }} />
                    ) : (
                        <div style={{
                            width: '100px',
                            height: '100px',
                            backgroundColor: '#e5e7eb',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '2px solid #d1d5db'
                        }}>
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="12" cy="8" r="3" fill="#9ca3af"/>
                                <path d="M12 14c-4 0-7 2-7 4v1h14v-1c0-2-3-4-7-4z" fill="#9ca3af"/>
                            </svg>
                        </div>
                    )
                )}
            </div>

            {/* Client Details / Edit Form */}
            <div style={{ margin: '20px 0' }}>
                <p>
                    <strong>ID:</strong> {client.id}
                </p>

                <div style={{ marginBottom: '10px' }}>
                    <strong>Full Name: </strong>
                    {isEditing ? (
                        <input name="fullName" value={formData.fullName || ""} onChange={handleInputChange} />
                    ) : (
                        <span>{client.fullName}</span>
                    )}
                </div>
                <div style={{ marginBottom: '10px' }}>
                    <strong>Gender: </strong>
                    {isEditing ? (
                        <select name="gender" value={formData.gender || ""} onChange={handleInputChange} style={{ padding: '5px' }}>
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                        </select>
                    ) : (
                        <span>{client.gender}</span>
                    )}
                </div>
                <div style={{ marginBottom: '10px' }}>
                    <strong>DOB: </strong>
                    {isEditing ? (
                        <input type="date" name="dob" value={formData.dob ? new Date(formData.dob).toISOString().split('T')[0] : ""} onChange={handleInputChange} />
                    ) : (
                        <span>{client.dob ? new Date(client.dob).toLocaleDateString() : "N/A"}</span>
                    )}
                </div>

                <div style={{ marginBottom: '10px' }}>
                    <strong>Email: </strong>
                    {isEditing ? (
                        <input name="email" value={formData.email || ""} onChange={handleInputChange} />
                    ) : (
                        <span>{client.email || "N/A"}</span>
                    )}
                </div>

                <div style={{ marginBottom: '10px' }}>
                    <strong>Phone: </strong>
                    {isEditing ? (
                        <input name="phoneNumber" value={formData.phoneNumber || ""} onChange={handleInputChange} />
                    ) : (
                        <span>{client.phoneNumber || "N/A"}</span>
                    )}
                </div>

                <div style={{ marginBottom: '10px' }}>
                    <strong>Address: </strong>
                    {isEditing ? (
                        <input name="address" value={formData.address || ""} onChange={handleInputChange} />
                    ) : (
                        <span>{client.address || "N/A"}</span>
                    )}
                </div>

                <div style={{ marginBottom: '10px' }}>
                    <strong>Dh - Drug History: </strong>
                    {isEditing ? (
                        <textarea
                            name="drugHistory"
                            value={formData.drugHistory || ""}
                            onChange={handleInputChange}
                            rows={4}
                            style={{ width: '100%', padding: '5px', margin: '5px 0' }}
                        />
                    ) : (
                        <span>{client.drugHistory || "NA"}</span>
                    )}
                </div>

                <div style={{ marginBottom: '10px' }}>
                    <strong>Fh - Family History: </strong>
                    {isEditing ? (
                        <textarea
                            name="familyHistory"
                            value={formData.familyHistory || ""}
                            onChange={handleInputChange}
                            rows={4}
                            style={{ width: '100%', padding: '5px', margin: '5px 0' }}
                        />
                    ) : (
                        <span>{client.familyHistory || "NA"}</span>
                    )}
                </div>

                <div style={{ marginBottom: '10px' }}>
                    <strong>Sh - Social History: </strong>
                    {isEditing ? (
                        <textarea
                            name="socialHistory"
                            value={formData.socialHistory || ""}
                            onChange={handleInputChange}
                            rows={4}
                            style={{ width: '100%', padding: '5px', margin: '5px 0' }}
                        />
                    ) : (
                        <span>{client.socialHistory || "NA"}</span>
                    )}
                </div>
            </div>

            <hr />

            {/* Visits Section */}
            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2>Medical Visits</h2>
                    <button style={{ backgroundColor: '#e0ffe0' }}>
                        <Link href={`/clients/${id}/new-visit`}>+ Add New Visit Report</Link>
                    </button>
                </div>

                {visits.length === 0 ? (
                    <p>No visits recorded.</p>
                ) : (
                    <ul>
                        {visits.map((visit) => (
                            <li key={visit.id} style={{ border: '1px solid #ccc', padding: '10px', margin: '10px 0' }}>
                                <p><strong>Date:</strong> {new Date(visit.visitDate).toLocaleDateString()}</p>
                                <p><strong>Doctor:</strong> {visit.doctorName}</p>
                                <p><strong>pc - Presenting Complaint:</strong> {visit.presentingComplaint}</p>
                                <p><strong>hpc - History of Presenting Complaint:</strong> {visit.historyOfPresentingComplaint} </p>
                                <p><strong>oe - Observation and Examination:</strong> {visit.observationAndExamination} </p>
                                <p><strong>Impression:</strong> {visit.impression} </p>
                                <p><strong>Plan:</strong> {visit.plan} </p>
                                <p><strong>Notes:</strong> {visit.notes} </p>
                                
                                {visit.attachments && visit.attachments.length > 0 && (
                                    <div style={{ marginTop: '10px' }}>
                                        <p><strong>Attachments:</strong></p>
                                        <div style={{ marginLeft: '20px' }}>
                                            {visit.attachments.map((att) => (
                                                <div key={att.id} style={{ marginBottom: '8px', fontSize: '14px' }}>
                                                    <span>{att.fileName} ({formatFileSize(att.fileSize)})</span>
                                                    {isImageFile(att.fileType) ? (
                                                        <button 
                                                            onClick={() => handleViewImage(att.id, att.fileName)}
                                                            style={{ marginLeft: '10px', padding: '2px 8px', fontSize: '12px' }}
                                                        >
                                                            View
                                                        </button>
                                                    ) : (
                                                        <button 
                                                            onClick={() => handleDownloadFile(att.id, att.fileName)}
                                                            style={{ marginLeft: '10px', padding: '2px 8px', fontSize: '12px' }}
                                                        >
                                                            Download
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Image Preview Modal */}
            {selectedImage && (
                <div 
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000
                    }}
                    onClick={() => setSelectedImage(null)}
                >
                    <div 
                        style={{
                            backgroundColor: 'white',
                            padding: '20px',
                            borderRadius: '8px',
                            maxWidth: '90%',
                            maxHeight: '90%',
                            overflow: 'auto',
                            position: 'relative'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button 
                            onClick={() => setSelectedImage(null)}
                            style={{
                                position: 'absolute',
                                top: '10px',
                                right: '10px',
                                padding: '5px 10px',
                                fontSize: '16px'
                            }}
                        >
                            ✕
                        </button>
                        <p style={{ marginTop: '30px', marginBottom: '10px', fontWeight: 'bold' }}>
                            {selectedImage.fileName}
                        </p>
                        <img 
                            src={URL.createObjectURL(selectedImage.data)}
                            alt={selectedImage.fileName}
                            style={{ maxWidth: '100%', maxHeight: '100%' }}
                        />
                    </div>
                </div>
            )}
        </main>
    );
}