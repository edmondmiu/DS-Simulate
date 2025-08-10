/**
 * OKLCH-based accessibility validation for DSE color system
 * Provides perceptually accurate contrast ratio calculations and WCAG compliance checking
 */
import type { OKLCH } from 'culori';
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
export declare class AccessibilityValidator {
    private readonly defaultThresholds;
    private thresholds;
    private contrastCache;
    private deltaECache;
    constructor(customThresholds?: Partial<AccessibilityThresholds>);
    /**
     * Calculates contrast ratio using OKLCH lightness values for perceptual accuracy
     */
    calculateOKLCHContrast(color1: OKLCH, color2: OKLCH): number;
    /**
     * Calculates standard WCAG contrast ratio for comparison
     */
    calculateWCAGContrast(foregroundColor: string, backgroundColor: string): number;
    /**
     * Calculates perceptual color difference using Delta E in OKLCH space
     */
    calculateDeltaE(color1: string, color2: string): number;
    /**
     * Determines WCAG compliance level based on contrast ratio and text size
     */
    getWCAGLevel(contrastRatio: number, textSize?: 'normal' | 'large'): 'AA' | 'AAA' | 'fail';
    /**
     * Suggests accessible color using OKLCH adjustments
     */
    suggestAccessibleColor(baseColor: OKLCH, targetColor: OKLCH, targetContrast: number, adjustForeground?: boolean): AccessibilitySuggestion;
    /**
     * Validates accessibility for a color pair with comprehensive analysis
     */
    validateColorPair(colorPair: ColorPair, textSize?: 'normal' | 'large'): AccessibilityValidationResult;
    /**
     * Validates multiple color pairs for comprehensive accessibility analysis
     */
    validateColorPairs(colorPairs: ColorPair[], textSize?: 'normal' | 'large'): AccessibilityValidationResult[];
    /**
     * Generates accessibility report for a set of color combinations
     */
    generateAccessibilityReport(colorPairs: ColorPair[]): {
        summary: {
            total: number;
            passing: number;
            aa: number;
            aaa: number;
            failing: number;
        };
        results: AccessibilityValidationResult[];
        recommendations: string[];
    };
    /**
     * Updates accessibility thresholds (useful for brand-specific requirements)
     */
    updateThresholds(newThresholds: Partial<AccessibilityThresholds>): void;
    /**
     * Gets current accessibility thresholds
     */
    getThresholds(): AccessibilityThresholds;
}
export declare const accessibilityValidator: AccessibilityValidator;
//# sourceMappingURL=accessibility-validator.d.ts.map