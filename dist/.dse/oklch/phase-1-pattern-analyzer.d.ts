/**
 * Phase 1: Pattern Analyzer for Dark Mode Color Families
 * Extracts OKLCH lightness stepping mathematics from proven "good" families
 */
export interface OKLCHColor {
    l: number;
    c: number;
    h: number;
}
interface ColorFamily {
    name: string;
    colors: {
        [key: string]: string;
    };
    oklchData: {
        [key: string]: OKLCHColor;
    };
    lightnessProgression: number[];
    stepDifferences: number[];
    consistency: {
        averageStepSize: number;
        standardDeviation: number;
        smoothness: number;
    };
}
interface PatternAnalysis {
    goodFamilies: ColorFamily[];
    idealSteppingPattern: {
        averageStepSize: number;
        optimalProgression: number[];
        mathematicalFormula: string;
    };
    problematicFamilies: ColorFamily[];
    recommendations: string[];
}
export declare class Phase1PatternAnalyzer {
    private static readonly GOOD_FAMILIES;
    private static readonly PROBLEMATIC_FAMILIES;
    /**
     * Extract color family data from tokens
     */
    private static extractColorFamily;
    /**
     * Extract step number from color key (e.g., "Amber 500" -> 500)
     */
    private static extractStepNumber;
    /**
     * Analyze all color families and extract patterns
     */
    static analyzePatterns(): Promise<PatternAnalysis>;
    /**
     * Generate HTML visualization of pattern analysis
     */
    static generateHTMLVisualization(analysis: PatternAnalysis): string;
}
export {};
//# sourceMappingURL=phase-1-pattern-analyzer.d.ts.map