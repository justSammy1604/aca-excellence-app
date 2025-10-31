import { NextResponse } from 'next/server';
import supabase from '@/lib/server/db';

const intervals = [1, 3, 7, 14]; // days

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get('studentId') || process.env.NEXT_PUBLIC_DEFAULT_STUDENT_ID || 'student1';
  const { data: views, error } = await supabase.from('resource_views').select('*').eq('studentid', studentId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const due: Array<{ resourceId: string; title?: string; dueOn: string; intervalDays: number }>= [];
  const now = Date.now();
  for (const v of views || []) {
    const ts = new Date(v.viewedat || v.viewed_at || v.viewedAt).getTime();
    for (const d of intervals) {
      const target = ts + d*86400000;
      if (target <= now) {
        due.push({ resourceId: v.resourceid, dueOn: new Date(target).toISOString().slice(0,10), intervalDays: d });
        break;
      }
    }
  }
  // hydrate titles
  const ids = due.map(d => d.resourceId);
  const { data: resources } = await supabase.from('resources').select('id,title').in('id', ids);
  const withTitles = due.map(d => ({ ...d, title: resources?.find(r => r.id === d.resourceId)?.title }));
  return NextResponse.json(withTitles);
}

export async function POST(req: Request) {
  // mark a revisit by adding a new view row
  try {
    const body = await req.json();
    const row = { studentid: body.studentId, resourceid: body.resourceId, viewedat: new Date().toISOString() };
    const { data, error } = await supabase.from('resource_views').insert([row]).select().single();
    if (error) throw error;
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
  }
}
