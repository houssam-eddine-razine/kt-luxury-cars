import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const vehicleCount = await prisma.vehicle.count();

    return NextResponse.json({
      status: "ok",
      database: "connected",
      vehicleCount,
    });
  } catch (error) {
    console.error("Database health check failed:", error);

    return NextResponse.json(
      {
        status: "error",
        database: "disconnected",
      },
      { status: 500 },
    );
  }
}