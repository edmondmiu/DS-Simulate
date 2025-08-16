/**
 * OKLCH Color Validator
 * Automatic validation rules for new color additions to ensure OKLCH compliance
 */
import { OKLCHColor } from './base-color-analyzer.js';
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
export declare class ColorValidator {
    private static config;
    /**
     * Load configuration from color-library.json
     */
    private static loadConfig;
    /**
     * Automatically suggest base color based on color characteristics
     */
    static suggestBaseColor(request: NewColorRequest): 'coolNeutral' | 'amber';
    /**
     * Validate color against OKLCH standards
     */
    static validateColor(request: NewColorRequest): ColorValidationResult;
    /**
     * Find closest lightness step in the standardized range
     */
    private static findClosestLightnessStep;
    /**
     * Convert OKLCH to hex
     */
    private static oklchToHex;
    /**
     * Validate brand separation requirements
     */
    private static validateBrandSeparation;
    /**
     * Validate accessibility foundation
     */
    private static validateAccessibilityFoundation;
    /**
     * Generate contextual recommendations
     */
    private static generateRecommendations;
    /**
     * Validate new color batch
     */
    static validateColorBatch(requests: NewColorRequest[]): {
        results: ColorValidationResult[];
        batchSummary: {
            totalColors: number;
            validColors: number;
            needsOptimization: number;
            brandConflicts: number;
            recommendations: string[];
        };
    };
}
//# sourceMappingURL=color-validator.d.ts.map