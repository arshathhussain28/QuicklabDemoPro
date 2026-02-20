import React, { createContext, useContext, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';


export interface Salesperson {
  id: string;
  name: string;
  email: string;
  phone: string;
  region: string;
  active: boolean;
}

export interface Distributor {
  id: string;
  name: string;
  location: string;
  contactPerson: string;
  phone: string;
}

export interface Machine {
  id: string;
  name: string;
  models: string[];
  category: string;
}

export interface KitParameter {
  id: string;
  name: string;
  category?: string;
  machineId: string;
}

export interface DemoRequest {
  id: string;
  readableId?: string; // New 6-digit ID
  salespersonId: string;
  status: 'pending' | 'approved' | 'dispatched' | 'returned' | 'completed';
  createdAt: string;
  distributorId: string;
  machineId: string;
  model: string;
  demoType: string;
  proposedDate: string;
  expectedDuration: string;
  applicationParams: string[];
  sampleVolume: string;
  specialRequirements: string;
  businessPotential: string;
  competitorDetails: string;
  reasonForDemo: string;
  urgencyLevel: string;
  regionalManagerApproval: boolean;
  regionalManagerName: string;
  approvalDate: string;
  expectedReturnDate: string;
  dispatchedBy: string;
  dispatchDate: string;
  courierDetails: string;
  trackingNumber: string;
  kitItems: string; // JSON string of { kitId, kitName, quantity, unit }[]
  doctorName?: string;
  doctorDepartment?: string;
  hospitalName?: string;
  location?: string;
  conditionOnReturn: string;
  remarks: string;
  machineSerialNumber?: string;
  expectedPurchaseDate?: string;
  receivedDate?: string;
}


interface AppData {
  salespersons: Salesperson[];
  distributors: Distributor[];
  machines: Machine[];
  kitParameters: KitParameter[];
  demoTypes: string[];
  demoRequests: DemoRequest[];
}

interface AppContextType {
  data: AppData;
  addSalesperson: (s: Omit<Salesperson, 'id'>) => Promise<boolean>;
  removeSalesperson: (id: string) => void;
  toggleSalespersonStatus: (id: string, currentStatus: boolean) => Promise<void>;
  addDistributor: (d: Omit<Distributor, 'id'>) => void;
  removeDistributor: (id: string) => void;
  addMachine: (m: Omit<Machine, 'id'>) => void;
  removeMachine: (id: string) => void;
  addKitParameter: (k: Omit<KitParameter, 'id'>) => void;
  removeKitParameter: (id: string) => void;
  updateSalesperson: (s: Salesperson) => Promise<void>;
  updateMachine: (m: Machine) => Promise<void>;
  updateKitParameter: (k: KitParameter) => Promise<void>;
  addDemoRequest: (r: Omit<DemoRequest, 'id' | 'createdAt' | 'status'>) => Promise<{ success: boolean, error?: string, request?: DemoRequest }>;
  updateDemoRequest: (id: string, updates: Partial<DemoRequest>) => void;
  markAsReceived: (id: string) => Promise<boolean>;
  deleteDemoRequest: (id: string) => Promise<boolean>;
}

const uid = () => Math.random().toString(36).slice(2, 10);

const initialData: AppData = {
  salespersons: [],
  distributors: [],
  machines: [],
  kitParameters: [],
  demoTypes: [],
  demoRequests: [],
};

const MOCK_APP_DATA: AppData = {
  salespersons: [
    { id: '1', name: 'Rahul Sharma', email: 'rahul@quicklab.com', phone: '9876543210', region: 'North', active: true },
    { id: '2', name: 'Priya Patel', email: 'priya@quicklab.com', phone: '9876543211', region: 'West', active: true },
    { id: '3', name: 'Amit Kumar', email: 'amit@quicklab.com', phone: '9876543212', region: 'South', active: false },
  ],
  distributors: [
    { id: 'd1', name: 'MedSupply India', location: 'Mumbai', contactPerson: 'Vikram Mehta', phone: '+91 22 4567 8901' },
    { id: 'd2', name: 'Delhi Diagnostics', location: 'Delhi', contactPerson: 'Suresh Gupta', phone: '+91 11 2345 6789' },
  ],
  machines: [
    { id: 'm1', name: 'Hematology Analyzer', category: 'Diagnostics', models: ['HA-3000', 'HA-5000'] },
    { id: 'm2', name: 'Biochemistry Analyzer', category: 'Diagnostics', models: ['BA-200', 'BA-400'] },
  ],
  kitParameters: [
    { id: 'k1', name: 'CBC Panel', category: 'Hematology', machineId: 'm1' },
    { id: 'k2', name: 'Lipid Profile', category: 'Biochemistry', machineId: 'm2' },
  ],
  demoTypes: ['Product Evaluation', 'Pre-Purchase Demo', 'Conference Demo', 'Training Demo'],
  demoRequests: [
    {
      id: 'r1', readableId: '100001', salespersonId: '1', status: 'pending', createdAt: new Date().toISOString(),
      distributorId: 'd1', machineId: 'm1', model: 'HA-5000', demoType: 'Product Evaluation',
      proposedDate: '2026-03-01', expectedDuration: '1 week', applicationParams: ['CBC'],
      sampleVolume: '50/day', specialRequirements: 'None', businessPotential: 'High',
      competitorDetails: 'Mindray', reasonForDemo: 'Evaluation', urgencyLevel: 'Medium',
      regionalManagerApproval: true, regionalManagerName: 'Rajesh Singh', approvalDate: '2026-02-15',
      expectedReturnDate: '2026-03-08', dispatchedBy: '', dispatchDate: '', courierDetails: '', trackingNumber: '',
      kitItems: JSON.stringify([{ kitId: 'k1', quantity: 2, unit: 'Box' }]),
      location: 'Mumbai City Hospital', conditionOnReturn: '', remarks: ''
    },
    {
      id: 'r2', readableId: '100002', salespersonId: '2', status: 'approved', createdAt: new Date(Date.now() - 86400000).toISOString(),
      distributorId: 'd2', machineId: 'm2', model: 'BA-200', demoType: 'Pre-Purchase Demo',
      proposedDate: '2026-03-05', expectedDuration: '3 days', applicationParams: ['Lipid'],
      sampleVolume: '20/day', specialRequirements: 'None', businessPotential: 'Medium',
      competitorDetails: 'Erba', reasonForDemo: 'Urgent Requirement', urgencyLevel: 'High',
      regionalManagerApproval: true, regionalManagerName: 'Rajesh Singh', approvalDate: '2026-02-18',
      expectedReturnDate: '2026-03-08', dispatchedBy: '', dispatchDate: '', courierDetails: '', trackingNumber: '',
      kitItems: JSON.stringify([{ kitId: 'k2', quantity: 1, unit: 'Pack' }]),
      location: 'Apollo Delhi', conditionOnReturn: '', remarks: ''
    }
  ]
};

const AppContext = createContext<AppContextType | null>(null);

export const useAppData = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppData must be used within AppDataProvider');
  return ctx;
};

export const AppDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<AppData>({
    salespersons: [], distributors: [], machines: [], kitParameters: [], demoRequests: [], demoTypes: []
  });
  const { user } = useAuth();

  // Helper to get API URL dynamically
  const getApiUrl = () => import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000/api`;

  // Sync data to localStorage whenever it changes (for Demo Persistence)
  React.useEffect(() => {
    if (data.salespersons.length > 0 || data.demoRequests.length > 0) {
      localStorage.setItem('demo_data_v2', JSON.stringify(data));
    }
  }, [data]);

  const fetchData = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      // Detect if we are in "Demo Mode" (using mock token)
      if (token.startsWith('mock-token')) {
        throw new Error("Demo Mode Active");
      }

      const headers = { Authorization: `Bearer ${token}` };
      const API_BASE_URL = getApiUrl();

      // Fetch Master Data
      const masterRes = await fetch(`${API_BASE_URL}/master-data`, { headers });
      const masterData = masterRes.ok ? await masterRes.json() : {};

      // Fetch Requests
      const reqRes = await fetch(`${API_BASE_URL}/requests`, { headers });
      const reqData = reqRes.ok ? await reqRes.json() : [];

      setData({
        salespersons: Array.isArray(masterData.salespersons) ? masterData.salespersons : [],
        distributors: Array.isArray(masterData.distributors) ? masterData.distributors : [],
        machines: Array.isArray(masterData.machines) ? (masterData.machines || []).map((m: any) => ({ ...m, models: m.models.map((mod: any) => mod.name) })) : [],
        kitParameters: Array.isArray(masterData.kitParameters) ? masterData.kitParameters : [],
        demoTypes: Array.isArray(masterData.demoTypes) ? masterData.demoTypes : [],
        demoRequests: Array.isArray(reqData) ? reqData : []
      });
    } catch (e) {
      console.warn("Running in Offline/Demo Mode (Backend unreachable or Mock Token)");

      // Load from LocalStorage if available, else use MOCK default
      const savedData = localStorage.getItem('demo_data_v2');
      if (savedData) {
        setData(JSON.parse(savedData));
      } else {
        setData(MOCK_APP_DATA);
      }
    }
  }, [user]);

  React.useEffect(() => {
    if (user) fetchData();
  }, [user, fetchData]);

  // Helper to update state safely
  const updateLocalData = (key: keyof AppData, newItem: any, isAdd: boolean, idKey: string = 'id') => {
    setData(prev => ({
      ...prev,
      [key]: isAdd
        ? [...prev[key], newItem]
        : (prev[key] as any[]).filter((item: any) => item[idKey] !== newItem)
    }));
  };

  const addSalesperson = useCallback(async (s: Omit<Salesperson, 'id'>) => {
    try {
      const token = localStorage.getItem('token');
      if (token?.startsWith('mock-token')) throw new Error("Demo Mode");

      const res = await fetch(`${getApiUrl()}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...s, role: 'sales', password: 'sales123' })
      });
      const json = await res.json();
      if (res.ok) {
        const newSalesperson = { ...s, id: json.userId, active: true };
        updateLocalData('salespersons', newSalesperson, true);
        return true;
      }
      return false;
    } catch (e) {
      // Offline Falback
      console.log("Offline Add Salesperson");
      const newSalesperson = { ...s, id: uid(), active: true, role: 'sales' };
      updateLocalData('salespersons', newSalesperson, true);
      return true;
    }
  }, []);

  const removeSalesperson = useCallback(async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${getApiUrl()}/auth/users/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        updateLocalData('salespersons', id, false);
      } else {
        console.error("Failed to delete salesperson, status:", res.status);
      }
    } catch (e) { console.error("Failed to remove salesperson", e); }
  }, []);

  const updateSalesperson = useCallback(async (s: Salesperson) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${getApiUrl()}/auth/users/${s.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(s)
      });
      if (res.ok) {
        const updated = await res.json();
        setData(prev => ({
          ...prev,
          salespersons: prev.salespersons.map(item => item.id === s.id ? { ...item, ...updated.user } : item)
        }));
      }
    } catch (e) { console.error("Failed to update salesperson", e); }
  }, []);

  const toggleSalespersonStatus = useCallback(async (id: string, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${getApiUrl()}/auth/users/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ active: !currentStatus })
      });
      if (res.ok) {
        setData(prev => ({
          ...prev,
          salespersons: prev.salespersons.map(s => s.id === id ? { ...s, active: !currentStatus } : s)
        }));
      }
    } catch (e) { console.error("Failed to toggle salesperson status", e); }
  }, []);

  const addDistributor = useCallback(async (d: Omit<Distributor, 'id'>) => {
    try {
      const token = localStorage.getItem('token');
      if (token?.startsWith('mock-token')) throw new Error("Demo Mode");

      const res = await fetch(`${getApiUrl()}/master-data/distributors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(d)
      });
      const newDistributor = await res.json();
      if (res.ok) updateLocalData('distributors', newDistributor, true);
    } catch (e) {
      console.log("Offline Add Distributor");
      updateLocalData('distributors', { ...d, id: uid() }, true);
    }
  }, []);

  const removeDistributor = useCallback(async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${getApiUrl()}/master-data/distributors/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        updateLocalData('distributors', id, false);
      } else {
        console.error("Failed to delete distributor, status:", res.status);
      }
    } catch (e) { console.error("Failed to remove distributor", e); }
  }, []);

  const addMachine = useCallback(async (m: Omit<Machine, 'id'>) => {
    try {
      const token = localStorage.getItem('token');
      if (token?.startsWith('mock-token')) throw new Error("Demo Mode");

      const res = await fetch(`${getApiUrl()}/master-data/machines`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(m)
      });
      const newMachine = await res.json();
      if (res.ok) {
        const transformedMachine = {
          ...newMachine,
          models: newMachine.models.map((m: any) => m.name)
        };
        updateLocalData('machines', transformedMachine, true);
      }
    } catch (e) {
      console.log("Offline Add Machine");
      updateLocalData('machines', { ...m, id: uid() }, true);
    }
  }, []);

  const removeMachine = useCallback(async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${getApiUrl()}/master-data/machines/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        updateLocalData('machines', id, false);
      } else {
        console.error("Failed to delete machine, status:", res.status);
      }
    } catch (e) { console.error("Failed to remove machine", e); }
  }, []);

  const updateMachine = useCallback(async (m: Machine) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${getApiUrl()}/master-data/machines/${m.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(m)
      });
      if (res.ok) {
        const updated = await res.json();
        const transformed = {
          ...updated,
          models: updated.models ? updated.models.map((mod: any) => mod.name) : m.models
        };
        setData(prev => ({
          ...prev,
          machines: prev.machines.map(item => item.id === m.id ? transformed : item)
        }));
      }
    } catch (e) { console.error("Failed to update machine", e); }
  }, []);

  const addKitParameter = useCallback(async (k: Omit<KitParameter, 'id'>) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${getApiUrl()}/master-data/kit-parameters`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(k)
      });
      const newKit = await res.json();
      if (res.ok) updateLocalData('kitParameters', newKit, true);
    } catch (e) { console.error("Failed to add kit", e); }
  }, []);

  const removeKitParameter = useCallback(async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${getApiUrl()}/master-data/kit-parameters/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        updateLocalData('kitParameters', id, false);
      } else {
        console.error("Failed to delete kit, status:", res.status);
      }
    } catch (e) { console.error("Failed to remove kit", e); }
  }, []);

  const updateKitParameter = useCallback(async (k: KitParameter) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${getApiUrl()}/master-data/kit-parameters/${k.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(k)
      });
      if (res.ok) {
        const updated = await res.json();
        setData(prev => ({
          ...prev,
          kitParameters: prev.kitParameters.map(item => item.id === k.id ? updated : item)
        }));
      }
    } catch (e) { console.error("Failed to update kit", e); }
  }, []);

  const addDemoRequest = useCallback(async (r: Omit<DemoRequest, 'id' | 'createdAt' | 'status'>): Promise<{ success: boolean, error?: string, request?: DemoRequest }> => {
    try {
      const token = localStorage.getItem('token');
      if (token?.startsWith('mock-token')) throw new Error("Demo Mode");

      const API_BASE_URL = getApiUrl();
      const res = await fetch(`${API_BASE_URL}/requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(r)
      });

      if (!res.ok) {
        const err = await res.json();
        return { success: false, error: err.error || 'Failed to submit request' };
      }

      const newRequest = await res.json();
      updateLocalData('demoRequests', newRequest, true);
      return { success: true, request: newRequest };
    } catch (e) {
      console.log("Offline Add Request");
      const newRequest = { ...r, id: uid(), createdAt: new Date().toISOString(), status: 'pending' as const, readableId: Math.floor(100000 + Math.random() * 900000).toString() };
      updateLocalData('demoRequests', newRequest, true);
      return { success: true, request: newRequest as DemoRequest };
    }
  }, []);

  const updateDemoRequest = useCallback(async (id: string, updates: Partial<DemoRequest>) => {
    try {
      const token = localStorage.getItem('token');
      if (token?.startsWith('mock-token')) throw new Error("Demo Mode");

      const res = await fetch(`${getApiUrl()}/requests/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(updates)
      });
      const updatedRequest = await res.json();

      if (res.ok) {
        setData(prev => ({
          ...prev,
          demoRequests: prev.demoRequests.map(r => r.id === id ? updatedRequest : r)
        }));
      }
    } catch (e) {
      console.log("Offline Update Request");
      setData(prev => ({
        ...prev,
        demoRequests: prev.demoRequests.map(r => r.id === id ? { ...r, ...updates } : r)
      }));
    }
  }, []);

  const markAsReceived = useCallback(async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${getApiUrl()}/requests/${id}/receive`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        const updatedRequest = await res.json();
        setData(prev => ({
          ...prev,
          demoRequests: prev.demoRequests.map(r => r.id === id ? updatedRequest : r)
        }));
        return true;
      }
      return false;
    } catch (e) {
      console.error("Failed to mark as received", e);
      return false;
    }
  }, []);

  const deleteDemoRequest = useCallback(async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${getApiUrl()}/requests/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        setData(prev => ({
          ...prev,
          demoRequests: prev.demoRequests.filter(r => r.id !== id)
        }));
        return true;
      }
      return false;
    } catch (e) {
      console.error("Failed to delete request", e);
      return false;
    }
  }, []);

  return (
    <AppContext.Provider value={{
      data, addSalesperson, removeSalesperson, toggleSalespersonStatus, addDistributor, removeDistributor,
      addMachine, removeMachine, addKitParameter, removeKitParameter,
      updateSalesperson, updateMachine, updateKitParameter,
      addDemoRequest, updateDemoRequest, markAsReceived, deleteDemoRequest
    }}>
      {children}
    </AppContext.Provider>
  );
};
