# Workspace Behavioral Rules & Invariants

## 1. Legacy Migration & Dead Code Guardrail
- **Never delete commented-out code or legacy stubs** during audits, cleanup tasks, or refactoring in migration codebases unless explicitly instructed.
- Commented-out code and unused helpers (e.g. Gatsby v3 remnants) are **migration indicators** representing previously working features awaiting migration to modern frameworks (Astro).
- When finding dead or commented-out code:
  1. Inventory them in a migration backlog (e.g. `docs/backlog/decisions/gatsby-migration-backlog.md`).
  2. Note the original feature and target milestone.
  3. Only remove code if confirmed to be an unneeded duplicate or defunct external service (e.g. dead Heroku endpoint).

## 2. Human-Agent Handoff Protocol (`HUMAN_TASKS.md`)
Whenever creating or maintaining a human-agent handoff document:
- **Status & Checklist**: Use explicit `PENDING 🔲` / `DONE ✅` statuses with a quick-scan `Yes / No` checklist table for every task.
- **Placeholders**: Provide clear, dedicated placeholders (`____` or code blocks) for every required secret, key, or path.
- **Spacing**: Use generous vertical spacing (`&nbsp;` or double blank lines) between tasks for readability.
- **Agent Loop Dependencies**: Explicitly annotate which tasks require agent loop completion before human action is needed vs. which human actions block the agent.
- **Resume Prompts**: Include an exact, copy-pasteable resume prompt at the end of each milestone block (e.g., `> "Continue milestone <N> — task <X> is resolved"`).
- **Agent State Tracker**: Maintain a state tracking table at the bottom of the document recording the active milestone, last completed sub-task, branch name, last commit, stopped reason, and next action.
