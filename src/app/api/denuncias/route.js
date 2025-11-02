import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Lista de emails de admins (temporário, depois mover para config ou banco)
const ADMIN_EMAILS = ["admin@guarda-memoria.com"]; // Substitua pelos emails reais

// GET /api/denuncias - Lista denúncias para admins
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !ADMIN_EMAILS.includes(session.user.email)) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    const denuncias = await prisma.denuncia.findMany({
      include: {
        pessoa: { select: { id: true, nome: true } },
        usuario: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(denuncias);
  } catch (error) {
    console.error("Erro ao buscar denúncias:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// POST /api/denuncias - Criar denúncia
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { pessoaId, motivo, descricao } = await request.json();

    if (!pessoaId || !motivo) {
      return NextResponse.json(
        { error: "pessoaId e motivo são obrigatórios" },
        { status: 400 }
      );
    }

    // Verificar se a pessoa existe
    const pessoa = await prisma.pessoa.findUnique({ where: { id: pessoaId } });
    if (!pessoa) {
      return NextResponse.json(
        { error: "Pessoa não encontrada" },
        { status: 404 }
      );
    }

    // Criar denúncia
    const denuncia = await prisma.denuncia.create({
      data: {
        pessoaId,
        usuarioId: session.user.id,
        motivo,
        descricao: descricao || "",
      },
    });

    return NextResponse.json(denuncia, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar denúncia:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
