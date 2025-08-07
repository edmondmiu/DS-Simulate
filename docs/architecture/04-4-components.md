### 4. Components

The toolchain is composed of five major logical components:

1. **Token Source:** The modular tokens/ directory and the compiled tokensource.json.
2. **consolidate Script:** Compiles the modular directory into the single source of truth.
3. **split Script:** Deconstructs the source of truth back into the modular directory.
4. **Transformation Engine:** Uses Style Dictionary to build platform-specific outputs in /dist.
5. **Automation Workflow:** A GitHub Actions pipeline that orchestrates the consolidation and transformation scripts.
