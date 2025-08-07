#!/usr/bin/env node

/**
 * Extract Color Tokens Script
 * Epic 3.2: Create Web CSS Transform - Phase 1
 * 
 * Extract only color tokens with direct hex values for immediate Style Dictionary success
 */

const fs = require('fs');

function extractColorTokens(obj, result = {}) {
  for (const [key, value] of Object.entries(obj)) {
    if (value && typeof value === 'object') {
      if (value.$type === 'color' && 
          typeof value.$value === 'string' && 
          value.$value.startsWith('#') &&
          !value.$value.includes('{')) {
        // Direct color token with hex value
        result[key] = value;
      } else if (!value.$type && !value.$value) {
        // This is a token group, recurse
        result[key] = {};
        extractColorTokens(value, result[key]);
        
        // Remove empty groups
        if (Object.keys(result[key]).length === 0) {
          delete result[key];
        }
      }
    }
  }
  return result;
}

function main() {
  console.log('🎨 Extracting Color Tokens for Style Dictionary Phase 1');
  console.log('======================================================\n');

  try {
    // Load tokensource
    const tokens = JSON.parse(fs.readFileSync('tokensource.json', 'utf8'));
    const colorTokens = {};

    // Process each token set
    for (const [tokenSetName, tokenSetData] of Object.entries(tokens)) {
      if (tokenSetName.startsWith('$')) {
        // Keep metadata as-is
        colorTokens[tokenSetName] = tokenSetData;
        continue;
      }

      console.log(`Processing token set: ${tokenSetName}`);
      colorTokens[tokenSetName] = extractColorTokens(tokenSetData);
      
      const tokenCount = JSON.stringify(colorTokens[tokenSetName]).match(/\$type/g)?.length || 0;
      console.log(`  Extracted ${tokenCount} color tokens`);
    }

    // Write the color tokens
    fs.writeFileSync('tokensource-colors.json', JSON.stringify(colorTokens, null, 2));
    
    const totalSize = Buffer.byteLength(JSON.stringify(colorTokens));
    console.log(`\n✅ Generated tokensource-colors.json (${totalSize} bytes)`);
    console.log(`✅ Ready for Style Dictionary CSS generation`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();