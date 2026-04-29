'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { loansApi, paymentsApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import Header from '@/components/layout/Header';
import PaymentModal from '@/components/forms/PaymentModal';
import { format } from 'date-fns';
import { ArrowLeft, DollarSign, CheckCircle2, AlertTriangle, XCircle, Printer, BookOpen, FileText, Users } from 'lucide-react';
import Link from 'next/link';

const SBADGE: Record<string,string> = { PAID:'bg-blue-100 text-blue-700', OVERDUE:'bg-red-100 text-red-700', PENDING:'bg-amber-100 text-amber-700', PARTIAL:'bg-amber-100 text-amber-700' };

export default function LoanDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const [loan, setLoan] = useState<any>(null);
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPayment, setShowPayment] = useState(false);
  const [selectedInst, setSelectedInst] = useState<any>(null);
  const [closing, setClosing] = useState(false);
  const [showAgentModal, setShowAgentModal] = useState(false);
  const [newAgentId, setNewAgentId] = useState('');
  const [changingAgent, setChangingAgent] = useState(false);

  const getToken = () => { try { return JSON.parse(localStorage.getItem('auth-storage')||'{}')?.state?.token||'' } catch { return '' } };

  const load = async () => {
    setLoading(true);
    try { const d = await loansApi.get(id); setLoan(d.loan); }
    catch(e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [id]);
  useEffect(() => {
    if (user?.role !== 'AGENT') {
      fetch('/api/agents', { headers: { Authorization: `Bearer ${getToken()}` } })
        .then(r => r.json()).then(d => setAgents((d.agents||[]).filter((a:any)=>a.isActive && a.role==='AGENT'))).catch(()=>{});
    }
  }, [user]);

  const handleClose = async () => {
    if (!confirm('Close this loan permanently?')) return;
    setClosing(true);
    try { await loansApi.close(id); load(); }
    catch(e: any) { alert(e.message); } finally { setClosing(false); }
  };

  const handleChangeAgent = async () => {
    if (!newAgentId) return;
    setChangingAgent(true);
    try {
      await fetch(`/api/loans/${id}/agent`, { method:'PATCH', headers:{'Content-Type':'application/json','Authorization':`Bearer ${getToken()}`}, body: JSON.stringify({ agentId: newAgentId }) });
      setShowAgentModal(false); load();
    } catch(e:any) { alert(e.message); } finally { setChangingAgent(false); }
  };

  if (loading) return <div><Header title="Loan Details" /><div className="flex items-center justify-center h-80"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div></div>;
  if (!loan) return <div className="p-6">Loan not found</div>;

  const paidC = loan.installments?.filter((i:any)=>i.status==='PAID').length||0;
  const overdueC = loan.installments?.filter((i:any)=>i.status==='OVERDUE').length||0;
  const pendC = loan.installments?.filter((i:any)=>['PENDING','PARTIAL'].includes(i.status)).length||0;
  const totalI = loan.installments?.length||0;
  const canAct = user?.role !== 'USER';
  const canAdmin = user?.role === 'ADMIN' || user?.role === 'SUB_ADMIN';

  return (
    <div>
      <Header title={loan.loanNumber} subtitle={`${loan.party?.name} • ${loan.loanType.replace('_',' ')}`} />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <Link href="/dashboard/loans" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="w-4 h-4" /> Back to Loans</Link>
          <div className="flex gap-2 flex-wrap">
            {/* Document Buttons */}
            <a href={`/api/loans/${id}/passbook`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm hover:bg-muted"><BookOpen className="w-4 h-4" /> Passbook</a>
            <a href={`/api/documents/agreement/${id}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm hover:bg-muted"><FileText className="w-4 h-4" /> Agreement</a>
            <a href={`/api/documents/noc/${id}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm hover:bg-muted"><FileText className="w-4 h-4" /> NOC</a>
            {loan.status==='CLOSED' && <a href={`/api/documents/closure/${id}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm hover:bg-muted text-emerald-600"><CheckCircle2 className="w-4 h-4" /> Closure Cert</a>}
            {canAdmin && loan.status==='ACTIVE' && <button onClick={()=>setShowAgentModal(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm hover:bg-muted"><Users className="w-4 h-4" /> Change Agent</button>}
            {canAdmin && loan.status==='ACTIVE' && <button onClick={handleClose} disabled={closing} className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-red-200 text-red-600 text-sm hover:bg-red-50"><XCircle className="w-4 h-4" />{closing?'Closing...':'Close Loan'}</button>}
            {canAct && loan.status==='ACTIVE' && <button onClick={()=>{setSelectedInst(null);setShowPayment(true);}} className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium"><DollarSign className="w-4 h-4" /> Record Payment</button>}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { l:'Loan Amount', v:`₹${Number(loan.loanAmount).toLocaleString('en-IN')}`, icon:DollarSign, bg:'bg-blue-100 text-blue-600' },
            { l:'Total Paid', v:`₹${Number(loan.totalPaid).toLocaleString('en-IN')}`, icon:CheckCircle2, bg:'bg-emerald-100 text-emerald-600' },
            { l:'Overdue EMIs', v:overdueC, icon:AlertTriangle, bg:'bg-red-100 text-red-600' },
            { l:'Status', v:loan.status, icon:XCircle, bg:'bg-violet-100 text-violet-600' },
          ].map(c=>(
            <div key={c.l} className="bg-card rounded-xl border p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${c.bg}`}><c.icon className="w-5 h-5" /></div>
              <div><p className="text-xs text-muted-foreground">{c.l}</p><p className="font-bold">{c.v}</p></div>
            </div>
          ))}
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="bg-card rounded-xl border p-5">
            <h3 className="font-semibold mb-3 text-sm border-b pb-2">Loan Info</h3>
            <dl className="space-y-2 text-sm">
              {[
                ['Loan No', loan.loanNumber],['Type', loan.loanType.replace('_',' ')],['Status', loan.status],
                ['Start', format(new Date(loan.startDate),'dd MMM yyyy')],
                loan.endDate && ['End', format(new Date(loan.endDate),'dd MMM yyyy')],
                loan.installmentType && ['Frequency', loan.installmentType],
                loan.installmentAmount && ['EMI Amt', `₹${Number(loan.installmentAmount).toLocaleString('en-IN')}`],
                loan.totalInstallments && ['Total EMIs', loan.totalInstallments],
                loan.lateFine && ['Late Fine/Day', `₹${Number(loan.lateFine).toLocaleString('en-IN')}`],
                loan.fileCharges && ['File Charges', `₹${Number(loan.fileCharges).toLocaleString('en-IN')}`],
                loan.totalPayable && ['Total Payable', `₹${Number(loan.totalPayable).toLocaleString('en-IN')}`],
                loan.monthlyInterest && ['Monthly Interest', `₹${Number(loan.monthlyInterest).toLocaleString('en-IN')}`],
                loan.depositAmount && ['Deposit Amt', `₹${Number(loan.depositAmount).toLocaleString('en-IN')}`],
                loan.returnPercent && ['Return %', `${loan.returnPercent}%`],
                loan.maturityAmount && ['Maturity', `₹${Number(loan.maturityAmount).toLocaleString('en-IN')}`],
                loan.purpose && ['Purpose', loan.purpose],
              ].filter(Boolean).map((item:any)=>(
                <div key={item[0]} className="flex justify-between border-b border-border/30 pb-1.5 last:border-0">
                  <dt className="text-muted-foreground">{item[0]}</dt>
                  <dd className="font-medium text-right">{item[1]}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="bg-card rounded-xl border p-5">
            <h3 className="font-semibold mb-3 text-sm border-b pb-2">Customer</h3>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">{loan.party?.name?.charAt(0)}</div>
              <div><p className="font-bold">{loan.party?.name}</p><p className="text-xs text-muted-foreground">{loan.party?.customerId}</p></div>
            </div>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-muted-foreground">Mobile</dt><dd>{loan.party?.mobile1}</dd></div>
              {loan.party?.email && <div className="flex justify-between"><dt className="text-muted-foreground">Email</dt><dd>{loan.party.email}</dd></div>}
              <div className="flex justify-between"><dt className="text-muted-foreground">Agent</dt><dd>{loan.party?.agent?.name||'—'}</dd></div>
            </dl>
            <Link href={`/dashboard/parties/${loan.partyId}`} className="mt-4 text-xs text-primary hover:underline block">View Party Dashboard →</Link>
          </div>

          <div className="bg-card rounded-xl border p-5">
            <h3 className="font-semibold mb-3 text-sm border-b pb-2">Progress</h3>
            {totalI > 0 ? (
              <>
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2"><span className="text-muted-foreground">Progress</span><span className="font-bold">{paidC}/{totalI}</span></div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full transition-all" style={{width:`${(paidC/totalI)*100}%`}} />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{Math.round((paidC/totalI)*100)}% complete</p>
                </div>
                <div className="space-y-2 text-sm">
                  {[['Paid',paidC,'bg-emerald-500'],['Pending',pendC,'bg-amber-400'],['Overdue',overdueC,'bg-red-500']].map(([l,v,c])=>(
                    <div key={l as string} className="flex justify-between items-center">
                      <span className="flex items-center gap-2"><span className={`w-2.5 h-2.5 rounded-full ${c}`}/>{l}</span>
                      <strong>{v}</strong>
                    </div>
                  ))}
                </div>
              </>
            ) : <p className="text-sm text-muted-foreground">Open-ended loan</p>}
          </div>
        </div>

        {/* EMI Schedule */}
        <div className="bg-card rounded-xl border shadow-sm">
          <div className="px-5 py-4 border-b flex items-center justify-between">
            <h3 className="font-semibold">EMI Schedule</h3>
            <span className="text-xs text-muted-foreground">{totalI} installments</span>
          </div>
          <div className="overflow-x-auto max-h-96 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-card z-10">
                <tr className="border-b">
                  {['#','Due Date','Amount','Paid','Fine','Status','Paid Date','Action'].map(h=>(
                    <th key={h} className="text-left text-xs font-semibold text-muted-foreground px-4 py-3 bg-muted/50">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loan.installments?.map((inst:any)=>(
                  <tr key={inst.id} className="border-b border-border/30 hover:bg-accent/20">
                    <td className="px-4 py-2.5 font-mono text-xs font-bold">{inst.installmentNo}</td>
                    <td className="px-4 py-2.5">{format(new Date(inst.dueDate),'dd MMM yyyy')}</td>
                    <td className="px-4 py-2.5 font-semibold">₹{Number(inst.amount).toLocaleString('en-IN')}</td>
                    <td className="px-4 py-2.5 text-emerald-600">{Number(inst.paidAmount)>0?`₹${Number(inst.paidAmount).toLocaleString('en-IN')}`:'-'}</td>
                    <td className="px-4 py-2.5 text-red-600">{Number(inst.fineAmount)>0?`₹${Number(inst.fineAmount).toLocaleString('en-IN')}`:'-'}</td>
                    <td className="px-4 py-2.5"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${SBADGE[inst.status]||'bg-gray-100 text-gray-600'}`}>{inst.status}</span></td>
                    <td className="px-4 py-2.5 text-muted-foreground text-xs">{inst.paidDate?format(new Date(inst.paidDate),'dd MMM yyyy'):'-'}</td>
                    <td className="px-4 py-2.5">
                      {canAct && ['PENDING','OVERDUE','PARTIAL'].includes(inst.status) && loan.status==='ACTIVE' && (
                        <button onClick={()=>{setSelectedInst(inst);setShowPayment(true);}} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-lg hover:bg-primary/20 font-medium">Collect</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payment History */}
        <div className="bg-card rounded-xl border shadow-sm">
          <div className="px-5 py-4 border-b"><h3 className="font-semibold">Payment History</h3></div>
          {!loan.payments?.length ? (
            <p className="text-center text-sm text-muted-foreground py-8">No payments recorded yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b">{['Receipt No.','Date','Amount','Fine','Total','Mode','Agent','Receipt'].map(h=><th key={h} className="text-left text-xs font-semibold text-muted-foreground px-4 py-3 bg-muted/50">{h}</th>)}</tr></thead>
                <tbody>
                  {loan.payments?.map((pay:any)=>(
                    <tr key={pay.id} className="border-b border-border/30 hover:bg-accent/20">
                      <td className="px-4 py-2.5 font-mono text-xs">{pay.receiptNumber}</td>
                      <td className="px-4 py-2.5">{format(new Date(pay.paymentDate),'dd MMM yyyy')}</td>
                      <td className="px-4 py-2.5">₹{Number(pay.amount).toLocaleString('en-IN')}</td>
                      <td className="px-4 py-2.5 text-red-600">{Number(pay.fineAmount)>0?`₹${Number(pay.fineAmount).toLocaleString('en-IN')}`:'-'}</td>
                      <td className="px-4 py-2.5 font-bold text-emerald-600">₹{Number(pay.totalAmount).toLocaleString('en-IN')}</td>
                      <td className="px-4 py-2.5">{pay.paymentMode}</td>
                      <td className="px-4 py-2.5">{pay.agent?.name||'—'}</td>
                      <td className="px-4 py-2.5">
                        <a href={paymentsApi.getReceiptUrl(pay.id)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-muted hover:bg-accent text-muted-foreground">
                          <Printer className="w-3 h-3" /> Print
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Change Agent Modal */}
      {showAgentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-card rounded-2xl border shadow-2xl p-6 w-full max-w-sm mx-4">
            <h3 className="font-bold text-lg mb-2">Change Agent</h3>
            <p className="text-sm text-muted-foreground mb-4">Current: <strong>{loan.party?.agent?.name||'None'}</strong></p>
            <select value={newAgentId} onChange={e=>setNewAgentId(e.target.value)} className="w-full px-3 py-2.5 rounded-lg border bg-background text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-primary/30">
              <option value="">Select new agent...</option>
              {agents.map(a=><option key={a.id} value={a.id}>{a.name} ({a.agentCode})</option>)}
            </select>
            <div className="flex gap-3">
              <button onClick={()=>setShowAgentModal(false)} className="flex-1 py-2 rounded-lg border text-sm hover:bg-muted">Cancel</button>
              <button onClick={handleChangeAgent} disabled={!newAgentId||changingAgent} className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground text-sm hover:bg-primary/90 disabled:opacity-50">
                {changingAgent?'Changing...':'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showPayment && (
        <PaymentModal loanId={id} installment={selectedInst} lateFine={Number(loan.lateFine||0)}
          onClose={()=>{setShowPayment(false);setSelectedInst(null);}}
          onPaid={()=>{setShowPayment(false);setSelectedInst(null);load();}} />
      )}
    </div>
  );
}
