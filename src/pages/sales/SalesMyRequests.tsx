import React from 'react';
import { useAppData } from '@/context/AppDataContext';
import { useAuth } from '@/context/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ClipboardList, Eye, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const statusColors: Record<string, string> = {
  pending: 'bg-warning/10 text-warning border-warning/20',
  approved: 'bg-success/10 text-success border-success/20',
  dispatched: 'bg-info/10 text-info border-info/20',
  returned: 'bg-muted text-muted-foreground',
  completed: 'bg-success/10 text-success border-success/20',
};

const SalesMyRequests: React.FC = () => {
  const { data, markAsReceived, deleteDemoRequest } = useAppData();
  const { user } = useAuth();
  const navigate = useNavigate();
  // Backend already filters by salespersonId for non-admins, but we keep a check just in case, 
  // or simply use data.demoRequests as is since AppDataContext fetches what's allowed.
  // Using all requests from context as context strictly respects "what the API returned".
  const myRequests = data.demoRequests;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <ClipboardList className="w-6 h-6 text-primary" /> My Requests
        </h1>
        <p className="text-muted-foreground mt-1">Track your demo requests</p>
      </div>

      {myRequests.length === 0 ? (
        <div className="glass-card rounded-xl p-12 text-center">
          <p className="text-muted-foreground">No requests yet. Create your first demo request!</p>
          <Button onClick={() => navigate('/sales/request-form')} className="mt-4 gradient-primary text-primary-foreground">
            Create Request
          </Button>
        </div>
      ) : (
        <div className="glass-card rounded-xl border-t-0">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground w-20">ID</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Machine</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Distributor</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {myRequests.map(req => {
                  const machine = data.machines.find(m => m.id === req.machineId);
                  const dist = data.distributors.find(d => d.id === req.distributorId);
                  return (
                    <tr key={req.id} className="border-t border-border/50 hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4 text-foreground font-semibold">#{req.readableId || req.id.slice(0, 6)}</td>
                      <td className="py-3 px-4 text-foreground">{machine?.name} ({req.model})</td>
                      <td className="py-3 px-4 text-foreground">{dist?.name}</td>
                      <td className="py-3 px-4 text-foreground">{req.proposedDate}</td>
                      <td className="py-3 px-4"><Badge className={statusColors[req.status]}>{req.status}</Badge></td>
                      <td className="py-3 px-4 flex items-center">
                        <Button variant="ghost" size="sm" onClick={() => navigate(`/sales/preview-pdf/${req.id}`, { state: { request: req } })}>
                          <Eye className="w-4 h-4 mr-1" /> View
                        </Button>
                        {req.status === 'dispatched' && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="ml-2 text-primary border-primary hover:bg-primary/10"
                            onClick={async () => {
                              if (confirm('Confirm received?')) {
                                await markAsReceived(req.id);
                              }
                            }}
                          >
                            Received
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="ml-2 text-muted-foreground hover:text-destructive"
                          onClick={async () => {
                            if (confirm('Are you sure you want to delete this request? This action cannot be undone.')) {
                              await deleteDemoRequest(req.id);
                            }
                          }}
                        >
                          <ClipboardList className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4 p-4">
            {myRequests.map(req => {
              const machine = data.machines.find(m => m.id === req.machineId);
              const dist = data.distributors.find(d => d.id === req.distributorId);
              return (
                <div key={req.id} className="bg-card border border-border/50 rounded-xl p-4 shadow-sm space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-bold text-foreground">#{req.readableId || req.id.slice(0, 6)}</span>
                      <p className="text-sm text-foreground">{machine?.name}</p>
                      <Badge variant="secondary" className="text-xs mt-1">{req.model}</Badge>
                    </div>
                    <Badge className={statusColors[req.status]}>{req.status}</Badge>
                  </div>

                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>Dist: {dist?.name}</p>
                    <p>Date: {req.proposedDate}</p>
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-border/50 flex-wrap">
                    <Button variant="outline" size="sm" onClick={() => navigate(`/sales/preview-pdf/${req.id}`, { state: { request: req } })}>
                      <Eye className="w-4 h-4 mr-1" /> View PDF
                    </Button>

                    {req.status === 'dispatched' && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-primary border-primary hover:bg-primary/10"
                        onClick={async () => {
                          if (confirm('Confirm received?')) {
                            await markAsReceived(req.id);
                          }
                        }}
                      >
                        Received
                      </Button>
                    )}

                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={async () => {
                        if (confirm('Are you sure you want to delete this request? This action cannot be undone.')) {
                          await deleteDemoRequest(req.id);
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesMyRequests;
