import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Client } from "basic-ftp";
import { randomUUID } from "crypto";
import path from "path";
import { Readable } from "stream";
import { PrismaClient } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const entidadeId = formData.get("entidadeId");

    if (!file || !entidadeId) {
      return NextResponse.json(
        { error: "Arquivo e entidadeId são obrigatórios" },
        { status: 400 }
      );
    }

    // Verificar se a entidade existe e é uma obra de arte
    const prisma = new PrismaClient();
    const entidade = await prisma.entidade.findUnique({
      where: { id: entidadeId },
    });

    if (!entidade) {
      await prisma.$disconnect();
      return NextResponse.json(
        { error: "Entidade não encontrada" },
        { status: 404 }
      );
    }

    if (entidade.tipo !== "OBRA_ARTE") {
      await prisma.$disconnect();
      return NextResponse.json(
        { error: "Esta entidade não é uma obra de arte" },
        { status: 400 }
      );
    }

    // Determinar tipo de arquivo baseado na extensão e MIME type
    const fileExtension = path.extname(file.name).toLowerCase();
    const mimeType = file.type.toLowerCase();

    let tipoArquivo = "documento"; // padrão

    if (
      mimeType.startsWith("image/") ||
      [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"].includes(fileExtension)
    ) {
      tipoArquivo = "imagem";
    } else if (
      mimeType.startsWith("audio/") ||
      [".mp3", ".wav", ".ogg", ".m4a", ".flac"].includes(fileExtension)
    ) {
      tipoArquivo = "audio";
    } else if (
      mimeType.startsWith("video/") ||
      [".mp4", ".avi", ".mov", ".wmv", ".mkv"].includes(fileExtension)
    ) {
      tipoArquivo = "video";
    } else if (
      [".pdf", ".doc", ".docx", ".txt", ".rtf"].includes(fileExtension) ||
      mimeType === "application/pdf" ||
      mimeType.startsWith("text/") ||
      mimeType.includes("document")
    ) {
      tipoArquivo = "documento";
    }

    // Validar tamanho do arquivo (máximo 100MB para obras de arte)
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      await prisma.$disconnect();
      return NextResponse.json(
        { error: "Arquivo muito grande. Máximo 100MB" },
        { status: 400 }
      );
    }

    // Conectar ao FTP
    const client = new Client();
    client.ftp.verbose = false;

    try {
      await client.access({
        host: process.env.FTP_HOST,
        user: process.env.FTP_USER,
        password: process.env.FTP_PASSWORD,
        port: parseInt(process.env.FTP_PORT) || 21,
      });

      // Navegar para o diretório base configurado
      const basePath = process.env.FTP_BASE_PATH || "";

      try {
        if (basePath) {
          await client.cd(basePath);
        }
      } catch (error) {
        try {
          if (basePath) {
            await client.send(`MKD ${basePath}`);
            await client.cd(basePath);
          }
        } catch (createError) {
          await prisma.$disconnect();
          return NextResponse.json(
            { error: "Erro ao criar/acessar diretório base no servidor" },
            { status: 500 }
          );
        }
      }

      // Criar diretório da entidade se não existir
      const entidadeDir = entidadeId;
      const tipoDir = "obras-arte";

      try {
        // Criar diretório da entidade
        try {
          await client.send(`MKD ${entidadeDir}`);
        } catch (error) {
          // Diretório pode já existir
        }
        await client.cd(entidadeDir);

        // Criar subdiretório para obras de arte
        try {
          await client.send(`MKD ${tipoDir}`);
        } catch (error) {
          // Diretório pode já existir
        }
        await client.cd(tipoDir);
      } catch (error) {
        await prisma.$disconnect();
        return NextResponse.json(
          { error: "Erro ao criar diretório no servidor" },
          { status: 500 }
        );
      }

      // Gerar nome único para o arquivo
      const fileName = `${randomUUID()}${fileExtension}`;
      const remotePath = fileName;

      // Converter o arquivo para buffer
      const buffer = Buffer.from(await file.arrayBuffer());

      // Upload do arquivo
      const stream = Readable.from(buffer);
      await client.uploadFrom(stream, remotePath);

      // Gerar URL pública do arquivo
      const publicUrl = `https://files.admtiago.com.br/guarda-memoria/${entidadeId}/${tipoDir}/${fileName}`;

      // Atualizar a entidade com as informações do arquivo
      await prisma.entidade.update({
        where: { id: entidadeId },
        data: {
          arquivoUrl: publicUrl,
          tipoArquivo,
          tamanhoArquivo: file.size,
          nomeArquivo: file.name,
        },
      });

      await prisma.$disconnect();

      return NextResponse.json({
        success: true,
        arquivo: {
          url: publicUrl,
          tipoArquivo,
          tamanhoArquivo: file.size,
          nomeArquivo: file.name,
        },
      });
    } catch (ftpError) {
      await prisma.$disconnect();
      return NextResponse.json(
        { error: "Erro no upload para o servidor" },
        { status: 500 }
      );
    } finally {
      client.close();
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
