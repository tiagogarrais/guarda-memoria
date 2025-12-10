const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");

const prisma = new PrismaClient();

// Função para normalizar texto: remover acentos, manter apenas letras minúsculas
function normalizeText(text) {
  return text
    .toLowerCase()
    .normalize("NFD") // Decompor caracteres acentuados
    .replace(/[\u0300-\u036f]/g, "") // Remover diacríticos (acentos)
    .replace(/[^a-z]/g, ""); // Manter apenas letras
}

// Mapeamento das siglas oficiais dos estados brasileiros
const stateAbbreviations = {
  11: "ro", // Rondônia
  12: "ac", // Acre
  13: "am", // Amazonas
  14: "rr", // Roraima
  15: "pa", // Pará
  16: "ap", // Amapá
  17: "to", // Tocantins
  21: "ma", // Maranhão
  22: "pi", // Piauí
  23: "ce", // Ceará
  24: "rn", // Rio Grande do Norte
  25: "pb", // Paraíba
  26: "pe", // Pernambuco
  27: "al", // Alagoas
  28: "se", // Sergipe
  29: "ba", // Bahia
  31: "mg", // Minas Gerais
  32: "es", // Espírito Santo
  33: "rj", // Rio de Janeiro
  35: "sp", // São Paulo
  41: "pr", // Paraná
  42: "sc", // Santa Catarina
  43: "rs", // Rio Grande do Sul
  50: "ms", // Mato Grosso do Sul
  51: "mt", // Mato Grosso
  52: "go", // Goiás
  53: "df", // Distrito Federal
};

async function main() {
  console.log("Iniciando seed do banco de dados...");

  // Carregar dados do arquivo JSON
  const dataPath = path.join(
    __dirname,
    "..",
    "public",
    "estados-cidades2.json"
  );
  const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));

  // Dados dos estados
  const statesData = Object.entries(data.states).map(([id, name]) => ({
    id: parseInt(id),
    name: name,
    sigla: stateAbbreviations[parseInt(id)] || name.slice(0, 2).toLowerCase(),
  }));

  // Dados das cidades
  const citiesData = data.cities.map((city) => ({
    id: city.id,
    name: city.name,
    stateId: city.state_id,
  }));

  try {
    console.log("Inserindo estados...");
    for (const state of statesData) {
      await prisma.state.upsert({
        where: { id: state.id },
        update: {},
        create: state,
      });
    }
    console.log("Estados inseridos com sucesso!");

    console.log(`Inserindo ${citiesData.length} cidades...`);
    for (const city of citiesData) {
      // Gerar slug: nome-da-cidade-sigla-estado (seguindo novas regras)
      const state = statesData.find((s) => s.id === city.stateId);
      const normalizedCityName = normalizeText(city.name);
      const stateAbbrev =
        stateAbbreviations[state.id] || state.name.slice(0, 2).toLowerCase();
      const slug = `${normalizedCityName}${stateAbbrev}`;

      await prisma.city.upsert({
        where: { id: city.id },
        update: {},
        create: {
          ...city,
          slug: slug,
        },
      });
    }
    console.log("Cidades inseridas com sucesso!");

    // Verificação final: contar slugs únicos
    const totalCities = await prisma.city.count();
    const uniqueSlugs = await prisma.city.findMany({
      select: { slug: true },
    });

    const slugSet = new Set(uniqueSlugs.map((c) => c.slug));
    console.log(`\n📊 Verificação final:`);
    console.log(`- Total de cidades: ${totalCities}`);
    console.log(`- Slugs únicos gerados: ${slugSet.size}`);

    if (totalCities === slugSet.size) {
      console.log("✅ Todos os slugs são únicos!");
    } else {
      console.log("❌ ERRO: Alguns slugs não são únicos!");
    }
  } catch (error) {
    console.error("Erro durante o seed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
