'use client';
// src/app/dashboard/collection/page.tsx
import { useEffect, useState } from 'react';
import { paymentsApi, loansApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import Header from '@/components/layout/Header';
import PaymentModal from '@/components/forms/PaymentModal';
import { format, startOfDay, endOfDay } from 'date-fns';
import { ClipboardList, Phone, MapPin, DollarSign, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function CollectionPage() {
  const { user } = useAuthStore();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPayment, setShowPayment] = useState(false);
  const [selected, setSelected] = useState<any>(null);

  const load = async () => {
    setLoading(true);
    try {
      // Get installments due on selected date
      const params: Record<string, string> = { startDate: date, endDate: date, limit: '100' };
      if (user?.role === 'AGENT') params.agentId = user.id;
      const data = await paymentsApi.list(params);
      setItems(data.payments || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  // Actually fetch due installments, not payments
  const [dueInstallments, setDueInstallments] = useState<any[]>([]);

  const loadDue = async () => {
    setLoading(true);
    try {
      // Fetch overdue + pending for agent
      const params: Record<string, string> = { status: 'OVERDUE', limit: '200' };
      // This is a simplified fetch - in production you'd have a dedicated endpoint
      const loansData = await loansApi.list({ limit: '200', status: 'ACTIVE' });
      const allInst: any[] = [];
      for (const loan of loansData.loans || []) {
        if (loan.installments) {
          loan.installments.forEach((inst: any) => {
            if (['PENDING', 'OVERDUE'].includes(inst.status)) {
              const dueDate = new Date(inst.dueDate).toISOString().split('T')[0];
              if (dueDate <= date) {
                allInst.push({ ...inst, loan });
              }
            }
          });
        }
      }
      setDueInstallments(allInst);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadDue(); }, [date]);

  const totalDue = dueInstallments.reduce((s, i) => s + Number(i.amount), 0);
  const overdueCount = dueInstallments.filter(i => i.status === 'OVERDUE').length;

  return (
    <div>
      <Header title="Collection Sheet" subtitle="Track daily EMI collections" />
      <div className="p-6 space-y-5">
        {/* Date Selector */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Collection Date:</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)}
              className="px-3 py-2.5 rounded-lg border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
          <span className="text-sm text-muted-foreground">
            Showing dues up to {format(new Date(date), 'dd MMM yyyy')}
          </span>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-4">
          <div className="stat-card flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <ClipboardList className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Due</p>
              <p className="font-bold currency">₹{totalDue.toLocaleString('en-IN')}</p>
            </div>
          </div>
          <div className="stat-card flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Pending</p>
              <p className="font-bold">{dueInstallments.filter(i => i.status === 'PENDING').length}</p>
            </div>
          </div>
          <div className="stat-card flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Overdue</p>
              <p className="font-bold text-red-600">{overdueCount}</p>
            </div>
          </div>
        </div>

        {/* Collection List */}
        <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b">
            <h3 className="font-semibold">Due Installments ({dueInstallments.length})</h3>
          </div>
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          ) : dueInstallments.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-emerald-500 opacity-50" />
              <p className="font-medium">All clear! No dues for this date.</p>
            </div>
          ) : (
            <div className="divide-y">
              {dueInstallments.map((inst, idx) => {
                const daysOverdue = inst.status === 'OVERDUE'
                  ? Math.floor((Date.now() - new Date(inst.dueDate).getTime()) / 86400000)
                  : 0;
                return (
                  <div key={inst.id} className="px-5 py-4 flex items-center justify-between hover:bg-accent/20 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                        {idx + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-sm">{inst.loan?.party?.name}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${inst.status === 'OVERDUE' ? 'badge-overdue' : 'badge-pending'}`}>
                            {inst.status}
                          </span>
                          {daysOverdue > 0 && <span className="text-xs text-red-500">{daysOverdue}d overdue</span>}
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Phone className="w-3 h-3" />{inst.loan?.party?.mobile1}
                          </span>
                          {inst.loan?.party?.city && (
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <MapPin className="w-3 h-3" />{inst.loan.party.city}
                            </span>
                          )}
                          <span className="text-xs text-muted-foreground font-mono">{inst.loan?.loanNumber}</span>
                          <span className="text-xs text-muted-foreground">EMI #{inst.installmentNo}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Due: {format(new Date(inst.dueDate), 'dd MMM yyyy')}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="font-bold currency text-sm">₹{Number(inst.amount).toLocaleString('en-IN')}</p>
                        {daysOverdue > 0 && inst.loan?.lateFine && (
                          <p className="text-xs text-red-500">+₹{(daysOverdue * Number(inst.loan.lateFine)).toLocaleString('en-IN')} fine</p>
                        )}
                      </div>
                      <button
                        onClick={() => { setSelected({ inst, loan: inst.loan }); setShowPayment(true); }}
                        className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 flex items-center gap-1.5"
                      >
                        <DollarSign className="w-3.5 h-3.5" /> Collect
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {showPayment && selected && (
        <PaymentModal
          loanId={selected.loan.id}
          installment={selected.inst}
          lateFine={Number(selected.loan.lateFine || 0)}
          onClose={() => { setShowPayment(false); setSelected(null); }}
          onPaid={() => { setShowPayment(false); setSelected(null); loadDue(); }}
        />
      )}
    </div>
  );
}
