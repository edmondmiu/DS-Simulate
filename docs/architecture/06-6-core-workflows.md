### 6. Core Workflows

The architecture supports two main workflows, which have been mapped out in sequence diagrams:

1. **DSE Token Update Workflow:** A local, script-based process for a DSE to edit modular token files, run a consolidate script, and push the updated tokensource.json to GitHub.
2. **Designer Token Sync Workflow:** A designer uses the "Sync" feature in the Token Studio plugin, which fetches the latest tokensource.json from the public GitHub URL and updates the styles in their Figma file.
