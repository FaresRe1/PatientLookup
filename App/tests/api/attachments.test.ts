import { vi, describe, it, expect, beforeEach } from "vitest";
import { POST, GET } from "~/app/api/attachments/route";
import { GET as GET_BY_ID, DELETE } from "~/app/api/attachments/[id]/route";
import { db } from "~/server/db";
import { NextRequest } from "next/server";

vi.mock("~/server/db", () => ({
  db: {
    visit: {
      findUnique: vi.fn(),
    },
    visitAttachment: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

const mockedDb = vi.mocked(db, true);

beforeEach(() => {
  vi.clearAllMocks();
});

describe("Attachments API - POST", () => {
  it("uploads an attachment successfully", async () => {
    const now = new Date();
    mockedDb.visit.findUnique.mockResolvedValue({ id: "visit1" } as never);
    mockedDb.visitAttachment.create.mockResolvedValue({
      id: "att1",
      visitId: "visit1",
      fileName: "test.pdf",
      fileType: "application/pdf",
      fileSize: 1024,
      fileData: Buffer.from("test"),
      createdAt: now,
    });

    const formData = new FormData();
    formData.append("file", new File([new Uint8Array(1024)], "test.pdf", { type: "application/pdf" }));
    formData.append("visitId", "visit1");

    const res = await POST(new NextRequest("http://localhost/api/attachments", { method: "POST", body: formData }));
    const json = await res.json();

    expect(res.status).toBe(201);
    expect(json.id).toBe("att1");
    expect(json.fileName).toBe("test.pdf");
  });

  it("returns 400 if no file provided", async () => {
    const formData = new FormData();
    formData.append("visitId", "visit1");

    const res = await POST(new NextRequest("http://localhost/api/attachments", { method: "POST", body: formData }));
    expect(res.status).toBe(400);
    expect((await res.json()).msg).toBe("File is required");
  });

  it("returns 400 if no visitId provided", async () => {
    const formData = new FormData();
    formData.append("file", new File([new Uint8Array(100)], "test.pdf", { type: "application/pdf" }));

    const res = await POST(new NextRequest("http://localhost/api/attachments", { method: "POST", body: formData }));
    expect(res.status).toBe(400);
    expect((await res.json()).msg).toBe("visitId is required");
  });

  it("returns 400 if file exceeds 10MB limit", async () => {
    const formData = new FormData();
    formData.append("file", new File([new Uint8Array(11 * 1024 * 1024)], "large.pdf", { type: "application/pdf" }));
    formData.append("visitId", "visit1");

    const res = await POST(new NextRequest("http://localhost/api/attachments", { method: "POST", body: formData }));
    expect(res.status).toBe(400);
    expect((await res.json()).msg).toBe("File size exceeds 10MB limit");
  });

  it("returns 404 if visit not found", async () => {
    mockedDb.visit.findUnique.mockResolvedValue(null);

    const formData = new FormData();
    formData.append("file", new File([new Uint8Array(100)], "test.pdf", { type: "application/pdf" }));
    formData.append("visitId", "nonexistent");

    const res = await POST(new NextRequest("http://localhost/api/attachments", { method: "POST", body: formData }));
    expect(res.status).toBe(404);
    expect((await res.json()).msg).toBe("Visit not found");
  });
});

describe("Attachments API - GET (list)", () => {
  it("returns attachments for a visit", async () => {
    const now = new Date();
    mockedDb.visitAttachment.findMany.mockResolvedValue([
      { id: "att1", fileName: "test.pdf", fileType: "application/pdf", fileSize: 1024, createdAt: now },
    ] as never);

    const res = await GET(new NextRequest("http://localhost/api/attachments?visitId=visit1"));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json).toHaveLength(1);
    expect(json[0].fileName).toBe("test.pdf");
  });

  it("returns 400 if visitId missing", async () => {
    const res = await GET(new NextRequest("http://localhost/api/attachments"));
    expect(res.status).toBe(400);
  });
});

describe("Attachments API - GET by ID", () => {
  it("returns file data for download", async () => {
    const fileData = Buffer.from("file contents");
    mockedDb.visitAttachment.findUnique.mockResolvedValue({
      id: "att1",
      fileData,
      fileType: "application/pdf",
      fileName: "test.pdf",
      fileSize: fileData.length,
    } as never);

    const res = await GET_BY_ID(
      new NextRequest("http://localhost/api/attachments/att1"),
      { params: Promise.resolve({ id: "att1" }) },
    );

    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("application/pdf");
    expect(res.headers.get("Content-Disposition")).toContain("test.pdf");
  });

  it("returns 404 for non-existent attachment", async () => {
    mockedDb.visitAttachment.findUnique.mockResolvedValue(null);

    const res = await GET_BY_ID(
      new NextRequest("http://localhost/api/attachments/fake"),
      { params: Promise.resolve({ id: "fake" }) },
    );

    expect(res.status).toBe(404);
  });
});

describe("Attachments API - DELETE", () => {
  it("deletes an attachment", async () => {
    mockedDb.visitAttachment.findUnique.mockResolvedValue({ id: "att1" } as never);
    mockedDb.visitAttachment.delete.mockResolvedValue({ id: "att1" } as never);

    const res = await DELETE(
      new NextRequest("http://localhost/api/attachments/att1", { method: "DELETE" }),
      { params: Promise.resolve({ id: "att1" }) },
    );
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.msg).toBe("Attachment deleted successfully");
  });

  it("returns 404 if attachment does not exist", async () => {
    mockedDb.visitAttachment.findUnique.mockResolvedValue(null);

    const res = await DELETE(
      new NextRequest("http://localhost/api/attachments/fake", { method: "DELETE" }),
      { params: Promise.resolve({ id: "fake" }) },
    );

    expect(res.status).toBe(404);
  });
});
