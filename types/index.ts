// Language types
export type Language = 'en' | 'de' | 'nl';

// Recipe types
export interface Ingredient {
  id: string;
  name: string;
  amount: number;
  unit: string;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  type: string;
  ingredients: Ingredient[];
  spices: string[];
  instructions: string;
}

// Checklist types
export interface ChecklistTask {
  id: string;
  title: string;
  description: string;
}

export interface Checklist {
  id: string;
  title: string;
  description: string;
  icon: string;
  tasks: ChecklistTask[];
}

// City types
export interface City {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  description: string;
  zoomLevel: number;
  isIsland: string;
}

// Point types
export interface Point {
  id: number;
  latitude: number;
  longitude: number;
  type: string;
  name: string;
  description: string;
  cityId: number;
}

// Links types
export interface Links {
  phone: string;
  mail: string;
  instagram: string;
  facebook: string;
  youtube: string;
  historyLink: string;
  factLink: string;
  bookingLink: string;
  companyName: string;
  skipperName: string;
  claim: string;
  links: {
    history: string;
    shipfacts: string;
    booking: string;
    privacy: string;
    materials: string;
  };
}

// About types
export interface Fact {
  key: string;
  value: string;
}

export interface About {
  facts: Fact[];
  history: string;
  captainImage: string;
  vita: string;
}

// Question types (based on actual data structure)
export interface Question {
  questiontext: string;
  answertext: string;
}

// Cabin types (based on actual data structure)
export interface Cabin {
  cabinNr: number;
  posTop: number;
  posLeft: number;
  beds: number;
  comment: string;
}

// Unified data structure
export interface UnifiedData {
  recipes: Record<Language, Recipe[]>;
  checklists: Record<Language, Checklist[]>;
  cities: Record<Language, City[]>;
  points: Record<Language, Point[]>;
  links: Record<Language, Links>;
  about: Record<Language, About>;
  questions: Record<Language, Question[]>;
  cabins: Record<Language, Cabin[]>;
}

// Data structure keys
export const DATA_TYPES = [
  'recipes',
  'checklists', 
  'cities',
  'points',
  'questions',
  'cabins',
  'links',
  'about'
] as const;

export type DataType = typeof DATA_TYPES[number];