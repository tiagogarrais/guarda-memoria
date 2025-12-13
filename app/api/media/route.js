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

    // Buscar mídias, ordenadas por pontuação (mais pontos primeiro)
    const medias = await prisma.media.findMany({
      where: whereClause,
      orderBy: [
        { score: "desc" }, // Primeiro por pontuação (decrescente)
        { createdAt: "desc" }, // Depois por data (mais recentes primeiro)
      ],
      select: {
        id: true,
        type: true,
        text: true,
        url: true,
        publicId: true,
        createdAt: true,
        userId: true,
        cityId: true,
        stateId: true,
        categories: true,
        parentId: true,
        permalink: true, // Adicionar permalink
        user: {
          select: { id: true, name: true, image: true },
        },
        replies: {
          // Novo: incluir respostas/comentários
          select: {
            id: true,
            type: true,
            text: true,
            url: true,
            publicId: true,
            createdAt: true,
            userId: true,
            cityId: true,
            stateId: true,
            categories: true,
            parentId: true,
            permalink: true, // Adicionar permalink também para replies
            user: {
              select: { id: true, name: true, image: true },
            },
          },
          orderBy: {
            createdAt: "asc", // Ordem cronológica para comentários
          },
        },
        _count: {
          select: {
            knowledge: true, // Contar conhecimentos
            replies: true, // Contar comentários
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

    // Processar os dados para incluir informações de conhecimento e pontuação
    const processedMedias = medias.map((media) => ({
      ...media,
      knowledgeCount: media._count.knowledge,
      userKnows: media.knowledge.length > 0,
      score: media._count.replies + media._count.knowledge, // Pontuação = comentários + conhecimentos
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
