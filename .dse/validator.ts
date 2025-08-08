/**
 * Configuration validation utilities for DSE color library
 * Following TypeScript 5.4.5 strict typing and coding standards
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import {
  ColorLibraryConfig,
  ValidationResult,
  ValidationError,
  ValidationWarning,
  COLOR_LIBRARY_JSON_SCHEMA
} from './schema.js';

/**
 * Validates a color library configuration object against the schema
 * @param config - Configuration object to validate
 * @returns Validation result with errors and warnings
 */
export function validateColorLibraryConfig(config: unknown): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // Type guard for basic structure
  if (!config || typeof config !== 'object' || config === null) {
    errors.push({
      field: 'root',
      message: 'Configuration must be an object',
      value: config
    });
    return { isValid: false, errors, warnings };
  }

  const configObj = config as Record<string, unknown>;

  // Validate colorLibrary exists
  if (!configObj.colorLibrary) {
    errors.push({
      field: 'colorLibrary',
      message: 'colorLibrary configuration is required',
      value: undefined
    });
    return { isValid: false, errors, warnings };
  }

  if (typeof configObj.colorLibrary !== 'object' || configObj.colorLibrary === null) {
    errors.push({
      field: 'colorLibrary',
      message: 'colorLibrary must be an object',
      value: configObj.colorLibrary
    });
    return { isValid: false, errors, warnings };
  }

  const colorLibrary = configObj.colorLibrary as Record<string, unknown>;

  // Validate required fields
  validateColorSpace(colorLibrary, errors);
  validateLightnessRange(colorLibrary, errors, warnings);
  validateChromaRange(colorLibrary, errors, warnings);
  validateAccessibilityThresholds(colorLibrary, errors, warnings);
  validateConversionOptions(colorLibrary, errors);

  // Validate optional fields
  if (colorLibrary.brandSpecific) {
    validateBrandSpecific(colorLibrary.brandSpecific, errors, warnings);
  }

  if (colorLibrary.colorGeneration) {
    validateColorGeneration(colorLibrary.colorGeneration, errors, warnings);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings: warnings.length > 0 ? warnings : undefined
  };
}

/**
 * Loads and validates a color library configuration file
 * @param filePath - Path to the configuration file
 * @returns Validation result
 */
export function validateColorLibraryFile(filePath: string): ValidationResult {
  try {
    const configContent = readFileSync(filePath, 'utf-8');
    const config = JSON.parse(configContent);
    return validateColorLibraryConfig(config);
  } catch (error) {
    return {
      isValid: false,
      errors: [{
        field: 'file',
        message: error instanceof Error ? error.message : 'Failed to read configuration file',
        value: filePath
      }]
    };
  }
}

/**
 * Validates color space configuration
 */
function validateColorSpace(colorLibrary: Record<string, unknown>, errors: ValidationError[]): void {
  if (!colorLibrary.colorSpace) {
    errors.push({
      field: 'colorLibrary.colorSpace',
      message: 'colorSpace is required',
      expectedRange: 'oklch'
    });
    return;
  }

  if (colorLibrary.colorSpace !== 'oklch') {
    errors.push({
      field: 'colorLibrary.colorSpace',
      message: 'colorSpace must be "oklch"',
      value: colorLibrary.colorSpace,
      expectedRange: 'oklch'
    });
  }
}

/**
 * Validates lightness range configuration
 */
function validateLightnessRange(
  colorLibrary: Record<string, unknown>, 
  errors: ValidationError[], 
  warnings: ValidationWarning[]
): void {
  if (!colorLibrary.lightnessRange) {
    errors.push({
      field: 'colorLibrary.lightnessRange',
      message: 'lightnessRange is required',
      expectedRange: '{ min: 0-100, max: 0-100 }'
    });
    return;
  }

  const range = colorLibrary.lightnessRange as Record<string, unknown>;

  if (typeof range.min !== 'number' || range.min < 0 || range.min > 100) {
    errors.push({
      field: 'colorLibrary.lightnessRange.min',
      message: 'min must be a number between 0 and 100',
      value: range.min,
      expectedRange: '0-100'
    });
  }

  if (typeof range.max !== 'number' || range.max < 0 || range.max > 100) {
    errors.push({
      field: 'colorLibrary.lightnessRange.max',
      message: 'max must be a number between 0 and 100',
      value: range.max,
      expectedRange: '0-100'
    });
  }

  if (typeof range.min === 'number' && typeof range.max === 'number' && range.min >= range.max) {
    errors.push({
      field: 'colorLibrary.lightnessRange',
      message: 'min must be less than max',
      value: `min: ${range.min}, max: ${range.max}`
    });
  }

  // Accessibility warnings
  if (typeof range.min === 'number' && range.min < 15) {
    warnings.push({
      field: 'colorLibrary.lightnessRange.min',
      message: 'Minimum lightness below 15 may cause accessibility issues',
      recommendation: 'Consider using minimum lightness of 15 or higher for better contrast'
    });
  }

  if (typeof range.max === 'number' && range.max > 95) {
    warnings.push({
      field: 'colorLibrary.lightnessRange.max',
      message: 'Maximum lightness above 95 may cause accessibility issues',
      recommendation: 'Consider using maximum lightness of 95 or lower for better contrast'
    });
  }
}

/**
 * Validates chroma range configuration
 */
function validateChromaRange(
  colorLibrary: Record<string, unknown>, 
  errors: ValidationError[], 
  warnings: ValidationWarning[]
): void {
  if (!colorLibrary.chromaRange) {
    errors.push({
      field: 'colorLibrary.chromaRange',
      message: 'chromaRange is required',
      expectedRange: '{ primary: 0-0.4, neutral: 0-0.4 }'
    });
    return;
  }

  const range = colorLibrary.chromaRange as Record<string, unknown>;

  if (typeof range.primary !== 'number' || range.primary < 0 || range.primary > 0.4) {
    errors.push({
      field: 'colorLibrary.chromaRange.primary',
      message: 'primary must be a number between 0 and 0.4',
      value: range.primary,
      expectedRange: '0-0.4'
    });
  }

  if (typeof range.neutral !== 'number' || range.neutral < 0 || range.neutral > 0.4) {
    errors.push({
      field: 'colorLibrary.chromaRange.neutral',
      message: 'neutral must be a number between 0 and 0.4',
      value: range.neutral,
      expectedRange: '0-0.4'
    });
  }

  // Performance warnings for high chroma values
  if (typeof range.primary === 'number' && range.primary > 0.25) {
    warnings.push({
      field: 'colorLibrary.chromaRange.primary',
      message: 'High primary chroma values may appear oversaturated',
      recommendation: 'Consider values between 0.10-0.20 for balanced saturation'
    });
  }
}

/**
 * Validates accessibility thresholds configuration
 */
function validateAccessibilityThresholds(
  colorLibrary: Record<string, unknown>, 
  errors: ValidationError[], 
  warnings: ValidationWarning[]
): void {
  if (!colorLibrary.accessibilityThresholds) {
    errors.push({
      field: 'colorLibrary.accessibilityThresholds',
      message: 'accessibilityThresholds is required',
      expectedRange: '{ AA: 1-21, AAA: 1-21 }'
    });
    return;
  }

  const thresholds = colorLibrary.accessibilityThresholds as Record<string, unknown>;

  if (typeof thresholds.AA !== 'number' || thresholds.AA < 1 || thresholds.AA > 21) {
    errors.push({
      field: 'colorLibrary.accessibilityThresholds.AA',
      message: 'AA must be a number between 1 and 21',
      value: thresholds.AA,
      expectedRange: '1-21'
    });
  }

  if (typeof thresholds.AAA !== 'number' || thresholds.AAA < 1 || thresholds.AAA > 21) {
    errors.push({
      field: 'colorLibrary.accessibilityThresholds.AAA',
      message: 'AAA must be a number between 1 and 21',
      value: thresholds.AAA,
      expectedRange: '1-21'
    });
  }

  if (typeof thresholds.AA === 'number' && typeof thresholds.AAA === 'number' && thresholds.AAA <= thresholds.AA) {
    errors.push({
      field: 'colorLibrary.accessibilityThresholds',
      message: 'AAA threshold must be greater than AA threshold',
      value: `AA: ${thresholds.AA}, AAA: ${thresholds.AAA}`
    });
  }

  // Standard compliance warnings
  if (typeof thresholds.AA === 'number' && thresholds.AA !== 4.5) {
    warnings.push({
      field: 'colorLibrary.accessibilityThresholds.AA',
      message: 'Non-standard AA threshold detected',
      recommendation: 'WCAG standard specifies AA contrast ratio of 4.5:1'
    });
  }

  if (typeof thresholds.AAA === 'number' && thresholds.AAA !== 7.0) {
    warnings.push({
      field: 'colorLibrary.accessibilityThresholds.AAA',
      message: 'Non-standard AAA threshold detected',
      recommendation: 'WCAG standard specifies AAA contrast ratio of 7.0:1'
    });
  }
}

/**
 * Validates conversion options configuration
 */
function validateConversionOptions(colorLibrary: Record<string, unknown>, errors: ValidationError[]): void {
  if (!colorLibrary.conversionOptions) {
    errors.push({
      field: 'colorLibrary.conversionOptions',
      message: 'conversionOptions is required',
      expectedRange: '{ outputFormat: "hex"|"oklch"|"rgb", preserveOriginal: boolean }'
    });
    return;
  }

  const options = colorLibrary.conversionOptions as Record<string, unknown>;

  const validFormats = ['hex', 'oklch', 'rgb'];
  if (!validFormats.includes(options.outputFormat as string)) {
    errors.push({
      field: 'colorLibrary.conversionOptions.outputFormat',
      message: 'outputFormat must be one of: hex, oklch, rgb',
      value: options.outputFormat,
      expectedRange: 'hex|oklch|rgb'
    });
  }

  if (typeof options.preserveOriginal !== 'boolean') {
    errors.push({
      field: 'colorLibrary.conversionOptions.preserveOriginal',
      message: 'preserveOriginal must be a boolean',
      value: options.preserveOriginal,
      expectedRange: 'true|false'
    });
  }
}

/**
 * Validates brand-specific configuration
 */
function validateBrandSpecific(
  brandSpecific: unknown, 
  errors: ValidationError[], 
  warnings: ValidationWarning[]
): void {
  if (typeof brandSpecific !== 'object' || brandSpecific === null) {
    errors.push({
      field: 'colorLibrary.brandSpecific',
      message: 'brandSpecific must be an object',
      value: brandSpecific
    });
    return;
  }

  const brands = brandSpecific as Record<string, unknown>;

  for (const [brandName, brandConfig] of Object.entries(brands)) {
    // Validate brand name format
    if (!/^[a-zA-Z0-9_-]+$/.test(brandName)) {
      errors.push({
        field: `colorLibrary.brandSpecific.${brandName}`,
        message: 'Brand name must contain only alphanumeric characters, hyphens, and underscores',
        value: brandName,
        expectedRange: '^[a-zA-Z0-9_-]+$'
      });
    }

    if (typeof brandConfig !== 'object' || brandConfig === null) {
      errors.push({
        field: `colorLibrary.brandSpecific.${brandName}`,
        message: 'Brand configuration must be an object',
        value: brandConfig
      });
      continue;
    }

    const config = brandConfig as Record<string, unknown>;

    // Validate lightness adjustment
    if (config.lightnessAdjustment !== undefined) {
      if (typeof config.lightnessAdjustment !== 'number' || 
          config.lightnessAdjustment < -20 || 
          config.lightnessAdjustment > 20) {
        errors.push({
          field: `colorLibrary.brandSpecific.${brandName}.lightnessAdjustment`,
          message: 'lightnessAdjustment must be a number between -20 and 20',
          value: config.lightnessAdjustment,
          expectedRange: '-20 to 20'
        });
      }
    }

    // Validate chroma multiplier
    if (config.chromaMultiplier !== undefined) {
      if (typeof config.chromaMultiplier !== 'number' || 
          config.chromaMultiplier < 0.5 || 
          config.chromaMultiplier > 2.0) {
        errors.push({
          field: `colorLibrary.brandSpecific.${brandName}.chromaMultiplier`,
          message: 'chromaMultiplier must be a number between 0.5 and 2.0',
          value: config.chromaMultiplier,
          expectedRange: '0.5 to 2.0'
        });
      }
    }

    // Validate hue shift
    if (config.hueShift !== undefined) {
      if (typeof config.hueShift !== 'number' || 
          config.hueShift < 0 || 
          config.hueShift > 360) {
        errors.push({
          field: `colorLibrary.brandSpecific.${brandName}.hueShift`,
          message: 'hueShift must be a number between 0 and 360',
          value: config.hueShift,
          expectedRange: '0 to 360'
        });
      }
    }
  }
}

/**
 * Validates color generation configuration
 */
function validateColorGeneration(
  colorGeneration: unknown, 
  errors: ValidationError[], 
  warnings: ValidationWarning[]
): void {
  if (typeof colorGeneration !== 'object' || colorGeneration === null) {
    errors.push({
      field: 'colorLibrary.colorGeneration',
      message: 'colorGeneration must be an object',
      value: colorGeneration
    });
    return;
  }

  const config = colorGeneration as Record<string, unknown>;

  if (typeof config.rampSteps !== 'number' || config.rampSteps < 3 || config.rampSteps > 15) {
    errors.push({
      field: 'colorLibrary.colorGeneration.rampSteps',
      message: 'rampSteps must be a number between 3 and 15',
      value: config.rampSteps,
      expectedRange: '3-15'
    });
  }

  if (typeof config.preserveKeyColors !== 'boolean') {
    errors.push({
      field: 'colorLibrary.colorGeneration.preserveKeyColors',
      message: 'preserveKeyColors must be a boolean',
      value: config.preserveKeyColors,
      expectedRange: 'true|false'
    });
  }

  if (typeof config.algorithmicGeneration !== 'boolean') {
    errors.push({
      field: 'colorLibrary.colorGeneration.algorithmicGeneration',
      message: 'algorithmicGeneration must be a boolean',
      value: config.algorithmicGeneration,
      expectedRange: 'true|false'
    });
  }

  // Performance warnings
  if (typeof config.rampSteps === 'number' && config.rampSteps > 11) {
    warnings.push({
      field: 'colorLibrary.colorGeneration.rampSteps',
      message: 'Large number of ramp steps may impact performance',
      recommendation: 'Consider 5-11 steps for optimal performance and usability'
    });
  }
}