'use client';
// src/app/dashboard/page.tsx
import { useEffect, useState } from 'react';
import { dashboardApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import Header from '@/components/layout/Header';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar
} from 'recharts';
import {
  Banknote, Users, TrendingUp, AlertTriangle,
  DollarSign, CheckCircle2, Clock, ArrowUpRight
} from 'lucide-react';
import { format } from 'date-fns';

function StatCard({ icon: Icon, label, value, sub, color }: any) {
  return (
    <div className="stat-card flex items-start gap-4 animate-fade-up">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold mt-0.5 currency">{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi.get().then(setData).catch(console.error).finally(() => setLoading(false));
  }, []);

  const fmt = (n: number) => `₹${n.toLocaleString('en-IN')}`;

  if (loading) return (
    <div>
      <Header title="Dashboard" subtitle={`Welcome back, ${user?.name}`} />
      <div className="flex-1 flex items-center justify-center h-96">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    </div>
  );

  const s = data?.stats || {};

  return (
    <div>
      <Header title="Dashboard" subtitle={`Welcome back, ${user?.name} • ${format(new Date(), 'EEEE, dd MMM yyyy')}`} />

      <div className="p-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Banknote} label="Total Disbursed" value={fmt(s.totalDisbursed || 0)} sub={`${s.activeLoans || 0} active loans`} color="bg-blue-100 text-blue-600 dark:bg-blue-900/30" />
          <StatCard icon={TrendingUp} label="Total Collected" value={fmt(s.totalCollected || 0)} sub="All time" color="bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30" />
          <StatCard icon={DollarSign} label="Today's Collection" value={fmt(s.todayCollection || 0)} sub={`${s.todayPaymentCount || 0} payments`} color="bg-violet-100 text-violet-600 dark:bg-violet-900/30" />
          <StatCard icon={AlertTriangle} label="Overdue EMIs" value={s.overdueInstallments || 0} sub="Need immediate attention" color="bg-red-100 text-red-600 dark:bg-red-900/30" />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Users} label="Total Parties" value={s.totalParties || 0} color="bg-amber-100 text-amber-600 dark:bg-amber-900/30" />
          <StatCard icon={CheckCircle2} label="Active Loans" value={s.activeLoans || 0} color="bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30" />
          <StatCard icon={Clock} label="Month Collection" value={fmt(s.monthCollection || 0)} sub="This month" color="bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30" />
          <StatCard icon={ArrowUpRight} label="Total Loans" value={s.totalLoans || 0} color="bg-pink-100 text-pink-600 dark:bg-pink-900/30" />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Collection Chart */}
          <div className="bg-card rounded-xl border p-5 shadow-sm">
            <h3 className="font-semibold mb-4">Monthly Collection Trend</h3>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={data?.monthlyData || []}>
                <defs>
                  <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(215,70%,28%)" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="hsl(215,70%,28%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} />
                <Tooltip formatter={(v: any) => [`₹${Number(v).toLocaleString('en-IN')}`, 'Collected']} />
                <Area type="monotone" dataKey="amount" stroke="hsl(215,70%,28%)" fill="url(#colorAmt)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Agent Performance */}
          {user?.role !== 'AGENT' && data?.agentStats && (
            <div className="bg-card rounded-xl border p-5 shadow-sm">
              <h3 className="font-semibold mb-4">Agent Performance (This Month)</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data.agentStats}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} />
                  <Tooltip formatter={(v: any) => [`₹${Number(v).toLocaleString('en-IN')}`, 'Collected']} />
                  <Bar dataKey="monthCollection" fill="hsl(215,70%,28%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Today's Collection List */}
          <div className="bg-card rounded-xl border shadow-sm">
            <div className="px-5 py-4 border-b flex items-center justify-between">
              <h3 className="font-semibold">Today's Collection List</h3>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                {data?.todayCollections?.length || 0} due
              </span>
            </div>
            <div className="divide-y max-h-72 overflow-y-auto">
              {data?.todayCollections?.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">No collections due today 🎉</p>
              )}
              {data?.todayCollections?.map((inst: any) => (
                <div key={inst.id} className="px-5 py-3 flex items-center justify-between hover:bg-accent/20">
                  <div>
                    <p className="text-sm font-medium">{inst.loan.party.name}</p>
                    <p className="text-xs text-muted-foreground">{inst.loan.party.mobile1} • {inst.loan.party.city}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold currency">₹{Number(inst.amount).toLocaleString('en-IN')}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${inst.status === 'OVERDUE' ? 'badge-overdue' : 'badge-pending'}`}>
                      {inst.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Overdue Loans */}
          <div className="bg-card rounded-xl border shadow-sm">
            <div className="px-5 py-4 border-b flex items-center justify-between">
              <h3 className="font-semibold">Overdue EMIs</h3>
              <span className="text-xs badge-overdue px-2 py-1 rounded-full">
                {data?.overdueLoans?.length || 0} overdue
              </span>
            </div>
            <div className="divide-y max-h-72 overflow-y-auto">
              {data?.overdueLoans?.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">No overdue loans ✓</p>
              )}
              {data?.overdueLoans?.map((inst: any) => {
                const daysOverdue = Math.floor((Date.now() - new Date(inst.dueDate).getTime()) / 86400000);
                return (
                  <div key={inst.id} className="px-5 py-3 flex items-center justify-between hover:bg-accent/20">
                    <div>
                      <p className="text-sm font-medium">{inst.loan.party.name}</p>
                      <p className="text-xs text-muted-foreground">{inst.loan.loanNumber} • Due: {format(new Date(inst.dueDate), 'dd MMM')}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold currency text-red-600">₹{Number(inst.amount).toLocaleString('en-IN')}</p>
                      <p className="text-xs text-red-500">{daysOverdue}d overdue</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Agent Table (Admin only) */}
        {user?.role !== 'AGENT' && data?.agentStats && (
          <div className="bg-card rounded-xl border shadow-sm">
            <div className="px-5 py-4 border-b">
              <h3 className="font-semibold">Agent Performance Summary</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Agent</th>
                    <th>Code</th>
                    <th>Total Customers</th>
                    <th>Month Collection</th>
                  </tr>
                </thead>
                <tbody>
                  {data.agentStats.map((agent: any) => (
                    <tr key={agent.id}>
                      <td className="font-medium">{agent.name}</td>
                      <td><span className="font-mono text-xs bg-muted px-2 py-1 rounded">{agent.agentCode}</span></td>
                      <td>{agent.totalCustomers}</td>
                      <td className="currency font-semibold text-emerald-600">₹{agent.monthCollection.toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
