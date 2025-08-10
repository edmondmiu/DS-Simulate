/**
 * OKLCH Color Processing Utilities
 * Comprehensive OKLCH color space conversion and generation utilities
 * Following TypeScript 5.4.5 strict typing standards
 */
/**
 * OKLCH color representation
 */
export interface OKLCHColor {
    l: number;
    c: number;
    h: number;
}
/**
 * Color conversion result with validation info
 */
export interface ColorConversionResult {
    success: boolean;
    color: string;
    originalFormat: string;
    oklch?: OKLCHColor;
    warnings: string[];
    error?: string;
}
/**
 * Color ramp generation options
 */
export interface ColorRampOptions {
    steps: number;
    lightnessRange: [number, number];
    preserveChroma: boolean;
    preserveHue: boolean;
}
/**
 * Color generation options for brand-specific variations
 */
export interface ColorGenerationOptions {
    baseColor: OKLCHColor;
    lightnessAdjustment?: number;
    chromaMultiplier?: number;
    hueShift?: number;
}
/**
 * Accessibility validation result
 */
export interface AccessibilityResult {
    contrastRatio: number;
    wcagAA: boolean;
    wcagAAA: boolean;
    recommendation?: string;
}
/**
 * OKLCH Color Processor class with comprehensive color management
 */
export declare class OKLCHColorProcessor {
    private conversionCache;
    /**
     * Parse color value and detect format
     * @param colorValue - Color value in various formats
     * @returns Detected format and parsed color
     */
    parseColorValue(colorValue: string): {
        format: string;
        color: any;
    };
    /**
     * Convert any color format to OKLCH
     * @param colorValue - Input color in any supported format
     * @returns ColorConversionResult with OKLCH representation
     */
    convertToOKLCH(colorValue: string): ColorConversionResult;
    /**
     * Convert OKLCH to hex format
     * @param oklchColor - OKLCH color object
     * @returns ColorConversionResult with hex representation
     */
    convertFromOKLCH(oklchColor: OKLCHColor): ColorConversionResult;
    /**
     * Validate and clamp OKLCH values to valid ranges
     * @param oklchColor - Raw OKLCH color values
     * @param warnings - Array to collect warnings
     * @returns Validated OKLCH color
     */
    private validateOKLCHValues;
    /**
     * Generate perceptually uniform color ramp using OKLCH
     * @param baseOKLCH - Base OKLCH color for the ramp
     * @param options - Ramp generation options
     * @returns Array of hex colors forming a perceptually uniform ramp
     */
    generateColorRamp(baseOKLCH: OKLCHColor, options: ColorRampOptions): ColorConversionResult[];
    /**
     * Generate brand-specific color variation
     * @param options - Brand color generation options
     * @returns Converted color result
     */
    generateBrandColor(options: ColorGenerationOptions): ColorConversionResult;
    /**
     * Calculate contrast ratio using OKLCH lightness values
     * @param color1 - First color in OKLCH
     * @param color2 - Second color in OKLCH
     * @returns Contrast ratio (1-21)
     */
    calculateContrastRatio(color1: OKLCHColor, color2: OKLCHColor): number;
    /**
     * Validate color accessibility using OKLCH metrics
     * @param foreground - Foreground color in OKLCH
     * @param background - Background color in OKLCH
     * @returns Accessibility validation result
     */
    validateAccessibility(foreground: OKLCHColor, background: OKLCHColor): AccessibilityResult;
    /**
     * Calculate visual difference between two colors using Delta E
     * @param color1 - First OKLCH color
     * @param color2 - Second OKLCH color
     * @returns Delta E difference (lower values = more similar)
     */
    calculateColorDifference(color1: OKLCHColor, color2: OKLCHColor): number;
    /**
     * Clear conversion cache (useful for testing and memory management)
     */
    clearCache(): void;
    /**
     * Get cache statistics for performance monitoring
     * @returns Cache size and hit rate information
     */
    getCacheStats(): {
        size: number;
        maxSize: number;
    };
}
/**
 * Default OKLCH color processor instance (singleton pattern)
 */
export declare const defaultOKLCHProcessor: OKLCHColorProcessor;
/**
 * Utility functions for common OKLCH operations
 */
/**
 * Quick conversion from any color format to OKLCH
 * @param colorValue - Color value in any format
 * @returns OKLCH color object or null if conversion fails
 */
export declare function toOKLCH(colorValue: string): OKLCHColor | null;
/**
 * Quick conversion from OKLCH to hex
 * @param oklchColor - OKLCH color object
 * @returns Hex color string or null if conversion fails
 */
export declare function fromOKLCH(oklchColor: OKLCHColor): string | null;
/**
 * Generate accessible color pair with specified contrast ratio
 * @param baseColor - Base OKLCH color
 * @param targetContrast - Target contrast ratio (4.5 for AA, 7.0 for AAA)
 * @returns Accessible color pair or null if generation fails
 */
export declare function generateAccessiblePair(baseColor: OKLCHColor, targetContrast?: number): {
    base: string;
    accessible: string;
} | null;
//# sourceMappingURL=oklch-color-processor.d.ts.map