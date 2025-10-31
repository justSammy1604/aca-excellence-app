import { NextResponse } from 'next/server';
import supabase from '@/lib/server/db';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get('studentId') || process.env.NEXT_PUBLIC_DEFAULT_STUDENT_ID || 'student1';
  const { data: assignments, error } = await supabase.from('assignments').select('*').eq('studentid', studentId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const today = new Date();
  const days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(today.getTime() + i * 86400000);
    return { date: d.toISOString().slice(0,10), blocks: [] as Array<{ course: string; minutes: number; title?: string }> };
  });
  // naive: assign 25-min blocks for assignments due within the week, proportional to estimated_minutes
  for (const a of assignments || []) {
    if (!a.due_at) continue;
    const dueDate = new Date(a.due_at);
    const idx = Math.min(6, Math.max(0, Math.floor((dueDate.getTime() - today.getTime())/86400000)));
    const minutes = a.estimated_minutes || 50;
    const blocks = Math.max(1, Math.round(minutes/25));
    for (let b=0; b<blocks; b++) {
      days[Math.max(0, idx - b)].blocks.push({ course: a.course || 'General', minutes: 25, title: a.title });
    }
  }
  return NextResponse.json({ days });
}
