// Basic test for project scaffolding
const pkg = require('../package.json');

describe('Project scaffolding', () => {
  test('should have correct project name', () => {
    expect(pkg.name).toBe('design-system-tooling');
  });

  test('should have correct version', () => {
    expect(pkg.version).toBe('1.0.0');
  });

  test('should have required scripts', () => {
    expect(pkg.scripts.build).toBeDefined();
    expect(pkg.scripts.test).toBeDefined();
    expect(pkg.scripts.lint).toBeDefined();
  });
});