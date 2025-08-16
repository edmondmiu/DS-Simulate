/**
 * Test Base Colors
 * Validates the OKLCH foundation and mathematical stepping algorithms
 */

import { BaseColorAnalyzer } from './base-color-analyzer.js';

console.log('🔍 Testing OKLCH Base Color Foundation...\n');

try {
  const results = BaseColorAnalyzer.validateBaseColors();
  
  console.log('📊 Cool Neutral 300 Analysis:');
  console.log(`  HEX: ${results.coolNeutral.hex}`);
  console.log(`  OKLCH: L=${results.coolNeutral.oklch.l}, C=${results.coolNeutral.oklch.c}, H=${results.coolNeutral.oklch.h}`);
  console.log(`  Role: ${results.coolNeutral.role}`);
  console.log(`  Chroma Target: ${results.coolNeutral.mathematicalProperties.chromaTarget}`);
  console.log(`  Hue Stability: ${results.coolNeutral.mathematicalProperties.hueStability}°\n`);
  
  console.log('🎨 Amber 500 Analysis:');
  console.log(`  HEX: ${results.amber.hex}`);
  console.log(`  OKLCH: L=${results.amber.oklch.l}, C=${results.amber.oklch.c}, H=${results.amber.oklch.h}`);
  console.log(`  Role: ${results.amber.role}`);
  console.log(`  Chroma Target: ${results.amber.mathematicalProperties.chromaTarget}`);
  console.log(`  Hue Stability: ${results.amber.mathematicalProperties.hueStability}°\n`);
  
  console.log('📈 Lightness Stepping Algorithm (0-1300 range):');
  results.lightnessSteps.forEach((lightness, index) => {
    const step = index * 100;
    console.log(`  ${step.toString().padStart(4, ' ')}: ${(lightness * 100).toFixed(1)}%`);
  });
  console.log();
  
  console.log('✅ Validation Results:');
  console.log(`  Cool Neutral Valid: ${results.validation.coolNeutralValid ? '✅' : '❌'}`);
  console.log(`  Amber Valid: ${results.validation.amberValid ? '✅' : '❌'}`);
  console.log(`  Lightness Range Valid: ${results.validation.lightnessRangeValid ? '✅' : '❌'}`);
  console.log(`  Chroma Relationship Valid: ${results.validation.chromaRelationshipValid ? '✅' : '❌'}`);
  
  const allValid = Object.values(results.validation).every(v => v);
  console.log(`\n🎯 Overall Foundation: ${allValid ? '✅ VALID' : '❌ INVALID'}`);
  
  if (allValid) {
    console.log('\n🚀 Base color foundation established successfully!');
    console.log('   Ready for color family optimization.');
  } else {
    console.log('\n⚠️  Base color foundation needs adjustment.');
  }
  
  // Test Delta E calculation
  console.log('\n🔬 Delta E Validation Test:');
  const originalHex = results.coolNeutral.hex;
  const convertedHex = BaseColorAnalyzer.oklchToHex(results.coolNeutral.oklch);
  const deltaE = BaseColorAnalyzer.calculateDeltaE(originalHex, convertedHex);
  console.log(`  Original: ${originalHex}`);
  console.log(`  Converted: ${convertedHex}`);
  console.log(`  Delta E: ${deltaE} ${deltaE < 2.0 ? '✅ (imperceptible)' : '❌ (perceptible)'}`);
  
} catch (error) {
  console.error('❌ Error testing base colors:', error);
  process.exit(1);
}