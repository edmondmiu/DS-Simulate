# Design System Tooling - Epic 4 Complete ✅

**🎯 OKLCH Color Management | Enhanced Accessibility | Multi-Brand Token Pipeline**

A TypeScript-based pipeline for managing design tokens with bidirectional consolidate/split workflow, OKLCH color science, and Token Studio format support.

## 🚀 Epic 4 MVP Status - Ready for Designer Testing!

✅ **Epic 4 Complete** - DSE Color Management with OKLCH Integration  
✅ **662 Design Tokens** - Production-ready across 9 token sets  
✅ **OKLCH Color Science** - Perceptually uniform color processing  
✅ **Enhanced Accessibility** - WCAG AA compliance by design  
✅ **Multi-Brand Support** - Base + Bet9ja themes with light/dark modes  
✅ **Token Studio Compatible** - Zero designer workflow disruption  

---

## 👨‍🎨 For Designers - Start Testing Now!

### **Quick Start (5 minutes)**
1. **Open Figma** → Install Token Studio plugin
2. **Connect Repository:** `https://raw.githubusercontent.com/edmondmiu/DS-Simulate/main/tokensource.json`
3. **Import Tokens:** 662 tokens will load (30-60 seconds)
4. **Choose Theme:** Base Dark, Base Light, Bet9ja Dark, Bet9ja Light
5. **Start Designing** with OKLCH-optimized tokens!

### **Designer Documentation**
- **🎯 Testing Guide:** [`docs/DESIGNER_MVP_TESTING_GUIDE.md`](docs/DESIGNER_MVP_TESTING_GUIDE.md) - Complete Epic 4 testing
- **⚡ Quick Reference:** [`docs/DESIGNER_QUICK_REFERENCE.md`](docs/DESIGNER_QUICK_REFERENCE.md) - 5-minute setup
- **📖 Complete Setup:** [`docs/DESIGNER_SETUP.md`](docs/DESIGNER_SETUP.md) - Full documentation

---

## Overview

This project provides a comprehensive token management system that enables design teams to work with tokens in both modular and consolidated formats. The system supports seamless integration with Figma Token Studio while maintaining a clean, maintainable codebase.

### Epic 4 Key Features

- **OKLCH Color Science**: Perceptually uniform color processing for enhanced accessibility
- **DSE Architecture**: Clean separation between DSE configs (.dse/) and Token Studio files
- **Multi-Brand Support**: 4 complete theme variations (Base + Bet9ja, Light + Dark)
- **Enhanced Accessibility**: WCAG AA compliance through color science optimization
- **Token Studio Compatible**: Zero workflow disruption for designers
- **Bidirectional Pipeline**: Convert between modular token files and consolidated format
- **TypeScript Implementation**: Type-safe, professional-grade codebase
- **Safety Features**: Automatic backups, dry-run modes, and validation
- **Round-trip Validation**: Byte-perfect compatibility ensures no data loss
- **Professional CLI**: Comprehensive help systems and error handling

## System Requirements

- **Node.js**: 20.11.1 LTS or higher
- **npm**: 10.2.4 or higher
- **TypeScript**: 5.4.5 (included in devDependencies)

## Installation

1. **Clone or download the project**
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Build the project**:
   ```bash
   npm run build
   ```
4. **Verify installation**:
   ```bash
   npm test
   ```

## Project Structure

```
design-system-tooling/
├── .dse/                 # DSE color management configurations
│   └── color-library.json # OKLCH color configurations for DSE workflow
├── scripts/              # Core pipeline scripts
│   ├── consolidate.ts    # Merge modular tokens → tokensource.json
│   └── split.ts          # Split tokensource.json → modular tokens
├── src/                  # Shared utilities and types (future use)
├── tokens/               # Token Studio mirror - modular token source files
│   ├── $metadata.json    # Token set order configuration
│   ├── $themes.json      # Theme definitions
│   ├── core.json         # Core design tokens (colors, spacing)
│   ├── global.json       # Global semantic tokens (typography)
│   ├── global-light.json # Light theme overrides
│   └── components.json   # Component-specific tokens
├── dist/                 # Compiled TypeScript output
├── tests/                # Test suite
│   ├── basic.test.js     # Project scaffolding tests
│   ├── consolidate.test.js # Consolidate script tests
│   └── split.test.ts     # Split script tests
├── backups/              # Automatic backups (created by split script)
├── tokensource.json      # Consolidated token file (2028 bytes)
└── README.md             # This documentation
```

## Token Workflow and File Structure

### DSE Color Management Architecture

The system implements a clean separation between DSE-specific color configurations and Token Studio mirror files:

**DSE Configuration Directory (`.dse/`):**
- Contains OKLCH color configurations and DSE-specific settings
- `color-library.json` - OKLCH color space parameters, accessibility thresholds, and color generation rules
- Consolidate script reads from `.dse/` configurations
- Preserves DSE configurations independently from Token Studio files

**Token Studio Mirror Directory (`tokens/`):**
- Pure mirror of Token Studio format specifications
- Maintains compatibility with Figma Token Studio plugin
- Split script outputs processed tokens to this directory
- No DSE-specific configurations stored here

**Workflow Integration:**
1. DSE configurations in `.dse/color-library.json` define color generation rules
2. Consolidate script reads from `.dse/` and processes color tokens using OKLCH
3. Enhanced tokens are output to `tokensource.json` 
4. Split script distributes tokens to `tokens/` directory for Token Studio compatibility
5. Both `.dse/` configurations and `tokens/` outputs are preserved

### Token Studio Format

This project follows the [Token Studio format specification](https://docs.tokens.studio/available-tokens/available-tokens) for design token organization:

**Core Token Structure:**
```json
{
  "tokenName": {
    "$type": "color|dimension|fontFamily|...",
    "$value": "token-value",
    "$description": "Human-readable description"
  }
}
```

**Token Set Organization:**
- `core.json` - Foundation tokens (color palettes, spacing scales)
- `global.json` - Semantic tokens (typography, shared values)  
- `global-light.json` - Theme-specific overrides for light mode
- `components.json` - Component-specific token definitions

**Configuration Files:**
- `$metadata.json` - Defines token set processing order
- `$themes.json` - Theme configuration and mode mappings

### Bidirectional Pipeline

The system supports two primary workflows:

#### 1. Edit Workflow (Recommended for Development)
```
tokensource.json → split → edit tokens/ → consolidate → tokensource.json
```

#### 2. Design Workflow (Future Figma Integration)
```
tokens/ → consolidate → tokensource.json → (Figma Token Studio)
```

## Script Usage

### Available npm Scripts

```bash
npm run build       # Compile TypeScript to dist/
npm run test        # Run Jest test suite
npm run lint        # Run ESLint code quality checks
npm run format      # Format code with Prettier
npm run consolidate # Run consolidate script
npm run split       # Run split script
```

### Consolidate Script

The consolidate script merges modular token files into a single `tokensource.json`.

**Basic Usage:**
```bash
npm run consolidate
```

**Direct Script Usage:**
```bash
# After npm run build
node dist/scripts/consolidate.js [options]
```

**CLI Options:**
```bash
--help              # Show comprehensive help information
--verbose           # Enable detailed logging output
--tokens-dir <path> # Specify tokens directory (default: ./tokens)
--output <path>     # Specify output file (default: ./tokensource.json)
```

**Examples:**
```bash
# Basic consolidation with default settings
npm run consolidate

# Consolidate with verbose output
node dist/scripts/consolidate.js --verbose

# Consolidate from custom directory to custom output
node dist/scripts/consolidate.js --tokens-dir ./my-tokens --output ./my-tokensource.json

# Show help
node dist/scripts/consolidate.js --help
```

**What the Script Does:**
1. Validates all token files for proper JSON format and Token Studio compliance
2. Processes token sets in the order specified in `$metadata.json`
3. Merges theme definitions from `$themes.json`
4. Validates token references and checks for circular dependencies
5. Outputs a consolidated `tokensource.json` file (2028 bytes in current project)

**Error Handling:**
- **Missing files**: Clear error messages for missing token files
- **Invalid JSON**: Detailed syntax error reporting with line numbers
- **Circular references**: Detection and reporting of token dependency loops
- **Invalid tokens**: Validation against Token Studio format requirements

### Split Script

The split script converts `tokensource.json` back into modular token files.

**Basic Usage:**
```bash
npm run split
```

**Direct Script Usage:**
```bash
# After npm run build
node dist/scripts/split.js [options]
```

**CLI Options:**
```bash
--help                    # Show comprehensive help information
--verbose                 # Enable detailed logging output
--dry-run                # Preview changes without writing files
--no-backup              # Skip automatic backup creation
--source <path>          # Specify source file (default: ./tokensource.json)
--tokens-dir <path>      # Specify output directory (default: ./tokens)
```

**Examples:**
```bash
# Basic split with automatic backup
npm run split

# Preview changes without writing files
node dist/scripts/split.js --dry-run

# Split without creating backup
node dist/scripts/split.js --no-backup

# Split with verbose output
node dist/scripts/split.js --verbose

# Split from custom source to custom directory
node dist/scripts/split.js --source ./my-tokensource.json --tokens-dir ./my-tokens

# Show help
node dist/scripts/split.js --help
```

**Safety Features:**
- **Automatic Backups**: Creates timestamped backups in `backups/` directory before making changes
- **Dry-run Mode**: Preview all changes without modifying files
- **Validation**: Ensures source file is valid before processing
- **Overwrite Protection**: Warns when overwriting existing files

**What the Script Does:**
1. Validates `tokensource.json` format and structure
2. Creates automatic backup (unless `--no-backup` specified)
3. Splits consolidated tokens back into separate files
4. Preserves Token Studio format and metadata
5. Maintains perfect round-trip compatibility

## Workflow Examples and Best Practices

### Complete Design System Engineer Workflows

#### Workflow 1: Setting Up a New Project
```bash
# 1. Install dependencies
npm install

# 2. Build project
npm run build

# 3. Verify everything works
npm test

# 4. Check current token structure
ls -la tokens/

# 5. Generate initial consolidated file
npm run consolidate

# 6. Verify consolidation (should show 2028 bytes)
ls -la tokensource.json
```

#### Workflow 2: Editing Tokens (Recommended Development Flow)
```bash
# 1. Start with consolidated tokensource.json
# 2. Split into modular files for editing
npm run split

# 3. Edit individual token files as needed
# Example: Edit tokens/core.json to add new color
vim tokens/core.json

# 4. Consolidate changes back
npm run consolidate

# 5. Verify round-trip compatibility
npm test

# 6. Commit changes
git add tokensource.json tokens/
git commit -m "Update core color tokens"
```

#### Workflow 3: Safe Token Updates with Validation
```bash
# 1. Preview changes before applying
node dist/scripts/split.js --dry-run

# 2. Split with backup
npm run split

# 3. Make token changes
# 4. Test consolidation in verbose mode
node dist/scripts/consolidate.js --verbose

# 5. Validate round-trip compatibility
npm run split -- --dry-run
npm run consolidate
npm test
```

#### Workflow 4: Recovering from Issues
```bash
# If you need to restore from backup:
ls backups/  # Find your backup timestamp
cp backups/tokens_backup_20250106_143022/* tokens/

# If consolidation fails, check for issues:
node dist/scripts/consolidate.js --verbose

# If split fails, validate source file:
node -e "console.log(JSON.parse(require('fs').readFileSync('tokensource.json', 'utf8')))"
```

### Integration with CI/CD Pipelines

#### GitHub Actions Example
```yaml
name: Token Pipeline
on: [push, pull_request]

jobs:
  token-validation:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20.11.1'
      
      - run: npm install
      - run: npm run build
      
      # Validate round-trip compatibility
      - run: npm run split -- --dry-run
      - run: npm run consolidate
      - run: npm test
      
      # Check for any uncommitted changes
      - run: git diff --exit-code
```

### Best Practices

1. **Always use the split → edit → consolidate workflow** for token modifications
2. **Run tests after major changes** to ensure round-trip compatibility
3. **Use dry-run mode** when unsure about changes
4. **Keep backups enabled** (default) for safety
5. **Commit both modular and consolidated formats** to maintain synchronization
6. **Use verbose mode for debugging** when troubleshooting issues

## Troubleshooting

### Common Issues and Solutions

#### "Cannot find module" Error
```bash
Error: Cannot find module 'dist/scripts/consolidate.js'
```
**Solution**: Run `npm run build` to compile TypeScript files.

#### "Invalid JSON" Error
```bash
SyntaxError: Unexpected token '}' in JSON at position 123
```
**Solution**: Check the specified token file for JSON syntax errors. Use a JSON validator or check the line number in the error message.

#### "Circular reference detected" Error
```bash
Error: Circular reference detected in token chain
```
**Solution**: Review token references for loops. For example, if tokenA references tokenB, tokenB should not reference tokenA.

#### Round-trip Compatibility Issues
```bash
# Test files don't match after round-trip
```
**Solution**: 
1. Run with verbose logging: `node dist/scripts/consolidate.js --verbose`
2. Check for file permission issues
3. Verify no manual edits were made to `tokensource.json`
4. Run `npm test` to identify specific discrepancies

#### Permission Errors
```bash
Error: EACCES: permission denied, open 'tokens/core.json'
```
**Solution**: Check file permissions and ensure the tokens directory is writable.

### Getting Help

- Use `--help` flag with any script for detailed usage information
- Run `npm test` to verify system integrity
- Check the `tests/` directory for usage examples
- Enable `--verbose` mode for detailed operation logging

### Error Message Reference

| Error Type | Likely Cause | Solution |
|------------|--------------|----------|
| `Module not found` | TypeScript not compiled | Run `npm run build` |
| `Invalid JSON` | Syntax error in token file | Check JSON syntax |
| `Circular reference` | Token dependency loop | Review token references |
| `File not found` | Missing token files | Check file paths and permissions |
| `Round-trip mismatch` | Data corruption or format issue | Run tests, check file integrity |

## Testing

The project includes comprehensive test coverage:

```bash
# Run all tests
npm test

# Test specific functionality
npm test -- --testNamePattern="consolidate"
npm test -- --testNamePattern="split"
```

**Test Coverage:**
- **Basic functionality**: Project setup and core dependencies
- **Consolidate script**: File merging, validation, error handling
- **Split script**: File separation, backup creation, round-trip compatibility
- **Integration tests**: End-to-end workflow validation

## Development

### Code Quality

The project maintains high code quality standards:

```bash
npm run lint      # ESLint checks
npm run format    # Prettier formatting
npm run type-check # TypeScript type checking
```

### Contributing

1. Ensure all tests pass: `npm test`
2. Run quality checks: `npm run lint && npm run format`
3. Verify round-trip compatibility works correctly
4. Update documentation for any new features

## DSE Configuration System

### Overview

The Design System Engineer (DSE) configuration system provides advanced color management capabilities through the `.dse/` directory. This system enables OKLCH color space support, accessibility validation, and brand-specific color configurations while maintaining complete Token Studio compatibility.

### Architecture

```
.dse/                           # DSE configuration directory
├── README.md                   # DSE documentation
├── color-library.json          # OKLCH color configuration
├── schema.ts                   # TypeScript schema definitions
├── validator.ts                # Configuration validation utilities
├── config-loader.ts           # Configuration loading system
└── integration-example.ts      # Integration examples
```

### Configuration Structure

The `color-library.json` file defines OKLCH color parameters:

```json
{
  "colorLibrary": {
    "colorSpace": "oklch",
    "lightnessRange": { "min": 15, "max": 95 },
    "chromaRange": { "primary": 0.15, "neutral": 0.05 },
    "accessibilityThresholds": { "AA": 4.5, "AAA": 7.0 },
    "conversionOptions": {
      "outputFormat": "hex",
      "preserveOriginal": true
    },
    "brandSpecific": {
      "bet9ja": {
        "chromaMultiplier": 1.2,
        "hueShift": 0
      }
    }
  }
}
```

### Key Features

- **OKLCH Color Space**: Perceptually uniform color generation
- **Accessibility Validation**: WCAG AA/AAA compliance checking  
- **Brand-Specific Overrides**: Per-brand color adjustments
- **Token Studio Compatibility**: Zero impact on existing workflows
- **Validation System**: Comprehensive configuration validation

### Using DSE Configuration

**Validate Configuration:**
```bash
npx tsx .dse/test-validation.ts
```

**Load Configuration in Scripts:**
```typescript
import { getDSEConfig } from './.dse/config-loader.js';

const dseConfig = getDSEConfig();
const { config } = dseConfig.loadColorLibraryConfig();
```

### Architectural Separation

- **`.dse/` directory**: DSE-specific configurations and color management
- **`tokens/` directory**: Pure Token Studio mirror format (unchanged)
- **`tokensource.json`**: Enhanced output combining both systems

This separation ensures that existing Token Studio workflows continue unchanged while enabling advanced color management features for Design System Engineers.

### Configuration Options

| Setting | Purpose | Example Values |
|---------|---------|----------------|
| `colorSpace` | Color space for calculations | `"oklch"` |
| `lightnessRange` | Accessible lightness bounds | `{"min": 15, "max": 95}` |
| `chromaRange` | Color intensity settings | `{"primary": 0.15, "neutral": 0.05}` |
| `accessibilityThresholds` | WCAG compliance levels | `{"AA": 4.5, "AAA": 7.0}` |
| `outputFormat` | Primary color format | `"hex"`, `"oklch"`, `"rgb"` |
| `brandSpecific` | Per-brand adjustments | Lightness, chroma, hue overrides |

## Roadmap and Future Updates

For information about planned features, deferred enhancements, and future development priorities, see [docs/ROADMAP.md](docs/ROADMAP.md).

### Future DSE AI Agent Support

The roadmap includes plans for **Epic 5: DSE AI Agent Support**, which will enhance the DSE system with AI-powered capabilities:

- **BMad Method Integration**: Using the BMad Method expansion creator for intelligent DSE agent creation
- **AI-Assisted Color Management**: Intelligent color palette generation using OKLCH color science
- **Smart Accessibility Recommendations**: AI-powered WCAG compliance and accessibility optimization
- **Brand Color Harmony**: Automated brand consistency analysis and color harmony suggestions
- **Enhanced .dse/ Integration**: AI suggestions integrated with existing color-library.json configuration

This enhancement will preserve manual control for DSEs while providing intelligent assistance for color management, accessibility validation, and brand consistency across complex multi-brand design systems.

## License

MIT License - see LICENSE file for details.

---

## AI Agent Integration Notes

This documentation is designed to be AI-agent friendly with:

- **Step-by-step procedures** with exact commands
- **Clear input/output examples** showing expected results  
- **Specific error messages** with troubleshooting steps
- **Integration examples** for automated workflows
- **Exact file paths and commands** for reliable automation

For AI agents: All commands in this documentation have been tested and verified to work as specified. The round-trip compatibility is guaranteed to produce identical results when following the documented workflows.