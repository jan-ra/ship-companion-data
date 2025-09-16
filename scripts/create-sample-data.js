const fs = require('fs');
const path = require('path');

const languages = ['en', 'de', 'nl'];
const dataTypes = ['recipes', 'checklists', 'cities', 'points', 'links', 'about', 'questions', 'cabins'];

async function createUnifiedData(sourceFolder = 'avondrood', outputName = 'sample') {
  const unifiedData = {};

  // Initialize structure
  for (const dataType of dataTypes) {
    unifiedData[dataType] = {};
  }

  // Load data for each language and data type
  for (const lang of languages) {
    for (const dataType of dataTypes) {
      const filePath = path.join(__dirname, '..', sourceFolder, 'data', lang, `${dataType}.json`);
      
      try {
        if (fs.existsSync(filePath)) {
          const fileContent = fs.readFileSync(filePath, 'utf8');
          unifiedData[dataType][lang] = JSON.parse(fileContent);
          console.log(`Loaded ${dataType} for ${lang}`);
        } else {
          console.log(`File not found: ${filePath}`);
          unifiedData[dataType][lang] = Array.isArray(getSampleData(dataType)) ? [] : {};
        }
      } catch (error) {
        console.error(`Error loading ${dataType} for ${lang}:`, error.message);
        unifiedData[dataType][lang] = Array.isArray(getSampleData(dataType)) ? [] : {};
      }
    }
  }

  // Create export with metadata
  const exportData = {
    exportDate: new Date().toISOString(),
    version: '1.0.0',
    description: `Ship Companion Data - Unified Format (${outputName})`,
    data: unifiedData
  };

  // Write to file
  const outputPath = path.join(__dirname, '..', `${outputName}-unified-data.json`);
  fs.writeFileSync(outputPath, JSON.stringify(exportData, null, 2));
  console.log(`${outputName} unified data created at: ${outputPath}`);

  // Also create raw data file
  const rawOutputPath = path.join(__dirname, '..', `${outputName}-raw-data.json`);
  fs.writeFileSync(rawOutputPath, JSON.stringify(unifiedData, null, 2));
  console.log(`${outputName} raw data created at: ${rawOutputPath}`);

  return unifiedData;
}

function getSampleData(dataType) {
  switch (dataType) {
    case 'recipes':
    case 'checklists':
    case 'cities':
    case 'points':
    case 'questions':
    case 'cabins':
      return [];
    case 'links':
    case 'about':
      return {};
    default:
      return [];
  }
}

// Run the script
if (require.main === module) {
  const sourceFolder = process.argv[2] || 'avondrood';
  const outputName = process.argv[3] || 'sample';

  createUnifiedData(sourceFolder, outputName)
    .then(() => console.log('Done!'))
    .catch(console.error);
}

module.exports = { createUnifiedData };