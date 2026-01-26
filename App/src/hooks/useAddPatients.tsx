import { useState } from "react";

export function useAddPatient() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const savePatient = async (formData: FormData) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/clients", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Failed to save patient.");
      const data = await res.json();
      return { success: true, id: data.newClient.id };
    } catch (err: any) {
      setError(err.message);
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  return { savePatient, isLoading, error };
}