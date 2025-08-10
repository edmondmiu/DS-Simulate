/**
 * Configuration validation utilities for DSE color library
 * Following TypeScript 5.4.5 strict typing and coding standards
 */
import { ValidationResult } from './schema.js';
/**
 * Validates a color library configuration object against the schema
 * @param config - Configuration object to validate
 * @returns Validation result with errors and warnings
 */
export declare function validateColorLibraryConfig(config: unknown): ValidationResult;
/**
 * Loads and validates a color library configuration file
 * @param filePath - Path to the configuration file
 * @returns Validation result
 */
export declare function validateColorLibraryFile(filePath: string): ValidationResult;
//# sourceMappingURL=validator.d.ts.map