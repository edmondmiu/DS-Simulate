# Technology Stack

## Technology Stack Table

| Category            | Technology       | Version | Purpose                                            | Rationale                                                                                                 |
| ------------------- | ---------------- | ------- | -------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| **Language**        | TypeScript       | 5.4.5   | Primary language for all scripts                   | Provides strong typing to reduce errors, critical for reliable build pipeline and AI development guidance |
| **Runtime**         | Node.js          | 20.11.1 | Environment for executing all scripts              | Current Long-Term Support (LTS) version, ensuring stability and wide package compatibility                |
| **Package Manager** | npm              | 10.2.4  | Managing project dependencies                      | Bundled with Node.js and has robust support for monorepo workspaces                                       |
| **Core Engine**     | Style Dictionary | 4.0.0   | Transforming tokens into platform-specific outputs | The chosen core technology for the pipeline as defined in PRD                                             |
| **Testing**         | Jest             | 29.7.0  | Unit and integration testing for scripts           | Popular, all-in-one testing framework that works seamlessly with TypeScript and Node.js                   |
| **Linting**         | ESLint           | 8.57.0  | Enforcing code quality and standards               | Industry standard for identifying and fixing problems in JavaScript/TypeScript code                       |
| **Formatting**      | Prettier         | 3.2.5   | Enforcing consistent code style                    | Works with ESLint to automate code formatting, ensuring consistency regardless of author                  |
| **CI/CD Platform**  | GitHub Actions   | N/A     | Automating the token pipeline                      | Native to GitHub, enabling seamless integration with GitHub-centric workflow                              |

## Infrastructure and Platform

### Cloud Infrastructure

- **Provider**: GitHub
- **Key Services**:
  - GitHub Repositories (source control)
  - GitHub Actions (CI/CD and automation)
  - GitHub Pages or raw file serving (for `tokensource.json` URL access)

### Development Environment

- **Required Node.js Version**: 20.11.1 (LTS)
- **Required npm Version**: 10.2.4
- **Supported Platforms**: Cross-platform (Windows, macOS, Linux)

## Core Dependencies

### Production Dependencies

```json
{
  "style-dictionary": "4.0.0"
}
```

### Development Dependencies

```json
{
  "@types/node": "^20.11.1",
  "typescript": "5.4.5",
  "jest": "29.7.0",
  "@types/jest": "^29.5.0",
  "eslint": "8.57.0",
  "@typescript-eslint/eslint-plugin": "^6.0.0",
  "@typescript-eslint/parser": "^6.0.0",
  "prettier": "3.2.5"
}
```

## Script Execution Environment

### CLI Requirements

- All scripts must be executable via command-line interface
- Scripts should support standard CLI conventions (--help, --version, etc.)
- Error handling must provide clear, actionable error messages
- Scripts must be compatible with CI/CD automation

### File System Requirements

- Read/write access to project directory structure
- Ability to create and modify JSON files
- Support for file watching and monitoring (for development)
- Cross-platform path handling

## Integration Requirements

### GitHub Integration

- Repository access for source control
- GitHub Actions runner compatibility
- Raw file access for `tokensource.json` URL endpoint
- Branch protection and pull request workflows

### Figma Token Studio Integration

- JSON file format compatibility
- Raw GitHub URL accessibility
- Token structure adherence to Token Studio specifications
- Bi-directional sync capability (read tokens from GitHub)

### Style Dictionary Integration

- Custom transform support
- Multiple output format generation (CSS, Dart, etc.)
- Configuration file management
- Build pipeline integration

## Development Toolchain

### Code Editor Requirements

- TypeScript language server support
- ESLint integration
- Prettier integration
- Debugging support for Node.js

### Build and Development Scripts

```bash
# Development commands
npm run dev          # Start development mode with file watching
npm run build        # Build all scripts and validate
npm run test         # Run all tests
npm run lint         # Run ESLint
npm run format       # Run Prettier
npm run type-check   # Run TypeScript compiler check

# Pipeline commands
npm run consolidate  # Run consolidate-to-source script
npm run split        # Run split-source-to-tokens script
npm run style-build  # Run Style Dictionary build
```

## Compatibility Requirements

### Browser Compatibility

- N/A (CLI-based toolchain, no browser requirements)

### Node.js Feature Usage

- ES Modules support
- File system APIs (fs, path modules)
- Process arguments and environment variables
- Async/await and Promises

### Operating System Support

- Windows 10+
- macOS 10.15+
- Linux (Ubuntu 18.04+, similar distributions)
- Cross-platform path and file handling

## Version Management Strategy

### Dependency Updates

- Major versions: Require architectural review
- Minor versions: Can be updated with testing
- Patch versions: Safe for automatic updates
- Security updates: Priority updates regardless of version

### Node.js LTS Policy

- Always use current LTS version
- Update to new LTS within 6 months of release
- Maintain compatibility with previous LTS during transition
