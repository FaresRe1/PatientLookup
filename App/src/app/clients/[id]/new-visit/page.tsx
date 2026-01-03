"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

type Client = {
  id: string;
  fullName: string;
  gender: string;
  dob: string;
};

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

  const getAge = (dobString: string | null) => {
    if (!dobString) return "N/A";
    const dob = new Date(dobString);
    const diff_ms = Date.now() - dob.getTime();
    const age_dt = new Date(diff_ms);
    return Math.abs(age_dt.getUTCFullYear() - 1970);
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

      router.push(`/clients/${id}`);
    } catch (err: any) {
      alert(err.message);
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
        <p>(No documents attached)</p>
        <button onClick={() => alert("Template feature coming soon")}>
            Add Document
        </button>
      </div>

      <hr />

      <div style={{ marginTop: "20px" }}>
        <button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Visit Record"}
        </button>
      </div>

    </main>
  );
}