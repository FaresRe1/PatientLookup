import { useState } from "react";
import type { ClientJSONType } from "~/models/client";

export function useUpdatePatient(id: string) {
  const [isSaving, setIsSaving] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  const updatePatient = async (formData: Partial<ClientJSONType>, newImage?: File | null) => {
    setIsSaving(true);
    setUpdateError(null);

    const allowedFields = [
      'fullName', 'gender', 'dob', 'email', 'phoneNumber', 
      'address', 'drugHistory', 'familyHistory', 'socialHistory'
    ];

    try {
      let res: Response;

      if (newImage) {
        const fd = new FormData();
        allowedFields.forEach(key => {
          const value = formData[key as keyof typeof formData];
          if (value !== undefined && value !== null) {
            fd.append(key, value.toString());
          }
        });
        fd.append('profileImage', newImage);

        res = await fetch(`/api/clients/${id}`, { method: "PUT", body: fd });
      } else {
        const cleanData = Object.fromEntries(
          Object.entries(formData).filter(([key]) => allowedFields.includes(key))
        );

        res = await fetch(`/api/clients/${id}`, {
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
    } catch (err: any) {
      setUpdateError(err.message);
      return { success: false };
    } finally {
      setIsSaving(false);
    }
  };

  return { updatePatient, isSaving, updateError };
}