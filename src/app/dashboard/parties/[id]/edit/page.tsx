'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { partiesApi } from '@/lib/api';
import Header from '@/components/layout/Header';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

const TABS = ['Personal','Address & Docs','KYC Proofs','Guarantors','Bank Details','Financial'];

export default function EditPartyPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [tab, setTab] = useState(0);
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const getToken = () => { try { return JSON.parse(localStorage.getItem('auth-storage')||'{}')?.state?.token||'' } catch { return '' } };

  const [f, setF] = useState<any>({
    name:'',fatherName:'',mobile1:'',mobile2:'',email:'',gender:'',birthdate:'',occupation:'',remarks:'',agentId:'',
    area:'',city:'',state:'',pincode:'',pan:'',aadhaar:'',voterId:'',
    idProofType:'',idProofNumber:'',addressProofType:'',addressProofNumber:'',
    guarantor1Name:'',guarantor1Mobile:'',guarantor1Relation:'',guarantor1Address:'',guarantor1Pan:'',guarantor1Aadhaar:'',guarantor1VoterId:'',
    guarantor2Name:'',guarantor2Mobile:'',guarantor2Relation:'',guarantor2Address:'',guarantor2Pan:'',guarantor2Aadhaar:'',guarantor2VoterId:'',
    bankName:'',bankIfsc:'',bankAccountNo:'',bankAccountHolder:'',
    loanLimit:'0',
  });

  useEffect(() => {
    partiesApi.get(id).then(d=>{
      const p = d.party;
      setF({ ...p, birthdate:p.birthdate?p.birthdate.split('T')[0]:'', loanLimit:String(p.loanLimit||0) });
    }).catch(console.error).finally(()=>setFetching(false));
    fetch('/api/agents', { headers:{ Authorization:`Bearer ${getToken()}` } })
      .then(r=>r.json()).then(d=>setAgents((d.agents||[]).filter((a:any)=>a.isActive))).catch(()=>{});
  }, [id]);

  const set = (k:string,v:string) => setF((p:any)=>({...p,[k]:v}));

  const I = ({label,k,type='text',req=false}:{label:string;k:string;type?:string;req?:boolean}) => (
    <div><label className="block text-sm font-medium mb-1.5">{label}{req&&<span className="text-red-500 ml-0.5">*</span>}</label>
    <input type={type} value={f[k]||''} onChange={e=>set(k,e.target.value)} required={req} className="w-full px-3 py-2.5 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"/></div>
  );
  const S = ({label,k,opts}:{label:string;k:string;opts:{v:string;l:string}[]}) => (
    <div><label className="block text-sm font-medium mb-1.5">{label}</label>
    <select value={f[k]||''} onChange={e=>set(k,e.target.value)} className="w-full px-3 py-2.5 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
      <option value="">Select...</option>{opts.map(o=><option key={o.v} value={o.v}>{o.l}</option>)}
    </select></div>
  );

  const handleSubmit = async (e:React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError('');
    try { await partiesApi.update(id, f); router.push(`/dashboard/parties/${id}`); }
    catch(err:any) { setError(err.message); } finally { setLoading(false); }
  };

  if (fetching) return <div><Header title="Edit Party"/><div className="flex items-center justify-center h-64"><div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full"/></div></div>;

  const CONTENT = [
    <div key="0" className="grid grid-cols-2 gap-4">
      <I label="Full Name" k="name" req/><I label="Father's Name" k="fatherName"/>
      <I label="Mobile 1" k="mobile1" req/><I label="Mobile 2" k="mobile2"/>
      <I label="Email" k="email" type="email"/>
      <S label="Gender" k="gender" opts={[{v:'MALE',l:'Male'},{v:'FEMALE',l:'Female'},{v:'OTHER',l:'Other'}]}/>
      <I label="Date of Birth" k="birthdate" type="date"/>
      <I label="Occupation" k="occupation"/>
      <S label="Assign Agent" k="agentId" opts={agents.map(a=>({v:a.id,l:`${a.name} (${a.agentCode})`}))}/>
      <div className="col-span-2"><label className="block text-sm font-medium mb-1.5">Remarks</label>
        <textarea value={f.remarks||''} onChange={e=>set('remarks',e.target.value)} rows={2} className="w-full px-3 py-2.5 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"/>
      </div>
    </div>,
    <div key="1" className="grid grid-cols-2 gap-4">
      <div className="col-span-2"><I label="Area / Street" k="area"/></div>
      <I label="City" k="city"/><I label="State" k="state"/><I label="Pincode" k="pincode"/>
      <I label="PAN" k="pan"/><I label="Aadhaar" k="aadhaar"/><I label="Voter ID" k="voterId"/>
    </div>,
    <div key="2" className="grid grid-cols-2 gap-4">
      <S label="ID Proof Type" k="idProofType" opts={[{v:'Aadhaar Card',l:'Aadhaar Card'},{v:'PAN Card',l:'PAN Card'},{v:'Voter ID',l:'Voter ID'},{v:'Passport',l:'Passport'},{v:'Driving License',l:'Driving License'}]}/>
      <I label="ID Proof Number" k="idProofNumber"/>
      <S label="Address Proof Type" k="addressProofType" opts={[{v:'Aadhaar Card',l:'Aadhaar Card'},{v:'Electricity Bill',l:'Electricity Bill'},{v:'Ration Card',l:'Ration Card'},{v:'Water Bill',l:'Water Bill'},{v:'Rental Agreement',l:'Rental Agreement'}]}/>
      <I label="Address Proof Number" k="addressProofNumber"/>
    </div>,
    <div key="3" className="space-y-5">
      <div>
        <p className="text-sm font-semibold mb-3">Guarantor 1</p>
        <div className="grid grid-cols-2 gap-4">
          <I label="Name" k="guarantor1Name"/><I label="Mobile" k="guarantor1Mobile"/>
          <I label="Relation" k="guarantor1Relation"/><div className="col-span-2"><I label="Address" k="guarantor1Address"/></div>
        </div>
      </div>
      <div className="border-t pt-4">
        <p className="text-sm font-semibold mb-3">Guarantor 2</p>
        <div className="grid grid-cols-2 gap-4">
          <I label="Name" k="guarantor2Name"/><I label="Mobile" k="guarantor2Mobile"/>
          <I label="Relation" k="guarantor2Relation"/>
        </div>
      </div>
    </div>,
    <div key="4" className="grid grid-cols-2 gap-4">
      <I label="Bank Name" k="bankName"/><I label="IFSC" k="bankIfsc"/>
      <I label="Account No." k="bankAccountNo"/><I label="Account Holder" k="bankAccountHolder"/>
    </div>,
    <div key="5" className="grid grid-cols-2 gap-4">
      <I label="Loan Limit (₹)" k="loanLimit" type="number"/>
    </div>,
  ];

  return (
    <div>
      <Header title={`Edit: ${f.name||'Party'}`} subtitle={`Customer ID: ${f.customerId||''}`}/>
      <div className="p-6 max-w-3xl">
        <Link href={`/dashboard/parties/${id}`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-5"><ArrowLeft className="w-4 h-4"/> Back</Link>
        <div className="bg-card rounded-2xl border shadow-sm">
          <div className="flex border-b overflow-x-auto">
            {TABS.map((t,i)=>(
              <button key={t} onClick={()=>setTab(i)} className={`px-4 py-3 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors ${i===tab?'border-primary text-primary':'border-transparent text-muted-foreground hover:text-foreground'}`}>{t}</button>
            ))}
          </div>
          <form onSubmit={handleSubmit}>
            <div className="p-6 min-h-64">
              {error && <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>}
              {CONTENT[tab]}
            </div>
            <div className="px-6 py-4 border-t flex items-center justify-between">
              <button type="button" onClick={()=>setTab(t=>Math.max(0,t-1))} disabled={tab===0} className="px-4 py-2 rounded-lg border text-sm hover:bg-muted disabled:opacity-40">← Prev</button>
              <div className="flex gap-2">
                {tab < TABS.length-1
                  ? <button type="button" onClick={()=>setTab(t=>t+1)} className="px-5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium">Next →</button>
                  : <button type="submit" disabled={loading} className="flex items-center gap-2 px-5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium disabled:opacity-60"><Save className="w-4 h-4"/>{loading?'Saving...':'Update Party'}</button>
                }
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
