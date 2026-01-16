"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

import type { ClientJSONType } from "~/models/client";
import type { AttachmentType } from "~/models/attachment";

type Client = Pick<ClientJSONType, 'id' | 'fullName' | 'gender' | 'dob'>;

export default function NewVisitPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;

  const [client, setClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [visitDate, setVisitDate] = useState(new Date().toISOString().split('T')[0]); 
  const [doctorName, setDoctorName] = useState("");
  const [notes, setNotes] = useState("");
  
  const [visitId, setVisitId] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<AttachmentType[]>([]);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [visitSavedMessage, setVisitSavedMessage] = useState(false);
  
  useEffect(() => {
    const fetchClient = async () => {
      try {
        const res = await fetch(`/api/clients/${id}`);
        if (!res.ok) throw new Error("Failed");
        const data = await res.json();
        setClient(data.details || data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    if (id) fetchClient();
  }, [id]);

  const getAge = (dobString?: string | null) => {
    if (!dobString) return "N/A";
    const dob = new Date(dobString);
    const diff_ms = Date.now() - dob.getTime();
    const age_dt = new Date(diff_ms);
    return Math.abs(age_dt.getUTCFullYear() - 1970);
  };

  const handleFileUpload = async (file: File) => {
    if (!visitId) {
      alert("Please save the visit first before uploading files");
      return;
    }

    setIsUploadingFile(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("visitId", visitId);

      const res = await fetch("/api/attachments", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to upload file");

      const newAttachment = await res.json();
      setAttachments([newAttachment, ...attachments]);
    } catch (err: any) {
      alert(err.message || "Failed to upload file");
    } finally {
      setIsUploadingFile(false);
    }
  };

  const handleDeleteAttachment = async (attachmentId: string) => {
    if (!confirm("Delete this attachment?")) return;

    try {
      const res = await fetch(`/api/attachments/${attachmentId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete attachment");

      setAttachments(attachments.filter(a => a.id !== attachmentId));
    } catch (err: any) {
      alert(err.message || "Failed to delete attachment");
    }
  };

  const fetchAttachments = async () => {
    if (!visitId) return;
    try {
      const res = await fetch(`/api/attachments?visitId=${visitId}`);
      if (!res.ok) throw new Error("Failed to load attachments");
      const data = await res.json();
      setAttachments(data);
    } catch (err) {
      console.error(err);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  const handleSave = async () => {
    if (!doctorName) {
      alert("Please enter who saw the patient.");
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch("/api/visits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: id,
          doctorName: doctorName,
          notes: notes,
          visitDate: visitDate,
        }),
      });

      if (!res.ok) throw new Error("Failed to save visit");

      const savedVisit = await res.json();
      setVisitId(savedVisit.id);
      setAttachments([]);
      setVisitSavedMessage(true);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <p>Loading...</p>;
  if (!client) return <p>Client not found</p>;

  return (
    <main style={{ padding: "20px" }}>
      
      {/* --- TOP NAV --- */}
      <div style={{ marginBottom: "20px" }}>
        <button>
            <Link href={`/clients/${id}`}>&lt; Back</Link>
        </button>
      </div>

      {/* --- HEADER --- */}
      <h1>New Visit</h1>
      <p>
        <strong>Patient:</strong> {client.fullName} ({client.gender}, {getAge(client.dob)} y/o)
      </p>
      
      <hr />

      {/* --- FORM FIELDS --- */}
      
      <div style={{ margin: "20px 0" }}>
        <p><strong>Visit Date:</strong></p>
        <input 
            type="date" 
            value={visitDate}
            onChange={(e) => setVisitDate(e.target.value)}
        />
      </div>

      <div style={{ margin: "20px 0" }}>
        <p><strong>Seen By:</strong></p>
        <input 
            type="text" 
            value={doctorName}
            onChange={(e) => setDoctorName(e.target.value)}
            style={{ width: "300px" }}
        />
      </div>

      <div style={{ margin: "20px 0" }}>
        <p><strong>Notes:</strong></p>
        <textarea 
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={5}
            style={{ width: "100%", maxWidth: "500px" }}
        />
      </div>

      <div style={{ margin: "20px 0" }}>
        <p><strong>Documents:</strong></p>
        <button onClick={() => alert("Template feature coming soon")}>
          Add from Template
        </button>
        <p>
          <input 
            type="file" 
            accept="image/*,.png,.jpg,.jpeg"
            onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
            disabled={isUploadingFile || !visitId}
            style={{ marginRight: "10px" }}
          />
          <span style={{ fontSize: "14px", color: "#666" }}>Add Image</span>
        </p>
        <p>
          <input 
            type="file" 
            accept=".pdf,.doc,.docx,.xlsx,.xls"
            onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
            disabled={isUploadingFile || !visitId}
            style={{ marginRight: "10px" }}
          />
          <span style={{ fontSize: "14px", color: "#666" }}>Add Document</span>
        </p>

        {attachments.length > 0 && (
          <div style={{ marginTop: "15px" }}>
            <p><strong>Attached Files:</strong></p>
            <ul style={{ marginLeft: "20px" }}>
              {attachments.map((att) => (
                <li key={att.id} style={{ marginBottom: "8px", fontSize: "14px" }}>
                  <span>{att.fileName} ({formatFileSize(att.fileSize)})</span>
                  <button 
                    onClick={() => handleDeleteAttachment(att.id)}
                    style={{ marginLeft: "10px", padding: "2px 8px", fontSize: "12px" }}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <hr />

      {visitSavedMessage && (
        <p style={{ color: "green", marginBottom: "15px" }}>
          ✓ Visit saved! You can now upload files or click Done to return.
        </p>
      )}

      <div style={{ marginTop: "20px" }}>
        {visitId ? (
          <button onClick={() => router.push(`/clients/${id}`)}>Done</button>
        ) : (
          <button onClick={handleSave} disabled={isSaving || isUploadingFile}>
              {isSaving ? "Saving..." : "Save Visit Record"}
          </button>
        )}
      </div>

    </main>
  );
}