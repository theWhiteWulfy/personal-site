# Code Organization Rules

This document defines the organizational structure and conventions for the codebase to maintain consistency and clarity.

## Directory Structure Rules

### Constants and Configuration
- **Rule**: All constants, default values, and system configuration MUST be stored in `src/config/system.js`
- **Rationale**: Centralized configuration makes it easier to maintain and update system-wide settings
- **Examples**:
  - Schema generation constants (business info, person data)
  - Analytics event types and categories
  - API configuration (rate limits, status codes)
  - Validation patterns and security settings

### Database Migrations
- **Rule**: Database migration SQL files MUST be stored in `scripts/` directory
- **Previous Location**: `migrations/` (deprecated)
- **Rationale**: Keeps all executable scripts together for easier maintenance
- **Naming**: Use pattern `XXX_description.sql` (e.g., `001_create_engagement_tables.sql`)

### Documentation
- **Rule**: All documentation files MUST be stored in `docs/` directory
- **Previous Locations**: 
  - `migrations/README.md` → `docs/migrations-guide.md`
  - `src/lib/README-database.md` → `docs/database-utilities.md`
- **Rationale**: Centralized documentation is easier to find and maintain
- **Types**: Setup guides, API documentation, implementation summaries, troubleshooting guides

### Test Files
- **Rule**: All test files MUST be stored in `scripts/tests/` directory
- **Previous Location**: Mixed in `scripts/` root
- **Rationale**: Separates test files from operational scripts
- **Types**: Component tests, API tests, integration tests, performance tests

## File Organization Patterns

### Import Structure
```typescript
// System constants from centralized config
import { DATABASE_CONFIG, ERROR_MESSAGES } from '@config/system.js';

// Local utilities and functions
import { validateDatabaseConnection } from '@lib/database.ts';
```

### Constants Usage
```typescript
// ❌ Don't define constants inline
const MAX_TITLE_LENGTH = 200;

// ✅ Use centralized constants
import { VALIDATION } from '@config/system.js';
const isValid = title.length <= VALIDATION.CONTENT.TITLE_MAX_LENGTH;
```

### Configuration References
```typescript
// ❌ Don't hardcode configuration values
const phoneNumber = '+91-9999999999';
const maxTitleLength = 200;

// ✅ Reference from system configuration
const phoneNumber = SCHEMA_CONFIG.BUSINESS.PHONE;
const maxTitleLength = VALIDATION.CONTENT.TITLE_MAX_LENGTH;
```

## Migration Path

When reorganizing existing code:

1. **Create system.js**: Add all constants to `src/config/system.js`
2. **Update imports**: Replace inline constants with imports from system.js
3. **Move files**: Relocate files to appropriate directories
4. **Update references**: Update any scripts or imports that reference moved files
5. **Test functionality**: Ensure all functionality remains intact after reorganization

## Benefits

### Maintainability
- Single source of truth for all configuration
- Easy to update system-wide settings
- Clear separation of concerns

### Discoverability
- Predictable file locations
- Centralized documentation
- Organized test structure

### Consistency
- Standardized patterns across the codebase
- Uniform configuration management
- Clear organizational hierarchy

## Enforcement

These rules should be followed for:
- All new code and features
- Refactoring existing code
- Adding new configuration or constants
- Creating documentation or tests

When in doubt, follow the principle of centralization for configuration and clear separation for different types of files.