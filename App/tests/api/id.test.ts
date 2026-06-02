import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, PUT } from "~/app/api/patients/[id]/route";
import { db } from "~/server/db";
import { NextRequest } from "next/server";
import { makePatientRecord, patientRecordToJson } from "../factories/patientFactory";

vi.mock("~/server/db", () => ({
  db: {
    client: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

const mockedDb = vi.mocked(db, true);

const getValidJsonBody = (record: ReturnType<typeof makePatientRecord>) => {
  const json = patientRecordToJson(record);
  const { profileImage: _, ...rest } = json;
  return rest;
};

const createRequest = (url: string, method: "GET" | "PUT", body?: unknown, isFormData = false) =>
  new NextRequest(url, {
    method,
    body: isFormData ? (body as BodyInit) : body ? JSON.stringify(body) : undefined,
  });

beforeEach(() => {
  vi.clearAllMocks();
});

describe("Patients API - [id] route", () => {
  const PATIENT_ID = "abc123";
  const BASE_URL = `http://localhost:3000/api/patients/${PATIENT_ID}`;
  const PARAMS = { params: Promise.resolve({ id: PATIENT_ID }) };

  describe("GET /api/patients/[id]", () => {
    it("returns 200 and patient details when record exists", async () => {
      const mockRecord = makePatientRecord({ id: PATIENT_ID });
      mockedDb.client.findUnique.mockResolvedValue(mockRecord);

      const res = await GET(createRequest(BASE_URL, "GET"), PARAMS);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.details).toEqual(patientRecordToJson(mockRecord));
      expect(json.details.drugHistory).toBe(mockRecord.drugHistory);
    });

    it("returns 404 when the patient ID does not exist", async () => {
      mockedDb.client.findUnique.mockResolvedValue(null);

      const res = await GET(createRequest(BASE_URL, "GET"), PARAMS);

      expect(res.status).toBe(404);
      expect((await res.json()).msg).toBe("Patient not found");
    });

    it("returns 400 when ID validation fails (empty ID)", async () => {
      const res = await GET(
        createRequest("http://localhost:3000/api/patients/", "GET"),
        { params: Promise.resolve({ id: "" }) },
      );

      expect(res.status).toBe(400);
    });
  });

  describe("PUT /api/patients/[id]", () => {
    it("successfully updates via JSON and maintains history", async () => {
      const oldRecord = makePatientRecord({ id: PATIENT_ID });
      const updateData = { ...getValidJsonBody(oldRecord), fullName: "Updated Name" };

      const updatedRecord = { ...oldRecord, fullName: "Updated Name" };
      mockedDb.client.update.mockResolvedValue(updatedRecord);

      const res = await PUT(createRequest(BASE_URL, "PUT", updateData), PARAMS);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.details.fullName).toBe("Updated Name");
      expect(json.details.drugHistory).toBe(oldRecord.drugHistory);
    });

    it("successfully updates profile image via FormData", async () => {
      const oldRecord = makePatientRecord({ id: PATIENT_ID });
      const buffer = Buffer.from("fake-image-data");

      const formData = new FormData();
      const fields = getValidJsonBody(oldRecord);
      Object.entries(fields).forEach(([key, val]) => formData.append(key, String(val)));
      formData.append("profileImage", new File([buffer], "profile.jpg", { type: "image/jpeg" }));

      mockedDb.client.update.mockResolvedValue({ ...oldRecord, profileImage: buffer as unknown as Uint8Array<ArrayBuffer> });

      const res = await PUT(createRequest(BASE_URL, "PUT", formData, true), PARAMS);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.details.profileImage).toBe(buffer.toString("base64"));
    });

    it("returns 400 when required history fields are missing", async () => {
      const res = await PUT(createRequest(BASE_URL, "PUT", { fullName: "New Name" }), PARAMS);
      const json = await res.json();

      expect(res.status).toBe(400);
      expect(json.msg).toBe("Validation failed");
    });

    it("returns 500 when database update fails", async () => {
      mockedDb.client.update.mockRejectedValue(new Error("Prisma Error"));
      const validData = getValidJsonBody(makePatientRecord());

      const res = await PUT(createRequest(BASE_URL, "PUT", validData), PARAMS);
      const json = await res.json();

      expect(res.status).toBe(500);
      expect(json.error).toBe("Prisma Error");
    });
  });
});
