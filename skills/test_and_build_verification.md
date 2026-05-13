# Test And Build Verification SOP

Use this guide before reporting that a branch is ready for review.

## Required Commands

- Run `npm run build` for app-wide verification.
- Run `git status --short --branch` before handoff.
- For deployment-sensitive changes, run preview checks only when assigned.
- For D1-sensitive changes, run local database verification only when scripts and bindings are confirmed available.

## Reporting

- Report the exact command and whether it passed or failed.
- If a command fails, include the main failure reason and the owning area.
- Do not describe work as complete until fresh verification has run.

## Guardrails

- Do not run formatters or generators that rewrite unrelated tracked files during documentation bootstrap.
- Do not run database migrations without explicit approval.
- Do not rely on previous verification from another branch.
