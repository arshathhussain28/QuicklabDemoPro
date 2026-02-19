import React, { useState } from 'react';
import { useAppData } from '@/context/AppDataContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ClipboardList, Eye, FileText } from 'lucide-react';
import ModalForm from '@/components/ModalForm';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const statusColors: Record<string, string> = {
  pending: 'bg-warning/10 text-warning border-warning/20',
  approved: 'bg-success/10 text-success border-success/20',
  dispatched: 'bg-info/10 text-info border-info/20',
  returned: 'bg-muted text-muted-foreground',
  completed: 'bg-success/10 text-success border-success/20',
};

const AdminRequests: React.FC = () => {
  const { data, updateDemoRequest } = useAppData();
  const { toast } = useToast();
  const navigate = useNavigate(); // Hook for navigation
  const [searchTerm, setSearchTerm] = useState('');

  // Date formatter
  const formatDate = (dateString: string) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('en-GB').replace(/\//g, '-'); // DD-MM-YYYY
  };
  const [editId, setEditId] = useState<string | null>(null);
  const [dispatchForm, setDispatchForm] = useState({
    dispatchedBy: '',
    dispatchDate: '',
    courierDetails: '',
    trackingNumber: '',
    conditionOnReturn: '',
    machineSerialNumber: '' // New field
  });

  const editReq = data.demoRequests.find(r => r.id === editId);

  const handleDispatchSave = () => {
    if (!editId) return;
    updateDemoRequest(editId, { ...dispatchForm, status: 'dispatched' });
    setEditId(null);
    toast({ title: 'Request updated', description: 'Dispatch details saved.' });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <ClipboardList className="w-6 h-6 text-primary" /> Demo Requests
        </h1>
        <p className="text-muted-foreground mt-1">Manage all demo requests from sales team</p>
      </div>

      <div className="flex justify-between items-center bg-muted/30 p-4 rounded-t-xl border-b border-border/50">
        <div className="relative w-64">
          {/* Search Input */}
          <Input
            placeholder="Search Request ID..."
            className="pl-8 bg-background"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <ClipboardList className="w-4 h-4 absolute left-2.5 top-3 text-muted-foreground" />
        </div>
      </div>

      <div className="glass-card rounded-b-xl border-t-0">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50">
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">ID</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Salesperson</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Machine</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Distributor</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Date</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Urgency</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">PDF</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.demoRequests.filter(req => {
                if (!searchTerm) return true;
                const searchLower = searchTerm.toLowerCase();
                // Filter by readableId or ID or Salesperson Name
                return (req.readableId?.includes(searchLower)) ||
                  (req.id.includes(searchLower)) ||
                  (data.salespersons.find(s => s.id === req.salespersonId)?.name.toLowerCase().includes(searchLower));
              }).map((req) => {
                const sp = data.salespersons.find(s => s.id === req.salespersonId);
                const machine = data.machines.find(m => m.id === req.machineId);
                const dist = data.distributors.find(d => d.id === req.distributorId);
                return (
                  <tr key={req.id} className="border-t border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4 text-foreground font-medium">#{req.readableId || req.id.slice(0, 6)}</td>
                    <td className="py-3 px-4 text-foreground">{sp?.name || 'N/A'}</td>
                    <td className="py-3 px-4 text-foreground">{machine?.name} ({req.model})</td>
                    <td className="py-3 px-4 text-foreground">{dist?.name || 'N/A'}</td>
                    <td className="py-3 px-4 text-foreground">{formatDate(req.proposedDate)}</td>
                    <td className="py-3 px-4"><Badge variant="outline">{req.urgencyLevel}</Badge></td>
                    <td className="py-3 px-4"><Badge className={statusColors[req.status] || ''}>{req.status}</Badge></td>
                    <td className="py-3 px-4">
                      <Button variant="ghost" size="icon" onClick={() => navigate(`/sales/preview-pdf/${req.id}`, { state: { request: req } })} title="View PDF">
                        <FileText className="w-4 h-4 text-primary" />
                      </Button>
                    </td>
                    <td className="py-3 px-4">
                      <Button variant="ghost" size="sm" onClick={() => {
                        setEditId(req.id);
                        setDispatchForm({
                          dispatchedBy: req.dispatchedBy || '', dispatchDate: req.dispatchDate || '',
                          courierDetails: req.courierDetails || '', trackingNumber: req.trackingNumber || '',
                          conditionOnReturn: req.conditionOnReturn || '',
                          machineSerialNumber: req.machineSerialNumber || '', // New field
                        });
                      }}>
                        <Eye className="w-4 h-4 mr-1" /> Manage
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden grid gap-4 p-4">
          {data.demoRequests.filter(req => {
            if (!searchTerm) return true;
            const searchLower = searchTerm.toLowerCase();
            return (req.readableId?.includes(searchLower)) ||
              (req.id.includes(searchLower)) ||
              (data.salespersons.find(s => s.id === req.salespersonId)?.name.toLowerCase().includes(searchLower));
          }).map((req) => {
            const sp = data.salespersons.find(s => s.id === req.salespersonId);
            const machine = data.machines.find(m => m.id === req.machineId);
            const dist = data.distributors.find(d => d.id === req.distributorId);
            return (
              <div key={req.id} className="bg-card/50 backdrop-blur-sm border border-border/60 rounded-xl p-4 shadow-sm hover:shadow-md transition-all animate-slide-up">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex flex-col">
                    <span className="font-bold text-lg text-foreground tracking-tight">#{req.readableId || req.id.slice(0, 6)}</span>
                    <span className="text-xs text-muted-foreground font-mono">{formatDate(req.proposedDate)}</span>
                  </div>
                  <Badge className={`${statusColors[req.status] || ''} px-2 py-0.5 text-xs uppercase tracking-wider`}>{req.status}</Badge>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Machine:</span>
                    <span className="font-medium text-foreground text-right">{machine?.name}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Salesperson:</span>
                    <span className="font-medium text-foreground text-right">{sp?.name}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Distributor:</span>
                    <span className="font-medium text-foreground text-right">{dist?.name}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Urgency:</span>
                    <Badge variant="outline" className="text-xs">{req.urgencyLevel}</Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border/50">
                  <Button variant="outline" size="sm" className="w-full h-9" onClick={() => navigate(`/sales/preview-pdf/${req.id}`, { state: { request: req } })}>
                    <FileText className="w-3.5 h-3.5 mr-1.5" /> PDF
                  </Button>
                  <Button size="sm" className="w-full h-9 gradient-primary text-primary-foreground" onClick={() => {
                    setEditId(req.id);
                    setDispatchForm({
                      dispatchedBy: req.dispatchedBy || '', dispatchDate: req.dispatchDate || '',
                      courierDetails: req.courierDetails || '', trackingNumber: req.trackingNumber || '',
                      conditionOnReturn: req.conditionOnReturn || '',
                      machineSerialNumber: req.machineSerialNumber || '',
                    });
                  }}>
                    <Eye className="w-3.5 h-3.5 mr-1.5" /> Manage
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <ModalForm open={!!editId} onClose={() => setEditId(null)} title="Dispatch Details (Admin)" onSubmit={handleDispatchSave} submitLabel="Save & Dispatch">
        {editReq && (
          <>
            <div className="flex justify-between items-center bg-muted/40 p-3 rounded-lg mb-4 border border-border/50">
              <span className="text-sm font-medium text-slate-700">Review Request Details</span>
              <Button variant="outline" size="sm" onClick={() => navigate(`/sales/preview-pdf/${editReq.id}`, { state: { request: editReq } })}>
                <Eye className="w-4 h-4 mr-2" /> View PDF
              </Button>
            </div>
            <div className="space-y-2"><Label>Machine Serial Number * (Required for Dispatch)</Label><Input value={dispatchForm.machineSerialNumber} onChange={e => setDispatchForm(f => ({ ...f, machineSerialNumber: e.target.value }))} /></div>
            <div className="space-y-2"><Label>Dispatched By</Label><Input value={dispatchForm.dispatchedBy} onChange={e => setDispatchForm(f => ({ ...f, dispatchedBy: e.target.value }))} /></div>
            <div className="space-y-2"><Label>Dispatch Date</Label><Input type="date" value={dispatchForm.dispatchDate} onChange={e => setDispatchForm(f => ({ ...f, dispatchDate: e.target.value }))} /></div>
            <div className="space-y-2"><Label>Courier / Transport</Label><Input value={dispatchForm.courierDetails} onChange={e => setDispatchForm(f => ({ ...f, courierDetails: e.target.value }))} /></div>
            <div className="space-y-2"><Label>Tracking Number</Label><Input value={dispatchForm.trackingNumber} onChange={e => setDispatchForm(f => ({ ...f, trackingNumber: e.target.value }))} /></div>
            <div className="space-y-2"><Label>Condition on Return</Label><Input value={dispatchForm.conditionOnReturn} onChange={e => setDispatchForm(f => ({ ...f, conditionOnReturn: e.target.value }))} /></div>
          </>
        )}
      </ModalForm>
    </div>
  );
};

export default AdminRequests;
