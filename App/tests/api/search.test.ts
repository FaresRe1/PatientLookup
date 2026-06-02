import { vi, describe, it, expect } from "vitest";
import { GET } from "~/app/api/patients/search/route";
import { db } from "~/server/db";
import { makePatientRecord, patientRecordToJson } from "../factories/patientFactory";
import { NextRequest } from "next/server";

vi.mock("~/server/db", () => ({
  db: {
    client: {
      findMany: vi.fn(),
    },
  },
}));

const mockedDb = vi.mocked(db, true);

describe("Patients API - SEARCH", () => {
  it("returns patients matching the query", async () => {
    const now = new Date();
    const a = makePatientRecord({ id: "1", fullName: "John Doe", email: "john@example.com", phoneNumber: "1234567890", address: "123 Main St", createdAt: now, updatedAt: now });

    mockedDb.client.findMany.mockResolvedValue([a]);

    const response = await GET(
      new NextRequest("http://localhost:3000/api/patients/search?query=john"),
    );
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toEqual([patientRecordToJson(a)]);
  });

  it("handles missing query", async () => {
    mockedDb.client.findMany.mockResolvedValue([]);

    const response = await GET(
      new NextRequest("http://localhost:3000/api/patients/search"),
    );
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(Array.isArray(json)).toBe(true);
    expect(mockedDb.client.findMany).toHaveBeenCalledWith({
      where: {
        OR: [
          { fullName: { contains: "" } },
          { email: { contains: "" } },
          { phoneNumber: { contains: "" } },
        ],
      },
    });
  });
});
