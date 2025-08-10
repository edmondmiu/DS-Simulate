#!/usr/bin/env node
/**
 * DSE Configuration Validation CLI Tool
 * Tests and validates DSE color library configurations
 * Following TypeScript 5.4.5 strict typing and coding standards
 */
import { existsSync } from 'fs';
import { join } from 'path';
import { validateColorLibraryConfig, validateColorLibraryFile } from './validator.js';
import { getDSEConfig } from './config-loader.js';
class ConfigValidator {
    verbose;
    constructor(verbose = false) {
        this.verbose = verbose;
    }
    log(message) {
        if (this.verbose) {
            console.log(`[validate] ${message}`);
        }
    }
    success(message) {
        console.log(`✅ ${message}`);
    }
    warning(message) {
        console.log(`⚠️  ${message}`);
    }
    error(message) {
        console.log(`❌ ${message}`);
    }
    /**
     * Validate the current DSE configuration
     * @param options - Validation options
     * @returns true if valid, false otherwise
     */
    validateCurrentConfig(options = {}) {
        const configPath = options.configPath || join('.dse', 'color-library.json');
        this.log(`Validating configuration at: ${configPath}`);
        if (!existsSync(configPath)) {
            this.error(`Configuration file not found: ${configPath}`);
            return false;
        }
        const validation = validateColorLibraryFile(configPath);
        if (!validation.isValid) {
            this.error(`Configuration validation failed:`);
            validation.errors.forEach(error => {
                this.error(`  Field: ${error.field}`);
                this.error(`  Error: ${error.message}`);
                if (error.value !== undefined) {
                    this.error(`  Value: ${JSON.stringify(error.value)}`);
                }
                if (error.expectedRange) {
                    this.error(`  Expected: ${error.expectedRange}`);
                }
                console.log('');
            });
            return false;
        }
        this.success(`Configuration validation passed: ${configPath}`);
        // Display warnings if present
        if (validation.warnings && validation.warnings.length > 0) {
            validation.warnings.forEach(warning => {
                this.warning(`${warning.field}: ${warning.message}`);
                this.log(`  Recommendation: ${warning.recommendation}`);
            });
        }
        return true;
    }
    /**
     * Test the DSE configuration loader
     * @returns true if loader works correctly
     */
    testConfigLoader() {
        try {
            const dseConfig = getDSEConfig();
            this.log('Testing DSE configuration loader...');
            // Test configuration loading
            const { config, validation } = dseConfig.loadColorLibraryConfig();
            if (!validation.isValid) {
                this.error('Configuration loader returned invalid configuration');
                return false;
            }
            this.success('Configuration loader working correctly');
            // Test accessor methods
            this.log('Testing accessor methods...');
            const accessibilityThresholds = dseConfig.getAccessibilityThresholds();
            this.log(`Accessibility thresholds: AA=${accessibilityThresholds.AA}, AAA=${accessibilityThresholds.AAA}`);
            const oklchRanges = dseConfig.getOKLCHRanges();
            this.log(`OKLCH ranges: lightness=${oklchRanges.lightness.min}-${oklchRanges.lightness.max}, primary chroma=${oklchRanges.chroma.primary}`);
            const conversionOptions = dseConfig.getConversionOptions();
            this.log(`Conversion options: format=${conversionOptions.outputFormat}, preserve=${conversionOptions.preserveOriginal}`);
            const colorGeneration = dseConfig.getColorGenerationSettings();
            if (colorGeneration) {
                this.log(`Color generation: steps=${colorGeneration.rampSteps}, preserve=${colorGeneration.preserveKeyColors}, algorithmic=${colorGeneration.algorithmicGeneration}`);
            }
            // Test brand-specific configurations
            const brands = ['bet9ja', 'global', 'core'];
            for (const brand of brands) {
                const brandConfig = dseConfig.getBrandConfig(brand);
                if (brandConfig) {
                    this.log(`Brand config for ${brand}: lightness=${brandConfig.lightnessAdjustment}, chroma=${brandConfig.chromaMultiplier}, hue=${brandConfig.hueShift}`);
                }
                else {
                    this.log(`No brand config found for ${brand}`);
                }
            }
            this.success('All accessor methods working correctly');
            return true;
        }
        catch (error) {
            this.error(`Configuration loader test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
            return false;
        }
    }
    /**
     * Test validation with invalid configurations
     * @returns true if validation correctly catches errors
     */
    testInvalidConfigurations() {
        this.log('Testing validation with invalid configurations...');
        const testCases = [
            {
                name: 'Missing colorLibrary',
                config: {},
                expectedErrors: ['colorLibrary']
            },
            {
                name: 'Invalid color space',
                config: {
                    colorLibrary: {
                        colorSpace: 'invalid',
                        lightnessRange: { min: 15, max: 95 },
                        chromaRange: { primary: 0.15, neutral: 0.05 },
                        accessibilityThresholds: { AA: 4.5, AAA: 7.0 },
                        conversionOptions: { outputFormat: 'hex', preserveOriginal: true }
                    }
                },
                expectedErrors: ['colorSpace']
            },
            {
                name: 'Invalid lightness range',
                config: {
                    colorLibrary: {
                        colorSpace: 'oklch',
                        lightnessRange: { min: 150, max: 95 },
                        chromaRange: { primary: 0.15, neutral: 0.05 },
                        accessibilityThresholds: { AA: 4.5, AAA: 7.0 },
                        conversionOptions: { outputFormat: 'hex', preserveOriginal: true }
                    }
                },
                expectedErrors: ['min']
            },
            {
                name: 'Invalid chroma values',
                config: {
                    colorLibrary: {
                        colorSpace: 'oklch',
                        lightnessRange: { min: 15, max: 95 },
                        chromaRange: { primary: 1.5, neutral: -0.5 },
                        accessibilityThresholds: { AA: 4.5, AAA: 7.0 },
                        conversionOptions: { outputFormat: 'hex', preserveOriginal: true }
                    }
                },
                expectedErrors: ['primary', 'neutral']
            },
            {
                name: 'Invalid accessibility thresholds',
                config: {
                    colorLibrary: {
                        colorSpace: 'oklch',
                        lightnessRange: { min: 15, max: 95 },
                        chromaRange: { primary: 0.15, neutral: 0.05 },
                        accessibilityThresholds: { AA: 7.0, AAA: 4.5 },
                        conversionOptions: { outputFormat: 'hex', preserveOriginal: true }
                    }
                },
                expectedErrors: ['AAA']
            }
        ];
        let allTestsPassed = true;
        for (const testCase of testCases) {
            const validation = validateColorLibraryConfig(testCase.config);
            if (validation.isValid) {
                this.error(`Test case "${testCase.name}" should have failed but passed`);
                allTestsPassed = false;
                continue;
            }
            // Check if expected errors are present
            const errorFields = validation.errors.map(error => error.field);
            const hasExpectedErrors = testCase.expectedErrors.some(expectedField => errorFields.some(errorField => errorField.includes(expectedField)));
            if (!hasExpectedErrors) {
                this.error(`Test case "${testCase.name}" did not catch expected errors: ${testCase.expectedErrors.join(', ')}`);
                this.log(`Actual errors: ${errorFields.join(', ')}`);
                allTestsPassed = false;
            }
            else {
                this.success(`Test case "${testCase.name}" correctly caught validation errors`);
            }
        }
        return allTestsPassed;
    }
    /**
     * Run all validation tests
     * @param options - Validation options
     * @returns true if all tests pass
     */
    runAllTests(options = {}) {
        console.log('🔍 DSE Configuration Validation Tests\n');
        let allPassed = true;
        // Test 1: Validate current configuration
        console.log('Test 1: Current Configuration Validation');
        if (!this.validateCurrentConfig(options)) {
            allPassed = false;
        }
        console.log('');
        // Test 2: Test configuration loader
        console.log('Test 2: Configuration Loader Test');
        if (!this.testConfigLoader()) {
            allPassed = false;
        }
        console.log('');
        // Test 3: Test invalid configurations
        console.log('Test 3: Invalid Configuration Detection');
        if (!this.testInvalidConfigurations()) {
            allPassed = false;
        }
        console.log('');
        // Final result
        if (allPassed) {
            this.success('All configuration validation tests passed! ✨');
        }
        else {
            this.error('Some configuration validation tests failed! 💥');
        }
        return allPassed;
    }
}
/**
 * CLI interface for configuration validation
 */
function main() {
    const args = process.argv.slice(2);
    const options = {
        verbose: args.includes('--verbose') || args.includes('-v'),
        testDefaults: args.includes('--test-defaults')
    };
    // Check for custom config path
    const configIndex = args.findIndex(arg => arg === '--config');
    if (configIndex !== -1 && configIndex + 1 < args.length) {
        options.configPath = args[configIndex + 1];
    }
    const validator = new ConfigValidator(options.verbose);
    if (args.includes('--help') || args.includes('-h')) {
        console.log(`
DSE Configuration Validation Tool

Usage:
  npm run validate-dse-config [options]
  node .dse/validate-config.js [options]

Options:
  --verbose, -v         Enable verbose output
  --config <path>       Specify custom configuration file path
  --help, -h           Show this help message

Examples:
  npm run validate-dse-config
  npm run validate-dse-config --verbose
  npm run validate-dse-config --config custom-config.json
    `);
        process.exit(0);
    }
    const success = validator.runAllTests(options);
    process.exit(success ? 0 : 1);
}
// Run CLI if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}
//# sourceMappingURL=validate-config.js.map