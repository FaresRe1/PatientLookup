import { useState, useEffect } from "react";
import type { PatientJSON } from "~/models/patient";

export function usePatients() {
  const [patients, setPatients] = useState<PatientJSON[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      setIsLoading(true);
      setError(null);

      const url = searchTerm.trim()
        ? `/api/patients/search?query=${encodeURIComponent(searchTerm.trim())}`
        : "/api/patients";

      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to load patients.");
        const data = await res.json();
        setPatients(data ?? []);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Unknown error");
        setPatients([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  return { patients, searchTerm, setSearchTerm, isLoading, error };
}
