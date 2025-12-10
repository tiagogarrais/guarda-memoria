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
        parentId: null, // Apenas mídias raiz, não comentários
      };
    } else {
      // Buscar mídias do usuário logado
      whereClause = {
        userId: session.user.id,
        parentId: null, // Apenas mídias raiz, não comentários
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
        replies: {
          // Novo: incluir respostas/comentários
          include: {
            user: {
              select: { name: true, image: true },
            },
          },
          orderBy: {
            createdAt: "asc", // Ordem cronológica para comentários
          },
        },
        _count: {
          select: {
            knowledge: true, // Contar conhecimentos
          },
        },
        knowledge: {
          // Verificar se o usuário atual conhece esta mídia
          where: {
            userId: session.user.id,
          },
          select: {
            id: true,
          },
        },
      },
    });

    // Processar os dados para incluir informações de conhecimento
    const processedMedias = medias.map((media) => ({
      ...media,
      knowledgeCount: media._count.knowledge,
      userKnows: media.knowledge.length > 0,
      _count: undefined, // Remover o campo _count do resultado final
      knowledge: undefined, // Remover o campo knowledge do resultado final
    }));

    return NextResponse.json({ medias: processedMedias });
  } catch (error) {
    console.error("Error fetching media:", error);
    return NextResponse.json(
      { error: "Failed to fetch media" },
      { status: 500 }
    );
  }
}
