// src/app/api/parties/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { generatePartyCode, generateCustomerId } from '@/lib/calculations';

export async function GET(req: NextRequest) {
  const auth = requireAuth(req, ['ADMIN', 'SUB_ADMIN', 'AGENT']);
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search') || '';
  const page = Number(searchParams.get('page')) || 1;
  const limit = Number(searchParams.get('limit')) || 10;
  const agentId = searchParams.get('agentId') || '';

  const where: any = {};
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { mobile1: { contains: search } },
      { customerId: { contains: search } },
      { partyCode: { contains: search } },
    ];
  }
  if (agentId) where.agentId = agentId;
  if (auth.user.role === 'AGENT') where.agentId = auth.user.userId;

  const [total, parties] = await Promise.all([
    prisma.party.count({ where }),
    prisma.party.findMany({
      where,
      include: {
        agent: { select: { name: true, agentCode: true } },
        loans: { select: { id: true, status: true, loanNumber: true, loanAmount: true, totalPaid: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  return NextResponse.json({ parties, total, page, totalPages: Math.ceil(total / limit) });
}

export async function POST(req: NextRequest) {
  const auth = requireAuth(req, ['ADMIN', 'SUB_ADMIN']);
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const data = await req.json();
    const count = await prisma.party.count();

    const party = await prisma.party.create({
      data: {
        ...data,
        partyCode: data.partyCode || generatePartyCode(count),
        customerId: data.customerId || generateCustomerId(count),
        loanLimit: data.loanLimit || 0,
        balance: data.balance || 0,
        birthdate: data.birthdate ? new Date(data.birthdate) : undefined,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: auth.user.userId,
        action: 'CREATE',
        entity: 'Party',
        entityId: party.id,
        details: { name: party.name, customerId: party.customerId },
      },
    });

    return NextResponse.json({ party }, { status: 201 });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Party code or Customer ID already exists' }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ error: 'Failed to create party' }, { status: 500 });
  }
}
