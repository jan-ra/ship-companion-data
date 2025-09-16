'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { createUnifiedExport, downloadJSON } from '@/lib/data-loader';

export function ExportButton() {
  const { data } = useData();

  const handleExport = () => {
    if (!data) return;

    const exportData = createUnifiedExport(data);
    const now = new Date();
    const timestamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;
    const filename = `app-data-${timestamp}.json`;
    downloadJSON(exportData, filename);
  };

  return (
    <Button 
      onClick={handleExport} 
      disabled={!data}
      className="flex items-center gap-2"
    >
      <Download className="w-4 h-4" />
      Export
    </Button>
  );
}