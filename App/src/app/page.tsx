"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

type Client = {
  id: string;
  fullName: string;
  email?: string;
  phoneNumber?: string;
  address?: string;
  notes?: string;
};

export default function Home() {
  const [clients, setClients] = useState<Client[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const timer = setTimeout(async () => {
      setIsLoading(true);
      setError(null);

      const url = searchTerm.trim()
        ? `/api/clients/search?query=${encodeURIComponent(searchTerm.trim())}`
        : "/api/clients";

      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to load clients.");

        const data = await res.json();
        const clientList = searchTerm.trim() ? data : data.clients;
        setClients(clientList || []);
      } catch (err: any) {
        setError(err.message);
        setClients([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);


  return (
    <main>
      <h1>Client Management Application</h1>
      <div>
        <button>
          <Link href="/add-client">Add New Client</Link>
        </button>

        <div style={{ margin: '20px 0' }}>
          <input
            type="text"
            placeholder="Search clients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ padding: '8px', width: '300px', border: '1px solid #ccc' }}
          />
        </div>

        <h2>Existing Clients</h2>
        {error && <p style={{ color: "red" }}>{error}</p>}
        {clients.length > 0 ? (
          <ul>
            {clients.map((client) => (
              <li key={client.id}>
                <Link href={`/clients/${client.id}`} style={{ textDecoration: 'underline', color: 'blue' }}>
                  <strong>{client.fullName}</strong> - {client.email || "No email"}
                </Link>

              </li>
            ))}
          </ul>
        ) : (
          <p>No clients found.</p>
        )}
      </div>
    </main>
  );
}
