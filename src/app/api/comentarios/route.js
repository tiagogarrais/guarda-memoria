import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET /api/comentarios?entidadeId=...
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const entidadeId = searchParams.get("entidadeId");

    if (!entidadeId) {
      return NextResponse.json(
        { error: "entidadeId é obrigatório" },
        { status: 400 }
      );
    }

    const comentarios = await prisma.comentario.findMany({
      where: { entidadeId },
      include: {
        usuario: { select: { fullName: true, fotoPerfilUrl: true } },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(comentarios);
  } catch (error) {
    console.error("Erro ao buscar comentários:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

// POST /api/comentarios
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { entidadeId, texto } = body;

    if (!entidadeId || !texto) {
      return NextResponse.json(
        { error: "entidadeId e texto são obrigatórios" },
        { status: 400 }
      );
    }

    // Verificar se entidade existe
    const entidade = await prisma.entidade.findUnique({ where: { id: entidadeId } });
    if (!entidade) {
      return NextResponse.json(
        { error: "Entidade não encontrada" },
        { status: 404 }
      );
    }

    // Buscar Usuario
    const usuario = await prisma.usuario.findUnique({
      where: { userId: session.user.id },
    });
    if (!usuario) {
      return NextResponse.json(
        { error: "Perfil de usuário não encontrado" },
        { status: 404 }
      );
    }

    const comentario = await prisma.comentario.create({
      data: {
        entidadeId,
        usuarioId: usuario.id,
        texto,
      },
      include: {
        usuario: { select: { fullName: true, fotoPerfilUrl: true } },
      },
    });

    // Log da ação
    await prisma.log.create({
      data: {
        usuarioId: usuario.id,
        acao: "comentario",
        detalhes: JSON.stringify({ comentarioId: comentario.id, entidadeId }),
      },
    });

    return NextResponse.json(comentario, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar comentário:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
