import { vi, describe, it, expect, beforeEach } from "vitest";
import { GET, POST } from "~/app/api/visits/route";
import { db } from "~/server/db";

vi.mock("~/server/db", () => ({
    db: {
        visit: {
            findMany: vi.fn(),
            create: vi.fn(),
        },
    },
}));

const mockedDb = vi.mocked(db, true);

import { makeVisit } from "../factories/visitFactory";
import { NextRequest } from "next/server";

beforeEach(() => {
    mockedDb.visit.findMany.mockReset();
    mockedDb.visit.create.mockReset();
});

//------------------------------------------- GET REQUEST TESTING----------------------------------------------------

describe("Visits API - GET", () => {
    it("returns all visits for a specific client", async () => {
        const now = new Date();
        const visit1 = {
            id: "v1",
            clientId: "client123",
            doctorName: "Dr. Smith",
            notes: "Regular checkup",
            visitDate: now,
            createdAt: now,
            forms: [],
        };
        const visit2 = {
            id: "v2",
            clientId: "client123",
            doctorName: "Dr. Johnson",
            notes: "Follow-up visit",
            visitDate: new Date(now.getTime() - 86400000), // 1 day ago
            createdAt: new Date(now.getTime() - 86400000),
            forms: [],
        };

        mockedDb.visit.findMany.mockResolvedValue([visit2, visit1]);

        const response = await GET(
            new NextRequest("http://localhost:3000/api/visits?clientId=client123")
        );

        const json = await response.json();

        expect(response.status).toBe(200);
        expect(json).toHaveLength(2);
        expect(json[0].doctorName).toBe("Dr. Johnson");
        expect(json[1].doctorName).toBe("Dr. Smith");

        expect(mockedDb.visit.findMany).toHaveBeenCalledWith({
            where: { clientId: "client123" },
            orderBy: { visitDate: "desc" },
            include: { forms: true },
        });
    });

    it("returns 400 if clientId parameter is missing", async () => {
        const response = await GET(
            new NextRequest("http://localhost:3000/api/visits")
        );

        const json = await response.json();
        expect(response.status).toBe(400);
        expect(json.msg).toBe("clientId query parameter is required");
        expect(mockedDb.visit.findMany).not.toHaveBeenCalled();
    });

    it("returns empty array if no visits found", async () => {
        mockedDb.visit.findMany.mockResolvedValue([]);

        const response = await GET(
            new NextRequest("http://localhost:3000/api/visits?clientId=nonexistent")
        );

        const json = await response.json();
        expect(response.status).toBe(200);
        expect(json).toEqual([]);
    });

    it("handles database errors gracefully", async () => {
        mockedDb.visit.findMany.mockRejectedValue(new Error("Database connection failed"));

        const response = await GET(
            new NextRequest("http://localhost:3000/api/visits?clientId=client123")
        );

        const json = await response.json();
        expect(response.status).toBe(500);
        expect(json.msg).toBe("Failed to load visits");
        expect(json.error).toBe("Database connection failed");
    });
});

//------------------------------------------- POST REQUEST TESTING----------------------------------------------------

describe("Visits API - POST", () => {
    it("creates a new visit successfully", async () => {
        const now = new Date();
        const visitData = {
            clientId: "client123",
            doctorName: "Dr. Smith",
            notes: "Regular checkup",
            visitDate: now.toISOString(),
        };

        const createdVisit = {
            id: "visit123",
            clientId: "client123",
            doctorName: "Dr. Smith",
            notes: "Regular checkup",
            visitDate: now,
            createdAt: now,
        };

        mockedDb.visit.create.mockResolvedValue(createdVisit);

        const response = await POST(
            new NextRequest("http://localhost:3000/api/visits", {
                method: "POST",
                body: JSON.stringify(visitData),
            })
        );

        const json = await response.json();

        expect(response.status).toBe(201);
        expect(json.id).toBe("visit123");
        expect(json.clientId).toBe("client123");
        expect(json.doctorName).toBe("Dr. Smith");
        expect(json.notes).toBe("Regular checkup");

        expect(mockedDb.visit.create).toHaveBeenCalledWith({
            data: {
                clientId: "client123",
                doctorName: "Dr. Smith",
                notes: "Regular checkup",
                visitDate: expect.any(Date),
            },
        });
    });

    it("creates a new visit with minimal data (no notes)", async () => {
        const now = new Date();
        const visitData = {
            clientId: "client456",
            doctorName: "Dr. Johnson",
            visitDate: now.toISOString(),
        };

        const createdVisit = {
            id: "visit456",
            clientId: "client456",
            doctorName: "Dr. Johnson",
            notes: "",
            visitDate: now,
            createdAt: now,
        };

        mockedDb.visit.create.mockResolvedValue(createdVisit);

        const response = await POST(
            new NextRequest("http://localhost:3000/api/visits", {
                method: "POST",
                body: JSON.stringify(visitData),
            })
        );

        const json = await response.json();

        expect(response.status).toBe(201);
        expect(json.id).toBe("visit456");
        expect(json.doctorName).toBe("Dr. Johnson");
        expect(mockedDb.visit.create).toHaveBeenCalled();
    });

    it("returns 400 if validation fails (missing clientId)", async () => {
        const now = new Date();
        const invalidData = {
            doctorName: "Dr. Smith",
            visitDate: now.toISOString(),
        };

        const response = await POST(
            new NextRequest("http://localhost:3000/api/visits", {
                method: "POST",
                body: JSON.stringify(invalidData),
            })
        );

        const json = await response.json();

        expect(response.status).toBe(400);
        expect(json.msg).toBe("Validation failed");
        expect(json.errors).toBeDefined();
        expect(mockedDb.visit.create).not.toHaveBeenCalled();
    });

    it("returns 400 if validation fails (missing doctorName)", async () => {
        const now = new Date();
        const invalidData = {
            clientId: "client123",
            visitDate: now.toISOString(),
        };

        const response = await POST(
            new NextRequest("http://localhost:3000/api/visits", {
                method: "POST",
                body: JSON.stringify(invalidData),
            })
        );

        const json = await response.json();

        expect(response.status).toBe(400);
        expect(json.msg).toBe("Validation failed");
        expect(mockedDb.visit.create).not.toHaveBeenCalled();
    });

    it("returns 400 if validation fails (missing visitDate)", async () => {
        const invalidData = {
            clientId: "client123",
            doctorName: "Dr. Smith",
        };

        const response = await POST(
            new NextRequest("http://localhost:3000/api/visits", {
                method: "POST",
                body: JSON.stringify(invalidData),
            })
        );

        const json = await response.json();

        expect(response.status).toBe(400);
        expect(json.msg).toBe("Validation failed");
        expect(mockedDb.visit.create).not.toHaveBeenCalled();
    });

    it("returns 400 if validation fails (empty doctorName)", async () => {
        const now = new Date();
        const invalidData = {
            clientId: "client123",
            doctorName: "",
            visitDate: now.toISOString(),
        };

        const response = await POST(
            new NextRequest("http://localhost:3000/api/visits", {
                method: "POST",
                body: JSON.stringify(invalidData),
            })
        );

        const json = await response.json();

        expect(response.status).toBe(400);
        expect(json.msg).toBe("Validation failed");
        expect(mockedDb.visit.create).not.toHaveBeenCalled();
    });

    it("handles database errors gracefully", async () => {
        const now = new Date();
        const visitData = {
            clientId: "client123",
            doctorName: "Dr. Smith",
            notes: "Regular checkup",
            visitDate: now.toISOString(),
        };

        mockedDb.visit.create.mockRejectedValue(new Error("Database connection failed"));

        const response = await POST(
            new NextRequest("http://localhost:3000/api/visits", {
                method: "POST",
                body: JSON.stringify(visitData),
            })
        );

        const json = await response.json();

        expect(response.status).toBe(500);
        expect(json.msg).toBe("Failed to save visit");
        expect(json.error).toBe("Database connection failed");
    });
});
