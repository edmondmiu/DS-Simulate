/**
 * Base Color Analyzer
 * Converts Cool Neutral 300 and Amber 500 to precise OKLCH values
 * and establishes mathematical stepping algorithms
 */
export interface OKLCHColor {
    l: number;
    c: number;
    h: number;
}
export interface BaseColorAnalysis {
    hex: string;
    oklch: OKLCHColor;
    role: 'neutral_foundation' | 'brand_foundation';
    mathematicalProperties: {
        lightnessRange: {
            min: number;
            max: number;
        };
        chromaTarget: number;
        hueStability: number;
    };
}
export declare class BaseColorAnalyzer {
    /**
     * Convert HEX to precise OKLCH values
     */
    static hexToOKLCH(hexColor: string): OKLCHColor;
    /**
     * Convert OKLCH to HEX
     */
    static oklchToHex(color: OKLCHColor): string;
    /**
     * Calculate Delta E between two colors for visual fidelity validation
     */
    static calculateDeltaE(color1: string, color2: string): number;
    /**
     * Analyze Cool Neutral 300 base color
     */
    static analyzeCoolNeutral(): BaseColorAnalysis;
    /**
     * Analyze Amber 500 base color
     */
    static analyzeAmber(): BaseColorAnalysis;
    /**
     * Generate lightness stepping algorithm for 0-1300 range
     */
    static generateLightnessSteps(): number[];
    /**
     * Validate base color mathematical relationships
     */
    static validateBaseColors(): {
        coolNeutral: BaseColorAnalysis;
        amber: BaseColorAnalysis;
        lightnessSteps: number[];
        validation: {
            coolNeutralValid: boolean;
            amberValid: boolean;
            lightnessRangeValid: boolean;
            chromaRelationshipValid: boolean;
        };
    };
}
//# sourceMappingURL=base-color-analyzer.d.ts.map