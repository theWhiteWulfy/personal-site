# Central Milestones

This file tracks major project milestones for Project Astro-Ascension. It explains why each milestone matters and how work is split across the agent tracks. Granular execution tasks belong only in `claude_tasks.md`, `codex_tasks.md`, `gemini_tasks.md`, and `jules_tasks.md`.

## Workflow Rules

- Never commit directly to `main`.
- Use isolated branches with only these prefixes: `feature/`, `docs/`, `maintenance/`, and `Content/`.
- Preserve SEO metadata, Cloudflare D1 bindings, and basic HTML structure.
- Treat React components and future comment-system React surfaces as read-only unless Alok explicitly assigns otherwise.
- Alok performs manual review and merges branches into `main`.

## Milestone 1: Agentic Baseline And Repository Evaluation

Why it matters: the project needs a shared operating model before upgrade, refactor, or feature work begins.

Parallel tracks:

- Claude owns architecture documentation, structural analysis, and repo evaluation.
- Codex supports documentation wiring and records implementation-sensitive risks without changing app logic.
- Gemini prepares long-form review coverage and upgrade-risk inventories.
- Jules validates baseline build integrity after documentation-only changes.

## Milestone 2: Astro 6.2 Compatibility Audit

Why it matters: Astro 6 removes automatic compatibility for legacy content collections and replaces some APIs used by the current site.

Parallel tracks:

- Claude documents the upgrade architecture and compatibility strategy.
- Codex audits app code paths that depend on Astro runtime behavior, routing, rendering, and adapter wiring.
- Gemini performs broad repository review for deprecated APIs and risky dependency interactions.
- Jules runs build/check verification on dedicated branches after each upgrade slice.

Important constraint: do not proactively migrate existing collections to the Astro 5+ loader pattern during baseline work. First map the phased path and preserve the current content shape.

## Milestone 3: Cloudflare D1 And API Surface Stabilization

Why it matters: API routes rely on the `DB` D1 binding and must remain stable through framework upgrades.

Parallel tracks:

- Claude documents database architecture, D1 binding assumptions, and deployment dependencies.
- Codex handles future wiring changes only after the compatibility plan is reviewed.
- Gemini reviews API route behavior and data-flow risks.
- Jules verifies build, local preview, and database-check commands when the missing script gap is resolved.

## Milestone 4: Content And SEO Preservation

Why it matters: the site has extensive frontmatter-driven SEO, RSS, schema, analytics, and content routing that must not regress.

Parallel tracks:

- Claude documents SEO and content architecture.
- Codex preserves component contracts and page metadata while making future Astro-specific edits.
- Gemini reviews content collection coverage and metadata consistency.
- Jules verifies generated pages, RSS, and sitemap behavior after implementation branches.

## Milestone 5: Phased Astro 6.2 Upgrade Execution

Why it matters: the upgrade should be reversible, reviewable, and separated into low-conflict branches.

Parallel tracks:

- Claude keeps architecture docs current as decisions are made.
- Codex executes approved framework, adapter, component, and routing changes.
- Gemini performs sustained review across dependency and code changes.
- Jules runs final build, preview, and integrity verification before Alok reviews each branch.
