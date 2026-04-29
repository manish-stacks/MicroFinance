import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { format } from 'date-fns';

function numWords(n: number): string {
  const ones=['','One','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten','Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen','Seventeen','Eighteen','Nineteen'];
  const tens=['','','Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety'];
  const fn=(x:number):string=>{if(x<20)return ones[x];if(x<100)return tens[Math.floor(x/10)]+(x%10?' '+ones[x%10]:'');if(x<1000)return ones[Math.floor(x/100)]+' Hundred'+(x%100?' '+fn(x%100):'');if(x<100000)return fn(Math.floor(x/1000))+' Thousand'+(x%1000?' '+fn(x%1000):'');if(x<10000000)return fn(Math.floor(x/100000))+' Lakh'+(x%100000?' '+fn(x%100000):'');return fn(Math.floor(x/10000000))+' Crore'+(x%10000000?' '+fn(x%10000000):'');};
  return fn(Math.floor(n))||'Zero';
}

export async function GET(req: NextRequest, { params }: { params: { loanId: string } }) {
  const auth = requireAuth(req);
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const loan = await prisma.loan.findUnique({ where: { id: params.loanId }, include: { party: true } });
  if (!loan) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const settings = await prisma.systemSettings.findMany();
  const cfg = Object.fromEntries(settings.map(s => [s.key, s.value]));
  const co = cfg.company_name || 'MicroFinance Pro';
  const p = loan.party;
  const amt = Number(loan.loanAmount);

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Loan Agreement - ${loan.loanNumber}</title>
  <style>body{font-family:'Times New Roman',serif;font-size:13px;line-height:1.8;color:#000;margin:0}@media print{.no-print{display:none!important}}.page{max-width:800px;margin:0 auto;padding:40px}table{width:100%;border-collapse:collapse;margin:16px 0}th,td{border:1px solid #000;padding:8px 12px}th{background:#f0f0f0}.sign{display:grid;grid-template-columns:1fr 1fr;gap:40px;margin-top:60px}.sign-box{text-align:center;border-top:1px solid #000;padding-top:8px}</style>
  </head><body><div class="page">
  <div style="text-align:center;margin-bottom:8px"><strong style="font-size:20px">${co}</strong><br><span style="font-size:12px">${cfg.company_address||''}</span></div>
  <hr style="border:2px solid #000;margin:12px 0">
  <h2 style="text-align:center;text-decoration:underline;font-size:18px;margin:16px 0">LOAN AGREEMENT</h2>
  <p>This Agreement is entered on <strong>${format(new Date(),'dd MMMM yyyy')}</strong> between <strong>${co}</strong> (Lender) and <strong>${p.name}</strong> (Borrower).</p>
  <h3 style="text-decoration:underline">1. LOAN DETAILS</h3>
  <table><tr><th>Particulars</th><th>Details</th></tr>
  <tr><td>Loan Number</td><td><strong>${loan.loanNumber}</strong></td></tr>
  <tr><td>Loan Type</td><td>${loan.loanType.replace('_',' ')}</td></tr>
  <tr><td>Principal Amount</td><td><strong>₹${amt.toLocaleString('en-IN')} (${numWords(amt)} Rupees Only)</strong></td></tr>
  <tr><td>Start Date</td><td>${format(new Date(loan.startDate),'dd MMMM yyyy')}</td></tr>
  ${loan.installmentType?`<tr><td>Repayment Frequency</td><td>${loan.installmentType}</td></tr>`:''}
  ${loan.installmentAmount?`<tr><td>Installment Amount</td><td>₹${Number(loan.installmentAmount).toLocaleString('en-IN')}</td></tr>`:''}
  ${loan.totalInstallments?`<tr><td>Total Installments</td><td>${loan.totalInstallments}</td></tr>`:''}
  ${loan.totalPayable?`<tr><td>Total Payable</td><td>₹${Number(loan.totalPayable).toLocaleString('en-IN')}</td></tr>`:''}
  ${loan.monthlyInterest?`<tr><td>Monthly Interest</td><td>₹${Number(loan.monthlyInterest).toLocaleString('en-IN')}</td></tr>`:''}
  ${loan.lateFine?`<tr><td>Late Fine/Day</td><td>₹${Number(loan.lateFine).toLocaleString('en-IN')}</td></tr>`:''}
  ${loan.fileCharges?`<tr><td>File Charges</td><td>₹${Number(loan.fileCharges).toLocaleString('en-IN')}</td></tr>`:''}
  ${loan.purpose?`<tr><td>Purpose</td><td>${loan.purpose}</td></tr>`:''}
  </table>
  <h3 style="text-decoration:underline">2. BORROWER DETAILS</h3>
  <table><tr><th>Field</th><th>Details</th></tr>
  <tr><td>Name</td><td>${p.name}</td></tr>
  <tr><td>Father's Name</td><td>${p.fatherName||'—'}</td></tr>
  <tr><td>Mobile</td><td>${p.mobile1}${p.mobile2?', '+p.mobile2:''}</td></tr>
  <tr><td>Address</td><td>${[p.area,p.city,p.state,p.pincode].filter(Boolean).join(', ')}</td></tr>
  ${p.pan?`<tr><td>PAN</td><td>${p.pan}</td></tr>`:''}
  ${p.aadhaar?`<tr><td>Aadhaar</td><td>${p.aadhaar}</td></tr>`:''}
  ${p.idProofType?`<tr><td>ID Proof (${p.idProofType})</td><td>${p.idProofNumber||'—'}</td></tr>`:''}
  ${p.addressProofType?`<tr><td>Address Proof (${p.addressProofType})</td><td>${p.addressProofNumber||'—'}</td></tr>`:''}
  ${p.bankAccountNo?`<tr><td>Bank Account</td><td>${p.bankName} — ${p.bankAccountNo}</td></tr>`:''}
  </table>
  <h3 style="text-decoration:underline">3. TERMS AND CONDITIONS</h3>
  <ol style="line-height:2.2">
    <li>Borrower agrees to repay as per schedule.</li>
    <li>Late payment fine: ₹${Number(loan.lateFine||0).toLocaleString('en-IN')}/day.</li>
    <li>Company may take legal action on default.</li>
    <li>All disputes subject to local court jurisdiction.</li>
    <li>Borrower confirms all information is true and correct.</li>
  </ol>
  <div class="sign">
    <div class="sign-box"><br><br>________________________<br>${p.name}<br><strong>Borrower</strong><br>Date: __________</div>
    <div class="sign-box"><br><br>________________________<br>Authorized Signatory<br><strong>${co}</strong><br>Date: __________</div>
  </div>
  ${loan.witnessName?`<div style="margin-top:40px"><div class="sign-box" style="max-width:250px"><br><br>________________________<br>${loan.witnessName}<br><strong>Witness</strong></div></div>`:''}
  <div class="no-print" style="margin-top:30px;text-align:center;display:flex;gap:12px;justify-content:center">
    <button onclick="window.print()" style="background:#1d4ed8;color:white;border:none;padding:12px 28px;border-radius:8px;font-size:15px;cursor:pointer">🖨️ Print Agreement</button>
    <button onclick="window.close()" style="background:#64748b;color:white;border:none;padding:12px 28px;border-radius:8px;font-size:15px;cursor:pointer">✕ Close</button>
  </div>
  </div></body></html>`;

  return new NextResponse(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}
