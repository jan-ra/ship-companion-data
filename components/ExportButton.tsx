'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, CheckCircle, Upload } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { createUnifiedExport, downloadJSON } from '@/lib/data-loader';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export function ExportButton() {
  const { data } = useData();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [exportedFilename, setExportedFilename] = useState('');

  const handleExport = () => {
    if (!data) return;

    const exportData = createUnifiedExport(data);
    const now = new Date();
    const timestamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;
    const filename = `app-data-${timestamp}.json`;
    downloadJSON(exportData, filename);

    setExportedFilename(filename);
    setShowSuccessModal(true);
  };

  return (
    <>
      <Button
        onClick={handleExport}
        disabled={!data}
        className="flex items-center gap-2"
      >
        <Download className="w-4 h-4" />
        Export
      </Button>

      <AlertDialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Export Successful!
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>
                Your data has been successfully exported as <code className="text-sm bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">{exportedFilename}</code>.
              </p>
              <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-800 dark:text-blue-200 font-medium mb-2 flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  Next steps:
                </p>
                <ol className="text-sm text-blue-700 dark:text-blue-300 space-y-1 list-decimal list-inside">
                  <li>Upload the exported file to the Google Drive provided by Jan</li>
                  <li>Inform Jan that the updated data is ready for review</li>
                </ol>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowSuccessModal(false)}>
              Continue Editing
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}