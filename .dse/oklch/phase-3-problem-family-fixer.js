/**
 * Phase 3: Problem Family Fixer
 * Applies proven mathematical progression to problematic families
 * Reverses NeutralLight and aligns all families with our established patterns
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

function extractFamilyCharacteristics(family) {
  // Extract core hue and chroma characteristics from existing family
  const oklchValues = Object.values(family.oklchData);
  
  // Get median hue and chroma for stability
  const hues = oklchValues.map(c => c.h).sort((a, b) => a - b);
  const chromas = oklchValues.map(c => c.c).sort((a, b) => a - b);
  
  const medianHue = hues[Math.floor(hues.length / 2)];
  const medianChroma = chromas[Math.floor(chromas.length / 2)];
  
  return {
    baseHue: medianHue,
    baseChroma: medianChroma,
    chromaRange: { min: Math.min(...chromas), max: Math.max(...chromas) }
  };
}

function generateOptimalProgression(targetRange = { min: 0.2, max: 0.98 }) {
  // Use Tiger Orange's proven progression pattern (smoothest from Phase 1)
  const provenStepDifferences = [
    0.050, 0.050, 0.059, 0.081, 0.077, 0.063, 0.075, 0.047, 0.071, 0.037, 0.016, 0.015, 0.010
  ];
  
  // Scale to our target range
  const totalOriginalRange = provenStepDifferences.reduce((sum, diff) => sum + diff, 0);
  const targetTotalRange = targetRange.max - targetRange.min;
  const scalingFactor = targetTotalRange / totalOriginalRange;
  
  const progression = [targetRange.min];
  for (const diff of provenStepDifferences) {
    const scaledDiff = diff * scalingFactor;
    const nextLightness = progression[progression.length - 1] + scaledDiff;
    progression.push(Math.round(nextLightness * 1000) / 1000);
  }
  
  return {
    progression,
    scalingFactor,
    stepDifferences: provenStepDifferences.map(d => d * scalingFactor)
  };
}

function fixProblematicFamily(family, isReversed = false) {
  const fixedFamily = {
    name: family.name,
    colors: {},
    oklchData: {},
    fixType: isReversed ? 'reversed_and_optimized' : 'progression_fixed',
    originalSmoothness: family.consistency.smoothness
  };

  // Extract family characteristics
  const characteristics = extractFamilyCharacteristics(family);
  
  // Generate optimal progression
  const optimal = generateOptimalProgression();
  let lightnesses = optimal.progression;
  
  // Reverse if needed (for NeutralLight)
  if (isReversed) {
    lightnesses = [...lightnesses].reverse();
    fixedFamily.fixType = 'reversed_and_optimized';
  }
  
  console.log(`\n🔧 Fixing ${family.name}:`);
  console.log(`   Original smoothness: ${family.consistency.smoothness.toFixed(3)}`);
  console.log(`   Base hue: ${characteristics.baseHue.toFixed(1)}°`);
  console.log(`   Base chroma: ${characteristics.baseChroma.toFixed(3)}`);
  console.log(`   Fix type: ${fixedFamily.fixType}`);

  const steps = [0, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200, 1300];
  
  steps.forEach((step, index) => {
    const lightness = lightnesses[index];
    
    // Apply chroma variation based on lightness for natural appearance
    let chroma = characteristics.baseChroma;
    
    // Special handling for neutral families (very low chroma)
    if (characteristics.baseChroma < 0.02) {
      // Keep very low chroma for neutrals, slight variation for depth
      chroma = Math.max(0.001, characteristics.baseChroma * (0.8 + 0.4 * Math.sin(index * 0.5)));
    } else {
      // For color families, vary chroma based on lightness
      if (lightness < 0.3 || lightness > 0.9) {
        chroma = characteristics.baseChroma * 0.7; // Reduce in extremes
      } else if (lightness >= 0.4 && lightness <= 0.7) {
        chroma = characteristics.baseChroma * 1.1; // Enhance in mid-tones
      }
    }
    
    const oklchColor = {
      l: lightness,
      c: Math.round(chroma * 10000) / 10000,
      h: characteristics.baseHue
    };
    
    try {
      const hexColor = oklchToHex(oklchColor);
      fixedFamily.colors[step.toString()] = hexColor;
      fixedFamily.oklchData[step.toString()] = oklchColor;
    } catch (error) {
      console.warn(`Failed to generate ${family.name} ${step}:`, error);
      // Fallback to original
      fixedFamily.colors[step.toString()] = family.colors[step.toString()];
      fixedFamily.oklchData[step.toString()] = family.oklchData[step.toString()];
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
  
  console.log(`   New smoothness: ${newSmoothness.toFixed(3)} (${fixedFamily.improvement.toFixed(1)}% improvement)`);
  
  return fixedFamily;
}

async function fixProblematicFamilies() {
  console.log('🔧 Phase 3: Fixing Problematic Families\n');
  console.log('🎯 Goal: Apply proven mathematical progression to all problematic families\n');

  // Load previous analyses
  const analysisPath = join(process.cwd(), '.dse', 'oklch', 'phase-1-pattern-analysis.json');
  const analysis = JSON.parse(readFileSync(analysisPath, 'utf8'));
  
  const brandPreservedPath = join(process.cwd(), '.dse', 'oklch', 'phase-2-brand-preserved.json');
  const brandPreserved = JSON.parse(readFileSync(brandPreservedPath, 'utf8'));

  const results = {
    goodFamilies: brandPreserved.darkModePreserved,
    lightModeCompanions: brandPreserved.lightModeGenerated,
    fixedFamilies: [],
    specialHandling: {
      neutralLight: null,
      coolNeutral: null
    }
  };

  console.log('🛠️  Fixing Problematic Families:');
  
  for (const problematicFamily of analysis.problematicFamilies) {
    console.log(`\n📋 Processing: ${problematicFamily.name}`);
    
    let fixedFamily;
    
    if (problematicFamily.name === 'NeutralLight') {
      // Special case: Reverse NeutralLight
      console.log('   🔄 Special handling: Reversing NeutralLight progression');
      fixedFamily = fixProblematicFamily(problematicFamily, true);
      fixedFamily.name = 'Neutral'; // Rename to proper Neutral
      results.specialHandling.neutralLight = fixedFamily;
      
    } else if (problematicFamily.name === 'Cool Neutral') {
      // Special case: Apply same progression as Neutral for consistency
      console.log('   🎯 Special handling: Aligning Cool Neutral with Neutral progression');
      fixedFamily = fixProblematicFamily(problematicFamily, false);
      results.specialHandling.coolNeutral = fixedFamily;
      
    } else {
      // Standard fix: Apply proven progression
      fixedFamily = fixProblematicFamily(problematicFamily, false);
    }
    
    results.fixedFamilies.push(fixedFamily);
    
    console.log(`   ✅ ${problematicFamily.name} fixed and optimized`);
  }

  // Save results
  const outputPath = join(process.cwd(), '.dse', 'oklch', 'phase-3-problem-fixes.json');
  writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log(`\n💾 Problem fixes saved to: ${outputPath}`);

  return results;
}

function generatePhase3HTML(results) {
  const generateFixedFamilyHTML = (fixedFamily) => {
    const swatches = Object.keys(fixedFamily.colors).map(step => {
      const hex = fixedFamily.colors[step];
      const oklch = fixedFamily.oklchData[step];
      return `
        <div class="color-swatch" style="background-color: ${hex};">
          <div class="color-info">
            <span class="step">${step}</span>
            <span class="hex">${hex}</span>
            <span class="lightness">L: ${oklch.l.toFixed(3)}</span>
          </div>
        </div>
      `;
    }).join('');

    const improvementClass = fixedFamily.improvement > 50 ? 'major-improvement' : 
                            fixedFamily.improvement > 20 ? 'good-improvement' : 'minor-improvement';

    return `
      <div class="family-fix ${improvementClass}">
        <h3>${fixedFamily.name} - ${fixedFamily.fixType.replace(/_/g, ' ').toUpperCase()}</h3>
        <div class="fix-stats">
          <span>Original Smoothness: ${fixedFamily.originalSmoothness.toFixed(3)}</span>
          <span>New Smoothness: ${fixedFamily.newSmoothness.toFixed(3)}</span>
          <span class="improvement">Improvement: ${fixedFamily.improvement.toFixed(1)}%</span>
        </div>
        <div class="color-ramp">
          ${swatches}
        </div>
        <div class="fix-benefits">
          ${fixedFamily.fixType === 'reversed_and_optimized' ? 
            '🔄 Reversed progression + Mathematical optimization' :
            '📐 Applied proven mathematical progression from good families'
          }
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
    <title>Checkpoint 3: Problem Family Fixes - Mathematical Consistency Applied</title>
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
        .fix-principle {
            background: #2d4a22;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .family-fix {
            margin: 30px 0;
            padding: 20px;
            border-radius: 8px;
            border: 2px solid #555;
        }
        .major-improvement {
            border-color: #4a7c59;
            background: #1a2f1a;
        }
        .good-improvement {
            border-color: #6a7c4a;
            background: #1f2f1a;
        }
        .minor-improvement {
            border-color: #7c6a4a;
            background: #2f1f1a;
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
        .fix-benefits {
            background: #333;
            padding: 10px;
            border-radius: 4px;
            margin-top: 10px;
            font-size: 13px;
        }
        .special-handling {
            background: #1a2a4a;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
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
        .light-preview .fix-principle,
        .light-preview .family-fix,
        .light-preview .special-handling {
            background: #fff;
            color: #333;
            border-color: #ddd;
        }
    </style>
</head>
<body>
    <button class="mode-toggle" onclick="toggleMode()">Toggle Light Preview</button>
    
    <div class="header">
        <h1>🔧 Checkpoint 3: Problem Family Fixes</h1>
        <h2>Mathematical Consistency Applied to All Families</h2>
        <p>Bringing problematic families up to the proven standard</p>
    </div>

    <div class="fix-principle">
        <h3>🎯 Problem Family Fix Strategy</h3>
        <p><strong>Applied:</strong> Tiger Orange's proven mathematical progression (smoothness: 0.469)</p>
        <p><strong>Target:</strong> Reduce smoothness metric below 0.6 for all families</p>
        <p><strong>Special Cases:</strong> NeutralLight reversed, Cool Neutral aligned with Neutral</p>
        <p><strong>Result:</strong> Consistent gentle gradations across entire design system</p>
    </div>

    ${results.fixedFamilies.map(family => generateFixedFamilyHTML(family)).join('')}

    <div class="special-handling">
        <h3>🎯 Special Handling Results</h3>
        <div><strong>NeutralLight → Neutral:</strong> ${results.specialHandling.neutralLight ? 
          `Reversed and optimized (${results.specialHandling.neutralLight.improvement.toFixed(1)}% improvement)` : 
          'Not processed'}</div>
        <div><strong>Cool Neutral:</strong> ${results.specialHandling.coolNeutral ? 
          `Aligned with Neutral progression (${results.specialHandling.coolNeutral.improvement.toFixed(1)}% improvement)` : 
          'Not processed'}</div>
    </div>

    <div style="text-align: center; margin-top: 40px; opacity: 0.6;">
        <p>Phase 3 Complete - All families now follow proven mathematical progression</p>
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

// Execute problem family fixes
fixProblematicFamilies().then(results => {
  // Generate HTML visualization
  const html = generatePhase3HTML(results);
  const htmlPath = join(process.cwd(), '.dse', 'oklch', 'checkpoint-3-problem-fixes.html');
  writeFileSync(htmlPath, html);
  console.log(`\n🎨 Problem fixes HTML saved to: ${htmlPath}`);
  console.log('📖 Open this file to review the fixed problematic families');
}).catch(console.error);