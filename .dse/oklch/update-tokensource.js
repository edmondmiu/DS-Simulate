/**
 * Update tokensource.json with OKLCH Optimized Colors
 * Synchronizes the tokensource.json with our optimized tokens/core.json
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

async function updateTokensource() {
  console.log('🔄 Updating tokensource.json with OKLCH Optimized Colors\n');
  
  // Load the optimized core tokens
  const coreTokensPath = join(process.cwd(), 'tokens', 'core.json');
  const coreTokens = JSON.parse(readFileSync(coreTokensPath, 'utf8'));
  
  // Load current tokensource
  const tokensourcePath = join(process.cwd(), 'tokensource.json');
  const tokensource = JSON.parse(readFileSync(tokensourcePath, 'utf8'));
  
  console.log('📊 Update Summary:');
  console.log(`   Source: ${Object.keys(coreTokens).filter(k => !k.startsWith('_')).length} families in core.json`);
  
  let updatedColors = 0;
  let familiesUpdated = 0;
  
  console.log('\n🎨 Updating Color Families:');
  
  // Map core token families to tokensource structure
  const familyMappings = {
    'Amber': 'Amber',
    'Red': 'Red', 
    'Green': 'Green',
    'Yellow': 'Yellow',
    'Royal Blue': 'Royal Blue',
    'Mint': 'Mint',
    'Tiger Orange': 'Tiger Orange',
    'Cool Neutral': 'Cool Neutral',
    'Neutral': 'Neutral',
    'Golden': 'Golden',
    'Crimson': 'Crimson',
    'Forest Green': 'Forest Green',
    'Ocean Blue': 'Ocean Blue',
    'Cool Grey': 'Cool Grey'
  };
  
  for (const [coreFamily, tokensourceFamily] of Object.entries(familyMappings)) {
    if (coreTokens[coreFamily] && coreTokens[coreFamily].value) {
      console.log(`\n📦 ${coreFamily}:`);
      
      // Ensure family exists in tokensource
      if (!tokensource.core['Color Ramp'][tokensourceFamily]) {
        tokensource.core['Color Ramp'][tokensourceFamily] = {};
        console.log(`   ✨ Created new family in tokensource: ${tokensourceFamily}`);
      }
      
      const coreColors = coreTokens[coreFamily].value;
      let familyColors = 0;
      
      // Update each color step
      for (const [step, colorData] of Object.entries(coreColors)) {
        const stepKey = `${tokensourceFamily} ${step}`;
        const hexValue = colorData.value;
        
        // Create or update the color token
        if (!tokensource.core['Color Ramp'][tokensourceFamily][stepKey]) {
          tokensource.core['Color Ramp'][tokensourceFamily][stepKey] = {
            "$type": "color",
            "$value": hexValue,
            "$description": `${tokensourceFamily} / ${stepKey}\n${hexValue}\nOKLCH optimized - ${colorData.description || 'mathematically consistent'}`
          };
        } else {
          // Update existing token
          const oldValue = tokensource.core['Color Ramp'][tokensourceFamily][stepKey].$value;
          tokensource.core['Color Ramp'][tokensourceFamily][stepKey].$value = hexValue;
          tokensource.core['Color Ramp'][tokensourceFamily][stepKey].$description = 
            `${tokensourceFamily} / ${stepKey}\n${hexValue}\nOKLCH optimized - ${colorData.description || 'mathematically consistent'}`;
          
          if (oldValue !== hexValue) {
            console.log(`   🔄 ${step}: ${oldValue} → ${hexValue}`);
          }
        }
        
        updatedColors++;
        familyColors++;
      }
      
      console.log(`   ✅ Updated ${familyColors} colors in ${tokensourceFamily}`);
      familiesUpdated++;
    }
  }
  
  // Add update metadata
  if (!tokensource.core._metadata) {
    tokensource.core._metadata = {};
  }
  
  tokensource.core._metadata.oklchOptimization = {
    version: "Epic 4 V2",
    updatedAt: new Date().toISOString(),
    totalColorsUpdated: updatedColors,
    familiesUpdated: familiesUpdated,
    description: "OKLCH color space optimization for mathematical consistency and dual-mode support"
  };
  
  // Save the updated tokensource
  writeFileSync(tokensourcePath, JSON.stringify(tokensource, null, 2));
  
  console.log('\n🎉 TOKENSOURCE UPDATE COMPLETE!');
  console.log('=====================================');
  console.log(`✅ ${updatedColors} colors updated`);
  console.log(`✅ ${familiesUpdated} families synchronized`);
  console.log(`✅ OKLCH optimization metadata added`);
  console.log('=====================================');
  console.log(`💾 Updated: ${tokensourcePath}`);
  
  return {
    updatedColors,
    familiesUpdated
  };
}

// Execute update
updateTokensource().then(result => {
  console.log(`\n🚀 Tokensource synchronized: ${result.updatedColors} OKLCH optimized colors ready!`);
}).catch(console.error);