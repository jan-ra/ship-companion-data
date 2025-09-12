'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit, Info, X, User } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { About, Fact, DataType } from '@/types';
import { EditModal } from '@/components/EditModal';

interface AboutEditorProps {
  data: About;
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

export function AboutEditor({ 
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
}: AboutEditorProps) {
  const { updateData } = useData();
  const [isEditing, setIsEditing] = useState(false);
  const [editingAbout, setEditingAbout] = useState<About | null>(null);

  const handleEdit = () => {
    setIsEditing(true);
    setEditingAbout({ ...data });
  };

  const handleSave = () => {
    if (editingAbout && !isComparison) {
      updateData(dataType, language as Language, editingAbout);
      setIsEditing(false);
      setEditingAbout(null);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditingAbout(null);
  };

  const handleAddFact = () => {
    if (!editingAbout) return;
    
    const newFact: Fact = {
      key: 'New Fact',
      value: 'Fact value'
    };
    
    setEditingAbout({
      ...editingAbout,
      facts: [...editingAbout.facts, newFact]
    });
  };

  const handleUpdateFact = (index: number, field: keyof Fact, value: string) => {
    if (!editingAbout) return;
    
    const newFacts = [...editingAbout.facts];
    newFacts[index] = { ...newFacts[index], [field]: value };
    
    setEditingAbout({
      ...editingAbout,
      facts: newFacts
    });
  };

  const handleDeleteFact = (index: number) => {
    if (!editingAbout) return;
    
    setEditingAbout({
      ...editingAbout,
      facts: editingAbout.facts.filter((_, i) => i !== index)
    });
  };

  const renderEditModal = () => (
    <EditModal
      isOpen={isEditing}
      onClose={handleCancel}
      title="Edit About Information"
      description="Manage company history, captain information, and key facts"
      size="full"
    >
      {editingAbout && (
        <div className="space-y-6 p-1">
          {/* Captain Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Captain Information</h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Captain Image URL</label>
                <Input
                  value={editingAbout.captainImage}
                  onChange={(e) => setEditingAbout({ ...editingAbout, captainImage: e.target.value })}
                  placeholder="https://example.com/captain-image.jpg"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Captain Vita/Biography</label>
                <Textarea
                  value={editingAbout.vita}
                  onChange={(e) => setEditingAbout({ ...editingAbout, vita: e.target.value })}
                  placeholder="Captain's biography and experience"
                  className="min-h-32"
                />
              </div>
            </div>
          </div>

          {/* Company History */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Company History</h3>
            <div className="space-y-2">
              <label className="text-sm font-medium">History</label>
              <Textarea
                value={editingAbout.history}
                onChange={(e) => setEditingAbout({ ...editingAbout, history: e.target.value })}
                placeholder="Company history and background story"
                className="min-h-40"
              />
            </div>
          </div>

          {/* Facts */}
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold border-b pb-2">Key Facts</h3>
                <Button size="sm" onClick={handleAddFact}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Fact
                </Button>
              </div>
              <div className="space-y-3 max-h-80 overflow-y-auto border rounded-md p-4">
                {editingAbout.facts.map((fact, index) => (
                  <div key={index} className="bg-muted/20 p-3 rounded space-y-2">
                    <div className="flex gap-2 items-center">
                      <Input
                        className="flex-1"
                        placeholder="Fact key/title"
                        value={fact.key}
                        onChange={(e) => handleUpdateFact(index, 'key', e.target.value)}
                      />
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteFact(index)}
                        className="h-9 w-9 p-0 flex-shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    <Textarea
                      placeholder="Fact value/description"
                      value={fact.value}
                      onChange={(e) => handleUpdateFact(index, 'value', e.target.value)}
                      className="min-h-20"
                    />
                  </div>
                ))}
                {editingAbout.facts.length === 0 && (
                  <div className="text-center text-muted-foreground py-8">
                    No facts added yet
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-4 border-t">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save About Information
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
        {/* Main edit button hidden - use card-level buttons instead */}
        {false && !isComparison ? (
          <Button onClick={handleEdit}>
            <Edit className="w-4 h-4 mr-2" />
            Edit About
          </Button>
        ) : null}
      </>
    );
  }

  // Render only a specific card for synchronized mode (About is single object, so cardIndex is ignored)
  if (showOnlyCard) {
    return (
      <>
        {renderEditModal()}
        <Card className={isComparison ? 'bg-muted/20 h-full flex flex-col' : 'h-full flex flex-col'}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  About Information
                </CardTitle>
                <CardDescription>
                  Company history & captain details • {data.facts.length} facts
                </CardDescription>
              </div>
              {!isComparison && (
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={handleEdit}>
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="flex-1 space-y-4">
            {data.history && (
              <div>
                <h4 className="font-medium text-sm mb-2">History:</h4>
                <p className="text-sm text-muted-foreground line-clamp-3">{data.history}</p>
              </div>
            )}
            
            {data.vita && (
              <div>
                <h4 className="font-medium text-sm mb-2 flex items-center gap-1">
                  <User className="w-3 h-3" />
                  Captain Biography:
                </h4>
                <p className="text-sm text-muted-foreground line-clamp-2">{data.vita}</p>
              </div>
            )}

            {data.facts.length > 0 && (
              <div>
                <h4 className="font-medium text-sm mb-2">Key Facts:</h4>
                <div className="space-y-1">
                  {data.facts.slice(0, 3).map((fact, index) => (
                    <div key={index} className="text-sm">
                      <span className="font-medium">{fact.key}:</span>{' '}
                      <span className="text-muted-foreground">{fact.value}</span>
                    </div>
                  ))}
                  {data.facts.length > 3 && (
                    <div className="text-xs text-muted-foreground">
                      +{data.facts.length - 3} more facts
                    </div>
                  )}
                </div>
              </div>
            )}
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
          <p className="text-muted-foreground">No about information available</p>
        </CardContent>
      </Card>
    );
  }

  // Default rendering for non-synchronized mode
  return (
    <>
      {renderEditModal()}
      <div className="space-y-4">
        <div className="flex items-center justify-between min-h-10">
          {/* Main edit button hidden - use card-level buttons instead */}
          {false && !isComparison && (
            <Button onClick={handleEdit}>
              <Edit className="w-4 h-4 mr-2" />
              Edit About
            </Button>
          )}
        </div>

        <Card className={isComparison ? 'bg-muted/20' : ''}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  About Information
                </CardTitle>
                <CardDescription>
                  Company history & captain details • {data.facts.length} facts
                </CardDescription>
              </div>
              {!isComparison && (
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={handleEdit}>
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.history && (
              <div>
                <h4 className="font-medium text-sm mb-2">History:</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{data.history}</p>
              </div>
            )}
            
            {data.vita && (
              <div>
                <h4 className="font-medium text-sm mb-2 flex items-center gap-1">
                  <User className="w-3 h-3" />
                  Captain Biography:
                </h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{data.vita}</p>
              </div>
            )}

            {data.captainImage && (
              <div>
                <h4 className="font-medium text-sm mb-2">Captain Image:</h4>
                <p className="text-xs text-muted-foreground break-all">{data.captainImage}</p>
              </div>
            )}

            {data.facts.length > 0 && (
              <div>
                <h4 className="font-medium text-sm mb-2">Key Facts:</h4>
                <div className="space-y-2">
                  {data.facts.map((fact, index) => (
                    <div key={index} className="border-l-4 border-muted pl-3">
                      <div className="font-medium text-sm">{fact.key}</div>
                      <div className="text-sm text-muted-foreground">{fact.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}