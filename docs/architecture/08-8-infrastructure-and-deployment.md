### 8. Infrastructure and Deployment

- **Infrastructure as Code:** Not required for the tooling itself. The primary infrastructure is the GitHub repository and its features.
- **Deployment Strategy:** Deployment consists of the GitHub Actions workflow automatically running the build scripts and committing the resulting artifacts (tokensource.json, /dist folder) to the main branch.
- **Environments:** The main branch serves as the "production" environment for token consumers. Development work occurs on feature branches.
