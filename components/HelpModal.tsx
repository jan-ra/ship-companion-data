'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { HelpCircle } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: {
    description?: string;
    image?: string;
    imageAlt?: string;
    sections?: Array<{
      title: string;
      content: string;
    }>;
  };
}

export function HelpModal({ isOpen, onClose, title, content }: HelpModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-blue-600" />
            {title}
          </DialogTitle>
          {content.description && (
            <DialogDescription className="text-base">
              {content.description}
            </DialogDescription>
          )}
        </DialogHeader>
        
        <div className="space-y-4">
          {content.image && (
            <div className="flex justify-center">
              <img
                src={content.image}
                alt={content.imageAlt || 'Help illustration'}
                className="max-w-full h-auto rounded-lg border"
              />
            </div>
          )}
          
          {content.sections && content.sections.map((section, index) => (
            <div key={index} className="space-y-2">
              <h4 className="font-semibold text-foreground">{section.title}</h4>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {section.content}
              </p>
            </div>
          ))}
          
          {!content.sections && !content.image && content.description && (
            <div className="text-center text-muted-foreground py-8">
              <p>Help content will be added here.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}