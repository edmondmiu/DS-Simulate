const culori = require('culori');

/**
 * Analyze your specific surface color requirements for 3D effects
 */
function analyzeSurfaceColors() {
  const converter = culori.converter('oklch');
  const hex = culori.formatHex;
  
  // Your key surface colors
  const surfaces = {
    'surface300': '#35383d', // Card background
    'surface400': '#3a3d42', // Elevated surface  
    'surface500': '#353642', // Interactive surface
    'surface600': '#484a55', // Border default
  };
  
  console.log('=== ANALYZING YOUR SURFACE COLORS FOR 3D EFFECTS ===\\n');
  
  const analysis = {};
  Object.entries(surfaces).forEach(([name, hex_value]) => {
    const oklch = converter(hex_value);
    analysis[name] = {
      hex: hex_value,
      oklch: oklch,
      l: oklch.l,
      c: oklch.c || 0,
      h: oklch.h || 0
    };
    
    console.log(`${name}: ${hex_value}`);
    console.log(`  OKLCH: ${(oklch.l * 100).toFixed(2)}% ${(oklch.c || 0).toFixed(3)} ${(oklch.h || 0).toFixed(1)}`);
  });
  
  console.log('\\n=== LIGHTNESS DIFFERENCES (Critical for 3D effects) ===');
  const lightness400 = analysis.surface400.l;
  const lightness500 = analysis.surface500.l;
  const diff = Math.abs(lightness500 - lightness400);
  
  console.log(`Surface400 lightness: ${(lightness400 * 100).toFixed(2)}%`);
  console.log(`Surface500 lightness: ${(lightness500 * 100).toFixed(2)}%`);
  console.log(`Difference: ${(diff * 100).toFixed(2)}% ${diff < 0.05 ? '(SUBTLE ✓)' : '(BOLD ✗)'}`);
  
  console.log('\\n=== MATHEMATICAL GENERATION FEASIBILITY ===');
  
  // Test if we can mathematically generate similar subtle differences
  function generateSubtleSurfaces(baseColor, steps = 10) {
    const base = converter(baseColor);
    const results = [];
    
    // Very tight lightness range around your base
    const baseLightness = base.l;
    const range = 0.15; // ±15% lightness variation
    
    for (let i = 0; i < steps; i++) {
      const t = i / (steps - 1);
      const lightness = baseLightness - (range/2) + (range * t);
      
      // Add micro-variations for subtle differentiation
      const microVariation = Math.sin(i * 1.2) * 0.01;
      
      const color = {
        l: lightness + microVariation,
        c: base.c || 0.01,
        h: base.h || 260
      };
      
      results.push({
        step: i,
        hex: hex(color),
        lightness: color.l,
        oklch: `oklch(${(color.l * 100).toFixed(2)}% ${color.c.toFixed(3)} ${color.h.toFixed(1)})`
      });
    }
    
    return results;
  }
  
  const generated = generateSubtleSurfaces('#35383d');
  console.log('\\nGenerated subtle surface variations:');
  generated.forEach((color, i) => {
    console.log(`  Step ${i}: ${color.hex} - ${(color.lightness * 100).toFixed(2)}%`);
  });
  
  // Check consecutive differences
  console.log('\\nConsecutive lightness differences:');
  for (let i = 1; i < generated.length; i++) {
    const diff = Math.abs(generated[i].lightness - generated[i-1].lightness);
    console.log(`  ${i-1} → ${i}: ${(diff * 100).toFixed(2)}% ${diff < 0.05 ? '✓' : '✗'}`);
  }
  
  return { analysis, generated };
}

/**
 * Test mathematical generation for your full 14-step ramp
 */
function generateFullRamp() {
  const converter = culori.converter('oklch');
  const hex = culori.formatHex;
  
  console.log('\\n\\n=== FULL 14-STEP MATHEMATICAL GENERATION ===\\n');
  
  // Your current neutral colors
  const currentNeutral = [
    '#17181c', '#1c1d21', '#202225', '#35383d', '#3a3d42',
    '#353642', '#484a55', '#595b6a', '#727284', '#8a8a8a',
    '#aeb4b9', '#cccccc', '#dee2e7', '#ffffff'
  ];
  
  // Use your middle color as base
  const baseIndex = 6; // Neutral 0600: #484a55 (Border default)
  const baseOklch = converter(currentNeutral[baseIndex]);
  
  console.log(`Base color: ${currentNeutral[baseIndex]}`);
  console.log(`Base OKLCH: ${(baseOklch.l * 100).toFixed(2)}% ${(baseOklch.c || 0).toFixed(3)} ${(baseOklch.h || 0).toFixed(1)}`);
  
  const generated = [];
  
  // Generate 14 steps with mathematical precision
  for (let i = 0; i < 14; i++) {
    const t = i / 13; // 0 to 1
    
    // Non-linear distribution for better dark/light balance
    const adjustedT = Math.pow(t, 1.8);
    
    // Lightness range from very dark to white
    const lightness = 0.08 + (0.90 * adjustedT);
    
    // Slight chroma variation (more saturated in midtones)
    const chromaMultiplier = 1 + (Math.sin(t * Math.PI) * 0.3);
    const chroma = (baseOklch.c || 0.01) * chromaMultiplier;
    
    const color = {
      l: lightness,
      c: Math.max(0, chroma),
      h: baseOklch.h || 260
    };
    
    generated.push({
      step: String(i * 100).padStart(4, '0'),
      current: currentNeutral[i],
      generated: hex(color),
      lightness: color.l,
      oklch: `oklch(${(color.l * 100).toFixed(2)}% ${color.c.toFixed(3)} ${color.h.toFixed(1)})`
    });
  }
  
  console.log('Current vs Generated:');
  generated.forEach((color, i) => {
    console.log(`${color.step}: ${color.current} → ${color.generated}`);
    console.log(`       L: ${(converter(color.current).l * 100).toFixed(2)}% → ${(color.lightness * 100).toFixed(2)}%`);
  });
  
  // Test the critical surface400/500 difference
  const gen400 = generated[4];
  const gen500 = generated[5];
  const diff = Math.abs(gen500.lightness - gen400.lightness);
  
  console.log(`\\nSurface400/500 test:`);
  console.log(`Generated 400: ${gen400.generated} (${(gen400.lightness * 100).toFixed(2)}%)`);
  console.log(`Generated 500: ${gen500.generated} (${(gen500.lightness * 100).toFixed(2)}%)`);
  console.log(`Difference: ${(diff * 100).toFixed(2)}% ${diff < 0.05 ? '(SUBTLE ✓)' : '(BOLD ✗)'}`);
}

// Run the analysis
analyzeSurfaceColors();
generateFullRamp();