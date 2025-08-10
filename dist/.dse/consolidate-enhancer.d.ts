/**
 * Consolidate Script OKLCH Enhancement
 * Integrates OKLCH color processing into the existing consolidate workflow
 * Following TypeScript 5.4.5 strict typing standards
 */
/**
 * Enhanced options for OKLCH processing
 */
export interface OKLCHProcessingOptions {
    enabled: boolean;
    colorFormat: 'hex' | 'oklch' | 'rgb' | 'preserve';
    generateColorRamps: boolean;
    validateAccessibility: boolean;
    processBrandVariations: boolean;
    verbose: boolean;
}
/**
 * Token processing statistics
 */
export interface ProcessingStats {
    totalTokens: number;
    colorTokens: number;
    processedTokens: number;
    warnings: string[];
    conversionTime: number;
}
/**
 * Consolidated tokens structure
 */
interface ConsolidatedTokens {
    [tokenSetName: string]: any;
}
/**
 * Consolidate script enhancer with OKLCH capabilities
 */
export declare class ConsolidateEnhancer {
    private oklchProcessor;
    private dseConfig;
    private stats;
    constructor();
    /**
     * Check if DSE OKLCH processing should be enabled
     * @returns true if DSE configuration exists and OKLCH should be processed
     */
    shouldEnableOKLCHProcessing(): boolean;
    /**
     * Get OKLCH processing options from CLI arguments and DSE configuration
     * @param cliArgs - Command line arguments
     * @returns Processing options
     */
    getProcessingOptions(cliArgs: string[]): OKLCHProcessingOptions;
    /**
     * Process consolidated tokens with OKLCH enhancements
     * @param consolidatedTokens - Original consolidated tokens
     * @param options - Processing options
     * @returns Enhanced consolidated tokens
     */
    processTokens(consolidatedTokens: ConsolidatedTokens, options: OKLCHProcessingOptions): ConsolidatedTokens;
    /**
     * Process a single token set
     * @param tokenData - Token set data
     * @param tokenSetName - Name of the token set
     * @param options - Processing options
     * @returns Processed token set
     */
    private processTokenSet;
    /**
     * Process a color token with OKLCH enhancements
     * @param token - Color design token
     * @param tokenSetName - Name of the token set
     * @param options - Processing options
     * @returns Enhanced color token
     */
    private processColorToken;
    /**
     * Check if a value is a design token
     * @param value - Value to check
     * @returns true if the value is a design token
     */
    private isDesignToken;
    /**
     * Log processing statistics
     * @param verbose - Whether to log verbose statistics
     */
    private logProcessingStats;
    /**
     * Get processing statistics
     * @returns Current processing statistics
     */
    getStats(): ProcessingStats;
    /**
     * Clear processing cache and reset stats
     */
    reset(): void;
}
/**
 * Default consolidate enhancer instance
 */
export declare const defaultConsolidateEnhancer: ConsolidateEnhancer;
export {};
//# sourceMappingURL=consolidate-enhancer.d.ts.map