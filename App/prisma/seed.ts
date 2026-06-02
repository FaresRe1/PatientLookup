import { PrismaClient } from "@prisma/client";
import { PatientCreate } from "~/models/patient";

const prisma = new PrismaClient();

async function main() {
  const malariaTemplate = await prisma.template.create({
    data: {
      name: "Malaria Rapid Test",
      structure: JSON.stringify([
        { id: "q1", type: "yes_no", label: "Patient has fever > 38C?" },
        { id: "q2", type: "text", label: "RDT Result (Pos/Neg)" },
      ]),
    },
  });

  const generalCheckupTemplate = await prisma.template.create({
    data: {
      name: "General Health Check",
      structure: JSON.stringify([
        { id: "q1", type: "text", label: "Chief Complaint" },
        { id: "q2", type: "yes_no", label: "Is patient taking medication?" },
      ]),
    },
  });

  console.log("Templates created.");



  const clientData = [
    {
      fullName: "User Fourth",
      gender: "Male",
      dob: "1980-01-01",
      phoneNumber: "12345678910",
      village: "Test Village",
    },
    {
      fullName: "User Fifth",
      gender: "Female",
      dob: "1992-05-12",
      phoneNumber: "10987654321",
      village: "Test Village",
    },
  ];

  for (const u of clientData) {
    const parsed = PatientCreate.parse(u);
    const dobVal = parsed.dob instanceof Date ? parsed.dob : new Date(parsed.dob as unknown as string);
    await prisma.client.create({ data: { ...parsed, dob: dobVal } });
  }

  console.log("Clients created.");

  // Create a sample visit for the first client
  const firstClient = await prisma.client.findFirst();
  if (firstClient) {
    await prisma.visit.create({
      data: {
        clientId: firstClient.id,
        doctorName: "Dr Seed",
        notes: "Initial seed visit",
        visitDate: new Date(),
      },
    });
    console.log("Sample visit created.");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });