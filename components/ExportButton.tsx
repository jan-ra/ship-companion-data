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
    const filename = `ship-companion-data-${new Date().toISOString().split('T')[0]}.json`;
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