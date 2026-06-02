import type { ReactNode } from "react";

interface DocFieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  icon?: ReactNode;
}

export function DocField({ label, value, onChange, rows = 3, icon }: DocFieldProps) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 ml-1">
        {icon}
        {label}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl focus:ring-4 focus:ring-orange-100 focus:bg-white outline-none font-medium transition-all text-gray-800 placeholder:text-gray-300 shadow-sm"
        placeholder={`Enter details for ${label.toLowerCase()}...`}
      />
    </div>
  );
}
