"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Stethoscope,
  MapPin,
  Clock,
  Users,
  CheckCircle2,
  Activity,
  UserPlus,
  Settings,
  RefreshCw,
  Calendar,
  Monitor,
} from "lucide-react";
import type { ClinicSessionResponseType } from "~/models/clinicSession";
import type { EncounterStatus } from "~/lib/encounterStatus";
import { STATUS_LABELS, COMPLETED_STATUSES } from "~/lib/encounterStatus";
import { getEncounterHref } from "~/lib/clinicNav";

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
  client: EncounterClient;
}

const STAGE_GROUPS: {
  label: string;
  statuses: EncounterStatus[];
  color: string;
  dot: string;
}[] = [
  {
    label: "Awaiting Triage",
    statuses: ["registered"],
    color: "bg-sky-50 border-sky-200",
    dot: "bg-sky-500",
  },
  {
    label: "In Triage",
    statuses: ["in_triage"],
    color: "bg-amber-50 border-amber-200",
    dot: "bg-amber-500",
  },
  {
    label: "Awaiting Examination",
    statuses: ["triage_completed"],
    color: "bg-violet-50 border-violet-200",
    dot: "bg-violet-500",
  },
  {
    label: "In Examination",
    statuses: ["in_examination"],
    color: "bg-indigo-50 border-indigo-200",
    dot: "bg-indigo-500",
  },
  {
    label: "Awaiting Diagnosis",
    statuses: ["examination_completed"],
    color: "bg-pink-50 border-pink-200",
    dot: "bg-pink-500",
  },
  {
    label: "In Diagnosis",
    statuses: ["in_diagnosis"],
    color: "bg-rose-50 border-rose-200",
    dot: "bg-rose-500",
  },
  {
    label: "Awaiting Medication",
    statuses: ["waiting_medication"],
    color: "bg-[#EBF1FF] border-[#D6E4FF]",
    dot: "bg-[#266AFB]",
  },
  {
    label: "Completed",
    statuses: ["completed_medication_given", "completed_no_meds"],
    color: "bg-emerald-50 border-emerald-200",
    dot: "bg-emerald-500",
  },
  {
    label: "Referred",
    statuses: ["referred"],
    color: "bg-purple-50 border-purple-200",
    dot: "bg-purple-500",
  },
];

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatElapsed(iso: string) {
  const ms = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(ms / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  return `${hrs}h ${mins % 60}m ago`;
}

function getAge(dob: string) {
  return Math.abs(
    new Date(Date.now() - new Date(dob).getTime()).getUTCFullYear() - 1970,
  );
}

function PatientCard({ encounter }: { encounter: EncounterRow }) {
  const { client } = encounter;
  const href = getEncounterHref(encounter.id, encounter.status);
  const inner = (
    <>
      {client.profileImage ? (
        <img
          src={`data:image/jpeg;base64,${client.profileImage}`}
          alt={client.fullName}
          className="w-10 h-10 rounded-lg object-cover shrink-0 border border-gray-100"
        />
      ) : (
        <div className="w-10 h-10 rounded-lg bg-[#EBF1FF] flex items-center justify-center shrink-0">
          <span className="text-[#266AFB] font-black text-xs">
            {getInitials(client.fullName)}
          </span>
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="font-bold text-gray-900 text-sm truncate">{client.fullName}</p>
        <p className="text-xs text-gray-400 font-medium truncate">
          {client.village ?? "—"} &bull; {getAge(client.dob)} yrs
        </p>
        {encounter.status === "referred" && (
          <span className="mt-1 inline-block text-xs font-black text-purple-700 bg-purple-100 px-1.5 py-0.5 rounded-full">
            Referred
          </span>
        )}
        {encounter.status === "completed_no_meds" && (
          <span className="mt-1 inline-block text-xs font-black text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-full">
            No meds
          </span>
        )}
      </div>
      <span className="text-xs text-gray-400 font-medium shrink-0 tabular-nums">
        {formatElapsed(encounter.createdAt)}
      </span>
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 hover:border-[#266AFB]/30 hover:shadow-sm transition-all"
      >
        {inner}
      </Link>
    );
  }
  return (
    <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 transition-all">
      {inner}
    </div>
  );
}

function StageColumn({
  group,
  encounters,
}: {
  group: (typeof STAGE_GROUPS)[number];
  encounters: EncounterRow[];
}) {
  const rows = encounters.filter((e) =>
    (group.statuses as string[]).includes(e.status),
  );
  return (
    <div className={`rounded-2xl border p-4 space-y-3 ${group.color} min-w-[260px]`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${group.dot}`} />
          <h3 className="font-black text-gray-800 text-sm">{group.label}</h3>
        </div>
        <span className="text-xs font-black bg-white/80 text-gray-700 px-2.5 py-1 rounded-full border border-white/60">
          {rows.length}
        </span>
      </div>
      <div className="space-y-2">
        {rows.length === 0 ? (
          <p className="text-xs text-gray-400 font-medium text-center py-3">
            No patients
          </p>
        ) : (
          rows.map((enc) => <PatientCard key={enc.id} encounter={enc} />)
        )}
      </div>
    </div>
  );
}

export default function ClinicPage() {
  const [session, setSession] = useState<ClinicSessionResponseType | null>(null);
  const [encounters, setEncounters] = useState<EncounterRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const fetchData = useCallback(async () => {
    try {
      const sessionRes = await fetch("/api/clinic-sessions/active");
      if (!sessionRes.ok) {
        setSession(null);
        setEncounters([]);
        return;
      }
      const sessionData: ClinicSessionResponseType = await sessionRes.json();
      setSession(sessionData);

      const encRes = await fetch(`/api/encounters?sessionId=${sessionData.id}`);
      if (encRes.ok) {
        setEncounters(await encRes.json());
      }
    } finally {
      setLoading(false);
      setLastRefresh(new Date());
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const total = encounters.length;
  const completed = encounters.filter((e) =>
    (COMPLETED_STATUSES as string[]).includes(e.status),
  ).length;
  const active = total - completed;

  const sessionDate = session
    ? new Date(session.date).toLocaleDateString("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";
  const sessionStart = session
    ? new Date(session.startTime).toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";
  const sessionEnd = session
    ? new Date(session.endTime).toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <RefreshCw className="animate-spin text-[#266AFB]" size={32} />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="max-w-xl mx-auto text-center space-y-6 py-20 animate-in fade-in duration-500">
        <div className="w-20 h-20 bg-[#EBF1FF] rounded-3xl flex items-center justify-center mx-auto">
          <Stethoscope size={40} className="text-[#266AFB]" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-gray-900">No Active Session</h2>
          <p className="text-gray-500 font-medium mt-2">
            Create and activate a clinic session to start managing patient flow.
          </p>
        </div>
        <Link
          href="/clinic/sessions"
          className="inline-flex items-center gap-2 bg-[#266AFB] hover:bg-[#003588] text-white px-6 py-3 rounded-2xl font-black shadow-lg shadow-blue-500/20 transition-all"
        >
          <Settings size={18} />
          Manage Sessions
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
            <Stethoscope className="text-[#266AFB]" size={28} />
            {session.clinicName}
          </h2>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-sm text-gray-500 font-medium">
            <span className="flex items-center gap-1.5">
              <MapPin size={14} className="text-[#266AFB]" />
              {session.location}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar size={14} className="text-[#266AFB]" />
              {sessionDate}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock size={14} className="text-[#266AFB]" />
              {sessionStart} – {sessionEnd}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-xs text-gray-400 font-medium">
            Updated {formatElapsed(lastRefresh.toISOString())}
          </span>
          <button
            onClick={fetchData}
            className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
            title="Refresh"
          >
            <RefreshCw size={16} className="text-gray-500" />
          </button>
          <Link
            href="/add-patient"
            className="flex items-center gap-2 bg-[#266AFB] hover:bg-[#003588] text-white px-4 py-2.5 rounded-xl font-black text-sm shadow-md shadow-blue-500/20 transition-all"
          >
            <UserPlus size={16} />
            Register Patient
          </Link>
          <Link
            href="/clinic/dashboard"
            className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-4 py-2.5 rounded-xl font-black text-sm transition-all"
          >
            <Monitor size={16} />
            Dashboard
          </Link>
          <Link
            href="/clinic/sessions"
            className="flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-xl font-bold text-sm transition-all"
          >
            <Settings size={16} />
            Sessions
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4 shadow-clean">
          <div className="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center shrink-0">
            <Users size={22} className="text-sky-600" />
          </div>
          <div>
            <p className="text-2xl font-black text-gray-900 tabular-nums">{total}</p>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-0.5">
              Registered
            </p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4 shadow-clean">
          <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
            <Activity size={22} className="text-amber-600" />
          </div>
          <div>
            <p className="text-2xl font-black text-gray-900 tabular-nums">{active}</p>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-0.5">
              In Progress
            </p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4 shadow-clean">
          <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center shrink-0">
            <CheckCircle2 size={22} className="text-emerald-600" />
          </div>
          <div>
            <p className="text-2xl font-black text-gray-900 tabular-nums">{completed}</p>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-0.5">
              Completed
            </p>
          </div>
        </div>
      </div>

      {/* Queue */}
      {encounters.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Users size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-black text-lg">Queue is empty</p>
          <p className="text-sm font-medium mt-1">
            Register the first patient to get started.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-4 w-max">
            {STAGE_GROUPS.map((group) => (
              <StageColumn
                key={group.label}
                group={group}
                encounters={encounters}
              />
            ))}
          </div>
        </div>
      )}

      {/* Status legend */}
      <div className="flex flex-wrap gap-3 pt-2">
        {Object.entries(STATUS_LABELS).map(([status, label]) => (
          <span
            key={status}
            className="text-xs font-bold text-gray-500 bg-white border border-gray-100 px-3 py-1.5 rounded-full"
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
