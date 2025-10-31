import { NextResponse } from 'next/server';
import supabase from '@/lib/server/db';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get('studentId') || process.env.NEXT_PUBLIC_DEFAULT_STUDENT_ID || 'student1';
  const { data: mine, error: e1 } = await supabase.from('course_scores').select('*').eq('studentid', studentId);
  if (e1) return NextResponse.json({ error: e1.message }, { status: 500 });
  // compute averages per course across all students
  const { data: all, error: e2 } = await supabase.from('course_scores').select('course, score');
  if (e2) return NextResponse.json({ error: e2.message }, { status: 500 });
  const groups: Record<string, number[]> = {};
  for (const r of all || []) {
    (groups[r.course] ||= []).push(Number(r.score));
  }
  const averages = Object.fromEntries(Object.entries(groups).map(([k, arr]) => [k, arr.reduce((a,b)=>a+b,0)/arr.length]));
  return NextResponse.json({ mine: mine || [], averages });
}
