import { PrismaClient } from "@prisma/client";

let prisma;

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient({
    log: ["error"],
  });
} else {
  // Avoid creating multiple instances in development
  if (!global.prisma) {
    global.prisma = new PrismaClient({
      log: ["query", "error", "warn"],
    });
  }
  prisma = global.prisma;

  // Teste de conexão em desenvolvimento
  prisma
    .$connect()
    .then(() => console.log("✅ Banco de dados conectado"))
    .catch((error) => console.error("❌ Erro ao conectar ao banco:", error));
}

export default prisma;
