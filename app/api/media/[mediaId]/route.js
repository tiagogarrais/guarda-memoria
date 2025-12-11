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

    // Deletar a mídia
    await prisma.media.delete({
      where: { id: mediaId },
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
