'use client';
// src/app/dashboard/settings/page.tsx
import { useEffect, useState } from 'react';
import Header from '@/components/layout/Header';
import { api } from '@/lib/api';
import { Save, Building } from 'lucide-react';

export default function SettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.get<any>('/api/settings').then(d => setSettings(d.settings || {})).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/api/settings', settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const set = (k: string, v: string) => setSettings(s => ({ ...s, [k]: v }));

  const fields = [
    { key: 'company_name', label: 'Company Name', type: 'text' },
    { key: 'company_address', label: 'Company Address', type: 'text' },
    { key: 'company_phone', label: 'Company Phone', type: 'text' },
    { key: 'company_email', label: 'Company Email', type: 'email' },
    { key: 'currency', label: 'Currency Symbol', type: 'text' },
  ];

  const emailFields = [
    { key: 'smtp_host', label: 'SMTP Host', type: 'text' },
    { key: 'smtp_port', label: 'SMTP Port', type: 'text' },
  ];

  if (loading) return <div><Header title="Settings" /><div className="flex items-center justify-center h-64"><div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full" /></div></div>;

  return (
    <div>
      <Header title="Settings" subtitle="System configuration and preferences" />
      <div className="p-6">
        <form onSubmit={handleSave} className="max-w-2xl space-y-6">
          {saved && (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-400">
              ✓ Settings saved successfully
            </div>
          )}

          <div className="bg-card rounded-xl border shadow-sm p-5">
            <div className="flex items-center gap-2 mb-5">
              <Building className="w-5 h-5 text-muted-foreground" />
              <h3 className="font-semibold">Company Information</h3>
            </div>
            <div className="space-y-4">
              {fields.map(f => (
                <div key={f.key}>
                  <label className="form-label">{f.label}</label>
                  <input type={f.type} value={settings[f.key] || ''}
                    onChange={e => set(f.key, e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card rounded-xl border shadow-sm p-5">
            <h3 className="font-semibold mb-5">Email / SMTP Settings</h3>
            <div className="grid grid-cols-2 gap-4">
              {emailFields.map(f => (
                <div key={f.key}>
                  <label className="form-label">{f.label}</label>
                  <input type={f.type} value={settings[f.key] || ''}
                    onChange={e => set(f.key, e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-3">Configure SMTP credentials in the .env file for security.</p>
          </div>

          <button type="submit" disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 disabled:opacity-60">
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </form>
      </div>
    </div>
  );
}
