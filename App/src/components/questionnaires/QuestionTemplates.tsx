export function TextField({
  label,
  value,
  setter,
  placeholder,
  icon,
}: {
  label: string;
  value: string;
  setter: (v: string) => void;
  placeholder?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-start gap-2">
        {icon && <span className="mt-0.5 text-gray-400">{icon}</span>}
        <p className="text-sm font-semibold text-gray-700 leading-snug">
          {label}
        </p>
      </div>

      <input
        type="text"
        value={value}
        onChange={(e) => setter(e.target.value)}
        placeholder={placeholder ?? "Enter response..."}
        className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl focus:ring-4 focus:ring-orange-100 focus:bg-white outline-none font-medium transition-all text-gray-800 placeholder:text-gray-300 shadow-sm"
      />
    </div>
  );
}

export function CheckboxGroup({
  label,
  options,
  values,
  setter,
  helperText,
}: {
  label: string;
  options: string[];
  values: string[];
  setter: (v: string[]) => void;
  helperText?: string;
}) {
  function toggleOption(option: string) {
    if (values.includes(option)) {
      setter(values.filter((v) => v !== option));
    } else {
      setter([...values, option]);
    }
  }

  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-semibold text-gray-700">{label}</p>
        {helperText && (
          <p className="text-xs text-gray-400 mt-1">{helperText}</p>
        )}
      </div>

      <div className="space-y-2">
        {options.map((option) => (
          <label
            key={option}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <input
              type="checkbox"
              checked={values.includes(option)}
              onChange={() => toggleOption(option)}
              className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
            />
            <span className="text-sm text-gray-700 group-hover:text-white">
              {option}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}

export function CheckboxGroupWithOther({
  label,
  options,
  values,
  setter,
  otherLabel = "Other",
  otherValue,
  setOtherValue,
  otherPlaceholder = "Please specify...",
  helperText,
}: {
  label: string;
  options: string[];
  values: string[];
  setter: (v: string[]) => void;

  otherLabel?: string;
  otherValue: string;
  setOtherValue: (v: string) => void;
  otherPlaceholder?: string;

  helperText?: string;
}) {
  const hasOther = values.includes(otherLabel);

  function toggleOption(option: string) {
    if (values.includes(option)) {
      const next = values.filter((v) => v !== option);
      setter(next);
      if (option === otherLabel) setOtherValue("");
      return;
    }

    setter([...values, option]);
  }

  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-semibold text-gray-700">{label}</p>
        {helperText && (
          <p className="text-xs text-gray-400 mt-1">{helperText}</p>
        )}
      </div>

      <div className="space-y-2">
        {options.map((option) => (
          <label
            key={option}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <input
              type="checkbox"
              checked={values.includes(option)}
              onChange={() => toggleOption(option)}
              className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
            />
            <span className="text-sm text-gray-700 group-hover:text-white">
              {option}
            </span>
          </label>
        ))}

        <label className="flex items-center gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={hasOther}
            onChange={() => toggleOption(otherLabel)}
            className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
          />
          <span className="text-sm text-gray-700 group-hover:text-white">
            {otherLabel}
          </span>
        </label>

        {hasOther && (
          <div className="ml-7">
            <TextField
              label={`${otherLabel} (please specify)`}
              value={otherValue}
              setter={setOtherValue}
              placeholder={otherPlaceholder}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export function RadioGroup({
  label,
  options,
  value,
  setter,
  helperText,
}: {
  label: string;
  options: string[];
  value: string;
  setter: (v: string) => void;
  helperText?: string;
}) {
  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-semibold text-gray-700">{label}</p>
        {helperText && (
          <p className="text-xs text-gray-400 mt-1">{helperText}</p>
        )}
      </div>

      <div className="space-y-2">
        {options.map((option) => (
          <label
            key={option}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <input
              type="radio"
              checked={value === option}
              onChange={() => setter(option)}
              className="h-4 w-4 border-gray-300 text-orange-600 focus:ring-orange-500"
            />
            <span className="text-sm text-gray-700 group-hover:text-white">
              {option}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}
