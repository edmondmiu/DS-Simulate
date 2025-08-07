# Source Tree Structure

## Project Directory Structure

The project follows a monorepo structure that accommodates the design system tooling pipeline, token management, and build outputs.

```
design-system-tooling/
├── .github/                    # CI/CD workflows
│   └── workflows/
│       └── main.yml           # CI/CD pipeline
├── docs/                      # Documentation
│   ├── PRD.md                 # Product Requirements Document
│   ├── ARCHITECTURE.md        # Architecture Document
│   ├── architecture/          # Detailed architecture docs
│   │   ├── coding-standards.md
│   │   ├── tech-stack.md
│   │   └── source-tree.md
│   ├── prd/                   # Sharded PRD sections
│   │   └── [prd-sections].md
│   └── stories/               # Development stories
│       └── *.story.md
├── scripts/                   # Build and transformation scripts
│   ├── consolidate.ts         # Consolidate tokens/ → tokensource.json
│   ├── split.ts              # Split tokensource.json → tokens/
│   └── build.ts              # Style Dictionary build script
├── src/                      # Shared utilities for scripts
│   ├── utils/                # Common utility functions
│   ├── types/                # TypeScript type definitions
│   └── constants/            # Shared constants
├── tokens/                   # Editable, modular token source files
│   ├── $metadata.json        # Token metadata configuration
│   ├── $themes.json          # Theme definitions
│   ├── core.json             # Core design tokens
│   ├── components.json       # Component-specific tokens
│   └── [brand-name]/         # Brand-specific token files
│       ├── light.json
│       └── dark.json
├── dist/                     # Compiled, platform-specific outputs
│   ├── css/                  # CSS Custom Properties output
│   │   ├── tokens.css
│   │   ├── light-theme.css
│   │   └── dark-theme.css
│   └── dart/                 # Dart/Flutter output
│       ├── tokens.dart
│       └── theme_data.dart
├── tests/                    # Test files
│   ├── scripts/              # Script tests
│   ├── integration/          # Integration tests
│   └── fixtures/             # Test data and fixtures
├── .ai/                      # AI development support
│   └── debug-log.md          # Debug log for development tracking
├── style-dictionary.config.json  # Style Dictionary configuration
├── package.json              # Root package.json with workspace config
├── tsconfig.json             # TypeScript configuration
├── tokensource.json          # Single source of truth (generated)
└── README.md                 # Project documentation
```

## Directory Purposes

### Core Directories

#### `/scripts/`

Contains the main transformation scripts that power the token pipeline:

- **`consolidate.ts`**: Merges modular token files from `tokens/` into single `tokensource.json`
- **`split.ts`**: Breaks down `tokensource.json` back into modular `tokens/` files
- **`build.ts`**: Runs Style Dictionary to generate platform-specific outputs

#### `/src/`

Shared TypeScript utilities and types used across scripts:

- **`utils/`**: Common functions (file operations, validation, logging)
- **`types/`**: TypeScript interfaces and type definitions
- **`constants/`**: Shared configuration and constant values

#### `/tokens/`

Modular, editable token source files organized by category and brand:

- **`$metadata.json`**: Token Studio metadata configuration
- **`$themes.json`**: Theme definitions and configurations
- **Core token files**: `core.json`, `components.json`, etc.
- **Brand directories**: Organized by client brand name containing theme variations

#### `/dist/`

Generated output files for different platforms:

- **`css/`**: CSS Custom Properties for web consumption
- **`dart/`**: Dart constants and theme files for Flutter
- Additional platform outputs can be added as needed

### Supporting Directories

#### `/docs/`

All project documentation including PRD, architecture, and user stories:

- Follows the sharded documentation pattern
- Contains development stories for implementation tracking
- Architecture documentation for development standards

#### `/tests/`

Comprehensive test suite for the token pipeline:

- **`scripts/`**: Unit tests for individual script functions
- **`integration/`**: End-to-end pipeline tests
- **`fixtures/`**: Test data and mock files

#### `/.github/`

GitHub-specific configuration and CI/CD workflows:

- **`workflows/main.yml`**: Automated pipeline for token processing
- Branch protection and pull request templates

#### `/.ai/`

AI development support files:

- **`debug-log.md`**: Development tracking and debugging information
- Additional AI agent configuration as needed

## Key Files

### Configuration Files

#### `package.json`

Root package configuration with workspace setup for monorepo management:

```json
{
  "workspaces": ["scripts", "src"],
  "scripts": {
    "consolidate": "npm run build && node dist/scripts/consolidate.js",
    "split": "npm run build && node dist/scripts/split.js",
    "build": "tsc && node dist/scripts/build.js"
  }
}
```

#### `tsconfig.json`

TypeScript compiler configuration with strict type checking:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

#### `style-dictionary.config.json`

Style Dictionary configuration for token transformation:

```json
{
  "source": ["tokensource.json"],
  "platforms": {
    "css": { "transformGroup": "css", "buildPath": "dist/css/" },
    "dart": { "transformGroup": "flutter", "buildPath": "dist/dart/" }
  }
}
```

### Generated Files

#### `tokensource.json`

The single source of truth generated by the consolidate script:

- Combined token data from all modular files in `tokens/`
- Consumable by Figma Token Studio plugin via raw GitHub URL
- Input source for Style Dictionary transformations

## File Naming Conventions

### Script Files

- Use `kebab-case.ts` for script names
- Descriptive names that indicate function: `consolidate-to-source.ts`
- Include `.test.ts` suffix for test files

### Token Files

- Use `kebab-case.json` for token files
- Special Token Studio files use `$` prefix: `$metadata.json`, `$themes.json`
- Brand directories use lowercase brand names
- Theme files use descriptive names: `light.json`, `dark.json`

### Output Files

- Platform-specific extensions: `.css`, `.dart`
- Descriptive names indicating content: `tokens.css`, `theme_data.dart`
- Use directories to separate platform outputs

## Development Workflow Integration

### Local Development

- Edit modular files in `tokens/` directory
- Run `npm run consolidate` to update `tokensource.json`
- Run `npm run build` to generate platform outputs
- Test changes with `npm test`

### CI/CD Integration

- GitHub Actions automatically runs consolidate and build scripts
- Generated files are committed back to repository
- `tokensource.json` is accessible via raw GitHub URL for Figma integration

### Version Control

- Source files (`tokens/`, `scripts/`, `src/`) are version controlled
- Generated files (`dist/`, `tokensource.json`) are included in repository
- `.ai/debug-log.md` tracks development progress and decisions
