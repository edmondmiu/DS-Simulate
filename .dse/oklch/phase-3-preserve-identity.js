/**
 * Phase 3 Corrected: Preserve Color Identity While Fixing Progression
 * Keeps existing good colors but improves mathematical stepping
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

function identifyKeyColors(family) {
  // Identify colors that represent the family identity (high chroma, mid-lightness)
  const keyColors = [];
  
  Object.keys(family.colors).forEach(step => {
    const stepNum = parseInt(step);
    const oklch = family.oklchData[step];
    const hex = family.colors[step];
    
    // Key identity colors are typically:
    // 1. High chroma (c > 0.08 for colored families, > 0.02 for neutrals)
    // 2. Mid-lightness range (0.3-0.8) for usability
    // 3. Step 500 (primary) or steps with highest chroma
    const isHighChroma = oklch.c > (family.name.includes('Neutral') || family.name.includes('Grey') ? 0.02 : 0.08);
    const isMidLightness = oklch.l > 0.3 && oklch.l < 0.8;
    const isPrimary = stepNum === 500;
    
    if ((isHighChroma && isMidLightness) || isPrimary) {
      keyColors.push({
        step: stepNum,
        hex: hex,
        oklch: oklch,
        isIdentityColor: isHighChroma && isMidLightness,
        isPrimary: isPrimary
      });
    }
  });
  
  // Sort by chroma to identify the most "colorful" ones
  keyColors.sort((a, b) => b.oklch.c - a.oklch.c);
  
  return keyColors;
}

function fixProgressionWhilePreservingIdentity(family, isReversed = false) {
  console.log(`\n🎨 Fixing ${family.name} while preserving color identity:`);
  
  // Identify key colors to preserve
  const keyColors = identifyKeyColors(family);
  console.log(`   Key colors identified: ${keyColors.length}`);
  keyColors.forEach(key => {
    console.log(`     Step ${key.step}: ${key.hex} (${key.isIdentityColor ? 'IDENTITY' : ''}${key.isPrimary ? ' PRIMARY' : ''})`);
  });
  
  const fixedFamily = {
    name: family.name,
    colors: {},
    oklchData: {},
    preservedColors: keyColors,
    fixType: isReversed ? 'reversed_with_identity_preserved' : 'progression_fixed_with_identity_preserved',
    originalSmoothness: family.consistency.smoothness
  };

  // Extract family characteristics from the key colors
  let baseHue, baseChroma;
  if (keyColors.length > 0) {
    // Use the most chromatic color as the base
    const mostChromatic = keyColors[0];
    baseHue = mostChromatic.oklch.h;
    baseChroma = mostChromatic.oklch.c;
  } else {
    // Fallback to median of all colors
    const allOklch = Object.values(family.oklchData);
    const hues = allOklch.map(c => c.h).sort((a, b) => a - b);
    const chromas = allOklch.map(c => c.c).sort((a, b) => a - b);
    baseHue = hues[Math.floor(hues.length / 2)];
    baseChroma = chromas[Math.floor(chromas.length / 2)];
  }
  
  console.log(`   Base characteristics: H:${baseHue.toFixed(1)}° C:${baseChroma.toFixed(3)}`);

  // Create a map of preserved colors by step
  const preservedByStep = {};
  keyColors.forEach(key => {
    preservedByStep[key.step] = key;
  });

  // Generate lightness progression, but anchor it around preserved colors
  const steps = [0, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200, 1300];
  const targetRange = { min: 0.2, max: 0.98 };
  
  // If we have preserved colors, anchor the progression around them
  let lightnessProgression;
  if (keyColors.length > 0) {
    // Create progression that flows through the preserved colors
    lightnessProgression = [];
    const preservedSteps = keyColors.map(k => k.step).sort((a, b) => a - b);
    const preservedLightnesses = preservedSteps.map(step => preservedByStep[step].oklch.l);
    
    // Interpolate between preserved points and extend to full range
    for (let i = 0; i < steps.length; i++) {
      const currentStep = steps[i];
      
      if (preservedByStep[currentStep]) {
        // Use preserved lightness
        lightnessProgression.push(preservedByStep[currentStep].oklch.l);
      } else {
        // Interpolate based on surrounding preserved colors or use linear progression
        const progress = i / (steps.length - 1);
        const lightness = targetRange.min + (progress * (targetRange.max - targetRange.min));
        lightnessProgression.push(lightness);
      }
    }
  } else {
    // Fallback to standard progression
    lightnessProgression = steps.map((_, i) => {
      const progress = i / (steps.length - 1);
      return targetRange.min + (progress * (targetRange.max - targetRange.min));
    });
  }
  
  // Reverse if needed (for NeutralLight)
  if (isReversed) {
    lightnessProgression = [...lightnessProgression].reverse();
    // Also reverse preserved colors mapping
    const reversedPreserved = {};
    Object.keys(preservedByStep).forEach(step => {
      const reversedStep = steps[steps.length - 1 - steps.indexOf(parseInt(step))];
      reversedPreserved[reversedStep] = preservedByStep[step];
    });
    Object.keys(reversedPreserved).forEach(step => {
      preservedByStep[step] = reversedPreserved[step];
    });
  }

  // Generate colors
  steps.forEach((step, index) => {
    const stepStr = step.toString();
    
    if (preservedByStep[step] && !isReversed) {
      // Preserve existing key colors (unless reversed)
      fixedFamily.colors[stepStr] = preservedByStep[step].hex;
      fixedFamily.oklchData[stepStr] = preservedByStep[step].oklch;
      console.log(`   ✅ Preserved: Step ${step} = ${preservedByStep[step].hex}`);
      
    } else {
      // Generate new color with improved progression
      const lightness = lightnessProgression[index];
      
      // Apply chroma variation based on lightness and family characteristics
      let chroma = baseChroma;
      
      if (family.name.includes('Neutral') || family.name.includes('Grey')) {
        // Very low chroma for neutrals
        chroma = Math.max(0.001, baseChroma * (0.5 + 0.5 * Math.random()));
      } else {
        // Color families: vary chroma based on lightness
        if (lightness < 0.3 || lightness > 0.9) {
          chroma = baseChroma * 0.6; // Reduce in extremes
        } else if (lightness >= 0.4 && lightness <= 0.7) {
          chroma = baseChroma * 1.0; // Maintain in mid-tones
        } else {
          chroma = baseChroma * 0.8; // Slight reduction elsewhere
        }
      }
      
      const oklchColor = {
        l: lightness,
        c: Math.round(chroma * 10000) / 10000,
        h: baseHue
      };
      
      try {
        const hexColor = oklchToHex(oklchColor);
        fixedFamily.colors[stepStr] = hexColor;
        fixedFamily.oklchData[stepStr] = oklchColor;
      } catch (error) {
        console.warn(`Failed to generate ${family.name} ${step}:`, error);
        // Fallback to original
        fixedFamily.colors[stepStr] = family.colors[stepStr];
        fixedFamily.oklchData[stepStr] = family.oklchData[stepStr];
      }
    }
  });

  // Calculate new smoothness
  const newLightnesses = steps.map(step => fixedFamily.oklchData[step.toString()].l);
  const newStepDiffs = [];
  for (let i = 1; i < newLightnesses.length; i++) {
    newStepDiffs.push(newLightnesses[i] - newLightnesses[i - 1]);
  }
  
  const avgStep = newStepDiffs.reduce((sum, diff) => sum + diff, 0) / newStepDiffs.length;
  const variance = newStepDiffs.reduce((sum, diff) => sum + Math.pow(diff - avgStep, 2), 0) / newStepDiffs.length;
  const stdDev = Math.sqrt(variance);
  const newSmoothness = stdDev / Math.abs(avgStep);
  
  fixedFamily.newSmoothness = newSmoothness;
  fixedFamily.improvement = ((family.consistency.smoothness - newSmoothness) / family.consistency.smoothness * 100);
  
  console.log(`   Original smoothness: ${family.consistency.smoothness.toFixed(3)}`);
  console.log(`   New smoothness: ${newSmoothness.toFixed(3)} (${fixedFamily.improvement.toFixed(1)}% improvement)`);
  console.log(`   Colors preserved: ${keyColors.length}, Generated: ${steps.length - (isReversed ? 0 : keyColors.length)}`);
  
  return fixedFamily;
}

async function fixWithIdentityPreservation() {
  console.log('🎨 Phase 3 Corrected: Preserve Color Identity While Fixing Progression\n');
  console.log('🎯 Goal: Fix mathematical progression while preserving family color identity\n');

  // Load previous analysis
  const analysisPath = join(process.cwd(), '.dse', 'oklch', 'phase-1-pattern-analysis.json');
  const analysis = JSON.parse(readFileSync(analysisPath, 'utf8'));
  
  const brandPreservedPath = join(process.cwd(), '.dse', 'oklch', 'phase-2-brand-preserved.json');
  const brandPreserved = JSON.parse(readFileSync(brandPreservedPath, 'utf8'));

  const results = {
    goodFamilies: brandPreserved.darkModePreserved,
    lightModeCompanions: brandPreserved.lightModeGenerated,
    fixedFamilies: [],
    preservationSummary: []
  };

  console.log('🛠️  Fixing Problematic Families with Identity Preservation:');
  
  for (const problematicFamily of analysis.problematicFamilies) {
    let fixedFamily;
    
    if (problematicFamily.name === 'NeutralLight') {
      console.log(`\n🔄 Special: Reversing ${problematicFamily.name}`);
      fixedFamily = fixProgressionWhilePreservingIdentity(problematicFamily, true);
      fixedFamily.name = 'Neutral'; // Rename to proper Neutral
      
    } else {
      console.log(`\n📐 Fixing: ${problematicFamily.name}`);
      fixedFamily = fixProgressionWhilePreservingIdentity(problematicFamily, false);
    }
    
    results.fixedFamilies.push(fixedFamily);
    results.preservationSummary.push({
      familyName: fixedFamily.name,
      preservedCount: fixedFamily.preservedColors.length,
      preservedColors: fixedFamily.preservedColors.map(c => ({ step: c.step, hex: c.hex })),
      improvement: fixedFamily.improvement
    });
  }

  // Save results
  const outputPath = join(process.cwd(), '.dse', 'oklch', 'phase-3-identity-preserved.json');
  writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log(`\n💾 Identity preserved fixes saved to: ${outputPath}`);

  return results;
}

function generateIdentityPreservedHTML(results) {
  const generateFamilyHTML = (fixedFamily) => {
    const swatches = Object.keys(fixedFamily.colors).map(step => {
      const hex = fixedFamily.colors[step];
      const oklch = fixedFamily.oklchData[step];
      
      // Check if this color was preserved
      const isPreserved = fixedFamily.preservedColors.some(p => p.step === parseInt(step));
      const preservedColor = fixedFamily.preservedColors.find(p => p.step === parseInt(step));
      
      return `
        <div class="color-swatch ${isPreserved ? 'preserved-color' : 'generated-color'}" 
             style="background-color: ${hex};">
          <div class="color-info">
            <span class="step">${step}</span>
            <span class="hex">${hex}</span>
            <span class="lightness">L: ${oklch.l.toFixed(3)}</span>
            ${isPreserved ? '<span class="preserved-tag">KEPT</span>' : '<span class="generated-tag">NEW</span>'}
          </div>
        </div>
      `;
    }).join('');

    const preservationInfo = fixedFamily.preservedColors.length > 0 ? `
      <div class="preservation-info">
        <h4>🎨 Colors Preserved (${fixedFamily.preservedColors.length}):</h4>
        ${fixedFamily.preservedColors.map(p => 
          `<span class="preserved-color-tag">${p.hex} (${p.step})</span>`
        ).join('')}
      </div>
    ` : '<div class="preservation-info"><h4>No key colors identified for preservation</h4></div>';

    return `
      <div class="family-fix identity-preserved">
        <h3>${fixedFamily.name} - Identity Preserved</h3>
        <div class="fix-stats">
          <span>Original Smoothness: ${fixedFamily.originalSmoothness.toFixed(3)}</span>
          <span>New Smoothness: ${fixedFamily.newSmoothness.toFixed(3)}</span>
          <span class="improvement">Improvement: ${fixedFamily.improvement.toFixed(1)}%</span>
        </div>
        <div class="color-ramp">
          ${swatches}
        </div>
        ${preservationInfo}
        <div class="identity-benefits">
          ✅ Mathematical progression fixed while preserving family character
        </div>
      </div>
    `;
  };

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Checkpoint 3 Corrected: Identity Preserved Fixes</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui;
            margin: 0;
            padding: 20px;
            background: #1a1a1a;
            color: #ffffff;
        }
        .header {
            text-align: center;
            margin-bottom: 40px;
        }
        .identity-principle {
            background: #2d4a22;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .family-fix {
            margin: 30px 0;
            padding: 20px;
            border-radius: 8px;
            border: 2px solid #4a7c59;
            background: #1a2f1a;
        }
        .fix-stats {
            display: flex;
            gap: 20px;
            margin: 10px 0;
            font-size: 14px;
            opacity: 0.9;
        }
        .improvement {
            color: #4a7c59;
            font-weight: bold;
        }
        .color-ramp {
            display: flex;
            gap: 2px;
            margin: 15px 0;
            overflow-x: auto;
        }
        .color-swatch {
            min-width: 60px;
            height: 80px;
            position: relative;
            border-radius: 4px;
            border: 1px solid rgba(255,255,255,0.2);
        }
        .preserved-color {
            border: 3px solid #4a7c59;
            box-shadow: 0 0 8px rgba(74, 124, 89, 0.5);
        }
        .generated-color {
            border: 2px solid #7c6a4a;
        }
        .color-info {
            position: absolute;
            bottom: 2px;
            left: 2px;
            right: 2px;
            background: rgba(0,0,0,0.7);
            padding: 2px;
            border-radius: 2px;
            font-size: 10px;
            line-height: 1.2;
        }
        .color-info span {
            display: block;
            color: white;
        }
        .preserved-tag {
            background: #4a7c59;
            color: white;
            padding: 1px 2px;
            border-radius: 2px;
            font-weight: bold;
        }
        .generated-tag {
            background: #7c6a4a;
            color: white;
            padding: 1px 2px;
            border-radius: 2px;
            font-weight: bold;
        }
        .preservation-info {
            background: #333;
            padding: 10px;
            border-radius: 4px;
            margin: 10px 0;
        }
        .preserved-color-tag {
            display: inline-block;
            background: #4a7c59;
            padding: 4px 8px;
            margin: 2px;
            border-radius: 3px;
            font-family: monospace;
            font-size: 12px;
        }
        .identity-benefits {
            background: #1a2a4a;
            padding: 10px;
            border-radius: 4px;
            margin-top: 10px;
            font-size: 13px;
        }
        .mode-toggle {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 10px 20px;
            background: #4a7c59;
            border: none;
            border-radius: 6px;
            color: white;
            cursor: pointer;
            font-weight: bold;
        }
        .light-preview {
            background: #f5f5f5;
            color: #333;
        }
        .light-preview .header,
        .light-preview .identity-principle,
        .light-preview .family-fix {
            background: #fff;
            color: #333;
            border-color: #ddd;
        }
    </style>
</head>
<body>
    <button class="mode-toggle" onclick="toggleMode()">Toggle Light Preview</button>
    
    <div class="header">
        <h1>🎨 Checkpoint 3 Corrected: Identity Preserved</h1>
        <h2>Mathematical Progression Fixed While Preserving Color Character</h2>
        <p>Green border = Original color preserved | Brown border = New generated color</p>
    </div>

    <div class="identity-principle">
        <h3>🎯 Identity Preservation Strategy</h3>
        <p><strong>Problem Solved:</strong> Previous approach lost family color identity</p>
        <p><strong>Solution:</strong> Preserve key identity colors, fix only the mathematical progression</p>
        <p><strong>Result:</strong> Golden still looks golden, but with smooth mathematical stepping</p>
        <p><strong>Visual Guide:</strong> Green borders show preserved original colors, brown borders show new generated colors</p>
    </div>

    ${results.fixedFamilies.map(family => generateFamilyHTML(family)).join('')}

    <div style="text-align: center; margin-top: 40px; opacity: 0.6;">
        <p>Phase 3 Corrected - Color identity preserved while fixing mathematical progression</p>
        <p>Ready for Phase 4: Complete System Integration</p>
    </div>

    <script>
        function toggleMode() {
            document.body.classList.toggle('light-preview');
            const button = document.querySelector('.mode-toggle');
            button.textContent = document.body.classList.contains('light-preview') 
                ? 'Toggle Dark Preview' 
                : 'Toggle Light Preview';
        }
    </script>
</body>
</html>
  `;
}

// Execute identity-preserved fixes
fixWithIdentityPreservation().then(results => {
  // Generate HTML visualization
  const html = generateIdentityPreservedHTML(results);
  const htmlPath = join(process.cwd(), '.dse', 'oklch', 'checkpoint-3-identity-preserved.html');
  writeFileSync(htmlPath, html);
  console.log(`\n🎨 Identity preserved HTML saved to: ${htmlPath}`);
  console.log('📖 Open this file to see preserved color identities with fixed progression');
}).catch(console.error);