const { PrismaClient } = require("@prisma/client");

const prisma = global.prisma;

// Mock do NextAuth
jest.mock("next-auth", () => ({
  getServerSession: jest.fn(),
}));

describe("Testes de Entidades - Validações Básicas", () => {
  afterEach(async () => {
    // Limpar dados após cada teste para isolamento
    await global.cleanupTestData();
  });

  describe("Criação de Entidades", () => {
    it("deve criar entidade PESSOA com campos específicos", async () => {
      // Criar dados base para o teste
      const { cidade, usuario } = await global.createTestData();

      const entidade = await prisma.entidade.create({
        data: {
          tipo: "PESSOA",
          nome: "João Silva",
          descricao: "Pessoa importante da cidade",
          cidadeId: cidade.id,
          usuarioId: usuario.id,
          categoria: "Político",
          profissao: "Professor",
          dataNascimento: new Date("1980-01-01"),
          tags: JSON.stringify(["história", "política"]),
        },
      });

      expect(entidade.tipo).toBe("PESSOA");
      expect(entidade.nome).toBe("João Silva");
      expect(entidade.profissao).toBe("Professor");
      expect(entidade.dataNascimento).toEqual(new Date("1980-01-01"));
      expect(entidade.tags).toBe('["história","política"]');
    });

    it("deve criar entidade LUGAR com campos específicos", async () => {
      // Criar dados base para o teste
      const { cidade, usuario } = await global.createTestData();

      const entidade = await prisma.entidade.create({
        data: {
          tipo: "LUGAR",
          nome: "Praça Central",
          descricao: "Praça histórica da cidade",
          cidadeId: cidade.id,
          usuarioId: usuario.id,
          categoria: "Praça",
          localizacao: "Centro da cidade",
        },
      });

      expect(entidade.tipo).toBe("LUGAR");
      expect(entidade.localizacao).toBe("Centro da cidade");
    });

    it("deve criar entidade OBRA_ARTE com campos específicos", async () => {
      // Criar dados base para o teste
      const { cidade, usuario } = await global.createTestData();

      const entidade = await prisma.entidade.create({
        data: {
          tipo: "OBRA_ARTE",
          nome: "Mural da Cidade",
          descricao: "Obra de arte urbana",
          cidadeId: cidade.id,
          usuarioId: usuario.id,
          artista: "Maria Santos",
          anoCriacao: 2020,
          tecnica: "Grafite",
        },
      });

      expect(entidade.tipo).toBe("OBRA_ARTE");
      expect(entidade.artista).toBe("Maria Santos");
      expect(entidade.anoCriacao).toBe(2020);
      expect(entidade.tecnica).toBe("Grafite");
    });

    it("deve criar entidade COLETIVO_ORGANIZADO com campos específicos", async () => {
      // Criar dados base para o teste
      const { cidade, usuario } = await global.createTestData();

      const entidade = await prisma.entidade.create({
        data: {
          tipo: "COLETIVO_ORGANIZADO",
          nome: "Banda Municipal",
          descricao: "Banda de música da cidade",
          cidadeId: cidade.id,
          usuarioId: usuario.id,
          tipoColetivo: "musical",
          membrosPrincipais: "João, Maria, Pedro",
          dataFormacao: new Date("2000-01-01"),
        },
      });

      expect(entidade.tipo).toBe("COLETIVO_ORGANIZADO");
      expect(entidade.tipoColetivo).toBe("musical");
      expect(entidade.membrosPrincipais).toBe("João, Maria, Pedro");
      expect(entidade.dataFormacao).toEqual(new Date("2000-01-01"));
    });
  });

  describe("Validações de Dados", () => {
    it("deve validar tipos de entidade corretamente", async () => {
      // Criar dados base para o teste
      const { cidade, usuario } = await global.createTestData();

      const tiposValidos = [
        "PESSOA",
        "LUGAR",
        "DATA",
        "EVENTO",
        "OBRA_ARTE",
        "COLETIVO_ORGANIZADO",
      ];

      for (const tipo of tiposValidos) {
        const entidade = await prisma.entidade.create({
          data: {
            tipo,
            nome: `Entidade ${tipo}`,
            descricao: `Descrição para ${tipo}`,
            cidadeId: cidade.id,
            usuarioId: usuario.id,
          },
        });

        expect(entidade.tipo).toBe(tipo);
      }
    });

    it("deve falhar com tipo inválido", async () => {
      // Criar dados base para o teste
      const { cidade, usuario } = await global.createTestData();

      await expect(
        prisma.entidade.create({
          data: {
            tipo: "TIPO_INVALIDO",
            nome: "Entidade inválida",
            descricao: "Descrição",
            cidadeId: cidade.id,
            usuarioId: usuario.id,
          },
        })
      ).rejects.toThrow();
    });

    it("deve falhar sem campos obrigatórios", async () => {
      // Criar dados base para o teste
      const { cidade, usuario } = await global.createTestData();

      await expect(
        prisma.entidade.create({
          data: {
            tipo: "PESSOA",
            // nome faltando (obrigatório)
            descricao: "Descrição sem nome",
            cidadeId: cidade.id,
            usuarioId: usuario.id,
          },
        })
      ).rejects.toThrow();

      // descricao é opcional, então não deve falhar
      await expect(async () =>
        prisma.entidade.create({
          data: {
            tipo: "PESSOA",
            nome: "Nome sem descrição",
            // descricao opcional
            cidadeId: cidade.id,
            usuarioId: usuario.id,
          },
        })
      ).not.toThrow();
    });
  });

  describe("Consultas e Filtros", () => {
    it("deve buscar entidades por cidade", async () => {
      // Criar dados base para o teste
      const { cidade, usuario } = await global.createTestData();

      // Criar entidades de teste
      await prisma.entidade.create({
        data: {
          tipo: "PESSOA",
          nome: "João Silva Consulta",
          descricao: "Pessoa importante",
          cidadeId: cidade.id,
          usuarioId: usuario.id,
          profissao: "Professor",
        },
      });

      await prisma.entidade.create({
        data: {
          tipo: "LUGAR",
          nome: "Praça Central Consulta",
          descricao: "Praça histórica",
          cidadeId: cidade.id,
          usuarioId: usuario.id,
          localizacao: "Centro",
        },
      });

      const entidades = await prisma.entidade.findMany({
        where: { cidadeId: cidade.id },
      });

      expect(entidades.length).toBeGreaterThan(0);
      entidades.forEach((entidade) => {
        expect(entidade.cidadeId).toBe(cidade.id);
      });
    });

    it("deve filtrar entidades por tipo", async () => {
      // Criar dados base para o teste
      const { cidade, usuario } = await global.createTestData();

      // Criar entidades de teste
      await prisma.entidade.create({
        data: {
          tipo: "PESSOA",
          nome: "João Silva Tipo",
          descricao: "Pessoa importante",
          cidadeId: cidade.id,
          usuarioId: usuario.id,
          profissao: "Professor",
        },
      });

      await prisma.entidade.create({
        data: {
          tipo: "LUGAR",
          nome: "Praça Central Tipo",
          descricao: "Praça histórica",
          cidadeId: cidade.id,
          usuarioId: usuario.id,
          localizacao: "Centro",
        },
      });

      const pessoas = await prisma.entidade.findMany({
        where: {
          cidadeId: cidade.id,
          tipo: "PESSOA",
        },
      });

      expect(pessoas.length).toBeGreaterThan(0);
      pessoas.forEach((pessoa) => {
        expect(pessoa.tipo).toBe("PESSOA");
      });
    });

    it("deve buscar entidades por nome", async () => {
      // Criar dados base para o teste
      const { cidade, usuario } = await global.createTestData();

      // Criar entidade de teste
      await prisma.entidade.create({
        data: {
          tipo: "PESSOA",
          nome: "João Silva Nome",
          descricao: "Pessoa para busca por nome",
          cidadeId: cidade.id,
          usuarioId: usuario.id,
          profissao: "Professor",
        },
      });

      const entidades = await prisma.entidade.findMany({
        where: {
          cidadeId: cidade.id,
          nome: {
            contains: "João",
          },
        },
      });

      expect(entidades.length).toBeGreaterThan(0);
      entidades.forEach((entidade) => {
        expect(entidade.cidadeId).toBe(cidade.id);
        expect(entidade.nome).toContain("João");
      });
    });
  });
});
