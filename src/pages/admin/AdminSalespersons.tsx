import React, { useState } from 'react';
import { useAppData } from '@/context/AppDataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2, Users, Pencil } from 'lucide-react';
import ModalForm from '@/components/ModalForm';
import { useToast } from '@/hooks/use-toast';

const AdminSalespersons: React.FC = () => {
  const { data, addSalesperson, removeSalesperson, toggleSalespersonStatus, updateSalesperson } = useAppData();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', region: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!form.name || !form.email) return;

    if (isEditing && editingId) {
      await updateSalesperson({ id: editingId, ...form, active: true });
      toast({ title: 'Salesperson updated', description: `${form.name} has been updated.` });
    } else {
      const success = await addSalesperson({ ...form, active: true });
      if (success) {
        toast({ title: 'Salesperson added', description: `${form.name} has been added successfully.` });
      } else {
        toast({ title: 'Error', description: 'Failed to add salesperson. Email might be in use.', variant: 'destructive' });
        return; // Don't close modal on error
      }
    }

    setForm({ name: '', email: '', phone: '', region: '' });
    setOpen(false);
    setIsEditing(false);
    setEditingId(null);
  };

  const startEdit = (sp: any) => {
    setForm({ name: sp.name, email: sp.email, phone: sp.phone, region: sp.region });
    setEditingId(sp.id);
    setIsEditing(true);
    setOpen(true);
  };

  const openAdd = () => {
    setForm({ name: '', email: '', phone: '', region: '' });
    setIsEditing(false);
    setEditingId(null);
    setOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" /> Salespersons
          </h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">Manage sales team access</p>
        </div>
        <Button onClick={openAdd} className="w-full sm:w-auto gradient-primary text-primary-foreground btn-glow">
          <Plus className="w-4 h-4 mr-2" /> Add Salesperson
        </Button>
      </div>

      <div className="grid gap-4">
        {data.salespersons.map((sp, i) => (
          <div key={sp.id} className={`glass-card rounded-xl p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-slide-up transition-all duration-300 hover:shadow-md ${!sp.active ? 'opacity-60 bg-slate-50 border-slate-200 grayscale-[0.8]' : ''}`} style={{ animationDelay: `${i * 50}ms` }}>
            <div className="flex items-center gap-3 md:gap-4 w-full md:w-auto">
              <div className="w-10 h-10 min-w-[2.5rem] rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold text-sm shadow-sm">
                {sp.name.split(' ').map((n: string) => n[0]).join('')}
              </div>
              <div className="min-w-0">
                <p className="font-medium text-foreground truncate">{sp.name}</p>
                <div className="flex flex-col sm:flex-row sm:items-center text-xs sm:text-sm text-muted-foreground gap-0.5 sm:gap-2">
                  <span className="truncate">{sp.email}</span>
                  <span className="hidden sm:inline">·</span>
                  <span className="truncate">{sp.phone}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto mt-2 md:mt-0 pt-3 md:pt-0 border-t md:border-t-0 border-border/50">
              <Badge variant="outline" className="shrink-0">{sp.region}</Badge>
              <div className="flex items-center gap-2 md:gap-3">
                <div className="flex items-center gap-2 mr-2">
                  <span className={`text-[10px] uppercase font-bold tracking-wider ${sp.active ? 'text-success' : 'text-muted-foreground'}`}>
                    {sp.active ? 'Active' : 'Inactive'}
                  </span>
                  <Switch
                    checked={sp.active}
                    onCheckedChange={() => toggleSalespersonStatus(sp.id, sp.active)}
                  />
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" onClick={() => startEdit(sp)} className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10">
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => removeSalesperson(sp.id)} className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <ModalForm open={open} onClose={() => setOpen(false)} title={isEditing ? "Edit Salesperson" : "Add Salesperson"} onSubmit={handleSubmit}>
        <div className="space-y-2"><Label>Name</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Full name" /></div>
        <div className="space-y-2"><Label>Email</Label><Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="email@medtech.com" /></div>
        <div className="space-y-2"><Label>Phone</Label><Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+91 XXXXX XXXXX" /></div>
        <div className="space-y-2"><Label>Region</Label><Input value={form.region} onChange={e => setForm(f => ({ ...f, region: e.target.value }))} placeholder="North / South / East / West" /></div>
      </ModalForm>
    </div>
  );
};

export default AdminSalespersons;
