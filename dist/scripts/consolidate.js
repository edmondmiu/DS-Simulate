#!/usr/bin/env node
import * as fs from 'fs';
import * as path from 'path';
class ConsolidateScript {
    tokensDir;
    outputFile;
    verbose;
    constructor(options = {}) {
        this.tokensDir = options.tokensDir || path.join(process.cwd(), 'tokens');
        this.outputFile = options.outputFile || path.join(process.cwd(), 'tokensource.json');
        this.verbose = options.verbose || false;
    }
    log(message) {
        if (this.verbose) {
            console.log(`[consolidate] ${message}`);
        }
    }
    error(message) {
        console.error(`[consolidate ERROR] ${message}`);
    }
    readTokenMetadata() {
        const metadataPath = path.join(this.tokensDir, '$metadata.json');
        if (!fs.existsSync(metadataPath)) {
            throw new Error(`Metadata file not found: ${metadataPath}`);
        }
        try {
            const content = fs.readFileSync(metadataPath, 'utf8');
            const metadata = JSON.parse(content);
            if (!metadata.tokenSetOrder || !Array.isArray(metadata.tokenSetOrder)) {
                throw new Error('Invalid metadata format: tokenSetOrder must be an array');
            }
            this.log(`Found ${metadata.tokenSetOrder.length} token sets in processing order`);
            return metadata;
        }
        catch (error) {
            if (error instanceof SyntaxError) {
                throw new Error(`Invalid JSON in metadata file: ${metadataPath}`);
            }
            throw error;
        }
    }
    readTokenSet(tokenSetName) {
        const tokenFilePath = path.join(this.tokensDir, `${tokenSetName}.json`);
        if (!fs.existsSync(tokenFilePath)) {
            this.log(`Warning: Token set file not found: ${tokenFilePath} - skipping`);
            return {};
        }
        try {
            const content = fs.readFileSync(tokenFilePath, 'utf8');
            const tokenData = JSON.parse(content);
            this.log(`Loaded ${Object.keys(tokenData).length} token groups from ${tokenSetName}.json`);
            return tokenData;
        }
        catch (error) {
            if (error instanceof SyntaxError) {
                throw new Error(`Invalid JSON in token file: ${tokenFilePath}`);
            }
            throw error;
        }
    }
    validateRequiredFiles() {
        const metadataPath = path.join(this.tokensDir, '$metadata.json');
        const themesPath = path.join(this.tokensDir, '$themes.json');
        const missingFiles = [];
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
    isDesignToken(value) {
        return value && typeof value === 'object' && '$type' in value && '$value' in value;
    }
    validateTokenReferences(consolidatedTokens) {
        const tokenPaths = new Set();
        // Collect all token paths
        const collectPaths = (obj, basePath = '') => {
            for (const [key, value] of Object.entries(obj)) {
                const currentPath = basePath ? `${basePath}.${key}` : key;
                if (value && typeof value === 'object') {
                    if (this.isDesignToken(value)) {
                        // This is a design token
                        tokenPaths.add(currentPath);
                    }
                    else {
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
        const checkReferences = (obj, visited = new Set()) => {
            for (const [, value] of Object.entries(obj)) {
                if (value && typeof value === 'object') {
                    if (this.isDesignToken(value) && typeof value.$value === 'string') {
                        // Check if this is a reference token
                        const refMatch = value.$value.match(/^{([^}]+)}$/);
                        if (refMatch) {
                            const referencedPath = refMatch[1];
                            if (visited.has(referencedPath)) {
                                throw new Error(`Circular token reference detected: ${referencedPath}`);
                            }
                            if (!tokenPaths.has(referencedPath)) {
                                this.log(`Warning: Token reference not found: ${referencedPath}`);
                            }
                        }
                    }
                    else {
                        checkReferences(value, visited);
                    }
                }
            }
        };
        for (const tokenData of Object.values(consolidatedTokens)) {
            checkReferences(tokenData);
        }
        this.log(`Validated ${tokenPaths.size} token paths for references`);
    }
    writeConsolidatedTokens(consolidatedTokens) {
        try {
            // Validate token references before writing
            this.validateTokenReferences(consolidatedTokens);
            // Format JSON with proper indentation (2 spaces as specified)
            const jsonOutput = JSON.stringify(consolidatedTokens, null, 2);
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
        }
        catch (error) {
            throw new Error(`Failed to write consolidated tokens: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async run() {
        try {
            this.log('Starting token consolidation...');
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
            const consolidatedTokens = {};
            for (const tokenSetName of metadata.tokenSetOrder) {
                this.log(`Processing token set: ${tokenSetName}`);
                const tokenData = this.readTokenSet(tokenSetName);
                if (Object.keys(tokenData).length > 0) {
                    consolidatedTokens[tokenSetName] = tokenData;
                }
            }
            // Write consolidated tokens to output file
            this.writeConsolidatedTokens(consolidatedTokens);
            const tokenSetsCount = Object.keys(consolidatedTokens).length;
            this.log(`Token consolidation completed successfully - ${tokenSetsCount} token sets processed`);
        }
        catch (error) {
            this.error(`Failed to consolidate tokens: ${error instanceof Error ? error.message : String(error)}`);
            process.exit(1);
        }
    }
}
// Command-line interface
function parseArgs() {
    const args = process.argv.slice(2);
    const options = {};
    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        switch (arg) {
            case '--help':
            case '-h':
                console.log(`
Usage: consolidate [options]

Consolidates modular token files from tokens/ directory into tokensource.json

Options:
  --tokens-dir <path>    Token source directory (default: tokens/)
  --output <path>        Output file path (default: tokensource.json)  
  --verbose, -v          Enable verbose logging
  --help, -h             Show this help message

Examples:
  consolidate
  consolidate --verbose
  consolidate --tokens-dir ./my-tokens --output ./my-tokensource.json
`);
                process.exit(0);
                break;
            case '--tokens-dir':
                options.tokensDir = args[++i];
                break;
            case '--output':
                options.outputFile = args[++i];
                break;
            case '--verbose':
            case '-v':
                options.verbose = true;
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
const isMainModule = process.argv[1] && (process.argv[1].endsWith('consolidate.js') || process.argv[1].endsWith('consolidate.ts'));
if (isMainModule) {
    const options = parseArgs();
    const script = new ConsolidateScript(options);
    script.run();
}
//# sourceMappingURL=consolidate.js.map