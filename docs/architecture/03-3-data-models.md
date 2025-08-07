### 3. Data Models

The system is composed of three primary data models:

- **Design Token:** The atomic unit representing a single design decision ($type, $value, $description).
- **Token Set:** A logical grouping of related tokens corresponding to a JSON file (e.g., core.json).
- **Theme:** A configuration that defines a complete look and feel by selecting and combining Token Sets, with an explicit mode property ("light" or "dark").
