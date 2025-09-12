'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Edit, Save, X, Plus, Trash2 } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { DataType } from '@/types';
import { EditModal } from '@/components/EditModal';

interface JsonEditorProps {
  data: any;
  language: string;
  dataType: DataType;
  isComparison?: boolean;
  itemName: string;
  itemsName: string;
}

export function JsonEditor({ 
  data, 
  language, 
  dataType, 
  isComparison = false, 
  itemName, 
  itemsName 
}: JsonEditorProps) {
  const { updateData } = useData();
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleEdit = () => {
    setIsEditing(true);
    setEditedData(JSON.stringify(data, null, 2));
    setError(null);
  };

  const handleSave = () => {
    if (isComparison) return;
    
    try {
      const parsed = JSON.parse(editedData);
      updateData(dataType, language as any, parsed);
      setIsEditing(false);
      setError(null);
    } catch (err) {
      setError('Invalid JSON format');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedData('');
    setError(null);
  };

  const handleAddItem = () => {
    if (isComparison || !Array.isArray(data)) return;
    
    const newItem = { id: data.length + 1, name: `New ${itemName}` };
    const newData = [...data, newItem];
    updateData(dataType, language as any, newData);
  };

  const renderEditModal = () => (
    <EditModal
      isOpen={isEditing}
      onClose={handleCancel}
      title={`Edit ${itemsName}`}
      description="Edit the JSON data directly. Make sure to maintain valid JSON format."
      size="full"
    >
      <div className="space-y-4 p-1">
        <Textarea
          className="font-mono text-sm min-h-[500px] max-h-[70vh] w-full resize-none"
          value={editedData}
          onChange={(e) => setEditedData(e.target.value)}
          placeholder="Enter valid JSON..."
        />
        
        {error && (
          <div className="text-sm text-destructive bg-destructive/10 p-3 rounded">
            <strong>JSON Error:</strong> {error}
          </div>
        )}
        
        <div className="flex gap-2 justify-end pt-4 border-t">
          <Button variant="outline" onClick={handleCancel}>
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>
    </EditModal>
  );

  return (
    <>
      {renderEditModal()}
      <div className="space-y-4">
        <div className="flex items-center justify-between min-h-10">
          {!isComparison ? (
            <div className="flex gap-2">
              {Array.isArray(data) && (
                <Button onClick={handleAddItem}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add {itemName}
                </Button>
              )}
              <Button variant="outline" onClick={handleEdit}>
                <Edit className="w-4 h-4 mr-2" />
                Edit JSON
              </Button>
            </div>
          ) : (
            <div></div>
          )}
        </div>

        <Card className={isComparison ? 'bg-muted/20' : ''}>
        <CardHeader>
          <CardTitle>
            {itemsName} ({Array.isArray(data) ? data.length : 'Object'})
          </CardTitle>
          <CardDescription>
            {Array.isArray(data) 
              ? `${data.length} ${data.length === 1 ? itemName : itemsName} available`
              : `${itemName} configuration`
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.isArray(data) ? (
              data.map((item: any, index: number) => (
                <div key={item.id || index} className="border rounded p-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium">
                        {item.name || item.title || `${itemName} ${index + 1}`}
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {item.description || Object.keys(item).join(', ')}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-muted/50 rounded p-4">
                <pre className="text-sm overflow-auto">
                  {JSON.stringify(data, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      </div>
    </>
  );
}