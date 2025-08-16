/**
 * Accessibility Compliance Validator
 * Validates WCAG compliance across all color combinations and use cases
 */
export interface AccessibilityTestResult {
    combination: string;
    foreground: string;
    background: string;
    contrastRatio: number;
    wcagAA: boolean;
    wcagAAA: boolean;
    usage: string[];
}
export interface AccessibilityReport {
    totalCombinations: number;
    aaCompliant: number;
    aaaCompliant: number;
    aaPassRate: number;
    aaaPassRate: number;
    averageContrast: number;
    backgroundsByType: Record<string, AccessibilityTestResult[]>;
    violations: AccessibilityTestResult[];
    recommendations: string[];
}
export declare class AccessibilityValidator {
    /**
     * Load color tokens
     */
    private static loadTokens;
    /**
     * Extract colors by usage category
     */
    private static categorizeColors;
    /**
     * Calculate contrast ratio between two colors
     */
    private static calculateContrast;
    /**
     * Test accessibility for specific color combinations
     */
    private static testColorCombinations;
    /**
     * Test brand color accessibility across contexts
     */
    private static testBrandAccessibility;
    /**
     * Test multi-brand accessibility
     */
    private static testMultiBrandAccessibility;
    /**
     * Generate accessibility recommendations
     */
    private static generateRecommendations;
    /**
     * Comprehensive accessibility validation
     */
    static validateAccessibility(): AccessibilityReport;
    /**
     * Generate comprehensive accessibility report
     */
    static generateAccessibilityReport(): void;
}
//# sourceMappingURL=accessibility-compliance-validator.d.ts.map