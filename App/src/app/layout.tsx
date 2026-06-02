import "../styles/globals.css";
import Link from "next/link";
import { Activity } from "lucide-react";
import { ThemeToggle } from "~/components/ThemeToggle";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Anti-flash: apply saved theme before first paint */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('theme');if(t==='dark')document.documentElement.classList.add('dark')}catch(e){}`,
          }}
        />
      </head>
      <body className="bg-brand-cream min-h-screen font-sans antialiased text-gray-900">
        <header className="bg-gradient-to-r from-[#F97316] to-[#EA580C] text-white shadow-lg shadow-orange-700/20">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
              <Activity size={28} strokeWidth={2.5} className="header-logo-icon" />
              <h1 className="text-xl font-bold tracking-tight">Patient Record System</h1>
            </Link>
            <nav className="flex items-center gap-1">
              <ThemeToggle />
            </nav>
          </div>
        </header>

        <main className="max-w-7xl mx-auto p-6 lg:p-10">{children}</main>
      </body>
    </html>
  );
}
