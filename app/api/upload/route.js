import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth";
import { PrismaClient } from "@prisma/client";
import { v2 as cloudinary } from "cloudinary";

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

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

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

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(
      `data:${file.type};base64,${buffer.toString("base64")}`,
      {
        resource_type: "auto",
        folder: "guarda-memoria",
      }
    );

    // Save to database
    const media = await prisma.media.create({
      data: {
        publicId: result.public_id,
        url: result.secure_url,
        type:
          result.resource_type === "image"
            ? "image"
            : result.resource_type === "video"
            ? "video"
            : "audio",
        userId: user.id,
        stateId: user.stateId,
        cityId: user.cityId,
      },
    });

    return NextResponse.json({
      message: "Upload successful",
      media: {
        id: media.id,
        url: media.url,
        type: media.type,
      },
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
