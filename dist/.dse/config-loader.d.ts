/**
 * DSE Configuration Loader
 * Handles loading and caching of DSE-specific configurations
 * Following TypeScript 5.4.5 strict typing and coding standards
 */
import { ColorLibraryConfig, ValidationResult } from './schema.js';
/**
 * Configuration loader with caching for DSE settings
 */
export declare class DSEConfigLoader {
    private static instance;
    private colorLibraryConfig;
    private dseDirectory;
    constructor(dseDirectory?: string);
    /**
     * Get singleton instance of configuration loader
     * @param dseDirectory - Path to DSE configuration directory
     * @returns DSEConfigLoader instance
     */
    static getInstance(dseDirectory?: string): DSEConfigLoader;
    /**
     * Load and validate color library configuration
     * @returns ColorLibraryConfig with validation
     */
    loadColorLibraryConfig(): {
        config: ColorLibraryConfig;
        validation: ValidationResult;
    };
    /**
     * Get brand-specific configuration for a token set
     * @param tokenSetName - Name of the token set (e.g., 'bet9ja', 'global')
     * @returns Brand-specific configuration or undefined
     */
    getBrandConfig(tokenSetName: string): {
        lightnessAdjustment?: number;
        chromaMultiplier?: number;
        hueShift?: number;
    } | undefined;
    /**
     * Check if DSE configuration directory exists
     * @returns true if .dse directory exists
     */
    isDSEConfigured(): boolean;
    /**
     * Get DSE directory path
     * @returns Path to DSE configuration directory
     */
    getDSEDirectory(): string;
    /**
     * Clear cached configurations (useful for testing)
     */
    clearCache(): void;
    /**
     * Get accessibility thresholds for contrast validation
     * @returns Accessibility thresholds (AA, AAA)
     */
    getAccessibilityThresholds(): {
        AA: number;
        AAA: number;
    };
    /**
     * Get OKLCH ranges for color generation
     * @returns Lightness and chroma ranges
     */
    getOKLCHRanges(): {
        lightness: {
            min: number;
            max: number;
        };
        chroma: {
            primary: number;
            neutral: number;
        };
    };
    /**
     * Get conversion options for output format
     * @returns Output format preferences
     */
    getConversionOptions(): {
        outputFormat: 'hex' | 'oklch' | 'rgb';
        preserveOriginal: boolean;
    };
    /**
     * Get color generation settings
     * @returns Color generation configuration
     */
    getColorGenerationSettings(): {
        rampSteps: number;
        preserveKeyColors: boolean;
        algorithmicGeneration: boolean;
    } | undefined;
}
/**
 * Convenience function to get DSE configuration loader instance
 * @param dseDirectory - Optional DSE directory path
 * @returns DSEConfigLoader instance
 */
export declare function getDSEConfig(dseDirectory?: string): DSEConfigLoader;
//# sourceMappingURL=config-loader.d.ts.map