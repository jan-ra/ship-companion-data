'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, Edit, MapPin, ChevronDown, ChevronUp, Code, FileText } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { useCollapse } from '@/components/DataEditor';
import { City, DataType, Language } from '@/types';
import { MultiLanguageEditModal } from '@/components/MultiLanguageEditModal';
import { DeletionConfirmModal } from '@/components/DeletionConfirmModal';

interface CityEditorProps {
  data: City[];
  language: string;
  dataType: DataType;
  isComparison?: boolean;
  synchronizedMode?: boolean;
  showOnlyButtons?: boolean;
  showOnlyCard?: boolean;
  showEmptyState?: boolean;
  cardIndex?: number;
  validationResults?: {
    hasIncompleteTranslations: boolean;
    incompleteItems: Array<{ id: number; missingFields: string[] }>;
  };
}

export function CityEditor({ 
  data, 
  language, 
  dataType, 
  isComparison = false,
  synchronizedMode = false,
  showOnlyButtons = false,
  showOnlyCard = false,
  showEmptyState = false,
  cardIndex,
  validationResults
}: CityEditorProps) {
  const { data: allData, updateData, devView, createDataAcrossLanguages, deleteDataAcrossLanguages } = useData();
  const { collapsedItems, toggleCollapse } = useCollapse();
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [deletingCity, setDeletingCity] = useState<City | null>(null);
  const [jsonEditMode, setJsonEditMode] = useState(false);

  // Get all item IDs for collapse functionality
  const getAllItemIds = (): string[] => {
    return data.map((city: any) => String(city.id)).filter(Boolean);
  };

  // Wrapper for toggleCollapse that passes all item IDs
  const handleToggleCollapse = (itemId: string | number) => {
    toggleCollapse(String(itemId), getAllItemIds());
  };

  // Helper function to check if a city has incomplete translations
  const hasIncompleteTranslations = (cityId: number): boolean => {
    if (!validationResults) return false;
    return validationResults.incompleteItems.some(item => item.id === cityId);
  };

  const handleEdit = (index: number) => {
    setEditingIndex(index);
  };


  const handleCancel = () => {
    setEditingIndex(null);
    setJsonEditMode(false);
  };

  const handleAddCity = () => {
    if (isComparison) return;
    setEditingIndex(data.length);
  };

  const handleDeleteCity = (index: number) => {
    if (isComparison) return;
    setDeletingCity(data[index]);
  };

  const handleConfirmDelete = () => {
    if (deletingCity) {
      deleteDataAcrossLanguages(dataType, deletingCity.id, 'id');
      setDeletingCity(null);
    }
  };

  const handleCancelDelete = () => {
    setDeletingCity(null);
  };

  // Multi-language save handler
  const handleMultiLanguageSave = (allLanguageData: Record<string, City>) => {
    if (editingIndex !== null && !isComparison && allData) {
      if (editingIndex >= data.length) {
        // Adding new city - update all languages
        Object.entries(allLanguageData).forEach(([lang, city]) => {
          const langCities = [...((allData['cities'][lang as keyof typeof allData['cities']] as City[]) || [])];
          langCities.push(city);
          updateData(dataType, lang as Language, langCities);
        });
      } else {
        // Editing existing city - update all languages
        Object.entries(allLanguageData).forEach(([lang, city]) => {
          const langCities = [...((allData['cities'][lang as keyof typeof allData['cities']] as City[]) || [])];
          if (langCities[editingIndex]) {
            langCities[editingIndex] = city;
            updateData(dataType, lang as Language, langCities);
          }
        });
      }
      setEditingIndex(null);
      setJsonEditMode(false);
    }
  };

  // Get city data for all languages for editing
  const getCityForAllLanguages = (index: number): Record<string, City> => {
    if (!allData) return {} as Record<string, City>;

    const languages = ['en', 'de', 'nl'];
    const result: Record<string, City> = {};

    languages.forEach((lang) => {
      const langCities = (allData['cities'][lang as keyof typeof allData['cities']] as City[]) || [];
      if (index < langCities.length) {
        result[lang] = { ...langCities[index] };
      } else {
        // Create empty city for missing languages
        result[lang] = {
          id: Math.max(0, ...data.map(c => c.id)) + 1,
          name: '',
          latitude: 0,
          longitude: 0,
          description: '',
          zoomLevel: 10,
          isIsland: 'false'
        };
      }
    });

    return result;
  };

  // Create new city template for all languages
  const createNewCityForAllLanguages = (): Record<string, City> => {
    const languages = ['en', 'de', 'nl'];
    const result: Record<string, City> = {};
    const newId = Math.max(0, ...data.map(c => c.id)) + 1;

    languages.forEach((lang) => {
      result[lang] = {
        id: newId,
        name: lang === 'en' ? 'New City' : '',
        latitude: 0,
        longitude: 0,
        description: lang === 'en' ? 'City description' : '',
        zoomLevel: 10,
        isIsland: 'false'
      };
    });

    return result;
  };

  // City form component for use in MultiLanguageEditModal
  const renderCityForm = (
    currentCity: City,
    onUpdate: (city: City) => void,
    currentLanguage: string
  ) => {
    // JSON edit handlers
    const handleJsonEdit = (jsonString: string) => {
      try {
        const parsedCity = JSON.parse(jsonString);
        onUpdate(parsedCity);
      } catch (error) {
        console.error('Invalid JSON:', error);
      }
    };

    return (
      <>
        <div className="space-y-6 p-1 w-full min-w-0">
          {/* Dev Mode Toggle */}
          {devView && (
            <div className="flex justify-end border-b pb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setJsonEditMode(!jsonEditMode)}
                className="flex items-center gap-2"
              >
                {jsonEditMode ? (
                  <FileText className="w-4 h-4" />
                ) : (
                  <Code className="w-4 h-4" />
                )}
                {jsonEditMode ? 'Form View' : 'JSON View'}
              </Button>
            </div>
          )}

          {jsonEditMode ? (
            // JSON Edit View
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">
                  City JSON ({currentLanguage})
                </label>
                <Textarea
                  value={JSON.stringify(currentCity, null, 2)}
                  onChange={(e) => handleJsonEdit(e.target.value)}
                  className="font-mono text-sm min-h-96 mt-2"
                  placeholder="Edit city as JSON..."
                />
              </div>
            </div>
          ) : (
            // Regular Form View
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Name</label>
                    <Input
                      value={currentCity.name}
                      onChange={(e) => onUpdate({ ...currentCity, name: e.target.value })}
                      placeholder="City name"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Description</label>
                    <Textarea
                      value={currentCity.description}
                      onChange={(e) => onUpdate({ ...currentCity, description: e.target.value })}
                      placeholder="Brief description of the city"
                      className="min-h-20"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Latitude</label>
                      <Input
                        type="number"
                        step="0.000001"
                        value={currentCity.latitude}
                        onChange={(e) => onUpdate({ ...currentCity, latitude: parseFloat(e.target.value) || 0 })}
                        placeholder="0.000000"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Longitude</label>
                      <Input
                        type="number"
                        step="0.000001"
                        value={currentCity.longitude}
                        onChange={(e) => onUpdate({ ...currentCity, longitude: parseFloat(e.target.value) || 0 })}
                        placeholder="0.000000"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Zoom Level</label>
                    <Input
                      type="number"
                      min="1"
                      max="20"
                      value={currentCity.zoomLevel}
                      onChange={(e) => onUpdate({ ...currentCity, zoomLevel: parseInt(e.target.value) || 10 })}
                      placeholder="10"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Is Island</label>
                    <select
                      value={currentCity.isIsland}
                      onChange={(e) => onUpdate({ ...currentCity, isIsland: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="false">No</option>
                      <option value="true">Yes</option>
                    </select>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </>
    );
  };

  const renderEditModal = () => {
    if (editingIndex === null) return null;

    const isCreating = editingIndex >= data.length;
    const initialData = isCreating 
      ? createNewCityForAllLanguages() 
      : getCityForAllLanguages(editingIndex);

    return (
      <MultiLanguageEditModal<City>
        isOpen={editingIndex !== null}
        onClose={handleCancel}
        onSave={handleMultiLanguageSave}
        title={isCreating ? "Add New City" : "Edit City"}
        description="Modify city details including location coordinates and description"
        size="lg"
        initialData={initialData}
        initialLanguage={language as Language}
        isCreating={isCreating}
        validateData={(city) => city.name.trim().length > 0}
      >
        {renderCityForm}
      </MultiLanguageEditModal>
    );
  };


  // Render only buttons for synchronized mode
  if (showOnlyButtons) {
    return (
      <>
        {renderEditModal()}
        <DeletionConfirmModal
          isOpen={deletingCity !== null}
          onClose={handleCancelDelete}
          onConfirm={handleConfirmDelete}
          itemName={deletingCity?.name || ''}
          itemType="City"
        />
        {!isComparison && devView ? (
          <Button onClick={handleAddCity}>
            <Plus className="w-4 h-4 mr-2" />
            Add City
          </Button>
        ) : null}
      </>
    );
  }

  // Render only a specific card for synchronized mode
  if (showOnlyCard && cardIndex !== undefined) {
    const city = data[cardIndex];
    if (!city) return null;

    const cityId = String(city.id);
    const isCollapsed = collapsedItems.has(cityId) || collapsedItems.has('*');
    const allItemIds = data.map(city => String(city.id));

    return (
      <>
        {renderEditModal()}
        <DeletionConfirmModal
          isOpen={deletingCity !== null}
          onClose={handleCancelDelete}
          onConfirm={handleConfirmDelete}
          itemName={deletingCity?.name || ''}
          itemType="City"
        />
        <Card className={`${isComparison ? 'bg-muted/20 h-full flex flex-col' : 'h-full flex flex-col'} ${hasIncompleteTranslations(city.id) ? 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800' : ''}`}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-1 cursor-pointer" onClick={() => toggleCollapse(cityId, allItemIds)}>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="p-0 h-auto"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleCollapse(cityId, allItemIds);
                  }}
                >
                  {isCollapsed ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronUp className="w-4 h-4" />
                  )}
                </Button>
                <div className="flex-1">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {city.name}
                  </CardTitle>
                  <CardDescription>
                    {city.isIsland === 'true' ? 'Island' : 'City'}{devView ? ` • Zoom ${city.zoomLevel}` : ''}
                  </CardDescription>
                </div>
              </div>
              {!isComparison && (
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(cardIndex)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDeleteCity(cardIndex)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          {!isCollapsed && (
            <CardContent className="flex-1">
              <p className="text-sm mb-3">{city.description}</p>
              
              <div className="space-y-2 text-sm">
                {devView && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Coordinates:</span>
                    <span>{city.latitude.toFixed(4)}, {city.longitude.toFixed(4)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type:</span>
                  <span>{city.isIsland === 'true' ? 'Island' : 'City'}</span>
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      </>
    );
  }

  // Render empty state for synchronized mode
  if (showEmptyState) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">No cities available</p>
        </CardContent>
      </Card>
    );
  }

  // Default rendering for non-synchronized mode
  return (
    <>
      {renderEditModal()}
      <DeletionConfirmModal
        isOpen={deletingCity !== null}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        itemName={deletingCity?.name || ''}
        itemType="City"
      />
      <div className="space-y-4">
        <div className="flex items-center justify-between min-h-10">
          {!isComparison && devView ? (
            <Button onClick={handleAddCity}>
              <Plus className="w-4 h-4 mr-2" />
              Add City
            </Button>
          ) : (
            <div></div>
          )}
        </div>

        <div className="grid gap-4">
          {data.map((city, index) => {
            const cityId = String(city.id);
            const isCollapsed = collapsedItems.has(cityId) || collapsedItems.has('*');
            const allItemIds = data.map(city => String(city.id));
            
            return (
              <Card key={city.id} className={`${isComparison ? 'bg-muted/20' : ''} ${hasIncompleteTranslations(city.id) ? 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800' : ''}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-1 cursor-pointer" onClick={() => toggleCollapse(cityId, allItemIds)}>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="p-0 h-auto"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleCollapse(cityId, allItemIds);
                        }}
                      >
                        {isCollapsed ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronUp className="w-4 h-4" />
                        )}
                      </Button>
                      <div className="flex-1">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          {city.name}
                        </CardTitle>
                        <CardDescription>
                          {city.isIsland === 'true' ? 'Island' : 'City'}{devView ? ` • Zoom ${city.zoomLevel}` : ''}
                        </CardDescription>
                      </div>
                    </div>
                    {!isComparison && (
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(index)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDeleteCity(index)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                {!isCollapsed && (
                  <CardContent>
                    <p className="text-sm mb-3">{city.description}</p>
                    
                    <div className="space-y-2 text-sm">
                      {devView && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Coordinates:</span>
                          <span>{city.latitude.toFixed(4)}, {city.longitude.toFixed(4)}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Type:</span>
                        <span>{city.isIsland === 'true' ? 'Island' : 'City'}</span>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}

          {data.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">No cities available</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
