# Documentation SOP

Use this guide for architecture notes, README updates, agent task files, and operational documentation.

## Scope

- Document current behavior before proposing changes.
- Keep `docs/agentic-logs/central_milestones.md` focused on milestones and rationale.
- Keep granular execution details in the agent-owned task files in `docs/agentic-logs/`.
- Prefer local repository facts over assumptions.
- Milestone-specific docs live in `docs/milestone-{N}-{name}/` subdirectories.

## Required Practices

- Preserve existing README content and append clarifying sections instead of replacing history.
- Use branch prefixes allowed by the project directive (`docs/`, `feature/`, `maintenance/`, `content/`).
- Reference exact files when documenting architecture-sensitive behavior.
- Mark risks and gaps clearly as findings, not as completed fixes.
- On completing a migration or major task, update `docs/architecture/ARCHITECTURE.md` to reflect the new baseline.

## Documentation Map

```
docs/
├── architecture/           # System baseline — update after major migrations
├── agentic-logs/           # Agent task files, original request, test reports
├── milestone-2-audit/      # Astro 6 breakage analysis docs
├── milestone-3-d1/         # D1 API contract and route review
├── milestone-4-content/    # SEO, analytics, campaign docs
├── milestone-5-upgrade/    # Performance and resource-gating guides
├── kiro/                   # Mirror of .kiro/ steering and specs (read-only)
├── baseline/               # Pre-upgrade regression snapshots (used by test:regression)
├── superpowers/            # Feature specs
└── tasks/                  # Granular task breakdowns
```

## Out Of Scope

- Do not change runtime code while performing documentation-only work.
- Do not migrate content collections as part of documentation.
- Do not alter SEO metadata, D1 bindings, build scripts, or deployment configuration unless assigned in an implementation branch.
