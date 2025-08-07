#!/usr/bin/env node

/**
 * Workflow Validation Script
 * Tests the GitHub Actions workflow locally to ensure all steps work correctly
 */

import { execSync } from 'child_process';
import { existsSync, statSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

let testsPassed = 0;
let testsFailed = 0;
let errors = [];

function runCommand(command, description) {
    console.log(`🔍 ${description}...`);
    try {
        const output = execSync(command, { 
            cwd: projectRoot, 
            encoding: 'utf8',
            stdio: 'pipe'
        });
        console.log(`✅ ${description} - SUCCESS`);
        return { success: true, output };
    } catch (error) {
        console.log(`❌ ${description} - FAILED`);
        console.log(`   Error: ${error.message}`);
        errors.push(`${description}: ${error.message}`);
        return { success: false, error: error.message };
    }
}

function validateFile(filePath, description, minSize = 0) {
    console.log(`🔍 Validating ${description}...`);
    const fullPath = join(projectRoot, filePath);
    
    if (!existsSync(fullPath)) {
        console.log(`❌ ${description} - FILE NOT FOUND: ${filePath}`);
        errors.push(`${description}: File not found`);
        testsFailed++;
        return false;
    }
    
    const stats = statSync(fullPath);
    if (stats.size < minSize) {
        console.log(`❌ ${description} - FILE TOO SMALL: ${stats.size} bytes (minimum: ${minSize})`);
        errors.push(`${description}: File too small (${stats.size} bytes)`);
        testsFailed++;
        return false;
    }
    
    console.log(`✅ ${description} - SUCCESS (${stats.size} bytes)`);
    testsPassed++;
    return { size: stats.size, path: fullPath };
}

function validateJSON(filePath, description) {
    console.log(`🔍 Validating JSON structure: ${description}...`);
    const fullPath = join(projectRoot, filePath);
    
    if (!existsSync(fullPath)) {
        console.log(`❌ ${description} - FILE NOT FOUND: ${filePath}`);
        errors.push(`${description}: File not found`);
        testsFailed++;
        return false;
    }
    
    try {
        const content = readFileSync(fullPath, 'utf8');
        const parsed = JSON.parse(content);
        console.log(`✅ ${description} - VALID JSON`);
        testsPassed++;
        return { valid: true, data: parsed, size: content.length };
    } catch (error) {
        console.log(`❌ ${description} - INVALID JSON: ${error.message}`);
        errors.push(`${description}: Invalid JSON - ${error.message}`);
        testsFailed++;
        return false;
    }
}

async function main() {
    console.log('🚀 Starting Workflow Validation');
    console.log('================================\n');
    
    // Test 1: Validate GitHub Actions workflow file exists
    validateFile('.github/workflows/update-tokens.yml', 'GitHub Actions workflow file', 100);
    
    // Test 2: Validate current tokensource.json
    validateFile('tokensource.json', 'Current tokensource.json', 100000);
    
    // Test 3: Validate JSON structure of tokensource.json
    validateJSON('tokensource.json', 'tokensource.json structure');
    
    // Test 4: Validate token metadata
    const metadataResult = validateJSON('tokens/$metadata.json', 'Token metadata');
    
    // Test 5: Test TypeScript compilation
    const buildResult = runCommand('npm run build', 'TypeScript compilation');
    if (buildResult.success) testsPassed++; else testsFailed++;
    
    // Test 6: Test ESLint validation
    const lintResult = runCommand('npm run lint', 'ESLint validation');
    if (lintResult.success) testsPassed++; else testsFailed++;
    
    // Test 7: Test complete test suite
    const testResult = runCommand('npm test', 'Complete test suite');
    if (testResult.success) testsPassed++; else testsFailed++;
    
    // Test 8: Test consolidation process
    console.log('🔍 Testing token consolidation process...');
    const consolidateResult = runCommand('npm run consolidate', 'Token consolidation');
    if (consolidateResult.success) {
        testsPassed++;
        
        // Validate the result
        const newTokensourceResult = validateFile('tokensource.json', 'Updated tokensource.json after consolidation', 100000);
        const newJsonResult = validateJSON('tokensource.json', 'Updated tokensource.json structure');
        
        if (newTokensourceResult && newJsonResult) {
            console.log(`📊 Consolidation Results:`);
            console.log(`   File size: ${newTokensourceResult.size} bytes`);
            
            if (metadataResult && metadataResult.data && metadataResult.data.tokenSetOrder) {
                console.log(`   Token sets: ${metadataResult.data.tokenSetOrder.length} sets`);
            }
        }
    } else {
        testsFailed++;
    }
    
    // Test 9: Test round-trip validation
    console.log('🔍 Testing round-trip validation (consolidate → split → consolidate)...');
    const splitResult = runCommand('npm run split', 'Token split (round-trip test)');
    if (splitResult.success) {
        const secondConsolidateResult = runCommand('npm run consolidate', 'Second consolidation (round-trip test)');
        if (secondConsolidateResult.success) {
            const finalResult = validateFile('tokensource.json', 'Final tokensource.json after round-trip', 100000);
            if (finalResult) {
                console.log('✅ Round-trip validation - SUCCESS');
                testsPassed++;
            } else {
                testsFailed++;
            }
        } else {
            testsFailed++;
        }
    } else {
        testsFailed++;
    }
    
    // Summary
    console.log('\n🎯 Validation Summary');
    console.log('====================');
    console.log(`✅ Tests Passed: ${testsPassed}`);
    console.log(`❌ Tests Failed: ${testsFailed}`);
    console.log(`📊 Success Rate: ${Math.round((testsPassed / (testsPassed + testsFailed)) * 100)}%`);
    
    if (errors.length > 0) {
        console.log('\n🚨 Errors Found:');
        errors.forEach((error, index) => {
            console.log(`   ${index + 1}. ${error}`);
        });
    }
    
    console.log('\n🔗 GitHub Actions Integration:');
    console.log('- Workflow file: .github/workflows/update-tokens.yml');
    console.log('- Trigger: Push to main branch with tokens/** changes');
    console.log('- Permission: contents: write');
    console.log('- Raw URL: https://raw.githubusercontent.com/{owner}/{repo}/main/tokensource.json');
    
    if (testsFailed === 0) {
        console.log('\n🎉 All validations passed! Workflow is ready for GitHub Actions.');
        process.exit(0);
    } else {
        console.log('\n⚠️ Some validations failed. Please fix errors before using GitHub Actions.');
        process.exit(1);
    }
}

main().catch(error => {
    console.error('💥 Validation script failed:', error);
    process.exit(1);
});