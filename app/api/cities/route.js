import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const stateId = searchParams.get("stateId");

    let whereClause = {};
    if (stateId) {
      whereClause.stateId = parseInt(stateId);
    }

    const cities = await prisma.city.findMany({
      where: whereClause,
      orderBy: { name: "asc" },
      select: { id: true, name: true, stateId: true },
    });

    return NextResponse.json({ cities });
  } catch (error) {
    console.error("Error fetching cities:", error);
    return NextResponse.json(
      { error: "Failed to fetch cities" },
      { status: 500 }
    );
  }
}
