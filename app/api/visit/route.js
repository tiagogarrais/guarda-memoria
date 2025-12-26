import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const { path, source, userAgent, ip } = await request.json();

    const visit = await prisma.visit.create({
      data: {
        path: path || "/",
        source: source || null,
        userAgent: userAgent || null,
        ip: ip || null,
      },
    });

    return NextResponse.json({ success: true, visitId: visit.id });
  } catch (error) {
    console.error("Erro ao registrar visita:", error);
    return NextResponse.json(
      { error: "Erro ao registrar visita" },
      { status: 500 }
    );
  }
}
