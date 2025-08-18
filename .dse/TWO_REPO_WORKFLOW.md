# Two-Repo Design System Workflow

## Architecture Overview

**Design Decision**: After Epic 4 V2 completion, we discovered Token Studio cannot push to complex repositories (403MB, 31K+ files). Solution: Split into two repositories with clear separation of concerns.

### Repository Roles

#### DS-SimulateV2 (Clean Repo)
- **Purpose**: Token Studio integration and designer workflow
- **URL**: https://github.com/edmondmiu/DS-SimulateV2
- **Structure**: Minimal (tokens/ + README.md only)
- **Content**: 25 OKLCH-optimized color families
- **Access**: Token Studio read/write, designers

#### DS-Simulate (DSE Repo)
- **Purpose**: Design System Engineering and development
- **URL**: https://github.com/edmondmiu/DS-Simulate
- **Structure**: Full development environment (403MB, 31K+ files)
- **Content**: Epic 4 documentation, build tools, automation, memory system
- **Access**: Engineers, Claude DSE agent

## Workflow Patterns

### Pattern 1: Sync From Clean Repo
```bash
# Pull latest tokens from DS-SimulateV2
curl -s https://raw.githubusercontent.com/edmondmiu/DS-SimulateV2/main/tokens/core.json -o tokens/core.json
# Repeat for all 9 token files
```

**When to use**: 
- Start of any Epic work
- After designers update tokens in Token Studio
- Before processing or optimization tasks

### Pattern 2: Push to Clean Repo
```bash
# Process tokens in DSE environment
# Apply OKLCH optimizations, validations, etc.
# Then push back to clean repo (manual process)
```

**When to use**:
- After Epic completion
- After new color family creation
- After accessibility improvements

### Pattern 3: Epic Development Cycle
1. **Sync**: Pull from DS-SimulateV2
2. **Process**: Apply OKLCH optimization, create new families
3. **Document**: Update Epic documentation in .dse/
4. **Test**: Validate accessibility, build tokens
5. **Push**: Send results back to DS-SimulateV2
6. **Verify**: Test Token Studio integration

## File Mapping

### Core Token Files (Both Repos)
- `tokens/core.json` - 25 color families, 67KB
- `tokens/$metadata.json` - Token Studio metadata
- `tokens/$themes.json` - Theme definitions, 23KB
- `tokens/global.json` - Global tokens, 31KB
- `tokens/components.json` - Component tokens
- `tokens/bet9ja dark.json` - Bet9ja dark theme
- `tokens/bet9ja light.json` - Bet9ja light theme
- `tokens/global light.json` - Light theme globals
- `tokens/Content Typography.json` - Typography tokens

### DSE-Only Files (DS-Simulate Only)
- `.dse/` - Epic documentation and memory system
- `scripts/` - OKLCH processors and automation
- `dist/` - Build outputs
- `docs/` - Technical documentation
- `.github/workflows-archive/` - Archived automation
- `package.json` - Dependencies and build scripts

## Integration Points

### Token Studio Integration
- **Source**: DS-SimulateV2 only
- **Access**: Direct file integration
- **Workflow**: Token Studio ↔ DS-SimulateV2 ↔ DS-Simulate (pull only)

### Claude DSE Agent Integration
- **Primary Repo**: DS-Simulate
- **Commands**: 
  - `*sync-from-clean-repo` - Pull from DS-SimulateV2
  - `*push-to-clean-repo` - Push to DS-SimulateV2
  - `*oklch-optimize` - Apply Epic 4 patterns
- **Memory System**: Full Epic 4 context preserved

### GitHub Actions Status
- **DS-SimulateV2**: No workflows (Token Studio compatibility)
- **DS-Simulate**: Workflows archived, future Epic 6 automation planned

## Success Metrics

### Epic 4 V2 Achievement Status
✅ **25 Color Families**: All OKLCH optimized
✅ **Mathematical Consistency**: Perceptual uniformity across families
✅ **Multi-Brand Support**: Logifuture Green/Navy Blue integrated
✅ **Token Studio Compatibility**: DS-SimulateV2 integration successful
✅ **Accessibility Compliance**: WCAG AA+ standards met
✅ **Repository Architecture**: Clean separation achieved

### Workflow Efficiency
- **Sync Time**: <30 seconds to pull all tokens
- **Token Studio**: No push conflicts in clean repo
- **Development**: Full tooling available in DSE repo
- **Memory Preservation**: All Epic 4 knowledge retained

## Common Operations

### Start New Epic Work
1. `*sync-from-clean-repo` - Get latest tokens
2. Create new Epic documentation in `.dse/epics/`
3. Apply processing in DSE environment
4. Test and validate locally
5. Push results to DS-SimulateV2

### Handle Design Updates
1. Designers update via Token Studio → DS-SimulateV2
2. `*sync-from-clean-repo` in DS-Simulate
3. Apply any needed processing/optimization
4. If changes needed, push back to DS-SimulateV2

### Troubleshooting Token Studio Issues
- **Problem**: Token Studio can't push to DS-Simulate
- **Solution**: Use DS-SimulateV2 as integration point
- **Debug**: Check DS-SimulateV2 file structure is minimal
- **Verify**: Test with simple token changes first

This architecture solves the repository complexity issue while preserving all Epic 4 achievements and enabling continued DSE development.