"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  RefreshCw,
  Users,
  Clock,
  ChevronRight,
  AlertTriangle,
  Pill,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { getAge } from "~/lib/format";
import type { EncounterStatus } from "~/lib/encounterStatus";

interface EncounterClient {
  fullName: string;
  profileImage: string | null;
  gender: string;
  dob: string;
  village: string | null;
}

interface EncounterRow {
  id: string;
  status: EncounterStatus;
  createdAt: string;
  mainComplaint: string | null;
  allergies: string | null;
  redFlags: string | null;
  diagnosis: string | null;
  prescription: string | null;
  prescriberNotes: string | null;
  treatmentAdvice: string | null;
  client: EncounterClient;
}

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

function formatElapsed(iso: string) {
  const ms = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(ms / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  return `${hrs}h ${mins % 60}m`;
}

function MedicationCard({ encounter, onGiven }: { encounter: EncounterRow; onGiven: (id: string) => void }) {
  const { client } = encounter;
  const [dispensing, setDispensing] = useState(false);

  const handleGiven = async (e: React.MouseEvent) => {
    e.preventDefault();
    setDispensing(true);
    try {
      await fetch(`/api/encounters/${encounter.id}/transition`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newStatus: "completed_medication_given" }),
      });
      onGiven(encounter.id);
    } finally {
      setDispensing(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-orange-100 overflow-hidden shadow-clean">
      {/* Patient header */}
      <Link
        href={`/clinic/medication/${encounter.id}`}
        className="flex items-center gap-4 p-4 hover:bg-orange-50/40 transition-colors group"
      >
        {client.profileImage ? (
          <img
            src={`data:image/jpeg;base64,${client.profileImage}`}
            alt={client.fullName}
            className="w-14 h-14 rounded-xl object-cover shrink-0 border-2 border-white shadow"
          />
        ) : (
          <div className="w-14 h-14 rounded-xl bg-orange-100 flex items-center justify-center shrink-0">
            <span className="text-brand-orange font-black text-base">{getInitials(client.fullName)}</span>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-black text-gray-900 text-base">{client.fullName}</p>
            <span className="text-xs font-black text-orange-700 bg-orange-100 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Pill size={10} />
              Awaiting Meds
            </span>
          </div>
          <p className="text-sm text-gray-500 font-medium mt-0.5">
            {client.village ?? "Unknown village"} &bull; {getAge(client.dob)} yrs &bull; {client.gender}
          </p>
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            <span className="flex items-center gap-1 text-xs text-gray-400 font-medium">
              <Clock size={12} />
              {formatElapsed(encounter.createdAt)}
            </span>
            {encounter.allergies && (
              <span className="flex items-center gap-1 text-xs text-amber-600 font-bold">
                <AlertTriangle size={12} />
                Allergies
              </span>
            )}
            {encounter.redFlags && (
              <span className="flex items-center gap-1 text-xs text-red-600 font-bold">
                <AlertTriangle size={12} />
                Red flags
              </span>
            )}
          </div>
        </div>
        <ChevronRight size={18} className="text-gray-300 group-hover:text-brand-orange transition-colors shrink-0" />
      </Link>

      {/* Prescription panel */}
      <div className="border-t border-orange-100 px-4 py-3 space-y-2 bg-orange-50/30">
        {encounter.diagnosis && (
          <div>
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-0.5">Diagnosis</p>
            <p className="text-sm text-gray-800 font-bold">{encounter.diagnosis}</p>
          </div>
        )}

        {encounter.prescription ? (
          <div>
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-0.5">Prescription</p>
            <pre className="text-sm text-gray-800 font-mono whitespace-pre-wrap leading-relaxed bg-white rounded-xl border border-orange-100 px-3 py-2">
              {encounter.prescription}
            </pre>
          </div>
        ) : (
          <p className="text-sm text-gray-400 font-medium italic">No prescription recorded.</p>
        )}

        {encounter.prescriberNotes && (
          <div>
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-0.5">Prescriber Notes</p>
            <p className="text-sm text-gray-600 font-medium">{encounter.prescriberNotes}</p>
          </div>
        )}

        {encounter.allergies && (
          <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
            <AlertTriangle size={14} className="text-amber-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-black text-amber-700 uppercase tracking-widest">Allergies</p>
              <p className="text-xs text-amber-900 font-medium">{encounter.allergies}</p>
            </div>
          </div>
        )}
      </div>

      {/* Action */}
      <div className="px-4 py-3 border-t border-orange-100 flex justify-end">
        <button
          onClick={handleGiven}
          disabled={dispensing}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black text-sm shadow-md shadow-emerald-500/20 disabled:opacity-50 transition-all active:scale-95"
        >
          {dispensing ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle2 size={15} />}
          {dispensing ? "Marking…" : "Medication Given ✓"}
        </button>
      </div>
    </div>
  );
}

export default function MedicationQueuePage() {
  const [encounters, setEncounters] = useState<EncounterRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    const sessionRes = await fetch("/api/clinic-sessions/active");
    if (!sessionRes.ok) { setLoading(false); return; }
    const session = await sessionRes.json();
    setSessionId(session.id);

    const encRes = await fetch(`/api/encounters?sessionId=${session.id}&status=waiting_medication`);
    if (encRes.ok) {
      setEncounters(await encRes.json());
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleGiven = (id: string) => {
    setEncounters((prev) => prev.filter((e) => e.id !== id));
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-brand-orange hover:text-brand-dark-orange font-bold transition-colors">
          <ArrowLeft size={20} strokeWidth={3} />
          Hub
        </Link>
        <button onClick={fetchData} className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
          <RefreshCw size={16} className="text-gray-500" />
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
          <Pill size={20} className="text-brand-orange" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-gray-900">Medication Queue</h2>
          <p className="text-sm text-gray-500 font-medium">
            {encounters.length} patient{encounters.length !== 1 ? "s" : ""} awaiting medication
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <RefreshCw className="animate-spin text-brand-orange" size={28} />
        </div>
      ) : !sessionId ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-gray-100">
          <p className="font-black text-gray-500">No active session</p>
        </div>
      ) : encounters.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-gray-100">
          <Users size={36} className="mx-auto mb-3 text-gray-300" />
          <p className="font-black text-gray-500 text-lg">No patients awaiting medication</p>
          <p className="text-sm text-gray-400 font-medium mt-1">
            Patients appear here once diagnosis is complete.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <h3 className="text-xs font-black text-orange-600 uppercase tracking-[0.15em] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-brand-orange animate-pulse" />
            Awaiting Medication ({encounters.length})
          </h3>
          {encounters.map((e) => (
            <MedicationCard key={e.id} encounter={e} onGiven={handleGiven} />
          ))}
        </div>
      )}
    </div>
  );
}
