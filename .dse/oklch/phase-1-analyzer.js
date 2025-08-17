/**
 * Phase 1: Pattern Analyzer for Dark Mode Color Families
 * Extracts OKLCH lightness stepping mathematics from proven "good" families
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { oklch } from 'culori';

const GOOD_FAMILIES = [
  'Amber', 'Red', 'Green', 'Yellow', 'Royal Blue', 'Mint', 'Tiger Orange'
];

const PROBLEMATIC_FAMILIES = [
  'Cool Neutral', 'NeutralLight', 'Golden', 'Crimson', 'Forest Green', 'Ocean Blue', 'Cool Grey'
];

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

function extractStepNumber(colorKey) {
  const match = colorKey.match(/(\d+)$/);
  return match ? parseInt(match[1]) : null;
}

function extractColorFamily(tokens, familyName) {
  const colorRamp = tokens['Color Ramp'];
  if (!colorRamp || !colorRamp[familyName]) {
    return null;
  }

  const family = colorRamp[familyName];
  const colors = {};
  const oklchData = {};
  
  // Extract colors and convert to OKLCH
  Object.keys(family).forEach(colorKey => {
    const colorData = family[colorKey];
    if (colorData && colorData.$value) {
      const step = extractStepNumber(colorKey);
      if (step !== null) {
        colors[step.toString()] = colorData.$value;
        try {
          oklchData[step.toString()] = hexToOKLCH(colorData.$value);
        } catch (error) {
          console.warn(`Failed to convert ${familyName} ${colorKey} to OKLCH:`, error);
        }
      }
    }
  });

  // Calculate lightness progression
  const steps = Object.keys(oklchData).map(s => parseInt(s)).sort((a, b) => a - b);
  const lightnessProgression = steps.map(step => oklchData[step.toString()].l);
  
  // Calculate step differences
  const stepDifferences = [];
  for (let i = 1; i < lightnessProgression.length; i++) {
    stepDifferences.push(lightnessProgression[i] - lightnessProgression[i - 1]);
  }

  // Calculate consistency metrics
  const averageStepSize = stepDifferences.reduce((sum, diff) => sum + diff, 0) / stepDifferences.length;
  const variance = stepDifferences.reduce((sum, diff) => sum + Math.pow(diff - averageStepSize, 2), 0) / stepDifferences.length;
  const standardDeviation = Math.sqrt(variance);
  const smoothness = standardDeviation / Math.abs(averageStepSize);

  return {
    name: familyName,
    colors,
    oklchData,
    lightnessProgression,
    stepDifferences,
    consistency: {
      averageStepSize,
      standardDeviation,
      smoothness
    }
  };
}

async function analyzePatterns() {
  console.log('🔍 Phase 1: Analyzing Dark Mode Color Pattern Mathematics\n');

  // Load tokens
  const tokensPath = join(process.cwd(), 'tokens', 'core.json');
  const tokens = JSON.parse(readFileSync(tokensPath, 'utf8'));

  const goodFamilies = [];
  const problematicFamilies = [];

  // Analyze good families
  console.log('📊 Analyzing "Good" Dark Mode Families:');
  for (const familyName of GOOD_FAMILIES) {
    const family = extractColorFamily(tokens, familyName);
    if (family) {
      goodFamilies.push(family);
      console.log(`✅ ${familyName}: ${family.lightnessProgression.length} colors, smoothness: ${family.consistency.smoothness.toFixed(3)}`);
    } else {
      console.log(`❌ ${familyName}: Not found`);
    }
  }

  // Analyze problematic families
  console.log('\n🔧 Analyzing Problematic Families:');
  for (const familyName of PROBLEMATIC_FAMILIES) {
    const family = extractColorFamily(tokens, familyName);
    if (family) {
      problematicFamilies.push(family);
      console.log(`⚠️  ${familyName}: ${family.lightnessProgression.length} colors, smoothness: ${family.consistency.smoothness.toFixed(3)}`);
    } else {
      console.log(`❌ ${familyName}: Not found`);
    }
  }

  // Calculate ideal stepping pattern from good families
  const allStepSizes = goodFamilies.flatMap(family => family.stepDifferences);
  const idealAverageStepSize = allStepSizes.reduce((sum, step) => sum + step, 0) / allStepSizes.length;
  
  // Find the most consistent family as the mathematical template
  const mostConsistent = goodFamilies.reduce((best, current) => 
    current.consistency.smoothness < best.consistency.smoothness ? current : best
  );

  console.log(`\n🎯 Mathematical Foundation: ${mostConsistent.name} (smoothness: ${mostConsistent.consistency.smoothness.toFixed(3)})`);
  console.log(`📐 Ideal Average Step Size: ${idealAverageStepSize.toFixed(4)}`);

  const analysis = {
    goodFamilies,
    idealSteppingPattern: {
      averageStepSize: idealAverageStepSize,
      optimalProgression: mostConsistent.lightnessProgression,
      mathematicalFormula: `L(step) = ${mostConsistent.lightnessProgression[0].toFixed(3)} + step * ${idealAverageStepSize.toFixed(4)}`
    },
    problematicFamilies,
    recommendations: [
      `Use ${mostConsistent.name} as mathematical template for consistency`,
      `Apply average step size of ${idealAverageStepSize.toFixed(4)} for smooth progressions`,
      `Target smoothness metric below ${mostConsistent.consistency.smoothness.toFixed(3)} for all families`,
      `Preserve hue and chroma characteristics while applying consistent lightness stepping`
    ]
  };

  // Save analysis
  const outputPath = join(process.cwd(), '.dse', 'oklch', 'phase-1-pattern-analysis.json');
  writeFileSync(outputPath, JSON.stringify(analysis, null, 2));
  console.log(`\n💾 Pattern analysis saved to: ${outputPath}`);

  return analysis;
}

function generateHTMLVisualization(analysis) {
  const generateFamilyHTML = (family, isGood) => {
    const swatchesHTML = Object.keys(family.colors).map(step => {
      const hex = family.colors[step];
      const oklch = family.oklchData[step];
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

    const stepDiffsHTML = family.stepDifferences.map((diff, i) => 
      `<span class="step-diff ${Math.abs(diff - analysis.idealSteppingPattern.averageStepSize) > 0.01 ? 'irregular' : 'good'}">${diff.toFixed(4)}</span>`
    ).join('');

    return `
      <div class="family-analysis ${isGood ? 'good-family' : 'problematic-family'}">
        <h3>${family.name} ${isGood ? '✅' : '⚠️'}</h3>
        <div class="family-stats">
          <span>Smoothness: ${family.consistency.smoothness.toFixed(3)}</span>
          <span>Avg Step: ${family.consistency.averageStepSize.toFixed(4)}</span>
          <span>Std Dev: ${family.consistency.standardDeviation.toFixed(4)}</span>
        </div>
        <div class="color-ramp">
          ${swatchesHTML}
        </div>
        <div class="step-differences">
          <strong>Step Differences:</strong> ${stepDiffsHTML}
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
    <title>Checkpoint 1: Pattern Analysis - Dark Mode Color Mathematics</title>
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
        .ideal-pattern {
            background: #2d4a22;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .family-analysis {
            margin: 30px 0;
            padding: 20px;
            border-radius: 8px;
            border: 2px solid #333;
        }
        .good-family {
            border-color: #4a7c59;
            background: #1a2f1a;
        }
        .problematic-family {
            border-color: #7c4a4a;
            background: #2f1a1a;
        }
        .family-stats {
            display: flex;
            gap: 20px;
            margin: 10px 0;
            font-size: 14px;
            opacity: 0.8;
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
        .step-differences {
            font-size: 12px;
            margin-top: 10px;
        }
        .step-diff {
            display: inline-block;
            padding: 2px 4px;
            margin: 1px;
            border-radius: 3px;
            background: #333;
        }
        .step-diff.good {
            background: #2d4a22;
        }
        .step-diff.irregular {
            background: #4a2d22;
        }
        .recommendations {
            background: #1a2a4a;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .recommendations ul {
            margin: 0;
            padding-left: 20px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🔍 Checkpoint 1: Pattern Analysis</h1>
        <h2>Dark Mode Color Mathematics Extraction</h2>
        <p>Analyzing proven "good" dark mode color families to extract mathematical stepping patterns</p>
    </div>

    <div class="ideal-pattern">
        <h3>🎯 Extracted Mathematical Pattern</h3>
        <p><strong>Formula:</strong> ${analysis.idealSteppingPattern.mathematicalFormula}</p>
        <p><strong>Ideal Step Size:</strong> ${analysis.idealSteppingPattern.averageStepSize.toFixed(4)}</p>
        <p><strong>Template Range:</strong> ${analysis.idealSteppingPattern.optimalProgression[0].toFixed(3)} → ${analysis.idealSteppingPattern.optimalProgression[analysis.idealSteppingPattern.optimalProgression.length - 1].toFixed(3)}</p>
    </div>

    <h2>✅ "Good" Dark Mode Families</h2>
    <p>These families demonstrate the ideal mathematical stepping pattern:</p>
    ${analysis.goodFamilies.map(family => generateFamilyHTML(family, true)).join('')}

    <h2>⚠️ Problematic Families</h2>
    <p>These families need adjustment to match the proven mathematical pattern:</p>
    ${analysis.problematicFamilies.map(family => generateFamilyHTML(family, false)).join('')}

    <div class="recommendations">
        <h3>📋 Recommendations</h3>
        <ul>
            ${analysis.recommendations.map(rec => `<li>${rec}</li>`).join('')}
        </ul>
    </div>

    <div style="text-align: center; margin-top: 40px; opacity: 0.6;">
        <p>Phase 1 Complete - Ready for Phase 2: Light Mode Generation</p>
    </div>
</body>
</html>
  `;
}

// Execute analysis
analyzePatterns().then(analysis => {
  // Generate HTML visualization
  const html = generateHTMLVisualization(analysis);
  const htmlPath = join(process.cwd(), '.dse', 'oklch', 'checkpoint-1-pattern-analysis.html');
  writeFileSync(htmlPath, html);
  console.log(`\n🎨 Checkpoint 1 HTML visualization saved to: ${htmlPath}`);
  console.log('📖 Open this file in your browser to visually review the pattern analysis');
}).catch(console.error);