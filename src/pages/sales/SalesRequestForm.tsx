import React, { useState } from 'react';
import { useAppData } from '@/context/AppDataContext';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { FileText, ChevronRight, ChevronLeft, Send, Plus, Minus } from 'lucide-react';
import type { DemoRequest } from '@/context/AppDataContext';

const STEPS = ['Request Details', 'Demo Requirements', 'Commercial & Approval', 'Logistics'];

const SalesRequestForm: React.FC = () => {
  const { data, addDemoRequest } = useAppData();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(0);

  const [form, setForm] = useState({
    distributorId: '',
    machineId: '',
    model: '',
    demoType: '',
    proposedDate: '',
    expectedDuration: '',
    applicationParams: [] as string[],
    sampleVolume: '',
    specialRequirements: '',
    businessPotential: '',
    competitorDetails: '',
    reasonForDemo: '',
    urgencyLevel: '',
    regionalManagerApproval: false,
    regionalManagerName: '',
    approvalDate: '',
    expectedReturnDate: '',
    remarks: '',
    expectedPurchaseDate: '',
    kitItems: [] as { kitId: string, kitName: string, quantity: number, unit: string }[],
    doctorName: '',
    doctorDepartment: '',
    hospitalName: '',
    location: ''
  });

  const set = (key: string, value: any) => setForm(f => ({ ...f, [key]: value }));

  const selectedMachine = data.machines.find(m => m.id === form.machineId);
  const availableKits = data.kitParameters.filter(k => k.machineId === form.machineId);

  const handleKitChange = (kitId: string, kitName: string, checked: boolean) => {
    if (checked) {
      set('kitItems', [...form.kitItems, { kitId, kitName, quantity: 1, unit: 'Tests' }]);
      // Also update applicationParams for backward compatibility if needed, or rely solely on kitItems
      set('applicationParams', [...form.applicationParams, kitName]);
    } else {
      set('kitItems', form.kitItems.filter(k => k.kitId !== kitId));
      set('applicationParams', form.applicationParams.filter(p => p !== kitName));
    }
  };

  const updateKitQuantity = (kitId: string, quantity: number) => {
    set('kitItems', form.kitItems.map(k => k.kitId === kitId ? { ...k, quantity: Math.max(1, quantity) } : k));
  };

  const progress = ((step + 1) / STEPS.length) * 100;

  // Scroll to top of main content when step changes
  React.useEffect(() => {
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [step]);

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);
  const jumpToStep = (i: number) => setStep(i);

  const canNext = () => {
    if (step === 0) return form.distributorId && form.machineId && form.model && form.demoType && form.proposedDate;
    if (step === 1) return form.kitItems.length > 0 && form.sampleVolume && form.doctorName && form.doctorDepartment && form.hospitalName && form.location;
    if (step === 2) return form.businessPotential && form.reasonForDemo && form.urgencyLevel && form.expectedPurchaseDate;
    return true;
  };

  const handleSubmit = async () => {
    // Send kitItems as object/array, let the backend handle stringification or transport
    // However, AppDataContext type definition says kitItems is string..
    // But backend controller expects it as body parameter before stringifying.
    // We should cast it to 'any' to bypass the mismatch for now or send it as is if we change the interface.
    // The backend `createRequest` extracts `kitItems` from body and does `JSON.stringify(kitItems || [])`.
    // So we must send the ARRAY, not a string.

    const request: any = {
      salespersonId: user?.id || '',
      ...form,
      // kitItems: form.kitItems, // Send as array. 
      // But wait, the interface Omit<DemoRequest... calls for `kitItems: string`.
      // We'll temporarily cast to any or just pass the array if the backend expects it.
      // Since we changed the context to accept Omit<DemoRequest>, let's verify what `addDemoRequest` expects.
      // It expects `DemoRequest`, where `kitItems` is string.
      // If we want to send array, we should change `DemoRequest` interface or cast here.
      // Given the backend logic `JSON.stringify(kitItems)`, sending an Array is correct.
      // The `DemoRequest` interface on frontend is technically reflecting the "Stored/Fetched" state (string), 
      // but the "Payload" state might be different.
      kitItems: form.kitItems,

      dispatchedBy: '',
      dispatchDate: '',
      courierDetails: '',
      trackingNumber: '',
      conditionOnReturn: '',
      doctorName: form.doctorName,
      doctorDepartment: form.doctorDepartment,
      hospitalName: form.hospitalName,
      location: form.location
    };

    const result = await addDemoRequest(request);

    if (result.success && result.request) {
      toast({ title: 'Request submitted!', description: `Your demo request (ID: ${result.request.readableId || result.request.id}) has been sent.` });
      navigate('/sales/preview-pdf', { state: { request: result.request } });
    } else {
      toast({ variant: "destructive", title: 'Submission Failed', description: result.error || 'Please try again or contact admin.' });
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <FileText className="w-6 h-6 text-primary" /> New Demo Request
        </h1>
        <p className="text-muted-foreground mt-1">Fill all sections to submit your request</p>
      </div>

      {/* Progress */}
      <div className="glass-card rounded-xl p-5">
        <div className="flex justify-between mb-3">
          {STEPS.map((s, i) => (
            <button
              key={s}
              onClick={() => i <= step && jumpToStep(i)}
              className={`text-xs font-medium transition-colors ${i === step ? 'text-primary' : i < step ? 'text-success' : 'text-muted-foreground'}`}
            >
              {s}
            </button>
          ))}
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Step content */}
      <div className="glass-card rounded-xl p-6 animate-fade-in" key={step}>
        {step === 0 && (
          <div className="space-y-5">
            <h3 className="font-semibold text-foreground text-lg">Request Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label>Sales Executive</Label>
                <Input value={user?.name || ''} disabled className="bg-muted/30" />
              </div>
              <div className="space-y-2">
                <Label>Distributor Name *</Label>
                <Select value={form.distributorId} onValueChange={v => set('distributorId', v)}>
                  <SelectTrigger><SelectValue placeholder="Select distributor" /></SelectTrigger>
                  <SelectContent>{data.distributors.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Product / Instrument *</Label>
                <Select value={form.machineId} onValueChange={v => { set('machineId', v); set('model', ''); set('kitItems', []); set('applicationParams', []); }}>
                  <SelectTrigger><SelectValue placeholder="Select instrument" /></SelectTrigger>
                  <SelectContent>{data.machines.map(m => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Model *</Label>
                <Select value={form.model} onValueChange={v => set('model', v)} disabled={!selectedMachine}>
                  <SelectTrigger><SelectValue placeholder="Select model" /></SelectTrigger>
                  <SelectContent>{selectedMachine?.models.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Type of Demo *</Label>
                <Select value={form.demoType} onValueChange={v => set('demoType', v)}>
                  <SelectTrigger><SelectValue placeholder="Select demo type" /></SelectTrigger>
                  <SelectContent>{data.demoTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Proposed Demo Date *</Label>
                <Input type="date" value={form.proposedDate} onChange={e => set('proposedDate', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Expected Duration</Label>
                <Input value={form.expectedDuration} onChange={e => set('expectedDuration', e.target.value)} placeholder="e.g. 3 days" />
              </div>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-5">
            <h3 className="font-semibold text-foreground text-lg">Demo Requirements</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label>Doctor Name *</Label>
                <Input value={form.doctorName} onChange={e => set('doctorName', e.target.value)} placeholder="Dr. Name" />
              </div>
              <div className="space-y-2">
                <Label>Doctor Department *</Label>
                <Input value={form.doctorDepartment} onChange={e => set('doctorDepartment', e.target.value)} placeholder="e.g. Pathology" />
              </div>
              <div className="space-y-2">
                <Label>Hospital / Lab Name *</Label>
                <Input value={form.hospitalName} onChange={e => set('hospitalName', e.target.value)} placeholder="e.g. City Hospital" />
              </div>
              <div className="space-y-2">
                <Label>Location / City *</Label>
                <Input value={form.location} onChange={e => set('location', e.target.value)} placeholder="e.g. Mumbai" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Application / Test Parameters & Kit Quantity *</Label>
              {availableKits.length === 0 ? (
                <p className="text-sm text-muted-foreground">Select an instrument first to see available parameters</p>
              ) : (
                <div className="space-y-3">
                  {availableKits.map(k => {
                    const isSelected = form.kitItems.some(item => item.kitId === k.id);
                    const currentItem = form.kitItems.find(item => item.kitId === k.id);

                    return (
                      <div key={k.id} className={`flex items-center justify-between p-3 rounded-lg border transition-all ${isSelected ? 'bg-primary/5 border-primary' : 'bg-muted/30 border-transparent'}`}>
                        <div className="flex items-center gap-3">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={(c) => handleKitChange(k.id, k.name, c as boolean)}
                          />
                          <Label className="cursor-pointer">{k.name}</Label>
                        </div>

                        {isSelected && (
                          <div className="flex items-center gap-2 animate-fade-in">
                            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateKitQuantity(k.id, (currentItem?.quantity || 1) - 1)}>
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="text-sm font-medium w-8 text-center">{currentItem?.quantity || 1}</span>
                            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateKitQuantity(k.id, (currentItem?.quantity || 1) + 1)}>
                              <Plus className="w-3 h-3" />
                            </Button>
                            <span className="text-xs text-muted-foreground ml-1">Tests</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label>Estimated Sample Volume *</Label>
              <Input value={form.sampleVolume} onChange={e => set('sampleVolume', e.target.value)} placeholder="e.g. 50 samples/day" />
            </div>
            <div className="space-y-2">
              <Label>Special Requirements</Label>
              <Textarea value={form.specialRequirements} onChange={e => set('specialRequirements', e.target.value)} placeholder="Any special requirements..." rows={3} />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <h3 className="font-semibold text-foreground text-lg">Commercial & Approval</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label>Business Potential (₹) *</Label>
                <Input value={form.businessPotential} onChange={e => set('businessPotential', e.target.value)} placeholder="e.g. ₹25,00,000" />
              </div>
              <div className="space-y-2">
                <Label>Competitor Details</Label>
                <Input value={form.competitorDetails} onChange={e => set('competitorDetails', e.target.value)} placeholder="e.g. Sysmex XN-1000" />
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label>Reason for Demo *</Label>
                <Textarea value={form.reasonForDemo} onChange={e => set('reasonForDemo', e.target.value)} placeholder="Why is this demo needed?" rows={2} />
              </div>
              <div className="space-y-2">
                <Label>Urgency Level *</Label>
                <Select value={form.urgencyLevel} onValueChange={v => set('urgencyLevel', v)}>
                  <SelectTrigger><SelectValue placeholder="Select urgency" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Date of Approval</Label>
                <Input type="date" value={form.approvalDate} onChange={e => set('approvalDate', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Expected Purchase Date * (Sales Forecasting)</Label>
                <Input type="date" value={form.expectedPurchaseDate} onChange={e => set('expectedPurchaseDate', e.target.value)} />
              </div>
              <div className="md:col-span-2 flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                <Switch checked={form.regionalManagerApproval} onCheckedChange={v => set('regionalManagerApproval', v)} />
                <div className="flex-1">
                  <Label>Regional Manager Approval</Label>
                  {form.regionalManagerApproval && (
                    <Input className="mt-2" value={form.regionalManagerName} onChange={e => set('regionalManagerName', e.target.value)} placeholder="Manager name" />
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            <h3 className="font-semibold text-foreground text-lg">Logistics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label>Expected Return Date *</Label>
                <Input type="date" value={form.expectedReturnDate} onChange={e => set('expectedReturnDate', e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground">Demo Kit Dispatched By (Admin only)</Label>
                <Input disabled placeholder="Set by admin after approval" className="bg-muted/30" />
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground">Dispatch Date (Admin only)</Label>
                <Input disabled placeholder="Set by admin" className="bg-muted/30" />
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground">Courier / Transport (Admin only)</Label>
                <Input disabled placeholder="Set by admin" className="bg-muted/30" />
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground">Tracking Number (Admin only)</Label>
                <Input disabled placeholder="Set by admin" className="bg-muted/30" />
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground">Condition on Return (Admin only)</Label>
                <Input disabled placeholder="Set by admin" className="bg-muted/30" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Remarks</Label>
              <Textarea value={form.remarks} onChange={e => set('remarks', e.target.value)} placeholder="Additional remarks..." rows={3} />
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={prevStep} disabled={step === 0}>
          <ChevronLeft className="w-4 h-4 mr-1" /> Previous
        </Button>
        {step < STEPS.length - 1 ? (
          <Button onClick={nextStep} disabled={!canNext()} className="gradient-primary text-primary-foreground btn-glow">
            Next <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={!form.expectedReturnDate} className="gradient-primary text-primary-foreground btn-glow">
            <Send className="w-4 h-4 mr-2" /> Submit & Preview
          </Button>
        )}
      </div>
    </div>
  );
};

export default SalesRequestForm;
