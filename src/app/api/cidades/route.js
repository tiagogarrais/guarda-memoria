import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { generateSlug } from "@/lib/utils";

const prisma = new PrismaClient();

export const dynamic = "force-dynamic";

// Mapeamento de códigos IBGE para siglas dos estados
const CODIGO_PARA_SIGLA = {
  11: "RO", // Rondônia
  12: "AC", // Acre
  13: "AM", // Amazonas
  14: "RR", // Roraima
  15: "PA", // Pará
  16: "AP", // Amapá
  17: "TO", // Tocantins
  21: "MA", // Maranhão
  22: "PI", // Piauí
  23: "CE", // Ceará
  24: "RN", // Rio Grande do Norte
  25: "PB", // Paraíba
  26: "PE", // Pernambuco
  27: "AL", // Alagoas
  28: "SE", // Sergipe
  29: "BA", // Bahia
  31: "MG", // Minas Gerais
  32: "ES", // Espírito Santo
  33: "RJ", // Rio de Janeiro
  35: "SP", // São Paulo
  41: "PR", // Paraná
  42: "SC", // Santa Catarina
  43: "RS", // Rio Grande do Sul
  50: "MS", // Mato Grosso do Sul
  51: "MT", // Mato Grosso
  52: "GO", // Goiás
  53: "DF", // Distrito Federal
};

// GET /api/cidades?estado=...&nome=...
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const estadoParam = searchParams.get("estado");
    const nome = searchParams.get("nome");

    if (!estadoParam || !nome) {
      return NextResponse.json(
        { error: "estado e nome são obrigatórios" },
        { status: 400 }
      );
    }

    // Converter código numérico para sigla se necessário
    const estado = CODIGO_PARA_SIGLA[estadoParam] || estadoParam;

    let cidade = await prisma.cidade.findFirst({
      where: { estado, nome },
    });

    if (!cidade) {
      // Criar cidade usando a SIGLA do estado
      const slug = generateSlug(nome, estado);

      cidade = await prisma.cidade.create({
        data: { estado, nome, slug },
      });
    }

    return NextResponse.json(cidade);
  } catch (error) {
    console.error("Erro ao buscar/criar cidade:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
