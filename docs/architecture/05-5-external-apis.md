### 5. External APIs

The system relies on two primary external integrations:

1. **GitHub API:** For source control, providing a raw URL endpoint for tokensource.json, and running the CI/CD pipeline via GitHub Actions. Authentication is handled via a PAT stored in repository secrets.
2. **Figma (via Token Studio Plugin):** The plugin consumes the raw GitHub URL to sync tokens into the design environment. It can also push changes back to a development branch.
