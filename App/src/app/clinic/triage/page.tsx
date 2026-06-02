"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Stethoscope,
  RefreshCw,
  Users,
  Clock,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";
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
  clientId: string;
  createdAt: string;
  allergies: string | null;
  client: EncounterClient;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getAge(dob: string) {
  return Math.abs(
    new Date(Date.now() - new Date(dob).getTime()).getUTCFullYear() - 1970,
  );
}

function formatElapsed(iso: string) {
  const ms = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(ms / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  return `${hrs}h ${mins % 60}m`;
}

function TriagePatientCard({ encounter }: { encounter: EncounterRow }) {
  const { client } = encounter;
  const isInProgress = encounter.status === "in_triage";

  return (
    <Link
      href={`/clinic/triage/${encounter.id}`}
      className={`flex items-center gap-4 p-4 bg-white rounded-2xl border transition-all hover:shadow-md hover:-translate-y-0.5 group ${
        isInProgress
          ? "border-amber-200 bg-amber-50/30"
          : "border-gray-100 hover:border-brand-orange/30"
      }`}
    >
      {client.profileImage ? (
        <img
          src={`data:image/jpeg;base64,${client.profileImage}`}
          alt={client.fullName}
          className="w-14 h-14 rounded-xl object-cover shrink-0 border-2 border-white shadow"
        />
      ) : (
        <div className="w-14 h-14 rounded-xl bg-orange-100 flex items-center justify-center shrink-0">
          <span className="text-brand-orange font-black text-base">
            {getInitials(client.fullName)}
          </span>
        </div>
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-black text-gray-900 text-base">{client.fullName}</p>
          {isInProgress && (
            <span className="text-xs font-black text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
              In Progress
            </span>
          )}
        </div>
        <p className="text-sm text-gray-500 font-medium mt-0.5">
          {client.village ?? "Unknown village"} &bull; {getAge(client.dob)} yrs &bull;{" "}
          {client.gender}
        </p>
        <div className="flex items-center gap-3 mt-1.5">
          <span className="flex items-center gap-1 text-xs text-gray-400 font-medium">
            <Clock size={12} />
            Waiting {formatElapsed(encounter.createdAt)}
          </span>
          {encounter.allergies && (
            <span className="flex items-center gap-1 text-xs text-amber-600 font-bold">
              <AlertTriangle size={12} />
              Allergies noted
            </span>
          )}
        </div>
      </div>

      <ChevronRight
        size={20}
        className="text-gray-300 group-hover:text-brand-orange transition-colors shrink-0"
      />
    </Link>
  );
}

export default function TriageQueuePage() {
  const [encounters, setEncounters] = useState<EncounterRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    const sessionRes = await fetch("/api/clinic-sessions/active");
    if (!sessionRes.ok) {
      setLoading(false);
      return;
    }
    const session = await sessionRes.json();
    setSessionId(session.id);

    const encRes = await fetch(
      `/api/encounters?sessionId=${session.id}`,
    );
    if (encRes.ok) {
      const all: EncounterRow[] = await encRes.json();
      setEncounters(
        all.filter((e) => e.status === "registered" || e.status === "in_triage"),
      );
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const waiting = encounters.filter((e) => e.status === "registered");
  const inProgress = encounters.filter((e) => e.status === "in_triage");

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 text-brand-orange hover:text-brand-dark-orange font-bold transition-colors"
        >
          <ArrowLeft size={20} strokeWidth={3} />
          Hub
        </Link>
        <button
          onClick={fetchData}
          className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
        >
          <RefreshCw size={16} className="text-gray-500" />
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-sky-100 rounded-xl flex items-center justify-center">
          <Stethoscope size={20} className="text-sky-600" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-gray-900">Triage Queue</h2>
          <p className="text-sm text-gray-500 font-medium">
            {waiting.length} waiting &bull; {inProgress.length} in progress
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
          <Link
            href="/clinic/sessions"
            className="text-brand-orange font-bold text-sm underline mt-2 inline-block"
          >
            Start a session →
          </Link>
        </div>
      ) : encounters.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-gray-100">
          <Users size={36} className="mx-auto mb-3 text-gray-300" />
          <p className="font-black text-gray-500 text-lg">Queue is empty</p>
          <p className="text-sm text-gray-400 font-medium mt-1">
            Patients registered will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {inProgress.length > 0 && (
            <section className="space-y-3">
              <h3 className="text-xs font-black text-amber-600 uppercase tracking-[0.15em] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                In Triage ({inProgress.length})
              </h3>
              {inProgress.map((e) => (
                <TriagePatientCard key={e.id} encounter={e} />
              ))}
            </section>
          )}

          {waiting.length > 0 && (
            <section className="space-y-3">
              <h3 className="text-xs font-black text-sky-600 uppercase tracking-[0.15em] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-sky-500" />
                Awaiting Triage ({waiting.length})
              </h3>
              {waiting.map((e) => (
                <TriagePatientCard key={e.id} encounter={e} />
              ))}
            </section>
          )}
        </div>
      )}
    </div>
  );
}
