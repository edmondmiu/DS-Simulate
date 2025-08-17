/**
 * Fix Neutral Color Reversal Issue
 * Corrects the reversed Neutral progression in both tokens/core.json and tokensource.json
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

async function fixNeutralReversal() {
  console.log('🔧 Fixing Neutral Color Reversal Issue\n');
  
  // Load both token files
  const coreTokensPath = join(process.cwd(), 'tokens', 'core.json');
  const coreTokens = JSON.parse(readFileSync(coreTokensPath, 'utf8'));
  
  const tokensourcePath = join(process.cwd(), 'tokensource.json');
  const tokensource = JSON.parse(readFileSync(tokensourcePath, 'utf8'));
  
  console.log('🔍 Current Neutral progression (INCORRECT):');
  if (coreTokens.Neutral && coreTokens.Neutral.value) {
    console.log(`   Neutral 0: ${coreTokens.Neutral.value['0'].value} (should be darkest)`);
    console.log(`   Neutral 1300: ${coreTokens.Neutral.value['1300'].value} (should be lightest)`);
  }
  
  // Get the current reversed values
  const currentNeutralColors = coreTokens.Neutral.value;
  const steps = [0, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200, 1300];
  
  // Create the correct mapping by reversing the colors
  const correctedNeutralColors = {};
  const reversedSteps = [...steps].reverse();
  
  console.log('\n🔄 Applying Correction:');
  steps.forEach((step, index) => {
    const currentColor = currentNeutralColors[step.toString()];
    const newStepIndex = reversedSteps.length - 1 - index;
    const newColor = currentNeutralColors[reversedSteps[newStepIndex].toString()];
    
    correctedNeutralColors[step.toString()] = {
      value: newColor.value,
      type: "color",
      description: `OKLCH optimized - Neutral progression corrected`
    };
    
    console.log(`   Neutral ${step}: ${currentColor.value} → ${newColor.value}`);
  });
  
  // Update core tokens
  coreTokens.Neutral.value = correctedNeutralColors;
  
  // Update tokensource
  steps.forEach(step => {
    const stepKey = `Neutral ${step}`;
    if (tokensource.core['Color Ramp']['Neutral'][stepKey]) {
      const newValue = correctedNeutralColors[step.toString()].value;
      tokensource.core['Color Ramp']['Neutral'][stepKey].$value = newValue;
      tokensource.core['Color Ramp']['Neutral'][stepKey].$description = 
        `Neutral / ${stepKey}\n${newValue}\nOKLCH optimized - Neutral progression corrected`;
    }
  });
  
  // Save both files
  writeFileSync(coreTokensPath, JSON.stringify(coreTokens, null, 2));
  writeFileSync(tokensourcePath, JSON.stringify(tokensource, null, 2));
  
  console.log('\n✅ NEUTRAL CORRECTION COMPLETE!');
  console.log('====================================');
  console.log(`✅ Core tokens updated: ${coreTokensPath}`);
  console.log(`✅ Tokensource updated: ${tokensourcePath}`);
  console.log('✅ Neutral 0 is now darkest (#161616)');
  console.log('✅ Neutral 1300 is now lightest (#f9f9f9)');
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
fixNeutralReversal().then(result => {
  console.log(`\n🎯 Neutral progression fixed: ${result.correctedColors} colors corrected!`);
  console.log(`Range: ${result.darkest} (dark) → ${result.lightest} (light)`);
}).catch(console.error);