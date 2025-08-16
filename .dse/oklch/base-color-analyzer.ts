/**
 * Base Color Analyzer
 * Converts Cool Neutral 300 and Amber 500 to precise OKLCH values
 * and establishes mathematical stepping algorithms
 */

import { oklch, formatHex, differenceEuclidean } from 'culori';

export interface OKLCHColor {
  l: number; // Lightness (0-1)
  c: number; // Chroma (0-0.4)
  h: number; // Hue (0-360)
}

export interface BaseColorAnalysis {
  hex: string;
  oklch: OKLCHColor;
  role: 'neutral_foundation' | 'brand_foundation';
  mathematicalProperties: {
    lightnessRange: { min: number; max: number };
    chromaTarget: number;
    hueStability: number;
  };
}

export class BaseColorAnalyzer {
  
  /**
   * Convert HEX to precise OKLCH values
   */
  public static hexToOKLCH(hexColor: string): OKLCHColor {
    const oklchColor = oklch(hexColor);
    if (!oklchColor) {
      throw new Error(`Invalid color: ${hexColor}`);
    }
    
    return {
      l: Math.round(oklchColor.l * 1000) / 1000, // 3 decimal precision
      c: Math.round(oklchColor.c * 10000) / 10000, // 4 decimal precision  
      h: Math.round((oklchColor.h || 0) * 10000) / 10000 // 4 decimal precision
    };
  }

  /**
   * Convert OKLCH to HEX
   */
  public static oklchToHex(color: OKLCHColor): string {
    return formatHex({ mode: 'oklch', ...color });
  }

  /**
   * Calculate Delta E between two colors for visual fidelity validation
   */
  public static calculateDeltaE(color1: string, color2: string): number {
    try {
      // Use Euclidean distance for approximate Delta E measurement
      const diff = differenceEuclidean()(color1, color2);
      return Math.round((diff || 0) * 100) / 100;
    } catch (error) {
      console.warn(`Delta E calculation failed for ${color1} vs ${color2}:`, error);
      return 0;
    }
  }

  /**
   * Analyze Cool Neutral 300 base color
   */
  public static analyzeCoolNeutral(): BaseColorAnalysis {
    const hexValue = '#35383d';
    const oklchValue = this.hexToOKLCH(hexValue);
    
    return {
      hex: hexValue,
      oklch: oklchValue,
      role: 'neutral_foundation',
      mathematicalProperties: {
        lightnessRange: { min: 0.15, max: 0.95 }, // 15%-95% for accessibility
        chromaTarget: oklchValue.c, // Use actual low chroma for neutrals
        hueStability: oklchValue.h // Stable cool hue around 230°
      }
    };
  }

  /**
   * Analyze Amber 500 base color
   */
  public static analyzeAmber(): BaseColorAnalysis {
    const hexValue = '#ffd24d';
    const oklchValue = this.hexToOKLCH(hexValue);
    
    return {
      hex: hexValue,
      oklch: oklchValue,
      role: 'brand_foundation',
      mathematicalProperties: {
        lightnessRange: { min: 0.15, max: 0.95 }, // Same range for consistency
        chromaTarget: oklchValue.c, // Use actual moderate chroma for brand
        hueStability: oklchValue.h // Stable warm hue around 90°
      }
    };
  }

  /**
   * Generate lightness stepping algorithm for 0-1300 range
   */
  public static generateLightnessSteps(): number[] {
    const steps = 14; // 0, 100, 200, ..., 1300
    const minLightness = 0.15; // 15%
    const maxLightness = 0.95; // 95%
    
    const lightnessSteps: number[] = [];
    
    for (let i = 0; i < steps; i++) {
      // Linear distribution from dark to light
      const progress = i / (steps - 1);
      const lightness = minLightness + (progress * (maxLightness - minLightness));
      lightnessSteps.push(Math.round(lightness * 1000) / 1000);
    }
    
    return lightnessSteps;
  }

  /**
   * Validate base color mathematical relationships
   */
  public static validateBaseColors(): {
    coolNeutral: BaseColorAnalysis;
    amber: BaseColorAnalysis;
    lightnessSteps: number[];
    validation: {
      coolNeutralValid: boolean;
      amberValid: boolean;
      lightnessRangeValid: boolean;
      chromaRelationshipValid: boolean;
    };
  } {
    const coolNeutral = this.analyzeCoolNeutral();
    const amber = this.analyzeAmber();
    const lightnessSteps = this.generateLightnessSteps();
    
    // Validation checks
    const coolNeutralValid = coolNeutral.oklch.l >= 0.15 && coolNeutral.oklch.l <= 0.95;
    const amberValid = amber.oklch.l >= 0.15 && amber.oklch.l <= 0.95;
    const lightnessRangeValid = lightnessSteps.length === 14 && 
                               lightnessSteps[0] >= 0.15 && 
                               lightnessSteps[13] <= 0.95;
    const chromaRelationshipValid = coolNeutral.oklch.c < amber.oklch.c; // Neutrals should have lower chroma
    
    return {
      coolNeutral,
      amber,
      lightnessSteps,
      validation: {
        coolNeutralValid,
        amberValid,
        lightnessRangeValid,
        chromaRelationshipValid
      }
    };
  }
}