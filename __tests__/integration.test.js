const { PrismaClient } = require("@prisma/client");

const prisma = global.prisma;

// Mock do NextAuth
jest.mock("next-auth", () => ({
  getServerSession: jest.fn(),
}));

describe("Testes de Integração - Fluxo Completo", () => {
  afterEach(async () => {
    // Limpar dados após cada teste para isolamento
    await global.cleanupTestData();
  });

  describe("Fluxo Completo: Criar Entidade → Curtir → Comentar", () => {
    it("deve executar o fluxo completo com sucesso", async () => {
      // Criar dados base para o teste
      const { cidade, usuario } = await global.createTestData();

      // 1. Criar uma entidade
      const entidade = await prisma.entidade.create({
        data: {
          tipo: "PESSOA",
          nome: "Maria Santos",
          descricao: "Professora dedicada que marcou a educação da cidade",
          cidadeId: cidade.id,
          usuarioId: usuario.id,
          categoria: "Educador",
          profissao: "Professora",
          dataNascimento: new Date("1975-03-15"),
          tags: JSON.stringify(["educação", "professora", "dedicação"]),
        },
      });

      expect(entidade).toHaveProperty("id");

      // 2. Buscar a entidade criada
      const entidades = await prisma.entidade.findMany({
        where: {
          cidadeId: cidade.id,
          tipo: "PESSOA",
        },
      });

      expect(Array.isArray(entidades)).toBe(true);
      const entidadeEncontrada = entidades.find((e) => e.id === entidade.id);
      expect(entidadeEncontrada).toBeDefined();
      expect(entidadeEncontrada.nome).toContain("Maria Santos");
      expect(entidadeEncontrada.profissao).toBe("Professora");

      // 3. Curtir a entidade
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

      // 4. Verificar contagem de curtidas
      const count = await prisma.curtida.count({
        where: { entidadeId: entidade.id },
      });

      expect(typeof count).toBe("number");
      expect(count).toBe(1);

      // 5. Adicionar comentário
      const comentario = await prisma.comentario.create({
        data: {
          entidadeId: entidade.id, // Usando entidadeId para entidade do tipo PESSOA
          usuarioId: usuario.id,
          texto:
            "Maria foi uma excelente professora que inspirou muitos alunos!",
        },
      });

      expect(comentario).toHaveProperty("id");
      expect(comentario.texto).toBe(
        "Maria foi uma excelente professora que inspirou muitos alunos!"
      );

      // 6. Buscar comentários
      const comentarios = await prisma.comentario.findMany({
        where: { entidadeId: entidade.id },
        include: {
          usuario: true,
        },
      });

      expect(Array.isArray(comentarios)).toBe(true);
      expect(comentarios.length).toBe(1);
      expect(comentarios[0].texto).toBe(
        "Maria foi uma excelente professora que inspirou muitos alunos!"
      );
    });
  });

  describe("Cenários de Erro", () => {
    it("deve falhar ao curtir entidade inexistente", async () => {
      // Criar dados base para o teste
      const { usuario } = await global.createTestData();

      await expect(
        prisma.curtida.create({
          data: {
            entidadeId: "entidade-inexistente",
            usuarioId: usuario.id,
          },
        })
      ).rejects.toThrow();
    });

    it("deve permitir múltiplos comentários do mesmo usuário", async () => {
      // Criar dados base para o teste
      const { cidade, usuario } = await global.createTestData();

      // Criar entidade de teste
      const entidade = await prisma.entidade.create({
        data: {
          tipo: "LUGAR",
          nome: "Praça Teste",
          descricao: "Praça para teste",
          cidadeId: cidade.id,
          usuarioId: usuario.id,
        },
      });

      // Primeiro comentário
      const comentario1 = await prisma.comentario.create({
        data: {
          entidadeId: entidade.id, // Usando entidadeId para entidade
          usuarioId: usuario.id,
          texto: "Primeiro comentário sobre esta entidade!",
        },
      });

      // Segundo comentário do mesmo usuário (deve ser permitido)
      const comentario2 = await prisma.comentario.create({
        data: {
          entidadeId: entidade.id, // Usando entidadeId para entidade
          usuarioId: usuario.id,
          texto: "Segundo comentário sobre esta entidade!",
        },
      });

      expect(comentario1).toHaveProperty("id");
      expect(comentario2).toHaveProperty("id");
      expect(comentario1.id).not.toBe(comentario2.id);
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

    it("deve validar datas corretamente", async () => {
      // Criar dados base para o teste
      const { cidade, usuario } = await global.createTestData();

      const entidade = await prisma.entidade.create({
        data: {
          tipo: "PESSOA",
          nome: "Pessoa com data válida",
          descricao: "Descrição",
          cidadeId: cidade.id,
          usuarioId: usuario.id,
          dataNascimento: new Date("1975-03-15"),
        },
      });

      expect(entidade.dataNascimento).toEqual(new Date("1975-03-15"));
    });

    it("deve validar campos específicos por tipo", async () => {
      // Criar dados base para o teste
      const { cidade, usuario } = await global.createTestData();

      // PESSOA com campos específicos
      const pessoa = await prisma.entidade.create({
        data: {
          tipo: "PESSOA",
          nome: "João Silva",
          descricao: "Pessoa",
          cidadeId: cidade.id,
          usuarioId: usuario.id,
          profissao: "Professor",
          categoria: "Educador",
        },
      });

      expect(pessoa.profissao).toBe("Professor");
      expect(pessoa.categoria).toBe("Educador");

      // OBRA_ARTE com campos específicos
      const obra = await prisma.entidade.create({
        data: {
          tipo: "OBRA_ARTE",
          nome: "Mural Arte",
          descricao: "Obra de arte",
          cidadeId: cidade.id,
          usuarioId: usuario.id,
          artista: "Maria Santos",
          anoCriacao: 2020,
          tecnica: "Grafite",
        },
      });

      expect(obra.artista).toBe("Maria Santos");
      expect(obra.anoCriacao).toBe(2020);
      expect(obra.tecnica).toBe("Grafite");
    });
  });

  describe("Relacionamentos e Integridade", () => {
    it("deve manter integridade referencial", async () => {
      // Criar dados base para o teste
      const { cidade, usuario } = await global.createTestData();

      // Criar entidade
      const entidade = await prisma.entidade.create({
        data: {
          tipo: "PESSOA",
          nome: "Teste Integridade",
          descricao: "Teste",
          cidadeId: cidade.id,
          usuarioId: usuario.id,
        },
      });

      // Criar curtida e comentário
      await prisma.curtida.create({
        data: {
          entidadeId: entidade.id,
          usuarioId: usuario.id,
        },
      });

      await prisma.comentario.create({
        data: {
          entidadeId: entidade.id, // Usando entidadeId para entidade
          usuarioId: usuario.id,
          texto: "Comentário de teste",
        },
      });

      // Verificar relacionamentos
      const entidadeComRelacionamentos = await prisma.entidade.findUnique({
        where: { id: entidade.id },
        include: {
          curtidas: true,
          comentarios: true,
        },
      });

      expect(entidadeComRelacionamentos.curtidas.length).toBe(1);
      expect(entidadeComRelacionamentos.comentarios.length).toBe(1);
    });

    it("deve falhar ao criar entidade com cidade inexistente", async () => {
      // Criar dados base para o teste
      const { usuario } = await global.createTestData();

      await expect(
        prisma.entidade.create({
          data: {
            tipo: "PESSOA",
            nome: "Pessoa sem cidade",
            descricao: "Descrição",
            cidadeId: "cidade-inexistente",
            usuarioId: usuario.id,
          },
        })
      ).rejects.toThrow();
    });

    it("deve falhar ao criar entidade com usuário inexistente", async () => {
      // Criar dados base para o teste
      const { cidade } = await global.createTestData();

      await expect(
        prisma.entidade.create({
          data: {
            tipo: "PESSOA",
            nome: "Pessoa sem usuário",
            descricao: "Descrição",
            cidadeId: cidade.id,
            usuarioId: "usuario-inexistente",
          },
        })
      ).rejects.toThrow();
    });
  });
});
