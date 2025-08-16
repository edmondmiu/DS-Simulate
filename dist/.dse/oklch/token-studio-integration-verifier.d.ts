/**
 * Token Studio Integration Verifier
 * Verifies Token Studio integration across all designer workflows
 */
export interface TokenStudioTestResult {
    testName: string;
    success: boolean;
    details: string;
    warnings: string[];
}
export interface TokenStudioReport {
    testDate: string;
    totalTests: number;
    passedTests: number;
    failedTests: number;
    warningCount: number;
    passRate: number;
    results: TokenStudioTestResult[];
    fileStructure: {
        coreTokens: boolean;
        tokensourceGeneration: boolean;
        brandTokens: boolean;
        semanticTokens: boolean;
    };
    workflowValidation: {
        consolidateWorkflow: TokenStudioTestResult;
        splitWorkflow: TokenStudioTestResult;
        brandSwitching: TokenStudioTestResult;
        colorValidation: TokenStudioTestResult;
    };
    recommendations: string[];
}
export declare class TokenStudioVerifier {
    /**
     * Execute a test with error handling
     */
    private static executeTest;
    /**
     * Verify core token file structure
     */
    private static verifyFileStructure;
    /**
     * Test consolidate workflow compatibility
     */
    private static testConsolidateWorkflow;
    /**
     * Test split workflow compatibility
     */
    private static testSplitWorkflow;
    /**
     * Test brand switching functionality
     */
    private static testBrandSwitching;
    /**
     * Test color validation and Token Studio compatibility
     */
    private static testColorValidation;
    /**
     * Generate Token Studio recommendations
     */
    private static generateRecommendations;
    /**
     * Comprehensive Token Studio integration verification
     */
    static verifyTokenStudioIntegration(): TokenStudioReport;
    /**
     * Generate comprehensive Token Studio integration report
     */
    static generateTokenStudioReport(): void;
}
//# sourceMappingURL=token-studio-integration-verifier.d.ts.map