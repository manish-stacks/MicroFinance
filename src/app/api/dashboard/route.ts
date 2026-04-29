// src/app/api/dashboard/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { startOfDay, endOfDay, startOfMonth, endOfMonth, subMonths, format } from 'date-fns';

export async function GET(req: NextRequest) {
  const auth = requireAuth(req);
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const today = new Date();
  const isAgent = auth.user.role === 'AGENT';

  const loanWhere: any = isAgent ? { party: { agentId: auth.user.userId } } : {};
  const paymentWhere: any = isAgent ? { agentId: auth.user.userId } : {};

  // Core stats
  const [
    totalLoans,
    activeLoans,
    overdueInstallments,
    totalParties,
    todayPayments,
    monthPayments,
  ] = await Promise.all([
    prisma.loan.count({ where: loanWhere }),
    prisma.loan.count({ where: { ...loanWhere, status: 'ACTIVE' } }),
    prisma.loanInstallment.count({
      where: {
        status: 'OVERDUE',
        loan: loanWhere,
      },
    }),
    isAgent
      ? prisma.party.count({ where: { agentId: auth.user.userId } })
      : prisma.party.count(),
    prisma.payment.aggregate({
      where: {
        ...paymentWhere,
        paymentDate: { gte: startOfDay(today), lte: endOfDay(today) },
      },
      _sum: { totalAmount: true },
      _count: true,
    }),
    prisma.payment.aggregate({
      where: {
        ...paymentWhere,
        paymentDate: { gte: startOfMonth(today), lte: endOfMonth(today) },
      },
      _sum: { totalAmount: true },
    }),
  ]);

  // Total loan disbursed amount
  const totalDisbursed = await prisma.loan.aggregate({
    where: loanWhere,
    _sum: { loanAmount: true },
  });

  // Total collected
  const totalCollected = await prisma.payment.aggregate({
    where: paymentWhere,
    _sum: { totalAmount: true },
  });

  // Today's collection list (for agents)
  const todayCollections = await prisma.loanInstallment.findMany({
    where: {
      dueDate: { gte: startOfDay(today), lte: endOfDay(today) },
      status: { in: ['PENDING', 'OVERDUE'] },
      loan: loanWhere,
    },
    include: {
      loan: {
        include: {
          party: { select: { name: true, mobile1: true, area: true, city: true } },
        },
      },
    },
    orderBy: { dueDate: 'asc' },
    take: 20,
  });

  // Monthly collection chart (last 6 months)
  const monthlyData = await Promise.all(
    Array.from({ length: 6 }, (_, i) => {
      const monthStart = startOfMonth(subMonths(today, 5 - i));
      const monthEnd = endOfMonth(subMonths(today, 5 - i));
      return prisma.payment.aggregate({
        where: {
          ...paymentWhere,
          paymentDate: { gte: monthStart, lte: monthEnd },
        },
        _sum: { totalAmount: true },
      }).then((result) => ({
        month: format(monthStart, 'MMM yyyy'),
        amount: Number(result._sum.totalAmount || 0),
      }));
    })
  );

  // Agent-wise collection (admin only)
  let agentStats = null;
  if (!isAgent) {
    agentStats = await prisma.user.findMany({
      where: { role: 'AGENT', isActive: true },
      select: {
        id: true,
        name: true,
        agentCode: true,
        collections: {
          where: {
            paymentDate: { gte: startOfMonth(today), lte: endOfMonth(today) },
          },
          select: { totalAmount: true },
        },
        assignedParties: { select: { id: true } },
      },
    });
  }

  // Overdue loans list
  const overdueLoans = await prisma.loanInstallment.findMany({
    where: {
      status: 'OVERDUE',
      loan: loanWhere,
    },
    include: {
      loan: {
        include: {
          party: { select: { name: true, mobile1: true, customerId: true } },
        },
      },
    },
    orderBy: { dueDate: 'asc' },
    take: 10,
  });

  return NextResponse.json({
    stats: {
      totalLoans,
      activeLoans,
      totalParties,
      overdueInstallments,
      totalDisbursed: Number(totalDisbursed._sum.loanAmount || 0),
      totalCollected: Number(totalCollected._sum.totalAmount || 0),
      todayCollection: Number(todayPayments._sum.totalAmount || 0),
      todayPaymentCount: todayPayments._count,
      monthCollection: Number(monthPayments._sum.totalAmount || 0),
    },
    todayCollections,
    overdueLoans,
    monthlyData,
    agentStats: agentStats?.map((agent) => ({
      id: agent.id,
      name: agent.name,
      agentCode: agent.agentCode,
      monthCollection: agent.collections.reduce((sum, p) => sum + Number(p.totalAmount), 0),
      totalCustomers: agent.assignedParties.length,
    })),
  });
}
