'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, Edit, Home, X } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { Cabin, DataType } from '@/types';
import { EditModal } from '@/components/EditModal';
import { DeletionConfirmModal } from '@/components/DeletionConfirmModal';

interface CabinEditorProps {
  data: Cabin[];
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

export function CabinEditor({ 
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
}: CabinEditorProps) {
  const { updateData, createDataAcrossLanguages, deleteDataAcrossLanguages, devView } = useData();
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingCabin, setEditingCabin] = useState<Cabin | null>(null);
  const [deletingCabin, setDeletingCabin] = useState<Cabin | null>(null);

  // Helper function to check if a cabin has incomplete translations
  const hasIncompleteTranslations = (cabinNr: number): boolean => {
    if (!validationResults) return false;
    return validationResults.incompleteItems.some(item => item.id === cabinNr);
  };

  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setEditingCabin({ ...data[index] });
  };

  const handleSave = () => {
    if (editingIndex !== null && editingCabin && !isComparison) {
      if (editingIndex >= data.length) {
        // Adding new cabin - create across all languages
        createDataAcrossLanguages(dataType, language as any, editingCabin, 'comment');
      } else {
        // Editing existing cabin - update only current language
        const newData = [...data];
        newData[editingIndex] = editingCabin;
        updateData(dataType, language as any, newData);
      }
      
      setEditingIndex(null);
      setEditingCabin(null);
    }
  };

  const handleCancel = () => {
    setEditingIndex(null);
    setEditingCabin(null);
  };

  const handleAddCabin = () => {
    if (isComparison) return;
    
    const newCabin: Cabin = {
      cabinNr: data.length + 1,
      posTop: 0,
      posLeft: 0,
      beds: 2,
      comment: ''
    };
    
    setEditingIndex(data.length);
    setEditingCabin(newCabin);
  };

  const handleDeleteCabin = (index: number) => {
    if (isComparison) return;
    setDeletingCabin(data[index]);
  };

  const handleConfirmDelete = () => {
    if (deletingCabin) {
      deleteDataAcrossLanguages(dataType, deletingCabin.cabinNr, 'cabinNr');
      setDeletingCabin(null);
    }
  };

  const handleCancelDelete = () => {
    setDeletingCabin(null);
  };


  const renderEditModal = () => (
    <EditModal
      isOpen={editingIndex !== null}
      onClose={handleCancel}
      title={editingIndex !== null && editingIndex < data.length ? "Edit Cabin" : "Add New Cabin"}
      description="Configure cabin details including capacity and available amenities"
      size="lg"
    >
      {editingCabin && (
        <div className="space-y-6 p-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Cabin Number</label>
              <Input
                type="number"
                min="1"
                value={editingCabin.cabinNr}
                onChange={(e) => setEditingCabin({ ...editingCabin, cabinNr: parseInt(e.target.value) || 1 })}
                placeholder="Cabin number"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Number of Beds</label>
              <Input
                type="number"
                min="1"
                value={editingCabin.beds}
                onChange={(e) => setEditingCabin({ ...editingCabin, beds: parseInt(e.target.value) || 1 })}
                placeholder="Number of beds"
              />
            </div>

            {devView && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Position Top</label>
                <Input
                  type="number"
                  value={editingCabin.posTop}
                  onChange={(e) => setEditingCabin({ ...editingCabin, posTop: parseInt(e.target.value) || 0 })}
                  placeholder="Top position (pixels)"
                />
              </div>
            )}

            {devView && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Position Left</label>
                <Input
                  type="number"
                  value={editingCabin.posLeft}
                  onChange={(e) => setEditingCabin({ ...editingCabin, posLeft: parseInt(e.target.value) || 0 })}
                  placeholder="Left position (pixels)"
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Comment</label>
            <Textarea
              value={editingCabin.comment}
              onChange={(e) => setEditingCabin({ ...editingCabin, comment: e.target.value })}
              placeholder="Additional comments or notes"
              className="min-h-20"
            />
          </div>

          <div className="flex gap-2 justify-end pt-4 border-t">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Cabin
            </Button>
          </div>
        </div>
      )}
    </EditModal>
  );

  // Render only buttons for synchronized mode
  if (showOnlyButtons) {
    return (
      <>
        {renderEditModal()}
        <DeletionConfirmModal
          isOpen={deletingCabin !== null}
          onClose={handleCancelDelete}
          onConfirm={handleConfirmDelete}
          itemName={`Cabin ${deletingCabin?.cabinNr || ''}`}
          itemType="Cabin"
        />
        {!isComparison && devView ? (
          <Button onClick={handleAddCabin}>
            <Plus className="w-4 h-4 mr-2" />
            Add Cabin
          </Button>
        ) : null}
      </>
    );
  }

  // Render only a specific card for synchronized mode
  if (showOnlyCard && cardIndex !== undefined) {
    const cabin = data[cardIndex];
    if (!cabin) return null;

    return (
      <>
        {renderEditModal()}
        <DeletionConfirmModal
          isOpen={deletingCabin !== null}
          onClose={handleCancelDelete}
          onConfirm={handleConfirmDelete}
          itemName={`Cabin ${deletingCabin?.cabinNr || ''}`}
          itemType="Cabin"
        />
        <Card className={`${isComparison ? 'bg-muted/20 h-full flex flex-col' : 'h-full flex flex-col'} ${hasIncompleteTranslations(cabin.cabinNr) ? 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800' : ''}`}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Home className="w-4 h-4" />
                  Cabin {cabin.cabinNr}
                </CardTitle>
                <CardDescription>
                  {cabin.beds} {cabin.beds === 1 ? 'bed' : 'beds'}{devView ? ` • Position: ${cabin.posTop}x${cabin.posLeft}` : ''}
                </CardDescription>
              </div>
              {!isComparison && (
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(cardIndex)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDeleteCabin(cardIndex)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Beds:</span> {cabin.beds}
                </div>
                <div>
                  <span className="font-medium">Cabin Nr:</span> {cabin.cabinNr}
                </div>
                {devView && (
                  <div>
                    <span className="font-medium">Top:</span> {cabin.posTop}px
                  </div>
                )}
                {devView && (
                  <div>
                    <span className="font-medium">Left:</span> {cabin.posLeft}px
                  </div>
                )}
              </div>
              
              {cabin.comment && (
                <div className="mt-3">
                  <h4 className="font-medium text-sm mb-1">Comment:</h4>
                  <p className="text-sm text-muted-foreground">{cabin.comment}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </>
    );
  }

  // Render empty state for synchronized mode
  if (showEmptyState) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">No cabins available</p>
        </CardContent>
      </Card>
    );
  }

  // Default rendering for non-synchronized mode
  return (
    <>
      {renderEditModal()}
      <DeletionConfirmModal
        isOpen={deletingCabin !== null}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        itemName={`Cabin ${deletingCabin?.cabinNr || ''}`}
        itemType="Cabin"
      />
      <div className="space-y-4">
        <div className="flex items-center justify-between min-h-10">
          {!isComparison && devView ? (
            <Button onClick={handleAddCabin}>
              <Plus className="w-4 h-4 mr-2" />
              Add Cabin
            </Button>
          ) : (
            <div></div>
          )}
        </div>

        <div className="grid gap-4">
          {data.map((cabin, index) => (
            <Card key={`cabin-${cabin.cabinNr}-${index}`} className={`${isComparison ? 'bg-muted/20' : ''} ${hasIncompleteTranslations(cabin.cabinNr) ? 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800' : ''}`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Home className="w-4 h-4" />
                      Cabin {cabin.cabinNr}
                    </CardTitle>
                    <CardDescription>
                      {cabin.beds} {cabin.beds === 1 ? 'bed' : 'beds'}{devView ? ` • Position: ${cabin.posTop}x${cabin.posLeft}` : ''}
                    </CardDescription>
                  </div>
                  {!isComparison && (
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(index)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDeleteCabin(index)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Beds:</span> {cabin.beds}
                    </div>
                    <div>
                      <span className="font-medium">Cabin Nr:</span> {cabin.cabinNr}
                    </div>
                    {devView && (
                      <div>
                        <span className="font-medium">Top:</span> {cabin.posTop}px
                      </div>
                    )}
                    {devView && (
                      <div>
                        <span className="font-medium">Left:</span> {cabin.posLeft}px
                      </div>
                    )}
                  </div>
                  
                  {cabin.comment && (
                    <div className="mt-3">
                      <h4 className="font-medium text-sm mb-1">Comment:</h4>
                      <p className="text-sm text-muted-foreground">{cabin.comment}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}

          {data.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">No cabins available</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}