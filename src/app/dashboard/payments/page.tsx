'use client';
import { useEffect, useState, useCallback } from 'react';
import { paymentsApi, reportsApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import Header from '@/components/layout/Header';
import { format } from 'date-fns';
import { DollarSign, Printer, ChevronLeft, ChevronRight, Download } from 'lucide-react';

export default function PaymentsPage() {
  const { user } = useAuthStore();
  const [payments, setPayments] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [agentFilter, setAgentFilter] = useState('');
  const [totalAmount, setTotalAmount] = useState(0);

  const getToken = () => { try { return JSON.parse(localStorage.getItem('auth-storage')||'{}')?.state?.token||'' } catch { return '' } };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string,string> = { page: String(page), limit: '15' };
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (agentFilter) params.agentId = agentFilter;
      const data = await paymentsApi.list(params);
      setPayments(data.payments); setTotal(data.total); setTotalPages(data.totalPages);
      // Calculate total from visible page
      const amt = data.payments.reduce((s:number,p:any)=>s+Number(p.totalAmount||0),0);
      setTotalAmount(amt);
    } catch(e) { console.error(e); } finally { setLoading(false); }
  }, [page, startDate, endDate, agentFilter]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    if (user?.role !== 'AGENT') {
      fetch('/api/agents', { headers:{ Authorization:`Bearer ${getToken()}` } })
        .then(r=>r.json()).then(d=>setAgents(d.agents||[])).catch(()=>{});
    }
  }, [user]);

  const exportExcel = () => {
    const p: Record<string,string> = { type:'collection' };
    if (startDate) p.startDate = startDate;
    if (endDate) p.endDate = endDate;
    if (agentFilter) p.agentId = agentFilter;
    reportsApi.exportExcel(p);
  };

  return (
    <div>
      <Header title="Payments & Collections" subtitle={`${total} records`} />
      <div className="p-6 space-y-5">
        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">From</label>
            <input type="date" value={startDate} onChange={e=>{setStartDate(e.target.value);setPage(1);}} className="px-3 py-2.5 rounded-lg border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"/>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">To</label>
            <input type="date" value={endDate} onChange={e=>{setEndDate(e.target.value);setPage(1);}} className="px-3 py-2.5 rounded-lg border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"/>
          </div>
          {user?.role !== 'AGENT' && agents.length > 0 && (
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Agent</label>
              <select value={agentFilter} onChange={e=>{setAgentFilter(e.target.value);setPage(1);}} className="px-3 py-2.5 rounded-lg border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                <option value="">All Agents</option>
                {agents.map(a=><option key={a.id} value={a.id}>{a.name} ({a.agentCode})</option>)}
              </select>
            </div>
          )}
          {(startDate||endDate||agentFilter) && (
            <button onClick={()=>{setStartDate('');setEndDate('');setAgentFilter('');setPage(1);}} className="px-3 py-2.5 rounded-lg border text-sm hover:bg-muted text-muted-foreground">Clear</button>
          )}
          <button onClick={exportExcel} className="flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium hover:bg-muted text-emerald-600 border-emerald-200 ml-auto">
            <Download className="w-4 h-4"/> Export Excel
          </button>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-card rounded-xl border p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center"><DollarSign className="w-5 h-5"/></div>
            <div><p className="text-xs text-muted-foreground">Page Total</p><p className="font-bold">₹{totalAmount.toLocaleString('en-IN')}</p></div>
          </div>
          <div className="bg-card rounded-xl border p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center"><Printer className="w-5 h-5"/></div>
            <div><p className="text-xs text-muted-foreground">Total Records</p><p className="font-bold">{total}</p></div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center h-48"><div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full"/></div>
            ) : payments.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground"><DollarSign className="w-12 h-12 mx-auto mb-3 opacity-20"/><p>No payments found</p></div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    {['Receipt No.','Date','Customer','Loan No.','EMI#','Amount','Fine','Total','Mode','Agent','Receipt'].map(h=>(
                      <th key={h} className="text-left text-xs font-semibold text-muted-foreground px-4 py-3 bg-muted/50">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {payments.map(p=>(
                    <tr key={p.id} className="border-b border-border/30 hover:bg-accent/20">
                      <td className="px-4 py-2.5 font-mono text-xs">{p.receiptNumber}</td>
                      <td className="px-4 py-2.5 whitespace-nowrap">{format(new Date(p.paymentDate),'dd MMM yyyy')}</td>
                      <td className="px-4 py-2.5"><p className="font-medium">{p.loan?.party?.name}</p><p className="text-xs text-muted-foreground">{p.loan?.party?.customerId}</p></td>
                      <td className="px-4 py-2.5 font-mono text-xs">{p.loan?.loanNumber}</td>
                      <td className="px-4 py-2.5 text-center">{p.installment?.installmentNo||'—'}</td>
                      <td className="px-4 py-2.5">₹{Number(p.amount).toLocaleString('en-IN')}</td>
                      <td className="px-4 py-2.5 text-red-600">{Number(p.fineAmount)>0?`₹${Number(p.fineAmount).toLocaleString('en-IN')}`:'-'}</td>
                      <td className="px-4 py-2.5 font-bold text-emerald-600">₹{Number(p.totalAmount).toLocaleString('en-IN')}</td>
                      <td className="px-4 py-2.5"><span className="text-xs bg-muted px-2 py-0.5 rounded">{p.paymentMode}</span></td>
                      <td className="px-4 py-2.5">{p.agent?.name||'—'}</td>
                      <td className="px-4 py-2.5">
                        <a href={paymentsApi.getReceiptUrl(p.id)} target="_blank" rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-muted hover:bg-accent text-muted-foreground">
                          <Printer className="w-3 h-3"/> Print
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          {totalPages > 1 && (
            <div className="px-5 py-3 border-t flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Page {page} of {totalPages} ({total} total)</span>
              <div className="flex gap-1">
                <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1} className="p-2 rounded-lg hover:bg-muted disabled:opacity-40"><ChevronLeft className="w-4 h-4"/></button>
                <button onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages} className="p-2 rounded-lg hover:bg-muted disabled:opacity-40"><ChevronRight className="w-4 h-4"/></button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
