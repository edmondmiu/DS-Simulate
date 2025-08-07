#!/usr/bin/env node

/**
 * Extract Simple Tokens Script
 * Epic 3.2: Create Web CSS Transform
 * 
 * Extract only tokens with direct values (no references) for Style Dictionary processing
 */

const fs = require('fs');

function extractSimpleTokens(obj, result = {}) {
  for (const [key, value] of Object.entries(obj)) {
    if (value && typeof value === 'object') {
      if (value.$type && value.$value) {
        // This is a design token
        if (typeof value.$value === 'string' && !value.$value.includes('{')) {
          // Simple value token (no references)
          result[key] = value;
        } else if (typeof value.$value !== 'string') {
          // Non-string value (numbers, etc.)
          result[key] = value;
        }
      } else {
        // This is a token group, recurse
        result[key] = {};
        extractSimpleTokens(value, result[key]);
        
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
  console.log('🎯 Extracting Simple Tokens for Style Dictionary');
  console.log('===============================================\n');

  try {
    // Load tokensource
    const tokens = JSON.parse(fs.readFileSync('tokensource.json', 'utf8'));
    const simpleTokens = {};

    // Process each token set
    for (const [tokenSetName, tokenSetData] of Object.entries(tokens)) {
      if (tokenSetName.startsWith('$')) {
        // Keep metadata as-is
        simpleTokens[tokenSetName] = tokenSetData;
        continue;
      }

      console.log(`Processing token set: ${tokenSetName}`);
      simpleTokens[tokenSetName] = extractSimpleTokens(tokenSetData);
      
      const tokenCount = JSON.stringify(simpleTokens[tokenSetName]).match(/\$type/g)?.length || 0;
      console.log(`  Extracted ${tokenCount} simple tokens`);
    }

    // Write the simple tokens
    fs.writeFileSync('tokensource-simple.json', JSON.stringify(simpleTokens, null, 2));
    
    const totalSize = Buffer.byteLength(JSON.stringify(simpleTokens));
    console.log(`\n✅ Generated tokensource-simple.json (${totalSize} bytes)`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();