'use client';
import { useEffect, useState, useCallback } from 'react';
import { partiesApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import Header from '@/components/layout/Header';
import Link from 'next/link';
import { Search, Plus, Eye, Edit2, Trash2, ChevronLeft, ChevronRight, User, Phone, MapPin } from 'lucide-react';

export default function PartiesPage() {
  const { user } = useAuthStore();
  const [parties, setParties] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [agentFilter, setAgentFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [delId, setDelId] = useState<string|null>(null);
  const [deleting, setDeleting] = useState(false);

  const canEdit = user?.role === 'ADMIN' || user?.role === 'SUB_ADMIN';
  const getToken = () => { try { return JSON.parse(localStorage.getItem('auth-storage')||'{}')?.state?.token||'' } catch { return '' } };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const p: Record<string,string> = { page:String(page), limit:'10' };
      if (search) p.search = search;
      if (agentFilter) p.agentId = agentFilter;
      const data = await partiesApi.list(p);
      setParties(data.parties); setTotal(data.total); setTotalPages(data.totalPages);
    } catch(e) { console.error(e); } finally { setLoading(false); }
  }, [page, search, agentFilter]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    if (user?.role !== 'AGENT') {
      fetch('/api/agents', { headers:{ Authorization:`Bearer ${getToken()}` } })
        .then(r=>r.json()).then(d=>setAgents(d.agents||[])).catch(()=>{});
    }
  }, [user]);

  const handleDelete = async (id:string) => {
    setDeleting(true);
    try { await partiesApi.delete(id); load(); }
    catch(e:any) { alert(e.message); }
    finally { setDeleting(false); setDelId(null); }
  };

  return (
    <div>
      <Header title="Party Management" subtitle={`${total} customers`} />
      <div className="p-6 space-y-5">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"/>
            <input className="w-full pl-9 pr-4 py-2.5 rounded-lg border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="Search name, mobile, customer ID..." value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}}/>
          </div>
          {user?.role !== 'AGENT' && agents.length > 0 && (
            <select value={agentFilter} onChange={e=>{setAgentFilter(e.target.value);setPage(1);}} className="px-3 py-2.5 rounded-lg border bg-card text-sm focus:outline-none">
              <option value="">All Agents</option>
              {agents.map(a=><option key={a.id} value={a.id}>{a.name} ({a.agentCode})</option>)}
            </select>
          )}
          {canEdit && <Link href="/dashboard/parties/new" className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90"><Plus className="w-4 h-4"/> Add Party</Link>}
        </div>

        <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center h-48"><div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full"/></div>
            ) : parties.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground"><User className="w-12 h-12 mx-auto mb-3 opacity-20"/><p className="font-medium">No parties found</p>
                {canEdit && <Link href="/dashboard/parties/new" className="inline-flex items-center gap-2 px-4 py-2 mt-3 bg-primary text-primary-foreground rounded-lg text-sm"><Plus className="w-4 h-4"/> Add First Party</Link>}
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead><tr className="border-b">{['Customer','Mobile','Location','Agent','Loans','Limit','Actions'].map(h=><th key={h} className="text-left text-xs font-semibold text-muted-foreground px-4 py-3 bg-muted/50">{h}</th>)}</tr></thead>
                <tbody>
                  {parties.map(p=>(
                    <tr key={p.id} className="border-b border-border/30 hover:bg-accent/20">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">{p.name.charAt(0)}</div>
                          <div><p className="font-medium">{p.name}</p><p className="text-xs text-muted-foreground font-mono">{p.customerId}</p></div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{p.mobile1}</td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">{[p.city,p.state].filter(Boolean).join(', ')||'—'}</td>
                      <td className="px-4 py-3">{p.agent?.name||'—'}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1 flex-wrap">
                          {!p.loans?.length && <span className="text-xs text-muted-foreground">None</span>}
                          {p.loans?.slice(0,2).map((l:any)=>(
                            <span key={l.id} className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${l.status==='ACTIVE'?'bg-emerald-100 text-emerald-700':l.status==='OVERDUE'?'bg-red-100 text-red-700':'bg-gray-100 text-gray-600'}`}>{l.status}</span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-semibold">₹{Number(p.loanLimit).toLocaleString('en-IN')}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Link href={`/dashboard/parties/${p.id}`} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground" title="View"><Eye className="w-4 h-4"/></Link>
                          {canEdit && <>
                            <Link href={`/dashboard/parties/${p.id}/edit`} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-blue-600" title="Edit"><Edit2 className="w-4 h-4"/></Link>
                            <button onClick={()=>setDelId(p.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-600" title="Delete"><Trash2 className="w-4 h-4"/></button>
                          </>}
                        </div>
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

      {delId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-card rounded-2xl border shadow-2xl p-6 w-full max-w-sm mx-4">
            <h3 className="font-bold text-lg mb-2">Delete Party?</h3>
            <p className="text-sm text-muted-foreground mb-5">Cannot delete parties with active loans.</p>
            <div className="flex gap-3">
              <button onClick={()=>setDelId(null)} className="flex-1 py-2 rounded-lg border text-sm hover:bg-muted">Cancel</button>
              <button onClick={()=>handleDelete(delId)} disabled={deleting} className="flex-1 py-2 rounded-lg bg-red-600 text-white text-sm hover:bg-red-700 disabled:opacity-50">{deleting?'Deleting...':'Delete'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
