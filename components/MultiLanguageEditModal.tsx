'use client';

import React, { useState, useRef, useEffect } from 'react';
import { EditModal } from './EditModal';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Languages, Check, AlertCircle } from 'lucide-react';
import { Language } from '@/types';

const LANGUAGE_OPTIONS: Array<{code: Language, label: string, flag: string}> = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'nl', label: 'Nederlands', flag: '🇳🇱' }
];

interface MultiLanguageEditModalProps<T> {
  isOpen: boolean;
  onClose: () => void;
  onSave: (allLanguageData: Record<Language, T>) => void;
  title: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  initialData: Record<Language, T>;
  initialLanguage?: Language;
  children: (
    currentData: T, 
    onUpdate: (data: T) => void, 
    currentLanguage: Language
  ) => React.ReactNode;
  validateData?: (data: T) => boolean;
  isCreating?: boolean;
}

export function MultiLanguageEditModal<T>({ 
  isOpen, 
  onClose, 
  onSave,
  title, 
  description, 
  size = 'lg',
  initialData,
  initialLanguage = 'en',
  children,
  validateData,
  isCreating = false
}: MultiLanguageEditModalProps<T>) {
  const [activeLanguage, setActiveLanguage] = useState<Language>(initialLanguage);
  const [cachedData, setCachedData] = useState<Record<Language, T>>(initialData);
  const [touchedLanguages, setTouchedLanguages] = useState<Set<Language>>(new Set());
  const isInitialized = useRef(false);

  // Initialize cached data when modal opens
  useEffect(() => {
    if (isOpen && !isInitialized.current) {
      setCachedData(initialData);
      setActiveLanguage(initialLanguage);
      setTouchedLanguages(new Set());
      isInitialized.current = true;
    }
    if (!isOpen) {
      isInitialized.current = false;
    }
  }, [isOpen, initialData, initialLanguage]);

  // Update cached data for current language
  const handleDataUpdate = (updatedData: T) => {
    setCachedData(prev => ({
      ...prev,
      [activeLanguage]: updatedData
    }));
    setTouchedLanguages(prev => new Set(prev).add(activeLanguage));
  };

  // Handle language tab change
  const handleLanguageChange = (newLanguage: Language) => {
    setActiveLanguage(newLanguage);
  };

  // Handle save - passes all cached data
  const handleSave = () => {
    onSave(cachedData);
  };

  // Handle cancel - reset everything
  const handleCancel = () => {
    setCachedData(initialData);
    setTouchedLanguages(new Set());
    setActiveLanguage(initialLanguage);
    onClose();
  };

  // Check if language has valid data
  const isLanguageValid = (lang: Language): boolean => {
    if (!validateData) return true;
    return validateData(cachedData[lang]);
  };

  // Check if language has been modified
  const isLanguageModified = (lang: Language): boolean => {
    return touchedLanguages.has(lang);
  };

  return (
    <EditModal
      isOpen={isOpen}
      onClose={handleCancel}
      title={title}
      description={description}
      size={size}
    >
      <div className="space-y-4">
        {/* Language Tab Bar */}
        <div className="border-b">
          <Tabs value={activeLanguage} onValueChange={(value) => handleLanguageChange(value as Language)}>
            <TabsList className="grid w-full grid-cols-3">
              {LANGUAGE_OPTIONS.map((lang) => (
                <TabsTrigger 
                  key={lang.code} 
                  value={lang.code}
                  className="flex items-center gap-2 relative"
                >
                  <span>{lang.flag}</span>
                  <span className="hidden sm:inline">{lang.label}</span>
                  <div className="flex items-center gap-1 ml-1">
                    {/* Modified indicator */}
                    {isLanguageModified(lang.code) && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full" title="Modified" />
                    )}
                    {/* Validation indicator */}
                    {validateData && touchedLanguages.has(lang.code) && (
                      isLanguageValid(lang.code) ? (
                        <Check className="w-3 h-3 text-green-600" title="Valid" />
                      ) : (
                        <AlertCircle className="w-3 h-3 text-red-600" title="Invalid" />
                      )
                    )}
                  </div>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Current Language Indicator */}
        <div className="flex items-center gap-2 px-3 py-2 bg-muted/30 rounded-md text-sm">
          <Languages className="w-4 h-4 text-muted-foreground" />
          <span className="text-muted-foreground">Editing:</span>
          <span className="font-medium">
            {LANGUAGE_OPTIONS.find(l => l.code === activeLanguage)?.flag} {' '}
            {LANGUAGE_OPTIONS.find(l => l.code === activeLanguage)?.label}
          </span>
          {touchedLanguages.size > 0 && (
            <span className="ml-auto text-xs text-muted-foreground">
              Modified: {Array.from(touchedLanguages).map(lang => 
                LANGUAGE_OPTIONS.find(l => l.code === lang)?.flag
              ).join(' ')}
            </span>
          )}
        </div>
        
        {/* Content for current language */}
        <div className="min-h-0">
          {children(cachedData[activeLanguage], handleDataUpdate, activeLanguage)}
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 justify-end pt-4 border-t">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            {isCreating ? 'Create' : 'Save'} 
            {touchedLanguages.size > 1 && ` (${touchedLanguages.size} languages)`}
          </Button>
        </div>
      </div>
    </EditModal>
  );
}