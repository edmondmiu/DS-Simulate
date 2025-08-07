# Requirements Document

## Introduction

The token set metadata configuration system needs to be fixed to ensure accurate reflection of all existing token sets in the correct processing order. Currently, the `$metadata.json` file is incomplete, missing two token sets ("global light" and "bet9ja light") that are referenced by themes but not included in the tokenSetOrder. This causes Token Studio import failures and prevents the consolidate/split scripts from processing all token files correctly.

## Requirements

### Requirement 1

**User Story:** As a Design System Engineer, I want the `$metadata.json` file to include all existing token sets, so that Token Studio can successfully import all available token sets.

#### Acceptance Criteria

1. WHEN the metadata file is read THEN the system SHALL include all 7 existing token files in the tokenSetOrder
2. WHEN Token Studio imports the tokensource.json THEN the system SHALL display all token sets without errors
3. WHEN themes reference token sets THEN the system SHALL find all referenced sets in the metadata configuration

### Requirement 2

**User Story:** As a Design System Engineer, I want token sets to be processed in the correct hierarchical order, so that token references resolve properly across all processing scripts.

#### Acceptance Criteria

1. WHEN the consolidate script processes token sets THEN the system SHALL follow the logical hierarchy: core → global → theme variants → brand variants → components → typography
2. WHEN token references are resolved THEN the system SHALL ensure foundation tokens are available before dependent tokens are processed
3. WHEN the tokenSetOrder is defined THEN the system SHALL place core and global tokens before their variants

### Requirement 3

**User Story:** As a Design System Engineer, I want the consolidate script to process all token sets correctly, so that the generated tokensource.json includes complete token data.

#### Acceptance Criteria

1. WHEN the consolidate script runs THEN the system SHALL process all 7 token sets in the specified order
2. WHEN empty token sets are encountered THEN the system SHALL handle them gracefully without errors
3. WHEN the tokensource.json is generated THEN the system SHALL include all token sets as top-level keys

### Requirement 4

**User Story:** As a Design System Engineer, I want the split script to recreate all token files accurately, so that round-trip processing maintains data integrity.

#### Acceptance Criteria

1. WHEN the split script runs THEN the system SHALL recreate all 7 token files from tokensource.json
2. WHEN token set names contain spaces THEN the system SHALL handle file naming correctly (e.g., "global light.json")
3. WHEN round-trip testing is performed THEN the system SHALL produce identical results after consolidate → split → consolidate

### Requirement 5

**User Story:** As a Design System Engineer, I want all existing themes to continue functioning after metadata updates, so that no existing functionality is broken.

#### Acceptance Criteria

1. WHEN themes are loaded THEN the system SHALL resolve all token set references successfully
2. WHEN the Base Light theme is used THEN the system SHALL find the "global light" token set
3. WHEN the Bet9ja Light theme is used THEN the system SHALL find the "bet9ja light" token set
4. WHEN any existing theme is applied THEN the system SHALL maintain all current visual styling