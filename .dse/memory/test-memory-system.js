/**
 * Simple test to validate DSE Memory System functionality
 * Run with: node .dse/memory/test-memory-system.js
 */

import { readFileSync } from 'fs';
import { join } from 'path';

console.log('🧠 Testing DSE Memory System...\n');

// Test 1: Verify Epic 4 completion record
try {
  const epic4Path = '.dse/memory/epics/epic-4-oklch-completion.json';
  const epic4Data = JSON.parse(readFileSync(epic4Path, 'utf-8'));
  
  console.log('✅ Epic 4 Memory Record:');
  console.log(`   - ID: ${epic4Data.id}`);
  console.log(`   - Status: ${epic4Data.status}`);
  console.log(`   - Goals: ${epic4Data.goals.length} defined`);
  console.log(`   - Outcomes: ${epic4Data.outcomes.length} achieved`);
  console.log(`   - Key Decisions: ${epic4Data.keyDecisions.length} recorded`);
  console.log(`   - Learnings: ${epic4Data.learnings.length} captured`);
  console.log(`   - Patterns: ${epic4Data.patterns.length} identified`);
  console.log(`   - Success Metrics: ${epic4Data.successMetrics.length} tracked\n`);
  
  // Show key learnings
  console.log('🎯 Critical Learnings from Epic 4:');
  epic4Data.learnings
    .filter(l => l.importance === 'critical')
    .forEach((learning, i) => {
      console.log(`   ${i + 1}. ${learning.description}`);
    });
  console.log('');
  
} catch (error) {
  console.error('❌ Failed to load Epic 4 memory:', error.message);
}

// Test 2: Verify directory structure
const directories = [
  '.dse/memory/epics',
  '.dse/memory/tasks', 
  '.dse/memory/context',
  '.dse/memory/patterns'
];

console.log('📁 Memory Directory Structure:');
directories.forEach(dir => {
  try {
    const files = require('fs').readdirSync(dir);
    console.log(`   ✅ ${dir} (${files.length} files)`);
  } catch (error) {
    console.log(`   ❌ ${dir} - ${error.message}`);
  }
});
console.log('');

// Test 3: Verify memory system files
const memoryFiles = [
  '.dse/memory/schema.ts',
  '.dse/memory/memory-manager.ts',
  '.dse/memory/context-loader.ts',
  '.dse/memory/agent-integration.ts',
  '.dse/memory/README.md'
];

console.log('📄 Memory System Files:');
memoryFiles.forEach(file => {
  try {
    const content = readFileSync(file, 'utf-8');
    const lines = content.split('\n').length;
    console.log(`   ✅ ${file} (${lines} lines)`);
  } catch (error) {
    console.log(`   ❌ ${file} - ${error.message}`);
  }
});
console.log('');

// Test 4: Show Epic 4 patterns for demonstration
try {
  const epic4Data = JSON.parse(readFileSync('.dse/memory/epics/epic-4-oklch-completion.json', 'utf-8'));
  
  console.log('🔄 Reusable Patterns from Epic 4:');
  epic4Data.patterns.forEach((pattern, i) => {
    console.log(`   ${i + 1}. ${pattern.name}`);
    console.log(`      → ${pattern.description}`);
    console.log(`      → Effectiveness: ${pattern.effectiveness}/10, Reusability: ${pattern.reusability}/10\n`);
  });
  
} catch (error) {
  console.error('❌ Failed to show patterns:', error.message);
}

// Test 5: Verify BMad agent enhancement
try {
  const agentPath = '.bmad-core/agents/dse.md';
  const agentContent = readFileSync(agentPath, 'utf-8');
  
  console.log('🤖 DSE Agent Enhancement:');
  if (agentContent.includes('memory_system: enabled')) {
    console.log('   ✅ Memory system integration enabled');
  }
  if (agentContent.includes('epic_4_context: always_apply')) {
    console.log('   ✅ Epic 4 context application configured');
  }
  if (agentContent.includes('memory-status')) {
    console.log('   ✅ Memory-aware commands added');
  }
  if (agentContent.includes('oklch-optimize')) {
    console.log('   ✅ OKLCH optimization command available');
  }
  console.log('');
  
} catch (error) {
  console.error('❌ Failed to verify agent enhancement:', error.message);
}

console.log('🚀 Memory System Test Complete!');
console.log('');
console.log('Next Steps:');
console.log('1. Use /BMad:agents:dse to activate the enhanced DSE agent');
console.log('2. The agent will automatically load Epic 4 context');
console.log('3. Test memory-aware commands like *memory-status and *oklch-optimize');
console.log('4. The agent will apply Epic 4 patterns to new color and pipeline tasks');