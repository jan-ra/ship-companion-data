"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Trash2,
  Edit,
  ChevronDown,
  ChevronUp,
  Code,
  FileText,
} from "lucide-react";
import { useData } from "@/contexts/DataContext";
import { useCollapse } from "@/components/DataEditor";
import { Recipe, Ingredient, DataType, Language } from "@/types";
import { MultiLanguageEditModal } from "@/components/MultiLanguageEditModal";
import { DeletionConfirmModal } from "@/components/DeletionConfirmModal";

interface RecipeEditorProps {
  data: Recipe[];
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

export function RecipeEditor({
  data,
  language,
  dataType,
  isComparison = false,
  synchronizedMode = false,
  showOnlyButtons = false,
  showOnlyCard = false,
  showEmptyState = false,
  cardIndex,
  validationResults,
}: RecipeEditorProps) {
  const { data: allData, updateData, devView } = useData();
  const { collapsedItems, toggleCollapse } = useCollapse();
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [deletingRecipe, setDeletingRecipe] = useState<Recipe | null>(null);
  const [jsonEditMode, setJsonEditMode] = useState(false);

  // Get all item IDs for collapse functionality
  const getAllItemIds = (): string[] => {
    return data.map((recipe: any) => String(recipe.id)).filter(Boolean);
  };

  // Wrapper for toggleCollapse that passes all item IDs
  const handleToggleCollapse = (itemId: string | number) => {
    toggleCollapse(String(itemId), getAllItemIds());
  };

  // Helper function to check if a recipe has incomplete translations
  const hasIncompleteTranslations = (recipeId: string | number): boolean => {
    if (!validationResults) return false;
    return validationResults.incompleteItems.some(
      (item) => item.id === Number(recipeId)
    );
  };

  const handleEdit = (index: number) => {
    setEditingIndex(index);
  };

  const handleMultiLanguageSave = (allLanguageData: Record<string, Recipe>) => {
    if (editingIndex !== null && !isComparison && allData) {
      if (editingIndex >= data.length) {
        // Adding new recipe - update all languages
        Object.entries(allLanguageData).forEach(([lang, recipe]) => {
          const langRecipes = [
            ...((allData["recipes"][
              lang as keyof (typeof allData)["recipes"]
            ] as Recipe[]) || []),
          ];
          langRecipes.push(recipe);
          updateData(dataType, lang as Language, langRecipes);
        });
      } else {
        // Editing existing recipe - update all languages
        Object.entries(allLanguageData).forEach(([lang, recipe]) => {
          const langRecipes = [
            ...((allData["recipes"][
              lang as keyof (typeof allData)["recipes"]
            ] as Recipe[]) || []),
          ];
          if (langRecipes[editingIndex]) {
            langRecipes[editingIndex] = recipe;
            updateData(dataType, lang as Language, langRecipes);
          }
        });
      }
      setEditingIndex(null);
    }
  };

  const handleCancel = () => {
    setEditingIndex(null);
    setJsonEditMode(false);
  };

  const handleAddRecipe = () => {
    if (isComparison) return;
    setEditingIndex(data.length);
  };

  // Get recipe data for all languages for editing
  const getRecipeForAllLanguages = (index: number): Record<string, Recipe> => {
    if (!allData) return {} as Record<string, Recipe>;

    const languages = ["en", "de", "nl"];
    const result: Record<string, Recipe> = {};

    languages.forEach((lang) => {
      const langRecipes =
        (allData["recipes"][
          lang as keyof (typeof allData)["recipes"]
        ] as Recipe[]) || [];
      if (index < langRecipes.length) {
        result[lang] = { ...langRecipes[index] };
      } else {
        // Create empty recipe for missing languages
        result[lang] = {
          id: (Math.max(...data.map((r) => parseInt(r.id)), 0) + 1).toString(),
          title: "",
          description: "",
          type: "vegetarian",
          ingredients: [],
          spices: [],
          instructions: "",
        };
      }
    });

    return result;
  };

  // Create new recipe template for all languages
  const createNewRecipeForAllLanguages = (): Record<string, Recipe> => {
    const languages = ["en", "de", "nl"];
    const result: Record<string, Recipe> = {};
    const newId = (
      Math.max(...data.map((r) => parseInt(r.id)), 0) + 1
    ).toString();

    languages.forEach((lang) => {
      result[lang] = {
        id: newId,
        title: lang === "en" ? "New Recipe" : "",
        description: lang === "en" ? "Recipe description" : "",
        type: "vegetarian",
        ingredients: [],
        spices: [],
        instructions: "",
      };
    });

    return result;
  };

  const handleDeleteRecipe = (index: number) => {
    if (isComparison) return;
    setDeletingRecipe(data[index]);
  };

  const handleConfirmDelete = () => {
    if (deletingRecipe) {
      // Delete from all languages
      const languages = ["en", "de", "nl"];
      languages.forEach((lang) => {
        if (allData) {
          const langRecipes = [
            ...((allData["recipes"][
              lang as keyof (typeof allData)["recipes"]
            ] as Recipe[]) || []),
          ];
          const updatedRecipes = langRecipes.filter(
            (r) => r.id !== deletingRecipe.id
          );
          updateData(dataType, lang as Language, updatedRecipes);
        }
      });
      setDeletingRecipe(null);
    }
  };

  const handleCancelDelete = () => {
    setDeletingRecipe(null);
  };

  // Recipe form component for use in MultiLanguageEditModal
  const renderRecipeForm = (
    currentRecipe: Recipe,
    onUpdate: (recipe: Recipe) => void,
    currentLanguage: string
  ) => {
    const handleAddIngredient = () => {
      const newIngredients = [
        ...currentRecipe.ingredients,
        { id: Date.now().toString(), name: "", amount: 0, unit: "" },
      ];
      onUpdate({ ...currentRecipe, ingredients: newIngredients });
    };

    const handleUpdateIngredient = (
      index: number,
      field: keyof Ingredient,
      value: string | number
    ) => {
      const newIngredients = [...currentRecipe.ingredients];
      newIngredients[index] = { ...newIngredients[index], [field]: value };
      onUpdate({ ...currentRecipe, ingredients: newIngredients });
    };

    const handleDeleteIngredient = (index: number) => {
      const newIngredients = currentRecipe.ingredients.filter(
        (_, i) => i !== index
      );
      onUpdate({ ...currentRecipe, ingredients: newIngredients });
    };

    // JSON edit handlers
    const handleJsonEdit = (jsonString: string) => {
      try {
        const parsedRecipe = JSON.parse(jsonString);
        onUpdate(parsedRecipe);
      } catch (error) {
        console.error("Invalid JSON:", error);
        // Could add error state here if needed
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
                {jsonEditMode ? "Form View" : "JSON View"}
              </Button>
            </div>
          )}

          {jsonEditMode ? (
            // JSON Edit View
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">
                  Recipe JSON ({currentLanguage})
                </label>
                <Textarea
                  value={JSON.stringify(currentRecipe, null, 2)}
                  onChange={(e) => handleJsonEdit(e.target.value)}
                  className="font-mono text-sm min-h-96 mt-2"
                  placeholder="Edit recipe as JSON..."
                />
              </div>
            </div>
          ) : (
            // Regular Form View
            <>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full min-w-0">
                <div className="space-y-4 min-w-0">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Title</label>
                    <Input
                      value={currentRecipe.title}
                      onChange={(e) =>
                        onUpdate({ ...currentRecipe, title: e.target.value })
                      }
                      placeholder="Recipe name"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Type</label>
                    <Select
                      value={currentRecipe.type}
                      onValueChange={(value) =>
                        onUpdate({ ...currentRecipe, type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vegetarian">Vegetarian</SelectItem>
                        <SelectItem value="vegan">Vegan</SelectItem>
                        <SelectItem value="omni">Omnivore</SelectItem>
                        <SelectItem value="lunch">Lunch</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Description</label>
                    <Textarea
                      value={currentRecipe.description}
                      onChange={(e) =>
                        onUpdate({
                          ...currentRecipe,
                          description: e.target.value,
                        })
                      }
                      placeholder="Brief description of the recipe"
                      className="min-h-20"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Spices</label>
                    <Textarea
                      placeholder="Enter spices separated by commas"
                      value={currentRecipe.spices.join(", ")}
                      onChange={(e) =>
                        onUpdate({
                          ...currentRecipe,
                          spices: e.target.value
                            .split(",")
                            .map((s) => s.trim())
                            .filter((s) => s),
                        })
                      }
                      className="min-h-20"
                    />
                  </div>
                </div>

                <div className="lg:col-span-2 space-y-4 min-w-0">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">Ingredients</label>
                      <Button size="sm" onClick={handleAddIngredient}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Ingredient
                      </Button>
                    </div>
                    <div className="space-y-2 max-h-80 overflow-y-auto border rounded-md p-4 w-full">
                      {currentRecipe.ingredients.map((ingredient, index) => (
                        <div
                          key={index}
                          className="flex gap-2 items-center bg-muted/20 p-3 rounded w-full min-w-0"
                        >
                          <Input
                            className="flex-1 min-w-0"
                            placeholder="Ingredient name"
                            value={ingredient.name}
                            onChange={(e) =>
                              handleUpdateIngredient(
                                index,
                                "name",
                                e.target.value
                              )
                            }
                          />
                          <Input
                            className="w-20 min-w-0"
                            type="number"
                            placeholder="Amount"
                            value={ingredient.amount}
                            onChange={(e) =>
                              handleUpdateIngredient(
                                index,
                                "amount",
                                parseFloat(e.target.value) || 0
                              )
                            }
                          />
                          <Input
                            className="w-20 min-w-0"
                            placeholder="Unit"
                            value={ingredient.unit}
                            onChange={(e) =>
                              handleUpdateIngredient(
                                index,
                                "unit",
                                e.target.value
                              )
                            }
                          />
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteIngredient(index)}
                            className="h-9 w-9 p-0 flex-shrink-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                      {currentRecipe.ingredients.length === 0 && (
                        <div className="text-center text-muted-foreground py-8">
                          No ingredients added yet
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4 min-w-0">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Instructions</label>
                  <Textarea
                    className="min-h-40"
                    value={currentRecipe.instructions}
                    onChange={(e) =>
                      onUpdate({
                        ...currentRecipe,
                        instructions: e.target.value,
                      })
                    }
                    placeholder="Step-by-step cooking instructions"
                  />
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
      ? createNewRecipeForAllLanguages()
      : getRecipeForAllLanguages(editingIndex);

    return (
      <MultiLanguageEditModal<Recipe>
        isOpen={editingIndex !== null}
        onClose={handleCancel}
        onSave={handleMultiLanguageSave}
        title={isCreating ? "Add New Recipe" : "Edit Recipe"}
        description="Modify recipe details, ingredients, and cooking instructions"
        size="full"
        initialData={initialData}
        initialLanguage={language as Language}
        isCreating={isCreating}
        validateData={(recipe) => recipe.title.trim().length > 0}
      >
        {renderRecipeForm}
      </MultiLanguageEditModal>
    );
  };

  // Render only buttons for synchronized mode
  if (showOnlyButtons) {
    return (
      <>
        {renderEditModal()}
        <DeletionConfirmModal
          isOpen={deletingRecipe !== null}
          onClose={handleCancelDelete}
          onConfirm={handleConfirmDelete}
          itemName={deletingRecipe?.title || ""}
          itemType="Recipe"
        />
        <div className="flex items-center justify-between min-h-10">
          {!isComparison ? (
            <Button onClick={handleAddRecipe}>
              <Plus className="w-4 h-4 mr-2" />
              Add Recipe
            </Button>
          ) : (
            <div></div>
          )}
        </div>
      </>
    );
  }

  // Show empty state
  if (showEmptyState) {
    return (
      <>
        {renderEditModal()}
        <DeletionConfirmModal
          isOpen={deletingRecipe !== null}
          onClose={handleCancelDelete}
          onConfirm={handleConfirmDelete}
          itemName={deletingRecipe?.title || ""}
          itemType="Recipe"
        />
        <Card className="text-center p-8">
          <CardContent>
            <p className="text-muted-foreground mb-4">No recipes found</p>
            {!isComparison && (
              <Button onClick={handleAddRecipe}>
                <Plus className="w-4 h-4 mr-2" />
                Add Recipe
              </Button>
            )}
          </CardContent>
        </Card>
      </>
    );
  }

  // Render only a specific card for synchronized mode
  if (showOnlyCard && cardIndex !== undefined) {
    const recipe = data[cardIndex];
    if (!recipe) return null;

    const isCollapsed =
      collapsedItems.has(recipe.id) || collapsedItems.has("*");

    return (
      <>
        {renderEditModal()}
        <DeletionConfirmModal
          isOpen={deletingRecipe !== null}
          onClose={handleCancelDelete}
          onConfirm={handleConfirmDelete}
          itemName={deletingRecipe?.title || ""}
          itemType="Recipe"
        />
        <Card
          className={`h-full flex flex-col ${
            hasIncompleteTranslations(recipe.id)
              ? "bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800"
              : ""
          }`}
        >
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between min-w-0">
              <div
                className="flex-1 min-w-0 cursor-pointer mr-3"
                onClick={() => handleToggleCollapse(recipe.id)}
              >
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleCollapse(recipe.id);
                    }}
                    className="p-1 h-6 w-6 flex-shrink-0"
                  >
                    {isCollapsed ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronUp className="w-4 h-4" />
                    )}
                  </Button>
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-lg truncate">
                      {recipe.title}
                    </CardTitle>
                    <CardDescription className="truncate">
                      {recipe.type} • {recipe.ingredients.length} ingredients
                    </CardDescription>
                  </div>
                </div>
              </div>
              <div
                className="flex gap-2 flex-shrink-0"
                style={{ minWidth: "80px" }}
              >
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(cardIndex)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDeleteRecipe(cardIndex)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          {!isCollapsed && (
            <CardContent className="flex-1 pt-0">
              <p className="text-sm mb-3">{recipe.description}</p>

              <div className="space-y-2">
                <h4 className="font-medium text-sm">Ingredients:</h4>
                <div className="text-sm space-y-1">
                  {recipe.ingredients.map((ingredient) => (
                    <div key={ingredient.id} className="flex justify-between">
                      <span>{ingredient.name}</span>
                      <span className="text-muted-foreground">
                        {ingredient.amount} {ingredient.unit}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {recipe.spices.length > 0 && (
                <div className="mt-3 pt-3 border-t">
                  <h4 className="font-medium text-sm mb-2">Spices:</h4>
                  <p className="text-sm text-muted-foreground">
                    {recipe.spices.join(", ")}
                  </p>
                </div>
              )}

              {recipe.instructions && (
                <div className="mt-3 pt-3 border-t">
                  <h4 className="font-medium text-sm mb-2">Instructions:</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap line-clamp-3">
                    {recipe.instructions}
                  </p>
                </div>
              )}
            </CardContent>
          )}
        </Card>
      </>
    );
  }

  // Default rendering for non-synchronized mode
  return (
    <>
      {renderEditModal()}
      <DeletionConfirmModal
        isOpen={deletingRecipe !== null}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        itemName={deletingRecipe?.title || ""}
        itemType="Recipe"
      />

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Recipes</h2>
          <Button onClick={handleAddRecipe}>
            <Plus className="w-4 h-4 mr-2" />
            Add Recipe
          </Button>
        </div>

        {data.length === 0 ? (
          <Card className="text-center p-8">
            <CardContent>
              <p className="text-muted-foreground mb-4">No recipes found</p>
              <Button onClick={handleAddRecipe}>
                <Plus className="w-4 h-4 mr-2" />
                Add Recipe
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {data.map((recipe, index) => {
              const isCollapsed =
                collapsedItems.has(recipe.id) || collapsedItems.has("*");
              return (
                <Card
                  key={recipe.id}
                  className={
                    hasIncompleteTranslations(recipe.id)
                      ? "bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800"
                      : ""
                  }
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between min-w-0">
                      <div
                        className="flex-1 min-w-0 cursor-pointer mr-3"
                        onClick={() => handleToggleCollapse(recipe.id)}
                      >
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleCollapse(recipe.id);
                            }}
                            className="p-1 h-6 w-6 flex-shrink-0"
                          >
                            {isCollapsed ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronUp className="w-4 h-4" />
                            )}
                          </Button>
                          <div className="min-w-0 flex-1">
                            <CardTitle className="text-lg truncate">
                              {recipe.title}
                            </CardTitle>
                            <CardDescription className="truncate">
                              {recipe.type} • {recipe.ingredients.length}{" "}
                              ingredients
                            </CardDescription>
                          </div>
                        </div>
                      </div>
                      <div
                        className="flex gap-2 flex-shrink-0"
                        style={{ minWidth: "80px" }}
                      >
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(index)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteRecipe(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  {!isCollapsed && (
                    <CardContent className="pt-0">
                      <p className="text-sm mb-3">{recipe.description}</p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium text-sm mb-2">
                            Ingredients:
                          </h4>
                          <div className="text-sm space-y-1">
                            {recipe.ingredients.map((ingredient) => (
                              <div
                                key={ingredient.id}
                                className="flex justify-between"
                              >
                                <span>{ingredient.name}</span>
                                <span className="text-muted-foreground">
                                  {ingredient.amount} {ingredient.unit}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {recipe.spices.length > 0 && (
                          <div>
                            <h4 className="font-medium text-sm mb-2">
                              Spices:
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {recipe.spices.join(", ")}
                            </p>
                          </div>
                        )}
                      </div>

                      {recipe.instructions && (
                        <div className="mt-4 pt-4 border-t">
                          <h4 className="font-medium text-sm mb-2">
                            Instructions:
                          </h4>
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                            {recipe.instructions}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
