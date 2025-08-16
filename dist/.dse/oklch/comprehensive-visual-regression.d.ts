/**
 * Comprehensive Visual Regression Testing
 * Validates that all OKLCH optimization changes are imperceptible (Delta E < 2.0)
 */
export interface VisualRegressionReport {
    totalColors: number;
    imperceptibleChanges: number;
    perceptibleChanges: number;
    averageDeltaE: number;
    maxDeltaE: number;
    passRate: number;
    colorsByFamily: Record<string, {
        total: number;
        imperceptible: number;
        averageDeltaE: number;
        maxDeltaE: number;
    }>;
    violations: Array<{
        family: string;
        color: string;
        original: string;
        optimized: string;
        deltaE: number;
    }>;
}
export declare class VisualRegressionTester {
    /**
     * Load original colors from a backup or reference
     */
    private static loadOriginalColors;
    /**
     * Load current optimized tokens
     */
    private static loadCurrentTokens;
    /**
     * Extract all colors from token structure
     */
    private static extractAllColors;
    /**
     * Test visual regression by comparing original vs optimized colors
     */
    static testVisualRegression(): VisualRegressionReport;
    /**
     * Determine if a family is neutral based on name
     */
    private static isNeutralFamily;
    /**
     * Simulate neutral optimization to get expected result
     */
    private static simulateNeutralOptimization;
    /**
     * Simulate brand optimization to get expected result
     */
    private static simulateBrandOptimization;
    /**
     * Get reference optimized color for comparison
     */
    private static getReferenceOptimized;
    /**
     * Generate comprehensive visual regression report
     */
    static generateVisualRegressionReport(): void;
}
//# sourceMappingURL=comprehensive-visual-regression.d.ts.map