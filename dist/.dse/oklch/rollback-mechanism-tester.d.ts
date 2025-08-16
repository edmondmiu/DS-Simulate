/**
 * Rollback Mechanism Tester
 * Tests and validates complete rollback mechanisms for OKLCH optimization
 */
export interface RollbackTestResult {
    testName: string;
    success: boolean;
    details: string;
    executionTime: number;
}
export interface RollbackReport {
    testDate: string;
    totalTests: number;
    passedTests: number;
    failedTests: number;
    passRate: number;
    results: RollbackTestResult[];
    gitStatus: {
        hasChanges: boolean;
        currentBranch: string;
        lastCommit: string;
    };
    rollbackStrategies: {
        gitRollback: RollbackTestResult;
        fileBackup: RollbackTestResult;
        configurationReset: RollbackTestResult;
        tokenValidation: RollbackTestResult;
    };
    recommendations: string[];
}
export declare class RollbackTester {
    /**
     * Execute a test with timing
     */
    private static executeTest;
    /**
     * Check Git status and availability
     */
    private static checkGitStatus;
    /**
     * Test Git-based rollback mechanism
     */
    private static testGitRollback;
    /**
     * Test file backup and restoration mechanism
     */
    private static testFileBackup;
    /**
     * Test configuration reset mechanism
     */
    private static testConfigurationReset;
    /**
     * Test token validation after rollback
     */
    private static testTokenValidation;
    /**
     * Generate rollback recommendations
     */
    private static generateRecommendations;
    /**
     * Comprehensive rollback mechanism testing
     */
    static testRollbackMechanisms(): RollbackReport;
    /**
     * Generate comprehensive rollback test report
     */
    static generateRollbackReport(): void;
}
//# sourceMappingURL=rollback-mechanism-tester.d.ts.map