/**
 * DSE Configuration Loader
 * Handles loading and caching of DSE-specific configurations
 * Following TypeScript 5.4.5 strict typing and coding standards
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { 
  ColorLibraryConfig, 
  DEFAULT_COLOR_LIBRARY_CONFIG,
  ValidationResult 
} from './schema.js';
import { validateColorLibraryConfig } from './validator.js';

/**
 * Configuration loader with caching for DSE settings
 */
export class DSEConfigLoader {
  private static instance: DSEConfigLoader;
  private colorLibraryConfig: ColorLibraryConfig | null = null;
  private dseDirectory: string;

  constructor(dseDirectory: string = '.dse') {
    this.dseDirectory = dseDirectory;
  }

  /**
   * Get singleton instance of configuration loader
   * @param dseDirectory - Path to DSE configuration directory
   * @returns DSEConfigLoader instance
   */
  public static getInstance(dseDirectory: string = '.dse'): DSEConfigLoader {
    if (!DSEConfigLoader.instance) {
      DSEConfigLoader.instance = new DSEConfigLoader(dseDirectory);
    }
    return DSEConfigLoader.instance;
  }

  /**
   * Load and validate color library configuration
   * @returns ColorLibraryConfig with validation
   */
  public loadColorLibraryConfig(): { config: ColorLibraryConfig; validation: ValidationResult } {
    // Return cached configuration if available
    if (this.colorLibraryConfig) {
      return { 
        config: this.colorLibraryConfig, 
        validation: { isValid: true, errors: [] }
      };
    }

    const configPath = join(this.dseDirectory, 'color-library.json');

    // Use default configuration if file doesn't exist
    if (!existsSync(configPath)) {
      console.warn(`[DSE] Color library configuration not found at ${configPath}, using defaults`);
      this.colorLibraryConfig = DEFAULT_COLOR_LIBRARY_CONFIG;
      return { 
        config: this.colorLibraryConfig, 
        validation: { isValid: true, errors: [] }
      };
    }

    try {
      // Load and parse configuration file
      const configContent = readFileSync(configPath, 'utf-8');
      const parsedConfig = JSON.parse(configContent);

      // Validate configuration
      const validation = validateColorLibraryConfig(parsedConfig);

      if (!validation.isValid) {
        console.error(`[DSE] Invalid color library configuration:`);
        validation.errors.forEach(error => {
          console.error(`  - ${error.field}: ${error.message}`);
        });
        throw new Error(`Invalid DSE color library configuration at ${configPath}`);
      }

      // Display warnings if present
      if (validation.warnings && validation.warnings.length > 0) {
        console.warn(`[DSE] Color library configuration warnings:`);
        validation.warnings.forEach(warning => {
          console.warn(`  - ${warning.field}: ${warning.message}`);
          console.warn(`    Recommendation: ${warning.recommendation}`);
        });
      }

      this.colorLibraryConfig = parsedConfig as ColorLibraryConfig;
      console.log(`[DSE] Loaded color library configuration from ${configPath}`);

      return { config: this.colorLibraryConfig, validation };

    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error(`Invalid JSON in DSE color library configuration: ${configPath}`);
      }
      throw error;
    }
  }

  /**
   * Get brand-specific configuration for a token set
   * @param tokenSetName - Name of the token set (e.g., 'bet9ja', 'global')
   * @returns Brand-specific configuration or undefined
   */
  public getBrandConfig(tokenSetName: string): { lightnessAdjustment?: number; chromaMultiplier?: number; hueShift?: number; } | undefined {
    const { config } = this.loadColorLibraryConfig();
    return config.colorLibrary.brandSpecific?.[tokenSetName];
  }

  /**
   * Check if DSE configuration directory exists
   * @returns true if .dse directory exists
   */
  public isDSEConfigured(): boolean {
    return existsSync(this.dseDirectory);
  }

  /**
   * Get DSE directory path
   * @returns Path to DSE configuration directory
   */
  public getDSEDirectory(): string {
    return this.dseDirectory;
  }

  /**
   * Clear cached configurations (useful for testing)
   */
  public clearCache(): void {
    this.colorLibraryConfig = null;
  }

  /**
   * Get accessibility thresholds for contrast validation
   * @returns Accessibility thresholds (AA, AAA)
   */
  public getAccessibilityThresholds(): { AA: number; AAA: number } {
    const { config } = this.loadColorLibraryConfig();
    return config.colorLibrary.accessibilityThresholds;
  }

  /**
   * Get OKLCH ranges for color generation
   * @returns Lightness and chroma ranges
   */
  public getOKLCHRanges(): {
    lightness: { min: number; max: number };
    chroma: { primary: number; neutral: number };
  } {
    const { config } = this.loadColorLibraryConfig();
    return {
      lightness: config.colorLibrary.lightnessRange,
      chroma: config.colorLibrary.chromaRange
    };
  }

  /**
   * Get conversion options for output format
   * @returns Output format preferences
   */
  public getConversionOptions(): {
    outputFormat: 'hex' | 'oklch' | 'rgb';
    preserveOriginal: boolean;
  } {
    const { config } = this.loadColorLibraryConfig();
    return config.colorLibrary.conversionOptions;
  }

  /**
   * Get color generation settings
   * @returns Color generation configuration
   */
  public getColorGenerationSettings(): {
    rampSteps: number;
    preserveKeyColors: boolean;
    algorithmicGeneration: boolean;
  } | undefined {
    const { config } = this.loadColorLibraryConfig();
    return config.colorLibrary.colorGeneration;
  }
}

/**
 * Convenience function to get DSE configuration loader instance
 * @param dseDirectory - Optional DSE directory path
 * @returns DSEConfigLoader instance
 */
export function getDSEConfig(dseDirectory?: string): DSEConfigLoader {
  return DSEConfigLoader.getInstance(dseDirectory);
}