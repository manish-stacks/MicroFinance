'use client';
// src/components/forms/PartyFormModal.tsx
import { useState, useEffect } from 'react';
import { partiesApi, agentsApi } from '@/lib/api';
import { X, ChevronDown, ChevronUp } from 'lucide-react';

interface Props {
  party?: any;
  onClose: () => void;
  onSaved: () => void;
}

const SECTIONS = ['Personal Info', 'Address & Documents', 'Guarantors', 'Bank Details', 'Financial'];

export default function PartyFormModal({ party, onClose, onSaved }: Props) {
  const [section, setSection] = useState(0);
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: '', fatherName: '', mobile1: '', mobile2: '', email: '',
    gender: '', occupation: '', remarks: '',
    area: '', city: '', state: '', pincode: '',
    pan: '', aadhaar: '', voterId: '',
    guarantor1Name: '', guarantor1Mobile: '', guarantor1Relation: '', guarantor1Address: '',
    guarantor1Pan: '', guarantor1Aadhaar: '', guarantor1VoterId: '',
    guarantor2Name: '', guarantor2Mobile: '', guarantor2Relation: '', guarantor2Address: '',
    guarantor2Pan: '', guarantor2Aadhaar: '', guarantor2VoterId: '',
    bankName: '', bankIfsc: '', bankAccountNo: '', bankAccountHolder: '',
    agentId: '',
    ...party,
    birthdate: party?.birthdate ? party.birthdate.split('T')[0] : '',
    loanLimit: party?.loanLimit ? String(party.loanLimit) : '0',
  });

  useEffect(() => {
    agentsApi.list().then((d) => setAgents(d.agents.filter((a: any) => a.role === 'AGENT'))).catch(() => { });
  }, []);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (party?.id) {
        await partiesApi.update(party.id, form);
      } else {
        await partiesApi.create(form);
      }
      onSaved();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const Input = ({ label, field, type = 'text', required = false }: { label: string; field: string; type?: string; required?: boolean }) => (
    <div>
      <label className="form-label">{label}{required && <span className="text-red-500 ml-0.5">*</span>}</label>
      <input
        type={type}
        value={(form as any)[field] || ''}
        onChange={(e) => set(field, e.target.value)}
        required={required}
        className="w-full px-3 py-2.5 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
      />
    </div>
  );

  const Select = ({ label, field, options }: { label: string; field: string; options: { value: string; label: string }[] }) => (
    <div>
      <label className="form-label">{label}</label>
      <select
        value={(form as any)[field] || ''}
        onChange={(e) => set(field, e.target.value)}
        className="w-full px-3 py-2.5 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
      >
        <option value="">Select...</option>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );

  const sectionContent = [
    // Personal Info
    <div key="personal" className="grid grid-cols-2 gap-4">
      <Input label="Full Name" field="name" required />
      <Input label="Father's Name" field="fatherName" />
      <Input label="Mobile 1" field="mobile1" required />
      <Input label="Mobile 2" field="mobile2" />
      <Input label="Email" field="email" type="email" />
      <Select label="Gender" field="gender" options={[
        { value: 'MALE', label: 'Male' },
        { value: 'FEMALE', label: 'Female' },
        { value: 'OTHER', label: 'Other' },
      ]} />
      <Input label="Date of Birth" field="birthdate" type="date" />
      <Input label="Occupation" field="occupation" />
      <Select label="Assign Agent" field="agentId" options={agents.map((a) => ({ value: a.id, label: `${a.name} (${a.agentCode})` }))} />
      <div className="col-span-2">
        <label className="form-label">Remarks</label>
        <textarea
          value={form.remarks || ''}
          onChange={(e) => set('remarks', e.target.value)}
          rows={2}
          className="w-full px-3 py-2.5 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
        />
      </div>
    </div>,

    // Address & Documents
    <div key="address" className="grid grid-cols-2 gap-4">
      <div className="col-span-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Address</p>
      </div>
      <div className="col-span-2"><Input label="Area / Street" field="area" /></div>
      <Input label="City" field="city" />
      <Input label="State" field="state" />
      <Input label="Pincode" field="pincode" />
      <div className="col-span-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 mt-2">Identity Documents</p>
      </div>
      <Input label="PAN Number" field="pan" />
      <Input label="Aadhaar Number" field="aadhaar" />
      <Input label="Voter ID" field="voterId" />
    </div>,

    // Guarantors
    <div key="guarantors" className="space-y-5">
      <div>
        <p className="text-sm font-semibold mb-3 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">1</span>
          Guarantor / Reference 1
        </p>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Name" field="guarantor1Name" />
          <Input label="Mobile" field="guarantor1Mobile" />
          <Input label="Relation" field="guarantor1Relation" />
          <div className="col-span-2"><Input label="Address" field="guarantor1Address" /></div>
          <Input label="PAN" field="guarantor1Pan" />
          <Input label="Aadhaar" field="guarantor1Aadhaar" />
          <Input label="Voter ID" field="guarantor1VoterId" />
        </div>
      </div>
      <div className="border-t pt-4">
        <p className="text-sm font-semibold mb-3 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-muted text-muted-foreground text-xs flex items-center justify-center">2</span>
          Guarantor / Reference 2
        </p>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Name" field="guarantor2Name" />
          <Input label="Mobile" field="guarantor2Mobile" />
          <Input label="Relation" field="guarantor2Relation" />
          <div className="col-span-2"><Input label="Address" field="guarantor2Address" /></div>
          <Input label="PAN" field="guarantor2Pan" />
          <Input label="Aadhaar" field="guarantor2Aadhaar" />
          <Input label="Voter ID" field="guarantor2VoterId" />
        </div>
      </div>
    </div>,

    // Bank Details
    <div key="bank" className="grid grid-cols-2 gap-4">
      <Input label="Bank Name" field="bankName" />
      <Input label="IFSC Code" field="bankIfsc" />
      <Input label="Account Number" field="bankAccountNo" />
      <Input label="Account Holder Name" field="bankAccountHolder" />
    </div>,

    // Financial
    <div key="financial" className="grid grid-cols-2 gap-4">
      <Input label="Loan Limit (₹)" field="loanLimit" type="number" />
    </div>,
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 backdrop-blur-sm overflow-y-auto py-8">
      <div className="bg-card w-full max-w-2xl mx-4 rounded-2xl border shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b">
          <div>
            <h2 className="font-bold text-lg">{party ? 'Edit Party' : 'Add New Party'}</h2>
            <p className="text-sm text-muted-foreground">Section {section + 1} of {SECTIONS.length}: {SECTIONS[section]}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section tabs */}
        <div className="flex border-b overflow-x-auto">
          {SECTIONS.map((s, i) => (
            <button
              key={s}
              onClick={() => setSection(i)}
              className={`px-4 py-3 text-xs font-medium whitespace-nowrap border-b-2 transition-colors ${i === section
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 min-h-64">
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm dark:bg-red-950/30 dark:border-red-800 dark:text-red-400">
                {error}
              </div>
            )}
            {sectionContent[section]}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t flex items-center justify-between">
            <button
              type="button"
              onClick={() => setSection((s) => Math.max(0, s - 1))}
              disabled={section === 0}
              className="px-4 py-2 rounded-lg border text-sm hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
            >
              ← Previous
            </button>
            <div className="flex gap-2">
              {section < SECTIONS.length - 1 ? (
                <button
                  type="button"
                  onClick={() => setSection((s) => s + 1)}
                  className="px-5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90"
                >
                  Next →
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-60"
                >
                  {loading ? 'Saving...' : party ? 'Update Party' : 'Create Party'}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
