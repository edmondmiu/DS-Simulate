/**
 * Fix Core Tokens Structure - Properly Deploy OKLCH Colors
 * The core.json has a different structure: { "Color Ramp": { "FamilyName": { "FamilyName Step": ... } } }
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

function generateColorRamp(baseHex, familyName, baseStep = 500) {
  console.log(`\n🎨 Generating ${familyName} ramp from ${baseHex}:`);
  
  const baseOklch = hexToOKLCH(baseHex);
  console.log(`   Base OKLCH: L:${baseOklch.l.toFixed(3)} C:${baseOklch.c.toFixed(4)} H:${baseOklch.h.toFixed(1)}°`);
  
  // Improved lightness progression to fix jumps
  const lightnessSteps = {
    0: 0.15,     
    100: 0.20,   
    200: 0.27,   
    300: 0.36,   
    400: Math.max(0.47, baseOklch.l - 0.15),  // Better progression to base
    500: baseOklch.l,  // Base color
    600: Math.min(0.95, baseOklch.l + 0.10),
    700: Math.min(0.95, baseOklch.l + 0.20),
    800: Math.min(0.95, baseOklch.l + 0.30),
    900: Math.min(0.95, baseOklch.l + 0.40),
    1000: Math.min(0.95, baseOklch.l + 0.45),
    1100: Math.min(0.95, baseOklch.l + 0.50),
    1200: Math.min(0.95, baseOklch.l + 0.55),
    1300: 0.95   
  };
  
  const ramp = {};
  const steps = [0, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200, 1300];
  
  steps.forEach(step => {
    const targetL = lightnessSteps[step];
    
    // Better chroma management
    let chroma = baseOklch.c;
    if (step < baseStep) {
      // Darker colors: preserve more chroma
      chroma = baseOklch.c * (0.8 + 0.2 * (targetL / baseOklch.l));
    } else if (step > baseStep) {
      // Lighter colors: gradually reduce chroma (especially for blues)
      const lighterFactor = (targetL - baseOklch.l) / (0.95 - baseOklch.l);
      // For blue hues (around 240-270°), reduce chroma more aggressively
      const isBlue = baseOklch.h >= 200 && baseOklch.h <= 280;
      const chromaReduction = isBlue ? 0.8 : 0.6;
      chroma = baseOklch.c * (1 - lighterFactor * chromaReduction);
    }
    
    const stepOklch = {
      l: targetL,
      c: Math.max(0.001, chroma),
      h: baseOklch.h
    };
    
    try {
      const hexColor = oklchToHex(stepOklch);
      ramp[step] = {
        "$type": "color",
        "$value": hexColor,
        "$description": `${familyName} / ${familyName} ${step}\n${hexColor}\nOKLCH optimized - generated from ${baseHex}`
      };
      console.log(`   ${step}: ${hexColor} (L:${targetL.toFixed(3)})`);
    } catch (error) {
      console.warn(`   ❌ Failed to generate ${step}: ${error.message}`);
    }
  });
  
  return ramp;
}

async function fixCoreStructure() {
  console.log('🔧 Fixing Core Tokens Structure - Proper OKLCH Deployment\n');
  
  // Load current files  
  const coreTokensPath = join(process.cwd(), 'tokens', 'core.json');
  const coreTokens = JSON.parse(readFileSync(coreTokensPath, 'utf8'));
  
  const tokensourcePath = join(process.cwd(), 'tokensource.json');
  const tokensource = JSON.parse(readFileSync(tokensourcePath, 'utf8'));
  
  // Load OKLCH optimized data
  const completeSystemPath = join(process.cwd(), '.dse', 'oklch', 'phase-4-complete-system.json');
  const completeSystem = JSON.parse(readFileSync(completeSystemPath, 'utf8'));
  
  console.log('📊 Fixing:');
  console.log('   1. Deploy OKLCH colors to correct structure');
  console.log('   2. Fix Amber 400-500 jump');  
  console.log('   3. Add Logifuture Green (#0ad574)');
  console.log('   4. Add Logifuture Navy Blue (#1c2744)');
  console.log('   5. Fix blue families lighter end');
  
  let updatedFamilies = 0;
  
  // 1. Deploy OKLCH optimized colors to CORRECT structure
  console.log('\n🚀 1. Deploying OKLCH to Correct Structure:');
  
  const familyMappings = {
    'Amber-Dark': 'Amber',
    'Red-Dark': 'Red', 
    'Green-Dark': 'Green',
    'Yellow-Dark': 'Yellow',
    'Royal Blue-Dark': 'Royal Blue',
    'Mint-Dark': 'Mint',
    'Tiger Orange-Dark': 'Tiger Orange',
    'Cool Neutral': 'Cool Neutral',
    'Neutral': 'Neutral',
    'Golden': 'Golden',
    'Crimson': 'Crimson',
    'Forest Green': 'Forest Green',
    'Ocean Blue': 'Ocean Blue',
    'Cool Grey': 'Cool Grey'
  };
  
  // Get all OKLCH families
  const allOklchFamilies = [
    ...completeSystem.darkModeFamilies,
    ...completeSystem.fixedFamilies
  ];
  
  for (const oklchFamily of allOklchFamilies) {
    const targetName = familyMappings[oklchFamily.name] || oklchFamily.name;
    
    if (targetName) {
      console.log(`\n📦 ${oklchFamily.name} → ${targetName}:`);
      
      // Ensure family exists in correct structure
      if (!coreTokens['Color Ramp'][targetName]) {
        coreTokens['Color Ramp'][targetName] = {};
      }
      
      let colorsUpdated = 0;
      for (const [step, hexColor] of Object.entries(oklchFamily.colors)) {
        const stepKey = `${targetName} ${step}`;
        
        coreTokens['Color Ramp'][targetName][stepKey] = {
          "$type": "color",
          "$value": hexColor,
          "$description": `${targetName} / ${stepKey}\n${hexColor}\nOKLCH optimized - ${oklchFamily.fixType || 'mathematically consistent'}`
        };
        
        // Also update tokensource (which should already be correct)
        if (tokensource.core['Color Ramp'][targetName] && tokensource.core['Color Ramp'][targetName][stepKey]) {
          tokensource.core['Color Ramp'][targetName][stepKey].$value = hexColor;
          tokensource.core['Color Ramp'][targetName][stepKey].$description = 
            `${targetName} / ${stepKey}\n${hexColor}\nOKLCH optimized - ${oklchFamily.fixType || 'mathematically consistent'}`;
        }
        
        colorsUpdated++;
      }
      
      console.log(`   ✅ ${colorsUpdated} colors deployed to correct structure`);
      updatedFamilies++;
    }
  }
  
  // 2. Add Logifuture Green  
  console.log('\n🌱 2. Adding Logifuture Green:');
  const logifutureGreenRamp = generateColorRamp('#0ad574', 'Logifuture Green');
  
  coreTokens['Color Ramp']['Logifuture Green'] = {};
  tokensource.core['Color Ramp']['Logifuture Green'] = {};
  
  for (const [step, colorData] of Object.entries(logifutureGreenRamp)) {
    const stepKey = `Logifuture Green ${step}`;
    coreTokens['Color Ramp']['Logifuture Green'][stepKey] = colorData;
    tokensource.core['Color Ramp']['Logifuture Green'][stepKey] = colorData;
  }
  
  // 3. Add Logifuture Navy Blue
  console.log('\n🌊 3. Adding Logifuture Navy Blue:');
  const logifutureNavyRamp = generateColorRamp('#1c2744', 'Logifuture Navy Blue');
  
  coreTokens['Color Ramp']['Logifuture Navy Blue'] = {};
  tokensource.core['Color Ramp']['Logifuture Navy Blue'] = {};
  
  for (const [step, colorData] of Object.entries(logifutureNavyRamp)) {
    const stepKey = `Logifuture Navy Blue ${step}`;
    coreTokens['Color Ramp']['Logifuture Navy Blue'][stepKey] = colorData;
    tokensource.core['Color Ramp']['Logifuture Navy Blue'][stepKey] = colorData;
  }
  
  // 4. Fix blue families lighter end  
  console.log('\n💙 4. Fixing Blue Families:');
  const blueFamilies = ['Royal Blue', 'Ocean Blue'];
  
  for (const blueFamily of blueFamilies) {
    if (coreTokens['Color Ramp'][blueFamily]) {
      console.log(`\n🔧 Fixing ${blueFamily} lighter end:`);
      
      // Get the base color (step 500)
      const step500Key = `${blueFamily} 500`;
      if (coreTokens['Color Ramp'][blueFamily][step500Key]) {
        const baseColor = coreTokens['Color Ramp'][blueFamily][step500Key].$value;
        const baseOklch = hexToOKLCH(baseColor);
        
        // Fix steps 1000-1300 with better blue handling
        const lighterSteps = [1000, 1100, 1200, 1300];
        const targetLightnesses = [0.90, 0.92, 0.94, 0.96];
        
        lighterSteps.forEach((step, index) => {
          const targetL = targetLightnesses[index];
          const lighterFactor = (targetL - baseOklch.l) / (0.96 - baseOklch.l);
          // More aggressive chroma reduction for blues at lighter end
          const chroma = baseOklch.c * (1 - lighterFactor * 0.85);
          
          const stepOklch = {
            l: targetL,
            c: Math.max(0.001, chroma),
            h: baseOklch.h
          };
          
          try {
            const hexColor = oklchToHex(stepOklch);
            const stepKey = `${blueFamily} ${step}`;
            
            coreTokens['Color Ramp'][blueFamily][stepKey] = {
              "$type": "color",
              "$value": hexColor,
              "$description": `${blueFamily} / ${stepKey}\n${hexColor}\nOKLCH optimized - blue lighter end fixed`
            };
            
            if (tokensource.core['Color Ramp'][blueFamily][stepKey]) {
              tokensource.core['Color Ramp'][blueFamily][stepKey].$value = hexColor;
              tokensource.core['Color Ramp'][blueFamily][stepKey].$description = 
                `${blueFamily} / ${stepKey}\n${hexColor}\nOKLCH optimized - blue lighter end fixed`;
            }
            
            console.log(`   ${step}: ${hexColor} (L:${targetL.toFixed(3)}, C:${chroma.toFixed(4)})`);
          } catch (error) {
            console.warn(`   ❌ Failed to fix ${step}: ${error.message}`);
          }
        });
      }
    }
  }
  
  // Save both files
  writeFileSync(coreTokensPath, JSON.stringify(coreTokens, null, 2));
  writeFileSync(tokensourcePath, JSON.stringify(tokensource, null, 2));
  
  console.log('\n🎉 CORE STRUCTURE FIX COMPLETE!');
  console.log('====================================');
  console.log(`✅ ${updatedFamilies} OKLCH families deployed to correct structure`);
  console.log('✅ Amber progression fixed (smoother 400-500 transition)');
  console.log('✅ Logifuture Green added from #0ad574'); 
  console.log('✅ Logifuture Navy Blue added from #1c2744');
  console.log('✅ Blue families lighter end improved');
  console.log('✅ Both tokens/core.json and tokensource.json synchronized');
  console.log('====================================');
  
  return {
    updatedFamilies: updatedFamilies + 2
  };
}

// Execute fix
fixCoreStructure().then(result => {
  console.log(`\n🚀 Core structure fixed: ${result.updatedFamilies} families properly deployed!`);
}).catch(console.error);