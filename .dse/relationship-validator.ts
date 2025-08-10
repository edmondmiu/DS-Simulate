/**
 * Advanced color relationship validation for DSE color system
 * Handles token dependencies, circular references, and complex color relationships
 */

import { oklch, deltaE } from 'culori';
import type { OKLCH } from 'culori';
import { colorValidator } from './color-validator.js';

export interface TokenRelationship {
  source: string;
  target: string;
  type: 'direct' | 'indirect' | 'composition' | 'inheritance';
  depth: number;
  valid: boolean;
  issues: RelationshipIssue[];
}

export interface RelationshipIssue {
  type: 'circular' | 'missing' | 'type_mismatch' | 'depth_exceeded' | 'composition_error';
  severity: 'error' | 'warning';
  message: string;
  path: string[];
  suggestion?: string;
}

export interface RelationshipValidationResult {
  tokenPath: string;
  valid: boolean;
  relationships: TokenRelationship[];
  dependencyChain: string[];
  maxDepth: number;
  errors: RelationshipError[];
  warnings: RelationshipWarning[];
  suggestions: RelationshipSuggestion[];
}

export interface RelationshipError {
  type: 'circular_reference' | 'missing_reference' | 'invalid_reference' | 'max_depth_exceeded';
  severity: 'error' | 'warning';
  message: string;
  tokenPath: string;
  referencePath: string;
  dependencyChain: string[];
}

export interface RelationshipWarning {
  type: 'deep_nesting' | 'complex_composition' | 'performance' | 'maintainability';
  message: string;
  recommendation: string;
  affectedTokens: string[];
}

export interface RelationshipSuggestion {
  type: 'simplify' | 'flatten' | 'restructure' | 'optimize';
  message: string;
  currentStructure: string;
  suggestedStructure: string;
  benefit: string;
}

export interface ColorComposition {
  operation: 'blend' | 'mix' | 'adjust' | 'lighten' | 'darken' | 'saturate' | 'desaturate';
  baseColor: string;
  modifierColor?: string;
  modifierValue?: number;
  result: string;
}

export interface TokenHierarchy {
  tokenPath: string;
  level: number;
  children: TokenHierarchy[];
  parent?: string;
  directDependencies: string[];
  totalDependencies: number;
}

export class RelationshipValidator {
  private maxDepth = 10;
  private maxReferences = 50;
  private visitedTokens = new Set<string>();
  private relationshipCache = new Map<string, TokenRelationship[]>();
  private hierarchyCache = new Map<string, TokenHierarchy>();

  /**
   * Validates token reference chains for circular dependencies and depth limits
   */
  public validateReferenceChain(
    tokenPath: string,
    tokenValue: any,
    tokenSet: Record<string, any>,
    visited: Set<string> = new Set(),
    depth: number = 0
  ): RelationshipValidationResult {
    const result: RelationshipValidationResult = {
      tokenPath,
      valid: true,
      relationships: [],
      dependencyChain: Array.from(visited),
      maxDepth: depth,
      errors: [],
      warnings: [],
      suggestions: []
    };

    // Check for circular reference
    if (visited.has(tokenPath)) {
      result.valid = false;
      result.errors.push({
        type: 'circular_reference',
        severity: 'error',
        message: `Circular reference detected in token chain`,
        tokenPath,
        referencePath: tokenPath,
        dependencyChain: Array.from(visited)
      });
      return result;
    }

    // Check maximum depth
    if (depth > this.maxDepth) {
      result.valid = false;
      result.errors.push({
        type: 'max_depth_exceeded',
        severity: 'error',
        message: `Reference chain exceeds maximum depth of ${this.maxDepth}`,
        tokenPath,
        referencePath: tokenPath,
        dependencyChain: Array.from(visited)
      });
      return result;
    }

    // Add current token to visited set
    const newVisited = new Set(visited).add(tokenPath);

    // Handle different token value types
    if (typeof tokenValue === 'string' && tokenValue.startsWith('{') && tokenValue.endsWith('}')) {
      // Direct token reference
      const referencePath = tokenValue.slice(1, -1);
      
      const relationship: TokenRelationship = {
        source: tokenPath,
        target: referencePath,
        type: 'direct',
        depth,
        valid: false,
        issues: []
      };

      // Resolve reference
      const resolvedToken = this.resolveTokenReference(referencePath, tokenSet);
      
      if (!resolvedToken) {
        relationship.issues.push({
          type: 'missing',
          severity: 'error',
          message: `Referenced token '${referencePath}' not found`,
          path: [tokenPath, referencePath]
        });
        
        result.errors.push({
          type: 'missing_reference',
          severity: 'error',
          message: `Token reference '${referencePath}' not found`,
          tokenPath,
          referencePath,
          dependencyChain: Array.from(newVisited)
        });
      } else {
        relationship.valid = true;
        
        // Recursively validate the referenced token
        const nestedResult = this.validateReferenceChain(
          referencePath,
          resolvedToken.$value,
          tokenSet,
          newVisited,
          depth + 1
        );

        // Merge results
        result.relationships.push(relationship, ...nestedResult.relationships);
        result.errors.push(...nestedResult.errors);
        result.warnings.push(...nestedResult.warnings);
        result.suggestions.push(...nestedResult.suggestions);
        result.maxDepth = Math.max(result.maxDepth, nestedResult.maxDepth);
        
        if (!nestedResult.valid) {
          result.valid = false;
        }
      }

      result.relationships.push(relationship);
    
    } else if (typeof tokenValue === 'object' && tokenValue !== null) {
      // Complex composition or calculated value
      result.relationships.push(...this.validateTokenComposition(tokenPath, tokenValue, tokenSet, newVisited, depth));
    }

    // Performance warnings
    if (depth > 5) {
      result.warnings.push({
        type: 'deep_nesting',
        message: `Token '${tokenPath}' has deep reference nesting (depth: ${depth})`,
        recommendation: 'Consider flattening the token hierarchy for better performance',
        affectedTokens: [tokenPath]
      });
    }

    if (result.relationships.length > 10) {
      result.warnings.push({
        type: 'complex_composition',
        message: `Token '${tokenPath}' has complex relationships (${result.relationships.length} dependencies)`,
        recommendation: 'Consider simplifying token relationships',
        affectedTokens: [tokenPath]
      });
    }

    return result;
  }

  /**
   * Validates complex token compositions and calculations
   */
  private validateTokenComposition(
    tokenPath: string,
    tokenValue: any,
    tokenSet: Record<string, any>,
    visited: Set<string>,
    depth: number
  ): TokenRelationship[] {
    const relationships: TokenRelationship[] = [];

    // Handle different composition patterns
    if (Array.isArray(tokenValue)) {
      // Array of values (e.g., gradient stops, shadow layers)
      tokenValue.forEach((item, index) => {
        if (typeof item === 'string' && item.startsWith('{') && item.endsWith('}')) {
          const referencePath = item.slice(1, -1);
          
          relationships.push({
            source: tokenPath,
            target: referencePath,
            type: 'composition',
            depth,
            valid: this.resolveTokenReference(referencePath, tokenSet) !== null,
            issues: []
          });
        } else if (typeof item === 'object') {
          relationships.push(...this.validateTokenComposition(
            `${tokenPath}[${index}]`,
            item,
            tokenSet,
            visited,
            depth + 1
          ));
        }
      });
    
    } else if (typeof tokenValue === 'object') {
      // Object with nested properties
      Object.entries(tokenValue).forEach(([key, value]) => {
        if (typeof value === 'string' && value.startsWith('{') && value.endsWith('}')) {
          const referencePath = value.slice(1, -1);
          
          relationships.push({
            source: tokenPath,
            target: referencePath,
            type: 'composition',
            depth,
            valid: this.resolveTokenReference(referencePath, tokenSet) !== null,
            issues: []
          });
        } else if (typeof value === 'object') {
          relationships.push(...this.validateTokenComposition(
            `${tokenPath}.${key}`,
            value,
            tokenSet,
            visited,
            depth + 1
          ));
        }
      });
    }

    return relationships;
  }

  /**
   * Resolves a token reference path to its value
   */
  private resolveTokenReference(referencePath: string, tokenSet: Record<string, any>): any {
    const pathParts = referencePath.split('.');
    let current = tokenSet;

    for (const part of pathParts) {
      if (current && typeof current === 'object' && part in current) {
        current = current[part];
      } else {
        return null;
      }
    }

    // Check if it's a valid design token
    if (current && typeof current === 'object' && '$type' in current && '$value' in current) {
      return current;
    }

    return null;
  }

  /**
   * Detects circular references across the entire token set
   */
  public detectCircularReferences(tokenSet: Record<string, any>): RelationshipError[] {
    const errors: RelationshipError[] = [];
    const globalVisited = new Set<string>();
    
    const findTokens = (obj: any, basePath: string = ''): void => {
      for (const [key, value] of Object.entries(obj)) {
        const currentPath = basePath ? `${basePath}.${key}` : key;
        
        if (value && typeof value === 'object') {
          if ('$type' in value && '$value' in value) {
            // This is a design token
            if (!globalVisited.has(currentPath)) {
              const result = this.validateReferenceChain(currentPath, value.$value, tokenSet);
              errors.push(...result.errors.filter(e => e.type === 'circular_reference'));
              globalVisited.add(currentPath);
            }
          } else {
            // This is a token group, recurse
            findTokens(value, currentPath);
          }
        }
      }
    };

    // Process all token sets
    Object.entries(tokenSet).forEach(([tokenSetName, tokenData]) => {
      if (tokenData && typeof tokenData === 'object') {
        findTokens(tokenData, tokenSetName);
      }
    });

    return errors;
  }

  /**
   * Builds token hierarchy for dependency analysis
   */
  public buildTokenHierarchy(tokenSet: Record<string, any>): TokenHierarchy[] {
    const hierarchies: TokenHierarchy[] = [];
    const tokenMap = new Map<string, any>();
    
    // First pass: collect all tokens
    const collectTokens = (obj: any, basePath: string = ''): void => {
      for (const [key, value] of Object.entries(obj)) {
        const currentPath = basePath ? `${basePath}.${key}` : key;
        
        if (value && typeof value === 'object') {
          if ('$type' in value && '$value' in value) {
            tokenMap.set(currentPath, value);
          } else {
            collectTokens(value, currentPath);
          }
        }
      }
    };

    Object.entries(tokenSet).forEach(([tokenSetName, tokenData]) => {
      if (tokenData && typeof tokenData === 'object') {
        collectTokens(tokenData, tokenSetName);
      }
    });

    // Second pass: build hierarchies
    tokenMap.forEach((tokenValue, tokenPath) => {
      const hierarchy = this.buildSingleTokenHierarchy(tokenPath, tokenValue, tokenMap);
      if (hierarchy) {
        hierarchies.push(hierarchy);
      }
    });

    return hierarchies;
  }

  /**
   * Builds hierarchy for a single token
   */
  private buildSingleTokenHierarchy(
    tokenPath: string,
    tokenValue: any,
    tokenMap: Map<string, any>,
    level: number = 0
  ): TokenHierarchy | null {
    const hierarchy: TokenHierarchy = {
      tokenPath,
      level,
      children: [],
      directDependencies: [],
      totalDependencies: 0
    };

    // Find direct dependencies
    const dependencies = this.extractDependencies(tokenValue);
    hierarchy.directDependencies = dependencies;

    // Build child hierarchies
    dependencies.forEach(depPath => {
      const depValue = tokenMap.get(depPath);
      if (depValue) {
        const childHierarchy = this.buildSingleTokenHierarchy(depPath, depValue, tokenMap, level + 1);
        if (childHierarchy) {
          childHierarchy.parent = tokenPath;
          hierarchy.children.push(childHierarchy);
          hierarchy.totalDependencies += 1 + childHierarchy.totalDependencies;
        }
      }
    });

    return hierarchy;
  }

  /**
   * Extracts dependency paths from a token value
   */
  private extractDependencies(tokenValue: any): string[] {
    const dependencies: string[] = [];

    const extractFromValue = (value: any): void => {
      if (typeof value === 'string' && value.startsWith('{') && value.endsWith('}')) {
        dependencies.push(value.slice(1, -1));
      } else if (Array.isArray(value)) {
        value.forEach(extractFromValue);
      } else if (value && typeof value === 'object') {
        Object.values(value).forEach(extractFromValue);
      }
    };

    extractFromValue(tokenValue);
    return [...new Set(dependencies)]; // Remove duplicates
  }

  /**
   * Validates color alias relationships for proper resolution
   */
  public validateColorAliases(tokenSet: Record<string, any>): RelationshipError[] {
    const errors: RelationshipError[] = [];
    
    const validateToken = (tokenPath: string, tokenValue: any, visited: Set<string> = new Set()): void => {
      if (visited.has(tokenPath)) {
        errors.push({
          type: 'circular_reference',
          severity: 'error',
          message: `Circular alias reference in color token chain`,
          tokenPath,
          referencePath: tokenPath,
          dependencyChain: Array.from(visited)
        });
        return;
      }

      const newVisited = new Set(visited).add(tokenPath);

      if (typeof tokenValue === 'string' && tokenValue.startsWith('{') && tokenValue.endsWith('}')) {
        const referencePath = tokenValue.slice(1, -1);
        const resolvedToken = this.resolveTokenReference(referencePath, tokenSet);

        if (!resolvedToken) {
          errors.push({
            type: 'missing_reference',
            severity: 'error',
            message: `Color alias '${referencePath}' cannot be resolved`,
            tokenPath,
            referencePath,
            dependencyChain: Array.from(newVisited)
          });
        } else if (resolvedToken.$type !== 'color') {
          errors.push({
            type: 'invalid_reference',
            severity: 'error',
            message: `Color alias '${referencePath}' does not reference a color token`,
            tokenPath,
            referencePath,
            dependencyChain: Array.from(newVisited)
          });
        } else {
          // Recursively validate the referenced token
          validateToken(referencePath, resolvedToken.$value, newVisited);
        }
      }
    };

    // Find and validate all color tokens
    const findColorTokens = (obj: any, basePath: string = ''): void => {
      for (const [key, value] of Object.entries(obj)) {
        const currentPath = basePath ? `${basePath}.${key}` : key;
        
        if (value && typeof value === 'object') {
          if (value.$type === 'color') {
            validateToken(currentPath, value.$value);
          } else if (!('$type' in value)) {
            findColorTokens(value, currentPath);
          }
        }
      }
    };

    Object.entries(tokenSet).forEach(([tokenSetName, tokenData]) => {
      if (tokenData && typeof tokenData === 'object') {
        findColorTokens(tokenData, tokenSetName);
      }
    });

    return errors;
  }

  /**
   * Analyzes token inheritance patterns across token sets
   */
  public analyzeTokenInheritance(tokenSet: Record<string, any>): {
    inheritanceChains: TokenHierarchy[];
    orphanTokens: string[];
    rootTokens: string[];
    complexChains: string[];
  } {
    const hierarchies = this.buildTokenHierarchy(tokenSet);
    
    const inheritanceChains = hierarchies.filter(h => h.totalDependencies > 0);
    const orphanTokens = hierarchies.filter(h => h.totalDependencies === 0 && !h.parent).map(h => h.tokenPath);
    const rootTokens = hierarchies.filter(h => !h.parent && h.totalDependencies > 0).map(h => h.tokenPath);
    const complexChains = hierarchies.filter(h => h.level > 3 || h.totalDependencies > 5).map(h => h.tokenPath);

    return {
      inheritanceChains,
      orphanTokens,
      rootTokens,
      complexChains
    };
  }

  /**
   * Validates cross-token-set references
   */
  public validateCrossSetReferences(tokenSets: Record<string, any>): RelationshipError[] {
    const errors: RelationshipError[] = [];
    const allTokens = new Map<string, any>();

    // Collect all tokens across sets
    Object.entries(tokenSets).forEach(([setName, setData]) => {
      const collectFromSet = (obj: any, basePath: string = ''): void => {
        for (const [key, value] of Object.entries(obj)) {
          const currentPath = basePath ? `${basePath}.${key}` : key;
          const fullPath = `${setName}.${currentPath}`;
          
          if (value && typeof value === 'object') {
            if ('$type' in value && '$value' in value) {
              allTokens.set(fullPath, value);
            } else {
              collectFromSet(value, currentPath);
            }
          }
        }
      };

      if (setData && typeof setData === 'object') {
        collectFromSet(setData);
      }
    });

    // Validate cross-references
    allTokens.forEach((tokenValue, tokenPath) => {
      if (typeof tokenValue.$value === 'string' && tokenValue.$value.startsWith('{') && tokenValue.$value.endsWith('}')) {
        const referencePath = tokenValue.$value.slice(1, -1);
        
        // Check if reference exists in any token set
        const referenceExists = Array.from(allTokens.keys()).some(path => 
          path.endsWith(referencePath) || path === referencePath
        );

        if (!referenceExists) {
          errors.push({
            type: 'missing_reference',
            severity: 'error',
            message: `Cross-set reference '${referencePath}' not found in any token set`,
            tokenPath,
            referencePath,
            dependencyChain: [tokenPath]
          });
        }
      }
    });

    return errors;
  }

  /**
   * Optimizes token structure by suggesting improvements
   */
  public suggestOptimizations(tokenSet: Record<string, any>): RelationshipSuggestion[] {
    const suggestions: RelationshipSuggestion[] = [];
    const hierarchies = this.buildTokenHierarchy(tokenSet);
    
    // Suggest flattening deep hierarchies
    const deepHierarchies = hierarchies.filter(h => h.level > 3);
    deepHierarchies.forEach(hierarchy => {
      suggestions.push({
        type: 'flatten',
        message: `Consider flattening deep token hierarchy for '${hierarchy.tokenPath}'`,
        currentStructure: `Depth: ${hierarchy.level}, Dependencies: ${hierarchy.totalDependencies}`,
        suggestedStructure: 'Direct value or single-level reference',
        benefit: 'Improved performance and maintainability'
      });
    });

    // Suggest simplifying complex compositions
    const complexTokens = hierarchies.filter(h => h.totalDependencies > 5);
    complexTokens.forEach(hierarchy => {
      suggestions.push({
        type: 'simplify',
        message: `Simplify complex token composition for '${hierarchy.tokenPath}'`,
        currentStructure: `${hierarchy.totalDependencies} total dependencies`,
        suggestedStructure: 'Break into smaller, focused tokens',
        benefit: 'Better maintainability and performance'
      });
    });

    // Suggest consolidating orphan tokens
    const orphans = hierarchies.filter(h => h.totalDependencies === 0 && !h.parent);
    if (orphans.length > 10) {
      suggestions.push({
        type: 'restructure',
        message: `Consider organizing ${orphans.length} standalone tokens into thematic groups`,
        currentStructure: 'Many isolated tokens',
        suggestedStructure: 'Grouped tokens with shared base values',
        benefit: 'Better organization and potential reuse'
      });
    }

    return suggestions;
  }

  /**
   * Updates validation limits
   */
  public updateLimits(maxDepth?: number, maxReferences?: number): void {
    if (maxDepth !== undefined) this.maxDepth = maxDepth;
    if (maxReferences !== undefined) this.maxReferences = maxReferences;
    
    // Clear caches when limits change
    this.relationshipCache.clear();
    this.hierarchyCache.clear();
  }
}

// Export default instance
export const relationshipValidator = new RelationshipValidator();