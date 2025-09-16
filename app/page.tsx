'use client';

import React, { useState } from 'react';
import { DataProvider } from '@/contexts/DataContext';
import { JsonUploader } from '@/components/JsonUploader';
import { LanguageToggle } from '@/components/LanguageToggle';
import { DeveloperSettings } from '@/components/DeveloperSettings';
import { ExportButton } from '@/components/ExportButton';
import { TabsContainer } from '@/components/TabsContainer';
import { HelpModal } from '@/components/HelpModal';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useData } from '@/contexts/DataContext';
import { Ship, Database, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const GLOBAL_HELP_CONTENT = {
  description: 'Ship Companion Data Editor helps you manage all aspects of your ship\'s information system.',
  sections: [
    {
      title: 'Getting Started',
      content: 'Load existing data from the project or upload a JSON file to begin editing. The application supports multiple languages and side-by-side editing.'
    },
    {
      title: 'Data Management',
      content: 'Edit recipes, checklists, cities, points of interest, links, about information, questions, and cabin details. Each section has its own dedicated interface.'
    },
    {
      title: 'Language Support',
      content: 'Switch between English, German, and Dutch. Enable side-by-side mode to compare and edit different languages simultaneously.'
    },
    {
      title: 'Export & Import',
      content: 'Export your changes with metadata for backup and sharing. Upload new JSON files to replace current data (with safety confirmation).'
    },
    {
      title: 'Developer Mode',
      content: 'Enable developer settings to access advanced features like coordinate editing, city creation, and technical data management. Only use if you understand the data structure.'
    }
  ]
};

function AppContent() {
  const { data, resetData } = useData();
  const [globalHelpOpen, setGlobalHelpOpen] = useState(false);

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Ship className="w-8 h-8 text-blue-600" />
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                Ship Companion Data Editor
              </h1>
            </div>
          </div>

          <div className="flex flex-col items-center gap-4">
            <JsonUploader />
            <Button
              variant="outline"
              onClick={() => setGlobalHelpOpen(true)}
              className="flex items-center gap-2"
            >
              <HelpCircle className="w-4 h-4" />
              How does this work?
            </Button>
          </div>
          
          <HelpModal
            isOpen={globalHelpOpen}
            onClose={() => setGlobalHelpOpen(false)}
            title="Ship Companion Data Editor Help"
            content={GLOBAL_HELP_CONTENT}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Ship className="w-6 h-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Ship Companion Data Editor
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setGlobalHelpOpen(true)}
              className="flex items-center gap-2"
            >
              <HelpCircle className="w-4 h-4" />
              Help
            </Button>
            <ThemeToggle />
          </div>
        </div>

        {/* Action Bar above tabs */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            {/* Left section - Language controls */}
            <div className="flex-shrink-0">
              <LanguageToggle />
            </div>
            
            {/* Center section - Data actions */}
            <div className="flex items-center gap-3">
              <JsonUploader />
              <ExportButton />
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (confirm('Are you sure you want to clear all data? This will remove all your work and cannot be undone.')) {
                    resetData();
                  }
                }}
                className="flex items-center gap-2 text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
              >
                <Database className="w-4 h-4" />
                Clear Data
              </Button>
            </div>
            
            {/* Right section - Developer settings */}
            <div className="flex-shrink-0">
              <DeveloperSettings />
            </div>
          </div>
        </div>

        {/* Full width data section */}
        <div className="w-full">
          <TabsContainer />
        </div>
        
        <HelpModal
          isOpen={globalHelpOpen}
          onClose={() => setGlobalHelpOpen(false)}
          title="Ship Companion Data Editor Help"
          content={GLOBAL_HELP_CONTENT}
        />
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen overflow-x-hidden">
      <DataProvider>
        <AppContent />
      </DataProvider>
    </div>
  );
}
