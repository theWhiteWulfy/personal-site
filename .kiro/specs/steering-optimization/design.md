# Design Document

## Overview

This design outlines the optimization of steering documentation by eliminating redundancy, consolidating related content, and establishing clear file boundaries. The current 6 steering files contain significant overlap, particularly around Astro configuration, Cloudflare deployment, API patterns, and CSS/styling approaches.

## Architecture

### Current State Analysis

**Identified Redundancies:**
1. **Astro Configuration**: Appears in `tech.md`, `deploy.md`, and `pwa.md`
2. **Cloudflare D1 Database**: Duplicated patterns in `deploy.md` and `patterns.md`
3. **API Endpoint Patterns**: Similar examples in `patterns.md` and `deploy.md`
4. **CSS Architecture**: Overlapping information in `structure.md`, `patterns.md`, and `tech.md`
5. **Content Collections**: Repeated concepts in `product.md`, `structure.md`, and `tech.md`
6. **Build Commands**: Duplicated in `tech.md` and `deploy.md`
7. **PWA Configuration**: Overlaps between `pwa.md` and `tech.md`

### Target Architecture

**Optimized File Structure:**
1. **tech.md** - Core technology stack, build system, and development tools
2. **patterns.md** - Code patterns, conventions, and implementation examples
3. **deploy.md** - Deployment, hosting, and production configuration
4. **structure.md** - Project organization and architectural decisions
5. **product.md** - Business context and content strategy
6. **pwa.md** - PWA-specific implementation details

## Components and Interfaces

### File Responsibility Matrix

| Content Area | Primary File | Secondary References |
|--------------|-------------|---------------------|
| Framework & Build System | tech.md | - |
| Astro Configuration | tech.md | deploy.md (deployment-specific) |
| Code Patterns & Examples | patterns.md | - |
| Cloudflare Deployment | deploy.md | - |
| Database Integration | deploy.md | patterns.md (usage patterns) |
| Project Structure | structure.md | - |
| CSS Architecture | structure.md | patterns.md (usage examples) |
| Content Collections | product.md | structure.md (technical structure) |
| PWA Implementation | pwa.md | tech.md (integration mention) |
| Development Commands | tech.md | - |

### Content Consolidation Strategy

**1. Astro Configuration Consolidation**
- **Primary Location**: `tech.md` - Core configuration
- **Secondary**: `deploy.md` - Deployment-specific adapter config only
- **Remove From**: `pwa.md` - Keep only PWA plugin specifics

**2. Database Pattern Consolidation**
- **Primary Location**: `deploy.md` - Infrastructure and setup
- **Secondary**: `patterns.md` - Usage patterns and examples only
- **Eliminate**: Duplicate setup instructions

**3. CSS Architecture Consolidation**
- **Primary Location**: `structure.md` - Architecture and organization
- **Secondary**: `patterns.md` - Implementation patterns only
- **Remove From**: `tech.md` - Keep only technology mentions

**4. Content Collection Consolidation**
- **Primary Location**: `product.md` - Business context and content types
- **Secondary**: `structure.md` - Technical implementation structure
- **Remove From**: `tech.md` - Keep only technology stack mention

## Data Models

### File Content Models

**tech.md Structure:**
```
- Framework & Build System
- Deployment & Hosting (overview only)
- Content Management Architecture
- Styling & Design System (technologies only)
- Key Integrations & APIs
- Development Tools
- Common Commands & Workflows
- Critical File Patterns
```

**patterns.md Structure:**
```
- Astro Component Patterns
- CSS Patterns (usage only)
- Content Processing Patterns
- API Endpoint Patterns (implementation only)
- SEO & Meta Patterns
- JavaScript Enhancement Patterns
- Utility Function Patterns
- Remark Plugin Patterns
```

**deploy.md Structure:**
```
- Cloudflare Pages Configuration
- Wrangler Configuration
- Security Headers
- URL Redirects & Routing
- D1 Database Integration (setup and infrastructure)
- Hybrid Rendering Strategy
- Performance Optimizations
- Deployment Process
- Monitoring & Analytics
- Domain Configuration
- Troubleshooting
```

**structure.md Structure:**
```
- Root Directory
- Source Structure
- Critical Architecture Patterns
- Layout Hierarchy
- CSS Architecture (organization only)
- Remark Plugin Chain
- Naming Conventions
- Content Frontmatter Standards
- API Endpoint Patterns (structure only)
- Path Aliases & Imports
- SEO & Meta Pattern (structure only)
```

**product.md Structure:**
```
- Site Purpose
- Content Architecture (business context)
- Content Types & Collections (business definitions)
- SEO & Metadata Strategy (business strategy)
- Key Features (user-facing)
```

**pwa.md Structure:**
```
- Core PWA Architecture
- Service Worker Integration
- Update Notification System
- Caching Strategy
- PWA Features Implemented
- Development Patterns (PWA-specific)
- Integration with Astro (PWA aspects only)
- Performance Optimizations (PWA-specific)
- Deployment Considerations (PWA-specific)
- Troubleshooting (PWA-specific)
```

## Error Handling

### Validation Strategy

1. **Content Completeness Check**: Verify all unique information is preserved
2. **Cross-Reference Validation**: Ensure references between files remain valid
3. **Logical Consistency**: Verify file boundaries make sense
4. **Information Accessibility**: Confirm all use cases are still covered

### Rollback Strategy

- Maintain backup of original files
- Document all changes made
- Provide mapping of moved content
- Enable easy restoration if issues arise

## Testing Strategy

### Content Audit Process

1. **Pre-Optimization Audit**: Document all unique content pieces
2. **Post-Optimization Verification**: Confirm all content is preserved
3. **Cross-Reference Testing**: Verify logical flow between files
4. **User Journey Testing**: Ensure common lookup scenarios work

### Quality Assurance

1. **Completeness Review**: No information loss
2. **Redundancy Elimination**: No duplicate content remains
3. **Logical Organization**: Clear file purposes and boundaries
4. **Maintainability**: Single source of truth for each concept