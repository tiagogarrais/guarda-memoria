const { PrismaClient } = require("@prisma/client");

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

async function generateCitySlugs() {
  console.log("Iniciando geração de slugs para cidades...");

  try {
    // Buscar todas as cidades com seus estados
    const cities = await prisma.city.findMany({
      include: {
        state: true,
      },
    });

    console.log(`Encontradas ${cities.length} cidades para processar`);

    const processedSlugs = new Set();
    let updatedCount = 0;

    for (const city of cities) {
      // Gerar slug: nome-da-cidade-sigla-estado (seguindo novas regras)
      const normalizedCityName = normalizeText(city.name);
      const stateAbbrev =
        stateAbbreviations[city.stateId] ||
        city.state.name.slice(0, 2).toLowerCase();
      const baseSlug = `${normalizedCityName}${stateAbbrev}`;

      // Verificar se o slug já existe e adicionar sufixo se necessário
      let slug = baseSlug;
      let counter = 1;

      while (processedSlugs.has(slug)) {
        slug = `${baseSlug}${counter}`;
        counter++;
      }

      processedSlugs.add(slug);

      // Atualizar a cidade com o slug
      await prisma.city.update({
        where: { id: city.id },
        data: { slug: slug },
      });

      updatedCount++;
      console.log(`✓ ${city.name} (${city.state.name}) -> ${slug}`);
    }

    console.log(
      `\n✅ Processo concluído! ${updatedCount} cidades atualizadas com slugs únicos.`
    );

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
    console.error("Erro durante a geração de slugs:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar o script
generateCitySlugs();
