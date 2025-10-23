import { vi, describe, it, expect } from "vitest";
import { GET } from "~/app/api/clients/search/route";
import { db } from "~/server/db";

// These tests function correctly and tests for all return results and have all passed.
// I mock the request, and resolved db values in order to get the correct response from the api
// To test the GET request you need to change parts of the function in clients/search/route, which is explained in the file
// All test explanations is in the csv file

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

        // These are two clients in the database
        const mockClients = [
            {
                id: "1",
                fullName: "John Doe",
                email: "john@example.com",
                phoneNumber: "1234567890",
                address: "123 Main St",
                notes: "VIP client",
                createdAt: now,
                updatedAt: now,
            },
            {
                id: "2",
                fullName: "Jane Smith",
                email: "jane@example.com",
                phoneNumber: "9876543210",
                address: "456 Elm St",
                notes: "Returning client",
                createdAt: now,
                updatedAt: now,
            },
        ];

        // It Mocked it, so that it will only return the first client based on the qeury "john"
        mockedDb.client.findMany.mockResolvedValue([mockClients[0]]);

        const response = await GET(
            new Request("http://localhost:3000/api/clients/search?query=john")
        );
        const json = await response.json();

        // Here is the result including how prisma gets the result, and the mode
        expect(response.status).toBe(200);
        expect(json).toEqual([
            {
                ...mockClients[0],
                createdAt: mockClients[0].createdAt.toISOString(),
                updatedAt: mockClients[0].updatedAt.toISOString(),
            }
        ]);
    });


    it("handles missing query", async () => {
        mockedDb.client.findMany.mockResolvedValue([]);

        const response = await GET(
            new Request("http://localhost:3000/api/clients/search")
        );

        const json = await response.json();

        // This returns a array with everything, because nothing matches a empty string
        expect(response.status).toBe(200);
        expect(Array.isArray(json)).toBe(true);
        expect(mockedDb.client.findMany).toHaveBeenCalledWith({
            where: {
                OR: [
                    { fullName: { contains: "", mode: "insensitive" } },
                    { email: { contains: "", mode: "insensitive" } },
                    { phoneNumber: { contains: "", mode: "insensitive" } },
                ],
            },
        });
    });
});
