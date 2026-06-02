"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Activity,
  Thermometer,
  Wind,
  Weight,
  Droplets,
  ClipboardList,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Save,
  ChevronRight,
  User,
  Clock,
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
  clientId: string;
  createdAt: string;
  client: EncounterClient;
  // Triage fields
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
  drugHistory: string | null;
  familyHistory: string | null;
  socialHistory: string | null;
}

interface TriageForm {
  bloodPressure: string;
  heartRate: string;
  temperature: string;
  spO2: string;
  weight: string;
  mainComplaint: string;
  medicalHistory: string;
  currentMedications: string;
  allergies: string;
  redFlags: string;
  drugHistory: string;
  familyHistory: string;
  socialHistory: string;
}

const EMPTY_FORM: TriageForm = {
  bloodPressure: "",
  heartRate: "",
  temperature: "",
  spO2: "",
  weight: "",
  mainComplaint: "",
  medicalHistory: "",
  currentMedications: "",
  allergies: "",
  redFlags: "",
  drugHistory: "",
  familyHistory: "",
  socialHistory: "",
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function VitalInput({
  label,
  name,
  value,
  onChange,
  placeholder,
  icon,
  disabled,
}: {
  label: string;
  name: keyof TriageForm;
  value: string;
  onChange: (name: keyof TriageForm, val: string) => void;
  placeholder: string;
  icon: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-2">
      <div className="flex items-center gap-2 text-gray-500">
        {icon}
        <label className="text-xs font-black uppercase tracking-widest text-gray-500">
          {label}
        </label>
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(name, e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full text-lg font-bold text-gray-900 bg-transparent outline-none placeholder:text-gray-300 placeholder:font-normal disabled:opacity-60"
      />
    </div>
  );
}

export default function TriageFormPage() {
  const { encounterId } = useParams<{ encounterId: string }>();
  const router = useRouter();

  const [encounter, setEncounter] = useState<Encounter | null>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<TriageForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const startedRef = useRef(false);

  const fetchEncounter = useCallback(async () => {
    const res = await fetch(`/api/encounters/${encounterId}`);
    if (!res.ok) return;
    const data: Encounter = await res.json();
    setEncounter(data);
    // Pre-fill form from saved triage data
    setForm({
      bloodPressure: data.bloodPressure ?? "",
      heartRate: data.heartRate ?? "",
      temperature: data.temperature ?? "",
      spO2: data.spO2 ?? "",
      weight: data.weight ?? "",
      mainComplaint: data.mainComplaint ?? "",
      medicalHistory: data.medicalHistory ?? "",
      currentMedications: data.currentMedications ?? "",
      allergies: data.allergies ?? "",
      redFlags: data.redFlags ?? "",
      drugHistory: data.drugHistory ?? "",
      familyHistory: data.familyHistory ?? "",
      socialHistory: data.socialHistory ?? "",
    });
    setLoading(false);
    return data;
  }, [encounterId]);

  // Auto-start triage (registered → in_triage) on mount
  useEffect(() => {
    fetchEncounter().then((data) => {
      if (!data || startedRef.current) return;
      if (data.status === "registered") {
        startedRef.current = true;
        fetch(`/api/encounters/${encounterId}/transition`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ newStatus: "in_triage" }),
        }).then((r) => {
          if (r.ok) r.json().then((updated) => setEncounter(updated));
        });
      }
    });
  }, [encounterId, fetchEncounter]);

  const updateField = (name: keyof TriageForm, val: string) => {
    setForm((prev) => ({ ...prev, [name]: val }));
  };

  const formPayload = () =>
    Object.fromEntries(
      Object.entries(form).filter(([, v]) => v.trim() !== ""),
    );

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

  const handleComplete = async () => {
    setCompleting(true);
    setError(null);
    try {
      const res = await fetch(`/api/encounters/${encounterId}/transition`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newStatus: "triage_completed", ...formPayload() }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.msg ?? "Failed to complete triage");
      }
      router.push("/clinic/triage");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setCompleting(false);
    }
  };

  const isReadOnly =
    encounter?.status === "triage_completed" ||
    encounter?.status === "in_examination" ||
    encounter?.status === "examination_completed" ||
    encounter?.status === "in_diagnosis" ||
    encounter?.status === "waiting_medication" ||
    encounter?.status === "completed_medication_given" ||
    encounter?.status === "completed_no_meds" ||
    encounter?.status === "referred";

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
        <Link href="/clinic/triage" className="text-brand-orange font-bold underline text-sm mt-2 inline-block">
          Back to Triage Queue
        </Link>
      </div>
    );
  }

  const { client } = encounter;
  const age = getAge(client.dob);

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-24 animate-in fade-in duration-500">
      {/* Nav */}
      <div className="flex items-center gap-3">
        <Link
          href="/clinic/triage"
          className="flex items-center gap-2 text-brand-orange hover:text-brand-dark-orange font-bold transition-colors"
        >
          <ArrowLeft size={20} strokeWidth={3} />
          Triage Queue
        </Link>
        <ChevronRight size={16} className="text-gray-300" />
        <span className="text-gray-500 font-medium text-sm">{client.fullName}</span>
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
              <span className="text-brand-orange font-black text-xl">
                {getInitials(client.fullName)}
              </span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-black text-gray-900">{client.fullName}</h2>
            <p className="text-gray-500 font-medium mt-0.5">
              {age} yrs &bull; {client.gender} &bull; {client.village ?? "Unknown village"}
            </p>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className="flex items-center gap-1 text-xs text-gray-400 font-medium">
                <Clock size={12} />
                Registered {formatTime(encounter.createdAt)}
              </span>
              {isReadOnly ? (
                <span className="text-xs font-black text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
                  Triage Complete
                </span>
              ) : (
                <span className="text-xs font-black text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  In Triage
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

      {/* ── VITAL SIGNS ── */}
      <section className="space-y-4">
        <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
          <Activity size={14} className="text-brand-orange" />
          Vital Signs
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <VitalInput
            label="Blood Pressure"
            name="bloodPressure"
            value={form.bloodPressure}
            onChange={updateField}
            placeholder="120/80 mmHg"
            icon={<Droplets size={15} className="text-red-400" />}
            disabled={isReadOnly}
          />
          <VitalInput
            label="Heart Rate"
            name="heartRate"
            value={form.heartRate}
            onChange={updateField}
            placeholder="72 bpm"
            icon={<Activity size={15} className="text-pink-400" />}
            disabled={isReadOnly}
          />
          <VitalInput
            label="Temperature"
            name="temperature"
            value={form.temperature}
            onChange={updateField}
            placeholder="36.8 °C"
            icon={<Thermometer size={15} className="text-orange-400" />}
            disabled={isReadOnly}
          />
          <VitalInput
            label="SpO₂"
            name="spO2"
            value={form.spO2}
            onChange={updateField}
            placeholder="98 %"
            icon={<Wind size={15} className="text-sky-400" />}
            disabled={isReadOnly}
          />
          <VitalInput
            label="Weight"
            name="weight"
            value={form.weight}
            onChange={updateField}
            placeholder="70 kg"
            icon={<Weight size={15} className="text-violet-400" />}
            disabled={isReadOnly}
          />
        </div>
      </section>

      {/* ── CLINICAL ASSESSMENT ── */}
      <section className="space-y-4">
        <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
          <ClipboardList size={14} className="text-brand-orange" />
          Clinical Assessment
        </h3>
        <div className="bg-white rounded-3xl border border-gray-100 shadow-clean p-6 space-y-6">
          <FormGroup label="Main Complaint *" icon={<User size={18} />}>
            <textarea
              value={form.mainComplaint}
              onChange={(e) => updateField("mainComplaint", e.target.value)}
              rows={3}
              placeholder="What brings the patient in today?"
              disabled={isReadOnly}
              className="form-input-styled py-3 resize-none disabled:opacity-60"
            />
          </FormGroup>
          <FormGroup label="Medical History" icon={<ClipboardList size={18} />}>
            <textarea
              value={form.medicalHistory}
              onChange={(e) => updateField("medicalHistory", e.target.value)}
              rows={3}
              placeholder="Relevant past medical history..."
              disabled={isReadOnly}
              className="form-input-styled py-3 resize-none disabled:opacity-60"
            />
          </FormGroup>
          <FormGroup label="Current Medications">
            <textarea
              value={form.currentMedications}
              onChange={(e) => updateField("currentMedications", e.target.value)}
              rows={2}
              placeholder="List all current medications and doses..."
              disabled={isReadOnly}
              className="form-input-styled py-3 resize-none disabled:opacity-60"
            />
          </FormGroup>
          <FormGroup label="Dh — Drug History">
            <textarea
              value={form.drugHistory}
              onChange={(e) => updateField("drugHistory", e.target.value)}
              rows={3}
              placeholder="Known drug allergies, past adverse reactions, controlled substances..."
              disabled={isReadOnly}
              className="form-input-styled py-3 resize-none disabled:opacity-60"
            />
          </FormGroup>
          <FormGroup label="Fh — Family History">
            <textarea
              value={form.familyHistory}
              onChange={(e) => updateField("familyHistory", e.target.value)}
              rows={3}
              placeholder="Relevant hereditary conditions in first-degree relatives..."
              disabled={isReadOnly}
              className="form-input-styled py-3 resize-none disabled:opacity-60"
            />
          </FormGroup>
          <FormGroup label="Sh — Social History">
            <textarea
              value={form.socialHistory}
              onChange={(e) => updateField("socialHistory", e.target.value)}
              rows={3}
              placeholder="Smoking, alcohol use, occupation, living situation..."
              disabled={isReadOnly}
              className="form-input-styled py-3 resize-none disabled:opacity-60"
            />
          </FormGroup>
        </div>
      </section>

      {/* ── FLAGS ── */}
      <section className="space-y-4">
        <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
          <AlertTriangle size={14} className="text-amber-500" />
          Flags &amp; Alerts
        </h3>
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6">
            <label className="text-xs font-black text-amber-700 uppercase tracking-widest mb-3 flex items-center gap-1.5 block">
              <AlertTriangle size={13} />
              Allergies
            </label>
            <textarea
              value={form.allergies}
              onChange={(e) => updateField("allergies", e.target.value)}
              rows={2}
              placeholder="Drug allergies, food allergies, latex, etc..."
              disabled={isReadOnly}
              className="w-full bg-transparent outline-none text-amber-900 font-medium placeholder:text-amber-400 resize-none disabled:opacity-60 text-sm"
            />
          </div>

          <div className="bg-red-50 border border-red-200 rounded-3xl p-6">
            <label className="text-xs font-black text-red-700 uppercase tracking-widest mb-3 flex items-center gap-1.5 block">
              <AlertTriangle size={13} />
              Red Flags
            </label>
            <textarea
              value={form.redFlags}
              onChange={(e) => updateField("redFlags", e.target.value)}
              rows={2}
              placeholder="Any urgent or life-threatening findings..."
              disabled={isReadOnly}
              className="w-full bg-transparent outline-none text-red-900 font-medium placeholder:text-red-400 resize-none disabled:opacity-60 text-sm"
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
              {completing ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <CheckCircle2 size={18} />
              )}
              {completing ? "Completing…" : "Complete Triage →"}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex gap-3">
          <Link
            href="/clinic/triage"
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
