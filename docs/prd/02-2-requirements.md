### **2. Requirements**

#### **Functional Requirements**

- **FR1:** The system must provide a `consolidate-to-source` script that compiles the modular `tokens/` directory into a single `tokensource.json`, following the process outlined in the _Token Studio Export and Source Guide_.
- **FR2:** The system must use the Style Dictionary engine to transform the `tokensource.json` file into multiple platform-specific outputs, including CSS Custom Properties and Dart theme files.
- **FR3:** The `tokensource.json` file must be consumable by the Figma Token Studio plugin via a raw GitHub URL to support the designer workflow.
- **FR4:** The system must allow a Design System Engineer to manually create and define a new brand's complete token set within the `tokens/` directory, adhering to the file structure (`$metadata.json`, `$themes.json`, `core.json`, etc.) defined in the _Token Studio Export and Source Guide_.
- **FR5:** The system must provide a `split-source-to-tokens` script that can deconstruct the `tokensource.json` file back into the modular `tokens/` directory structure for editing.

#### **Non-Functional Requirements**

- **NFR1:** All system scripts must be executable via the command-line, enabling a developer or an AI agent to operate the system from within an IDE.
- **NFR2:** The system's scripts and architecture must be documented with sufficient clarity to allow an AI agent to execute the workflow defined in the _Token Studio Export and Source Guide_.

---
