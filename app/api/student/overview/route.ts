import { NextResponse } from 'next/server';
import { prisma } from '@/lib/server/db';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get('studentId') || process.env.NEXT_PUBLIC_DEFAULT_STUDENT_ID || 'student1';
  // Get profile
  let student = await prisma.student.findUnique({ where: { id: studentId } });
  // Auto-create a minimal student row if missing so first-time users work seamlessly
  if (!student) {
    try {
      student = await prisma.student.create({ data: { id: studentId, displayName: studentId } });
    } catch (e) {
      // If create fails, still return a safe stub to avoid breaking the UI
      const overview = {
        id: studentId,
        name: studentId,
        courses: [] as Array<{ name: string; progress: number; risk: string | null }>,
        gpaTrends: { labels: ['Sem 1','Sem 2','Current'], data: [3.0, 3.2, 3.3] },
        nudges: [] as string[],
        resources: [] as Array<{ title: string; link: string }>,
      };
      return NextResponse.json(overview);
    }
  }
  // Global lists (best-effort; default to empty if RLS blocks access)
  let resources: Array<{ title: string; url?: string | null }> = [];
  let nudges: Array<{ message: string }> = [];
  try {
    resources = await prisma.resource.findMany({ select: { title: true, url: true } });
  } catch {}
  try {
    nudges = await prisma.nudge.findMany({ select: { message: true } });
  } catch {}
  // Basic shape expected by dashboard UI
  const overview = {
    id: student.id,
    name: student.displayName || student.displayname || student.email || student.id,
    courses: [] as Array<{ name: string; progress: number; risk: string | null }>,
    gpaTrends: { labels: ['Sem 1','Sem 2','Current'], data: [3.0, 3.2, 3.3] },
  nudges: nudges.map((n: { message: string }) => n.message),
  resources: resources.map((r: { title: string; url?: string | null }) => ({ title: r.title, link: r.url || '#' })),
  };
  return NextResponse.json(overview);
}
