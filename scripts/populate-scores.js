const { PrismaClient } = require("@prisma/client");
const { updateMediaScore } = require("../lib/mediaUtils");

const prisma = new PrismaClient();

async function populateScores() {
  try {
    console.log("Iniciando população das pontuações...");

    // Buscar todas as mídias raiz (não comentários)
    const medias = await prisma.media.findMany({
      where: {
        parentId: null,
      },
      select: {
        id: true,
      },
    });

    console.log(`Encontradas ${medias.length} mídias para atualizar`);

    // Atualizar a pontuação de cada mídia
    for (const media of medias) {
      try {
        const newScore = await updateMediaScore(media.id);
        console.log(`Mídia ${media.id}: pontuação atualizada para ${newScore}`);
      } catch (error) {
        console.error(`Erro ao atualizar mídia ${media.id}:`, error);
      }
    }

    console.log("População das pontuações concluída!");
  } catch (error) {
    console.error("Erro geral:", error);
  } finally {
    await prisma.$disconnect();
  }
}

populateScores();
