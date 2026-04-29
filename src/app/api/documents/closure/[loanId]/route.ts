import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { format } from 'date-fns';

function numWords(n:number):string{const o=['','One','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten','Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen','Seventeen','Eighteen','Nineteen'],t=['','','Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety'],f=(x:number):string=>{if(x<20)return o[x];if(x<100)return t[Math.floor(x/10)]+(x%10?' '+o[x%10]:'');if(x<1000)return o[Math.floor(x/100)]+' Hundred'+(x%100?' '+f(x%100):'');if(x<100000)return f(Math.floor(x/1000))+' Thousand'+(x%1000?' '+f(x%1000):'');if(x<10000000)return f(Math.floor(x/100000))+' Lakh'+(x%100000?' '+f(x%100000):'');return f(Math.floor(x/10000000))+' Crore'+(x%10000000?' '+f(x%10000000):'');};return f(Math.floor(n))||'Zero';}

export async function GET(req: NextRequest, { params }: { params: { loanId: string } }) {
  const auth = requireAuth(req);
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const loan = await prisma.loan.findUnique({ where: { id: params.loanId }, include: { party: true } });
  if (!loan) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const settings = await prisma.systemSettings.findMany();
  const cfg = Object.fromEntries(settings.map(s => [s.key, s.value]));
  const co = cfg.company_name || 'MicroFinance Pro';
  const p = loan.party;
  const certNo = `LCC/${new Date().getFullYear()}/${loan.loanNumber.slice(-6)}`;
  const closureDate = loan.endDate ? format(new Date(loan.endDate),'dd MMMM yyyy') : format(new Date(),'dd MMMM yyyy');
  const totalPaid = Number(loan.totalPaid);

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Closure Certificate - ${loan.loanNumber}</title>
  <style>body{font-family:'Times New Roman',serif;font-size:14px;line-height:2;color:#000;margin:0}@media print{.no-print{display:none!important}}.page{max-width:750px;margin:40px auto;padding:50px;border:3px double #15803d}.wm{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%) rotate(-30deg);font-size:80px;color:rgba(0,128,0,.05);font-weight:bold;white-space:nowrap;pointer-events:none;z-index:0}.ct{position:relative;z-index:1}table{width:100%;border-collapse:collapse;margin:16px 0}th,td{border:1px solid #86efac;padding:8px 12px}th{background:#f0fdf4}</style>
  </head><body><div class="page"><div class="wm">LOAN CLOSED</div><div class="ct">
  <div style="text-align:center"><strong style="font-size:22px;color:#15803d">${co}</strong><br><span style="font-size:12px;color:#555">${cfg.company_address||''}</span></div>
  <hr style="border:2px solid #15803d;margin:16px 0">
  <h2 style="text-align:center;text-decoration:underline;letter-spacing:2px;font-size:20px;color:#15803d;margin:16px 0">LOAN CLOSURE CERTIFICATE</h2>
  <p style="text-align:center;color:#555;margin-bottom:20px">Cert No: <strong>${certNo}</strong> | Date: <strong>${format(new Date(),'dd MMMM yyyy')}</strong></p>
  <p>This certifies that the loan of <strong>${p.name}</strong> (Cust ID: <strong>${p.customerId}</strong>) has been <u style="color:#15803d;font-weight:bold">FULLY CLOSED</u> with all dues settled.</p>
  <table><tr><th>Particulars</th><th>Details</th></tr>
  <tr><td>Loan Number</td><td><strong>${loan.loanNumber}</strong></td></tr>
  <tr><td>Loan Type</td><td>${loan.loanType.replace('_',' ')}</td></tr>
  <tr><td>Principal Amount</td><td>₹${Number(loan.loanAmount).toLocaleString('en-IN')}</td></tr>
  <tr><td>Start Date</td><td>${format(new Date(loan.startDate),'dd MMMM yyyy')}</td></tr>
  <tr><td>Closure Date</td><td><strong>${closureDate}</strong></td></tr>
  <tr><td>Total Amount Paid</td><td><strong style="color:#15803d">₹${totalPaid.toLocaleString('en-IN')} (${numWords(totalPaid)} Rupees Only)</strong></td></tr>
  <tr><td>Outstanding Balance</td><td><strong>₹0.00 (NIL)</strong></td></tr>
  </table>
  <p><strong>${co}</strong> confirms that the borrower has repaid the entire loan. No further financial claims exist against the borrower for Loan No. <strong>${loan.loanNumber}</strong>.</p>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:40px;margin-top:60px">
    <div style="text-align:center"><br><br>________________________<br><strong>Authorized Signatory</strong><br>${co}<br>Date: ${format(new Date(),'dd/MM/yyyy')}</div>
    <div style="text-align:center"><br><br>________________________<br><strong>${p.name}</strong><br>Borrower Acknowledgement<br>Date: __________</div>
  </div>
  <div style="margin-top:24px;padding:12px;background:#f0fdf4;border:1px solid #86efac;border-radius:6px;font-size:12px;color:#15803d;text-align:center">✅ Loan account permanently closed. ${co} | Loan: ${loan.loanNumber}</div>
  <div class="no-print" style="margin-top:24px;text-align:center;display:flex;gap:12px;justify-content:center">
    <button onclick="window.print()" style="background:#15803d;color:white;border:none;padding:12px 28px;border-radius:8px;font-size:15px;cursor:pointer">🖨️ Print Certificate</button>
    <button onclick="window.close()" style="background:#64748b;color:white;border:none;padding:12px 28px;border-radius:8px;font-size:15px;cursor:pointer">✕ Close</button>
  </div>
  </div></div></body></html>`;

  return new NextResponse(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}
