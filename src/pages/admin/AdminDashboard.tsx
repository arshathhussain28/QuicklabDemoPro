import React from 'react';
import { useAppData } from '@/context/AppDataContext';
import StatCard from '@/components/StatCard';
import { Users, Building2, Cpu, ClipboardList, Clock, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

const AdminDashboard: React.FC = () => {
  const { data } = useAppData();
  const navigate = useNavigate();
  const pending = data.demoRequests.filter(r => r.status === 'pending').length;
  const approved = data.demoRequests.filter(r => r.status === 'approved').length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">QuickLab Demo Pro — Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of demo request operations</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Salespersons"
          value={data.salespersons.filter(s => s.active).length}
          icon={Users}
          subtitle="Active team members"
          onClick={() => navigate('/admin/salespersons')}
        />
        <StatCard
          title="Distributors"
          value={data.distributors.length}
          icon={Building2}
          subtitle="Partner network"
          onClick={() => navigate('/admin/distributors')}
        />
        <StatCard
          title="Machines"
          value={data.machines.length}
          icon={Cpu}
          subtitle="Available instruments"
          onClick={() => navigate('/admin/machines')}
        />
        <StatCard
          title="Demo Requests"
          value={data.demoRequests.length}
          icon={ClipboardList}
          subtitle={`${pending} pending`}
          onClick={() => navigate('/admin/requests')}
        />
      </div>

      <div className="glass-card rounded-xl p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Recent Demo Requests</h2>
        {data.demoRequests.length === 0 ? (
          <p className="text-muted-foreground text-sm">No requests yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-3 font-medium text-muted-foreground">Salesperson</th>
                  <th className="text-left py-3 px-3 font-medium text-muted-foreground">Machine</th>
                  <th className="text-left py-3 px-3 font-medium text-muted-foreground">Demo Type</th>
                  <th className="text-left py-3 px-3 font-medium text-muted-foreground">Date</th>
                  <th className="text-left py-3 px-3 font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.demoRequests.slice(-5).reverse().map(req => {
                  const sp = data.salespersons.find(s => s.id === req.salespersonId);
                  const machine = data.machines.find(m => m.id === req.machineId);
                  return (
                    <tr key={req.id} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                      <td className="py-3 px-3 text-foreground">{sp?.name || 'Unknown'}</td>
                      <td className="py-3 px-3 text-foreground">{machine?.name || 'Unknown'} ({req.model})</td>
                      <td className="py-3 px-3 text-foreground">{req.demoType}</td>
                      <td className="py-3 px-3 text-foreground">{req.proposedDate}</td>
                      <td className="py-3 px-3">
                        <Badge variant={req.status === 'pending' ? 'secondary' : req.status === 'approved' ? 'default' : 'outline'} className={req.status === 'approved' ? 'bg-success text-success-foreground' : ''}>
                          {req.status}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
