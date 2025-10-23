import { describe, it, expect, vi } from "vitest";
import { GET } from "~/app/api/clients/[id]/route";
import { db } from "~/server/db";

// These tests function correctly and tests for all return results and have all passed. 
// I mock the request, and resolved db values in order to get the correct response from the api
// All test explanations is in the csv file

vi.mock("~/server/db", () => ({
    db: {
        client: {
            findUnique: vi.fn(),
        },
    },
}));

const mockedDb = vi.mocked(db, true);

describe("Clients API - GET /api/clients/[id]", () => {
    it("returns client details when found", async () => {
        const now = new Date();

        // This is the mocked data from the database
        const mockClient = {
            id: "abc123",
            fullName: "John Doe",
            email: "john@example.com",
            phoneNumber: "1234567890",
            address: "123 Main St",
            notes: "VIP client",
            createdAt: now,
            updatedAt: now,
        };

        mockedDb.client.findUnique.mockResolvedValue(mockClient);

        // The id matches what is in the mocked client
        const response = await GET(
            new Request("http://localhost:3000/api/clients/abc123"),
            { params: Promise.resolve({ id: "abc123" }) }
        );

        const json = await response.json();

        // The result will be the data that I mocked, with the correct status code
        expect(response.status).toBe(200);
        expect(json.details).toEqual({
            ...mockClient,
            createdAt: mockClient.createdAt.toISOString(),
            updatedAt: mockClient.updatedAt.toISOString(),
        });

        // This is how prisma finds the client from the db
        expect(mockedDb.client.findUnique).toHaveBeenCalledWith({
            where: { id: "abc123" },
        });
    });

    it("returns 400 if id validation fails", async () => {
        const response = await GET(
            new Request("http://localhost:3000/api/clients/"),
            { params: Promise.resolve({ id: "" }) }
        );

        // This is expected because Zod expects a string of min 1 to function
        const json = await response.json();
        expect(response.status).toBe(400);
        expect(json.msg).toBe("Validation failed");
    });

    it("returns 404 if id is not found", async () => {
        mockedDb.client.findUnique.mockResolvedValue(null);

        const response = await GET(
            new Request("http://localhost:3000/api/clients/unknown"),
            { params: Promise.resolve({ id: "unknown" }) }
        );

        // This is expected when prisma can not find the id in the db
        const json = await response.json();
        expect(response.status).toBe(404);
        expect(json.msg).toBe("Failed to find client information");
    });
});
