'use client';
// src/components/layout/Sidebar.tsx
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import {
  LayoutDashboard, Users, CreditCard, DollarSign,
  BarChart3, Settings, LogOut, UserCog, ChevronRight,
  Banknote, TrendingUp, ClipboardList,
} from 'lucide-react';

const navItems = [
  {
    title: 'Main',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'SUB_ADMIN', 'AGENT'] },
    ],
  },
  {
    title: 'Lending',
    items: [
      { href: '/dashboard/parties', label: 'Party Management', icon: Users, roles: ['ADMIN', 'SUB_ADMIN', 'AGENT'] },
      { href: '/dashboard/loans', label: 'Loans', icon: Banknote, roles: ['ADMIN', 'SUB_ADMIN', 'AGENT'] },
      { href: '/dashboard/payments', label: 'Payments & Collections', icon: DollarSign, roles: ['ADMIN', 'SUB_ADMIN', 'AGENT'] },
    ],
  },
  {
    title: 'Analytics',
    items: [
      { href: '/dashboard/reports', label: 'Reports', icon: BarChart3, roles: ['ADMIN', 'SUB_ADMIN'] },
      { href: '/dashboard/collection', label: 'Collection Sheet', icon: ClipboardList, roles: ['ADMIN', 'SUB_ADMIN', 'AGENT'] },
    ],
  },
  {
    title: 'Administration',
    items: [
      { href: '/dashboard/agents', label: 'Agents', icon: UserCog, roles: ['ADMIN', 'SUB_ADMIN'] },
      { href: '/dashboard/settings', label: 'Settings', icon: Settings, roles: ['ADMIN'] },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  const filteredNav = navItems.map((group) => ({
    ...group,
    items: group.items.filter((item) => !user || item.roles.includes(user.role)),
  })).filter((group) => group.items.length > 0);

  return (
    <aside className="w-64 h-screen bg-card border-r flex flex-col fixed left-0 top-0 z-30">
      {/* Logo */}
      <div className="px-5 py-5 border-b">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
            <Banknote className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <p className="font-bold text-sm leading-tight">MicroFinance Pro</p>
            <p className="text-xs text-muted-foreground">Loan Management</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-6">
        {filteredNav.map((group) => (
          <div key={group.title}>
            <p className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {group.title}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`sidebar-item ${isActive ? 'active' : ''}`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="flex-1">{item.label}</span>
                    {isActive && <ChevronRight className="w-3 h-3 opacity-60" />}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User section */}
      <div className="px-3 py-4 border-t">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-muted/50 mb-2">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold text-sm flex-shrink-0">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.name}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="sidebar-item w-full text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
