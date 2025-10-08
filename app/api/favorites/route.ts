import { NextResponse } from "next/server";
import { prisma } from "@/lib/server/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get('studentId') || 'student1';
  const favs = await prisma.favorite.findMany({ where: { studentId }, include: { resource: true } });
  return NextResponse.json(favs.map((f: { resource: { title: string } }) => f.resource.title));
}

export async function POST(req: Request) {
  const { studentId, resourceTitle } = await req.json();
  const resource = await prisma.resource.findUnique({ where: { title: resourceTitle } });
  if (!resource) return NextResponse.json({ error: 'resource not found' }, { status: 404 });
  try {
    await prisma.favorite.create({ data: { studentId, resourceId: resource.id } });
    return NextResponse.json({ ok: true });
  } catch {
    await prisma.favorite.delete({ where: { studentId_resourceId: { studentId, resourceId: resource.id } } });
    return NextResponse.json({ ok: true });
  }
}
