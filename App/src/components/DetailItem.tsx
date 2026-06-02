interface DetailItemProps {
  label: string;
  name: string;
  value?: string | null;
  editValue?: string | null;
  isEditing: boolean;
  onChange: (updater: (prev: Record<string, unknown>) => Record<string, unknown>) => void;
  type?: "text" | "date" | "select";
  options?: string[];
}

export function DetailItem({
  label,
  name,
  value,
  editValue,
  isEditing,
  onChange,
  type = "text",
  options = [],
}: DetailItemProps) {
  const handleChange = (val: string) =>
    onChange((prev) => ({ ...prev, [name]: val }));

  return (
    <div className="space-y-2">
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
        {label}
      </p>
      {isEditing ? (
        type === "select" ? (
          <select
            value={editValue ?? ""}
            onChange={(e) => handleChange(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:ring-4 focus:ring-orange-100 outline-none transition-all font-semibold"
          >
            <option value="">Select...</option>
            {options.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        ) : (
          <input
            type={type}
            value={
              type === "date" && editValue
                ? new Date(editValue).toISOString().split("T")[0]
                : editValue ?? ""
            }
            onChange={(e) => handleChange(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:ring-4 focus:ring-orange-100 outline-none transition-all font-semibold"
          />
        )
      ) : (
        <p className="text-lg font-bold text-gray-800 leading-tight">
          {value || "—"}
        </p>
      )}
    </div>
  );
}
