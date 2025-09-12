# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 15 application built with TypeScript and Tailwind CSS that serves as a data editor for ship companion data. It supports multi-language editing (English, German, Dutch) with side-by-side comparison, JSON import/export functionality, and specialized editors for different data types including recipes, checklists, cities, points of interest, links, ship information, FAQs, and cabin details.

## Development Commands

- `npm run dev` - Start development server with Turbopack (default port 3000)
- `npm run build` - Build production bundle with Turbopack
- `npm start` - Start production server
- `npm run lint` - Run ESLint for code quality checks
- `node scripts/create-sample-data.js` - Generate sample data files

## Architecture & Structure

### Core Architecture
- **Next.js App Router**: Uses the modern app directory structure
- **Context-based State Management**: 
  - `DataContext` (contexts/DataContext.tsx) manages all application data and operations
  - `ThemeContext` (contexts/ThemeContext.tsx) handles dark/light theme switching
- **Component Architecture**: Modular components with specialized editors in `components/editors/`
- **TypeScript Integration**: Comprehensive type definitions in `types/index.ts`

### Key Directories
- `app/` - Next.js app router pages (layout.tsx, page.tsx, globals.css)
- `components/` - React components including UI components and specialized editors
- `contexts/` - React context providers for global state management
- `lib/` - Utility functions including data loading and transformation
- `types/` - TypeScript type definitions for all data structures
- `avondrood/` - Original data files organized by language (en/de/nl)
- `public/` - Static assets
- `scripts/` - Utility scripts for data generation

### Data Structure
The application works with a unified JSON format where each data type contains language-specific versions:
```typescript
interface UnifiedData {
  recipes: Record<Language, Recipe[]>;
  checklists: Record<Language, Checklist[]>;
  cities: Record<Language, City[]>;
  points: Record<Language, Point[]>;
  links: Record<Language, Links>;
  about: Record<Language, About>;
  questions: Record<Language, Question[]>;
  cabins: Record<Language, Cabin[]>;
}
```

### Component Patterns
- **Modal-based Editing**: All data editing happens in modals for better UX
- **Language Support**: Components handle multi-language data with side-by-side comparison
- **Specialized Editors**: Custom form interfaces for recipes and checklists in `components/editors/`
- **shadcn/ui Integration**: Uses shadcn/ui components for consistent styling

### State Management Patterns
- **DataContext**: Central hub for all data operations including CRUD operations, language switching, and side-by-side mode
- **Custom Hooks**: `useData()` hook provides access to data context
- **Cross-language Operations**: Built-in functions for creating, updating, and deleting data across all language versions

### Key Technologies
- **Next.js 15** with App Router and Turbopack
- **TypeScript** for type safety
- **Tailwind CSS 4** for styling
- **shadcn/ui** component library
- **Radix UI** primitives for accessible components
- **Lucide React** for icons
- **React Context** for state management

## Working with Data Types

When adding new data types:
1. Define types in `types/index.ts`
2. Add to `DATA_TYPES` constant
3. Create specialized editor in `components/editors/` if needed
4. Update `DataContext` operations
5. Update data loading functions in `lib/data-loader.ts`

## Testing

The project currently does not have a formal testing setup. When implementing tests, consider the data editing workflows, multi-language functionality, and modal interactions.