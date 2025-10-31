import { NextResponse } from "next/server";
import { prisma } from "@/lib/server/db";

export async function GET() {
  const id = (process.env.NEXT_PUBLIC_DEFAULT_STUDENT_ID || 'student1');
  const student = await prisma.student.findUnique({ where: { id } });
  if (!student) return NextResponse.json({ error: 'not found' }, { status: 404 });
  return NextResponse.json(student);
}

export async function POST(req: Request) {
  // Create a new student record. Expected body: { id, name, password, email }
  try {
    const body = await req.json();
    const id = body.id;
    if (!id) return NextResponse.json({ error: 'missing id' }, { status: 400 });
    const payload: any = { id };
    if (typeof body.name === 'string') payload.displayname = body.name;
    if (typeof body.email === 'string') payload.email = body.email;
    // Hash password if provided
    let hashed: string | undefined = undefined;
    if (typeof body.password === 'string') {
      // require bcryptjs dynamically; ensure bcryptjs is installed locally
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const bcrypt: any = require('bcryptjs');
      const salt = bcrypt.genSaltSync(10);
      hashed = bcrypt.hashSync(body.password, salt);
      payload.password = hashed;
    }
    const created = await prisma.student.create({ data: payload });
    return NextResponse.json({ id: created.id, displayName: created.displayName || created.displayname, email: created.email });
  } catch (e) {
    console.error('POST /api/student create failed:', e);
    // PostgREST error when DB schema is missing columns often returns PGRST204
    if (e && (e as any).code === 'PGRST204') {
      return NextResponse.json({ error: 'create failed', details: "DB schema missing 'password' column. Run sql/add_password_column.sql in Supabase SQL editor (dev only)." }, { status: 500 });
    }
    return NextResponse.json({ error: 'create failed', details: String(e) }, { status: 500 });
  }
}
