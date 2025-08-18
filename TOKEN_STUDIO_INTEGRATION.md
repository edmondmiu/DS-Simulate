# Token Studio Integration Guide

## Overview

This guide provides complete instructions for integrating the design system tokens with Figma Token Studio plugin using the two-repository architecture. Token Studio connects directly to DS-SimulateV2 for a clean, minimal integration.

## Integration Status: ✅ Two-Repo Architecture Ready

**Epic 4 V2 Results:**
- ✅ **25 color families** OKLCH optimized and ready
- ✅ **9 token files** in direct file format
- ✅ **Multi-brand support** (Base, Logifuture, Bet9ja)
- ✅ **Token Studio compatibility** via DS-SimulateV2
- ✅ **Two-repo workflow** operational
- ✅ **Clean repository** for designer workflow

## Quick Start - Two-Repo Workflow

### 1. Token Studio Plugin Setup (Designers)

1. **Install Plugin:** Add "Token Studio" to your Figma workspace
2. **Configure Source:** Select "GitHub" as token source  
3. **Add Repository URL:** 
   ```
   https://raw.githubusercontent.com/edmondmiu/DS-Simulate/main/tokensource.json
   ```
4. **Sync Tokens:** Click "Update" to import all 662 design tokens

### 2. Verify Installation

Run the validation script to confirm Token Studio compatibility:

```bash
npm run validate-token-studio
```

**Expected Results:**
- ✅ 100% success rate (12/12 validations passed)
- ✅ All 662 tokens properly formatted
- ✅ Metadata and themes configuration verified

## Token Structure

### Available Token Sets

| Token Set | Count | Description | Size (bytes) |
|-----------|-------|-------------|--------------|
| **core** | 339 | Foundation colors, typography, spacing | ~60,050 |
| **global** | 235 | Semantic tokens, component variables | ~33,067 |
| **components** | 3 | Component-specific design tokens | ~338 |
| **bet9ja dark** | 63 | Brand dark theme overrides | ~8,240 |
| **Content Typography** | 22 | Typography system definitions | ~9,787 |

**Total:** 662 tokens in 142,832 bytes tokensource.json

### Token Format Example

```json
{
  "core": {
    "Color Ramp": {
      "Amber": {
        "Amber 0500": {
          "$type": "color",
          "$value": "#ffd24d",
          "$description": "Primary CTA default (gradient end)"
        }
      }
    }
  }
}
```

## Theme Configuration

### Available Themes

#### 1. Base Dark (Default)
- **Token Sets:** core (source) + global (enabled) + components (enabled)
- **Use Case:** Default dark mode interface
- **Brand:** Generic/multi-brand foundation

#### 2. Base Light  
- **Token Sets:** core (source) + global (enabled) + global light (enabled) + components (enabled)
- **Use Case:** Light mode interface
- **Brand:** Generic/multi-brand foundation

#### 3. Bet9ja Dark
- **Token Sets:** core (source) + global (enabled) + components (enabled) + bet9ja dark (enabled)
- **Use Case:** Bet9ja brand dark mode
- **Brand:** Bet9ja specific overrides

#### 4. Bet9ja Light
- **Token Sets:** core (source) + global (enabled) + global light (enabled) + components (enabled) + bet9ja light (enabled)
- **Use Case:** Bet9ja brand light mode  
- **Brand:** Bet9ja specific overrides

### Theme Switching

1. Open Token Studio plugin
2. Navigate to "Themes" section
3. Select desired theme from dropdown
4. Click "Apply theme" to update all design elements

## Automated Workflow Integration

### Bidirectional Workflow (NEW)

#### DSE → Token Studio (Existing)
1. **DSE Updates Tokens:** Design System Engineer modifies `tokens/` directory
2. **Git Push:** Changes pushed to `main` branch trigger automation
3. **CI/CD Processing:** GitHub Actions runs consolidation (~2 minutes)
4. **Auto-Update:** `tokensource.json` updated automatically
5. **Token Studio Sync:** Plugin detects changes via raw GitHub URL
6. **Live Updates:** Designers receive token changes in Figma

#### Token Studio → DSE (NEW)
1. **Designer Updates:** Designer modifies tokens in Token Studio
2. **Token Studio Push:** Plugin pushes changes to GitHub `tokensource.json`
3. **Auto-Split:** GitHub Actions automatically splits to `tokens/` directory
4. **DSE Sync:** DSE runs `npm run sync` to pull latest changes
5. **Local Editing:** DSE can continue editing with latest designer changes
6. **Collaborative Flow:** Both sides stay in sync automatically

### Sync Performance

- **Initial Import:** ~60 seconds for 662 tokens (142,832 bytes)
- **Update Detection:** 2-5 minutes after DSE push to `main`
- **Theme Switching:** <5 seconds in Figma
- **Network Requirements:** Stable internet for GitHub raw URL access

## Token Application Examples

### Colors
```
Apply {core.Color Ramp.Amber.Amber 0500} to button background
Apply {global.primary.500} to primary action elements
Apply {bet9ja dark.brand.Primary.400} for brand-specific buttons
```

### Typography
```
Apply {global.header.h1} to semantic headings
Apply {global.body.default} to semantic body text
Apply {global.label.default} to semantic form labels
Apply {Content Typography.header.h1} to content-specific headings
```

### Spacing  
```
Apply {global.spacing.md} to component padding
Apply {global.spacing.xl} to section margins
Apply {global.spacing.2xs} to micro-spacing
```

## Troubleshooting

### Common Issues

#### 1. Plugin Connection Failed
**Symptoms:** Token Studio cannot connect to GitHub URL
**Solutions:**
- Verify internet connection
- Check GitHub repository is public
- Confirm raw URL: `https://raw.githubusercontent.com/edmondmiu/DS-Simulate/main/tokensource.json`
- Test URL in browser (should show JSON content)

#### 2. Tokens Not Loading
**Symptoms:** Plugin connected but no tokens visible
**Solutions:**
- Check tokensource.json file size (should be ~142,832 bytes)
- Run validation: `npm run validate-token-studio`
- Verify JSON structure in browser
- Try "Force sync" in Token Studio plugin

#### 3. Missing Token References
**Symptoms:** Some tokens show as missing or broken references
**Solutions:**
- Check consolidation warnings: `npm run consolidate --verbose`
- Verify all referenced tokens exist in source files
- Run round-trip test: `npm run validate-workflow`

#### 4. Theme Not Applying  
**Symptoms:** Theme selection doesn't change design elements
**Solutions:**
- Verify elements use token references (not hardcoded values)
- Check theme configuration in Token Studio
- Ensure token sets are properly enabled/disabled for theme
- Re-apply theme after token updates

### Validation Commands

```bash
# Complete Token Studio validation
npm run validate-token-studio

# Workflow validation (includes Token Studio compatibility)
npm run validate-workflow

# Rebuild tokens with latest changes
npm run consolidate --verbose

# Test complete pipeline integrity
npm test
```

### Debug Information

**Log File Locations:**
- Consolidation warnings: Console output from `npm run consolidate --verbose`
- CI/CD logs: GitHub Actions workflow runs
- Token validation: `npm run validate-token-studio` output

**Key Metrics to Monitor:**
- File size: `tokensource.json` should be ~142,832 bytes
- Token count: 662 total tokens across 5 sets
- Theme count: 4 themes properly configured
- Validation success rate: 100% (12/12 tests passing)

## Advanced Configuration

### Adding New Brands

1. **Create Brand Token Set:** Add `{brand-name} dark.json` and `{brand-name} light.json`
2. **Update Metadata:** Add token sets to `tokens/$metadata.json` tokenSetOrder
3. **Configure Themes:** Add theme configurations to `tokens/$themes.json`
4. **Test Integration:** Run `npm run validate-token-studio`
5. **Deploy:** Push changes to trigger CI/CD automation

### Custom Token Types

The system supports all Token Studio token types:
- **Colors:** Hex, RGB, HSL values
- **Typography:** Font families, sizes, weights, line heights
- **Spacing:** Pixel, rem, percentage values  
- **Dimensions:** Width, height, border radius
- **Shadows:** Box shadows with multiple layers
- **Border:** Border styles, widths, colors

### Performance Optimization

- **Token Organization:** Group related tokens for better plugin performance
- **Reference Optimization:** Minimize deep token reference chains
- **Theme Efficiency:** Use selective token set enabling for faster theme switching
- **Network Caching:** GitHub raw URL is cached for improved loading

## Integration Checklist

### Pre-Launch Validation
- [ ] All 662 tokens load correctly in Token Studio
- [ ] 4 themes switch properly without errors  
- [ ] Token references resolve correctly in designs
- [ ] Automated CI/CD workflow tested with sample changes
- [ ] Performance acceptable for design team workflow
- [ ] Documentation accessible to all designers

### Ongoing Maintenance
- [ ] Monitor CI/CD workflow for consolidation errors
- [ ] Validate token references after major changes
- [ ] Test theme switching after brand additions
- [ ] Update documentation for new team members
- [ ] Performance monitoring for large token sets

## Support and Resources

### Documentation Links
- **GitHub Repository:** https://github.com/edmondmiu/DS-Simulate
- **Raw Token URL:** https://raw.githubusercontent.com/edmondmiu/DS-Simulate/main/tokensource.json
- **Token Studio Plugin:** Available in Figma Community
- **GitHub Actions:** Automated workflow in `.github/workflows/update-tokens.yml`

### Validation Commands Reference
```bash
npm run validate-token-studio    # Token Studio compatibility check
npm run validate-workflow        # Complete system validation  
npm run consolidate --verbose    # Regenerate tokens with logging
npm run sync                     # Pull latest from GitHub + split to tokens/
npm run pull-latest              # Pull latest tokensource.json only
npm test                        # Full test suite (11/11 tests)
npm run build                   # Compile TypeScript sources
npm run lint                    # Code quality validation
```

### Team Workflow
1. **DSEs:** Use validation commands before pushing token changes
2. **Designers:** Sync Token Studio plugin after receiving update notifications
3. **DevOps:** Monitor GitHub Actions for automation failures
4. **QA:** Verify token changes in both Token Studio and final designs

---

**Integration Status:** ✅ Production Ready  
**Last Updated:** 2025-08-07  
**Version:** Story 2.4 completion  
**Token Count:** 662 tokens across 5 sets