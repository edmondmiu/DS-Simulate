/**
 * Automated accessibility reporting and validation summary for DSE color system
 * Generates comprehensive reports with specific recommendations and exportable formats
 */
import { ColorValidationResult } from './color-validator.js';
import { AccessibilityValidationResult, ColorPair } from './accessibility-validator.js';
import { BrandTheme, BrandConsistencyResult } from './brand-consistency-validator.js';
import { RelationshipValidationResult } from './relationship-validator.js';
export interface ValidationReport {
    summary: ValidationSummary;
    colorValidation: ColorValidationSection;
    accessibilityValidation: AccessibilityValidationSection;
    brandConsistency: BrandConsistencySection;
    relationships: RelationshipSection;
    recommendations: RecommendationSection;
    metadata: ReportMetadata;
}
export interface ValidationSummary {
    totalTokens: number;
    colorTokens: number;
    validTokens: number;
    invalidTokens: number;
    overallScore: number;
    passedValidations: number;
    totalValidations: number;
    criticalIssues: number;
    warnings: number;
}
export interface ColorValidationSection {
    summary: {
        total: number;
        valid: number;
        formatIssues: number;
        rangeIssues: number;
        referenceIssues: number;
    };
    results: ColorValidationResult[];
    formatDistribution: Record<string, number>;
    commonIssues: IssueFrequency[];
}
export interface AccessibilityValidationSection {
    summary: {
        total: number;
        aaCompliant: number;
        aaaCompliant: number;
        failing: number;
        averageContrast: number;
    };
    results: AccessibilityValidationResult[];
    contrastDistribution: ContrastDistribution;
    recommendations: AccessibilityRecommendation[];
    criticalFailures: AccessibilityValidationResult[];
}
export interface BrandConsistencySection {
    summary: {
        totalBrands: number;
        consistentBrands: number;
        averageHarmonyScore: number;
        semanticConsistency: number;
    };
    results: BrandConsistencyResult[];
    harmonyAnalysis: HarmonyAnalysis;
    crossBrandIssues: string[];
}
export interface RelationshipSection {
    summary: {
        totalReferences: number;
        circularReferences: number;
        missingReferences: number;
        averageDepth: number;
        maxDepth: number;
    };
    results: RelationshipValidationResult[];
    dependencyAnalysis: DependencyAnalysis;
    optimizationSuggestions: string[];
}
export interface RecommendationSection {
    critical: Recommendation[];
    important: Recommendation[];
    suggestions: Recommendation[];
    quickFixes: QuickFix[];
}
export interface ReportMetadata {
    generatedAt: string;
    generatedBy: string;
    version: string;
    tokensAnalyzed: number;
    processingTime: number;
    configurationUsed: any;
}
export interface IssueFrequency {
    issue: string;
    count: number;
    percentage: number;
    examples: string[];
}
export interface ContrastDistribution {
    excellent: number;
    good: number;
    poor: number;
    failing: number;
}
export interface AccessibilityRecommendation {
    tokenPair: string;
    currentContrast: number;
    targetContrast: number;
    recommendation: string;
    suggestedColors: {
        foreground?: string;
        background?: string;
    };
    impact: 'critical' | 'important' | 'minor';
}
export interface HarmonyAnalysis {
    averageScore: number;
    bestHarmony: {
        brand: string;
        score: number;
    };
    worstHarmony: {
        brand: string;
        score: number;
    };
    harmonyDistribution: Record<string, number>;
}
export interface DependencyAnalysis {
    deepestChain: {
        token: string;
        depth: number;
    };
    mostComplex: {
        token: string;
        dependencies: number;
    };
    orphanTokens: string[];
    circularChains: string[];
}
export interface Recommendation {
    priority: 'critical' | 'high' | 'medium' | 'low';
    category: 'accessibility' | 'consistency' | 'performance' | 'maintainability';
    title: string;
    description: string;
    affectedTokens: string[];
    effort: 'low' | 'medium' | 'high';
    impact: 'low' | 'medium' | 'high';
    actionItems: string[];
}
export interface QuickFix {
    token: string;
    issue: string;
    fix: string;
    beforeValue: string;
    afterValue: string;
    confidence: number;
}
export declare class ValidationReporter {
    private startTime;
    private config;
    /**
     * Generates a comprehensive validation report
     */
    generateReport(tokenSet: Record<string, any>, brandThemes?: BrandTheme[], colorPairs?: ColorPair[], config?: any): Promise<ValidationReport>;
    /**
     * Runs color format and range validation
     */
    private runColorValidation;
    /**
     * Runs accessibility validation for color pairs
     */
    private runAccessibilityValidation;
    /**
     * Runs brand consistency validation
     */
    private runBrandConsistencyValidation;
    /**
     * Runs relationship and dependency validation
     */
    private runRelationshipValidation;
    /**
     * Generates overall validation summary
     */
    private generateSummary;
    /**
     * Generates color validation section
     */
    private generateColorValidationSection;
    /**
     * Generates accessibility validation section
     */
    private generateAccessibilitySection;
    /**
     * Generates brand consistency section
     */
    private generateBrandConsistencySection;
    /**
     * Generates relationship validation section
     */
    private generateRelationshipSection;
    /**
     * Generates comprehensive recommendations
     */
    private generateRecommendations;
    /**
     * Generates report metadata
     */
    private generateMetadata;
    /**
     * Counts tokens in a token set recursively
     */
    private countTokens;
    /**
     * Exports report to JSON file
     */
    exportToJSON(report: ValidationReport, outputPath: string): Promise<void>;
    /**
     * Exports report to HTML file with styling
     */
    exportToHTML(report: ValidationReport, outputPath: string): Promise<void>;
    /**
     * Generates HTML report content
     */
    private generateHTMLReport;
    /**
     * Exports summary report to CSV
     */
    exportSummaryToCSV(report: ValidationReport, outputPath: string): Promise<void>;
}
export declare const validationReporter: ValidationReporter;
//# sourceMappingURL=validation-reporter.d.ts.map