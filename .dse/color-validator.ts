/**
 * Color validation system for DSE with OKLCH support
 * Provides comprehensive color format validation, accessibility checks, and consistency analysis
 */

import { oklch, converter, rgb } from 'culori';
import type { OKLCH } from 'culori';

export interface ColorToken {
  $type: string;
  $value: string | number;
  $description?: string;
}

export interface ColorValidationResult {
  token: string;
  tokenPath: string;
  valid: boolean;
  format: ColorFormat;
  errors: ColorValidationError[];
  warnings: ColorValidationWarning[];
  suggestions: ColorValidationSuggestion[];
  accessibilityInfo?: AccessibilityInfo;
  oklchData?: OKLCH;
}

export interface ColorValidationError {
  type: 'format' | 'accessibility' | 'reference' | 'consistency' | 'range';
  severity: 'error' | 'warning';
  message: string;
  value?: any;
  expectedRange?: string;
}

export interface ColorValidationWarning {
  type: 'accessibility' | 'consistency' | 'performance' | 'recommendation';
  message: string;
  recommendation?: string;
}

export interface ColorValidationSuggestion {
  type: 'format' | 'accessibility' | 'consistency';
  message: string;
  suggestedValue?: string;
  oklchAdjustment?: OKLCH;
}

export interface AccessibilityInfo {
  contrastRatio?: number;
  wcagAA: boolean;
  wcagAAA: boolean;
  deltaE?: number;
  perceivedBrightness: number;
}

export type ColorFormat = 'hex' | 'rgb' | 'oklch' | 'reference' | 'invalid';

export interface ColorFormatValidation {
  isValid: boolean;
  format: ColorFormat;
  normalizedValue?: string;
  errors: string[];
}

export interface TokenReference {
  path: string;
  resolved: boolean;
  circularRef: boolean;
  depth: number;
}

export class ColorValidator {
  private hexRegex = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/;
  private rgbRegex = /^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/;
  private oklchRegex = /^oklch\(\s*([\d.]+%?)\s+([\d.]+)\s+([\d.]+)(?:deg)?\s*\)$/;
  private referenceRegex = /^\{([^}]+)\}$/;
  private tokenCache = new Map<string, ColorValidationResult>();
  private referenceMap = new Map<string, any>();

  /**
   * Detects the format of a color value and performs basic format validation
   */
  public detectColorFormat(value: any): ColorFormatValidation {
    if (typeof value !== 'string') {
      return {
        isValid: false,
        format: 'invalid',
        errors: [`Color value must be a string, received ${typeof value}`]
      };
    }

    const trimmedValue = value.trim();

    // Check for token reference
    if (this.referenceRegex.test(trimmedValue)) {
      const match = trimmedValue.match(this.referenceRegex);
      const referencePath = match?.[1];
      
      if (!referencePath) {
        return {
          isValid: false,
          format: 'reference',
          errors: ['Empty token reference']
        };
      }

      return {
        isValid: true,
        format: 'reference',
        normalizedValue: referencePath,
        errors: []
      };
    }

    // Check for hex format
    if (trimmedValue.startsWith('#')) {
      const isValidHex = this.hexRegex.test(trimmedValue);
      return {
        isValid: isValidHex,
        format: 'hex',
        normalizedValue: isValidHex ? trimmedValue.toLowerCase() : undefined,
        errors: isValidHex ? [] : ['Invalid hex color format']
      };
    }

    // Check for RGB format
    if (trimmedValue.startsWith('rgb(')) {
      const rgbMatch = trimmedValue.match(this.rgbRegex);
      if (rgbMatch) {
        const [, r, g, b] = rgbMatch;
        const red = parseInt(r, 10);
        const green = parseInt(g, 10);
        const blue = parseInt(b, 10);

        const errors: string[] = [];
        if (red < 0 || red > 255) errors.push(`Red value ${red} out of range (0-255)`);
        if (green < 0 || green > 255) errors.push(`Green value ${green} out of range (0-255)`);
        if (blue < 0 || blue > 255) errors.push(`Blue value ${blue} out of range (0-255)`);

        return {
          isValid: errors.length === 0,
          format: 'rgb',
          normalizedValue: errors.length === 0 ? trimmedValue : undefined,
          errors
        };
      }

      return {
        isValid: false,
        format: 'rgb',
        errors: ['Invalid RGB color format']
      };
    }

    // Check for OKLCH format
    if (trimmedValue.startsWith('oklch(')) {
      const oklchMatch = trimmedValue.match(this.oklchRegex);
      if (oklchMatch) {
        const [, l, c, h] = oklchMatch;
        const lightness = l.includes('%') ? parseFloat(l) / 100 : parseFloat(l);
        const chroma = parseFloat(c);
        const hue = parseFloat(h);

        const errors: string[] = [];
        if (lightness < 0 || lightness > 1) errors.push(`Lightness ${lightness} out of range (0-1)`);
        if (chroma < 0 || chroma > 0.4) errors.push(`Chroma ${chroma} out of range (0-0.4)`);
        if (hue < 0 || hue >= 360) errors.push(`Hue ${hue} out of range (0-359)`);

        return {
          isValid: errors.length === 0,
          format: 'oklch',
          normalizedValue: errors.length === 0 ? `oklch(${lightness} ${chroma} ${hue})` : undefined,
          errors
        };
      }

      return {
        isValid: false,
        format: 'oklch',
        errors: ['Invalid OKLCH color format']
      };
    }

    return {
      isValid: false,
      format: 'invalid',
      errors: [`Unrecognized color format: ${trimmedValue}`]
    };
  }

  /**
   * Validates a specific color format with comprehensive range and boundary checking
   */
  public validateColorFormat(value: string, expectedFormat: ColorFormat): ColorValidationError[] {
    const errors: ColorValidationError[] = [];
    const formatValidation = this.detectColorFormat(value);

    if (!formatValidation.isValid) {
      formatValidation.errors.forEach(errorMsg => {
        errors.push({
          type: 'format',
          severity: 'error',
          message: errorMsg,
          value
        });
      });
      return errors;
    }

    if (expectedFormat !== 'invalid' && formatValidation.format !== expectedFormat) {
      errors.push({
        type: 'format',
        severity: 'warning',
        message: `Expected ${expectedFormat} format but found ${formatValidation.format}`,
        value
      });
    }

    // Additional format-specific validations
    switch (formatValidation.format) {
      case 'hex':
        this.validateHexColor(value, errors);
        break;
      case 'rgb':
        this.validateRGBColor(value, errors);
        break;
      case 'oklch':
        this.validateOKLCHColor(value, errors);
        break;
      case 'reference':
        // Reference validation will be handled separately
        break;
    }

    return errors;
  }

  /**
   * Validates hex color values with comprehensive checks
   */
  private validateHexColor(value: string, errors: ColorValidationError[]): void {
    const hex = value.toLowerCase();
    
    // Check for common invalid patterns
    if (hex === '#000000') {
      errors.push({
        type: 'range',
        severity: 'warning',
        message: 'Pure black (#000000) may cause accessibility issues',
        value: hex,
        expectedRange: 'Consider using a slightly lighter shade'
      });
    }

    if (hex === '#ffffff') {
      errors.push({
        type: 'range',
        severity: 'warning',
        message: 'Pure white (#ffffff) may cause accessibility issues',
        value: hex,
        expectedRange: 'Consider using a slightly darker shade'
      });
    }

    // Convert to OKLCH for perceptual validation
    try {
      const oklchColor = oklch(hex);
      if (oklchColor) {
        this.validateOKLCHRange(oklchColor, errors);
      }
    } catch (conversionError) {
      errors.push({
        type: 'format',
        severity: 'error',
        message: 'Color cannot be converted to OKLCH color space',
        value: hex
      });
    }
  }

  /**
   * Validates RGB color values
   */
  private validateRGBColor(value: string, errors: ColorValidationError[]): void {
    const match = value.match(this.rgbRegex);
    if (!match) return;

    const [, r, g, b] = match;
    const red = parseInt(r, 10);
    const green = parseInt(g, 10);
    const blue = parseInt(b, 10);

    // Check for grayscale
    if (red === green && green === blue) {
      if (red < 30) {
        errors.push({
          type: 'range',
          severity: 'warning',
          message: 'Very dark grayscale color may cause accessibility issues',
          value,
          expectedRange: 'Consider values above RGB(30,30,30)'
        });
      }
      if (red > 225) {
        errors.push({
          type: 'range',
          severity: 'warning',
          message: 'Very light grayscale color may cause accessibility issues',
          value,
          expectedRange: 'Consider values below RGB(225,225,225)'
        });
      }
    }

    // Convert to OKLCH for perceptual validation
    try {
      const oklchColor = oklch(`rgb(${red}, ${green}, ${blue})`);
      if (oklchColor) {
        this.validateOKLCHRange(oklchColor, errors);
      }
    } catch (conversionError) {
      errors.push({
        type: 'format',
        severity: 'error',
        message: 'RGB color cannot be converted to OKLCH color space',
        value
      });
    }
  }

  /**
   * Validates OKLCH color values with perceptual accuracy checks
   */
  private validateOKLCHColor(value: string, errors: ColorValidationError[]): void {
    const match = value.match(this.oklchRegex);
    if (!match) return;

    const [, l, c, h] = match;
    const lightness = l.includes('%') ? parseFloat(l) / 100 : parseFloat(l);
    const chroma = parseFloat(c);
    const hue = parseFloat(h);

    const oklchColor: OKLCH = { mode: 'oklch', l: lightness, c: chroma, h: hue };
    this.validateOKLCHRange(oklchColor, errors);

    // Check for out-of-gamut colors
    try {
      const rgbConverter = converter('rgb');
      const convertedRgb = rgbConverter(oklchColor);
      
      if (!convertedRgb || convertedRgb.r < 0 || convertedRgb.r > 1 || 
          convertedRgb.g < 0 || convertedRgb.g > 1 || 
          convertedRgb.b < 0 || convertedRgb.b > 1) {
        errors.push({
          type: 'range',
          severity: 'warning',
          message: 'OKLCH color is out of sRGB gamut and may be clipped',
          value,
          expectedRange: 'Consider reducing chroma or adjusting lightness'
        });
      }
    } catch (gamutError) {
      errors.push({
        type: 'range',
        severity: 'warning',
        message: 'Cannot verify gamut compatibility for OKLCH color',
        value
      });
    }
  }

  /**
   * Validates OKLCH color ranges against perceptual and accessibility guidelines
   */
  private validateOKLCHRange(color: OKLCH, errors: ColorValidationError[]): void {
    const { l, c, h } = color;

    // Lightness validation for accessibility
    if (l < 0.15) {
      errors.push({
        type: 'accessibility',
        severity: 'warning',
        message: 'Very low lightness may cause accessibility issues',
        value: l,
        expectedRange: '0.15-0.95 for accessible colors'
      });
    }

    if (l > 0.95) {
      errors.push({
        type: 'accessibility',
        severity: 'warning',
        message: 'Very high lightness may cause accessibility issues',
        value: l,
        expectedRange: '0.15-0.95 for accessible colors'
      });
    }

    // Chroma validation for visual comfort
    if (c > 0.25) {
      errors.push({
        type: 'range',
        severity: 'warning',
        message: 'High chroma may appear oversaturated',
        value: c,
        expectedRange: '0.05-0.20 for balanced saturation'
      });
    }

    // Hue validation
    if (h < 0 || h >= 360) {
      errors.push({
        type: 'range',
        severity: 'error',
        message: 'Hue must be between 0 and 359 degrees',
        value: h,
        expectedRange: '0-359'
      });
    }
  }

  /**
   * Validates token references and resolves dependency chains
   */
  public validateTokenReference(
    referencePath: string, 
    tokenSet: Record<string, any>, 
    visited: Set<string> = new Set()
  ): TokenReference {
    const result: TokenReference = {
      path: referencePath,
      resolved: false,
      circularRef: false,
      depth: visited.size
    };

    // Check for circular reference
    if (visited.has(referencePath)) {
      result.circularRef = true;
      return result;
    }

    // Try to resolve the reference
    const pathParts = referencePath.split('.');
    let current = tokenSet;

    for (const part of pathParts) {
      if (current && typeof current === 'object' && part in current) {
        current = current[part];
      } else {
        // Reference not found
        return result;
      }
    }

    // Check if resolved value is a design token
    if (current && typeof current === 'object' && '$type' in current && '$value' in current) {
      result.resolved = true;

      // If the resolved token also has a reference, validate recursively
      if (typeof current.$value === 'string' && this.referenceRegex.test(current.$value)) {
        const nestedRef = current.$value.match(this.referenceRegex)?.[1];
        if (nestedRef) {
          const newVisited = new Set(visited).add(referencePath);
          const nestedResult = this.validateTokenReference(nestedRef, tokenSet, newVisited);
          result.circularRef = nestedResult.circularRef;
          result.depth = Math.max(result.depth, nestedResult.depth + 1);
        }
      }
    }

    return result;
  }

  /**
   * Validates format consistency across a token set
   */
  public validateFormatConsistency(
    tokens: Record<string, ColorToken>, 
    expectedFormat?: ColorFormat
  ): ColorValidationError[] {
    const errors: ColorValidationError[] = [];
    const detectedFormats = new Map<ColorFormat, number>();

    // Count format occurrences
    for (const [tokenPath, token] of Object.entries(tokens)) {
      if (token.$type === 'color') {
        const formatValidation = this.detectColorFormat(token.$value);
        const format = formatValidation.format;
        
        detectedFormats.set(format, (detectedFormats.get(format) || 0) + 1);

        if (expectedFormat && format !== expectedFormat && format !== 'invalid') {
          errors.push({
            type: 'consistency',
            severity: 'warning',
            message: `Token ${tokenPath} uses ${format} format, expected ${expectedFormat}`,
            value: token.$value
          });
        }
      }
    }

    // Check for mixed formats
    const formatTypes = Array.from(detectedFormats.keys()).filter(f => f !== 'invalid');
    if (formatTypes.length > 1) {
      const formatCounts = formatTypes.map(f => `${f}: ${detectedFormats.get(f)}`).join(', ');
      errors.push({
        type: 'consistency',
        severity: 'warning',
        message: `Mixed color formats detected in token set (${formatCounts})`,
        value: formatCounts
      });
    }

    return errors;
  }

  /**
   * Comprehensive color token validation
   */
  public validateColorToken(
    tokenPath: string, 
    token: ColorToken, 
    tokenSet: Record<string, any>
  ): ColorValidationResult {
    const result: ColorValidationResult = {
      token: token.$value as string,
      tokenPath,
      valid: true,
      format: 'invalid',
      errors: [],
      warnings: [],
      suggestions: []
    };

    // Basic token structure validation
    if (token.$type !== 'color') {
      result.errors.push({
        type: 'format',
        severity: 'error',
        message: `Expected $type to be 'color', found '${token.$type}'`,
        value: token.$type
      });
      result.valid = false;
      return result;
    }

    // Format detection and validation
    const formatValidation = this.detectColorFormat(token.$value);
    result.format = formatValidation.format;

    if (!formatValidation.isValid) {
      formatValidation.errors.forEach(errorMsg => {
        result.errors.push({
          type: 'format',
          severity: 'error',
          message: errorMsg,
          value: token.$value
        });
      });
      result.valid = false;
    }

    // Format-specific validation
    const formatErrors = this.validateColorFormat(token.$value as string, result.format);
    result.errors.push(...formatErrors);

    // Reference validation
    if (result.format === 'reference' && formatValidation.normalizedValue) {
      const refResult = this.validateTokenReference(
        formatValidation.normalizedValue,
        tokenSet
      );

      if (!refResult.resolved) {
        result.errors.push({
          type: 'reference',
          severity: 'error',
          message: `Token reference '${formatValidation.normalizedValue}' not found`,
          value: formatValidation.normalizedValue
        });
        result.valid = false;
      }

      if (refResult.circularRef) {
        result.errors.push({
          type: 'reference',
          severity: 'error',
          message: `Circular reference detected for '${formatValidation.normalizedValue}'`,
          value: formatValidation.normalizedValue
        });
        result.valid = false;
      }

      if (refResult.depth > 5) {
        result.warnings.push({
          type: 'performance',
          message: `Deep reference chain (depth: ${refResult.depth}) may impact performance`,
          recommendation: 'Consider flattening reference hierarchy'
        });
      }
    }

    // Convert to OKLCH for accessibility analysis
    if (result.format !== 'reference' && result.valid) {
      try {
        const oklchColor = oklch(token.$value as string);
        if (oklchColor) {
          result.oklchData = oklchColor;
          result.accessibilityInfo = {
            perceivedBrightness: oklchColor.l,
            wcagAA: false, // Will be calculated with background color
            wcagAAA: false // Will be calculated with background color
          };
        }
      } catch (conversionError) {
        result.warnings.push({
          type: 'accessibility',
          message: 'Color could not be converted to OKLCH for accessibility analysis'
        });
      }
    }

    // Update overall validity
    result.valid = result.errors.filter(e => e.severity === 'error').length === 0;

    return result;
  }
}

// Export default instance
export const colorValidator = new ColorValidator();