import { useState } from "react";
import type { PatientJSON } from "~/models/patient";

const ALLOWED_FIELDS = [
  "fullName",
  "gender",
  "dob",
  "phoneNumber",
  "village",
] as const;

export function useUpdatePatient(id: string) {
  const [isSaving, setIsSaving] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  const updatePatient = async (
    formData: Partial<PatientJSON>,
    newImage?: File | null,
  ) => {
    setIsSaving(true);
    setUpdateError(null);

    try {
      let res: Response;

      if (newImage) {
        const fd = new FormData();
        ALLOWED_FIELDS.forEach((key) => {
          const value = formData[key];
          if (value !== undefined && value !== null) {
            fd.append(key, value.toString());
          }
        });
        fd.append("profileImage", newImage);
        res = await fetch(`/api/patients/${id}`, { method: "PUT", body: fd });
      } else {
        const cleanData = Object.fromEntries(
          Object.entries(formData).filter(([key]) =>
            (ALLOWED_FIELDS as readonly string[]).includes(key),
          ),
        );
        res = await fetch(`/api/patients/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(cleanData),
        });
      }

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.msg || "Server rejected the update.");
      }

      const data = await res.json();
      return { success: true, details: data.details || data };
    } catch (err: unknown) {
      setUpdateError(err instanceof Error ? err.message : "Unknown error");
      return { success: false };
    } finally {
      setIsSaving(false);
    }
  };

  return { updatePatient, isSaving, updateError };
}
