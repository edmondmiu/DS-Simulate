/**
 * Deploy OKLCH Optimized Colors to Core Tokens
 * Applies all Phase 1-4 results to tokens/core.json
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

async function deployToCore() {
  console.log('🚀 Deploying OKLCH Optimized Colors to Core Tokens\n');
  
  // Load the complete system results
  const completeSystemPath = join(process.cwd(), '.dse', 'oklch', 'phase-4-complete-system.json');
  const completeSystem = JSON.parse(readFileSync(completeSystemPath, 'utf8'));
  
  // Load current core tokens
  const coreTokensPath = join(process.cwd(), 'tokens', 'core.json');
  const coreTokens = JSON.parse(readFileSync(coreTokensPath, 'utf8'));
  
  console.log('📊 Deployment Summary:');
  console.log(`   Dark Mode Families: ${completeSystem.darkModeFamilies.length}`);
  console.log(`   Light Mode Families: ${completeSystem.lightModeFamilies.length}`);
  console.log(`   Fixed Families: ${completeSystem.fixedFamilies.length}`);
  console.log(`   Total Colors to Deploy: ${completeSystem.systemMetrics.totalColors}`);
  
  let deployedColors = 0;
  let newFamilies = 0;
  
  // Deploy all families
  const allFamilies = [
    ...completeSystem.darkModeFamilies,
    ...completeSystem.lightModeFamilies,
    ...completeSystem.fixedFamilies
  ];
  
  console.log('\n🎨 Deploying Color Families:');
  
  for (const family of allFamilies) {
    console.log(`\n📦 ${family.name}:`);
    
    // Determine the core token family name
    let familyKey = family.name;
    if (familyKey.includes('-Dark')) {
      familyKey = familyKey.replace('-Dark', '');
    } else if (familyKey.includes('-Light')) {
      familyKey = familyKey.replace('-Light', '');
    }
    
    // Ensure the family exists in core tokens
    if (!coreTokens[familyKey]) {
      coreTokens[familyKey] = { value: {} };
      newFamilies++;
      console.log(`   ✨ Created new family: ${familyKey}`);
    }
    
    // Deploy each color in the family
    for (const [step, hexColor] of Object.entries(family.colors)) {
      coreTokens[familyKey].value[step] = {
        value: hexColor,
        type: "color",
        description: `OKLCH optimized - ${family.fixType || 'mathematically consistent'}`
      };
      deployedColors++;
      console.log(`   ✅ ${step}: ${hexColor}`);
    }
    
    console.log(`   📊 Smoothness: ${(family.newSmoothness || family.consistency?.smoothness || 0).toFixed(3)}`);
    if (family.improvement) {
      console.log(`   📈 Improvement: ${family.improvement.toFixed(1)}%`);
    }
  }
  
  // Add deployment metadata
  coreTokens._deployment = {
    version: completeSystem.metadata.version,
    deployedAt: new Date().toISOString(),
    oklchOptimized: true,
    epic: "Epic 4 V2: OKLCH Color Optimization",
    statistics: {
      totalColors: deployedColors,
      newFamilies: newFamilies,
      averageSmoothness: completeSystem.systemMetrics.averageSmoothness,
      dualModeSystem: true
    }
  };
  
  // Save the updated core tokens
  writeFileSync(coreTokensPath, JSON.stringify(coreTokens, null, 2));
  
  console.log('\n🎉 DEPLOYMENT COMPLETE!');
  console.log('================================');
  console.log(`✅ ${deployedColors} colors deployed`);
  console.log(`✅ ${newFamilies} new families created`);
  console.log(`✅ Average smoothness: ${completeSystem.systemMetrics.averageSmoothness.toFixed(3)}`);
  console.log(`✅ Dual-mode system: ${completeSystem.dualModeValidation.familyParity ? 'ACTIVE' : 'PARTIAL'}`);
  console.log(`✅ Brand consistency: ${completeSystem.dualModeValidation.brandColorConsistency.filter(b => b.consistent).length}/${completeSystem.dualModeValidation.brandColorConsistency.length} families`);
  console.log('================================');
  console.log(`💾 Updated: ${coreTokensPath}`);
  
  return {
    deployedColors,
    newFamilies,
    systemMetrics: completeSystem.systemMetrics
  };
}

// Execute deployment
deployToCore().then(result => {
  console.log(`\n🚀 Epic 4 V2 Deployment: ${result.deployedColors} colors ready for production!`);
}).catch(console.error);