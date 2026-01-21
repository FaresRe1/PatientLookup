import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, PUT } from "~/app/api/clients/[id]/route";
import { db } from "~/server/db";
import { NextRequest } from "next/server";
import { makeClientRecord, clientRecordToJson } from "../factories/clientFactory";

// --- Mocks ---
vi.mock("~/server/db", () => ({
    db: { 
        client: { 
            findUnique: vi.fn(), 
            update: vi.fn() 
        } 
    },
}));

const mockedDb = vi.mocked(db, true);

// --- Helpers ---
const getValidJsonBody = (client: any) => {
    const json = clientRecordToJson(client);
    delete json.profileImage; 
    return json;
};

const createRequest = (url: string, method: "GET" | "PUT", body?: any, isFormData = false) => {
    return new NextRequest(url, {
        method,
        body: isFormData ? body : (body ? JSON.stringify(body) : undefined),
    });
};

beforeEach(() => { 
    vi.clearAllMocks(); 
});

describe("Clients API - [id] route", () => {
    const CLIENT_ID = "abc123";
    const BASE_URL = `http://localhost:3000/api/clients/${CLIENT_ID}`;
    const PARAMS = { params: Promise.resolve({ id: CLIENT_ID }) };

    // --- GET TESTS ---
    describe("GET /api/clients/[id]", () => {
        it("returns 200 and client details when record exists", async () => {
            const mockClient = makeClientRecord({ id: CLIENT_ID });
            mockedDb.client.findUnique.mockResolvedValue(mockClient);

            const res = await GET(createRequest(BASE_URL, "GET"), PARAMS);
            const json = await res.json();

            expect(res.status).toBe(200);
            expect(json.details).toEqual(clientRecordToJson(mockClient));
            expect(json.details.drugHistory).toBe(mockClient.drugHistory);
        });

        it("returns 404 when the client ID does not exist in DB", async () => {
            mockedDb.client.findUnique.mockResolvedValue(null);

            const res = await GET(createRequest(BASE_URL, "GET"), PARAMS);
            
            expect(res.status).toBe(404);
            expect((await res.json()).msg).toBe("Failed to find client information");
        });

        it("returns 400 when ID validation fails (empty ID)", async () => {
            const res = await GET(
                createRequest("http://localhost:3000/api/clients/", "GET"), 
                { params: Promise.resolve({ id: "" }) }
            );
            
            expect(res.status).toBe(400);
        });
    });

    // --- PUT TESTS ---
    describe("PUT /api/clients/[id]", () => {
        it("successfully updates via JSON and maintains history", async () => {
            const oldClient = makeClientRecord({ id: CLIENT_ID });
            const updateData = { ...getValidJsonBody(oldClient), fullName: "Updated Name" };

            const updatedRecord = { ...oldClient, fullName: "Updated Name" };
            mockedDb.client.update.mockResolvedValue(updatedRecord);

            const res = await PUT(createRequest(BASE_URL, "PUT", updateData), PARAMS);
            const json = await res.json();

            expect(res.status).toBe(200);
            expect(json.details.fullName).toBe("Updated Name");
            // Check that history from oldClient was preserved
            expect(json.details.drugHistory).toBe(oldClient.drugHistory);
        });

        it("successfully updates profile image via FormData", async () => {
            const oldClient = makeClientRecord({ id: CLIENT_ID });
            const buffer = Buffer.from('fake-image-data');
            
            const formData = new FormData();
            const fields = getValidJsonBody(oldClient);
            Object.entries(fields).forEach(([key, val]) => formData.append(key, String(val)));
            
            formData.append('profileImage', new File([buffer], 'profile.jpg', { type: 'image/jpeg' }));

            mockedDb.client.update.mockResolvedValue({ ...oldClient, profileImage: buffer });

            const res = await PUT(createRequest(BASE_URL, "PUT", formData, true), PARAMS);
            const json = await res.json();

            expect(res.status).toBe(200);
            expect(json.details.profileImage).toBe(buffer.toString('base64'));
        });

        it("returns 400 when required history fields are missing", async () => {
            const incompleteBody = { fullName: "New Name" };

            const res = await PUT(createRequest(BASE_URL, "PUT", incompleteBody), PARAMS);
            const json = await res.json();

            expect(res.status).toBe(400);
            expect(json.msg).toBe("Validation failed");
        });

        it("returns 500 when database update fails", async () => {
            mockedDb.client.update.mockRejectedValue(new Error("Prisma Error"));
            const validData = getValidJsonBody(makeClientRecord());

            const res = await PUT(createRequest(BASE_URL, "PUT", validData), PARAMS);
            const json = await res.json();

            expect(res.status).toBe(500);
            expect(json.error).toBe("Prisma Error");
        });
    });
});