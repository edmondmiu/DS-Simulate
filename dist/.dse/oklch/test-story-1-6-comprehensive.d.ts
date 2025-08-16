/**
 * Story 1.6: Comprehensive Testing and Rollback Preparation - Full Validation
 * End-to-end validation of all OKLCH optimization with complete Epic 4 validation
 */
export interface ComprehensiveValidationReport {
    testDate: string;
    epicStatus: 'COMPLETE' | 'INCOMPLETE';
    storyResults: {
        story11: boolean;
        story12: boolean;
        story13: boolean;
        story14: boolean;
        story15: boolean;
        story16: boolean;
    };
    acceptanceCriteriaResults: {
        ac1_visualRegression: boolean;
        ac2_accessibilityCompliance: boolean;
        ac3_performanceImpact: boolean;
        ac4_rollbackMechanism: boolean;
        ac5_tokenStudioIntegration: boolean;
    };
    integrationVerificationResults: {
        iv1_existingFunctionality: boolean;
        iv2_buildDeployment: boolean;
    };
    systemMetrics: {
        totalColorsOptimized: number;
        averageDeltaE: number;
        maxDeltaE: number;
        accessibilityPassRate: number;
        performanceImpact: number;
        rollbackSuccess: number;
        tokenStudioCompatibility: number;
    };
    qualityGates: {
        visualFidelity: boolean;
        accessibilityStandards: boolean;
        performanceThresholds: boolean;
        rollbackCapability: boolean;
        designerWorkflow: boolean;
    };
    epic4Summary: {
        storiesCompleted: number;
        totalStories: number;
        completionRate: number;
        readyForProduction: boolean;
    };
    recommendations: string[];
}
export declare class ComprehensiveValidator {
    /**
     * Load Story 1.1-1.5 completion status from existing reports
     */
    private static loadPreviousStoryResults;
    /**
     * Count total optimized colors from core.json
     */
    private static countOptimizedColors;
    /**
     * Generate final recommendations based on all test results
     */
    private static generateComprehensiveRecommendations;
    /**
     * Run comprehensive validation of all Story 1.6 components
     */
    static runComprehensiveValidation(): ComprehensiveValidationReport;
    /**
     * Generate final comprehensive test report
     */
    static generateFinalReport(): void;
}
//# sourceMappingURL=test-story-1-6-comprehensive.d.ts.map