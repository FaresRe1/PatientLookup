import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, PUT } from "~/app/api/clients/[id]/route";
import { db } from "~/server/db";

// These tests function correctly and tests for all return results and have all passed. 
// I mock the request, and resolved db values in order to get the correct response from the api
// All test explanations is in the csv file

vi.mock("~/server/db", () => ({
    db: {
        client: {
            findUnique: vi.fn(),
            update: vi.fn(),
        },
    },
}));

const mockedDb = vi.mocked(db, true);

import { makeClientRecord, clientRecordToJson } from "../factories/clientFactory";
import { NextRequest } from "next/server";

beforeEach(() => {
    mockedDb.client.findUnique.mockReset();
    mockedDb.client.update.mockReset();
});

describe("Clients API - GET /api/clients/[id]", () => {
    it("returns client details when found", async () => {
        const now = new Date();

        // This is the mocked data from the database
        const mockClient = makeClientRecord({ id: "abc123", fullName: "John Doe", email: "john@example.com", phoneNumber: "1234567890", address: "123 Main St", createdAt: now, updatedAt: now });

        mockedDb.client.findUnique.mockResolvedValue(mockClient);

        // The id matches what is in the mocked client
        const response = await GET(
            new NextRequest("http://localhost:3000/api/clients/abc123"),
            { params: Promise.resolve({ id: "abc123" }) }
        );

        const json = await response.json();

        // The result will be the data that I mocked, with the correct status code
        expect(response.status).toBe(200);
        expect(json.details).toEqual(clientRecordToJson(mockClient));

        // This is how prisma finds the client from the db
        expect(mockedDb.client.findUnique).toHaveBeenCalledWith({
            where: { id: "abc123" },
        });
    });

    it("returns 400 if id validation fails", async () => {
        const response = await GET(
            new NextRequest("http://localhost:3000/api/clients/"),
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
            new NextRequest("http://localhost:3000/api/clients/unknown"),
            { params: Promise.resolve({ id: "unknown" }) }
        );

        // This is expected when prisma can not find the id in the db
        const json = await response.json();
        expect(response.status).toBe(404);
        expect(json.msg).toBe("Failed to find client information");
    });
});

describe("Clients API - PUT /api/clients/[id]", () => {
    it("updates client successfully with all fields", async () => {
        const now = new Date();
        const oldClient = makeClientRecord({ id: "abc123", fullName: "John Doe", email: "john@example.com", gender: "male", dob: new Date("1990-01-01"), createdAt: now, updatedAt: now });
        
        const updateData = {
            fullName: "John Smith",
            email: "john.smith@example.com",
            gender: "male",
            dob: "1990-06-15",
            phoneNumber: "9876543210",
            address: "456 New St",
        };

        const updatedClient = makeClientRecord({ id: "abc123", fullName: "John Smith", email: "john.smith@example.com", gender: "male", dob: new Date("1990-06-15"), phoneNumber: "9876543210", address: "456 New St", createdAt: now, updatedAt: now });
        mockedDb.client.update.mockResolvedValue(updatedClient);

        const response = await PUT(
            new NextRequest("http://localhost:3000/api/clients/abc123", {
                method: "PUT",
                body: JSON.stringify(updateData),
            }),
            { params: Promise.resolve({ id: "abc123" }) }
        );

        const json = await response.json();
        
        expect(response.status).toBe(200);
        expect(json.msg).toBe("Client updated successfully");
        expect(json.details.fullName).toBe("John Smith");
        expect(json.details.email).toBe("john.smith@example.com");
        expect(mockedDb.client.update).toHaveBeenCalledWith({
            where: { id: "abc123" },
            data: expect.objectContaining({
                fullName: "John Smith",
                email: "john.smith@example.com",
            }),
        });
    });

    it("updates client with partial data", async () => {
        const now = new Date();
        const oldClient = makeClientRecord({ id: "abc123", fullName: "Jane Doe", email: "jane@example.com", phoneNumber: "1111111111", createdAt: now, updatedAt: now });
        
        const updateData = {
            fullName: "Jane Johnson",
            phoneNumber: "2222222222",
        };

        const updatedClient = makeClientRecord({ id: "abc123", fullName: "Jane Johnson", email: "jane@example.com", phoneNumber: "2222222222", createdAt: now, updatedAt: now });
        mockedDb.client.update.mockResolvedValue(updatedClient);

        const response = await PUT(
            new NextRequest("http://localhost:3000/api/clients/abc123", {
                method: "PUT",
                body: JSON.stringify(updateData),
            }),
            { params: Promise.resolve({ id: "abc123" }) }
        );

        const json = await response.json();
        
        expect(response.status).toBe(200);
        expect(json.msg).toBe("Client updated successfully");
        expect(json.details.fullName).toBe("Jane Johnson");
        expect(json.details.phoneNumber).toBe("2222222222");
    });

    it("returns 400 if id validation fails", async () => {
        const response = await PUT(
            new NextRequest("http://localhost:3000/api/clients/", {
                method: "PUT",
                body: JSON.stringify({ fullName: "Test" }),
            }),
            { params: Promise.resolve({ id: "" }) }
        );

        const json = await response.json();
        expect(response.status).toBe(400);
        expect(json.msg).toBe("Invalid ID");
    });

    it("returns 400 if validation fails for update data", async () => {
        const invalidData = {
            fullName: "", // Empty name should fail validation
        };

        const response = await PUT(
            new NextRequest("http://localhost:3000/api/clients/abc123", {
                method: "PUT",
                body: JSON.stringify(invalidData),
            }),
            { params: Promise.resolve({ id: "abc123" }) }
        );

        const json = await response.json();
        expect(response.status).toBe(400);
        expect(json.msg).toBe("Validation failed");
        expect(mockedDb.client.update).not.toHaveBeenCalled();
    });

    it("handles database errors gracefully", async () => {
        mockedDb.client.update.mockRejectedValue(new Error("Database connection failed"));

        const response = await PUT(
            new NextRequest("http://localhost:3000/api/clients/abc123", {
                method: "PUT",
                body: JSON.stringify({ fullName: "Test User" }),
            }),
            { params: Promise.resolve({ id: "abc123" }) }
        );

        const json = await response.json();
        expect(response.status).toBe(500);
        expect(json.msg).toBe("Failed to update client");
        expect(json.error).toBe("Database connection failed");
    });
});
