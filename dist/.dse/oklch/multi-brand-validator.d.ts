/**
 * Multi-Brand Validator
 * Validates OKLCH optimization across all brands while ensuring brand differentiation
 */
export interface BrandProfile {
    name: string;
    primaryColors: Record<string, string>;
    neutrals: Record<string, string>;
    accessibility: {
        aaCompliant: number;
        aaaCompliant: number;
        totalColors: number;
    };
    characteristics: {
        averageHue: number;
        averageChroma: number;
        hueDominance: string;
    };
}
export interface CrossBrandAnalysis {
    brandDifferentiation: {
        baseVsLogifuture: number;
        baseVsBet9ja: number;
        logifutureVsBet9ja: number;
    };
    harmonyScore: number;
    accessibilityCompliance: {
        allBrandsAA: boolean;
        allBrandsAAA: boolean;
    };
}
export declare class MultiBrandValidator {
    /**
     * Extract brand-specific colors from core tokens
     */
    static extractBrandColors(coreTokens: any): {
        base: BrandProfile;
        logifuture: BrandProfile;
        bet9ja: BrandProfile;
    };
    /**
     * Calculate brand characteristics from colors
     */
    static calculateBrandCharacteristics(colors: Record<string, string>): {
        averageHue: number;
        averageChroma: number;
        hueDominance: string;
    };
    /**
     * Analyze accessibility compliance for brand colors
     */
    static analyzeAccessibility(colors: Record<string, string>): {
        aaCompliant: number;
        aaaCompliant: number;
        totalColors: number;
    };
    /**
     * Perform cross-brand analysis for differentiation and harmony
     */
    static analyzeCrossBrandRelationships(base: BrandProfile, logifuture: BrandProfile, bet9ja: BrandProfile): CrossBrandAnalysis;
    /**
     * Complete multi-brand validation
     */
    static validateMultiBrandIntegration(): {
        brands: {
            base: BrandProfile;
            logifuture: BrandProfile;
            bet9ja: BrandProfile;
        };
        crossBrandAnalysis: CrossBrandAnalysis;
        validationResults: {
            brandDifferentiationMaintained: boolean;
            mathematicalHarmonyAchieved: boolean;
            accessibilityComplianceMet: boolean;
            overallSuccess: boolean;
        };
    };
}
//# sourceMappingURL=multi-brand-validator.d.ts.map