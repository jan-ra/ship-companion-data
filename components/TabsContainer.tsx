'use client';

import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ChefHat, 
  CheckSquare, 
  MapPin, 
  Navigation, 
  Link, 
  Info, 
  HelpCircle, 
  Bed,
  AlertTriangle 
} from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { DataType, DATA_TYPES } from '@/types';
import { DataEditor } from './DataEditor';
import { HelpModal } from './HelpModal';

const DATA_TYPE_CONFIG = {
  recipes: { 
    icon: ChefHat, 
    label: 'Recipes', 
    description: 'Food recipes and cooking instructions',
    helpContent: {
      description: 'Manage recipes with ingredients, instructions, and cooking details.',
      sections: [
        {
          title: 'Adding Recipes',
          content: 'Click "Add Recipe" to create new cooking instructions. Fill in the title, description, ingredients, and step-by-step instructions.'
        },
        {
          title: 'Managing Ingredients',
          content: 'Each recipe can have multiple ingredients with amounts and units. Spices can be listed separately for better organization.'
        }
      ]
    }
  },
  checklists: { 
    icon: CheckSquare, 
    label: 'Checklists', 
    description: 'Task lists and todo items',
    helpContent: {
      description: 'Create and manage task lists and procedures.',
      sections: [
        {
          title: 'Creating Checklists',
          content: 'Add new checklists for different procedures or activities. Each checklist can contain multiple tasks.'
        },
        {
          title: 'Managing Tasks',
          content: 'Tasks within checklists help organize step-by-step procedures and ensure nothing is missed.'
        }
      ]
    }
  },
  cities: { 
    icon: MapPin, 
    label: 'Cities', 
    description: 'Geographic locations and destinations',
    helpContent: {
      description: 'Manage cities and destinations with location data.',
      sections: [
        {
          title: 'Adding Cities',
          content: 'Create entries for different destinations. Include names, descriptions, and location details.'
        },
        {
          title: 'Location Data',
          content: 'Cities can include coordinates, zoom levels, and whether they are islands. This data is used for mapping and navigation.'
        }
      ]
    }
  },
  points: { 
    icon: Navigation, 
    label: 'Points of Interest', 
    description: 'Attractions, ports, and notable locations',
    helpContent: {
      description: 'Manage specific locations and attractions within cities.',
      sections: [
        {
          title: 'Adding Points',
          content: 'Create points of interest like restaurants, ports, attractions, or shops. Each point is associated with a city.'
        },
        {
          title: 'Location Types',
          content: 'Points can be categorized by type: attractions, restaurants, ports, hotels, beaches, museums, and more.'
        }
      ]
    }
  },
  links: { 
    icon: Link, 
    label: 'Links', 
    description: 'Contact information and external links',
    helpContent: {
      description: 'Manage contact information and external website links.',
      sections: [
        {
          title: 'Contact Details',
          content: 'Store phone numbers, email addresses, and social media links for easy access.'
        },
        {
          title: 'External Links',
          content: 'Maintain links to external websites, booking systems, and other relevant resources.'
        }
      ]
    }
  },
  about: { 
    icon: Info, 
    label: 'About', 
    description: 'Ship information and company details',
    helpContent: {
      description: 'Manage general information about the ship and company.',
      sections: [
        {
          title: 'Ship Facts',
          content: 'Maintain key facts and statistics about the vessel, including specifications and history.'
        },
        {
          title: 'Company Information',
          content: 'Store details about the operating company, captain information, and business details.'
        }
      ]
    }
  },
  questions: { 
    icon: HelpCircle, 
    label: 'Questions', 
    description: 'FAQ and question content',
    helpContent: {
      description: 'Manage frequently asked questions and their answers.',
      sections: [
        {
          title: 'Adding Questions',
          content: 'Create question and answer pairs to help guests find information quickly.'
        },
        {
          title: 'Organizing Content',
          content: 'Questions can cover topics like amenities, policies, procedures, and general information about the experience.'
        }
      ]
    }
  },
  cabins: { 
    icon: Bed, 
    label: 'Cabins', 
    description: 'Cabin information and details',
    helpContent: {
      description: 'Manage cabin information including capacity and layout details.',
      sections: [
        {
          title: 'Adding Cabins',
          content: 'Create entries for each cabin with number, bed count, and additional details.'
        },
        {
          title: 'Layout Information',
          content: 'Cabins can include position coordinates for deck plans and layout visualization (requires developer mode).'
        }
      ]
    }
  },
};

export function TabsContainer() {
  const { selectedDataType, setSelectedDataType, data, validateTranslations } = useData();
  const [helpModalOpen, setHelpModalOpen] = useState(false);
  const [currentHelpContent, setCurrentHelpContent] = useState<{
    title: string;
    content: { description: string; sections: Array<{ title: string; content: string }> };
  } | null>(null);

  // Get validation results for all data types
  const getValidationForDataType = (dataType: DataType) => {
    return validateTranslations(dataType);
  };

  const openHelp = (dataType: DataType) => {
    const config = DATA_TYPE_CONFIG[dataType];
    setCurrentHelpContent({
      title: `${config.label} Help`,
      content: config.helpContent
    });
    setHelpModalOpen(true);
  };

  if (!data) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>No Data Loaded</CardTitle>
          <CardDescription>
            Please load data first to start editing
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="w-full">
      <Tabs value={selectedDataType} onValueChange={(value) => setSelectedDataType(value as DataType)}>
        <div className="w-full overflow-x-auto">
          <TabsList className="inline-flex h-12 w-full min-w-max items-center justify-start rounded-md bg-muted p-1 text-muted-foreground">
            {DATA_TYPES.map((dataType) => {
              const config = DATA_TYPE_CONFIG[dataType];
              const validation = getValidationForDataType(dataType);
              const Icon = validation.hasIncompleteTranslations ? AlertTriangle : config.icon;
              const iconColor = validation.hasIncompleteTranslations ? "text-yellow-600" : "";
              
              return (
                <TabsTrigger 
                  key={dataType} 
                  value={dataType}
                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm px-3 py-2 text-xs font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm lg:text-sm flex-shrink-0 min-w-fit"
                >
                  <Icon className={`w-4 h-4 flex-shrink-0 ${iconColor}`} />
                  <span className="hidden sm:inline truncate">{config.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </div>

        {DATA_TYPES.map((dataType) => {
          const config = DATA_TYPE_CONFIG[dataType];
          const validation = getValidationForDataType(dataType);
          
          return (
            <TabsContent key={dataType} value={dataType} className="mt-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        <config.icon className="w-5 h-5" />
                        {config.label}
                      </CardTitle>
                      <CardDescription>
                        {config.description}
                      </CardDescription>
                      {validation.hasIncompleteTranslations && (
                        <div className="flex items-center gap-2 mt-2 p-2 bg-yellow-50 dark:bg-yellow-950/20 rounded-md border border-yellow-200 dark:border-yellow-800">
                          <AlertTriangle className="w-4 h-4 text-yellow-600" />
                          <span className="text-sm text-yellow-800 dark:text-yellow-200">
                            {validation.incompleteItems.length} item{validation.incompleteItems.length === 1 ? '' : 's'} with missing translations
                          </span>
                        </div>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openHelp(dataType)}
                      className="flex-shrink-0"
                    >
                      <HelpCircle className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <DataEditor 
                    dataType={dataType} 
                    validationResults={validation}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          );
        })}
      </Tabs>
      
      {currentHelpContent && (
        <HelpModal
          isOpen={helpModalOpen}
          onClose={() => setHelpModalOpen(false)}
          title={currentHelpContent.title}
          content={currentHelpContent.content}
        />
      )}
    </div>
  );
}