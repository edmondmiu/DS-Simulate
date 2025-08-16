/**
 * Performance Impact Analyzer
 * Measures and documents performance impact of OKLCH optimization
 */
/// <reference types="node" resolution-mode="require"/>
export interface PerformanceMetrics {
    operation: string;
    iterations: number;
    totalTime: number;
    averageTime: number;
    minTime: number;
    maxTime: number;
    throughput: number;
}
export interface PerformanceReport {
    testDate: string;
    environment: {
        nodeVersion: string;
        platform: string;
        memoryUsage: NodeJS.MemoryUsage;
    };
    colorProcessing: {
        oklchConversion: PerformanceMetrics;
        deltaECalculation: PerformanceMetrics;
        neutralOptimization: PerformanceMetrics;
        brandOptimization: PerformanceMetrics;
        multiBrandValidation: PerformanceMetrics;
    };
    fileOperations: {
        tokenLoading: PerformanceMetrics;
        tokenWriting: PerformanceMetrics;
        configurationLoading: PerformanceMetrics;
    };
    systemImpact: {
        buildTimeImpact: number;
        memoryOverhead: number;
        cpuUsageIncrease: number;
    };
    recommendations: string[];
}
export declare class PerformanceAnalyzer {
    /**
     * Measure execution time of a function
     */
    private static measureTime;
    /**
     * Measure execution time over multiple iterations
     */
    private static measureIterations;
    /**
     * Test OKLCH conversion performance
     */
    private static testOklchConversion;
    /**
     * Test Delta E calculation performance
     */
    private static testDeltaECalculation;
    /**
     * Test neutral optimization performance
     */
    private static testNeutralOptimization;
    /**
     * Test brand optimization performance
     */
    private static testBrandOptimization;
    /**
     * Test multi-brand validation performance
     */
    private static testMultiBrandValidation;
    /**
     * Test file operation performance
     */
    private static testFileOperations;
    /**
     * Measure system-wide impact
     */
    private static measureSystemImpact;
    /**
     * Generate performance recommendations
     */
    private static generateRecommendations;
    /**
     * Comprehensive performance analysis
     */
    static analyzePerformance(): PerformanceReport;
    /**
     * Generate comprehensive performance report
     */
    static generatePerformanceReport(): void;
}
//# sourceMappingURL=performance-impact-analyzer.d.ts.map