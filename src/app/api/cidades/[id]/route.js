import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET /api/cidades/[id]
export async function GET(request, { params }) {
  try {
    const { id } = params;

    const cidade = await prisma.cidade.findUnique({
      where: { id },
    });

    if (!cidade) {
      return NextResponse.json(
        { error: "Cidade não encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(cidade);
  } catch (error) {
    console.error("Erro ao buscar cidade:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
