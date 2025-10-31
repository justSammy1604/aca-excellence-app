import { NextResponse } from "next/server";
import { prisma } from "@/lib/server/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get('studentId') || 'student1';
  const views = await prisma.resourceView.findMany({ where: { studentId }, orderBy: { viewedAt: 'asc' }, include: { resource: true } });
  return NextResponse.json(views.map((v: { resource: { title: string } }) => v.resource.title));
}

export async function POST(req: Request) {
  const { studentId, resourceTitle, url } = await req.json();
  let resource = await prisma.resource.findUnique({ where: { title: resourceTitle } });
  if (!resource) {
    // Allow creating on the fly so users can record first-time views
    resource = await prisma.resource.create({ data: { title: resourceTitle, url } });
  }
  await prisma.resourceView.create({ data: { studentId, resourceId: resource.id } });
  const views = await prisma.resourceView.findMany({ where: { studentId }, orderBy: { viewedAt: 'asc' }, include: { resource: true } });
  return NextResponse.json(views.map((v: { resource: { title: string } }) => v.resource.title));
}
