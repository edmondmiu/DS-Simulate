#!/usr/bin/env node

/**
 * Pull Latest tokensource.json from GitHub
 * 
 * This script fetches the latest tokensource.json from the GitHub repository
 * for DSE sync workflow when Token Studio has made changes.
 */

const fs = require('fs');
const https = require('https');
const path = require('path');

// Configuration
const GITHUB_RAW_URL = 'https://raw.githubusercontent.com/edmondmiu/DS-Simulate/main/tokensource.json';
const LOCAL_FILE = 'tokensource.json';
const BACKUP_DIR = 'backups';

/**
 * Display help information
 */
function showHelp() {
  console.log(`
🔄 Pull Latest tokensource.json from GitHub

Usage: npm run pull-latest [options]

Options:
  --help              Show this help information
  --verbose           Enable detailed logging output
  --no-backup         Skip backup creation before overwriting
  --url <url>         Custom GitHub raw URL (default: DS-Simulate/main)
  --output <file>     Output file path (default: ./tokensource.json)

Examples:
  npm run pull-latest                    # Basic pull with backup
  npm run pull-latest -- --verbose      # Detailed logging
  npm run pull-latest -- --no-backup    # Skip backup creation

This command is part of the bidirectional Token Studio ↔ DSE workflow.
Use 'npm run sync' to pull and automatically split to tokens/ directory.
`);
}

/**
 * Create backup of existing file
 */
function createBackup(filePath, verbose = false) {
  if (!fs.existsSync(filePath)) {
    if (verbose) console.log('ℹ️  No existing file to backup');
    return null;
  }

  // Ensure backup directory exists
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
    if (verbose) console.log(`📁 Created backup directory: ${BACKUP_DIR}`);
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const backupPath = path.join(BACKUP_DIR, `tokensource_backup_${timestamp}.json`);
  
  try {
    fs.copyFileSync(filePath, backupPath);
    if (verbose) console.log(`💾 Backup created: ${backupPath}`);
    return backupPath;
  } catch (error) {
    console.error(`❌ Failed to create backup: ${error.message}`);
    return null;
  }
}

/**
 * Download file from URL
 */
function downloadFile(url, outputPath, verbose = false) {
  return new Promise((resolve, reject) => {
    if (verbose) console.log(`🌐 Fetching: ${url}`);
    
    const request = https.get(url, (response) => {
      // Handle redirects
      if (response.statusCode === 301 || response.statusCode === 302) {
        const redirectUrl = response.headers.location;
        if (verbose) console.log(`🔀 Redirecting to: ${redirectUrl}`);
        return downloadFile(redirectUrl, outputPath, verbose)
          .then(resolve)
          .catch(reject);
      }

      // Handle non-200 status codes
      if (response.statusCode !== 200) {
        return reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
      }

      let data = '';
      
      response.on('data', (chunk) => {
        data += chunk;
      });

      response.on('end', () => {
        try {
          // Validate JSON before writing
          const parsed = JSON.parse(data);
          
          // Write to file
          fs.writeFileSync(outputPath, data, 'utf8');
          
          const fileSize = data.length;
          if (verbose) {
            console.log(`✅ Downloaded successfully: ${fileSize} bytes`);
            console.log(`📝 Saved to: ${outputPath}`);
          }
          
          resolve({
            size: fileSize,
            path: outputPath,
            data: parsed
          });
        } catch (error) {
          reject(new Error(`Invalid JSON response: ${error.message}`));
        }
      });
    });

    request.on('error', (error) => {
      reject(new Error(`Download failed: ${error.message}`));
    });

    // Set timeout
    request.setTimeout(30000, () => {
      request.destroy();
      reject(new Error('Download timeout after 30 seconds'));
    });
  });
}

/**
 * Validate downloaded tokensource.json
 */
function validateTokenSource(filePath, verbose = false) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(content);
    
    // Basic structure validation
    const tokenSets = Object.keys(data).filter(key => !key.startsWith('$'));
    const hasMetadata = '$metadata' in data;
    const hasThemes = '$themes' in data;
    
    if (verbose) {
      console.log('🔍 Validation Results:');
      console.log(`   📊 Token sets: ${tokenSets.length}`);
      console.log(`   📋 Metadata: ${hasMetadata ? '✅' : '❌'}`);
      console.log(`   🎨 Themes: ${hasThemes ? '✅' : '❌'}`);
      console.log(`   📏 File size: ${content.length} bytes`);
    }

    if (tokenSets.length === 0) {
      throw new Error('No token sets found in downloaded file');
    }

    return {
      tokenSets: tokenSets.length,
      hasMetadata,
      hasThemes,
      fileSize: content.length
    };
  } catch (error) {
    throw new Error(`Validation failed: ${error.message}`);
  }
}

/**
 * Main execution function
 */
async function main() {
  const args = process.argv.slice(2);
  
  // Parse command line arguments
  let verbose = false;
  let createBackupFile = true;
  let sourceUrl = GITHUB_RAW_URL;
  let outputFile = LOCAL_FILE;
  
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--help':
        showHelp();
        process.exit(0);
        break;
      case '--verbose':
        verbose = true;
        break;
      case '--no-backup':
        createBackupFile = false;
        break;
      case '--url':
        sourceUrl = args[++i];
        break;
      case '--output':
        outputFile = args[++i];
        break;
    }
  }

  try {
    console.log('🔄 Pulling latest tokensource.json from GitHub...');
    
    // Create backup if requested and file exists
    if (createBackupFile) {
      createBackup(outputFile, verbose);
    }

    // Download latest file
    const result = await downloadFile(sourceUrl, outputFile, verbose);
    
    // Validate downloaded file
    const validation = validateTokenSource(outputFile, verbose);
    
    // Success summary
    console.log('✅ Pull completed successfully!');
    console.log(`📊 ${validation.tokenSets} token sets, ${validation.fileSize} bytes`);
    
    if (verbose) {
      console.log('\n🔗 Next Steps:');
      console.log('   npm run split-latest     # Split to tokens/ directory');
      console.log('   npm run sync             # Pull + split in one command');
    }

  } catch (error) {
    console.error(`❌ Pull failed: ${error.message}`);
    process.exit(1);
  }
}

// Execute if called directly
if (require.main === module) {
  main();
}

module.exports = { downloadFile, validateTokenSource, createBackup };