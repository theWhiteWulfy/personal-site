# Codex Tasks

Codex / GPT-5.5 is the Mechanic. This file owns heavy logic, wiring, Astro component changes, and structural updates after the first-run baseline is complete.

## Active: First-Run Support

- [ ] Bootstrap the agent task files and `skills/` SOP directory on `docs/agentic-orchestration-baseline`.
- [ ] Add implementation-sensitive architecture notes without changing runtime behavior.
- [ ] Augment `README.md` with the multi-agent workflow and preservation constraints.
- [ ] Record Astro 6.2 implementation risks for future Codex work.

## Upcoming: Astro 6.2 Compatibility Work

- [ ] Audit `<ViewTransitions />` usage and plan the future move to `<ClientRouter />`.
- [ ] Audit code paths that depend on `entry.render()` and `entry.slug`.
- [ ] Preserve `src/content/config.ts` and legacy collection shape until a reviewed migration branch exists.
- [ ] Audit Cloudflare adapter configuration before dependency changes.
- [ ] Implement approved wiring changes only on dedicated `feature/` or `maintenance/` branches.

## Boundaries

- During first-run bootstrap, do documentation only.
- Treat React components as read-only unless Alok explicitly assigns them.
- Preserve SEO metadata, schema output, RSS, sitemap, D1 bindings, and basic HTML structure.
- Do not run migrations, deploy commands, or dependency upgrades during baseline work.
