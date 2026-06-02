"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ChevronRight,
  CheckCircle2,
  Loader2,
  Save,
  Microscope,
  AlertTriangle,
  Clock,
  Activity,
  Thermometer,
  Wind,
  Weight,
  Droplets,
  ClipboardList,
} from "lucide-react";
import { getAge } from "~/lib/format";
import type { EncounterStatus } from "~/lib/encounterStatus";

interface EncounterClient {
  fullName: string;
  profileImage: string | null;
  gender: string;
  dob: string;
  village: string | null;
  drugHistory?: string;
}

interface Encounter {
  id: string;
  status: EncounterStatus;
  createdAt: string;
  client: EncounterClient;
  // Triage (read-only reference)
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
}

interface ExamForm {
  examinationPerformed: string;
  examinationResults: string;
}

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
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

const TERMINAL_STATUSES: EncounterStatus[] = [
  "examination_completed",
  "in_diagnosis",
  "waiting_medication",
  "completed_medication_given",
  "completed_no_meds",
  "referred",
];

export default function ExaminationFormPage() {
  const { encounterId } = useParams<{ encounterId: string }>();
  const router = useRouter();

  const [encounter, setEncounter] = useState<Encounter | null>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<ExamForm>({ examinationPerformed: "", examinationResults: "" });
  const [saving, setSaving] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const startedRef = useRef(false);

  const fetchEncounter = useCallback(async () => {
    const res = await fetch(`/api/encounters/${encounterId}`);
    if (!res.ok) return null;
    const data: Encounter = await res.json();
    setEncounter(data);
    setForm({
      examinationPerformed: data.examinationPerformed ?? "",
      examinationResults: data.examinationResults ?? "",
    });
    setLoading(false);
    return data;
  }, [encounterId]);

  // Auto-start examination (triage_completed → in_examination)
  useEffect(() => {
    fetchEncounter().then((data) => {
      if (!data || startedRef.current) return;
      if (data.status === "triage_completed") {
        startedRef.current = true;
        fetch(`/api/encounters/${encounterId}/transition`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ newStatus: "in_examination" }),
        }).then((r) => { if (r.ok) r.json().then((u) => setEncounter(u)); });
      }
    });
  }, [encounterId, fetchEncounter]);

  const handleSaveDraft = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/encounters/${encounterId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          examinationPerformed: form.examinationPerformed || undefined,
          examinationResults: form.examinationResults || undefined,
        }),
      });
      if (!res.ok) throw new Error("Failed to save");
      setSavedAt(new Date());
    } catch {
      setError("Could not save draft. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleComplete = async () => {
    setCompleting(true);
    setError(null);
    try {
      const res = await fetch(`/api/encounters/${encounterId}/transition`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newStatus: "examination_completed",
          examinationPerformed: form.examinationPerformed || undefined,
          examinationResults: form.examinationResults || undefined,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.msg ?? "Failed to complete examination");
      }
      router.push("/clinic/examination");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setCompleting(false);
    }
  };

  const isReadOnly = encounter ? TERMINAL_STATUSES.includes(encounter.status) : false;

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
        <Link href="/clinic/examination" className="text-brand-orange font-bold underline text-sm mt-2 inline-block">
          Back to Queue
        </Link>
      </div>
    );
  }

  const { client } = encounter;

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-24 animate-in fade-in duration-500">
      {/* Nav */}
      <div className="flex items-center gap-3">
        <Link
          href="/clinic/examination"
          className="flex items-center gap-2 text-brand-orange hover:text-brand-dark-orange font-bold transition-colors"
        >
          <ArrowLeft size={20} strokeWidth={3} />
          Examination Queue
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
              {isReadOnly ? (
                <span className="text-xs font-black text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
                  Examination Complete
                </span>
              ) : (
                <span className="text-xs font-black text-indigo-700 bg-indigo-100 px-2.5 py-1 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                  In Examination
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

      {/* ── TRIAGE SUMMARY ── */}
      <section className="space-y-4">
        <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
          <ClipboardList size={14} className="text-brand-orange" />
          Triage Summary
        </h3>

        {encounter.mainComplaint && (
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">
              Chief Complaint
            </p>
            <p className="text-gray-900 font-medium">{encounter.mainComplaint}</p>
          </div>
        )}

        {/* Vitals chips */}
        {(encounter.bloodPressure || encounter.heartRate || encounter.temperature || encounter.spO2 || encounter.weight) && (
          <div className="flex flex-wrap gap-2">
            <VitalChip label="BP" value={encounter.bloodPressure} />
            <VitalChip label="HR" value={encounter.heartRate} />
            <VitalChip label="Temp" value={encounter.temperature} />
            <VitalChip label="SpO₂" value={encounter.spO2} />
            <VitalChip label="Weight" value={encounter.weight} />
          </div>
        )}

        {/* Medical history & meds */}
        {(encounter.medicalHistory || encounter.currentMedications) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {encounter.medicalHistory && (
              <div className="bg-white rounded-2xl border border-gray-100 p-4">
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Medical History</p>
                <p className="text-sm text-gray-700 font-medium whitespace-pre-wrap">{encounter.medicalHistory}</p>
              </div>
            )}
            {encounter.currentMedications && (
              <div className="bg-white rounded-2xl border border-gray-100 p-4">
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Current Medications</p>
                <p className="text-sm text-gray-700 font-medium whitespace-pre-wrap">{encounter.currentMedications}</p>
              </div>
            )}
          </div>
        )}

        {/* Flags */}
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

        {!encounter.mainComplaint && !encounter.bloodPressure && !encounter.heartRate && (
          <p className="text-sm text-gray-400 font-medium italic">No triage data recorded.</p>
        )}
      </section>

      {/* ── EXAMINATION FORM ── */}
      <section className="space-y-4">
        <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
          <Microscope size={14} className="text-brand-orange" />
          Examination
        </h3>

        <div className="bg-white rounded-3xl border border-gray-100 shadow-clean p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-black text-gray-700 ml-1 block">
              Examination Performed
            </label>
            <p className="text-xs text-gray-400 font-medium ml-1 -mt-1">
              What physical examination or tests were conducted?
            </p>
            <textarea
              value={form.examinationPerformed}
              onChange={(e) => setForm((prev) => ({ ...prev, examinationPerformed: e.target.value }))}
              rows={5}
              placeholder="e.g. Cardiovascular examination, respiratory auscultation, abdominal palpation, ECG, blood glucose..."
              disabled={isReadOnly}
              className="form-input-styled py-3 resize-none disabled:opacity-60"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-black text-gray-700 ml-1 block">
              Examination Results
            </label>
            <p className="text-xs text-gray-400 font-medium ml-1 -mt-1">
              Clinical findings from the examination.
            </p>
            <textarea
              value={form.examinationResults}
              onChange={(e) => setForm((prev) => ({ ...prev, examinationResults: e.target.value }))}
              rows={5}
              placeholder="e.g. Heart sounds normal, no murmurs. Chest clear bilaterally. Abdomen soft, mild epigastric tenderness..."
              disabled={isReadOnly}
              className="form-input-styled py-3 resize-none disabled:opacity-60"
            />
          </div>
        </div>
      </section>

      {/* ── ACTIONS ── */}
      {!isReadOnly ? (
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-gray-100 p-4">
          <div className="max-w-3xl mx-auto flex items-center gap-3">
            {savedAt && (
              <span className="text-xs text-gray-400 font-medium hidden sm:block">
                Saved {savedAt.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
              </span>
            )}
            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={saving || completing}
              className="flex items-center gap-2 px-5 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl font-black text-sm disabled:opacity-50 transition-all"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Save Draft
            </button>
            <button
              type="button"
              onClick={handleComplete}
              disabled={saving || completing}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-brand-orange hover:bg-brand-dark-orange text-white rounded-2xl font-black shadow-lg shadow-orange-500/20 disabled:opacity-50 transition-all active:scale-95"
            >
              {completing ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
              {completing ? "Completing…" : "Complete Examination →"}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex gap-3">
          <Link
            href="/clinic/examination"
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
