// src/app/api/parties/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = requireAuth(req, ['ADMIN', 'SUB_ADMIN', 'AGENT']);
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const party = await prisma.party.findUnique({
    where: { id: params.id },
    include: {
      agent: { select: { name: true, agentCode: true, email: true } },
      loans: {
        include: {
          installments: { orderBy: { installmentNo: 'asc' } },
          payments: { orderBy: { paymentDate: 'desc' }, take: 5 },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!party) return NextResponse.json({ error: 'Party not found' }, { status: 404 });
  return NextResponse.json({ party });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = requireAuth(req, ['ADMIN', 'SUB_ADMIN']);
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const data = await req.json();

    const party = await prisma.party.update({
      where: { id: params.id },
      data: {
        ...data,
        birthdate: data.birthdate ? new Date(data.birthdate) : undefined,
        updatedAt: new Date(),
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: auth.user.userId,
        action: 'UPDATE',
        entity: 'Party',
        entityId: party.id,
        details: { name: party.name },
      },
    });

    return NextResponse.json({ party });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update party' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = requireAuth(req, ['ADMIN']);
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  // Check if party has active loans
  const activeLoans = await prisma.loan.count({
    where: { partyId: params.id, status: 'ACTIVE' },
  });

  if (activeLoans > 0) {
    return NextResponse.json({ error: 'Cannot delete party with active loans' }, { status: 400 });
  }

  await prisma.party.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
