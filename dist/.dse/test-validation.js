/**
 * Simple test script for DSE configuration validation
 */
import { validateColorLibraryFile } from './validator.js';
import { getDSEConfig } from './config-loader.js';
console.log('🔍 Testing DSE Configuration Validation...\n');
// Test 1: File validation
console.log('Test 1: Validating color-library.json file...');
try {
    const validation = validateColorLibraryFile('.dse/color-library.json');
    if (validation.isValid) {
        console.log('✅ Configuration file is valid!');
    }
    else {
        console.log('❌ Configuration file has errors:');
        validation.errors.forEach(error => {
            console.log(`  - ${error.field}: ${error.message}`);
        });
    }
    if (validation.warnings && validation.warnings.length > 0) {
        console.log('⚠️  Configuration warnings:');
        validation.warnings.forEach(warning => {
            console.log(`  - ${warning.field}: ${warning.message}`);
        });
    }
}
catch (error) {
    console.log(`❌ Error validating file: ${error instanceof Error ? error.message : 'Unknown error'}`);
}
console.log('');
// Test 2: Configuration loader
console.log('Test 2: Testing configuration loader...');
try {
    const dseConfig = getDSEConfig();
    const { config, validation } = dseConfig.loadColorLibraryConfig();
    if (validation.isValid) {
        console.log('✅ Configuration loader working correctly!');
        console.log(`   Color space: ${config.colorLibrary.colorSpace}`);
        console.log(`   Lightness range: ${config.colorLibrary.lightnessRange.min}-${config.colorLibrary.lightnessRange.max}`);
        console.log(`   Primary chroma: ${config.colorLibrary.chromaRange.primary}`);
        console.log(`   Output format: ${config.colorLibrary.conversionOptions.outputFormat}`);
    }
    else {
        console.log('❌ Configuration loader validation failed');
    }
}
catch (error) {
    console.log(`❌ Error with configuration loader: ${error instanceof Error ? error.message : 'Unknown error'}`);
}
console.log('\n🎉 DSE Configuration validation tests completed!');
//# sourceMappingURL=test-validation.js.map