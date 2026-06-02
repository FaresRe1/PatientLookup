"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  UserPlus,
  Stethoscope,
  FlaskConical,
  ClipboardList,
  Pill,
  LayoutDashboard,
  Users,
  Settings,
  MapPin,
  Clock,
  TrendingUp,
  Loader2,
  AlertCircle,
} from "lucide-react";

interface HubStats {
  session: {
    clinicName: string;
    location: string;
    startTime: string;
    endTime: string;
    dailyTarget: number;
    endedAt: string | null;
  } | null;
  isEnded: boolean;
  registeredToday: number;
  total: number;
  completed: number;
  active: number;
  waitingTriage: number;
  inTriage: number;
  waitingExam: number;
  inExam: number;
  waitingDiagnosis: number;
  inDiagnosis: number;
  waitingMeds: number;
}

function getBadgeCount(label: string, stats: HubStats | null): number {
  if (!stats) return 0;
  if (label === "Triage") return (stats.waitingTriage ?? 0) + (stats.inTriage ?? 0);
  if (label === "Examination") return (stats.waitingExam ?? 0) + (stats.inExam ?? 0);
  if (label === "Diagnosis") return (stats.waitingDiagnosis ?? 0) + (stats.inDiagnosis ?? 0);
  if (label === "Medication") return stats.waitingMeds ?? 0;
  return 0;
}

const CARDS = [
  { label: "Registration", sub: "Register new patient", href: "/add-patient", Icon: UserPlus, clinic: true },
  { label: "Triage", sub: "Vitals & history", href: "/clinic/triage", Icon: ClipboardList, clinic: true },
  { label: "Examination", sub: "Clinical exam", href: "/clinic/examination", Icon: Stethoscope, clinic: true },
  { label: "Diagnosis", sub: "Assessment & plan", href: "/clinic/diagnosis", Icon: FlaskConical, clinic: true },
  { label: "Medication", sub: "Dispense & prescribe", href: "/clinic/medication", Icon: Pill, clinic: true },
  { label: "Live Dashboard", sub: "Session overview", href: "/clinic/dashboard", Icon: LayoutDashboard, clinic: false },
  { label: "Patient Records", sub: "Search & view patients", href: "/patients", Icon: Users, clinic: false },
  { label: "Clinic Settings", sub: "Sessions & config", href: "/clinic/sessions", Icon: Settings, clinic: false },
];

export default function HubPage() {
  const [stats, setStats] = useState<HubStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/hub/stats")
      .then((r) => (r.ok ? r.json() as Promise<HubStats> : Promise.resolve(null)))
      .then((data) => setStats(data))
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, []);

  const hasSession = stats !== null && stats.session !== null;
  const startStr = hasSession && stats?.session
    ? new Date(stats.session.startTime).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
    : null;
  const endStr = hasSession && stats?.session
    ? new Date(stats.session.endTime).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
    : null;

  const target = stats?.session?.dailyTarget ?? 0;
  const completed = stats?.completed ?? 0;
  const total = stats?.total ?? 0;
  const progress = target > 0 ? Math.min(100, Math.round((completed / target) * 100)) : 0;

  return (
    <div className="max-w-5xl mx-auto space-y-5 py-4">
      {/* Session strip */}
      {loading ? (
        <div className="h-14 bg-white rounded-2xl border border-gray-100 flex items-center justify-center">
          <Loader2 size={18} className="animate-spin text-gray-400" />
        </div>
      ) : hasSession && stats?.session ? (
        <div className="rounded-2xl border border-session-rim bg-session-strip px-5 py-3 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0 flex-wrap">
            <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider shrink-0 text-session-live">
              <span className={`w-2 h-2 rounded-full shrink-0 ${
                stats.isEnded ? "bg-amber-500" : "bg-emerald-500 animate-pulse"
              }`} />
              {stats.isEnded ? "Session Ended" : "Session Live"}
            </div>
            <span className="text-sm font-black text-gray-900 truncate">{stats.session.clinicName}</span>
            <span className="flex items-center gap-1 text-xs text-gray-500 font-medium">
              <MapPin size={11} />{stats.session.location}
            </span>
            <span className="flex items-center gap-1 text-xs text-gray-500 font-medium">
              <Clock size={11} />{startStr}–{endStr}
            </span>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-xs text-gray-500 font-medium">{total} registered · {completed} done</span>
            {!stats.isEnded && (
              <Link
                href="/add-patient"
                className="px-3 py-1.5 bg-brand-orange hover:bg-brand-dark-orange text-white rounded-xl text-xs font-black transition-all"
              >
                + Register
              </Link>
            )}
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-gray-200 px-5 py-3 flex items-center justify-between">
          <span className="flex items-center gap-2 text-sm text-gray-400 font-medium">
            <AlertCircle size={16} />
            No active session
          </span>
          <Link
            href="/clinic/sessions"
            className="px-3 py-1.5 bg-brand-orange hover:bg-brand-dark-orange text-white rounded-xl text-xs font-black transition-all"
          >
            Create Session
          </Link>
        </div>
      )}

      {/* Station cards grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {CARDS.map(({ label, sub, href, Icon, clinic }) => {
          const badgeCount = getBadgeCount(label, stats);
          return (
            <Link
              key={label}
              href={href}
              className="relative flex flex-col gap-3 p-4 bg-white rounded-2xl border border-card-rim hover:border-session-rim shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
            >
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${clinic ? "bg-clinic-icon-bg" : "bg-util-icon-bg"}`}>
                <Icon size={22} className={clinic ? "text-brand-orange" : "text-util-icon"} />
              </div>
              <div>
                <p className="font-black text-gray-900 text-sm leading-tight">{label}</p>
                <p className="text-xs text-gray-400 font-medium mt-0.5">{sub}</p>
              </div>
              {badgeCount > 0 && (
                <span className="absolute top-3 right-3 min-w-[22px] h-[22px] px-1.5 bg-brand-orange text-white text-xs font-black rounded-full flex items-center justify-center">
                  {badgeCount}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Status strip */}
      {hasSession && (
        <div className="bg-white rounded-2xl border border-gray-100 px-6 py-4 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <span className="font-black text-gray-900">
                {completed}
                <span className="font-medium text-gray-400">/{target} target</span>
              </span>
              <span className="text-gray-400 font-medium">{stats?.active ?? 0} active</span>
              <span className="text-gray-400 font-medium">{stats?.registeredToday ?? 0} today</span>
            </div>
            <div className="flex items-center gap-2 text-brand-orange font-black">
              <TrendingUp size={15} />
              {progress}%
            </div>
          </div>
          <div className="w-full bg-progress-rail rounded-full h-2">
            <div
              className="bg-gradient-to-r from-brand-orange to-brand-dark-orange h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
