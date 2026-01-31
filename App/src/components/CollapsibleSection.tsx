"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
}

export default function CollapsibleSection({
  title,
  children,
}: CollapsibleSectionProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
      {/* Header */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-5 text-left"
      >
        <span className="font-bold text-gray-900">{title}</span>
        <ChevronDown
          className={`transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Content */}
      {open && (
        <div className="px-6 pb-6 pt-2 space-y-4">
          {children}
        </div>
      )}
    </div>
  );
}
