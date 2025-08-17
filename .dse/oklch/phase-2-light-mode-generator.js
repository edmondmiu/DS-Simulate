/**
 * Phase 2: Light Mode Companion Generator
 * Uses Amber's proven 0.2→0.98 lightness range as mathematical foundation
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { oklch, formatHex } from 'culori';

const OPTIMAL_LIGHTNESS_RANGE = {
  min: 0.2,   // Dark enough for proper dark mode
  max: 0.98   // Light enough for proper light mode
};

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

function generateOptimalLightnessProgression() {
  // Generate 14 steps (0-1300) with optimal 0.2→0.98 distribution
  const steps = 14;
  const progression = [];
  
  for (let i = 0; i < steps; i++) {
    const progress = i / (steps - 1);
    const lightness = OPTIMAL_LIGHTNESS_RANGE.min + 
                     (progress * (OPTIMAL_LIGHTNESS_RANGE.max - OPTIMAL_LIGHTNESS_RANGE.min));
    progression.push(Math.round(lightness * 1000) / 1000);
  }
  
  return progression;
}

function generateLightModeCompanion(darkModeFamily, optimalProgression) {
  const lightModeFamily = {
    name: `${darkModeFamily.name}-Light`,
    colors: {},
    oklchData: {}
  };

  // Extract the average hue and chroma characteristics from dark mode family
  const hues = Object.values(darkModeFamily.oklchData).map(color => color.h);
  const chromas = Object.values(darkModeFamily.oklchData).map(color => color.c);
  
  // Calculate base characteristics (median values for stability)
  const baseHue = hues.sort((a, b) => a - b)[Math.floor(hues.length / 2)];
  const baseChroma = chromas.sort((a, b) => a - b)[Math.floor(chromas.length / 2)];

  // Generate light mode colors with optimal lightness progression
  const steps = [0, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200, 1300];
  
  steps.forEach((step, index) => {
    // Use optimal lightness progression
    const lightness = optimalProgression[index];
    
    // Apply chroma variation based on lightness (more chroma in mid-tones)
    let chroma = baseChroma;
    if (lightness < 0.3 || lightness > 0.9) {
      // Reduce chroma in very dark or very light colors
      chroma = baseChroma * 0.6;
    } else if (lightness >= 0.4 && lightness <= 0.7) {
      // Enhance chroma in mid-tones for vibrancy
      chroma = baseChroma * 1.2;
    }
    
    const oklchColor = {
      l: lightness,
      c: Math.round(chroma * 10000) / 10000,
      h: baseHue
    };
    
    try {
      const hexColor = oklchToHex(oklchColor);
      lightModeFamily.colors[step.toString()] = hexColor;
      lightModeFamily.oklchData[step.toString()] = oklchColor;
    } catch (error) {
      console.warn(`Failed to generate ${lightModeFamily.name} ${step}:`, error);
    }
  });

  return lightModeFamily;
}

async function generateLightModeCompanions() {
  console.log('🌅 Phase 2: Generating Light Mode Companions\n');
  console.log(`📐 Using optimal lightness range: ${OPTIMAL_LIGHTNESS_RANGE.min} → ${OPTIMAL_LIGHTNESS_RANGE.max}`);

  // Load previous analysis
  const analysisPath = join(process.cwd(), '.dse', 'oklch', 'phase-1-pattern-analysis.json');
  const analysis = JSON.parse(readFileSync(analysisPath, 'utf8'));

  // Generate optimal lightness progression
  const optimalProgression = generateOptimalLightnessProgression();
  console.log('✨ Optimal lightness progression:', optimalProgression.map(l => l.toFixed(3)).join(' → '));

  const results = {
    optimalProgression,
    lightnessRange: OPTIMAL_LIGHTNESS_RANGE,
    darkModePreserved: [],
    lightModeGenerated: []
  };

  // Generate light mode companions for good families
  console.log('\n🎨 Generating Light Mode Companions:');
  
  for (const darkFamily of analysis.goodFamilies) {
    // Preserve as dark mode
    const darkModeFamily = {
      ...darkFamily,
      name: `${darkFamily.name}-Dark`
    };
    results.darkModePreserved.push(darkModeFamily);
    
    // Generate light mode companion
    const lightModeFamily = generateLightModeCompanion(darkFamily, optimalProgression);
    results.lightModeGenerated.push(lightModeFamily);
    
    console.log(`✅ ${darkFamily.name}:`);
    console.log(`   Dark: ${darkFamily.name}-Dark (preserved original)`);
    console.log(`   Light: ${lightModeFamily.name} (generated with optimal range)`);
  }

  // Save results
  const outputPath = join(process.cwd(), '.dse', 'oklch', 'phase-2-light-mode-generation.json');
  writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log(`\n💾 Light mode generation saved to: ${outputPath}`);

  return results;
}

function generatePhase2HTML(results) {
  const generateComparisonHTML = (darkFamily, lightFamily) => {
    const generateSwatchRow = (family, isDark) => {
      const swatches = Object.keys(family.colors).map(step => {
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

      return `
        <div class="color-family ${isDark ? 'dark-mode' : 'light-mode'}">
          <h4>${family.name}</h4>
          <div class="color-ramp">
            ${swatches}
          </div>
        </div>
      `;
    };

    return `
      <div class="family-comparison">
        <h3>${darkFamily.name.replace('-Dark', '')} Family</h3>
        ${generateSwatchRow(darkFamily, true)}
        ${generateSwatchRow(lightFamily, false)}
        <div class="comparison-stats">
          <div>Dark Range: ${darkFamily.oklchData['0'].l.toFixed(3)} → ${darkFamily.oklchData['1300'].l.toFixed(3)}</div>
          <div>Light Range: ${lightFamily.oklchData['0'].l.toFixed(3)} → ${lightFamily.oklchData['1300'].l.toFixed(3)}</div>
          <div>Coverage: Both modes have full 0-1300 gentle gradations</div>
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
    <title>Checkpoint 2: Light Mode Generation - Dual-Mode Color System</title>
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
        .optimal-range {
            background: #2d4a22;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .family-comparison {
            margin: 40px 0;
            padding: 20px;
            border: 2px solid #4a7c59;
            border-radius: 8px;
            background: #1a2f1a;
        }
        .color-family {
            margin: 20px 0;
            padding: 15px;
            border-radius: 6px;
        }
        .dark-mode {
            background: #2a2a2a;
            border: 1px solid #555;
        }
        .light-mode {
            background: #3a3a3a;
            border: 1px solid #666;
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
        .comparison-stats {
            background: #333;
            padding: 10px;
            border-radius: 4px;
            margin-top: 10px;
            font-size: 14px;
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
        .mode-toggle:hover {
            background: #5a8c69;
        }
        .light-preview {
            background: #f5f5f5;
            color: #333;
        }
        .light-preview .header,
        .light-preview .optimal-range,
        .light-preview .family-comparison {
            background: #fff;
            color: #333;
            border-color: #ddd;
        }
        .light-preview .dark-mode {
            background: #f0f0f0;
            border-color: #ccc;
        }
        .light-preview .light-mode {
            background: #e8e8e8;
            border-color: #bbb;
        }
    </style>
</head>
<body>
    <button class="mode-toggle" onclick="toggleMode()">Toggle Light Preview</button>
    
    <div class="header">
        <h1>🌅 Checkpoint 2: Light Mode Generation</h1>
        <h2>Dual-Mode Color System with Optimal 0.2→0.98 Range</h2>
        <p>Generated light mode companions using proven dark mode mathematics</p>
    </div>

    <div class="optimal-range">
        <h3>🎯 Optimal Lightness Range Applied</h3>
        <p><strong>Range:</strong> ${results.lightnessRange.min} → ${results.lightnessRange.max} (perfect for both modes)</p>
        <p><strong>Progression:</strong> ${results.optimalProgression.map(l => l.toFixed(3)).join(' → ')}</p>
        <p><strong>Benefits:</strong> Dark enough for proper dark mode (0.2), light enough for proper light mode (0.98)</p>
    </div>

    ${results.darkModePreserved.map((darkFamily, index) => 
      generateComparisonHTML(darkFamily, results.lightModeGenerated[index])
    ).join('')}

    <div style="text-align: center; margin-top: 40px; opacity: 0.6;">
        <p>Phase 2 Complete - Ready for Phase 3: Problem Family Fixes</p>
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

// Execute generation
generateLightModeCompanions().then(results => {
  // Generate HTML visualization
  const html = generatePhase2HTML(results);
  const htmlPath = join(process.cwd(), '.dse', 'oklch', 'checkpoint-2-light-mode-generation.html');
  writeFileSync(htmlPath, html);
  console.log(`\n🎨 Checkpoint 2 HTML visualization saved to: ${htmlPath}`);
  console.log('📖 Open this file in your browser to review the dual-mode color system');
}).catch(console.error);