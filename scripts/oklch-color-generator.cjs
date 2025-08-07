const culori = require('culori');

/**
 * Advanced OKLCH Color Generator
 * Supports fine-grained color ramps with subtle variations for 3D effects
 */

class OKLCHColorGenerator {
  constructor() {
    this.oklch = culori.oklch;
    this.hex = culori.formatHex;
    this.converter = culori.converter('oklch');
  }

  /**
   * Analyze existing hex colors to extract OKLCH patterns
   */
  analyzeColorRamp(colors) {
    const analysis = colors.map(hex => {
      const oklch = this.converter(hex);
      return {
        hex,
        l: oklch.l,
        c: oklch.c,
        h: oklch.h
      };
    });

    return {
      colors: analysis,
      lightnessDelta: this.calculateAverageDelta(analysis.map(c => c.l)),
      chromaDelta: this.calculateAverageDelta(analysis.map(c => c.c)),
      averageHue: analysis.reduce((sum, c) => sum + (c.h || 0), 0) / analysis.length
    };
  }

  calculateAverageDelta(values) {
    let deltas = [];
    for (let i = 1; i < values.length; i++) {
      deltas.push(Math.abs(values[i] - values[i-1]));
    }
    return deltas.reduce((sum, d) => sum + d, 0) / deltas.length;
  }

  /**
   * Generate color ramp with mathematical precision
   * Supports ultra-fine gradations for subtle 3D effects
   */
  generateColorRamp(config) {
    const {
      name,
      baseColor,      // OKLCH or hex
      steps = 14,     // Your current 0000-1300 pattern
      lightnessRange = [0.1, 0.95],
      chromaAdjust = 0,
      hueShift = 0,
      curve = 'linear', // linear, easeIn, easeOut, bezier
      subtleVariations = true // For 3D effects
    } = config;

    const base = this.converter(baseColor);
    const [minL, maxL] = lightnessRange;
    
    const colors = [];
    
    for (let i = 0; i < steps; i++) {
      const t = i / (steps - 1);
      const adjustedT = this.applyCurve(t, curve);
      
      let lightness = minL + (maxL - minL) * adjustedT;
      let chroma = (base.c || 0) + chromaAdjust;
      let hue = (base.h || 0) + hueShift;
      
      // Apply subtle variations for 3D effects
      if (subtleVariations && i > 0 && i < steps - 1) {
        // Add micro-adjustments for surface differentiation
        const variation = Math.sin(i * 0.7) * 0.01; // Very subtle
        lightness += variation;
        
        // Slight chroma variation for depth
        if (i >= steps * 0.3 && i <= steps * 0.7) {
          chroma *= 1.05; // Slightly more saturated in mid-range
        }
      }
      
      const color = {
        l: Math.max(0, Math.min(1, lightness)),
        c: Math.max(0, chroma),
        h: hue
      };
      
      colors.push({
        step: String(i * 100).padStart(4, '0'),
        oklch: `oklch(${(color.l * 100).toFixed(2)}% ${color.c.toFixed(3)} ${color.h?.toFixed(1) || 0})`,
        hex: this.hex(color),
        values: color
      });
    }
    
    return colors;
  }

  /**
   * Apply easing curves for more natural color progressions
   */
  applyCurve(t, curve) {
    switch (curve) {
      case 'easeIn':
        return t * t;
      case 'easeOut':
        return 1 - (1 - t) * (1 - t);
      case 'bezier':
        return t * t * (3.0 - 2.0 * t);
      default:
        return t;
    }
  }

  /**
   * Generate semantic color system (like DaisyUI)
   * Maps your surface400/500 patterns to semantic names
   */
  generateSemanticColors(baseColors) {
    const semanticMap = {
      surface: {
        base: baseColors.neutral0500,
        lighter: baseColors.neutral0400,
        darker: baseColors.neutral0600,
        contrast: baseColors.neutral1200
      },
      primary: {
        base: baseColors.amber0500,
        darker: baseColors.amber0400,
        lighter: baseColors.amber0600,
        contrast: baseColors.amber0000
      }
    };

    // Generate automatic contrast colors
    Object.keys(semanticMap).forEach(color => {
      const base = this.converter(semanticMap[color].base);
      
      // Auto-generate content color with proper contrast
      const contentLightness = base.l > 0.5 ? 0.1 : 0.9;
      semanticMap[color].content = this.hex({
        l: contentLightness,
        c: (base.c || 0) * 0.1, // Desaturated
        h: base.h
      });
    });

    return semanticMap;
  }

  /**
   * Analyze your current neutral ramp to understand the pattern
   */
  analyzeCurrentNeutral() {
    const currentNeutral = [
      '#17181c', '#1c1d21', '#202225', '#35383d', '#3a3d42',
      '#353642', '#484a55', '#595b6a', '#727284', '#8a8a8a',
      '#aeb4b9', '#cccccc', '#dee2e7', '#ffffff'
    ];

    return this.analyzeColorRamp(currentNeutral);
  }

  /**
   * Generate improved version that maintains your subtle differences
   */
  generateImprovedNeutral() {
    // Use the actual OKLCH values from your current neutral ramp
    const baseOklch = this.converter('#35383d'); // Your card background
    
    return this.generateColorRamp({
      name: 'neutral',
      baseColor: {
        l: baseOklch.l,
        c: baseOklch.c || 0.01, // Ensure minimum chroma
        h: baseOklch.h || 260
      },
      steps: 14,
      lightnessRange: [0.08, 0.98],
      curve: 'bezier',
      subtleVariations: true
    });
  }
}

// Test the generator with your requirements
function demonstrateColorGeneration() {
  const generator = new OKLCHColorGenerator();
  
  console.log('=== ANALYZING YOUR CURRENT NEUTRAL RAMP ===');
  const analysis = generator.analyzeCurrentNeutral();
  console.log('Current pattern analysis:', {
    averageLightnessDelta: analysis.lightnessDelta.toFixed(4),
    averageChromaDelta: analysis.chromaDelta.toFixed(4),
    averageHue: analysis.averageHue.toFixed(1)
  });

  console.log('\\n=== GENERATED IMPROVED NEUTRAL RAMP ===');
  const improved = generator.generateImprovedNeutral();
  
  improved.forEach((color, i) => {
    const current = analysis.colors[i];
    console.log(`${color.step}: ${color.hex} (was: ${current?.hex || 'N/A'})`);
    console.log(`  OKLCH: ${color.oklch}`);
    console.log(`  Δ Lightness: ${current ? (color.values.l - current.l).toFixed(4) : 'N/A'}`);
  });

  console.log('\\n=== SURFACE RELATIONSHIP TEST ===');
  const surface400 = improved[4]; // 0400
  const surface500 = improved[5]; // 0500
  const lightnessDiff = Math.abs(surface500.values.l - surface400.values.l);
  console.log(`Surface400: ${surface400.hex}`);
  console.log(`Surface500: ${surface500.hex}`);
  console.log(`Lightness difference: ${lightnessDiff.toFixed(4)} (${lightnessDiff < 0.05 ? 'SUBTLE ✓' : 'TOO BOLD ✗'})`);
}

module.exports = { OKLCHColorGenerator, demonstrateColorGeneration };