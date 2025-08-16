/**
 * OKLCH Color Validator
 * Automatic validation rules for new color additions to ensure OKLCH compliance
 */

import { BaseColorAnalyzer, OKLCHColor } from './base-color-analyzer.js';
import { oklch } from 'culori';
import { readFileSync } from 'fs';
import { join } from 'path';

export interface ColorValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  recommendations: string[];
  suggestedBase: 'coolNeutral' | 'amber';
  deltaE?: number;
  proposedOklch?: OKLCHColor;
}

export interface NewColorRequest {
  name: string;
  hex: string;
  purpose: 'neutral' | 'brand' | 'accent' | 'semantic';
  context?: string;
  brandAffiliation?: 'core' | 'logifuture' | 'bet9ja' | 'global';
}

export class ColorValidator {
  private static config: any;

  /**
   * Load configuration from color-library.json
   */
  private static loadConfig(): any {
    if (!this.config) {
      const configPath = join(process.cwd(), '.dse', 'color-library.json');
      this.config = JSON.parse(readFileSync(configPath, 'utf8')).colorLibrary;
    }
    return this.config;
  }

  /**
   * Automatically suggest base color based on color characteristics
   */
  public static suggestBaseColor(request: NewColorRequest): 'coolNeutral' | 'amber' {
    const config = this.loadConfig();
    const oklchColor = oklch(request.hex);
    
    if (!oklchColor) {
      return 'coolNeutral'; // Default fallback
    }

    const chroma = oklchColor.c || 0;
    const neutralKeywords = config.futureProofing.automationRules.neutral_keywords;
    const brandKeywords = config.futureProofing.automationRules.brand_keywords;

    // Check keywords in name and context
    const textToCheck = `${request.name} ${request.context || ''}`.toLowerCase();
    const hasNeutralKeywords = neutralKeywords.some((keyword: string) => 
      textToCheck.includes(keyword.toLowerCase())
    );
    const hasBrandKeywords = brandKeywords.some((keyword: string) => 
      textToCheck.includes(keyword.toLowerCase())
    );

    // Apply automation rules
    if (hasNeutralKeywords || chroma < 0.03 || request.purpose === 'neutral') {
      return 'coolNeutral';
    }
    
    if (hasBrandKeywords || chroma >= 0.03 || ['brand', 'accent', 'semantic'].includes(request.purpose)) {
      return 'amber';
    }

    // Default based on chroma threshold
    return chroma < 0.03 ? 'coolNeutral' : 'amber';
  }

  /**
   * Validate color against OKLCH standards
   */
  public static validateColor(request: NewColorRequest): ColorValidationResult {
    const config = this.loadConfig();
    const oklchColor = oklch(request.hex);
    
    const result: ColorValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      recommendations: [],
      suggestedBase: this.suggestBaseColor(request)
    };

    if (!oklchColor) {
      result.isValid = false;
      result.errors.push('Invalid hex color format');
      return result;
    }

    const { l: lightness, c: chroma, h: hue } = oklchColor;
    result.proposedOklch = { l: lightness || 0, c: chroma || 0, h: hue || 0 };

    // Validate lightness range
    const lightnessRange = config.lightnessRange;
    const minL = lightnessRange.min / 100;
    const maxL = lightnessRange.max / 100;
    
    if (lightness < minL || lightness > maxL) {
      result.warnings.push(
        `Lightness ${(lightness * 100).toFixed(1)}% outside recommended range ${lightnessRange.min}%-${lightnessRange.max}%`
      );
    }

    // Validate chroma range based on purpose
    const chromaRanges = config.chromaRange;
    let expectedChromaRange;

    switch (request.purpose) {
      case 'neutral':
        expectedChromaRange = chromaRanges.neutral;
        break;
      case 'accent':
        expectedChromaRange = chromaRanges.accent;
        break;
      default:
        expectedChromaRange = chromaRanges.brand;
    }

    if (chroma < expectedChromaRange.min) {
      result.warnings.push(
        `Chroma ${chroma.toFixed(4)} below expected range for ${request.purpose} colors (min: ${expectedChromaRange.min})`
      );
    }

    if (chroma > expectedChromaRange.max) {
      result.warnings.push(
        `Chroma ${chroma.toFixed(4)} above expected range for ${request.purpose} colors (max: ${expectedChromaRange.max})`
      );
    }

    // Base color alignment check
    const baseColors = config.dualBaseApproach;
    const recommendedBase = result.suggestedBase === 'coolNeutral' 
      ? baseColors.coolNeutralBase 
      : baseColors.amberBase;

    // Calculate if color would benefit from OKLCH optimization
    const targetLightness = this.findClosestLightnessStep(lightness, config);
    const optimizedColor = {
      l: targetLightness,
      c: result.suggestedBase === 'coolNeutral' ? Math.min(chroma, 0.02) : chroma,
      h: hue
    };

    const deltaE = BaseColorAnalyzer.calculateDeltaE(request.hex, this.oklchToHex(optimizedColor));
    result.deltaE = deltaE;

    if (deltaE > config.accessibilityThresholds.deltaE) {
      result.warnings.push(
        `Color would require significant optimization (ΔE: ${deltaE.toFixed(2)}, threshold: ${config.accessibilityThresholds.deltaE})`
      );
      result.recommendations.push(
        `Consider using optimized OKLCH values: L=${(targetLightness * 100).toFixed(1)}%, C=${optimizedColor.c.toFixed(4)}, H=${optimizedColor.h.toFixed(1)}°`
      );
    }

    // Brand separation validation for brand colors
    if (['brand', 'accent'].includes(request.purpose)) {
      this.validateBrandSeparation(request, result, config);
    }

    // Accessibility foundation check
    this.validateAccessibilityFoundation(request, result, config);

    // Generate recommendations
    this.generateRecommendations(request, result, config);

    return result;
  }

  /**
   * Find closest lightness step in the standardized range
   */
  private static findClosestLightnessStep(lightness: number, config: any): number {
    const steps = config.lightnessRange.steps;
    const min = config.lightnessRange.min / 100;
    const max = config.lightnessRange.max / 100;
    
    const stepSize = (max - min) / (steps - 1);
    const stepIndex = Math.round((lightness - min) / stepSize);
    return min + (stepIndex * stepSize);
  }

  /**
   * Convert OKLCH to hex
   */
  private static oklchToHex(oklchColor: OKLCHColor): string {
    try {
      const color = { mode: 'oklch' as const, ...oklchColor };
      return require('culori').formatHex(color);
    } catch {
      return '#000000';
    }
  }

  /**
   * Validate brand separation requirements
   */
  private static validateBrandSeparation(
    request: NewColorRequest, 
    result: ColorValidationResult, 
    config: any
  ): void {
    const minSeparation = config.dualBaseApproach.validation.brandSeparationMinimum;
    const proposedHue = result.proposedOklch?.h || 0;

    // Check against known brand hues (from Story 1.4 results)
    const knownBrandHues = [
      { name: 'Base', hue: 109.1 },
      { name: 'Logifuture', hue: 230.9 },
      { name: 'Bet9ja', hue: 206.6 }
    ];

    const conflicts = knownBrandHues.filter(brand => {
      const hueDiff = Math.min(
        Math.abs(proposedHue - brand.hue),
        360 - Math.abs(proposedHue - brand.hue)
      );
      return hueDiff < minSeparation;
    });

    if (conflicts.length > 0) {
      result.warnings.push(
        `Hue ${proposedHue.toFixed(1)}° may conflict with existing brand colors: ${conflicts.map(c => c.name).join(', ')}`
      );
      result.recommendations.push(
        `Consider adjusting hue to maintain ${minSeparation}° minimum separation from existing brand colors`
      );
    }
  }

  /**
   * Validate accessibility foundation
   */
  private static validateAccessibilityFoundation(
    request: NewColorRequest,
    result: ColorValidationResult,
    config: any
  ): void {
    const lightness = result.proposedOklch?.l || 0;
    const backgrounds = config.accessibilityThresholds.validation.backgroundAssumptions;

    // Check if lightness supports accessibility
    const hasAccessibilityPotential = 
      (lightness >= 0.15 && lightness <= 0.35) || 
      (lightness >= 0.65 && lightness <= 0.95);

    if (!hasAccessibilityPotential) {
      result.warnings.push(
        `Lightness ${(lightness * 100).toFixed(1)}% may limit accessibility options`
      );
      result.recommendations.push(
        'Consider lightness values in ranges 15%-35% or 65%-95% for better accessibility compliance'
      );
    }
  }

  /**
   * Generate contextual recommendations
   */
  private static generateRecommendations(
    request: NewColorRequest,
    result: ColorValidationResult,
    config: any
  ): void {
    const base = result.suggestedBase;
    const baseColor = config.dualBaseApproach[base === 'coolNeutral' ? 'coolNeutralBase' : 'amberBase'];

    result.recommendations.push(`Recommended base: ${baseColor.description}`);
    result.recommendations.push(`Usage: ${baseColor.usage.primary}`);

    if (request.brandAffiliation) {
      const brandConfig = config.brandSpecific[request.brandAffiliation];
      if (brandConfig) {
        result.recommendations.push(
          `Brand recommendation: ${brandConfig.baseRecommendation} (${brandConfig.characteristics})`
        );
      }
    }

    // Quality assurance recommendations
    const qa = config.futureProofing.qualityAssurance;
    result.recommendations.push('Required validations: ' + qa.mandatory_checks.join(', '));
    
    if (result.deltaE && result.deltaE > 1.0) {
      result.recommendations.push('Consider automated optimization for better OKLCH alignment');
    }
  }

  /**
   * Validate new color batch
   */
  public static validateColorBatch(requests: NewColorRequest[]): {
    results: ColorValidationResult[];
    batchSummary: {
      totalColors: number;
      validColors: number;
      needsOptimization: number;
      brandConflicts: number;
      recommendations: string[];
    };
  } {
    const results = requests.map(request => this.validateColor(request));
    
    const batchSummary = {
      totalColors: requests.length,
      validColors: results.filter(r => r.isValid && r.errors.length === 0).length,
      needsOptimization: results.filter(r => (r.deltaE || 0) > 1.0).length,
      brandConflicts: results.filter(r => 
        r.warnings.some(w => w.includes('conflict with existing brand'))
      ).length,
      recommendations: [
        'Batch validation completed',
        `${results.filter(r => r.suggestedBase === 'coolNeutral').length} colors recommended for Cool Neutral base`,
        `${results.filter(r => r.suggestedBase === 'amber').length} colors recommended for Amber base`
      ]
    };

    return { results, batchSummary };
  }
}