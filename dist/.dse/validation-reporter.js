/**
 * Automated accessibility reporting and validation summary for DSE color system
 * Generates comprehensive reports with specific recommendations and exportable formats
 */
import * as fs from 'fs';
import * as path from 'path';
import { colorValidator } from './color-validator.js';
import { accessibilityValidator } from './accessibility-validator.js';
import { brandConsistencyValidator } from './brand-consistency-validator.js';
import { relationshipValidator } from './relationship-validator.js';
export class ValidationReporter {
    startTime = 0;
    config = {};
    /**
     * Generates a comprehensive validation report
     */
    async generateReport(tokenSet, brandThemes = [], colorPairs = [], config = {}) {
        this.startTime = Date.now();
        this.config = config;
        console.log('[ValidationReporter] Starting comprehensive validation analysis...');
        // Run all validations in parallel for performance
        const [colorResults, accessibilityResults, brandResults, relationshipResults] = await Promise.all([
            this.runColorValidation(tokenSet),
            this.runAccessibilityValidation(colorPairs),
            this.runBrandConsistencyValidation(brandThemes),
            this.runRelationshipValidation(tokenSet)
        ]);
        console.log('[ValidationReporter] All validations completed, generating report...');
        const report = {
            summary: this.generateSummary(colorResults, accessibilityResults, brandResults, relationshipResults),
            colorValidation: this.generateColorValidationSection(colorResults),
            accessibilityValidation: this.generateAccessibilitySection(accessibilityResults),
            brandConsistency: this.generateBrandConsistencySection(brandResults),
            relationships: this.generateRelationshipSection(relationshipResults),
            recommendations: this.generateRecommendations(colorResults, accessibilityResults, brandResults, relationshipResults),
            metadata: this.generateMetadata(tokenSet)
        };
        console.log(`[ValidationReporter] Report generated successfully in ${Date.now() - this.startTime}ms`);
        return report;
    }
    /**
     * Runs color format and range validation
     */
    async runColorValidation(tokenSet) {
        const results = [];
        const processTokens = (obj, basePath = '') => {
            for (const [key, value] of Object.entries(obj)) {
                const currentPath = basePath ? `${basePath}.${key}` : key;
                if (value && typeof value === 'object') {
                    if (value.$type === 'color') {
                        const result = colorValidator.validateColorToken(currentPath, value, tokenSet);
                        results.push(result);
                    }
                    else if (!('$type' in value)) {
                        processTokens(value, currentPath);
                    }
                }
            }
        };
        Object.entries(tokenSet).forEach(([tokenSetName, tokenData]) => {
            if (tokenData && typeof tokenData === 'object') {
                processTokens(tokenData, tokenSetName);
            }
        });
        return results;
    }
    /**
     * Runs accessibility validation for color pairs
     */
    async runAccessibilityValidation(colorPairs) {
        if (colorPairs.length === 0) {
            return [];
        }
        return accessibilityValidator.validateColorPairs(colorPairs);
    }
    /**
     * Runs brand consistency validation
     */
    async runBrandConsistencyValidation(brandThemes) {
        if (brandThemes.length === 0) {
            return [];
        }
        return brandConsistencyValidator.validateBrandConsistency(brandThemes);
    }
    /**
     * Runs relationship and dependency validation
     */
    async runRelationshipValidation(tokenSet) {
        const results = [];
        const processTokens = (obj, basePath = '') => {
            for (const [key, value] of Object.entries(obj)) {
                const currentPath = basePath ? `${basePath}.${key}` : key;
                if (value && typeof value === 'object') {
                    if ('$type' in value && '$value' in value) {
                        const result = relationshipValidator.validateReferenceChain(currentPath, value.$value, tokenSet);
                        results.push(result);
                    }
                    else {
                        processTokens(value, currentPath);
                    }
                }
            }
        };
        Object.entries(tokenSet).forEach(([tokenSetName, tokenData]) => {
            if (tokenData && typeof tokenData === 'object') {
                processTokens(tokenData, tokenSetName);
            }
        });
        return results;
    }
    /**
     * Generates overall validation summary
     */
    generateSummary(colorResults, accessibilityResults, brandResults, relationshipResults) {
        const allResults = [...colorResults, ...accessibilityResults, ...relationshipResults];
        const validResults = allResults.filter(r => r.valid);
        const criticalIssues = [
            ...colorResults.filter(r => r.errors.some(e => e.severity === 'error')),
            ...accessibilityResults.filter(r => r.errors.some(e => e.severity === 'error')),
            ...relationshipResults.filter(r => r.errors.some(e => e.severity === 'error'))
        ].length;
        const warnings = [
            ...colorResults.reduce((sum, r) => sum + r.warnings.length, 0),
            ...accessibilityResults.reduce((sum, r) => sum + r.warnings.length, 0),
            ...brandResults.reduce((sum, r) => sum + r.warnings.length, 0),
            ...relationshipResults.reduce((sum, r) => sum + r.warnings.length, 0)
        ].reduce((a, b) => a + b, 0);
        return {
            totalTokens: relationshipResults.length,
            colorTokens: colorResults.length,
            validTokens: validResults.length,
            invalidTokens: allResults.length - validResults.length,
            overallScore: allResults.length > 0 ? validResults.length / allResults.length : 1,
            passedValidations: validResults.length,
            totalValidations: allResults.length,
            criticalIssues,
            warnings
        };
    }
    /**
     * Generates color validation section
     */
    generateColorValidationSection(results) {
        const formatDistribution = results.reduce((dist, result) => {
            dist[result.format] = (dist[result.format] || 0) + 1;
            return dist;
        }, {});
        const allErrors = results.flatMap(r => r.errors);
        const issueFrequency = allErrors.reduce((freq, error) => {
            const key = `${error.type}: ${error.message.split(' ').slice(0, 5).join(' ')}`;
            if (!freq[key]) {
                freq[key] = { issue: key, count: 0, percentage: 0, examples: [] };
            }
            freq[key].count++;
            if (freq[key].examples.length < 3) {
                freq[key].examples.push(error.value?.toString() || '');
            }
            return freq;
        }, {});
        // Calculate percentages
        Object.values(issueFrequency).forEach(item => {
            item.percentage = (item.count / allErrors.length) * 100;
        });
        const commonIssues = Object.values(issueFrequency)
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);
        return {
            summary: {
                total: results.length,
                valid: results.filter(r => r.valid).length,
                formatIssues: results.filter(r => r.errors.some(e => e.type === 'format')).length,
                rangeIssues: results.filter(r => r.errors.some(e => e.type === 'range')).length,
                referenceIssues: results.filter(r => r.errors.some(e => e.type === 'reference')).length,
            },
            results,
            formatDistribution,
            commonIssues
        };
    }
    /**
     * Generates accessibility validation section
     */
    generateAccessibilitySection(results) {
        if (results.length === 0) {
            return {
                summary: {
                    total: 0,
                    aaCompliant: 0,
                    aaaCompliant: 0,
                    failing: 0,
                    averageContrast: 0
                },
                results: [],
                contrastDistribution: { excellent: 0, good: 0, poor: 0, failing: 0 },
                recommendations: [],
                criticalFailures: []
            };
        }
        const averageContrast = results.reduce((sum, r) => sum + r.contrastRatio, 0) / results.length;
        const contrastDistribution = {
            excellent: results.filter(r => r.contrastRatio >= 7.0).length,
            good: results.filter(r => r.contrastRatio >= 4.5 && r.contrastRatio < 7.0).length,
            poor: results.filter(r => r.contrastRatio >= 3.0 && r.contrastRatio < 4.5).length,
            failing: results.filter(r => r.contrastRatio < 3.0).length
        };
        const criticalFailures = results.filter(r => r.contrastRatio < 3.0 || r.errors.some(e => e.severity === 'error'));
        const recommendations = results
            .filter(r => !r.valid)
            .map(r => ({
            tokenPair: r.tokenPath,
            currentContrast: r.contrastRatio,
            targetContrast: r.textSize === 'large' ? 3.0 : 4.5,
            recommendation: r.suggestions[0]?.message || 'Increase contrast between foreground and background',
            suggestedColors: {
                foreground: r.suggestions.find(s => s.type === 'lightness')?.suggestedHex,
                background: r.suggestions.find(s => s.type === 'lightness')?.suggestedHex
            },
            impact: r.contrastRatio < 2.0 ? 'critical' : r.contrastRatio < 3.0 ? 'important' : 'minor'
        }))
            .slice(0, 20); // Top 20 recommendations
        return {
            summary: {
                total: results.length,
                aaCompliant: results.filter(r => r.wcagLevel === 'AA' || r.wcagLevel === 'AAA').length,
                aaaCompliant: results.filter(r => r.wcagLevel === 'AAA').length,
                failing: results.filter(r => !r.valid).length,
                averageContrast
            },
            results,
            contrastDistribution,
            recommendations,
            criticalFailures
        };
    }
    /**
     * Generates brand consistency section
     */
    generateBrandConsistencySection(results) {
        if (results.length === 0) {
            return {
                summary: {
                    totalBrands: 0,
                    consistentBrands: 0,
                    averageHarmonyScore: 1,
                    semanticConsistency: 1
                },
                results: [],
                harmonyAnalysis: {
                    averageScore: 1,
                    bestHarmony: { brand: '', score: 1 },
                    worstHarmony: { brand: '', score: 1 },
                    harmonyDistribution: {}
                },
                crossBrandIssues: []
            };
        }
        const averageHarmonyScore = results.reduce((sum, r) => sum + r.consistencyScore, 0) / results.length;
        const consistentBrands = results.filter(r => r.consistencyScore > 0.7).length;
        const sortedByScore = [...results].sort((a, b) => b.consistencyScore - a.consistencyScore);
        const harmonyAnalysis = {
            averageScore: averageHarmonyScore,
            bestHarmony: {
                brand: sortedByScore[0]?.brandName || '',
                score: sortedByScore[0]?.consistencyScore || 1
            },
            worstHarmony: {
                brand: sortedByScore[sortedByScore.length - 1]?.brandName || '',
                score: sortedByScore[sortedByScore.length - 1]?.consistencyScore || 1
            },
            harmonyDistribution: results.reduce((dist, r) => {
                const scoreRange = Math.floor(r.consistencyScore * 10) / 10;
                const key = `${scoreRange.toFixed(1)}-${(scoreRange + 0.1).toFixed(1)}`;
                dist[key] = (dist[key] || 0) + 1;
                return dist;
            }, {})
        };
        const crossBrandIssues = results
            .flatMap(r => r.errors.filter(e => e.type === 'semantic'))
            .map(e => e.message)
            .slice(0, 10);
        return {
            summary: {
                totalBrands: results.length,
                consistentBrands,
                averageHarmonyScore,
                semanticConsistency: results.filter(r => r.errors.filter(e => e.type === 'semantic').length === 0).length / results.length
            },
            results,
            harmonyAnalysis,
            crossBrandIssues
        };
    }
    /**
     * Generates relationship validation section
     */
    generateRelationshipSection(results) {
        const circularReferences = results.filter(r => r.errors.some(e => e.type === 'circular_reference')).length;
        const missingReferences = results.filter(r => r.errors.some(e => e.type === 'missing_reference')).length;
        const depths = results.map(r => r.maxDepth).filter(d => d > 0);
        const averageDepth = depths.length > 0 ? depths.reduce((sum, d) => sum + d, 0) / depths.length : 0;
        const maxDepth = depths.length > 0 ? Math.max(...depths) : 0;
        const sortedByComplexity = [...results].sort((a, b) => b.relationships.length - a.relationships.length);
        const dependencyAnalysis = {
            deepestChain: {
                token: results.find(r => r.maxDepth === maxDepth)?.tokenPath || '',
                depth: maxDepth
            },
            mostComplex: {
                token: sortedByComplexity[0]?.tokenPath || '',
                dependencies: sortedByComplexity[0]?.relationships.length || 0
            },
            orphanTokens: results.filter(r => r.relationships.length === 0).map(r => r.tokenPath),
            circularChains: results
                .filter(r => r.errors.some(e => e.type === 'circular_reference'))
                .map(r => r.tokenPath)
        };
        const optimizationSuggestions = relationshipValidator.suggestOptimizations({})
            .map(s => s.message)
            .slice(0, 10);
        return {
            summary: {
                totalReferences: results.reduce((sum, r) => sum + r.relationships.length, 0),
                circularReferences,
                missingReferences,
                averageDepth,
                maxDepth
            },
            results,
            dependencyAnalysis,
            optimizationSuggestions
        };
    }
    /**
     * Generates comprehensive recommendations
     */
    generateRecommendations(colorResults, accessibilityResults, brandResults, relationshipResults) {
        const critical = [];
        const important = [];
        const suggestions = [];
        const quickFixes = [];
        // Critical accessibility issues
        const criticalAccessibility = accessibilityResults.filter(r => r.contrastRatio < 2.0);
        if (criticalAccessibility.length > 0) {
            critical.push({
                priority: 'critical',
                category: 'accessibility',
                title: 'Critical Accessibility Violations',
                description: `${criticalAccessibility.length} color pairs have extremely low contrast (< 2.0:1)`,
                affectedTokens: criticalAccessibility.map(r => r.tokenPath),
                effort: 'medium',
                impact: 'high',
                actionItems: [
                    'Review all failing color combinations',
                    'Increase lightness differences',
                    'Consider using different colors for better contrast'
                ]
            });
        }
        // Circular reference errors
        const circularRefs = relationshipResults.filter(r => r.errors.some(e => e.type === 'circular_reference'));
        if (circularRefs.length > 0) {
            critical.push({
                priority: 'critical',
                category: 'maintainability',
                title: 'Circular Reference Dependencies',
                description: `${circularRefs.length} tokens have circular references that prevent proper resolution`,
                affectedTokens: circularRefs.map(r => r.tokenPath),
                effort: 'high',
                impact: 'high',
                actionItems: [
                    'Break circular dependencies',
                    'Restructure token hierarchies',
                    'Use direct values where appropriate'
                ]
            });
        }
        // Format consistency issues
        const formatIssues = colorResults.filter(r => r.errors.some(e => e.type === 'format'));
        if (formatIssues.length > colorResults.length * 0.3) {
            important.push({
                priority: 'high',
                category: 'consistency',
                title: 'Color Format Inconsistency',
                description: `${formatIssues.length} tokens have format validation issues`,
                affectedTokens: formatIssues.map(r => r.tokenPath),
                effort: 'medium',
                impact: 'medium',
                actionItems: [
                    'Standardize color formats across token sets',
                    'Fix invalid color values',
                    'Consider using OKLCH for better color science'
                ]
            });
        }
        // Brand harmony suggestions
        const poorHarmony = brandResults.filter(r => r.consistencyScore < 0.6);
        if (poorHarmony.length > 0) {
            suggestions.push({
                priority: 'medium',
                category: 'consistency',
                title: 'Brand Color Harmony',
                description: `${poorHarmony.length} brands have poor color harmony scores`,
                affectedTokens: poorHarmony.map(r => r.brandName),
                effort: 'medium',
                impact: 'medium',
                actionItems: [
                    'Review color relationships within each brand',
                    'Apply color theory principles for better harmony',
                    'Consider using complementary or analogous color schemes'
                ]
            });
        }
        // Generate quick fixes for simple issues
        colorResults.forEach(result => {
            if (result.errors.length === 1 && result.errors[0].type === 'format') {
                const error = result.errors[0];
                if (error.message.includes('hex')) {
                    quickFixes.push({
                        token: result.tokenPath,
                        issue: 'Invalid hex format',
                        fix: 'Correct hex color format',
                        beforeValue: result.token,
                        afterValue: result.token.toLowerCase().startsWith('#') ? result.token : `#${result.token}`,
                        confidence: 0.9
                    });
                }
            }
        });
        return {
            critical: critical.slice(0, 5),
            important: important.slice(0, 10),
            suggestions: suggestions.slice(0, 15),
            quickFixes: quickFixes.slice(0, 20)
        };
    }
    /**
     * Generates report metadata
     */
    generateMetadata(tokenSet) {
        const tokensCount = Object.values(tokenSet)
            .reduce((count, setData) => {
            if (setData && typeof setData === 'object') {
                return count + this.countTokens(setData);
            }
            return count;
        }, 0);
        return {
            generatedAt: new Date().toISOString(),
            generatedBy: 'DSE Validation Reporter',
            version: '1.0.0',
            tokensAnalyzed: tokensCount,
            processingTime: Date.now() - this.startTime,
            configurationUsed: this.config
        };
    }
    /**
     * Counts tokens in a token set recursively
     */
    countTokens(obj) {
        let count = 0;
        for (const value of Object.values(obj)) {
            if (value && typeof value === 'object') {
                if ('$type' in value && '$value' in value) {
                    count++;
                }
                else {
                    count += this.countTokens(value);
                }
            }
        }
        return count;
    }
    /**
     * Exports report to JSON file
     */
    async exportToJSON(report, outputPath) {
        const jsonOutput = JSON.stringify(report, null, 2);
        // Ensure output directory exists
        const outputDir = path.dirname(outputPath);
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        fs.writeFileSync(outputPath, jsonOutput, 'utf8');
        console.log(`[ValidationReporter] Report exported to ${outputPath}`);
    }
    /**
     * Exports report to HTML file with styling
     */
    async exportToHTML(report, outputPath) {
        const htmlContent = this.generateHTMLReport(report);
        const outputDir = path.dirname(outputPath);
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        fs.writeFileSync(outputPath, htmlContent, 'utf8');
        console.log(`[ValidationReporter] HTML report exported to ${outputPath}`);
    }
    /**
     * Generates HTML report content
     */
    generateHTMLReport(report) {
        const { summary, colorValidation, accessibilityValidation, brandConsistency, relationships, recommendations } = report;
        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DSE Validation Report</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 1200px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; margin-bottom: 40px; }
        .summary { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
        .metric { display: inline-block; margin: 10px 20px; text-align: center; }
        .metric-value { font-size: 2em; font-weight: bold; color: #007bff; }
        .metric-label { font-size: 0.9em; color: #666; }
        .section { margin-bottom: 40px; }
        .section h2 { color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px; }
        .critical { color: #dc3545; }
        .warning { color: #ffc107; }
        .success { color: #28a745; }
        .recommendation { background: #e9ecef; padding: 15px; border-left: 4px solid #007bff; margin: 10px 0; }
        .quick-fix { background: #d4edda; padding: 10px; border-left: 4px solid #28a745; margin: 5px 0; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background-color: #f8f9fa; font-weight: 600; }
        .score-bar { width: 100%; height: 20px; background: #e9ecef; border-radius: 10px; overflow: hidden; }
        .score-fill { height: 100%; background: linear-gradient(90deg, #dc3545 0%, #ffc107 50%, #28a745 100%); }
    </style>
</head>
<body>
    <div class="header">
        <h1>DSE Color Validation Report</h1>
        <p>Generated on ${new Date(report.metadata.generatedAt).toLocaleString()}</p>
        <p>Processing time: ${report.metadata.processingTime}ms</p>
    </div>

    <div class="summary">
        <h2>Executive Summary</h2>
        <div class="metric">
            <div class="metric-value ${summary.overallScore > 0.8 ? 'success' : summary.overallScore > 0.6 ? 'warning' : 'critical'}">${(summary.overallScore * 100).toFixed(1)}%</div>
            <div class="metric-label">Overall Score</div>
        </div>
        <div class="metric">
            <div class="metric-value">${summary.totalTokens}</div>
            <div class="metric-label">Total Tokens</div>
        </div>
        <div class="metric">
            <div class="metric-value ${summary.criticalIssues === 0 ? 'success' : 'critical'}">${summary.criticalIssues}</div>
            <div class="metric-label">Critical Issues</div>
        </div>
        <div class="metric">
            <div class="metric-value ${summary.warnings < 10 ? 'success' : 'warning'}">${summary.warnings}</div>
            <div class="metric-label">Warnings</div>
        </div>
    </div>

    <div class="section">
        <h2>Color Validation</h2>
        <p>Analyzed ${colorValidation.summary.total} color tokens with ${colorValidation.summary.valid} valid and ${colorValidation.summary.total - colorValidation.summary.valid} invalid tokens.</p>
        
        <h3>Format Distribution</h3>
        <table>
            <tr><th>Format</th><th>Count</th><th>Percentage</th></tr>
            ${Object.entries(colorValidation.formatDistribution).map(([format, count]) => `<tr><td>${format}</td><td>${count}</td><td>${((count / colorValidation.summary.total) * 100).toFixed(1)}%</td></tr>`).join('')}
        </table>
    </div>

    ${accessibilityValidation.summary.total > 0 ? `
    <div class="section">
        <h2>Accessibility Validation</h2>
        <p>Tested ${accessibilityValidation.summary.total} color combinations.</p>
        <div class="metric">
            <div class="metric-value ${accessibilityValidation.summary.aaCompliant === accessibilityValidation.summary.total ? 'success' : 'warning'}">${accessibilityValidation.summary.aaCompliant}</div>
            <div class="metric-label">AA Compliant</div>
        </div>
        <div class="metric">
            <div class="metric-value success">${accessibilityValidation.summary.aaaCompliant}</div>
            <div class="metric-label">AAA Compliant</div>
        </div>
        <div class="metric">
            <div class="metric-value">${accessibilityValidation.summary.averageContrast.toFixed(1)}:1</div>
            <div class="metric-label">Average Contrast</div>
        </div>
        
        <h3>Top Accessibility Recommendations</h3>
        ${accessibilityValidation.recommendations.slice(0, 5).map(rec => `<div class="recommendation ${rec.impact === 'critical' ? 'critical' : rec.impact === 'important' ? 'warning' : ''}">
                <strong>${rec.tokenPair}</strong><br>
                Current: ${rec.currentContrast.toFixed(2)}:1 → Target: ${rec.targetContrast.toFixed(1)}:1<br>
                ${rec.recommendation}
            </div>`).join('')}
    </div>
    ` : ''}

    ${brandConsistency.summary.totalBrands > 0 ? `
    <div class="section">
        <h2>Brand Consistency</h2>
        <p>Analyzed ${brandConsistency.summary.totalBrands} brand themes.</p>
        <div class="metric">
            <div class="metric-value">${(brandConsistency.summary.averageHarmonyScore * 100).toFixed(1)}%</div>
            <div class="metric-label">Average Harmony</div>
        </div>
        <div class="metric">
            <div class="metric-value success">${brandConsistency.summary.consistentBrands}</div>
            <div class="metric-label">Consistent Brands</div>
        </div>
    </div>
    ` : ''}

    <div class="section">
        <h2>Critical Recommendations</h2>
        ${recommendations.critical.map(rec => `<div class="recommendation critical">
                <h3>${rec.title}</h3>
                <p>${rec.description}</p>
                <strong>Impact:</strong> ${rec.impact} | <strong>Effort:</strong> ${rec.effort}<br>
                <strong>Affected tokens:</strong> ${rec.affectedTokens.length} tokens<br>
                <strong>Action items:</strong>
                <ul>${rec.actionItems.map(item => `<li>${item}</li>`).join('')}</ul>
            </div>`).join('')}
    </div>

    ${recommendations.quickFixes.length > 0 ? `
    <div class="section">
        <h2>Quick Fixes</h2>
        ${recommendations.quickFixes.slice(0, 10).map(fix => `<div class="quick-fix">
                <strong>${fix.token}</strong>: ${fix.issue}<br>
                <code>${fix.beforeValue}</code> → <code>${fix.afterValue}</code>
                <small>(Confidence: ${(fix.confidence * 100).toFixed(0)}%)</small>
            </div>`).join('')}
    </div>
    ` : ''}

    <div class="section">
        <h2>Next Steps</h2>
        <ol>
            <li>Address all critical issues immediately</li>
            <li>Apply quick fixes for simple formatting problems</li>
            <li>Review accessibility recommendations and implement high-impact changes</li>
            <li>Optimize token relationships for better performance</li>
            <li>Re-run validation after fixes to verify improvements</li>
        </ol>
    </div>
</body>
</html>`;
    }
    /**
     * Exports summary report to CSV
     */
    async exportSummaryToCSV(report, outputPath) {
        const rows = [
            ['Metric', 'Value', 'Status'],
            ['Total Tokens', report.summary.totalTokens.toString(), 'info'],
            ['Valid Tokens', report.summary.validTokens.toString(), 'success'],
            ['Invalid Tokens', report.summary.invalidTokens.toString(), report.summary.invalidTokens > 0 ? 'warning' : 'success'],
            ['Overall Score', `${(report.summary.overallScore * 100).toFixed(1)}%`, report.summary.overallScore > 0.8 ? 'success' : 'warning'],
            ['Critical Issues', report.summary.criticalIssues.toString(), report.summary.criticalIssues === 0 ? 'success' : 'critical'],
            ['Warnings', report.summary.warnings.toString(), report.summary.warnings < 10 ? 'success' : 'warning'],
            ['Color Tokens', report.colorValidation.summary.total.toString(), 'info'],
            ['Format Issues', report.colorValidation.summary.formatIssues.toString(), report.colorValidation.summary.formatIssues === 0 ? 'success' : 'warning']
        ];
        if (report.accessibilityValidation.summary.total > 0) {
            rows.push(['Accessibility Tests', report.accessibilityValidation.summary.total.toString(), 'info'], ['AA Compliant', report.accessibilityValidation.summary.aaCompliant.toString(), 'success'], ['AAA Compliant', report.accessibilityValidation.summary.aaaCompliant.toString(), 'success'], ['Average Contrast', `${report.accessibilityValidation.summary.averageContrast.toFixed(1)}:1`, 'info']);
        }
        const csvContent = rows.map(row => row.join(',')).join('\n');
        const outputDir = path.dirname(outputPath);
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        fs.writeFileSync(outputPath, csvContent, 'utf8');
        console.log(`[ValidationReporter] CSV summary exported to ${outputPath}`);
    }
}
// Export default instance
export const validationReporter = new ValidationReporter();
//# sourceMappingURL=validation-reporter.js.map