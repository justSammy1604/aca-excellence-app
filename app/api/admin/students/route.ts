import { NextResponse } from "next/server";
import { prisma } from "@/lib/server/db";

export async function GET() {
  // Returns student list with resources and nudge counts
  const students = await prisma.student.findMany({
    include: {
      // views/votes/favorites could be aggregated later
      // For now, just return id and displayName
    },
  });
  // Fetch resources and nudges from their tables. Resources are global; nudges are global definitions.
  const resources = await prisma.resource.findMany({ select: { id: true, title: true, url: true } });
  const nudges = await prisma.nudge.findMany({ select: { id: true, category: true, message: true } });
  return NextResponse.json({ students, resources, nudges });
}
