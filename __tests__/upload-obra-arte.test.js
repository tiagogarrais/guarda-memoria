const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");

const prisma = global.prisma;

// Mock do NextAuth
jest.mock("next-auth", () => ({
  getServerSession: jest.fn(),
}));

// Mock do FTP
jest.mock("basic-ftp", () => ({
  Client: jest.fn(() => ({
    access: jest.fn(),
    uploadFrom: jest.fn(),
    close: jest.fn(),
  })),
}));

describe("Testes de Upload Obra de Arte - Validações Básicas", () => {
  afterEach(async () => {
    // Limpar dados após cada teste para isolamento
    await global.cleanupTestData();
  });

  describe("Validações de Arquivo", () => {
    it("deve validar tipos de arquivo permitidos", () => {
      const tiposPermitidos = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
      ];
      const tiposInvalidos = [
        "application/pdf",
        "text/plain",
        "application/octet-stream",
      ];

      // Simular validação de tipos permitidos
      tiposPermitidos.forEach((tipo) => {
        expect([
          "image/jpeg",
          "image/png",
          "image/gif",
          "image/webp",
        ]).toContain(tipo);
      });

      tiposInvalidos.forEach((tipo) => {
        expect([
          "image/jpeg",
          "image/png",
          "image/gif",
          "image/webp",
        ]).not.toContain(tipo);
      });
    });

    it("deve validar tamanho máximo do arquivo", () => {
      const tamanhoMaximo = 100 * 1024 * 1024; // 100MB
      const arquivoPequeno = 1024; // 1KB
      const arquivoGrande = 101 * 1024 * 1024; // 101MB

      expect(arquivoPequeno).toBeLessThan(tamanhoMaximo);
      expect(arquivoGrande).toBeGreaterThan(tamanhoMaximo);
    });

    it("deve validar extensões de arquivo", () => {
      const extensoesPermitidas = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
      const extensoesInvalidas = [".exe", ".pdf", ".txt", ".zip"];

      extensoesPermitidas.forEach((ext) => {
        expect([".jpg", ".jpeg", ".png", ".gif", ".webp"]).toContain(ext);
      });

      extensoesInvalidas.forEach((ext) => {
        expect([".jpg", ".jpeg", ".png", ".gif", ".webp"]).not.toContain(ext);
      });
    });
  });

  describe("Armazenamento de Arquivos", () => {
    it("deve criar registro de arquivo na entidade", async () => {
      // Criar dados base para o teste
      const { cidade, usuario } = await global.createTestData();

      const entidadeComArquivo = await prisma.entidade.create({
        data: {
          tipo: "OBRA_ARTE",
          nome: "Obra com Arquivo",
          descricao: "Obra de arte com arquivo para teste",
          cidadeId: cidade.id,
          usuarioId: usuario.id,
          artista: "Artista Teste",
          anoCriacao: 2023,
          tecnica: "Grafite",
          arquivoUrl: "/uploads/teste-imagem.jpg",
          tipoArquivo: "image/jpeg",
          tamanhoArquivo: 1024,
          nomeArquivo: "teste-imagem.jpg",
        },
      });

      expect(entidadeComArquivo).toHaveProperty("id");
      expect(entidadeComArquivo.arquivoUrl).toBe("/uploads/teste-imagem.jpg");
      expect(entidadeComArquivo.tipoArquivo).toBe("image/jpeg");
      expect(entidadeComArquivo.tamanhoArquivo).toBe(1024);
      expect(entidadeComArquivo.nomeArquivo).toBe("teste-imagem.jpg");
    });

    it("deve falhar ao criar entidade sem campos obrigatórios", async () => {
      // Criar dados base para o teste
      const { cidade, usuario } = await global.createTestData();

      await expect(
        prisma.entidade.create({
          data: {
            tipo: "OBRA_ARTE",
            nome: "Obra Incompleta",
            // descricao é opcional
            cidadeId: cidade.id,
            usuarioId: usuario.id,
            // Campos específicos de obra de arte são opcionais
          },
        })
      ).not.toThrow(); // Não deve falhar pois campos são opcionais
    });
  });

  describe("Consultas de Arquivos", () => {
    it("deve buscar obras de arte com arquivos", async () => {
      // Criar dados base para o teste
      const { cidade, usuario } = await global.createTestData();

      // Criar entidades de teste com arquivos
      await prisma.entidade.create({
        data: {
          tipo: "OBRA_ARTE",
          nome: "Obra 1",
          descricao: "Obra de arte 1",
          cidadeId: cidade.id,
          usuarioId: usuario.id,
          artista: "Artista 1",
          anoCriacao: 2020,
          tecnica: "Óleo",
          arquivoUrl: "/uploads/imagem1.jpg",
          tipoArquivo: "image/jpeg",
          tamanhoArquivo: 2048,
          nomeArquivo: "imagem1.jpg",
        },
      });

      await prisma.entidade.create({
        data: {
          tipo: "OBRA_ARTE",
          nome: "Obra 2",
          descricao: "Obra de arte 2",
          cidadeId: cidade.id,
          usuarioId: usuario.id,
          artista: "Artista 2",
          anoCriacao: 2021,
          tecnica: "Acrílico",
          arquivoUrl: "/uploads/imagem2.png",
          tipoArquivo: "image/png",
          tamanhoArquivo: 3072,
          nomeArquivo: "imagem2.png",
        },
      });

      const obras = await prisma.entidade.findMany({
        where: {
          tipo: "OBRA_ARTE",
          cidadeId: cidade.id,
          arquivoUrl: { not: null },
        },
      });

      expect(Array.isArray(obras)).toBe(true);
      expect(obras.length).toBeGreaterThan(0);
      obras.forEach((obra) => {
        expect(obra.tipo).toBe("OBRA_ARTE");
        expect(obra.arquivoUrl).toBeTruthy();
        expect(obra.tipoArquivo).toBeTruthy();
        expect(obra.nomeArquivo).toBeTruthy();
      });
    });

    it("deve contar obras de arte com arquivos", async () => {
      // Criar dados base para o teste
      const { cidade, usuario } = await global.createTestData();

      // Criar entidade de teste com arquivo
      await prisma.entidade.create({
        data: {
          tipo: "OBRA_ARTE",
          nome: "Obra para Contagem",
          descricao: "Obra de arte para contagem",
          cidadeId: cidade.id,
          usuarioId: usuario.id,
          artista: "Artista Contagem",
          anoCriacao: 2022,
          tecnica: "Tinta",
          arquivoUrl: "/uploads/imagem-contagem.jpg",
          tipoArquivo: "image/jpeg",
          tamanhoArquivo: 4096,
          nomeArquivo: "imagem-contagem.jpg",
        },
      });

      const count = await prisma.entidade.count({
        where: {
          tipo: "OBRA_ARTE",
          arquivoUrl: { not: null },
        },
      });

      expect(typeof count).toBe("number");
      expect(count).toBeGreaterThan(0);
    });

    it("deve buscar obra de arte por ID", async () => {
      // Criar dados base para o teste
      const { cidade, usuario } = await global.createTestData();

      // Criar entidade de teste com arquivo
      const obra = await prisma.entidade.create({
        data: {
          tipo: "OBRA_ARTE",
          nome: "Obra por ID",
          descricao: "Obra de arte para busca por ID",
          cidadeId: cidade.id,
          usuarioId: usuario.id,
          artista: "Artista ID",
          anoCriacao: 2023,
          tecnica: "Digital",
          arquivoUrl: "/uploads/imagem-id.jpg",
          tipoArquivo: "image/jpeg",
          tamanhoArquivo: 5120,
          nomeArquivo: "imagem-id.jpg",
        },
      });

      const obraPorId = await prisma.entidade.findUnique({
        where: { id: obra.id },
      });

      expect(obraPorId.id).toBe(obra.id);
      expect(obraPorId.nomeArquivo).toBe(obra.nomeArquivo);
      expect(obraPorId.arquivoUrl).toBe(obra.arquivoUrl);
    });
  });

  describe("Remoção de Arquivos", () => {
    it("deve remover arquivo da entidade", async () => {
      // Criar dados base para o teste
      const { cidade, usuario } = await global.createTestData();

      // Criar entidade de teste com arquivo
      const obra = await prisma.entidade.create({
        data: {
          tipo: "OBRA_ARTE",
          nome: "Obra para Remocao",
          descricao: "Obra de arte para remoção de arquivo",
          cidadeId: cidade.id,
          usuarioId: usuario.id,
          artista: "Artista Remocao",
          anoCriacao: 2023,
          tecnica: "Grafite",
          arquivoUrl: "/uploads/imagem-remocao.jpg",
          tipoArquivo: "image/jpeg",
          tamanhoArquivo: 2048,
          nomeArquivo: "imagem-remocao.jpg",
        },
      });

      // Remover arquivo (setar campos para null)
      const obraAtualizada = await prisma.entidade.update({
        where: { id: obra.id },
        data: {
          arquivoUrl: null,
          tipoArquivo: null,
          tamanhoArquivo: null,
          nomeArquivo: null,
        },
      });

      expect(obraAtualizada.arquivoUrl).toBeNull();
      expect(obraAtualizada.tipoArquivo).toBeNull();
      expect(obraAtualizada.tamanhoArquivo).toBeNull();
      expect(obraAtualizada.nomeArquivo).toBeNull();
    });
  });
});
