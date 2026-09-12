# Backlog — Meteoric Teachings Site

**Site**: alokprateek.in | **Stack**: Astro 6 → Astro 7 | **Hosting**: Cloudflare Pages + D1

This folder contains all strategic decisions, audit findings, and milestone task plans for the site.
Each milestone maps to a **git branch** and has its own task file in `tasks/`.

---

## Folder Structure

```
docs/backlog/
├── README.md                    ← This file — overview and navigation
├── HUMAN_TASKS.md               ← Human↔Agent handoff document (READ THIS FIRST)
├── decisions/
│   └── architecture-decisions.md   ← All key decisions made during the grilling session
├── audits/
│   ├── site-audit-2026-09-12.md    ← Full WIP + security + IndieWeb audit
│   └── security-audit-2026-09-12.md ← Prior automated security audit (from docs/)
└── tasks/
    ├── milestone-1-security.md
    ├── milestone-2-indieweb-quick-wins.md
    ├── milestone-3-resource-system.md
    ├── milestone-4-dead-code-cleanup.md
    ├── milestone-5-astro7-migration.md
    ├── milestone-6-comment-system.md
    ├── milestone-7-404-did-you-mean.md
    └── milestone-8-future-vision.md
```

---

## Milestone Overview

| # | Milestone | Branch | Status | Effort | Blocking |
|---|---|---|---|---|---|
| 1 | **Security: Live Fixes** | `fix/security-phase-1` | 🔴 Ready to start | 2–3 days | Nothing |
| 2 | **IndieWeb Quick Wins** | `feat/indieweb-quick-wins` | 🟠 Ready after M1 | 1 day | M1 |
| 3 | **Resource System** | `feat/resource-real-files` | 🟠 Human action needed | 3–5 days | M1 + Human |
| 4 | **Dead Code Cleanup** | `chore/dead-code-cleanup` | 🟢 Anytime | 0.5 days | None |
| 5 | **Astro 7 Migration** | `feat/astro7-migration` | ⏳ Post M1+M2 | 1–2 weeks | M1, M2 |
| 6 | **Comment System (D1)** | `feat/comment-system-d1` | ⏳ Post M5 | 2–3 weeks | M5 |
| 7 | **404 "Did You Mean?"** | `feat/404-did-you-mean` | 🟢 Anytime | 1 day | None |
| 8 | **Future Vision** | multiple branches | 🔵 Long-term | — | M5, M6 |

---

## How This Works

1. **Agent** reads `HUMAN_TASKS.md` to check for pending human actions before starting any milestone
2. **Agent** works through the milestone task file, committing each sub-task to the milestone branch
3. When a task requires human input (secret values, file uploads, social profile edits), the agent:
   - Documents the blocker in `HUMAN_TASKS.md`
   - Commits what's done so far
   - Stops and waits
4. **Human** resolves the blocker, updates `HUMAN_TASKS.md` (marks as DONE), and prompts the agent to continue
5. **Agent** reads the updated `HUMAN_TASKS.md`, confirms the blocker is resolved, and resumes

> No conversation restart needed — all state is in `HUMAN_TASKS.md` and the git branch.
