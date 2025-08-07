### 7. Source Tree

The project will use the following monorepo structure:

design-system-tooling/ \
├── .github/ \
│ └── workflows/ \
│ └── main.yml # CI/CD pipeline \
├── docs/ \
│ ├── PRD.md \
│ └── ARCHITECTURE.md \
├── scripts/ \
│ ├── consolidate.ts \
│ ├── split.ts \
│ └── build.ts \
├── src/ # Shared utilities for scripts \
├── tokens/ # Editable, modular token source files \
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
├── tokensource.json # Single source of truth \
└── README.md \\
