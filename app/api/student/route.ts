import { NextResponse } from "next/server";
import { prisma } from "@/lib/server/db";

export async function GET() {
  const id = (process.env.NEXT_PUBLIC_DEFAULT_STUDENT_ID || 'student1');
  const student = await prisma.student.findUnique({ where: { id } });
  if (!student) return NextResponse.json({ error: 'not found' }, { status: 404 });
  return NextResponse.json(student);
}
