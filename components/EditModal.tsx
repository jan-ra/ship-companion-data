'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export function EditModal({ 
  isOpen, 
  onClose, 
  title, 
  description, 
  children,
  size = 'lg'
}: EditModalProps) {
  const getSizeStyle = () => {
    switch (size) {
      case 'sm':
        return { width: 'min(90vw, 32rem)', maxWidth: 'none' };
      case 'md':
        return { width: 'min(90vw, 56rem)', maxWidth: 'none' };
      case 'lg':
        return { width: 'min(90vw, 72rem)', maxWidth: 'none' };
      case 'xl':
        return { width: 'min(90vw, 80rem)', maxWidth: 'none' };
      case 'full':
        return { width: '90vw', maxWidth: 'none' };
      default:
        return { width: 'min(90vw, 72rem)', maxWidth: 'none' };
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-h-[90vh] overflow-hidden flex flex-col"
        onOpenAutoFocus={(e) => e.preventDefault()}
        style={getSizeStyle()}
      >
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-xl font-semibold">{title}</DialogTitle>
          {description && (
            <DialogDescription className="text-muted-foreground">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>
        <div className="flex-1 overflow-auto pr-2">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
}