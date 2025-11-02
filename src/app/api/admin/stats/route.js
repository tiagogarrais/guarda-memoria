import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const dynamic = "force-dynamic";

const ADMIN_EMAILS = ["admin@guarda-memoria.com"];

// GET /api/admin/stats
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !ADMIN_EMAILS.includes(session.user.email)) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    // Estatísticas básicas
    const totalPessoas = await prisma.pessoa.count();
    const totalComentarios = await prisma.comentario.count();
    const totalVotacoes = await prisma.votacao.count();
    const totalCurtidas = await prisma.curtida.count();
    const totalDenuncias = await prisma.denuncia.count();
    const denunciasPendentes = await prisma.denuncia.count({
      where: { status: "pendente" },
    });

    // Pessoas por cidade
    const pessoasPorCidade = await prisma.pessoa.groupBy({
      by: ["cidadeId"],
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 10,
    });

    // Resolver cidades
    const cidades = await prisma.cidade.findMany({
      where: { id: { in: pessoasPorCidade.map((p) => p.cidadeId) } },
      select: { id: true, nome: true, estado: true },
    });

    const cidadesMap = cidades.reduce((acc, c) => {
      acc[c.id] = c;
      return acc;
    }, {});

    const topCidades = pessoasPorCidade.map((p) => ({
      cidade: cidadesMap[p.cidadeId]?.nome || "Desconhecida",
      estado: cidadesMap[p.cidadeId]?.estado || "",
      count: p._count.id,
    }));

    // Atividade recente (últimos 30 dias)
    const trintaDiasAtras = new Date();
    trintaDiasAtras.setDate(trintaDiasAtras.getDate() - 30);

    const novasPessoas = await prisma.pessoa.count({
      where: { createdAt: { gte: trintaDiasAtras } },
    });

    const novosComentarios = await prisma.comentario.count({
      where: { createdAt: { gte: trintaDiasAtras } },
    });

    return NextResponse.json({
      totalPessoas,
      totalComentarios,
      totalVotacoes,
      totalCurtidas,
      totalDenuncias,
      denunciasPendentes,
      topCidades,
      atividadeRecente: {
        novasPessoas,
        novosComentarios,
      },
    });
  } catch (error) {
    console.error("Erro ao buscar estatísticas:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
