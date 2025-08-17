/**
 * Phase 2 Brand Preserved: Light Mode with Brand Color Preservation
 * Ensures key brand colors like #ffd24d are available in both modes
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

function identifyBrandColors(family) {
  // Key brand colors are typically at 500 level and any with high chroma
  const brandColors = [];
  
  Object.keys(family.colors).forEach(step => {
    const stepNum = parseInt(step);
    const oklch = family.oklchData[step];
    
    // Brand colors are typically:
    // 1. Step 500 (primary brand color)
    // 2. High chroma colors (c > 0.1)
    // 3. Mid-lightness range (0.4-0.8) for usability
    if (stepNum === 500 || 
        (oklch.c > 0.1 && oklch.l > 0.4 && oklch.l < 0.8)) {
      brandColors.push({
        step: stepNum,
        hex: family.colors[step],
        oklch: oklch,
        isBrandPrimary: stepNum === 500
      });
    }
  });
  
  return brandColors;
}

function generateBrandPreservedLightMode(darkModeFamily, targetRange = { min: 0.2, max: 0.98 }) {
  const lightModeFamily = {
    name: `${darkModeFamily.name.replace('-Dark', '')}-Light`,
    colors: {},
    oklchData: {},
    preservedBrandColors: []
  };

  // Identify brand colors to preserve
  const brandColors = identifyBrandColors(darkModeFamily);
  console.log(`\n🎨 ${darkModeFamily.name} brand colors identified:`);
  brandColors.forEach(brand => {
    console.log(`   Step ${brand.step}: ${brand.hex} (${brand.isBrandPrimary ? 'PRIMARY' : 'secondary'}) - L:${brand.oklch.l.toFixed(3)} C:${brand.oklch.c.toFixed(3)}`);
  });

  // Create dual-mode approach: preserve brand colors in both modes
  const steps = [0, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200, 1300];
  
  // Extract family characteristics
  const allOklch = Object.values(darkModeFamily.oklchData);
  const baseHue = allOklch.reduce((sum, color) => sum + color.h, 0) / allOklch.length;
  
  steps.forEach(step => {
    const stepStr = step.toString();
    const originalOklch = darkModeFamily.oklchData[stepStr];
    
    // Check if this is a brand color that should be preserved
    const brandColor = brandColors.find(b => b.step === step);
    
    if (brandColor && brandColor.isBrandPrimary) {
      // Preserve primary brand colors (like Amber 500 #ffd24d) in light mode
      lightModeFamily.colors[stepStr] = brandColor.hex;
      lightModeFamily.oklchData[stepStr] = { ...brandColor.oklch };
      lightModeFamily.preservedBrandColors.push(brandColor);
      console.log(`   ✅ Preserved brand color: Step ${step} = ${brandColor.hex}`);
      
    } else {
      // Generate complementary colors for other steps
      // Use the scaled progression but adapt around preserved brand colors
      
      // Calculate target lightness for this step
      const stepIndex = steps.indexOf(step);
      const totalSteps = steps.length - 1;
      const progress = stepIndex / totalSteps;
      
      // Create a gentle progression that works well with preserved brand colors
      let targetLightness;
      
      if (step < 500) {
        // For steps before 500, create a gentle progression to brand color
        const brandL = brandColors.find(b => b.isBrandPrimary)?.oklch.l || 0.8;
        targetLightness = targetRange.min + (progress * (brandL - targetRange.min));
      } else {
        // For steps after 500, create a gentle progression from brand color
        const brandL = brandColors.find(b => b.isBrandPrimary)?.oklch.l || 0.8;
        const remainingProgress = (stepIndex - 5) / (totalSteps - 5); // 5 = index of step 500
        targetLightness = brandL + (remainingProgress * (targetRange.max - brandL));
      }
      
      // Preserve original chroma characteristics but adapt to lightness
      let targetChroma = originalOklch.c;
      
      // Adjust chroma based on lightness for visual harmony
      if (targetLightness < 0.3 || targetLightness > 0.9) {
        targetChroma = originalOklch.c * 0.7; // Reduce chroma in very light/dark
      }
      
      const lightOklch = {
        l: Math.round(targetLightness * 1000) / 1000,
        c: Math.round(targetChroma * 10000) / 10000,
        h: originalOklch.h // Preserve exact hue
      };
      
      try {
        const lightHex = oklchToHex(lightOklch);
        lightModeFamily.colors[stepStr] = lightHex;
        lightModeFamily.oklchData[stepStr] = lightOklch;
      } catch (error) {
        console.warn(`Failed to generate ${lightModeFamily.name} ${step}:`, error);
        // Fallback: use scaled version of original
        lightModeFamily.colors[stepStr] = darkModeFamily.colors[stepStr];
        lightModeFamily.oklchData[stepStr] = { ...originalOklch };
      }
    }
  });

  return lightModeFamily;
}

async function generateBrandPreservedSystem() {
  console.log('🎨 Phase 2 Brand Preserved: Preserving Key Brand Colors Across Modes\n');
  console.log('🎯 Goal: Keep brand colors like #ffd24d available in both light and dark modes\n');

  // Load previous analysis
  const analysisPath = join(process.cwd(), '.dse', 'oklch', 'phase-1-pattern-analysis.json');
  const analysis = JSON.parse(readFileSync(analysisPath, 'utf8'));

  const results = {
    targetRange: { min: 0.2, max: 0.98 },
    darkModePreserved: [],
    lightModeGenerated: [],
    brandColorsPreserved: []
  };

  console.log('🎨 Generating Brand-Preserved Light Mode Companions:');
  
  for (const darkFamily of analysis.goodFamilies) {
    // Preserve as dark mode
    const darkModeFamily = {
      ...darkFamily,
      name: `${darkFamily.name}-Dark`
    };
    results.darkModePreserved.push(darkModeFamily);
    
    // Generate light mode with brand preservation
    const lightModeFamily = generateBrandPreservedLightMode(darkModeFamily);
    results.lightModeGenerated.push(lightModeFamily);
    
    // Track preserved brand colors
    if (lightModeFamily.preservedBrandColors) {
      results.brandColorsPreserved.push({
        family: darkFamily.name,
        brandColors: lightModeFamily.preservedBrandColors
      });
    }
  }

  // Save results
  const outputPath = join(process.cwd(), '.dse', 'oklch', 'phase-2-brand-preserved.json');
  writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log(`\n💾 Brand preserved system saved to: ${outputPath}`);

  return results;
}

function generateBrandPreservedHTML(results) {
  const generateBrandComparisonHTML = (darkFamily, lightFamily) => {
    const brandPreservation = results.brandColorsPreserved.find(bp => 
      bp.family === darkFamily.name.replace('-Dark', '')
    );

    const generateSwatchRow = (family, isDark) => {
      const swatches = Object.keys(family.colors).map(step => {
        const hex = family.colors[step];
        const oklch = family.oklchData[step];
        
        // Check if this is a preserved brand color
        const isBrandColor = brandPreservation?.brandColors.some(bc => bc.step === parseInt(step));
        const isPrimary = brandPreservation?.brandColors.some(bc => bc.step === parseInt(step) && bc.isBrandPrimary);
        
        return `
          <div class="color-swatch ${isPrimary ? 'brand-primary' : isBrandColor ? 'brand-secondary' : ''}" 
               style="background-color: ${hex};">
            <div class="color-info">
              <span class="step">${step}</span>
              <span class="hex">${hex}</span>
              <span class="lightness">L: ${oklch.l.toFixed(3)}</span>
              ${isPrimary ? '<span class="brand-tag">BRAND</span>' : ''}
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

    const brandInfo = brandPreservation ? `
      <div class="brand-preservation-info">
        <h4>🎨 Preserved Brand Colors:</h4>
        ${brandPreservation.brandColors.map(bc => 
          `<span class="preserved-brand">${bc.hex} (Step ${bc.step})</span>`
        ).join('')}
      </div>
    ` : '';

    return `
      <div class="family-comparison">
        <h3>${darkFamily.name.replace('-Dark', '')} Family - Brand Colors Preserved</h3>
        ${generateSwatchRow(darkFamily, true)}
        ${generateSwatchRow(lightFamily, false)}
        ${brandInfo}
        <div class="brand-benefits">
          <div><strong>✅ Brand Consistency:</strong> Key colors available in both modes</div>
          <div><strong>✅ Design Flexibility:</strong> Use brand colors regardless of mode</div>
          <div><strong>✅ User Recognition:</strong> Brand identity maintained across themes</div>
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
    <title>Checkpoint 2 Brand Preserved: Key Colors Available in Both Modes</title>
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
        .brand-principle {
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
        .color-swatch.brand-primary {
            border: 3px solid #ffd700;
            box-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
        }
        .color-swatch.brand-secondary {
            border: 2px solid #ff8c00;
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
        .brand-tag {
            background: #ffd700;
            color: #000;
            padding: 1px 2px;
            border-radius: 2px;
            font-weight: bold;
        }
        .brand-preservation-info {
            background: #333;
            padding: 10px;
            border-radius: 4px;
            margin: 10px 0;
        }
        .preserved-brand {
            display: inline-block;
            background: #4a7c59;
            padding: 4px 8px;
            margin: 2px;
            border-radius: 3px;
            font-family: monospace;
        }
        .brand-benefits {
            background: #1a2a4a;
            padding: 15px;
            border-radius: 4px;
            margin-top: 15px;
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
        .light-preview {
            background: #f5f5f5;
            color: #333;
        }
        .light-preview .header,
        .light-preview .brand-principle,
        .light-preview .family-comparison {
            background: #fff;
            color: #333;
            border-color: #ddd;
        }
    </style>
</head>
<body>
    <button class="mode-toggle" onclick="toggleMode()">Toggle Light Preview</button>
    
    <div class="header">
        <h1>🎨 Checkpoint 2 Brand Preserved</h1>
        <h2>Key Brand Colors Available in Both Modes</h2>
        <p>Ensuring colors like #ffd24d are accessible regardless of theme</p>
    </div>

    <div class="brand-principle">
        <h3>🎯 Brand Color Preservation Principle</h3>
        <p><strong>Problem Solved:</strong> Key brand colors now available in both light and dark modes</p>
        <p><strong>Example:</strong> Amber #ffd24d (Step 500) preserved in light mode for consistent branding</p>
        <p><strong>Benefit:</strong> Designers can use brand colors without worrying about theme context</p>
        <p><strong>Gold border:</strong> Primary brand colors | <strong>Orange border:</strong> Secondary brand colors</p>
    </div>

    ${results.darkModePreserved.map((darkFamily, index) => 
      generateBrandComparisonHTML(darkFamily, results.lightModeGenerated[index])
    ).join('')}

    <div style="text-align: center; margin-top: 40px; opacity: 0.6;">
        <p>Phase 2 Complete - Brand colors preserved across modes</p>
        <p>Ready for Phase 3: Problem Family Fixes</p>
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

// Execute brand preservation
generateBrandPreservedSystem().then(results => {
  // Generate HTML visualization
  const html = generateBrandPreservedHTML(results);
  const htmlPath = join(process.cwd(), '.dse', 'oklch', 'checkpoint-2-brand-preserved.html');
  writeFileSync(htmlPath, html);
  console.log(`\n🎨 Brand preserved HTML saved to: ${htmlPath}`);
  console.log('📖 Open this file to verify brand colors like #ffd24d are preserved');
}).catch(console.error);