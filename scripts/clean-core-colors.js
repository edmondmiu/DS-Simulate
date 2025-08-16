#!/usr/bin/env node

/**
 * Clean Core Color Tokens Script
 * Removes duplicate and inconsistent core color tokens
 * Keeps only the "ColorName 0" format, removes "ColorName 000" and "ColorName 0000" duplicates
 */

import * as fs from 'fs';
import * as path from 'path';

function cleanCoreColors() {
  console.log('🧹 Core Color Cleanup Script');
  console.log('============================');
  
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
  let totalDuplicatesRemoved = 0;
  let totalOrphansRemoved = 0;
  
  // Process each color ramp
  Object.keys(colorRamps).forEach(rampName => {
    const ramp = colorRamps[rampName];
    console.log(`\n🎨 Processing ${rampName}:`);
    
    const tokenNames = Object.keys(ramp);
    const tokensToRename = [];
    const orphansToRemove = [];
    
    // Skip Dynamic ramps - they have different structure
    if (rampName.startsWith('Dynamic')) {
      tokenNames.forEach(tokenName => {
        // Only remove orphaned numeric tokens from Dynamic ramps
        if (tokenName.match(/^(0000|000|0|100|200|300|400|500|600|700|800|900|1000|1100|1200|1300)$/)) {
          console.log(`  🗑️  Removing orphaned token from Dynamic ramp: ${tokenName}`);
          orphansToRemove.push(tokenName);
        }
      });
    } else {
      // Regular color ramps - fix naming
      tokenNames.forEach(tokenName => {
        // Check for tokens that need renaming from 0000/0100/0200 format to 0/100/200
        const oldFormatMatch = tokenName.match(/^(.+) (0000|0100|0200|0300|0400|0500|0600|0700|0800|0900)$/);
        if (oldFormatMatch) {
          const colorName = oldFormatMatch[1];
          const oldNumber = oldFormatMatch[2];
          const newNumber = oldNumber.replace(/^0+/, '') || '0'; // Remove leading zeros, but keep "0000" as "0"
          const newTokenName = `${colorName} ${newNumber}`;
          
          // Only rename if the new format doesn't already exist
          if (!ramp[newTokenName]) {
            console.log(`  🔄 Renaming: ${tokenName} → ${newTokenName}`);
            tokensToRename.push({ old: tokenName, new: newTokenName });
          } else {
            console.log(`  🗑️  Removing duplicate: ${tokenName} (${newTokenName} already exists)`);
            orphansToRemove.push(tokenName);
          }
        }
        
        // Check for orphaned numeric tokens (like "1000", "0000" without color name)
        else if (tokenName.match(/^(0000|000|0|100|200|300|400|500|600|700|800|900|1000|1100|1200|1300)$/)) {
          console.log(`  🗑️  Removing orphaned token: ${tokenName}`);
          orphansToRemove.push(tokenName);
        }
      });
    }
    
    // Apply renames
    tokensToRename.forEach(({old, new: newName}) => {
      ramp[newName] = ramp[old];
      delete ramp[old];
    });
    
    // Remove orphans
    orphansToRemove.forEach(tokenName => {
      delete ramp[tokenName];
    });
    
    totalDuplicatesRemoved += tokensToRename.length;
    totalOrphansRemoved += orphansToRemove.length;
    
    if (tokensToRename.length === 0 && orphansToRemove.length === 0) {
      console.log(`  ✅ Already clean`);
    }
  });
  
  // Write cleaned file
  const cleanedContent = JSON.stringify(tokens, null, 2);
  fs.writeFileSync(coreJsonPath, cleanedContent, 'utf8');
  
  console.log('\n📊 Cleanup Summary:');
  console.log(`Color ramps processed: ${Object.keys(colorRamps).length}`);
  console.log(`Duplicate tokens removed: ${totalDuplicatesRemoved}`);
  console.log(`Orphaned tokens removed: ${totalOrphansRemoved}`);
  console.log(`Total tokens removed: ${totalDuplicatesRemoved + totalOrphansRemoved}`);
  
  if (totalDuplicatesRemoved + totalOrphansRemoved > 0) {
    console.log('\n✅ Core color cleanup completed!');
    console.log('🔄 Run consolidation to update tokensource.json:');
    console.log('   npm run consolidate');
  } else {
    console.log('\n✨ Core colors already clean!');
  }
}

// Run the script
cleanCoreColors();