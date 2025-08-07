#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';

interface TokenData {
  [key: string]: any;
}

interface ConsolidatedTokens {
  [tokenSetName: string]: TokenData;
}

interface TokenMetadata {
  tokenSetOrder: string[];
}

interface ThemeConfig {
  id: string;
  name: string;
  selectedTokenSets: {
    [tokenSetName: string]: 'source' | 'enabled' | 'disabled';
  };
  $figmaStyleReferences?: any;
  $figmaVariableReferences?: any;
}

interface SplitOptions {
  sourceFile?: string;
  tokensDir?: string;
  verbose?: boolean;
  dryRun?: boolean;
  backup?: boolean;
}

class SplitScript {
  private sourceFile: string;
  private tokensDir: string;
  private verbose: boolean;
  private dryRun: boolean;
  private backup: boolean;

  constructor(options: SplitOptions = {}) {
    this.sourceFile = options.sourceFile || path.join(process.cwd(), 'tokensource.json');
    this.tokensDir = options.tokensDir || path.join(process.cwd(), 'tokens');
    this.verbose = options.verbose || false;
    this.dryRun = options.dryRun || false;
    this.backup = options.backup !== false; // Default to true unless explicitly disabled
  }

  private log(message: string): void {
    if (this.verbose) {
      console.log(`[split] ${message}`);
    }
  }

  private error(message: string): void {
    console.error(`[split ERROR] ${message}`);
  }

  private readTokenSource(): ConsolidatedTokens {
    if (!fs.existsSync(this.sourceFile)) {
      throw new Error(`Source file not found: ${this.sourceFile}`);
    }

    try {
      const content = fs.readFileSync(this.sourceFile, 'utf8');
      const consolidatedTokens = JSON.parse(content) as ConsolidatedTokens;
      
      if (!consolidatedTokens || typeof consolidatedTokens !== 'object') {
        throw new Error('Invalid token source format: expected object structure');
      }

      const tokenSetCount = Object.keys(consolidatedTokens).length;
      this.log(`Loaded ${tokenSetCount} token sets from source file`);
      
      // Validate that token sets contain valid token data
      for (const [tokenSetName, tokenData] of Object.entries(consolidatedTokens)) {
        if (!tokenData || typeof tokenData !== 'object') {
          throw new Error(`Invalid token set format: ${tokenSetName} must be an object`);
        }
        const tokenCount = this.countTokens(tokenData);
        this.log(`Token set "${tokenSetName}" contains ${tokenCount} tokens`);
      }
      
      return consolidatedTokens;
      
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error(`Invalid JSON in source file: ${this.sourceFile}`);
      }
      throw error;
    }
  }

  private countTokens(obj: any, count = 0): number {
    for (const [, value] of Object.entries(obj)) {
      if (value && typeof value === 'object') {
        if ('$type' in value && '$value' in value) {
          count++;
        } else {
          count = this.countTokens(value, count);
        }
      }
    }
    return count;
  }

  private validateTokenSourceStructure(consolidatedTokens: ConsolidatedTokens): void {
    const tokenSetNames = Object.keys(consolidatedTokens);
    
    if (tokenSetNames.length === 0) {
      throw new Error('Token source is empty - no token sets found');
    }

    // Check for common token set names to ensure we have a valid structure
    const commonTokenSets = ['core', 'global', 'components'];
    const foundCommonSets = tokenSetNames.filter(name => commonTokenSets.includes(name));
    
    if (foundCommonSets.length === 0) {
      this.log('Warning: No common token sets found (core, global, components). Proceeding with custom structure.');
    }

    this.log(`Validated token source structure with token sets: ${tokenSetNames.join(', ')}`);
  }

  private createBackup(): void {
    if (!fs.existsSync(this.tokensDir)) {
      this.log('No existing tokens directory found - skipping backup');
      return;
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = `${this.tokensDir}.backup.${timestamp}`;

    try {
      this.copyDirectory(this.tokensDir, backupDir);
      this.log(`Created backup: ${backupDir}`);
    } catch (error) {
      throw new Error(`Failed to create backup: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private copyDirectory(src: string, dest: string): void {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }

    const items = fs.readdirSync(src);
    for (const item of items) {
      const srcPath = path.join(src, item);
      const destPath = path.join(dest, item);
      
      const stat = fs.statSync(srcPath);
      if (stat.isDirectory()) {
        this.copyDirectory(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }

  private splitTokenSets(consolidatedTokens: ConsolidatedTokens): void {
    // Ensure output directory exists
    if (!this.dryRun && !fs.existsSync(this.tokensDir)) {
      fs.mkdirSync(this.tokensDir, { recursive: true });
      this.log(`Created output directory: ${this.tokensDir}`);
    }

    // Write each token set to its own file
    for (const [tokenSetName, tokenData] of Object.entries(consolidatedTokens)) {
      this.writeTokenSetFile(tokenSetName, tokenData);
    }
  }

  private writeTokenSetFile(tokenSetName: string, tokenData: TokenData): void {
    const filename = `${tokenSetName}.json`;
    const filepath = path.join(this.tokensDir, filename);
    
    try {
      const jsonContent = JSON.stringify(tokenData, null, 2);
      
      if (this.dryRun) {
        this.log(`[DRY RUN] Would write ${filename} (${jsonContent.length} bytes)`);
      } else {
        fs.writeFileSync(filepath, jsonContent, 'utf8');
        this.log(`Wrote ${filename} (${jsonContent.length} bytes)`);
      }
      
    } catch (error) {
      throw new Error(`Failed to write token set ${tokenSetName}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private generateMetadata(consolidatedTokens: ConsolidatedTokens): void {
    const tokenSetOrder = Object.keys(consolidatedTokens);
    const metadata: TokenMetadata = {
      tokenSetOrder
    };

    const filepath = path.join(this.tokensDir, '$metadata.json');
    const jsonContent = JSON.stringify(metadata, null, 2);

    if (this.dryRun) {
      this.log(`[DRY RUN] Would write $metadata.json with token sets: ${tokenSetOrder.join(', ')}`);
    } else {
      if (!fs.existsSync(this.tokensDir)) {
        fs.mkdirSync(this.tokensDir, { recursive: true });
      }
      fs.writeFileSync(filepath, jsonContent, 'utf8');
      this.log(`Generated $metadata.json with ${tokenSetOrder.length} token sets`);
    }
  }

  private generateThemes(consolidatedTokens: ConsolidatedTokens): void {
    // Check if themes file already exists - if so, preserve it
    const themesPath = path.join(this.tokensDir, '$themes.json');
    
    if (fs.existsSync(themesPath)) {
      this.log('$themes.json already exists - preserving existing themes');
      return;
    }

    // Generate basic theme configuration
    const tokenSetNames = Object.keys(consolidatedTokens);
    const themes: ThemeConfig[] = [
      {
        id: 'default',
        name: 'Default',
        selectedTokenSets: this.generateDefaultTokenSetConfig(tokenSetNames)
      }
    ];

    const jsonContent = JSON.stringify(themes, null, 2);

    if (this.dryRun) {
      this.log('[DRY RUN] Would generate basic $themes.json');
    } else {
      fs.writeFileSync(themesPath, jsonContent, 'utf8');
      this.log('Generated basic $themes.json with default theme configuration');
    }
  }

  private generateDefaultTokenSetConfig(tokenSetNames: string[]): { [key: string]: 'source' | 'enabled' | 'disabled' } {
    const config: { [key: string]: 'source' | 'enabled' | 'disabled' } = {};
    
    for (const tokenSetName of tokenSetNames) {
      // Set core tokens as source, others as enabled
      config[tokenSetName] = tokenSetName === 'core' ? 'source' : 'enabled';
    }
    
    return config;
  }

  public async run(): Promise<void> {
    try {
      this.log('Starting token splitting...');
      
      if (this.dryRun) {
        console.log('[split] DRY RUN MODE - No files will be written');
      }
      
      this.log(`Reading tokens from: ${this.sourceFile}`);
      this.log(`Output directory: ${this.tokensDir}`);

      // Read and validate token source
      const consolidatedTokens = this.readTokenSource();
      this.validateTokenSourceStructure(consolidatedTokens);

      // Create backup if needed (and not in dry-run mode)
      if (this.backup && !this.dryRun) {
        this.createBackup();
      }

      // Split tokens into individual files
      this.splitTokenSets(consolidatedTokens);

      // Generate metadata and theme files
      this.generateMetadata(consolidatedTokens);
      this.generateThemes(consolidatedTokens);

      const tokenSetCount = Object.keys(consolidatedTokens).length;
      this.log(`Token splitting completed successfully - ${tokenSetCount} token sets processed`);
      
    } catch (error) {
      this.error(`Failed to split tokens: ${error instanceof Error ? error.message : String(error)}`);
      process.exit(1);
    }
  }
}

// Command-line interface
function parseArgs(): SplitOptions {
  const args = process.argv.slice(2);
  const options: SplitOptions = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    switch (arg) {
      case '--help':
      case '-h':
        console.log(`
Usage: split [options]

Splits consolidated tokensource.json back into modular token files in tokens/ directory

Options:
  --source <path>        Source file path (default: tokensource.json)
  --tokens-dir <path>    Output token directory (default: tokens/)
  --verbose, -v          Enable verbose logging
  --dry-run              Preview changes without writing files
  --no-backup            Skip creating backup of existing tokens directory
  --help, -h             Show this help message

Examples:
  split
  split --verbose
  split --dry-run
  split --source ./my-tokensource.json --tokens-dir ./my-tokens
  split --no-backup
`);
        process.exit(0);
        break;
        
      case '--source':
        options.sourceFile = args[++i];
        break;
        
      case '--tokens-dir':
        options.tokensDir = args[++i];
        break;
        
      case '--verbose':
      case '-v':
        options.verbose = true;
        break;
        
      case '--dry-run':
        options.dryRun = true;
        break;
        
      case '--no-backup':
        options.backup = false;
        break;
        
      default:
        console.error(`Unknown option: ${arg}`);
        console.error('Use --help for usage information');
        process.exit(1);
    }
  }

  return options;
}

// Main execution - Check if this is the main module in ES module style
const isMainModule = process.argv[1] && (process.argv[1].endsWith('split.js') || process.argv[1].endsWith('split.ts'));

if (isMainModule) {
  const options = parseArgs();
  const script = new SplitScript(options);
  script.run();
}