/**
 * Brand Color Family Optimizer
 * Optimizes all brand/accent families using Amber 500 as mathematical base
 */
import { OKLCHColor } from './base-color-analyzer.js';
export interface BrandFamily {
    name: string;
    colors: Record<string, string>;
    originalHue?: number;
    originalChroma?: number;
    optimized?: Record<string, string>;
    deltaE?: Record<string, number>;
}
export interface BrandOptimizationResult {
    family: BrandFamily;
    allValid: boolean;
    averageDeltaE: number;
    maxDeltaE: number;
    huePreserved: boolean;
}
export declare class BrandOptimizer {
    private static amberBase;
    private static lightnessSteps;
    /**
     * Extract the dominant hue and chroma from a color family
     */
    private static extractFamilyCharacteristics;
    /**
     * Optimize a single brand color using Amber base mathematics with preserved hue and chroma
     */
    static optimizeBrandColor(originalHex: string, targetLightness: number, familyHue: number, familyChroma: number): {
        optimized: string;
        deltaE: number;
        oklch: OKLCHColor;
    };
    /**
     * Optimize entire brand family using consistent lightness stepping and preserved hue/chroma
     */
    static optimizeBrandFamily(family: BrandFamily): BrandOptimizationResult;
    /**
     * Extract brand families from core.json structure
     */
    static extractBrandFamilies(coreTokens: any): BrandFamily[];
    /**
     * Optimize all brand families
     */
    static optimizeAllBrandFamilies(coreTokens: any): {
        results: BrandOptimizationResult[];
        summary: {
            totalFamilies: number;
            validFamilies: number;
            averageDeltaE: number;
            maxDeltaE: number;
            huesPreserved: number;
        };
    };
}
//# sourceMappingURL=brand-optimizer.d.ts.map