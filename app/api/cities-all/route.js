import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const cities = await prisma.city.findMany({
      select: {
        id: true,
        name: true,
        state: {
          select: {
            sigla: true,
          },
        },
      },
      orderBy: [{ name: "asc" }, { state: { sigla: "asc" } }],
    });

    return Response.json(cities);
  } catch (error) {
    console.error("Error fetching cities:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
