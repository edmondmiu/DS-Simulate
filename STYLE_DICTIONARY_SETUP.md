# Style Dictionary Setup Guide

**Epic 3.1: Developer Consumption Pipeline - Style Dictionary Integration**

## Overview

Style Dictionary is now installed and configured to transform design tokens into platform-specific formats for developers.

## Installation Status ✅

- **Style Dictionary 4.0.0** - Installed and configured
- **Configuration**: `style-dictionary.config.cjs` (CommonJS format)
- **Input**: Token JSON files
- **Outputs**: CSS Custom Properties and Dart class constants

## Current Configuration

### Input Sources
- `tokens-simple.json` - Simplified token structure for testing
- Future: `tokensource.json` - Full Epic 2 token source (requires reference resolution)

### Output Platforms

**CSS (Web Developers)**
- **Location**: `dist/css/tokens.css`
- **Format**: CSS Custom Properties in `:root`
- **Transform Group**: `css` (hex colors, rem units, kebab-case naming)

**Dart (Flutter Developers)**
- **Location**: `dist/dart/tokens.dart`
- **Format**: Dart class with static constants
- **Class Name**: `DesignTokens`
- **Transform Group**: `flutter-separate` (Color objects, double values)

## Usage Commands

```bash
# Build tokens for all platforms
npm run build:tokens

# Build and validate token generation
npm run validate-tokens

# Direct Style Dictionary CLI (with config)
npx style-dictionary build --config style-dictionary.config.cjs
```

## Generated Output Examples

### CSS Output (`dist/css/tokens.css`)
```css
:root {
  --color-primary-500: #ffd24d; /* Primary brand color */
  --color-primary-600: #ffdf80; /* Primary brand color hover */
  --color-neutral-000: #272a2f; /* Darkest neutral */
  --spacing-base: 8px; /* Base spacing unit */
}
```

### Dart Output (`dist/dart/tokens.dart`)
```dart
import 'dart:ui';

class DesignTokens {
    DesignTokens._();
    
    static const colorPrimary500 = Color(0xFFFFD24D); /* Primary brand color */
    static const colorPrimary600 = Color(0xFFFFDF80); /* Primary brand color hover */
    static const colorNeutral000 = Color(0xFF272A2F); /* Darkest neutral */
    static const spacingBase = 128.00; /* Base spacing unit */
}
```

## Integration Status

### ✅ Completed (Epic 3.1)
- Style Dictionary 4.0.0 installation
- Basic configuration for CSS and Dart platforms  
- NPM script integration
- Simple token processing (colors, spacing)
- Build pipeline validation

### 🔄 Next Steps (Epic 3.2+)
- **Token Reference Resolution**: Handle complex `{token.reference}` syntax from tokensource.json
- **Full Token Set Processing**: Integrate complete Epic 2 token structure
- **Advanced Transforms**: Typography, shadows, and component tokens
- **CI/CD Integration**: Automate token builds on source changes

## Configuration Details

### File Structure
```
├── style-dictionary.config.cjs      # Main configuration
├── tokens-simple.json               # Test token source
├── dist/
│   ├── css/tokens.css               # CSS output
│   └── dart/tokens.dart             # Dart output
└── package.json                     # NPM scripts
```

### Known Limitations
- **Reference Resolution**: Current tokensource.json contains 576 unresolved references
- **Typography Tokens**: Complex composite tokens need custom handling
- **Brand Variants**: Multi-brand token sets require advanced configuration

## Technical Notes

### Node.js Compatibility
- **Required**: Node.js ≥20.11.1 (current: 24.3.0) ✅
- **Module System**: CommonJS config (.cjs) required due to ES modules in package.json

### Transform Groups
- **CSS**: Handles colors (#hex), dimensions (px/rem), names (kebab-case)
- **Flutter**: Handles colors (Color objects), dimensions (double), names (camelCase)

### Build Performance
- **Current**: <1 second for simple tokens
- **Expected**: <30 seconds for full tokensource.json (after reference resolution)

## Troubleshooting

### Common Issues
1. **"module is not defined"** → Use `.cjs` extension for config file
2. **"Cannot find config file"** → Specify `--config style-dictionary.config.cjs`
3. **Reference Errors** → Use simple token structure without `{references}` for now

### Validation Commands
```bash
# Check Style Dictionary installation
npx style-dictionary --version

# Validate configuration syntax
node -c style-dictionary.config.cjs

# Check output files exist
ls -la dist/css/ dist/dart/
```

---

**Epic 3.1 Status: ✅ COMPLETE**

Style Dictionary foundation is established and ready for Epic 3.2 (Web CSS Transform) and Epic 3.3 (Mobile Dart Transform) enhancements.