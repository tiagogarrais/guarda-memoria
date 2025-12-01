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
    const memoriaId = formData.get("memoriaId");

    if (!file || !memoriaId) {
      return NextResponse.json(
        { error: "Arquivo e memoriaId são obrigatórios" },
        { status: 400 }
      );
    }

    // Verificar se a memoria existe
    const prisma = new PrismaClient();
    const memoria = await prisma.memoria.findUnique({
      where: { id: memoriaId },
    });

    if (!memoria) {
      await prisma.$disconnect();
      return NextResponse.json(
        { error: "Memória não encontrada" },
        { status: 404 }
      );
    }

    // Validar tipo de arquivo (apenas imagens para foto)
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/svg+xml",
    ];

    if (!allowedTypes.includes(file.type)) {
      await prisma.$disconnect();
      return NextResponse.json(
        {
          error:
            "Tipo de arquivo não permitido. Apenas imagens são aceitas para foto.",
        },
        { status: 400 }
      );
    }

    // Validar tamanho do arquivo (máximo 10MB para fotos)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      await prisma.$disconnect();
      return NextResponse.json(
        { error: "Arquivo muito grande. Máximo 10MB para fotos" },
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

      // Criar diretório da memoria se não existir
      const memoriaDir = memoriaId;
      const tipoDir = "fotos";

      try {
        // Criar diretório da memoria
        try {
          await client.send(`MKD ${memoriaDir}`);
        } catch (error) {
          // Diretório pode já existir
        }
        await client.cd(memoriaDir);

        // Criar subdiretório para fotos
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
      const fileExtension = path.extname(file.name).toLowerCase();
      const fileName = `${randomUUID()}${fileExtension}`;
      const remotePath = fileName;

      // Converter o arquivo para buffer
      const buffer = Buffer.from(await file.arrayBuffer());

      // Upload do arquivo
      const stream = Readable.from(buffer);
      await client.uploadFrom(stream, remotePath);

      // Gerar URL pública do arquivo
      const publicUrl = `https://files.admtiago.com.br/${memoriaId}/${tipoDir}/${fileName}`;

      // Atualizar a memoria com a URL da foto
      await prisma.memoria.update({
        where: { id: memoriaId },
        data: {
          fotoUrl: publicUrl,
        },
      });

      await prisma.$disconnect();

      return NextResponse.json({
        success: true,
        foto: {
          url: publicUrl,
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
