# Changelog
All notable changes to this project will be documented in this file.

The format is based on Keep a Changelog, and this project adheres to Semantic Versioning.

## [Unreleased]
### Added
- Repository audit README with roadmap and risks.
- CUSTOM_INSTRUCTIONS.md and PR template wired to changelog entries.
- GameStateManager service for unified atomic store operations.
- ErrorBoundary component with game-themed error recovery.
- CacheMaintenanceService for automatic memory management.
- LRU + TTL image cache eviction policy (50 items, 30min TTL).
- Correlation IDs and meta tracking in Command interface.
- Type-safe discriminated unions for all game commands.

### Changed
- Enhanced displayTextExecutor with empty history safety checks.
- Updated all components to use unified GameStateManager reset.
- Improved imageCacheStore with smart eviction and access tracking.
- Command interface now includes segmentId and correlationId metadata.

### Fixed
- Merge conflict markers in gameService.ts breaking the build.
- Critical crash bug in displayTextExecutor on empty story history.
- Type safety holes with 'any' payload types in Command interface.
- Memory leaks from unbounded image cache growth.
- Partial state corruption from individual store resets.

### Removed
- Dead hauntingFlow code and related unused imports.
- Orphaned test cases for removed functionality.

### Security
