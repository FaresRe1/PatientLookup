import { ClientCreate } from "~/models/client";

let seq = 0;
export function makeClient(overrides: Partial<Record<string, any>> = {}) {
  seq += 1;
  const candidate = {
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
  };

  return ClientCreate.parse(candidate);
}

// Create a full DB-style client record (includes id, timestamps, revision, etc.)
export function makeClientRecord(overrides: Partial<Record<string, any>> = {}) {
  seq += 1;
  const now = overrides.createdAt ?? new Date();

  const record = {
    id: overrides.id ?? `ckx${seq}`,
    createdAt: overrides.createdAt ?? now,
    updatedAt: overrides.updatedAt ?? now,
    fullName: overrides.fullName ?? `Test User ${seq}`,
    gender: overrides.gender ?? "Other",
    dob: overrides.dob ? (overrides.dob instanceof Date ? overrides.dob : new Date(overrides.dob)) : new Date("1990-01-01"),
    email: Object.prototype.hasOwnProperty.call(overrides, "email") ? overrides.email : `test${seq}@example.com`,
    phoneNumber: Object.prototype.hasOwnProperty.call(overrides, "phoneNumber") ? overrides.phoneNumber : `000000000${seq}`,
    address: Object.prototype.hasOwnProperty.call(overrides, "address") ? overrides.address : `Test Address ${seq}`,
    profileImage: overrides.profileImage ?? null,
    drugHistory: overrides.drugHistory ?? `Drug history for user ${seq}`,
    familyHistory: overrides.familyHistory ?? `Family history for user ${seq}`,
    socialHistory: overrides.socialHistory ?? `Social history for user ${seq}`,

    deletedAt: overrides.deletedAt ?? null,
    lastModified: overrides.lastModified ?? now,
    revision: overrides.revision ?? 0,

    ...overrides,
  };

  return record;
}

export function clientRecordToJson(c: any) {
  return {
    ...c,
    createdAt: c.createdAt instanceof Date ? c.createdAt.toISOString() : c.createdAt,
    updatedAt: c.updatedAt instanceof Date ? c.updatedAt.toISOString() : c.updatedAt,
    dob: c.dob instanceof Date ? c.dob.toISOString() : c.dob,
    lastModified: c.lastModified instanceof Date ? c.lastModified.toISOString() : c.lastModified,
    deletedAt: c.deletedAt instanceof Date ? c.deletedAt.toISOString() : c.deletedAt,
    profileImage: c.profileImage ? Buffer.from(c.profileImage).toString('base64') : null,
    drugHistory: c.drugHistory,
    familyHistory: c.familyHistory,
    socialHistory: c.socialHistory,
  };
}
