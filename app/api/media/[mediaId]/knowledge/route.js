import { getServerSession } from "next-auth";
import { authOptions } from "../../../../auth";
import { PrismaClient } from "@prisma/client";
import { updateMediaScore } from "../../../../../lib/mediaUtils";

const prisma = new PrismaClient();

export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return Response.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { mediaId } = params;
    const userId = session.user.id;

    // Verificar se a mídia existe
    const media = await prisma.media.findUnique({
      where: { id: mediaId },
    });

    if (!media) {
      return Response.json({ error: "Mídia não encontrada" }, { status: 404 });
    }

    // Verificar se o usuário já conhece esta mídia
    const existingKnowledge = await prisma.mediaKnowledge.findUnique({
      where: {
        userId_mediaId: {
          userId,
          mediaId,
        },
      },
    });

    let action;
    if (existingKnowledge) {
      // Se já conhece, remove o conhecimento
      await prisma.mediaKnowledge.delete({
        where: { id: existingKnowledge.id },
      });
      action = "removed";
    } else {
      // Se não conhece, adiciona o conhecimento
      await prisma.mediaKnowledge.create({
        data: {
          userId,
          mediaId,
        },
      });
      action = "added";
    }

    // Atualizar a pontuação da mídia
    const newScore = await updateMediaScore(mediaId);

    // Contar quantos conhecimentos esta mídia tem
    const knowledgeCount = await prisma.mediaKnowledge.count({
      where: { mediaId },
    });

    return Response.json({
      action,
      knowledgeCount,
      userKnows: action === "added",
      score: newScore,
    });
  } catch (error) {
    console.error("Erro ao processar conhecimento:", error);
    return Response.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return Response.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { mediaId } = params;
    const userId = session.user.id;

    // Verificar se o usuário conhece esta mídia
    const userKnowledge = await prisma.mediaKnowledge.findUnique({
      where: {
        userId_mediaId: {
          userId,
          mediaId,
        },
      },
    });

    // Contar quantos conhecimentos esta mídia tem
    const knowledgeCount = await prisma.mediaKnowledge.count({
      where: { mediaId },
    });

    return Response.json({
      userKnows: !!userKnowledge,
      knowledgeCount,
    });
  } catch (error) {
    console.error("Erro ao buscar conhecimento:", error);
    return Response.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
