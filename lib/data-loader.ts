import { UnifiedData, Language, DATA_TYPES } from '@/types';

// Load data from individual JSON files and convert to unified format
export async function loadExistingData(): Promise<UnifiedData> {
  const languages: Language[] = ['en', 'de', 'nl'];
  const unifiedData: Partial<UnifiedData> = {};

  // Initialize the structure
  for (const dataType of DATA_TYPES) {
    unifiedData[dataType] = {} as Record<Language, unknown>;
  }

  // Load data for each language and data type
  for (const lang of languages) {
    for (const dataType of DATA_TYPES) {
      try {
        // Try to load the file - in a real app, this would be actual file loading
        // For now, we'll create sample data structure
        const response = await fetch(`/avondrood/data/${lang}/${dataType}.json`);
        
        if (response.ok) {
          const data = await response.json();
          (unifiedData[dataType] as Record<Language, unknown>)[lang] = data;
        } else {
          // Initialize with empty array/object if file doesn't exist
          (unifiedData[dataType] as Record<Language, unknown>)[lang] = Array.isArray(getSampleData(dataType)) ? [] : {};
        }
      } catch (error) {
        console.warn(`Could not load ${dataType} for ${lang}:`, error);
        // Initialize with empty data
        (unifiedData[dataType] as Record<Language, unknown>)[lang] = Array.isArray(getSampleData(dataType)) ? [] : {};
      }
    }
  }

  return unifiedData as UnifiedData;
}

// Get sample data structure for a given data type
function getSampleData(dataType: string) {
  switch (dataType) {
    case 'recipes':
      return [];
    case 'checklists':
      return [];
    case 'cities':
      return [];
    case 'points':
      return [];
    case 'questions':
      return [];
    case 'cabins':
      return [];
    case 'links':
      return {};
    case 'about':
      return {};
    default:
      return [];
  }
}

// Convert unified data back to individual files format for export
export function exportToIndividualFiles(data: UnifiedData) {
  const files: Record<string, unknown> = {};
  
  const languages: Language[] = ['en', 'de', 'nl'];
  
  for (const lang of languages) {
    for (const dataType of DATA_TYPES) {
      const key = `${lang}/${dataType}.json`;
      files[key] = data[dataType][lang];
    }
  }
  
  return files;
}

// Create a unified JSON export
export function createUnifiedExport(data: UnifiedData) {
  return {
    exportDate: new Date().toISOString(),
    data,
  };
}

// Download JSON file
export function downloadJSON(data: unknown, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}