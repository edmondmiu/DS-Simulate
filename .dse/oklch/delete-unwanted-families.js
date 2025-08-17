/**
 * Delete Unwanted Color Families
 * Remove: Dynamic Neutral, Dynamic Amber, Smoked Grey, Logifuture Skynight
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

async function deleteUnwantedFamilies() {
  console.log('🗑️  Deleting Unwanted Color Families\n');
  
  // Load both token files
  const coreTokensPath = join(process.cwd(), 'tokens', 'core.json');
  const coreTokens = JSON.parse(readFileSync(coreTokensPath, 'utf8'));
  
  const tokensourcePath = join(process.cwd(), 'tokensource.json');
  const tokensource = JSON.parse(readFileSync(tokensourcePath, 'utf8'));
  
  // Families to delete
  const familiesToDelete = [
    'Dynamic Neutral',
    'Dynamic Amber', 
    'Smoked Grey',
    'Logifuture Skynight'
  ];
  
  console.log('🎯 Families to delete:');
  familiesToDelete.forEach(family => console.log(`   • ${family}`));
  
  let deletedFromCore = 0;
  let deletedFromTokensource = 0;
  
  console.log('\n🗑️  Deleting from tokens/core.json:');
  
  for (const family of familiesToDelete) {
    if (coreTokens['Color Ramp'][family]) {
      const colorCount = Object.keys(coreTokens['Color Ramp'][family]).length;
      delete coreTokens['Color Ramp'][family];
      console.log(`   ✅ Deleted ${family} (${colorCount} colors)`);
      deletedFromCore++;
    } else {
      console.log(`   ⚠️  ${family} not found in core tokens`);
    }
  }
  
  console.log('\n🗑️  Deleting from tokensource.json:');
  
  for (const family of familiesToDelete) {
    if (tokensource.core['Color Ramp'][family]) {
      const colorCount = Object.keys(tokensource.core['Color Ramp'][family]).length;
      delete tokensource.core['Color Ramp'][family];
      console.log(`   ✅ Deleted ${family} (${colorCount} colors)`);
      deletedFromTokensource++;
    } else {
      console.log(`   ⚠️  ${family} not found in tokensource`);
    }
  }
  
  // Update metadata to reflect cleanup
  if (tokensource.core._metadata && tokensource.core._metadata.oklchOptimization) {
    tokensource.core._metadata.oklchOptimization.lastCleanup = {
      cleanedAt: new Date().toISOString(),
      deletedFamilies: familiesToDelete,
      deletedCount: familiesToDelete.length,
      description: "Removed unused/duplicate color families for cleaner system"
    };
  }
  
  // Save both files
  writeFileSync(coreTokensPath, JSON.stringify(coreTokens, null, 2));
  writeFileSync(tokensourcePath, JSON.stringify(tokensource, null, 2));
  
  console.log('\n🎉 DELETION COMPLETE!');
  console.log('========================');
  console.log(`✅ Deleted ${deletedFromCore} families from core tokens`);
  console.log(`✅ Deleted ${deletedFromTokensource} families from tokensource`);
  console.log('✅ Color system cleaned up and streamlined');
  console.log('✅ Metadata updated with cleanup information');
  console.log('========================');
  
  // Show remaining families
  const remainingFamilies = Object.keys(coreTokens['Color Ramp']).filter(key => !key.startsWith('_'));
  console.log(`\n📋 Remaining ${remainingFamilies.length} color families:`);
  remainingFamilies.forEach(family => console.log(`   • ${family}`));
  
  return {
    deletedFromCore,
    deletedFromTokensource,
    remainingFamilies: remainingFamilies.length
  };
}

// Execute deletion
deleteUnwantedFamilies().then(result => {
  console.log(`\n🚀 Cleanup complete: ${result.deletedFromCore + result.deletedFromTokensource} families deleted, ${result.remainingFamilies} families remaining`);
}).catch(console.error);