// src/lib/pdf.ts
// Server-side PDF generation using jsPDF
// Note: For server-side, use a different approach or run client-side

export interface ReceiptData {
  receiptNumber: string;
  loanNumber: string;
  customerName: string;
  customerId: string;
  mobile: string;
  paymentDate: string;
  amount: number;
  fineAmount: number;
  totalAmount: number;
  installmentNo: number;
  paymentMode: string;
  agentName?: string;
  notes?: string;
  loanType: string;
  loanAmount: number;
  companyName?: string;
  companyAddress?: string;
  companyPhone?: string;
}

// This generates HTML that can be printed to PDF on the client
export function generateReceiptHTML(data: ReceiptData): string {
  const companyName = data.companyName || 'MicroFinance Pro';
  const companyAddress = data.companyAddress || '123 Finance Street, Mumbai';
  const companyPhone = data.companyPhone || '1800-123-4567';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Receipt - ${data.receiptNumber}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; color: #1a1a1a; background: #fff; }
    
    .receipt {
      width: 80mm;
      max-width: 400px;
      margin: 0 auto;
      padding: 16px;
      border: 1px solid #ddd;
    }
    
    .header {
      text-align: center;
      border-bottom: 2px dashed #1e3a5f;
      padding-bottom: 12px;
      margin-bottom: 12px;
    }
    
    .company-name {
      font-size: 20px;
      font-weight: 700;
      color: #1e3a5f;
      letter-spacing: 1px;
    }
    
    .company-info {
      font-size: 11px;
      color: #666;
      margin-top: 4px;
      line-height: 1.5;
    }
    
    .receipt-title {
      text-align: center;
      font-size: 14px;
      font-weight: 600;
      color: #fff;
      background: #1e3a5f;
      padding: 6px;
      margin: 12px 0;
      border-radius: 4px;
      letter-spacing: 2px;
      text-transform: uppercase;
    }
    
    .receipt-number {
      text-align: center;
      font-size: 11px;
      color: #666;
      margin-bottom: 12px;
    }
    
    .section {
      margin-bottom: 10px;
    }
    
    .row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 4px 0;
      font-size: 12px;
      border-bottom: 1px dotted #eee;
    }
    
    .row:last-child { border-bottom: none; }
    
    .label { color: #666; font-weight: 400; }
    .value { font-weight: 600; color: #1a1a1a; text-align: right; max-width: 55%; }
    
    .divider {
      border: none;
      border-top: 2px dashed #ddd;
      margin: 10px 0;
    }
    
    .total-section {
      background: #f0f4ff;
      border-radius: 6px;
      padding: 10px;
      margin: 10px 0;
    }
    
    .total-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 3px 0;
      font-size: 12px;
    }
    
    .total-final {
      font-size: 16px;
      font-weight: 700;
      color: #1e3a5f;
      padding-top: 8px;
      border-top: 1px solid #c0cfe8;
      margin-top: 6px;
    }
    
    .amount-words {
      font-size: 11px;
      color: #666;
      font-style: italic;
      text-align: center;
      margin: 8px 0;
    }
    
    .status-badge {
      display: inline-block;
      background: #10b981;
      color: white;
      padding: 3px 10px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 600;
    }
    
    .footer {
      text-align: center;
      border-top: 2px dashed #1e3a5f;
      padding-top: 10px;
      margin-top: 10px;
    }
    
    .footer-text {
      font-size: 10px;
      color: #999;
      line-height: 1.6;
    }
    
    .barcode-area {
      text-align: center;
      margin: 8px 0;
      font-family: monospace;
      font-size: 9px;
      letter-spacing: 2px;
      color: #ccc;
    }
    
    @media print {
      body { margin: 0; }
      .receipt { border: none; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="receipt">
    <!-- Header -->
    <div class="header">
      <div class="company-name">🏦 ${companyName}</div>
      <div class="company-info">
        ${companyAddress}<br>
        📞 ${companyPhone}
      </div>
    </div>
    
    <div class="receipt-title">Payment Receipt</div>
    <div class="receipt-number">Receipt No: <strong>${data.receiptNumber}</strong></div>
    
    <!-- Customer Info -->
    <div class="section">
      <div class="row">
        <span class="label">Customer Name</span>
        <span class="value">${data.customerName}</span>
      </div>
      <div class="row">
        <span class="label">Customer ID</span>
        <span class="value">${data.customerId}</span>
      </div>
      <div class="row">
        <span class="label">Mobile</span>
        <span class="value">${data.mobile}</span>
      </div>
      <div class="row">
        <span class="label">Payment Date</span>
        <span class="value">${data.paymentDate}</span>
      </div>
    </div>
    
    <hr class="divider">
    
    <!-- Loan Info -->
    <div class="section">
      <div class="row">
        <span class="label">Loan Number</span>
        <span class="value">${data.loanNumber}</span>
      </div>
      <div class="row">
        <span class="label">Loan Type</span>
        <span class="value">${data.loanType}</span>
      </div>
      <div class="row">
        <span class="label">Loan Amount</span>
        <span class="value">₹${data.loanAmount.toLocaleString('en-IN')}</span>
      </div>
      <div class="row">
        <span class="label">Installment No.</span>
        <span class="value">#${data.installmentNo}</span>
      </div>
      <div class="row">
        <span class="label">Payment Mode</span>
        <span class="value">${data.paymentMode}</span>
      </div>
    </div>
    
    <hr class="divider">
    
    <!-- Payment Details -->
    <div class="total-section">
      <div class="total-row">
        <span>Amount</span>
        <span>₹${data.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
      </div>
      ${data.fineAmount > 0 ? `
      <div class="total-row" style="color: #dc2626;">
        <span>Late Fine</span>
        <span>₹${data.fineAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
      </div>` : ''}
      <div class="total-row total-final">
        <span>TOTAL PAID</span>
        <span>₹${data.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
      </div>
    </div>
    
    <div class="amount-words">
      <em>Amount in words: ${numberToWords(data.totalAmount)} Rupees Only</em>
    </div>
    
    <div style="text-align: center; margin: 8px 0;">
      <span class="status-badge">✓ PAYMENT RECEIVED</span>
    </div>
    
    ${data.agentName ? `
    <div class="row" style="font-size: 11px; margin-top: 8px;">
      <span class="label">Collected By</span>
      <span class="value">${data.agentName}</span>
    </div>` : ''}
    
    ${data.notes ? `
    <div style="font-size: 11px; color: #666; margin-top: 8px; padding: 6px; background: #f9fafb; border-radius: 4px;">
      <strong>Notes:</strong> ${data.notes}
    </div>` : ''}
    
    <!-- Barcode-like -->
    <div class="barcode-area">
      ||||||||| ${data.receiptNumber} |||||||||
    </div>
    
    <!-- Footer -->
    <div class="footer">
      <div class="footer-text">
        Thank you for your payment!<br>
        This is a computer-generated receipt.<br>
        No signature required.<br>
        For queries: info@microfinancepro.com
      </div>
    </div>
  </div>
  
  <div class="no-print" style="text-align:center; margin:20px; font-family: Arial; font-size:14px; color:#666;">
    <button onclick="window.print()" style="background:#1e3a5f;color:white;border:none;padding:10px 24px;border-radius:6px;cursor:pointer;font-size:14px;">
      🖨️ Print Receipt
    </button>
    &nbsp;
    <button onclick="window.close()" style="background:#6b7280;color:white;border:none;padding:10px 24px;border-radius:6px;cursor:pointer;font-size:14px;">
      Close
    </button>
  </div>
</body>
</html>
  `;
}

function numberToWords(amount: number): string {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const numToWords = (n: number): string => {
    if (n < 20) return ones[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
    if (n < 1000) return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + numToWords(n % 100) : '');
    if (n < 100000) return numToWords(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + numToWords(n % 1000) : '');
    if (n < 10000000) return numToWords(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + numToWords(n % 100000) : '');
    return numToWords(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 ? ' ' + numToWords(n % 10000000) : '');
  };

  const intAmount = Math.floor(amount);
  return numToWords(intAmount) || 'Zero';
}
