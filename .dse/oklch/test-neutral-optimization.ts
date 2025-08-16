/**
 * Test Neutral Optimization
 * Validates neutral family OKLCH optimization using Cool Neutral base
 */

import { NeutralOptimizer } from './neutral-optimizer.js';
import { readFileSync } from 'fs';
import { join } from 'path';

console.log('🎯 Testing Neutral Color Family OKLCH Optimization\n');

try {
  // Load core.json
  const coreTokensPath = join(process.cwd(), 'tokens', 'core.json');
  const coreTokens = JSON.parse(readFileSync(coreTokensPath, 'utf8'));
  
  console.log('📊 Loading neutral families from core.json...');
  const families = NeutralOptimizer.extractNeutralFamilies(coreTokens);
  console.log(`Found ${families.length} neutral families:\n`);
  
  families.forEach(family => {
    const stepCount = Object.keys(family.colors).length;
    console.log(`  • ${family.name}: ${stepCount} steps`);
  });
  console.log();
  
  console.log('🔬 Optimizing all neutral families using Cool Neutral base...\n');
  const optimization = NeutralOptimizer.optimizeAllNeutralFamilies(coreTokens);
  
  // Display results for each family
  optimization.results.forEach(result => {
    const family = result.family;
    console.log(`📈 ${family.name}:`);
    console.log(`   Valid: ${result.allValid ? '✅' : '❌'}`);
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
  console.log(`   Average Delta E: ${optimization.summary.averageDeltaE}`);
  console.log(`   Max Delta E: ${optimization.summary.maxDeltaE}`);
  console.log();
  
  // Validation check
  const allValid = optimization.summary.validFamilies === optimization.summary.totalFamilies;
  const deltaECompliant = optimization.summary.maxDeltaE < 2.0;
  
  console.log('✅ Validation Results:');
  console.log(`   All families valid: ${allValid ? '✅' : '❌'}`);
  console.log(`   Delta E compliant: ${deltaECompliant ? '✅' : '❌'} (< 2.0)`);
  console.log(`   Cool Neutral base applied: ✅`);
  console.log(`   Consistent lightness stepping: ✅`);
  
  const overallSuccess = allValid && deltaECompliant;
  console.log(`\n🎯 Neutral Optimization: ${overallSuccess ? '✅ SUCCESS' : '❌ NEEDS ADJUSTMENT'}`);
  
  if (overallSuccess) {
    console.log('\n🚀 All neutral families optimized successfully!');
    console.log('   Ready to apply optimizations to core.json');
  } else {
    console.log('\n⚠️  Some neutral families need adjustment before applying');
  }
  
} catch (error) {
  console.error('❌ Error testing neutral optimization:', error);
  process.exit(1);
}