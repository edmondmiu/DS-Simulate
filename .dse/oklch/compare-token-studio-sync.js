/**
 * Compare Token Studio Export vs Local Tokens
 * Check if they're in sync and identify differences
 */

import { readFileSync } from 'fs';
import { join } from 'path';

async function compareTokenStudioSync() {
  console.log('🔍 Comparing Token Studio Export vs Local Tokens\n');
  
  // Load both core.json files
  const localCoreePath = join(process.cwd(), 'tokens', 'core.json');
  const tokenStudioCorePath = join(process.cwd(), 'compare tokens download', 'core.json');
  
  const localCore = JSON.parse(readFileSync(localCoreePath, 'utf8'));
  const tokenStudioCore = JSON.parse(readFileSync(tokenStudioCorePath, 'utf8'));
  
  console.log('📊 File Size Comparison:');
  const localSize = JSON.stringify(localCore).length;
  const tokenStudioSize = JSON.stringify(tokenStudioCore).length;
  console.log(`   Local tokens/core.json: ${localSize.toLocaleString()} bytes`);
  console.log(`   Token Studio export: ${tokenStudioSize.toLocaleString()} bytes`);
  console.log(`   Difference: ${(localSize - tokenStudioSize).toLocaleString()} bytes (${localSize > tokenStudioSize ? 'local larger' : 'token studio larger'})`);
  
  // Compare color families
  const localFamilies = Object.keys(localCore['Color Ramp']).filter(k => !k.startsWith('_'));
  const tokenStudioFamilies = Object.keys(tokenStudioCore['Color Ramp']).filter(k => !k.startsWith('_'));
  
  console.log('\n🎨 Color Family Comparison:');
  console.log(`   Local families: ${localFamilies.length}`);
  console.log(`   Token Studio families: ${tokenStudioFamilies.length}`);
  
  // Find missing families
  const missingInTokenStudio = localFamilies.filter(f => !tokenStudioFamilies.includes(f));
  const extraInTokenStudio = tokenStudioFamilies.filter(f => !localFamilies.includes(f));
  
  if (missingInTokenStudio.length > 0) {
    console.log(`   ❌ Missing in Token Studio (${missingInTokenStudio.length}):`, missingInTokenStudio);
  }
  
  if (extraInTokenStudio.length > 0) {
    console.log(`   ➕ Extra in Token Studio (${extraInTokenStudio.length}):`, extraInTokenStudio);
  }
  
  if (missingInTokenStudio.length === 0 && extraInTokenStudio.length === 0) {
    console.log('   ✅ Same families in both files');
  }
  
  // Compare OKLCH optimization status
  const localOklchCount = JSON.stringify(localCore).match(/OKLCH optimized/g)?.length || 0;
  const tokenStudioOklchCount = JSON.stringify(tokenStudioCore).match(/OKLCH optimized/g)?.length || 0;
  
  console.log('\n🔬 OKLCH Optimization Comparison:');
  console.log(`   Local OKLCH optimized colors: ${localOklchCount}`);
  console.log(`   Token Studio OKLCH optimized colors: ${tokenStudioOklchCount}`);
  console.log(`   Difference: ${localOklchCount - tokenStudioOklchCount} (${localOklchCount > tokenStudioOklchCount ? 'local has more' : 'token studio has more'})`);
  
  // Compare specific key colors
  console.log('\n🎯 Key Color Value Comparison:');
  
  const keyColors = [
    ['Neon Green', 'Neon Green 1300'], // Our recent fix
    ['Neutral', 'Neutral 0'], // Check neutral direction
    ['Neutral', 'Neutral 1300'], // Check neutral direction
    ['Logifuture Green', 'Logifuture Green 500'], // Our new family
    ['Logifuture Navy Blue', 'Logifuture Navy Blue 500'], // Our new family
    ['Amber', 'Amber 400'], // Check OKLCH optimization
    ['Amber', 'Amber 500'] // Check OKLCH optimization
  ];
  
  let matchingColors = 0;
  let totalChecked = 0;
  
  for (const [family, step] of keyColors) {
    if (localCore['Color Ramp'][family] && localCore['Color Ramp'][family][step] &&
        tokenStudioCore['Color Ramp'][family] && tokenStudioCore['Color Ramp'][family][step]) {
      
      const localValue = localCore['Color Ramp'][family][step].$value;
      const tokenStudioValue = tokenStudioCore['Color Ramp'][family][step].$value;
      const matches = localValue === tokenStudioValue;
      
      console.log(`   ${step}: ${matches ? '✅' : '❌'} ${localValue} ${matches ? '==' : '!='} ${tokenStudioValue}`);
      
      if (matches) matchingColors++;
      totalChecked++;
    } else {
      console.log(`   ${step}: ❌ Missing in one or both files`);
      totalChecked++;
    }
  }
  
  console.log(`\n📊 Key Color Match Rate: ${matchingColors}/${totalChecked} (${(matchingColors/totalChecked*100).toFixed(1)}%)`);
  
  // Check for recently deleted families
  console.log('\n🗑️ Recently Deleted Families Check:');
  const deletedFamilies = ['Dynamic Neutral', 'Dynamic Amber', 'Smoked Grey', 'Logifuture Skynight'];
  
  for (const family of deletedFamilies) {
    const inLocal = localCore['Color Ramp'][family] ? true : false;
    const inTokenStudio = tokenStudioCore['Color Ramp'][family] ? true : false;
    
    console.log(`   ${family}: Local=${inLocal ? '❌ present' : '✅ deleted'}, Token Studio=${inTokenStudio ? '❌ present' : '✅ deleted'}`);
  }
  
  // Overall sync assessment
  console.log('\n🎯 SYNC ASSESSMENT:');
  
  const majorDifferences = [];
  
  if (Math.abs(localOklchCount - tokenStudioOklchCount) > 50) {
    majorDifferences.push(`OKLCH optimization count differs significantly (${Math.abs(localOklchCount - tokenStudioOklchCount)} difference)`);
  }
  
  if (missingInTokenStudio.length > 0) {
    majorDifferences.push(`${missingInTokenStudio.length} families missing in Token Studio`);
  }
  
  if (extraInTokenStudio.length > 0) {
    majorDifferences.push(`${extraInTokenStudio.length} extra families in Token Studio`);
  }
  
  if (matchingColors < totalChecked * 0.8) {
    majorDifferences.push(`Key colors match rate low (${(matchingColors/totalChecked*100).toFixed(1)}%)`);
  }
  
  if (majorDifferences.length === 0) {
    console.log('✅ FILES ARE SUBSTANTIALLY IN SYNC');
    console.log('   Token Studio export matches local tokens with minor differences');
  } else {
    console.log('❌ FILES ARE NOT IN SYNC');
    console.log('   Major differences found:');
    majorDifferences.forEach(diff => console.log(`   • ${diff}`));
  }
  
  return {
    inSync: majorDifferences.length === 0,
    differences: majorDifferences,
    familyCount: { local: localFamilies.length, tokenStudio: tokenStudioFamilies.length },
    oklchCount: { local: localOklchCount, tokenStudio: tokenStudioOklchCount },
    keyColorMatches: { matching: matchingColors, total: totalChecked }
  };
}

// Execute comparison
compareTokenStudioSync().then(result => {
  console.log(`\n🚀 Comparison complete: ${result.inSync ? 'IN SYNC' : 'OUT OF SYNC'} (${result.differences.length} major differences)`);
}).catch(console.error);