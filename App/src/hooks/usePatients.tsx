import { useState, useEffect } from "react";
import type { ClientJSONType } from "~/models/client";

type Client = ClientJSONType;

export function usePatients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Debounce the API call by 300ms to avoid spamming the server
    const timer = setTimeout(async () => {
      setIsLoading(true);
      setError(null);

      const url = searchTerm.trim()
        ? `/api/clients/search?query=${encodeURIComponent(searchTerm.trim())}`
        : "/api/clients";

      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to load patients.");

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

  return {
    clients,
    searchTerm,
    setSearchTerm,
    isLoading,
    error,
  };
}