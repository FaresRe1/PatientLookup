"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  User,
  Activity,
  ArrowLeft,
  Upload,
  Calendar,
  Phone,
  Loader2,
  MapPinned,
  Stethoscope,
  AlertCircle,
} from "lucide-react";
import { useAddPatient } from "~/hooks/useAddPatient";
import { FormGroup } from "~/components/FormGroup";
import { CameraCapture } from "~/components/CameraCapture";
import type { ClinicSessionResponseType } from "~/models/clinicSession";

export default function AddPatientPage() {
  const router = useRouter();
  const { savePatient, isLoading, error } = useAddPatient();

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const capturedFileRef = useRef<File | null>(null);
  const submitModeRef = useRef<"clinic" | "visit" | "plain">("plain");
  const [activeSession, setActiveSession] = useState<ClinicSessionResponseType | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);

  useEffect(() => {
    fetch("/api/clinic-sessions/active")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setActiveSession(data))
      .catch(() => setActiveSession(null))
      .finally(() => setSessionLoading(false));
  }, []);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    capturedFileRef.current = null;
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleCameraCapture = (file: File) => {
    capturedFileRef.current = file;
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const mode = submitModeRef.current;
    const formData = new FormData(e.currentTarget);

    if (capturedFileRef.current) {
      formData.delete("profileImage");
      formData.append("profileImage", capturedFileRef.current, "camera-capture.jpg");
    }

    const result = await savePatient(formData);
    if (!result.success) return;

    if (mode === "clinic" && activeSession) {
      await fetch("/api/encounters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId: result.id, sessionId: activeSession.id }),
      });
      router.push("/clinic");
    } else if (mode === "visit") {
      router.push(`/patients/${result.id}/new-visit`);
    } else {
      router.push("/");
    }
  };

  const sessionDate = activeSession
    ? new Date(activeSession.date).toLocaleDateString("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  const sessionStart = activeSession
    ? new Date(activeSession.startTime).toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  const sessionEnd = activeSession
    ? new Date(activeSession.endTime).toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <Link
          href={activeSession ? "/clinic" : "/"}
          className="flex items-center gap-2 text-brand-orange hover:text-brand-dark-orange font-bold transition-colors"
        >
          <ArrowLeft size={20} strokeWidth={3} />
          {activeSession ? "Back to Clinic" : "Back to List"}
        </Link>
      </div>

      {/* Active session banner */}
      {!sessionLoading && activeSession && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3">
          <Stethoscope size={20} className="text-emerald-600 mt-0.5 shrink-0" />
          <div>
            <p className="font-black text-emerald-800 text-sm">
              Registering for: {activeSession.clinicName}
            </p>
            <p className="text-emerald-600 text-xs font-medium mt-0.5">
              {sessionDate} &bull; {sessionStart}–{sessionEnd} &bull; {activeSession.location}
            </p>
          </div>
        </div>
      )}

      {!sessionLoading && !activeSession && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertCircle size={20} className="text-amber-600 mt-0.5 shrink-0" />
          <div>
            <p className="font-black text-amber-800 text-sm">No active clinic session</p>
            <p className="text-amber-600 text-xs font-medium mt-0.5">
              Patient will be added to records only.{" "}
              <Link href="/clinic/sessions" className="underline font-bold">
                Start a session →
              </Link>
            </p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-3xl shadow-clean border border-gray-100 overflow-hidden">
        <div className="p-8 border-b border-gray-50 bg-orange-50/30">
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
            <User className="text-brand-orange" size={28} />
            {activeSession ? "Register New Patient" : "Add New Patient"}
          </h2>
          <p className="text-gray-500 mt-1 font-medium">
            Please provide the initial medical and personal details below.
          </p>
        </div>

        <form onSubmit={handleFormSubmit} className="p-8 space-y-10">
          {error && (
            <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-bold animate-in slide-in-from-top-2">
              {error}
            </div>
          )}

          {/* Personal Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <FormGroup label="Full Name *" icon={<User size={18} />}>
              <input
                name="fullName"
                type="text"
                required
                placeholder="John Smith"
                className="form-input-styled"
              />
            </FormGroup>

            <FormGroup label="Date of Birth *" icon={<Calendar size={18} />}>
              <input name="dob" type="date" required className="form-input-styled" />
            </FormGroup>

            <FormGroup label="Gender *" icon={<Activity size={18} />}>
              <select
                name="gender"
                required
                className="form-input-styled appearance-none cursor-pointer"
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </FormGroup>

            <FormGroup label="Phone Number" icon={<Phone size={18} />}>
              <input
                name="phoneNumber"
                type="tel"
                placeholder="+44 "
                className="form-input-styled"
              />
            </FormGroup>

            <FormGroup label="Village / Location" icon={<MapPinned size={18} />}>
              <input
                name="village"
                type="text"
                placeholder="Village or area name"
                className="form-input-styled"
              />
            </FormGroup>
          </div>

          {/* Profile Image */}
          <div className="pt-6 border-t border-gray-50 space-y-3">
            <label className="text-sm font-bold text-gray-700 block">
              Profile Photo (Optional)
            </label>
            <div className="flex flex-wrap items-center gap-3">
              <CameraCapture onCapture={handleCameraCapture} />
              <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">or</span>
              <label className="flex items-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-sm cursor-pointer transition-all">
                <Upload size={18} />
                Upload File
                <input
                  type="file"
                  name="profileImage"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>
            {previewUrl && (
              <div className="animate-in zoom-in duration-300 flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="h-20 w-20 object-cover rounded-xl shadow border-2 border-white"
                />
                <div>
                  <p className="font-black text-gray-800 text-sm">Photo ready</p>
                  <p className="text-xs text-gray-400 font-medium mt-0.5">
                    Click &quot;Take Photo&quot; or &quot;Upload File&quot; to change
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3 pt-10">
            <button
              type="submit"
              disabled={isLoading}
              onClick={() => {
                submitModeRef.current = activeSession ? "clinic" : "plain";
              }}
              className="w-full bg-brand-orange hover:bg-brand-dark-orange text-white py-4 rounded-2xl font-black shadow-lg shadow-orange-500/20 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading && <Loader2 className="animate-spin" size={20} />}
              {isLoading
                ? "SAVING..."
                : activeSession
                  ? `REGISTER FOR ${activeSession.clinicName.toUpperCase()}`
                  : "ADD PATIENT"}
            </button>

            {!activeSession && (
              <button
                type="submit"
                disabled={isLoading}
                onClick={() => { submitModeRef.current = "visit"; }}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-2xl font-black shadow-lg shadow-emerald-500/20 transition-all active:scale-95 disabled:opacity-50"
              >
                ADD &amp; START VISIT
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
