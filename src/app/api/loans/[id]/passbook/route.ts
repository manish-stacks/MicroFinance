import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { format } from 'date-fns';

function numWords(n: number): string {
  const ones = ['','One','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten','Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen','Seventeen','Eighteen','Nineteen'];
  const tens = ['','','Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety'];
  const fn = (x: number): string => {
    if (x < 20) return ones[x];
    if (x < 100) return tens[Math.floor(x/10)] + (x%10 ? ' '+ones[x%10] : '');
    if (x < 1000) return ones[Math.floor(x/100)]+' Hundred'+(x%100?' '+fn(x%100):'');
    if (x < 100000) return fn(Math.floor(x/1000))+' Thousand'+(x%1000?' '+fn(x%1000):'');
    if (x < 10000000) return fn(Math.floor(x/100000))+' Lakh'+(x%100000?' '+fn(x%100000):'');
    return fn(Math.floor(x/10000000))+' Crore'+(x%10000000?' '+fn(x%10000000):'');
  };
  return fn(Math.floor(n)) || 'Zero';
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = requireAuth(req);
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const loan = await prisma.loan.findUnique({
    where: { id: params.id },
    include: {
      party: { include: { agent: { select: { name: true } } } },
      installments: { orderBy: { installmentNo: 'asc' } },
      payments: { include: { agent: { select: { name: true } } }, orderBy: { paymentDate: 'asc' } },
    },
  });

  if (!loan) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const settings = await prisma.systemSettings.findMany();
  const cfg = Object.fromEntries(settings.map(s => [s.key, s.value]));
  const co = cfg.company_name || 'MicroFinance Pro';

  const paidC = loan.installments.filter(i => i.status === 'PAID').length;
  const overdueC = loan.installments.filter(i => i.status === 'OVERDUE').length;

  const instRows = loan.installments.map(inst => {
    const pay = loan.payments.find(p => p.installmentId === inst.id);
    const sc = inst.status==='PAID'?'#d1fae5':inst.status==='OVERDUE'?'#fee2e2':'#fef3c7';
    const tc = inst.status==='PAID'?'#065f46':inst.status==='OVERDUE'?'#991b1b':'#92400e';
    return `<tr style="border-bottom:1px solid #e5e7eb">
      <td style="padding:6px 10px;text-align:center">${inst.installmentNo}</td>
      <td style="padding:6px 10px">${format(new Date(inst.dueDate),'dd MMM yyyy')}</td>
      <td style="padding:6px 10px;text-align:right">₹${Number(inst.amount).toLocaleString('en-IN')}</td>
      <td style="padding:6px 10px;text-align:right">${Number(inst.paidAmount)>0?'₹'+Number(inst.paidAmount).toLocaleString('en-IN'):'-'}</td>
      <td style="padding:6px 10px;text-align:right;color:#dc2626">${Number(inst.fineAmount)>0?'₹'+Number(inst.fineAmount).toLocaleString('en-IN'):'-'}</td>
      <td style="padding:6px 10px">${inst.paidDate?format(new Date(inst.paidDate),'dd MMM yyyy'):'-'}</td>
      <td style="padding:6px 10px;text-align:center"><span style="background:${sc};color:${tc};padding:2px 8px;border-radius:20px;font-size:11px;font-weight:600">${inst.status}</span></td>
      <td style="padding:6px 10px">${pay?.agent?.name||'-'}</td>
    </tr>`;
  }).join('');

  const payRows = loan.payments.map(p => `<tr style="border-bottom:1px solid #e5e7eb">
    <td style="padding:6px 10px;font-family:monospace;font-size:12px">${p.receiptNumber}</td>
    <td style="padding:6px 10px">${format(new Date(p.paymentDate),'dd MMM yyyy')}</td>
    <td style="padding:6px 10px;text-align:right">₹${Number(p.amount).toLocaleString('en-IN')}</td>
    <td style="padding:6px 10px;text-align:right;color:#dc2626">${Number(p.fineAmount)>0?'₹'+Number(p.fineAmount).toLocaleString('en-IN'):'-'}</td>
    <td style="padding:6px 10px;text-align:right;font-weight:600">₹${Number(p.totalAmount).toLocaleString('en-IN')}</td>
    <td style="padding:6px 10px">${p.paymentMode}</td>
    <td style="padding:6px 10px">${p.agent?.name||'-'}</td>
  </tr>`).join('');

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Passbook - ${loan.loanNumber}</title>
  <style>body{font-family:'Segoe UI',Arial,sans-serif;margin:0;color:#1e293b}@media print{.no-print{display:none!important}}.container{max-width:900px;margin:0 auto;background:white;padding:30px}</style>
  </head><body><div class="container">
  <div style="background:linear-gradient(135deg,#1d4ed8,#1e40af);color:white;padding:25px;border-radius:12px;margin-bottom:24px;display:flex;justify-content:space-between;align-items:center">
    <div><h1 style="margin:0;font-size:22px">🏦 ${co}</h1><p style="margin:4px 0 0;opacity:.8;font-size:13px">${cfg.company_address||''}</p></div>
    <div style="text-align:right"><h2 style="margin:0;font-size:18px">LOAN PASSBOOK</h2><p style="margin:4px 0 0;opacity:.8">Loan No: ${loan.loanNumber}</p></div>
  </div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:24px">
    <div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px;padding:16px">
      <h3 style="margin:0 0 10px;font-size:13px;color:#0369a1;text-transform:uppercase">Customer</h3>
      <p style="margin:3px 0"><strong>${loan.party.name}</strong></p>
      <p style="margin:3px 0;color:#555">${loan.party.customerId} | ${loan.party.mobile1}</p>
      ${loan.party.agent?`<p style="margin:3px 0;color:#555">Agent: ${loan.party.agent.name}</p>`:''}
    </div>
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px">
      <h3 style="margin:0 0 10px;font-size:13px;color:#15803d;text-transform:uppercase">Loan</h3>
      <p style="margin:3px 0"><strong>${loan.loanType.replace('_',' ')}</strong></p>
      <p style="margin:3px 0;color:#555">Amount: ₹${Number(loan.loanAmount).toLocaleString('en-IN')}</p>
      <p style="margin:3px 0"><strong style="color:${loan.status==='ACTIVE'?'#15803d':'#dc2626'}">${loan.status}</strong></p>
    </div>
  </div>
  <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:24px">
    ${[['Total',loan.installments.length,'#3b82f6'],['Paid',paidC,'#10b981'],['Pending',loan.installments.length-paidC-overdueC,'#f59e0b'],['Overdue',overdueC,'#ef4444']].map(([l,v,c])=>`<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:12px;text-align:center"><p style="margin:0;font-size:11px;color:#64748b;text-transform:uppercase">${l}</p><p style="margin:4px 0 0;font-size:22px;font-weight:700;color:${c}">${v}</p></div>`).join('')}
  </div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:24px">
    <div style="background:#f1f5f9;border-radius:8px;padding:12px;display:flex;justify-content:space-between"><span>Total Paid</span><strong style="color:#10b981">₹${Number(loan.totalPaid).toLocaleString('en-IN')}</strong></div>
    ${loan.pendingAmount?`<div style="background:#fef2f2;border-radius:8px;padding:12px;display:flex;justify-content:space-between"><span>Pending</span><strong style="color:#dc2626">₹${Number(loan.pendingAmount).toLocaleString('en-IN')}</strong></div>`:''}
  </div>
  <h3 style="border-bottom:2px solid #1d4ed8;padding-bottom:8px;margin-bottom:12px">📅 Installment Schedule</h3>
  <div style="overflow-x:auto;margin-bottom:24px"><table style="width:100%;border-collapse:collapse;font-size:13px">
    <thead><tr style="background:#1d4ed8;color:white"><th style="padding:10px;text-align:center">#</th><th style="padding:10px">Due Date</th><th style="padding:10px;text-align:right">Amount</th><th style="padding:10px;text-align:right">Paid</th><th style="padding:10px;text-align:right">Fine</th><th style="padding:10px">Paid Date</th><th style="padding:10px;text-align:center">Status</th><th style="padding:10px">Agent</th></tr></thead>
    <tbody>${instRows}</tbody></table></div>
  <h3 style="border-bottom:2px solid #1d4ed8;padding-bottom:8px;margin-bottom:12px">💳 Payment History</h3>
  <div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:13px">
    <thead><tr style="background:#1d4ed8;color:white"><th style="padding:10px">Receipt No</th><th style="padding:10px">Date</th><th style="padding:10px;text-align:right">Amount</th><th style="padding:10px;text-align:right">Fine</th><th style="padding:10px;text-align:right">Total</th><th style="padding:10px">Mode</th><th style="padding:10px">Agent</th></tr></thead>
    <tbody>${payRows||'<tr><td colspan="7" style="text-align:center;padding:20px;color:#94a3b8">No payments yet</td></tr>'}</tbody></table></div>
  <div class="no-print" style="margin-top:24px;text-align:center;display:flex;gap:12px;justify-content:center">
    <button onclick="window.print()" style="background:#1d4ed8;color:white;border:none;padding:12px 28px;border-radius:8px;font-size:15px;cursor:pointer">🖨️ Print Passbook</button>
    <button onclick="window.close()" style="background:#64748b;color:white;border:none;padding:12px 28px;border-radius:8px;font-size:15px;cursor:pointer">✕ Close</button>
  </div>
  <div style="margin-top:20px;border-top:1px solid #e2e8f0;padding-top:10px;text-align:center;font-size:11px;color:#94a3b8">Generated: ${format(new Date(),'dd MMM yyyy HH:mm')} • ${co}</div>
  </div></body></html>`;

  return new NextResponse(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}
