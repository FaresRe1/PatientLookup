import { PatientCreate } from "~/models/patient";

let seq = 0;

/** Reset the factory counter between test suites if needed. */
export function resetPatientSeq() {
  seq = 0;
}

type PatientRecordOverrides = {
  id?: string;
  createdAt?: Date;
  updatedAt?: Date;
  fullName?: string;
  gender?: string;
  dob?: Date | string;
  email?: string | null;
  phoneNumber?: string | null;
  address?: string | null;
  village?: string | null;
  profileImage?: Buffer | null;
  drugHistory?: string;
  familyHistory?: string;
  socialHistory?: string;
  deletedAt?: Date | null;
  lastModified?: Date;
  revision?: number;
};

/** Build a validated PatientCreate object (no id/timestamps). */
export function makePatient(overrides: PatientRecordOverrides = {}) {
  seq += 1;
  return PatientCreate.parse({
    fullName: `Test User ${seq}`,
    gender: "Other",
    email: `test${seq}@example.com`,
    phoneNumber: `000000000${seq}`,
    address: `Test Address ${seq}`,
    dob: "1990-01-01",
    drugHistory: `Drug history for user ${seq}`,
    familyHistory: `Family history for user ${seq}`,
    socialHistory: `Social history for user ${seq}`,
    ...overrides,
  });
}

/** Build a full DB-style record (includes id, timestamps, revision). */
export function makePatientRecord(overrides: PatientRecordOverrides = {}) {
  seq += 1;
  const now = overrides.createdAt ?? new Date();
  const dob =
    overrides.dob instanceof Date
      ? overrides.dob
      : overrides.dob
        ? new Date(overrides.dob)
        : new Date("1990-01-01");

  return {
    id: overrides.id ?? `ckx${seq}`,
    createdAt: overrides.createdAt ?? now,
    updatedAt: overrides.updatedAt ?? now,
    fullName: overrides.fullName ?? `Test User ${seq}`,
    gender: overrides.gender ?? "Other",
    dob,
    email: ("email" in overrides ? overrides.email : `test${seq}@example.com`) as string | null,
    phoneNumber: ("phoneNumber" in overrides ? overrides.phoneNumber : `000000000${seq}`) as string | null,
    address: ("address" in overrides ? overrides.address : `Test Address ${seq}`) as string | null,
    village: ("village" in overrides ? overrides.village : null) as string | null,
    profileImage: (overrides.profileImage ?? null) as Uint8Array<ArrayBuffer> | null,
    drugHistory: overrides.drugHistory ?? `Drug history for user ${seq}`,
    familyHistory: overrides.familyHistory ?? `Family history for user ${seq}`,
    socialHistory: overrides.socialHistory ?? `Social history for user ${seq}`,
    deletedAt: overrides.deletedAt ?? null,
    lastModified: overrides.lastModified ?? now,
    revision: overrides.revision ?? 0,
  };
}

/** Convert a DB record to the expected JSON response shape. */
export function patientRecordToJson(c: ReturnType<typeof makePatientRecord>) {
  return {
    ...c,
    createdAt: c.createdAt instanceof Date ? c.createdAt.toISOString() : c.createdAt,
    updatedAt: c.updatedAt instanceof Date ? c.updatedAt.toISOString() : c.updatedAt,
    dob: c.dob instanceof Date ? c.dob.toISOString() : c.dob,
    lastModified: c.lastModified instanceof Date ? c.lastModified.toISOString() : c.lastModified,
    deletedAt: c.deletedAt instanceof Date ? c.deletedAt.toISOString() : c.deletedAt,
    profileImage: c.profileImage ? Buffer.from(c.profileImage).toString("base64") : null,
  };
}
