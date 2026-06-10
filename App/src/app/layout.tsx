import "../styles/globals.css";
import Link from "next/link";
import { Activity } from "lucide-react";
import { ThemeToggle } from "~/components/ThemeToggle";

export const metadata = {
  title: "Project Ziriya — Clinic",
};

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
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="bg-brand-cream min-h-screen font-sans antialiased text-gray-900">
        <header className="bg-[#003588] dark:bg-[#0A1628] text-white shadow-lg shadow-blue-900/20">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
              <Activity size={28} strokeWidth={2.5} className="header-logo-icon text-white dark:text-[#266AFB]" />
              <div>
                <h1 className="text-xl font-bold tracking-tight leading-tight">Project Ziriya</h1>
                <p className="text-xs font-medium leading-none" style={{ color: "rgba(255,255,255,0.6)" }}>Global Med</p>
              </div>
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
