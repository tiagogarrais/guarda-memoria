const { PrismaClient } = require("@prisma/client");

const prisma = global.prisma;

// Mock do NextAuth
jest.mock("next-auth", () => ({
  getServerSession: jest.fn(),
}));

describe("Testes de Comentários - Validações Básicas", () => {
  afterEach(async () => {
    // Limpar dados após cada teste para isolamento
    await global.cleanupTestData();
  });

  describe("Criação de Comentários", () => {
    it("deve criar um comentário com sucesso", async () => {
      // Criar dados base para o teste
      const { cidade, usuario } = await global.createTestData();

      // Criar entidade para testar comentário
      const entidade = await prisma.entidade.create({
        data: {
          tipo: "PESSOA",
          nome: "Pessoa Teste",
          descricao: "Pessoa para teste de comentário",
          cidadeId: cidade.id,
          usuarioId: usuario.id,
        },
      });

      const comentario = await prisma.comentario.create({
        data: {
          entidadeId: entidade.id,
          pessoaId: usuario.id,
          texto: "Este é um comentário de teste",
        },
      });

      expect(comentario).toHaveProperty("id");
      expect(comentario.texto).toBe("Este é um comentário de teste");
      expect(comentario.entidadeId).toBe(entidadeId);
      expect(comentario.usuarioId).toBe(usuarioId);
    });

    it("deve falhar sem entidadeId", async () => {
      // Criar dados base para o teste
      const { usuario } = await global.createTestData();

      await expect(
        prisma.comentario.create({
          data: {
            pessoaId: usuario.id,
            texto: "Comentário sem entidadeId",
          },
        })
      ).rejects.toThrow();
    });

    it("deve falhar sem texto", async () => {
      // Criar dados base para o teste
      const { cidade, usuario } = await global.createTestData();

      // Criar entidade para testar comentário
      const entidade = await prisma.entidade.create({
        data: {
          tipo: "PESSOA",
          nome: "Pessoa Teste Falha Texto",
          descricao: "Pessoa para teste de falha de texto",
          cidadeId: cidade.id,
          usuarioId: usuario.id,
        },
      });

      await expect(
        prisma.comentario.create({
          data: {
            entidadeId: entidade.id,
            pessoaId: usuario.id,
          },
        })
      ).rejects.toThrow();
    });

    it("deve falhar com texto vazio", async () => {
      // Criar dados base para o teste
      const { cidade, usuario } = await global.createTestData();

      // Criar entidade para testar comentário
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
        prisma.comentario.create({
          data: {
            entidadeId: entidade.id,
            pessoaId: usuario.id,
            texto: "   ",
          },
        })
      ).rejects.toThrow();
    });
  });

  describe("Consultas de Comentários", () => {
    it("deve retornar comentários de uma entidade", async () => {
      // Criar dados base para o teste
      const { cidade, usuario } = await global.createTestData();

      // Criar entidade para testar comentário
      const entidade = await prisma.entidade.create({
        data: {
          tipo: "PESSOA",
          nome: "Pessoa Teste Consulta",
          descricao: "Pessoa para teste de consulta",
          cidadeId: cidade.id,
          usuarioId: usuario.id,
        },
      });

      // Criar comentários para teste
      await prisma.comentario.create({
        data: {
          entidadeId: entidade.id,
          pessoaId: usuario.id,
          texto: "Primeiro comentário de teste",
        },
      });

      await prisma.comentario.create({
        data: {
          entidadeId: entidade.id,
          pessoaId: usuario.id,
          texto: "Segundo comentário de teste",
        },
      });

      const comentarios = await prisma.comentario.findMany({
        where: { entidadeId: entidade.id },
        include: {
          usuario: true,
        },
      });

      expect(Array.isArray(comentarios)).toBe(true);
      expect(comentarios.length).toBeGreaterThan(0);
      comentarios.forEach((comentario) => {
        expect(comentario).toHaveProperty("texto");
        expect(comentario).toHaveProperty("usuario");
        expect(comentario.entidadeId).toBe(entidade.id);
      });
    });

    it("deve ordenar comentários por data de criação", async () => {
      // Criar dados base para o teste
      const { cidade, usuario } = await global.createTestData();

      // Criar entidade para testar comentário
      const entidade = await prisma.entidade.create({
        data: {
          tipo: "PESSOA",
          nome: "Pessoa Teste Ordenacao",
          descricao: "Pessoa para teste de ordenacao",
          cidadeId: cidade.id,
          usuarioId: usuario.id,
        },
      });

      // Criar comentários para teste
      await prisma.comentario.create({
        data: {
          entidadeId: entidade.id,
          pessoaId: usuario.id,
          texto: "Primeiro comentário",
        },
      });

      // Pequena pausa para garantir ordem
      await new Promise((resolve) => setTimeout(resolve, 10));

      await prisma.comentario.create({
        data: {
          entidadeId: entidade.id,
          pessoaId: usuario.id,
          texto: "Segundo comentário",
        },
      });

      const comentarios = await prisma.comentario.findMany({
        where: { entidadeId: entidade.id },
        orderBy: { createdAt: "desc" },
      });

      expect(comentarios.length).toBeGreaterThan(1);
      for (let i = 0; i < comentarios.length - 1; i++) {
        expect(comentarios[i].createdAt.getTime()).toBeGreaterThanOrEqual(
          comentarios[i + 1].createdAt.getTime()
        );
      }
    });

    it("deve contar comentários de uma entidade", async () => {
      // Criar dados base para o teste
      const { cidade, usuario } = await global.createTestData();

      // Criar entidade para testar comentário
      const entidade = await prisma.entidade.create({
        data: {
          tipo: "PESSOA",
          nome: "Pessoa Teste Contagem",
          descricao: "Pessoa para teste de contagem",
          cidadeId: cidade.id,
          usuarioId: usuario.id,
        },
      });

      // Criar comentários para teste
      await prisma.comentario.create({
        data: {
          entidadeId: entidade.id,
          pessoaId: usuario.id,
          texto: "Comentário para contagem",
        },
      });

      const count = await prisma.comentario.count({
        where: { entidadeId: entidade.id },
      });

      expect(typeof count).toBe("number");
      expect(count).toBeGreaterThan(0);
    });
  });

  describe("Atualização de Comentários", () => {
    it("deve atualizar texto do comentário", async () => {
      // Criar dados base para o teste
      const { cidade, usuario } = await global.createTestData();

      // Criar entidade para testar comentário
      const entidade = await prisma.entidade.create({
        data: {
          tipo: "PESSOA",
          nome: "Pessoa Teste Atualizacao",
          descricao: "Pessoa para teste de atualizacao",
          cidadeId: cidade.id,
          usuarioId: usuario.id,
        },
      });

      // Criar comentário para teste
      const comentario = await prisma.comentario.create({
        data: {
          entidadeId: entidade.id,
          pessoaId: usuario.id,
          texto: "Texto original",
        },
      });

      const updated = await prisma.comentario.update({
        where: { id: comentario.id },
        data: { texto: "Texto atualizado" },
      });

      expect(updated.texto).toBe("Texto atualizado");
      expect(updated.id).toBe(comentario.id);
    });
  });

  describe("Remoção de Comentários", () => {
    it("deve remover um comentário", async () => {
      // Criar dados base para o teste
      const { cidade, usuario } = await global.createTestData();

      // Criar entidade para testar comentário
      const entidade = await prisma.entidade.create({
        data: {
          tipo: "PESSOA",
          nome: "Pessoa Teste Remocao",
          descricao: "Pessoa para teste de remocao",
          cidadeId: cidade.id,
          usuarioId: usuario.id,
        },
      });

      // Criar comentário para teste
      const comentario = await prisma.comentario.create({
        data: {
          entidadeId: entidade.id,
          pessoaId: usuario.id,
          texto: "Comentário para remoção",
        },
      });

      const deleted = await prisma.comentario.delete({
        where: { id: comentario.id },
      });

      expect(deleted.id).toBe(comentario.id);

      // Verificar que foi removido
      const check = await prisma.comentario.findFirst({
        where: { id: comentario.id },
      });

      expect(check).toBeNull();
    });
  });
});
