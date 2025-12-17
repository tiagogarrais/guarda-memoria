import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request, { params }) {
  try {
    const { permalink } = await params;

    // Buscar a mídia pelo permalink
    const media = await prisma.media.findUnique({
      where: { permalink },
      select: {
        id: true,
        cityId: true,
        parentId: true,
        city: {
          select: {
            slug: true,
          },
        },
      },
    });

    if (!media) {
      // Se não encontrar, redirecionar para a página principal
      return NextResponse.redirect(new URL("/", request.url));
    }

    // Se é um comentário, redirecionar para o post pai
    const targetId = media.parentId || media.id;

    // Buscar o permalink do post alvo (pai ou próprio)
    const targetMedia = await prisma.media.findUnique({
      where: { id: targetId },
      select: { permalink: true },
    });

    if (!targetMedia) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    // Redirecionar para a página da postagem específica
    const redirectUrl = new URL(
      `/postagem/${targetMedia.permalink}`,
      request.url
    );

    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error("Permalink error:", error);
    return NextResponse.redirect(new URL("/", request.url));
  }
}
