// src/app/api/agents/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, hashPassword } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const auth = requireAuth(req, ['ADMIN', 'SUB_ADMIN']);
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const agents = await prisma.user.findMany({
    where: { role: { in: ['AGENT', 'SUB_ADMIN'] } },
    select: {
      id: true, name: true, email: true, role: true,
      agentCode: true, phone: true, isActive: true, createdAt: true,
      assignedParties: { select: { id: true } },
      collections: {
        select: { totalAmount: true },
        where: {
          paymentDate: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({
    agents: agents.map((a) => ({
      ...a,
      totalCustomers: a.assignedParties.length,
      monthlyCollection: a.collections.reduce((sum, p) => sum + Number(p.totalAmount), 0),
      assignedParties: undefined,
      collections: undefined,
    })),
  });
}

export async function POST(req: NextRequest) {
  const auth = requireAuth(req, ['ADMIN']);
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { name, email, password, phone, role = 'AGENT' } = await req.json();

  const count = await prisma.user.count({ where: { role: 'AGENT' } });
  const agentCode = `AGT${String(count + 1).padStart(3, '0')}`;

  const agent = await prisma.user.create({
    data: {
      name, email, phone,
      password: await hashPassword(password),
      role,
      agentCode: role === 'AGENT' ? agentCode : undefined,
      isActive: true,
    },
    select: {
      id: true, name: true, email: true, role: true,
      agentCode: true, phone: true, isActive: true,
    },
  });

  return NextResponse.json({ agent }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const auth = requireAuth(req, ['ADMIN']);
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { id, isActive } = await req.json();

  const agent = await prisma.user.update({
    where: { id },
    data: { isActive },
    select: { id: true, name: true, isActive: true },
  });

  await prisma.auditLog.create({
    data: {
      userId: auth.user.userId,
      action: isActive ? 'ENABLE_AGENT' : 'DISABLE_AGENT',
      entity: 'User',
      entityId: id,
    },
  });

  return NextResponse.json({ agent });
}

export async function PUT(req: NextRequest) {
  const auth = requireAuth(req, ['ADMIN']);
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { id, name, email, phone, password } = await req.json();
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  const data: any = {};
  if (name) data.name = name;
  if (email) data.email = email;
  if (phone !== undefined) data.phone = phone;
  if (password) data.password = await hashPassword(password);

  const agent = await prisma.user.update({
    where: { id }, data,
    select: { id: true, name: true, email: true, role: true, agentCode: true, phone: true, isActive: true },
  });

  return NextResponse.json({ agent });
}

export async function DELETE(req: NextRequest) {
  const auth = requireAuth(req, ['ADMIN']);
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  const partyCount = await prisma.party.count({ where: { agentId: id } });
  if (partyCount > 0) return NextResponse.json({ error: `Cannot delete: ${partyCount} parties assigned to this agent` }, { status: 400 });

  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
