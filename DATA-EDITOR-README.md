# Ship Companion Data Editor

A powerful React-based data editor for managing ship companion data with multi-language support, built with Next.js and shadcn/ui.

## Features

✅ **Multi-Language Support**: Edit data in English (en), German (de), and Dutch (nl)  
✅ **Side-by-Side Comparison**: Compare and edit different language versions simultaneously  
✅ **Multiple Data Types**: Support for recipes, checklists, cities, points, links, about, questions, and cabins  
✅ **JSON Import/Export**: Load unified JSON files and export modified data  
✅ **Modal-based Editing**: All edit/create views open in spacious modals for better UX  
✅ **Rich Form Editors**: Advanced form interfaces for recipes and checklists  
✅ **Responsive Design**: Works on desktop, tablet, and mobile devices  
✅ **Real-time Editing**: Changes are immediately reflected in the interface  
✅ **Form Validation**: JSON validation ensures data integrity  

## Getting Started

### 1. Installation

```bash
npm install
```

### 2. Start the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000` (or the next available port).

### 3. Load Data

You have two options to load data:

#### Option A: Load from Existing Files
Click "Load Existing Data" to load data from the `avondrood/data/` folder structure.

#### Option B: Upload Unified JSON
1. Generate a unified JSON file: `node scripts/create-sample-data.js`
2. Upload `sample-unified-data.json` or `sample-raw-data.json` using the "Upload JSON File" button

## Data Structure

The application works with a unified JSON format:

```json
{
  "recipes": {
    "en": [...],
    "de": [...],
    "nl": [...]
  },
  "checklists": {
    "en": [...],
    "de": [...],
    "nl": [...]
  },
  "cities": {
    "en": [...],
    "de": [...],
    "nl": [...]
  },
  // ... other data types
}
```

## Supported Data Types

1. **Recipes** - Recipe objects with ingredients, instructions, and dietary information
2. **Checklists** - Task lists with individual tasks and descriptions
3. **Cities** - Geographic locations with coordinates and descriptions
4. **Points** - Points of interest linked to cities (attractions, ports, shops)
5. **Links** - Contact information and external links
6. **About** - Ship facts, history, and captain information
7. **Questions** - FAQ and question content
8. **Cabins** - Cabin information and details

## How to Use

### 1. Load Your Data
- Use "Load Existing Data" for project files
- Or upload a unified JSON file

### 2. Select Data Type
- Click on the tabs to switch between different data types
- Each tab shows the available data for editing

### 3. Choose Language Settings
- Select primary language from the dropdown
- Enable "Side-by-side View" to compare languages
- Choose comparison language when side-by-side is active

### 4. Edit Your Data

#### For Recipes and Checklists:
- Rich form interface with add/edit/delete functionality
- Recipe editor includes ingredient management
- Checklist editor supports task management

#### For Other Data Types:
- JSON editor for direct data manipulation
- Real-time validation
- Add/remove items for array-based data

### 5. Export Your Changes
- **Export with Metadata**: Includes export date and version info
- **Export Raw Data**: Just the data structure for reimporting

## File Structure

```
ship-companion-data/
├── app/                      # Next.js app directory
├── components/               # React components
│   ├── editors/             # Data type specific editors
│   ├── ui/                  # shadcn/ui components
│   └── ...                  # Other components
├── contexts/                # React contexts
├── lib/                     # Utility functions
├── types/                   # TypeScript type definitions
├── avondrood/               # Original data structure
│   └── data/
│       ├── en/              # English data files
│       ├── de/              # German data files
│       └── nl/              # Dutch data files
└── scripts/                 # Utility scripts
```

## API Reference

### Data Types

```typescript
type Language = 'en' | 'de' | 'nl';
type DataType = 'recipes' | 'checklists' | 'cities' | 'points' | 'links' | 'about' | 'questions' | 'cabins';

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

## Advanced Usage

### Creating Custom Editors

To create a custom editor for a new data type:

1. Create a new editor component in `components/editors/`
2. Add the data type to `types/index.ts`
3. Update `DATA_TYPES` constant
4. Add the editor to `DataEditor.tsx`

### Extending Language Support

To add a new language:

1. Add the language code to the `Language` type
2. Update the `LANGUAGE_LABELS` object
3. Add data files in `avondrood/data/{language}/`

## Troubleshooting

### Common Issues

1. **"No data loaded"** - Make sure to load data using one of the available methods
2. **JSON validation errors** - Check that your JSON syntax is correct
3. **File not found** - Ensure data files exist in the expected locations

### Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Generate sample data
node scripts/create-sample-data.js
```

## Technologies Used

- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI component library
- **Lucide React** - Icons

---

**Note**: This application is designed specifically for editing ship companion data with multi-language support. The interface adapts to the data structure automatically and provides appropriate editing tools for each data type.