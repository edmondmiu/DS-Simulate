# **Design System Tooling Architecture Document**

### 1. High-Level Architecture

#### Technical Summary

This project will be a **CLI-based toolchain** housed in a **monorepo**, built with **Node.js**. The core of the system is a **pipeline architecture** that transforms a modular set of JSON source files (tokens/) into a single, consolidated source of truth (tokensource.json). This file is then consumed by both the Figma Token Studio plugin for designers and the Style Dictionary engine. Style Dictionary acts as an **adapter**, converting the tokens into multiple platform-specific outputs (CSS, Dart) for consumption by developers. This architecture prioritizes automation, reliability, and a clear, single source of truth for all design and development workflows.

#### High-Level Overview

- **Architectural Style:** The system is a **Build-Time Pipeline**, not a traditional running service. All operations are initiated on-demand by a user (the DSE) or a CI/CD process.
- **Repository Structure:** A **Monorepo** will be used to manage the interconnected packages: the token source files, the transformation scripts, Style Dictionary configurations, and generated outputs.
- **Primary Data Flow:** The workflow is sequential: The DSE manually edits modular token files -> A consolidate script creates the master tokensource.json -> This file is synced to GitHub for Figma consumption and used as the input for a Style Dictionary build script -> The build script generates platform-specific files in the /dist directory.

#### High-Level Project Diagram

graph TD \
 subgraph "Design & Management Workflow" \
 DSE("👨‍💻 Design System Engineer") -- Edits modular files in --> LocalRepo("📂 Local Monorepo") \
 LocalRepo -- Runs --> Scripts("🤖 Scripts (Consolidate/Split)") \
 Scripts -- Creates/Updates --> SOT("📄 tokensource.json") \
 SOT -- Pushed to --> GitHub("☁️ GitHub Repo") \
 Designer("🎨 Designer") -- Syncs via URL from --> GitHub \
 GitHub -- Pulled by --> Figma("🎨 Figma w/ Token Studio") \
 end \
 \
 subgraph "CI/CD & Consumption Pipeline" \
 GitHub -- Triggers CI/CD --> GHA("🔄 GitHub Actions") \
 GHA -- Runs --> SD("📚 Style Dictionary Build") \
 SD -- Generates --> Dist("📦 /dist folder (CSS, Dart, etc.)") \
 Dist -- Consumed by --> WebApp("🌐 Web App (React)") \
 Dist -- Consumed by --> MobileApp("📱 Mobile App (Flutter)") \
 end \

#### Architectural and Design Patterns

- **Monorepo Pattern:** Used for code organization.
  - _Rationale:_ Centralizes management of the related packages (scripts, configs, outputs) and simplifies dependency management and automated workflows.
- **CLI (Command-Line Interface) Pattern:** The primary interface for the tooling.
  - _Rationale:_ Highly efficient for script-based, on-demand tasks and ideal for automation in a CI/CD environment.
- **Pipeline Pattern:** Defines the data flow for tokens.
  - _Rationale:_ Creates a clear, sequential, and predictable process for transforming token data from its raw source to its final consumable formats.
- **Adapter Pattern (via Style Dictionary):** Used for generating outputs.
  - _Rationale:_ The core token format is translated by Style Dictionary into multiple different formats (CSS, Dart, etc.) required by client applications.

### 2. Tech Stack

#### Cloud Infrastructure

- **Provider:** **GitHub**
- **Key Services:** **GitHub Repositories** (for source control), **GitHub Actions** (for CI/CD and automation).

#### Technology Stack Table

<table>
  <tr>
   <td><strong>Category</strong>
   </td>
   <td><strong>Technology</strong>
   </td>
   <td><strong>Version</strong>
   </td>
   <td><strong>Purpose</strong>
   </td>
   <td><strong>Rationale</strong>
   </td>
  </tr>
  <tr>
   <td><strong>Language</strong>
   </td>
   <td>TypeScript
   </td>
   <td>5.4.5
   </td>
   <td>Primary language for all scripts.
   </td>
   <td>Provides strong typing to reduce errors, which is critical for a reliable build pipeline and for guiding AI developers.
   </td>
  </tr>
  <tr>
   <td><strong>Runtime</strong>
   </td>
   <td>Node.js
   </td>
   <td>20.11.1
   </td>
   <td>The environment for executing all scripts.
   </td>
   <td>Current Long-Term Support (LTS) version, ensuring stability and wide package compatibility.
   </td>
  </tr>
  <tr>
   <td><strong>Package Manager</strong>
   </td>
   <td>npm
   </td>
   <td>10.2.4
   </td>
   <td>Managing project dependencies.
   </td>
   <td>Bundled with Node.js and has robust support for monorepo workspaces, fitting our chosen structure.
   </td>
  </tr>
  <tr>
   <td><strong>Core Engine</strong>
   </td>
   <td>Style Dictionary
   </td>
   <td>4.0.0
   </td>
   <td>Transforming tokens into platform-specific outputs.
   </td>
   <td>The chosen core technology for the pipeline, as defined in the PRD.
   </td>
  </tr>
  <tr>
   <td><strong>CI/CD Platform</strong>
   </td>
   <td>GitHub Actions
   </td>
   <td>N/A
   </td>
   <td>Automating the token pipeline.
   </td>
   <td>Native to our chosen source control, enabling seamless integration with our GitHub-centric workflow.
   </td>
  </tr>
  <tr>
   <td><strong>Testing</strong>
   </td>
   <td>Jest
   </td>
   <td>29.7.0
   </td>
   <td>Unit and integration testing for scripts.
   </td>
   <td>A popular, all-in-one testing framework that works seamlessly with TypeScript and Node.js.
   </td>
  </tr>
  <tr>
   <td><strong>Linting</strong>
   </td>
   <td>ESLint
   </td>
   <td>8.57.0
   </td>
   <td>Enforcing code quality and standards.
   </td>
   <td>The industry standard for identifying and fixing problems in JavaScript/TypeScript code.
   </td>
  </tr>
  <tr>
   <td><strong>Formatting</strong>
   </td>
   <td>Prettier
   </td>
   <td>3.2.5
   </td>
   <td>Enforcing consistent code style.
   </td>
   <td>Works with ESLint to automate code formatting, ensuring consistency regardless of the author (human or AI).
   </td>
  </tr>
</table>

### 3. Data Models

The system is composed of three primary data models:

- **Design Token:** The atomic unit representing a single design decision ($type, $value, $description).
- **Token Set:** A logical grouping of related tokens corresponding to a JSON file (e.g., core.json).
- **Theme:** A configuration that defines a complete look and feel by selecting and combining Token Sets, with an explicit mode property ("light" or "dark").

### 4. Components

The toolchain is composed of five major logical components:

1. **Token Source:** The modular tokens/ directory and the compiled tokensource.json.
2. **consolidate Script:** Compiles the modular directory into the single source of truth.
3. **split Script:** Deconstructs the source of truth back into the modular directory.
4. **Transformation Engine:** Uses Style Dictionary to build platform-specific outputs in /dist.
5. **Automation Workflow:** A GitHub Actions pipeline that orchestrates the consolidation and transformation scripts.

### 5. External APIs

The system relies on two primary external integrations:

1. **GitHub API:** For source control, providing a raw URL endpoint for tokensource.json, and running the CI/CD pipeline via GitHub Actions. Authentication is handled via a PAT stored in repository secrets.
2. **Figma (via Token Studio Plugin):** The plugin consumes the raw GitHub URL to sync tokens into the design environment. It can also push changes back to a development branch.

### 6. Core Workflows

The architecture supports two main workflows, which have been mapped out in sequence diagrams:

1. **DSE Token Update Workflow:** A local, script-based process for a DSE to edit modular token files, run a consolidate script, and push the updated tokensource.json to GitHub.
2. **Designer Token Sync Workflow:** A designer uses the "Sync" feature in the Token Studio plugin, which fetches the latest tokensource.json from the public GitHub URL and updates the styles in their Figma file.

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
└── README.md \

### 8. Infrastructure and Deployment

- **Infrastructure as Code:** Not required for the tooling itself. The primary infrastructure is the GitHub repository and its features.
- **Deployment Strategy:** Deployment consists of the GitHub Actions workflow automatically running the build scripts and committing the resulting artifacts (tokensource.json, /dist folder) to the main branch.
- **Environments:** The main branch serves as the "production" environment for token consumers. Development work occurs on feature branches.

### 9. Coding Standards and Test Strategy

- **Coding Standards:** The project will adhere to strict standards enforced by ESLint (for quality) and Prettier (for formatting). All code will be written in TypeScript with strong typing.
- **Test Strategy:** The Jest testing framework will be used. The focus will be on unit and integration tests for the scripts in the scripts/ directory. Tests will verify that the file transformations are correct and that the pipeline is reliable.

### 10. Security

- **Primary Concern:** The security of the GitHub Personal Access Token (PAT) used by the GitHub Actions workflow.
- **Mitigation:** The PAT will be stored as an encrypted repository secret in GitHub and will be configured with the minimum required permissions (write access to the repository).
- **Branch Protection:** The main branch will be protected to prevent direct pushes, ensuring all changes are processed and validated by the automated workflow.

### 11. Checklist Results Report

- **Overall Readiness:** High. The architecture is well-aligned with the PRD and based on industry-standard practices.
- **Critical Risks:** 0. The primary risks are related to external service availability (GitHub, Figma), which will be mitigated by robust local workflows.
- **Final Decision:** The architecture is validated and ready for implementation.

### 12. Next Steps

#### AI Tooling Developer Handoff Prompt:

This Architecture Document, along with the PRD, provides the complete specification for the Design System Tooling project. Your task is to implement the scripts, configurations, and workflows as defined. Begin with the stories in **Epic 1: Core Pipeline & Project Foundation**, starting with the project scaffolding as defined in the Source Tree.
