import { NextResponse } from 'next/server';
import { prisma } from '@/lib/server/db';
// use require to avoid TS type resolution in this environment; bcryptjs must be installed in the project
// eslint-disable-next-line @typescript-eslint/no-var-requires
const bcrypt: any = require('bcryptjs');

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const id = body.id;
    const password = body.password;
    if (!id || !password) return NextResponse.json({ error: 'missing credentials' }, { status: 400 });
    const student = await prisma.student.findUnique({ where: { id } });
    if (!student) return NextResponse.json({ error: 'not found' }, { status: 404 });
  const stored = student.password || '';
  const match = await bcrypt.compare(password, stored);
  if (!match) return NextResponse.json({ error: 'invalid' }, { status: 401 });
    return NextResponse.json({ ok: true, id: student.id, name: student.displayName || student.displayname });
  } catch (e) {
    return NextResponse.json({ error: 'auth failed', details: String(e) }, { status: 500 });
  }
}
