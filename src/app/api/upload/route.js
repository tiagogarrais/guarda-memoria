import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Client } from "basic-ftp";
import { randomUUID } from "crypto";
import path from "path";

export const dynamic = "force-dynamic";

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const pessoaId = formData.get("pessoaId");
    const tipo = formData.get("tipo"); // "foto", "video", "audio"

    if (!file || !pessoaId || !tipo) {
      return NextResponse.json(
        { error: "Arquivo, pessoaId e tipo são obrigatórios" },
        { status: 400 }
      );
    }

    // Validar tipo de arquivo
    const allowedTypes = {
      foto: ["image/jpeg", "image/png", "image/gif", "image/webp"],
      video: ["video/mp4", "video/avi", "video/mov", "video/wmv"],
      audio: ["audio/mp3", "audio/wav", "audio/ogg", "audio/m4a"],
    };

    if (!allowedTypes[tipo]?.includes(file.type)) {
      return NextResponse.json(
        { error: `Tipo de arquivo não permitido para ${tipo}` },
        { status: 400 }
      );
    }

    // Validar tamanho do arquivo (máximo 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "Arquivo muito grande. Máximo 50MB" },
        { status: 400 }
      );
    }

    // Conectar ao FTP
    const client = new Client();
    client.ftp.verbose = false; // Desabilitar logs detalhados

    try {
      await client.access({
        host: process.env.FTP_HOST,
        user: process.env.FTP_USER,
        password: process.env.FTP_PASSWORD,
        port: parseInt(process.env.FTP_PORT) || 21,
      });

      // Criar diretório da pessoa se não existir
      const pessoaDir = `${process.env.FTP_BASE_PATH}/${pessoaId}`;
      const tipoDir =
        tipo === "foto" ? "fotos" : tipo === "video" ? "videos" : "audios";
      const fullPath = `${pessoaDir}/${tipoDir}`;

      try {
        await client.ensureDir(fullPath);
      } catch (error) {
        console.error("Erro ao criar diretório:", error);
        return NextResponse.json(
          { error: "Erro ao criar diretório no servidor" },
          { status: 500 }
        );
      }

      // Gerar nome único para o arquivo
      const fileExtension = path.extname(file.name);
      const fileName = `${randomUUID()}${fileExtension}`;
      const remotePath = `${fullPath}/${fileName}`;

      // Converter o arquivo para buffer
      const buffer = Buffer.from(await file.arrayBuffer());

      // Upload do arquivo
      await client.uploadFrom(buffer, remotePath);

      // Gerar URL pública do arquivo
      const publicUrl = `https://admtiago.com.br/${pessoaId}/${tipoDir}/${fileName}`;

      // Salvar no banco de dados
      const { PrismaClient } = require("@prisma/client");
      const prisma = new PrismaClient();

      const media = await prisma.media.create({
        data: {
          pessoaId,
          usuarioId: session.user.id,
          tipo,
          url: publicUrl,
        },
      });

      await prisma.$disconnect();

      return NextResponse.json({
        success: true,
        media: {
          id: media.id,
          tipo: media.tipo,
          url: media.url,
        },
      });
    } catch (ftpError) {
      console.error("Erro no FTP:", ftpError);
      return NextResponse.json(
        { error: "Erro no upload para o servidor" },
        { status: 500 }
      );
    } finally {
      client.close();
    }
  } catch (error) {
    console.error("Erro no upload:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
