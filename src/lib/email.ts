// src/lib/email.ts
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface PaymentEmailData {
  to: string;
  customerName: string;
  receiptNumber: string;
  loanNumber: string;
  amount: number;
  fineAmount: number;
  paymentDate: Date;
  balance: number;
}

interface ReminderEmailData {
  to: string;
  customerName: string;
  loanNumber: string;
  dueDate: Date;
  amount: number;
}

export async function sendPaymentReceiptEmail(data: PaymentEmailData) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; color: #333; }
        .header { background: #1e3a5f; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .receipt-box { border: 2px solid #1e3a5f; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
        .total { font-weight: bold; font-size: 18px; color: #1e3a5f; }
        .footer { background: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>MicroFinance Pro</h1>
        <p>Payment Receipt</p>
      </div>
      <div class="content">
        <p>Dear ${data.customerName},</p>
        <p>We have received your payment. Here are the details:</p>
        
        <div class="receipt-box">
          <div class="row"><span>Receipt Number:</span><span>${data.receiptNumber}</span></div>
          <div class="row"><span>Loan Number:</span><span>${data.loanNumber}</span></div>
          <div class="row"><span>Payment Date:</span><span>${new Date(data.paymentDate).toLocaleDateString('en-IN')}</span></div>
          <div class="row"><span>Amount Paid:</span><span>₹${data.amount.toLocaleString('en-IN')}</span></div>
          ${data.fineAmount > 0 ? `<div class="row"><span>Late Fine:</span><span>₹${data.fineAmount.toLocaleString('en-IN')}</span></div>` : ''}
          <div class="row total"><span>Total Paid:</span><span>₹${(data.amount + data.fineAmount).toLocaleString('en-IN')}</span></div>
        </div>
        
        <p>Thank you for your timely payment.</p>
        <p>For any queries, please contact us.</p>
      </div>
      <div class="footer">
        <p>MicroFinance Pro | info@microfinancepro.com | 1800-123-4567</p>
        <p>This is an auto-generated email. Please do not reply.</p>
      </div>
    </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'MicroFinance Pro <noreply@microfinancepro.com>',
      to: data.to,
      subject: `Payment Receipt - ${data.receiptNumber}`,
      html,
    });
  } catch (error) {
    console.error('Email send error:', error);
  }
}

export async function sendPaymentReminderEmail(data: ReminderEmailData) {
  const html = `
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial, sans-serif; color: #333;">
      <div style="background: #f59e0b; color: white; padding: 20px; text-align: center;">
        <h1>Payment Reminder</h1>
      </div>
      <div style="padding: 20px;">
        <p>Dear ${data.customerName},</p>
        <p>This is a friendly reminder that your EMI payment is due.</p>
        <div style="background: #fff3cd; border: 1px solid #ffc107; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <p><strong>Loan Number:</strong> ${data.loanNumber}</p>
          <p><strong>Due Date:</strong> ${new Date(data.dueDate).toLocaleDateString('en-IN')}</p>
          <p><strong>Amount Due:</strong> ₹${data.amount.toLocaleString('en-IN')}</p>
        </div>
        <p>Please ensure timely payment to avoid late fees.</p>
      </div>
    </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'MicroFinance Pro <noreply@microfinancepro.com>',
      to: data.to,
      subject: `EMI Reminder - ${data.loanNumber}`,
      html,
    });
  } catch (error) {
    console.error('Email send error:', error);
  }
}

export async function sendOverdueAlertEmail(data: ReminderEmailData & { daysOverdue: number; fine: number }) {
  const html = `
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial, sans-serif; color: #333;">
      <div style="background: #dc2626; color: white; padding: 20px; text-align: center;">
        <h1>⚠️ Overdue Payment Alert</h1>
      </div>
      <div style="padding: 20px;">
        <p>Dear ${data.customerName},</p>
        <p>Your EMI payment is <strong>${data.daysOverdue} days overdue</strong>.</p>
        <div style="background: #fee2e2; border: 1px solid #dc2626; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <p><strong>Loan Number:</strong> ${data.loanNumber}</p>
          <p><strong>Original Due Date:</strong> ${new Date(data.dueDate).toLocaleDateString('en-IN')}</p>
          <p><strong>Overdue Amount:</strong> ₹${data.amount.toLocaleString('en-IN')}</p>
          <p><strong>Late Fine:</strong> ₹${data.fine.toLocaleString('en-IN')}</p>
          <p><strong>Total Payable:</strong> ₹${(data.amount + data.fine).toLocaleString('en-IN')}</p>
        </div>
        <p>Please make the payment immediately to avoid further charges.</p>
      </div>
    </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: data.to,
      subject: `OVERDUE ALERT - ${data.loanNumber}`,
      html,
    });
  } catch (error) {
    console.error('Email send error:', error);
  }
}
