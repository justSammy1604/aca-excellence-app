import { NextResponse } from 'next/server';
import supabase from '@/lib/server/db';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get('studentId') || process.env.NEXT_PUBLIC_DEFAULT_STUDENT_ID || 'student1';
  const { data, error } = await supabase.from('assignments').select('*').eq('studentid', studentId).order('due_at', { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const list = (data || []).map(a => ({
    ...a,
    isOverdue: a.due_at && new Date(a.due_at).getTime() < Date.now() && !a.submitted_at,
  }));
  // naive conflict: due within same day for same student
  const byDay = new Map<string, number>();
  list.forEach(a => {
    const key = a.due_at ? new Date(a.due_at).toISOString().slice(0,10) : 'none';
    byDay.set(key, (byDay.get(key) || 0) + 1);
  });
  const withConflict = list.map(a => {
    const key = a.due_at ? new Date(a.due_at).toISOString().slice(0,10) : 'none';
    return { ...a, conflict: (byDay.get(key) || 0) > 1 };
  });
  return NextResponse.json(withConflict);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const row = {
      studentid: body.studentId || process.env.NEXT_PUBLIC_DEFAULT_STUDENT_ID || 'student1',
      course: body.course,
      title: body.title,
      due_at: body.dueAt,
      estimated_minutes: body.estimatedMinutes ?? null,
    };
    const { data, error } = await supabase.from('assignments').insert([row]).select().single();
    if (error) throw error;
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
  }
}
