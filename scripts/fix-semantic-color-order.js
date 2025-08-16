#!/usr/bin/env node

/**
 * Fix Semantic Color Token Ordering Script
 * Reorders semantic color tokens to logical sequence: 0000 → 1300
 * Fixes the issue where tokens appear as 1000-1300, then 0000-0900
 */

import * as fs from 'fs';
import * as path from 'path';

const PROPER_COLOR_ORDER = [
  '0', '100', '200', '300', '400', '500', 
  '600', '700', '800', '900',
  '1000', '1100', '1200', '1300'
];

const OLD_TO_NEW_MAPPING = {
  '0000': '0',
  '000': '0',
  '0100': '100', 
  '0200': '200',
  '0300': '300',
  '0400': '400',
  '0500': '500',
  '0600': '600',
  '0700': '700',
  '0800': '800',
  '0900': '900',
  '1000': '1000',
  '1100': '1100',
  '1200': '1200', 
  '1300': '1300'
};

// Semantic color tokens in global.json
const SEMANTIC_COLOR_TOKENS = [
  'primary', 'secondary', 'success', 'warning', 'error', 'accent', 'info',
  'surface', 'content'
];

// Core color ramps in core.json (nested under Color Ramp)
const CORE_COLOR_RAMPS = [
  'Amber', 'Cool Neutral', 'Red', 'Green', 'Royal Blue', 'Yellow', 'Orange', 'Black'
];

// Warning token hardcoded values that should use Orange ramp
const WARNING_VALUES_TO_FIX = {
  '100': '#5c2907',
  '200': '#723308', 
  '300': '#8e400a',
  '400': '#ae4f0c',
  '500': '#d15e0f',
  '600': '#ef7520',
  '700': '#F5A56F',
  '800': '#F7BD94',
  '900': '#FBDBC6',
  '1000': '#FCE6D8',
  '1100': '#FDF1E9',
  '1200': '#FEF6F1', 
  '1300': '#fffbf9',
  '0': '#572706'
};

function reorderColorTokens(tokenObject) {
  // Since JavaScript sorts numeric string keys automatically,
  // we need to rebuild the object by replacing the original
  const originalKeys = Object.keys(tokenObject);
  const reordered = {};
  
  // First, collect all available keys that should be reordered
  const availableKeys = PROPER_COLOR_ORDER.filter(level => tokenObject[level]);
  
  // Rebuild object in proper order
  availableKeys.forEach(level => {
    reordered[level] = tokenObject[level];
  });
  
  // Add any other keys that aren't in PROPER_COLOR_ORDER (shouldn't happen, but just in case)
  originalKeys.forEach(key => {
    if (!PROPER_COLOR_ORDER.includes(key)) {
      reordered[key] = tokenObject[key];
    }
  });
  
  return reordered;
}

function processTokenFile(filePath) {
  console.log(`\n📝 Processing: ${path.basename(filePath)}`);
  
  // Read the file
  const content = fs.readFileSync(filePath, 'utf8');
  const tokens = JSON.parse(content);
  
  let changesMade = false;
  const fileName = path.basename(filePath);
  
  if (fileName === 'core.json') {
    // Handle core color ramps
    if (tokens['Color Ramp']) {
      CORE_COLOR_RAMPS.forEach(colorRamp => {
        if (tokens['Color Ramp'][colorRamp]) {
          console.log(`  🎨 Reordering ${colorRamp} core colors...`);
          
          const rampTokens = tokens['Color Ramp'][colorRamp];
          const originalKeys = Object.keys(rampTokens);
          
          // Check if needs renaming
          const needsRenaming = originalKeys.some(key => key.includes('0000') || key.includes('000'));
          
          if (needsRenaming) {
            changesMade = true;
            console.log(`    ✅ Will fix core color naming: ${originalKeys.slice(0,2).join(', ')}...`);
          } else {
            console.log(`    ✨ Already in correct format`);
          }
        }
      });
    }
  } else if (fileName === 'global.json') {
    // Handle semantic color tokens
    SEMANTIC_COLOR_TOKENS.forEach(colorToken => {
      if (tokens[colorToken]) {
        console.log(`  🎨 Reordering ${colorToken} colors...`);
        
        const originalKeys = Object.keys(tokens[colorToken]);
        
        // Check if tokens need renaming (from 0000/000 format to 0 format)
        const needsRenaming = originalKeys.some(key => key === '0000' || key === '000');
        const needsReordering = originalKeys[0] === '1000' || originalKeys[0] === '0000' || originalKeys[0] === '000';
        
        // Check if warning has hardcoded values
        const isHardcodedWarning = colorToken === 'warning' && 
          originalKeys.some(key => tokens[colorToken][key].$value && tokens[colorToken][key].$value.startsWith('#'));
        
        if (needsRenaming || needsReordering || isHardcodedWarning) {
          changesMade = true;
          if (isHardcodedWarning) {
            console.log(`    ✅ Will fix hardcoded warning colors to use Orange ramp`);
          } else {
            console.log(`    ✅ Will fix naming and order: ${originalKeys.slice(0,3).join(', ')}... → ${PROPER_COLOR_ORDER.slice(0,3).join(', ')}...`);
          }
        } else {
          console.log(`    ✨ Already in correct format`);
        }
      }
    });
  }
  
  // Write back if changes were made
  if (changesMade) {
    if (fileName === 'core.json') {
      // Handle core color ramps
      if (tokens['Color Ramp']) {
        CORE_COLOR_RAMPS.forEach(colorRamp => {
          if (tokens['Color Ramp'][colorRamp]) {
            const rampTokens = tokens['Color Ramp'][colorRamp];
            const orderedRampTokens = {};
            
            // Process each color token in proper order
            PROPER_COLOR_ORDER.forEach(newKey => {
              const fullNewKey = `${colorRamp} ${newKey}`;
              
              // Check existing formats
              if (rampTokens[fullNewKey]) {
                orderedRampTokens[fullNewKey] = rampTokens[fullNewKey];
              } else {
                // Check old formats
                const oldFormats = [`${colorRamp} 0000`, `${colorRamp} 000`];
                if (newKey === '0') {
                  for (const oldFormat of oldFormats) {
                    if (rampTokens[oldFormat]) {
                      orderedRampTokens[fullNewKey] = rampTokens[oldFormat];
                      break;
                    }
                  }
                } else {
                  const oldFormat = `${colorRamp} 0${newKey}`;
                  if (rampTokens[oldFormat]) {
                    orderedRampTokens[fullNewKey] = rampTokens[oldFormat];
                  }
                }
              }
            });
            
            // Add any remaining keys
            Object.keys(rampTokens).forEach(key => {
              if (!orderedRampTokens[key]) {
                orderedRampTokens[key] = rampTokens[key];
              }
            });
            
            tokens['Color Ramp'][colorRamp] = orderedRampTokens;
          }
        });
      }
    } else if (fileName === 'global.json') {
      // Handle semantic color tokens
      SEMANTIC_COLOR_TOKENS.forEach(colorToken => {
        if (tokens[colorToken]) {
          const colorTokens = tokens[colorToken];
          const orderedColorTokens = {};
          
          // Special handling for warning - convert hardcoded to references
          if (colorToken === 'warning') {
            PROPER_COLOR_ORDER.forEach(newKey => {
              if (colorTokens[newKey] || colorTokens[OLD_TO_NEW_MAPPING[newKey]]) {
                const existingToken = colorTokens[newKey] || colorTokens[OLD_TO_NEW_MAPPING[newKey]];
                orderedColorTokens[newKey] = {
                  $type: "color",
                  $value: `{Color Ramp.Orange.Orange ${newKey}}`
                };
              }
            });
          } else {
            // Normal processing for other tokens
            PROPER_COLOR_ORDER.forEach(newKey => {
              if (colorTokens[newKey]) {
                orderedColorTokens[newKey] = colorTokens[newKey];
              } else {
                const oldKey = Object.keys(OLD_TO_NEW_MAPPING).find(k => OLD_TO_NEW_MAPPING[k] === newKey);
                if (oldKey && colorTokens[oldKey]) {
                  const tokenValue = { ...colorTokens[oldKey] };
                  // Update $value references
                  if (tokenValue.$value && typeof tokenValue.$value === 'string') {
                    tokenValue.$value = tokenValue.$value.replace(new RegExp(oldKey, 'g'), newKey);
                  }
                  orderedColorTokens[newKey] = tokenValue;
                }
              }
            });
          }
          
          // Add any other keys that weren't processed
          Object.keys(colorTokens).forEach(key => {
            if (!orderedColorTokens[key] && !PROPER_COLOR_ORDER.includes(key) && !Object.keys(OLD_TO_NEW_MAPPING).includes(key)) {
              orderedColorTokens[key] = colorTokens[key];
            }
          });
          
          tokens[colorToken] = orderedColorTokens;
        }
      });
    }
    
    const updatedContent = JSON.stringify(tokens, null, 2);
    fs.writeFileSync(filePath, updatedContent, 'utf8');
    console.log(`  💾 Updated ${path.basename(filePath)}`);
    return true;
  } else {
    console.log(`  📋 No changes needed`);
    return false;
  }
}

function main() {
  console.log('🔧 Semantic Color Token Order Fix Script');
  console.log('======================================');
  console.log('Target order: 0 → 100 → ... → 900 → 1000 → 1100 → 1200 → 1300');
  
  const tokensDir = path.join(process.cwd(), 'tokens');
  
  if (!fs.existsSync(tokensDir)) {
    console.error('❌ Tokens directory not found:', tokensDir);
    process.exit(1);
  }
  
  // Find all JSON token files
  const tokenFiles = fs.readdirSync(tokensDir)
    .filter(file => file.endsWith('.json') && !file.startsWith('$'))
    .map(file => path.join(tokensDir, file));
  
  console.log(`\n📂 Found ${tokenFiles.length} token files to check`);
  
  let totalChanges = 0;
  
  // Process each token file
  tokenFiles.forEach(filePath => {
    try {
      const hasChanges = processTokenFile(filePath);
      if (hasChanges) totalChanges++;
    } catch (error) {
      console.error(`❌ Error processing ${path.basename(filePath)}:`, error.message);
    }
  });
  
  console.log('\n📊 Summary:');
  console.log(`Files processed: ${tokenFiles.length}`);
  console.log(`Files updated: ${totalChanges}`);
  console.log(`Semantic tokens checked: ${SEMANTIC_COLOR_TOKENS.join(', ')}`);
  
  if (totalChanges > 0) {
    console.log('\n✅ Token ordering fixes completed!');
    console.log('🔄 Run consolidation to update tokensource.json:');
    console.log('   npm run consolidate-enhanced');
  } else {
    console.log('\n✨ All token files already in correct order!');
  }
}

// Run the script
main();