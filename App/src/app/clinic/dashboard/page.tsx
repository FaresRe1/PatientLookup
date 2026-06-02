"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Activity, Clock, MapPin, Target, Users, CheckCircle2, Zap, TrendingUp } from "lucide-react";

interface SessionStats {
  isEnded?: boolean;
  session: {
    clinicName: string;
    location: string;
    date: string;
    startTime: string;
    endTime: string;
    dailyTarget: number;
    endedAt?: string | null;
  };
  total: number;
  completed: number;
  active: number;
  referred: number;
  waitingTriage: number;
  inTriage: number;
  waitingExam: number;
  inExam: number;
  waitingDiagnosis: number;
  inDiagnosis: number;
  waitingMeds: number;
}

function useNow(intervalMs = 1000) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(t);
  }, [intervalMs]);
  return now;
}

function calcPerformanceScore(stats: SessionStats, now: Date) {
  const start = new Date(stats.session.startTime).getTime();
  const end = new Date(stats.session.endTime).getTime();
  const elapsed = now.getTime() - start;
  const total = end - start;

  if (elapsed <= 0 || total <= 0) return null;
  const fractionElapsed = Math.min(elapsed / total, 1);
  const expected = stats.session.dailyTarget * fractionElapsed;
  if (expected <= 0) return null;

  return Math.round((stats.completed / expected) * 100);
}

function scoreColor(score: number | null): string {
  if (score === null) return "text-gray-400";
  if (score >= 90) return "text-emerald-400";
  if (score >= 70) return "text-amber-400";
  return "text-red-400";
}

function scoreBg(score: number | null): string {
  if (score === null) return "bg-gray-800 border-gray-700";
  if (score >= 90) return "bg-emerald-950/60 border-emerald-800/50";
  if (score >= 70) return "bg-amber-950/60 border-amber-800/50";
  return "bg-red-950/60 border-red-800/50";
}

function scoreLabel(score: number | null): string {
  if (score === null) return "Session not started";
  if (score >= 90) return "On track";
  if (score >= 70) return "Slightly behind";
  return "Behind schedule";
}

function calcPatientsPerHour(stats: SessionStats, now: Date): number | null {
  const start = new Date(stats.session.startTime).getTime();
  const elapsedHours = (now.getTime() - start) / 3600000;
  if (elapsedHours <= 0 || stats.completed === 0) return null;
  return stats.completed / elapsedHours;
}

function calcTimeRemaining(stats: SessionStats, now: Date): string {
  const end = new Date(stats.session.endTime).getTime();
  const ms = end - now.getTime();
  if (ms <= 0) return "Session ended";
  const totalMins = Math.floor(ms / 60000);
  const hrs = Math.floor(totalMins / 60);
  const mins = totalMins % 60;
  if (hrs === 0) return `${mins}m left`;
  return `${hrs}h ${mins}m left`;
}

function calcProjected(stats: SessionStats, now: Date): number | null {
  const pph = calcPatientsPerHour(stats, now);
  if (pph === null) return null;
  const end = new Date(stats.session.endTime).getTime();
  const remainingHours = Math.max(0, (end - now.getTime()) / 3600000);
  return Math.round(stats.completed + pph * remainingHours);
}

function StatCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: number | string;
  sub?: string;
  accent?: string;
}) {
  return (
    <div className="bg-gray-800/60 border border-gray-700/50 rounded-3xl p-6 flex flex-col gap-2">
      <p className="text-xs font-black text-gray-500 uppercase tracking-[0.2em]">{label}</p>
      <p className={`text-6xl font-black tabular-nums leading-none ${accent ?? "text-white"}`}>
        {value}
      </p>
      {sub && <p className="text-sm text-gray-500 font-medium">{sub}</p>}
    </div>
  );
}

function PipelineStage({
  label,
  waiting,
  active,
  dotColor,
}: {
  label: string;
  waiting: number;
  active: number;
  dotColor: string;
}) {
  const total = waiting + active;
  return (
    <div className="bg-gray-800/40 border border-gray-700/40 rounded-2xl p-4 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <span className={`w-2.5 h-2.5 rounded-full ${dotColor} ${active > 0 ? "animate-pulse" : ""}`} />
        <p className="text-xs font-black text-gray-400 uppercase tracking-widest">{label}</p>
      </div>
      <div className="flex items-end gap-3">
        <span className="text-4xl font-black text-white tabular-nums">{total}</span>
        {active > 0 && (
          <span className="text-sm font-bold text-gray-400 mb-1">{active} active</span>
        )}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<SessionStats | null>(null);
  const [noSession, setNoSession] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const now = useNow();

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/clinic-sessions/active/stats");
      if (res.status === 404) { setNoSession(true); return; }
      if (!res.ok) return;
      setStats(await res.json());
      setNoSession(false);
      setLastRefresh(new Date());
    } catch {
      // network failure — keep showing last data
    }
  }, []);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  const timeStr = now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  if (noSession) {
    return (
      <div className="fixed inset-0 z-50 bg-gray-950 flex flex-col items-center justify-center gap-6 text-center px-8">
        <div className="w-20 h-20 bg-gray-800 rounded-3xl flex items-center justify-center">
          <Activity size={40} className="text-gray-600" />
        </div>
        <div>
          <h2 className="text-3xl font-black text-white">No Active Session</h2>
          <p className="text-gray-500 font-medium mt-2">Start a clinic session to display the live dashboard.</p>
        </div>
        <Link
          href="/clinic/sessions"
          className="px-6 py-3 bg-brand-orange hover:bg-brand-dark-orange text-white rounded-2xl font-black transition-colors"
        >
          Manage Sessions
        </Link>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="fixed inset-0 z-50 bg-gray-950 flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-500">
          <Activity size={24} className="animate-pulse" />
          <span className="font-bold text-lg">Loading dashboard…</span>
        </div>
      </div>
    );
  }

  const { session, isEnded } = stats;
  const score = calcPerformanceScore(stats, now);
  const pphRaw = calcPatientsPerHour(stats, now);
  const pph = pphRaw !== null ? pphRaw.toFixed(1) : "—";
  const timeRemaining = calcTimeRemaining(stats, now);
  const projected = calcProjected(stats, now);

  const sessionDate = new Date(session.date).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const startStr = new Date(session.startTime).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  const endStr = new Date(session.endTime).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  const completionPct = stats.session.dailyTarget > 0
    ? Math.min(Math.round((stats.completed / stats.session.dailyTarget) * 100), 100)
    : 0;

  return (
    <div className="fixed inset-0 z-50 bg-gray-950 text-white flex flex-col">
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {/* Session ended banner */}
      {isEnded && (
        <div className="flex items-center justify-between gap-4 bg-amber-950/60 border border-amber-700/50 rounded-2xl px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-amber-500 shrink-0" />
            <div>
              <p className="font-black text-amber-300 text-sm uppercase tracking-widest">Session Ended</p>
              {session.endedAt && (
                <p className="text-xs text-amber-500 font-medium mt-0.5">
                  Closed at {new Date(session.endedAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })} — showing final stats
                </p>
              )}
            </div>
          </div>
          <ArrowLeft size={16} className="text-amber-600 opacity-0 pointer-events-none" />
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-6">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <span className={`w-3 h-3 rounded-full ${isEnded ? "bg-amber-500" : "bg-emerald-500 animate-pulse"}`} />
            <span className={`text-xs font-black uppercase tracking-[0.2em] ${isEnded ? "text-amber-500" : "text-emerald-500"}`}>
              {isEnded ? "Ended" : "Live"}
            </span>
          </div>
          <h1 className="text-4xl font-black text-white leading-tight truncate">{session.clinicName}</h1>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1 mt-2 text-base text-gray-400 font-medium">
            <span className="flex items-center gap-2">
              <MapPin size={16} className="text-brand-orange" />
              {session.location}
            </span>
            <span className="flex items-center gap-2">
              <Clock size={16} className="text-brand-orange" />
              {sessionDate} &bull; {startStr}–{endStr}
            </span>
            <span className="flex items-center gap-2">
              <Target size={16} className="text-brand-orange" />
              Target: {session.dailyTarget} patients
            </span>
          </div>
        </div>

        {/* Clock */}
        <div className="text-right shrink-0">
          <p className="text-5xl font-black tabular-nums text-white">{timeStr}</p>
          {lastRefresh && (
            <p className="text-xs text-gray-600 font-medium mt-1">
              Updated {lastRefresh.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </p>
          )}
        </div>
      </div>

      {/* Main stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Total Registered"
          value={stats.total}
          sub="patients today"
          accent="text-sky-400"
        />
        <StatCard
          label="In Progress"
          value={stats.active}
          sub="across all stages"
          accent="text-amber-400"
        />
        <StatCard
          label="Completed"
          value={stats.completed}
          sub={`${completionPct}% of daily target`}
          accent="text-emerald-400"
        />
      </div>

      {/* Pipeline */}
      <div>
        <h3 className="text-xs font-black text-gray-500 uppercase tracking-[0.2em] mb-3">Patient Pipeline</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <PipelineStage
            label="Triage"
            waiting={stats.waitingTriage}
            active={stats.inTriage}
            dotColor="bg-sky-500"
          />
          <PipelineStage
            label="Examination"
            waiting={stats.waitingExam}
            active={stats.inExam}
            dotColor="bg-indigo-500"
          />
          <PipelineStage
            label="Diagnosis"
            waiting={stats.waitingDiagnosis}
            active={stats.inDiagnosis}
            dotColor="bg-rose-500"
          />
          <PipelineStage
            label="Medication"
            waiting={stats.waitingMeds}
            active={0}
            dotColor="bg-orange-500"
          />
        </div>
      </div>

      {/* Performance + metrics row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Performance score — takes 2 cols */}
        <div className={`md:col-span-2 rounded-3xl border p-6 flex flex-col sm:flex-row items-start sm:items-center gap-8 ${scoreBg(score)}`}>
          <div>
            <p className="text-xs font-black text-gray-500 uppercase tracking-[0.2em] mb-2">Performance Score</p>
            <div className="flex items-end gap-3">
              <span className={`text-8xl font-black tabular-nums leading-none ${scoreColor(score)}`}>
                {score !== null ? `${score}%` : "—"}
              </span>
              <div className="mb-2">
                <span className={`text-base font-black ${scoreColor(score)}`}>{scoreLabel(score)}</span>
                <p className="text-xs text-gray-500 font-medium mt-0.5">
                  {score !== null
                    ? "Completed vs expected at this point in session"
                    : "Session has not started yet"}
                </p>
              </div>
            </div>
          </div>
          {/* Score bar */}
          {score !== null && (
            <div className="flex-1 min-w-0">
              <div className="h-4 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ${
                    score >= 90 ? "bg-emerald-500" : score >= 70 ? "bg-amber-500" : "bg-red-500"
                  }`}
                  style={{ width: `${Math.min(score, 100)}%` }}
                />
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-xs text-gray-600">0%</span>
                <span className="text-xs text-amber-600">70%</span>
                <span className="text-xs text-emerald-600">90%</span>
                <span className="text-xs text-gray-600">100%+</span>
              </div>
            </div>
          )}
        </div>

        {/* Team metrics */}
        <div className="bg-gray-800/60 border border-gray-700/50 rounded-3xl p-6 flex flex-col gap-4">
          <p className="text-xs font-black text-gray-500 uppercase tracking-[0.2em]">Team Metrics</p>
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm text-gray-400 font-medium">
                <TrendingUp size={15} className="text-brand-orange" />
                Avg / hour
              </span>
              <span className="text-xl font-black text-white tabular-nums">{pph}</span>
            </div>
            <div className="h-px bg-gray-700/50" />
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm text-gray-400 font-medium">
                <CheckCircle2 size={15} className="text-emerald-500" />
                Completed
              </span>
              <span className="text-xl font-black text-emerald-400 tabular-nums">{stats.completed}</span>
            </div>
            <div className="h-px bg-gray-700/50" />
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm text-gray-400 font-medium">
                <Users size={15} className="text-amber-500" />
                Waiting
              </span>
              <span className="text-xl font-black text-amber-400 tabular-nums">
                {stats.waitingTriage + stats.waitingExam + stats.waitingDiagnosis + stats.waitingMeds}
              </span>
            </div>
            {stats.referred > 0 && (
              <>
                <div className="h-px bg-gray-700/50" />
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm text-gray-400 font-medium">
                    <Zap size={15} className="text-purple-400" />
                    Referred
                  </span>
                  <span className="text-xl font-black text-purple-400 tabular-nums">{stats.referred}</span>
                </div>
              </>
            )}
            <div className="h-px bg-gray-700/50" />
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm text-gray-400 font-medium">
                <Clock size={15} className="text-sky-400" />
                Time left
              </span>
              <span className="text-sm font-black text-sky-400">{timeRemaining}</span>
            </div>
            {projected !== null && (
              <>
                <div className="h-px bg-gray-700/50" />
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm text-gray-400 font-medium">
                    <Target size={15} className="text-gray-500" />
                    Projected
                  </span>
                  <span className="text-xl font-black text-gray-300 tabular-nums">{projected}</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Back link — small, unobtrusive */}
      <div className="flex justify-end pt-2">
        <Link
          href="/clinic"
          className="flex items-center gap-2 text-gray-700 hover:text-gray-500 text-xs font-bold transition-colors"
        >
          <ArrowLeft size={12} />
          Back to Clinic
        </Link>
      </div>
    </div>

    {/* Privacy footer */}
    <footer className="shrink-0 bg-gray-900/80 border-t border-gray-800 py-2.5 px-6 text-center">
      <span className="text-xs font-bold text-gray-500 uppercase tracking-[0.15em]">
        Privacy Mode Active — No patient information is displayed on this screen
      </span>
    </footer>
    </div>
  );
}
