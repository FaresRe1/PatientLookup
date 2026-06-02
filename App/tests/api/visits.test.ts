import { vi, describe, it, expect, beforeEach } from "vitest";
import { GET, POST } from "~/app/api/visits/route";
import { db } from "~/server/db";
import { NextRequest } from "next/server";

vi.mock("~/server/db", () => ({
  db: {
    visit: {
      findMany: vi.fn(),
      create: vi.fn(),
    },
  },
}));

const mockedDb = vi.mocked(db, true);

beforeEach(() => {
  mockedDb.visit.findMany.mockReset();
  mockedDb.visit.create.mockReset();
});

describe("Visits API - GET", () => {
  it("returns all visits for a specific patient", async () => {
    const now = new Date();
    const visit1 = {
      id: "v1",
      clientId: "client123",
      doctorName: "Dr. Smith",
      presentingComplaint: "Headache",
      historyOfPresentingComplaint: "Started 2 days ago",
      observationAndExamination: "Normal vitals",
      impression: "Tension headache",
      plan: "Prescribe painkillers",
      notes: "Regular checkup",
      visitDate: now,
      createdAt: now,
      attachments: [],
    };
    const visit2 = {
      id: "v2",
      clientId: "client123",
      doctorName: "Dr. Johnson",
      presentingComplaint: "Back pain",
      historyOfPresentingComplaint: "Injury from lifting",
      observationAndExamination: "Tenderness in lower back",
      impression: "Muscle strain",
      plan: "Rest and physiotherapy",
      notes: "Follow-up visit",
      visitDate: new Date(now.getTime() - 86400000),
      createdAt: new Date(now.getTime() - 86400000),
      attachments: [],
    };

    mockedDb.visit.findMany.mockResolvedValue([visit2, visit1]);

    const response = await GET(
      new NextRequest("http://localhost:3000/api/visits?clientId=client123"),
    );
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toHaveLength(2);
    expect(json[0].doctorName).toBe("Dr. Johnson");
    expect(json[1].doctorName).toBe("Dr. Smith");

    expect(mockedDb.visit.findMany).toHaveBeenCalledWith({
      where: { clientId: "client123" },
      orderBy: { visitDate: "desc" },
      include: {
        attachments: {
          select: {
            id: true,
            fileName: true,
            fileType: true,
            fileSize: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });
  });

  it("returns 400 if clientId parameter is missing", async () => {
    const response = await GET(
      new NextRequest("http://localhost:3000/api/visits"),
    );
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.msg).toBe("clientId query parameter is required");
    expect(mockedDb.visit.findMany).not.toHaveBeenCalled();
  });

  it("returns empty array if no visits found", async () => {
    mockedDb.visit.findMany.mockResolvedValue([]);

    const response = await GET(
      new NextRequest("http://localhost:3000/api/visits?clientId=nonexistent"),
    );
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toEqual([]);
  });

  it("handles database errors gracefully", async () => {
    mockedDb.visit.findMany.mockRejectedValue(new Error("Database connection failed"));

    const response = await GET(
      new NextRequest("http://localhost:3000/api/visits?clientId=client123"),
    );
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json.msg).toBe("Failed to load visits");
    expect(json.error).toBe("Database connection failed");
  });
});

describe("Visits API - POST", () => {
  it("creates a new visit successfully", async () => {
    const now = new Date();
    const visitData = {
      clientId: "client123",
      doctorName: "Dr. Smith",
      presentingComplaint: "Headache",
      historyOfPresentingComplaint: "Started 2 days ago",
      observationAndExamination: "Normal vitals",
      impression: "Tension headache",
      plan: "Prescribe painkillers",
      notes: "Regular checkup",
      visitDate: now.toISOString(),
    };

    const createdVisit = {
      id: "visit123",
      clientId: "client123",
      doctorName: "Dr. Smith",
      presentingComplaint: "Headache",
      historyOfPresentingComplaint: "Started 2 days ago",
      observationAndExamination: "Normal vitals",
      impression: "Tension headache",
      plan: "Prescribe painkillers",
      notes: "Regular checkup",
      visitDate: now,
      createdAt: now,
    };

    mockedDb.visit.create.mockResolvedValue(createdVisit);

    const response = await POST(
      new NextRequest("http://localhost:3000/api/visits", {
        method: "POST",
        body: JSON.stringify(visitData),
      }),
    );
    const json = await response.json();

    expect(response.status).toBe(201);
    expect(json.id).toBe("visit123");
    expect(json.doctorName).toBe("Dr. Smith");
  });

  it("creates a new visit with minimal data", async () => {
    const now = new Date();
    const createdVisit = {
      id: "visit456",
      clientId: "client456",
      doctorName: "Dr. Johnson",
      presentingComplaint: "",
      historyOfPresentingComplaint: "",
      observationAndExamination: "",
      impression: "",
      plan: "",
      notes: "",
      visitDate: now,
      createdAt: now,
    };

    mockedDb.visit.create.mockResolvedValue(createdVisit);

    const response = await POST(
      new NextRequest("http://localhost:3000/api/visits", {
        method: "POST",
        body: JSON.stringify({ clientId: "client456", doctorName: "Dr. Johnson", visitDate: now.toISOString() }),
      }),
    );
    const json = await response.json();

    expect(response.status).toBe(201);
    expect(json.id).toBe("visit456");
  });

  it("returns 400 if validation fails (missing clientId)", async () => {
    const response = await POST(
      new NextRequest("http://localhost:3000/api/visits", {
        method: "POST",
        body: JSON.stringify({ doctorName: "Dr. Smith", visitDate: new Date().toISOString() }),
      }),
    );

    expect(response.status).toBe(400);
    expect((await response.json()).msg).toBe("Validation failed");
    expect(mockedDb.visit.create).not.toHaveBeenCalled();
  });

  it("returns 400 if validation fails (missing doctorName)", async () => {
    const response = await POST(
      new NextRequest("http://localhost:3000/api/visits", {
        method: "POST",
        body: JSON.stringify({ clientId: "client123", visitDate: new Date().toISOString() }),
      }),
    );

    expect(response.status).toBe(400);
    expect((await response.json()).msg).toBe("Validation failed");
  });

  it("returns 400 if validation fails (empty doctorName)", async () => {
    const response = await POST(
      new NextRequest("http://localhost:3000/api/visits", {
        method: "POST",
        body: JSON.stringify({ clientId: "client123", doctorName: "", visitDate: new Date().toISOString() }),
      }),
    );

    expect(response.status).toBe(400);
    expect((await response.json()).msg).toBe("Validation failed");
  });

  it("handles database errors gracefully", async () => {
    mockedDb.visit.create.mockRejectedValue(new Error("Database connection failed"));

    const response = await POST(
      new NextRequest("http://localhost:3000/api/visits", {
        method: "POST",
        body: JSON.stringify({ clientId: "client123", doctorName: "Dr. Smith", visitDate: new Date().toISOString() }),
      }),
    );
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json.msg).toBe("Failed to save visit");
  });
});
