import React, { useState } from 'react';
import { useAppData } from '@/context/AppDataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Cpu, Pencil } from 'lucide-react';
import ModalForm from '@/components/ModalForm';
import { useToast } from '@/hooks/use-toast';

const AdminMachines: React.FC = () => {
  const { data, addMachine, removeMachine, updateMachine } = useAppData();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', models: '', category: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);


  const handleSubmit = async () => {
    if (!form.name || !form.models) return;

    const modelsArray = form.models.split(',').map(s => s.trim()).filter(Boolean);

    if (isEditing && editingId) {
      await updateMachine({ id: editingId, name: form.name, models: modelsArray, category: form.category });
      toast({ title: 'Machine updated' });
    } else {
      addMachine({ name: form.name, models: modelsArray, category: form.category });
      toast({ title: 'Machine added' });
    }

    setForm({ name: '', models: '', category: '' });
    setOpen(false);
    setIsEditing(false);
    setEditingId(null);
  };

  const startEdit = (m: any) => {
    setForm({ name: m.name, models: m.models.join(', '), category: m.category || '' });
    setEditingId(m.id);
    setIsEditing(true);
    setOpen(true);
  };

  const openAdd = () => {
    setForm({ name: '', models: '', category: '' });
    setIsEditing(false);
    setEditingId(null);
    setOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Cpu className="w-6 h-6 text-primary" /> Machines / Instruments
          </h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">Manage available instruments and models</p>
        </div>
        <Button onClick={openAdd} className="w-full sm:w-auto gradient-primary text-primary-foreground btn-glow">
          <Plus className="w-4 h-4 mr-2" /> Add Machine
        </Button>
      </div>

      <div className="grid gap-4">
        {data.machines.map((m, i) => (
          <div key={m.id} className="glass-card rounded-xl p-4 md:p-5 animate-slide-up" style={{ animationDelay: `${i * 50}ms` }}>
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="w-full sm:w-auto">
                <p className="font-medium text-foreground text-lg">{m.name}</p>
                <p className="text-sm text-muted-foreground mb-2">{m.category}</p>
                <div className="flex flex-wrap gap-1.5">
                  {m.models.map(model => (
                    <Badge key={model} variant="secondary" className="text-xs">{model}</Badge>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 w-full sm:w-auto justify-end border-t sm:border-t-0 border-border/50 pt-3 sm:pt-0 mt-2 sm:mt-0">
                <Button variant="ghost" size="icon" onClick={() => startEdit(m)} className="text-muted-foreground hover:text-primary">
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => removeMachine(m.id)} className="text-muted-foreground hover:text-destructive">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <ModalForm open={open} onClose={() => setOpen(false)} title={isEditing ? "Edit Machine" : "Add Machine"} onSubmit={handleSubmit}>
        <div className="space-y-2"><Label>Instrument Name</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Hematology Analyzer" /></div>
        <div className="space-y-2"><Label>Models (comma-separated)</Label><Input value={form.models} onChange={e => setForm(f => ({ ...f, models: e.target.value }))} placeholder="HA-3000, HA-5000" /></div>
        <div className="space-y-2"><Label>Category</Label><Input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} placeholder="e.g. Diagnostics" /></div>
      </ModalForm>
    </div>
  );
};

export default AdminMachines;
