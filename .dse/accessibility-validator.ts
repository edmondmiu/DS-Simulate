/**
 * OKLCH-based accessibility validation for DSE color system
 * Provides perceptually accurate contrast ratio calculations and WCAG compliance checking
 */

import { oklch, wcagContrast, wcagLuminance, differenceEuclidean, converter } from 'culori';
import type { Oklch } from 'culori';
import { colorValidator } from './color-validator.js';

export interface AccessibilityValidationResult {
  tokenPath: string;
  valid: boolean;
  contrastRatio: number;
  wcagLevel: 'AA' | 'AAA' | 'fail';
  textSize: 'normal' | 'large';
  errors: AccessibilityError[];
  warnings: AccessibilityWarning[];
  suggestions: AccessibilitySuggestion[];
  oklchData: {
    foreground: OKLCH;
    background: OKLCH;
    deltaE: number;
  };
}

export interface AccessibilityError {
  type: 'contrast' | 'perception' | 'gamut';
  severity: 'error' | 'warning';
  message: string;
  actualValue: number;
  requiredValue: number;
}

export interface AccessibilityWarning {
  type: 'contrast' | 'perception' | 'usability';
  message: string;
  recommendation: string;
}

export interface AccessibilitySuggestion {
  type: 'lightness' | 'chroma' | 'hue';
  message: string;
  suggestedOKLCH: OKLCH;
  suggestedHex: string;
  expectedContrast: number;
}

export interface ColorPair {
  foreground: string;
  background: string;
  foregroundToken?: string;
  backgroundToken?: string;
}

export interface AccessibilityThresholds {
  AA: number;
  AAA: number;
  largeTextAA: number;
  largeTextAAA: number;
  justNoticeableDelta: number;
  clearlyDifferentDelta: number;
}

export class AccessibilityValidator {
  private readonly defaultThresholds: AccessibilityThresholds = {
    AA: 4.5,
    AAA: 7.0,
    largeTextAA: 3.0,
    largeTextAAA: 4.5,
    justNoticeableDelta: 2.3,
    clearlyDifferentDelta: 5.0
  };

  private thresholds: AccessibilityThresholds;
  private contrastCache = new Map<string, number>();
  private deltaECache = new Map<string, number>();

  constructor(customThresholds?: Partial<AccessibilityThresholds>) {
    this.thresholds = { ...this.defaultThresholds, ...customThresholds };
  }

  /**
   * Calculates contrast ratio using OKLCH lightness values for perceptual accuracy
   */
  public calculateOKLCHContrast(color1: OKLCH, color2: OKLCH): number {
    const l1 = Math.max(color1.l, color2.l);
    const l2 = Math.min(color1.l, color2.l);
    
    // OKLCH lightness is already perceptually uniform
    // Use standard contrast formula with OKLCH lightness
    return (l1 + 0.05) / (l2 + 0.05);
  }

  /**
   * Calculates standard WCAG contrast ratio for comparison
   */
  public calculateWCAGContrast(foregroundColor: string, backgroundColor: string): number {
    const cacheKey = `${foregroundColor}-${backgroundColor}`;
    
    if (this.contrastCache.has(cacheKey)) {
      return this.contrastCache.get(cacheKey)!;
    }

    try {
      const contrast = wcag.contrast(foregroundColor, backgroundColor);
      this.contrastCache.set(cacheKey, contrast);
      return contrast;
    } catch (error) {
      // Fallback to OKLCH-based calculation
      const fg = oklch(foregroundColor);
      const bg = oklch(backgroundColor);
      
      if (fg && bg) {
        const oklchContrast = this.calculateOKLCHContrast(fg, bg);
        this.contrastCache.set(cacheKey, oklchContrast);
        return oklchContrast;
      }
      
      throw new Error(`Cannot calculate contrast for colors: ${foregroundColor}, ${backgroundColor}`);
    }
  }

  /**
   * Calculates perceptual color difference using Delta E in OKLCH space
   */
  public calculateDeltaE(color1: string, color2: string): number {
    const cacheKey = `${color1}-${color2}`;
    
    if (this.deltaECache.has(cacheKey)) {
      return this.deltaECache.get(cacheKey)!;
    }

    try {
      const oklch1 = oklch(color1);
      const oklch2 = oklch(color2);
      
      if (!oklch1 || !oklch2) {
        throw new Error('Cannot convert colors to OKLCH');
      }

      const delta = deltaE('2000')(oklch1, oklch2) || 0;
      this.deltaECache.set(cacheKey, delta);
      return delta;
    } catch (error) {
      throw new Error(`Cannot calculate Delta E for colors: ${color1}, ${color2}`);
    }
  }

  /**
   * Determines WCAG compliance level based on contrast ratio and text size
   */
  public getWCAGLevel(contrastRatio: number, textSize: 'normal' | 'large' = 'normal'): 'AA' | 'AAA' | 'fail' {
    const aaThreshold = textSize === 'large' ? this.thresholds.largeTextAA : this.thresholds.AA;
    const aaaThreshold = textSize === 'large' ? this.thresholds.largeTextAAA : this.thresholds.AAA;

    if (contrastRatio >= aaaThreshold) {
      return 'AAA';
    } else if (contrastRatio >= aaThreshold) {
      return 'AA';
    } else {
      return 'fail';
    }
  }

  /**
   * Suggests accessible color using OKLCH adjustments
   */
  public suggestAccessibleColor(
    baseColor: OKLCH,
    targetColor: OKLCH,
    targetContrast: number,
    adjustForeground: boolean = true
  ): AccessibilitySuggestion {
    const colorToAdjust = adjustForeground ? baseColor : targetColor;
    const fixedColor = adjustForeground ? targetColor : baseColor;
    
    // Calculate required lightness adjustment
    const currentContrast = this.calculateOKLCHContrast(baseColor, targetColor);
    
    let suggestedLightness = colorToAdjust.l;
    
    if (currentContrast < targetContrast) {
      // Need to increase contrast
      if (fixedColor.l > 0.5) {
        // Fixed color is light, make adjustable color darker
        suggestedLightness = Math.max(0.05, (fixedColor.l + 0.05) / targetContrast - 0.05);
      } else {
        // Fixed color is dark, make adjustable color lighter
        suggestedLightness = Math.min(0.95, targetContrast * (fixedColor.l + 0.05) - 0.05);
      }
    }

    const suggestedOKLCH: OKLCH = {
      ...colorToAdjust,
      l: Math.max(0.05, Math.min(0.95, suggestedLightness))
    };

    // Convert to hex for practical use
    const rgbConverter = converter('rgb');
    const suggestedRgb = rgbConverter(suggestedOKLCH);
    const hexConverter = converter('hex');
    const suggestedHex = hexConverter(suggestedRgb) || '#000000';

    // Calculate expected contrast with suggestion
    const expectedContrast = adjustForeground 
      ? this.calculateOKLCHContrast(suggestedOKLCH, targetColor)
      : this.calculateOKLCHContrast(baseColor, suggestedOKLCH);

    return {
      type: 'lightness',
      message: `Adjust ${adjustForeground ? 'foreground' : 'background'} lightness from ${colorToAdjust.l.toFixed(2)} to ${suggestedOKLCH.l.toFixed(2)}`,
      suggestedOKLCH,
      suggestedHex,
      expectedContrast
    };
  }

  /**
   * Validates accessibility for a color pair with comprehensive analysis
   */
  public validateColorPair(
    colorPair: ColorPair,
    textSize: 'normal' | 'large' = 'normal'
  ): AccessibilityValidationResult {
    const result: AccessibilityValidationResult = {
      tokenPath: `${colorPair.foregroundToken || colorPair.foreground} on ${colorPair.backgroundToken || colorPair.background}`,
      valid: false,
      contrastRatio: 0,
      wcagLevel: 'fail',
      textSize,
      errors: [],
      warnings: [],
      suggestions: [],
      oklchData: {
        foreground: { mode: 'oklch', l: 0, c: 0, h: 0 },
        background: { mode: 'oklch', l: 0, c: 0, h: 0 },
        deltaE: 0
      }
    };

    try {
      // Convert colors to OKLCH
      const fgOklch = oklch(colorPair.foreground);
      const bgOklch = oklch(colorPair.background);

      if (!fgOklch || !bgOklch) {
        result.errors.push({
          type: 'gamut',
          severity: 'error',
          message: 'Cannot convert colors to OKLCH color space',
          actualValue: 0,
          requiredValue: 0
        });
        return result;
      }

      result.oklchData.foreground = fgOklch;
      result.oklchData.background = bgOklch;

      // Calculate contrast ratio using both methods
      const oklchContrast = this.calculateOKLCHContrast(fgOklch, bgOklch);
      const wcagContrast = this.calculateWCAGContrast(colorPair.foreground, colorPair.background);
      
      // Use OKLCH contrast as primary, but note discrepancies
      result.contrastRatio = oklchContrast;
      result.wcagLevel = this.getWCAGLevel(oklchContrast, textSize);
      result.valid = result.wcagLevel !== 'fail';

      // Calculate Delta E for perceptual difference
      result.oklchData.deltaE = this.calculateDeltaE(colorPair.foreground, colorPair.background);

      // Compare OKLCH vs WCAG contrast calculations
      const contrastDifference = Math.abs(oklchContrast - wcagContrast);
      if (contrastDifference > 0.5) {
        result.warnings.push({
          type: 'perception',
          message: `OKLCH contrast (${oklchContrast.toFixed(2)}) differs from WCAG contrast (${wcagContrast.toFixed(2)})`,
          recommendation: 'OKLCH provides more perceptually accurate measurements'
        });
      }

      // Validate contrast thresholds
      const requiredContrast = textSize === 'large' ? this.thresholds.largeTextAA : this.thresholds.AA;
      if (oklchContrast < requiredContrast) {
        result.errors.push({
          type: 'contrast',
          severity: 'error',
          message: `Insufficient contrast ratio for ${textSize} text`,
          actualValue: oklchContrast,
          requiredValue: requiredContrast
        });

        // Suggest accessible alternatives
        const fgSuggestion = this.suggestAccessibleColor(fgOklch, bgOklch, requiredContrast, true);
        const bgSuggestion = this.suggestAccessibleColor(fgOklch, bgOklch, requiredContrast, false);
        
        result.suggestions.push(fgSuggestion, bgSuggestion);
      }

      // AAA level suggestions
      const aaaThreshold = textSize === 'large' ? this.thresholds.largeTextAAA : this.thresholds.AAA;
      if (oklchContrast >= requiredContrast && oklchContrast < aaaThreshold) {
        result.warnings.push({
          type: 'contrast',
          message: 'Meets AA but not AAA standards',
          recommendation: `Increase contrast to ${aaaThreshold.toFixed(1)}:1 for AAA compliance`
        });

        const aaaSuggestion = this.suggestAccessibleColor(fgOklch, bgOklch, aaaThreshold, true);
        result.suggestions.push(aaaSuggestion);
      }

      // Delta E validation for noticeable difference
      if (result.oklchData.deltaE < this.thresholds.justNoticeableDelta) {
        result.warnings.push({
          type: 'perception',
          message: `Colors may be too similar (ΔE: ${result.oklchData.deltaE.toFixed(1)})`,
          recommendation: `Aim for ΔE > ${this.thresholds.justNoticeableDelta} for noticeable difference`
        });
      }

      // Lightness proximity warning
      const lightnessDiff = Math.abs(fgOklch.l - bgOklch.l);
      if (lightnessDiff < 0.3 && result.contrastRatio < 3.0) {
        result.warnings.push({
          type: 'perception',
          message: 'Colors have similar lightness and may be hard to distinguish',
          recommendation: 'Increase lightness difference or use different hues'
        });
      }

      // Vibrant color accessibility warning
      if ((fgOklch.c > 0.2 || bgOklch.c > 0.2) && result.contrastRatio < 5.0) {
        result.warnings.push({
          type: 'usability',
          message: 'High chroma colors may cause visual fatigue',
          recommendation: 'Consider reducing saturation or increasing contrast'
        });
      }

    } catch (error) {
      result.errors.push({
        type: 'gamut',
        severity: 'error',
        message: `Accessibility validation failed: ${error instanceof Error ? error.message : String(error)}`,
        actualValue: 0,
        requiredValue: 0
      });
    }

    return result;
  }

  /**
   * Validates multiple color pairs for comprehensive accessibility analysis
   */
  public validateColorPairs(
    colorPairs: ColorPair[],
    textSize: 'normal' | 'large' = 'normal'
  ): AccessibilityValidationResult[] {
    return colorPairs.map(pair => this.validateColorPair(pair, textSize));
  }

  /**
   * Generates accessibility report for a set of color combinations
   */
  public generateAccessibilityReport(colorPairs: ColorPair[]): {
    summary: {
      total: number;
      passing: number;
      aa: number;
      aaa: number;
      failing: number;
    };
    results: AccessibilityValidationResult[];
    recommendations: string[];
  } {
    const results = this.validateColorPairs(colorPairs);
    
    const summary = {
      total: results.length,
      passing: results.filter(r => r.valid).length,
      aa: results.filter(r => r.wcagLevel === 'AA').length,
      aaa: results.filter(r => r.wcagLevel === 'AAA').length,
      failing: results.filter(r => !r.valid).length
    };

    const recommendations: string[] = [];
    
    // Generate global recommendations based on patterns
    const lowContrastCount = results.filter(r => r.contrastRatio < 3.0).length;
    if (lowContrastCount > results.length * 0.3) {
      recommendations.push('Consider increasing overall lightness differences in your color palette');
    }

    const highChromaCount = results.filter(r => 
      r.oklchData.foreground.c > 0.2 || r.oklchData.background.c > 0.2
    ).length;
    if (highChromaCount > results.length * 0.5) {
      recommendations.push('High saturation colors detected - consider reducing chroma for better accessibility');
    }

    const similarLightnessCount = results.filter(r => 
      Math.abs(r.oklchData.foreground.l - r.oklchData.background.l) < 0.2
    ).length;
    if (similarLightnessCount > 0) {
      recommendations.push('Some color pairs have similar lightness values - consider using more diverse lightness levels');
    }

    return {
      summary,
      results,
      recommendations
    };
  }

  /**
   * Updates accessibility thresholds (useful for brand-specific requirements)
   */
  public updateThresholds(newThresholds: Partial<AccessibilityThresholds>): void {
    this.thresholds = { ...this.thresholds, ...newThresholds };
    // Clear caches as thresholds have changed
    this.contrastCache.clear();
    this.deltaECache.clear();
  }

  /**
   * Gets current accessibility thresholds
   */
  public getThresholds(): AccessibilityThresholds {
    return { ...this.thresholds };
  }
}

// Export default instance
export const accessibilityValidator = new AccessibilityValidator();