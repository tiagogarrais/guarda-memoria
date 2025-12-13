import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request, { params }) {
  try {
    const { cityId } = await params;
    const cityIdNum = parseInt(cityId);

    if (isNaN(cityIdNum)) {
      return new Response("Invalid city ID", { status: 400 });
    }

    const city = await prisma.city.findUnique({
      where: { id: cityIdNum },
      select: {
        id: true,
        name: true,
        slug: true,
        state: {
          select: {
            sigla: true,
          },
        },
      },
    });

    if (!city) {
      return new Response("City not found", { status: 404 });
    }

    return Response.json(city);
  } catch (error) {
    console.error("Error fetching city:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
