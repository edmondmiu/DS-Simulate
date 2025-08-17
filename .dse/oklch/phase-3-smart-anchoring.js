/**
 * Phase 3 Smart Anchoring: Hybrid Approach
 * Preserve 1-2 key identity colors and build smooth progression around them
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

function identifySmartAnchor(family) {
  // Find the single most important identity color (usually step 500 or highest chroma)
  let bestAnchor = null;
  let highestScore = 0;
  
  Object.keys(family.colors).forEach(step => {
    const stepNum = parseInt(step);
    const oklch = family.oklchData[step];
    const hex = family.colors[step];
    
    // Scoring system for identity importance
    let score = 0;
    
    // Step 500 is typically the primary brand color
    if (stepNum === 500) score += 50;
    
    // High chroma colors are more distinctive
    score += oklch.c * 100; // Chroma bonus (0-40 points typically)
    
    // Mid-lightness colors are more usable
    if (oklch.l > 0.3 && oklch.l < 0.8) score += 20;
    
    // Slight preference for steps that are good anchor points
    if ([400, 500, 600].includes(stepNum)) score += 10;
    
    if (score > highestScore) {
      highestScore = score;
      bestAnchor = {
        step: stepNum,
        hex: hex,
        oklch: oklch,
        score: score
      };
    }
  });
  
  return bestAnchor;
}

function generateSmoothProgressionAroundAnchor(anchor, targetRange = { min: 0.2, max: 0.98 }) {
  // Use Tiger Orange's proven step differences as the base pattern
  const provenStepDifferences = [
    0.050, 0.050, 0.059, 0.081, 0.077, 0.063, 0.075, 0.047, 0.071, 0.037, 0.016, 0.015, 0.010
  ];
  
  const steps = [0, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200, 1300];
  const anchorIndex = steps.indexOf(anchor.step);
  const anchorLightness = anchor.oklch.l;
  
  console.log(`   Anchor: Step ${anchor.step} = ${anchor.hex} (L:${anchorLightness.toFixed(3)})`);
  
  // Calculate how much room we have on each side of the anchor
  const totalRange = targetRange.max - targetRange.min;
  const stepsBeforeAnchor = anchorIndex;
  const stepsAfterAnchor = steps.length - 1 - anchorIndex;
  
  // Determine the range distribution around the anchor
  let minLightness, maxLightness;
  
  if (anchorLightness < 0.5) {
    // Anchor is dark, give more room above
    const belowRange = (anchorLightness - targetRange.min) * 0.8; // Use 80% of available space below
    const aboveRange = totalRange - belowRange;
    minLightness = anchorLightness - belowRange;
    maxLightness = anchorLightness + aboveRange;
  } else {
    // Anchor is light, give more room below  
    const aboveRange = (targetRange.max - anchorLightness) * 0.8; // Use 80% of available space above
    const belowRange = totalRange - aboveRange;
    minLightness = anchorLightness - belowRange;
    maxLightness = anchorLightness + aboveRange;
  }
  
  // Ensure we stay within target bounds
  minLightness = Math.max(minLightness, targetRange.min);
  maxLightness = Math.min(maxLightness, targetRange.max);
  
  console.log(`   Range: ${minLightness.toFixed(3)} → ${maxLightness.toFixed(3)} (centered around anchor)`);
  
  // Generate progression that flows smoothly through the anchor
  const progression = [];
  
  // Build progression using proven step differences, scaled to fit our range
  const availableRange = maxLightness - minLightness;
  const originalTotalRange = provenStepDifferences.reduce((sum, diff) => sum + diff, 0);
  const scalingFactor = availableRange / originalTotalRange;
  
  // Start from minimum and build up using scaled differences
  let currentLightness = minLightness;
  progression.push(currentLightness);
  
  for (let i = 0; i < provenStepDifferences.length; i++) {
    const scaledDiff = provenStepDifferences[i] * scalingFactor;
    currentLightness += scaledDiff;
    progression.push(Math.round(currentLightness * 1000) / 1000);
  }
  
  // Adjust the progression to ensure the anchor point is exact
  const calculatedAnchorL = progression[anchorIndex];
  const adjustment = anchorLightness - calculatedAnchorL;
  
  // Apply the adjustment gradually across all points
  for (let i = 0; i < progression.length; i++) {
    // Weight the adjustment - more near the anchor, less at the extremes
    const distance = Math.abs(i - anchorIndex);
    const maxDistance = Math.max(anchorIndex, progression.length - 1 - anchorIndex);
    const weight = 1 - (distance / maxDistance) * 0.5; // Reduce influence by distance
    
    progression[i] += adjustment * weight;
    progression[i] = Math.round(progression[i] * 1000) / 1000;
  }
  
  // Ensure the anchor is exactly right
  progression[anchorIndex] = anchorLightness;
  
  return progression;
}

function smartAnchoredFix(family, isReversed = false) {
  console.log(`\n🎯 Smart anchoring fix for ${family.name}:`);
  
  // Identify the smart anchor point
  const anchor = identifySmartAnchor(family);
  if (!anchor) {
    console.log(`   ❌ No suitable anchor found, falling back to standard progression`);
    return null;
  }
  
  console.log(`   🔗 Smart anchor identified (score: ${anchor.score.toFixed(1)}):`);
  
  const fixedFamily = {
    name: family.name,
    colors: {},
    oklchData: {},
    anchor: anchor,
    fixType: isReversed ? 'reversed_smart_anchored' : 'smart_anchored',
    originalSmoothness: family.consistency.smoothness
  };

  // Generate smooth progression around the anchor
  const progression = generateSmoothProgressionAroundAnchor(anchor);
  
  // Reverse if needed (for NeutralLight)
  if (isReversed) {
    progression.reverse();
    fixedFamily.name = 'Neutral'; // Rename NeutralLight to Neutral
  }
  
  // Use anchor's color characteristics as the base
  const baseHue = anchor.oklch.h;
  const baseChroma = anchor.oklch.c;
  
  console.log(`   📐 Base characteristics: H:${baseHue.toFixed(1)}° C:${baseChroma.toFixed(3)}`);

  const steps = [0, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200, 1300];
  
  steps.forEach((step, index) => {
    const stepStr = step.toString();
    const targetLightness = progression[index];
    
    if (step === anchor.step && !isReversed) {
      // Preserve the exact anchor color
      fixedFamily.colors[stepStr] = anchor.hex;
      fixedFamily.oklchData[stepStr] = anchor.oklch;
      console.log(`   ✅ Anchor preserved: Step ${step} = ${anchor.hex}`);
      
    } else {
      // Generate smooth progression color
      let chroma = baseChroma;
      
      // Apply chroma variation based on lightness for natural appearance
      if (family.name.includes('Neutral') || family.name.includes('Grey')) {
        // Very low chroma for neutrals with slight variation
        chroma = Math.max(0.001, baseChroma * (0.7 + 0.6 * Math.sin(index * 0.4)));
      } else {
        // Color families: vary chroma based on lightness
        if (targetLightness < 0.3 || targetLightness > 0.9) {
          chroma = baseChroma * 0.6; // Reduce in extremes
        } else if (targetLightness >= 0.4 && targetLightness <= 0.7) {
          chroma = baseChroma * 1.0; // Maintain in mid-tones
        } else {
          chroma = baseChroma * 0.8; // Slight reduction elsewhere
        }
      }
      
      const oklchColor = {
        l: targetLightness,
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
  
  console.log(`   📊 Smoothness: ${family.consistency.smoothness.toFixed(3)} → ${newSmoothness.toFixed(3)} (${fixedFamily.improvement.toFixed(1)}% improvement)`);
  console.log(`   🎨 Result: 1 anchor preserved, 13 colors generated with smooth progression`);
  
  return fixedFamily;
}

async function executeSmartAnchoring() {
  console.log('🎯 Phase 3 Smart Anchoring: Hybrid Identity + Smoothness\n');
  console.log('🎯 Goal: Preserve key identity color while achieving smooth mathematical progression\n');

  // Load previous analysis
  const analysisPath = join(process.cwd(), '.dse', 'oklch', 'phase-1-pattern-analysis.json');
  const analysis = JSON.parse(readFileSync(analysisPath, 'utf8'));
  
  const brandPreservedPath = join(process.cwd(), '.dse', 'oklch', 'phase-2-brand-preserved.json');
  const brandPreserved = JSON.parse(readFileSync(brandPreservedPath, 'utf8'));

  const results = {
    goodFamilies: brandPreserved.darkModePreserved,
    lightModeCompanions: brandPreserved.lightModeGenerated,
    smartAnchoredFamilies: [],
    anchoringSummary: []
  };

  console.log('⚓ Smart Anchoring Problematic Families:');
  
  for (const problematicFamily of analysis.problematicFamilies) {
    let fixedFamily;
    
    if (problematicFamily.name === 'NeutralLight') {
      console.log(`\n🔄 Special: Reversing ${problematicFamily.name} with smart anchor`);
      fixedFamily = smartAnchoredFix(problematicFamily, true);
      
    } else {
      fixedFamily = smartAnchoredFix(problematicFamily, false);
    }
    
    if (fixedFamily) {
      results.smartAnchoredFamilies.push(fixedFamily);
      results.anchoringSummary.push({
        familyName: fixedFamily.name,
        anchorStep: fixedFamily.anchor.step,
        anchorColor: fixedFamily.anchor.hex,
        anchorScore: fixedFamily.anchor.score,
        smoothnessImprovement: fixedFamily.improvement
      });
      
      console.log(`   ✅ ${problematicFamily.name} smart anchored successfully`);
    }
  }

  // Save results
  const outputPath = join(process.cwd(), '.dse', 'oklch', 'phase-3-smart-anchored.json');
  writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log(`\n💾 Smart anchored results saved to: ${outputPath}`);

  return results;
}

function generateSmartAnchoredHTML(results) {
  const generateFamilyHTML = (fixedFamily) => {
    const swatches = Object.keys(fixedFamily.colors).map(step => {
      const hex = fixedFamily.colors[step];
      const oklch = fixedFamily.oklchData[step];
      
      // Check if this is the anchor color
      const isAnchor = parseInt(step) === fixedFamily.anchor.step;
      
      return `
        <div class="color-swatch ${isAnchor ? 'anchor-color' : 'generated-color'}" 
             style="background-color: ${hex};">
          <div class="color-info">
            <span class="step">${step}</span>
            <span class="hex">${hex}</span>
            <span class="lightness">L: ${oklch.l.toFixed(3)}</span>
            ${isAnchor ? '<span class="anchor-tag">ANCHOR</span>' : '<span class="smooth-tag">SMOOTH</span>'}
          </div>
        </div>
      `;
    }).join('');

    const smoothnessClass = fixedFamily.improvement > 30 ? 'major-improvement' : 
                           fixedFamily.improvement > 10 ? 'good-improvement' : 'minor-improvement';

    return `
      <div class="family-fix smart-anchored ${smoothnessClass}">
        <h3>${fixedFamily.name} - Smart Anchored</h3>
        <div class="anchor-info">
          <span class="anchor-highlight">🎯 Anchor: Step ${fixedFamily.anchor.step} = ${fixedFamily.anchor.hex}</span>
          <span>Score: ${fixedFamily.anchor.score.toFixed(1)}</span>
        </div>
        <div class="fix-stats">
          <span>Original Smoothness: ${fixedFamily.originalSmoothness.toFixed(3)}</span>
          <span>New Smoothness: ${fixedFamily.newSmoothness.toFixed(3)}</span>
          <span class="improvement">Improvement: ${fixedFamily.improvement.toFixed(1)}%</span>
        </div>
        <div class="color-ramp">
          ${swatches}
        </div>
        <div class="smart-benefits">
          ✅ Key identity color preserved with smooth mathematical progression around it
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
    <title>Checkpoint 3 Smart Anchored: Hybrid Identity + Smoothness</title>
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
        .smart-principle {
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
        .anchor-info {
            display: flex;
            gap: 20px;
            align-items: center;
            margin: 10px 0;
            padding: 10px;
            background: #1a2a4a;
            border-radius: 4px;
        }
        .anchor-highlight {
            color: #ffd700;
            font-weight: bold;
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
        .smooth-tag {
            background: #4a7c59;
            color: white;
            padding: 1px 2px;
            border-radius: 2px;
            font-weight: bold;
        }
        .smart-benefits {
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
        .light-preview .smart-principle,
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
        <h1>🎯 Checkpoint 3 Smart Anchored</h1>
        <h2>Hybrid Identity + Smoothness Solution</h2>
        <p>Gold border = Identity anchor preserved | Green border = Smooth progression generated</p>
    </div>

    <div class="smart-principle">
        <h3>⚓ Smart Anchoring Strategy</h3>
        <p><strong>Hybrid Solution:</strong> Preserve 1 key identity color, build smooth progression around it</p>
        <p><strong>Anchor Selection:</strong> Usually step 500 (brand color) or highest chroma color</p>
        <p><strong>Mathematical Flow:</strong> Tiger Orange's proven progression, scaled around the anchor</p>
        <p><strong>Result:</strong> Family identity maintained with smooth mathematical stepping</p>
    </div>

    ${results.smartAnchoredFamilies.map(family => generateFamilyHTML(family)).join('')}

    <div style="text-align: center; margin-top: 40px; opacity: 0.6;">
        <p>Phase 3 Complete - Smart anchoring achieved hybrid identity + smoothness</p>
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

// Execute smart anchoring
executeSmartAnchoring().then(results => {
  // Generate HTML visualization
  const html = generateSmartAnchoredHTML(results);
  const htmlPath = join(process.cwd(), '.dse', 'oklch', 'checkpoint-3-smart-anchored.html');
  writeFileSync(htmlPath, html);
  console.log(`\n🎨 Smart anchored HTML saved to: ${htmlPath}`);
  console.log('📖 Open this file to see the hybrid identity + smoothness solution');
}).catch(console.error);