// src/app/api/payments/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { generateReceiptNumber, calculateLateFine } from '@/lib/calculations';
import { sendPaymentReceiptEmail } from '@/lib/email';

export async function GET(req: NextRequest) {
  const auth = requireAuth(req, ['ADMIN', 'SUB_ADMIN', 'AGENT']);
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { searchParams } = new URL(req.url);
  const loanId = searchParams.get('loanId') || '';
  const agentId = searchParams.get('agentId') || '';
  const startDate = searchParams.get('startDate') || '';
  const endDate = searchParams.get('endDate') || '';
  const page = Number(searchParams.get('page')) || 1;
  const limit = Number(searchParams.get('limit')) || 10;

  const where: any = {};
  if (loanId) where.loanId = loanId;
  if (agentId) where.agentId = agentId;
  if (auth.user.role === 'AGENT') where.agentId = auth.user.userId;
  if (startDate && endDate) {
    where.paymentDate = { gte: new Date(startDate), lte: new Date(endDate) };
  }

  const [total, payments] = await Promise.all([
    prisma.payment.count({ where }),
    prisma.payment.findMany({
      where,
      include: {
        loan: {
          select: {
            loanNumber: true, loanType: true,
            party: { select: { name: true, customerId: true, mobile1: true } },
          },
        },
        installment: { select: { installmentNo: true, dueDate: true } },
        agent: { select: { name: true, agentCode: true } },
      },
      orderBy: { paymentDate: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  return NextResponse.json({ payments, total, page, totalPages: Math.ceil(total / limit) });
}

export async function POST(req: NextRequest) {
  const auth = requireAuth(req, ['ADMIN', 'SUB_ADMIN', 'AGENT']);
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const { loanId, installmentId, amount, paymentMode = 'CASH', notes, paymentDate } = await req.json();

    if (!loanId || !amount) {
      return NextResponse.json({ error: 'Loan ID and amount are required' }, { status: 400 });
    }

    const loan = await prisma.loan.findUnique({
      where: { id: loanId },
      include: {
        party: true,
        installments: installmentId ? { where: { id: installmentId } } : {
          where: { status: { in: ['PENDING', 'OVERDUE'] } },
          orderBy: { installmentNo: 'asc' },
          take: 1,
        },
      },
    });

    if (!loan) return NextResponse.json({ error: 'Loan not found' }, { status: 404 });
    if (loan.status === 'CLOSED') return NextResponse.json({ error: 'Loan is already closed' }, { status: 400 });

    const installment = loan.installments[0];
    let fineAmount = 0;

    if (installment && loan.lateFine && Number(loan.lateFine) > 0) {
      fineAmount = calculateLateFine(new Date(installment.dueDate), Number(loan.lateFine));
    }

    const paidAmount = Number(amount);
    const totalAmount = paidAmount + fineAmount;
    const receiptNumber = generateReceiptNumber();

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        receiptNumber,
        loanId,
        installmentId: installment?.id,
        agentId: auth.user.userId,
        amount: paidAmount,
        fineAmount,
        totalAmount,
        paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
        paymentMode,
        notes,
      },
    });

    // Update installment status
    if (installment) {
      const newPaidAmount = Number(installment.paidAmount) + paidAmount;
      const instAmount = Number(installment.amount);
      const newStatus = newPaidAmount >= instAmount ? 'PAID' : 'PARTIAL';

      await prisma.loanInstallment.update({
        where: { id: installment.id },
        data: {
          paidAmount: newPaidAmount,
          fineAmount,
          status: newStatus,
          paidDate: newStatus === 'PAID' ? new Date() : null,
        },
      });
    }

    // Update loan total paid
    await prisma.loan.update({
      where: { id: loanId },
      data: {
        totalPaid: { increment: totalAmount },
        pendingAmount: loan.pendingAmount ? { decrement: paidAmount } : undefined,
      },
    });

    // Check if all installments paid → auto close
    const unpaidCount = await prisma.loanInstallment.count({
      where: { loanId, status: { in: ['PENDING', 'OVERDUE', 'PARTIAL'] } },
    });

    if (unpaidCount === 0) {
      await prisma.loan.update({
        where: { id: loanId },
        data: { status: 'CLOSED', endDate: new Date() },
      });
    }

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: auth.user.userId,
        action: 'PAYMENT',
        entity: 'Payment',
        entityId: payment.id,
        details: { receiptNumber, amount: totalAmount, loanId },
      },
    });

    // Send email if party has email
    if (loan.party.email) {
      sendPaymentReceiptEmail({
        to: loan.party.email,
        customerName: loan.party.name,
        receiptNumber,
        loanNumber: loan.loanNumber,
        amount: paidAmount,
        fineAmount,
        paymentDate: payment.paymentDate,
        balance: 0,
      }).catch(console.error);
    }

    return NextResponse.json({ payment, receiptNumber }, { status: 201 });
  } catch (error) {
    console.error('Payment error:', error);
    return NextResponse.json({ error: 'Failed to record payment' }, { status: 500 });
  }
}
