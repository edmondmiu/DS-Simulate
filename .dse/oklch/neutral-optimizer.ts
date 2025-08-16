/**
 * Neutral Color Family Optimizer
 * Optimizes all neutral families using Cool Neutral 300 as mathematical base
 */

import { BaseColorAnalyzer, OKLCHColor } from './base-color-analyzer.js';
import { oklch, formatHex } from 'culori';

export interface NeutralFamily {
  name: string;
  colors: Record<string, string>; // step -> hex
  optimized?: Record<string, string>;
  deltaE?: Record<string, number>;
}

export interface OptimizationResult {
  family: NeutralFamily;
  allValid: boolean;
  averageDeltaE: number;
  maxDeltaE: number;
}

export class NeutralOptimizer {
  private static coolNeutralBase = BaseColorAnalyzer.analyzeCoolNeutral();
  private static lightnessSteps = BaseColorAnalyzer.generateLightnessSteps();

  /**
   * Optimize a single neutral color using Cool Neutral base mathematics
   */
  public static optimizeNeutralColor(originalHex: string, targetLightness: number): {
    optimized: string;
    deltaE: number;
    oklch: OKLCHColor;
  } {
    const baseOklch = this.coolNeutralBase.oklch;
    
    // Create optimized color using Cool Neutral's chroma and hue with target lightness
    const optimizedOklch: OKLCHColor = {
      l: targetLightness,
      c: baseOklch.c, // Use Cool Neutral's low chroma for neutral appearance
      h: baseOklch.h  // Use Cool Neutral's stable hue
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
   * Optimize entire neutral family using consistent lightness stepping
   */
  public static optimizeNeutralFamily(family: NeutralFamily): OptimizationResult {
    const optimized: Record<string, string> = {};
    const deltaE: Record<string, number> = {};
    
    // Extract step numbers and sort them
    const steps = Object.keys(family.colors)
      .map(step => parseInt(step))
      .filter(step => !isNaN(step))
      .sort((a, b) => a - b);
    
    // Apply consistent lightness stepping
    steps.forEach((step, index) => {
      const stepKey = step.toString();
      const originalHex = family.colors[stepKey];
      
      if (originalHex && index < this.lightnessSteps.length) {
        const targetLightness = this.lightnessSteps[index];
        const result = this.optimizeNeutralColor(originalHex, targetLightness);
        
        optimized[stepKey] = result.optimized;
        deltaE[stepKey] = result.deltaE;
      }
    });
    
    // Calculate validation metrics
    const deltaEValues = Object.values(deltaE);
    const averageDeltaE = deltaEValues.reduce((sum, de) => sum + de, 0) / deltaEValues.length;
    const maxDeltaE = Math.max(...deltaEValues);
    const allValid = maxDeltaE < 2.0; // All changes must be imperceptible
    
    return {
      family: {
        ...family,
        optimized,
        deltaE
      },
      allValid,
      averageDeltaE: Math.round(averageDeltaE * 100) / 100,
      maxDeltaE: Math.round(maxDeltaE * 100) / 100
    };
  }

  /**
   * Extract neutral families from core.json structure
   */
  public static extractNeutralFamilies(coreTokens: any): NeutralFamily[] {
    const neutralFamilyNames = [
      'Neutral',
      'NeutralLight', 
      'Cool Neutral',
      'Dynamic Neutral',
      'Smoked Grey',
      'Cool Grey'
    ];
    
    const families: NeutralFamily[] = [];
    
    if (!coreTokens['Color Ramp']) {
      throw new Error('Color Ramp not found in core tokens');
    }
    
    neutralFamilyNames.forEach(familyName => {
      const familyData = coreTokens['Color Ramp'][familyName];
      if (familyData) {
        const colors: Record<string, string> = {};
        
        // Extract colors from family
        Object.keys(familyData).forEach(colorKey => {
          const colorData = familyData[colorKey];
          if (colorData && colorData.$value) {
            // Extract step number from key (e.g., "Neutral 300" -> "300")
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
   * Optimize all neutral families
   */
  public static optimizeAllNeutralFamilies(coreTokens: any): {
    results: OptimizationResult[];
    summary: {
      totalFamilies: number;
      validFamilies: number;
      averageDeltaE: number;
      maxDeltaE: number;
    };
  } {
    const families = this.extractNeutralFamilies(coreTokens);
    const results = families.map(family => this.optimizeNeutralFamily(family));
    
    const validFamilies = results.filter(r => r.allValid).length;
    const allDeltaE = results.flatMap(r => Object.values(r.family.deltaE || {}));
    const averageDeltaE = allDeltaE.reduce((sum, de) => sum + de, 0) / allDeltaE.length;
    const maxDeltaE = Math.max(...allDeltaE);
    
    return {
      results,
      summary: {
        totalFamilies: families.length,
        validFamilies,
        averageDeltaE: Math.round(averageDeltaE * 100) / 100,
        maxDeltaE: Math.round(maxDeltaE * 100) / 100
      }
    };
  }
}