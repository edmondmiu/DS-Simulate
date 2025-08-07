#!/usr/bin/env node

/**
 * Fix Token References Script
 * Epic 3.2: Create Web CSS Transform
 * 
 * Problem: Token Studio generates references like {fontFamilies.roboto} 
 * but the actual tokens are stored in nested paths like core.Font Family.Roboto
 * 
 * Solution: Create a mapping of flat references to actual token paths
 */

const fs = require('fs');
const path = require('path');

class TokenReferenceResolver {
  constructor(tokensourcePath = 'tokensource.json') {
    this.tokensourcePath = tokensourcePath;
    this.tokens = null;
    this.referenceMap = new Map();
  }

  loadTokens() {
    try {
      const content = fs.readFileSync(this.tokensourcePath, 'utf8');
      this.tokens = JSON.parse(content);
      console.log(`✅ Loaded tokensource.json (${Buffer.byteLength(content)} bytes)`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to load tokensource.json:`, error.message);
      return false;
    }
  }

  // Build a map of all available tokens with their full paths
  buildTokenIndex(obj, currentPath = '', tokenSet = '') {
    const tokens = new Map();
    
    for (const [key, value] of Object.entries(obj)) {
      const fullPath = currentPath ? `${currentPath}.${key}` : key;
      
      if (value && typeof value === 'object') {
        if (value.$type && value.$value) {
          // This is a design token
          tokens.set(fullPath, value);
          
          // Also index by just the token name for easier lookup
          tokens.set(key, { path: fullPath, ...value });
        } else {
          // Recurse into nested objects
          const nestedTokens = this.buildTokenIndex(value, fullPath, tokenSet);
          for (const [nestedKey, nestedValue] of nestedTokens) {
            tokens.set(nestedKey, nestedValue);
          }
        }
      }
    }
    
    return tokens;
  }

  // Create a comprehensive index of all tokens
  createTokenIndex() {
    const allTokens = new Map();
    
    // Index tokens from all token sets
    for (const [tokenSetName, tokenSetData] of Object.entries(this.tokens)) {
      if (tokenSetName.startsWith('$')) continue; // Skip metadata
      
      const tokenSetTokens = this.buildTokenIndex(tokenSetData, tokenSetName);
      for (const [key, value] of tokenSetTokens) {
        allTokens.set(key, value);
      }
    }
    
    console.log(`📊 Indexed ${allTokens.size} tokens across all token sets`);
    return allTokens;
  }

  // Find the best match for a reference
  resolveReference(reference) {
    // Remove curly braces
    const cleanRef = reference.replace(/[{}]/g, '');
    
    // Try exact match first
    if (this.tokenIndex.has(cleanRef)) {
      const token = this.tokenIndex.get(cleanRef);
      if (token.path) {
        return `{${token.path}}`;
      }
    }
    
    // Try partial matches
    const parts = cleanRef.split('.');
    
    // Look for tokens that end with the reference parts
    for (const [tokenPath, token] of this.tokenIndex) {
      if (tokenPath.includes(cleanRef) || 
          (parts.length > 1 && tokenPath.includes(parts[parts.length - 1]))) {
        if (token.path) {
          return `{${token.path}}`;
        }
        return `{${tokenPath}}`;
      }
    }
    
    // If no match found, return original reference
    return reference;
  }

  // Process all references in the token data
  processReferences(obj) {
    if (typeof obj === 'string' && obj.includes('{') && obj.includes('}')) {
      // This is a reference, try to resolve it
      const resolved = this.resolveReference(obj);
      if (resolved !== obj) {
        console.log(`🔄 Resolved: ${obj} → ${resolved}`);
      }
      return resolved;
    }
    
    if (Array.isArray(obj)) {
      return obj.map(item => this.processReferences(item));
    }
    
    if (obj && typeof obj === 'object') {
      const result = {};
      for (const [key, value] of Object.entries(obj)) {
        result[key] = this.processReferences(value);
      }
      return result;
    }
    
    return obj;
  }

  // Create a version with only resolvable tokens
  createCleanTokens() {
    const cleanTokens = {};
    
    // First pass: copy all tokens that don't have references
    for (const [tokenSetName, tokenSetData] of Object.entries(this.tokens)) {
      if (tokenSetName.startsWith('$')) {
        // Keep metadata as-is
        cleanTokens[tokenSetName] = tokenSetData;
        continue;
      }
      
      cleanTokens[tokenSetName] = this.filterResolvableTokens(tokenSetData);
    }
    
    return cleanTokens;
  }

  // Filter to keep only tokens that don't have unresolvable references
  filterResolvableTokens(obj) {
    if (Array.isArray(obj)) {
      return obj.map(item => this.filterResolvableTokens(item));
    }
    
    if (obj && typeof obj === 'object') {
      const result = {};
      
      for (const [key, value] of Object.entries(obj)) {
        if (key === '$value' && typeof value === 'string' && value.includes('{')) {
          // This is a reference value - only keep if it's a simple, direct reference
          if (value.match(/^{[^}]+}$/)) {
            // Single reference - check if it's resolvable
            const cleanRef = value.replace(/[{}]/g, '');
            if (this.tokenIndex.has(cleanRef) || this.findTokenByName(cleanRef)) {
              result[key] = value;
            }
            // Skip tokens with unresolvable references
            continue;
          } else {
            // Complex value, skip for now
            continue;
          }
        } else if (key === '$value' && value && typeof value === 'object') {
          // Complex object value (like typography), check if all references are resolvable
          const hasUnresolvableRefs = this.hasUnresolvableReferences(value);
          if (!hasUnresolvableRefs) {
            result[key] = this.filterResolvableTokens(value);
          }
          // Skip if it has unresolvable references
        } else {
          result[key] = this.filterResolvableTokens(value);
        }
      }
      
      return result;
    }
    
    return obj;
  }

  // Check if an object has unresolvable references
  hasUnresolvableReferences(obj) {
    if (typeof obj === 'string' && obj.includes('{')) {
      const cleanRef = obj.replace(/[{}]/g, '');
      return !this.tokenIndex.has(cleanRef) && !this.findTokenByName(cleanRef);
    }
    
    if (Array.isArray(obj)) {
      return obj.some(item => this.hasUnresolvableReferences(item));
    }
    
    if (obj && typeof obj === 'object') {
      return Object.values(obj).some(value => this.hasUnresolvableReferences(value));
    }
    
    return false;
  }

  // Find token by name patterns
  findTokenByName(name) {
    // Try different matching strategies
    const nameLower = name.toLowerCase();
    
    for (const [tokenPath] of this.tokenIndex) {
      if (tokenPath.toLowerCase().includes(nameLower) || 
          tokenPath.toLowerCase().endsWith(nameLower)) {
        return tokenPath;
      }
    }
    
    return null;
  }

  async run() {
    console.log('🔧 Token Reference Resolver - Epic 3.2');
    console.log('=====================================\n');

    // Load tokens
    if (!this.loadTokens()) {
      process.exit(1);
    }

    // Create token index
    this.tokenIndex = this.createTokenIndex();

    // Create clean tokens (without unresolvable references)
    console.log('\n📝 Creating clean token file...');
    const cleanTokens = this.createCleanTokens();

    // Count tokens in each approach
    const originalSize = Buffer.byteLength(JSON.stringify(this.tokens));
    const cleanSize = Buffer.byteLength(JSON.stringify(cleanTokens));

    console.log(`\n📊 Token Processing Results:`);
    console.log(`   Original: ${originalSize} bytes`);
    console.log(`   Clean:    ${cleanSize} bytes`);
    console.log(`   Reduction: ${Math.round((1 - cleanSize/originalSize) * 100)}%`);

    // Write clean tokens file
    const outputPath = 'tokensource-clean.json';
    fs.writeFileSync(outputPath, JSON.stringify(cleanTokens, null, 2));
    console.log(`\n✅ Generated: ${outputPath}`);
    
    return true;
  }
}

// Run if called directly
if (require.main === module) {
  const resolver = new TokenReferenceResolver();
  resolver.run().catch(console.error);
}

module.exports = TokenReferenceResolver;