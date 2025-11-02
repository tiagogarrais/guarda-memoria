import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// POST /api/votacoes
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { pessoaId } = body;

    if (!pessoaId) {
      return NextResponse.json(
        { error: "pessoaId é obrigatório" },
        { status: 400 }
      );
    }

    // Verificar se pessoa existe
    const pessoa = await prisma.pessoa.findUnique({ where: { id: pessoaId } });
    if (!pessoa) {
      return NextResponse.json(
        { error: "Pessoa não encontrada" },
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

    // Verificar se já votou
    const existingVote = await prisma.votacao.findUnique({
      where: {
        pessoaId_usuarioId: {
          pessoaId,
          usuarioId: usuario.id,
        },
      },
    });

    if (existingVote) {
      return NextResponse.json(
        { error: "Você já votou nesta pessoa" },
        { status: 409 }
      );
    }

    const votacao = await prisma.votacao.create({
      data: {
        pessoaId,
        usuarioId: usuario.id,
      },
    });

    // Log da ação
    await prisma.log.create({
      data: {
        usuarioId: usuario.id,
        acao: "votacao",
        detalhes: JSON.stringify({ votacaoId: votacao.id, pessoaId }),
      },
    });

    return NextResponse.json({ message: "Voto registrado" }, { status: 201 });
  } catch (error) {
    console.error("Erro ao votar:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
