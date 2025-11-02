import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET /api/pessoas/[id]
export async function GET(request, { params }) {
  try {
    const { id } = params;

    const pessoa = await prisma.pessoa.findUnique({
      where: { id },
      include: {
        usuario: { select: { fullName: true } },
        cidade: { select: { nome: true, estado: true } },
      },
    });

    if (!pessoa) {
      return NextResponse.json(
        { error: "Pessoa não encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(pessoa);
  } catch (error) {
    console.error("Erro ao buscar pessoa:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
