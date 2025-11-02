import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET /api/medias?pessoaId=...
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const pessoaId = searchParams.get("pessoaId");

    if (!pessoaId) {
      return NextResponse.json(
        { error: "pessoaId é obrigatório" },
        { status: 400 }
      );
    }

    const medias = await prisma.media.findMany({
      where: {
        pessoaId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(medias);
  } catch (error) {
    console.error("Erro ao buscar mídias:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
