const UNITS = ["Bytes", "KB", "MB"] as const;

/** Human-readable file-size string (e.g. "1.5 MB"). */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${Math.round((bytes / Math.pow(k, i)) * 100) / 100} ${UNITS[i]}`;
}

/** Calculate age in years from an ISO date string. */
export function getAge(dobString?: string | null): number | "N/A" {
  if (!dobString) return "N/A";
  const dob = new Date(dobString);
  return Math.abs(new Date(Date.now() - dob.getTime()).getUTCFullYear() - 1970);
}
