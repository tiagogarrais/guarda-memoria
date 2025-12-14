import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth";
import { PrismaClient } from "@prisma/client";
import { v2 as cloudinary } from "cloudinary";
import { updateMediaScore } from "../../../lib/mediaUtils";
import { Readable } from "stream"; // Importar stream

const prisma = new PrismaClient();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Função auxiliar para upload via Stream (evita estouro de memória)
const uploadToCloudinary = (buffer, folder, resourceType = "auto") => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        resource_type: resourceType,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    // Transforma o buffer em stream e envia
    const stream = Readable.from(buffer);
    stream.pipe(uploadStream);
  });
};

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
    const parentId = formData.get("parentId");

    // Validar tamanho (250MB)
    const maxSize = 250 * 1024 * 1024;
    if (file && file.size > maxSize) {
      return NextResponse.json({ error: "Arquivo muito grande (Max 250MB)" }, { status: 413 });
    }
    if (audio && audio.size > maxSize) {
      return NextResponse.json({ error: "Áudio muito grande (Max 250MB)" }, { status: 413 });
    }

    if (!file && !audio && !text) {
      return NextResponse.json({ error: "No content provided" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, stateId: true, cityId: true },
    });

    if (!user || !user.stateId || !user.cityId) {
      return NextResponse.json({ error: "User location missing" }, { status: 400 });
    }

    let mediaData = {
      type: "text",
      userId: user.id,
      stateId: user.stateId,
      cityId: user.cityId,
      categories: categories || null,
      parentId: parentId || null,
      permalink: `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`
    };

    if (text) {
      mediaData.text = text;
      mediaData.type = "text";
    }

    // LÓGICA DE UPLOAD OTIMIZADA
    if (file) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      // Usa a função auxiliar com stream
      const result = await uploadToCloudinary(buffer, "guarda-memoria", "auto");

      mediaData.publicId = result.public_id;
      mediaData.url = result.secure_url;
      mediaData.type = result.resource_type === "image" ? "image" : "video";
    }

    if (audio) {
      const bytes = await audio.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Audio no Cloudinary geralmente usa resource_type: "video"
      const result = await uploadToCloudinary(buffer, "guarda-memoria", "video");

      mediaData.publicId = result.public_id;
      mediaData.url = result.secure_url;
      mediaData.type = "audio";
    }

    const media = await prisma.media.create({
      data: mediaData,
    });

    if (parentId) {
      // Executa sem await para não travar a resposta
      updateMediaScore(parentId).catch(console.error);
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
    return NextResponse.json({ error: "Upload failed: " + error.message }, { status: 500 });
  }
}
