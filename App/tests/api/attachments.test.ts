import { vi, describe, it, expect, beforeEach } from "vitest";
import { GET, POST } from "~/app/api/attachments/route";
import { GET as GET_ID, DELETE as DELETE_ID } from "~/app/api/attachments/[id]/route";
import { db } from "~/server/db";
import { NextRequest } from "next/server";

vi.mock("~/server/db", () => ({
    db: {
        visit: {
            findUnique: vi.fn(),
        },
        visitAttachment: {
            findMany: vi.fn(),
            create: vi.fn(),
            findUnique: vi.fn(),
            delete: vi.fn(),
        },
    },
}));

const mockedDb = vi.mocked(db, true);

beforeEach(() => {
    mockedDb.visit.findUnique.mockReset();
    mockedDb.visitAttachment.findMany.mockReset();
    mockedDb.visitAttachment.create.mockReset();
    mockedDb.visitAttachment.findUnique.mockReset();
    mockedDb.visitAttachment.delete.mockReset();
});

//------------------------------------------- POST REQUEST TESTING (UPLOAD) ---------------------------------------------------

describe("Attachments API - POST (Upload)", () => {
    it("successfully uploads an image file", async () => {
        const fileContent = Buffer.from("fake image data");
        const file = new File([fileContent], "photo.jpg", { type: "image/jpeg" });
        
        const formData = new FormData();
        formData.append("file", file);
        formData.append("visitId", "visit123");

        mockedDb.visit.findUnique.mockResolvedValue({ id: "visit123" } as any);
        mockedDb.visitAttachment.create.mockResolvedValue({
            id: "att1",
            visitId: "visit123",
            fileName: "photo.jpg",
            fileType: "image/jpeg",
            fileData: fileContent,
            fileSize: fileContent.length,
            createdAt: new Date(),
        });

        const response = await POST(
            new NextRequest("http://localhost:3000/api/attachments", {
                method: "POST",
                body: formData,
            })
        );

        expect(response.status).toBe(201);
        const json = await response.json();
        expect(json.fileName).toBe("photo.jpg");
        expect(json.fileType).toBe("image/jpeg");
        expect(json.fileSize).toBe(fileContent.length);
    });

    it("successfully uploads a PDF file", async () => {
        const fileContent = Buffer.from("fake pdf data");
        const file = new File([fileContent], "document.pdf", { type: "application/pdf" });
        
        const formData = new FormData();
        formData.append("file", file);
        formData.append("visitId", "visit456");

        mockedDb.visit.findUnique.mockResolvedValue({ id: "visit456" } as any);
        mockedDb.visitAttachment.create.mockResolvedValue({
            id: "att2",
            visitId: "visit456",
            fileName: "document.pdf",
            fileType: "application/pdf",
            fileData: fileContent,
            fileSize: fileContent.length,
            createdAt: new Date(),
        });

        const response = await POST(
            new NextRequest("http://localhost:3000/api/attachments", {
                method: "POST",
                body: formData,
            })
        );

        expect(response.status).toBe(201);
        const json = await response.json();
        expect(json.fileName).toBe("document.pdf");
        expect(json.fileType).toBe("application/pdf");
    });

    it("successfully uploads a DOCX file", async () => {
        const fileContent = Buffer.from("fake docx data");
        const file = new File([fileContent], "report.docx", { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
        
        const formData = new FormData();
        formData.append("file", file);
        formData.append("visitId", "visit789");

        mockedDb.visit.findUnique.mockResolvedValue({ id: "visit789" } as any);
        mockedDb.visitAttachment.create.mockResolvedValue({
            id: "att3",
            visitId: "visit789",
            fileName: "report.docx",
            fileType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            fileData: fileContent,
            fileSize: fileContent.length,
            createdAt: new Date(),
        });

        const response = await POST(
            new NextRequest("http://localhost:3000/api/attachments", {
                method: "POST",
                body: formData,
            })
        );

        expect(response.status).toBe(201);
        const json = await response.json();
        expect(json.fileName).toBe("report.docx");
    });

    it("rejects file upload exceeding 10MB limit", async () => {
        const largeContent = Buffer.alloc(11 * 1024 * 1024); // 11MB
        const file = new File([largeContent], "large.jpg", { type: "image/jpeg" });
        
        const formData = new FormData();
        formData.append("file", file);
        formData.append("visitId", "visit123");

        mockedDb.visit.findUnique.mockResolvedValue({ id: "visit123" } as any);

        const response = await POST(
            new NextRequest("http://localhost:3000/api/attachments", {
                method: "POST",
                body: formData,
            })
        );

        expect(response.status).toBe(400);
        const json = await response.json();
        expect(json.msg).toContain("exceeds 10MB limit");
        expect(mockedDb.visitAttachment.create).not.toHaveBeenCalled();
    });

    it("rejects upload if file is missing", async () => {
        const formData = new FormData();
        formData.append("visitId", "visit123");

        const response = await POST(
            new NextRequest("http://localhost:3000/api/attachments", {
                method: "POST",
                body: formData,
            })
        );

        expect(response.status).toBe(400);
        const json = await response.json();
        expect(json.msg).toBe("File is required");
        expect(mockedDb.visitAttachment.create).not.toHaveBeenCalled();
    });

    it("rejects upload if visitId is missing", async () => {
        const fileContent = Buffer.from("fake image data");
        const file = new File([fileContent], "photo.jpg", { type: "image/jpeg" });
        
        const formData = new FormData();
        formData.append("file", file);

        const response = await POST(
            new NextRequest("http://localhost:3000/api/attachments", {
                method: "POST",
                body: formData,
            })
        );

        expect(response.status).toBe(400);
        const json = await response.json();
        expect(json.msg).toBe("visitId is required");
        expect(mockedDb.visitAttachment.create).not.toHaveBeenCalled();
    });

    it("rejects upload if visit does not exist", async () => {
        const fileContent = Buffer.from("fake image data");
        const file = new File([fileContent], "photo.jpg", { type: "image/jpeg" });
        
        const formData = new FormData();
        formData.append("file", file);
        formData.append("visitId", "nonexistent");

        mockedDb.visit.findUnique.mockResolvedValue(null);

        const response = await POST(
            new NextRequest("http://localhost:3000/api/attachments", {
                method: "POST",
                body: formData,
            })
        );

        expect(response.status).toBe(404);
        const json = await response.json();
        expect(json.msg).toBe("Visit not found");
        expect(mockedDb.visitAttachment.create).not.toHaveBeenCalled();
    });

    it("handles database errors gracefully", async () => {
        const fileContent = Buffer.from("fake image data");
        const file = new File([fileContent], "photo.jpg", { type: "image/jpeg" });
        
        const formData = new FormData();
        formData.append("file", file);
        formData.append("visitId", "visit123");

        mockedDb.visit.findUnique.mockResolvedValue({ id: "visit123" } as any);
        mockedDb.visitAttachment.create.mockRejectedValue(new Error("Database connection failed"));

        const response = await POST(
            new NextRequest("http://localhost:3000/api/attachments", {
                method: "POST",
                body: formData,
            })
        );

        expect(response.status).toBe(500);
        const json = await response.json();
        expect(json.msg).toBe("Failed to upload attachment");
        expect(json.error).toBe("Database connection failed");
    });
});

//------------------------------------------- GET REQUEST TESTING (LIST) ---------------------------------------------------

describe("Attachments API - GET (List)", () => {
    it("returns all attachments for a visit", async () => {
        const now = new Date();
        const attachments = [
            {
                id: "att1",
                visitId: "visit123",
                fileName: "photo.jpg",
                fileType: "image/jpeg",
                fileSize: 1024,
                createdAt: now,
            },
            {
                id: "att2",
                visitId: "visit123",
                fileName: "document.pdf",
                fileType: "application/pdf",
                fileSize: 2048,
                createdAt: new Date(now.getTime() - 60000),
            },
        ];

        mockedDb.visitAttachment.findMany.mockResolvedValue(attachments as any);

        const response = await GET(
            new NextRequest("http://localhost:3000/api/attachments?visitId=visit123")
        );

        expect(response.status).toBe(200);
        const json = await response.json();
        expect(json).toHaveLength(2);
        expect(json[0].fileName).toBe("photo.jpg");
        expect(json[1].fileName).toBe("document.pdf");

        expect(mockedDb.visitAttachment.findMany).toHaveBeenCalledWith({
            where: { visitId: "visit123" },
            orderBy: { createdAt: 'desc' },
            select: expect.objectContaining({
                id: true,
                fileName: true,
                fileType: true,
                fileSize: true,
                createdAt: true,
            }),
        });
    });

    it("returns empty array if no attachments found", async () => {
        mockedDb.visitAttachment.findMany.mockResolvedValue([]);

        const response = await GET(
            new NextRequest("http://localhost:3000/api/attachments?visitId=visit-nofiles")
        );

        expect(response.status).toBe(200);
        const json = await response.json();
        expect(json).toEqual([]);
    });

    it("returns 400 if visitId parameter is missing", async () => {
        const response = await GET(
            new NextRequest("http://localhost:3000/api/attachments")
        );

        expect(response.status).toBe(400);
        const json = await response.json();
        expect(json.msg).toBe("visitId query parameter is required");
        expect(mockedDb.visitAttachment.findMany).not.toHaveBeenCalled();
    });

    it("handles database errors gracefully", async () => {
        mockedDb.visitAttachment.findMany.mockRejectedValue(new Error("Database connection failed"));

        const response = await GET(
            new NextRequest("http://localhost:3000/api/attachments?visitId=visit123")
        );

        expect(response.status).toBe(500);
        const json = await response.json();
        expect(json.msg).toBe("Failed to load attachments");
        expect(json.error).toBe("Database connection failed");
    });
});

//------------------------------------------- GET REQUEST TESTING (DOWNLOAD) ---------------------------------------------------

describe("Attachments API - GET [id] (Download)", () => {
    it("downloads an attachment file", async () => {
        const fileContent = Buffer.from("fake image data");
        
        mockedDb.visitAttachment.findUnique.mockResolvedValue({
            id: "att1",
            visitId: "visit123",
            fileName: "photo.jpg",
            fileType: "image/jpeg",
            fileData: fileContent,
            fileSize: fileContent.length,
            createdAt: new Date(),
        });

        const response = await GET_ID(
            new NextRequest("http://localhost:3000/api/attachments/att1"),
            { params: { id: "att1" } }
        );

        expect(response.status).toBe(200);
        expect(response.headers.get("Content-Type")).toBe("image/jpeg");
        expect(response.headers.get("Content-Disposition")).toContain("photo.jpg");
    });

    it("returns 404 if attachment not found", async () => {
        mockedDb.visitAttachment.findUnique.mockResolvedValue(null);

        const response = await GET_ID(
            new NextRequest("http://localhost:3000/api/attachments/nonexistent"),
            { params: { id: "nonexistent" } }
        );

        expect(response.status).toBe(404);
        const json = await response.json();
        expect(json.msg).toBe("Attachment not found");
    });

    it("handles database errors gracefully", async () => {
        mockedDb.visitAttachment.findUnique.mockRejectedValue(new Error("Database connection failed"));

        const response = await GET_ID(
            new NextRequest("http://localhost:3000/api/attachments/att1"),
            { params: { id: "att1" } }
        );

        expect(response.status).toBe(500);
        const json = await response.json();
        expect(json.msg).toBe("Failed to download attachment");
    });
});

//------------------------------------------- DELETE REQUEST TESTING ---------------------------------------------------

describe("Attachments API - DELETE [id]", () => {
    it("successfully deletes an attachment", async () => {
        const fileContent = Buffer.from("fake image data");
        
        mockedDb.visitAttachment.findUnique.mockResolvedValue({
            id: "att1",
            visitId: "visit123",
            fileName: "photo.jpg",
            fileType: "image/jpeg",
            fileData: fileContent,
            fileSize: fileContent.length,
            createdAt: new Date(),
        });

        mockedDb.visitAttachment.delete.mockResolvedValue({
            id: "att1",
            visitId: "visit123",
            fileName: "photo.jpg",
            fileType: "image/jpeg",
            fileData: fileContent,
            fileSize: fileContent.length,
            createdAt: new Date(),
        });

        const response = await DELETE_ID(
            new NextRequest("http://localhost:3000/api/attachments/att1", { method: "DELETE" }),
            { params: { id: "att1" } }
        );

        expect(response.status).toBe(200);
        const json = await response.json();
        expect(json.msg).toBe("Attachment deleted successfully");

        expect(mockedDb.visitAttachment.delete).toHaveBeenCalledWith({
            where: { id: "att1" },
        });
    });

    it("returns 404 if attachment to delete not found", async () => {
        mockedDb.visitAttachment.findUnique.mockResolvedValue(null);

        const response = await DELETE_ID(
            new NextRequest("http://localhost:3000/api/attachments/nonexistent", { method: "DELETE" }),
            { params: { id: "nonexistent" } }
        );

        expect(response.status).toBe(404);
        const json = await response.json();
        expect(json.msg).toBe("Attachment not found");
        expect(mockedDb.visitAttachment.delete).not.toHaveBeenCalled();
    });

    it("handles database errors gracefully", async () => {
        mockedDb.visitAttachment.findUnique.mockRejectedValue(new Error("Database connection failed"));

        const response = await DELETE_ID(
            new NextRequest("http://localhost:3000/api/attachments/att1", { method: "DELETE" }),
            { params: { id: "att1" } }
        );

        expect(response.status).toBe(500);
        const json = await response.json();
        expect(json.msg).toBe("Failed to delete attachment");
    });
});
