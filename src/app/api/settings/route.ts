// src/app/api/settings/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const auth = requireAuth(req, ['ADMIN', 'SUB_ADMIN']);
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const rows = await prisma.systemSettings.findMany();
  const settings = Object.fromEntries(rows.map(r => [r.key, r.value]));
  return NextResponse.json({ settings });
}

export async function POST(req: NextRequest) {
  const auth = requireAuth(req, ['ADMIN']);
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const settings: Record<string, string> = await req.json();

  await Promise.all(
    Object.entries(settings).map(([key, value]) =>
      prisma.systemSettings.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      })
    )
  );

  return NextResponse.json({ success: true });
}
