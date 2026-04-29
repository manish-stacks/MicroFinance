import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = requireAuth(req, ['ADMIN', 'SUB_ADMIN']);
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { agentId } = await req.json();
  if (!agentId) return NextResponse.json({ error: 'agentId required' }, { status: 400 });

  const agent = await prisma.user.findUnique({ where: { id: agentId } });
  if (!agent || !['AGENT', 'SUB_ADMIN'].includes(agent.role)) {
    return NextResponse.json({ error: 'Invalid agent' }, { status: 400 });
  }

  const loan = await prisma.loan.update({ where: { id: params.id }, data: { agentId } });
  // Also update party agent
  await prisma.party.update({ where: { id: loan.partyId }, data: { agentId } });

  await prisma.auditLog.create({
    data: { userId: auth.user.userId, action: 'CHANGE_AGENT', entity: 'Loan', entityId: loan.id, details: { newAgentId: agentId, agentName: agent.name } },
  });

  return NextResponse.json({ ok: true });
}
