/**
 * Phase 3 Neutral Fix: Use Neutral Progression for Neutrals, Keep Smart Anchoring for Colors
 * Apply Cool Neutral's proven progression to other neutral families
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

function isNeutralFamily(familyName) {
  return familyName.toLowerCase().includes('neutral') || 
         familyName.toLowerCase().includes('grey') ||
         familyName.toLowerCase().includes('gray');
}

function applyCoolNeutralProgression(family, targetRange = { min: 0.2, max: 0.98 }) {
  // Cool Neutral's proven step differences (smoothness: 0.462)
  const coolNeutralStepDiffs = [
    0.015, 0.054, 0.064, 0.069, 0.075, 0.076, 0.085, 0.073, 0.044, 0.032, 0.029, 0.025, 0.020
  ];
  
  console.log(`\n🔧 Applying Cool Neutral progression to ${family.name}:`);
  
  const fixedFamily = {
    name: family.name,
    colors: {},
    oklchData: {},
    fixType: 'cool_neutral_progression_applied',
    originalSmoothness: family.consistency.smoothness
  };

  // Extract family characteristics (hue and base chroma)
  const allOklch = Object.values(family.oklchData);
  const hues = allOklch.map(c => c.h).sort((a, b) => a - b);
  const chromas = allOklch.map(c => c.c).sort((a, b) => a - b);
  
  // For neutrals, use very low chroma
  let baseHue = hues[Math.floor(hues.length / 2)];
  let baseChroma = Math.max(0.001, chromas[Math.floor(chromas.length / 2)]);
  
  // Special handling for pure neutrals (zero hue/chroma)
  if (family.name === 'NeutralLight' || baseChroma === 0) {
    baseHue = 0;
    baseChroma = 0;
  }
  
  console.log(`   Base characteristics: H:${baseHue.toFixed(1)}° C:${baseChroma.toFixed(4)}`);
  
  // Scale Cool Neutral's progression to our target range
  const totalCoolNeutralRange = coolNeutralStepDiffs.reduce((sum, diff) => sum + diff, 0);
  const targetTotalRange = targetRange.max - targetRange.min;
  const scalingFactor = targetTotalRange / totalCoolNeutralRange;
  
  console.log(`   Scaling factor: ${scalingFactor.toFixed(3)} (${targetRange.min} → ${targetRange.max})`);
  
  // Generate progression using scaled Cool Neutral differences
  const lightnesses = [targetRange.min];
  for (const diff of coolNeutralStepDiffs) {
    const scaledDiff = diff * scalingFactor;
    const nextLightness = lightnesses[lightnesses.length - 1] + scaledDiff;
    lightnesses.push(Math.round(nextLightness * 1000) / 1000);
  }
  
  // Handle reversal for NeutralLight
  if (family.name === 'NeutralLight') {
    lightnesses.reverse();
    fixedFamily.name = 'Neutral'; // Rename to proper Neutral
    fixedFamily.fixType = 'reversed_cool_neutral_progression';
    console.log(`   🔄 Reversed progression for proper Neutral family`);
  }

  const steps = [0, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200, 1300];
  
  steps.forEach((step, index) => {
    const stepStr = step.toString();
    const lightness = lightnesses[index];
    
    // For neutrals, minimal chroma variation
    let chroma = baseChroma;
    if (baseChroma > 0.001) {
      // Very slight chroma variation for depth (but keep it minimal)
      chroma = baseChroma * (0.8 + 0.4 * Math.sin(index * 0.3));
      chroma = Math.max(0.001, chroma);
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
  });

  // Calculate new smoothness
  const newStepDiffs = [];
  for (let i = 1; i < lightnesses.length; i++) {
    newStepDiffs.push(lightnesses[i] - lightnesses[i - 1]);
  }
  
  const avgStep = newStepDiffs.reduce((sum, diff) => sum + diff, 0) / newStepDiffs.length;
  const variance = newStepDiffs.reduce((sum, diff) => sum + Math.pow(diff - avgStep, 2), 0) / newStepDiffs.length;
  const stdDev = Math.sqrt(variance);
  const newSmoothness = stdDev / Math.abs(avgStep);
  
  fixedFamily.newSmoothness = newSmoothness;
  fixedFamily.improvement = ((family.consistency.smoothness - newSmoothness) / family.consistency.smoothness * 100);
  
  console.log(`   📊 Smoothness: ${family.consistency.smoothness.toFixed(3)} → ${newSmoothness.toFixed(3)} (${fixedFamily.improvement.toFixed(1)}% improvement)`);
  console.log(`   🎨 Result: Neutral progression applied with ${baseChroma === 0 ? 'zero' : 'minimal'} chroma`);
  
  return fixedFamily;
}

async function executeNeutralFix() {
  console.log('🔧 Phase 3 Neutral Fix: Proper Progressions for Different Family Types\n');
  console.log('🎯 Strategy: Cool Neutral progression for neutrals, Smart anchoring for colors\n');

  // Load previous results
  const smartAnchoredPath = join(process.cwd(), '.dse', 'oklch', 'phase-3-smart-anchored.json');
  const smartAnchored = JSON.parse(readFileSync(smartAnchoredPath, 'utf8'));
  
  const analysisPath = join(process.cwd(), '.dse', 'oklch', 'phase-1-pattern-analysis.json');
  const analysis = JSON.parse(readFileSync(analysisPath, 'utf8'));

  const results = {
    goodFamilies: smartAnchored.goodFamilies,
    lightModeCompanions: smartAnchored.lightModeCompanions,
    fixedFamilies: [],
    fixStrategy: {}
  };

  console.log('🛠️  Applying Family-Specific Fixes:');
  
  for (const problematicFamily of analysis.problematicFamilies) {
    let fixedFamily;
    
    if (isNeutralFamily(problematicFamily.name)) {
      console.log(`\n📐 Neutral Family: ${problematicFamily.name}`);
      console.log(`   🎯 Strategy: Apply Cool Neutral's proven progression (smoothness: 0.462)`);
      fixedFamily = applyCoolNeutralProgression(problematicFamily);
      results.fixStrategy[problematicFamily.name] = 'cool_neutral_progression';
      
    } else {
      console.log(`\n🎨 Color Family: ${problematicFamily.name}`);
      console.log(`   🎯 Strategy: Keep smart anchoring result (identity + smoothness)`);
      // Find the smart anchored result for this family
      fixedFamily = smartAnchored.smartAnchoredFamilies.find(f => 
        f.name === problematicFamily.name || 
        (problematicFamily.name === 'NeutralLight' && f.name === 'Neutral')
      );
      results.fixStrategy[problematicFamily.name] = 'smart_anchoring';
    }
    
    if (fixedFamily) {
      results.fixedFamilies.push(fixedFamily);
      console.log(`   ✅ ${problematicFamily.name} fixed with appropriate strategy`);
    }
  }

  // Save results
  const outputPath = join(process.cwd(), '.dse', 'oklch', 'phase-3-final-fixes.json');
  writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log(`\n💾 Final fixes saved to: ${outputPath}`);

  return results;
}

function generateFinalFixesHTML(results) {
  const generateFamilyHTML = (fixedFamily) => {
    const isNeutral = isNeutralFamily(fixedFamily.name);
    const strategy = Object.keys(results.fixStrategy).find(key => 
      results.fixStrategy[key] === (isNeutral ? 'cool_neutral_progression' : 'smart_anchoring')
    );

    const swatches = Object.keys(fixedFamily.colors).map(step => {
      const hex = fixedFamily.colors[step];
      const oklch = fixedFamily.oklchData[step];
      
      // Check if this is an anchor color (for smart anchored families)
      const isAnchor = fixedFamily.anchor && parseInt(step) === fixedFamily.anchor.step;
      
      return `
        <div class="color-swatch ${isAnchor ? 'anchor-color' : isNeutral ? 'neutral-color' : 'generated-color'}" 
             style="background-color: ${hex};">
          <div class="color-info">
            <span class="step">${step}</span>
            <span class="hex">${hex}</span>
            <span class="lightness">L: ${oklch.l.toFixed(3)}</span>
            ${isAnchor ? '<span class="anchor-tag">ANCHOR</span>' : 
              isNeutral ? '<span class="neutral-tag">NEUTRAL</span>' : 
              '<span class="smooth-tag">SMOOTH</span>'}
          </div>
        </div>
      `;
    }).join('');

    const strategyInfo = isNeutral ? `
      <div class="strategy-info neutral-strategy">
        📐 Cool Neutral Progression Applied (Smoothness: 0.462 proven pattern)
      </div>
    ` : `
      <div class="strategy-info color-strategy">
        ⚓ Smart Anchoring Applied (Anchor: ${fixedFamily.anchor ? `Step ${fixedFamily.anchor.step} = ${fixedFamily.anchor.hex}` : 'N/A'})
      </div>
    `;

    const smoothnessClass = fixedFamily.improvement > 30 ? 'major-improvement' : 
                           fixedFamily.improvement > 10 ? 'good-improvement' : 'minor-improvement';

    return `
      <div class="family-fix ${isNeutral ? 'neutral-family' : 'color-family'} ${smoothnessClass}">
        <h3>${fixedFamily.name} - ${isNeutral ? 'Neutral Progression' : 'Smart Anchored'}</h3>
        ${strategyInfo}
        <div class="fix-stats">
          <span>Original Smoothness: ${fixedFamily.originalSmoothness.toFixed(3)}</span>
          <span>New Smoothness: ${fixedFamily.newSmoothness.toFixed(3)}</span>
          <span class="improvement">Improvement: ${fixedFamily.improvement.toFixed(1)}%</span>
        </div>
        <div class="color-ramp">
          ${swatches}
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
    <title>Checkpoint 3 Final: Proper Progressions for Each Family Type</title>
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
        .strategy-principle {
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
        .neutral-family {
            border-color: #6a6a7c;
            background: #1a1a2f;
        }
        .color-family {
            border-color: #4a7c59;
            background: #1a2f1a;
        }
        .major-improvement {
            box-shadow: 0 0 8px rgba(74, 124, 89, 0.3);
        }
        .good-improvement {
            box-shadow: 0 0 6px rgba(106, 124, 74, 0.3);
        }
        .strategy-info {
            padding: 8px 12px;
            border-radius: 4px;
            margin: 10px 0;
            font-size: 14px;
            font-weight: bold;
        }
        .neutral-strategy {
            background: #2a2a4a;
            color: #b0b0ff;
        }
        .color-strategy {
            background: #1a2a4a;
            color: #ffd700;
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
        .anchor-color {
            border: 4px solid #ffd700;
            box-shadow: 0 0 12px rgba(255, 215, 0, 0.6);
        }
        .neutral-color {
            border: 2px solid #6a6a7c;
        }
        .generated-color {
            border: 2px solid #4a7c59;
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
        .anchor-tag {
            background: #ffd700;
            color: #000;
            padding: 1px 2px;
            border-radius: 2px;
            font-weight: bold;
        }
        .neutral-tag {
            background: #6a6a7c;
            color: white;
            padding: 1px 2px;
            border-radius: 2px;
            font-weight: bold;
        }
        .smooth-tag {
            background: #4a7c59;
            color: white;
            padding: 1px 2px;
            border-radius: 2px;
            font-weight: bold;
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
        .light-preview .strategy-principle,
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
        <h1>🔧 Checkpoint 3 Final: Proper Progressions Applied</h1>
        <h2>Right Strategy for Each Family Type</h2>
        <p>Purple = Neutral progression | Green = Color family smart anchoring</p>
    </div>

    <div class="strategy-principle">
        <h3>🎯 Family-Specific Strategy</h3>
        <p><strong>Neutral Families:</strong> Cool Neutral's proven progression (smoothness: 0.462)</p>
        <p><strong>Color Families:</strong> Smart anchoring with identity preservation</p>
        <p><strong>Result:</strong> Each family type gets the mathematical progression that works best for it</p>
        <p><strong>Visual Guide:</strong> Purple borders = neutral progression, Green borders = color progression, Gold = preserved anchors</p>
    </div>

    ${results.fixedFamilies.map(family => generateFamilyHTML(family)).join('')}

    <div style="text-align: center; margin-top: 40px; opacity: 0.6;">
        <p>Phase 3 Complete - Proper progressions applied to each family type</p>
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

// Execute neutral fixes
executeNeutralFix().then(results => {
  // Generate HTML visualization
  const html = generateFinalFixesHTML(results);
  const htmlPath = join(process.cwd(), '.dse', 'oklch', 'checkpoint-3-final-fixes.html');
  writeFileSync(htmlPath, html);
  console.log(`\n🎨 Final fixes HTML saved to: ${htmlPath}`);
  console.log('📖 Open this file to see the proper progressions for each family type');
}).catch(console.error);