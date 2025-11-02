import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Lista de emails de admins
const ADMIN_EMAILS = ["admin@guarda-memoria.com"];

// PUT /api/denuncias/[id] - Atualizar status da denúncia
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !ADMIN_EMAILS.includes(session.user.email)) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    const { id } = params;
    const { status } = await request.json();

    if (!status || !["pendente", "resolvida", "rejeitada"].includes(status)) {
      return NextResponse.json({ error: "Status inválido" }, { status: 400 });
    }

    const denuncia = await prisma.denuncia.update({
      where: { id: parseInt(id) },
      data: { status },
    });

    return NextResponse.json(denuncia);
  } catch (error) {
    console.error("Erro ao atualizar denúncia:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
