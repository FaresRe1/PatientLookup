import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient()

const clientData: Prisma.ClientCreateInput[] = [
    {
        fullName: "User Fourth",
        email: "user4@email.com",
        phoneNumber: "12345678910",
        address: "13 bold way",
        notes: "Hello my name is bob"
    },
    {
        fullName: "User Fifth",
        email: "user5@email.com",
        phoneNumber: "10987654321",
        address: "15 bold way",
        notes: "Hello my name is jo"
    }
]

export async function main() {
    for (const u of clientData) {
        await prisma.client.create({ data: u });
    }
}

main();