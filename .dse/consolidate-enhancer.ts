/**
 * Consolidate Script OKLCH Enhancement
 * Integrates OKLCH color processing into the existing consolidate workflow
 * Following TypeScript 5.4.5 strict typing standards
 */

import { getDSEConfig } from './config-loader.js';
import { OKLCHColorProcessor } from './oklch-color-processor.js';

/**
 * Enhanced options for OKLCH processing
 */
export interface OKLCHProcessingOptions {
  enabled: boolean;
  colorFormat: 'hex' | 'oklch' | 'rgb' | 'preserve';
  generateColorRamps: boolean;
  validateAccessibility: boolean;
  processBrandVariations: boolean;
  verbose: boolean;
}

/**
 * Token processing statistics
 */
export interface ProcessingStats {
  totalTokens: number;
  colorTokens: number;
  processedTokens: number;
  warnings: string[];
  conversionTime: number;
}

/**
 * Design token interface
 */
interface DesignToken {
  $type: string;
  $value: any;
  $description?: string;
  oklch?: {
    l: number;
    c: number;
    h: number;
  };
}

/**
 * Consolidated tokens structure
 */
interface ConsolidatedTokens {
  [tokenSetName: string]: any;
}

/**
 * Consolidate script enhancer with OKLCH capabilities
 */
export class ConsolidateEnhancer {
  private oklchProcessor: OKLCHColorProcessor;
  private dseConfig: any;
  private stats: ProcessingStats;

  constructor() {
    this.oklchProcessor = new OKLCHColorProcessor();
    this.dseConfig = getDSEConfig();
    this.stats = {
      totalTokens: 0,
      colorTokens: 0,
      processedTokens: 0,
      warnings: [],
      conversionTime: 0
    };
  }

  /**
   * Check if DSE OKLCH processing should be enabled
   * @returns true if DSE configuration exists and OKLCH should be processed
   */
  public shouldEnableOKLCHProcessing(): boolean {
    if (!this.dseConfig.isDSEConfigured()) {
      return false;
    }

    try {
      const { validation } = this.dseConfig.loadColorLibraryConfig();
      return validation.isValid;
    } catch (error) {
      console.warn(`[DSE] Failed to load configuration: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return false;
    }
  }

  /**
   * Get OKLCH processing options from CLI arguments and DSE configuration
   * @param cliArgs - Command line arguments
   * @returns Processing options
   */
  public getProcessingOptions(cliArgs: string[]): OKLCHProcessingOptions {
    const hasOKLCHFlag = cliArgs.includes('--oklch');
    const colorFormatIndex = cliArgs.findIndex(arg => arg === '--color-format');
    const colorFormat = (colorFormatIndex !== -1 && colorFormatIndex + 1 < cliArgs.length) 
      ? cliArgs[colorFormatIndex + 1] as any
      : 'preserve';

    const dseEnabled = this.shouldEnableOKLCHProcessing();

    return {
      enabled: hasOKLCHFlag || dseEnabled,
      colorFormat: ['hex', 'oklch', 'rgb', 'preserve'].includes(colorFormat) ? colorFormat : 'preserve',
      generateColorRamps: dseEnabled && !cliArgs.includes('--no-color-ramps'),
      validateAccessibility: dseEnabled && !cliArgs.includes('--no-accessibility'),
      processBrandVariations: dseEnabled && !cliArgs.includes('--no-brand-variations'),
      verbose: cliArgs.includes('--verbose') || cliArgs.includes('-v')
    };
  }

  /**
   * Process consolidated tokens with OKLCH enhancements
   * @param consolidatedTokens - Original consolidated tokens
   * @param options - Processing options
   * @returns Enhanced consolidated tokens
   */
  public processTokens(
    consolidatedTokens: ConsolidatedTokens, 
    options: OKLCHProcessingOptions
  ): ConsolidatedTokens {
    if (!options.enabled) {
      if (options.verbose) {
        console.log('[DSE] OKLCH processing disabled, returning original tokens');
      }
      return consolidatedTokens;
    }

    console.log('[DSE] Starting OKLCH color processing...');
    const startTime = Date.now();
    
    // Reset stats
    this.stats = {
      totalTokens: 0,
      colorTokens: 0,
      processedTokens: 0,
      warnings: [],
      conversionTime: 0
    };

    // Process each token set
    const enhancedTokens: ConsolidatedTokens = {};

    for (const [tokenSetName, tokenData] of Object.entries(consolidatedTokens)) {
      if (options.verbose) {
        console.log(`[DSE] Processing token set: ${tokenSetName}`);
      }

      enhancedTokens[tokenSetName] = this.processTokenSet(
        tokenData, 
        tokenSetName, 
        options
      );
    }

    // Record processing time
    this.stats.conversionTime = Date.now() - startTime;

    // Log processing results
    this.logProcessingStats(options.verbose);

    return enhancedTokens;
  }

  /**
   * Process a single token set
   * @param tokenData - Token set data
   * @param tokenSetName - Name of the token set
   * @param options - Processing options
   * @returns Processed token set
   */
  private processTokenSet(
    tokenData: any,
    tokenSetName: string,
    options: OKLCHProcessingOptions
  ): any {
    if (!tokenData || typeof tokenData !== 'object') {
      return tokenData;
    }

    const processed: any = {};

    for (const [key, value] of Object.entries(tokenData)) {
      if (this.isDesignToken(value)) {
        // This is a design token - process it
        this.stats.totalTokens++;
        
        if (value.$type === 'color') {
          this.stats.colorTokens++;
          processed[key] = this.processColorToken(value, tokenSetName, options);
        } else {
          // Non-color token - pass through unchanged
          processed[key] = value;
        }
      } else if (value && typeof value === 'object') {
        // This is a token group - recurse
        processed[key] = this.processTokenSet(value, tokenSetName, options);
      } else {
        // Primitive value - pass through unchanged
        processed[key] = value;
      }
    }

    return processed;
  }

  /**
   * Process a color token with OKLCH enhancements
   * @param token - Color design token
   * @param tokenSetName - Name of the token set
   * @param options - Processing options
   * @returns Enhanced color token
   */
  private processColorToken(
    token: DesignToken,
    tokenSetName: string,
    options: OKLCHProcessingOptions
  ): DesignToken {
    if (typeof token.$value !== 'string') {
      // Token reference or complex value - pass through unchanged
      return token;
    }

    try {
      // Convert to OKLCH
      const oklchResult = this.oklchProcessor.convertToOKLCH(token.$value);
      
      if (!oklchResult.success) {
        this.stats.warnings.push(`Failed to convert color token ${token.$value}: ${oklchResult.error}`);
        return token;
      }

      this.stats.processedTokens++;

      // Apply brand-specific modifications if enabled
      let finalOKLCH = oklchResult.oklch!;
      
      if (options.processBrandVariations) {
        const brandConfig = this.dseConfig.getBrandConfig(tokenSetName);
        if (brandConfig) {
          const brandResult = this.oklchProcessor.generateBrandColor({
            baseColor: finalOKLCH,
            lightnessAdjustment: brandConfig.lightnessAdjustment,
            chromaMultiplier: brandConfig.chromaMultiplier,
            hueShift: brandConfig.hueShift
          });
          
          if (brandResult.success && brandResult.oklch) {
            finalOKLCH = brandResult.oklch;
          }
        }
      }

      // Convert to desired output format
      let finalColor: string;
      
      switch (options.colorFormat) {
        case 'oklch':
          finalColor = `oklch(${finalOKLCH.l.toFixed(3)} ${finalOKLCH.c.toFixed(3)} ${finalOKLCH.h.toFixed(1)})`;
          break;
        case 'rgb':
          const rgbResult = this.oklchProcessor.convertFromOKLCH(finalOKLCH);
          finalColor = rgbResult.success ? rgbResult.color : token.$value;
          break;
        case 'preserve':
          finalColor = token.$value;
          break;
        case 'hex':
        default:
          const hexResult = this.oklchProcessor.convertFromOKLCH(finalOKLCH);
          finalColor = hexResult.success ? hexResult.color : token.$value;
          break;
      }

      // Create enhanced token
      const enhancedToken: DesignToken = {
        ...token,
        $value: finalColor
      };

      // Add OKLCH metadata if format is not already OKLCH
      if (options.colorFormat !== 'oklch') {
        enhancedToken.oklch = {
          l: Math.round(finalOKLCH.l * 1000) / 1000,
          c: Math.round(finalOKLCH.c * 1000) / 1000,
          h: Math.round(finalOKLCH.h * 10) / 10
        };
      }

      // Add warnings to token if any
      if (oklchResult.warnings.length > 0) {
        this.stats.warnings.push(...oklchResult.warnings.map(w => `${token.$value}: ${w}`));
      }

      return enhancedToken;

    } catch (error) {
      this.stats.warnings.push(`Error processing color token ${token.$value}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return token;
    }
  }

  /**
   * Check if a value is a design token
   * @param value - Value to check
   * @returns true if the value is a design token
   */
  private isDesignToken(value: any): value is DesignToken {
    return value && typeof value === 'object' && '$type' in value && '$value' in value;
  }

  /**
   * Log processing statistics
   * @param verbose - Whether to log verbose statistics
   */
  private logProcessingStats(verbose: boolean): void {
    console.log(`[DSE] OKLCH processing completed:`);
    console.log(`[DSE]   Total tokens: ${this.stats.totalTokens}`);
    console.log(`[DSE]   Color tokens: ${this.stats.colorTokens}`);
    console.log(`[DSE]   Processed: ${this.stats.processedTokens}`);
    console.log(`[DSE]   Processing time: ${this.stats.conversionTime}ms`);

    if (this.stats.warnings.length > 0) {
      console.log(`[DSE]   Warnings: ${this.stats.warnings.length}`);
      
      if (verbose) {
        this.stats.warnings.forEach(warning => {
          console.log(`[DSE]     ⚠️  ${warning}`);
        });
      } else {
        console.log(`[DSE]   Use --verbose to see detailed warnings`);
      }
    }
  }

  /**
   * Get processing statistics
   * @returns Current processing statistics
   */
  public getStats(): ProcessingStats {
    return { ...this.stats };
  }

  /**
   * Clear processing cache and reset stats
   */
  public reset(): void {
    this.oklchProcessor.clearCache();
    this.stats = {
      totalTokens: 0,
      colorTokens: 0,
      processedTokens: 0,
      warnings: [],
      conversionTime: 0
    };
  }
}

/**
 * Default consolidate enhancer instance
 */
export const defaultConsolidateEnhancer = new ConsolidateEnhancer();