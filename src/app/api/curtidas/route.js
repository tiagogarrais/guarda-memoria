import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET /api/curtidas?usuarioId=...&pessoaId=...
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const usuarioId = searchParams.get("usuarioId");
    const pessoaId = searchParams.get("pessoaId");

    if (!usuarioId || !pessoaId) {
      return NextResponse.json(
        { error: "usuarioId e pessoaId são obrigatórios" },
        { status: 400 }
      );
    }

    const curtidas = await prisma.curtida.findMany({
      where: {
        usuarioId,
        pessoaId,
      },
    });

    return NextResponse.json(curtidas);
  } catch (error) {
    console.error("Erro ao buscar curtidas:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

// POST /api/curtidas
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

    // Verificar se já curtiu
    const existingCurtida = await prisma.curtida.findUnique({
      where: {
        pessoaId_usuarioId: {
          pessoaId,
          usuarioId: usuario.id,
        },
      },
    });

    if (existingCurtida) {
      return NextResponse.json(
        { error: "Você já curtiu esta pessoa" },
        { status: 409 }
      );
    }

    const curtida = await prisma.curtida.create({
      data: {
        pessoaId,
        usuarioId: usuario.id,
      },
    });

    // Log da ação
    await prisma.log.create({
      data: {
        usuarioId: usuario.id,
        acao: "curtida",
        detalhes: JSON.stringify({ curtidaId: curtida.id, pessoaId }),
      },
    });

    return NextResponse.json(
      { message: "Curtida registrada" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erro ao curtir:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

// DELETE /api/curtidas
export async function DELETE(request) {
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

    // Verificar se a curtida existe
    const existingCurtida = await prisma.curtida.findUnique({
      where: {
        pessoaId_usuarioId: {
          pessoaId,
          usuarioId: usuario.id,
        },
      },
    });

    if (!existingCurtida) {
      return NextResponse.json(
        { error: "Curtida não encontrada" },
        { status: 404 }
      );
    }

    // Remover a curtida
    await prisma.curtida.delete({
      where: {
        pessoaId_usuarioId: {
          pessoaId,
          usuarioId: usuario.id,
        },
      },
    });

    // Log da ação
    await prisma.log.create({
      data: {
        usuarioId: usuario.id,
        acao: "descurtida",
        detalhes: JSON.stringify({ pessoaId }),
      },
    });

    return NextResponse.json({ message: "Curtida removida" }, { status: 200 });
  } catch (error) {
    console.error("Erro ao remover curtida:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
