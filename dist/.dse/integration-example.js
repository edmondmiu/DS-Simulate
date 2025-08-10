/**
 * Integration Example for DSE Configuration
 * Shows how existing scripts should integrate with .dse/ configurations
 * This file serves as documentation and example for script modifications
 */
import { getDSEConfig } from './config-loader.js';
/**
 * Example integration for consolidate.ts script
 * Shows how to load DSE configurations and preserve Token Studio compatibility
 */
export function exampleConsolidateIntegration() {
    // Load DSE configuration loader
    const dseConfig = getDSEConfig();
    // Check if DSE is configured
    if (!dseConfig.isDSEConfigured()) {
        console.log('[DSE] No DSE configuration found, using standard workflow');
        // Continue with existing token processing logic
        return;
    }
    console.log('[DSE] DSE configuration detected, loading color management settings');
    // Load color library configuration
    const { config, validation } = dseConfig.loadColorLibraryConfig();
    if (!validation.isValid) {
        console.error('[DSE] Configuration validation failed, falling back to standard workflow');
        // Continue with existing logic, ignoring DSE configurations
        return;
    }
    // Example: Get configuration for specific token set processing
    const bet9jaBrandConfig = dseConfig.getBrandConfig('bet9ja');
    if (bet9jaBrandConfig) {
        console.log(`[DSE] Found brand configuration for bet9ja: chroma multiplier ${bet9jaBrandConfig.chromaMultiplier}`);
    }
    // Example: Get accessibility settings
    const accessibilityThresholds = dseConfig.getAccessibilityThresholds();
    console.log(`[DSE] Accessibility thresholds - AA: ${accessibilityThresholds.AA}, AAA: ${accessibilityThresholds.AAA}`);
    // Example: Get OKLCH ranges
    const oklchRanges = dseConfig.getOKLCHRanges();
    console.log(`[DSE] OKLCH ranges - Lightness: ${oklchRanges.lightness.min}-${oklchRanges.lightness.max}, Primary chroma: ${oklchRanges.chroma.primary}`);
    // Example: Get output format preferences
    const conversionOptions = dseConfig.getConversionOptions();
    console.log(`[DSE] Output format: ${conversionOptions.outputFormat}, Preserve original: ${conversionOptions.preserveOriginal}`);
}
/**
 * Example architectural separation principles
 * Demonstrates how .dse/ and tokens/ directories work together
 */
export function exampleArchitecturalSeparation() {
    return {
        // DSE-specific configurations (separate from Token Studio)
        dseConfigPath: '.dse/color-library.json',
        // Token Studio mirror (pure Token Studio format)
        tokensPath: 'tokens/',
        // Enhanced output (DSE + Token Studio combined)
        outputPath: 'tokensource.json',
        // Architectural preservation principles
        preservationPrinciples: [
            'tokens/ directory remains pure Token Studio format',
            '.dse/ directory contains only DSE-specific configurations',
            'Consolidate script reads from both .dse/ and tokens/ directories',
            'tokensource.json combines both DSE enhancements and Token Studio data',
            'Split script preserves .dse/ configurations while updating tokens/',
            'Token Studio workflows remain completely unaffected'
        ]
    };
}
/**
 * Example backward compatibility preservation
 * Shows how existing workflows continue to work without DSE
 */
export function exampleBackwardCompatibility() {
    return {
        // Workflow without DSE (existing behavior preserved)
        withoutDSE: [
            '1. Read tokens/ directory Token Studio format files',
            '2. Process tokens according to $metadata.json order',
            '3. Output to tokensource.json with standard format',
            '4. Split script reverses process back to tokens/',
            '5. Token Studio integration works unchanged'
        ],
        // Enhanced workflow with DSE (additive functionality)
        withDSE: [
            '1. Check for .dse/ directory and load configurations',
            '2. Read tokens/ directory Token Studio format files (unchanged)',
            '3. Apply DSE color enhancements during processing',
            '4. Process tokens according to $metadata.json order (unchanged)',
            '5. Output to tokensource.json with DSE enhancements applied',
            '6. Split script preserves DSE configs while updating tokens/ (unchanged)',
            '7. Token Studio integration works unchanged'
        ]
    };
}
/**
 * Example configuration validation workflow
 * Shows how scripts should handle configuration errors
 */
export function exampleConfigurationValidation() {
    const dseConfig = getDSEConfig();
    try {
        const { config, validation } = dseConfig.loadColorLibraryConfig();
        if (!validation.isValid) {
            console.error('[DSE] Configuration validation failed:');
            validation.errors.forEach(error => {
                console.error(`  Field: ${error.field}`);
                console.error(`  Error: ${error.message}`);
                if (error.expectedRange) {
                    console.error(`  Expected: ${error.expectedRange}`);
                }
                console.error('');
            });
            // Graceful fallback to standard workflow
            console.log('[DSE] Falling back to standard token processing workflow');
            return;
        }
        // Display warnings but continue processing
        if (validation.warnings && validation.warnings.length > 0) {
            console.warn('[DSE] Configuration warnings:');
            validation.warnings.forEach(warning => {
                console.warn(`  ${warning.field}: ${warning.message}`);
                console.warn(`  Recommendation: ${warning.recommendation}`);
            });
        }
        console.log('[DSE] Configuration validation successful, proceeding with enhanced workflow');
    }
    catch (error) {
        console.error(`[DSE] Failed to load configuration: ${error.message}`);
        console.log('[DSE] Falling back to standard token processing workflow');
    }
}
//# sourceMappingURL=integration-example.js.map