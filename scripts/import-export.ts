#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';

interface ImportExportOptions {
  sourceDir?: string;
  targetDir?: string;
  verbose?: boolean;
  dryRun?: boolean;
  noBackup?: boolean;
}

class ImportExportScript {
  private sourceDir: string;
  private targetDir: string;
  private verbose: boolean;
  private dryRun: boolean;
  private noBackup: boolean;

  constructor(options: ImportExportOptions = {}) {
    this.sourceDir = options.sourceDir || path.join(process.cwd(), 'tokenstudio_export');
    this.targetDir = options.targetDir || path.join(process.cwd(), 'tokens');
    this.verbose = options.verbose || false;
    this.dryRun = options.dryRun || false;
    this.noBackup = options.noBackup || false;
  }

  private log(message: string): void {
    if (this.verbose || this.dryRun) {
      const prefix = this.dryRun ? '[import-export] DRY RUN - ' : '[import-export] ';
      console.log(`${prefix}${message}`);
    }
  }

  private error(message: string): void {
    console.error(`[import-export ERROR] ${message}`);
  }

  private validateSourceDirectory(): void {
    if (!fs.existsSync(this.sourceDir)) {
      throw new Error(`Source directory not found: ${this.sourceDir}`);
    }

    const metadataPath = path.join(this.sourceDir, '$metadata.json');
    if (!fs.existsSync(metadataPath)) {
      throw new Error(`Source directory missing required $metadata.json: ${this.sourceDir}`);
    }

    const themesPath = path.join(this.sourceDir, '$themes.json');
    if (!fs.existsSync(themesPath)) {
      throw new Error(`Source directory missing required $themes.json: ${this.sourceDir}`);
    }
  }

  private createBackup(): string | null {
    if (this.noBackup) {
      this.log('Skipping backup creation (--no-backup specified)');
      return null;
    }

    if (!fs.existsSync(this.targetDir)) {
      this.log('Target directory does not exist, skipping backup');
      return null;
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const backupDir = path.join(process.cwd(), `tokens.backup.${timestamp}`);

    this.log(`Creating backup: ${backupDir}`);

    if (!this.dryRun) {
      try {
        // Create backup directory
        fs.mkdirSync(backupDir, { recursive: true });

        // Copy all files from target directory
        const files = fs.readdirSync(this.targetDir);
        for (const file of files) {
          const sourcePath = path.join(this.targetDir, file);
          const targetPath = path.join(backupDir, file);
          
          if (fs.statSync(sourcePath).isFile()) {
            fs.copyFileSync(sourcePath, targetPath);
            this.log(`Backed up: ${file}`);
          }
        }
      } catch (error) {
        throw new Error(`Failed to create backup: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    return backupDir;
  }

  private syncFile(sourceFile: string, targetFile: string): void {
    const sourcePath = path.join(this.sourceDir, sourceFile);
    const targetPath = path.join(this.targetDir, targetFile);

    if (!fs.existsSync(sourcePath)) {
      this.log(`Warning: Source file not found: ${sourceFile}`);
      return;
    }

    try {
      const sourceContent = fs.readFileSync(sourcePath, 'utf8');
      
      // Validate JSON format
      JSON.parse(sourceContent);
      
      this.log(`Syncing: ${sourceFile} → ${targetFile}`);
      
      if (!this.dryRun) {
        // Ensure target directory exists
        fs.mkdirSync(this.targetDir, { recursive: true });
        
        // Write file to target
        fs.writeFileSync(targetPath, sourceContent, 'utf8');
      }
    } catch (error) {
      throw new Error(`Failed to sync ${sourceFile}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private readTokenMetadata(): any {
    const metadataPath = path.join(this.sourceDir, '$metadata.json');
    
    try {
      const content = fs.readFileSync(metadataPath, 'utf8');
      const metadata = JSON.parse(content);
      
      if (!metadata.tokenSetOrder || !Array.isArray(metadata.tokenSetOrder)) {
        throw new Error('Invalid metadata format: tokenSetOrder must be an array');
      }

      this.log(`Found ${metadata.tokenSetOrder.length} token sets in source metadata`);
      return metadata;
      
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error(`Invalid JSON in source metadata file: ${metadataPath}`);
      }
      throw error;
    }
  }

  public async run(): Promise<void> {
    try {
      this.log('Starting Token Studio export import...');
      
      if (this.dryRun) {
        this.log('DRY RUN MODE - No files will be written');
      }

      this.log(`Source directory: ${this.sourceDir}`);
      this.log(`Target directory: ${this.targetDir}`);

      // Validate source directory structure
      this.validateSourceDirectory();

      // Read source metadata to understand what token sets to import
      const metadata = this.readTokenMetadata();

      // Create backup of existing tokens directory
      const backupDir = this.createBackup();
      if (backupDir) {
        this.log(`Backup created: ${backupDir}`);
      }

      // Sync configuration files
      this.syncFile('$metadata.json', '$metadata.json');
      this.syncFile('$themes.json', '$themes.json');

      // Sync all token set files listed in metadata
      let syncedCount = 0;
      for (const tokenSetName of metadata.tokenSetOrder) {
        const sourceFileName = `${tokenSetName}.json`;
        const targetFileName = `${tokenSetName}.json`;
        
        this.syncFile(sourceFileName, targetFileName);
        syncedCount++;
      }

      if (this.dryRun) {
        this.log(`DRY RUN completed - Would sync ${syncedCount} token sets from Token Studio export`);
      } else {
        this.log(`Import completed successfully - ${syncedCount} token sets synced from Token Studio export`);
      }
      
    } catch (error) {
      this.error(`Failed to import Token Studio export: ${error instanceof Error ? error.message : String(error)}`);
      process.exit(1);
    }
  }
}

// Command-line interface
function parseArgs(): ImportExportOptions {
  const args = process.argv.slice(2);
  const options: ImportExportOptions = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    switch (arg) {
      case '--help':
      case '-h':
        console.log(`
Usage: import-export [options]

Syncs Token Studio exports from tokenstudio_export/ to tokens/ working directory

Options:
  --source-dir <path>    Source directory (default: tokenstudio_export/)
  --target-dir <path>    Target directory (default: tokens/)
  --verbose, -v          Enable verbose logging
  --dry-run              Preview changes without writing files
  --no-backup            Skip creating backup of existing tokens directory
  --help, -h             Show this help message

Examples:
  import-export
  import-export --verbose
  import-export --dry-run
  import-export --source-dir ./my-export --target-dir ./my-tokens
  import-export --no-backup
`);
        process.exit(0);
        break;
        
      case '--source-dir':
        options.sourceDir = args[++i];
        break;
        
      case '--target-dir':
        options.targetDir = args[++i];
        break;
        
      case '--verbose':
      case '-v':
        options.verbose = true;
        break;
        
      case '--dry-run':
        options.dryRun = true;
        break;
        
      case '--no-backup':
        options.noBackup = true;
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
const isMainModule = process.argv[1] && (process.argv[1].endsWith('import-export.js') || process.argv[1].endsWith('import-export.ts'));

if (isMainModule) {
  const options = parseArgs();
  const script = new ImportExportScript(options);
  script.run();
}