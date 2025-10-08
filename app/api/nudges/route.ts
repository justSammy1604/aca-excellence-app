import { NextResponse } from "next/server";
import { prisma } from "@/lib/server/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get('studentId') || 'student1';
  const states = await prisma.nudgeState.findMany({ where: { studentId } });
  return NextResponse.json(states);
}

export async function POST(req: Request) {
  const { studentId, nudgeId, status, snoozedUntil } = await req.json();
  const state = await prisma.nudgeState.upsert({
    where: { studentId_nudgeId: { studentId, nudgeId } },
    update: { status, snoozedUntil: snoozedUntil ? new Date(snoozedUntil) : null },
    create: { studentId, nudgeId, status, snoozedUntil: snoozedUntil ? new Date(snoozedUntil) : null },
  });
  return NextResponse.json(state);
}
