/**
 * JSON Schema definitions for DSE color library configuration
 * Following TypeScript 5.4.5 strict typing standards
 */
/**
 * JSON Schema for color-library.json validation
 * Compliant with JSON Schema Draft-07
 */
export const COLOR_LIBRARY_JSON_SCHEMA = {
    $schema: "http://json-schema.org/draft-07/schema#",
    type: "object",
    properties: {
        colorLibrary: {
            type: "object",
            properties: {
                colorSpace: {
                    type: "string",
                    enum: ["oklch"],
                    description: "Color space for color generation (currently only OKLCH supported)"
                },
                lightnessRange: {
                    type: "object",
                    properties: {
                        min: {
                            type: "number",
                            minimum: 0,
                            maximum: 100,
                            description: "Minimum lightness value (0-100)"
                        },
                        max: {
                            type: "number",
                            minimum: 0,
                            maximum: 100,
                            description: "Maximum lightness value (0-100)"
                        }
                    },
                    required: ["min", "max"],
                    additionalProperties: false
                },
                chromaRange: {
                    type: "object",
                    properties: {
                        primary: {
                            type: "number",
                            minimum: 0,
                            maximum: 0.4,
                            description: "Chroma intensity for primary colors (0-0.4)"
                        },
                        neutral: {
                            type: "number",
                            minimum: 0,
                            maximum: 0.4,
                            description: "Chroma intensity for neutral colors (0-0.4)"
                        }
                    },
                    required: ["primary", "neutral"],
                    additionalProperties: false
                },
                accessibilityThresholds: {
                    type: "object",
                    properties: {
                        AA: {
                            type: "number",
                            minimum: 1,
                            maximum: 21,
                            description: "WCAG AA contrast ratio threshold"
                        },
                        AAA: {
                            type: "number",
                            minimum: 1,
                            maximum: 21,
                            description: "WCAG AAA contrast ratio threshold"
                        }
                    },
                    required: ["AA", "AAA"],
                    additionalProperties: false
                },
                conversionOptions: {
                    type: "object",
                    properties: {
                        outputFormat: {
                            type: "string",
                            enum: ["hex", "oklch", "rgb"],
                            description: "Primary output format for color values"
                        },
                        preserveOriginal: {
                            type: "boolean",
                            description: "Whether to preserve original color format in token metadata"
                        }
                    },
                    required: ["outputFormat", "preserveOriginal"],
                    additionalProperties: false
                },
                brandSpecific: {
                    type: "object",
                    patternProperties: {
                        "^[a-zA-Z0-9_-]+$": {
                            type: "object",
                            properties: {
                                lightnessAdjustment: {
                                    type: "number",
                                    minimum: -20,
                                    maximum: 20,
                                    description: "Lightness adjustment for brand (-20 to +20)"
                                },
                                chromaMultiplier: {
                                    type: "number",
                                    minimum: 0.5,
                                    maximum: 2.0,
                                    description: "Chroma intensity multiplier for brand (0.5-2.0)"
                                },
                                hueShift: {
                                    type: "number",
                                    minimum: 0,
                                    maximum: 360,
                                    description: "Hue rotation in degrees (0-360)"
                                }
                            },
                            additionalProperties: false
                        }
                    },
                    additionalProperties: false,
                    description: "Brand-specific color adjustments"
                },
                colorGeneration: {
                    type: "object",
                    properties: {
                        rampSteps: {
                            type: "number",
                            minimum: 3,
                            maximum: 15,
                            description: "Number of steps in generated color ramps"
                        },
                        preserveKeyColors: {
                            type: "boolean",
                            description: "Whether to preserve manually defined key colors"
                        },
                        algorithmicGeneration: {
                            type: "boolean",
                            description: "Enable automated color ramp generation"
                        }
                    },
                    required: ["rampSteps", "preserveKeyColors", "algorithmicGeneration"],
                    additionalProperties: false
                }
            },
            required: ["colorSpace", "lightnessRange", "chromaRange", "accessibilityThresholds", "conversionOptions"],
            additionalProperties: false
        }
    },
    required: ["colorLibrary"],
    additionalProperties: false
};
/**
 * Default configuration values for new color library configurations
 */
export const DEFAULT_COLOR_LIBRARY_CONFIG = {
    colorLibrary: {
        colorSpace: 'oklch',
        lightnessRange: {
            min: 15,
            max: 95
        },
        chromaRange: {
            primary: 0.15,
            neutral: 0.05
        },
        accessibilityThresholds: {
            AA: 4.5,
            AAA: 7.0
        },
        conversionOptions: {
            outputFormat: 'hex',
            preserveOriginal: true
        },
        colorGeneration: {
            rampSteps: 9,
            preserveKeyColors: true,
            algorithmicGeneration: false
        }
    }
};
//# sourceMappingURL=schema.js.map