'use client';
import { useState, useEffect } from 'react';
import { reportsApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import Header from '@/components/layout/Header';
import { BarChart3, Download, AlertTriangle, TrendingUp, Banknote } from 'lucide-react';
import { format } from 'date-fns';

const TYPES = [
  { value:'collection', label:'Collection Report', icon:TrendingUp, color:'bg-emerald-100 text-emerald-600' },
  { value:'loans', label:'Loan Report', icon:Banknote, color:'bg-blue-100 text-blue-600' },
  { value:'overdue', label:'Overdue Report', icon:AlertTriangle, color:'bg-red-100 text-red-600' },
];

export default function ReportsPage() {
  const { user } = useAuthStore();
  const [agents, setAgents] = useState<any[]>([]);
  const [type, setType] = useState('collection');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [agentId, setAgentId] = useState('');
  const [loanType, setLoanType] = useState('');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);

  const getToken = () => { try { return JSON.parse(localStorage.getItem('auth-storage')||'{}')?.state?.token||'' } catch { return '' } };

  useEffect(() => {
    if (user?.role !== 'AGENT') {
      fetch('/api/agents', { headers: { Authorization:`Bearer ${getToken()}` } })
        .then(r=>r.json()).then(d=>setAgents(d.agents||[])).catch(()=>{});
    }
  }, [user]);

  const generate = async () => {
    setLoading(true);
    try {
      const p: Record<string,string> = { type };
      if (startDate) p.startDate = startDate;
      if (endDate) p.endDate = endDate;
      if (agentId) p.agentId = agentId;
      if (loanType) p.loanType = loanType;
      const res = await reportsApi.get(p);
      setData(res.data||[]); setGenerated(true);
    } catch(e) { console.error(e); } finally { setLoading(false); }
  };

  const exportExcel = () => {
    const p: Record<string,string> = { type };
    if (startDate) p.startDate = startDate;
    if (endDate) p.endDate = endDate;
    if (agentId) p.agentId = agentId;
    if (loanType) p.loanType = loanType;
    reportsApi.exportExcel(p);
  };

  const totalAmt = data.reduce((s:number,r:any)=>{
    if(type==='collection') return s+Number(r.totalAmount||0);
    if(type==='loans') return s+Number(r.loanAmount||0);
    if(type==='overdue') return s+Number(r.amount||0);
    return s;
  }, 0);

  return (
    <div>
      <Header title="Reports" subtitle="Generate and export financial reports" />
      <div className="p-6 space-y-5">
        {/* Type Selector */}
        <div className="grid grid-cols-3 gap-4">
          {TYPES.map(t=>(
            <button key={t.value} onClick={()=>{setType(t.value);setGenerated(false);setData([]);}}
              className={`bg-card rounded-xl border p-4 text-left transition-all hover:shadow-md ${type===t.value?'border-primary ring-2 ring-primary/20':''}`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${t.color}`}><t.icon className="w-5 h-5"/></div>
              <p className="font-semibold text-sm">{t.label}</p>
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-card rounded-xl border p-5">
          <h3 className="font-semibold mb-4">Filters</h3>
          <div className="flex flex-wrap gap-4 items-end">
            {type !== 'overdue' && (
              <>
                <div><label className="block text-sm font-medium mb-1.5">Start Date</label>
                  <input type="date" value={startDate} onChange={e=>setStartDate(e.target.value)} className="px-3 py-2.5 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"/>
                </div>
                <div><label className="block text-sm font-medium mb-1.5">End Date</label>
                  <input type="date" value={endDate} onChange={e=>setEndDate(e.target.value)} className="px-3 py-2.5 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"/>
                </div>
              </>
            )}
            {/* Agent Filter - for all report types */}
            {user?.role !== 'AGENT' && agents.length > 0 && (
              <div><label className="block text-sm font-medium mb-1.5">Filter by Agent</label>
                <select value={agentId} onChange={e=>setAgentId(e.target.value)} className="px-3 py-2.5 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                  <option value="">All Agents</option>
                  {agents.map(a=><option key={a.id} value={a.id}>{a.name} ({a.agentCode})</option>)}
                </select>
              </div>
            )}
            {type === 'loans' && (
              <div><label className="block text-sm font-medium mb-1.5">Loan Type</label>
                <select value={loanType} onChange={e=>setLoanType(e.target.value)} className="px-3 py-2.5 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                  <option value="">All Types</option>
                  <option value="SIMPLE">Simple</option>
                  <option value="MONTHLY_INTEREST">Monthly Interest</option>
                  <option value="RECURRING">Recurring</option>
                </select>
              </div>
            )}
            <button onClick={generate} disabled={loading} className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-60">
              <BarChart3 className="w-4 h-4"/>{loading?'Generating...':'Generate Report'}
            </button>
            {generated && data.length > 0 && (
              <button onClick={exportExcel} className="flex items-center gap-2 px-5 py-2.5 border rounded-lg text-sm font-medium hover:bg-muted text-emerald-600 border-emerald-200">
                <Download className="w-4 h-4"/> Export Excel
              </button>
            )}
          </div>
        </div>

        {/* Results */}
        {generated && (
          <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b flex items-center justify-between">
              <div>
                <h3 className="font-semibold">{TYPES.find(t=>t.value===type)?.label}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{data.length} records</p>
              </div>
              {data.length > 0 && (
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Total Amount</p>
                  <p className="font-bold text-xl">₹{totalAmt.toLocaleString('en-IN')}</p>
                </div>
              )}
            </div>
            <div className="overflow-x-auto">
              {data.length === 0 ? (
                <p className="text-center text-muted-foreground py-10">No data found for the selected filters</p>
              ) : type === 'collection' ? (
                <table className="w-full text-sm">
                  <thead><tr className="border-b">{['Receipt','Date','Customer','Loan No','EMI#','Amount','Fine','Total','Mode','Agent'].map(h=><th key={h} className="text-left text-xs font-semibold text-muted-foreground px-4 py-3 bg-muted/50">{h}</th>)}</tr></thead>
                  <tbody>
                    {data.map((r:any,i:number)=>(
                      <tr key={i} className="border-b border-border/30 hover:bg-accent/20">
                        <td className="px-4 py-2.5 font-mono text-xs">{r.receiptNumber}</td>
                        <td className="px-4 py-2.5">{r.paymentDate?format(new Date(r.paymentDate),'dd MMM yyyy'):'—'}</td>
                        <td className="px-4 py-2.5"><p className="font-medium">{r.loan?.party?.name}</p><p className="text-xs text-muted-foreground">{r.loan?.party?.customerId}</p></td>
                        <td className="px-4 py-2.5 font-mono text-xs">{r.loan?.loanNumber}</td>
                        <td className="px-4 py-2.5 text-center">{r.installment?.installmentNo||'—'}</td>
                        <td className="px-4 py-2.5">₹{Number(r.amount).toLocaleString('en-IN')}</td>
                        <td className="px-4 py-2.5 text-red-600">{Number(r.fineAmount)>0?`₹${Number(r.fineAmount).toLocaleString('en-IN')}`:'-'}</td>
                        <td className="px-4 py-2.5 font-bold text-emerald-600">₹{Number(r.totalAmount).toLocaleString('en-IN')}</td>
                        <td className="px-4 py-2.5"><span className="text-xs bg-muted px-2 py-0.5 rounded">{r.paymentMode}</span></td>
                        <td className="px-4 py-2.5">{r.agent?.name||'—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : type === 'loans' ? (
                <table className="w-full text-sm">
                  <thead><tr className="border-b">{['Loan No','Customer','Type','Amount','Status','Start Date','Paid','Agent'].map(h=><th key={h} className="text-left text-xs font-semibold text-muted-foreground px-4 py-3 bg-muted/50">{h}</th>)}</tr></thead>
                  <tbody>
                    {data.map((r:any,i:number)=>(
                      <tr key={i} className="border-b border-border/30 hover:bg-accent/20">
                        <td className="px-4 py-2.5 font-mono text-xs">{r.loanNumber}</td>
                        <td className="px-4 py-2.5"><p className="font-medium">{r.party?.name}</p><p className="text-xs text-muted-foreground">{r.party?.customerId}</p></td>
                        <td className="px-4 py-2.5"><span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">{r.loanType.replace('_',' ')}</span></td>
                        <td className="px-4 py-2.5 font-bold">₹{Number(r.loanAmount).toLocaleString('en-IN')}</td>
                        <td className="px-4 py-2.5"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${r.status==='ACTIVE'?'bg-emerald-100 text-emerald-700':r.status==='OVERDUE'?'bg-red-100 text-red-700':'bg-gray-100 text-gray-600'}`}>{r.status}</span></td>
                        <td className="px-4 py-2.5">{format(new Date(r.startDate),'dd MMM yyyy')}</td>
                        <td className="px-4 py-2.5 text-emerald-600 font-medium">₹{Number(r.totalPaid).toLocaleString('en-IN')}</td>
                        <td className="px-4 py-2.5">{r.party?.agent?.name||'—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <table className="w-full text-sm">
                  <thead><tr className="border-b">{['Customer','Loan No','EMI#','Due Date','Amount','Days Overdue','Agent'].map(h=><th key={h} className="text-left text-xs font-semibold text-muted-foreground px-4 py-3 bg-muted/50">{h}</th>)}</tr></thead>
                  <tbody>
                    {data.map((r:any,i:number)=>{
                      const days = Math.floor((Date.now()-new Date(r.dueDate).getTime())/86400000);
                      return (
                        <tr key={i} className="border-b border-border/30 hover:bg-accent/20">
                          <td className="px-4 py-2.5"><p className="font-medium">{r.loan?.party?.name}</p><p className="text-xs text-muted-foreground">{r.loan?.party?.customerId}</p></td>
                          <td className="px-4 py-2.5 font-mono text-xs">{r.loan?.loanNumber}</td>
                          <td className="px-4 py-2.5 text-center">{r.installmentNo}</td>
                          <td className="px-4 py-2.5">{format(new Date(r.dueDate),'dd MMM yyyy')}</td>
                          <td className="px-4 py-2.5 font-bold text-red-600">₹{Number(r.amount).toLocaleString('en-IN')}</td>
                          <td className="px-4 py-2.5"><span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">{days}d</span></td>
                          <td className="px-4 py-2.5">{r.loan?.party?.agent?.name||'—'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
