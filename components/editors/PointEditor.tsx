'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Edit, MapPin, ChevronDown, ChevronUp } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { Point, DataType } from '@/types';
import { MultiLanguageEditModal } from '@/components/MultiLanguageEditModal';
import { DeletionConfirmModal } from '@/components/DeletionConfirmModal';
import { useCollapse } from '@/components/DataEditor';

interface PointEditorProps {
  data: Point[];
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

export function PointEditor({ 
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
}: PointEditorProps) {
  const { updateData, createDataAcrossLanguages, deleteDataAcrossLanguages, data: allData, devView } = useData();
  const { collapsedItems, toggleCollapse } = useCollapse();
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingPoint, setEditingPoint] = useState<Point | null>(null);
  const [deletingPoint, setDeletingPoint] = useState<Point | null>(null);
  const [jsonEditMode, setJsonEditMode] = useState(false);

  // Helper function to check if a point has incomplete translations
  const hasIncompleteTranslations = (pointId: number): boolean => {
    if (!validationResults) return false;
    return validationResults.incompleteItems.some(item => item.id === pointId);
  };

  // Helper function to get city name by ID
  const getCityName = (cityId: number): string => {
    if (!allData?.cities?.[language]) return `City ${cityId}`;
    const cities = allData.cities[language];
    const city = Array.isArray(cities) ? cities.find(c => c.id === cityId) : null;
    return city ? city.name : `City ${cityId}`;
  };

  // Get available cities for the selector
  const getAvailableCities = () => {
    if (!allData?.cities?.[language]) return [];
    const cities = allData.cities[language];
    return Array.isArray(cities) ? cities : [];
  };


  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setEditingPoint({ ...data[index] });
  };

  const handleSave = () => {
    if (editingIndex !== null && editingPoint && !isComparison) {
      if (editingIndex >= data.length) {
        // Adding new point - create across all languages
        createDataAcrossLanguages(dataType, language as any, editingPoint, 'name');
      } else {
        // Editing existing point - update only current language
        const newData = [...data];
        newData[editingIndex] = editingPoint;
        updateData(dataType, language as any, newData);
      }
      
      setEditingIndex(null);
      setEditingPoint(null);
    }
  };

  const handleCancel = () => {
    setEditingIndex(null);
    setEditingPoint(null);
  };

  const handleAddPoint = () => {
    if (isComparison) return;
    
    const availableCities = getAvailableCities();
    const defaultCityId = availableCities.length > 0 ? availableCities[0].id : 1;
    
    const newPoint: Point = {
      id: Math.max(0, ...data.map(p => p.id)) + 1,
      name: 'New Point',
      latitude: 0,
      longitude: 0,
      type: 'landmark',
      description: 'Point description',
      cityId: defaultCityId
    };
    
    setEditingIndex(data.length);
    setEditingPoint(newPoint);
  };

  const handleDeletePoint = (index: number) => {
    if (isComparison) return;
    setDeletingPoint(data[index]);
  };

  const handleConfirmDelete = () => {
    if (deletingPoint) {
      deleteDataAcrossLanguages(dataType, deletingPoint.id, 'id');
      setDeletingPoint(null);
    }
  };

  const handleCancelDelete = () => {
    setDeletingPoint(null);
  };

  // Multi-language support functions
  const handleMultiLanguageSave = (pointData: Record<string, Point>, activeLanguage: string) => {
    if (editingIndex !== null && !isComparison) {
      if (editingIndex >= data.length) {
        // Adding new point - create across all languages using the provided data
        createDataAcrossLanguages(dataType, activeLanguage as any, pointData[activeLanguage], 'name');
      } else {
        // Editing existing point - update each language with its respective data
        Object.entries(pointData).forEach(([lang, pointForLang]) => {
          const langData = allData?.[dataType]?.[lang as keyof typeof allData[typeof dataType]];
          if (Array.isArray(langData)) {
            const newLangData = [...langData];
            newLangData[editingIndex] = pointForLang;
            updateData(dataType, lang as any, newLangData);
          }
        });
      }
      
      setEditingIndex(null);
      setEditingPoint(null);
    }
  };

  const getPointForAllLanguages = (basePoint: Point): Record<string, Point> => {
    const languages = ['en', 'de', 'nl'];
    const result: Record<string, Point> = {};
    
    languages.forEach(lang => {
      const langData = allData?.[dataType]?.[lang as keyof typeof allData[typeof dataType]];
      if (Array.isArray(langData) && editingIndex !== null && editingIndex < langData.length) {
        result[lang] = { ...langData[editingIndex] };
      } else {
        result[lang] = { ...basePoint };
      }
    });
    
    return result;
  };

  const createNewPointForAllLanguages = (basePoint: Point): Record<string, Point> => {
    const languages = ['en', 'de', 'nl'];
    const result: Record<string, Point> = {};
    
    languages.forEach(lang => {
      result[lang] = { ...basePoint };
    });
    
    return result;
  };

  // Create the point form component
  const renderPointForm = (
    currentPoint: Point,
    onUpdate: (point: Point) => void,
    currentLanguage: string
  ) => {
    // JSON edit handlers
    const handleJsonEdit = (jsonString: string) => {
      try {
        const parsedPoint = JSON.parse(jsonString);
        onUpdate(parsedPoint);
      } catch (error) {
        console.error('Invalid JSON:', error);
      }
    };

    if (jsonEditMode) {
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">JSON Editor</h4>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setJsonEditMode(false)}
            >
              Form View
            </Button>
          </div>
          <Textarea
            value={JSON.stringify(currentPoint, null, 2)}
            onChange={(e) => handleJsonEdit(e.target.value)}
            className="font-mono text-sm min-h-[400px]"
            placeholder="Edit point JSON..."
          />
        </div>
      );
    }

    return (
      <div className="space-y-4 p-1">
        {devView && (
          <div className="flex justify-end">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setJsonEditMode(true)}
            >
              JSON Edit
            </Button>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Name</label>
            <Input
              value={currentPoint.name}
              onChange={(e) => onUpdate({ ...currentPoint, name: e.target.value })}
              placeholder="Point name"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Type</label>
            <Select
              value={currentPoint.type}
              onValueChange={(value) => onUpdate({ ...currentPoint, type: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="landmark">Landmark</SelectItem>
                <SelectItem value="restaurant">Restaurant</SelectItem>
                <SelectItem value="hotel">Hotel</SelectItem>
                <SelectItem value="attraction">Attraction</SelectItem>
                <SelectItem value="port">Port</SelectItem>
                <SelectItem value="beach">Beach</SelectItem>
                <SelectItem value="museum">Museum</SelectItem>
                <SelectItem value="shop">Shop</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Latitude</label>
            <Input
              type="number"
              step="any"
              value={currentPoint.latitude}
              onChange={(e) => onUpdate({ ...currentPoint, latitude: parseFloat(e.target.value) || 0 })}
              placeholder="Latitude coordinate"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Longitude</label>
            <Input
              type="number"
              step="any"
              value={currentPoint.longitude}
              onChange={(e) => onUpdate({ ...currentPoint, longitude: parseFloat(e.target.value) || 0 })}
              placeholder="Longitude coordinate"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium">City</label>
            <Select
              value={currentPoint.cityId.toString()}
              onValueChange={(value) => onUpdate({ ...currentPoint, cityId: parseInt(value) })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {getAvailableCities().map((city) => (
                  <SelectItem key={city.id} value={city.id.toString()}>
                    {city.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Description</label>
          <Textarea
            value={currentPoint.description}
            onChange={(e) => onUpdate({ ...currentPoint, description: e.target.value })}
            placeholder="Brief description of the point of interest"
            className="min-h-20"
          />
        </div>
      </div>
    );
  };

  const renderEditModal = () => {
    if (!editingPoint) return null;
    
    const isNewPoint = editingIndex !== null && editingIndex >= data.length;
    const initialData = isNewPoint 
      ? createNewPointForAllLanguages(editingPoint)
      : getPointForAllLanguages(editingPoint);

    return (
      <MultiLanguageEditModal
        isOpen={editingIndex !== null}
        onClose={handleCancel}
        onSave={handleMultiLanguageSave}
        title={isNewPoint ? "Add New Point" : "Edit Point"}
        description="Modify point details including location coordinates and associated city"
        initialData={initialData}
        size="md"
      >
        {renderPointForm}
      </MultiLanguageEditModal>
    );
  };

  // Render only buttons for synchronized mode
  if (showOnlyButtons) {
    return (
      <>
        {renderEditModal()}
        <DeletionConfirmModal
          isOpen={deletingPoint !== null}
          onClose={handleCancelDelete}
          onConfirm={handleConfirmDelete}
          itemName={deletingPoint?.name || ''}
          itemType="Point"
        />
        {!isComparison ? (
          <Button onClick={handleAddPoint}>
            <Plus className="w-4 h-4 mr-2" />
            Add Point
          </Button>
        ) : null}
      </>
    );
  }

  // Render only a specific card for synchronized mode
  if (showOnlyCard && cardIndex !== undefined) {
    const point = data[cardIndex];
    if (!point) return null;

    const pointId = String(point.id);
    const isCollapsed = collapsedItems.has(pointId) || collapsedItems.has('*');
    const allItemIds = data.map(point => String(point.id));

    return (
      <>
        {renderEditModal()}
        <DeletionConfirmModal
          isOpen={deletingPoint !== null}
          onClose={handleCancelDelete}
          onConfirm={handleConfirmDelete}
          itemName={deletingPoint?.name || ''}
          itemType="Point"
        />
        <Card className={`${isComparison ? 'bg-muted/20 h-full flex flex-col' : 'h-full flex flex-col'} ${hasIncompleteTranslations(point.id) ? 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800' : ''}`}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-1 cursor-pointer" onClick={() => toggleCollapse(pointId, allItemIds)}>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="p-0 h-auto"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleCollapse(pointId, allItemIds);
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
                    {point.name}
                  </CardTitle>
                  <CardDescription>
                    {point.type.charAt(0).toUpperCase() + point.type.slice(1)} • {getCityName(point.cityId)}
                  </CardDescription>
                </div>
              </div>
              {!isComparison && (
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(cardIndex)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDeletePoint(cardIndex)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          {!isCollapsed && (
            <CardContent className="flex-1">
              <p className="text-sm mb-3">{point.description}</p>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Coordinates:</span>
                  <span>{point.latitude.toFixed(4)}, {point.longitude.toFixed(4)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type:</span>
                  <span>{point.type.charAt(0).toUpperCase() + point.type.slice(1)}</span>
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
          <p className="text-muted-foreground">No points available</p>
        </CardContent>
      </Card>
    );
  }

  // Default rendering for non-synchronized mode
  return (
    <>
      {renderEditModal()}
      <DeletionConfirmModal
        isOpen={deletingPoint !== null}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        itemName={deletingPoint?.name || ''}
        itemType="Point"
      />
      <div className="space-y-4">
        <div className="flex items-center justify-between min-h-10">
          {!isComparison ? (
            <Button onClick={handleAddPoint}>
              <Plus className="w-4 h-4 mr-2" />
              Add Point
            </Button>
          ) : (
            <div></div>
          )}
        </div>

        <div className="grid gap-4">
          {data.map((point, index) => {
            const pointId = String(point.id);
            const isCollapsed = collapsedItems.has(pointId) || collapsedItems.has('*');
            const allItemIds = data.map(point => String(point.id));
            
            return (
              <Card key={point.id} className={`${isComparison ? 'bg-muted/20' : ''} ${hasIncompleteTranslations(point.id) ? 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800' : ''}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-1 cursor-pointer" onClick={() => toggleCollapse(pointId, allItemIds)}>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="p-0 h-auto"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleCollapse(pointId, allItemIds);
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
                          {point.name}
                        </CardTitle>
                        <CardDescription>
                          {point.type.charAt(0).toUpperCase() + point.type.slice(1)} • {getCityName(point.cityId)}
                        </CardDescription>
                      </div>
                    </div>
                    {!isComparison && (
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(index)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDeletePoint(index)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                {!isCollapsed && (
                  <CardContent>
                    <p className="text-sm mb-3">{point.description}</p>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Coordinates:</span>
                        <span>{point.latitude.toFixed(4)}, {point.longitude.toFixed(4)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Type:</span>
                        <span>{point.type.charAt(0).toUpperCase() + point.type.slice(1)}</span>
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
                <p className="text-muted-foreground">No points available</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}