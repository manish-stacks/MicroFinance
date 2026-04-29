// src/app/api/payments/[id]/receipt/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { generateReceiptHTML } from '@/lib/pdf';
import { format } from 'date-fns';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = requireAuth(req, ['ADMIN', 'SUB_ADMIN', 'AGENT']);
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const payment = await prisma.payment.findUnique({
    where: { id: params.id },
    include: {
      loan: {
        include: {
          party: true,
        },
      },
      installment: true,
      agent: { select: { name: true } },
    },
  });

  if (!payment) return NextResponse.json({ error: 'Payment not found' }, { status: 404 });

  const settings = await prisma.systemSettings.findMany({
    where: { key: { in: ['company_name', 'company_address', 'company_phone'] } },
  });

  const settingsMap = Object.fromEntries(settings.map(s => [s.key, s.value]));

  const html = generateReceiptHTML({
    receiptNumber: payment.receiptNumber,
    loanNumber: payment.loan.loanNumber,
    customerName: payment.loan.party.name,
    customerId: payment.loan.party.customerId,
    mobile: payment.loan.party.mobile1,
    paymentDate: format(new Date(payment.paymentDate), 'dd MMM yyyy, hh:mm a'),
    amount: Number(payment.amount),
    fineAmount: Number(payment.fineAmount),
    totalAmount: Number(payment.totalAmount),
    installmentNo: payment.installment?.installmentNo || 0,
    paymentMode: payment.paymentMode,
    agentName: payment.agent?.name,
    notes: payment.notes || undefined,
    loanType: payment.loan.loanType,
    loanAmount: Number(payment.loan.loanAmount),
    companyName: settingsMap.company_name,
    companyAddress: settingsMap.company_address,
    companyPhone: settingsMap.company_phone,
  });

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  });
}
