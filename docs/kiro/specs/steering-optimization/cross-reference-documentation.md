# Cross-Reference Documentation

## Overview
This document provides comprehensive cross-reference information for the optimized steering documentation, including the new file organization, content movement mapping, and guidelines for maintaining non-redundant documentation.

## New File Organization & Purposes

### File Structure Overview
The steering documentation has been optimized into 6 focused files, each with a distinct, non-overlapping purpose:

```
.kiro/steering/
├── tech.md          # Technology Stack & Development Tools
├── patterns.md      # Code Patterns & Implementation Examples  
├── deploy.md        # Deployment & Infrastructure
├── structure.md     # Project Organization & Architecture
├── product.md       # Business Context & Content Strategy
└── pwa.md          # PWA Implementation Details
```

### Detailed File Purposes

#### tech.md - Technology Stack & Development Tools
**Primary Responsibility**: Authoritative source for technology stack, development tools, and core system configuration

**Content Scope**:
- Framework and build system specifications (Astro, Node.js, TypeScript, Vite)
- Core technology integrations and APIs
- Development commands and workflows
- Development tools and configuration
- Critical file patterns and import paths

**When to Use**: When you need information about what technologies are used, how to set up development environment, or what commands to run.

**Cross-References**:
- References `structure.md` for CSS architecture details
- References `deploy.md` for deployment-specific configuration
- References `patterns.md` for implementation examples

#### patterns.md - Code Patterns & Implementation Examples
**Primary Responsibility**: Authoritative source for code patterns, conventions, and implementation examples

**Content Scope**:
- Astro component structure patterns
- CSS usage patterns and examples
- API endpoint implementation patterns
- Content processing and utility patterns
- JavaScript enhancement patterns
- SEO and meta tag implementation

**When to Use**: When you need to implement features, write code, or understand how to use the technologies in practice.

**Cross-References**:
- References `structure.md` for architectural context
- References `deploy.md` for infrastructure setup
- References `tech.md` for technology specifications

#### deploy.md - Deployment & Infrastructure
**Primary Responsibility**: Authoritative source for deployment, hosting, and production infrastructure

**Content Scope**:
- Cloudflare Pages configuration and deployment
- Security headers and policies
- URL redirects and routing
- D1 database infrastructure setup
- Performance optimizations and monitoring
- Domain configuration and troubleshooting

**When to Use**: When you need to deploy the application, configure infrastructure, or troubleshoot production issues.

**Cross-References**:
- References `tech.md` for build commands and development setup
- References `patterns.md` for usage examples of infrastructure features

#### structure.md - Project Organization & Architecture
**Primary Responsibility**: Authoritative source for project structure, conventions, and architectural decisions

**Content Scope**:
- Directory structure and file organization
- CSS architecture and design system organization
- Naming conventions and standards
- Content frontmatter standards
- Path aliases and import patterns
- Architectural patterns and layouts

**When to Use**: When you need to understand how the project is organized, where files should go, or what conventions to follow.

**Cross-References**:
- References `patterns.md` for implementation examples
- References `product.md` for business context
- References `tech.md` for technology specifications

#### product.md - Business Context & Content Strategy
**Primary Responsibility**: Authoritative source for business context, content strategy, and user-facing features

**Content Scope**:
- Site purpose and mission
- Content architecture philosophy
- Content types and collections (business definitions)
- SEO and metadata strategy (business focus)
- User-facing features and experience

**When to Use**: When you need to understand the business goals, content strategy, or user experience requirements.

**Cross-References**:
- References `structure.md` for technical implementation details
- References `patterns.md` for feature implementation

#### pwa.md - PWA Implementation Details
**Primary Responsibility**: Authoritative source for Progressive Web App implementation

**Content Scope**:
- PWA architecture and configuration
- Service worker implementation and caching
- Update notification systems
- PWA-specific debugging and troubleshooting
- PWA deployment considerations

**When to Use**: When you need to work with PWA features, configure service workers, or troubleshoot PWA-specific issues.

**Cross-References**:
- References `tech.md` for complete Astro configuration
- References `deploy.md` for deployment and security considerations

## Content Movement Mapping

### Major Content Consolidations

#### 1. Astro Configuration Consolidation
**Before**: Scattered across `tech.md`, `deploy.md`, and `pwa.md`
**After**: 
- **Primary Location**: `tech.md` → Core Astro configuration with all integrations
- **Secondary**: `deploy.md` → Deployment-specific adapter configuration only
- **Secondary**: `pwa.md` → PWA plugin configuration only

**What Moved**:
- Complete `astro.config.mjs` example moved to `tech.md`
- Hybrid rendering explanation consolidated in `tech.md`
- Deployment adapter details remain in `deploy.md`
- PWA plugin details remain in `pwa.md`

#### 2. D1 Database Information Consolidation
**Before**: Duplicated between `deploy.md` and `patterns.md`
**After**:
- **Primary Location**: `deploy.md` → Infrastructure setup, schema, configuration
- **Secondary**: `patterns.md` → Usage patterns and implementation examples only

**What Moved**:
- Database binding configuration consolidated in `deploy.md`
- Infrastructure setup details consolidated in `deploy.md`
- Usage patterns and code examples remain in `patterns.md`
- Duplicate setup instructions removed from `patterns.md`

#### 3. CSS Architecture Consolidation
**Before**: Scattered across `structure.md`, `patterns.md`, and `tech.md`
**After**:
- **Primary Location**: `structure.md` → Architecture, organization, design system
- **Secondary**: `patterns.md` → Usage patterns and implementation examples only
- **Minimal**: `tech.md` → Technology mentions only (PostCSS, Fontsource)

**What Moved**:
- CSS architecture and design system details consolidated in `structure.md`
- Build system and processing information moved to `structure.md`
- Usage patterns and examples remain in `patterns.md`
- Technology specifications remain in `tech.md`

#### 4. API Endpoint Patterns Consolidation
**Before**: Duplicated across `patterns.md`, `deploy.md`, and `structure.md`
**After**:
- **Primary Location**: `patterns.md` → Implementation patterns and code examples
- **Secondary**: `deploy.md` → Infrastructure and database setup only
- **Secondary**: `structure.md` → File organization and structure only

**What Moved**:
- Implementation patterns and code examples consolidated in `patterns.md`
- Infrastructure setup details remain in `deploy.md`
- File organization patterns remain in `structure.md`
- Duplicate code examples removed from `deploy.md`

#### 5. Content Collections Consolidation
**Before**: Scattered across `product.md`, `structure.md`, and `tech.md`
**After**:
- **Primary Location**: `product.md` → Business context and content strategy
- **Secondary**: `structure.md` → Technical implementation structure
- **Minimal**: `tech.md` → Technology stack mention only

**What Moved**:
- Business definitions and content strategy consolidated in `product.md`
- Technical structure and patterns remain in `structure.md`
- Technology mentions remain in `tech.md`
- Duplicate collection descriptions removed

#### 6. Build Commands Consolidation
**Before**: Duplicated between `tech.md` and `deploy.md`
**After**:
- **Primary Location**: `tech.md` → All development and build commands
- **References**: `deploy.md` → References to `tech.md` for build commands

**What Moved**:
- All development commands consolidated in `tech.md`
- Deployment-specific command references remain in `deploy.md`
- Duplicate command listings removed from `deploy.md`

### Content Location Quick Reference

| Content Type | Primary Location | Secondary Location | Quick Access |
|--------------|------------------|-------------------|--------------|
| **Technology Stack** | tech.md | - | Framework versions, integrations |
| **Development Commands** | tech.md | - | npm run dev, build, preview |
| **Code Patterns** | patterns.md | - | Component structure, API routes |
| **CSS Usage** | patterns.md | structure.md (architecture) | Styling examples |
| **Project Structure** | structure.md | - | Directory organization |
| **CSS Architecture** | structure.md | patterns.md (usage) | Design system |
| **Deployment** | deploy.md | - | Cloudflare, security, domains |
| **Database Setup** | deploy.md | patterns.md (usage) | D1 configuration |
| **Business Context** | product.md | - | Content strategy, features |
| **PWA Features** | pwa.md | - | Service worker, caching |

## Cross-Reference Navigation Guide

### Common Developer Scenarios

#### "I need to set up the development environment"
1. **Start**: `tech.md` → Development Tools & Commands
2. **Next**: `deploy.md` → Local Development (if using Cloudflare features)
3. **Reference**: `structure.md` → Project Structure (to understand organization)

#### "I need to implement a new feature"
1. **Start**: `patterns.md` → Relevant pattern section
2. **Context**: `structure.md` → File organization and conventions
3. **Infrastructure**: `deploy.md` → If database or deployment features needed
4. **Technology**: `tech.md` → If new integrations required

#### "I need to deploy or configure production"
1. **Start**: `deploy.md` → Deployment Process
2. **Build**: `tech.md` → Build commands and configuration
3. **Troubleshooting**: `deploy.md` → Troubleshooting section

#### "I need to understand the project architecture"
1. **Start**: `structure.md` → Project Structure & Architecture
2. **Business Context**: `product.md` → Site purpose and content strategy
3. **Implementation**: `patterns.md` → How architecture is implemented

#### "I need to work with PWA features"
1. **Start**: `pwa.md` → PWA Implementation Guide
2. **Integration**: `tech.md` → Astro configuration (for context)
3. **Deployment**: `deploy.md` → PWA deployment considerations

### File Relationship Matrix

```
tech.md ←→ patterns.md    (Technology ↔ Implementation)
tech.md ←→ deploy.md      (Development ↔ Production)
tech.md ←→ structure.md   (Technology ↔ Organization)
patterns.md ←→ structure.md (Implementation ↔ Architecture)
deploy.md ←→ patterns.md  (Infrastructure ↔ Usage)
product.md ←→ structure.md (Business ↔ Technical)
pwa.md ←→ tech.md         (PWA ↔ Core Technology)
pwa.md ←→ deploy.md       (PWA ↔ Deployment)
```

## Guidelines for Maintaining Non-Redundant Documentation

### Core Principles

#### 1. Single Source of Truth
- **Rule**: Each piece of information should exist in exactly one authoritative location
- **Implementation**: Before adding information, check if it already exists elsewhere
- **Validation**: Regular audits to identify and eliminate emerging duplications

#### 2. Clear File Boundaries
- **Rule**: Each file has a distinct scope that doesn't overlap with others
- **Implementation**: Use the file purpose definitions to determine correct placement
- **Validation**: Content should clearly belong to one file's scope

#### 3. Appropriate Cross-Referencing
- **Rule**: Use references instead of duplicating information
- **Implementation**: Link to authoritative sources rather than copying content
- **Validation**: Cross-references should be logical and helpful

### Maintenance Workflows

#### Adding New Content

1. **Determine Scope**: Which file's purpose does this content serve?
   - Technology/Tools → `tech.md`
   - Implementation/Code → `patterns.md`
   - Deployment/Infrastructure → `deploy.md`
   - Organization/Architecture → `structure.md`
   - Business/Strategy → `product.md`
   - PWA-Specific → `pwa.md`

2. **Check for Existing Content**: Does similar information already exist?
   - Search across all files for related content
   - If found, determine if update or cross-reference is appropriate

3. **Add Content**: Place in the most appropriate single location
   - Follow the file's existing structure and patterns
   - Add cross-references from other files if needed

4. **Update Cross-References**: Ensure other files reference the new content appropriately

#### Updating Existing Content

1. **Locate Authoritative Source**: Find the single source of truth for the information
2. **Update in Place**: Make changes only in the authoritative location
3. **Verify Cross-References**: Ensure references from other files remain accurate
4. **Check for Scope Drift**: Ensure content still belongs in its current location

#### Identifying and Eliminating Redundancy

**Monthly Audit Process**:

1. **Content Comparison**: Compare similar sections across files
2. **Duplication Detection**: Identify any duplicate or overlapping information
3. **Consolidation Planning**: Determine the most appropriate single location
4. **Content Migration**: Move content to authoritative location
5. **Reference Updates**: Update cross-references in other files
6. **Validation**: Verify all use cases are still covered

**Red Flags to Watch For**:
- Similar headings in multiple files
- Repeated code examples
- Duplicate configuration information
- Overlapping explanations of the same concept

### File-Specific Maintenance Guidelines

#### tech.md Maintenance
- **Add**: New technologies, tools, or development processes
- **Avoid**: Implementation details (belongs in patterns.md)
- **Avoid**: Deployment specifics (belongs in deploy.md)
- **Cross-Reference**: Link to other files for detailed implementation

#### patterns.md Maintenance
- **Add**: New code patterns, implementation examples, or conventions
- **Avoid**: Technology specifications (belongs in tech.md)
- **Avoid**: Infrastructure setup (belongs in deploy.md)
- **Cross-Reference**: Link to tech.md for technology context

#### deploy.md Maintenance
- **Add**: New deployment processes, infrastructure, or production concerns
- **Avoid**: Development commands (belongs in tech.md)
- **Avoid**: Implementation patterns (belongs in patterns.md)
- **Cross-Reference**: Link to tech.md for build processes

#### structure.md Maintenance
- **Add**: New organizational patterns, architectural decisions, or conventions
- **Avoid**: Implementation examples (belongs in patterns.md)
- **Avoid**: Business context (belongs in product.md)
- **Cross-Reference**: Link to patterns.md for usage examples

#### product.md Maintenance
- **Add**: New business requirements, content strategy, or user features
- **Avoid**: Technical implementation (belongs in structure.md)
- **Avoid**: Code examples (belongs in patterns.md)
- **Cross-Reference**: Link to structure.md for technical details

#### pwa.md Maintenance
- **Add**: New PWA features, configurations, or troubleshooting
- **Avoid**: General Astro configuration (belongs in tech.md)
- **Avoid**: General deployment (belongs in deploy.md)
- **Cross-Reference**: Link to tech.md and deploy.md for context

### Quality Assurance Checklist

#### Before Adding Content
- [ ] Determined the most appropriate file based on scope
- [ ] Searched for existing similar content
- [ ] Planned necessary cross-references
- [ ] Verified content doesn't duplicate existing information

#### After Adding Content
- [ ] Content is in the single most appropriate location
- [ ] Cross-references are added where helpful
- [ ] No duplicate information exists
- [ ] All related use cases are still covered
- [ ] File boundaries remain clear and logical

#### Monthly Maintenance Review
- [ ] Compared similar sections across files for duplications
- [ ] Verified all cross-references are accurate and helpful
- [ ] Checked that file scopes remain distinct
- [ ] Ensured all developer use cases are covered
- [ ] Validated that information is easily discoverable

### Emergency Procedures

#### If Duplication is Discovered
1. **Immediate**: Document the duplication and its locations
2. **Assess**: Determine which location is most appropriate
3. **Consolidate**: Move content to the authoritative location
4. **Update**: Add cross-references from other locations
5. **Validate**: Ensure no information was lost in the process

#### If Information Cannot be Found
1. **Search**: Check all files systematically
2. **Cross-Reference**: Follow references between files
3. **Escalate**: If information is missing, determine appropriate location
4. **Add**: Place information in the most logical file
5. **Reference**: Add cross-references as needed

## Success Metrics

### Quantitative Measures
- **Zero Duplication**: No identical content in multiple files
- **Complete Coverage**: All use cases covered by the documentation
- **Fast Discovery**: Average lookup time under 2 steps
- **Single Updates**: Changes require modification in only one file

### Qualitative Measures
- **Clear Boundaries**: Each file has a distinct, obvious purpose
- **Logical Flow**: Cross-references create helpful navigation paths
- **Developer Satisfaction**: Easy to find and use information
- **Maintenance Efficiency**: Updates are straightforward and low-risk

## Conclusion

This cross-reference documentation provides the foundation for maintaining high-quality, non-redundant steering documentation. By following these guidelines and using the provided mapping and navigation tools, the documentation will remain organized, efficient, and developer-friendly.

The key to success is maintaining discipline around the single source of truth principle and regularly auditing for emerging duplications. With these practices in place, the steering documentation will continue to serve developers effectively while remaining easy to maintain and update.