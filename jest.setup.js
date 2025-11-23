// jest.setup.js
const { PrismaClient } = require("@prisma/client");

// Configurar variáveis de ambiente para testes
process.env.DATABASE_URL =
  process.env.DATABASE_URL ||
  "mysql://test:test@localhost:3306/guarda_memoria_test";
process.env.NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || "test-secret";
process.env.NEXTAUTH_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";

// Instância compartilhada do Prisma para todos os testes
const prisma = new PrismaClient({
  log:
    process.env.NODE_ENV === "development"
      ? ["query", "error", "warn"]
      : ["error"],
});

// Mock do NextAuth
jest.mock("next-auth", () => ({
  getServerSession: jest.fn(),
}));

// Mock do nodemailer
jest.mock("nodemailer", () => ({
  createTransporter: jest.fn(() => ({
    sendMail: jest.fn(),
  })),
}));

// Mock do basic-ftp
jest.mock("basic-ftp", () => ({
  Client: jest.fn(() => ({
    access: jest.fn(),
    uploadFrom: jest.fn(),
    close: jest.fn(),
  })),
}));

// Expor a instância compartilhada do Prisma
global.prisma = prisma;

// Função helper para criar dados base de teste
global.createTestData = async () => {
  const uniqueId = crypto.randomUUID();

  try {
    // Criar cidade
    const cidade = await prisma.cidade.create({
      data: {
        estado: "SP",
        nome: `São Paulo ${uniqueId}`,
        codigoIbge: `3550308${uniqueId.slice(0, 7)}`,
      },
    });

    // Criar User (NextAuth)
    const user = await prisma.user.create({
      data: {
        name: "Test User",
        email: `test${uniqueId}@example.com`,
      },
    });

    console.log("User criado:", user.id, user.email);

    // Verificar se o User foi criado corretamente
    const userExists = await prisma.user.findUnique({
      where: { id: user.id },
    });

    if (!userExists) {
      throw new Error(`User não foi criado corretamente: ${user.id}`);
    }

    // Criar Usuario (perfil) referenciando o User
    const usuario = await prisma.usuario.create({
      data: {
        userId: user.id, // Usar o ID do User criado
        fullName: "Test User",
        fotoPerfilUrl: "https://example.com/photo.jpg",
      },
    });

    console.log("Usuario criado:", usuario.id, usuario.userId);

    return { cidade, usuario, uniqueId };
  } catch (error) {
    console.error("Erro ao criar dados de teste:", error);
    throw error;
  }
};

// Função helper para limpar dados de teste
global.cleanupTestData = async () => {
  try {
    // Desabilitar verificações de chave estrangeira temporariamente
    await prisma.$executeRaw`SET FOREIGN_KEY_CHECKS = 0`;

    // Deletar registros em ordem reversa das dependências
    await prisma.$executeRaw`DELETE FROM Denuncia`;
    await prisma.$executeRaw`DELETE FROM Curtida`;
    await prisma.$executeRaw`DELETE FROM Comentario`;
    await prisma.$executeRaw`DELETE FROM Media`;
    await prisma.$executeRaw`DELETE FROM Log`;
    await prisma.$executeRaw`DELETE FROM Entidade`;
    await prisma.$executeRaw`DELETE FROM Pessoa`;
    await prisma.$executeRaw`DELETE FROM Usuario`;
    await prisma.$executeRaw`DELETE FROM Cidade`;
    await prisma.$executeRaw`DELETE FROM User`;
    await prisma.$executeRaw`DELETE FROM Session`;
    await prisma.$executeRaw`DELETE FROM Account`;
    await prisma.$executeRaw`DELETE FROM VerificationToken`;

    // Reabilitar verificações de chave estrangeira
    await prisma.$executeRaw`SET FOREIGN_KEY_CHECKS = 1`;
  } catch (error) {
    console.warn("Erro ao limpar banco de dados:", error);
    // Tentar uma abordagem alternativa se DELETE falhar
    try {
      await prisma.$executeRaw`SET FOREIGN_KEY_CHECKS = 0`;
      // Usar TRUNCATE como fallback
      await prisma.$executeRaw`TRUNCATE TABLE Denuncia`;
      await prisma.$executeRaw`TRUNCATE TABLE Curtida`;
      await prisma.$executeRaw`TRUNCATE TABLE Comentario`;
      await prisma.$executeRaw`TRUNCATE TABLE Media`;
      await prisma.$executeRaw`TRUNCATE TABLE Log`;
      await prisma.$executeRaw`TRUNCATE TABLE Entidade`;
      await prisma.$executeRaw`TRUNCATE TABLE Pessoa`;
      await prisma.$executeRaw`TRUNCATE TABLE Usuario`;
      await prisma.$executeRaw`TRUNCATE TABLE Cidade`;
      await prisma.$executeRaw`TRUNCATE TABLE User`;
      await prisma.$executeRaw`TRUNCATE TABLE Session`;
      await prisma.$executeRaw`TRUNCATE TABLE Account`;
      await prisma.$executeRaw`TRUNCATE TABLE VerificationToken`;
      await prisma.$executeRaw`SET FOREIGN_KEY_CHECKS = 1`;
    } catch (fallbackError) {
      console.warn("Erro no fallback de limpeza:", fallbackError);
    }
  }
};

// Limpeza global antes de todos os testes
beforeAll(async () => {
  await global.cleanupTestData();
});

// Limpeza global após todos os testes
afterAll(async () => {
  await global.cleanupTestData();
  await prisma.$disconnect();
});
