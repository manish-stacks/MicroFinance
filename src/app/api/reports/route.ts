// src/app/api/reports/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import ExcelJS from 'exceljs';

export async function GET(req: NextRequest) {
  const auth = requireAuth(req, ['ADMIN', 'SUB_ADMIN']);
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type') || 'collection';
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');
  const agentId = searchParams.get('agentId');
  const loanType = searchParams.get('loanType');
  const format = searchParams.get('format') || 'json';

  let data: any = null;

  if (type === 'collection') {
    const where: any = {};
    if (startDate && endDate) {
      where.paymentDate = { gte: new Date(startDate), lte: new Date(endDate) };
    }
    if (agentId) where.agentId = agentId;

    data = await prisma.payment.findMany({
      where,
      include: {
        loan: {
          include: {
            party: { select: { name: true, customerId: true, mobile1: true } },
          },
        },
        agent: { select: { name: true, agentCode: true } },
        installment: { select: { installmentNo: true } },
      },
      orderBy: { paymentDate: 'desc' },
    });

    if (format === 'excel') {
      return generateExcel(data, 'Collection Report', [
        { header: 'Receipt No', key: 'receiptNumber' },
        { header: 'Date', key: 'paymentDate' },
        { header: 'Customer Name', key: 'customerName' },
        { header: 'Customer ID', key: 'customerId' },
        { header: 'Loan No', key: 'loanNumber' },
        { header: 'Installment', key: 'installmentNo' },
        { header: 'Amount', key: 'amount' },
        { header: 'Fine', key: 'fineAmount' },
        { header: 'Total', key: 'totalAmount' },
        { header: 'Mode', key: 'paymentMode' },
        { header: 'Agent', key: 'agentName' },
      ], data.map((p: any) => ({
        receiptNumber: p.receiptNumber,
        paymentDate: new Date(p.paymentDate).toLocaleDateString('en-IN'),
        customerName: p.loan.party.name,
        customerId: p.loan.party.customerId,
        loanNumber: p.loan.loanNumber,
        installmentNo: p.installment?.installmentNo || '-',
        amount: Number(p.amount),
        fineAmount: Number(p.fineAmount),
        totalAmount: Number(p.totalAmount),
        paymentMode: p.paymentMode,
        agentName: p.agent?.name || '-',
      })));
    }
  } else if (type === 'loans') {
    const where: any = {};
    if (loanType) where.loanType = loanType;
    if (agentId) where.agentId = agentId;

    data = await prisma.loan.findMany({
      where,
      include: {
        party: {
          select: { name: true, customerId: true, mobile1: true, agent: { select: { name: true } } },
        },
        _count: { select: { payments: true, installments: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (format === 'excel') {
      return generateExcel(data, 'Loan Report', [
        { header: 'Loan No', key: 'loanNumber' },
        { header: 'Customer', key: 'customerName' },
        { header: 'Customer ID', key: 'customerId' },
        { header: 'Type', key: 'loanType' },
        { header: 'Amount', key: 'loanAmount' },
        { header: 'Status', key: 'status' },
        { header: 'Start Date', key: 'startDate' },
        { header: 'Total Paid', key: 'totalPaid' },
        { header: 'Agent', key: 'agentName' },
      ], data.map((l: any) => ({
        loanNumber: l.loanNumber,
        customerName: l.party.name,
        customerId: l.party.customerId,
        loanType: l.loanType,
        loanAmount: Number(l.loanAmount),
        status: l.status,
        startDate: new Date(l.startDate).toLocaleDateString('en-IN'),
        totalPaid: Number(l.totalPaid),
        agentName: l.party.agent?.name || '-',
      })));
    }
  } else if (type === 'party_payments') {
    const partyId = searchParams.get('partyId') || '';
    const payWhere: any = {};
    if (partyId) payWhere.loan = { partyId };
    if (agentId) payWhere.agentId = agentId;
    if (startDate && endDate) payWhere.paymentDate = { gte: new Date(startDate), lte: new Date(endDate) };
    data = await prisma.payment.findMany({
      where: payWhere,
      include: { loan: { select: { loanNumber: true, partyId: true, party: { select: { name: true, customerId: true } } } }, installment: { select: { installmentNo: true } }, agent: { select: { name: true } } },
      orderBy: { paymentDate: 'desc' },
    });
    if (format === 'excel') {
      return generateExcel(data, 'Payment Report', [
        { header: 'Receipt No', key: 'receiptNumber' }, { header: 'Date', key: 'paymentDate' },
        { header: 'Customer', key: 'customerName' }, { header: 'Loan No', key: 'loanNumber' },
        { header: 'EMI#', key: 'instNo' }, { header: 'Amount', key: 'amount' },
        { header: 'Fine', key: 'fineAmount' }, { header: 'Total', key: 'totalAmount' },
        { header: 'Mode', key: 'paymentMode' }, { header: 'Agent', key: 'agentName' },
      ], data.map((p: any) => ({
        receiptNumber: p.receiptNumber, paymentDate: new Date(p.paymentDate).toLocaleDateString('en-IN'),
        customerName: p.loan?.party?.name || '', loanNumber: p.loan?.loanNumber || '',
        instNo: p.installment?.installmentNo || '-', amount: Number(p.amount),
        fineAmount: Number(p.fineAmount), totalAmount: Number(p.totalAmount),
        paymentMode: p.paymentMode, agentName: p.agent?.name || '-',
      })));
    }
  } else if (type === 'overdue') {
    const overdueWhere: any = { status: 'OVERDUE' };
    if (agentId) overdueWhere.loan = { agentId };
    data = await prisma.loanInstallment.findMany({
      where: overdueWhere,
      include: {
        loan: {
          include: {
            party: {
              select: { name: true, customerId: true, mobile1: true, agent: { select: { name: true } } },
            },
          },
        },
      },
      orderBy: { dueDate: 'asc' },
    });

    if (format === 'excel') {
      return generateExcel(data, 'Overdue Report', [
        { header: 'Customer', key: 'customerName' },
        { header: 'Customer ID', key: 'customerId' },
        { header: 'Loan No', key: 'loanNumber' },
        { header: 'Inst. No', key: 'installmentNo' },
        { header: 'Due Date', key: 'dueDate' },
        { header: 'Amount', key: 'amount' },
        { header: 'Days Overdue', key: 'daysOverdue' },
        { header: 'Agent', key: 'agentName' },
      ], data.map((i: any) => {
        const daysOverdue = Math.floor((Date.now() - new Date(i.dueDate).getTime()) / 86400000);
        return {
          customerName: i.loan.party.name,
          customerId: i.loan.party.customerId,
          loanNumber: i.loan.loanNumber,
          installmentNo: i.installmentNo,
          dueDate: new Date(i.dueDate).toLocaleDateString('en-IN'),
          amount: Number(i.amount),
          daysOverdue,
          agentName: i.loan.party.agent?.name || '-',
        };
      }));
    }
  }

  return NextResponse.json({ data });
}

async function generateExcel(
  _rawData: any,
  reportName: string,
  columns: { header: string; key: string }[],
  rows: any[]
) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(reportName);

  // Header styling
  worksheet.columns = columns.map((col) => ({
    header: col.header,
    key: col.key,
    width: 18,
  }));

  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF1e3a5f' },
  };
  headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
  headerRow.height = 25;

  // Add rows
  rows.forEach((row) => worksheet.addRow(row));

  // Alternate row colors
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber > 1) {
      row.eachCell((cell) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: rowNumber % 2 === 0 ? 'FFF0F4FF' : 'FFFFFFFF' },
        };
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFD1D5DB' } },
          bottom: { style: 'thin', color: { argb: 'FFD1D5DB' } },
        };
      });
    }
  });

  // Total row for amounts
  const totalRow = worksheet.addRow({});
  totalRow.font = { bold: true };

  const buffer = await workbook.xlsx.writeBuffer();

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${reportName.replace(/ /g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx"`,
    },
  });
}
