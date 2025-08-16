/**
 * Neutral Color Family Optimizer
 * Optimizes all neutral families using Cool Neutral 300 as mathematical base
 */
import { OKLCHColor } from './base-color-analyzer.js';
export interface NeutralFamily {
    name: string;
    colors: Record<string, string>;
    optimized?: Record<string, string>;
    deltaE?: Record<string, number>;
}
export interface OptimizationResult {
    family: NeutralFamily;
    allValid: boolean;
    averageDeltaE: number;
    maxDeltaE: number;
}
export declare class NeutralOptimizer {
    private static coolNeutralBase;
    private static lightnessSteps;
    /**
     * Optimize a single neutral color using Cool Neutral base mathematics
     */
    static optimizeNeutralColor(originalHex: string, targetLightness: number): {
        optimized: string;
        deltaE: number;
        oklch: OKLCHColor;
    };
    /**
     * Optimize entire neutral family using consistent lightness stepping
     */
    static optimizeNeutralFamily(family: NeutralFamily): OptimizationResult;
    /**
     * Extract neutral families from core.json structure
     */
    static extractNeutralFamilies(coreTokens: any): NeutralFamily[];
    /**
     * Optimize all neutral families
     */
    static optimizeAllNeutralFamilies(coreTokens: any): {
        results: OptimizationResult[];
        summary: {
            totalFamilies: number;
            validFamilies: number;
            averageDeltaE: number;
            maxDeltaE: number;
        };
    };
}
//# sourceMappingURL=neutral-optimizer.d.ts.map