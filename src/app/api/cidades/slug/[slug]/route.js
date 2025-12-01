import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

// GET /api/cidades/slug/[slug]
export async function GET(request, { params }) {
  const prisma = new PrismaClient();

  try {
    const { slug } = params;

    console.log("Buscando cidade com slug:", slug);

    const cidade = await prisma.cidade.findUnique({
      where: { slug },
    });

    console.log("Cidade encontrada:", cidade);

    if (!cidade) {
      return NextResponse.json(
        { error: "Cidade não encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(cidade);
  } catch (error) {
    console.error("Erro ao buscar cidade por slug:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor", details: error.message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
