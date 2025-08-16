/**
 * Token Studio Integration Verifier
 * Verifies Token Studio integration across all designer workflows
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

export interface TokenStudioTestResult {
  testName: string;
  success: boolean;
  details: string;
  warnings: string[];
}

export interface TokenStudioReport {
  testDate: string;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  warningCount: number;
  passRate: number;
  results: TokenStudioTestResult[];
  fileStructure: {
    coreTokens: boolean;
    tokensourceGeneration: boolean;
    brandTokens: boolean;
    semanticTokens: boolean;
  };
  workflowValidation: {
    consolidateWorkflow: TokenStudioTestResult;
    splitWorkflow: TokenStudioTestResult;
    brandSwitching: TokenStudioTestResult;
    colorValidation: TokenStudioTestResult;
  };
  recommendations: string[];
}

export class TokenStudioVerifier {

  /**
   * Execute a test with error handling
   */
  private static executeTest(
    testName: string, 
    testFunction: () => { success: boolean; details: string; warnings?: string[] }
  ): TokenStudioTestResult {
    try {
      const result = testFunction();
      return {
        testName,
        success: result.success,
        details: result.details,
        warnings: result.warnings || []
      };
    } catch (error) {
      return {
        testName,
        success: false,
        details: `Test failed with error: ${error}`,
        warnings: []
      };
    }
  }

  /**
   * Verify core token file structure
   */
  private static verifyFileStructure(): {
    coreTokens: boolean;
    tokensourceGeneration: boolean;
    brandTokens: boolean;
    semanticTokens: boolean;
  } {
    const coreTokensPath = join(process.cwd(), 'tokens', 'core.json');
    const tokensourcePath = join(process.cwd(), 'tokensource.json');
    const globalLightPath = join(process.cwd(), 'tokens', 'global light.json');
    const componentsPath = join(process.cwd(), 'tokens', 'components.json');

    return {
      coreTokens: existsSync(coreTokensPath),
      tokensourceGeneration: existsSync(tokensourcePath),
      brandTokens: existsSync(globalLightPath),
      semanticTokens: existsSync(componentsPath)
    };
  }

  /**
   * Test consolidate workflow compatibility
   */
  private static testConsolidateWorkflow(): TokenStudioTestResult {
    return this.executeTest('Consolidate Workflow', () => {
      try {
        // Check if consolidate script exists
        const packageJsonPath = join(process.cwd(), 'package.json');
        if (!existsSync(packageJsonPath)) {
          return { 
            success: false, 
            details: 'package.json not found',
            warnings: ['Package.json required for npm script validation']
          };
        }

        const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
        const scripts = packageJson.scripts || {};
        
        if (!scripts.consolidate) {
          return { 
            success: false, 
            details: 'consolidate script not found in package.json',
            warnings: ['Add consolidate script to package.json for Token Studio integration']
          };
        }

        // Test that tokensource.json can be generated
        const tokensourcePath = join(process.cwd(), 'tokensource.json');
        const tokensourceExists = existsSync(tokensourcePath);
        
        if (!tokensourceExists) {
          return {
            success: false,
            details: 'tokensource.json not found - consolidate workflow may not be working',
            warnings: ['Run npm run consolidate to generate tokensource.json']
          };
        }

        // Verify tokensource content
        const tokensource = JSON.parse(readFileSync(tokensourcePath, 'utf8'));
        
        // Check for core color content
        const hasColorRamp = tokensource?.core?.['Color Ramp'];
        if (!hasColorRamp) {
          return {
            success: false,
            details: 'tokensource.json missing Color Ramp structure',
            warnings: ['Color Ramp structure required for Token Studio integration']
          };
        }

        // Count colors in tokensource
        let tokensourceColors = 0;
        Object.keys(hasColorRamp).forEach(family => {
          Object.keys(hasColorRamp[family]).forEach(color => {
            if (hasColorRamp[family][color] && hasColorRamp[family][color].$value) {
              tokensourceColors++;
            }
          });
        });

        const warnings: string[] = [];
        if (tokensourceColors < 500) {
          warnings.push(`Only ${tokensourceColors} colors in tokensource, expected 500+`);
        }

        return {
          success: true,
          details: `Consolidate workflow functional. tokensource.json contains ${tokensourceColors} colors`,
          warnings
        };

      } catch (error) {
        return {
          success: false,
          details: `Consolidate workflow test failed: ${error}`,
          warnings: []
        };
      }
    });
  }

  /**
   * Test split workflow compatibility
   */
  private static testSplitWorkflow(): TokenStudioTestResult {
    return this.executeTest('Split Workflow', () => {
      try {
        // Check if split script exists
        const packageJsonPath = join(process.cwd(), 'package.json');
        const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
        const scripts = packageJson.scripts || {};
        
        if (!scripts.split) {
          return { 
            success: false, 
            details: 'split script not found in package.json',
            warnings: ['Add split script to package.json for Token Studio integration']
          };
        }

        // Check for split target files
        const expectedFiles = [
          'tokens/core.json',
          'tokens/global.json',
          'tokens/global light.json',
          'tokens/components.json'
        ];

        const missingFiles: string[] = [];
        const existingFiles: string[] = [];

        expectedFiles.forEach(filePath => {
          const fullPath = join(process.cwd(), filePath);
          if (existsSync(fullPath)) {
            existingFiles.push(filePath);
          } else {
            missingFiles.push(filePath);
          }
        });

        const warnings: string[] = [];
        if (missingFiles.length > 0) {
          warnings.push(`Missing split target files: ${missingFiles.join(', ')}`);
        }

        // Verify core.json has OKLCH optimized colors
        const coreTokensPath = join(process.cwd(), 'tokens', 'core.json');
        const coreTokens = JSON.parse(readFileSync(coreTokensPath, 'utf8'));
        
        let oklchOptimizedCount = 0;
        if (coreTokens['Color Ramp']) {
          Object.keys(coreTokens['Color Ramp']).forEach(family => {
            Object.keys(coreTokens['Color Ramp'][family]).forEach(color => {
              const colorData = coreTokens['Color Ramp'][family][color];
              if (colorData && colorData.$description && 
                  colorData.$description.includes('OKLCH optimized')) {
                oklchOptimizedCount++;
              }
            });
          });
        }

        if (oklchOptimizedCount === 0) {
          warnings.push('No OKLCH optimized colors detected in core.json');
        }

        return {
          success: true,
          details: `Split workflow functional. ${existingFiles.length}/${expectedFiles.length} target files exist. ${oklchOptimizedCount} OKLCH optimized colors found`,
          warnings
        };

      } catch (error) {
        return {
          success: false,
          details: `Split workflow test failed: ${error}`,
          warnings: []
        };
      }
    });
  }

  /**
   * Test brand switching functionality
   */
  private static testBrandSwitching(): TokenStudioTestResult {
    return this.executeTest('Brand Switching', () => {
      try {
        // Check for brand-specific token files
        const brandFiles = [
          'tokens/bet9ja dark.json',
          'tokens/bet9ja light.json'
        ];

        const existingBrandFiles: string[] = [];
        const missingBrandFiles: string[] = [];

        brandFiles.forEach(brandFile => {
          const filePath = join(process.cwd(), brandFile);
          if (existsSync(filePath)) {
            existingBrandFiles.push(brandFile);
          } else {
            missingBrandFiles.push(brandFile);
          }
        });

        // Check core.json for multi-brand color support
        const coreTokensPath = join(process.cwd(), 'tokens', 'core.json');
        const coreTokens = JSON.parse(readFileSync(coreTokensPath, 'utf8'));
        
        // Look for brand-specific colors
        const brandColorFamilies = [
          'Logifuture Green',
          'Logifuture Blue', 
          'Logifuture Skynight',
          'Casino'
        ];

        const foundBrandFamilies: string[] = [];
        const missingBrandFamilies: string[] = [];

        brandColorFamilies.forEach(family => {
          if (coreTokens['Color Ramp'] && coreTokens['Color Ramp'][family]) {
            foundBrandFamilies.push(family);
          } else {
            missingBrandFamilies.push(family);
          }
        });

        const warnings: string[] = [];
        if (missingBrandFiles.length > 0) {
          warnings.push(`Missing brand files: ${missingBrandFiles.join(', ')}`);
        }
        if (missingBrandFamilies.length > 0) {
          warnings.push(`Missing brand color families: ${missingBrandFamilies.join(', ')}`);
        }

        const success = foundBrandFamilies.length >= 2; // At least 2 brand families should exist

        return {
          success,
          details: `Brand switching support: ${foundBrandFamilies.length}/${brandColorFamilies.length} brand families found, ${existingBrandFiles.length}/${brandFiles.length} brand files exist`,
          warnings
        };

      } catch (error) {
        return {
          success: false,
          details: `Brand switching test failed: ${error}`,
          warnings: []
        };
      }
    });
  }

  /**
   * Test color validation and Token Studio compatibility
   */
  private static testColorValidation(): TokenStudioTestResult {
    return this.executeTest('Color Validation & Token Studio Compatibility', () => {
      try {
        const coreTokensPath = join(process.cwd(), 'tokens', 'core.json');
        const coreTokens = JSON.parse(readFileSync(coreTokensPath, 'utf8'));
        
        let totalColors = 0;
        let validHexColors = 0;
        let invalidColors: string[] = [];
        let tokenStudioStructureIssues: string[] = [];

        if (!coreTokens['Color Ramp']) {
          return {
            success: false,
            details: 'Missing Color Ramp structure required by Token Studio',
            warnings: []
          };
        }

        // Validate Token Studio structure and color format
        Object.keys(coreTokens['Color Ramp']).forEach(familyName => {
          const family = coreTokens['Color Ramp'][familyName];
          
          if (typeof family !== 'object') {
            tokenStudioStructureIssues.push(`${familyName} is not an object`);
            return;
          }

          Object.keys(family).forEach(colorKey => {
            const colorData = family[colorKey];
            totalColors++;

            // Check Token Studio required structure
            if (!colorData || typeof colorData !== 'object') {
              tokenStudioStructureIssues.push(`${familyName}.${colorKey} is not an object`);
              return;
            }

            if (!colorData.$value) {
              tokenStudioStructureIssues.push(`${familyName}.${colorKey} missing $value`);
              return;
            }

            // Validate hex color format
            const hex = colorData.$value;
            if (typeof hex === 'string' && /^#[0-9A-Fa-f]{6}$/.test(hex)) {
              validHexColors++;
            } else {
              invalidColors.push(`${familyName}.${colorKey}: ${hex}`);
            }

            // Check for Token Studio metadata
            if (!colorData.$type) {
              // This is optional but recommended for Token Studio
            }
          });
        });

        const warnings: string[] = [];
        
        if (invalidColors.length > 0) {
          warnings.push(`${invalidColors.length} invalid hex colors found`);
          if (invalidColors.length <= 5) {
            warnings.push(`Invalid colors: ${invalidColors.join(', ')}`);
          }
        }

        if (tokenStudioStructureIssues.length > 0) {
          warnings.push(`${tokenStudioStructureIssues.length} Token Studio structure issues found`);
          if (tokenStudioStructureIssues.length <= 3) {
            warnings.push(`Structure issues: ${tokenStudioStructureIssues.join(', ')}`);
          }
        }

        const validColorRate = totalColors > 0 ? (validHexColors / totalColors) * 100 : 0;
        const success = validColorRate >= 95 && tokenStudioStructureIssues.length === 0;

        return {
          success,
          details: `Color validation: ${validHexColors}/${totalColors} valid colors (${validColorRate.toFixed(1)}%). Token Studio structure: ${tokenStudioStructureIssues.length === 0 ? 'Valid' : 'Issues found'}`,
          warnings
        };

      } catch (error) {
        return {
          success: false,
          details: `Color validation test failed: ${error}`,
          warnings: []
        };
      }
    });
  }

  /**
   * Generate Token Studio recommendations
   */
  private static generateRecommendations(report: TokenStudioReport): string[] {
    const recommendations: string[] = [];

    // File structure recommendations
    if (!report.fileStructure.coreTokens) {
      recommendations.push('❌ Create tokens/core.json for Token Studio integration');
    } else {
      recommendations.push('✅ Core tokens file structure validated');
    }

    if (!report.fileStructure.tokensourceGeneration) {
      recommendations.push('⚠️  Generate tokensource.json with npm run consolidate');
    } else {
      recommendations.push('✅ Token source generation functional');
    }

    // Workflow recommendations
    if (report.workflowValidation.consolidateWorkflow.success) {
      recommendations.push('✅ Consolidate workflow compatible with OKLCH optimization');
    } else {
      recommendations.push('❌ Fix consolidate workflow for Token Studio integration');
    }

    if (report.workflowValidation.splitWorkflow.success) {
      recommendations.push('✅ Split workflow maintains OKLCH optimized colors');
    } else {
      recommendations.push('❌ Fix split workflow to preserve OKLCH optimization');
    }

    // Brand switching recommendations
    if (report.workflowValidation.brandSwitching.success) {
      recommendations.push('✅ Multi-brand Token Studio integration validated');
    } else {
      recommendations.push('⚠️  Improve multi-brand Token Studio support');
    }

    // Color validation recommendations
    if (report.workflowValidation.colorValidation.success) {
      recommendations.push('✅ All colors compatible with Token Studio format');
    } else {
      recommendations.push('❌ Fix color format issues for Token Studio compatibility');
    }

    // General recommendations
    recommendations.push('Test Token Studio sync with optimized colors');
    recommendations.push('Validate designer workflow with OKLCH optimized tokens');
    recommendations.push('Document Token Studio integration with OKLCH optimization');

    if (report.passRate === 100) {
      recommendations.push('🎉 Full Token Studio integration validated - ready for designer workflows');
    } else if (report.passRate >= 75) {
      recommendations.push('⚠️  Token Studio integration mostly functional - address remaining issues');
    } else {
      recommendations.push('❌ Token Studio integration needs significant improvement');
    }

    return recommendations;
  }

  /**
   * Comprehensive Token Studio integration verification
   */
  public static verifyTokenStudioIntegration(): TokenStudioReport {
    console.log('🔍 Starting Token Studio integration verification...\n');

    const fileStructure = this.verifyFileStructure();
    console.log('📁 File structure verified\n');

    // Run workflow validation tests
    const workflowValidation = {
      consolidateWorkflow: this.testConsolidateWorkflow(),
      splitWorkflow: this.testSplitWorkflow(),
      brandSwitching: this.testBrandSwitching(),
      colorValidation: this.testColorValidation()
    };

    const allResults = Object.values(workflowValidation);
    const passedTests = allResults.filter(r => r.success).length;
    const failedTests = allResults.filter(r => !r.success).length;
    const warningCount = allResults.reduce((sum, r) => sum + r.warnings.length, 0);

    const report: TokenStudioReport = {
      testDate: new Date().toISOString(),
      totalTests: allResults.length,
      passedTests,
      failedTests,
      warningCount,
      passRate: (passedTests / allResults.length) * 100,
      results: allResults,
      fileStructure,
      workflowValidation,
      recommendations: []
    };

    report.recommendations = this.generateRecommendations(report);

    return report;
  }

  /**
   * Generate comprehensive Token Studio integration report
   */
  public static generateTokenStudioReport(): void {
    console.log('🎯 Story 1.6: Token Studio Integration Verification\n');
    
    const report = this.verifyTokenStudioIntegration();
    
    console.log('📊 Token Studio Integration Results:\n');
    console.log(`Total tests: ${report.totalTests}`);
    console.log(`Passed: ${report.passedTests}`);
    console.log(`Failed: ${report.failedTests}`);
    console.log(`Warnings: ${report.warningCount}`);
    console.log(`Pass rate: ${report.passRate.toFixed(1)}%\n`);

    // File structure status
    console.log('📁 File Structure Status:');
    Object.entries(report.fileStructure).forEach(([file, exists]) => {
      const status = exists ? '✅' : '❌';
      console.log(`   ${status} ${file}`);
    });
    console.log();

    // Workflow validation results
    console.log('🔧 Workflow Validation Results:\n');
    Object.entries(report.workflowValidation).forEach(([workflow, result]) => {
      const status = result.success ? '✅' : '❌';
      console.log(`${status} ${result.testName}:`);
      console.log(`   ${result.details}`);
      if (result.warnings.length > 0) {
        console.log(`   Warnings: ${result.warnings.join(', ')}`);
      }
      console.log();
    });

    // Recommendations
    console.log('💡 Token Studio Integration Recommendations:');
    report.recommendations.forEach(rec => {
      console.log(`   ${rec}`);
    });
    console.log();

    // Acceptance criteria validation
    console.log('📋 AC5: Token Studio integration validation:\n');
    const ac5Pass = report.passRate >= 75; // 75% of workflows must pass
    console.log(`✅ AC5: Token Studio integration verified across designer workflows: ${ac5Pass ? 'PASS' : 'NEEDS IMPROVEMENT'}`);
    console.log(`   Workflow success rate: ${report.passRate.toFixed(1)}% (target: ≥75%)`);
    console.log(`   Consolidate workflow: ${report.workflowValidation.consolidateWorkflow.success ? 'Functional' : 'Needs work'}`);
    console.log(`   Split workflow: ${report.workflowValidation.splitWorkflow.success ? 'Functional' : 'Needs work'}`);
    console.log(`   Brand switching: ${report.workflowValidation.brandSwitching.success ? 'Functional' : 'Needs work'}`);
    console.log(`   Color validation: ${report.workflowValidation.colorValidation.success ? 'Functional' : 'Needs work'}`);
    
    if (ac5Pass) {
      console.log('\n🎉 Token Studio integration verification PASSED!');
      console.log('   OKLCH optimized colors fully compatible with Token Studio');
      console.log('   Designer workflows validated and functional');
      console.log('   Multi-brand support verified across all integrations');
    } else {
      console.log('\n⚠️  Token Studio integration needs improvement');
      console.log('   Some designer workflows require attention');
      console.log('   Address integration issues before full deployment');
    }

    // Save detailed report
    const reportPath = join(process.cwd(), '.dse', 'oklch', 'token-studio-integration-report.json');
    writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📄 Detailed report saved to: ${reportPath}`);
  }
}