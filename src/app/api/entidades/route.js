import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET /api/entidades?cidadeId=...&tipo=...&search=...&categoria=...&profissao=...&dataInicio=...&dataFim=...
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const cidadeId = searchParams.get("cidadeId");
    const tipo = searchParams.get("tipo"); // PESSOA, LUGAR, DATA, EVENTO
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

    // Filtrar por tipo se especificado
    if (tipo) {
      where.tipo = tipo;
    }

    if (search) {
      where.OR = [
        { nome: { contains: search, mode: "insensitive" } },
        { descricao: { contains: search, mode: "insensitive" } },
        { tags: { hasSome: search.split(",").map((t) => t.trim()) } },
      ];
    }

    if (categoria) {
      where.categoria = categoria;
    }

    if (profissao) {
      where.profissao = { contains: profissao, mode: "insensitive" };
    }

    // Filtros de data (para nascimento, data relacionada, ou eventos)
    if (dataInicio || dataFim) {
      where.OR = where.OR || [];
      const dataFilters = [];

      // Para pessoas (data de nascimento)
      if (!tipo || tipo === 'PESSOA') {
        const pessoaFilter = { dataNascimento: {} };
        if (dataInicio) pessoaFilter.dataNascimento.gte = new Date(dataInicio);
        if (dataFim) pessoaFilter.dataNascimento.lte = new Date(dataFim);
        dataFilters.push(pessoaFilter);
      }

      // Para datas específicas
      if (!tipo || tipo === 'DATA') {
        const dataFilter = { dataRelacionada: {} };
        if (dataInicio) dataFilter.dataRelacionada.gte = new Date(dataInicio);
        if (dataFim) dataFilter.dataRelacionada.lte = new Date(dataFim);
        dataFilters.push(dataFilter);
      }

      // Para eventos (data de início)
      if (!tipo || tipo === 'EVENTO') {
        const eventoFilter = { dataInicio: {} };
        if (dataInicio) eventoFilter.dataInicio.gte = new Date(dataInicio);
        if (dataFim) eventoFilter.dataInicio.lte = new Date(dataFim);
        dataFilters.push(eventoFilter);
      }

      where.OR.push(...dataFilters);
    }

    // Buscar entidades com filtros
    const entidades = await prisma.entidade.findMany({
      where,
      include: {
        usuario: { select: { fullName: true } },
        _count: {
          select: {
            comentarios: true,
            curtidas: true,
            medias: true,
          },
        },
      },
      orderBy: [
        { comentarios: { _count: "desc" } },
        { curtidas: { _count: "desc" } },
        { medias: { _count: "desc" } },
      ],
    });

    // Calcular score
    const entidadesComScore = entidades.map((entidade) => ({
      ...entidade,
      score:
        entidade._count.comentarios +
        entidade._count.curtidas +
        entidade._count.medias,
    }));

    return NextResponse.json(entidadesComScore);
  } catch (error) {
    console.error("Erro ao buscar entidades:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

// POST /api/entidades
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const {
      tipo,
      nome,
      descricao,
      fotoUrl,
      cidadeId,
      categoria,
      tags,
      // Campos específicos por tipo
      dataNascimento, // Para pessoas
      profissao, // Para pessoas
      localizacao, // Para lugares
      dataRelacionada, // Para datas
      dataInicio, // Para eventos
      dataFim, // Para eventos
    } = body;

    if (!tipo || !nome || !cidadeId) {
      return NextResponse.json(
        { error: "Tipo, nome e cidadeId são obrigatórios" },
        { status: 400 }
      );
    }

    // Validar tipo
    const tiposValidos = ['PESSOA', 'LUGAR', 'DATA', 'EVENTO'];
    if (!tiposValidos.includes(tipo)) {
      return NextResponse.json(
        { error: "Tipo inválido. Deve ser PESSOA, LUGAR, DATA ou EVENTO" },
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
    let usuario = await prisma.usuario.findUnique({
      where: { userId: session.user.id },
    });

    if (!usuario) {
      usuario = await prisma.usuario.create({
        data: {
          userId: session.user.id,
          fullName: session.user.name || "",
          fotoPerfilUrl: session.user.image || "",
        },
      });
    }

    if (!usuario) {
      return NextResponse.json(
        { error: "Perfil de usuário não encontrado" },
        { status: 404 }
      );
    }

    const entidade = await prisma.entidade.create({
      data: {
        tipo,
        nome,
        descricao,
        fotoUrl,
        cidadeId,
        usuarioId: usuario.id,
        categoria,
        tags,
        // Campos específicos
        dataNascimento: dataNascimento ? new Date(dataNascimento) : null,
        profissao,
        localizacao,
        dataRelacionada: dataRelacionada ? new Date(dataRelacionada) : null,
        dataInicio: dataInicio ? new Date(dataInicio) : null,
        dataFim: dataFim ? new Date(dataFim) : null,
      },
    });

    return NextResponse.json(entidade, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar entidade:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}