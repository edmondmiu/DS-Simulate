const fs = require('fs');
const path = require('path');
const os = require('os');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

describe('Split Script Integration', () => {
  let tempDir;
  let tokensDir;
  let sourceFile;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'split-test-'));
    tokensDir = path.join(tempDir, 'tokens');
    sourceFile = path.join(tempDir, 'tokensource.json');
  });

  afterEach(() => {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  const copyFixture = (filename, destFilename) => {
    const sourcePath = path.join(__dirname, 'fixtures', filename);
    const destPath = path.join(tempDir, destFilename || filename.replace('test-', ''));
    fs.copyFileSync(sourcePath, destPath);
  };

  const setupValidTokenSource = () => {
    copyFixture('test-tokensource.json', 'tokensource.json');
  };

  test('should split tokens correctly', async () => {
    setupValidTokenSource();
    
    // Run the actual split script
    const { stdout, stderr } = await execAsync(
      `cd "${process.cwd()}" && npm run build && node dist/scripts/split.js --source "${sourceFile}" --tokens-dir "${tokensDir}" --verbose --no-backup`
    );
    
    expect(stderr).toBe('');
    expect(stdout).toContain('Token splitting completed successfully');
    
    // Verify individual token files were created
    expect(fs.existsSync(path.join(tokensDir, 'core.json'))).toBe(true);
    expect(fs.existsSync(path.join(tokensDir, 'global.json'))).toBe(true);
    expect(fs.existsSync(path.join(tokensDir, 'global-light.json'))).toBe(true);
    expect(fs.existsSync(path.join(tokensDir, 'components.json'))).toBe(true);
    expect(fs.existsSync(path.join(tokensDir, '$metadata.json'))).toBe(true);
    expect(fs.existsSync(path.join(tokensDir, '$themes.json'))).toBe(true);
    
    // Verify file contents
    const coreTokens = JSON.parse(fs.readFileSync(path.join(tokensDir, 'core.json'), 'utf8'));
    expect(coreTokens.color.primary.$value).toBe('#007bff');
    expect(coreTokens.color.primary.$type).toBe('color');
    
    const globalTokens = JSON.parse(fs.readFileSync(path.join(tokensDir, 'global.json'), 'utf8'));
    expect(globalTokens.colors.text.$value).toBe('{core.color.primary}');
    
    const metadata = JSON.parse(fs.readFileSync(path.join(tokensDir, '$metadata.json'), 'utf8'));
    expect(metadata.tokenSetOrder).toEqual(['core', 'global', 'global-light', 'components']);
    
  }, 15000);

  test('should handle missing source file', async () => {
    try {
      await execAsync(
        `cd "${process.cwd()}" && npm run build && node dist/scripts/split.js --source "${sourceFile}" --tokens-dir "${tokensDir}"`
      );
      throw new Error('Should have thrown an error');
    } catch (error) {
      expect(error.stderr).toContain('Source file not found');
    }
  });

  test('should show help message', async () => {
    const { stdout } = await execAsync(
      `cd "${process.cwd()}" && npm run build && node dist/scripts/split.js --help`
    );
    
    expect(stdout).toContain('Usage: split [options]');
    expect(stdout).toContain('--source');
    expect(stdout).toContain('--tokens-dir');
    expect(stdout).toContain('--dry-run');
    expect(stdout).toContain('--no-backup');
  });

  test('should work in dry-run mode', async () => {
    setupValidTokenSource();
    
    const { stdout, stderr } = await execAsync(
      `cd "${process.cwd()}" && npm run build && node dist/scripts/split.js --source "${sourceFile}" --tokens-dir "${tokensDir}" --dry-run --verbose`
    );
    
    expect(stderr).toBe('');
    expect(stdout).toContain('DRY RUN MODE');
    expect(stdout).toContain('[DRY RUN] Would write core.json');
    expect(stdout).toContain('[DRY RUN] Would write global.json');
    
    // No files should be created in dry-run mode
    expect(fs.existsSync(tokensDir)).toBe(false);
  });

  test('should perform perfect round-trip with consolidate', async () => {
    // First, use the project's actual tokensource.json
    const projectTokensource = path.join(process.cwd(), 'tokensource.json');
    fs.copyFileSync(projectTokensource, sourceFile);
    
    // Split it
    await execAsync(
      `cd "${process.cwd()}" && npm run build && node dist/scripts/split.js --source "${sourceFile}" --tokens-dir "${tokensDir}" --no-backup`
    );
    
    // Consolidate it back
    const newSourceFile = path.join(tempDir, 'new-tokensource.json');
    await execAsync(
      `cd "${process.cwd()}" && npm run build && node dist/scripts/consolidate.js --tokens-dir "${tokensDir}" --output "${newSourceFile}"`
    );
    
    // Compare original and round-trip results
    const original = JSON.parse(fs.readFileSync(sourceFile, 'utf8'));
    const roundTrip = JSON.parse(fs.readFileSync(newSourceFile, 'utf8'));
    
    expect(roundTrip).toEqual(original);
    
  }, 20000);
});