---
trigger: always_on
description: Invariants for organizing human SOPs in /skills and executable agent skills in /.agents/skills.
---

# Skills & SOP Organization Invariants

When creating, updating, or organizing procedural knowledge and workflows in this repository, you MUST follow these directory boundaries:

1. **Human SOPs (`skills/<name>.md`)**:
   - Must be flat Markdown files located directly in `skills/`.
   - Never place nested folders with `SKILL.md` directly inside `skills/`.
   - Every new SOP must be indexed in the `## Skills & Standard Operating Procedures` table in `README.md`.
   - Structure follows standard SOP anatomy: Scope, Current Architecture / Invariants, Required Practices, Out Of Scope.
   - Intended for human developers, contributors, and pairing reference.

2. **Agent Skills (`.agents/skills/<name>/SKILL.md`)**:
   - Must reside in dedicated subfolders under `.agents/skills/<name>/`.
   - Must include standard YAML frontmatter with `name:` and `description:`.
   - Supporting scripts, test helpers, or templates belong in `scripts/` or `references/` subdirectories under the skill folder.
   - Discoverable by Antigravity agents automatically via progressive disclosure and usable as first-class slash commands (`/<name>`).

3. **Cross-Referencing**:
   - When an agent skill has a corresponding human SOP (e.g. `cloudflare-pages-diagnostics` and `cloudflare_pages_diagnostics.md`), both must cross-reference each other to maintain unified procedural context across human and machine workflows.
