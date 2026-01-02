import { PrismaClient } from "@prisma/client";

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
      dob: new Date("1980-01-01"),
      email: "user4@email.com",
      phoneNumber: "12345678910",
      address: "13 bold way",
    },
    {
      fullName: "User Fifth",
      dob: new Date("1992-05-12"),
      email: "user5@email.com",
      phoneNumber: "10987654321",
      address: "15 bold way",
    },
  ];

  for (const u of clientData) {
    await prisma.client.create({ data: u });
  }

  console.log("Clients created.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });