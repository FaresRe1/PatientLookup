import type { ReactNode } from "react";

interface FormGroupProps {
  label: string;
  icon?: ReactNode;
  children: ReactNode;
}

export function FormGroup({ label, icon, children }: FormGroupProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-bold text-gray-700 ml-1">{label}</label>
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
