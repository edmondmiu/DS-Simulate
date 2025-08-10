/**
 * OKLCH Color Processing Utilities
 * Comprehensive OKLCH color space conversion and generation utilities
 * Following TypeScript 5.4.5 strict typing standards
 */

import { 
  formatHex, 
  oklch, 
  rgb, 
  converter,
  clampChroma,
  inGamut,
  differenceEuclidean
} from 'culori';

/**
 * OKLCH color representation
 */
export interface OKLCHColor {
  l: number; // lightness 0-1
  c: number; // chroma 0-0.4+
  h: number; // hue 0-360 degrees
}

/**
 * Color conversion result with validation info
 */
export interface ColorConversionResult {
  success: boolean;
  color: string;
  originalFormat: string;
  oklch?: OKLCHColor;
  warnings: string[];
  error?: string;
}

/**
 * Color ramp generation options
 */
export interface ColorRampOptions {
  steps: number;
  lightnessRange: [number, number];
  preserveChroma: boolean;
  preserveHue: boolean;
}

/**
 * Color generation options for brand-specific variations
 */
export interface ColorGenerationOptions {
  baseColor: OKLCHColor;
  lightnessAdjustment?: number; // -20 to +20
  chromaMultiplier?: number; // 0.5 to 2.0
  hueShift?: number; // 0-360 degrees
}

/**
 * Accessibility validation result
 */
export interface AccessibilityResult {
  contrastRatio: number;
  wcagAA: boolean; // >= 4.5
  wcagAAA: boolean; // >= 7.0
  recommendation?: string;
}

/**
 * Convert Culori color object to OKLCHColor interface
 */
const convertToOKLCH = converter('oklch');

/**
 * OKLCH Color Processor class with comprehensive color management
 */
export class OKLCHColorProcessor {
  private conversionCache = new Map<string, ColorConversionResult>();
  
  /**
   * Parse color value and detect format
   * @param colorValue - Color value in various formats
   * @returns Detected format and parsed color
   */
  public parseColorValue(colorValue: string): { format: string; color: any } {
    const trimmed = colorValue.trim().toLowerCase();
    
    // Detect format
    if (trimmed.startsWith('#')) {
      return { format: 'hex', color: rgb(trimmed) };
    }
    
    if (trimmed.startsWith('rgb(') || trimmed.startsWith('rgba(')) {
      return { format: 'rgb', color: rgb(trimmed) };
    }
    
    if (trimmed.startsWith('oklch(')) {
      return { format: 'oklch', color: oklch(trimmed) };
    }
    
    // Try parsing as named color or other formats
    const parsed = rgb(trimmed);
    if (parsed) {
      return { format: 'named', color: parsed };
    }
    
    throw new Error(`Unsupported color format: ${colorValue}`);
  }

  /**
   * Convert any color format to OKLCH
   * @param colorValue - Input color in any supported format
   * @returns ColorConversionResult with OKLCH representation
   */
  public convertToOKLCH(colorValue: string): ColorConversionResult {
    // Check cache first
    const cacheKey = `to-oklch:${colorValue}`;
    if (this.conversionCache.has(cacheKey)) {
      return this.conversionCache.get(cacheKey)!;
    }

    const warnings: string[] = [];
    
    try {
      const { format, color } = this.parseColorValue(colorValue);
      
      if (!color) {
        return {
          success: false,
          color: colorValue,
          originalFormat: format,
          warnings,
          error: 'Failed to parse color value'
        };
      }

      // Convert to OKLCH
      const oklchColor = convertToOKLCH(color);
      
      if (!oklchColor) {
        return {
          success: false,
          color: colorValue,
          originalFormat: format,
          warnings,
          error: 'Failed to convert to OKLCH color space'
        };
      }

      // Validate OKLCH values
      const validatedOKLCH = this.validateOKLCHValues(oklchColor, warnings);

      const result: ColorConversionResult = {
        success: true,
        color: colorValue,
        originalFormat: format,
        oklch: validatedOKLCH,
        warnings
      };

      // Cache the result
      this.conversionCache.set(cacheKey, result);
      return result;

    } catch (error) {
      const result: ColorConversionResult = {
        success: false,
        color: colorValue,
        originalFormat: 'unknown',
        warnings,
        error: error instanceof Error ? error.message : 'Unknown conversion error'
      };
      
      this.conversionCache.set(cacheKey, result);
      return result;
    }
  }

  /**
   * Convert OKLCH to hex format
   * @param oklchColor - OKLCH color object
   * @returns ColorConversionResult with hex representation
   */
  public convertFromOKLCH(oklchColor: OKLCHColor): ColorConversionResult {
    const cacheKey = `from-oklch:${oklchColor.l}-${oklchColor.c}-${oklchColor.h}`;
    if (this.conversionCache.has(cacheKey)) {
      return this.conversionCache.get(cacheKey)!;
    }

    const warnings: string[] = [];
    
    try {
      // Validate OKLCH values
      const validatedOKLCH = this.validateOKLCHValues(oklchColor, warnings);

      // Create Culori OKLCH color object
      const culoriOKLCH = {
        mode: 'oklch' as const,
        l: validatedOKLCH.l,
        c: validatedOKLCH.c,
        h: validatedOKLCH.h
      };

      // Check if color is in RGB gamut
      if (!inGamut('rgb')(culoriOKLCH)) {
        warnings.push('Color is outside RGB gamut, clamping to nearest displayable color');
        
        // Clamp to RGB gamut by reducing chroma
        const clampedColor = clampChroma(culoriOKLCH, 'rgb');
        const hexColor = formatHex(clampedColor);
        
        const result: ColorConversionResult = {
          success: true,
          color: hexColor,
          originalFormat: 'oklch',
          oklch: {
            l: clampedColor.l || validatedOKLCH.l,
            c: clampedColor.c || 0,
            h: clampedColor.h || validatedOKLCH.h
          },
          warnings
        };
        
        this.conversionCache.set(cacheKey, result);
        return result;
      }

      // Convert to hex
      const hexColor = formatHex(culoriOKLCH);
      
      if (!hexColor) {
        return {
          success: false,
          color: '',
          originalFormat: 'oklch',
          oklch: validatedOKLCH,
          warnings,
          error: 'Failed to convert OKLCH to hex'
        };
      }

      const result: ColorConversionResult = {
        success: true,
        color: hexColor,
        originalFormat: 'oklch',
        oklch: validatedOKLCH,
        warnings
      };

      this.conversionCache.set(cacheKey, result);
      return result;

    } catch (error) {
      const result: ColorConversionResult = {
        success: false,
        color: '',
        originalFormat: 'oklch',
        oklch: oklchColor,
        warnings,
        error: error instanceof Error ? error.message : 'Unknown conversion error'
      };
      
      this.conversionCache.set(cacheKey, result);
      return result;
    }
  }

  /**
   * Validate and clamp OKLCH values to valid ranges
   * @param oklchColor - Raw OKLCH color values
   * @param warnings - Array to collect warnings
   * @returns Validated OKLCH color
   */
  private validateOKLCHValues(oklchColor: any, warnings: string[]): OKLCHColor {
    let { l, c, h } = oklchColor;

    // Validate and clamp lightness (0-1)
    if (typeof l !== 'number' || isNaN(l)) {
      warnings.push('Invalid lightness value, using 0.5');
      l = 0.5;
    } else if (l < 0) {
      warnings.push('Lightness below 0, clamping to 0');
      l = 0;
    } else if (l > 1) {
      warnings.push('Lightness above 1, clamping to 1');
      l = 1;
    }

    // Validate and clamp chroma (0-0.4+, but typically 0-0.4)
    if (typeof c !== 'number' || isNaN(c)) {
      warnings.push('Invalid chroma value, using 0');
      c = 0;
    } else if (c < 0) {
      warnings.push('Chroma below 0, clamping to 0');
      c = 0;
    } else if (c > 0.5) {
      warnings.push('Very high chroma value, may be outside displayable gamut');
    }

    // Validate and normalize hue (0-360)
    if (typeof h !== 'number' || isNaN(h)) {
      warnings.push('Invalid hue value, using 0');
      h = 0;
    } else {
      // Normalize hue to 0-360 range
      h = ((h % 360) + 360) % 360;
    }

    return { l, c, h };
  }

  /**
   * Generate perceptually uniform color ramp using OKLCH
   * @param baseOKLCH - Base OKLCH color for the ramp
   * @param options - Ramp generation options
   * @returns Array of hex colors forming a perceptually uniform ramp
   */
  public generateColorRamp(
    baseOKLCH: OKLCHColor, 
    options: ColorRampOptions
  ): ColorConversionResult[] {
    const { steps, lightnessRange, preserveChroma, preserveHue } = options;
    const [minL, maxL] = lightnessRange;
    
    const ramp: ColorConversionResult[] = [];
    
    for (let i = 0; i < steps; i++) {
      const t = steps > 1 ? i / (steps - 1) : 0.5;
      
      // Generate perceptually uniform lightness progression
      const l = minL + t * (maxL - minL);
      
      // Preserve or adjust chroma based on options
      const c = preserveChroma ? baseOKLCH.c : baseOKLCH.c * (1 - Math.abs(t - 0.5) * 0.2);
      
      // Preserve or adjust hue based on options  
      const h = preserveHue ? baseOKLCH.h : baseOKLCH.h + (t - 0.5) * 10;
      
      const rampColor: OKLCHColor = { l, c, h };
      const converted = this.convertFromOKLCH(rampColor);
      
      ramp.push(converted);
    }
    
    return ramp;
  }

  /**
   * Generate brand-specific color variation
   * @param options - Brand color generation options
   * @returns Converted color result
   */
  public generateBrandColor(options: ColorGenerationOptions): ColorConversionResult {
    const { baseColor, lightnessAdjustment = 0, chromaMultiplier = 1.0, hueShift = 0 } = options;
    
    // Apply brand-specific adjustments
    const adjustedColor: OKLCHColor = {
      l: Math.max(0, Math.min(1, baseColor.l + lightnessAdjustment / 100)),
      c: Math.max(0, baseColor.c * chromaMultiplier),
      h: (baseColor.h + hueShift) % 360
    };
    
    return this.convertFromOKLCH(adjustedColor);
  }

  /**
   * Calculate contrast ratio using OKLCH lightness values
   * @param color1 - First color in OKLCH
   * @param color2 - Second color in OKLCH  
   * @returns Contrast ratio (1-21)
   */
  public calculateContrastRatio(color1: OKLCHColor, color2: OKLCHColor): number {
    // Use OKLCH lightness values for more accurate perceptual contrast
    const l1 = Math.max(color1.l, color2.l);
    const l2 = Math.min(color1.l, color2.l);
    
    // Convert to relative luminance approximation
    // OKLCH lightness is already perceptually uniform
    const luminance1 = Math.pow(l1, 2.4);
    const luminance2 = Math.pow(l2, 2.4);
    
    return (luminance1 + 0.05) / (luminance2 + 0.05);
  }

  /**
   * Validate color accessibility using OKLCH metrics
   * @param foreground - Foreground color in OKLCH
   * @param background - Background color in OKLCH
   * @returns Accessibility validation result
   */
  public validateAccessibility(
    foreground: OKLCHColor, 
    background: OKLCHColor
  ): AccessibilityResult {
    const contrastRatio = this.calculateContrastRatio(foreground, background);
    
    const result: AccessibilityResult = {
      contrastRatio: Math.round(contrastRatio * 100) / 100,
      wcagAA: contrastRatio >= 4.5,
      wcagAAA: contrastRatio >= 7.0
    };

    // Add recommendations
    if (!result.wcagAA) {
      result.recommendation = `Contrast ratio ${result.contrastRatio} is below WCAG AA (4.5). Increase lightness difference.`;
    } else if (!result.wcagAAA) {
      result.recommendation = `Meets WCAG AA but not AAA (7.0). Consider increasing contrast for better accessibility.`;
    }

    return result;
  }

  /**
   * Calculate visual difference between two colors using Delta E
   * @param color1 - First OKLCH color
   * @param color2 - Second OKLCH color  
   * @returns Delta E difference (lower values = more similar)
   */
  public calculateColorDifference(color1: OKLCHColor, color2: OKLCHColor): number {
    const culori1 = { mode: 'oklch' as const, l: color1.l, c: color1.c, h: color1.h };
    const culori2 = { mode: 'oklch' as const, l: color2.l, c: color2.c, h: color2.h };
    
    return differenceEuclidean()(culori1, culori2);
  }

  /**
   * Clear conversion cache (useful for testing and memory management)
   */
  public clearCache(): void {
    this.conversionCache.clear();
  }

  /**
   * Get cache statistics for performance monitoring
   * @returns Cache size and hit rate information
   */
  public getCacheStats(): { size: number; maxSize: number } {
    return {
      size: this.conversionCache.size,
      maxSize: 1000 // Arbitrary limit for memory management
    };
  }
}

/**
 * Default OKLCH color processor instance (singleton pattern)
 */
export const defaultOKLCHProcessor = new OKLCHColorProcessor();

/**
 * Utility functions for common OKLCH operations
 */

/**
 * Quick conversion from any color format to OKLCH
 * @param colorValue - Color value in any format
 * @returns OKLCH color object or null if conversion fails
 */
export function toOKLCH(colorValue: string): OKLCHColor | null {
  const result = defaultOKLCHProcessor.convertToOKLCH(colorValue);
  return result.success ? result.oklch! : null;
}

/**
 * Quick conversion from OKLCH to hex
 * @param oklchColor - OKLCH color object
 * @returns Hex color string or null if conversion fails
 */
export function fromOKLCH(oklchColor: OKLCHColor): string | null {
  const result = defaultOKLCHProcessor.convertFromOKLCH(oklchColor);
  return result.success ? result.color : null;
}

/**
 * Generate accessible color pair with specified contrast ratio
 * @param baseColor - Base OKLCH color
 * @param targetContrast - Target contrast ratio (4.5 for AA, 7.0 for AAA)
 * @returns Accessible color pair or null if generation fails
 */
export function generateAccessiblePair(
  baseColor: OKLCHColor, 
  targetContrast: number = 4.5
): { base: string; accessible: string } | null {
  const processor = defaultOKLCHProcessor;
  
  // Try generating lighter color first
  let adjustedL = Math.min(1, baseColor.l + 0.4);
  let accessibleColor: OKLCHColor = { ...baseColor, l: adjustedL };
  
  let contrast = processor.calculateContrastRatio(baseColor, accessibleColor);
  
  // If lighter doesn't work, try darker
  if (contrast < targetContrast) {
    adjustedL = Math.max(0, baseColor.l - 0.4);
    accessibleColor = { ...baseColor, l: adjustedL };
    contrast = processor.calculateContrastRatio(baseColor, accessibleColor);
  }
  
  // Fine-tune lightness to hit target contrast
  const maxIterations = 10;
  let iterations = 0;
  
  while (Math.abs(contrast - targetContrast) > 0.1 && iterations < maxIterations) {
    if (contrast < targetContrast) {
      // Need more contrast
      if (adjustedL > baseColor.l) {
        adjustedL = Math.min(1, adjustedL + 0.05);
      } else {
        adjustedL = Math.max(0, adjustedL - 0.05);
      }
    } else {
      // Too much contrast
      if (adjustedL > baseColor.l) {
        adjustedL = Math.max(baseColor.l, adjustedL - 0.05);
      } else {
        adjustedL = Math.min(baseColor.l, adjustedL + 0.05);
      }
    }
    
    accessibleColor = { ...baseColor, l: adjustedL };
    contrast = processor.calculateContrastRatio(baseColor, accessibleColor);
    iterations++;
  }
  
  const baseHex = fromOKLCH(baseColor);
  const accessibleHex = fromOKLCH(accessibleColor);
  
  if (baseHex && accessibleHex) {
    return { base: baseHex, accessible: accessibleHex };
  }
  
  return null;
}