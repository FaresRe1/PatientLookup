interface VisitDetailProps {
  label: string;
  value?: string | null;
}

export function VisitDetail({ label, value }: VisitDetailProps) {
  if (!value) return null;
  return (
    <div className="space-y-1.5">
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
        {label}
      </p>
      <p className="text-gray-700 font-semibold leading-relaxed text-sm lg:text-base">
        {value}
      </p>
    </div>
  );
}
