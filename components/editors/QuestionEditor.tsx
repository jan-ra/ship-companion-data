'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Edit, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { Question, DataType, Language } from '@/types';
import { MultiLanguageEditModal } from '@/components/MultiLanguageEditModal';
import { DeletionConfirmModal } from '@/components/DeletionConfirmModal';
import { useCollapse } from '@/components/DataEditor';

interface QuestionEditorProps {
  data: Question[];
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

export function QuestionEditor({ 
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
}: QuestionEditorProps) {
  const { updateData, createDataAcrossLanguages, deleteDataByIndexAcrossLanguages, data: allData, devView } = useData();
  const { collapsedItems, toggleCollapse } = useCollapse();
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [deletingQuestion, setDeletingQuestion] = useState<Question | null>(null);
  const [deletingIndex, setDeletingIndex] = useState<number | null>(null);
  const [jsonEditMode, setJsonEditMode] = useState(false);

  // Helper function to check if a question has incomplete translations
  const hasIncompleteTranslations = (questionIndex: number): boolean => {
    if (!validationResults) return false;
    return validationResults.incompleteItems.some(item => item.id === questionIndex);
  };

  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setEditingQuestion({ ...data[index] });
  };

  const handleSave = () => {
    if (editingIndex !== null && editingQuestion && !isComparison) {
      if (editingIndex >= data.length) {
        // Adding new question - create across all languages
        const questionWithId = { ...editingQuestion, id: editingIndex };
        createDataAcrossLanguages(dataType, language as any, questionWithId, 'questiontext');
      } else {
        // Editing existing question - update only current language
        const newData = [...data];
        newData[editingIndex] = editingQuestion;
        updateData(dataType, language as any, newData);
      }
      
      setEditingIndex(null);
      setEditingQuestion(null);
    }
  };

  const handleCancel = () => {
    setEditingIndex(null);
    setEditingQuestion(null);
    setJsonEditMode(false);
  };

  // Multi-language support functions
  const handleMultiLanguageSave = (questionData: Record<Language, Question>) => {
    if (editingIndex !== null && !isComparison) {
      if (editingIndex >= data.length) {
        // Adding new question - create across all languages using the provided data
        createDataAcrossLanguages(dataType, 'en' as Language, questionData['en'], 'questiontext');
      } else {
        // Editing existing question - update each language with its respective data
        Object.entries(questionData).forEach(([lang, questionForLang]) => {
          const langData = allData?.[dataType]?.[lang as keyof typeof allData[typeof dataType]];
          if (Array.isArray(langData)) {
            const newLangData = [...langData];
            newLangData[editingIndex] = questionForLang;
            updateData(dataType, lang as Language, newLangData);
          }
        });
      }
      
      setEditingIndex(null);
      setEditingQuestion(null);
      setJsonEditMode(false);
    }
  };

  const getQuestionForAllLanguages = (index: number): Record<Language, Question> => {
    const languages: Language[] = ['en', 'de', 'nl'];
    const result: Record<Language, Question> = {} as Record<Language, Question>;
    
    languages.forEach(lang => {
      const langData = allData?.[dataType]?.[lang as keyof typeof allData[typeof dataType]];
      if (Array.isArray(langData) && index < langData.length) {
        result[lang] = { ...langData[index] } as Question;
      } else {
        result[lang] = { ...editingQuestion! };
      }
    });
    
    return result;
  };

  const createNewQuestionForAllLanguages = (baseQuestion: Question): Record<string, Question> => {
    const languages = ['en', 'de', 'nl'];
    const result: Record<string, Question> = {};
    
    languages.forEach(lang => {
      result[lang] = { ...baseQuestion };
    });
    
    return result;
  };

  const handleAddQuestion = () => {
    if (isComparison) return;
    
    const newQuestion: Question = {
      questiontext: 'New Question',
      answertext: 'Answer to the question'
    };
    
    setEditingIndex(data.length);
    setEditingQuestion(newQuestion);
  };

  const handleDeleteQuestion = (index: number) => {
    if (isComparison) return;
    setDeletingQuestion({ ...data[index] });
    setDeletingIndex(index);
  };

  const handleConfirmDelete = () => {
    if (deletingIndex !== null) {
      deleteDataByIndexAcrossLanguages(dataType, deletingIndex);
      setDeletingQuestion(null);
      setDeletingIndex(null);
    }
  };

  const handleCancelDelete = () => {
    setDeletingQuestion(null);
    setDeletingIndex(null);
  };

  // Create the question form component
  const renderQuestionForm = (
    currentQuestion: Question,
    onUpdate: (question: Question) => void,
    currentLanguage: string
  ) => {
    // JSON edit handlers
    const handleJsonEdit = (jsonString: string) => {
      try {
        const parsedQuestion = JSON.parse(jsonString);
        onUpdate(parsedQuestion);
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
            value={JSON.stringify(currentQuestion, null, 2)}
            onChange={(e) => handleJsonEdit(e.target.value)}
            className="font-mono text-sm min-h-[400px]"
            placeholder="Edit question JSON..."
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
        
        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Question</label>
            <Input
              value={currentQuestion.questiontext}
              onChange={(e) => onUpdate({ ...currentQuestion, questiontext: e.target.value })}
              placeholder="Enter the question"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Answer</label>
            <Textarea
              value={currentQuestion.answertext}
              onChange={(e) => onUpdate({ ...currentQuestion, answertext: e.target.value })}
              placeholder="Enter the detailed answer"
              className="min-h-32"
            />
          </div>
        </div>
      </div>
    );
  };

  const renderEditModal = () => {
    if (!editingQuestion) return null;
    
    const isNewQuestion = editingIndex !== null && editingIndex >= data.length;
    const initialData = isNewQuestion 
      ? createNewQuestionForAllLanguages(editingQuestion)
      : getQuestionForAllLanguages(editingIndex!);

    return (
      <MultiLanguageEditModal
        isOpen={editingIndex !== null}
        onClose={handleCancel}
        onSave={handleMultiLanguageSave}
        title={isNewQuestion ? "Add New Question" : "Edit Question"}
        description="Create frequently asked questions with detailed answers"
        initialData={initialData}
        size="lg"
      >
        {renderQuestionForm}
      </MultiLanguageEditModal>
    );
  };

  // Render only buttons for synchronized mode
  if (showOnlyButtons) {
    return (
      <>
        {renderEditModal()}
        <DeletionConfirmModal
          isOpen={deletingQuestion !== null}
          onClose={handleCancelDelete}
          onConfirm={handleConfirmDelete}
          itemName={deletingQuestion?.questiontext || ''}
          itemType="Question"
        />
        {!isComparison ? (
          <Button onClick={handleAddQuestion}>
            <Plus className="w-4 h-4 mr-2" />
            Add Question
          </Button>
        ) : null}
      </>
    );
  }

  // Render only a specific card for synchronized mode
  if (showOnlyCard && cardIndex !== undefined) {
    const question = data[cardIndex];
    if (!question) return null;

    const questionId = String(cardIndex); // Use index as ID since questions don't have unique IDs
    const isCollapsed = collapsedItems.has(questionId) || collapsedItems.has('*');
    const allItemIds = data.map((_, idx) => String(idx));

    return (
      <>
        {renderEditModal()}
        <DeletionConfirmModal
          isOpen={deletingQuestion !== null}
          onClose={handleCancelDelete}
          onConfirm={handleConfirmDelete}
          itemName={deletingQuestion?.questiontext || ''}
          itemType="Question"
        />
        <Card className={`${isComparison ? 'bg-muted/20 h-full flex flex-col' : 'h-full flex flex-col'} ${hasIncompleteTranslations(cardIndex) ? 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800' : ''}`}>
          <CardHeader>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2 flex-1 cursor-pointer" onClick={() => toggleCollapse(questionId, allItemIds)}>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="p-0 h-auto flex-shrink-0 mt-0.5"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleCollapse(questionId, allItemIds);
                  }}
                >
                  {isCollapsed ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronUp className="w-4 h-4" />
                  )}
                </Button>
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-lg flex items-start gap-2 leading-tight">
                    <HelpCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span className="break-words">{question.questiontext}</span>
                  </CardTitle>
                </div>
              </div>
              {!isComparison && (
                <div className="flex gap-2 flex-shrink-0">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(cardIndex)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDeleteQuestion(cardIndex)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          {!isCollapsed && (
            <CardContent className="flex-1">
              <p className="text-sm whitespace-pre-wrap">{question.answertext}</p>
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
          <p className="text-muted-foreground">No questions available</p>
        </CardContent>
      </Card>
    );
  }

  // Default rendering for non-synchronized mode
  return (
    <>
      {renderEditModal()}
      <DeletionConfirmModal
        isOpen={deletingQuestion !== null}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        itemName={deletingQuestion?.questiontext || ''}
        itemType="Question"
      />
      <div className="space-y-4">
        <div className="flex items-center justify-between min-h-10">
          {!isComparison ? (
            <Button onClick={handleAddQuestion}>
              <Plus className="w-4 h-4 mr-2" />
              Add Question
            </Button>
          ) : (
            <div></div>
          )}
        </div>

        <div className="grid gap-4">
          {data.map((question, index) => {
            const questionId = String(index); // Use index as ID since questions don't have unique IDs
            const isCollapsed = collapsedItems.has(questionId) || collapsedItems.has('*');
            const allItemIds = data.map((_, idx) => String(idx));
            
            return (
              <Card key={index} className={`${isComparison ? 'bg-muted/20' : ''} ${hasIncompleteTranslations(index) ? 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800' : ''}`}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2 flex-1 cursor-pointer" onClick={() => toggleCollapse(questionId, allItemIds)}>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="p-0 h-auto flex-shrink-0 mt-0.5"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleCollapse(questionId, allItemIds);
                        }}
                      >
                        {isCollapsed ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronUp className="w-4 h-4" />
                        )}
                      </Button>
                      <div className="min-w-0 flex-1">
                        <CardTitle className="text-lg flex items-start gap-2 leading-tight">
                          <HelpCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                          <span className="break-words">{question.questiontext}</span>
                        </CardTitle>
                      </div>
                    </div>
                    {!isComparison && (
                      <div className="flex gap-2 flex-shrink-0">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(index)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDeleteQuestion(index)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                {!isCollapsed && (
                  <CardContent>
                    <p className="text-sm whitespace-pre-wrap">{question.answertext}</p>
                  </CardContent>
                )}
              </Card>
            );
          })}

          {data.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">No questions available</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}