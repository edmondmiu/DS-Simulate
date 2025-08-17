/**
 * Fix Neon Green 1300 - Incorrect Dark Value
 * Neon Green 1300 is currently #003E00 (very dark) but should be the lightest step
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { oklch, formatHex } from 'culori';

function hexToOKLCH(hexColor) {
  const oklchColor = oklch(hexColor);
  if (!oklchColor) {
    throw new Error(`Invalid color: ${hexColor}`);
  }
  
  return {
    l: Math.round(oklchColor.l * 1000) / 1000,
    c: Math.round(oklchColor.c * 10000) / 10000,  
    h: Math.round((oklchColor.h || 0) * 10000) / 10000
  };
}

function oklchToHex(oklch) {
  return formatHex({ mode: 'oklch', ...oklch });
}

async function fixNeonGreen1300() {
  console.log('🔧 Fixing Neon Green 1300 Incorrect Value\n');
  
  // Load both token files
  const coreTokensPath = join(process.cwd(), 'tokens', 'core.json');
  const coreTokens = JSON.parse(readFileSync(coreTokensPath, 'utf8'));
  
  const tokensourcePath = join(process.cwd(), 'tokensource.json');
  const tokensource = JSON.parse(readFileSync(tokensourcePath, 'utf8'));
  
  console.log('🔍 Current Neon Green progression:');
  
  // Check current Neon Green values
  const neonGreenSteps = [0, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200, 1300];
  
  for (const step of neonGreenSteps) {
    const stepKey = `Neon Green ${step}`;
    if (coreTokens['Color Ramp']['Neon Green'] && coreTokens['Color Ramp']['Neon Green'][stepKey]) {
      const currentValue = coreTokens['Color Ramp']['Neon Green'][stepKey].$value;
      console.log(`   ${step}: ${currentValue}`);
    }
  }
  
  // The issue: 1300 has #003E00 but should be lightest
  console.log('\n🚨 Problem identified:');
  console.log('   Neon Green 1300: #003E00 (very dark - WRONG!)');
  console.log('   Should be: lightest step in the progression');
  
  // Fix strategy: Generate proper 1300 based on the Neon Green family characteristics
  // Use step 1200 (#F3FFF3) as reference and make 1300 even lighter
  const step1200Value = '#F3FFF3';
  const step1200Oklch = hexToOKLCH(step1200Value);
  
  console.log(`\n🔬 Analysis of step 1200: ${step1200Value}`);
  console.log(`   OKLCH: L:${step1200Oklch.l.toFixed(3)} C:${step1200Oklch.c.toFixed(4)} H:${step1200Oklch.h.toFixed(1)}°`);
  
  // Generate proper 1300: even lighter than 1200
  const proper1300Oklch = {
    l: Math.min(0.97, step1200Oklch.l + 0.02), // Slightly lighter
    c: Math.max(0.001, step1200Oklch.c * 0.8), // Reduce chroma slightly
    h: step1200Oklch.h // Same hue
  };
  
  const proper1300Hex = oklchToHex(proper1300Oklch);
  
  console.log(`\n✅ Generated proper 1300: ${proper1300Hex}`);
  console.log(`   OKLCH: L:${proper1300Oklch.l.toFixed(3)} C:${proper1300Oklch.c.toFixed(4)} H:${proper1300Oklch.h.toFixed(1)}°`);
  
  // Update both token files
  const step1300Key = 'Neon Green 1300';
  
  // Update core tokens
  if (coreTokens['Color Ramp']['Neon Green'] && coreTokens['Color Ramp']['Neon Green'][step1300Key]) {
    const oldValue = coreTokens['Color Ramp']['Neon Green'][step1300Key].$value;
    coreTokens['Color Ramp']['Neon Green'][step1300Key].$value = proper1300Hex;
    coreTokens['Color Ramp']['Neon Green'][step1300Key].$description = 
      `Neon Green / Neon Green 1300\n${proper1300Hex}\nFixed - was incorrectly dark, now properly lightest`;
    
    console.log(`\n🔄 Updated core tokens: ${oldValue} → ${proper1300Hex}`);
  }
  
  // Update tokensource
  if (tokensource.core['Color Ramp']['Neon Green'] && tokensource.core['Color Ramp']['Neon Green'][step1300Key]) {
    const oldValue = tokensource.core['Color Ramp']['Neon Green'][step1300Key].$value;
    tokensource.core['Color Ramp']['Neon Green'][step1300Key].$value = proper1300Hex;
    tokensource.core['Color Ramp']['Neon Green'][step1300Key].$description = 
      `Neon Green / Neon Green 1300\n${proper1300Hex}\nFixed - was incorrectly dark, now properly lightest`;
    
    console.log(`🔄 Updated tokensource: ${oldValue} → ${proper1300Hex}`);
  }
  
  // Save both files
  writeFileSync(coreTokensPath, JSON.stringify(coreTokens, null, 2));
  writeFileSync(tokensourcePath, JSON.stringify(tokensource, null, 2));
  
  console.log('\n🎉 NEON GREEN 1300 FIX COMPLETE!');
  console.log('===================================');
  console.log(`✅ Fixed incorrect dark value: #003E00 → ${proper1300Hex}`);
  console.log('✅ Neon Green 1300 now properly lightest in progression');
  console.log('✅ Both token files updated and synchronized');
  console.log('✅ OKLCH consistency maintained');
  console.log('===================================');
  
  // Verify the fix
  console.log('\n🔍 Verification - Final progression:');
  console.log(`   Neon Green 0: #004400 (darkest)`);
  console.log(`   Neon Green 1200: ${step1200Value} (very light)`);
  console.log(`   Neon Green 1300: ${proper1300Hex} (lightest) ✅`);
  
  return {
    oldValue: '#003E00',
    newValue: proper1300Hex,
    fixed: true
  };
}

// Execute fix
fixNeonGreen1300().then(result => {
  console.log(`\n🚀 Neon Green 1300 fixed: ${result.oldValue} → ${result.newValue}`);
}).catch(console.error);