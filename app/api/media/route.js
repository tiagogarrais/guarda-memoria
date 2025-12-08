import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const cityId = searchParams.get("cityId");

    let whereClause;

    if (cityId) {
      // Buscar mídias da cidade especificada
      whereClause = {
        cityId: parseInt(cityId),
      };
    } else {
      // Buscar mídias do usuário logado
      whereClause = {
        userId: session.user.id,
      };
    }

    // Buscar mídias, ordenadas por data de criação (mais recentes primeiro)
    const medias = await prisma.media.findMany({
      where: whereClause,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: {
          select: { name: true, image: true },
        },
      },
    });

    return NextResponse.json({ medias });
  } catch (error) {
    console.error("Error fetching media:", error);
    return NextResponse.json(
      { error: "Failed to fetch media" },
      { status: 500 }
    );
  }
}
