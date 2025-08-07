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
