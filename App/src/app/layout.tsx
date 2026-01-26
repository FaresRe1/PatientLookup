import "../styles/globals.css";
import { Activity } from "lucide-react";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#FFFBF4] min-h-screen font-sans antialiased text-gray-900">
        <header className="bg-gradient-to-r from-[#F97316] to-[#EA580C] text-white p-6 shadow-lg shadow-orange-700/20">
          <div className="max-w-7xl mx-auto flex items-center gap-3">
            <Activity size={32} strokeWidth={2.5} />
            <h1 className="text-2xl font-bold tracking-tight">Patient Record System</h1>
          </div>
        </header>

        <main className="max-w-7xl mx-auto p-8 lg:p-12">
          {children}
        </main>
      </body>
    </html>
  );
}