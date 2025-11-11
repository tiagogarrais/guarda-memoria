import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET /api/entidades/[id]
export async function GET(request, { params }) {
  try {
    const { id } = params;

    const entidade = await prisma.entidade.findUnique({
      where: { id },
      include: {
        usuario: { select: { fullName: true } },
        cidade: { select: { nome: true, estado: true } },
        comentarios: {
          include: {
            usuario: { select: { fullName: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
        medias: {
          include: {
            usuario: { select: { fullName: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
        curtidas: {
          include: {
            usuario: { select: { fullName: true } },
          },
        },
        _count: {
          select: {
            comentarios: true,
            curtidas: true,
            medias: true,
          },
        },
      },
    });

    if (!entidade) {
      return NextResponse.json(
        { error: "Entidade não encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(entidade);
  } catch (error) {
    console.error("Erro ao buscar entidade:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

// PUT /api/entidades/[id]
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();

    // Verificar se a entidade existe e pertence ao usuário
    const entidadeExistente = await prisma.entidade.findUnique({
      where: { id },
      include: { usuario: true },
    });

    if (!entidadeExistente) {
      return NextResponse.json(
        { error: "Entidade não encontrada" },
        { status: 404 }
      );
    }

    // Verificar se o usuário é o dono da entidade
    if (entidadeExistente.usuario.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Você não tem permissão para editar esta entidade" },
        { status: 403 }
      );
    }

    const {
      nome,
      descricao,
      fotoUrl,
      categoria,
      tags,
      // Campos específicos por tipo
      dataNascimento,
      profissao,
      localizacao,
      dataRelacionada,
      dataInicio,
      dataFim,
    } = body;

    const entidadeAtualizada = await prisma.entidade.update({
      where: { id },
      data: {
        nome,
        descricao,
        fotoUrl,
        categoria,
        tags,
        dataNascimento: dataNascimento ? new Date(dataNascimento) : null,
        profissao,
        localizacao,
        dataRelacionada: dataRelacionada ? new Date(dataRelacionada) : null,
        dataInicio: dataInicio ? new Date(dataInicio) : null,
        dataFim: dataFim ? new Date(dataFim) : null,
      },
    });

    return NextResponse.json(entidadeAtualizada);
  } catch (error) {
    console.error("Erro ao atualizar entidade:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

// DELETE /api/entidades/[id]
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = params;

    // Verificar se a entidade existe e pertence ao usuário
    const entidade = await prisma.entidade.findUnique({
      where: { id },
      include: { usuario: true },
    });

    if (!entidade) {
      return NextResponse.json(
        { error: "Entidade não encontrada" },
        { status: 404 }
      );
    }

    // Verificar se o usuário é o dono da entidade
    if (entidade.usuario.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Você não tem permissão para excluir esta entidade" },
        { status: 403 }
      );
    }

    // Excluir entidade (as relações serão excluídas automaticamente devido ao onDelete: Cascade)
    await prisma.entidade.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Entidade excluída com sucesso" });
  } catch (error) {
    console.error("Erro ao excluir entidade:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}