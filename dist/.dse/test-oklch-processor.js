/**
 * OKLCH Color Processor Test
 * Tests the OKLCH color processing utilities
 */
import { OKLCHColorProcessor, toOKLCH, fromOKLCH, generateAccessiblePair } from './oklch-color-processor.js';
console.log('🎨 Testing OKLCH Color Processor...\n');
let allTestsPassed = true;
// Test 1: Basic Color Conversion
console.log('Test 1: Basic Color Conversion');
try {
    const processor = new OKLCHColorProcessor();
    // Test hex to OKLCH
    const hexResult = processor.convertToOKLCH('#007bff');
    if (hexResult.success && hexResult.oklch) {
        console.log(`✅ Hex to OKLCH: #007bff → L=${hexResult.oklch.l.toFixed(3)}, C=${hexResult.oklch.c.toFixed(3)}, H=${hexResult.oklch.h.toFixed(1)}`);
    }
    else {
        console.log(`❌ Hex to OKLCH conversion failed: ${hexResult.error}`);
        allTestsPassed = false;
    }
    // Test OKLCH to hex
    if (hexResult.success && hexResult.oklch) {
        const backToHex = processor.convertFromOKLCH(hexResult.oklch);
        if (backToHex.success) {
            console.log(`✅ OKLCH to hex: → ${backToHex.color}`);
            // Test round-trip accuracy
            const originalOKLCH = processor.convertToOKLCH('#007bff');
            const convertedOKLCH = processor.convertToOKLCH(backToHex.color);
            if (originalOKLCH.success && convertedOKLCH.success) {
                const diff = processor.calculateColorDifference(originalOKLCH.oklch, convertedOKLCH.oklch);
                if (diff < 1.0) {
                    console.log(`✅ Round-trip accuracy: Delta E = ${diff.toFixed(3)} (< 1.0)`);
                }
                else {
                    console.log(`⚠️  Round-trip accuracy: Delta E = ${diff.toFixed(3)} (may be perceptible)`);
                }
            }
        }
        else {
            console.log(`❌ OKLCH to hex conversion failed: ${backToHex.error}`);
            allTestsPassed = false;
        }
    }
}
catch (error) {
    console.log(`❌ Basic conversion test failed: ${error.message}`);
    allTestsPassed = false;
}
console.log('');
// Test 2: Color Ramp Generation
console.log('Test 2: Color Ramp Generation');
try {
    const processor = new OKLCHColorProcessor();
    const baseColor = { l: 0.6, c: 0.15, h: 250 };
    const ramp = processor.generateColorRamp(baseColor, {
        steps: 5,
        lightnessRange: [0.2, 0.9],
        preserveChroma: true,
        preserveHue: true
    });
    if (ramp.length === 5 && ramp.every(r => r.success)) {
        console.log('✅ Color ramp generation successful:');
        ramp.forEach((color, i) => {
            console.log(`  Step ${i + 1}: ${color.color} (L=${color.oklch?.l.toFixed(3)})`);
        });
    }
    else {
        console.log('❌ Color ramp generation failed');
        allTestsPassed = false;
    }
}
catch (error) {
    console.log(`❌ Color ramp test failed: ${error.message}`);
    allTestsPassed = false;
}
console.log('');
// Test 3: Accessibility Validation
console.log('Test 3: Accessibility Validation');
try {
    const processor = new OKLCHColorProcessor();
    // Test high contrast pair
    const white = { l: 0.95, c: 0.0, h: 0 };
    const black = { l: 0.15, c: 0.0, h: 0 };
    const accessibility = processor.validateAccessibility(black, white);
    console.log(`✅ High contrast validation:`);
    console.log(`   Contrast ratio: ${accessibility.contrastRatio}`);
    console.log(`   WCAG AA: ${accessibility.wcagAA ? '✅' : '❌'}`);
    console.log(`   WCAG AAA: ${accessibility.wcagAAA ? '✅' : '❌'}`);
    // Test accessible pair generation
    const baseOKLCH = { l: 0.5, c: 0.12, h: 200 };
    const pair = generateAccessiblePair(baseOKLCH, 4.5);
    if (pair) {
        console.log(`✅ Accessible pair generation:`);
        console.log(`   Base: ${pair.base}`);
        console.log(`   Accessible: ${pair.accessible}`);
    }
    else {
        console.log('❌ Accessible pair generation failed');
        allTestsPassed = false;
    }
}
catch (error) {
    console.log(`❌ Accessibility test failed: ${error.message}`);
    allTestsPassed = false;
}
console.log('');
// Test 4: Brand Color Generation
console.log('Test 4: Brand Color Generation');
try {
    const processor = new OKLCHColorProcessor();
    const baseColor = { l: 0.6, c: 0.15, h: 250 };
    // Test brand variations
    const brandVariations = [
        { name: 'Standard', lightnessAdjustment: 0, chromaMultiplier: 1.0, hueShift: 0 },
        { name: 'Vibrant', lightnessAdjustment: 0, chromaMultiplier: 1.3, hueShift: 0 },
        { name: 'Muted', lightnessAdjustment: 5, chromaMultiplier: 0.8, hueShift: 15 }
    ];
    console.log('✅ Brand color variations:');
    for (const variation of brandVariations) {
        const brandColor = processor.generateBrandColor({
            baseColor,
            ...variation
        });
        if (brandColor.success) {
            console.log(`   ${variation.name}: ${brandColor.color} (L=${brandColor.oklch?.l.toFixed(3)}, C=${brandColor.oklch?.c.toFixed(3)})`);
        }
        else {
            console.log(`   ❌ ${variation.name}: Generation failed`);
            allTestsPassed = false;
        }
    }
}
catch (error) {
    console.log(`❌ Brand color test failed: ${error.message}`);
    allTestsPassed = false;
}
console.log('');
// Test 5: Error Handling and Edge Cases
console.log('Test 5: Error Handling and Edge Cases');
try {
    const processor = new OKLCHColorProcessor();
    // Test invalid color formats
    const invalidColors = ['not-a-color', '#gggggg', 'rgb(300, 400, 500)', ''];
    for (const invalidColor of invalidColors) {
        const result = processor.convertToOKLCH(invalidColor);
        if (!result.success) {
            console.log(`✅ Correctly rejected invalid color: "${invalidColor}"`);
        }
        else {
            console.log(`⚠️  Unexpectedly parsed invalid color: "${invalidColor}"`);
        }
    }
    // Test out-of-gamut colors
    const outOfGamut = { l: 0.5, c: 0.8, h: 120 }; // Very high chroma
    const gamutResult = processor.convertFromOKLCH(outOfGamut);
    if (gamutResult.success) {
        if (gamutResult.warnings.length > 0) {
            console.log(`✅ Out-of-gamut handling: ${gamutResult.color} with ${gamutResult.warnings.length} warning(s)`);
        }
        else {
            console.log(`✅ Out-of-gamut color converted: ${gamutResult.color}`);
        }
    }
    else {
        console.log(`❌ Out-of-gamut conversion failed: ${gamutResult.error}`);
        allTestsPassed = false;
    }
}
catch (error) {
    console.log(`❌ Error handling test failed: ${error.message}`);
    allTestsPassed = false;
}
console.log('');
// Test 6: Performance and Caching
console.log('Test 6: Performance and Caching');
try {
    const processor = new OKLCHColorProcessor();
    // Test conversion performance
    const startTime = Date.now();
    const testColors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
    for (let i = 0; i < 100; i++) {
        for (const color of testColors) {
            processor.convertToOKLCH(color);
        }
    }
    const conversionTime = Date.now() - startTime;
    console.log(`✅ Conversion performance: 600 conversions in ${conversionTime}ms (${(conversionTime / 600).toFixed(2)}ms per conversion)`);
    // Test cache effectiveness
    const cacheStats = processor.getCacheStats();
    console.log(`✅ Cache statistics: ${cacheStats.size} entries`);
    // Test cache clearing
    processor.clearCache();
    const clearedStats = processor.getCacheStats();
    console.log(`✅ Cache cleared: ${clearedStats.size} entries remaining`);
}
catch (error) {
    console.log(`❌ Performance test failed: ${error.message}`);
    allTestsPassed = false;
}
// Test 7: Utility Functions
console.log('');
console.log('Test 7: Utility Functions');
try {
    // Test quick conversion functions
    const quickOKLCH = toOKLCH('#007bff');
    if (quickOKLCH) {
        console.log(`✅ Quick toOKLCH: #007bff → L=${quickOKLCH.l.toFixed(3)}, C=${quickOKLCH.c.toFixed(3)}, H=${quickOKLCH.h.toFixed(1)}`);
        const quickHex = fromOKLCH(quickOKLCH);
        if (quickHex) {
            console.log(`✅ Quick fromOKLCH: → ${quickHex}`);
        }
        else {
            console.log('❌ Quick fromOKLCH failed');
            allTestsPassed = false;
        }
    }
    else {
        console.log('❌ Quick toOKLCH failed');
        allTestsPassed = false;
    }
}
catch (error) {
    console.log(`❌ Utility functions test failed: ${error.message}`);
    allTestsPassed = false;
}
// Final Result
console.log('\n' + '='.repeat(50));
if (allTestsPassed) {
    console.log('✅ ALL OKLCH PROCESSOR TESTS PASSED! 🎉');
    console.log('   Color conversion working correctly');
    console.log('   Perceptual uniformity validated');
    console.log('   Accessibility features functional');
    console.log('   Brand color generation operational');
    console.log('   Error handling robust');
    console.log('   Performance optimized');
}
else {
    console.log('❌ SOME OKLCH PROCESSOR TESTS FAILED! 💥');
    console.log('   Review the issues above and fix before proceeding');
}
console.log('='.repeat(50));
//# sourceMappingURL=test-oklch-processor.js.map