import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET /api/curtidas?usuarioId=...&memoriaId=...
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const usuarioId = searchParams.get("usuarioId");
    const memoriaId = searchParams.get("memoriaId");

    if (!usuarioId || !memoriaId) {
      return NextResponse.json(
        { error: "usuarioId e memoriaId são obrigatórios" },
        { status: 400 }
      );
    }

    const curtidas = await prisma.curtida.findMany({
      where: {
        usuarioId,
        memoriaId,
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
    const { memoriaId } = body;

    if (!memoriaId) {
      return NextResponse.json(
        { error: "memoriaId é obrigatório" },
        { status: 400 }
      );
    }

    // Verificar se memoria existe
    const memoria = await prisma.memoria.findUnique({
      where: { id: memoriaId },
    });
    if (!memoria) {
      return NextResponse.json(
        { error: "Memória não encontrada" },
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
        memoriaId_usuarioId: {
          memoriaId,
          usuarioId: usuario.id,
        },
      },
    });

    if (existingCurtida) {
      return NextResponse.json(
        { error: "Você já curtiu esta memória" },
        { status: 409 }
      );
    }

    const curtida = await prisma.curtida.create({
      data: {
        memoriaId,
        usuarioId: usuario.id,
      },
    });

    // Log da ação
    await prisma.log.create({
      data: {
        usuarioId: usuario.id,
        acao: "curtida",
        detalhes: JSON.stringify({ curtidaId: curtida.id, memoriaId }),
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
    const { memoriaId } = body;

    if (!memoriaId) {
      return NextResponse.json(
        { error: "memoriaId é obrigatório" },
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
        memoriaId_usuarioId: {
          memoriaId,
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
        memoriaId_usuarioId: {
          memoriaId,
          usuarioId: usuario.id,
        },
      },
    });

    // Log da ação
    await prisma.log.create({
      data: {
        usuarioId: usuario.id,
        acao: "descurtida",
        detalhes: JSON.stringify({ memoriaId }),
      },
    });

    return NextResponse.json({ message: "Curtida removida" }, { status: 200 });
  } catch (error) {
    console.error("Erro ao remover curtida:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
