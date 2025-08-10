/**
 * Advanced color relationship validation for DSE color system
 * Handles token dependencies, circular references, and complex color relationships
 */
export interface TokenRelationship {
    source: string;
    target: string;
    type: 'direct' | 'indirect' | 'composition' | 'inheritance';
    depth: number;
    valid: boolean;
    issues: RelationshipIssue[];
}
export interface RelationshipIssue {
    type: 'circular' | 'missing' | 'type_mismatch' | 'depth_exceeded' | 'composition_error';
    severity: 'error' | 'warning';
    message: string;
    path: string[];
    suggestion?: string;
}
export interface RelationshipValidationResult {
    tokenPath: string;
    valid: boolean;
    relationships: TokenRelationship[];
    dependencyChain: string[];
    maxDepth: number;
    errors: RelationshipError[];
    warnings: RelationshipWarning[];
    suggestions: RelationshipSuggestion[];
}
export interface RelationshipError {
    type: 'circular_reference' | 'missing_reference' | 'invalid_reference' | 'max_depth_exceeded';
    severity: 'error' | 'warning';
    message: string;
    tokenPath: string;
    referencePath: string;
    dependencyChain: string[];
}
export interface RelationshipWarning {
    type: 'deep_nesting' | 'complex_composition' | 'performance' | 'maintainability';
    message: string;
    recommendation: string;
    affectedTokens: string[];
}
export interface RelationshipSuggestion {
    type: 'simplify' | 'flatten' | 'restructure' | 'optimize';
    message: string;
    currentStructure: string;
    suggestedStructure: string;
    benefit: string;
}
export interface ColorComposition {
    operation: 'blend' | 'mix' | 'adjust' | 'lighten' | 'darken' | 'saturate' | 'desaturate';
    baseColor: string;
    modifierColor?: string;
    modifierValue?: number;
    result: string;
}
export interface TokenHierarchy {
    tokenPath: string;
    level: number;
    children: TokenHierarchy[];
    parent?: string;
    directDependencies: string[];
    totalDependencies: number;
}
export declare class RelationshipValidator {
    private maxDepth;
    private maxReferences;
    private visitedTokens;
    private relationshipCache;
    private hierarchyCache;
    /**
     * Validates token reference chains for circular dependencies and depth limits
     */
    validateReferenceChain(tokenPath: string, tokenValue: any, tokenSet: Record<string, any>, visited?: Set<string>, depth?: number): RelationshipValidationResult;
    /**
     * Validates complex token compositions and calculations
     */
    private validateTokenComposition;
    /**
     * Resolves a token reference path to its value
     */
    private resolveTokenReference;
    /**
     * Detects circular references across the entire token set
     */
    detectCircularReferences(tokenSet: Record<string, any>): RelationshipError[];
    /**
     * Builds token hierarchy for dependency analysis
     */
    buildTokenHierarchy(tokenSet: Record<string, any>): TokenHierarchy[];
    /**
     * Builds hierarchy for a single token
     */
    private buildSingleTokenHierarchy;
    /**
     * Extracts dependency paths from a token value
     */
    private extractDependencies;
    /**
     * Validates color alias relationships for proper resolution
     */
    validateColorAliases(tokenSet: Record<string, any>): RelationshipError[];
    /**
     * Analyzes token inheritance patterns across token sets
     */
    analyzeTokenInheritance(tokenSet: Record<string, any>): {
        inheritanceChains: TokenHierarchy[];
        orphanTokens: string[];
        rootTokens: string[];
        complexChains: string[];
    };
    /**
     * Validates cross-token-set references
     */
    validateCrossSetReferences(tokenSets: Record<string, any>): RelationshipError[];
    /**
     * Optimizes token structure by suggesting improvements
     */
    suggestOptimizations(tokenSet: Record<string, any>): RelationshipSuggestion[];
    /**
     * Updates validation limits
     */
    updateLimits(maxDepth?: number, maxReferences?: number): void;
}
export declare const relationshipValidator: RelationshipValidator;
//# sourceMappingURL=relationship-validator.d.ts.map