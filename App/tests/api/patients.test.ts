import { vi, describe, it, expect, beforeEach } from "vitest";
import { GET, POST } from "~/app/api/patients/route";
import { db } from "~/server/db";

vi.mock("~/server/db", () => ({
  db: {
    client: {
      findMany: vi.fn(),
      create: vi.fn(),
    },
  },
}));

const mockedDb = vi.mocked(db, true);

import { makePatientRecord, patientRecordToJson } from "../factories/patientFactory";

beforeEach(() => {
  mockedDb.client.findMany.mockReset();
  mockedDb.client.create.mockReset();
});

describe("Patients API - GET", () => {
  it("returns up to 50 patients with all fields", async () => {
    const now = new Date();

    const a = makePatientRecord({ id: "ckx123abc", fullName: "John Doe", email: "john@example.com", phoneNumber: "1234567890", address: "123 Main St", createdAt: now, updatedAt: now });
    const b = makePatientRecord({ id: "ckx456def", fullName: "Jane Smith", email: null, phoneNumber: null, address: null, createdAt: now, updatedAt: now });

    mockedDb.client.findMany.mockResolvedValue([a, b]);

    const response = await GET(new Request("http://localhost/api/patients"));
    const json = await response.json();

    expect(response.status).toBe(200);
    // Response is now a plain array (no wrapper object)
    expect(json[0]).toEqual(patientRecordToJson(a));
    expect(json[1]).toEqual(patientRecordToJson(b));

    expect(mockedDb.client.findMany).toHaveBeenCalledWith({
      take: 50,
      skip: 0,
      orderBy: { fullName: "asc" },
    });
  });
});

describe("Patients API - POST", () => {
  it("creates a new patient successfully", async () => {
    const now = new Date();
    const patientData = {
      fullName: "Alice Johnson",
      gender: "female",
      dob: now.toISOString(),
      email: "alice@example.com",
      phoneNumber: "9876543210",
      address: "456 Oak St",
      drugHistory: "No known drug allergies",
      familyHistory: "Family history of diabetes",
      socialHistory: "Non-smoker",
    };

    const created = makePatientRecord({ id: "ckx789ghi", fullName: "Alice Johnson", email: "alice@example.com", phoneNumber: "9876543210", address: "456 Oak St", gender: "female", dob: now, createdAt: now, updatedAt: now });
    mockedDb.client.create.mockResolvedValue(created);

    const formData = new FormData();
    Object.entries(patientData).forEach(([key, val]) => formData.append(key, val));

    const response = await POST(
      new Request("http://localhost/api/patients", { method: "POST", body: formData }),
    );
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toEqual(patientRecordToJson(created));

    expect(mockedDb.client.create).toHaveBeenCalledWith({
      data: {
        fullName: patientData.fullName,
        gender: patientData.gender,
        dob: expect.any(Date),
        email: patientData.email,
        phoneNumber: patientData.phoneNumber,
        address: patientData.address,
        village: null,
        drugHistory: patientData.drugHistory,
        familyHistory: patientData.familyHistory,
        socialHistory: patientData.socialHistory,
        profileImage: undefined,
      },
    });
  });

  it("creates a new patient with profile image", async () => {
    const now = new Date();
    const imageBuffer = Buffer.from("fake image data");
    const created = makePatientRecord({ id: "ckx101jkl", fullName: "Bob Smith", email: "bob@example.com", gender: "male", dob: now, profileImage: imageBuffer, createdAt: now, updatedAt: now });
    mockedDb.client.create.mockResolvedValue(created);

    const formData = new FormData();
    formData.append("fullName", "Bob Smith");
    formData.append("gender", "male");
    formData.append("dob", now.toISOString());
    formData.append("email", "bob@example.com");
    formData.append("drugHistory", "Allergic to penicillin");
    formData.append("familyHistory", "Heart disease in family");
    formData.append("socialHistory", "Occasional smoker");
    formData.append("profileImage", new File([imageBuffer], "profile.jpg", { type: "image/jpeg" }));

    const response = await POST(
      new Request("http://localhost/api/patients", { method: "POST", body: formData }),
    );
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toEqual(patientRecordToJson(created));
  });

  it("returns 400 if profile image is too large", async () => {
    const formData = new FormData();
    formData.append("fullName", "Large Image User");
    formData.append("gender", "male");
    formData.append("dob", new Date().toISOString());
    formData.append("email", "large@example.com");
    formData.append("drugHistory", "No drugs");
    formData.append("familyHistory", "No issues");
    formData.append("socialHistory", "Healthy");
    formData.append("profileImage", new File([new Uint8Array(6 * 1024 * 1024)], "large.jpg", { type: "image/jpeg" }));

    const response = await POST(
      new Request("http://localhost/api/patients", { method: "POST", body: formData }),
    );
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.msg).toBe("Profile image size exceeds 5MB limit");
    expect(mockedDb.client.create).not.toHaveBeenCalled();
  });

  it("returns 400 if validation fails", async () => {
    const formData = new FormData();
    formData.append("email", "bob@example.com");

    const response = await POST(
      new Request("http://localhost/api/patients", { method: "POST", body: formData }),
    );
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.msg).toBe("Validation failed");
    expect(mockedDb.client.create).not.toHaveBeenCalled();
  });

  it("handles unique email constraint (P2002)", async () => {
    const formData = new FormData();
    formData.append("fullName", "Charlie Brown");
    formData.append("gender", "male");
    formData.append("dob", new Date().toISOString());
    formData.append("email", "existing@example.com");
    formData.append("drugHistory", "History");
    formData.append("familyHistory", "Family");
    formData.append("socialHistory", "Social");

    mockedDb.client.create.mockRejectedValue({ code: "P2002", message: "Unique constraint failed" });

    const response = await POST(
      new Request("http://localhost/api/patients", { method: "POST", body: formData }),
    );
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.msg).toBe("Patient email already in use");
  });
});
