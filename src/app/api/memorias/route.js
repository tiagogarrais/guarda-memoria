import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET /api/memorias?cidadeId=...&slug=...&tipo=...&search=...&categoria=...&profissao=...&dataInicio=...&dataFim=...&artista=...&anoCriacao=...&tipoArquivo=...&tipoColetivo=...
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    let cidadeId = searchParams.get("cidadeId");
    const slug = searchParams.get("slug");
    const tipo = searchParams.get("tipo"); // PESSOA, LUGAR, DATA, EVENTO, OBRA_ARTE, COLETIVO_ORGANIZADO
    const search = searchParams.get("search");
    const categoria = searchParams.get("categoria");
    const profissao = searchParams.get("profissao");
    const dataInicio = searchParams.get("dataInicio");
    const dataFim = searchParams.get("dataFim");
    const artista = searchParams.get("artista");
    const anoCriacao = searchParams.get("anoCriacao");
    const tipoArquivo = searchParams.get("tipoArquivo");
    const tipoColetivo = searchParams.get("tipoColetivo");

    // Se foi passado um slug, buscar a cidade pelo slug
    if (slug && !cidadeId) {
      const cidade = await prisma.cidade.findUnique({
        where: { slug },
      });

      if (!cidade) {
        return NextResponse.json(
          { error: "Cidade não encontrada" },
          { status: 404 }
        );
      }

      cidadeId = cidade.id;
    }

    if (!cidadeId) {
      return NextResponse.json(
        { error: "cidadeId ou slug é obrigatório" },
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
        { nome: { contains: search } },
        { descricao: { contains: search } },
        { categoria: { contains: search } },
        { profissao: { contains: search } },
        { artista: { contains: search } },
        { tecnica: { contains: search } },
        { tipoColetivo: { contains: search } },
      ];
    }

    if (categoria) {
      where.categoria = categoria;
    }

    if (profissao) {
      where.profissao = { contains: profissao };
    }

    if (artista) {
      where.artista = { contains: artista };
    }

    if (anoCriacao) {
      where.anoCriacao = parseInt(anoCriacao);
    }

    if (tipoArquivo) {
      where.tipoArquivo = tipoArquivo;
    }

    if (tipoColetivo) {
      where.tipoColetivo = tipoColetivo;
    }

    // Filtros de data (para nascimento, data relacionada, ou eventos)
    if (dataInicio || dataFim) {
      const dataFilters = [];

      // Para pessoas (data de nascimento)
      if (!tipo || tipo === "PESSOA") {
        const pessoaFilter = { dataNascimento: {} };
        if (dataInicio) pessoaFilter.dataNascimento.gte = new Date(dataInicio);
        if (dataFim) pessoaFilter.dataNascimento.lte = new Date(dataFim);
        dataFilters.push(pessoaFilter);
      }

      // Para datas específicas
      if (!tipo || tipo === "DATA") {
        const dataFilter = { dataRelacionada: {} };
        if (dataInicio) dataFilter.dataRelacionada.gte = new Date(dataInicio);
        if (dataFim) dataFilter.dataRelacionada.lte = new Date(dataFim);
        dataFilters.push(dataFilter);
      }

      // Para eventos (data de início)
      if (!tipo || tipo === "EVENTO") {
        const eventoFilter = { dataInicio: {} };
        if (dataInicio) eventoFilter.dataInicio.gte = new Date(dataInicio);
        if (dataFim) eventoFilter.dataInicio.lte = new Date(dataFim);
        dataFilters.push(eventoFilter);
      }

      // Para coletivos organizados (data de formação)
      if (!tipo || tipo === "COLETIVO_ORGANIZADO") {
        const coletivoFilter = { dataFormacao: {} };
        if (dataInicio) coletivoFilter.dataFormacao.gte = new Date(dataInicio);
        if (dataFim) coletivoFilter.dataFormacao.lte = new Date(dataFim);
        dataFilters.push(coletivoFilter);
      }

      // Combinar filtros de data com filtros existentes
      if (where.OR) {
        // Se já existe OR (de search), combinar com dataFilters
        where.OR = [...where.OR, ...dataFilters];
      } else {
        // Se não existe OR, criar com dataFilters
        where.OR = dataFilters;
      }
    }

    // Buscar memorias com filtros
    const memorias = await prisma.memoria.findMany({
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
    const memoriasComScore = memorias.map((memoria) => ({
      ...memoria,
      score:
        memoria._count.comentarios +
        memoria._count.curtidas +
        memoria._count.medias,
    }));

    return NextResponse.json(memoriasComScore);
  } catch (error) {
    console.error("Erro ao buscar memorias:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

// POST /api/memorias
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
      artista, // Para obras de arte
      anoCriacao, // Para obras de arte
      tecnica, // Para obras de arte
      arquivoUrl, // Para obras de arte
      tipoArquivo, // Para obras de arte
      tamanhoArquivo, // Para obras de arte
      nomeArquivo, // Para obras de arte
      membrosPrincipais, // Para coletivos organizados
      dataFormacao, // Para coletivos organizados
      tipoColetivo, // Para coletivos organizados
    } = body;

    if (!tipo || !nome || !cidadeId) {
      return NextResponse.json(
        { error: "Tipo, nome e cidadeId são obrigatórios" },
        { status: 400 }
      );
    }

    if (!descricao || descricao.trim() === "") {
      return NextResponse.json(
        { error: "Descrição é obrigatória" },
        { status: 400 }
      );
    }

    // Validar tipo
    const tiposValidos = [
      "PESSOA",
      "LUGAR",
      "DATA",
      "EVENTO",
      "OBRA_ARTE",
      "COLETIVO_ORGANIZADO",
    ];
    if (!tiposValidos.includes(tipo)) {
      return NextResponse.json(
        {
          error:
            "Tipo inválido. Deve ser PESSOA, LUGAR, DATA, EVENTO, OBRA_ARTE ou COLETIVO_ORGANIZADO",
        },
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

    const memoria = await prisma.memoria.create({
      data: {
        tipo,
        nome,
        descricao,
        fotoUrl,
        cidadeId,
        usuarioId: usuario.id,
        categoria,
        tags: tags ? JSON.stringify(tags) : null,
        // Campos específicos
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

    return NextResponse.json(memoria, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar memoria:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
