#!/usr/bin/env node

/**
 * Fix Core Color Token Ordering Script
 * Reorders core color tokens to logical sequence: 0 → 100 → ... → 900 → 1000 → 1100 → 1200 → 1300
 * Fixes the issue where tokens appear as 1000-1300, then 0-900
 */

import * as fs from 'fs';
import * as path from 'path';

const PROPER_COLOR_ORDER = [
  '0', '100', '200', '300', '400', '500', 
  '600', '700', '800', '900',
  '1000', '1100', '1200', '1300'
];

function reorderCoreColorTokens(colorRamp) {
  const originalKeys = Object.keys(colorRamp);
  const reordered = {};
  
  // Extract color name from first key (e.g., "Amber 0" -> "Amber")
  const firstKey = originalKeys[0];
  const colorName = firstKey ? firstKey.split(' ').slice(0, -1).join(' ') : '';
  
  if (!colorName) {
    // Skip if we can't determine color name
    return colorRamp;
  }
  
  // Build ordered object
  PROPER_COLOR_ORDER.forEach(level => {
    const expectedKey = `${colorName} ${level}`;
    if (colorRamp[expectedKey]) {
      reordered[expectedKey] = colorRamp[expectedKey];
    }
  });
  
  // Add any keys that don't match the standard pattern (like "base-500" in Dynamic colors)
  originalKeys.forEach(key => {
    if (!reordered[key] && !key.match(new RegExp(`^${colorName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')} (0|100|200|300|400|500|600|700|800|900|1000|1100|1200|1300)$`))) {
      reordered[key] = colorRamp[key];
    }
  });
  
  return reordered;
}

function fixCoreColorOrdering() {
  console.log('🔧 Core Color Order Fix Script');
  console.log('==============================');
  console.log('Target order: 0 → 100 → ... → 900 → 1000 → 1100 → 1200 → 1300');
  
  const coreJsonPath = path.join(process.cwd(), 'tokens', 'core.json');
  
  if (!fs.existsSync(coreJsonPath)) {
    console.error('❌ core.json not found:', coreJsonPath);
    process.exit(1);
  }
  
  // Read core.json
  const content = fs.readFileSync(coreJsonPath, 'utf8');
  const tokens = JSON.parse(content);
  
  if (!tokens['Color Ramp']) {
    console.error('❌ Color Ramp not found in core.json');
    process.exit(1);
  }
  
  const colorRamps = tokens['Color Ramp'];
  let totalRampsFixed = 0;
  
  // Process each color ramp
  Object.keys(colorRamps).forEach(rampName => {
    console.log(`\n🎨 Checking ${rampName}:`);
    
    const ramp = colorRamps[rampName];
    const originalKeys = Object.keys(ramp);
    
    // Skip Dynamic ramps - they have different structure
    if (rampName.startsWith('Dynamic')) {
      console.log(`  ⏭️  Skipping Dynamic ramp`);
      return;
    }
    
    // Check if reordering is needed
    const firstKey = originalKeys[0];
    const needsReordering = firstKey && (
      firstKey.includes(' 1000') || 
      firstKey.includes(' 1100') || 
      firstKey.includes(' 1200') || 
      firstKey.includes(' 1300')
    );
    
    if (needsReordering) {
      const reorderedRamp = reorderCoreColorTokens(ramp);
      const reorderedKeys = Object.keys(reorderedRamp);
      
      console.log(`  🔄 Reordering: ${originalKeys.slice(0,3).join(', ')}... → ${reorderedKeys.slice(0,3).join(', ')}...`);
      
      colorRamps[rampName] = reorderedRamp;
      totalRampsFixed++;
    } else {
      console.log(`  ✅ Already in correct order`);
    }
  });
  
  // Write back if changes were made
  if (totalRampsFixed > 0) {
    const updatedContent = JSON.stringify(tokens, null, 2);
    fs.writeFileSync(coreJsonPath, updatedContent, 'utf8');
    
    console.log('\n📊 Summary:');
    console.log(`Color ramps processed: ${Object.keys(colorRamps).length}`);
    console.log(`Ramps reordered: ${totalRampsFixed}`);
    
    console.log('\n✅ Core color ordering fixes completed!');
    console.log('🔄 Run consolidation to update tokensource.json:');
    console.log('   npm run consolidate');
  } else {
    console.log('\n✨ All core color ramps already in correct order!');
  }
}

// Run the script
fixCoreColorOrdering();