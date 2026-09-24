---
trigger: always_on
description: Guidelines for atomic commits, gated iteration workflows, clean branch hygiene, and headless GitHub PR creation.
---

# Git Workflow & Commit Guidelines

## 1. Atomic Commit Discipline
- Commit each distinct logical change or individual file atomically.
- Avoid bundling unrelated components, styles, or configuration modifications into a single commit.
- Pair test additions or updates directly with the code changes they validate within the same atomic commit.
- Never combine build/bundler configuration changes (e.g., `astro.config.mjs`, `wrangler.toml`) with UI component or style changes.
- Ensure all test suites pass (`npm run test`) before creating each commit.
- Use clear Conventional Commit prefixes (`feat:`, `fix:`, `refactor:`, `chore:`, `docs:`).
- Always verify builds (`npx astro check`, `npm run build`) before finalizing commits.

## 2. Gated Multi-Phase Execution
- When instructed to complete and commit initial fixes before asking questions or proceeding to later phases:
  1. Complete and test Phase 1.
  2. Commit Phase 1 atomically to git.
  3. Pause to ask clarifying questions or present options for Phase 2.
  4. Only proceed with Phase 2 once requirements are aligned, then commit Phase 2 atomically.

## 3. Clean Branching for Production Deliveries
- Keep exploratory work, sandboxes, and multi-variant showcases isolated on dedicated experiment branches (e.g., `feature/*-exp`).
- Use standard branch prefixes recognized by CI and Cloudflare Pages preview builds:
  - `fix/<issue-name>` (singular — required for Cloudflare Pages preview builds)
  - `agent/<task-name>`
  - `feature/<name>`
- When a feature design or variant is locked for production release:
  1. Branch fresh from `main` (e.g., `feature/<clean-name>`).
  2. Cherry-pick or introduce only the final component and required integration files.
  3. Verify the branch builds cleanly from `main`.
  4. Submit the clean branch for PR review.

## 4. Headless GitHub Pull Request Fallback
When the user asks to open or create a pull request and the `gh` CLI is not installed:
- Retrieve credentials from Git Credential Manager:
  ```powershell
  $cred = ("protocol=https`nhost=github.com`n" | git credential fill)
  ```
- Extract the GitHub PAT/OAuth token and call the GitHub REST API (`POST https://api.github.com/repos/:owner/:repo/pulls`).
- Immediately clean up any scratch scripts or temporary credential files.
