/**
 * Style Dictionary Configuration
 * Epic 3.2: Web CSS Transform - Complete Implementation
 * 
 * Transforms tokensource.json into platform-specific formats:
 * - CSS Custom Properties for web developers (Epic 3.2 ✅)
 * - Dart class constants for Flutter developers
 * 
 * Input: tokensource-colors.json (Color tokens working, 333+ properties)
 * Output: dist/css/tokens.css (Production-ready) and dist/dart/tokens.dart
 */

module.exports = {
  // Source: Consolidated tokens from Token Studio files  
  source: ['tokensource.json'],
  
  // Multi-platform output configuration
  platforms: {
    // Web Developer Format: CSS Custom Properties
    css: {
      transformGroup: 'css',
      transforms: [
        'attribute/cti',
        'name/kebab',
        'time/seconds',
        'size/rem',
        'color/hex'
      ],
      buildPath: 'dist/css/',
      files: [
        {
          destination: 'tokens.css',
          format: 'css/variables',
          options: {
            showFileHeader: true,
            outputReferences: false,
            selector: ':root'
          }
        }
      ]
    },
    
    // Flutter Developer Format: Dart Class Constants
    dart: {
      transformGroup: 'flutter-separate',
      buildPath: 'dist/dart/',
      files: [
        {
          destination: 'tokens.dart',
          format: 'flutter/class.dart',
          options: {
            className: 'DesignTokens'
          }
        }
      ]
    }
  }
};