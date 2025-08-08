/**
 * DSE Backward Compatibility Test
 * Verifies that DSE configuration doesn't break existing workflows
 */

import { existsSync, statSync } from 'fs';
import { execSync } from 'child_process';
import { getDSEConfig } from './config-loader.js';

console.log('🔍 DSE Backward Compatibility Tests\n');

let allTestsPassed = true;

// Test 1: DSE Configuration is Optional
console.log('Test 1: DSE Configuration Optional Behavior');
try {
  const dseConfig = getDSEConfig();
  
  if (dseConfig.isDSEConfigured()) {
    console.log('✅ DSE configuration detected, system should enhance workflows');
  } else {
    console.log('✅ No DSE configuration, system should use standard workflows');
  }

  // Configuration loading should work either way
  const { config, validation } = dseConfig.loadColorLibraryConfig();
  
  if (validation.isValid) {
    console.log('✅ Configuration loading works correctly (uses defaults if needed)');
  } else {
    console.log('❌ Configuration loading failed');
    allTestsPassed = false;
  }

} catch (error) {
  console.log(`❌ DSE configuration test failed: ${error.message}`);
  allTestsPassed = false;
}
console.log('');

// Test 2: Existing Scripts Still Work
console.log('Test 2: Existing Script Compatibility');
try {
  console.log('  Testing consolidate script...');
  
  // Check if tokensource.json exists before testing
  const tokensourceExists = existsSync('tokensource.json');
  console.log(`  tokensource.json exists: ${tokensourceExists}`);

  // Test consolidate (build is already done in previous test)
  execSync('node dist/scripts/consolidate.js', { stdio: 'pipe' });
  
  if (existsSync('tokensource.json')) {
    console.log('✅ Consolidate script works with DSE directory present');
  } else {
    console.log('❌ Consolidate script did not produce output');
    allTestsPassed = false;
  }

  console.log('  Testing split script...');
  
  // Test split
  execSync('node dist/scripts/split.js', { stdio: 'pipe' });
  
  if (existsSync('tokens/core.json')) {
    console.log('✅ Split script works with DSE directory present');
  } else {
    console.log('❌ Split script did not produce expected output');
    allTestsPassed = false;
  }

} catch (error) {
  console.log(`❌ Script compatibility test failed: ${error.message}`);
  allTestsPassed = false;
}
console.log('');

// Test 3: Token Studio Format Preservation
console.log('Test 3: Token Studio Format Preservation');
try {
  // Check that tokens/ directory maintains Token Studio format
  const requiredTokenFiles = [
    'tokens/$metadata.json',
    'tokens/core.json',
    'tokens/global.json'
  ];

  let tokenFormatPreserved = true;
  for (const file of requiredTokenFiles) {
    if (!existsSync(file)) {
      console.log(`❌ Required token file missing: ${file}`);
      tokenFormatPreserved = false;
    }
  }

  if (tokenFormatPreserved) {
    console.log('✅ Token Studio format files preserved');
  } else {
    allTestsPassed = false;
  }

  // Check that DSE directory doesn't interfere with tokens/
  if (existsSync('.dse/') && existsSync('tokens/')) {
    console.log('✅ DSE directory coexists with tokens/ directory');
  } else {
    console.log('❌ Directory structure issue detected');
    allTestsPassed = false;
  }

} catch (error) {
  console.log(`❌ Token Studio format test failed: ${error.message}`);
  allTestsPassed = false;
}
console.log('');

// Test 4: No Unintended Side Effects
console.log('Test 4: No Unintended Side Effects');
try {
  const dseConfig = getDSEConfig();

  // Test that configuration loading doesn't modify files
  const beforeConfig = existsSync('.dse/color-library.json') ? 
    statSync('.dse/color-library.json').mtime : null;

  dseConfig.loadColorLibraryConfig();

  const afterConfig = existsSync('.dse/color-library.json') ? 
    statSync('.dse/color-library.json').mtime : null;

  if (beforeConfig && afterConfig && beforeConfig.getTime() === afterConfig.getTime()) {
    console.log('✅ Configuration loading does not modify files');
  } else if (!beforeConfig && !afterConfig) {
    console.log('✅ No configuration file, no side effects');
  } else {
    console.log('❌ Configuration loading may have side effects');
    allTestsPassed = false;
  }

  // Test that clearing cache works
  dseConfig.clearCache();
  console.log('✅ Configuration cache can be cleared without issues');

} catch (error) {
  console.log(`❌ Side effects test failed: ${error.message}`);
  allTestsPassed = false;
}
console.log('');

// Test 5: Performance Impact
console.log('Test 5: Performance Impact Assessment');
try {
  const dseConfig = getDSEConfig();

  // Measure configuration loading time
  const startTime = Date.now();
  dseConfig.loadColorLibraryConfig();
  const loadTime = Date.now() - startTime;

  if (loadTime < 100) { // Should load in under 100ms
    console.log(`✅ Configuration loading is fast (${loadTime}ms)`);
  } else {
    console.log(`⚠️  Configuration loading took ${loadTime}ms (consider optimization)`);
  }

  // Test multiple loads (should be cached)
  const cacheStartTime = Date.now();
  dseConfig.loadColorLibraryConfig();
  dseConfig.loadColorLibraryConfig();
  const cacheTime = Date.now() - cacheStartTime;

  if (cacheTime < 10) { // Cached loads should be very fast
    console.log(`✅ Configuration caching works effectively (${cacheTime}ms for 2 cached loads)`);
  } else {
    console.log(`⚠️  Configuration caching may not be working optimally (${cacheTime}ms)`);
  }

} catch (error) {
  console.log(`❌ Performance test failed: ${error.message}`);
  allTestsPassed = false;
}

// Final Result
console.log('\n' + '='.repeat(50));
if (allTestsPassed) {
  console.log('✅ ALL BACKWARD COMPATIBILITY TESTS PASSED! 🎉');
  console.log('   DSE implementation maintains full backward compatibility');
  console.log('   Existing workflows continue to work unchanged');
  console.log('   Token Studio integration preserved');
} else {
  console.log('❌ SOME BACKWARD COMPATIBILITY TESTS FAILED! 💥');
  console.log('   Review the issues above and fix before deployment');
}

console.log('='.repeat(50));