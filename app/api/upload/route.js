import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth";
import { PrismaClient } from "@prisma/client";
import { updateMediaScore } from "../../../lib/mediaUtils";

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { text, categories, parentId, publicId, url, resourceType } = body;

    console.log("Upload request body:", {
      text: !!text,
      categories,
      parentId,
      publicId,
      url,
      resourceType,
    });

    if (!text && !publicId) {
      return NextResponse.json(
        { error: "No content provided" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, stateId: true, cityId: true },
    });

    if (!user || !user.stateId || !user.cityId) {
      return NextResponse.json(
        { error: "User location missing" },
        { status: 400 }
      );
    }

    let mediaData = {
      type: "text",
      userId: user.id,
      stateId: user.stateId,
      cityId: user.cityId,
      categories: categories || null,
      parentId: parentId || null,
      permalink: `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
    };

    if (text) {
      mediaData.text = text;
      mediaData.type = "text";
    }

    // Se há dados do Cloudinary, usar eles
    if (publicId && url && resourceType) {
      mediaData.publicId = publicId;
      mediaData.url = url;
      mediaData.type =
        resourceType === "image"
          ? "image"
          : resourceType === "video"
          ? "video"
          : "audio";
      console.log("Using Cloudinary data:", {
        publicId,
        url,
        resourceType,
        finalType: mediaData.type,
      });
    }

    console.log("Creating media with data:", mediaData);

    const media = await prisma.media.create({
      data: mediaData,
    });

    console.log("Media created successfully:", media.id);

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
    return NextResponse.json(
      { error: "Upload failed: " + error.message },
      { status: 500 }
    );
  }
}
