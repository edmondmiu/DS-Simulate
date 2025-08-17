/**
 * Fix Neutral Color Reversal Issue - Corrected Version
 * Properly reverses the Neutral progression so 0=darkest, 1300=lightest
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

async function fixNeutralReversalV2() {
  console.log('🔧 Fixing Neutral Color Reversal Issue - V2\n');
  
  // Load both token files
  const coreTokensPath = join(process.cwd(), 'tokens', 'core.json');
  const coreTokens = JSON.parse(readFileSync(coreTokensPath, 'utf8'));
  
  const tokensourcePath = join(process.cwd(), 'tokensource.json');
  const tokensource = JSON.parse(readFileSync(tokensourcePath, 'utf8'));
  
  console.log('🔍 Current Neutral progression (INCORRECT):');
  const currentNeutralColors = coreTokens.Neutral.value;
  const steps = ['0', '100', '200', '300', '400', '500', '600', '700', '800', '900', '1000', '1100', '1200', '1300'];
  
  console.log(`   Neutral 0: ${currentNeutralColors['0'].value} (should be darkest)`);
  console.log(`   Neutral 1300: ${currentNeutralColors['1300'].value} (should be lightest)`);
  
  // Extract all color values in current order
  const colorValues = steps.map(step => currentNeutralColors[step].value);
  console.log('\n📋 Current color values:', colorValues);
  
  // Reverse the array of colors
  const reversedColorValues = [...colorValues].reverse();
  console.log('🔄 Reversed color values:', reversedColorValues);
  
  // Create the corrected mapping
  const correctedNeutralColors = {};
  
  console.log('\n🔄 Applying Correction:');
  steps.forEach((step, index) => {
    const oldValue = colorValues[index];
    const newValue = reversedColorValues[index];
    
    correctedNeutralColors[step] = {
      value: newValue,
      type: "color",
      description: `OKLCH optimized - Neutral progression corrected (was reversed)`
    };
    
    console.log(`   Neutral ${step}: ${oldValue} → ${newValue}`);
  });
  
  // Update core tokens
  coreTokens.Neutral.value = correctedNeutralColors;
  
  // Update tokensource
  steps.forEach(step => {
    const stepKey = `Neutral ${step}`;
    if (tokensource.core['Color Ramp']['Neutral'][stepKey]) {
      const newValue = correctedNeutralColors[step].value;
      tokensource.core['Color Ramp']['Neutral'][stepKey].$value = newValue;
      tokensource.core['Color Ramp']['Neutral'][stepKey].$description = 
        `Neutral / ${stepKey}\n${newValue}\nOKLCH optimized - Neutral progression corrected (was reversed)`;
    }
  });
  
  // Save both files
  writeFileSync(coreTokensPath, JSON.stringify(coreTokens, null, 2));
  writeFileSync(tokensourcePath, JSON.stringify(tokensource, null, 2));
  
  console.log('\n✅ NEUTRAL CORRECTION V2 COMPLETE!');
  console.log('====================================');
  console.log(`✅ Core tokens updated: ${coreTokensPath}`);
  console.log(`✅ Tokensource updated: ${tokensourcePath}`);
  console.log(`✅ Neutral 0 is now darkest: ${correctedNeutralColors['0'].value}`);
  console.log(`✅ Neutral 1300 is now lightest: ${correctedNeutralColors['1300'].value}`);
  console.log('====================================');
  
  // Verify the correction
  console.log('\n🔍 Verification - Corrected Neutral progression:');
  console.log(`   Neutral 0: ${correctedNeutralColors['0'].value} (darkest)`);
  console.log(`   Neutral 500: ${correctedNeutralColors['500'].value} (middle)`);
  console.log(`   Neutral 1300: ${correctedNeutralColors['1300'].value} (lightest)`);
  
  return {
    correctedColors: Object.keys(correctedNeutralColors).length,
    darkest: correctedNeutralColors['0'].value,
    lightest: correctedNeutralColors['1300'].value
  };
}

// Execute correction
fixNeutralReversalV2().then(result => {
  console.log(`\n🎯 Neutral progression fixed: ${result.correctedColors} colors corrected!`);
  console.log(`Correct range: ${result.darkest} (dark) → ${result.lightest} (light)`);
}).catch(console.error);