'use client';
import { useEffect, useState, useCallback } from 'react';
import { loansApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import Header from '@/components/layout/Header';
import LoanFormModal from '@/components/forms/LoanFormModal';
import Link from 'next/link';
import { Search, Plus, Eye, ChevronLeft, ChevronRight, Banknote } from 'lucide-react';
import { format } from 'date-fns';

const TYPE_LABELS: Record<string,string> = { SIMPLE:'Simple', MONTHLY_INTEREST:'Monthly Interest', RECURRING:'Recurring' };

export default function LoansPage() {
  const { user } = useAuthStore();
  const [loans, setLoans] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [agentFilter, setAgentFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const getToken = () => { try { return JSON.parse(localStorage.getItem('auth-storage')||'{}')?.state?.token||'' } catch { return '' } };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string,string> = { page: String(page), limit: '10' };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (typeFilter) params.loanType = typeFilter;
      if (agentFilter) params.agentId = agentFilter;
      const data = await loansApi.list(params);
      setLoans(data.loans); setTotal(data.total); setTotalPages(data.totalPages);
    } catch(e) { console.error(e); } finally { setLoading(false); }
  }, [page, search, statusFilter, typeFilter, agentFilter]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    if (user?.role !== 'AGENT') {
      fetch('/api/agents', { headers: { 'Authorization': `Bearer ${getToken()}` } })
        .then(r => r.json()).then(d => setAgents(d.agents || [])).catch(() => {});
    }
  }, [user]);

  const canCreate = user?.role === 'ADMIN' || user?.role === 'SUB_ADMIN';

  const statusClass = (s: string) => s==='ACTIVE'?'bg-emerald-100 text-emerald-700':s==='OVERDUE'?'bg-red-100 text-red-700':s==='CLOSED'?'bg-gray-100 text-gray-600':'bg-amber-100 text-amber-700';
  const typeClass = (t: string) => t==='SIMPLE'?'bg-blue-100 text-blue-700':t==='MONTHLY_INTEREST'?'bg-violet-100 text-violet-700':'bg-amber-100 text-amber-700';

  return (
    <div>
      <Header title="Loans" subtitle="Manage all loan accounts" />
      <div className="p-6 space-y-5">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input className="w-full pl-9 pr-4 py-2.5 rounded-lg border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="Search loan number, customer..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
          </div>
          <select value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1); }}
            className="px-3 py-2.5 rounded-lg border bg-card text-sm focus:outline-none">
            <option value="">All Types</option>
            <option value="SIMPLE">Simple Loan</option>
            <option value="MONTHLY_INTEREST">Monthly Interest</option>
            <option value="RECURRING">Recurring Deposit</option>
          </select>
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-3 py-2.5 rounded-lg border bg-card text-sm focus:outline-none">
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="CLOSED">Closed</option>
            <option value="OVERDUE">Overdue</option>
          </select>
          {user?.role !== 'AGENT' && agents.length > 0 && (
            <select value={agentFilter} onChange={e => { setAgentFilter(e.target.value); setPage(1); }}
              className="px-3 py-2.5 rounded-lg border bg-card text-sm focus:outline-none">
              <option value="">All Agents</option>
              {agents.map(a => <option key={a.id} value={a.id}>{a.name} ({a.agentCode})</option>)}
            </select>
          )}
          {canCreate && (
            <button onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90">
              <Plus className="w-4 h-4" /> New Loan
            </button>
          )}
        </div>

        <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center h-48"><div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full" /></div>
            ) : loans.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground"><Banknote className="w-12 h-12 mx-auto mb-3 opacity-20" /><p className="font-medium">No loans found</p></div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    {['Loan No.','Customer','Type','Amount','Status','Next Due','Paid','Agent',''].map(h=>(
                      <th key={h} className="text-left text-xs font-semibold text-muted-foreground px-4 py-3 bg-muted/50">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loans.map(loan => (
                    <tr key={loan.id} className="hover:bg-accent/20 border-b border-border/50">
                      <td className="px-4 py-3"><span className="font-mono text-xs bg-muted px-2 py-1 rounded">{loan.loanNumber}</span></td>
                      <td className="px-4 py-3"><p className="font-medium">{loan.party?.name}</p><p className="text-xs text-muted-foreground">{loan.party?.customerId}</p></td>
                      <td className="px-4 py-3"><span className={`text-xs px-2 py-1 rounded-full font-medium ${typeClass(loan.loanType)}`}>{TYPE_LABELS[loan.loanType]}</span></td>
                      <td className="px-4 py-3 font-semibold">₹{Number(loan.loanAmount).toLocaleString('en-IN')}</td>
                      <td className="px-4 py-3"><span className={`text-xs px-2 py-1 rounded-full font-medium ${statusClass(loan.status)}`}>{loan.status}</span></td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">{loan.installments?.[0]?format(new Date(loan.installments[0].dueDate),'dd MMM yy'):'—'}</td>
                      <td className="px-4 py-3 font-semibold text-emerald-600">₹{Number(loan.totalPaid).toLocaleString('en-IN')}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{loan.party?.agent?.name||'—'}</td>
                      <td className="px-4 py-3"><Link href={`/dashboard/loans/${loan.id}`} className="p-2 rounded-lg hover:bg-muted inline-flex text-muted-foreground hover:text-foreground"><Eye className="w-4 h-4" /></Link></td>
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
                <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1} className="p-2 rounded-lg hover:bg-muted disabled:opacity-40"><ChevronLeft className="w-4 h-4" /></button>
                <button onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages} className="p-2 rounded-lg hover:bg-muted disabled:opacity-40"><ChevronRight className="w-4 h-4" /></button>
              </div>
            </div>
          )}
        </div>
      </div>
      {showForm && <LoanFormModal onClose={()=>setShowForm(false)} onSaved={()=>{ setShowForm(false); load(); }} />}
    </div>
  );
}
