import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET /api/pessoas?cidadeId=...&search=...&categoria=...&profissao=...&dataInicio=...&dataFim=...
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const cidadeId = searchParams.get("cidadeId");
    const search = searchParams.get("search");
    const categoria = searchParams.get("categoria");
    const profissao = searchParams.get("profissao");
    const dataInicio = searchParams.get("dataInicio");
    const dataFim = searchParams.get("dataFim");

    if (!cidadeId) {
      return NextResponse.json(
        { error: "cidadeId é obrigatório" },
        { status: 400 }
      );
    }

    const where = { cidadeId };

    if (search) {
      where.OR = [
        { nome: { contains: search, mode: "insensitive" } },
        { historia: { contains: search, mode: "insensitive" } },
        { tags: { hasSome: search.split(",").map((t) => t.trim()) } },
      ];
    }

    if (categoria) {
      where.categoria = categoria;
    }

    if (profissao) {
      where.profissao = { contains: profissao, mode: "insensitive" };
    }

    if (dataInicio || dataFim) {
      where.dataNascimento = {};
      if (dataInicio) where.dataNascimento.gte = new Date(dataInicio);
      if (dataFim) where.dataNascimento.lte = new Date(dataFim);
    }

    // Buscar pessoas com filtros
    const pessoas = await prisma.pessoa.findMany({
      where,
      include: {
        usuario: { select: { fullName: true } },
        _count: {
          select: {
            votacoes: true,
            comentarios: true,
            curtidas: true,
            medias: true,
          },
        },
      },
      orderBy: [
        { votacoes: { _count: "desc" } },
        { comentarios: { _count: "desc" } },
        { curtidas: { _count: "desc" } },
        { medias: { _count: "desc" } },
      ],
    });

    // Calcular score
    const pessoasComScore = pessoas.map((pessoa) => ({
      ...pessoa,
      score:
        pessoa._count.votacoes +
        pessoa._count.comentarios +
        pessoa._count.curtidas +
        pessoa._count.medias,
    }));

    return NextResponse.json(pessoasComScore);
  } catch (error) {
    console.error("Erro ao buscar pessoas:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

// POST /api/pessoas
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    console.log("Session in POST /api/pessoas:", session);
    if (!session?.user?.id) {
      console.log("No session or user.id");
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const {
      nome,
      historia,
      fotoUrl,
      cidadeId,
      dataNascimento,
      profissao,
      categoria,
      tags,
    } = body;

    if (!nome || !cidadeId) {
      return NextResponse.json(
        { error: "Nome e cidadeId são obrigatórios" },
        { status: 400 }
      );
    }

    // Verificar se cidade existe
    const cidade = await prisma.cidade.findUnique({ where: { id: cidadeId } });
    if (!cidade) {
      return NextResponse.json(
        { error: "Cidade não encontrada" },
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

    const pessoa = await prisma.pessoa.create({
      data: {
        nome,
        historia,
        fotoUrl,
        cidadeId,
        usuarioId: usuario.id,
        dataNascimento: dataNascimento ? new Date(dataNascimento) : null,
        profissao,
        categoria,
        tags,
      },
    });

    return NextResponse.json(pessoa, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar pessoa:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
