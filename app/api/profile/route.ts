import { NextResponse } from 'next/server';
import { prisma } from '@/lib/server/db';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get('studentId') || process.env.NEXT_PUBLIC_DEFAULT_STUDENT_ID || 'student1';
  const student = await prisma.student.findUnique({ where: { id: studentId } });
  if (!student) return NextResponse.json({ error: 'not found' }, { status: 404 });
  // Return only profile relevant fields
  return NextResponse.json({ id: student.id, displayName: student.displayName || student.displayname, email: student.email });
}

export async function POST(req: Request) {
  const body = await req.json();
  const studentId = body.studentId || process.env.NEXT_PUBLIC_DEFAULT_STUDENT_ID || 'student1';
  const updateData: any = {};
  if (typeof body.displayName === 'string') updateData.displayName = body.displayName;
  if (typeof body.email === 'string') updateData.email = body.email;
  try {
    const updated = await prisma.student.update({ where: { id: studentId }, data: updateData });
    return NextResponse.json({ id: updated.id, displayName: updated.displayName || updated.displayname, email: updated.email });
  } catch (e) {
    // If update fails (likely missing row), create instead
    try {
      const created = await prisma.student.create({ data: { id: studentId, displayName: updateData.displayName, email: updateData.email } });
      return NextResponse.json({ id: created.id, displayName: created.displayName || created.displayname, email: created.email });
    } catch (e2) {
      return NextResponse.json({ error: 'upsert failed', details: String(e2) }, { status: 500 });
    }
  }
}
