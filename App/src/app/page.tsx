"use client";
import Link from "next/link";
import { Search, Plus, User, Loader2 } from "lucide-react";
import { usePatients } from "~/hooks/usePatients";

export default function Home() {
  const { clients, searchTerm, setSearchTerm, isLoading, error } = usePatients();

  return (
    <div className="space-y-10 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Patient Records</h2>
          <p className="text-gray-500 mt-1">Manage all registered patient profiles and histories</p>
        </div>
        <Link
          href="/add-client"
          className="flex items-center gap-2 bg-brand-orange hover:bg-brand-dark-orange text-white px-6 py-2.5 rounded-xl transition-all shadow-md active:scale-95 font-bold text-sm"
        >
          <Plus size={18} strokeWidth={3} />
          Add Patient
        </Link>
      </div>

      {/* Search Bar */}
      <div className="relative group">
        <Search 
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-orange transition-colors" 
          size={22} 
        />
        <input
          type="text"
          placeholder="Search by name or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-4 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-100 bg-white shadow-sm text-lg transition-all"
        />
        {isLoading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <Loader2 className="animate-spin text-brand-orange" size={20} />
          </div>
        )}
      </div>

      {/* User Table Box */}
      <div className="bg-white rounded-3xl shadow-clean border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-orange-50/50 border-b border-orange-100">
            <tr>
              <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Patient Name</th>
              <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Contact Info</th>
              <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {clients.length > 0 ? (
              clients.map((client) => (
                <tr key={client.id} className="hover:bg-brand-cream/50 transition-colors group">
                  <td className="px-8 py-6">
                    <span className="text-gray-900 font-bold text-lg">{client.fullName}</span>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-gray-500 font-medium">{client.email || "No email provided"}</span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex justify-center">
                      <Link
                        href={`/clients/${client.id}`}
                        className="p-3 text-brand-orange hover:bg-orange-100 rounded-xl transition-all"
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