// src/app/api/loans/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = requireAuth(req, ['ADMIN', 'SUB_ADMIN', 'AGENT']);
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const loan = await prisma.loan.findUnique({
    where: { id: params.id },
    include: {
      party: {
        include: { agent: { select: { name: true, agentCode: true } } },
      },
      installments: { orderBy: { installmentNo: 'asc' } },
      payments: {
        include: { agent: { select: { name: true } } },
        orderBy: { paymentDate: 'desc' },
      },
    },
  });

  if (!loan) return NextResponse.json({ error: 'Loan not found' }, { status: 404 });

  // Update overdue status
  const now = new Date();
  const overdueUpdates = loan.installments
    .filter((inst) => inst.status === 'PENDING' && new Date(inst.dueDate) < now)
    .map((inst) => inst.id);

  if (overdueUpdates.length > 0) {
    await prisma.loanInstallment.updateMany({
      where: { id: { in: overdueUpdates } },
      data: { status: 'OVERDUE' },
    });
  }

  // Re-fetch with updated statuses
  const updatedLoan = await prisma.loan.findUnique({
    where: { id: params.id },
    include: {
      party: { include: { agent: { select: { name: true, agentCode: true } } } },
      installments: { orderBy: { installmentNo: 'asc' } },
      payments: {
        include: { agent: { select: { name: true } } },
        orderBy: { paymentDate: 'desc' },
      },
    },
  });

  return NextResponse.json({ loan: updatedLoan });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = requireAuth(req, ['ADMIN', 'SUB_ADMIN']);
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const data = await req.json();

  const loan = await prisma.loan.update({
    where: { id: params.id },
    data,
  });

  return NextResponse.json({ loan });
}

// Close a loan
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = requireAuth(req, ['ADMIN']);
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const loan = await prisma.loan.update({
    where: { id: params.id },
    data: { status: 'CLOSED', endDate: new Date() },
  });

  await prisma.auditLog.create({
    data: {
      userId: auth.user.userId,
      action: 'CLOSE',
      entity: 'Loan',
      entityId: loan.id,
      details: { loanNumber: loan.loanNumber },
    },
  });

  return NextResponse.json({ success: true });
}
