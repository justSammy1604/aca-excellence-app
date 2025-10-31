import { NextResponse } from 'next/server';
import supabase from '@/lib/server/db';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get('studentId') || process.env.NEXT_PUBLIC_DEFAULT_STUDENT_ID || 'student1';
  const { data, error } = await supabase.from('study_sessions').select('*').eq('studentid', studentId).order('started_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data || []);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const studentid = body.studentId || process.env.NEXT_PUBLIC_DEFAULT_STUDENT_ID || 'student1';
    if (body.complete && body.id) {
      // mark completion / post metrics
      const patch: any = {};
      if (body.durationMin !== undefined) patch.duration_min = body.durationMin;
      if (body.moodPost !== undefined) patch.mood_post = body.moodPost;
      if (body.focusPost !== undefined) patch.focus_post = body.focusPost;
      if (body.notes !== undefined) patch.notes = body.notes;
      const { data, error } = await supabase.from('study_sessions').update(patch).eq('id', body.id).eq('studentid', studentid).select().single();
      if (error) throw error;
      return NextResponse.json(data);
    }
    // create new session
    const row: any = { studentid };
    if (body.course) row.course = body.course;
    if (body.moodPre !== undefined) row.mood_pre = body.moodPre;
    if (body.focusPre !== undefined) row.focus_pre = body.focusPre;
    const { data, error } = await supabase.from('study_sessions').insert([row]).select().single();
    if (error) throw error;
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
  }
}
