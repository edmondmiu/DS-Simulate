### 7. Source Tree

The project will use the following monorepo structure:

design-system-tooling/ \
├── .dse/ # DSE color management configurations \
│ └── color-library.json # OKLCH color configurations for DSE workflow \
├── .github/ \
│ └── workflows/ \
│ └── main.yml # CI/CD pipeline \
├── docs/ \
│ ├── PRD.md \
│ └── ARCHITECTURE.md \
├── scripts/ \
│ ├── consolidate.ts # Enhanced with .dse/ configuration support \
│ ├── split.ts \
│ └── build.ts \
├── src/ # Shared utilities for scripts \
├── tokens/ # Token Studio mirror - modular token source files \
│ ├── $metadata.json \
│ ├── $themes.json \
│ └── ... \
├── dist/ # Compiled, platform-specific outputs \
│ ├── css/ \
│ └── dart/ \
├── tests/ \
│ └── ... \
├── style-dictionary.config.json \
├── package.json \
├── tsconfig.json \
├── tokensource.json # Single source of truth (enhanced with OKLCH) \
└── README.md \\
