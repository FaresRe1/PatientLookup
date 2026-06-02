"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Clock,
  Target,
  Plus,
  CheckCircle2,
  Circle,
  Loader2,
  Trash2,
  Stethoscope,
  XCircle,
} from "lucide-react";
import { FormGroup } from "~/components/FormGroup";
import type { ClinicSessionResponseType } from "~/models/clinicSession";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function SessionsPage() {
  const [sessions, setSessions] = useState<ClinicSessionResponseType[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activating, setActivating] = useState<string | null>(null);
  const [ending, setEnding] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchSessions = async () => {
    const res = await fetch("/api/clinic-sessions");
    if (res.ok) setSessions(await res.json());
    setLoading(false);
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);
    setSaving(true);

    const fd = new FormData(e.currentTarget);
    const date = fd.get("date") as string;
    const startT = fd.get("startTime") as string;
    const endT = fd.get("endTime") as string;

    const payload = {
      clinicName: fd.get("clinicName") as string,
      location: fd.get("location") as string,
      date: new Date(date).toISOString(),
      startTime: new Date(`${date}T${startT}`).toISOString(),
      endTime: new Date(`${date}T${endT}`).toISOString(),
      dailyTarget: Number(fd.get("dailyTarget")) || 50,
      isActive: (fd.get("isActive") as string) === "on",
    };

    try {
      const res = await fetch("/api/clinic-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        setFormError(err.msg ?? "Failed to create session");
        return;
      }
      await fetchSessions();
      setShowForm(false);
      (e.target as HTMLFormElement).reset();
    } catch {
      setFormError("Network error, please try again.");
    } finally {
      setSaving(false);
    }
  };

  const activate = async (id: string) => {
    setActivating(id);
    await fetch(`/api/clinic-sessions/${id}/activate`, { method: "POST" });
    await fetchSessions();
    setActivating(null);
  };

  const endSession = async (id: string) => {
    if (!confirm("Are you sure you want to end this clinic session? This cannot be undone.")) return;
    setEnding(id);
    await fetch(`/api/clinic-sessions/${id}/end`, { method: "POST" });
    await fetchSessions();
    setEnding(null);
  };

  const deleteSession = async (id: string) => {
    if (!confirm("Delete this session? Encounters linked to it will also be deleted.")) return;
    setDeleting(id);
    await fetch(`/api/clinic-sessions/${id}`, { method: "DELETE" });
    await fetchSessions();
    setDeleting(null);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <Link
          href="/clinic"
          className="flex items-center gap-2 text-brand-orange hover:text-brand-dark-orange font-bold transition-colors"
        >
          <ArrowLeft size={20} strokeWidth={3} />
          Back to Clinic
        </Link>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-2 bg-brand-orange hover:bg-brand-dark-orange text-white px-4 py-2.5 rounded-xl font-black text-sm shadow-md shadow-orange-500/20 transition-all"
        >
          <Plus size={16} />
          New Session
        </button>
      </div>

      <div className="flex items-center gap-3">
        <Stethoscope size={24} className="text-brand-orange" />
        <h2 className="text-2xl font-black text-gray-900">Clinic Sessions</h2>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="bg-white rounded-3xl shadow-clean border border-gray-100 overflow-hidden animate-in slide-in-from-top-3 duration-300">
          <div className="p-6 border-b border-gray-50 bg-orange-50/30">
            <h3 className="font-black text-gray-900 text-lg">New Clinic Session</h3>
          </div>
          <form onSubmit={handleCreate} className="p-6 space-y-6">
            {formError && (
              <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-bold">
                {formError}
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormGroup label="Clinic Name *" icon={<Stethoscope size={18} />}>
                <input
                  name="clinicName"
                  type="text"
                  required
                  placeholder="e.g. Ziryia Mobile Clinic"
                  className="form-input-styled"
                />
              </FormGroup>
              <FormGroup label="Location *" icon={<MapPin size={18} />}>
                <input
                  name="location"
                  type="text"
                  required
                  placeholder="Village or site name"
                  className="form-input-styled"
                />
              </FormGroup>
              <FormGroup label="Date *" icon={<Calendar size={18} />}>
                <input
                  name="date"
                  type="date"
                  required
                  defaultValue={new Date().toISOString().split("T")[0]}
                  className="form-input-styled"
                />
              </FormGroup>
              <FormGroup label="Daily Patient Target" icon={<Target size={18} />}>
                <input
                  name="dailyTarget"
                  type="number"
                  min={1}
                  max={999}
                  defaultValue={50}
                  className="form-input-styled"
                />
              </FormGroup>
              <FormGroup label="Start Time *" icon={<Clock size={18} />}>
                <input
                  name="startTime"
                  type="time"
                  required
                  defaultValue="08:00"
                  className="form-input-styled"
                />
              </FormGroup>
              <FormGroup label="End Time *" icon={<Clock size={18} />}>
                <input
                  name="endTime"
                  type="time"
                  required
                  defaultValue="17:00"
                  className="form-input-styled"
                />
              </FormGroup>
            </div>
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                name="isActive"
                defaultChecked
                className="w-5 h-5 rounded accent-brand-orange"
              />
              <span className="font-bold text-gray-700 text-sm">
                Set as active session immediately
              </span>
            </label>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-brand-orange hover:bg-brand-dark-orange text-white py-3 rounded-2xl font-black disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
              >
                {saving && <Loader2 size={18} className="animate-spin" />}
                {saving ? "Creating…" : "Create Session"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl font-bold transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Session list */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin text-brand-orange" size={32} />
        </div>
      ) : sessions.length === 0 ? (
        <div className="text-center py-16 text-gray-400 bg-white rounded-3xl border border-gray-100">
          <Calendar size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-black text-lg">No sessions yet</p>
          <p className="text-sm font-medium mt-1">Click &quot;New Session&quot; to create the first one.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((s) => (
            <div
              key={s.id}
              className={`bg-white rounded-2xl border p-5 flex items-center gap-4 shadow-clean transition-all ${
                s.isActive ? "border-emerald-200 bg-emerald-50/30" : s.endedAt ? "border-red-100 bg-red-50/20" : "border-gray-100"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  s.isActive ? "bg-emerald-100" : s.endedAt ? "bg-red-100" : "bg-gray-100"
                }`}
              >
                {s.isActive ? (
                  <CheckCircle2 size={20} className="text-emerald-600" />
                ) : s.endedAt ? (
                  <XCircle size={20} className="text-red-500" />
                ) : (
                  <Circle size={20} className="text-gray-400" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-black text-gray-900">{s.clinicName}</p>
                  {s.isActive && (
                    <span className="text-xs font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      ACTIVE
                    </span>
                  )}
                  {s.endedAt && (
                    <span className="text-xs font-black text-red-700 bg-red-100 px-2 py-0.5 rounded-full">
                      ENDED
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1 text-xs text-gray-500 font-medium">
                  <span className="flex items-center gap-1">
                    <MapPin size={11} />
                    {s.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar size={11} />
                    {formatDate(s.date)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={11} />
                    {formatTime(s.startTime)} – {formatTime(s.endTime)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Target size={11} />
                    Target: {s.dailyTarget}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {!s.isActive && !s.endedAt && (
                  <button
                    onClick={() => activate(s.id)}
                    disabled={activating === s.id}
                    className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-xs disabled:opacity-50 transition-all"
                  >
                    {activating === s.id ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <CheckCircle2 size={14} />
                    )}
                    Activate
                  </button>
                )}
                {s.isActive && (
                  <button
                    onClick={() => endSession(s.id)}
                    disabled={ending === s.id}
                    className="flex items-center gap-1.5 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-black text-xs disabled:opacity-50 transition-all"
                  >
                    {ending === s.id ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <XCircle size={14} />
                    )}
                    End Session
                  </button>
                )}
                <button
                  onClick={() => deleteSession(s.id)}
                  disabled={deleting === s.id}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all disabled:opacity-50"
                  title="Delete session"
                >
                  {deleting === s.id ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Trash2 size={16} />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
