'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { UnifiedData, Language, DataType } from '@/types';

const STORAGE_KEY = 'ship-companion-data';

// Browser storage functions
const saveDataToStorage = (data: UnifiedData) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.warn('Could not save data to localStorage:', error);
  }
};

const loadDataFromStorage = (): UnifiedData | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.warn('Could not load data from localStorage:', error);
    return null;
  }
};

const clearStoredData = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn('Could not clear stored data:', error);
  }
};

const hasStoredData = (): boolean => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored !== null && stored.trim() !== '';
  } catch (error) {
    return false;
  }
};

interface DataContextType {
  data: UnifiedData | null;
  selectedDataType: DataType;
  selectedLanguage: Language;
  sideBySideMode: boolean;
  devView: boolean;
  loading: boolean;
  error: string | null;
  
  // Actions
  setSelectedDataType: (type: DataType) => void;
  setSelectedLanguage: (lang: Language) => void;
  toggleSideBySideMode: () => void;
  toggleDevView: () => void;
  updateData: (dataType: DataType, language: Language, newData: any) => void;
  createDataAcrossLanguages: (dataType: DataType, sourceLanguage: Language, newItem: any, titleField: string) => void;
  deleteDataAcrossLanguages: (dataType: DataType, itemId: string | number, idField?: string) => void;
  deleteDataByIndexAcrossLanguages: (dataType: DataType, index: number) => void;
  validateTranslations: (dataType: DataType) => {
    hasIncompleteTranslations: boolean;
    incompleteItems: Array<{ id: number; missingFields: string[] }>;
  };
  loadData: (jsonData?: string) => Promise<void>;
  loadStoredData: () => void;
  hasStoredData: () => boolean;
  resetData: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}

interface DataProviderProps {
  children: ReactNode;
}

export function DataProvider({ children }: DataProviderProps) {
  const [data, setData] = useState<UnifiedData | null>(null);
  const [selectedDataType, setSelectedDataType] = useState<DataType>('recipes');
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('en');
  const [sideBySideMode, setSideBySideMode] = useState(true);
  const [devView, setDevView] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load data from storage on initialization
  useEffect(() => {
    const storedData = loadDataFromStorage();
    if (storedData) {
      setData(storedData);
    }
  }, []);

  const loadData = useCallback(async (jsonData?: string) => {
    setLoading(true);
    setError(null);
    
    try {
      if (!jsonData) {
        throw new Error('No JSON data provided. Please upload a JSON file to get started.');
      }
      
      // Load from provided JSON string
      const parsed = JSON.parse(jsonData);
      let newData: UnifiedData;
      
      if (parsed.data) {
        // If it's an exported file with metadata
        newData = parsed.data;
      } else {
        // If it's the raw unified data
        newData = parsed;
      }
      
      setData(newData);
      saveDataToStorage(newData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateData = useCallback((dataType: DataType, language: Language, newData: any) => {
    setData(prevData => {
      if (!prevData) return null;
      
      const updatedData = {
        ...prevData,
        [dataType]: {
          ...prevData[dataType],
          [language]: newData
        }
      };
      
      saveDataToStorage(updatedData);
      return updatedData;
    });
  }, []);

  const createDataAcrossLanguages = useCallback((dataType: DataType, sourceLanguage: Language, newItem: any, titleField: string) => {
    setData(prevData => {
      if (!prevData) return null;

      const languages: Language[] = ['en', 'de', 'nl'];
      const updatedDataType = { ...prevData[dataType] };

      languages.forEach(lang => {
        if (!updatedDataType[lang]) {
          updatedDataType[lang] = [];
        }

        const currentData = updatedDataType[lang];
        if (!Array.isArray(currentData)) {
          // Skip non-array data types for createDataAcrossLanguages
          return;
        }
        const currentArray = [...currentData];
        
        if (lang === sourceLanguage) {
          // Add the complete item to the source language
          currentArray.push(newItem);
        } else {
          // Add minimal item to other languages - only title field filled
          const minimalItem = { ...newItem };
          Object.keys(minimalItem).forEach(key => {
            if (key !== titleField && key !== 'id') {
              // Empty out all fields except title and id
              if (typeof minimalItem[key] === 'string') {
                minimalItem[key] = '';
              } else if (typeof minimalItem[key] === 'number') {
                minimalItem[key] = minimalItem[key]; // Keep numbers (like coordinates, ids)
              } else if (Array.isArray(minimalItem[key])) {
                minimalItem[key] = [];
              } else if (typeof minimalItem[key] === 'boolean') {
                minimalItem[key] = minimalItem[key]; // Keep boolean values
              }
            }
          });
          currentArray.push(minimalItem);
        }
        
        updatedDataType[lang] = currentArray as any;
      });

      const updatedData = {
        ...prevData,
        [dataType]: updatedDataType
      };
      
      saveDataToStorage(updatedData);
      return updatedData;
    });
  }, []);

  const deleteDataAcrossLanguages = useCallback((dataType: DataType, itemId: string | number, idField: string = 'id') => {
    setData(prevData => {
      if (!prevData) return null;

      const languages: Language[] = ['en', 'de', 'nl'];
      const updatedDataType = { ...prevData[dataType] };

      languages.forEach(lang => {
        if (!updatedDataType[lang]) {
          return;
        }

        const currentArray = Array.isArray(updatedDataType[lang]) ? [...updatedDataType[lang]] : [];
        
        // Remove the item with matching ID
        const filteredArray = currentArray.filter((item: any) => {
          if (!item) return true;
          
          // Handle different ID field types
          const itemIdValue = item[idField];
          
          // Convert both values to strings for comparison to handle mixed types
          return String(itemIdValue) !== String(itemId);
        });
        
        updatedDataType[lang] = filteredArray as any;
      });

      const updatedData = {
        ...prevData,
        [dataType]: updatedDataType
      };
      
      saveDataToStorage(updatedData);
      return updatedData;
    });
  }, []);

  const deleteDataByIndexAcrossLanguages = useCallback((dataType: DataType, index: number) => {
    setData(prevData => {
      if (!prevData) return null;

      const languages: Language[] = ['en', 'de', 'nl'];
      const updatedDataType = { ...prevData[dataType] };

      languages.forEach(lang => {
        if (!updatedDataType[lang]) return;
        const currentArray = Array.isArray(updatedDataType[lang]) ? [...updatedDataType[lang]] : [];
        if (index >= 0 && index < currentArray.length) {
          currentArray.splice(index, 1);
        }
        updatedDataType[lang] = currentArray as any;
      });

      const updatedData = {
        ...prevData,
        [dataType]: updatedDataType
      };
      
      saveDataToStorage(updatedData);
      return updatedData;
    });
  }, []);

  const toggleSideBySideMode = useCallback(() => {
    setSideBySideMode(prev => !prev);
  }, []);

  const toggleDevView = useCallback(() => {
    setDevView(prev => !prev);
  }, []);

  const validateTranslations = useCallback((dataType: DataType) => {
    if (!data || !data[dataType]) {
      return { hasIncompleteTranslations: false, incompleteItems: [] };
    }

    const languages: Language[] = ['en', 'de', 'nl'];
    const incompleteItems: Array<{ id: number; missingFields: string[] }> = [];

    // Get all items from the primary language (English) as reference
    const englishData = data[dataType]['en'];
    
    // Check if englishData exists and is an array
    if (!englishData || !Array.isArray(englishData)) {
      return { hasIncompleteTranslations: false, incompleteItems: [] };
    }
    
    englishData.forEach((item: any) => {
      // Make sure item has an id property
      if (!item || typeof item.id === 'undefined') {
        return;
      }

      const missingFields: string[] = [];
      
      languages.forEach(lang => {
        const langData = data[dataType]?.[lang];
        
        // Check if langData exists and is an array
        if (!langData || !Array.isArray(langData)) {
          return;
        }

        const correspondingItem = langData.find((langItem: any) => langItem && langItem.id === item.id);
        
        if (correspondingItem) {
          // Check each field for emptiness
          Object.keys(item).forEach(key => {
            if (key !== 'id') { // Skip ID field
              const sourceValue = (item as any)[key];
              const targetValue = (correspondingItem as any)[key];
              
              // Check if field is empty in target language but not in source
              const isSourceEmpty = sourceValue === '' || sourceValue === null || sourceValue === undefined || (Array.isArray(sourceValue) && sourceValue.length === 0);
              const isTargetEmpty = targetValue === '' || targetValue === null || targetValue === undefined || (Array.isArray(targetValue) && targetValue.length === 0);
              
              if (!isSourceEmpty && isTargetEmpty) {
                const fieldKey = `${lang}.${key}`;
                if (!missingFields.includes(fieldKey)) {
                  missingFields.push(fieldKey);
                }
              }
            }
          });
        }
      });
      
      if (missingFields.length > 0) {
        incompleteItems.push({
          id: item.id,
          missingFields
        });
      }
    });

    return {
      hasIncompleteTranslations: incompleteItems.length > 0,
      incompleteItems
    };
  }, [data]);

  const loadStoredData = useCallback(() => {
    const storedData = loadDataFromStorage();
    if (storedData) {
      setData(storedData);
    }
  }, []);

  const checkHasStoredData = useCallback(() => {
    return hasStoredData();
  }, []);

  const resetData = useCallback(() => {
    setData(null);
    setError(null);
    clearStoredData();
  }, []);

  const value: DataContextType = {
    data,
    selectedDataType,
    selectedLanguage,
    sideBySideMode,
    devView,
    loading,
    error,
    setSelectedDataType,
    setSelectedLanguage,
    toggleSideBySideMode,
    toggleDevView,
    updateData,
    createDataAcrossLanguages,
    deleteDataAcrossLanguages,
    deleteDataByIndexAcrossLanguages,
    validateTranslations,
    loadData,
    loadStoredData,
    hasStoredData: checkHasStoredData,
    resetData
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}