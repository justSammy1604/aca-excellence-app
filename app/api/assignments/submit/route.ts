import { NextResponse } from 'next/server';
import supabase from '@/lib/server/db';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const id = body.assignmentId;
    const submittedAt = body.submittedAt || new Date().toISOString();
    if (!id) return NextResponse.json({ error: 'missing assignmentId' }, { status: 400 });
    const { data, error } = await supabase.from('assignments').update({ submitted_at: submittedAt }).eq('id', id).select().single();
    if (error) throw error;
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
  }
}
