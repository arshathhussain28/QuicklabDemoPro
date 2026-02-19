import React, { useState } from 'react';
import { useAppData } from '@/context/AppDataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Building2 } from 'lucide-react';
import ModalForm from '@/components/ModalForm';
import { useToast } from '@/hooks/use-toast';

const AdminDistributors: React.FC = () => {
  const { data, addDistributor, removeDistributor } = useAppData();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', location: '', contactPerson: '', phone: '' });

  const handleAdd = () => {
    if (!form.name || !form.location) return;
    addDistributor(form);
    setForm({ name: '', location: '', contactPerson: '', phone: '' });
    setOpen(false);
    toast({ title: 'Distributor added' });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Building2 className="w-6 h-6 text-primary" /> Distributors
          </h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">Manage distribution partners</p>
        </div>
        <Button onClick={() => setOpen(true)} className="w-full sm:w-auto gradient-primary text-primary-foreground btn-glow">
          <Plus className="w-4 h-4 mr-2" /> Add Distributor
        </Button>
      </div>

      <div className="grid gap-4">
        {data.distributors.map((d, i) => (
          <div key={d.id} className="glass-card rounded-xl p-4 md:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-slide-up" style={{ animationDelay: `${i * 50}ms` }}>
            <div className="w-full sm:w-auto">
              <p className="font-medium text-foreground text-lg">{d.name}</p>
              <div className="flex flex-wrap gap-2 text-sm text-muted-foreground mt-1">
                <span>{d.location}</span>
                <span className="hidden sm:inline">·</span>
                <span>{d.contactPerson}</span>
                <span className="hidden sm:inline">·</span>
                <span>{d.phone}</span>
              </div>
            </div>
            <div className="flex justify-end w-full sm:w-auto border-t sm:border-t-0 border-border/50 pt-3 sm:pt-0">
              <Button variant="ghost" size="icon" onClick={() => removeDistributor(d.id)} className="text-muted-foreground hover:text-destructive">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <ModalForm open={open} onClose={() => setOpen(false)} title="Add Distributor" onSubmit={handleAdd}>
        <div className="space-y-2"><Label>Company Name</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Company name" /></div>
        <div className="space-y-2"><Label>Location</Label><Input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="City" /></div>
        <div className="space-y-2"><Label>Contact Person</Label><Input value={form.contactPerson} onChange={e => setForm(f => ({ ...f, contactPerson: e.target.value }))} placeholder="Name" /></div>
        <div className="space-y-2"><Label>Phone</Label><Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+91 XX XXXX XXXX" /></div>
      </ModalForm>
    </div>
  );
};

export default AdminDistributors;
