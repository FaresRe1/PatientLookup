"use client";
import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ChevronRight,
  CheckCircle2,
  Loader2,
  Pill,
  AlertTriangle,
  Clock,
  ClipboardList,
  Microscope,
  FileText,
  Activity,
} from "lucide-react";
import { getAge } from "~/lib/format";
import type { EncounterStatus } from "~/lib/encounterStatus";

interface EncounterClient {
  fullName: string;
  profileImage: string | null;
  gender: string;
  dob: string;
  village: string | null;
  drugHistory?: string | null;
}

interface Encounter {
  id: string;
  status: EncounterStatus;
  createdAt: string;
  client: EncounterClient;
  // Triage
  bloodPressure: string | null;
  heartRate: string | null;
  temperature: string | null;
  spO2: string | null;
  weight: string | null;
  mainComplaint: string | null;
  medicalHistory: string | null;
  currentMedications: string | null;
  allergies: string | null;
  redFlags: string | null;
  // Examination
  examinationPerformed: string | null;
  examinationResults: string | null;
  // Diagnosis
  diagnosis: string | null;
  clinicalNotes: string | null;
  prescription: string | null;
  prescriberNotes: string | null;
  treatmentAdvice: string | null;
  followUpAdvice: string | null;
  medicationGivenAt: string | null;
}

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4">
      <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-sm text-gray-800 font-medium whitespace-pre-wrap">{value}</p>
    </div>
  );
}

function VitalChip({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div className="flex flex-col gap-0.5 bg-white rounded-xl border border-gray-100 px-3 py-2">
      <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">{label}</span>
      <span className="text-sm font-black text-gray-900">{value}</span>
    </div>
  );
}

export default function MedicationDetailPage() {
  const { encounterId } = useParams<{ encounterId: string }>();
  const router = useRouter();

  const [encounter, setEncounter] = useState<Encounter | null>(null);
  const [loading, setLoading] = useState(true);
  const [dispensing, setDispensing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEncounter = useCallback(async () => {
    const res = await fetch(`/api/encounters/${encounterId}`);
    if (!res.ok) return;
    setEncounter(await res.json());
    setLoading(false);
  }, [encounterId]);

  useEffect(() => { fetchEncounter(); }, [fetchEncounter]);

  const handleGiven = async () => {
    setDispensing(true);
    setError(null);
    try {
      const res = await fetch(`/api/encounters/${encounterId}/transition`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newStatus: "completed_medication_given" }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.msg ?? "Failed to mark medication given");
      }
      router.push("/clinic/medication");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setDispensing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="animate-spin text-brand-orange" size={32} />
      </div>
    );
  }

  if (!encounter) {
    return (
      <div className="text-center py-20">
        <p className="font-black text-gray-500">Encounter not found.</p>
        <Link href="/clinic/medication" className="text-brand-orange font-bold underline text-sm mt-2 inline-block">
          Back to Queue
        </Link>
      </div>
    );
  }

  const { client } = encounter;
  const isCompleted = encounter.status === "completed_medication_given";

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-24 animate-in fade-in duration-500">
      {/* Nav */}
      <div className="flex items-center gap-3">
        <Link
          href="/clinic/medication"
          className="flex items-center gap-2 text-brand-orange hover:text-brand-dark-orange font-bold transition-colors"
        >
          <ArrowLeft size={20} strokeWidth={3} />
          Medication Queue
        </Link>
        <ChevronRight size={16} className="text-gray-300" />
        <span className="text-gray-500 font-medium text-sm truncate">{client.fullName}</span>
      </div>

      {/* Patient header */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-clean overflow-hidden">
        <div className="p-6 flex items-center gap-5">
          {client.profileImage ? (
            <img
              src={`data:image/jpeg;base64,${client.profileImage}`}
              alt={client.fullName}
              className="w-20 h-20 rounded-2xl object-cover border-2 border-gray-100 shadow shrink-0"
            />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-orange-100 flex items-center justify-center shrink-0">
              <span className="text-brand-orange font-black text-xl">{getInitials(client.fullName)}</span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-black text-gray-900">{client.fullName}</h2>
            <p className="text-gray-500 font-medium mt-0.5">
              {getAge(client.dob)} yrs &bull; {client.gender} &bull; {client.village ?? "Unknown village"}
            </p>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className="flex items-center gap-1 text-xs text-gray-400 font-medium">
                <Clock size={12} />
                Registered {formatTime(encounter.createdAt)}
              </span>
              {isCompleted ? (
                <span className="text-xs font-black text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full flex items-center gap-1">
                  <CheckCircle2 size={11} />
                  Medication Given {encounter.medicationGivenAt ? `at ${formatTime(encounter.medicationGivenAt)}` : ""}
                </span>
              ) : (
                <span className="text-xs font-black text-orange-700 bg-orange-100 px-2.5 py-1 rounded-full flex items-center gap-1">
                  <Pill size={11} />
                  Awaiting Medication
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm font-bold">
          {error}
        </div>
      )}

      {/* Allergy + red flag banners */}
      <div className="flex flex-col gap-3">
        {encounter.allergies && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
            <AlertTriangle size={16} className="text-amber-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-black text-amber-700 uppercase tracking-widest mb-0.5">Allergies</p>
              <p className="text-sm text-amber-900 font-medium">{encounter.allergies}</p>
            </div>
          </div>
        )}
        {encounter.redFlags && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
            <AlertTriangle size={16} className="text-red-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-black text-red-700 uppercase tracking-widest mb-0.5">Red Flags</p>
              <p className="text-sm text-red-900 font-medium">{encounter.redFlags}</p>
            </div>
          </div>
        )}
      </div>

      {/* Prescription card — most prominent */}
      <section className="space-y-4">
        <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
          <Pill size={14} className="text-brand-orange" />
          Prescription
        </h3>

        <div className="bg-white rounded-3xl border border-orange-200 shadow-clean p-6 space-y-5">
          {encounter.diagnosis && (
            <div>
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Diagnosis</p>
              <p className="text-lg font-black text-gray-900">{encounter.diagnosis}</p>
            </div>
          )}

          {encounter.prescription ? (
            <div>
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Prescription</p>
              <pre className="text-sm text-gray-900 font-mono whitespace-pre-wrap leading-relaxed bg-orange-50/60 rounded-2xl border border-orange-100 px-4 py-4 text-base">
                {encounter.prescription}
              </pre>
            </div>
          ) : (
            <p className="text-sm text-gray-400 font-medium italic">No prescription recorded.</p>
          )}

          {encounter.prescriberNotes && (
            <div>
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Prescriber Notes</p>
              <p className="text-sm text-gray-700 font-medium bg-gray-50 rounded-xl px-3 py-2">{encounter.prescriberNotes}</p>
            </div>
          )}

          {(encounter.treatmentAdvice || encounter.followUpAdvice) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              {encounter.treatmentAdvice && (
                <div className="bg-sky-50 rounded-xl border border-sky-100 p-3">
                  <p className="text-xs font-black text-sky-700 uppercase tracking-widest mb-1">Treatment Advice</p>
                  <p className="text-sm text-sky-900 font-medium">{encounter.treatmentAdvice}</p>
                </div>
              )}
              {encounter.followUpAdvice && (
                <div className="bg-violet-50 rounded-xl border border-violet-100 p-3">
                  <p className="text-xs font-black text-violet-700 uppercase tracking-widest mb-1">Follow-up</p>
                  <p className="text-sm text-violet-900 font-medium">{encounter.followUpAdvice}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Clinical history — collapsible context */}
      <section className="space-y-4">
        <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
          <ClipboardList size={14} className="text-brand-orange" />
          Clinical Summary
        </h3>

        <div className="space-y-3">
          {encounter.mainComplaint && <InfoBlock label="Chief Complaint" value={encounter.mainComplaint} />}

          {(encounter.bloodPressure || encounter.heartRate || encounter.temperature || encounter.spO2 || encounter.weight) && (
            <div className="flex flex-wrap gap-2">
              <VitalChip label="BP" value={encounter.bloodPressure} />
              <VitalChip label="HR" value={encounter.heartRate} />
              <VitalChip label="Temp" value={encounter.temperature} />
              <VitalChip label="SpO₂" value={encounter.spO2} />
              <VitalChip label="Weight" value={encounter.weight} />
            </div>
          )}

          {encounter.currentMedications && (
            <InfoBlock label="Current Medications" value={encounter.currentMedications} />
          )}

          {encounter.examinationResults && (
            <InfoBlock label="Examination Findings" value={encounter.examinationResults} />
          )}

          {encounter.clinicalNotes && (
            <InfoBlock label="Clinical Notes" value={encounter.clinicalNotes} />
          )}
        </div>
      </section>

      {/* Action */}
      {!isCompleted ? (
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-gray-100 p-4">
          <div className="max-w-3xl mx-auto flex items-center gap-3">
            <Link
              href="/clinic/medication"
              className="flex items-center gap-2 px-5 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl font-black text-sm transition-all"
            >
              <ArrowLeft size={16} />
              Back
            </Link>
            <button
              type="button"
              onClick={handleGiven}
              disabled={dispensing}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-black shadow-lg shadow-emerald-500/20 disabled:opacity-50 transition-all active:scale-95"
            >
              {dispensing ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
              {dispensing ? "Marking…" : "Medication Given ✓"}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex gap-3">
          <Link
            href="/clinic/medication"
            className="flex items-center gap-2 px-5 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl font-bold text-sm transition-all"
          >
            <ArrowLeft size={16} />
            Back to Queue
          </Link>
          <Link
            href="/clinic"
            className="flex items-center gap-2 px-5 py-3 bg-brand-orange hover:bg-brand-dark-orange text-white rounded-2xl font-black text-sm shadow-md shadow-orange-500/20 transition-all"
          >
            View Full Queue
          </Link>
        </div>
      )}
    </div>
  );
}
