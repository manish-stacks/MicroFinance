'use client';
// src/components/forms/LoanFormModal.tsx
import { useState, useEffect } from 'react';
import { loansApi, partiesApi } from '@/lib/api';
import { X, Calculator } from 'lucide-react';

interface Props { onClose: () => void; onSaved: () => void; }

export default function LoanFormModal({ onClose, onSaved }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [parties, setParties] = useState<any[]>([]);
  const [partySearch, setPartySearch] = useState('');

  const [form, setForm] = useState({
    partyId: '', loanType: 'SIMPLE', loanAmount: '', startDate: new Date().toISOString().split('T')[0],
    fileCharges: '0', remarks: '',
    // Simple
    installmentType: 'DAILY', installmentAmount: '', totalInstallments: '', lateFine: '0',
    // Monthly
    monthlyInterest: '',
    // Recurring
    depositAmount: '', returnPercent: '', recurringInstallments: '', recurringType: 'DAILY',
  });

  // Auto-calc for simple loan
  const totalPayable = form.loanType === 'SIMPLE' && form.installmentAmount && form.totalInstallments
    ? (Number(form.installmentAmount) * Number(form.totalInstallments) + Number(form.fileCharges || 0))
    : 0;

  const maturityAmount = form.loanType === 'RECURRING' && form.depositAmount && form.recurringInstallments && form.returnPercent
    ? (() => {
        const total = Number(form.depositAmount) * Number(form.recurringInstallments);
        return total + (total * Number(form.returnPercent) / 100);
      })()
    : 0;

  useEffect(() => {
    partiesApi.list({ limit: '100', search: partySearch }).then(d => setParties(d.parties)).catch(() => {});
  }, [partySearch]);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const payload: any = {
        partyId: form.partyId, loanType: form.loanType,
        loanAmount: Number(form.loanAmount), startDate: form.startDate,
        fileCharges: Number(form.fileCharges), remarks: form.remarks,
      };
      if (form.loanType === 'SIMPLE') {
        payload.installmentType = form.installmentType;
        payload.installmentAmount = Number(form.installmentAmount);
        payload.totalInstallments = Number(form.totalInstallments);
        payload.lateFine = Number(form.lateFine);
      } else if (form.loanType === 'MONTHLY_INTEREST') {
        payload.monthlyInterest = Number(form.monthlyInterest);
      } else {
        payload.installmentType = form.recurringType;
        payload.depositAmount = Number(form.depositAmount);
        payload.totalInstallments = Number(form.recurringInstallments);
        payload.returnPercent = Number(form.returnPercent);
        payload.loanAmount = 0;
      }
      await loansApi.create(payload);
      onSaved();
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  const Input = ({ label, field, type = 'text', placeholder = '' }: any) => (
    <div>
      <label className="form-label">{label}</label>
      <input type={type} value={(form as any)[field] || ''} onChange={e => set(field, e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 backdrop-blur-sm overflow-y-auto py-8">
      <div className="bg-card w-full max-w-2xl mx-4 rounded-2xl border shadow-2xl">
        <div className="flex items-center justify-between px-6 py-5 border-b">
          <h2 className="font-bold text-lg">Create New Loan</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm dark:bg-red-950/30 dark:border-red-800 dark:text-red-400">{error}</div>}

          {/* Party Selection */}
          <div>
            <label className="form-label">Customer / Party <span className="text-red-500">*</span></label>
            <input
              className="w-full px-3 py-2.5 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 mb-2"
              placeholder="Search customer..."
              value={partySearch}
              onChange={e => setPartySearch(e.target.value)}
            />
            <select
              required
              value={form.partyId}
              onChange={e => set('partyId', e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="">Select customer...</option>
              {parties.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.customerId}) — {p.mobile1}</option>
              ))}
            </select>
          </div>

          {/* Loan Type */}
          <div>
            <label className="form-label">Loan Type <span className="text-red-500">*</span></label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'SIMPLE', label: 'Simple Loan', desc: 'Fixed EMI schedule' },
                { value: 'MONTHLY_INTEREST', label: 'Monthly Interest', desc: 'Interest-only payments' },
                { value: 'RECURRING', label: 'Recurring Deposit', desc: 'Regular savings plan' },
              ].map(t => (
                <button key={t.value} type="button" onClick={() => set('loanType', t.value)}
                  className={`p-3 rounded-xl border text-left transition-all ${form.loanType === t.value ? 'border-primary bg-primary/5 ring-2 ring-primary/20' : 'hover:border-border'}`}>
                  <p className="text-sm font-semibold">{t.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{t.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {form.loanType !== 'RECURRING' && <Input label="Loan Amount (₹)" field="loanAmount" type="number" placeholder="50000" />}
            <Input label="Start Date" field="startDate" type="date" />
            <Input label="File Charges (₹)" field="fileCharges" type="number" placeholder="0" />
          </div>

          {/* Simple Loan Fields */}
          {form.loanType === 'SIMPLE' && (
            <div className="space-y-4 pt-2 border-t">
              <p className="text-sm font-semibold text-muted-foreground">Simple Loan Configuration</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Installment Frequency</label>
                  <select value={form.installmentType} onChange={e => set('installmentType', e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                    <option value="DAILY">Daily</option>
                    <option value="WEEKLY">Weekly</option>
                    <option value="MONTHLY">Monthly</option>
                    <option value="YEARLY">Yearly</option>
                  </select>
                </div>
                <Input label="Installment Amount (₹)" field="installmentAmount" type="number" placeholder="400" />
                <Input label="Total Installments" field="totalInstallments" type="number" placeholder="30" />
                <Input label="Late Fine per Day (₹)" field="lateFine" type="number" placeholder="50" />
              </div>
              {totalPayable > 0 && (
                <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-2 mb-2">
                    <Calculator className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">Auto Calculation</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground text-xs">Loan Amount</p>
                      <p className="font-bold currency">₹{Number(form.loanAmount || 0).toLocaleString('en-IN')}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Total Installments</p>
                      <p className="font-bold">{form.totalInstallments} × ₹{Number(form.installmentAmount).toLocaleString('en-IN')}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Total Payable</p>
                      <p className="font-bold text-blue-700 dark:text-blue-300 currency">₹{totalPayable.toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Monthly Interest Fields */}
          {form.loanType === 'MONTHLY_INTEREST' && (
            <div className="space-y-4 pt-2 border-t">
              <p className="text-sm font-semibold text-muted-foreground">Monthly Interest Configuration</p>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Monthly Interest Amount (₹)" field="monthlyInterest" type="number" placeholder="3000" />
              </div>
              {form.loanAmount && form.monthlyInterest && (
                <div className="p-4 rounded-xl bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800 text-sm">
                  <p className="font-semibold text-violet-700 dark:text-violet-300 mb-1">Interest Rate</p>
                  <p className="text-muted-foreground">
                    {((Number(form.monthlyInterest) / Number(form.loanAmount)) * 100).toFixed(2)}% per month on ₹{Number(form.loanAmount).toLocaleString('en-IN')}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Principal can be closed anytime. Only interest is collected monthly.</p>
                </div>
              )}
            </div>
          )}

          {/* Recurring Fields */}
          {form.loanType === 'RECURRING' && (
            <div className="space-y-4 pt-2 border-t">
              <p className="text-sm font-semibold text-muted-foreground">Recurring Deposit Configuration</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Deposit Frequency</label>
                  <select value={form.recurringType} onChange={e => set('recurringType', e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                    <option value="DAILY">Daily</option>
                    <option value="WEEKLY">Weekly</option>
                    <option value="MONTHLY">Monthly</option>
                  </select>
                </div>
                <Input label="Deposit Amount (₹)" field="depositAmount" type="number" placeholder="200" />
                <Input label="Total Installments" field="recurringInstallments" type="number" placeholder="100" />
                <Input label="Return % (on total deposit)" field="returnPercent" type="number" placeholder="15" />
              </div>
              {maturityAmount > 0 && (
                <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground text-xs">Total Deposit</p>
                      <p className="font-bold currency">₹{(Number(form.depositAmount) * Number(form.recurringInstallments)).toLocaleString('en-IN')}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Return ({form.returnPercent}%)</p>
                      <p className="font-bold currency">₹{((Number(form.depositAmount) * Number(form.recurringInstallments)) * Number(form.returnPercent) / 100).toLocaleString('en-IN')}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Maturity Amount</p>
                      <p className="font-bold text-amber-700 dark:text-amber-300 currency">₹{maturityAmount.toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <div>
            <label className="form-label">Remarks</label>
            <textarea value={form.remarks} onChange={e => set('remarks', e.target.value)} rows={2}
              className="w-full px-3 py-2.5 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
          </div>

          <div className="flex gap-3 justify-end pt-2 border-t">
            <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-lg border text-sm hover:bg-muted">Cancel</button>
            <button type="submit" disabled={loading}
              className="px-6 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 disabled:opacity-60">
              {loading ? 'Creating...' : 'Create Loan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
