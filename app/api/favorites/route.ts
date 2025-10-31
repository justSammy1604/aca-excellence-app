import { NextResponse } from "next/server";
import { prisma } from "@/lib/server/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get('studentId') || 'student1';
  const favs = await prisma.favorite.findMany({ where: { studentId }, include: { resource: true } });
  return NextResponse.json(favs.map((f: { resource: { title: string } }) => f.resource.title));
}

export async function POST(req: Request) {
  const { studentId, resourceTitle, url } = await req.json();
  let resource = await prisma.resource.findUnique({ where: { title: resourceTitle } });
  if (!resource) {
    resource = await prisma.resource.create({ data: { title: resourceTitle, url } });
  }
  try {
    await prisma.favorite.create({ data: { studentId, resourceId: resource.id } });
    const favs = await prisma.favorite.findMany({ where: { studentId }, include: { resource: true } });
    return NextResponse.json(favs.map((f: { resource: { title: string } }) => f.resource.title));
  } catch {
    await prisma.favorite.delete({ where: { studentId_resourceId: { studentId, resourceId: resource.id } } });
    const favs = await prisma.favorite.findMany({ where: { studentId }, include: { resource: true } });
    return NextResponse.json(favs.map((f: { resource: { title: string } }) => f.resource.title));
  }
}
