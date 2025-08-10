/**
 * Cross-brand consistency validation for DSE color system
 * Ensures color harmony and consistency across multiple brand variations
 */
import type { OKLCH } from 'culori';
export interface BrandTheme {
    name: string;
    colors: Record<string, string>;
    metadata?: {
        primary?: string;
        secondary?: string;
        accent?: string;
        neutral?: string;
    };
}
export interface BrandConsistencyResult {
    brandName: string;
    valid: boolean;
    errors: BrandConsistencyError[];
    warnings: BrandConsistencyWarning[];
    suggestions: BrandConsistencySuggestion[];
    consistencyScore: number;
    colorAnalysis: ColorAnalysis[];
}
export interface BrandConsistencyError {
    type: 'harmony' | 'progression' | 'semantic' | 'deviation';
    severity: 'error' | 'warning';
    message: string;
    colorRole: string;
    actualValue: any;
    expectedRange: string;
    affectedTokens: string[];
}
export interface BrandConsistencyWarning {
    type: 'harmony' | 'progression' | 'semantic' | 'usability';
    message: string;
    recommendation: string;
    affectedTokens: string[];
}
export interface BrandConsistencySuggestion {
    type: 'lightness' | 'chroma' | 'hue' | 'ramp';
    message: string;
    colorRole: string;
    currentOKLCH: OKLCH;
    suggestedOKLCH: OKLCH;
    suggestedHex: string;
    improvementScore: number;
}
export interface ColorAnalysis {
    tokenPath: string;
    role: 'primary' | 'secondary' | 'accent' | 'neutral' | 'semantic' | 'ramp';
    oklchData: OKLCH;
    harmonyScore: number;
    progressionScore: number;
    issues: string[];
}
export interface ConsistencyRules {
    maxHueDeviation: number;
    maxChromaDeviation: number;
    maxLightnessDeviation: number;
    minProgressionStep: number;
    maxProgressionStep: number;
    requiredSemanticColors: string[];
    harmonyTolerances: {
        complementary: number;
        analogous: number;
        triadic: number;
    };
}
export declare class BrandConsistencyValidator {
    private readonly defaultRules;
    private rules;
    private harmonyCache;
    constructor(customRules?: Partial<ConsistencyRules>);
    /**
     * Calculates hue harmony score based on color theory relationships
     */
    calculateHueHarmony(hues: number[]): number;
    /**
     * Validates lightness progression in color ramps
     */
    validateLightnessProgression(colors: {
        token: string;
        oklch: OKLCH;
    }[]): {
        valid: boolean;
        score: number;
        errors: string[];
        suggestions: string[];
    };
    /**
     * Validates semantic color consistency across brands
     */
    validateSemanticColors(brandThemes: BrandTheme[]): BrandConsistencyError[];
    /**
     * Validates that semantic colors are appropriate for their role
     */
    private validateSemanticAppropriateness;
    /**
     * Calculates hue variance accounting for circular nature of hue
     */
    private calculateHueVariance;
    /**
     * Validates brand color harmony using OKLCH relationships
     */
    validateBrandHarmony(theme: BrandTheme): {
        harmonyScore: number;
        errors: BrandConsistencyError[];
        suggestions: BrandConsistencySuggestion[];
    };
    /**
     * Generates harmonic hues based on color theory
     */
    private generateHarmonicHues;
    /**
     * Validates consistency across multiple brand themes
     */
    validateBrandConsistency(brandThemes: BrandTheme[]): BrandConsistencyResult[];
    /**
     * Extracts color ramps from theme for progression analysis
     */
    private extractColorRamps;
    /**
     * Determines the role of a color based on its token name
     */
    private determineColorRole;
    /**
     * Updates consistency rules
     */
    updateRules(newRules: Partial<ConsistencyRules>): void;
    /**
     * Gets current consistency rules
     */
    getRules(): ConsistencyRules;
}
export declare const brandConsistencyValidator: BrandConsistencyValidator;
//# sourceMappingURL=brand-consistency-validator.d.ts.map