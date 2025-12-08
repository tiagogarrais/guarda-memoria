import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const states = await prisma.state.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    });

    // Converter para o formato esperado pelo frontend
    const statesObject = {};
    states.forEach((state) => {
      statesObject[state.id.toString()] = state.name;
    });

    return NextResponse.json({ states: statesObject });
  } catch (error) {
    console.error("Error fetching states:", error);
    return NextResponse.json(
      { error: "Failed to fetch states" },
      { status: 500 }
    );
  }
}
