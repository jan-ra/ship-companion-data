'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Edit, ChevronDown, ChevronUp, Code, FileText } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { useCollapse } from '@/components/DataEditor';
import { Checklist, ChecklistTask, DataType, Language } from '@/types';
import { MultiLanguageEditModal } from '@/components/MultiLanguageEditModal';
import { DeletionConfirmModal } from '@/components/DeletionConfirmModal';

interface ChecklistEditorProps {
  data: Checklist[];
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

export function ChecklistEditor({ 
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
}: ChecklistEditorProps) {
  const { data: allData, updateData, createDataAcrossLanguages, deleteDataAcrossLanguages, devView } = useData();
  const { collapsedItems, toggleCollapse } = useCollapse();
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingChecklist, setEditingChecklist] = useState<Checklist | null>(null);
  const [deletingChecklist, setDeletingChecklist] = useState<Checklist | null>(null);
  const [jsonEditMode, setJsonEditMode] = useState(false);

  // Get all item IDs for collapse functionality
  const getAllItemIds = (): string[] => {
    return data.map((checklist: any) => String(checklist.id)).filter(Boolean);
  };

  // Wrapper for toggleCollapse that passes all item IDs
  const handleToggleCollapse = (itemId: string | number) => {
    toggleCollapse(String(itemId), getAllItemIds());
  };

  // Helper function to check if a checklist has incomplete translations
  const hasIncompleteTranslations = (checklistId: string): boolean => {
    if (!validationResults) return false;
    return validationResults.incompleteItems.some(item => item.id === parseInt(checklistId));
  };

  const handleEdit = (index: number) => {
    setEditingIndex(index);
  };


  const handleCancel = () => {
    setEditingIndex(null);
    setEditingChecklist(null);
    setJsonEditMode(false);
  };

  const handleAddChecklist = () => {
    if (isComparison) return;
    setEditingIndex(data.length);
  };

  const handleDeleteChecklist = (index: number) => {
    if (isComparison) return;
    setDeletingChecklist(data[index]);
  };

  const handleConfirmDelete = () => {
    if (deletingChecklist) {
      deleteDataAcrossLanguages(dataType, deletingChecklist.id, 'id');
      setDeletingChecklist(null);
    }
  };

  const handleCancelDelete = () => {
    setDeletingChecklist(null);
  };

  // Multi-language save handler
  const handleMultiLanguageSave = (allLanguageData: Record<string, Checklist>) => {
    if (editingIndex !== null && !isComparison && allData) {
      if (editingIndex >= data.length) {
        // Adding new checklist - update all languages
        Object.entries(allLanguageData).forEach(([lang, checklist]) => {
          const langChecklists = [...((allData['checklists'][lang as keyof typeof allData['checklists']] as Checklist[]) || [])];
          langChecklists.push(checklist);
          updateData(dataType, lang as Language, langChecklists);
        });
      } else {
        // Editing existing checklist - update all languages
        Object.entries(allLanguageData).forEach(([lang, checklist]) => {
          const langChecklists = [...((allData['checklists'][lang as keyof typeof allData['checklists']] as Checklist[]) || [])];
          if (langChecklists[editingIndex]) {
            langChecklists[editingIndex] = checklist;
            updateData(dataType, lang as Language, langChecklists);
          }
        });
      }
      setEditingIndex(null);
      setEditingChecklist(null);
      setJsonEditMode(false);
    }
  };

  // Get checklist data for all languages for editing
  const getChecklistForAllLanguages = (index: number): Record<string, Checklist> => {
    if (!allData) return {} as Record<string, Checklist>;

    const languages = ['en', 'de', 'nl'];
    const result: Record<string, Checklist> = {};

    languages.forEach((lang) => {
      const langChecklists = (allData['checklists'][lang as keyof typeof allData['checklists']] as Checklist[]) || [];
      if (index < langChecklists.length) {
        result[lang] = { ...langChecklists[index] };
      } else {
        // Create empty checklist for missing languages
        result[lang] = {
          id: (Math.max(...data.map(c => parseInt(c.id)), 0) + 1).toString(),
          title: '',
          description: '',
          icon: 'person',
          tasks: []
        };
      }
    });

    return result;
  };

  // Create new checklist template for all languages
  const createNewChecklistForAllLanguages = (): Record<string, Checklist> => {
    const languages = ['en', 'de', 'nl'];
    const result: Record<string, Checklist> = {};
    const newId = (Math.max(...data.map(c => parseInt(c.id)), 0) + 1).toString();

    languages.forEach((lang) => {
      result[lang] = {
        id: newId,
        title: lang === 'en' ? 'New Checklist' : '',
        description: lang === 'en' ? 'Checklist description' : '',
        icon: 'person',
        tasks: []
      };
    });

    return result;
  };


  // Checklist form component for use in MultiLanguageEditModal
  const renderChecklistForm = (
    currentChecklist: Checklist,
    onUpdate: (checklist: Checklist) => void,
    currentLanguage: string
  ) => {
    const handleAddTask = () => {
      const newTasks = [...currentChecklist.tasks, { 
        id: (currentChecklist.tasks.length + 1).toString(),
        title: 'New Task',
        description: 'Task description'
      }];
      onUpdate({ ...currentChecklist, tasks: newTasks });
    };

    const handleUpdateTask = (index: number, field: keyof ChecklistTask, value: string) => {
      const newTasks = [...currentChecklist.tasks];
      newTasks[index] = { ...newTasks[index], [field]: value };
      onUpdate({ ...currentChecklist, tasks: newTasks });
    };

    const handleDeleteTask = (index: number) => {
      const newTasks = currentChecklist.tasks.filter((_, i) => i !== index);
      onUpdate({ ...currentChecklist, tasks: newTasks });
    };

    // JSON edit handlers
    const handleJsonEdit = (jsonString: string) => {
      try {
        const parsedChecklist = JSON.parse(jsonString);
        onUpdate(parsedChecklist);
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
                  Checklist JSON ({currentLanguage})
                </label>
                <Textarea
                  value={JSON.stringify(currentChecklist, null, 2)}
                  onChange={(e) => handleJsonEdit(e.target.value)}
                  className="font-mono text-sm min-h-96 mt-2"
                  placeholder="Edit checklist as JSON..."
                />
              </div>
            </div>
          ) : (
            // Regular Form View
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Title</label>
                    <Input
                      value={currentChecklist.title}
                      onChange={(e) => onUpdate({ ...currentChecklist, title: e.target.value })}
                      placeholder="Checklist name"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Icon</label>
                    <Select
                      value={currentChecklist.icon}
                      onValueChange={(value) => onUpdate({ ...currentChecklist, icon: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select icon type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="person">Person</SelectItem>
                        <SelectItem value="group">Group</SelectItem>
                        <SelectItem value="cleaning">Cleaning</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Description</label>
                    <Textarea
                      value={currentChecklist.description}
                      onChange={(e) => onUpdate({ ...currentChecklist, description: e.target.value })}
                      placeholder="Brief description of the checklist"
                      className="min-h-20"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">Tasks</label>
                      <Button size="sm" onClick={handleAddTask}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Task
                      </Button>
                    </div>
                    <div className="space-y-2 max-h-80 overflow-y-auto border rounded-md p-3">
                      {currentChecklist.tasks.map((task, index) => (
                        <div key={index} className="bg-muted/20 p-3 rounded space-y-2">
                          <Input
                            placeholder="Task title"
                            value={task.title}
                            onChange={(e) => handleUpdateTask(index, 'title', e.target.value)}
                          />
                          <Textarea
                            placeholder="Task description"
                            value={task.description}
                            onChange={(e) => handleUpdateTask(index, 'description', e.target.value)}
                            className="min-h-16"
                          />
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteTask(index)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Task
                          </Button>
                        </div>
                      ))}
                      {currentChecklist.tasks.length === 0 && (
                        <div className="text-center text-muted-foreground py-4">
                          No tasks added yet
                        </div>
                      )}
                    </div>
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
      ? createNewChecklistForAllLanguages() 
      : getChecklistForAllLanguages(editingIndex);

    return (
      <MultiLanguageEditModal<Checklist>
        isOpen={editingIndex !== null}
        onClose={handleCancel}
        onSave={handleMultiLanguageSave}
        title={isCreating ? "Add New Checklist" : "Edit Checklist"}
        description="Modify checklist details and manage tasks"
        size="xl"
        initialData={initialData}
        initialLanguage={language as Language}
        isCreating={isCreating}
        validateData={(checklist) => checklist.title.trim().length > 0}
      >
        {renderChecklistForm}
      </MultiLanguageEditModal>
    );
  };


  // Render only buttons for synchronized mode
  if (showOnlyButtons) {
    return (
      <>
        {renderEditModal()}
        <DeletionConfirmModal
          isOpen={deletingChecklist !== null}
          onClose={handleCancelDelete}
          onConfirm={handleConfirmDelete}
          itemName={deletingChecklist?.title || ''}
          itemType="Checklist"
        />
        {!isComparison ? (
          <Button onClick={handleAddChecklist}>
            <Plus className="w-4 h-4 mr-2" />
            Add Checklist
          </Button>
        ) : null}
      </>
    );
  }

  // Render only a specific card for synchronized mode
  if (showOnlyCard && cardIndex !== undefined) {
    const checklist = data[cardIndex];
    if (!checklist) return null;

    return (
      <>
        {renderEditModal()}
        <DeletionConfirmModal
          isOpen={deletingChecklist !== null}
          onClose={handleCancelDelete}
          onConfirm={handleConfirmDelete}
          itemName={deletingChecklist?.title || ''}
          itemType="Checklist"
        />
        <Card className={`${isComparison ? 'bg-muted/20 h-full flex flex-col' : 'h-full flex flex-col'} ${hasIncompleteTranslations(checklist.id) ? 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800' : ''}`}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between min-w-0">
              <div 
                className="flex-1 min-w-0 cursor-pointer mr-3" 
                onClick={() => handleToggleCollapse(checklist.id)}
              >
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="p-1 h-6 w-6 flex-shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleCollapse(checklist.id);
                    }}
                  >
                    {collapsedItems.has(checklist.id) || collapsedItems.has('*') ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronUp className="w-4 h-4" />
                    )}
                  </Button>
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-lg truncate">{checklist.title}</CardTitle>
                    <CardDescription>{checklist.tasks.length} tasks</CardDescription>
                  </div>
                </div>
              </div>
              {!isComparison && (
                <div className="flex gap-2 flex-shrink-0" style={{minWidth: '80px'}}>
                  <Button size="sm" variant="outline" onClick={() => handleEdit(cardIndex)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDeleteChecklist(cardIndex)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          {!(collapsedItems.has(checklist.id) || collapsedItems.has('*')) && (
            <CardContent className="flex-1 pt-0">
              <p className="text-sm mb-3">{checklist.description}</p>
              
              <div className="space-y-2">
                {checklist.tasks.map((task) => (
                  <div key={task.id} className="border-l-4 border-muted pl-3">
                    <h4 className="font-medium text-sm">{task.title}</h4>
                    <p className="text-sm text-muted-foreground">{task.description}</p>
                  </div>
                ))}
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
          <p className="text-muted-foreground">No checklists available</p>
        </CardContent>
      </Card>
    );
  }

  // Default rendering for non-synchronized mode
  return (
    <>
      {renderEditModal()}
      <DeletionConfirmModal
        isOpen={deletingChecklist !== null}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        itemName={deletingChecklist?.title || ''}
        itemType="Checklist"
      />
      <div className="space-y-4">
        <div className="flex items-center justify-between min-h-10">
          {!isComparison ? (
            <Button onClick={handleAddChecklist}>
              <Plus className="w-4 h-4 mr-2" />
              Add Checklist
            </Button>
          ) : (
            <div></div>
          )}
        </div>

        <div className="grid gap-4">
        {data.map((checklist, index) => (
          <Card key={checklist.id} className={`${isComparison ? 'bg-muted/20' : ''} ${hasIncompleteTranslations(checklist.id) ? 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800' : ''}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between min-w-0">
                <div 
                  className="flex-1 min-w-0 cursor-pointer mr-3" 
                  onClick={() => handleToggleCollapse(checklist.id)}
                >
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="p-1 h-6 w-6 flex-shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleCollapse(checklist.id);
                      }}
                    >
                      {collapsedItems.has(checklist.id) || collapsedItems.has('*') ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronUp className="w-4 h-4" />
                      )}
                    </Button>
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-lg truncate">{checklist.title}</CardTitle>
                      <CardDescription>{checklist.tasks.length} tasks</CardDescription>
                    </div>
                  </div>
                </div>
                {!isComparison && (
                  <div className="flex gap-2 flex-shrink-0" style={{minWidth: '80px'}}>
                    <Button size="sm" variant="outline" onClick={() => handleEdit(index)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDeleteChecklist(index)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            {!(collapsedItems.has(checklist.id) || collapsedItems.has('*')) && (
              <CardContent className="pt-0">
                <p className="text-sm mb-3">{checklist.description}</p>
                
                <div className="space-y-2">
                  {checklist.tasks.map((task) => (
                    <div key={task.id} className="border-l-4 border-muted pl-3">
                      <h4 className="font-medium text-sm">{task.title}</h4>
                      <p className="text-sm text-muted-foreground">{task.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {data.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">No checklists available</p>
          </CardContent>
        </Card>
      )}
      </div>
    </>
  );
}