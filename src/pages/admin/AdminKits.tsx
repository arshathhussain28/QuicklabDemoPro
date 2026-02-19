import React, { useState } from 'react';
import { useAppData } from '@/context/AppDataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, FlaskConical, Pencil } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ModalForm from '@/components/ModalForm';
import { useToast } from '@/hooks/use-toast';

const AdminKits: React.FC = () => {
  const { data, addKitParameter, removeKitParameter, updateKitParameter } = useAppData();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', category: '', machineId: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!form.name || !form.machineId) return;

    if (isEditing && editingId) {
      await updateKitParameter({ id: editingId, ...form });
      toast({ title: 'Kit parameter updated' });
    } else {
      addKitParameter(form);
      toast({ title: 'Kit parameter added' });
    }

    setForm({ name: '', category: '', machineId: '' });
    setOpen(false);
    setIsEditing(false);
    setEditingId(null);
  };

  const startEdit = (k: any) => {
    setForm({ name: k.name, category: k.category || '', machineId: k.machineId });
    setEditingId(k.id);
    setIsEditing(true);
    setOpen(true);
  };

  const openAdd = () => {
    setForm({ name: '', category: '', machineId: '' });
    setIsEditing(false);
    setEditingId(null);
    setOpen(true);
  };

  const grouped = data.machines.map(m => ({
    machine: m,
    kits: data.kitParameters.filter(k => k.machineId === m.id),
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <FlaskConical className="w-6 h-6 text-primary" /> Kit Parameters
          </h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">Test parameters grouped by machine</p>
        </div>
        <Button onClick={openAdd} className="w-full sm:w-auto gradient-primary text-primary-foreground btn-glow">
          <Plus className="w-4 h-4 mr-2" /> Add Parameter
        </Button>
      </div>

      <div className="grid gap-6">
        {grouped.map(({ machine, kits }, i) => (
          <div key={machine.id} className="glass-card rounded-xl p-5 animate-slide-up" style={{ animationDelay: `${i * 80}ms` }}>
            <h3 className="font-semibold text-foreground mb-3">{machine.name}</h3>
            {kits.length === 0 ? (
              <p className="text-sm text-muted-foreground">No parameters defined</p>
            ) : (
              <div className="space-y-2">
                {kits.map(k => (
                  <div key={k.id} className="flex items-center justify-between py-2 px-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-foreground">{k.name}</span>
                      {k.category && <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-700">{k.category}</span>}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => startEdit(k)} className="text-muted-foreground hover:text-primary h-7 w-7">
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => removeKitParameter(k.id)} className="text-muted-foreground hover:text-destructive h-7 w-7">
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <ModalForm open={open} onClose={() => setOpen(false)} title={isEditing ? "Edit Kit Parameter" : "Add Kit Parameter"} onSubmit={handleSubmit}>
        <div className="space-y-2">
          <Label>Machine</Label>
          <Select value={form.machineId} onValueChange={v => setForm(f => ({ ...f, machineId: v }))}>
            <SelectTrigger><SelectValue placeholder="Select machine" /></SelectTrigger>
            <SelectContent>
              {data.machines.map(m => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2"><Label>Parameter Name</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. CBC Panel" /></div>
        <div className="space-y-2"><Label>Category (Optional)</Label><Input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} placeholder="e.g. Inflammation, Cardiac" /></div>
      </ModalForm>
    </div>
  );
};

export default AdminKits;
