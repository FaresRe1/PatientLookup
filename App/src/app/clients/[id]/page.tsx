"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

// This ensures the page works with both static and dynamic rendering
export const dynamic = 'force-dynamic';


type Client = {
    id: string;
    fullName: string;
    email?: string;
    phoneNumber?: string;
    address?: string;
    notes?: string;
};

export default function ClientDetails() {
    const params = useParams();
    const { id } = params;

    const [client, setClient] = useState<Client | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchClient = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const res = await fetch(`/api/clients/${id}`);
                if (!res.ok) throw new Error("Failed to load client details.");
                const data = await res.json();
                setClient(data.details || null);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchClient();
    }, [id]);

    if (isLoading) return <p>Loading client details...</p>;
    if (error) return <p style={{ color: "red" }}>{error}</p>;
    if (!client) return <p>Client not found.</p>;

    return (
        <>
            <main>
                <h1>{client.fullName}</h1>
                <p><strong>Email:</strong> {client.email || "N/A"}</p>
                <p><strong>Phone:</strong> {client.phoneNumber || "N/A"}</p>
                <p><strong>Address:</strong> {client.address || "N/A"}</p>
                <p><strong>Notes:</strong> {client.notes || "N/A"}</p>
            </main>

            <button>
                <Link href="/">Back to Client List</Link>
            </button>
        </>
    );
}
