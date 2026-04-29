'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { partiesApi, paymentsApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import Header from '@/components/layout/Header';
import PaymentModal from '@/components/forms/PaymentModal';
import Link from 'next/link';
import { format } from 'date-fns';
import { ArrowLeft, Phone, MapPin, Edit2, DollarSign, FileText, BookOpen, Bell, Mail, MessageSquare, Download, Printer, CheckCircle2 } from 'lucide-react';

export default function PartyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const [party, setParty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showPayment, setShowPayment] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<any>(null);
  const [selectedInst, setSelectedInst] = useState<any>(null);
  const [reminderLoading, setReminderLoading] = useState(false);
  const [reminderMsg, setReminderMsg] = useState('');

  const getToken = () => { try { return JSON.parse(localStorage.getItem('auth-storage')||'{}')?.state?.token||'' } catch { return '' } };

  const load = async () => {
    setLoading(true);
    try { const d = await partiesApi.get(id); setParty(d.party); }
    catch(e) { console.error(e); } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [id]);

  const sendReminder = async (type: string) => {
    setReminderLoading(true); setReminderMsg('');
    try {
      const res = await fetch(`/api/parties/${id}/reminder`, { method:'POST', headers:{'Content-Type':'application/json','Authorization':`Bearer ${getToken()}`}, body: JSON.stringify({ type }) });
      const data = await res.json();
      setReminderMsg(`✅ Done: ${JSON.stringify(data.results)}`);
    } catch(e:any) { setReminderMsg('❌ '+e.message); }
    finally { setReminderLoading(false); }
  };

  if (loading) return <div><Header title="Party Details" /><div className="flex items-center justify-center h-80"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"/></div></div>;
  if (!party) return <div className="p-6">Party not found</div>;

  const canEdit = user?.role === 'ADMIN' || user?.role === 'SUB_ADMIN';
  const activeLoan = party.loans?.find((l:any)=>l.status==='ACTIVE');
  const allPayments = party.loans?.flatMap((l:any)=>l.payments?.map((p:any)=>({...p,loanNumber:l.loanNumber}))||[]).sort((a:any,b:any)=>new Date(b.paymentDate).getTime()-new Date(a.paymentDate).getTime());

  const Row = ({ label, value }: any) => value ? (
    <div className="flex justify-between py-1.5 border-b border-border/30 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-right max-w-xs break-all">{value}</span>
    </div>
  ) : null;

  return (
    <div>
      <Header title={party.name} subtitle={`${party.customerId} • ${party.partyCode}`} />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <Link href="/dashboard/parties" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="w-4 h-4"/> Back</Link>
          {canEdit && <Link href={`/dashboard/parties/${id}/edit`} className="flex items-center gap-2 px-3 py-2 rounded-lg border text-sm hover:bg-muted"><Edit2 className="w-4 h-4"/> Edit Party</Link>}
        </div>

        {/* Profile Card */}
        <div className="bg-card rounded-xl border p-5 flex flex-wrap items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold text-2xl">{party.name.charAt(0)}</div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold">{party.name}</h2>
            <div className="flex flex-wrap gap-4 mt-1.5 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5"/>{party.mobile1}</span>
              {party.email && <span>{party.email}</span>}
              {party.city && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5"/>{[party.city,party.state].filter(Boolean).join(', ')}</span>}
              {party.agent && <span>Agent: {party.agent.name} ({party.agent.agentCode})</span>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="px-4 py-3 bg-muted/50 rounded-xl"><p className="text-xs text-muted-foreground">Loan Limit</p><p className="font-bold">₹{Number(party.loanLimit).toLocaleString('en-IN')}</p></div>
            <div className="px-4 py-3 bg-muted/50 rounded-xl"><p className="text-xs text-muted-foreground">Total Loans</p><p className="font-bold">{party.loans?.length||0}</p></div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          {activeLoan && <button onClick={()=>{setSelectedLoan(activeLoan);setSelectedInst(null);setShowPayment(true);}} className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700"><DollarSign className="w-4 h-4"/> Record Payment</button>}
          {activeLoan && <a href={`/api/loans/${activeLoan.id}/passbook`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm hover:bg-muted"><BookOpen className="w-4 h-4"/> Passbook</a>}
          {activeLoan && <a href={`/api/documents/agreement/${activeLoan.id}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm hover:bg-muted"><FileText className="w-4 h-4"/> Loan Agreement</a>}
          {activeLoan && <a href={`/api/documents/noc/${activeLoan.id}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm hover:bg-muted"><FileText className="w-4 h-4"/> NOC</a>}
          {party.loans?.filter((l:any)=>l.status==='CLOSED').map((l:any)=>(
            <a key={l.id} href={`/api/documents/closure/${l.id}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm hover:bg-muted text-emerald-600"><CheckCircle2 className="w-4 h-4"/> Closure Cert</a>
          ))}
          <button onClick={()=>sendReminder('email')} disabled={reminderLoading} className="flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm hover:bg-muted"><Mail className="w-4 h-4"/> Email Reminder</button>
          <button onClick={()=>sendReminder('sms')} disabled={reminderLoading} className="flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm hover:bg-muted"><MessageSquare className="w-4 h-4"/> SMS Reminder</button>
          <button onClick={()=>sendReminder('both')} disabled={reminderLoading} className="flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm hover:bg-muted"><Bell className="w-4 h-4"/> Send Both</button>
          <a href={`/api/reports?type=party_payments&partyId=${id}&format=excel`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm hover:bg-muted ml-auto"><Download className="w-4 h-4"/> Export Payments</a>
        </div>

        {reminderMsg && <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 text-blue-800 dark:text-blue-300 text-sm">{reminderMsg}</div>}

        {/* Info Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-card rounded-xl border p-5"><h3 className="font-semibold text-sm border-b pb-2 mb-3">Personal Info</h3>
            <Row label="Father's Name" value={party.fatherName}/>
            <Row label="Gender" value={party.gender}/>
            <Row label="DOB" value={party.birthdate?format(new Date(party.birthdate),'dd MMM yyyy'):null}/>
            <Row label="Occupation" value={party.occupation}/>
            <Row label="Mobile 2" value={party.mobile2}/>
          </div>
          <div className="bg-card rounded-xl border p-5"><h3 className="font-semibold text-sm border-b pb-2 mb-3">Address & Docs</h3>
            <Row label="Area" value={party.area}/><Row label="City" value={party.city}/><Row label="State" value={party.state}/><Row label="Pincode" value={party.pincode}/>
            <Row label="PAN" value={party.pan}/><Row label="Aadhaar" value={party.aadhaar}/><Row label="Voter ID" value={party.voterId}/>
          </div>
          <div className="bg-card rounded-xl border p-5"><h3 className="font-semibold text-sm border-b pb-2 mb-3">KYC Documents</h3>
            <Row label="ID Proof Type" value={party.idProofType}/><Row label="ID Proof No." value={party.idProofNumber}/>
            <Row label="Address Proof Type" value={party.addressProofType}/><Row label="Address Proof No." value={party.addressProofNumber}/>
          </div>
          {(party.bankName||party.bankAccountNo) && (
            <div className="bg-card rounded-xl border p-5"><h3 className="font-semibold text-sm border-b pb-2 mb-3">Bank Details</h3>
              <Row label="Bank" value={party.bankName}/><Row label="IFSC" value={party.bankIfsc}/><Row label="Account No." value={party.bankAccountNo}/><Row label="Holder" value={party.bankAccountHolder}/>
            </div>
          )}
          {party.guarantor1Name && (
            <div className="bg-card rounded-xl border p-5 lg:col-span-2"><h3 className="font-semibold text-sm border-b pb-2 mb-3">Guarantors</h3>
              <div className="grid grid-cols-2 gap-6">
                <div><p className="text-xs font-semibold text-muted-foreground mb-2">Guarantor 1</p>
                  <Row label="Name" value={party.guarantor1Name}/><Row label="Mobile" value={party.guarantor1Mobile}/><Row label="Relation" value={party.guarantor1Relation}/>
                </div>
                {party.guarantor2Name && <div><p className="text-xs font-semibold text-muted-foreground mb-2">Guarantor 2</p>
                  <Row label="Name" value={party.guarantor2Name}/><Row label="Mobile" value={party.guarantor2Mobile}/><Row label="Relation" value={party.guarantor2Relation}/>
                </div>}
              </div>
            </div>
          )}
        </div>

        {/* Loans */}
        <div className="bg-card rounded-xl border shadow-sm">
          <div className="px-5 py-4 border-b flex items-center justify-between">
            <h3 className="font-semibold">Loan Accounts</h3>
            {canEdit && <Link href="/dashboard/loans" className="text-xs text-primary hover:underline">+ New Loan</Link>}
          </div>
          {!party.loans?.length ? (
            <p className="text-center text-sm text-muted-foreground py-8">No loans found</p>
          ) : (
            <div className="divide-y">
              {party.loans.map((loan:any)=>{
                const paidC = loan.installments?.filter((i:any)=>i.status==='PAID').length||0;
                const totalI = loan.installments?.length||0;
                return (
                  <div key={loan.id} className="p-5">
                    <div className="flex items-start justify-between flex-wrap gap-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-mono text-sm font-bold">{loan.loanNumber}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${loan.status==='ACTIVE'?'bg-emerald-100 text-emerald-700':loan.status==='CLOSED'?'bg-gray-100 text-gray-600':'bg-red-100 text-red-700'}`}>{loan.status}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">{loan.loanType.replace('_',' ')}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm mb-2">
                          <div><p className="text-muted-foreground text-xs">Amount</p><p className="font-bold">₹{Number(loan.loanAmount).toLocaleString('en-IN')}</p></div>
                          <div><p className="text-muted-foreground text-xs">Paid</p><p className="font-bold text-emerald-600">₹{Number(loan.totalPaid).toLocaleString('en-IN')}</p></div>
                          <div><p className="text-muted-foreground text-xs">EMIs</p><p className="font-bold">{paidC}/{totalI}</p></div>
                        </div>
                        {totalI > 0 && <div className="h-2 bg-muted rounded-full overflow-hidden w-48"><div className="h-full bg-emerald-500 rounded-full" style={{width:`${(paidC/totalI)*100}%`}}/></div>}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Link href={`/dashboard/loans/${loan.id}`} className="px-3 py-1.5 rounded-lg border text-xs hover:bg-muted">View Details</Link>
                        <a href={`/api/loans/${loan.id}/passbook`} target="_blank" rel="noreferrer" className="flex items-center gap-1 px-3 py-1.5 rounded-lg border text-xs hover:bg-muted"><BookOpen className="w-3.5 h-3.5"/> Passbook</a>
                        <a href={`/api/documents/agreement/${loan.id}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 px-3 py-1.5 rounded-lg border text-xs hover:bg-muted"><FileText className="w-3.5 h-3.5"/> Agreement</a>
                        <a href={`/api/documents/noc/${loan.id}`} target="_blank" rel="noreferrer" className="px-3 py-1.5 rounded-lg border text-xs hover:bg-muted">NOC</a>
                        {loan.status==='CLOSED' && <a href={`/api/documents/closure/${loan.id}`} target="_blank" rel="noreferrer" className="px-3 py-1.5 rounded-lg border text-xs hover:bg-muted text-emerald-600">Closure</a>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Payment History */}
        <div className="bg-card rounded-xl border shadow-sm">
          <div className="px-5 py-4 border-b flex items-center justify-between">
            <h3 className="font-semibold">Payment History</h3>
            <a href={`/api/reports?type=party_payments&partyId=${id}&format=excel`} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-primary hover:underline"><Download className="w-3.5 h-3.5"/> Export Excel</a>
          </div>
          {!allPayments?.length ? (
            <p className="text-center text-sm text-muted-foreground py-8">No payments yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b">{['Receipt','Date','Loan','Amount','Fine','Total','Mode','Agent','Print'].map(h=><th key={h} className="text-left text-xs font-semibold text-muted-foreground px-4 py-3 bg-muted/50">{h}</th>)}</tr></thead>
                <tbody>
                  {allPayments.slice(0,30).map((p:any)=>(
                    <tr key={p.id} className="border-b border-border/30 hover:bg-accent/20">
                      <td className="px-4 py-2.5 font-mono text-xs">{p.receiptNumber}</td>
                      <td className="px-4 py-2.5">{format(new Date(p.paymentDate),'dd MMM yyyy')}</td>
                      <td className="px-4 py-2.5 font-mono text-xs">{p.loanNumber||'—'}</td>
                      <td className="px-4 py-2.5">₹{Number(p.amount).toLocaleString('en-IN')}</td>
                      <td className="px-4 py-2.5 text-red-600">{Number(p.fineAmount)>0?`₹${Number(p.fineAmount).toLocaleString('en-IN')}`:'-'}</td>
                      <td className="px-4 py-2.5 font-bold text-emerald-600">₹{Number(p.totalAmount).toLocaleString('en-IN')}</td>
                      <td className="px-4 py-2.5">{p.paymentMode}</td>
                      <td className="px-4 py-2.5">{p.agent?.name||'—'}</td>
                      <td className="px-4 py-2.5"><a href={paymentsApi.getReceiptUrl(p.id)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-muted hover:bg-accent"><Printer className="w-3 h-3"/> Print</a></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showPayment && selectedLoan && (
        <PaymentModal loanId={selectedLoan.id} installment={selectedInst} lateFine={Number(selectedLoan.lateFine||0)}
          onClose={()=>{setShowPayment(false);setSelectedLoan(null);setSelectedInst(null);}}
          onPaid={()=>{setShowPayment(false);setSelectedLoan(null);setSelectedInst(null);load();}} />
      )}
    </div>
  );
}
