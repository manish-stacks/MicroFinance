import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { format } from 'date-fns';

export async function GET(req: NextRequest, { params }: { params: { loanId: string } }) {
  const auth = requireAuth(req);
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const loan = await prisma.loan.findUnique({ where: { id: params.loanId }, include: { party: true } });
  if (!loan) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const settings = await prisma.systemSettings.findMany();
  const cfg = Object.fromEntries(settings.map(s => [s.key, s.value]));
  const co = cfg.company_name || 'MicroFinance Pro';
  const p = loan.party;
  const nocNo = `NOC/${new Date().getFullYear()}/${loan.loanNumber.slice(-6)}`;

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>NOC - ${loan.loanNumber}</title>
  <style>body{font-family:'Times New Roman',serif;font-size:14px;line-height:2;color:#000;margin:0}@media print{.no-print{display:none!important}}.page{max-width:750px;margin:40px auto;padding:50px;border:3px double #1d4ed8}table{width:100%;border-collapse:collapse;margin:16px 0}th,td{border:1px solid #ccc;padding:8px 12px}th{background:#f0f0f0}</style>
  </head><body><div class="page">
  <div style="text-align:center"><strong style="font-size:22px;color:#1d4ed8">${co}</strong><br><span style="font-size:12px;color:#555">${cfg.company_address||''} | ${cfg.company_phone||''}</span></div>
  <hr style="border:2px solid #1d4ed8;margin:16px 0">
  <h2 style="text-align:center;text-decoration:underline;letter-spacing:2px;font-size:20px;margin:16px 0">NO OBJECTION CERTIFICATE</h2>
  <p style="text-align:center;color:#555;margin-bottom:20px">NOC No: <strong>${nocNo}</strong> | Date: <strong>${format(new Date(),'dd MMMM yyyy')}</strong></p>
  <p>This certifies that <strong>${p.name}</strong>, S/O <strong>${p.fatherName||'—'}</strong>, residing at <strong>${[p.area,p.city,p.state].filter(Boolean).join(', ')}</strong>, Customer ID: <strong>${p.customerId}</strong>, had availed a loan:</p>
  <table><tr><th>Particulars</th><th>Details</th></tr>
  <tr><td>Loan Number</td><td><strong>${loan.loanNumber}</strong></td></tr>
  <tr><td>Loan Type</td><td>${loan.loanType.replace('_',' ')}</td></tr>
  <tr><td>Principal Amount</td><td>₹${Number(loan.loanAmount).toLocaleString('en-IN')}</td></tr>
  <tr><td>Start Date</td><td>${format(new Date(loan.startDate),'dd MMMM yyyy')}</td></tr>
  <tr><td>Total Paid</td><td><strong>₹${Number(loan.totalPaid).toLocaleString('en-IN')}</strong></td></tr>
  <tr><td>Status</td><td><strong style="color:${loan.status==='CLOSED'?'#15803d':'#b45309'}">${loan.status}</strong></td></tr>
  </table>
  <p><strong>${co}</strong> has <u>no objection</u> against the above borrower for any financial services or legal matters. Valid for 6 months from issue date.</p>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:40px;margin-top:60px">
    <div style="text-align:center"><br><br>________________________<br><strong>Authorized Signatory</strong><br>${co}<br>Date: ${format(new Date(),'dd/MM/yyyy')}</div>
    <div style="text-align:center"><br><br>________________________<br><strong>${p.name}</strong><br>Borrower<br>Date: __________</div>
  </div>
  <div style="margin-top:24px;padding:10px;background:#f0f9ff;border:1px solid #bae6fd;border-radius:6px;font-size:12px;color:#0369a1;text-align:center">⚠️ Computer-generated. Verify with ${cfg.company_phone||co}.</div>
  <div class="no-print" style="margin-top:24px;text-align:center;display:flex;gap:12px;justify-content:center">
    <button onclick="window.print()" style="background:#1d4ed8;color:white;border:none;padding:12px 28px;border-radius:8px;font-size:15px;cursor:pointer">🖨️ Print NOC</button>
    <button onclick="window.close()" style="background:#64748b;color:white;border:none;padding:12px 28px;border-radius:8px;font-size:15px;cursor:pointer">✕ Close</button>
  </div>
  </div></body></html>`;

  return new NextResponse(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}
