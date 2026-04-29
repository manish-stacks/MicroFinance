// src/app/api/loans/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import {
  generateLoanNumber,
  generateSimpleLoanSchedule,
  generateMonthlyInterestSchedule,
  generateRecurringSchedule,
  calculateTotalPayable,
} from '@/lib/calculations';

export async function GET(req: NextRequest) {
  const auth = requireAuth(req, ['ADMIN', 'SUB_ADMIN', 'AGENT']);
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search') || '';
  const status = searchParams.get('status') || '';
  const loanType = searchParams.get('loanType') || '';
  const agentId = searchParams.get('agentId') || '';
  const page = Number(searchParams.get('page')) || 1;
  const limit = Number(searchParams.get('limit')) || 10;
  const partyId = searchParams.get('partyId') || '';

  const where: any = {};
  if (status) where.status = status;
  if (loanType) where.loanType = loanType;
  if (partyId) where.partyId = partyId;
  if (agentId) where.agentId = agentId;
  if (search) {
    where.OR = [
      { loanNumber: { contains: search } },
      { party: { name: { contains: search } } },
    ];
  }
  if (auth.user.role === 'AGENT') {
    where.party = { agentId: auth.user.userId };
  }

  const [total, loans] = await Promise.all([
    prisma.loan.count({ where }),
    prisma.loan.findMany({
      where,
      include: {
        party: {
          select: { name: true, customerId: true, mobile1: true, agent: { select: { name: true } } },
        },
        installments: {
          where: { status: { in: ['PENDING', 'OVERDUE'] } },
          orderBy: { dueDate: 'asc' },
          take: 1,
        },
        _count: { select: { payments: true, installments: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  return NextResponse.json({ loans, total, page, totalPages: Math.ceil(total / limit) });
}

export async function POST(req: NextRequest) {
  const auth = requireAuth(req, ['ADMIN', 'SUB_ADMIN']);
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const data = await req.json();
    const {
      partyId, loanType, loanAmount, startDate, fileCharges = 0, remarks,
      // Simple loan
      installmentType, installmentAmount, totalInstallments, lateFine = 0,
      // Monthly interest
      monthlyInterest,
      // Recurring
      depositAmount, returnPercent,
    } = data;

    if (!partyId || !loanType || !loanAmount || !startDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const loanNumber = generateLoanNumber();
    const start = new Date(startDate);

    let loanData: any = {
      loanNumber,
      loanType,
      partyId,
      loanAmount: Number(loanAmount),
      startDate: start,
      fileCharges: Number(fileCharges),
      remarks,
      status: 'ACTIVE',
      totalPaid: 0,
    };

    let installmentsToCreate: any[] = [];

    if (loanType === 'SIMPLE') {
      const total = calculateTotalPayable(Number(installmentAmount), Number(totalInstallments), Number(fileCharges));
      loanData = {
        ...loanData,
        installmentType,
        installmentAmount: Number(installmentAmount),
        totalInstallments: Number(totalInstallments),
        lateFine: Number(lateFine),
        totalPayable: total,
        pendingAmount: total,
      };

      const schedule = generateSimpleLoanSchedule(start, installmentType, Number(installmentAmount), Number(totalInstallments));
      installmentsToCreate = schedule;
    } else if (loanType === 'MONTHLY_INTEREST') {
      loanData = { ...loanData, monthlyInterest: Number(monthlyInterest) };
      const schedule = generateMonthlyInterestSchedule(start, Number(monthlyInterest), 12);
      installmentsToCreate = schedule;
    } else if (loanType === 'RECURRING') {
      const numInstallments = Number(totalInstallments);
      const { schedule, maturityAmount } = generateRecurringSchedule(
        start, installmentType, Number(depositAmount), numInstallments, Number(returnPercent)
      );
      loanData = {
        ...loanData,
        loanAmount: 0,
        installmentType,
        depositAmount: Number(depositAmount),
        totalInstallments: numInstallments,
        returnPercent: Number(returnPercent),
        maturityAmount,
      };
      installmentsToCreate = schedule;
    }

    // Create loan
    const loan = await prisma.loan.create({ data: loanData });

    // Create installments
    if (installmentsToCreate.length > 0) {
      await prisma.loanInstallment.createMany({
        data: installmentsToCreate.map((inst) => ({
          ...inst,
          loanId: loan.id,
          dueDate: new Date(inst.dueDate),
        })),
      });
    }

    await prisma.auditLog.create({
      data: {
        userId: auth.user.userId,
        action: 'CREATE',
        entity: 'Loan',
        entityId: loan.id,
        details: { loanNumber, loanType, amount: loanAmount },
      },
    });

    return NextResponse.json({ loan }, { status: 201 });
  } catch (error) {
    console.error('Loan creation error:', error);
    return NextResponse.json({ error: 'Failed to create loan' }, { status: 500 });
  }
}
