import { NextResponse } from 'next/server';
import supabase from '@/lib/server/db';

function buildICS(events: Array<{ uid: string; title: string; start: string }>) {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//aca-excellence//calendar//EN',
  ];
  for (const e of events) {
    const dt = e.start.replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z');
    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${e.uid}`);
    lines.push(`DTSTAMP:${dt}`);
    lines.push(`DTSTART:${dt}`);
    lines.push(`SUMMARY:${e.title}`);
    lines.push('END:VEVENT');
  }
  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get('studentId') || process.env.NEXT_PUBLIC_DEFAULT_STUDENT_ID || 'student1';
  const { data, error } = await supabase.from('assignments').select('id,title,due_at').eq('studentid', studentId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const events = (data || []).filter(a => !!a.due_at).map(a => ({ uid: String(a.id), title: a.title, start: a.due_at as string }));
  const ics = buildICS(events);
  return new NextResponse(ics, { headers: { 'Content-Type': 'text/calendar; charset=utf-8', 'Content-Disposition': 'attachment; filename="assignments.ics"' } });
}
