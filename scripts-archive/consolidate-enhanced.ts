#!/usr/bin/env node

/**
 * Enhanced Consolidate Script with OKLCH Support
 * Integrates DSE OKLCH color processing into the consolidate workflow
 * Maintains full backward compatibility with existing functionality
 */

import * as fs from 'fs';
import * as path from 'path';
import { defaultConsolidateEnhancer } from '../.dse/consolidate-enhancer.js';

interface TokenMetadata {
  tokenSetOrder: string[];
}

interface DesignToken {
  $type: string;
  $value: any;
  $description?: string;
}

interface TokenData {
  [key: string]: any;
}

interface ConsolidatedTokens {
  [tokenSetName: string]: TokenData;
}

interface ConsolidateOptions {
  tokensDir?: string;
  outputFile?: string;
  verbose?: boolean;
  enableOKLCH?: boolean;
  colorFormat?: 'hex' | 'oklch' | 'rgb' | 'preserve';
}

class EnhancedConsolidateScript {
  private tokensDir: string;
  private outputFile: string;
  private verbose: boolean;
  private enhancer = defaultConsolidateEnhancer;

  constructor(options: ConsolidateOptions = {}) {
    this.tokensDir = options.tokensDir || path.join(process.cwd(), 'tokens');
    this.outputFile = options.outputFile || path.join(process.cwd(), 'tokensource.json');
    this.verbose = options.verbose || false;
  }

  private log(message: string): void {
    if (this.verbose) {
      console.log(`[consolidate] ${message}`);
    }
  }

  private error(message: string): void {
    console.error(`[consolidate ERROR] ${message}`);
  }

  private readTokenMetadata(): TokenMetadata {
    const metadataPath = path.join(this.tokensDir, '$metadata.json');
    
    if (!fs.existsSync(metadataPath)) {
      throw new Error(`Metadata file not found: ${metadataPath}`);
    }

    try {
      const content = fs.readFileSync(metadataPath, 'utf8');
      const metadata = JSON.parse(content) as TokenMetadata;
      
      if (!metadata.tokenSetOrder || !Array.isArray(metadata.tokenSetOrder)) {
        throw new Error('Invalid metadata format: tokenSetOrder must be an array');
      }

      this.log(`Found ${metadata.tokenSetOrder.length} token sets in processing order`);
      return metadata;
      
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error(`Invalid JSON in metadata file: ${metadataPath}`);
      }
      throw error;
    }
  }

  private readTokenSet(tokenSetName: string): TokenData {
    const tokenFilePath = path.join(this.tokensDir, `${tokenSetName}.json`);
    
    if (!fs.existsSync(tokenFilePath)) {
      this.log(`Warning: Token set file not found: ${tokenFilePath} - skipping`);
      return {};
    }

    try {
      const content = fs.readFileSync(tokenFilePath, 'utf8');
      const tokenData = JSON.parse(content) as TokenData;
      
      this.log(`Loaded ${Object.keys(tokenData).length} token groups from ${tokenSetName}.json`);
      return tokenData;
      
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error(`Invalid JSON in token file: ${tokenFilePath}`);
      }
      throw error;
    }
  }

  private validateRequiredFiles(): void {
    const metadataPath = path.join(this.tokensDir, '$metadata.json');
    const themesPath = path.join(this.tokensDir, '$themes.json');
    
    const missingFiles: string[] = [];
    
    if (!fs.existsSync(metadataPath)) {
      missingFiles.push('$metadata.json');
    }
    
    if (!fs.existsSync(themesPath)) {
      missingFiles.push('$themes.json');
    }
    
    if (missingFiles.length > 0) {
      throw new Error(`Required files missing: ${missingFiles.join(', ')}`);
    }
  }

  private isDesignToken(value: any): value is DesignToken {
    return value && typeof value === 'object' && '$type' in value && '$value' in value;
  }

  private validateTokenReferences(consolidatedTokens: ConsolidatedTokens): void {
    const tokenPaths = new Set<string>();
    
    // Collect all token paths
    const collectPaths = (obj: any, basePath: string = ''): void => {
      for (const [key, value] of Object.entries(obj)) {
        const currentPath = basePath ? `${basePath}.${key}` : key;
        
        if (value && typeof value === 'object') {
          if (this.isDesignToken(value)) {
            // This is a design token
            tokenPaths.add(currentPath);
          } else {
            // This is a token group, recurse
            collectPaths(value, currentPath);
          }
        }
      }
    };

    // Collect paths from all token sets
    for (const [tokenSetName, tokenData] of Object.entries(consolidatedTokens)) {
      collectPaths(tokenData, tokenSetName);
    }

    // Check for circular references in token values
    const checkReferences = (obj: any, visited: Set<string> = new Set()): void => {
      for (const [, value] of Object.entries(obj)) {
        if (value && typeof value === 'object') {
          if (this.isDesignToken(value) && typeof value.$value === 'string') {
            // Check if this token references another token
            if (value.$value.startsWith('{') && value.$value.endsWith('}')) {
              const referencePath = value.$value.slice(1, -1);
              
              if (visited.has(referencePath)) {
                throw new Error(`Circular reference detected: ${Array.from(visited).join(' → ')} → ${referencePath}`);
              }
              
              if (!tokenPaths.has(referencePath)) {
                this.log(`Warning: Token reference not found: ${referencePath}`);
              }
            }
          } else if (!this.isDesignToken(value)) {
            // Recurse into token groups
            checkReferences(value, new Set(visited));
          }
        }
      }
    };

    // Check all token sets for reference issues
    for (const tokenData of Object.values(consolidatedTokens)) {
      checkReferences(tokenData);
    }

    this.log(`Validated ${tokenPaths.size} token references`);
  }

  private readTokenStudioMetadata(): any {
    const metadataPath = path.join(this.tokensDir, '$metadata.json');
    
    try {
      if (fs.existsSync(metadataPath)) {
        const content = fs.readFileSync(metadataPath, 'utf8');
        const metadata = JSON.parse(content);
        this.log('Read Token Studio metadata');
        return metadata;
      }
      return null;
    } catch (error) {
      this.log(`Warning: Could not read Token Studio metadata: ${error instanceof Error ? error.message : String(error)}`);
      return null;
    }
  }

  private readTokenStudioThemes(): any {
    const themesPath = path.join(this.tokensDir, '$themes.json');
    
    try {
      if (fs.existsSync(themesPath)) {
        const content = fs.readFileSync(themesPath, 'utf8');
        const themes = JSON.parse(content);
        this.log('Read Token Studio themes');
        return themes;
      }
      return null;
    } catch (error) {
      this.log(`Warning: Could not read Token Studio themes: ${error instanceof Error ? error.message : String(error)}`);
      return null;
    }
  }

  private writeConsolidatedTokens(consolidatedTokens: ConsolidatedTokens): void {
    try {
      // Validate token references before writing
      this.validateTokenReferences(consolidatedTokens);
      
      // Create Token Studio compatible output structure
      const tokenStudioOutput: any = { ...consolidatedTokens };
      
      // Add Token Studio metadata if available
      const tokenStudioMetadata = this.readTokenStudioMetadata();
      if (tokenStudioMetadata) {
        tokenStudioOutput.$metadata = tokenStudioMetadata;
        this.log('Added Token Studio $metadata');
      }
      
      // Add Token Studio themes if available
      const tokenStudioThemes = this.readTokenStudioThemes();
      if (tokenStudioThemes) {
        tokenStudioOutput.$themes = tokenStudioThemes;
        this.log('Added Token Studio $themes');
      }
      
      // Format JSON with proper indentation (2 spaces as specified)
      const jsonOutput = JSON.stringify(tokenStudioOutput, null, 2);
      
      // Ensure output directory exists
      const outputDir = path.dirname(this.outputFile);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      
      // Write to output file
      fs.writeFileSync(this.outputFile, jsonOutput, 'utf8');
      
      // Verify output file was created
      const stats = fs.statSync(this.outputFile);
      this.log(`Output written to ${this.outputFile} (${stats.size} bytes)`);
      
      // Log Token Studio compatibility
      if (tokenStudioMetadata || tokenStudioThemes) {
        this.log('Token Studio compatibility: Enhanced with metadata and themes');
      } else {
        this.log('Token Studio compatibility: Basic format support');
      }
      
    } catch (error) {
      throw new Error(`Failed to write consolidated tokens: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  public consolidate(): void {
    try {
      this.log('Starting enhanced token consolidation with OKLCH support...');
      
      // Validate input directory
      if (!fs.existsSync(this.tokensDir)) {
        throw new Error(`Tokens directory not found: ${this.tokensDir}`);
      }

      this.log(`Reading tokens from: ${this.tokensDir}`);
      this.log(`Output file: ${this.outputFile}`);

      // Validate required files exist
      this.validateRequiredFiles();

      // Read metadata to get processing order
      const metadata = this.readTokenMetadata();
      
      // Process each token set in order
      const consolidatedTokens: ConsolidatedTokens = {};
      
      for (const tokenSetName of metadata.tokenSetOrder) {
        this.log(`Processing token set: ${tokenSetName}`);
        const tokenData = this.readTokenSet(tokenSetName);
        
        // Include all token sets even if empty - Token Studio requires them for theme references
        consolidatedTokens[tokenSetName] = tokenData;
      }

      // Apply OKLCH enhancements if enabled
      const oklchOptions = this.enhancer.getProcessingOptions(process.argv);
      const enhancedTokens = this.enhancer.processTokens(consolidatedTokens, oklchOptions);

      // Write consolidated tokens to output file
      this.writeConsolidatedTokens(enhancedTokens);
      
      const tokenSetsCount = Object.keys(enhancedTokens).length;
      this.log(`Enhanced token consolidation completed successfully - ${tokenSetsCount} token sets processed`);
      
      // Log DSE processing statistics if OKLCH was enabled
      if (oklchOptions.enabled) {
        const stats = this.enhancer.getStats();
        this.log(`DSE processing statistics: ${stats.processedTokens}/${stats.colorTokens} color tokens enhanced`);
      }
      
    } catch (error) {
      this.error(`Failed to consolidate tokens: ${error instanceof Error ? error.message : String(error)}`);
      process.exit(1);
    }
  }
}

// CLI interface and help
function showHelp(): void {
  console.log(`
Enhanced Consolidate Script with OKLCH Support

Consolidates modular design token files into a single tokensource.json file.
Includes optional DSE OKLCH color processing for perceptually uniform colors.

Usage: consolidate-enhanced [options]

Options:
  --tokens-dir <path>      Directory containing token files (default: ./tokens)
  --output <path>          Output file path (default: ./tokensource.json)
  --verbose, -v            Enable verbose logging
  --oklch                  Force enable OKLCH processing (auto-detected from .dse/ config)
  --color-format <format>  Output color format: hex|oklch|rgb|preserve (default: preserve)
  --no-color-ramps         Disable automatic color ramp generation
  --no-accessibility       Disable accessibility validation
  --no-brand-variations    Disable brand-specific color variations
  --help, -h              Show this help message

DSE Integration:
  If .dse/color-library.json exists, OKLCH processing is automatically enabled.
  Use CLI flags to override DSE configuration or force specific behaviors.

Examples:
  consolidate-enhanced
  consolidate-enhanced --verbose
  consolidate-enhanced --oklch --color-format hex
  consolidate-enhanced --tokens-dir ./my-tokens --output ./my-tokensource.json
  consolidate-enhanced --oklch --no-brand-variations --verbose
`);
}

function parseCliOptions(): ConsolidateOptions {
  const args = process.argv.slice(2);
  const options: ConsolidateOptions = {};

  // Parse arguments
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    switch (arg) {
      case '--help':
      case '-h':
        showHelp();
        process.exit(0);
        break;

      case '--tokens-dir':
        if (i + 1 < args.length) {
          options.tokensDir = args[++i];
        } else {
          console.error('Error: --tokens-dir requires a path');
          process.exit(1);
        }
        break;

      case '--output':
        if (i + 1 < args.length) {
          options.outputFile = args[++i];
        } else {
          console.error('Error: --output requires a path');
          process.exit(1);
        }
        break;

      case '--verbose':
      case '-v':
        options.verbose = true;
        break;

      case '--oklch':
        options.enableOKLCH = true;
        break;

      case '--color-format':
        if (i + 1 < args.length) {
          const format = args[++i];
          if (['hex', 'oklch', 'rgb', 'preserve'].includes(format)) {
            options.colorFormat = format as any;
          } else {
            console.error(`Error: Invalid color format "${format}". Use hex, oklch, rgb, or preserve.`);
            process.exit(1);
          }
        } else {
          console.error('Error: --color-format requires a format (hex|oklch|rgb|preserve)');
          process.exit(1);
        }
        break;

      default:
        if (arg.startsWith('--')) {
          // Allow DSE-specific flags to pass through (handled by enhancer)
          if (!['--no-color-ramps', '--no-accessibility', '--no-brand-variations'].includes(arg)) {
            console.error(`Error: Unknown option "${arg}"`);
            showHelp();
            process.exit(1);
          }
        }
        break;
    }
  }

  return options;
}

// Main execution
const isMainModule = process.argv[1] && (process.argv[1].endsWith('consolidate-enhanced.js') || process.argv[1].endsWith('consolidate-enhanced.ts'));

if (isMainModule) {
  const options = parseCliOptions();
  const consolidateScript = new EnhancedConsolidateScript(options);
  consolidateScript.consolidate();
}