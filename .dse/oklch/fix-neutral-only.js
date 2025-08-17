/**
 * Fix Neutral Only - DO NOT TOUCH ANY OTHER COLORS
 * Just fix the reversed Neutral progression without affecting anything else
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

async function fixNeutralOnly() {
  console.log('🔧 Fixing ONLY Neutral Reversal - No Other Colors Touched\n');
  
  // Load both token files
  const coreTokensPath = join(process.cwd(), 'tokens', 'core.json');
  const coreTokens = JSON.parse(readFileSync(coreTokensPath, 'utf8'));
  
  const tokensourcePath = join(process.cwd(), 'tokensource.json');
  const tokensource = JSON.parse(readFileSync(tokensourcePath, 'utf8'));
  
  // Check current Neutral values
  const neutralSteps = ['0', '100', '200', '300', '400', '500', '600', '700', '800', '900', '1000', '1100', '1200', '1300'];
  
  console.log('🔍 Current Neutral progression (WRONG):');
  const currentValues = {};
  for (const step of neutralSteps) {
    const stepKey = `Neutral ${step}`;
    if (coreTokens['Color Ramp']['Neutral'] && coreTokens['Color Ramp']['Neutral'][stepKey]) {
      currentValues[step] = coreTokens['Color Ramp']['Neutral'][stepKey].$value;
      console.log(`   ${step}: ${currentValues[step]}`);
    }
  }
  
  // Extract just the color values
  const colorValues = neutralSteps.map(step => currentValues[step]);
  console.log('\n📋 Color values array:', colorValues);
  
  // Reverse the array to get correct order
  const reversedValues = [...colorValues].reverse();
  console.log('🔄 Reversed array (correct):', reversedValues);
  
  console.log('\n🔄 Applying correction:');
  
  // Apply the reversed values to correct positions
  neutralSteps.forEach((step, index) => {
    const stepKey = `Neutral ${step}`;
    const oldValue = currentValues[step];
    const newValue = reversedValues[index];
    
    // Update core tokens
    if (coreTokens['Color Ramp']['Neutral'][stepKey]) {
      coreTokens['Color Ramp']['Neutral'][stepKey].$value = newValue;
      coreTokens['Color Ramp']['Neutral'][stepKey].$description = 
        `Neutral / ${stepKey}\n${newValue}\nCorrected progression - neutral fixed`;
    }
    
    // Update tokensource
    if (tokensource.core['Color Ramp']['Neutral'][stepKey]) {
      tokensource.core['Color Ramp']['Neutral'][stepKey].$value = newValue;
      tokensource.core['Color Ramp']['Neutral'][stepKey].$description = 
        `Neutral / ${stepKey}\n${newValue}\nCorrected progression - neutral fixed`;
    }
    
    console.log(`   ${step}: ${oldValue} → ${newValue}`);
  });
  
  // Save both files
  writeFileSync(coreTokensPath, JSON.stringify(coreTokens, null, 2));
  writeFileSync(tokensourcePath, JSON.stringify(tokensource, null, 2));
  
  console.log('\n🎉 NEUTRAL ONLY FIX COMPLETE!');
  console.log('===============================');
  console.log(`✅ Neutral 0: ${reversedValues[0]} (darkest)`);
  console.log(`✅ Neutral 1300: ${reversedValues[13]} (lightest)`);
  console.log('✅ Progression now correct: dark → light');
  console.log('✅ NO OTHER COLORS were touched');
  console.log('===============================');
  
  return {
    darkest: reversedValues[0],
    lightest: reversedValues[13]
  };
}

// Execute fix
fixNeutralOnly().then(result => {
  console.log(`\n🚀 Neutral fixed: ${result.darkest} (dark) → ${result.lightest} (light)`);
}).catch(console.error);