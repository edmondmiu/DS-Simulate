# DSE Configuration Directory

This directory contains Design System Engineer (DSE) specific configurations that are separate from Token Studio mirror files.

## File Organization

### Core Configuration Files

- `color-library.json` - OKLCH color space configuration and accessibility thresholds
- `schema.ts` - TypeScript schema definitions and interfaces
- `validator.ts` - Configuration validation utilities
- `README.md` - This documentation file

### File Naming Conventions

- **Configuration Files**: `kebab-case.json` (e.g., `color-library.json`, `brand-overrides.json`)
- **TypeScript Files**: `camelCase.ts` (e.g., `validator.ts`, `colorUtils.ts`)
- **Schema Files**: `schema.ts` for type definitions
- **Documentation**: `README.md` for directory documentation

### Directory Structure

```
.dse/
├── README.md              # This documentation
├── schema.ts              # TypeScript schema definitions
├── validator.ts           # Configuration validation utilities
├── color-library.json     # Main OKLCH color configuration
└── [future-configs].json  # Additional DSE-specific configurations
```

## Architecture Principles

### Separation of Concerns

- **DSE Configurations** (`.dse/`) - Color management, OKLCH parameters, accessibility rules
- **Token Studio Mirror** (`tokens/`) - Pure Token Studio format files for Figma compatibility
- **Generated Output** (`tokensource.json`) - Consolidated tokens with DSE enhancements applied

### Configuration Loading Order

1. Load `.dse/color-library.json` for OKLCH and accessibility configurations
2. Process `tokens/` directory for Token Studio format tokens
3. Apply DSE configurations during consolidation
4. Output enhanced tokens to `tokensource.json`

### Validation Strategy

All `.dse/` configuration files must:
- Follow JSON schema validation
- Pass TypeScript type checking
- Validate parameter ranges and constraints
- Provide meaningful error messages for invalid configurations

## Integration with Existing Workflow

### Script Integration

The existing `consolidate.ts` and `split.ts` scripts will:
- **Read** DSE configurations from `.dse/` directory
- **Preserve** Token Studio mirror structure in `tokens/`
- **Apply** DSE enhancements during token processing
- **Maintain** backward compatibility with existing workflows

### Token Studio Compatibility

- Zero impact on existing Token Studio workflows
- `tokens/` directory remains pure Token Studio format
- Enhanced colors flow through to Token Studio without disruption
- Figma Token Studio plugin integration preserved

## Configuration Management

### Default Configurations

Each configuration file should provide sensible defaults:
- OKLCH lightness range: 15-95 for accessibility
- Chroma ranges: Primary 0.15, Neutral 0.05
- Standard WCAG thresholds: AA 4.5, AAA 7.0
- Output format: hex for broad compatibility

### Brand-Specific Overrides

Brand-specific configurations support:
- Lightness adjustments (-20 to +20)
- Chroma multipliers (0.5 to 2.0)
- Hue shifts (0-360 degrees)

### Performance Considerations

- Configuration files are loaded once at script startup
- Validation occurs during loading, not during token processing
- Cached configurations reduce repeated disk I/O
- Minimal impact on existing workflow performance

## Configuration Examples

The `examples/` directory contains various configuration templates:

- `minimal-setup.json` - Basic OKLCH support with standard settings
- `accessibility-focused.json` - Maximum accessibility compliance configuration
- `brand-variations.json` - Multi-brand setup with extensive customizations

## Troubleshooting

### Configuration Validation Issues

**Problem**: Configuration validation fails with parameter range errors
```
❌ colorLibrary.chromaRange.primary: primary must be a number between 0 and 0.4
```

**Solution**: Check parameter ranges in your configuration:
- Lightness: 0-100 (recommended 15-95)
- Chroma: 0-0.4 (primary ~0.15, neutral ~0.05)
- Accessibility: 1-21 (AA: 4.5, AAA: 7.0)

### File Loading Errors

**Problem**: Configuration file not found or invalid JSON
```
❌ Error validating file: ENOENT: no such file or directory
```

**Solution**: 
1. Verify `.dse/color-library.json` exists
2. Check JSON syntax with `npx tsx .dse/test-validation.ts`
3. Use default configuration if starting fresh

### Integration Issues

**Problem**: Scripts not recognizing DSE configuration
```
[DSE] No DSE configuration found, using standard workflow
```

**Solution**:
1. Ensure `.dse/` directory exists in project root
2. Verify `color-library.json` has correct structure
3. Check file permissions and path accessibility

### Performance Issues

**Problem**: Configuration loading impacts script performance
```
Scripts running slower after DSE integration
```

**Solution**:
1. Configuration is cached after first load
2. Reduce brand-specific configurations if not needed
3. Use minimal configuration for development environments

### Validation Testing

Test your configuration setup:
```bash
npx tsx .dse/test-validation.ts
```

Expected output:
```
🔍 Testing DSE Configuration Validation...
✅ Configuration file is valid!
✅ Configuration loader working correctly!
```