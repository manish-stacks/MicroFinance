'use client';
// src/components/forms/PaymentModal.tsx
import { useState, useEffect } from 'react';
import { paymentsApi } from '@/lib/api';
import { X, DollarSign, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';

interface Props {
  loanId: string;
  installment?: any;
  lateFine?: number;
  onClose: () => void;
  onPaid: () => void;
}

export default function PaymentModal({ loanId, installment, lateFine = 0, onClose, onPaid }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [amount, setAmount] = useState(installment ? String(Number(installment.amount)) : '');
  const [paymentMode, setPaymentMode] = useState('CASH');
  const [notes, setNotes] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);

  const daysOverdue = installment
    ? Math.max(0, Math.floor((Date.now() - new Date(installment.dueDate).getTime()) / 86400000))
    : 0;
  const fineAmount = daysOverdue * lateFine;
  const totalAmount = Number(amount || 0) + fineAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await paymentsApi.create({
        loanId,
        installmentId: installment?.id,
        amount: Number(amount),
        paymentMode,
        notes,
        paymentDate,
      });
      onPaid();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-card w-full max-w-md mx-4 rounded-2xl border shadow-2xl">
        <div className="flex items-center justify-between px-6 py-5 border-b">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="font-bold">Record Payment</h2>
              {installment && <p className="text-xs text-muted-foreground">Installment #{installment.installmentNo}</p>}
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm dark:bg-red-950/30 dark:border-red-900 dark:text-red-400">{error}</div>
          )}

          {installment && (
            <div className="p-4 rounded-xl bg-muted/50 border text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Due Date</span>
                <span className="font-medium">{format(new Date(installment.dueDate), 'dd MMM yyyy')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Due Amount</span>
                <span className="font-medium currency">₹{Number(installment.amount).toLocaleString('en-IN')}</span>
              </div>
              {daysOverdue > 0 && (
                <div className="flex justify-between text-red-600">
                  <span className="flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Overdue by</span>
                  <span className="font-medium">{daysOverdue} days</span>
                </div>
              )}
            </div>
          )}

          <div>
            <label className="form-label">Payment Amount (₹) <span className="text-red-500">*</span></label>
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              required
              min="1"
              className="w-full px-3 py-2.5 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="form-label">Payment Date</label>
            <input
              type="date"
              value={paymentDate}
              onChange={e => setPaymentDate(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div>
            <label className="form-label">Payment Mode</label>
            <select
              value={paymentMode}
              onChange={e => setPaymentMode(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="CASH">Cash</option>
              <option value="UPI">UPI</option>
              <option value="BANK_TRANSFER">Bank Transfer</option>
              <option value="CHEQUE">Cheque</option>
              <option value="NEFT">NEFT</option>
            </select>
          </div>

          <div>
            <label className="form-label">Notes</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={2}
              className="w-full px-3 py-2.5 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
              placeholder="Optional notes..."
            />
          </div>

          {/* Summary */}
          {Number(amount) > 0 && (
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment Amount</span>
                <span className="currency">₹{Number(amount).toLocaleString('en-IN')}</span>
              </div>
              {fineAmount > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>Late Fine ({daysOverdue}d × ₹{lateFine})</span>
                  <span className="currency">₹{fineAmount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-emerald-700 dark:text-emerald-400 border-t pt-2">
                <span>Total Collected</span>
                <span className="currency">₹{totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-lg border text-sm hover:bg-muted">Cancel</button>
            <button type="submit" disabled={loading}
              className="flex-1 py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 disabled:opacity-60">
              {loading ? 'Recording...' : 'Confirm Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
