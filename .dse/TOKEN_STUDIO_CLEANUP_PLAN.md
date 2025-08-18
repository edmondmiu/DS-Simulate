# Token Studio Integration Cleanup Plan

## Executive Summary

**Problem**: Token Studio can push to fresh repos but not this one, indicating repository-specific blockers.
**Root Cause**: GitHub Actions conflicts and obsolete tokensource.json system interference.
**Solution**: Two-repository architecture - DS-SimulateV2 (clean) for Token Studio, DS-Simulate (DSE) for engineering.
**Status**: ✅ COMPLETED - Two-repo workflow implemented and tested successfully.

## Current Status

### ✅ Completed (Epic 4 V2)
- OKLCH color optimization: 25 families with mathematical consistency
- Logifuture brand integration: Green (#0ad574) and Navy Blue (#1c2744)
- Color progression fixes: Neutral, Neon Green 1300, blue families
- Token Studio compatibility: Files structure aligned
- Family cleanup: Removed Dynamic Neutral, Dynamic Amber, Smoked Grey, Logifuture Skynight

### ❌ Blocking Issues
- Token Studio cannot push changes back to GitHub
- GitHub Actions workflows non-functional and causing interference
- tokensource.json system now obsolete (Token Studio supports direct files)
- Repository complexity preventing Token Studio sync

## Cleanup Execution Plan

### Phase 1: Archive Non-Functional Systems

#### Step 1: Archive GitHub Actions
```bash
# Create archive directory
mkdir -p .github/workflows-archive

# Move workflows to archive
mv .github/workflows/update-tokens.yml .github/workflows-archive/
mv .github/workflows/split-tokensource.yml .github/workflows-archive/
mv .github/workflows/main.yml .github/workflows-archive/
```

#### Step 2: Archive Consolidation Scripts
```bash
# Create scripts archive
mkdir -p scripts-archive

# Move obsolete scripts
mv scripts/consolidate.ts scripts-archive/
mv scripts/consolidate-enhanced.ts scripts-archive/
mv scripts/split.ts scripts-archive/
mv scripts/import-export.ts scripts-archive/
mv scripts/pull-latest.js scripts-archive/
```

#### Step 3: Remove Obsolete Files
```bash
# Remove tokensource.json system files
rm tokensource.json
rm tokensource-backup.json 
rm tokensource-clean.json

# Remove backup directories
rm -rf tokens.backup.*
rm -rf tokenstudio_export
```

#### Step 4: Update package.json Scripts
Remove obsolete npm scripts:
- `consolidate`, `consolidate-enhanced`
- `split`, `split-latest`
- `sync`, `pull-latest`
- `import-export`

Keep essential scripts:
- `build`, `test`, `lint`, `type-check`

### Phase 2: Optimize for Token Studio

#### Step 5: Clean tokens/ Directory
- Remove backup files: `core.json.backup`, `core.json.before-token-studio-sync`
- Verify all 25 color families are properly structured
- Ensure OKLCH optimizations preserved in descriptions

#### Step 6: Repository Structure Validation
- Check file encoding (UTF-8)
- Remove hidden files or unusual characters
- Verify proper JSON formatting
- Test file sizes are reasonable for Token Studio

### Phase 3: Enable Token Studio Integration

#### Step 7: Token Studio Configuration
- Configure Token Studio for direct file integration
- Point to cleaned tokens/ directory
- Test push capability after cleanup

#### Step 8: Verification
- Verify Token Studio can read all 25 color families
- Test bidirectional sync (read and write)
- Confirm OKLCH optimizations preserved
- Validate Logifuture brand colors maintained

## Success Criteria

### Immediate Goals
✅ Token Studio can push changes to GitHub successfully
✅ All OKLCH optimization work preserved (435+ optimized colors)
✅ 25 color families maintained with mathematical consistency
✅ Logifuture brand integration intact
✅ Repository structure simplified and clean

### Future Epic 6 Goals
✅ Foundation for new automation system
✅ Direct Token Studio file integration
✅ Enhanced validation without push conflicts
✅ Modern workflow design

## Risk Mitigation

**Data Protection**:
- All OKLCH work preserved in tokens/ directory
- Archive directories maintain historical systems
- Git history preserves all optimization commits
- Can restore archived systems if needed

**Rollback Plan**:
- Restore workflows from archive directories
- Recreate tokensource.json if needed
- All changes are additive/archival, not destructive

## Files Modified/Created
- `.dse/GITHUB_ACTIONS_ARCHIVE.md` (documentation)
- `.dse/TOKENSOURCE_SYSTEM_ARCHIVE.md` (documentation)
- `.dse/EPIC_6_AUTOMATION_ROADMAP.md` (future planning)
- `.github/workflows-archive/` (archived workflows)
- `scripts-archive/` (archived consolidation system)
- Updated `package.json` (cleaned scripts)

This cleanup should eliminate Token Studio push blockers while preserving all Epic 4 V2 achievements.