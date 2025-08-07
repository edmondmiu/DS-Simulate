const fs = require('fs');
const path = require('path');
const os = require('os');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

describe('Consolidate Script Integration', () => {
  let tempDir;
  let tokensDir;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'consolidate-test-'));
    tokensDir = path.join(tempDir, 'tokens');
    fs.mkdirSync(tokensDir);
  });

  afterEach(() => {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  const copyFixture = (filename) => {
    const sourcePath = path.join(__dirname, 'fixtures', filename);
    const destPath = path.join(tokensDir, filename.replace('test-', '').replace('metadata', '$metadata').replace('themes', '$themes'));
    fs.copyFileSync(sourcePath, destPath);
  };

  const setupValidTokens = () => {
    copyFixture('test-metadata.json');
    copyFixture('test-themes.json');
    copyFixture('test-core.json');
    copyFixture('test-global.json');
    copyFixture('test-components.json');
  };

  test('should consolidate tokens correctly', async () => {
    setupValidTokens();
    
    const outputFile = path.join(tempDir, 'tokensource.json');
    
    // Run the actual consolidate script
    const { stdout, stderr } = await execAsync(
      `cd "${process.cwd()}" && npm run build && node dist/scripts/consolidate.js --tokens-dir "${tokensDir}" --output "${outputFile}" --verbose`
    );
    
    expect(stderr).toBe('');
    expect(stdout).toContain('Token consolidation completed successfully');
    
    // Verify output file exists and has correct structure
    expect(fs.existsSync(outputFile)).toBe(true);
    
    const content = fs.readFileSync(outputFile, 'utf8');
    const consolidated = JSON.parse(content);
    
    // Check structure
    expect(Object.keys(consolidated)).toEqual(['core', 'global', 'components']);
    
    // Check core tokens
    expect(consolidated.core.color.primary.$value).toBe('#007bff');
    expect(consolidated.core.color.primary.$type).toBe('color');
    
    // Check reference tokens
    expect(consolidated.global.colors.text.$value).toBe('{color.primary}');
    expect(consolidated.components.button.background.$value).toBe('{color.primary}');
    
  }, 15000); // 15 second timeout for build + execution

  test('should handle missing metadata file', async () => {
    copyFixture('test-themes.json');
    copyFixture('test-core.json');
    // Don't copy metadata file
    
    const outputFile = path.join(tempDir, 'tokensource.json');
    
    try {
      await execAsync(
        `cd "${process.cwd()}" && npm run build && node dist/scripts/consolidate.js --tokens-dir "${tokensDir}" --output "${outputFile}"`
      );
      throw new Error('Should have thrown an error');
    } catch (error) {
      expect(error.stderr).toContain('Required files missing');
    }
  });

  test('should show help message', async () => {
    const { stdout } = await execAsync(
      `cd "${process.cwd()}" && npm run build && node dist/scripts/consolidate.js --help`
    );
    
    expect(stdout).toContain('Usage: consolidate [options]');
    expect(stdout).toContain('--tokens-dir');
    expect(stdout).toContain('--output');
    expect(stdout).toContain('--verbose');
  });
});