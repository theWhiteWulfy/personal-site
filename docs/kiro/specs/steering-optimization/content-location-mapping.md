# Content Location Mapping

## Overview
This document provides a detailed mapping of where content will be moved during the consolidation process, tracking the source and destination of each piece of information.

## Consolidation Mapping

### 1. Astro Configuration Content

**Source Locations:**
- `tech.md` → Framework & Build System section (lines 5-8)
- `deploy.md` → Astro Cloudflare Adapter section (lines 18-31)
- `pwa.md` → Vite PWA Plugin Configuration section (lines 15-30)

**Destination:**
- **Primary**: `tech.md` → Framework & Build System section
- **Secondary**: `deploy.md` → Keep only deployment-specific adapter configuration
- **Remove From**: `pwa.md` → Keep only PWA plugin specifics

**Content to Consolidate:**
- Astro 4.15+ framework specification
- Hybrid rendering configuration
- Build system setup details
- Node.js and TypeScript configuration

### 2. Cloudflare D1 Database Content

**Source Locations:**
- `deploy.md` → Wrangler Configuration section (lines 33-44)
- `deploy.md` → D1 Database Integration section (lines 95-125)
- `patterns.md` → API Endpoint Patterns section (lines 85-105)

**Destination:**
- **Primary**: `deploy.md` → D1 Database Integration section (infrastructure and setup)
- **Secondary**: `patterns.md` → Keep only usage patterns and implementation examples
- **Remove**: Duplicate setup instructions from patterns.md

**Content to Consolidate:**
- Database binding configuration
- Wrangler.toml setup
- Database schema definitions
- Infrastructure setup details

### 3. API Endpoint Patterns Content

**Source Locations:**
- `patterns.md` → Cloudflare D1 Database Pattern (lines 85-105)
- `deploy.md` → Database Access Pattern (lines 95-125)
- `structure.md` → API Endpoint Patterns section (lines 108-112)

**Destination:**
- **Primary**: `patterns.md` → API Endpoint Patterns section (implementation patterns only)
- **Remove From**: `deploy.md` → Keep only infrastructure setup
- **Remove From**: `structure.md` → Keep only structural organization details

**Content to Consolidate:**
- `export const prerender = false` pattern
- API route implementation examples
- Error handling patterns
- Response formatting examples

### 4. CSS Architecture Content

**Source Locations:**
- `structure.md` → CSS Architecture section (lines 65-70)
- `patterns.md` → CSS Patterns section (lines 35-65)
- `tech.md` → Styling & Design System section (lines 18-26)

**Destination:**
- **Primary**: `structure.md` → CSS Architecture section (organization and architecture)
- **Secondary**: `patterns.md` → CSS Patterns section (usage patterns and examples only)
- **Remove From**: `tech.md` → Keep only technology stack mentions

**Content to Consolidate:**
- CSS Modules architecture
- Design token organization
- Theme support structure
- PostCSS configuration details

### 5. Content Collections Content

**Source Locations:**
- `product.md` → Content Types & Collections section (lines 15-25)
- `structure.md` → Content Collection Pattern section (lines 45-55)
- `tech.md` → Content Management Architecture section (lines 12-17)

**Destination:**
- **Primary**: `product.md` → Content Types & Collections section (business context and definitions)
- **Secondary**: `structure.md` → Content Collection Pattern section (technical implementation structure)
- **Remove From**: `tech.md` → Keep only technology stack mention

**Content to Consolidate:**
- Collection business definitions
- Content type descriptions
- Zod schema references
- Dynamic routing patterns

### 6. Build Commands Content

**Source Locations:**
- `tech.md` → Common Commands & Workflows section (lines 45-60)
- `deploy.md` → Build Settings section (lines 8-16)
- `deploy.md` → Local Development section (lines 46-52)

**Destination:**
- **Primary**: `tech.md` → Common Commands & Workflows section
- **Remove From**: `deploy.md` → Keep only deployment-specific commands

**Content to Consolidate:**
- `npm run build` command
- `npm run dev` command
- `npm run cfpreview` command
- Development workflow instructions

### 7. PWA Configuration Content

**Source Locations:**
- `pwa.md` → Vite PWA Plugin Configuration (lines 15-30)
- `tech.md` → Key Integrations & APIs section (PWA mention, line 28)
- `pwa.md` → Integration with Astro section (lines 140-150)

**Destination:**
- **Primary**: `pwa.md` → Keep all PWA-specific implementation details
- **Remove From**: `tech.md` → Keep only brief technology mention

**Content to Consolidate:**
- Vite PWA plugin setup
- Service worker configuration
- Manifest configuration
- PWA-specific Astro integration

## Content Movement Plan

### Phase 1: High-Priority Consolidations

1. **Astro Configuration**
   - Move core configuration from `deploy.md` and `pwa.md` to `tech.md`
   - Keep deployment-specific config in `deploy.md`
   - Keep PWA-specific config in `pwa.md`

2. **D1 Database Setup**
   - Consolidate infrastructure setup in `deploy.md`
   - Move usage patterns to `patterns.md`
   - Remove duplicates

3. **CSS Architecture**
   - Move organization details to `structure.md`
   - Keep usage patterns in `patterns.md`
   - Remove duplicates from `tech.md`

### Phase 2: Medium-Priority Consolidations

1. **API Patterns**
   - Consolidate implementation patterns in `patterns.md`
   - Remove infrastructure details

2. **Build Commands**
   - Consolidate all commands in `tech.md`
   - Remove duplicates from `deploy.md`

3. **Content Collections**
   - Move business context to `product.md`
   - Keep technical structure in `structure.md`
   - Remove duplicates from `tech.md`

### Phase 3: Final Cleanup

1. **PWA Integration**
   - Clean up mentions in `tech.md`
   - Ensure all details remain in `pwa.md`

2. **Cross-References**
   - Update any broken references
   - Ensure logical flow between files

## Tracking Matrix

| Content Area | Original Files | Primary Destination | Secondary Destination | Action |
|--------------|---------------|-------------------|---------------------|---------|
| Astro Config | tech.md, deploy.md, pwa.md | tech.md | deploy.md (deployment-specific) | Consolidate |
| D1 Database | deploy.md, patterns.md | deploy.md | patterns.md (usage only) | Consolidate |
| API Patterns | patterns.md, deploy.md, structure.md | patterns.md | - | Consolidate |
| CSS Architecture | structure.md, patterns.md, tech.md | structure.md | patterns.md (usage only) | Consolidate |
| Content Collections | product.md, structure.md, tech.md | product.md | structure.md (technical) | Consolidate |
| Build Commands | tech.md, deploy.md | tech.md | - | Consolidate |
| PWA Config | pwa.md, tech.md | pwa.md | - | Clean up |

## Validation Checklist

After consolidation, verify:
- [ ] All unique content is preserved
- [ ] No duplicate information remains
- [ ] File boundaries are logical and clear
- [ ] Cross-references are updated
- [ ] All use cases are still covered
- [ ] Content is in the most appropriate location

## Risk Mitigation

- **Backup Files**: All original files backed up in `backup/` directory
- **Content Audit**: Comprehensive audit document created
- **Mapping Document**: Detailed tracking of all content movements
- **Validation Process**: Systematic verification of content completeness