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
    ...overrides,
  };

  return ClientCreate.parse(candidate);
}
