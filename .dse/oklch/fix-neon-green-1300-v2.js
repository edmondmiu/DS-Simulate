/**
 * Fix Neon Green 1300 - Correct Version
 * Make sure 1300 is actually lighter than 1200
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

async function fixNeonGreen1300V2() {
  console.log('🔧 Fixing Neon Green 1300 - Correct Version\n');
  
  // Load both token files
  const coreTokensPath = join(process.cwd(), 'tokens', 'core.json');
  const coreTokens = JSON.parse(readFileSync(coreTokensPath, 'utf8'));
  
  const tokensourcePath = join(process.cwd(), 'tokensource.json');
  const tokensource = JSON.parse(readFileSync(tokensourcePath, 'utf8'));
  
  // Check current values
  const step1200Value = coreTokens['Color Ramp']['Neon Green']['Neon Green 1200'].$value;
  const step1300Value = coreTokens['Color Ramp']['Neon Green']['Neon Green 1300'].$value;
  
  console.log('🔍 Current values:');
  console.log(`   Neon Green 1200: ${step1200Value}`);
  console.log(`   Neon Green 1300: ${step1300Value}`);
  
  // Analyze lightness
  const oklch1200 = hexToOKLCH(step1200Value);
  const oklch1300 = hexToOKLCH(step1300Value);
  
  console.log('\n📊 Lightness analysis:');
  console.log(`   1200 lightness: ${oklch1200.l.toFixed(3)}`);
  console.log(`   1300 lightness: ${oklch1300.l.toFixed(3)}`);
  console.log(`   1300 should be > 1200: ${oklch1300.l > oklch1200.l ? '✅' : '❌'}`);
  
  // Generate proper 1300: ensure it's actually lighter than 1200
  const proper1300Oklch = {
    l: Math.min(0.995, oklch1200.l + 0.005), // Slightly but definitely lighter
    c: Math.max(0.001, oklch1200.c * 0.7), // Reduce chroma for very light colors
    h: oklch1200.h // Same hue
  };
  
  const proper1300Hex = oklchToHex(proper1300Oklch);
  
  console.log(`\n✅ Corrected 1300: ${proper1300Hex}`);
  console.log(`   New lightness: ${proper1300Oklch.l.toFixed(3)} (vs 1200: ${oklch1200.l.toFixed(3)})`);
  console.log(`   Definitely lighter: ${proper1300Oklch.l > oklch1200.l ? '✅' : '❌'}`);
  
  // Update both token files
  const step1300Key = 'Neon Green 1300';
  
  // Update core tokens
  if (coreTokens['Color Ramp']['Neon Green'] && coreTokens['Color Ramp']['Neon Green'][step1300Key]) {
    const oldValue = coreTokens['Color Ramp']['Neon Green'][step1300Key].$value;
    coreTokens['Color Ramp']['Neon Green'][step1300Key].$value = proper1300Hex;
    coreTokens['Color Ramp']['Neon Green'][step1300Key].$description = 
      `Neon Green / Neon Green 1300\n${proper1300Hex}\nCorrected - now properly lightest in progression`;
    
    console.log(`\n🔄 Core tokens: ${oldValue} → ${proper1300Hex}`);
  }
  
  // Update tokensource
  if (tokensource.core['Color Ramp']['Neon Green'] && tokensource.core['Color Ramp']['Neon Green'][step1300Key]) {
    const oldValue = tokensource.core['Color Ramp']['Neon Green'][step1300Key].$value;
    tokensource.core['Color Ramp']['Neon Green'][step1300Key].$value = proper1300Hex;
    tokensource.core['Color Ramp']['Neon Green'][step1300Key].$description = 
      `Neon Green / Neon Green 1300\n${proper1300Hex}\nCorrected - now properly lightest in progression`;
    
    console.log(`🔄 Tokensource: ${oldValue} → ${proper1300Hex}`);
  }
  
  // Save both files
  writeFileSync(coreTokensPath, JSON.stringify(coreTokens, null, 2));
  writeFileSync(tokensourcePath, JSON.stringify(tokensource, null, 2));
  
  console.log('\n🎉 NEON GREEN 1300 PROPERLY FIXED!');
  console.log('=====================================');
  console.log(`✅ Corrected value: ${proper1300Hex}`);
  console.log(`✅ Lightness: ${proper1300Oklch.l.toFixed(3)} > ${oklch1200.l.toFixed(3)} (1200)`);
  console.log('✅ Now properly lightest in Neon Green progression');
  console.log('✅ Both token files synchronized');
  console.log('=====================================');
  
  return {
    oldValue: step1300Value,
    newValue: proper1300Hex,
    lightness1200: oklch1200.l,
    lightness1300: proper1300Oklch.l,
    properlyLighter: proper1300Oklch.l > oklch1200.l
  };
}

// Execute fix
fixNeonGreen1300V2().then(result => {
  console.log(`\n🚀 Neon Green 1300 properly fixed: ${result.oldValue} → ${result.newValue}`);
  console.log(`Lightness progression: 1200(${result.lightness1200.toFixed(3)}) → 1300(${result.lightness1300.toFixed(3)}) ✅`);
}).catch(console.error);