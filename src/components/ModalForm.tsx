import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ModalFormProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  onSubmit: () => void;
  submitLabel?: string;
}

const ModalForm: React.FC<ModalFormProps> = ({ open, onClose, title, children, onSubmit, submitLabel = 'Save' }) => (
  <Dialog open={open} onOpenChange={onClose}>
    <DialogContent className="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
      </DialogHeader>
      <div className="space-y-4 py-2">{children}</div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={onSubmit} className="gradient-primary text-primary-foreground btn-glow">{submitLabel}</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

export default ModalForm;
