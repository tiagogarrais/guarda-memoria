import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Atualiza a pontuação de uma mídia baseada em comentários e conhecimentos
 * Pontuação = número de comentários + número de conhecimentos
 */
export async function updateMediaScore(mediaId) {
  try {
    // Contar comentários e conhecimentos
    const [replyCount, knowledgeCount] = await Promise.all([
      prisma.media.count({
        where: { parentId: mediaId },
      }),
      prisma.mediaKnowledge.count({
        where: { mediaId: mediaId },
      }),
    ]);

    const newScore = replyCount + knowledgeCount;

    // Atualizar a pontuação da mídia
    await prisma.media.update({
      where: { id: mediaId },
      data: { score: newScore },
    });

    return newScore;
  } catch (error) {
    console.error("Erro ao atualizar pontuação da mídia:", error);
    throw error;
  }
}
