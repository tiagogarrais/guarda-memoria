import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET /api/memorias/[id]
export async function GET(request, { params }) {
  try {
    const { id } = params;

    const memoria = await prisma.memoria.findUnique({
      where: { id },
      include: {
        usuario: { select: { fullName: true } },
        cidade: { select: { nome: true, estado: true } },
        comentarios: {
          include: {
            usuario: { select: { fullName: true } },
          },
          orderBy: { createdAt: "desc" },
        },
        medias: {
          include: {
            usuario: { select: { fullName: true } },
          },
          orderBy: { createdAt: "desc" },
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

    if (!memoria) {
      return NextResponse.json(
        { error: "Memória não encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(memoria);
  } catch (error) {
    console.error("Erro ao buscar memoria:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

// PUT /api/memorias/[id]
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();

    // Verificar se a memoria existe e pertence ao usuário
    const memoriaExistente = await prisma.memoria.findUnique({
      where: { id },
      include: { usuario: true },
    });

    if (!memoriaExistente) {
      return NextResponse.json(
        { error: "Memória não encontrada" },
        { status: 404 }
      );
    }

    // Verificar se o usuário é o dono da memoria
    if (memoriaExistente.usuario.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Você não tem permissão para editar esta memória" },
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
      artista,
      anoCriacao,
      tecnica,
      arquivoUrl,
      tipoArquivo,
      tamanhoArquivo,
      nomeArquivo,
      membrosPrincipais,
      dataFormacao,
      tipoColetivo,
    } = body;

    const memoriaAtualizada = await prisma.memoria.update({
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
        artista,
        anoCriacao: anoCriacao ? parseInt(anoCriacao) : null,
        tecnica,
        arquivoUrl,
        tipoArquivo,
        tamanhoArquivo: tamanhoArquivo ? parseInt(tamanhoArquivo) : null,
        nomeArquivo,
        membrosPrincipais,
        dataFormacao: dataFormacao ? new Date(dataFormacao) : null,
        tipoColetivo,
      },
    });

    return NextResponse.json(memoriaAtualizada);
  } catch (error) {
    console.error("Erro ao atualizar memória:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

// DELETE /api/memorias/[id]
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = params;

    // Verificar se a memoria existe e pertence ao usuário
    const memoria = await prisma.memoria.findUnique({
      where: { id },
      include: { usuario: true },
    });

    if (!memoria) {
      return NextResponse.json(
        { error: "Memória não encontrada" },
        { status: 404 }
      );
    }

    // Verificar se o usuário é o dono da memoria
    if (memoria.usuario.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Você não tem permissão para excluir esta memória" },
        { status: 403 }
      );
    }

    // Excluir memoria (as relações serão excluídas automaticamente devido ao onDelete: Cascade)
    await prisma.memoria.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Memória excluída com sucesso" });
  } catch (error) {
    console.error("Erro ao excluir memória:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
