import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth";
import { PrismaClient } from "@prisma/client";
import { v2 as cloudinary } from "cloudinary";
import { updateMediaScore } from "../../../lib/mediaUtils";

const prisma = new PrismaClient();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const audio = formData.get("audio");
    const text = formData.get("text");
    const categories = formData.get("categories");
    const parentId = formData.get("parentId"); // Novo campo

    // Verificar se pelo menos um dos campos foi fornecido
    if (!file && !audio && !text) {
      return NextResponse.json(
        { error: "No content provided" },
        { status: 400 }
      );
    }

    // Get user with location
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, stateId: true, cityId: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!user.stateId || !user.cityId) {
      return NextResponse.json(
        { error: "User location not set" },
        { status: 400 }
      );
    }

    let mediaData = {
      type: "text",
      userId: user.id,
      stateId: user.stateId,
      cityId: user.cityId,
      categories: categories || null,
      parentId: parentId || null, // Adicionar ao objeto de dados
    };

    // Se há texto, salvar como texto
    if (text) {
      mediaData.text = text;
      mediaData.type = "text";
    }

    // Se há arquivo (foto/vídeo)
    if (file) {
      // Convert file to buffer
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Upload to Cloudinary
      const result = await cloudinary.uploader.upload(
        `data:${file.type};base64,${buffer.toString("base64")}`,
        {
          resource_type: "auto",
          folder: "guarda-memoria",
        }
      );

      mediaData.publicId = result.public_id;
      mediaData.url = result.secure_url;
      mediaData.type = result.resource_type === "image" ? "image" : "video";
    }

    // Se há áudio
    if (audio) {
      // Convert audio blob to buffer
      const bytes = await audio.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Upload to Cloudinary
      const result = await cloudinary.uploader.upload(
        `data:audio/wav;base64,${buffer.toString("base64")}`,
        {
          resource_type: "video", // Cloudinary trata áudio como vídeo
          folder: "guarda-memoria",
        }
      );

      mediaData.publicId = result.public_id;
      mediaData.url = result.secure_url;
      mediaData.type = "audio";
    }

    // Save to database
    const media = await prisma.media.create({
      data: mediaData,
    });

    // Se é um comentário, atualizar a pontuação da mídia pai
    if (parentId) {
      try {
        await updateMediaScore(parentId);
      } catch (error) {
        console.error("Erro ao atualizar pontuação da mídia pai:", error);
        // Não falhar a requisição por causa disso
      }
    }

    return NextResponse.json({
      message: "Upload successful",
      media: {
        id: media.id,
        url: media.url,
        text: media.text,
        type: media.type,
      },
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
