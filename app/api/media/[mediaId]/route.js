import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { mediaId } = await params;

    // Verificar se a mídia existe e pertence ao usuário
    const media = await prisma.media.findUnique({
      where: { id: mediaId },
      select: { userId: true, parentId: true },
    });

    if (!media) {
      return NextResponse.json({ error: "Media not found" }, { status: 404 });
    }

    if (media.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Usar transação para garantir consistência
    await prisma.$transaction(async (tx) => {
      // Verificar se há replies para esta mídia
      const replies = await tx.media.findMany({
        where: { parentId: mediaId },
        orderBy: { createdAt: "asc" }, // Pegar a mais antiga primeiro
        select: { id: true },
      });

      if (replies.length > 0) {
        // A primeira reply se torna a nova postagem principal
        const newMainPostId = replies[0].id;

        // Atualizar a primeira reply para ser principal
        await tx.media.update({
          where: { id: newMainPostId },
          data: { parentId: null },
        });

        // Se houver mais replies, torná-las filhas da nova postagem principal
        if (replies.length > 1) {
          const otherReplyIds = replies.slice(1).map((reply) => reply.id);
          await tx.media.updateMany({
            where: { id: { in: otherReplyIds } },
            data: { parentId: newMainPostId },
          });
        }
      }

      // Deletar a mídia original
      await tx.media.delete({
        where: { id: mediaId },
      });
    });

    return NextResponse.json({ message: "Media deleted successfully" });
  } catch (error) {
    console.error("Error deleting media:", error);
    return NextResponse.json(
      { error: "Failed to delete media" },
      { status: 500 }
    );
  }
}
