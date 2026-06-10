"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, Activity, ArrowLeft, Upload, Calendar, Phone, Mail, MapPin, ClipboardList, Loader2 } from "lucide-react";
import { useAddPatient } from "src/hooks/useAddPatients";

export default function AddClientPage() {
  const router = useRouter();
  const { savePatient, isLoading, error } = useAddPatient();

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const submitter = (e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement;
    const startNewVisit = submitter?.getAttribute("data-start-visit") === "true";

    const formData = new FormData(e.currentTarget);

    const result = await savePatient(formData);

    if (result.success) {
      if (startNewVisit) {
        router.push(`/clients/${result.id}/new-visit`);
      } else {
        router.push("/");
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 animate-in fade-in duration-500">
      {/* Header Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 text-[#266AFB] hover:text-[#003588] font-bold transition-colors"
        >
          <ArrowLeft size={20} strokeWidth={3} />
          Back to List
        </Link>
      </div>

      {/* Main Form Container */}
      <div className="bg-white rounded-3xl shadow-clean border border-gray-100 overflow-hidden">
        <div className="p-8 border-b border-gray-50 bg-[#EBF1FF]/30">
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
            <User className="text-[#266AFB]" size={28} />
            Add New Patient
          </h2>
          <p className="text-gray-500 mt-1 font-medium">Please provide the initial medical and personal details below.</p>
        </div>

        <form onSubmit={handleFormSubmit} className="p-8 space-y-10">
          {error && (
            <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-bold animate-in slide-in-from-top-2">
              {error}
            </div>
          )}

          {/* Personal Details Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <FormGroup label="Full Name *" icon={<User size={18} />}>
              <input name="fullName" type="text" required placeholder="John Smith" className="form-input-styled" />
            </FormGroup>

            <FormGroup label="Date of Birth *" icon={<Calendar size={18} />}>
              <input name="dob" type="date" required className="form-input-styled" />
            </FormGroup>

            <FormGroup label="Gender *" icon={<Activity size={18} />}>
              <select name="gender" required className="form-input-styled appearance-none cursor-pointer">
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </FormGroup>

            <FormGroup label="Phone Number" icon={<Phone size={18} />}>
              <input name="phoneNumber" type="tel" placeholder="+44 " className="form-input-styled" />
            </FormGroup>

            <FormGroup label="Email Address" icon={<Mail size={18} />}>
              <input name="email" type="email" placeholder="user@example.com" className="form-input-styled" />
            </FormGroup>

            <FormGroup label="Address" icon={<MapPin size={18} />}>
              <input name="address" type="text" placeholder="123 Medical St" className="form-input-styled" />
            </FormGroup>
          </div>

          {/* Medical History Section */}
          <div className="space-y-6 pt-6 border-t border-gray-50">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <ClipboardList size={16} className="text-[#266AFB]" />
              Required Medical History
            </h3>

            <FormGroup label="Dh - Drug History *">
              <textarea name="drugHistory" rows={3} required placeholder="List current medications and allergies..." className="form-input-styled py-3" />
            </FormGroup>

            <FormGroup label="Fh - Family History *">
              <textarea name="familyHistory" rows={3} required placeholder="Note any relevant hereditary conditions..." className="form-input-styled py-3" />
            </FormGroup>

            <FormGroup label="Sh - Social History *">
              <textarea name="socialHistory" rows={3} required placeholder="Smoking, exercise, occupation, etc..." className="form-input-styled py-3" />
            </FormGroup>
          </div>

          {/* File Upload with Preview */}
          <div className="pt-6 border-t border-gray-50">
            <label className="text-sm font-bold text-gray-700 mb-3 block">Profile Image (Optional)</label>
            <div className="relative group">
              <input
                type="file"
                name="profileImage"
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="border-2 border-dashed border-gray-200 rounded-2xl p-10 text-center bg-gray-50 group-hover:bg-[#EBF1FF] group-hover:border-[#266AFB]/30 transition-all flex flex-col items-center justify-center min-h-[200px] overflow-hidden">
                {previewUrl ? (
                  <div className="animate-in zoom-in duration-300">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="h-32 w-32 object-cover rounded-2xl shadow-md border-2 border-white mb-2"
                    />
                    <p className="text-[#266AFB] font-bold text-xs uppercase tracking-widest">Click to change photo</p>
                  </div>
                ) : (
                  <>
                    <Upload className="mx-auto text-[#266AFB] mb-2" size={32} />
                    <p className="text-gray-800 font-bold">Click to upload photo</p>
                    <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest font-bold">Max size 5MB</p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col md:flex-row gap-4 pt-10">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-[#266AFB] hover:bg-[#003588] text-white py-4 rounded-2xl font-black shadow-lg shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading && <Loader2 className="animate-spin" size={20} />}
              {isLoading ? "SAVING..." : "ADD PATIENT"}
            </button>
            <button
              type="submit"
              data-start-visit="true"
              disabled={isLoading}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-2xl font-black shadow-lg shadow-emerald-500/20 transition-all active:scale-95 disabled:opacity-50"
            >
              ADD & START VISIT
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function FormGroup({ label, icon, children }: { label: string, icon?: React.ReactNode, children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-bold text-gray-700 ml-1">{label}</label>
      <div className="relative">
        {icon && <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">{icon}</div>}
        {children}
      </div>
    </div>
  );
}
