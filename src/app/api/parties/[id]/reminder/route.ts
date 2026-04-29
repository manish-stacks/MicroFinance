import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import nodemailer from 'nodemailer';
import { format } from 'date-fns';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = requireAuth(req, ['ADMIN', 'SUB_ADMIN', 'AGENT']);
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { type } = await req.json(); // 'email' | 'sms' | 'both'

  const party = await prisma.party.findUnique({
    where: { id: params.id },
    include: {
      loans: {
        where: { status: 'ACTIVE' },
        include: {
          installments: {
            where: { status: { in: ['PENDING', 'OVERDUE'] } },
            orderBy: { dueDate: 'asc' },
            take: 1,
          },
        },
      },
    },
  });

  if (!party) return NextResponse.json({ error: 'Party not found' }, { status: 404 });

  const activeLoan = party.loans[0];
  if (!activeLoan) return NextResponse.json({ error: 'No active loan' }, { status: 400 });

  const nextInst = activeLoan.installments[0];
  const amount = nextInst ? Number(nextInst.amount) : 0;
  const dueDate = nextInst ? format(new Date(nextInst.dueDate), 'dd MMM yyyy') : 'N/A';

  const results: Record<string, string> = {};

  // Email
  if ((type === 'email' || type === 'both') && party.email) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: Number(process.env.SMTP_PORT) || 587,
        secure: false,
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      });
      await transporter.sendMail({
        from: process.env.SMTP_FROM || 'MFPro <noreply@example.com>',
        to: party.email,
        subject: `EMI Payment Reminder - ${activeLoan.loanNumber}`,
        html: `<div style="font-family:Arial;max-width:600px;margin:0 auto"><div style="background:#f59e0b;color:white;padding:20px;text-align:center"><h2>⏰ Payment Reminder</h2></div><div style="padding:20px"><p>Dear <strong>${party.name}</strong>,</p><p>Your EMI payment is due soon.</p><div style="background:#fef3c7;border:1px solid #f59e0b;padding:15px;border-radius:8px;margin:16px 0"><p><strong>Loan:</strong> ${activeLoan.loanNumber}</p><p><strong>Due Date:</strong> ${dueDate}</p><p><strong>Amount:</strong> ₹${amount.toLocaleString('en-IN')}</p></div><p>Please pay on time to avoid late fees. Contact us at ${process.env.COMPANY_PHONE || ''}.</p></div></div>`,
      });
      results.email = 'sent';
    } catch (e: any) {
      results.email = 'failed: ' + e.message;
    }
  } else if (type === 'email' || type === 'both') {
    results.email = 'skipped - no email on file';
  }

  // SMS
  if ((type === 'sms' || type === 'both') && party.mobile1) {
    const apiKey = process.env.SMS_API_KEY || '';
    if (apiKey) {
      try {
        const msg = `Dear ${party.name}, EMI of Rs.${amount} for loan ${activeLoan.loanNumber} is due on ${dueDate}. Pay on time to avoid penalty. -MFPro`;
        const url = `https://api.textlocal.in/send/?apikey=${apiKey}&sender=MFPRO&numbers=91${party.mobile1}&message=${encodeURIComponent(msg)}`;
        const res = await fetch(url);
        const data = await res.json();
        results.sms = data.status === 'success' ? 'sent' : 'failed';
      } catch {
        results.sms = 'failed';
      }
    } else {
      results.sms = 'skipped - SMS_API_KEY not set in .env';
    }
  }

  await prisma.auditLog.create({
    data: { userId: auth.user.userId, action: 'REMINDER_SENT', entity: 'Party', entityId: party.id, details: results },
  });

  return NextResponse.json({ ok: true, results });
}
