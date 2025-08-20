# Design System Tooling

A multi-brand, themeable design token management system with mathematical OKLCH color optimization.

## 🎯 Purpose

This repository contains the core tooling for transforming design tokens from a single source of truth (`tokens/` folder) into platform-specific outputs for both designers and developers. The system is built around a simplified, single-repository architecture where designers consume tokens directly in Figma via the Token Studio plugin.

## 🏗️ Architecture

**Single Repository Model (Current)**
- `tokens/` folder serves as the modular source of truth
- Designers consume tokens directly via Token Studio plugin in Figma
- Developers consume platform-specific outputs from the same source
- DSE (Design System Engineer) manages and extends the system

**Previous State**: Epic 4 V2 achieved two-repository architecture with DS-SimulateV2 for Token Studio integration, but was simplified to the current single-repo model for better maintainability.

## ✅ Current Status

- **21 OKLCH-optimized color families** with mathematical consistency
- **Multi-brand support**: Base themes + Logifuture (Green/Navy) + Bet9ja (Dark/Light)
- **Token Studio integration** via direct file connection
- **WCAG AA+ accessibility compliance** across all themes
- **Mathematical color generation** using OKLCH color space for perceptual uniformity

## 🎨 Color System Highlights

### Epic 4 V2 OKLCH Optimization Achievement
- **294 optimized colors** across 21 families
- **Dual-mode system**: Dark and light theme variants
- **Mathematical consistency**: Average smoothness of 0.576
- **Brand preservation**: 7/7 families maintain identity across modes
- **4-phase optimization process** with proven mathematical patterns

### Color Families Available
- **Base colors**: Amber, Cool Neutral, Red, Green, Royal Blue, Yellow, Orange, Black
- **Logifuture brand**: Green (#0ad574), Navy Blue (#1c2744)
- **Bet9ja themes**: Dark and Light variants
- **14-step color ramps**: 0 → 100 → 200 → ... → 1300 progression

### Semantic Token Philosophy
- **Granular by Design**: 14-step semantic ramps (primary.100-1300) provide design flexibility vs simplified systems
- **Designer-Led Workflow**: Developers implement design decisions (e.g., `surface.200` background + `surface.400` border) rather than making color choices
- **Options Enable Quality**: 294 OKLCH colors allow sophisticated visual hierarchies and precise brand preservation
- **Mathematical Foundation**: OKLCH consistency across all semantic tokens ensures visual harmony over abstraction layers

## 🛠️ Available Scripts

### Core Utilities
- `validate-workflow.js` - Tests complete workflow validation
- `validate-token-studio.js` - Validates Token Studio compatibility

### Color Management
- `oklch-color-generator.cjs` - Advanced OKLCH color generation with mathematical precision
- `analyze-surface-colors.cjs` - Analyzes surface colors for 3D effects and subtle variations  
- `precise-color-analysis.cjs` - Mathematical feasibility analysis for color generation

### Token Organization
- `clean-core-colors.js` - Removes duplicate and inconsistent core color tokens
- `fix-core-color-order.js` - Reorders core colors to logical sequence (0 → 1300)
- `fix-semantic-color-order.js` - Reorders semantic color tokens and fixes references

### Processing & Transformation
- `extract-color-tokens.cjs` - Extracts color tokens with direct hex values
- `extract-simple-tokens.cjs` - Extracts simple token structures
- `fix-token-references.cjs` - Resolves token references and creates clean token files

## 🚀 Development Setup

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Development mode
npm run dev

# Quality checks
npm run lint
npm run type-check

# Validation
npm run validate-workflow
```

## 📋 Roadmap

### Phase 1: Validation & Testing (Current Priority)
1. **Figma Component Testing**
   - Test OKLCH color ramps in real components
   - Validate semantic color mappings (primary, secondary, surface, etc.)
   - Build component library using current token structure
   - Identify issues with color progressions and accessibility

2. **Token Studio Integration Validation**
   - Verify all 21 color families load correctly
   - Test theme switching between Base, Logifuture, and Bet9ja
   - Validate component behavior across different themes
   - Document any Token Studio compatibility issues

### Phase 2: Brand Creation Tooling
1. **Automated Brand Generation**
   - CLI interface for generating new brand themes
   - Automated OKLCH color ramp generation from client brand colors
   - Lightness level preservation from existing core colors
   - Multi-theme support (light/dark variants)

2. **Enhanced DSE Workflow**
   - Streamlined brand onboarding process
   - Mathematical color validation
   - Accessibility compliance checking
   - Integration testing automation

### Future Enhancements
- **CI/CD Pipeline**: Automated testing and deployment workflow
- **Platform-specific outputs**: CSS, JSON, iOS, Android token generation
- **Design system documentation**: Auto-generated component libraries
- **Advanced color tools**: Color harmony analysis, brand color optimization

## 🎨 Token Studio Integration

### For Designers: Setting Up Token Studio
1. **Install Token Studio plugin** in Figma from the Community tab
2. **Open Token Studio** and select "Add new credentials" 
3. **Choose "GitHub"** as the sync provider
4. **Enter GitHub URL**:
   ```
   https://github.com/edmondmiu/DS-Simulate/tree/main/tokens
   ```
   Or enter repository details manually:
   - Repository: `edmondmiu/DS-Simulate`
   - Branch: `main`
   - File Path: `tokens`
5. **GitHub Authentication**: Use personal access token with repo read permissions
6. **Import token sets**: All 6 token files will be available for import
7. **Apply themes**: Switch between Base, Logifuture, and Bet9ja themes

### Direct GitHub Raw URLs (Alternative Access)
If you need direct access to token files:
```
Core Colors: https://raw.githubusercontent.com/edmondmiu/DS-Simulate/main/tokens/core.json
Semantic Colors: https://raw.githubusercontent.com/edmondmiu/DS-Simulate/main/tokens/global.json
Light Theme: https://raw.githubusercontent.com/edmondmiu/DS-Simulate/main/tokens/global%20light.json
Components: https://raw.githubusercontent.com/edmondmiu/DS-Simulate/main/tokens/components.json
Bet9ja Dark: https://raw.githubusercontent.com/edmondmiu/DS-Simulate/main/tokens/bet9ja%20dark.json
Bet9ja Light: https://raw.githubusercontent.com/edmondmiu/DS-Simulate/main/tokens/bet9ja%20light.json
Themes Config: https://raw.githubusercontent.com/edmondmiu/DS-Simulate/main/tokens/%24themes.json
```

### Token Structure Overview
- `tokens/core.json` - Base color ramps and foundations (21 OKLCH families)
- `tokens/global.json` - Semantic color tokens (primary, secondary, surface, etc.)
- `tokens/global light.json` - Light theme overrides  
- `tokens/components.json` - Component-specific tokens
- `tokens/bet9ja dark.json` - Bet9ja dark theme
- `tokens/bet9ja light.json` - Bet9ja light theme
- `tokens/$metadata.json` - Token set ordering
- `tokens/$themes.json` - Theme configurations

### DSE Workflow: Editing Tokens
**For Design System Engineers managing the tokens:**

1. **Local Development**:
   - Clone repository: `git clone https://github.com/edmondmiu/DS-Simulate.git`
   - Edit token files directly in `tokens/` folder
   - Use validation scripts: `npm run validate-workflow`
   - Commit and push changes

2. **Token Studio Integration**:
   - Set up Token Studio with **write permissions** (GitHub personal access token)
   - Make changes in Token Studio interface
   - Push changes directly to GitHub repository
   - Changes sync automatically to all designers using the same repo

3. **Validation & Testing**:
   - Run `npm run validate-token-studio` after changes
   - Test theme switching in Figma components
   - Verify OKLCH mathematical consistency maintained

## 📊 Key Achievements

### Epic 4 V2 Color Optimization
- **4-phase systematic optimization** using proven mathematical patterns
- **Family-specific strategies**: Neutral progression vs Smart anchoring
- **39% average improvement** in problematic color families
- **Brand identity preservation** across light/dark modes
- **Complete system integration** with comprehensive validation

### Multi-Brand Support
- **Logifuture brand integration**: Custom green and navy color families
- **Bet9ja theme system**: Complete light and dark theme variants
- **Scalable architecture**: Ready for additional brand integration

### Design System Philosophy
- **Rejected Oversimplification**: Maintained granular 14-step semantic systems over simplified 3-4 step approaches
- **Developer Workflow Clarity**: Established that developers copy design specs, not make color decisions
- **Brand vs Generic Systems**: Chose precision over generic theme compatibility for client brand systems
- **Mathematical Over Abstract**: Prioritized OKLCH mathematical consistency over simplified abstraction layers

## 🔧 DSE Memory System

The Design System Engineer agent utilizes CLAUDE.md for institutional memory and context retention across sessions. This includes:
- Project architecture understanding
- Historical decision documentation
- Script functionality mapping  
- Brand creation workflows
- Color optimization patterns

## 🎉 Recent Milestones

- **Epic 4 V2 Complete**: OKLCH color optimization with mathematical excellence
- **Token Studio Integration**: Direct file compatibility achieved
- **Multi-brand support**: Logifuture and Bet9ja themes implemented
- **Workflow simplification**: Two-repo architecture simplified to single-repo model
- **Infrastructure cleanup**: Removed obsolete documentation and complex scripts