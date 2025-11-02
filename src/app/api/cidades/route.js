import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const dynamic = "force-dynamic";

// GET /api/cidades?estado=...&nome=...
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const estado = searchParams.get("estado");
    const nome = searchParams.get("nome");

    if (!estado || !nome) {
      return NextResponse.json(
        { error: "estado e nome são obrigatórios" },
        { status: 400 }
      );
    }

    let cidade = await prisma.cidade.findFirst({
      where: { estado, nome },
    });

    if (!cidade) {
      // Criar cidade se não existir
      cidade = await prisma.cidade.create({
        data: { estado, nome },
      });
    }

    return NextResponse.json(cidade);
  } catch (error) {
    console.error("Erro ao buscar/criar cidade:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
