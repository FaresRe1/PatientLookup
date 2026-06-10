"use client";
import { useState } from "react";
import {
  Lock,
  Unlock,
  Download,
  Users,
  Stethoscope,
  Calendar,
  Loader2,
  CheckCircle2,
} from "lucide-react";

type ExportType = "patients" | "encounters" | "sessions";

const EXPORTS: { type: ExportType; label: string; sub: string; icon: React.ReactNode; color: string }[] = [
  {
    type: "patients",
    label: "Patients",
    sub: "Name, gender, DOB, phone, village",
    icon: <Users size={22} />,
    color: "text-sky-500",
  },
  {
    type: "encounters",
    label: "Clinic Encounters",
    sub: "Full clinical data — triage, exam, diagnosis, prescription",
    icon: <Stethoscope size={22} />,
    color: "text-[#266AFB]",
  },
  {
    type: "sessions",
    label: "Clinic Sessions",
    sub: "Session dates, locations, targets, status",
    icon: <Calendar size={22} />,
    color: "text-emerald-500",
  },
];

export default function ExportPage() {
  const [password, setPassword] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [checking, setChecking] = useState(false);
  const [authError, setAuthError] = useState(false);
  const [downloading, setDownloading] = useState<ExportType | null>(null);
  const [done, setDone] = useState<ExportType | null>(null);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(false);
    setChecking(true);
    try {
      const res = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, type: "sessions" }),
      });
      if (res.ok) {
        setUnlocked(true);
      } else {
        setAuthError(true);
      }
    } catch {
      setAuthError(true);
    } finally {
      setChecking(false);
    }
  };

  const handleDownload = async (type: ExportType, filename: string) => {
    setDownloading(type);
    setDone(null);
    try {
      const res = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, type }),
      });
      if (!res.ok) return;
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${filename}-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setDone(type);
      setTimeout(() => setDone(null), 3000);
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center py-16 px-4">
      <div className="w-full max-w-md space-y-6 animate-in fade-in duration-500">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className={`w-16 h-16 rounded-3xl flex items-center justify-center mx-auto transition-colors ${
            unlocked ? "bg-emerald-100" : "bg-[#EBF1FF]"
          }`}>
            {unlocked
              ? <Unlock size={32} className="text-emerald-600" />
              : <Lock size={32} className="text-[#266AFB]" />
            }
          </div>
          <h1 className="text-2xl font-black text-gray-900">Data Export</h1>
          <p className="text-sm text-gray-500 font-medium">
            {unlocked
              ? "Choose what to export. Each file downloads as CSV."
              : "Enter the export password to access the download tools."}
          </p>
        </div>

        {/* Password form */}
        {!unlocked && (
          <form onSubmit={handleUnlock} className="bg-white rounded-3xl shadow-clean border border-gray-100 p-6 space-y-4">
            <div className="relative">
              <Lock size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setAuthError(false); }}
                placeholder="Export password"
                autoComplete="off"
                className="form-input-styled"
              />
            </div>
            {authError && (
              <p className="text-sm font-bold text-red-600 text-center animate-in slide-in-from-top-1">
                Incorrect password — try again.
              </p>
            )}
            <button
              type="submit"
              disabled={checking || !password}
              className="w-full bg-[#266AFB] hover:bg-[#003588] text-white py-3.5 rounded-2xl font-black disabled:opacity-50 flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              {checking && <Loader2 size={18} className="animate-spin" />}
              {checking ? "Checking…" : "Unlock"}
            </button>
          </form>
        )}

        {/* Download panel */}
        {unlocked && (
          <div className="bg-white rounded-3xl shadow-clean border border-gray-100 p-6 space-y-3 animate-in fade-in duration-300">
            {EXPORTS.map(({ type, label, sub, icon, color }) => (
              <button
                key={type}
                onClick={() => handleDownload(type, type)}
                disabled={downloading === type}
                className="w-full flex items-center gap-4 p-4 bg-gray-50 hover:bg-[#EBF1FF]/60 border border-gray-100 hover:border-[#D6E4FF] rounded-2xl transition-all disabled:opacity-60 text-left group"
              >
                <div className={`w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center shrink-0 shadow-sm ${color}`}>
                  {icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-gray-900 text-sm">{label}</p>
                  <p className="text-xs text-gray-400 font-medium truncate">{sub}</p>
                </div>
                <div className="shrink-0">
                  {downloading === type ? (
                    <Loader2 size={18} className="animate-spin text-[#266AFB]" />
                  ) : done === type ? (
                    <CheckCircle2 size={18} className="text-emerald-500" />
                  ) : (
                    <Download size={18} className="text-gray-400 group-hover:text-[#266AFB] transition-colors" />
                  )}
                </div>
              </button>
            ))}

            <p className="text-xs text-gray-400 font-medium text-center pt-2">
              Files export as .csv — open in Excel, Numbers, or Google Sheets.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
