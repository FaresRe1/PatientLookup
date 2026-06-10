"use client";
import Link from "next/link";
import { Search, Plus, User, Loader2, ArrowLeft } from "lucide-react";
import { usePatients } from "~/hooks/usePatients";

export default function PatientsPage() {
  const { patients, searchTerm, setSearchTerm, isLoading } = usePatients();

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-[#266AFB] hover:text-[#003588] font-bold transition-colors text-sm"
          >
            <ArrowLeft size={16} />
            Hub
          </Link>
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Patient Records</h2>
            <p className="text-gray-500 mt-1 text-sm">All registered patients</p>
          </div>
        </div>
        <Link
          href="/add-patient"
          className="flex items-center gap-2 bg-[#266AFB] hover:bg-[#003588] text-white px-6 py-2.5 rounded-xl transition-all shadow-md active:scale-95 font-bold text-sm"
        >
          <Plus size={18} strokeWidth={3} />
          Add Patient
        </Link>
      </div>

      <div className="relative group">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#266AFB] transition-colors"
          size={22}
        />
        <input
          type="text"
          placeholder="Search by name or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-4 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-100 bg-white shadow-sm text-lg transition-all"
        />
        {isLoading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <Loader2 className="animate-spin text-[#266AFB]" size={20} />
          </div>
        )}
      </div>

      <div className="bg-white rounded-3xl shadow-clean border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-[#EBF1FF]/50 border-b border-[#D6E4FF]">
            <tr>
              <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Patient Name</th>
              <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Phone</th>
              <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {patients.length > 0 ? (
              patients.map((patient) => (
                <tr key={patient.id} className="hover:bg-[#F5F8FF]/50 transition-colors group">
                  <td className="px-8 py-6">
                    <span className="text-gray-900 font-bold text-lg">{patient.fullName}</span>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-gray-500 font-medium">{patient.phoneNumber || "No phone"}</span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex justify-center">
                      <Link
                        href={`/patients/${patient.id}`}
                        className="p-3 text-[#266AFB] hover:bg-[#EBF1FF] rounded-xl transition-all"
                      >
                        <User size={22} />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="px-8 py-20 text-center text-gray-400 italic">
                  {isLoading ? "Fetching data..." : "No matching records found."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
