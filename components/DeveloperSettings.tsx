'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Settings, AlertTriangle } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export function DeveloperSettings() {
  const { devView, toggleDevView } = useData();
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleToggle = () => {
    if (!devView) {
      // Show warning when enabling dev mode
      setShowConfirmation(true);
    } else {
      // Directly disable dev mode
      toggleDevView();
    }
  };

  const handleConfirmEnable = () => {
    toggleDevView();
    setShowConfirmation(false);
  };

  const handleCancelEnable = () => {
    setShowConfirmation(false);
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Settings className="w-4 h-4" />
          Dev Mode:
        </span>
        <Button
          variant={devView ? "default" : "outline"}
          size="sm"
          onClick={handleToggle}
          className="flex items-center gap-2"
        >
          {devView ? 'ON' : 'OFF'}
        </Button>
      </div>

      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              Enable Developer Mode?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>
                Developer mode enables advanced technical features including:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Create and manage cities and cabins</li>
                <li>Edit coordinate data and technical properties</li>
                <li>Access raw data structures</li>
                <li>Advanced validation and debugging tools</li>
              </ul>
              <p className="font-medium text-foreground">
                Only enable if you understand the data structure and potential implications of changes.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelEnable}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmEnable} className="bg-orange-600 hover:bg-orange-700">
              Enable Developer Mode
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}