'use client';
import { useEffect, useState } from 'react';
import { agentsApi } from '@/lib/api';
import Header from '@/components/layout/Header';
import { Plus, UserCheck, UserX, Edit2, Trash2, Users } from 'lucide-react';

export default function AgentsPage() {
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editAgent, setEditAgent] = useState<any>(null);
  const [delAgent, setDelAgent] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  const getToken = () => { try { return JSON.parse(localStorage.getItem('auth-storage')||'{}')?.state?.token||'' } catch { return '' } };

  const load = async () => {
    setLoading(true);
    try { const d = await agentsApi.list(); setAgents(d.agents); }
    catch(e) { console.error(e); } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const toggle = async (id: string, cur: boolean) => {
    try { await agentsApi.toggle(id, !cur); load(); }
    catch(e:any) { alert(e.message); }
  };

  const handleDelete = async () => {
    if (!delAgent) return;
    setDeleting(true); setError('');
    try {
      const res = await fetch(`/api/agents?id=${delAgent.id}`, { method:'DELETE', headers:{ Authorization:`Bearer ${getToken()}` } });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setDelAgent(null); load();
    } catch(e:any) { setError(e.message); }
    finally { setDeleting(false); }
  };

  return (
    <div>
      <Header title="Agents" subtitle="Manage field agents and sub-admins" />
      <div className="p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex gap-4 text-sm text-muted-foreground">
            <span>Total: <strong className="text-foreground">{agents.length}</strong></span>
            <span className="text-emerald-600">Active: <strong>{agents.filter(a=>a.isActive).length}</strong></span>
            <span className="text-red-500">Disabled: <strong>{agents.filter(a=>!a.isActive).length}</strong></span>
          </div>
          <button onClick={()=>{setEditAgent(null);setShowForm(true);}} className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90">
            <Plus className="w-4 h-4"/> Add Agent
          </button>
        </div>

        <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-48"><div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full"/></div>
          ) : agents.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground"><Users className="w-12 h-12 mx-auto mb-3 opacity-20"/><p>No agents found</p></div>
          ) : (
            <table className="w-full text-sm">
              <thead><tr className="border-b">{['Agent','Code','Role','Phone','Customers','Month Collection','Status','Actions'].map(h=><th key={h} className="text-left text-xs font-semibold text-muted-foreground px-4 py-3 bg-muted/50">{h}</th>)}</tr></thead>
              <tbody>
                {agents.map(agent=>(
                  <tr key={agent.id} className="border-b border-border/30 hover:bg-accent/20">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">{agent.name.charAt(0)}</div>
                        <div><p className="font-medium">{agent.name}</p><p className="text-xs text-muted-foreground">{agent.email}</p></div>
                      </div>
                    </td>
                    <td className="px-4 py-3"><span className="font-mono text-xs bg-muted px-2 py-1 rounded">{agent.agentCode||'—'}</span></td>
                    <td className="px-4 py-3"><span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 font-medium">{agent.role.replace('_',' ')}</span></td>
                    <td className="px-4 py-3 text-muted-foreground">{agent.phone||'—'}</td>
                    <td className="px-4 py-3 font-semibold">{agent.totalCustomers}</td>
                    <td className="px-4 py-3 font-bold text-emerald-600">₹{agent.monthlyCollection.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${agent.isActive?'bg-emerald-100 text-emerald-700':'bg-red-100 text-red-700'}`}>{agent.isActive?'Active':'Disabled'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={()=>{setEditAgent(agent);setShowForm(true);}} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-blue-600" title="Edit"><Edit2 className="w-4 h-4"/></button>
                        <button onClick={()=>toggle(agent.id,agent.isActive)} className={`flex items-center gap-1 text-xs px-2 py-1.5 rounded-lg font-medium ${agent.isActive?'text-red-600 hover:bg-red-50':'text-emerald-600 hover:bg-emerald-50'}`}>
                          {agent.isActive?<><UserX className="w-3.5 h-3.5"/>Disable</>:<><UserCheck className="w-3.5 h-3.5"/>Enable</>}
                        </button>
                        <button onClick={()=>setDelAgent(agent)} className="p-1.5 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-600" title="Delete"><Trash2 className="w-4 h-4"/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showForm && <AgentFormModal agent={editAgent} onClose={()=>{setShowForm(false);setEditAgent(null);}} onSaved={()=>{setShowForm(false);setEditAgent(null);load();}} />}

      {delAgent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-card rounded-2xl border shadow-2xl p-6 w-full max-w-sm mx-4">
            <h3 className="font-bold text-lg mb-2">Delete Agent?</h3>
            <p className="text-sm text-muted-foreground mb-1">Deleting: <strong>{delAgent.name}</strong></p>
            <p className="text-sm text-red-600 mb-4">⚠️ Cannot delete if agent has assigned parties.</p>
            {error && <p className="text-sm text-red-600 mb-3 p-2 bg-red-50 rounded">{error}</p>}
            <div className="flex gap-3">
              <button onClick={()=>{setDelAgent(null);setError('');}} className="flex-1 py-2 rounded-lg border text-sm hover:bg-muted">Cancel</button>
              <button onClick={handleDelete} disabled={deleting} className="flex-1 py-2 rounded-lg bg-red-600 text-white text-sm hover:bg-red-700 disabled:opacity-50">{deleting?'Deleting...':'Delete'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AgentFormModal({ agent, onClose, onSaved }: { agent?:any; onClose:()=>void; onSaved:()=>void }) {
  const isEdit = !!agent;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [f, setF] = useState({ name:agent?.name||'', email:agent?.email||'', password:'', phone:agent?.phone||'', role:agent?.role||'AGENT' });
  const set = (k:string,v:string) => setF(p=>({...p,[k]:v}));

  const handleSubmit = async (e:React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError('');
    try {
      if (isEdit) await agentsApi.update(agent.id, f);
      else await agentsApi.create(f);
      onSaved();
    } catch(err:any) { setError(err.message); } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-card rounded-2xl border shadow-2xl p-6 w-full max-w-md mx-4">
        <h2 className="font-bold text-xl mb-5">{isEdit?'Edit Agent':'Add New Agent'}</h2>
        {error && <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          {[{l:'Full Name',k:'name',t:'text',r:true},{l:'Email',k:'email',t:'email',r:true},{l:isEdit?'New Password (blank = keep)':'Password',k:'password',t:'password',r:!isEdit},{l:'Phone',k:'phone',t:'text',r:false}].map(fi=>(
            <div key={fi.k}><label className="block text-sm font-medium mb-1.5">{fi.l}</label>
            <input type={fi.t} value={(f as any)[fi.k]||''} onChange={e=>set(fi.k,e.target.value)} required={fi.r} className="w-full px-3 py-2.5 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"/></div>
          ))}
          <div><label className="block text-sm font-medium mb-1.5">Role</label>
          <select value={f.role} onChange={e=>set('role',e.target.value)} className="w-full px-3 py-2.5 rounded-lg border bg-background text-sm focus:outline-none">
            <option value="AGENT">Agent / Field Employee</option>
            <option value="SUB_ADMIN">Sub Admin</option>
          </select></div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-lg border text-sm hover:bg-muted">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-60">{loading?'Saving...':isEdit?'Update':'Create'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
