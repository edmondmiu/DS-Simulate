#!/usr/bin/env node

/**
 * Fix Semantic Color Token Ordering Script
 * Reorders semantic color tokens to logical sequence: 0000 → 1300
 * Fixes the issue where tokens appear as 1000-1300, then 0000-0900
 */

import * as fs from 'fs';
import * as path from 'path';

const PROPER_COLOR_ORDER = [
  '000', '100', '200', '300', '400', '500', 
  '600', '700', '800', '900',
  '1000', '1100', '1200', '1300'
];

const OLD_TO_NEW_MAPPING = {
  '0000': '000',
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

// Also include surface and content colors as they follow the same pattern
const ALL_COLOR_TOKENS = [
  'primary', 'secondary', 'success', 'warning', 'error', 'accent', 'info',
  'surface', 'content'
];

const SEMANTIC_COLOR_TOKENS = [
  'primary', 'secondary', 'success', 'warning', 'error', 'accent'
];

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
  
  // Check each color token (including surface and content)
  ALL_COLOR_TOKENS.forEach(colorToken => {
    if (tokens[colorToken]) {
      console.log(`  🎨 Reordering ${colorToken} colors...`);
      
      const originalKeys = Object.keys(tokens[colorToken]);
      const availableKeys = PROPER_COLOR_ORDER.filter(level => tokens[colorToken][level]);
      
      
      // Check if tokens need renaming (from 0000 format to 000 format)
      const needsRenaming = originalKeys.some(key => key.startsWith('0') && key.length === 4);
      const needsReordering = originalKeys[0] === '1000' || originalKeys[0] === '0000';
      
      if (needsRenaming || needsReordering) {
        changesMade = true;
        console.log(`    ✅ Will fix naming and order: ${originalKeys.slice(0,3).join(', ')}... → ${PROPER_COLOR_ORDER.slice(0,3).join(', ')}...`);
      } else {
        console.log(`    ✨ Already in correct format`);
      }
    }
  });
  
  // Write back if changes were made
  if (changesMade) {
    // Manually reconstruct the file with proper ordering
    const orderedTokens = {};
    
    // Process each top-level key
    Object.keys(tokens).forEach(topLevelKey => {
      if (ALL_COLOR_TOKENS.includes(topLevelKey)) {
        // This is a color token that needs reordering
        const colorTokens = tokens[topLevelKey];
        const orderedColorTokens = {};
        
        // Add color tokens in proper order with renamed keys
        PROPER_COLOR_ORDER.forEach(newKey => {
          // Check if this color token exists in either old or new format
          if (colorTokens[newKey]) {
            // Already in new format
            orderedColorTokens[newKey] = colorTokens[newKey];
          } else {
            // Check if it exists in old format and needs renaming
            const oldKey = Object.keys(OLD_TO_NEW_MAPPING).find(k => OLD_TO_NEW_MAPPING[k] === newKey);
            if (oldKey && colorTokens[oldKey]) {
              // Rename from old format to new format, and also update the $value reference
              const tokenValue = colorTokens[oldKey];
              if (tokenValue.$value && typeof tokenValue.$value === 'string' && tokenValue.$value.includes(oldKey)) {
                // Update the reference in the $value to use the new key
                tokenValue.$value = tokenValue.$value.replace(new RegExp(oldKey, 'g'), newKey);
              }
              orderedColorTokens[newKey] = tokenValue;
            }
          }
        });
        
        // Add any other keys that aren't color levels (and weren't already processed)
        Object.keys(colorTokens).forEach(key => {
          if (!PROPER_COLOR_ORDER.includes(key) && !Object.keys(OLD_TO_NEW_MAPPING).includes(key)) {
            orderedColorTokens[key] = colorTokens[key];
          }
        });
        
        orderedTokens[topLevelKey] = orderedColorTokens;
      } else {
        // Not a color token, keep as is
        orderedTokens[topLevelKey] = tokens[topLevelKey];
      }
    });
    
    const updatedContent = JSON.stringify(orderedTokens, null, 2);
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
  console.log('Target order: 000 → 100 → ... → 900 → 1000 → 1100 → 1200 → 1300');
  
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
  console.log(`Color tokens checked: ${ALL_COLOR_TOKENS.join(', ')}`);
  
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