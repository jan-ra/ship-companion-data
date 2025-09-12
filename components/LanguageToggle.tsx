'use client';

import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Languages, Globe } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { Language } from '@/types';

const LANGUAGE_LABELS: Record<Language, { flag: string; label: string }> = {
  en: { flag: '🇺🇸', label: 'English' },
  de: { flag: '🇩🇪', label: 'Deutsch' },
  nl: { flag: '🇳🇱', label: 'Nederlands' }
};

export function LanguageToggle() {
  const {
    selectedLanguage,
    sideBySideMode,
    setSelectedLanguage,
    toggleSideBySideMode
  } = useData();

  return (
    <div className="flex items-center gap-4">
      {/* View Mode Switcher */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Globe className="w-4 h-4" />
          View:
        </span>
        <div className="flex rounded-md border border-input bg-background">
          <button
            onClick={() => !sideBySideMode || toggleSideBySideMode()}
            className={`px-3 py-2 text-sm font-medium rounded-l-md transition-colors ${
              !sideBySideMode
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-muted text-muted-foreground'
            }`}
          >
            Single
          </button>
          <button
            onClick={() => sideBySideMode || toggleSideBySideMode()}
            className={`px-3 py-2 text-sm font-medium rounded-r-md transition-colors ${
              sideBySideMode
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-muted text-muted-foreground'
            }`}
          >
            All Languages
          </button>
        </div>
      </div>

      {/* Language Selector - only shown in single language mode */}
      {!sideBySideMode && (
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Languages className="w-4 h-4" />
            Language:
          </span>
          <Select value={selectedLanguage} onValueChange={(value: Language) => setSelectedLanguage(value)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue>
                <div className="flex items-center gap-2">
                  <span>{LANGUAGE_LABELS[selectedLanguage].flag}</span>
                  <span>{LANGUAGE_LABELS[selectedLanguage].label}</span>
                </div>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">
                <div className="flex items-center gap-2">
                  <span>{LANGUAGE_LABELS.en.flag}</span>
                  <span>{LANGUAGE_LABELS.en.label}</span>
                </div>
              </SelectItem>
              <SelectItem value="de">
                <div className="flex items-center gap-2">
                  <span>{LANGUAGE_LABELS.de.flag}</span>
                  <span>{LANGUAGE_LABELS.de.label}</span>
                </div>
              </SelectItem>
              <SelectItem value="nl">
                <div className="flex items-center gap-2">
                  <span>{LANGUAGE_LABELS.nl.flag}</span>
                  <span>{LANGUAGE_LABELS.nl.label}</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}