/**
 * Color validation system for DSE with OKLCH support
 * Provides comprehensive color format validation, accessibility checks, and consistency analysis
 */
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
export declare class ColorValidator {
    private hexRegex;
    private rgbRegex;
    private oklchRegex;
    private referenceRegex;
    private tokenCache;
    private referenceMap;
    /**
     * Detects the format of a color value and performs basic format validation
     */
    detectColorFormat(value: any): ColorFormatValidation;
    /**
     * Validates a specific color format with comprehensive range and boundary checking
     */
    validateColorFormat(value: string, expectedFormat: ColorFormat): ColorValidationError[];
    /**
     * Validates hex color values with comprehensive checks
     */
    private validateHexColor;
    /**
     * Validates RGB color values
     */
    private validateRGBColor;
    /**
     * Validates OKLCH color values with perceptual accuracy checks
     */
    private validateOKLCHColor;
    /**
     * Validates OKLCH color ranges against perceptual and accessibility guidelines
     */
    private validateOKLCHRange;
    /**
     * Validates token references and resolves dependency chains
     */
    validateTokenReference(referencePath: string, tokenSet: Record<string, any>, visited?: Set<string>): TokenReference;
    /**
     * Validates format consistency across a token set
     */
    validateFormatConsistency(tokens: Record<string, ColorToken>, expectedFormat?: ColorFormat): ColorValidationError[];
    /**
     * Comprehensive color token validation
     */
    validateColorToken(tokenPath: string, token: ColorToken, tokenSet: Record<string, any>): ColorValidationResult;
}
export declare const colorValidator: ColorValidator;
//# sourceMappingURL=color-validator.d.ts.map