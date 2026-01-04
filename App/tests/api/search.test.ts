import { vi, describe, it, expect } from "vitest";
import { GET } from "~/app/api/clients/search/route";
import { db } from "~/server/db";
import { makeClientRecord, clientRecordToJson } from "../factories/clientFactory";
import { NextRequest } from "next/server";

// Mock db
vi.mock("~/server/db", () => ({
    db: {
        client: {
            findMany: vi.fn(),
        },
    },
}));

const mockedDb = vi.mocked(db, true);

describe("Clients API - SEARCH", () => {
    it("returns clients matching the query", async () => {
        const now = new Date();

        const a = makeClientRecord({ id: "1", fullName: "John Doe", email: "john@example.com", phoneNumber: "1234567890", address: "123 Main St", createdAt: now, updatedAt: now });
        const b = makeClientRecord({ id: "2", fullName: "Jane Smith", email: "jane@example.com", phoneNumber: "9876543210", address: "456 Elm St", createdAt: now, updatedAt: now });

        // database returns only the matching client
        mockedDb.client.findMany.mockResolvedValue([a]);

        const response = await GET(
            new NextRequest("http://localhost:3000/api/clients/search?query=john")
        );
        const json = await response.json();

        // Here is the result including how prisma gets the result, and the mode
        expect(response.status).toBe(200);
        expect(json).toEqual([clientRecordToJson(a)]);
    });


    it("handles missing query", async () => {
        mockedDb.client.findMany.mockResolvedValue([]);

        const response = await GET(
            new NextRequest("http://localhost:3000/api/clients/search")
        );

        const json = await response.json();

        // This returns a array with everything, because nothing matches a empty string
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
