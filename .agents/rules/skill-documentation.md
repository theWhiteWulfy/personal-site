---
trigger: always_on
description: Mandatory rule to use skills/documentation.md when updating documentation, task lists, or architectural notes.
---

# Documentation Standards & Skill Reference

When writing or updating project documentation, task lists, README files, or architectural specifications in this repository, you MUST follow the standard operating procedures defined in [skills/documentation.md](../../skills/documentation.md):

1. **Architecture & Readme Integrity**:
   - Reference [README.md](../../README.md) and [docs/architecture/ARCHITECTURE.md](../../docs/architecture/ARCHITECTURE.md) for system baseline specifications.
   - Preserve existing structure, frontmatter schemas, and SEO invariants unless explicitly asked to modify them.

2. **Atomic Commits & Branching**:
   - Never commit directly to `main`.
   - Branch names must adhere to the defined conventions (`feature/`, `fix/`, `docs/`, `maintenance/`, `content/`).
   - Push commits atomically with clear conventional commit messages.

3. **Task & Log Updates**:
   - Record PR numbers and task status in relevant migration logs and task lists upon completion.
