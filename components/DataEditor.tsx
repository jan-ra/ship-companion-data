'use client';

import React, { useState, createContext, useContext } from 'react';
import { useData } from '@/contexts/DataContext';
import { DataType, Language } from '@/types';
import { Button } from '@/components/ui/button';
import { Maximize, Minimize } from 'lucide-react';
import { RecipeEditor } from './editors/RecipeEditor';
import { ChecklistEditor } from './editors/ChecklistEditor';
import { CityEditor } from './editors/CityEditor';
import { PointEditor } from './editors/PointEditor';
import { LinksEditor } from './editors/LinksEditor';
import { AboutEditor } from './editors/AboutEditor';
import { QuestionEditor } from './editors/QuestionEditor';
import { CabinEditor } from './editors/CabinEditor';
import { Card, CardContent } from '@/components/ui/card';

const LANGUAGE_FLAGS: Record<string, string> = {
  en: '🇺🇸',
  de: '🇩🇪',
  nl: '🇳🇱'
};

const LANGUAGE_LABELS: Record<string, string> = {
  en: 'English',
  de: 'Deutsch', 
  nl: 'Nederlands'
};

// Context for managing collapse states across all cards
interface CollapseContextType {
  collapsedItems: Set<string>;
  toggleCollapse: (itemId: string, allItemIds?: string[]) => void;
  collapseAll: (allItemIds?: string[]) => void;
  expandAll: () => void;
}

const CollapseContext = createContext<CollapseContextType | null>(null);

export const useCollapse = () => {
  const context = useContext(CollapseContext);
  if (!context) {
    throw new Error('useCollapse must be used within a CollapseProvider');
  }
  return context;
};

interface DataEditorProps {
  dataType: DataType;
  validationResults?: {
    hasIncompleteTranslations: boolean;
    incompleteItems: Array<{ id: number; missingFields: string[] }>;
  };
}

function DataEditorContent({ dataType, validationResults }: DataEditorProps) {
  const { data, selectedLanguage, sideBySideMode } = useData();
  const { collapseAll, expandAll } = useCollapse();

  // Get all item IDs from current data for collapse functionality
  const getAllItemIds = (): string[] => {
    if (!data || !data[dataType]) return [];
    const currentData = data[dataType][selectedLanguage];
    if (Array.isArray(currentData)) {
      // Questions don't have IDs, use indices instead
      if (dataType === 'questions') {
        return currentData.map((_, index) => String(index));
      }
      // Other data types use actual IDs
      return currentData.map((item: { id?: string | number }) => String(item.id)).filter(Boolean);
    }
    return [];
  };

  if (!data) {
    return (
      <Card>
        <CardContent className="p-4">
          <p className="text-muted-foreground">No data available</p>
        </CardContent>
      </Card>
    );
  }

  const renderEditor = (language: string, isComparison = false, additionalProps = {}) => {
    const editorData = data[dataType][language as Language];
    
    const commonProps = {
      data: editorData,
      language,
      dataType,
      isComparison,
      validationResults,
      ...additionalProps
    };

    switch (dataType) {
      case 'recipes':
        return <RecipeEditor {...commonProps} />;
      case 'checklists':
        return <ChecklistEditor {...commonProps} />;
      case 'cities':
        return <CityEditor {...commonProps} />;
      case 'points':
        return <PointEditor {...commonProps} />;
      case 'links':
        return <LinksEditor {...commonProps} />;
      case 'about':
        return <AboutEditor {...commonProps} />;
      case 'questions':
        return <QuestionEditor {...commonProps} />;
      case 'cabins':
        return <CabinEditor {...commonProps} />;
      default:
        return (
          <Card>
            <CardContent className="p-4">
              <p className="text-muted-foreground">
                Editor for {dataType} is not implemented yet
              </p>
            </CardContent>
          </Card>
        );
    }
  };

  const renderSynchronizedEditor = (languages: Language[]) => {
    // Get data for all languages
    const languageData = languages.map(lang => data[dataType][lang]);
    
    // Find the maximum number of items across all languages
    const maxLength = Math.max(...languageData.map(data => Array.isArray(data) ? data.length : 1));
    
    // For array-based data types (recipes, checklists, cities, points, questions, cabins)
    if (Array.isArray(languageData[0])) {
      return (
        <div className="space-y-4">
          {/* Add/Create buttons row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {languages.map((lang) => (
              <div key={lang} className="min-h-[44px] flex items-start">
                {lang === 'en' ? renderEditor(lang, false, { showOnlyButtons: true }) : <div></div>}
              </div>
            ))}
          </div>
          
          {/* Synchronized cards rows */}
          <div className="space-y-4">
            {Array.from({ length: maxLength }, (_, index) => (
              <div 
                key={index} 
                className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch"
                style={{ 
                  display: 'grid', 
                  alignItems: 'stretch',
                  gridTemplateRows: 'minmax(0, 1fr)'
                }}
              >
                {languages.map((lang) => {
                  const langData = languageData[languages.indexOf(lang)];
                  return (
                    <div key={lang} className="h-full">
                      {Array.isArray(langData) && index < langData.length ? (
                        renderEditor(lang, false, { showOnlyCard: true, cardIndex: index, synchronizedMode: true })
                      ) : (
                        <div className="min-h-[200px] h-full"></div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
            
            {/* Empty state if no data */}
            {maxLength === 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {languages.map((lang) => (
                  <div key={lang}>
                    {renderEditor(lang, false, { showEmptyState: true })}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      );
    }
    
    // For object-based data types (links, about) - single row
    return (
      <div className="space-y-4">
        {/* Add/Edit buttons row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {languages.map((lang) => (
            <div key={lang} className="min-h-[44px] flex items-start">
              {lang === 'en' ? renderEditor(lang, false, { showOnlyButtons: true }) : <div></div>}
            </div>
          ))}
        </div>
        
        {/* Single synchronized row */}
        <div 
          className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch" 
          style={{ 
            alignItems: 'stretch',
            gridTemplateRows: 'minmax(0, 1fr)'
          }}
        >
          {languages.map((lang) => (
            <div key={lang} className="h-full">
              {renderEditor(lang, false, { showOnlyCard: true, synchronizedMode: true })}
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (sideBySideMode) {
    const languages: Language[] = ['en', 'de', 'nl'];
    
    return (
      <div className="space-y-4">
        {/* Headers */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {languages.map((lang) => (
            <div key={lang} className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <span className="text-base">{LANGUAGE_FLAGS[lang]}</span>
                <span>{LANGUAGE_LABELS[lang]}</span>
              </h3>
              <div className="text-xs text-muted-foreground">
                Editable
              </div>
            </div>
          ))}
        </div>
        
        {/* Collapse/Expand Controls - Hide for links, about, and cabins */}
        {dataType !== 'links' && dataType !== 'about' && dataType !== 'cabins' && (
          <div className="flex justify-end gap-2 mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => collapseAll(getAllItemIds())}
              className="flex items-center gap-2"
            >
              <Minimize className="w-4 h-4" />
              Collapse All
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={expandAll}
              className="flex items-center gap-2"
            >
              <Maximize className="w-4 h-4" />
              Expand All
            </Button>
          </div>
        )}

        {/* Synchronized Content */}
        {renderSynchronizedEditor(languages)}
      </div>
    );
  }

  return renderEditor(selectedLanguage, false);
}

export function DataEditor(props: DataEditorProps) {
  const [collapsedItems, setCollapsedItems] = useState<Set<string>>(new Set(['*']));
  
  const toggleCollapse = (itemId: string, allItemIds: string[] = []) => {
    setCollapsedItems(prev => {
      const newSet = new Set(prev);
      
      // If we have the "collapse all" marker, we need to transition to individual control
      if (newSet.has('*')) {
        newSet.delete('*');
        // When transitioning from "collapse all", add ALL items to collapsed state
        // except the one being expanded
        allItemIds.forEach(id => {
          if (id !== itemId) {
            newSet.add(id);
          }
        });
        // The target item is not added, so it remains expanded
        return newSet;
      }
      
      // Normal toggle behavior when not in "collapse all" mode
      if (newSet.has(itemId)) {
        newSet.delete(itemId); // Expand (remove from collapsed set)
      } else {
        newSet.add(itemId); // Collapse (add to collapsed set)
      }
      return newSet;
    });
  };

  const collapseAll = (allItemIds: string[] = []) => {
    if (allItemIds.length > 0) {
      // If we have item IDs, use individual collapse
      setCollapsedItems(new Set(allItemIds));
    } else {
      // Fallback to the '*' marker if no IDs provided
      setCollapsedItems(new Set(['*']));
    }
  };

  const expandAll = () => {
    setCollapsedItems(new Set());
  };

  const contextValue: CollapseContextType = {
    collapsedItems,
    toggleCollapse,
    collapseAll,
    expandAll
  };

  return (
    <CollapseContext.Provider value={contextValue}>
      <DataEditorContent {...props} />
    </CollapseContext.Provider>
  );
}