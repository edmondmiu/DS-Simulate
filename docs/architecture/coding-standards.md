# Coding Standards

## Language and Framework Standards

### TypeScript Requirements

- **All code must be written in TypeScript** with strong typing
- Use strict TypeScript configuration
- No `any` types - prefer specific types or `unknown`
- All functions must have explicit return types
- All interfaces and types must be properly documented

### Code Quality Tools

- **ESLint 8.57.0**: Code quality enforcement - all code must pass ESLint checks
- **Prettier 3.2.5**: Code formatting - all code must be formatted with Prettier
- **Jest 29.7.0**: Testing framework for all tests

## File and Directory Naming

### File Naming Conventions

- **Scripts**: `kebab-case.ts` (e.g., `consolidate-to-source.ts`, `split-source-to-tokens.ts`)
- **Configuration**: `kebab-case.json` or `.config.js` (e.g., `style-dictionary.config.json`)
- **TypeScript files**: `camelCase.ts` or `PascalCase.ts` for classes
- **Test files**: `*.test.ts` or `*.spec.ts`

### Directory Structure

- Use lowercase with hyphens for directories
- Group related functionality together
- Separate source code (`src/`), scripts (`scripts/`), tests (`tests/`), and outputs (`dist/`)

## Script Development Standards

### Command-Line Interface

- All scripts must be executable via command-line
- Use proper argument parsing and validation
- Provide clear error messages and help text
- Support `--help` flag for all scripts

### Error Handling

- Use proper error handling with try-catch blocks
- Provide meaningful error messages
- Log errors appropriately for debugging
- Exit with proper exit codes (0 for success, non-zero for errors)

### File Operations

- Always validate file paths before operations
- Use proper async/await for file operations
- Handle file system errors gracefully
- Create backup copies when modifying critical files

## Testing Standards

### Test Organization

- All tests in `tests/` directory
- Test files should mirror source file structure
- Use descriptive test names that explain the scenario
- Group related tests using `describe` blocks

### Test Coverage

- Focus on critical path functionality
- Test script transformations thoroughly
- Validate file input/output operations
- Test error conditions and edge cases

### Test Types

- **Unit Tests**: Individual functions and modules
- **Integration Tests**: Script workflows and file transformations
- **Pipeline Tests**: End-to-end token pipeline validation

## Documentation Standards

### Code Documentation

- Use JSDoc comments for all public functions
- Document complex algorithms and business logic
- Include usage examples in function documentation
- Maintain up-to-date README files

### Inline Comments

- Use comments sparingly and only when necessary
- Explain "why" not "what"
- Update comments when code changes
- Remove outdated or incorrect comments

## Version Control

### Commit Standards

- Use clear, descriptive commit messages
- Make atomic commits (one logical change per commit)
- Reference story/task numbers in commit messages
- Test all changes before committing

### Branch Protection

- All changes must go through pull requests
- Code must pass all automated checks
- Require code review for significant changes

## Performance and Reliability

### Script Performance

- Use efficient file processing techniques
- Minimize memory usage for large token files
- Implement progress indicators for long-running operations
- Cache results when appropriate

### Reliability Requirements

- Scripts must be idempotent (safe to run multiple times)
- Validate input data before processing
- Provide rollback mechanisms for destructive operations
- Handle interruptions gracefully

## Security Considerations

### File System Security

- Validate all file paths to prevent directory traversal
- Use appropriate file permissions
- Don't expose sensitive information in logs
- Sanitize user input for file operations

### Token Data Security

- Treat token source files as critical assets
- Implement proper backup and recovery procedures
- Validate token data structure before processing
- Log security-relevant events appropriately
