"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

export const dynamic = 'force-dynamic';

type Client = {
    id: string;
    fullName: string;
    gender: string;
    dob: string; 
    email?: string | null;
    phoneNumber?: string | null;
    address?: string | null;
    createdAt: string;
    updatedAt: string;
};

type Visit = {
    id: string;
    visitDate: string;
    doctorName: string;
    notes: string;
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
                        setVisits(visitData);
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

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const res = await fetch(`/api/clients/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (!res.ok) throw new Error("Failed to update.");
            
            setClient({ ...client!, ...formData } as Client);
            setIsEditing(false);
        } catch (err: any) {
            alert(err.message);
        } finally {
            setIsSaving(false);
        }
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
                    <button onClick={() => { setIsEditing(false); setFormData(client); }}>
                        Cancel
                    </button>
                )}
            </div>

            <hr />

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
                                <p><strong>Notes:</strong> {visit.notes}</p>
                                {/* TODO: Add documents*/}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </main>
    );
}