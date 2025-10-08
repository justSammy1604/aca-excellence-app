import { NextResponse } from "next/server";
import { prisma } from "@/lib/server/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get('studentId') || 'student1';
  const votes = await prisma.resourceVote.findMany({ where: { studentId }, include: { resource: true } });
  const map: Record<string, number> = {};
  for (const v of votes) map[v.resource.title] = v.value;
  return NextResponse.json(map);
}

export async function POST(req: Request) {
  const { studentId, resourceTitle, delta } = await req.json();
  const resource = await prisma.resource.findUnique({ where: { title: resourceTitle } });
  if (!resource) return NextResponse.json({ error: 'resource not found' }, { status: 404 });
  const prev = await prisma.resourceVote.findUnique({ where: { studentId_resourceId: { studentId, resourceId: resource.id } } });
  const value = (prev?.value || 0) + (delta === 1 ? 1 : -1);
  await prisma.resourceVote.upsert({
    where: { studentId_resourceId: { studentId, resourceId: resource.id } },
    update: { value },
    create: { studentId, resourceId: resource.id, value },
  });
  const map: Record<string, number> = {};
  const votes = await prisma.resourceVote.findMany({ where: { studentId }, include: { resource: true } });
  for (const v of votes) map[v.resource.title] = v.value;
  return NextResponse.json(map);
}
