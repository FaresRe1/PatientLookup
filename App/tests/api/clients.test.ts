import { vi, describe, it, expect, beforeEach } from "vitest";
import { GET, POST } from "~/app/api/clients/route";
import { db } from "~/server/db";


// These tests function correctly and tests for all return results and have all passed.
// I mock the request, and resolved db values in order to get the correct response from the api
// To test the POST request you need to change parts of the function in clients/route, which is explained in the file
// All test explanations is in the csv file

// Single mock for db
vi.mock("~/server/db", () => ({
    db: {
        client: {
            findMany: vi.fn(),
            create: vi.fn(),
        },
    },
}));

const mockedDb = vi.mocked(db, true);

import { makeClientRecord, clientRecordToJson } from "../factories/clientFactory";

// Reset mocks before each test to avoid leaking data between tests
beforeEach(() => {
    mockedDb.client.findMany.mockReset();
    mockedDb.client.create.mockReset();
});


//------------------------------------------- GET REQUEST TESTING----------------------------------------------------

describe("Clients API - GET", () => {
    it("returns up to 50 clients with all fields", async () => {
        const now = new Date();

        const a = makeClientRecord({ id: "ckx123abc", fullName: "John Doe", email: "john@example.com", phoneNumber: "1234567890", address: "123 Main St", createdAt: now, updatedAt: now });
        const b = makeClientRecord({ id: "ckx456def", fullName: "Jane Smith", email: null, phoneNumber: null, address: null, createdAt: now, updatedAt: now });

        mockedDb.client.findMany.mockResolvedValue([a, b]);

        // Call GET handler
        const response = await GET(new Request("http://localhost/api/clients"));
        const json = await response.json();

        expect(response.status).toBe(200);

        expect(json.clients[0]).toEqual(clientRecordToJson(a));
        expect(json.clients[1]).toEqual(clientRecordToJson(b));

        expect(mockedDb.client.findMany).toHaveBeenCalledWith({
            take: 50,
            skip: 0,
            orderBy: { fullName: "asc" },
        });
    });
});


//------------------------------------------- POST REQUEST TESTING----------------------------------------------------

describe("Clients API - POST", () => {
    it("creates a new client successfully", async () => {
        const now = new Date();
        const clientData = {
            fullName: "Alice Johnson",
            gender: "female",
            dob: now.toISOString(),
            email: "alice@example.com",
            phoneNumber: "9876543210",
            address: "456 Oak St",
        };

        const created = makeClientRecord({ id: "ckx789ghi", fullName: "Alice Johnson", email: "alice@example.com", phoneNumber: "9876543210", address: "456 Oak St", gender: "female", dob: now, createdAt: now, updatedAt: now });
        mockedDb.client.create.mockResolvedValue(created);

        const response = await POST(
            new Request("http://localhost/api/clients", {
                method: "POST",
                body: JSON.stringify(clientData),
            })
        );
        const json = await response.json();

        // This is the expected result for a valid post request
        expect(response.status).toBe(200);
        expect(json.newClient).toEqual(clientRecordToJson(created));

        expect(mockedDb.client.create).toHaveBeenCalledWith({
            data: {
                fullName: clientData.fullName,
                gender: clientData.gender,
                dob: expect.any(Date),
                email: clientData.email,
                phoneNumber: clientData.phoneNumber,
                address: clientData.address,
            },
        });
    });

    it("returns 400 if validation fails", async () => {
        const invalidData = { email: "bob@example.com" };

        const response = await POST(
            new Request("http://localhost/api/clients", {
                method: "POST",
                body: JSON.stringify(invalidData),
            })
        );
        const json = await response.json();

        // This is expected because required fields (fullName, gender, dob) are missing
        expect(response.status).toBe(400);
        expect(json.msg).toBe("Validation failed");
        expect(mockedDb.client.create).not.toHaveBeenCalled();
    });

    it("handles unique email constraint (P2002)", async () => {
        // Include required fields so validation passes then prisma throws unique constraint
        const now = new Date();
        const clientData = {
            fullName: "Charlie Brown",
            gender: "male",
            dob: now.toISOString(),
            email: "existing@example.com",
            phoneNumber: undefined,
            address: undefined,
        };

        // Mock P2002 error
        mockedDb.client.create.mockRejectedValue({
            code: "P2002",
            message: "Unique constraint failed",
        });

        const response = await POST(
            new Request("http://localhost/api/clients", {
                method: "POST",
                body: JSON.stringify(clientData),
            })
        );
        const json = await response.json();
        // Based on the above mocked rejected value, it should return these
        expect(response.status).toBe(400);
        expect(json.msg).toBe("Client email already used");
    });
});