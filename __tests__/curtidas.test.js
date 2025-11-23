const { PrismaClient } = require("@prisma/client");

const prisma = global.prisma;

// Mock do NextAuth
jest.mock("next-auth", () => ({
  getServerSession: jest.fn(),
}));

describe("Testes de Curtidas - Validações Básicas", () => {
  afterEach(async () => {
    // Limpar dados após cada teste para isolamento
    await global.cleanupTestData();
  });

  describe("Criação de Curtidas", () => {
    it("deve criar uma curtida com sucesso", async () => {
      // Criar dados base para o teste
      const { cidade, usuario } = await global.createTestData();

      // Criar entidade para testar curtida
      const entidade = await prisma.entidade.create({
        data: {
          tipo: "PESSOA",
          nome: "Pessoa Teste",
          descricao: "Pessoa para teste de curtida",
          cidadeId: cidade.id,
          usuarioId: usuario.id,
        },
      });

      const curtida = await prisma.curtida.create({
        data: {
          entidadeId: entidade.id,
          usuarioId: usuario.id,
        },
      });

      // Curtida não tem campo 'id' único, usa chave composta
      expect(curtida).toHaveProperty("entidadeId");
      expect(curtida).toHaveProperty("usuarioId");
      expect(curtida).toHaveProperty("createdAt");
      expect(curtida.entidadeId).toBe(entidade.id);
      expect(curtida.usuarioId).toBe(usuario.id);
    });

    it("deve falhar ao criar curtida duplicada", async () => {
      // Criar dados base para o teste
      const { cidade, usuario } = await global.createTestData();

      // Criar entidade para testar curtida
      const entidade = await prisma.entidade.create({
        data: {
          tipo: "PESSOA",
          nome: "Pessoa Teste Duplicada",
          descricao: "Pessoa para teste de curtida duplicada",
          cidadeId: cidade.id,
          usuarioId: usuario.id,
        },
      });

      // Criar primeira curtida
      await prisma.curtida.create({
        data: {
          entidadeId: entidade.id,
          usuarioId: usuario.id,
        },
      });

      // Tentar criar segunda curtida (deve falhar)
      await expect(
        prisma.curtida.create({
          data: {
            entidadeId: entidade.id,
            usuarioId: usuario.id,
          },
        })
      ).rejects.toThrow();
    });

    it("deve falhar sem entidadeId", async () => {
      // Criar dados base para o teste
      const { usuario } = await global.createTestData();

      await expect(
        prisma.curtida.create({
          data: {
            usuarioId: usuario.id,
          },
        })
      ).rejects.toThrow();
    });

    it("deve falhar sem usuarioId", async () => {
      // Criar dados base para o teste
      const { cidade, usuario } = await global.createTestData();

      // Criar entidade para testar curtida
      const entidade = await prisma.entidade.create({
        data: {
          tipo: "PESSOA",
          nome: "Pessoa Teste Falha",
          descricao: "Pessoa para teste de falha",
          cidadeId: cidade.id,
          usuarioId: usuario.id,
        },
      });

      await expect(
        prisma.curtida.create({
          data: {
            entidadeId: entidade.id,
          },
        })
      ).rejects.toThrow();
    });
  });

  describe("Consultas de Curtidas", () => {
    it("deve retornar curtidas de uma entidade", async () => {
      // Criar dados base para o teste
      const { cidade, usuario } = await global.createTestData();

      // Criar entidade para testar curtida
      const entidade = await prisma.entidade.create({
        data: {
          tipo: "PESSOA",
          nome: "Pessoa Teste Consulta",
          descricao: "Pessoa para teste de consulta",
          cidadeId: cidade.id,
          usuarioId: usuario.id,
        },
      });

      // Criar curtida
      await prisma.curtida.create({
        data: {
          entidadeId: entidade.id,
          usuarioId: usuario.id,
        },
      });

      const curtidas = await prisma.curtida.findMany({
        where: { entidadeId: entidade.id },
      });

      expect(Array.isArray(curtidas)).toBe(true);
      expect(curtidas.length).toBeGreaterThan(0);
      curtidas.forEach((curtida) => {
        expect(curtida.entidadeId).toBe(entidade.id);
      });
    });

    it("deve retornar contagem de curtidas", async () => {
      // Criar dados base para o teste
      const { cidade, usuario } = await global.createTestData();

      // Criar entidade para testar curtida
      const entidade = await prisma.entidade.create({
        data: {
          tipo: "PESSOA",
          nome: "Pessoa Teste Contagem",
          descricao: "Pessoa para teste de contagem",
          cidadeId: cidade.id,
          usuarioId: usuario.id,
        },
      });

      // Criar curtida
      await prisma.curtida.create({
        data: {
          entidadeId: entidade.id,
          usuarioId: usuario.id,
        },
      });

      const count = await prisma.curtida.count({
        where: { entidadeId: entidade.id },
      });

      expect(typeof count).toBe("number");
      expect(count).toBeGreaterThan(0);
    });

    it("deve verificar se usuário curtiu entidade", async () => {
      // Criar dados base para o teste
      const { cidade, usuario } = await global.createTestData();

      // Criar entidade para testar curtida
      const entidade = await prisma.entidade.create({
        data: {
          tipo: "PESSOA",
          nome: "Pessoa Teste Verificacao",
          descricao: "Pessoa para teste de verificacao",
          cidadeId: cidade.id,
          usuarioId: usuario.id,
        },
      });

      // Criar curtida
      await prisma.curtida.create({
        data: {
          entidadeId: entidade.id,
          usuarioId: usuario.id,
        },
      });

      const curtida = await prisma.curtida.findFirst({
        where: {
          entidadeId: entidade.id,
          usuarioId: usuario.id,
        },
      });

      expect(curtida).toBeTruthy();
      expect(curtida.entidadeId).toBe(entidade.id);
      expect(curtida.usuarioId).toBe(usuario.id);
    });
  });

  describe("Remoção de Curtidas", () => {
    it("deve remover uma curtida", async () => {
      // Criar dados base para o teste
      const { cidade, usuario } = await global.createTestData();

      // Criar entidade para testar curtida
      const entidade = await prisma.entidade.create({
        data: {
          tipo: "PESSOA",
          nome: "Pessoa Teste Remocao",
          descricao: "Pessoa para teste de remocao",
          cidadeId: cidade.id,
          usuarioId: usuario.id,
        },
      });

      // Criar curtida para teste
      await prisma.curtida.create({
        data: {
          entidadeId: entidade.id,
          usuarioId: usuario.id,
        },
      });

      // Remover usando chave composta
      const deleted = await prisma.curtida.delete({
        where: {
          entidadeId_usuarioId: {
            entidadeId: entidade.id,
            usuarioId: usuario.id,
          },
        },
      });

      expect(deleted.entidadeId).toBe(entidade.id);
      expect(deleted.usuarioId).toBe(usuario.id);

      // Verificar que foi removida
      const check = await prisma.curtida.findUnique({
        where: {
          entidadeId_usuarioId: {
            entidadeId: entidade.id,
            usuarioId: usuario.id,
          },
        },
      });

      expect(check).toBeNull();
    });
  });
});
