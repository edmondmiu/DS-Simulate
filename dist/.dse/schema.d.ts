/**
 * JSON Schema definitions for DSE color library configuration
 * Following TypeScript 5.4.5 strict typing standards
 */
export interface ColorLibraryConfig {
    colorLibrary: {
        colorSpace: 'oklch';
        lightnessRange: {
            min: number;
            max: number;
        };
        chromaRange: {
            primary: number;
            neutral: number;
        };
        accessibilityThresholds: {
            AA: number;
            AAA: number;
        };
        conversionOptions: {
            outputFormat: 'hex' | 'oklch' | 'rgb';
            preserveOriginal: boolean;
        };
        brandSpecific?: {
            [brandName: string]: {
                lightnessAdjustment?: number;
                chromaMultiplier?: number;
                hueShift?: number;
            };
        };
        colorGeneration?: {
            rampSteps: number;
            preserveKeyColors: boolean;
            algorithmicGeneration: boolean;
        };
    };
}
export interface ValidationResult {
    isValid: boolean;
    errors: ValidationError[];
    warnings?: ValidationWarning[];
}
export interface ValidationError {
    field: string;
    message: string;
    value?: unknown;
    expectedRange?: string;
}
export interface ValidationWarning {
    field: string;
    message: string;
    recommendation: string;
}
/**
 * JSON Schema for color-library.json validation
 * Compliant with JSON Schema Draft-07
 */
export declare const COLOR_LIBRARY_JSON_SCHEMA: {
    $schema: string;
    type: string;
    properties: {
        colorLibrary: {
            type: string;
            properties: {
                colorSpace: {
                    type: string;
                    enum: string[];
                    description: string;
                };
                lightnessRange: {
                    type: string;
                    properties: {
                        min: {
                            type: string;
                            minimum: number;
                            maximum: number;
                            description: string;
                        };
                        max: {
                            type: string;
                            minimum: number;
                            maximum: number;
                            description: string;
                        };
                    };
                    required: string[];
                    additionalProperties: boolean;
                };
                chromaRange: {
                    type: string;
                    properties: {
                        primary: {
                            type: string;
                            minimum: number;
                            maximum: number;
                            description: string;
                        };
                        neutral: {
                            type: string;
                            minimum: number;
                            maximum: number;
                            description: string;
                        };
                    };
                    required: string[];
                    additionalProperties: boolean;
                };
                accessibilityThresholds: {
                    type: string;
                    properties: {
                        AA: {
                            type: string;
                            minimum: number;
                            maximum: number;
                            description: string;
                        };
                        AAA: {
                            type: string;
                            minimum: number;
                            maximum: number;
                            description: string;
                        };
                    };
                    required: string[];
                    additionalProperties: boolean;
                };
                conversionOptions: {
                    type: string;
                    properties: {
                        outputFormat: {
                            type: string;
                            enum: string[];
                            description: string;
                        };
                        preserveOriginal: {
                            type: string;
                            description: string;
                        };
                    };
                    required: string[];
                    additionalProperties: boolean;
                };
                brandSpecific: {
                    type: string;
                    patternProperties: {
                        "^[a-zA-Z0-9_-]+$": {
                            type: string;
                            properties: {
                                lightnessAdjustment: {
                                    type: string;
                                    minimum: number;
                                    maximum: number;
                                    description: string;
                                };
                                chromaMultiplier: {
                                    type: string;
                                    minimum: number;
                                    maximum: number;
                                    description: string;
                                };
                                hueShift: {
                                    type: string;
                                    minimum: number;
                                    maximum: number;
                                    description: string;
                                };
                            };
                            additionalProperties: boolean;
                        };
                    };
                    additionalProperties: boolean;
                    description: string;
                };
                colorGeneration: {
                    type: string;
                    properties: {
                        rampSteps: {
                            type: string;
                            minimum: number;
                            maximum: number;
                            description: string;
                        };
                        preserveKeyColors: {
                            type: string;
                            description: string;
                        };
                        algorithmicGeneration: {
                            type: string;
                            description: string;
                        };
                    };
                    required: string[];
                    additionalProperties: boolean;
                };
            };
            required: string[];
            additionalProperties: boolean;
        };
    };
    required: string[];
    additionalProperties: boolean;
};
/**
 * Default configuration values for new color library configurations
 */
export declare const DEFAULT_COLOR_LIBRARY_CONFIG: ColorLibraryConfig;
//# sourceMappingURL=schema.d.ts.map