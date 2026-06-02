interface HistoryItemProps {
  label: string;
  name: string;
  value?: string | null;
  editValue?: string | null;
  isEditing: boolean;
  onChange: (updater: (prev: Record<string, unknown>) => Record<string, unknown>) => void;
}

export function HistoryItem({
  label,
  name,
  value,
  editValue,
  isEditing,
  onChange,
}: HistoryItemProps) {
  return (
    <div className="bg-orange-50/40 p-8 rounded-[2rem] border border-orange-100/60">
      <p className="text-[10px] font-black text-brand-dark-orange uppercase tracking-[0.2em] mb-4">
        {label}
      </p>
      {isEditing ? (
        <textarea
          value={editValue ?? ""}
          onChange={(e) =>
            onChange((prev) => ({ ...prev, [name]: e.target.value }))
          }
          className="w-full bg-white border border-orange-200 p-4 rounded-2xl focus:ring-4 focus:ring-orange-100 outline-none min-h-[140px] font-medium"
        />
      ) : (
        <p className="text-gray-700 leading-relaxed font-semibold">
          {value || "No records provided."}
        </p>
      )}
    </div>
  );
}
