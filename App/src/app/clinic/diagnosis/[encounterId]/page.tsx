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
  FileText,
  AlertTriangle,
  Clock,
  Pill,
  ExternalLink,
  ClipboardList,
  Microscope,
  Activity,
} from "lucide-react";
import { FormGroup } from "~/components/FormGroup";
import { getAge } from "~/lib/format";
import type { EncounterStatus } from "~/lib/encounterStatus";

interface EncounterClient {
  fullName: string;
  profileImage: string | null;
  gender: string;
  dob: string;
  village: string | null;
}

interface Encounter {
  id: string;
  status: EncounterStatus;
  createdAt: string;
  client: EncounterClient;
  // Triage
  mainComplaint: string | null;
  medicalHistory: string | null;
  currentMedications: string | null;
  allergies: string | null;
  redFlags: string | null;
  bloodPressure: string | null;
  heartRate: string | null;
  temperature: string | null;
  spO2: string | null;
  weight: string | null;
  // Examination
  examinationPerformed: string | null;
  examinationResults: string | null;
  // Diagnosis
  diagnosis: string | null;
  clinicalNotes: string | null;
  treatmentAdvice: string | null;
  prescription: string | null;
  followUpAdvice: string | null;
  referral: boolean;
  medicationNeeded: boolean;
  prescriberNotes: string | null;
}

interface DiagnosisForm {
  diagnosis: string;
  clinicalNotes: string;
  treatmentAdvice: string;
  prescription: string;
  followUpAdvice: string;
  prescriberNotes: string;
  referral: boolean;
  medicationNeeded: boolean;
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
    <div className="flex flex-col gap-0.5 bg-white rounded-xl border border-gray-100 px-3 py-2 shrink-0">
      <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">{label}</span>
      <span className="text-sm font-black text-gray-900">{value}</span>
    </div>
  );
}

function Toggle({
  label,
  description,
  checked,
  onChange,
  activeColor,
  disabled,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  activeColor: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all text-left ${
        checked
          ? `${activeColor} shadow-md`
          : "border-gray-100 bg-white hover:border-gray-200"
      } disabled:opacity-60 disabled:cursor-default`}
    >
      <div>
        <p className={`font-black text-sm ${checked ? "" : "text-gray-700"}`}>{label}</p>
        <p className={`text-xs font-medium mt-0.5 ${checked ? "opacity-80" : "text-gray-400"}`}>
          {description}
        </p>
      </div>
      <div
        className={`w-12 h-6 rounded-full transition-all relative shrink-0 ml-4 ${
          checked ? "bg-current" : "bg-gray-200"
        }`}
        style={{ color: checked ? "currentColor" : undefined }}
      >
        <div
          className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-7" : "translate-x-1"
          }`}
        />
      </div>
    </button>
  );
}

const TERMINAL_STATUSES: EncounterStatus[] = [
  "waiting_medication",
  "completed_medication_given",
  "completed_no_meds",
  "referred",
];

export default function DiagnosisFormPage() {
  const { encounterId } = useParams<{ encounterId: string }>();
  const router = useRouter();

  const [encounter, setEncounter] = useState<Encounter | null>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<DiagnosisForm>({
    diagnosis: "",
    clinicalNotes: "",
    treatmentAdvice: "",
    prescription: "",
    followUpAdvice: "",
    prescriberNotes: "",
    referral: false,
    medicationNeeded: false,
  });
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
      diagnosis: data.diagnosis ?? "",
      clinicalNotes: data.clinicalNotes ?? "",
      treatmentAdvice: data.treatmentAdvice ?? "",
      prescription: data.prescription ?? "",
      followUpAdvice: data.followUpAdvice ?? "",
      prescriberNotes: data.prescriberNotes ?? "",
      referral: data.referral,
      medicationNeeded: data.medicationNeeded,
    });
    setLoading(false);
    return data;
  }, [encounterId]);

  // Auto-start diagnosis (examination_completed → in_diagnosis)
  useEffect(() => {
    fetchEncounter().then((data) => {
      if (!data || startedRef.current) return;
      if (data.status === "examination_completed") {
        startedRef.current = true;
        fetch(`/api/encounters/${encounterId}/transition`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ newStatus: "in_diagnosis" }),
        }).then((r) => { if (r.ok) r.json().then((u) => setEncounter(u)); });
      }
    });
  }, [encounterId, fetchEncounter]);

  const setField = <K extends keyof DiagnosisForm>(key: K, val: DiagnosisForm[K]) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  const formPayload = () => {
    const payload: Record<string, unknown> = {};
    if (form.diagnosis) payload.diagnosis = form.diagnosis;
    if (form.clinicalNotes) payload.clinicalNotes = form.clinicalNotes;
    if (form.treatmentAdvice) payload.treatmentAdvice = form.treatmentAdvice;
    if (form.prescription) payload.prescription = form.prescription;
    if (form.followUpAdvice) payload.followUpAdvice = form.followUpAdvice;
    if (form.prescriberNotes) payload.prescriberNotes = form.prescriberNotes;
    payload.referral = form.referral;
    payload.medicationNeeded = form.medicationNeeded;
    return payload;
  };

  const handleSaveDraft = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/encounters/${encounterId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formPayload()),
      });
      if (!res.ok) throw new Error("Failed to save");
      setSavedAt(new Date());
    } catch {
      setError("Could not save draft. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const computeNextStatus = (): EncounterStatus => {
    if (form.referral) return "referred";
    if (form.medicationNeeded) return "waiting_medication";
    return "completed_no_meds";
  };

  const handleComplete = async () => {
    setCompleting(true);
    setError(null);
    try {
      const newStatus = computeNextStatus();
      const res = await fetch(`/api/encounters/${encounterId}/transition`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newStatus, ...formPayload() }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.msg ?? "Failed to complete");
      }
      router.push(newStatus === "waiting_medication" ? "/clinic/medication" : "/clinic");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setCompleting(false);
    }
  };

  const completeBtnLabel = () => {
    if (completing) return "Saving…";
    if (form.referral) return "Refer Patient →";
    if (form.medicationNeeded) return "Send to Medication →";
    return "Complete — No Meds →";
  };

  const completeBtnClass = () => {
    if (form.referral) return "bg-purple-600 hover:bg-purple-700 shadow-purple-500/20";
    if (form.medicationNeeded) return "bg-brand-orange hover:bg-brand-dark-orange shadow-orange-500/20";
    return "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20";
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
        <Link href="/clinic/diagnosis" className="text-brand-orange font-bold underline text-sm mt-2 inline-block">
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
        <Link href="/clinic/diagnosis" className="flex items-center gap-2 text-brand-orange hover:text-brand-dark-orange font-bold transition-colors">
          <ArrowLeft size={20} strokeWidth={3} />
          Diagnosis Queue
        </Link>
        <ChevronRight size={16} className="text-gray-300" />
        <span className="text-gray-500 font-medium text-sm truncate">{client.fullName}</span>
      </div>

      {/* Patient header */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-clean overflow-hidden">
        <div className="p-6 flex items-center gap-5">
          {client.profileImage ? (
            <img src={`data:image/jpeg;base64,${client.profileImage}`} alt={client.fullName}
              className="w-20 h-20 rounded-2xl object-cover border-2 border-gray-100 shadow shrink-0" />
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
                  Diagnosis Complete
                </span>
              ) : (
                <span className="text-xs font-black text-rose-700 bg-rose-100 px-2.5 py-1 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                  In Diagnosis
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm font-bold">{error}</div>
      )}

      {/* ── CLINICAL SUMMARY ── */}
      <section className="space-y-3">
        <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
          <ClipboardList size={14} className="text-brand-orange" />
          Clinical Summary
        </h3>

        {/* Flags — always top */}
        <div className="flex flex-col gap-2">
          {encounter.allergies && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 flex items-start gap-2">
              <AlertTriangle size={15} className="text-amber-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-black text-amber-700 uppercase tracking-widest">Allergies</p>
                <p className="text-sm text-amber-900 font-medium">{encounter.allergies}</p>
              </div>
            </div>
          )}
          {encounter.redFlags && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-3 flex items-start gap-2">
              <AlertTriangle size={15} className="text-red-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-black text-red-700 uppercase tracking-widest">Red Flags</p>
                <p className="text-sm text-red-900 font-medium">{encounter.redFlags}</p>
              </div>
            </div>
          )}
        </div>

        {/* Triage snapshot */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {encounter.mainComplaint && (
            <div className="bg-white rounded-2xl border border-gray-100 p-4">
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Chief Complaint</p>
              <p className="text-sm text-gray-800 font-medium">{encounter.mainComplaint}</p>
            </div>
          )}
          {(encounter.bloodPressure || encounter.heartRate || encounter.temperature || encounter.spO2 || encounter.weight) && (
            <div className="bg-white rounded-2xl border border-gray-100 p-4">
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Vitals</p>
              <div className="flex flex-wrap gap-2">
                <VitalChip label="BP" value={encounter.bloodPressure} />
                <VitalChip label="HR" value={encounter.heartRate} />
                <VitalChip label="Temp" value={encounter.temperature} />
                <VitalChip label="SpO₂" value={encounter.spO2} />
                <VitalChip label="Wt" value={encounter.weight} />
              </div>
            </div>
          )}
        </div>

        {/* Examination findings */}
        {encounter.examinationResults && (
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
              <Microscope size={12} />
              Examination Findings
            </p>
            <p className="text-sm text-gray-800 font-medium whitespace-pre-wrap">{encounter.examinationResults}</p>
          </div>
        )}
        {encounter.examinationPerformed && (
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Examination Performed</p>
            <p className="text-sm text-gray-700 font-medium whitespace-pre-wrap">{encounter.examinationPerformed}</p>
          </div>
        )}
      </section>

      {/* ── DIAGNOSIS FORM ── */}
      <section className="space-y-4">
        <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
          <FileText size={14} className="text-brand-orange" />
          Diagnosis &amp; Treatment
        </h3>

        <div className="bg-white rounded-3xl border border-gray-100 shadow-clean p-6 space-y-6">
          <FormGroup label="Diagnosis *" icon={<Activity size={18} />}>
            <textarea
              value={form.diagnosis}
              onChange={(e) => setField("diagnosis", e.target.value)}
              rows={2}
              placeholder="Primary diagnosis..."
              disabled={isReadOnly}
              className="form-input-styled py-3 resize-none disabled:opacity-60"
            />
          </FormGroup>
          <FormGroup label="Clinical Notes" icon={<ClipboardList size={18} />}>
            <textarea
              value={form.clinicalNotes}
              onChange={(e) => setField("clinicalNotes", e.target.value)}
              rows={3}
              placeholder="Clinical reasoning, differential diagnoses, additional notes..."
              disabled={isReadOnly}
              className="form-input-styled py-3 resize-none disabled:opacity-60"
            />
          </FormGroup>
          <FormGroup label="Treatment Advice" icon={<FileText size={18} />}>
            <textarea
              value={form.treatmentAdvice}
              onChange={(e) => setField("treatmentAdvice", e.target.value)}
              rows={3}
              placeholder="Non-pharmacological advice, lifestyle guidance, wound care..."
              disabled={isReadOnly}
              className="form-input-styled py-3 resize-none disabled:opacity-60"
            />
          </FormGroup>
          <FormGroup label="Follow-up Advice">
            <textarea
              value={form.followUpAdvice}
              onChange={(e) => setField("followUpAdvice", e.target.value)}
              rows={2}
              placeholder="When to return, warning signs to watch for..."
              disabled={isReadOnly}
              className="form-input-styled py-3 resize-none disabled:opacity-60"
            />
          </FormGroup>
        </div>
      </section>

      {/* ── PRESCRIPTION ── */}
      <section className="space-y-4">
        <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
          <Pill size={14} className="text-brand-orange" />
          Prescription
        </h3>
        <div className="bg-white rounded-3xl border border-gray-100 shadow-clean p-6 space-y-6">
          <FormGroup label="Medications &amp; Dosage" icon={<Pill size={18} />}>
            <textarea
              value={form.prescription}
              onChange={(e) => setField("prescription", e.target.value)}
              rows={4}
              placeholder={"e.g.\nAmoxicillin 500mg — 3x daily for 7 days\nParacetamol 1g — as needed, max 4x daily"}
              disabled={isReadOnly}
              className="form-input-styled py-3 resize-none font-mono text-sm disabled:opacity-60"
            />
          </FormGroup>
          <FormGroup label="Notes for Medication Team">
            <textarea
              value={form.prescriberNotes}
              onChange={(e) => setField("prescriberNotes", e.target.value)}
              rows={2}
              placeholder="Any special instructions for dispensing..."
              disabled={isReadOnly}
              className="form-input-styled py-3 resize-none disabled:opacity-60"
            />
          </FormGroup>
        </div>
      </section>

      {/* ── DISPOSITION ── */}
      <section className="space-y-4">
        <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
          <CheckCircle2 size={14} className="text-brand-orange" />
          Disposition
        </h3>
        <div className="space-y-3">
          <Toggle
            label="Medication Needed"
            description="Patient requires medication from the pharmacy team"
            checked={form.medicationNeeded}
            onChange={(v) => setField("medicationNeeded", v)}
            activeColor="border-brand-orange bg-orange-50 text-brand-dark-orange"
            disabled={isReadOnly || form.referral}
          />
          <Toggle
            label="Refer Patient"
            description="Patient needs referral to a higher facility or specialist"
            checked={form.referral}
            onChange={(v) => {
              setField("referral", v);
              if (v) setField("medicationNeeded", false);
            }}
            activeColor="border-purple-500 bg-purple-50 text-purple-700"
            disabled={isReadOnly}
          />
        </div>
        {!isReadOnly && (
          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 text-sm text-gray-500 font-medium">
            Outcome:{" "}
            <span className="font-black text-gray-900">
              {form.referral
                ? "Patient will be referred"
                : form.medicationNeeded
                  ? "Patient will collect medication"
                  : "Patient is complete — no medication needed"}
            </span>
          </div>
        )}
        {isReadOnly && (
          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 text-sm font-medium">
            <span className="text-gray-500">Final disposition: </span>
            <span className="font-black text-gray-900">
              {encounter.status === "referred"
                ? "Referred"
                : encounter.status === "waiting_medication" || encounter.status === "completed_medication_given"
                  ? "Medication prescribed"
                  : "No medication needed"}
            </span>
          </div>
        )}
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
              disabled={saving || completing || !form.diagnosis.trim()}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-white rounded-2xl font-black shadow-lg disabled:opacity-50 transition-all active:scale-95 ${completeBtnClass()}`}
            >
              {completing
                ? <Loader2 size={18} className="animate-spin" />
                : form.referral
                  ? <ExternalLink size={18} />
                  : form.medicationNeeded
                    ? <Pill size={18} />
                    : <CheckCircle2 size={18} />}
              {completeBtnLabel()}
            </button>
          </div>
          {!form.diagnosis.trim() && (
            <p className="text-center text-xs text-gray-400 font-medium mt-1">
              A diagnosis is required to complete
            </p>
          )}
        </div>
      ) : (
        <div className="flex gap-3">
          <Link href="/clinic/diagnosis" className="flex items-center gap-2 px-5 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl font-bold text-sm transition-all">
            <ArrowLeft size={16} />
            Back to Queue
          </Link>
          <Link href="/clinic" className="flex items-center gap-2 px-5 py-3 bg-brand-orange hover:bg-brand-dark-orange text-white rounded-2xl font-black text-sm shadow-md shadow-orange-500/20 transition-all">
            View Full Queue
          </Link>
        </div>
      )}
    </div>
  );
}
