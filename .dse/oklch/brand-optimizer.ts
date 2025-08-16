/**
 * Brand Color Family Optimizer
 * Optimizes all brand/accent families using Amber 500 as mathematical base
 */

import { BaseColorAnalyzer, OKLCHColor } from './base-color-analyzer.js';
import { oklch, formatHex } from 'culori';

export interface BrandFamily {
  name: string;
  colors: Record<string, string>; // step -> hex
  originalHue?: number; // Preserve unique family hue
  originalChroma?: number; // Preserve unique family chroma
  optimized?: Record<string, string>;
  deltaE?: Record<string, number>;
}

export interface BrandOptimizationResult {
  family: BrandFamily;
  allValid: boolean;
  averageDeltaE: number;
  maxDeltaE: number;
  huePreserved: boolean;
}

export class BrandOptimizer {
  private static amberBase = BaseColorAnalyzer.analyzeAmber();
  private static lightnessSteps = BaseColorAnalyzer.generateLightnessSteps();

  /**
   * Extract the dominant hue and chroma from a color family
   */
  private static extractFamilyCharacteristics(colors: Record<string, string>): { hue: number; chroma: number } {
    // Use the middle step (usually 500) to determine family characteristics
    const middleSteps = ['500', '600', '400', '700', '300']; // Priority order
    
    for (const step of middleSteps) {
      if (colors[step]) {
        const oklchColor = oklch(colors[step]);
        if (oklchColor?.h !== undefined && oklchColor?.c !== undefined) {
          return {
            hue: oklchColor.h,
            chroma: oklchColor.c
          };
        }
      }
    }
    
    // Fallback: use first available color
    const firstColor = Object.values(colors)[0];
    if (firstColor) {
      const oklchColor = oklch(firstColor);
      return {
        hue: oklchColor?.h || 0,
        chroma: oklchColor?.c || 0
      };
    }
    
    return { hue: 0, chroma: 0 };
  }

  /**
   * Optimize a single brand color using Amber base mathematics with preserved hue and chroma
   */
  public static optimizeBrandColor(
    originalHex: string, 
    targetLightness: number, 
    familyHue: number,
    familyChroma: number
  ): {
    optimized: string;
    deltaE: number;
    oklch: OKLCHColor;
  } {
    // Create optimized color using consistent lightness stepping with preserved hue and chroma
    const optimizedOklch: OKLCHColor = {
      l: targetLightness,
      c: familyChroma, // Preserve family's characteristic chroma
      h: familyHue     // Preserve family's unique hue
    };
    
    const optimizedHex = formatHex({ mode: 'oklch', ...optimizedOklch });
    const deltaE = BaseColorAnalyzer.calculateDeltaE(originalHex, optimizedHex);
    
    return {
      optimized: optimizedHex,
      deltaE,
      oklch: optimizedOklch
    };
  }

  /**
   * Optimize entire brand family using consistent lightness stepping and preserved hue/chroma
   */
  public static optimizeBrandFamily(family: BrandFamily): BrandOptimizationResult {
    const familyCharacteristics = this.extractFamilyCharacteristics(family.colors);
    family.originalHue = familyCharacteristics.hue;
    family.originalChroma = familyCharacteristics.chroma;
    
    const optimized: Record<string, string> = {};
    const deltaE: Record<string, number> = {};
    
    // Extract step numbers and sort them
    const steps = Object.keys(family.colors)
      .map(step => parseInt(step))
      .filter(step => !isNaN(step))
      .sort((a, b) => a - b);
    
    // Apply consistent lightness stepping with preserved hue
    steps.forEach((step, index) => {
      const stepKey = step.toString();
      const originalHex = family.colors[stepKey];
      
      if (originalHex && index < this.lightnessSteps.length) {
        const targetLightness = this.lightnessSteps[index];
        const result = this.optimizeBrandColor(originalHex, targetLightness, familyCharacteristics.hue, familyCharacteristics.chroma);
        
        optimized[stepKey] = result.optimized;
        deltaE[stepKey] = result.deltaE;
      }
    });
    
    // Calculate validation metrics
    const deltaEValues = Object.values(deltaE);
    const averageDeltaE = deltaEValues.reduce((sum, de) => sum + de, 0) / deltaEValues.length;
    const maxDeltaE = Math.max(...deltaEValues);
    const allValid = maxDeltaE < 2.0; // All changes must be imperceptible
    
    // Check if hue is preserved (should be consistent across all steps)
    const optimizedHues = Object.values(optimized).map(hex => {
      const oklchColor = oklch(hex);
      return oklchColor?.h || 0;
    });
    const hueVariation = Math.max(...optimizedHues) - Math.min(...optimizedHues);
    const huePreserved = hueVariation < 15; // Allow reasonable variation for brand color preservation
    
    return {
      family: {
        ...family,
        optimized,
        deltaE
      },
      allValid,
      averageDeltaE: Math.round(averageDeltaE * 100) / 100,
      maxDeltaE: Math.round(maxDeltaE * 100) / 100,
      huePreserved
    };
  }

  /**
   * Extract brand families from core.json structure
   */
  public static extractBrandFamilies(coreTokens: any): BrandFamily[] {
    const brandFamilyNames = [
      'Amber',
      'Red', 
      'Green',
      'Blue',
      'Orange',
      'Yellow',
      'Gold Yellow',
      'Royal Blue',
      'Deep Blue', 
      'Midnight',
      'Mint',
      'Tiger Orange',
      'Neon Green',
      'Golden',
      'Crimson',
      'Forest Green',
      'Ocean Blue',
      'Casino'
    ];
    
    const families: BrandFamily[] = [];
    
    if (!coreTokens['Color Ramp']) {
      throw new Error('Color Ramp not found in core tokens');
    }
    
    brandFamilyNames.forEach(familyName => {
      const familyData = coreTokens['Color Ramp'][familyName];
      if (familyData) {
        const colors: Record<string, string> = {};
        
        // Extract colors from family
        Object.keys(familyData).forEach(colorKey => {
          const colorData = familyData[colorKey];
          if (colorData && colorData.$value) {
            // Extract step number from key (e.g., "Red 300" -> "300")
            const stepMatch = colorKey.match(/(\d+)$/);
            if (stepMatch) {
              const step = stepMatch[1];
              colors[step] = colorData.$value;
            }
          }
        });
        
        if (Object.keys(colors).length > 0) {
          families.push({
            name: familyName,
            colors
          });
        }
      }
    });
    
    return families;
  }

  /**
   * Optimize all brand families
   */
  public static optimizeAllBrandFamilies(coreTokens: any): {
    results: BrandOptimizationResult[];
    summary: {
      totalFamilies: number;
      validFamilies: number;
      averageDeltaE: number;
      maxDeltaE: number;
      huesPreserved: number;
    };
  } {
    const families = this.extractBrandFamilies(coreTokens);
    const results = families.map(family => this.optimizeBrandFamily(family));
    
    const validFamilies = results.filter(r => r.allValid).length;
    const huesPreserved = results.filter(r => r.huePreserved).length;
    const allDeltaE = results.flatMap(r => Object.values(r.family.deltaE || {}));
    const averageDeltaE = allDeltaE.reduce((sum, de) => sum + de, 0) / allDeltaE.length;
    const maxDeltaE = Math.max(...allDeltaE);
    
    return {
      results,
      summary: {
        totalFamilies: families.length,
        validFamilies,
        averageDeltaE: Math.round(averageDeltaE * 100) / 100,
        maxDeltaE: Math.round(maxDeltaE * 100) / 100,
        huesPreserved
      }
    };
  }
}