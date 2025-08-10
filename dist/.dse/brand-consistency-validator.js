/**
 * Cross-brand consistency validation for DSE color system
 * Ensures color harmony and consistency across multiple brand variations
 */
import { oklch, converter } from 'culori';
export class BrandConsistencyValidator {
    defaultRules = {
        maxHueDeviation: 15, // degrees
        maxChromaDeviation: 0.05,
        maxLightnessDeviation: 0.1,
        minProgressionStep: 0.05,
        maxProgressionStep: 0.15,
        requiredSemanticColors: ['success', 'warning', 'error', 'info'],
        harmonyTolerances: {
            complementary: 15, // ±15° for complementary colors (180°)
            analogous: 30, // ±30° for analogous colors 
            triadic: 10 // ±10° for triadic colors (120°)
        }
    };
    rules;
    harmonyCache = new Map();
    constructor(customRules) {
        this.rules = { ...this.defaultRules, ...customRules };
    }
    /**
     * Calculates hue harmony score based on color theory relationships
     */
    calculateHueHarmony(hues) {
        if (hues.length < 2)
            return 1.0;
        let harmonyScore = 0;
        let totalComparisons = 0;
        for (let i = 0; i < hues.length; i++) {
            for (let j = i + 1; j < hues.length; j++) {
                const h1 = hues[i];
                const h2 = hues[j];
                const angleDiff = Math.min(Math.abs(h1 - h2), 360 - Math.abs(h1 - h2));
                // Score based on color harmony rules
                let pairScore = 0;
                // Perfect relationships (high scores)
                if (Math.abs(angleDiff - 0) <= 5)
                    pairScore = 1.0; // Same hue
                else if (Math.abs(angleDiff - 180) <= this.rules.harmonyTolerances.complementary)
                    pairScore = 0.9; // Complementary
                else if (Math.abs(angleDiff - 120) <= this.rules.harmonyTolerances.triadic)
                    pairScore = 0.85; // Triadic
                else if (Math.abs(angleDiff - 240) <= this.rules.harmonyTolerances.triadic)
                    pairScore = 0.85; // Triadic
                else if (angleDiff <= this.rules.harmonyTolerances.analogous)
                    pairScore = 0.8; // Analogous
                else if (Math.abs(angleDiff - 90) <= 15)
                    pairScore = 0.7; // Square/tetradic
                else if (Math.abs(angleDiff - 270) <= 15)
                    pairScore = 0.7; // Square/tetradic
                else if (Math.abs(angleDiff - 60) <= 10)
                    pairScore = 0.75; // Split complementary
                else if (Math.abs(angleDiff - 150) <= 15)
                    pairScore = 0.6; // Split complementary variation
                else
                    pairScore = Math.max(0, 0.5 - (angleDiff - 30) / 180); // Decreasing score for discord
                harmonyScore += pairScore;
                totalComparisons++;
            }
        }
        return totalComparisons > 0 ? harmonyScore / totalComparisons : 1.0;
    }
    /**
     * Validates lightness progression in color ramps
     */
    validateLightnessProgression(colors) {
        if (colors.length < 3) {
            return { valid: true, score: 1.0, errors: [], suggestions: [] };
        }
        const errors = [];
        const suggestions = [];
        const lightnesses = colors.map(c => c.oklch.l);
        // Sort by lightness to check progression
        const sortedColors = colors.sort((a, b) => a.oklch.l - b.oklch.l);
        let progressionScore = 1.0;
        // Check for uniform progression
        const steps = [];
        for (let i = 1; i < sortedColors.length; i++) {
            const step = sortedColors[i].oklch.l - sortedColors[i - 1].oklch.l;
            steps.push(step);
            // Validate step size
            if (step < this.rules.minProgressionStep) {
                errors.push(`Lightness step too small between ${sortedColors[i - 1].token} and ${sortedColors[i].token} (${step.toFixed(3)})`);
                progressionScore -= 0.2;
            }
            if (step > this.rules.maxProgressionStep) {
                errors.push(`Lightness step too large between ${sortedColors[i - 1].token} and ${sortedColors[i].token} (${step.toFixed(3)})`);
                progressionScore -= 0.15;
            }
        }
        // Calculate step uniformity
        if (steps.length > 1) {
            const avgStep = steps.reduce((sum, step) => sum + step, 0) / steps.length;
            const stepVariance = steps.reduce((sum, step) => sum + Math.pow(step - avgStep, 2), 0) / steps.length;
            const stepStdDev = Math.sqrt(stepVariance);
            if (stepStdDev > 0.03) {
                errors.push(`Inconsistent lightness progression (std dev: ${stepStdDev.toFixed(3)})`);
                suggestions.push('Use more uniform lightness steps for better visual consistency');
                progressionScore -= 0.1;
            }
        }
        // Check for logical ordering
        const originalOrder = colors.map(c => c.oklch.l);
        const isMonotonic = originalOrder.every((l, i) => i === 0 || l >= originalOrder[i - 1]) ||
            originalOrder.every((l, i) => i === 0 || l <= originalOrder[i - 1]);
        if (!isMonotonic && colors.length > 3) {
            warnings.push('Color ramp is not in monotonic lightness order');
            suggestions.push('Reorder colors by lightness for intuitive progression');
            progressionScore -= 0.2;
        }
        return {
            valid: errors.length === 0,
            score: Math.max(0, progressionScore),
            errors,
            suggestions
        };
    }
    /**
     * Validates semantic color consistency across brands
     */
    validateSemanticColors(brandThemes) {
        const errors = [];
        const semanticColors = new Map();
        // Collect semantic colors from all brands
        brandThemes.forEach(theme => {
            this.rules.requiredSemanticColors.forEach(semanticRole => {
                const colorKey = Object.keys(theme.colors).find(key => key.toLowerCase().includes(semanticRole.toLowerCase()));
                if (colorKey) {
                    const colorValue = theme.colors[colorKey];
                    const oklchColor = oklch(colorValue);
                    if (oklchColor) {
                        if (!semanticColors.has(semanticRole)) {
                            semanticColors.set(semanticRole, []);
                        }
                        semanticColors.get(semanticRole).push(oklchColor);
                    }
                }
                else {
                    errors.push({
                        type: 'semantic',
                        severity: 'warning',
                        message: `Missing ${semanticRole} color in theme ${theme.name}`,
                        colorRole: semanticRole,
                        actualValue: 'missing',
                        expectedRange: 'required semantic color',
                        affectedTokens: [theme.name]
                    });
                }
            });
        });
        // Validate consistency within semantic roles
        semanticColors.forEach((colors, role) => {
            if (colors.length < 2)
                return;
            // Check hue consistency
            const hues = colors.map(c => c.h || 0);
            const hueVariance = this.calculateHueVariance(hues);
            if (hueVariance > this.rules.maxHueDeviation) {
                errors.push({
                    type: 'semantic',
                    severity: 'warning',
                    message: `Inconsistent hue for ${role} color across brands (variance: ${hueVariance.toFixed(1)}°)`,
                    colorRole: role,
                    actualValue: hueVariance,
                    expectedRange: `< ${this.rules.maxHueDeviation}°`,
                    affectedTokens: brandThemes.map(t => t.name)
                });
            }
            // Check chroma consistency
            const chromas = colors.map(c => c.c);
            const chromaRange = Math.max(...chromas) - Math.min(...chromas);
            if (chromaRange > this.rules.maxChromaDeviation) {
                errors.push({
                    type: 'semantic',
                    severity: 'warning',
                    message: `Inconsistent chroma for ${role} color across brands (range: ${chromaRange.toFixed(3)})`,
                    colorRole: role,
                    actualValue: chromaRange,
                    expectedRange: `< ${this.rules.maxChromaDeviation}`,
                    affectedTokens: brandThemes.map(t => t.name)
                });
            }
            // Validate semantic appropriateness
            this.validateSemanticAppropriateness(role, colors, errors);
        });
        return errors;
    }
    /**
     * Validates that semantic colors are appropriate for their role
     */
    validateSemanticAppropriateness(role, colors, errors) {
        const avgHue = colors.reduce((sum, c) => sum + (c.h || 0), 0) / colors.length;
        const avgLightness = colors.reduce((sum, c) => sum + c.l, 0) / colors.length;
        const avgChroma = colors.reduce((sum, c) => sum + c.c, 0) / colors.length;
        switch (role.toLowerCase()) {
            case 'success':
                if (avgHue < 90 || avgHue > 150) {
                    errors.push({
                        type: 'semantic',
                        severity: 'warning',
                        message: `Success color hue (${avgHue.toFixed(1)}°) not in typical green range`,
                        colorRole: role,
                        actualValue: avgHue,
                        expectedRange: '90-150° (green)',
                        affectedTokens: []
                    });
                }
                break;
            case 'error':
                if (avgHue < 340 && avgHue > 20) {
                    errors.push({
                        type: 'semantic',
                        severity: 'warning',
                        message: `Error color hue (${avgHue.toFixed(1)}°) not in typical red range`,
                        colorRole: role,
                        actualValue: avgHue,
                        expectedRange: '340-20° (red)',
                        affectedTokens: []
                    });
                }
                break;
            case 'warning':
                if (avgHue < 30 || avgHue > 70) {
                    errors.push({
                        type: 'semantic',
                        severity: 'warning',
                        message: `Warning color hue (${avgHue.toFixed(1)}°) not in typical orange/yellow range`,
                        colorRole: role,
                        actualValue: avgHue,
                        expectedRange: '30-70° (orange/yellow)',
                        affectedTokens: []
                    });
                }
                break;
            case 'info':
                if (avgHue < 200 || avgHue > 260) {
                    errors.push({
                        type: 'semantic',
                        severity: 'warning',
                        message: `Info color hue (${avgHue.toFixed(1)}°) not in typical blue range`,
                        colorRole: role,
                        actualValue: avgHue,
                        expectedRange: '200-260° (blue)',
                        affectedTokens: []
                    });
                }
                break;
        }
        // General semantic color guidelines
        if (avgChroma < 0.05) {
            errors.push({
                type: 'semantic',
                severity: 'warning',
                message: `${role} color has very low chroma (${avgChroma.toFixed(3)})`,
                colorRole: role,
                actualValue: avgChroma,
                expectedRange: '> 0.05 for semantic clarity',
                affectedTokens: []
            });
        }
        if (avgLightness < 0.2 || avgLightness > 0.8) {
            errors.push({
                type: 'semantic',
                severity: 'warning',
                message: `${role} color lightness (${avgLightness.toFixed(2)}) may have accessibility issues`,
                colorRole: role,
                actualValue: avgLightness,
                expectedRange: '0.2-0.8 for accessibility',
                affectedTokens: []
            });
        }
    }
    /**
     * Calculates hue variance accounting for circular nature of hue
     */
    calculateHueVariance(hues) {
        if (hues.length < 2)
            return 0;
        // Handle circular variance calculation
        const avgHue = hues.reduce((sum, h) => sum + h, 0) / hues.length;
        const variance = hues.reduce((sum, h) => {
            const diff = Math.min(Math.abs(h - avgHue), 360 - Math.abs(h - avgHue));
            return sum + diff * diff;
        }, 0) / hues.length;
        return Math.sqrt(variance);
    }
    /**
     * Validates brand color harmony using OKLCH relationships
     */
    validateBrandHarmony(theme) {
        const errors = [];
        const suggestions = [];
        const colors = Object.entries(theme.colors)
            .filter(([, value]) => typeof value === 'string')
            .map(([token, value]) => ({
            token,
            oklch: oklch(value)
        }))
            .filter((item) => item.oklch !== undefined);
        if (colors.length < 2) {
            return { harmonyScore: 1.0, errors, suggestions };
        }
        const hues = colors.map(c => c.oklch.h || 0);
        const harmonyScore = this.calculateHueHarmony(hues);
        if (harmonyScore < 0.6) {
            errors.push({
                type: 'harmony',
                severity: 'warning',
                message: `Poor color harmony detected in theme ${theme.name} (score: ${harmonyScore.toFixed(2)})`,
                colorRole: 'overall',
                actualValue: harmonyScore,
                expectedRange: '> 0.6',
                affectedTokens: colors.map(c => c.token)
            });
            // Suggest harmony improvements
            const primaryColor = colors[0]; // Assume first color is primary
            const harmonicHues = this.generateHarmonicHues(primaryColor.oklch.h || 0);
            harmonicHues.forEach((hue, index) => {
                if (index < colors.length - 1) {
                    const targetColor = colors[index + 1];
                    const suggestedOKLCH = {
                        ...targetColor.oklch,
                        h: hue
                    };
                    const hexConverter = converter('hex');
                    const rgbConverter = converter('rgb');
                    const suggestedRgb = rgbConverter(suggestedOKLCH);
                    const suggestedHex = hexConverter(suggestedRgb) || '#000000';
                    suggestions.push({
                        type: 'hue',
                        message: `Adjust ${targetColor.token} hue from ${(targetColor.oklch.h || 0).toFixed(1)}° to ${hue.toFixed(1)}° for better harmony`,
                        colorRole: targetColor.token,
                        currentOKLCH: targetColor.oklch,
                        suggestedOKLCH,
                        suggestedHex,
                        improvementScore: 0.8 - harmonyScore
                    });
                }
            });
        }
        return { harmonyScore, errors, suggestions };
    }
    /**
     * Generates harmonic hues based on color theory
     */
    generateHarmonicHues(baseHue) {
        return [
            baseHue, // Base
            (baseHue + 30) % 360, // Analogous
            (baseHue + 60) % 360, // Triadic approach
            (baseHue + 120) % 360, // Triadic
            (baseHue + 180) % 360, // Complementary
            (baseHue + 240) % 360 // Triadic
        ];
    }
    /**
     * Validates consistency across multiple brand themes
     */
    validateBrandConsistency(brandThemes) {
        const results = [];
        // Individual brand validation
        brandThemes.forEach(theme => {
            const result = {
                brandName: theme.name,
                valid: true,
                errors: [],
                warnings: [],
                suggestions: [],
                consistencyScore: 1.0,
                colorAnalysis: []
            };
            // Validate brand harmony
            const harmonyResult = this.validateBrandHarmony(theme);
            result.errors.push(...harmonyResult.errors);
            result.suggestions.push(...harmonyResult.suggestions);
            result.consistencyScore *= harmonyResult.harmonyScore;
            // Validate color ramp progression
            const rampColors = this.extractColorRamps(theme);
            rampColors.forEach(ramp => {
                const progressionResult = this.validateLightnessProgression(ramp.colors);
                if (!progressionResult.valid) {
                    progressionResult.errors.forEach(error => {
                        result.errors.push({
                            type: 'progression',
                            severity: 'warning',
                            message: `${ramp.name}: ${error}`,
                            colorRole: ramp.name,
                            actualValue: 'invalid progression',
                            expectedRange: 'uniform lightness steps',
                            affectedTokens: ramp.colors.map(c => c.token)
                        });
                    });
                }
                result.consistencyScore *= progressionResult.score;
            });
            // Analyze individual colors
            Object.entries(theme.colors).forEach(([token, value]) => {
                const oklchColor = oklch(value);
                if (oklchColor) {
                    result.colorAnalysis.push({
                        tokenPath: token,
                        role: this.determineColorRole(token),
                        oklchData: oklchColor,
                        harmonyScore: harmonyResult.harmonyScore,
                        progressionScore: 1.0, // Would be calculated based on ramp analysis
                        issues: []
                    });
                }
            });
            result.valid = result.errors.filter(e => e.severity === 'error').length === 0;
            results.push(result);
        });
        // Cross-brand semantic consistency
        const semanticErrors = this.validateSemanticColors(brandThemes);
        semanticErrors.forEach(error => {
            error.affectedTokens.forEach(brandName => {
                const brandResult = results.find(r => r.brandName === brandName);
                if (brandResult) {
                    brandResult.errors.push(error);
                    if (error.severity === 'error') {
                        brandResult.valid = false;
                    }
                }
            });
        });
        return results;
    }
    /**
     * Extracts color ramps from theme for progression analysis
     */
    extractColorRamps(theme) {
        const ramps = [];
        const rampGroups = new Map();
        // Group colors by base name (assuming numbered suffixes like primary-100, primary-200)
        Object.entries(theme.colors).forEach(([token, value]) => {
            const oklchColor = oklch(value);
            if (oklchColor) {
                const baseMatch = token.match(/^(.+?)-?\d+$/);
                const baseName = baseMatch ? baseMatch[1] : token;
                if (!rampGroups.has(baseName)) {
                    rampGroups.set(baseName, []);
                }
                rampGroups.get(baseName).push({ token, oklch: oklchColor });
            }
        });
        // Only include groups with 3+ colors (actual ramps)
        rampGroups.forEach((colors, name) => {
            if (colors.length >= 3) {
                ramps.push({ name, colors });
            }
        });
        return ramps;
    }
    /**
     * Determines the role of a color based on its token name
     */
    determineColorRole(token) {
        const lowerToken = token.toLowerCase();
        if (lowerToken.includes('primary'))
            return 'primary';
        if (lowerToken.includes('secondary'))
            return 'secondary';
        if (lowerToken.includes('accent'))
            return 'accent';
        if (lowerToken.includes('neutral') || lowerToken.includes('gray') || lowerToken.includes('grey'))
            return 'neutral';
        if (['success', 'error', 'warning', 'info', 'danger'].some(s => lowerToken.includes(s)))
            return 'semantic';
        if (/\d+$/.test(token))
            return 'ramp';
        return 'primary'; // default fallback
    }
    /**
     * Updates consistency rules
     */
    updateRules(newRules) {
        this.rules = { ...this.rules, ...newRules };
        this.harmonyCache.clear();
    }
    /**
     * Gets current consistency rules
     */
    getRules() {
        return { ...this.rules };
    }
}
// Export default instance
export const brandConsistencyValidator = new BrandConsistencyValidator();
//# sourceMappingURL=brand-consistency-validator.js.map