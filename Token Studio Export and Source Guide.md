# Token Studio Export and Source Guide

## Overview

This guide explains the structure and relationship between Token Studio's export format and the consolidated token source file, along with workflows for converting between them.

## File Structure Analysis

### Token Studio Export Structure (`tokenstudio_export/`)

The Token Studio export consists of multiple JSON files organized by token sets:

```
tokenstudio_export/
├── $metadata.json          # Token set order and configuration
├── $themes.json            # Theme definitions and token set mappings
├── core.json              # Core design tokens (color ramps, primitives)
├── global.json            # Global semantic tokens (typography, spacing, etc.)
├── global light.json      # Light theme overrides
├── components.json        # Component-specific tokens
├── bet9ja dark.json       # Brand-specific dark theme tokens
├── bet9ja light.json      # Brand-specific light theme tokens
└── Content Typography.json # Typography-specific tokens
```

#### Key Export Files:

1. **$metadata.json** - Defines token set processing order:

   ```json
   {
     "tokenSetOrder": [
       "core",
       "global",
       "global light",
       "components",
       "bet9ja dark",
       "bet9ja light",
       "Content Typography"
     ]
   }
   ```

2. **$themes.json** - Contains theme configurations with:

   - Theme IDs and names
   - Token set enablement (`enabled`, `source`, `disabled`)
   - Figma style references for design system integration

3. **core.json** - Foundation tokens including:

   - Color ramps (Amber, Neutral, Red, Green, Orange, etc.)
   - Primitive color values with accessibility information
   - Base design system building blocks

4. **global.json** - Semantic tokens such as:
   - Typography scales (header, body, label)
   - Spacing system
   - Border radius and width
   - Opacity values
   - Semantic color mappings (primary, secondary, error, success, etc.)

### Token Source Structure (`tokensource.json`)

The consolidated token source is a single JSON file containing all tokens in a flattened hierarchy:

```json
{
  "core": {
    "Color Ramp": {
      "Amber": { "Amber 0000": {...}, "Amber 0100": {...} },
      "Neutral": { "Neutral 0000": {...}, "Neutral 0100": {...} }
    }
  },
  "global": {
    "header": { "d1": {...}, "d2": {...} },
    "body": { "medium": {...}, "bold": {...} },
    "spacing": { "base": {...}, "xs": {...} }
  }
  // ... additional token sets
}
```

## Token Structure Patterns

### Color Tokens

```json
{
  "$type": "color",
  "$value": "#272a2f",
  "$description": "darkest colour"
}
```

### Typography Tokens

```json
{
  "$type": "typography",
  "$value": {
    "fontFamily": "{fontFamilies.roboto}",
    "fontWeight": "{fontWeights.roboto-0}",
    "lineHeight": "{lineHeights.0}",
    "fontSize": "{fontSizes.4xl}"
  }
}
```

### Reference Tokens

Tokens can reference other tokens using curly brace syntax:

```json
{
  "$type": "color",
  "$value": "{Color Ramp.Amber.Amber 0500}"
}
```

## Conversion Workflows

### From Token Studio Export to Token Source

**Process:**

1. Read `$metadata.json` to understand token set order
2. Process each token set file in the specified order
3. Merge tokens into a single hierarchical structure
4. Resolve token references and aliases
5. Output consolidated `tokensource.json`

**Implementation Steps:**

```javascript
// 1. Load metadata and determine processing order
const metadata = JSON.parse(fs.readFileSync('$metadata.json'));
const tokenSetOrder = metadata.tokenSetOrder;

// 2. Process each token set
const consolidatedTokens = {};
for (const tokenSet of tokenSetOrder) {
  const tokens = JSON.parse(fs.readFileSync(`${tokenSet}.json`));
  consolidatedTokens[tokenSet] = tokens;
}

// 3. Write consolidated source
fs.writeFileSync(
  'tokensource.json',
  JSON.stringify(consolidatedTokens, null, 2)
);
```

### From Token Source to Token Studio Export

**Process:**

1. Parse the consolidated `tokensource.json`
2. Extract each top-level token set
3. Create individual JSON files for each token set
4. Generate `$metadata.json` with token set order
5. Create `$themes.json` with theme configurations

**Implementation Steps:**

```javascript
// 1. Load consolidated tokens
const tokenSource = JSON.parse(fs.readFileSync('tokensource.json'));

// 2. Split into individual token sets
Object.keys(tokenSource).forEach(tokenSetName => {
  const tokenSet = tokenSource[tokenSetName];
  fs.writeFileSync(`${tokenSetName}.json`, JSON.stringify(tokenSet, null, 2));
});

// 3. Generate metadata
const metadata = {
  tokenSetOrder: Object.keys(tokenSource),
};
fs.writeFileSync('$metadata.json', JSON.stringify(metadata, null, 2));
```

## Theme System

### Theme Configuration

Themes in Token Studio work by:

- **Source tokens**: Base tokens that other tokens reference
- **Enabled tokens**: Tokens that override or extend source tokens
- **Disabled tokens**: Tokens that are ignored in the theme

### Example Theme Structure:

```json
{
  "id": "base-dark",
  "name": "Base Dark",
  "selectedTokenSets": {
    "core": "source", // Foundation tokens
    "global": "enabled", // Semantic tokens
    "components": "enabled", // Component tokens
    "bet9ja dark": "enabled" // Brand-specific overrides
  }
}
```

## Best Practices

### Token Organization

1. **Core tokens** should contain primitive values (colors, sizes)
2. **Global tokens** should reference core tokens for semantic meaning
3. **Component tokens** should reference global tokens when possible
4. **Theme tokens** should only override what's necessary

### Naming Conventions

- Use consistent numerical scales (0000-1300 for color ramps)
- Include semantic descriptions in token metadata
- Use hierarchical naming (primary.0500, not primary-500)

### Reference Management

- Always reference tokens from lower levels (global → core)
- Avoid circular references
- Use descriptive token names for better maintainability

## Tools and Scripts

### Recommended Conversion Scripts

1. **Export to Source Converter**:

   - Reads Token Studio export directory
   - Merges all token sets respecting order
   - Outputs single consolidated file

2. **Source to Export Converter**:

   - Splits consolidated token source
   - Generates proper Token Studio file structure
   - Maintains theme configurations

3. **Token Validator**:
   - Checks for circular references
   - Validates token syntax
   - Ensures theme consistency

### Integration with Design Systems

- Use the export format for Token Studio integration
- Use the source format for build tools and documentation
- Maintain both formats in version control for different workflows

## Conclusion

Understanding both formats allows for flexible design token workflows:

- **Token Studio Export**: Optimized for design tool integration and theme management
- **Token Source**: Optimized for development, documentation, and build processes

Choose the appropriate format based on your team's workflow and tooling requirements.
