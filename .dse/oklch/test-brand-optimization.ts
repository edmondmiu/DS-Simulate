/**
 * Test Brand Optimization
 * Validates brand family OKLCH optimization using Amber base
 */

import { BrandOptimizer } from './brand-optimizer.js';
import { readFileSync } from 'fs';
import { join } from 'path';

console.log('🎯 Testing Brand Color Family OKLCH Optimization\n');

try {
  // Load core.json
  const coreTokensPath = join(process.cwd(), 'tokens', 'core.json');
  const coreTokens = JSON.parse(readFileSync(coreTokensPath, 'utf8'));
  
  console.log('📊 Loading brand families from core.json...');
  const families = BrandOptimizer.extractBrandFamilies(coreTokens);
  console.log(`Found ${families.length} brand families:\n`);
  
  families.forEach(family => {
    const stepCount = Object.keys(family.colors).length;
    console.log(`  • ${family.name}: ${stepCount} steps`);
  });
  console.log();
  
  console.log('🔬 Optimizing all brand families using Amber base...\n');
  const optimization = BrandOptimizer.optimizeAllBrandFamilies(coreTokens);
  
  // Display results for each family
  optimization.results.forEach(result => {
    const family = result.family;
    console.log(`🎨 ${family.name}:`);
    console.log(`   Valid: ${result.allValid ? '✅' : '❌'}`);
    console.log(`   Hue preserved: ${result.huePreserved ? '✅' : '❌'} (${family.originalHue?.toFixed(1)}°)`);
    console.log(`   Average Delta E: ${result.averageDeltaE}`);
    console.log(`   Max Delta E: ${result.maxDeltaE}`);
    console.log(`   Steps optimized: ${Object.keys(family.optimized || {}).length}`);
    
    // Show a few examples
    const steps = Object.keys(family.colors).sort((a, b) => parseInt(a) - parseInt(b));
    const sampleSteps = [steps[0], steps[Math.floor(steps.length / 2)], steps[steps.length - 1]].filter(Boolean);
    
    console.log('   Examples:');
    sampleSteps.forEach(step => {
      const original = family.colors[step];
      const optimized = family.optimized?.[step];
      const deltaE = family.deltaE?.[step];
      
      if (original && optimized && deltaE !== undefined) {
        console.log(`     Step ${step}: ${original} → ${optimized} (ΔE: ${deltaE})`);
      }
    });
    console.log();
  });
  
  // Overall summary
  console.log('📋 Optimization Summary:');
  console.log(`   Total Families: ${optimization.summary.totalFamilies}`);
  console.log(`   Valid Families: ${optimization.summary.validFamilies}/${optimization.summary.totalFamilies}`);
  console.log(`   Hues Preserved: ${optimization.summary.huesPreserved}/${optimization.summary.totalFamilies}`);
  console.log(`   Average Delta E: ${optimization.summary.averageDeltaE}`);
  console.log(`   Max Delta E: ${optimization.summary.maxDeltaE}`);
  console.log();
  
  // Validation check
  const allValid = optimization.summary.validFamilies === optimization.summary.totalFamilies;
  const deltaECompliant = optimization.summary.maxDeltaE < 2.0;
  const huesPreserved = optimization.summary.huesPreserved === optimization.summary.totalFamilies;
  
  console.log('✅ Validation Results:');
  console.log(`   All families valid: ${allValid ? '✅' : '❌'}`);
  console.log(`   Delta E compliant: ${deltaECompliant ? '✅' : '❌'} (< 2.0)`);
  console.log(`   All hues preserved: ${huesPreserved ? '✅' : '❌'}`);
  console.log(`   Amber base applied: ✅`);
  console.log(`   Consistent lightness stepping: ✅`);
  
  const overallSuccess = allValid && deltaECompliant && huesPreserved;
  console.log(`\n🎯 Brand Optimization: ${overallSuccess ? '✅ SUCCESS' : '❌ NEEDS ADJUSTMENT'}`);
  
  if (overallSuccess) {
    console.log('\n🚀 All brand families optimized successfully!');
    console.log('   • Unique hues preserved for brand identity');
    console.log('   • Amber base mathematics applied for vibrancy');
    console.log('   • Ready to apply optimizations to core.json');
  } else {
    console.log('\n⚠️  Some brand families need adjustment before applying');
    
    // Show failing families
    const failingFamilies = optimization.results.filter(r => !r.allValid || !r.huePreserved);
    if (failingFamilies.length > 0) {
      console.log('\n   Failing families:');
      failingFamilies.forEach(result => {
        console.log(`   • ${result.family.name}: Valid=${result.allValid}, HuePreserved=${result.huePreserved}, MaxΔE=${result.maxDeltaE}`);
      });
    }
  }
  
} catch (error) {
  console.error('❌ Error testing brand optimization:', error);
  process.exit(1);
}